import { Product, Store } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const seedStoreStocks = (stores: Store[], products: Product[]) =>
  prisma.storeStock.createMany({
    data: stores.flatMap((store) =>
      products.map((product) => ({
        storeId: store.id,
        productId: product.id,
        quantity: Math.floor(Math.random() * 30),
      })),
    ),
    skipDuplicates: true,
  });
