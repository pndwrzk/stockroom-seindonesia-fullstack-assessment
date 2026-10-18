import { z } from "zod";

export const storeIdParamSchema = z.object({
  id: z.string().uuid("Invalid store id"),
});

export const createStoreSchema = z.object({
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(255),
  address: z.string().trim().min(1),
});

export const updateStoreSchema = createStoreSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

export const listStoreQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});