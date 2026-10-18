import { z } from "zod";
import { userRecordSchema } from "@/features/users/schemas/users.schema";

export const userFormSchema = z.object({
  nik: z.string().trim().min(1, "NIK is required."),
  username: z.string().trim().min(1, "Username is required."),
  password: z.string(),
  name: z.string().trim().min(1, "Name is required."),
  role: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  storeId: z.string().min(1, "Store is required."),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const userMutationResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: userRecordSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export const deleteUserResponseSchema = z.discriminatedUnion("success", [
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
