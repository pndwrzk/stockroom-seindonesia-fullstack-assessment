import { z } from "zod";
import { getApiError } from "@/features/auth/utils/get-api-error";
import type { StockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import { stockOpnameStatusSchema } from "@/features/stock-opname/schemas/stock-opnames.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

const stockOpnameCountsResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(
      z.object({
        status: stockOpnameStatusSchema,
        total: z.number().int().min(0),
      })
    ),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export async function getStockOpnameCountsService(): Promise<
  { status: StockOpnameStatus; total: number }[]
> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>(
      "/api/v1/stock-opnames/count"
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stock opname service.");
  }

  const response = stockOpnameCountsResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error(
      "The stock opname service returned an invalid count response."
    );
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}
