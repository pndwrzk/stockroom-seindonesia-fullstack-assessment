import { tokenAxios } from "@/lib/axios/token-axios";
import { usersResponseSchema, type UsersQuery, type UsersResponse } from "@/features/users/schemas/users.schema";
import { getApiError } from "@/features/auth/utils/get-api-error";

export async function getUsersService(query: UsersQuery): Promise<UsersResponse> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>("/api/v1/users", {
      params: query,
    }));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the users service.");
  }

  const response = usersResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The users service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data;
}
