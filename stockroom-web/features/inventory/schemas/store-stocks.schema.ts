import { z } from "zod";

export const storeStockRecordSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  productId: z.string(),
  quantity: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  store: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
  }),
  product: z.object({
    id: z.string(),
    sku: z.string(),
    name: z.string(),
    unit: z.string().optional(),
    price: z.union([z.string(), z.number()]).optional(),
  }),
});

export const storeStocksResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(storeStockRecordSchema),
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

export type StoreStocksQuery = {
  page: number;
  limit: number;
  search?: string;
  storeId?: string;
};

export type StoreStocksResponse = Extract<
  z.infer<typeof storeStocksResponseSchema>,
  { success: true }
>;

export type StoreStockRecord = z.infer<typeof storeStockRecordSchema>;

export const createStoreStockSchema = z.object({
  storeId: z.string().min(1, "Store is required."),
  productId: z.string().min(1, "Product is required."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

export type CreateStoreStockValues = z.infer<typeof createStoreStockSchema>;

export const createStoreStockResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: storeStockRecordSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export const deleteStoreStockResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);
