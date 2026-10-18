import { getApiError } from "@/features/auth/utils/get-api-error";
import { storeRecordSchema } from "@/features/stores/schemas/stores.schema";
import { tokenAxios } from "@/lib/axios/token-axios";
import { z } from "zod";

const storeResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: storeRecordSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export async function getStoreService(storeId: string) {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>(
      `/api/v1/stores/${encodeURIComponent(storeId)}`
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stores service.");
  }

  const response = storeResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stores service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}
