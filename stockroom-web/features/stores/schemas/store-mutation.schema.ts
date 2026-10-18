import { z } from "zod";
import { storeRecordSchema } from "@/features/stores/schemas/stores.schema";

export const storeFormSchema = z.object({
  code: z.string().trim().min(1, "Code is required."),
  name: z.string().trim().min(1, "Name is required."),
  address: z.string().trim().min(1, "Address is required."),
});

export type StoreFormValues = z.infer<typeof storeFormSchema>;

export const storeMutationResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: storeRecordSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export const deleteStoreResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.null(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);
