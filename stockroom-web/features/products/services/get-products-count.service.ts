import { z } from "zod";
import { getApiError } from "@/features/auth/utils/get-api-error";
import { tokenAxios } from "@/lib/axios/token-axios";

const productsCountResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.object({ total: z.number().int().min(0) }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export async function getProductsCountService(): Promise<number> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>(
      "/api/v1/products/count"
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the products service.");
  }

  const response = productsCountResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The products service returned an invalid count response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data.total;
}
