import { z } from "zod";
import {
  isValidOpnameScope,
  isValidOpnameStatus,
  OPNAME_SCOPE,
  OpnameScope,
} from "../../constants/stock-opname";

export const stockOpnameIdParamSchema = z.object({
  id: z.string().uuid("Invalid stock opname id"),
});

const scopeSchema = z.custom<OpnameScope>((v) => isValidOpnameScope(v), {
  message: "scope must be 0 (selected) or 1 (all)",
});

export const createStockOpnameSchema = z
  .object({
    scope: scopeSchema,
    productIds: z.array(z.string().uuid("Invalid product id")).max(500).optional(),
    note: z.string().trim().max(1000).optional(),
    storeId: z.string().uuid("Invalid store id"),
  })
  .superRefine((val, ctx) => {
    const count = val.productIds?.length ?? 0;

    if (val.scope === OPNAME_SCOPE.SELECTED && count === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["productIds"],
        message: "productIds is required and must not be empty when scope is 0 (selected)",
      });
    }
    if (val.scope === OPNAME_SCOPE.ALL && count > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["productIds"],
        message: "productIds must be empty when scope is 1 (all)",
      });
    }
  });

export const listStockOpnameQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.coerce.number().int().refine(isValidOpnameStatus, "Invalid status").optional(),
  storeId: z.string().uuid("Invalid store id").optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const listStockOpnameItemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const submitStockOpnameItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product id"),
        countedQty: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(500)
    .refine(
      (items) => new Set(items.map((item) => item.productId)).size === items.length,
      { message: "Duplicate product ids are not allowed" },
    ),
  note: z.string().trim().min(1).max(1000).optional(),
});

export const reviewStockOpnameSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});