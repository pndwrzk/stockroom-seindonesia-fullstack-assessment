import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  storesResponseSchema,
  type StoresQuery,
  type StoresResponse,
} from "@/features/stores/schemas/stores.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function getStoresService(query: StoresQuery): Promise<StoresResponse> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>("/api/v1/stores", {
      params: query,
    }));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stores service.");
  }

  const response = storesResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stores service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data;
}
