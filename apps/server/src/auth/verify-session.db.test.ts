// Sprint 0 — prueba fallida (plan.md §Sprint 1):
// POST /api/auth/verify-email debe crear la sesión (cookies HttpOnly) y devolver
// el usuario verificado, sin segunda petición a /session. Hoy responde solo
// { status: "VERIFIED" } → este test falla hasta implementar el Sprint 1.
import assert from "node:assert/strict";
import test from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { eq } from "drizzle-orm";
import type { AppConfig } from "../config.js";
import type { Database } from "../db/client.js";
import { createDatabase } from "../db/client.js";
import { accountTokens, refreshTokens, users } from "../db/schema.js";
import { createApp } from "../app.js";
import type { Mailer } from "../mail/index.js";
import { requirePostgresUrl } from "../db/url.js";

const RUN = process.env.ALLOW_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_TEST_URL);
const SKIP_REASON = "requiere ALLOW_DATABASE_TESTS=true y DATABASE_TEST_URL (base aislada)";

const config: AppConfig = {
  port: 0,
  appOrigin: "http://localhost:5173",
  databaseUrl: "",
  databaseSsl: true,
  databasePrepare: true,
  databaseMaxConnections: 4,
  jwtAccessSecret: "sprint0-test-secret-with-at-least-thirty-two-chars",
  cookieSecure: false,
  trustProxyHops: 0,
  smtp: { host: "localhost", port: 25, user: "test@example.com", password: "unused", from: "test@example.com" },
  google: { clientId: "unused", clientSecret: "unused", redirectUri: "http://localhost/callback" },
};

interface Fixture {
  baseUrl: string;
  server: Server;
  database: ReturnType<typeof createDatabase>;
  capturedToken: () => string;
}

async function startApp(): Promise<Fixture> {
  const databaseUrl = requirePostgresUrl(process.env.DATABASE_TEST_URL, "DATABASE_TEST_URL");
  config.databaseUrl = databaseUrl;
  config.databaseSsl = !/(?:localhost|127\.0\.0\.1)/u.test(databaseUrl);
  const database = createDatabase(config);
  let token = "";
  const mailer: Mailer = {
    sendVerification: async (input) => {
      token = input.token;
    },
    sendPasswordReset: async () => undefined,
  };
  const app = createApp(config, database.db, mailer);
  const server = await new Promise<Server>((resolveServer) => {
    const instance = app.listen(0, "127.0.0.1", () => resolveServer(instance));
  });
  const { port } = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    server,
    database,
    capturedToken: () => token,
  };
}

async function stopApp(fixture: Fixture): Promise<void> {
  await new Promise<void>((resolveClose) => fixture.server.close(() => resolveClose()));
  await fixture.database.close();
}

async function cleanupUser(db: Database, email: string): Promise<void> {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) return;
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, user.id));
  await db.delete(accountTokens).where(eq(accountTokens.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));
}

test(
  "registro → correo → verify-email crea sesión autenticada en una sola respuesta",
  { skip: !RUN && SKIP_REASON },
  async () => {
    const fixture = await startApp();
    const email = `sprint0-${Date.now()}@example.com`;
    try {
      const post = async (path: string, body: unknown, headers: Record<string, string> = {}) =>
        fetch(`${fixture.baseUrl}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Origin: config.appOrigin, ...headers },
          body: JSON.stringify(body),
        });

      const registered = await post("/api/auth/register", {
        email,
        displayName: "Sprint Cero",
        password: "clave-de-prueba-larga",
      });
      assert.equal(registered.status, 201);

      const verified = await post("/api/auth/verify-email", { token: fixture.capturedToken() });
      assert.equal(verified.status, 200);
      const cookies = verified.headers.getSetCookie();
      // Falla hoy: verify-email no establece cookies de sesión.
      assert.ok(
        cookies.some((cookie) => cookie.startsWith("blogdpc_access=")),
        "verify-email debe establecer la cookie de acceso HttpOnly",
      );
      assert.ok(
        cookies.some((cookie) => cookie.startsWith("blogdpc_refresh=")),
        "verify-email debe establecer la cookie de refresh HttpOnly",
      );
      const body = await verified.json() as { data: { user?: { email: string; emailVerified: boolean } } };
      // Falla hoy: la respuesta no incluye el usuario verificado.
      assert.equal(body.data.user?.email, email, "verify-email debe devolver el usuario verificado");
      assert.equal(body.data.user?.emailVerified, true);

      // Con las cookies emitidas, /session reconoce al usuario sin petición extra de login.
      const cookieHeader = cookies.map((cookie) => cookie.split(";")[0]).join("; ");
      const session = await fetch(`${fixture.baseUrl}/api/auth/session`, { headers: { Cookie: cookieHeader } });
      const sessionBody = await session.json() as { data: { user: { email: string } | null } };
      assert.equal(sessionBody.data.user?.email, email);

      const refreshCookie = cookies.find((cookie) => cookie.startsWith("blogdpc_refresh="))!.split(";")[0]!;
      const expiredAccess = await fetch(`${fixture.baseUrl}/api/auth/session`, {
        headers: { Cookie: refreshCookie },
      });
      assert.equal(expiredAccess.status, 401);
      const refreshed = await post("/api/auth/refresh", {}, { Cookie: refreshCookie });
      assert.equal(refreshed.status, 200);
      assert.equal((await refreshed.json() as { data: { user: { email: string } } }).data.user.email, email);

      // El token sigue siendo de un solo uso.
      const reused = await post("/api/auth/verify-email", { token: fixture.capturedToken() });
      assert.equal(reused.status, 400);
    } finally {
      await cleanupUser(fixture.database.db, email);
      await stopApp(fixture);
    }
  },
);
