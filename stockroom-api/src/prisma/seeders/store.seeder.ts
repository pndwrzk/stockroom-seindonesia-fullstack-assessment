import { prisma } from "../../config/prisma";

const stores = [
  { code: "STR001", name: "Toko Maju Jaya", address: "Kebon Jeruk, Jakarta Barat" },
  { code: "STR002", name: "Toko Berkah Abadi", address: "Buah Batu, Bandung" },
  { code: "STR003", name: "Toko Karya Mandiri", address: "Gubeng, Surabaya" },
];

export const seedStores = () =>
  Promise.all(
    stores.map((store) =>
      prisma.store.upsert({
        where: { code: store.code },
        update: { name: store.name, address: store.address },
        create: store,
      }),
    ),
  );
