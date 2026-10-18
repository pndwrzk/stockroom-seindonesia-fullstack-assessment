import { authAxios } from "@/lib/axios/auth-axios";
import { getRefreshToken, saveAuthTokens } from "@/lib/axios/auth-token-storage";
import { refreshResponseSchema } from "@/features/auth/schemas/refresh-response.schema";
import { getApiError } from "@/features/auth/utils/get-api-error";

export async function refreshTokenService(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token is available. Please sign in again.");
  }

  let payload: unknown;
  try {
    ({ data: payload } = await authAxios.post<unknown>("/api/v1/auth/refresh", {
      refreshToken,
    }, {
      timeout: 15_000,
    }));
  } catch (error) {
    throw getApiError(error, "Unable to connect to the token refresh service.");
  }

  const response = refreshResponseSchema.safeParse(payload);
  if (!response.success) {
    throw new Error("The token refresh service returned an invalid response.");
  }
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  const { accessToken, refreshToken: nextRefreshToken } = response.data.data;
  saveAuthTokens(accessToken, nextRefreshToken);

  return accessToken;
}
