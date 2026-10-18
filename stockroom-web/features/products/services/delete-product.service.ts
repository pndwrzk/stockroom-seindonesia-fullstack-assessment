import { getApiError } from "@/features/auth/utils/get-api-error";
import { deleteProductResponseSchema } from "@/features/products/schemas/product-mutation.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function deleteProductService(productId: string): Promise<void> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.delete<unknown>(
      `/api/v1/products/${encodeURIComponent(productId)}`
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the products service.");
  }

  const response = deleteProductResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The products service returned an invalid delete response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
