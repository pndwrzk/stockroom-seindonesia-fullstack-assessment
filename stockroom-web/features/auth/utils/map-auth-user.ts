import type { authUserResponseSchema } from "@/features/auth/schemas/auth-response.schema";
import { userRoles } from "@/features/auth/constants/user-roles";
import type { AuthUser, UserRoleId } from "@/features/auth/types/auth.types";
import type { z } from "zod";

type AuthUserResponse = z.infer<typeof authUserResponseSchema>;

export function mapAuthUser(user: AuthUserResponse): AuthUser {
  const roleId: UserRoleId = user.role;

  return {
    id: user.id,
    nik: user.nik,
    username: user.username,
    name: user.name,
    roleId,
    role: userRoles[roleId],
    storeId: user.storeId,
    storeName: user.store === undefined ? undefined : user.store?.name ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
