import { z } from "zod";


export const productIdParamSchema = z.object({
  id: z.string().uuid("Invalid product id"),
});

export const createProductSchema = z.object({
  sku: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(50).default("pcs"),
  price: z.number({ error: "Price must be a number" }).min(0)
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

export const listProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});