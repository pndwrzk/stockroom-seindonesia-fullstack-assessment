import { z } from "zod";

export const userRecordSchema = z.object({
  id: z.string(),
  nik: z.string(),
  username: z.string(),
  name: z.string(),
  storeId: z.string().nullable(),
  role: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  store: z
    .object({
      id: z.string(),
      code: z.string(),
      name: z.string(),
    })
    .nullable(),
});

export const usersResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(userRecordSchema),
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

export type UsersQuery = {
  page: number;
  limit: number;
  search?: string;
};

export type UsersResponse = Extract<
  z.infer<typeof usersResponseSchema>,
  { success: true }
>;

export type UserRecord = z.infer<typeof userRecordSchema>;
