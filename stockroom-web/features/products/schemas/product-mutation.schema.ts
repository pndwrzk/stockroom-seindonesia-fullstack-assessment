import { z } from "zod";
import { productRecordSchema } from "@/features/products/schemas/products.schema";

export const productFormSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required."),
  name: z.string().trim().min(1, "Name is required."),
  unit: z.string().trim().min(1, "Unit is required."),
  price: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, {
      message: "Price must be a valid number zero or greater.",
    }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productMutationResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: productRecordSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export const deleteProductResponseSchema = z.discriminatedUnion("success", [
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
