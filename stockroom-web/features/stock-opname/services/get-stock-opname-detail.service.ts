import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  stockOpnameDetailResponseSchema,
  stockOpnameItemsResponseSchema,
  type StockOpnameDetail,
  type StockOpnameItemsResponse,
} from "@/features/stock-opname/schemas/stock-opnames.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function getStockOpnameDetailService(
  stockOpnameId: string
): Promise<StockOpnameDetail> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>(
      `/api/v1/stock-opnames/${encodeURIComponent(stockOpnameId)}`
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stock opname service.");
  }

  const response = stockOpnameDetailResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stock opname service returned an invalid detail response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function getStockOpnameItemsService(
  stockOpnameId: string,
  page: number,
  limit: number
): Promise<StockOpnameItemsResponse> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>(
      `/api/v1/stock-opnames/${encodeURIComponent(stockOpnameId)}/item`,
      { params: { page, limit } }
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stock opname items service.");
  }

  const response = stockOpnameItemsResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stock opname items service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data;
}
