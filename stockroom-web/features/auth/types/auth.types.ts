import type { z } from "zod";
import type { loginSchema } from "@/features/auth/schemas/login.schema";
import { userRoles } from "@/features/auth/constants/user-roles";

export type LoginFormValues = z.infer<typeof loginSchema>;

export type UserRoleId = keyof typeof userRoles;
export type UserRole = (typeof userRoles)[UserRoleId];

export type AuthUser = {
  id: string;
  nik: string;
  username: string;
  name: string;
  roleId: UserRoleId;
  role: UserRole;
  storeId: string | null;
  storeName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};