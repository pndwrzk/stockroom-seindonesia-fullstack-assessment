import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  productFormSchema,
  productMutationResponseSchema,
  type ProductFormValues,
} from "@/features/products/schemas/product-mutation.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function createProductService(values: ProductFormValues): Promise<void> {
  const formData = productFormSchema.parse(values);
  const payloadData = { ...formData, price: Number(formData.price) };
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.post<unknown>(
      "/api/v1/products",
      payloadData
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the products service.");
  }

  const response = productMutationResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The products service returned an invalid create response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
