import { getApiError } from "@/features/auth/utils/get-api-error";
import { deleteUserResponseSchema } from "@/features/users/schemas/user-mutation.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function deleteUserService(userId: string): Promise<void> {
  let payload: unknown;
  try {
    ({ data: payload } = await tokenAxios.delete<unknown>(
      `/api/v1/users/${encodeURIComponent(userId)}`
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the users service.");
  }

  const response = deleteUserResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The users service returned an invalid delete response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
