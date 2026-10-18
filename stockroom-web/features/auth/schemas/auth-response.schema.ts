import { z } from "zod";

const authStoreSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
});

export const authUserResponseSchema = z.object({
  username: z.string(),
  name: z.string(),
  nik: z.string(),
  id: z.string(),
  role: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  storeId: z.string().nullable(),
  store: authStoreSchema.nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const loginResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.object({
      accessToken: z.string().min(1),
      refreshToken: z.string().min(1),
      user: authUserResponseSchema,
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export const currentUserResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: authUserResponseSchema.extend({ store: authStoreSchema.nullable() }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});
