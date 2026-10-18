import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  userFormSchema,
  userMutationResponseSchema,
  type UserFormValues,
} from "@/features/users/schemas/user-mutation.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function updateUserService(
  userId: string,
  values: UserFormValues
): Promise<void> {
  const { password, ...userData } = userFormSchema.parse(values);
  const payloadData = password ? { ...userData, password } : userData;

  let payload: unknown;
  try {
    ({ data: payload } = await tokenAxios.patch<unknown>(
      `/api/v1/users/${encodeURIComponent(userId)}`,
      payloadData
    ));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the users service.");
  }

  const response = userMutationResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The users service returned an invalid update response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
