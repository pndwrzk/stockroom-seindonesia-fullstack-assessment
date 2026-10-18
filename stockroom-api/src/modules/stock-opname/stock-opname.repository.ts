import { Prisma } from "@prisma/client";
import { prisma } from "../../config";
import { ACTIVE_OPNAME_STATUSES, OPNAME_STATUS } from "../../constants/stock-opname";
import {
  CreateStockOpnameData,
  createInclude,
  detailInclude,
  itemSelect,
  listSelect,
  StockOpnameDetail,
  StockOpnameItem,
  StockOpnameListItem,
  StockOpnameResponse,
  StockOpnameTransactionRepository,
} from "./stock-opname.types";

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
          updateStoreStockQuantities: (storeId, items) => {
            if (items.length === 0) return Promise.resolve(0);

            const values = Prisma.join(
              items.map(
                (item) =>
                  Prisma.sql`(${item.productId}::uuid, ${item.quantity})`,
              ),
            );
            return tx.$executeRaw`
              UPDATE store_stock AS stock
              SET quantity = updates.quantity,
                  updated_at = CURRENT_TIMESTAMP
              FROM (VALUES ${values}) AS updates(product_id, quantity)
              WHERE stock.store_id = ${storeId}::uuid
                AND stock.product_id = updates.product_id
            `;
          },
          createHistory: async (data) => {
            await tx.stockOpnameHistory.create({ data });
          },
        }),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  },


  createIfNoActive(
    data: CreateStockOpnameData,
  ): Promise<StockOpnameDetail | null> {
    return prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${data.storeId}::text))`;

        const active = await tx.stockOpname.findFirst({
          where: { storeId: data.storeId, status: { in: ACTIVE_OPNAME_STATUSES } },
          select: { id: true },
        });
        if (active) return null;

        return tx.stockOpname.create({
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
      { timeout: 15000 },
    );
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
