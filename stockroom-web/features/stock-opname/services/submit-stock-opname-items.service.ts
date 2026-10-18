import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  submitStockOpnameItemsResponseSchema,
  submitStockOpnameItemsSchema,
  type SubmitStockOpnameItemsValues,
  type SubmitStockOpnameItemsResult,
} from "@/features/stock-opname/schemas/stock-opnames.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function submitStockOpnameItemsService(
  stockOpnameId: string,
  values: SubmitStockOpnameItemsValues
): Promise<SubmitStockOpnameItemsResult> {
  const requestBody = submitStockOpnameItemsSchema.parse(values);
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.patch<unknown>(
      `/api/v1/stock-opnames/${encodeURIComponent(stockOpnameId)}/items/submit`,
      requestBody
    ));
  } catch (error) {
    throw getApiError(error, "Unable to submit counted stock opname items.");
  }

  const response = submitStockOpnameItemsResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stock opname service returned an invalid submit response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}
