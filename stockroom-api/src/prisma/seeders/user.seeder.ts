import { prisma } from "../../config/prisma";
import { ROLES } from "../../constants/roles";
import { hashPassword } from "../../utils/password";

export const seedUsers = async (storeId: string): Promise<void> => {
  const users = [
    {
      nik: "2026020001",
      username: "owner",
      password: "owner",
      name: "John Doe",
      role: ROLES.OWNER,
      storeId: null,
    },
    {
      nik: "2026020002",
      username: "manager",
      password: "manager",
      name: "Jane Smith",
      role: ROLES.MANAGER,
      storeId,
    },
    {
      nik: "2026020003",
      username: "staff",
      password: "staff",
      name: "Alex Smith",
      role: ROLES.STAFF,
      storeId,
    },
  ];

  await Promise.all(
    users.map(async ({ password, ...user }) => {
      const hashedPassword = await hashPassword(password);

      return prisma.user.upsert({
        where: { username: user.username },
        update: { ...user, password: hashedPassword },
        create: { ...user, password: hashedPassword },
      });
    }),
  );
};
