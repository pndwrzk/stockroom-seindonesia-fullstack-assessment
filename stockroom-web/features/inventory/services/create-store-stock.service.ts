import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  createStoreStockResponseSchema,
  createStoreStockSchema,
  type CreateStoreStockValues,
} from "@/features/inventory/schemas/store-stocks.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function createStoreStockService(
  values: CreateStoreStockValues
): Promise<void> {
  const payloadData = createStoreStockSchema.parse(values);
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.post<unknown>(
      "/api/v1/store-stocks",
      payloadData
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the inventory service.");
  }

  const response = createStoreStockResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The inventory service returned an invalid create response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
