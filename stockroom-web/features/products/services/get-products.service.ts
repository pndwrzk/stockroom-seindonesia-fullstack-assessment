import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  productsResponseSchema,
  type ProductsQuery,
  type ProductsResponse,
} from "@/features/products/schemas/products.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function getProductsService(query: ProductsQuery): Promise<ProductsResponse> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>("/api/v1/products", {
      params: query,
    }));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the products service.");
  }

  const response = productsResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The products service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data;
}
