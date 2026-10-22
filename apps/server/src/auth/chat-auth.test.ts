import assert from "node:assert/strict";
import test from "node:test";
import { SignJWT } from "jose";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import type { AppConfig } from "../config.js";
import type { Database } from "../db/client.js";
import { comments, users, type User } from "../db/schema.js";
import { AppError } from "../http/errors.js";
import type { Mailer } from "../mail/index.js";
import { signAccessToken, type AccessClaims } from "./crypto.js";
import { createAuthModule } from "./module.js";

const SECRET = "fake-chat-auth-secret-with-more-than-thirty-two-characters";
const OTHER_SECRET = "different-fake-secret-with-more-than-thirty-two-characters";
const USER_ID = "11111111-1111-4111-8111-111111111111";
const ADMIN_ID = "22222222-2222-4222-8222-222222222222";
const MISSING_USER_ID = "33333333-3333-4333-8333-333333333333";

type ChatAuthSurface = ReturnType<typeof createAuthModule> & {
  authenticateChatUser?: (token: string | undefined) => Promise<string>;
};

type QueryEvidence = { sql: string; params: unknown[]; table: unknown };
type FakeDatabase = ReturnType<typeof fakeDatabase>;

function requireChatAuth(db: FakeDatabase): (token: string | undefined) => Promise<string> {
  const auth = createAuthModule(db.db, fakeConfig(), fakeMailer()) as ChatAuthSurface;
  const authenticate = auth.authenticateChatUser;
  assert.equal(typeof authenticate, "function", "Falta authenticateChatUser(token) en createAuthModule");
  assert.ok(authenticate);
  return authenticate.bind(auth);
}

function fakeConfig(): AppConfig {
  return {
    port: 3000,
    appOrigin: "https://blog.example.invalid",
    databaseUrl: "postgresql://fake-role:fake-password@db.example.invalid:5432/fake-blog",
    databaseSsl: false,
    databasePrepare: true,
    databaseMaxConnections: 2,
    jwtAccessSecret: SECRET,
    cookieSecure: false,
    trustProxyHops: 0,
    smtp: { host: "smtp.example.invalid", port: 465, user: "mailer@example.invalid", password: "fake-smtp-password", from: "BlogDPC <mailer@example.invalid>" },
    google: { clientId: "fake-google-client", clientSecret: "fake-google-secret", redirectUri: "https://blog.example.invalid/callback" },
    chat: { nvidiaApiKey: "fake-nvidia-key", openrouterApiKey: "fake-openrouter-key", geminiApiKey: "fake-gemini-key" },
  };
}

function fakeMailer(): Mailer {
  return {
    async sendVerification() {},
    async sendPasswordReset() {},
  };
}

function fakeUser(input: {
  id: string;
  role: "USER" | "ADMIN";
  emailVerifiedAt: Date | null;
  isBanned: boolean;
}): User {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: input.id,
    email: `database-${input.id.slice(0, 8)}@example.invalid`,
    displayName: `DB ${input.role} user`,
    passwordHash: "fake-password-hash",
    googleSubject: null,
    role: input.role,
    emailVerifiedAt: input.emailVerifiedAt,
    isBanned: input.isBanned,
    bannedAt: input.isBanned ? now : null,
    bannedBy: input.isBanned ? ADMIN_ID : null,
    createdAt: now,
    updatedAt: now,
  };
}

function signedToken(sub: string, overrides: Partial<AccessClaims> = {}, secret = SECRET): Promise<string> {
  return signAccessToken({
    sub,
    email: "jwt-claim@example.invalid",
    displayName: "Nombre declarado por JWT",
    role: "USER",
    emailVerified: true,
    ...overrides,
  }, secret);
}

async function expiredToken(sub: string): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return new SignJWT({
    email: "jwt-claim@example.invalid",
    displayName: "Token expirado firmado para test",
    role: "USER",
    emailVerified: true,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(sub)
    .setIssuer("blogdpc")
    .setAudience("blogdpc-web")
    .setIssuedAt(nowSeconds - 3600)
    .setExpirationTime(nowSeconds - 1800)
    .sign(new TextEncoder().encode(SECRET));
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise; });
  return { promise, resolve };
}

function fakeDatabase(options: { expectedSub: string; user: User | null; gateCommit?: boolean }) {
  const trace: string[] = [];
  const queryEvidence: QueryEvidence[] = [];
  const metrics = {
    transactionCalls: 0,
    globalSelectCalls: 0,
    userSelectCalls: 0,
    writes: 0,
    inTransaction: false,
    commits: 0,
    rollbacks: 0,
  };
  const selected = deferred<void>();
  const commitGate = deferred<void>();
  const dialect = new PgDialect();

  const assertIdentityWhere = (condition: SQL | undefined) => {
    assert.ok(condition, "La consulta debe filtrar la identidad de users");
    const query = dialect.sqlToQuery(condition);
    const predicate = query.sql.replace(/"[^"]+"\./gu, "").replace(/[()\s]/gu, "");
    assert.equal(predicate, '"id"=$1', "La identidad se consulta por users.id, no por email/rol");
    assert.deepEqual(query.params, [options.expectedSub], "El parámetro de identidad debe ser claims.sub");
    return query;
  };

  const tx = {
    select(selection?: Record<string, unknown>) {
      let table: unknown;
      let condition: SQL | undefined;
      const execute = (): unknown[] => {
        assert.equal(metrics.inTransaction, true, "La comprobación de usuario debe ocurrir dentro de tx");
        assert.equal(table, users, "La única tabla consultada para autenticar chat es users");
        assert.notEqual(table, comments, "La autenticación del chat nunca consulta comments");
        const query = assertIdentityWhere(condition);
        queryEvidence.push({ sql: query.sql, params: query.params, table });
        metrics.userSelectCalls += 1;
        trace.push("select:users");
        selected.resolve();
        return options.user?.id === options.expectedSub ? [options.user] : [];
      };
      const builder = {
        from(value: unknown) { table = value; return builder; },
        where(value: SQL) { condition = value; return builder; },
        limit(_value: number) { return builder; },
        then(resolve?: (rows: unknown[]) => unknown, reject?: (error: unknown) => unknown) {
          return Promise.resolve().then(execute).then(resolve, reject);
        },
      };
      void selection; // La interfaz pública requiere comprobar identidad/tabla; no acoplarse a una proyección concreta.
      return builder;
    },
    insert(_table: unknown) { metrics.writes += 1; assert.fail("authenticateChatUser no debe insertar"); },
    update(_table: unknown) { metrics.writes += 1; assert.fail("authenticateChatUser no debe actualizar"); },
    delete(_table: unknown) { metrics.writes += 1; assert.fail("authenticateChatUser no debe borrar"); },
  };

  const db = {
    select() { metrics.globalSelectCalls += 1; assert.fail("No debe haber fallback a SELECT fuera de la transacción"); },
    insert(_table: unknown) { metrics.writes += 1; assert.fail("authenticateChatUser no debe insertar fuera de tx"); },
    update(_table: unknown) { metrics.writes += 1; assert.fail("authenticateChatUser no debe actualizar fuera de tx"); },
    delete(_table: unknown) { metrics.writes += 1; assert.fail("authenticateChatUser no debe borrar fuera de tx"); },
    async transaction<T>(work: (transaction: typeof tx) => Promise<T>): Promise<T> {
      metrics.transactionCalls += 1;
      metrics.inTransaction = true;
      trace.push("transaction:start");
      try {
        const result = await work(tx);
        if (options.gateCommit) await commitGate.promise;
        metrics.commits += 1;
        trace.push("transaction:commit");
        return result;
      } catch (error) {
        metrics.rollbacks += 1;
        trace.push("transaction:rollback");
        throw error;
      } finally {
        metrics.inTransaction = false;
      }
    },
  };

  return {
    db: db as unknown as Database,
    trace,
    queryEvidence,
    metrics,
    selected: selected.promise,
    releaseCommit: () => commitGate.resolve(),
  };
}

function isAuthRequired(error: unknown): boolean {
  return error instanceof AppError && error.status === 401 && error.code === "AUTH_REQUIRED";
}

function assertReadOnlyIdentityLookup(fake: ReturnType<typeof fakeDatabase>, expectedSub: string): void {
  assert.equal(fake.metrics.globalSelectCalls, 0, "No query global ni fallback fuera de tx");
  assert.equal(fake.metrics.writes, 0, "Solo se autoriza lectura; sin inserts/updates/deletes");
  assert.equal(fake.queryEvidence.length, 1);
  assert.equal(fake.queryEvidence[0]!.table, users);
  const query = fake.queryEvidence[0]!;
  const predicate = query.sql.replace(/"[^"]+"\./gu, "").replace(/[()\s]/gu, "");
  assert.equal(predicate, '"id"=$1');
  assert.deepEqual(query.params, [expectedSub]);
}

test("A02: cookie ausente y JWT inválido, firmado con otra clave o expirado rechazan 401 sin consultar DB", async () => {
  const fake = fakeDatabase({ expectedSub: USER_ID, user: fakeUser({ id: USER_ID, role: "USER", emailVerifiedAt: null, isBanned: false }) });
  const authenticate = requireChatAuth(fake);
  const invalidTokens = [
    undefined,
    "not-a-jwt",
    await signedToken(USER_ID, {}, OTHER_SECRET),
    await expiredToken(USER_ID),
  ];

  for (const token of invalidTokens) await assert.rejects(authenticate(token), isAuthRequired);
  assert.equal(fake.metrics.transactionCalls, 0);
  assert.equal(fake.metrics.globalSelectCalls, 0);
  assert.equal(fake.metrics.userSelectCalls, 0);
  assert.equal(fake.metrics.writes, 0);
  assert.deepEqual(fake.trace, []);
});

test("A02: token válido cuyo claims.sub no existe en users rechaza 401 dentro de tx", async () => {
  const fake = fakeDatabase({ expectedSub: MISSING_USER_ID, user: null });
  const authenticate = requireChatAuth(fake);
  const token = await signedToken(MISSING_USER_ID);

  await assert.rejects(authenticate(token), isAuthRequired);
  assert.equal(fake.metrics.transactionCalls, 1);
  assert.equal(fake.metrics.userSelectCalls, 1);
  assert.equal(fake.metrics.rollbacks, 1);
  assertReadOnlyIdentityLookup(fake, MISSING_USER_ID);
});

for (const scenario of [
  {
    label: "USER no verificado y suspendido",
    id: USER_ID,
    dbRole: "USER" as const,
    emailVerifiedAt: null,
    isBanned: true,
    claimRole: "ADMIN" as const,
    claimEmailVerified: false,
  },
  {
    label: "ADMIN no verificado y suspendido",
    id: ADMIN_ID,
    dbRole: "ADMIN" as const,
    emailVerifiedAt: null,
    isBanned: true,
    claimRole: "USER" as const,
    claimEmailVerified: true,
  },
]) {
  test(`A04 admite ${scenario.label}; identidad por sub, sin gates de rol/correo del JWT o usuario`, async () => {
    const fake = fakeDatabase({
      expectedSub: scenario.id,
      user: fakeUser({
        id: scenario.id,
        role: scenario.dbRole,
        emailVerifiedAt: scenario.emailVerifiedAt,
        isBanned: scenario.isBanned,
      }),
    });
    const authenticate = requireChatAuth(fake);
    const token = await signedToken(scenario.id, {
      role: scenario.claimRole,
      emailVerified: scenario.claimEmailVerified,
    });

    assert.equal(await authenticate(token), scenario.id);
    assert.equal(fake.metrics.commits, 1);
    assertReadOnlyIdentityLookup(fake, scenario.id);
    assert.deepEqual(fake.trace, ["transaction:start", "select:users", "transaction:commit"]);
  });
}

test("A03: authenticateChatUser no devuelve el id ni inicia el consumidor antes del COMMIT de tx", async () => {
  const fake = fakeDatabase({
    expectedSub: USER_ID,
    user: fakeUser({ id: USER_ID, role: "USER", emailVerifiedAt: null, isBanned: true }),
    gateCommit: true,
  });
  const authenticate = requireChatAuth(fake);
  const token = await signedToken(USER_ID, { role: "ADMIN", emailVerified: false });
  let returnedToConsumer = false;
  const providerStartedFor: string[] = [];
  const flow = authenticate(token).then((userId) => {
    returnedToConsumer = true;
    providerStartedFor.push(userId); // Simula el siguiente paso del flujo, sin hacer fetch.
    return userId;
  });

  const firstObservable = await Promise.race([
    fake.selected.then(() => "selected" as const),
    flow.then(() => "returned-before-select" as const, () => "rejected-before-select" as const),
  ]);
  assert.equal(firstObservable, "selected", "Debe ejecutar el SELECT en tx antes de resolver o rechazar el helper");
  assert.equal(fake.metrics.inTransaction, true);
  assert.equal(returnedToConsumer, false, "La promesa no puede resolver mientras COMMIT siga bloqueado");
  assert.deepEqual(providerStartedFor, [], "El proveedor no puede empezar antes de cerrar la transacción");
  assert.deepEqual(fake.trace, ["transaction:start", "select:users"]);
  assert.equal(fake.metrics.globalSelectCalls, 0);
  assert.equal(fake.metrics.writes, 0);

  fake.releaseCommit();
  assert.equal(await flow, USER_ID);
  assert.equal(fake.metrics.inTransaction, false);
  assert.equal(returnedToConsumer, true);
  assert.deepEqual(providerStartedFor, [USER_ID]);
  assert.deepEqual(fake.trace, ["transaction:start", "select:users", "transaction:commit"]);
  assertReadOnlyIdentityLookup(fake, USER_ID);
});
