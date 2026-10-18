import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  createStockOpnameResponseSchema,
  type CreateStockOpnameValues,
} from "@/features/stock-opname/schemas/stock-opnames.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function createStockOpnameService(
  values: CreateStockOpnameValues
): Promise<void> {
  let payload: unknown;
  const { note, ...requestBodyWithoutNote } = values;
  const requestBody = note
    ? { ...requestBodyWithoutNote, note }
    : requestBodyWithoutNote;

  try {
    ({ data: payload } = await tokenAxios.post<unknown>(
      "/api/v1/stock-opnames",
      requestBody
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stock opname service.");
  }

  const response = createStockOpnameResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stock opname service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
