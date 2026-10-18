import { Prisma, User } from "@prisma/client";
import { prisma } from "../../config";
import { ROLES } from "../../constants/roles";
import { CreateUserDto, ListUserQuery, UpdateUserDto } from "./user.interface";

const userInclude = {
  store: { select: { id: true, code: true, name: true } },
} satisfies Prisma.UserInclude;


const safeOmit = { password: true } satisfies Prisma.UserOmit;

export type UserWithStore = Prisma.UserGetPayload<{
  include: typeof userInclude;
  omit: typeof safeOmit;
}>;

export const userRepository = {
  count(storeId?: string): Promise<number> {
    return prisma.user.count({
      where: {
        role: { not: ROLES.OWNER },
        ...(storeId && { storeId }),
      },
    });
  },

  // dto.password harus sudah di-hash oleh service
  create(data: CreateUserDto): Promise<UserWithStore> {
    return prisma.user.create({
      data: {
        nik: data.nik,
        username: data.username,
        password: data.password,
        name: data.name,
        role: data.role,
        storeId: data.storeId ?? null,
      },
      include: userInclude,
      omit: safeOmit,
    });
  },

  async findAll({
    page,
    limit,
    search,
    role,
    storeId,
  }: ListUserQuery): Promise<{ items: UserWithStore[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      ...(role !== undefined && { role }),
      ...(storeId && { storeId }),
      ...(search && {
        OR: [
          { nik: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    where.role = { not: ROLES.OWNER }; 

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: userInclude,
        omit: safeOmit,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string): Promise<UserWithStore | null> {
    return prisma.user.findUnique({ where: { id }, include: userInclude, omit: safeOmit });
  },

  findByNik(nik: string): Promise<UserWithStore | null> {
    return prisma.user.findUnique({ where: { nik }, include: userInclude, omit: safeOmit });
  },

  findByUsernameSafe(username: string): Promise<UserWithStore | null> {
    return prisma.user.findUnique({ where: { username }, include: userInclude, omit: safeOmit });
  },

  // HANYA untuk auth/login: mengembalikan password hash
  findByUsernameWithPassword(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  },

  findManagerByStore(storeId: string, exceptUserId?: string): Promise<UserWithStore | null> {
    return prisma.user.findFirst({
      where: {
        storeId,
        role: ROLES.MANAGER,
        ...(exceptUserId && { NOT: { id: exceptUserId } }),
      },
      include: userInclude,
      omit: safeOmit,
    });
  },

  // dto.password (kalau ada) harus sudah di-hash oleh service
  update(id: string, data: UpdateUserDto): Promise<UserWithStore> {
    return prisma.user.update({ where: { id }, data, include: userInclude, omit: safeOmit });
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },
};