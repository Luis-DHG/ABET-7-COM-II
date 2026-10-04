import { parseCookie } from "cookie";
import type { Request, Response } from "express";

export const ACCESS_COOKIE = "blogdpc_access";
export const REFRESH_COOKIE = "blogdpc_refresh";
export const GOOGLE_STATE_COOKIE = "blogdpc_google_state";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.get("cookie");
  return header ? parseCookie(header)[name] : undefined;
}

export function setSessionCookies(response: Response, tokens: SessionTokens, secure: boolean): void {
  response.cookie(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 2 * 60 * 60 * 1000,
  });
  response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookies(response: Response, secure: boolean): void {
  response.clearCookie(ACCESS_COOKIE, { httpOnly: true, secure, sameSite: "lax", path: "/" });
  response.clearCookie(REFRESH_COOKIE, { httpOnly: true, secure, sameSite: "lax", path: "/api/auth" });
}
