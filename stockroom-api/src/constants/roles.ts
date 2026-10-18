export const ROLES = {
  OWNER: 1,
  MANAGER: 2,
  STAFF: 3,
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES]; 

export const ROLE_NAMES: Record<Role, keyof typeof ROLES> = {
  [ROLES.OWNER]: "OWNER",
  [ROLES.MANAGER]: "MANAGER",
  [ROLES.STAFF]: "STAFF",
};

export const isValidRole = (value: unknown): value is Role =>
  typeof value === "number" && Object.values(ROLES).includes(value as Role);