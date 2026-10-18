import { tokenAxios } from "@/lib/axios/token-axios";
import { currentUserResponseSchema } from "@/features/auth/schemas/auth-response.schema";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { getApiError } from "@/features/auth/utils/get-api-error";
import { mapAuthUser } from "@/features/auth/utils/map-auth-user";

export async function getCurrentUserService(): Promise<AuthUser> {
  let payload: unknown;

  try {
    ({ data: payload } = await tokenAxios.get<unknown>("/api/v1/auth/me", {
      timeout: 15_000,
    }));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the user profile service.");
  }

  const response = currentUserResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The user profile service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return mapAuthUser(response.data.data);
}
