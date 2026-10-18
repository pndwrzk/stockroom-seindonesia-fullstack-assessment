import { authAxios } from "@/lib/axios/auth-axios";
import { loginResponseSchema } from "@/features/auth/schemas/auth-response.schema";
import type { LoginFormValues, LoginResult } from "@/features/auth/types/auth.types";
import { getApiError } from "@/features/auth/utils/get-api-error";
import { mapAuthUser } from "@/features/auth/utils/map-auth-user";

export async function loginService(credentials: LoginFormValues): Promise<LoginResult> {
  let payload: unknown;

  try {
    ({ data: payload } = await authAxios.post<unknown>("/api/v1/auth/login", credentials));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the login service.");
  }

  const response = loginResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The login service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return {
    accessToken: response.data.data.accessToken,
    refreshToken: response.data.data.refreshToken,
    user: mapAuthUser(response.data.data.user),
  };
}
