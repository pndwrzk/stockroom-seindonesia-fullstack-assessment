import { Prisma, Store } from "@prisma/client";
import { prisma } from "../../config";
import { CreateStoreDto, ListStoreQuery, UpdateStoreDto } from "./store.interface";

export const storeRepository = {
  count(): Promise<number> {
    return prisma.store.count();
  },

  create(data: CreateStoreDto): Promise<Store> {
    return prisma.store.create({ data });
  },

  async findAll({ page, limit, search }: ListStoreQuery): Promise<{ items: Store[]; total: number }> {
    const where: Prisma.StoreWhereInput = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await prisma.$transaction([
      prisma.store.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.store.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { id } });
  },

  findByCode(code: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { code } });
  },

  update(id: string, data: UpdateStoreDto): Promise<Store> {
    return prisma.store.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.store.delete({ where: { id } });
  },
};