import { randomUUID } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import * as oidc from "openid-client";
import type { LoginInput, PublicUser, RegisterInput, ResetPasswordInput } from "@blogdpc/contracts";
import type { AppConfig } from "../config.js";
import type { Database } from "../db/client.js";
import { accountTokens, refreshTokens, users, type User } from "../db/schema.js";
import { AppError } from "../http/errors.js";
import type { Mailer } from "../mail/index.js";
import {
  createOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  signAccessToken,
  signGoogleState,
  verifyAccessToken,
  verifyGoogleState,
  verifyPassword,
  type AccessClaims,
} from "./crypto.js";

const VERIFY_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const dummyPasswordHash = hashPassword("not-a-real-user-password");

export interface AuthSession {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

function asRole(role: string): "USER" | "ADMIN" {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: asRole(user.role),
    emailVerified: user.emailVerifiedAt !== null,
    isBanned: user.isBanned,
  };
}

function toAccessClaims(user: User): AccessClaims {
  return {
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
    role: asRole(user.role),
    emailVerified: user.emailVerifiedAt !== null,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export function createAuthModule(db: Database, config: AppConfig, mailer: Mailer) {
  let oidcConfigPromise: Promise<oidc.Configuration> | undefined;
  const getOidcConfig = () => {
    oidcConfigPromise ??= oidc.discovery(
      new URL("https://accounts.google.com"),
      config.google.clientId,
      config.google.clientSecret,
    );
    return oidcConfigPromise;
  };

  async function createSession(user: User): Promise<AuthSession> {
    const refreshToken = createOpaqueToken();
    const now = new Date();
    await db.insert(refreshTokens).values({
      id: randomUUID(),
      userId: user.id,
      familyId: randomUUID(),
      tokenHash: hashOpaqueToken(refreshToken),
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_LIFETIME_MS),
      createdAt: now,
    });
    return {
      user: toPublicUser(user),
      accessToken: await signAccessToken(toAccessClaims(user), config.jwtAccessSecret),
      refreshToken,
    };
  }

  return {
    async register(input: RegisterInput): Promise<{ status: "PENDING_VERIFICATION" }> {
      const id = randomUUID();
      const token = createOpaqueToken();
      const passwordHash = await hashPassword(input.password);

      try {
        await db.transaction(async (tx) => {
          await tx.insert(users).values({
            id,
            email: input.email,
            displayName: input.displayName,
            passwordHash,
          });
          await tx.insert(accountTokens).values({
            id: randomUUID(),
            userId: id,
            purpose: "VERIFY_EMAIL",
            tokenHash: hashOpaqueToken(token),
            expiresAt: new Date(Date.now() + VERIFY_TOKEN_LIFETIME_MS),
          });
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new AppError(409, "EMAIL_IN_USE", "Ya existe una cuenta con ese correo.");
        }
        throw error;
      }

      try {
        await mailer.sendVerification({ email: input.email, displayName: input.displayName, token });
      } catch {
        throw new AppError(503, "EMAIL_DELIVERY_FAILED", "La cuenta fue creada, pero no pudimos enviar el correo. Intenta reenviarlo.");
      }
      return { status: "PENDING_VERIFICATION" };
    },

    async verifyEmail(token: string): Promise<void> {
      const tokenHash = hashOpaqueToken(token);
      await db.transaction(async (tx) => {
        const [record] = await tx.select().from(accountTokens)
          .where(and(
            eq(accountTokens.tokenHash, tokenHash),
            eq(accountTokens.purpose, "VERIFY_EMAIL"),
          ))
          .limit(1)
          .for("update");
        if (!record || record.consumedAt || record.expiresAt <= new Date()) {
          throw new AppError(400, "TOKEN_INVALID", "El enlace es inválido, venció o ya fue utilizado.");
        }
        const now = new Date();
        await tx.update(accountTokens).set({ consumedAt: now }).where(eq(accountTokens.id, record.id));
        await tx.update(users).set({ emailVerifiedAt: now, updatedAt: now }).where(eq(users.id, record.userId));
      });
    },

    async resendVerification(email: string): Promise<void> {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || user.emailVerifiedAt) return;
      const token = createOpaqueToken();
      const now = new Date();
      await db.transaction(async (tx) => {
        await tx.update(accountTokens).set({ consumedAt: now }).where(and(
          eq(accountTokens.userId, user.id),
          eq(accountTokens.purpose, "VERIFY_EMAIL"),
          isNull(accountTokens.consumedAt),
        ));
        await tx.insert(accountTokens).values({
          id: randomUUID(),
          userId: user.id,
          purpose: "VERIFY_EMAIL",
          tokenHash: hashOpaqueToken(token),
          expiresAt: new Date(now.getTime() + VERIFY_TOKEN_LIFETIME_MS),
        });
      });
      try {
        await mailer.sendVerification({ email: user.email, displayName: user.displayName, token });
      } catch (error) {
        console.error(JSON.stringify({ level: "error", event: "verification_email_failed", error: error instanceof Error ? error.message : "unknown" }));
      }
    },

    async login(input: LoginInput): Promise<AuthSession> {
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      const hash = user?.passwordHash ?? await dummyPasswordHash;
      const valid = await verifyPassword(input.password, hash);
      if (!user || !user.passwordHash || !valid) {
        throw new AppError(401, "INVALID_CREDENTIALS", "El correo o la contraseña no son correctos.");
      }
      return createSession(user);
    },

    async refresh(token: string): Promise<AuthSession> {
      const tokenHash = hashOpaqueToken(token);
      const result = await db.transaction(async (tx) => {
        const [record] = await tx.select({ token: refreshTokens, user: users })
          .from(refreshTokens)
          .innerJoin(users, eq(refreshTokens.userId, users.id))
          .where(eq(refreshTokens.tokenHash, tokenHash))
          .limit(1)
          .for("update");

        if (!record) return { kind: "invalid" as const };
        const now = new Date();
        if (record.token.usedAt || record.token.revokedAt) {
          await tx.update(refreshTokens).set({ revokedAt: now }).where(and(
            eq(refreshTokens.familyId, record.token.familyId),
            isNull(refreshTokens.revokedAt),
          ));
          return { kind: "reused" as const };
        }
        if (record.token.expiresAt <= now) {
          await tx.update(refreshTokens).set({ revokedAt: now }).where(eq(refreshTokens.id, record.token.id));
          return { kind: "expired" as const };
        }

        const nextToken = createOpaqueToken();
        const nextId = randomUUID();
        await tx.insert(refreshTokens).values({
          id: nextId,
          userId: record.user.id,
          familyId: record.token.familyId,
          tokenHash: hashOpaqueToken(nextToken),
          expiresAt: new Date(now.getTime() + REFRESH_TOKEN_LIFETIME_MS),
          createdAt: now,
        });
        await tx.update(refreshTokens).set({ usedAt: now, replacedById: nextId }).where(eq(refreshTokens.id, record.token.id));
        return { kind: "valid" as const, user: record.user, refreshToken: nextToken };
      });

      if (result.kind === "reused") {
        throw new AppError(401, "SESSION_REUSED", "La sesión fue invalidada por seguridad.");
      }
      if (result.kind !== "valid") {
        throw new AppError(401, "SESSION_EXPIRED", "La sesión expiró.");
      }
      return {
        user: toPublicUser(result.user),
        accessToken: await signAccessToken(toAccessClaims(result.user), config.jwtAccessSecret),
        refreshToken: result.refreshToken,
      };
    },

    async logout(token: string | undefined): Promise<void> {
      if (!token) return;
      await db.update(refreshTokens).set({ revokedAt: new Date() }).where(and(
        eq(refreshTokens.tokenHash, hashOpaqueToken(token)),
        isNull(refreshTokens.revokedAt),
      ));
    },

    async forgotPassword(email: string): Promise<void> {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user?.passwordHash) return;
      const token = createOpaqueToken();
      const now = new Date();
      await db.transaction(async (tx) => {
        await tx.update(accountTokens).set({ consumedAt: now }).where(and(
          eq(accountTokens.userId, user.id),
          eq(accountTokens.purpose, "RESET_PASSWORD"),
          isNull(accountTokens.consumedAt),
        ));
        await tx.insert(accountTokens).values({
          id: randomUUID(),
          userId: user.id,
          purpose: "RESET_PASSWORD",
          tokenHash: hashOpaqueToken(token),
          expiresAt: new Date(now.getTime() + RESET_TOKEN_LIFETIME_MS),
        });
      });
      try {
        await mailer.sendPasswordReset({ email: user.email, displayName: user.displayName, token });
      } catch (error) {
        console.error(JSON.stringify({ level: "error", event: "password_reset_email_failed", error: error instanceof Error ? error.message : "unknown" }));
      }
    },

    async resetPassword(input: ResetPasswordInput): Promise<void> {
      const tokenHash = hashOpaqueToken(input.token);
      const [candidate] = await db.select().from(accountTokens).where(and(
        eq(accountTokens.tokenHash, tokenHash),
        eq(accountTokens.purpose, "RESET_PASSWORD"),
        isNull(accountTokens.consumedAt),
        gt(accountTokens.expiresAt, new Date()),
      )).limit(1);
      if (!candidate) throw new AppError(400, "TOKEN_INVALID", "El enlace es inválido, venció o ya fue utilizado.");
      const passwordHash = await hashPassword(input.password);

      await db.transaction(async (tx) => {
        const [record] = await tx.select().from(accountTokens)
          .where(eq(accountTokens.id, candidate.id)).limit(1).for("update");
        if (!record || record.consumedAt || record.expiresAt <= new Date()) {
          throw new AppError(400, "TOKEN_INVALID", "El enlace es inválido, venció o ya fue utilizado.");
        }
        const now = new Date();
        await tx.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, record.userId));
        await tx.update(accountTokens).set({ consumedAt: now }).where(eq(accountTokens.id, record.id));
        await tx.update(refreshTokens).set({ revokedAt: now }).where(and(
          eq(refreshTokens.userId, record.userId),
          isNull(refreshTokens.revokedAt),
        ));
      });
    },

    async authenticateAccessToken(token: string | undefined): Promise<AccessClaims> {
      if (!token) throw new AppError(401, "AUTH_REQUIRED", "Debes iniciar sesión.");
      return verifyAccessToken(token, config.jwtAccessSecret);
    },

    async getSession(token: string | undefined): Promise<PublicUser | null> {
      if (!token) return null;
      let claims: AccessClaims;
      try {
        claims = await verifyAccessToken(token, config.jwtAccessSecret);
      } catch {
        return null;
      }
      const [user] = await db.select().from(users).where(eq(users.id, claims.sub)).limit(1);
      return user ? toPublicUser(user) : null;
    },

    async startGoogle(): Promise<{ url: string; stateToken: string }> {
      const oidcConfig = await getOidcConfig();
      const codeVerifier = oidc.randomPKCECodeVerifier();
      const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
      const state = oidc.randomState();
      const nonce = oidc.randomNonce();
      const url = oidc.buildAuthorizationUrl(oidcConfig, {
        redirect_uri: config.google.redirectUri,
        scope: "openid profile email",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
        nonce,
      });
      return {
        url: url.toString(),
        stateToken: await signGoogleState({ state, nonce, codeVerifier }, config.jwtAccessSecret),
      };
    },

    async completeGoogle(callbackUrl: URL, stateToken: string | undefined): Promise<AuthSession> {
      if (!stateToken) throw new AppError(400, "GOOGLE_STATE_INVALID", "Falta el estado de autenticación de Google.");
      const state = await verifyGoogleState(stateToken, config.jwtAccessSecret);
      const oidcConfig = await getOidcConfig();
      const tokens = await oidc.authorizationCodeGrant(oidcConfig, callbackUrl, {
        pkceCodeVerifier: state.codeVerifier,
        expectedState: state.state,
        expectedNonce: state.nonce,
        idTokenExpected: true,
      });
      const claims = tokens.claims();
      if (!claims || typeof claims.email !== "string" || claims.email_verified !== true || typeof claims.sub !== "string") {
        throw new AppError(403, "GOOGLE_EMAIL_UNVERIFIED", "Google no confirmó un correo verificado.");
      }
      const email = claims.email.trim().toLowerCase();
      const displayName = typeof claims.name === "string" && claims.name.trim()
        ? claims.name.trim().slice(0, 100)
        : email.split("@")[0]!.slice(0, 100);

      const user = await db.transaction(async (tx) => {
        const [existingIdentity] = await tx.select().from(users).where(eq(users.googleSubject, claims.sub)).limit(1);
        if (existingIdentity) return existingIdentity;
        const [existingEmail] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingEmail) {
          throw new AppError(409, "GOOGLE_ACCOUNT_CONFLICT", "Este correo ya usa otro método de ingreso.");
        }
        const [created] = await tx.insert(users).values({
          id: randomUUID(),
          email,
          displayName,
          googleSubject: claims.sub,
          emailVerifiedAt: new Date(),
        }).returning();
        if (!created) throw new Error("No se pudo crear el usuario de Google");
        return created;
      });
      return createSession(user);
    },
  };
}

export type AuthModule = ReturnType<typeof createAuthModule>;
