import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  storeFormSchema,
  storeMutationResponseSchema,
  type StoreFormValues,
} from "@/features/stores/schemas/store-mutation.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function createStoreService(values: StoreFormValues): Promise<void> {
  const payloadData = storeFormSchema.parse(values);
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.post<unknown>("/api/v1/stores", payloadData));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stores service.");
  }

  const response = storeMutationResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stores service returned an invalid create response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
