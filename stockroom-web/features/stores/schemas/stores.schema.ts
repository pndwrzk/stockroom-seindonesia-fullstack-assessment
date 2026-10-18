import { z } from "zod";

export const storeRecordSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  address: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const storesResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(storeRecordSchema),
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

export type StoresQuery = {
  page: number;
  limit: number;
  search?: string;
};

export type StoresResponse = Extract<
  z.infer<typeof storesResponseSchema>,
  { success: true }
>;

export type StoreRecord = z.infer<typeof storeRecordSchema>;
