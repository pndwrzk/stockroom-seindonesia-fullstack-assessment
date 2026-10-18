import { z } from "zod";
import { loginSchema, refreshSchema } from "./auth.validation";

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;