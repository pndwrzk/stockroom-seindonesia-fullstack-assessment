import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  stockOpnamesResponseSchema,
  type StockOpnamesQuery,
  type StockOpnamesResponse,
} from "@/features/stock-opname/schemas/stock-opnames.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function getStockOpnamesService(
  query: StockOpnamesQuery
): Promise<StockOpnamesResponse> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>(
      "/api/v1/stock-opnames",
      { params: query }
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stock opname service.");
  }

  const response = stockOpnamesResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stock opname service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data;
}
