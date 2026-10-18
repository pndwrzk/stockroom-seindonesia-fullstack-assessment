import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/axios/auth-events";
import { clearAuthTokens, getAccessToken } from "@/lib/axios/auth-token-storage";
import { refreshTokenService } from "@/features/auth/services/refresh-token.service";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const tokenAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

tokenAxios.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return Promise.reject(new Error("An access token is required for this request."));
  }

  config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

let refreshPromise: Promise<string> | null = null;

tokenAxios.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const request = error.config as RetryableRequestConfig;
    if (request._retry) {
      return Promise.reject(error);
    }
    request._retry = true;

    refreshPromise ??= refreshTokenService().finally(() => {
      refreshPromise = null;
    });

    try {
      const accessToken = await refreshPromise;
      request.headers.set("Authorization", `Bearer ${accessToken}`);
      return await tokenAxios(request);
    } catch (refreshError) {
      try {
        clearAuthTokens();
      } catch (storageError) {
        window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
        return Promise.reject(storageError);
      }

      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
      return Promise.reject(refreshError);
    }
  }
);
