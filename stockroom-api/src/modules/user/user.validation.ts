import { z } from "zod";
import { isValidRole, Role } from "../../constants/roles";

export const roleSchema = z.custom<Role>((v) => isValidRole(v), {
  message: "Invalid role",
});

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user id"),
});

export const createUserSchema = z.object({
  nik: z.string().trim().min(1).max(50),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(50)
    .regex(
      /^[a-z0-9._-]+$/,
      "Only letters, numbers, dot, underscore, and dash are allowed",
    ),
  password: z.string().max(72),
  name: z.string().trim().min(1).max(255),
  role: roleSchema,
  storeId: z.string().uuid("Invalid store id").nullable().optional(),
});
export const updateUserSchema = createUserSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required",
  });

export const listUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  role: z.coerce.number().int().refine(isValidRole, "Invalid role").optional(),
  storeId: z.string().uuid("Invalid store id").optional(),
});
