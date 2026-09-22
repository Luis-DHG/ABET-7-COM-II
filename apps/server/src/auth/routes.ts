import { Router } from "express";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  tokenSchema,
} from "@blogdpc/contracts";
import type { AppConfig } from "../config.js";
import {
  ACCESS_COOKIE,
  GOOGLE_STATE_COOKIE,
  REFRESH_COOKIE,
  clearSessionCookies,
  readCookie,
  setSessionCookies,
} from "../http/cookies.js";
import { parseWith } from "../http/errors.js";
import type { AuthModule } from "./module.js";

export function createAuthRouter(auth: AuthModule, config: AppConfig): Router {
  const router = Router();

  router.post("/register", async (request, response) => {
    const result = await auth.register(parseWith(registerSchema, request.body));
    response.status(201).json({ data: result });
  });

  router.post("/verify-email", async (request, response) => {
    const { token } = parseWith(tokenSchema, request.body);
    await auth.verifyEmail(token);
    response.json({ data: { status: "VERIFIED" } });
  });

  router.post("/resend-verification", async (request, response) => {
    const { email } = parseWith(resendVerificationSchema, request.body);
    await auth.resendVerification(email);
    response.status(202).json({ data: { status: "ACCEPTED" } });
  });

  router.post("/login", async (request, response) => {
    const session = await auth.login(parseWith(loginSchema, request.body));
    setSessionCookies(response, session, config.cookieSecure);
    response.json({ data: { user: session.user } });
  });

  router.post("/refresh", async (request, response) => {
    const session = await auth.refresh(readCookie(request, REFRESH_COOKIE) ?? "");
    setSessionCookies(response, session, config.cookieSecure);
    response.json({ data: { user: session.user } });
  });

  router.post("/logout", async (request, response) => {
    await auth.logout(readCookie(request, REFRESH_COOKIE));
    clearSessionCookies(response, config.cookieSecure);
    response.status(204).end();
  });

  router.get("/session", async (request, response) => {
    const user = await auth.getSession(readCookie(request, ACCESS_COOKIE));
    response.json({ data: { user } });
  });

  router.post("/forgot-password", async (request, response) => {
    const { email } = parseWith(forgotPasswordSchema, request.body);
    await auth.forgotPassword(email);
    response.status(202).json({ data: { status: "ACCEPTED" } });
  });

  router.post("/reset-password", async (request, response) => {
    await auth.resetPassword(parseWith(resetPasswordSchema, request.body));
    clearSessionCookies(response, config.cookieSecure);
    response.json({ data: { status: "PASSWORD_RESET" } });
  });

  router.get("/google/start", async (_request, response) => {
    const { url, stateToken } = await auth.startGoogle();
    response.cookie(GOOGLE_STATE_COOKIE, stateToken, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: "lax",
      path: "/api/auth/google/callback",
      maxAge: 10 * 60 * 1000,
    });
    response.redirect(302, url);
  });

  router.get("/google/callback", async (request, response) => {
    try {
      const callbackUrl = new URL(request.originalUrl, config.google.redirectUri);
      const session = await auth.completeGoogle(callbackUrl, readCookie(request, GOOGLE_STATE_COOKIE));
      response.clearCookie(GOOGLE_STATE_COOKIE, {
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: "lax",
        path: "/api/auth/google/callback",
      });
      setSessionCookies(response, session, config.cookieSecure);
      response.redirect(303, new URL("/retroalimentacion", config.appOrigin).toString());
    } catch (error) {
      console.error(JSON.stringify({
        level: "error",
        event: "google_auth_failed",
        error: error instanceof Error ? error.message : "unknown",
      }));
      response.clearCookie(GOOGLE_STATE_COOKIE, {
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: "lax",
        path: "/api/auth/google/callback",
      });
      response.redirect(303, new URL("/login?error=google_auth_failed", config.appOrigin).toString());
    }
  });

  return router;
}
