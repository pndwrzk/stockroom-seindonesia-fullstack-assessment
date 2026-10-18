import { getApiError } from "@/features/auth/utils/get-api-error";
import { deleteStoreStockResponseSchema } from "@/features/inventory/schemas/store-stocks.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function deleteStoreStockService(storeStockId: string): Promise<void> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.delete<unknown>(
      `/api/v1/store-stocks/${encodeURIComponent(storeStockId)}`
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the inventory service.");
  }

  const response = deleteStoreStockResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The inventory service returned an invalid delete response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
