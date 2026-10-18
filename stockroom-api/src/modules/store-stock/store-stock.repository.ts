import { Prisma } from "@prisma/client";
import { prisma } from "../../config";
import {
  CreateStoreStockDto,
  ListStoreStockQuery,
} from "./store-stock.interface";

const stockInclude = {
  store: { select: { id: true, code: true, name: true } },
  product: { select: { id: true, sku: true, name: true, unit: true, price: true } },
} satisfies Prisma.StoreStockInclude;

export type StoreStockDetail = Prisma.StoreStockGetPayload<{
  include: typeof stockInclude;
}>;

export const storeStockRepository = {
  create(data: CreateStoreStockDto): Promise<StoreStockDetail> {
    return prisma.storeStock.create({ data, include: stockInclude });
  },

  async findAll({
    page,
    limit,
    search,
    storeId,
    productId,
  }: ListStoreStockQuery): Promise<{
    items: StoreStockDetail[];
    total: number;
  }> {
    const where: Prisma.StoreStockWhereInput = {
      ...(storeId && { storeId }),
      ...(productId && { productId }),
      ...(search && {
        OR: [
          { product: { sku: { contains: search, mode: "insensitive" } } },
          { product: { name: { contains: search, mode: "insensitive" } } },
          { store: { code: { contains: search, mode: "insensitive" } } },
          { store: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.storeStock.findMany({
        where,
        include: stockInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.storeStock.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string): Promise<StoreStockDetail | null> {
    return prisma.storeStock.findUnique({
      where: { id },
      include: stockInclude,
    });
  },

  findByStoreAndProduct(
    storeId: string,
    productId: string,
  ): Promise<StoreStockDetail | null> {
    return prisma.storeStock.findUnique({
      where: { storeId_productId: { storeId, productId } },
      include: stockInclude,
    });
  },


  async delete(id: string): Promise<void> {
    await prisma.storeStock.delete({ where: { id } });
  },
  findQuantities(
    storeId: string,
    productIds?: string[],
  ): Promise<{ productId: string; quantity: number }[]> {
    return prisma.storeStock.findMany({
      where: { storeId, ...(productIds && { productId: { in: productIds } }) },
      select: { productId: true, quantity: true },
    });
  },
};
