import { Prisma } from "@prisma/client";
import { prisma } from "../../config";
import {
  ACTIVE_OPNAME_STATUSES,
  OPNAME_STATUS,
  OpnameScope,
} from "../../constants/stock-opname";

const detailInclude = {
  store: { select: { id: true, code: true, name: true } },
  initiator: { select: { id: true, name: true } },
  histories: {
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      note: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.StockOpnameInclude;

const createInclude = {
  ...detailInclude,
  items: {
    select: {
      id: true,
      productId: true,
      systemQty: true,
      countedQty: true,
      product: { select: { id: true, sku: true, name: true, unit: true } },
    },
    orderBy: { product: { sku: "asc" } },
  },
} satisfies Prisma.StockOpnameInclude;

const listSelect = {
  id: true,
  sessionNumber: true,
  storeId: true,
  scope: true,
  status: true,
  initiatedBy: true,
  initiatedAt: true,
  createdAt: true,
  updatedAt: true,
  store: { select: { id: true, code: true, name: true } },
  initiator: { select: { id: true, name: true } },
  _count: { select: { items: true } },
} satisfies Prisma.StockOpnameSelect;

const itemSelect = {
  id: true,
  productId: true,
  systemQty: true,
  countedQty: true,
  product: { select: { id: true, sku: true, name: true, unit: true } },
} satisfies Prisma.StockOpnameItemSelect;

export type StockOpnameDetail = Prisma.StockOpnameGetPayload<{
  include: typeof createInclude;
}>;
export type StockOpnameResponse = Prisma.StockOpnameGetPayload<{
  include: typeof detailInclude;
}>;
export type StockOpnameListItem = Prisma.StockOpnameGetPayload<{
  select: typeof listSelect;
}>;
export type StockOpnameItem = Prisma.StockOpnameItemGetPayload<{
  select: typeof itemSelect;
}>;

export interface CreateStockOpnameData {
  sessionNumber: string;
  storeId: string;
  scope: OpnameScope;
  note?: string;
  initiatedBy: string;
  items: { productId: string; systemQty: number }[];
}

export interface StockOpnameTransactionRepository {
  findForSubmit(
    id: string,
  ): Promise<{ status: number; storeId: string } | null>;
  findItemProductIds(
    stockOpnameId: string,
    productIds: string[],
  ): Promise<string[]>;
  updateCountedQuantities(
    stockOpnameId: string,
    items: { productId: string; countedQty: number }[],
  ): Promise<void>;
  countUncountedItems(stockOpnameId: string): Promise<number>;
  findForReview(
    id: string,
  ): Promise<{
    status: number;
    storeId: string;
    items: { productId: string; countedQty: number | null }[];
  } | null>;
  updateStatus(
    id: string,
    from: number,
    to: number,
  ): Promise<boolean>;
  findStoreStockProductIds(
    storeId: string,
    productIds: string[],
  ): Promise<string[]>;
  updateStoreStockQuantity(
    storeId: string,
    productId: string,
    quantity: number,
  ): Promise<number>;
  createHistory(data: {
    opnameId: string;
    fromStatus: number | null;
    toStatus: number;
    userId: string;
    note?: string;
  }): Promise<void>;
}

export const stockOpnameRepository = {
  async countByStatus(storeId?: string): Promise<{ status: number; total: number }[]> {
    const groups = await prisma.stockOpname.groupBy({
      by: ["status"],
      where: storeId ? { storeId } : undefined,
      _count: { _all: true },
    });
    return groups.map(({ status, _count }) => ({
      status,
      total: _count._all,
    }));
  },

  transaction<T>(
    callback: (repository: StockOpnameTransactionRepository) => Promise<T>,
  ): Promise<T> {
    return prisma.$transaction(
      async (tx) =>
        callback({
          findForSubmit: (id) =>
            tx.stockOpname.findUnique({
              where: { id },
              select: { status: true, storeId: true },
            }),
          findItemProductIds: async (stockOpnameId, productIds) => {
            const items = await tx.stockOpnameItem.findMany({
              where: { stockOpnameId, productId: { in: productIds } },
              select: { productId: true },
            });
            return items.map((item) => item.productId);
          },
          updateCountedQuantities: async (stockOpnameId, items) => {
            for (const item of items) {
              await tx.stockOpnameItem.update({
                where: {
                  stockOpnameId_productId: {
                    stockOpnameId,
                    productId: item.productId,
                  },
                },
                data: { countedQty: item.countedQty },
              });
            }
          },
          countUncountedItems: (stockOpnameId) =>
            tx.stockOpnameItem.count({
              where: { stockOpnameId, countedQty: null },
            }),
          findForReview: (id) =>
            tx.stockOpname.findUnique({
              where: { id },
              select: {
                status: true,
                storeId: true,
                items: { select: { productId: true, countedQty: true } },
              },
            }),
          updateStatus: async (id, from, to) => {
            const result = await tx.stockOpname.updateMany({
              where: { id, status: from },
              data: { status: to },
            });
            return result.count === 1;
          },
          findStoreStockProductIds: async (storeId, productIds) => {
            const stocks = await tx.storeStock.findMany({
              where: { storeId, productId: { in: productIds } },
              select: { productId: true },
            });
            return stocks.map((stock) => stock.productId);
          },
          updateStoreStockQuantity: async (storeId, productId, quantity) => {
            const result = await tx.storeStock.updateMany({
              where: { storeId, productId },
              data: { quantity },
            });
            return result.count;
          },
          createHistory: async (data) => {
            await tx.stockOpnameHistory.create({ data });
          },
        }),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  },

  create(data: CreateStockOpnameData): Promise<StockOpnameDetail> {
    return prisma.stockOpname.create({
      data: {
        sessionNumber: data.sessionNumber,
        storeId: data.storeId,
        scope: data.scope,
        initiatedBy: data.initiatedBy,
        items: { create: data.items },
        histories: {
          create: {
            fromStatus: null,
            toStatus: OPNAME_STATUS.INITIATED,
            userId: data.initiatedBy,
            note: data.note,
          },
        },
      },
      include: createInclude,
    });
  },

  findActiveByStore(storeId: string): Promise<{ id: string } | null> {
    return prisma.stockOpname.findFirst({
      where: { storeId, status: { in: ACTIVE_OPNAME_STATUSES } },
      select: { id: true },
    });
  },

  async findAll(params: {
    page: number;
    limit: number;
    status?: number;
    storeId?: string;
    search?: string;
  }): Promise<{ items: StockOpnameListItem[]; total: number }> {
    const { page, limit, status, storeId, search } = params;
    const where: Prisma.StockOpnameWhereInput = {
      ...(status !== undefined && { status }),
      ...(storeId && { storeId }),
      ...(search && {
        sessionNumber: { contains: search, mode: "insensitive" },
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.stockOpname.findMany({
        where,
        select: listSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockOpname.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string): Promise<StockOpnameResponse | null> {
    return prisma.stockOpname.findUnique({
      where: { id },
      include: detailInclude,
    });
  },

  findStatusById(id: string): Promise<{ status: number } | null> {
    return prisma.stockOpname.findUnique({
      where: { id },
      select: { status: true },
    });
  },

  findStoreIdById(id: string): Promise<{ storeId: string } | null> {
    return prisma.stockOpname.findUnique({
      where: { id },
      select: { storeId: true },
    });
  },

  async delete(id: string): Promise<boolean> {
    const result = await prisma.stockOpname.deleteMany({ where: { id } });
    return result.count === 1;
  },

  async findItems(
    stockOpnameId: string,
    page: number,
    limit: number,
  ): Promise<{ items: StockOpnameItem[]; total: number }> {
    const where = { stockOpnameId };
    const [items, total] = await prisma.$transaction([
      prisma.stockOpnameItem.findMany({
        where,
        select: itemSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { product: { sku: "asc" } },
      }),
      prisma.stockOpnameItem.count({ where }),
    ]);
    return { items, total };
  },

};
