import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  reviewStockOpnameResponseSchema,
  reviewStockOpnameSchema,
  type ReviewStockOpnameValues,
} from "@/features/stock-opname/schemas/stock-opnames.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export type StockOpnameReviewAction =
  | "approve"
  | "reject"
  | "request-revision";

export async function reviewStockOpnameService(
  stockOpnameId: string,
  action: StockOpnameReviewAction,
  values: ReviewStockOpnameValues
): Promise<void> {
  const { note } = reviewStockOpnameSchema.parse(values);
  const requestBody = note ? { note } : {};
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.post<unknown>(
      `/api/v1/stock-opnames/${encodeURIComponent(stockOpnameId)}/${action}`,
      requestBody
    ));
  } catch (error) {
    throw getApiError(error, `Unable to ${action} the stock opname.`);
  }

  const response = reviewStockOpnameResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The stock opname service returned an invalid review response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
