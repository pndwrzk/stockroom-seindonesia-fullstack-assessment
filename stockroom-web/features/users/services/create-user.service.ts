import { getApiError } from "@/features/auth/utils/get-api-error";
import {
  userFormSchema,
  userMutationResponseSchema,
  type UserFormValues,
} from "@/features/users/schemas/user-mutation.schema";
import { tokenAxios } from "@/lib/axios/token-axios";

export async function createUserService(values: UserFormValues): Promise<void> {
  const payloadData = userFormSchema.parse(values);
  if (!payloadData.password) {
    throw new Error("Password is required to create a user.");
  }

  let payload: unknown;
  try {
    ({ data: payload } = await tokenAxios.post<unknown>("/api/v1/users", payloadData));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the users service.");
  }

  const response = userMutationResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The users service returned an invalid create response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}
