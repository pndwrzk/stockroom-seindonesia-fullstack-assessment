import { Prisma } from "@prisma/client";

export const stockInclude = {
  store: { select: { id: true, code: true, name: true } },
  product: {
    select: { id: true, sku: true, name: true, unit: true, price: true },
  },
} satisfies Prisma.StoreStockInclude;

export type StoreStockDetail = Prisma.StoreStockGetPayload<{
  include: typeof stockInclude;
}>;
