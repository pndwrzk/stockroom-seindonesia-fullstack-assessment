import { AUTH_SESSION_COOKIE } from "@/lib/axios/auth-session-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function setSessionCookie(isAuthenticated: boolean): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const value = isAuthenticated ? "1" : "";
  const maxAge = isAuthenticated ? "" : "; Max-Age=0";
  document.cookie = `${AUTH_SESSION_COOKIE}=${value}; Path=/; SameSite=Lax${maxAge}${secure}`;
}

export function getAccessToken(): string | null {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    throw new Error("Unable to read the saved access token from this browser.");
  }
}

export function getRefreshToken(): string | null {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    throw new Error("Unable to read the saved refresh token from this browser.");
  }
}

export function saveAuthTokens(accessToken: string, refreshToken: string): void {
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setSessionCookie(true);
  } catch {
    try {
      clearAuthTokens();
    } catch {
      throw new Error(
        "Could not save or clear authentication tokens. Clear browser storage before retrying."
      );
    }
    throw new Error("Unable to save authentication tokens in this browser.");
  }
}

export function clearAuthTokens(): void {
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    setSessionCookie(false);
  } catch {
    throw new Error("Unable to clear saved authentication tokens from this browser.");
  }
}
