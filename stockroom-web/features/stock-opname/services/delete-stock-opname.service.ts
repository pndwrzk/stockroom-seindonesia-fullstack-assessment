import { getApiError } from "@/features/auth/utils/get-api-error";
import { deleteStockOpnameResponseSchema } from "@/features/stock-opname/schemas/stock-opnames.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function deleteStockOpnameService(
  stockOpnameId: string
): Promise<void> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.delete<unknown>(
      `/api/v1/stock-opnames/${encodeURIComponent(stockOpnameId)}`
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the stock opname service.");
  }

  const response = deleteStockOpnameResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error(
      "The stock opname service returned an invalid delete response."
    );
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
