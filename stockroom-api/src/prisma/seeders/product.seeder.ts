import { prisma } from "../../config/prisma";

const products = [
  { sku: "24340000001", name: "Beras 5 kg", unit: "pack", price: 75000 },
  { sku: "14632124001", name: "Minyak Goreng 1 L", unit: "botol", price: 18000 },
  { sku: "14625949001", name: "Gula Pasir 1 kg", unit: "pack", price: 16000 },
  { sku: "24330006001", name: "Tepung Terigu 1 kg", unit: "pack", price: 14000 },
  { sku: "24330007001", name: "Mie Instan", unit: "pcs", price: 3500 },
];

export const seedProducts = () =>
  Promise.all(
    products.map((product) =>
      prisma.product.upsert({
        where: { sku: product.sku },
        update: { name: product.name, unit: product.unit, price: product.price },
        create: product,
      }),
    ),
  );
