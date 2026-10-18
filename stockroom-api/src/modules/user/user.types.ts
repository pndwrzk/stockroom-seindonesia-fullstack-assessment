import { Prisma } from "@prisma/client";

export const userInclude = {
  store: { select: { id: true, code: true, name: true } },
} satisfies Prisma.UserInclude;

export const safeOmit = { password: true } satisfies Prisma.UserOmit;

export type UserWithStore = Prisma.UserGetPayload<{
  include: typeof userInclude;
  omit: typeof safeOmit;
}>;
