import { prisma } from "../config/prisma";
import { seedProducts } from "./seeders/product.seeder";
import { seedStoreStocks } from "./seeders/store-stock.seeder";
import { seedStores } from "./seeders/store.seeder";
import { seedUsers } from "./seeders/user.seeder";

const seed = async (): Promise<void> => {
  const stores = await seedStores();
  await seedUsers(stores[0].id);
  const products = await seedProducts();
  await seedStoreStocks(stores, products);

  console.log(
    `Users, ${stores.length} stores, ${products.length} products, and their store stocks seeded`,
  );
};

seed()
  .catch((error: unknown) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
