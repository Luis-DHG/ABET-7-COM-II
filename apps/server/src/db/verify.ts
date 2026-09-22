import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { AppConfig } from "../config.js";
import { createAuthModule } from "../auth/module.js";
import { createOpaqueToken, hashOpaqueToken } from "../auth/crypto.js";
import { createForumModule } from "../forum/module.js";
import { AppError } from "../http/errors.js";
import type { Mailer } from "../mail/index.js";
import { createDatabase } from "./client.js";
import { refreshTokens } from "./schema.js";
import { requirePostgresUrl } from "./url.js";

if (process.env.ALLOW_DATABASE_TESTS !== "true") {
  throw new Error("Define ALLOW_DATABASE_TESTS=true únicamente para una base de pruebas aislada.");
}
const databaseUrl = requirePostgresUrl(process.env.DATABASE_TEST_URL, "DATABASE_TEST_URL");
if ([process.env.DATABASE_URL, process.env.DATABASE_MIGRATION_URL].includes(databaseUrl)) {
  throw new Error("DATABASE_TEST_URL debe ser distinta de las URLs de ejecución y migración.");
}

const isLocal = /(?:localhost|127\.0\.0\.1)/u.test(databaseUrl);
const database = createDatabase({
  databaseUrl,
  databaseMaxConnections: 4,
  databasePrepare: true,
  databaseSsl: !isLocal,
});
const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../../drizzle");
const createdUserIds: string[] = [];

function label(id: string): string {
  return `n${id.replaceAll("-", "")}`;
}

async function expectCheckViolation(operation: () => Promise<unknown>, constraintName: string): Promise<void> {
  await assert.rejects(operation, (error: unknown) => {
    const postgresError = error as { code?: string; constraint_name?: string };
    return postgresError.code === "23514" && postgresError.constraint_name === constraintName;
  });
}

try {
  await migrate(drizzle(database.client), { migrationsFolder, migrationsSchema: "drizzle", migrationsTable: "__drizzle_migrations" });
  await migrate(drizzle(database.client), { migrationsFolder, migrationsSchema: "drizzle", migrationsTable: "__drizzle_migrations" });

  const constraintUserId = randomUUID();
  const raceUserId = randomUUID();
  const refreshUserId = randomUUID();
  createdUserIds.push(constraintUserId, raceUserId, refreshUserId);
  await database.client`
    insert into app.users (id, email, display_name, password_hash, email_verified_at)
    values
      (${constraintUserId}, ${`db-constraint-${constraintUserId}@example.com`}, 'Constraint Test', 'test-hash', now()),
      (${raceUserId}, ${`db-race-${raceUserId}@example.com`}, 'Race Test', 'test-hash', now()),
      (${refreshUserId}, ${`db-refresh-${refreshUserId}@example.com`}, 'Refresh Test', 'test-hash', now())
  `;

  await expectCheckViolation(
    () => database.client`
      insert into app.users (id, email, display_name, password_hash)
      values (${randomUUID()}, 'INVALID@EXAMPLE.COM', 'Invalid Email', 'test-hash')
    `,
    "users_email_normalized_ck",
  );
  await expectCheckViolation(
    () => database.client`
      insert into app.users (id, email, display_name, password_hash, role)
      values (${randomUUID()}, ${`invalid-role-${randomUUID()}@example.com`}, 'Invalid Role', 'test-hash', 'OWNER')
    `,
    "users_role_ck",
  );

  const rootId = randomUUID();
  const rootPath = label(rootId);
  await database.client`
    insert into app.comments (id, author_id, root_id, path, body)
    values (${rootId}, ${constraintUserId}, ${rootId}, ${rootPath}, 'Comentario raíz válido')
  `;
  await expectCheckViolation(
    () => {
      const id = randomUUID();
      return database.client`
        insert into app.comments (id, author_id, root_id, path, body)
        values (${id}, ${constraintUserId}, ${id}, ${label(id)}, 'ab')
      `;
    },
    "comments_body_length_ck",
  );
  await expectCheckViolation(
    () => {
      const id = randomUUID();
      return database.client`
        insert into app.comments (id, author_id, root_id, path, body)
        values (${id}, ${constraintUserId}, ${rootId}, ${label(id)}, 'Forma raíz inválida')
      `;
    },
    "comments_root_shape_ck",
  );
  await expectCheckViolation(
    () => {
      const id = randomUUID();
      const invalidPath = `${rootPath}.n1.n2.n3.n4.n5.${label(id)}`;
      return database.client`
        insert into app.comments (id, author_id, parent_id, root_id, path, body)
        values (${id}, ${constraintUserId}, ${rootId}, ${rootId}, ${invalidPath}, 'Profundidad inválida')
      `;
    },
    "comments_depth_ck",
  );
  await expectCheckViolation(
    () => database.client`
      insert into app.account_tokens (user_id, purpose, token_hash, expires_at)
      values (${constraintUserId}, 'RESET_PASSWORD', 'hash-no-valido', now() + interval '1 hour')
    `,
    "account_tokens_hash_ck",
  );

  let parentId = rootId;
  let path = rootPath;
  for (let depth = 2; depth <= 6; depth += 1) {
    const id = randomUUID();
    path = `${path}.${label(id)}`;
    await database.client`
      insert into app.comments (id, author_id, parent_id, root_id, path, body)
      values (${id}, ${constraintUserId}, ${parentId}, ${rootId}, ${path}, ${`Nivel ${depth}`})
    `;
    parentId = id;
  }

  const forum = createForumModule(database.db);
  const commentRace = await Promise.allSettled([
    forum.publish(raceUserId, { body: "Primera publicación concurrente" }),
    forum.publish(raceUserId, { body: "Segunda publicación concurrente" }),
  ]);
  assert.equal(commentRace.filter(({ status }) => status === "fulfilled").length, 1);
  assert.equal(commentRace.filter(({ status }) => status === "rejected").length, 1);
  const rejectedComment = commentRace.find(({ status }) => status === "rejected");
  assert(rejectedComment?.status === "rejected");
  assert(rejectedComment.reason instanceof AppError && rejectedComment.reason.code === "COMMENT_COOLDOWN");

  const opaqueToken = createOpaqueToken();
  const familyId = randomUUID();
  await database.db.insert(refreshTokens).values({
    id: randomUUID(),
    userId: refreshUserId,
    familyId,
    tokenHash: hashOpaqueToken(opaqueToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  const config: AppConfig = {
    port: 3000,
    appOrigin: "http://localhost:5173",
    databaseUrl,
    databaseSsl: !isLocal,
    databasePrepare: true,
    databaseMaxConnections: 4,
    jwtAccessSecret: "database-test-secret-with-at-least-thirty-two-characters",
    cookieSecure: false,
    trustProxyHops: 0,
    smtp: { host: "localhost", port: 25, user: "test@example.com", password: "unused", from: "test@example.com" },
    google: { clientId: "unused", clientSecret: "unused", redirectUri: "http://localhost/callback" },
  };
  const mailer: Mailer = {
    sendVerification: async () => undefined,
    sendPasswordReset: async () => undefined,
  };
  const auth = createAuthModule(database.db, config, mailer);
  const refreshRace = await Promise.allSettled([auth.refresh(opaqueToken), auth.refresh(opaqueToken)]);
  assert.equal(refreshRace.filter(({ status }) => status === "fulfilled").length, 1);
  assert.equal(refreshRace.filter(({ status }) => status === "rejected").length, 1);
  const rejectedRefresh = refreshRace.find(({ status }) => status === "rejected");
  assert(rejectedRefresh?.status === "rejected");
  assert(rejectedRefresh.reason instanceof AppError && rejectedRefresh.reason.code === "SESSION_REUSED");
  const family = await database.db.select({ revokedAt: refreshTokens.revokedAt })
    .from(refreshTokens).where(eq(refreshTokens.familyId, familyId));
  assert(family.length >= 2 && family.every(({ revokedAt }) => revokedAt !== null));

  await database.client`set enable_seqscan = off`;
  const rootPlan = await database.client<{ "QUERY PLAN": string }[]>`
    explain (analyze, buffers)
    select id from app.comments
    where parent_id is null
    order by created_at desc, id desc
    limit 20
  `;
  const childrenPlan = await database.client<{ "QUERY PLAN": string }[]>`
    explain (analyze, buffers)
    select id from app.comments
    where root_id = ${rootId}
    order by created_at asc, id asc
  `;
  const pathPlan = await database.client<{ "QUERY PLAN": string }[]>`
    explain (analyze, buffers)
    select id from app.comments
    where path <@ ${rootPath}::extensions.ltree
  `;
  await database.client`reset enable_seqscan`;
  assert(rootPlan.some((row) => row["QUERY PLAN"].includes("comments_roots_page_idx")));
  assert(childrenPlan.some((row) => row["QUERY PLAN"].includes("comments_root_children_idx")));
  assert(pathPlan.some((row) => row["QUERY PLAN"].includes("comments_path_gist_idx")));

  console.log(JSON.stringify({
    level: "info",
    event: "database_verification_passed",
    checks: ["migrations", "constraints", "comment_concurrency", "refresh_reuse", "forum_indexes"],
  }));
} finally {
  try {
    if (createdUserIds.length > 0) {
      await database.client`update app.refresh_tokens set replaced_by_id = null where user_id = any(${createdUserIds}::uuid[])`;
      await database.client`delete from app.refresh_tokens where user_id = any(${createdUserIds}::uuid[])`;
      await database.client`delete from app.account_tokens where user_id = any(${createdUserIds}::uuid[])`;
      while (true) {
        const deleted = await database.client`
          delete from app.comments candidate
          where candidate.author_id = any(${createdUserIds}::uuid[])
            and not exists (
              select 1 from app.comments child where child.parent_id = candidate.id
            )
          returning candidate.id
        `;
        if (deleted.length === 0) {
          throw new Error("No se pudieron limpiar todos los comentarios de prueba.");
        }
      }
      await database.client`delete from app.users where id = any(${createdUserIds}::uuid[])`;
    }
  } finally {
    await database.close();
  }
}
