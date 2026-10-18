import { z } from "zod";
import { createUserSchema, listUserQuerySchema, updateUserSchema } from "./user.validation";

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type ListUserQuery = z.infer<typeof listUserQuerySchema>;