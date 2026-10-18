import { ROLES } from "@/features/auth/constants/roles";

export const USER_ROLE_IDS = {
  OWNER: 1,
  MANAGER: 2,
  STAFF: 3,
} as const;

export const userRoles = {
  [USER_ROLE_IDS.OWNER]: ROLES.OWNER,
  [USER_ROLE_IDS.MANAGER]: ROLES.MANAGER,
  [USER_ROLE_IDS.STAFF]: ROLES.STAFF,
} as const;
