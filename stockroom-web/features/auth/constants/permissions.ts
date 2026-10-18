import { ROLES, type Role } from "@/features/auth/constants/roles";

export const PERMISSIONS = {
  DASHBOARD: {
    VIEW: [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
  },
  USERS: {
    VIEW: [ROLES.OWNER, ROLES.MANAGER],
    CREATE: [ROLES.OWNER],
    EDIT: [ROLES.OWNER, ROLES.MANAGER],
    DELETE: [ROLES.OWNER],
  },
  PRODUCTS: {
    VIEW: [ROLES.OWNER, ROLES.STAFF, ROLES.MANAGER],
    CREATE: [ROLES.OWNER],
    EDIT: [ROLES.OWNER],
    DELETE: [ROLES.OWNER],
  },
  STORES: {
    VIEW: [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
    CREATE: [ROLES.OWNER],
    EDIT: [ROLES.OWNER],
    DELETE: [ROLES.OWNER],
  },
  INVENTORY: {
    VIEW: [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
    CREATE: [ROLES.OWNER, ROLES.MANAGER],
    DELETE: [ROLES.OWNER, ROLES.MANAGER],
  },
  STOCK_OPNAME: {
    VIEW: [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
    CREATE: [ROLES.OWNER, ROLES.MANAGER],
    COUNT: [ROLES.STAFF],
    APPROVE: [ROLES.OWNER, ROLES.MANAGER],
    REJECT: [ROLES.OWNER, ROLES.MANAGER],
    REQUEST_REVISION: [ROLES.OWNER, ROLES.MANAGER],
    DELETE: [ROLES.OWNER],
  },
} as const satisfies Record<
  string,
  Partial<Record<string, readonly Role[]>>
>;

export type PermissionModule = keyof typeof PERMISSIONS;
export type PermissionAction<M extends PermissionModule> =
  keyof (typeof PERMISSIONS)[M];
export type PermissionRequirement = {
  [M in PermissionModule]: {
    module: M;
    action: PermissionAction<M>;
  };
}[PermissionModule];

export function hasPermission(
  role: Role | null | undefined,
  permission: PermissionRequirement
): boolean {
  if (!role) {
    return false;
  }

  const modulePermissions = PERMISSIONS[permission.module] as Readonly<
    Record<string, readonly Role[]>
  >;
  const allowedRoles = modulePermissions[permission.action];
  return allowedRoles?.some((allowedRole) => allowedRole === role) ?? false;
}
