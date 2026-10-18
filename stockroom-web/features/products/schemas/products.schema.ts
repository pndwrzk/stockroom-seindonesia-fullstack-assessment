import { z } from "zod";

export const productRecordSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  unit: z.string().optional(),
  price: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const productsResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(productRecordSchema),
    meta: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export type ProductsQuery = {
  page: number;
  limit: number;
  search?: string;
};

export type ProductsResponse = Extract<
  z.infer<typeof productsResponseSchema>,
  { success: true }
>;

export type ProductRecord = z.infer<typeof productRecordSchema>;
