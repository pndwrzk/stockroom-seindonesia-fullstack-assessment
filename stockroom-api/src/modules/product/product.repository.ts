import { Prisma, Product } from "@prisma/client";
import { prisma } from "../../config";
import { CreateProductDto, ListProductQuery, UpdateProductDto } from "./product.interface";

const productListSelect = {
  id: true,
  sku: true,
  name: true,
  unit: true,
  price: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

type ProductListItem = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;

export const productRepository = {
  count(): Promise<number> {
    return prisma.product.count();
  },

  create(data: CreateProductDto): Promise<Product> {
    return prisma.product.create({ data });
  },

  async findAll({
    page,
    limit,
    search,
  }: ListProductQuery): Promise<{ items: ProductListItem[]; total: number }> {
    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { sku: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        select: productListSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  },

  findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { sku } });
  },

  update(id: string, data: UpdateProductDto): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  },
};