export const stockOpnameStatus = {
  INITIATED: 0,
  IN_PROGRESS: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  REJECTED: 4,
  NEEDS_REVISION: 5,
} as const;

export type StockOpnameStatus =
  (typeof stockOpnameStatus)[keyof typeof stockOpnameStatus];