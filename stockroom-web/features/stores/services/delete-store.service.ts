import { getApiError } from "@/features/auth/utils/get-api-error";
import { deleteStoreResponseSchema } from "@/features/stores/schemas/store-mutation.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function deleteStoreService(storeId: string): Promise<void> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.delete<unknown>(
      `/api/v1/stores/${encodeURIComponent(storeId)}`
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stores service.");
  }

  const response = deleteStoreResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stores service returned an invalid delete response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
