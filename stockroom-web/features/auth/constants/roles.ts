export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  STAFF: "staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
