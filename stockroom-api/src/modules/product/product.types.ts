import { Prisma } from "@prisma/client";

export const productListSelect = {
  id: true,
  sku: true,
  name: true,
  unit: true,
  price: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export type ProductListItem = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;
