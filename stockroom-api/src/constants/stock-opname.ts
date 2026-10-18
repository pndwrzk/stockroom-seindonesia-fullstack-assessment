export const OPNAME_SCOPE = {
  SELECTED: 0,
  ALL: 1,
} as const;
export type OpnameScope = (typeof OPNAME_SCOPE)[keyof typeof OPNAME_SCOPE];

export const OPNAME_STATUS = {
  INITIATED: 0,
  IN_PROGRESS: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  REJECTED: 4,
} as const;
export type OpnameStatus = (typeof OPNAME_STATUS)[keyof typeof OPNAME_STATUS];

export const ACTIVE_OPNAME_STATUSES: OpnameStatus[] = [
  OPNAME_STATUS.INITIATED,
  OPNAME_STATUS.IN_PROGRESS,
  OPNAME_STATUS.SUBMITTED,
];

export const isValidOpnameScope = (v: unknown): v is OpnameScope =>
  v === OPNAME_SCOPE.SELECTED || v === OPNAME_SCOPE.ALL;

export const isValidOpnameStatus = (v: unknown): v is OpnameStatus =>
  typeof v === "number" &&
  Object.values(OPNAME_STATUS).includes(v as OpnameStatus);
