import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  storeStocksResponseSchema,
  type StoreStocksQuery,
  type StoreStocksResponse,
} from "@/features/inventory/schemas/store-stocks.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function getStoreStocksService(
  query: StoreStocksQuery
): Promise<StoreStocksResponse> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>("/api/v1/store-stocks", {
      params: query,
    }));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the inventory service.");
  }

  const response = storeStocksResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The inventory service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data;
}
