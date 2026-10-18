import { z } from "zod";


export const storeStockIdParamSchema = z.object({
  id: z.string().uuid("Invalid store stock id"),
});

export const createStoreStockSchema = z.object({
  storeId: z.string().uuid("Invalid store id"),
  productId: z.string().uuid("Invalid product id"),
  quantity: z.number().int().min(0),
});


export const listStoreStockQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  storeId: z.string().uuid("Invalid store id").optional(),
  productId: z.string().uuid("Invalid product id").optional(),
});