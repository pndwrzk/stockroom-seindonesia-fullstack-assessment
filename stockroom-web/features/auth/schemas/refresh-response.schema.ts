import { z } from "zod";

export const refreshResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.object({
      accessToken: z.string().min(1),
      refreshToken: z.string().min(1),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);
