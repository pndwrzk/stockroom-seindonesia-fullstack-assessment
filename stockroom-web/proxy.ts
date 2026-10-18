import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/axios/auth-session-cookie";

const LOGIN_PATH = "/login";
const HOME_PATH = "/";

export function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.has(AUTH_SESSION_COOKIE);
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
