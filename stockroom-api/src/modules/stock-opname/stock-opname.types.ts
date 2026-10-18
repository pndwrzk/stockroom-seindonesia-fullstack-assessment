import { Prisma } from "@prisma/client";
import { OpnameScope } from "../../constants/stock-opname";

export const detailInclude = {
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

export const createInclude = {
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

export const listSelect = {
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

export const itemSelect = {
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
  updateStatus(id: string, from: number, to: number): Promise<boolean>;
  findStoreStockProductIds(
    storeId: string,
    productIds: string[],
  ): Promise<string[]>;
  updateStoreStockQuantities(
    storeId: string,
    items: { productId: string; quantity: number }[],
  ): Promise<number>;
  createHistory(data: {
    opnameId: string;
    fromStatus: number | null;
    toStatus: number;
    userId: string;
    note?: string;
  }): Promise<void>;
}
