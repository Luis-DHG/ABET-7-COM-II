// Lectura de fixtures históricas y carrera real: SOLO base aislada con opt-in.
// No construir historial multinivel mediante la API de escritura restringida.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createDatabase } from "../db/client.js";
import { users } from "../db/schema.js";
import { requirePostgresUrl } from "../db/url.js";
import { AppError } from "../http/errors.js";
import { createForumModule } from "./module.js";

const RUN = process.env.ALLOW_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_TEST_URL);
const SKIP_REASON = "requiere ALLOW_DATABASE_TESTS=true y DATABASE_TEST_URL (base aislada); carrera PostgreSQL no simulada";
type SeededComment = { id: string; parentId: string | null; rootId: string; path: string };

async function withIsolatedFixture(work: (fixture: {
  database: ReturnType<typeof createDatabase>;
  forum: ReturnType<typeof createForumModule>;
  author: () => Promise<string>;
  seed: (authorId: string, parent?: SeededComment, removed?: boolean) => Promise<SeededComment>;
}) => Promise<void>) {
  assert.ok(RUN, "Nunca abrir conexión sin ambos guards");
  const databaseUrl = requirePostgresUrl(process.env.DATABASE_TEST_URL, "DATABASE_TEST_URL");
  const database = createDatabase({ databaseUrl, databaseMaxConnections: 4, databasePrepare: true,
    databaseSsl: !/(?:localhost|127\.0\.0\.1)/u.test(databaseUrl) });
  const authorIds: string[] = [];
  let sequence = 0;
  const author = async () => {
    const id = randomUUID(); authorIds.push(id);
    await database.db.insert(users).values({ id, email: `foro-isolated-${id}@example.invalid`, displayName: "Autor aislado",
      passwordHash: "test-hash", emailVerifiedAt: new Date() });
    return id;
  };
  const seed = async (authorId: string, parent?: SeededComment, removed = false): Promise<SeededComment> => {
    const id = randomUUID(), label = `n${id.replaceAll("-", "")}`;
    const entry = { id, parentId: parent?.id ?? null, rootId: parent?.rootId ?? id, path: parent ? `${parent.path}.${label}` : label };
    const createdAt = new Date(Date.now() - 60_000 + sequence++);
    await database.client`
      insert into app.comments (id, author_id, parent_id, root_id, path, body, created_at)
      values (${id}, ${authorId}, ${entry.parentId}, ${entry.rootId}, ${entry.path}::extensions.ltree,
        ${`Comentario histórico ${sequence}`}, ${createdAt})
    `;
    if (removed) await database.client`
      update app.comments set is_removed = true, removed_at = now(), removed_by = ${authorId} where id = ${id}
    `;
    return entry;
  };
  try { await work({ database, forum: createForumModule(database.db), author, seed }); }
  finally {
    // Solo nuestras filas; hojas antes de padres. No limpiar globalmente la BD.
    for (let round = 0; round < 8; round++) await database.client`
      delete from app.comments candidate where candidate.author_id = any(${authorIds}::uuid[])
        and not exists (select 1 from app.comments child where child.parent_id = candidate.id)
    `;
    await database.client`delete from app.users where id = any(${authorIds}::uuid[])`;
    await database.close();
  }
}

test("historial hasta nivel 6 y descendientes de retirado se leen; raíz histórica >6 queda cerrada", { skip: !RUN && SKIP_REASON }, async () => {
  await withIsolatedFixture(async ({ forum, database, author, seed }) => {
    const creator = await author(), chain: SeededComment[] = [];
    for (let depth = 1; depth <= 6; depth++) chain.push(await seed(creator, chain.at(-1), depth === 3));
    const historical = await forum.getThread(chain[0]!.id);
    let node = historical;
    for (let depth = 1; depth <= 6; depth++) {
      assert.equal(node.id, chain[depth - 1]!.id);
      assert.equal(node.parentId, chain[depth - 1]!.parentId);
      assert.equal(node.depth, depth);
      if (depth === 3) {
        assert.equal(node.isRemoved, true);
        assert.equal(node.body, "Este mensaje incumple las normas del proyecto");
      }
      assert.equal(node.replies.length, depth < 6 ? 1 : 0);
      if (depth < 6) node = node.replies[0]!;
    }
    const oversized = await seed(creator), direct: SeededComment[] = [];
    for (let i = 0; i < 7; i++) direct.push(await seed(creator, oversized, i === 2));
    const oversizedThread = await forum.getThread(oversized.id);
    assert.deepEqual(oversizedThread.replies.map((reply) => reply.id), direct.map((reply) => reply.id));
    assert.equal(oversizedThread.replies[2]!.isRemoved, true);
    const { comments: listed } = await forum.list({ limit: 20 });
    const historicalListed = listed.find((entry) => entry.id === historical.id);
    assert.ok(historicalListed);
    assert.equal(historicalListed.hasDeepConversation, true);
    assert.equal(historicalListed.replies.length, 1);
    assert.deepEqual(listed.find((entry) => entry.id === oversized.id)?.replies.map((reply) => reply.id), direct.map((reply) => reply.id));

    const blocked = await author();
    await assert.rejects(forum.publish(blocked, { parentId: oversized.id, body: "Fuera de cupo histórico" }),
      (error: unknown) => error instanceof AppError && error.code === "ROOT_REPLY_LIMIT_REACHED");
    await assert.rejects(forum.publish(blocked, { parentId: chain[1]!.id, body: "No responder a respuesta histórica" }),
      (error: unknown) => error instanceof AppError && error.code === "REPLY_ROOT_ONLY");
    const [before] = await database.client`select count(*)::integer as count from app.comments where author_id = ${blocked}`;
    assert.equal(before!.count, 0, "Los rechazos no insertan ni consumen un nuevo cooldown");
    assert.equal((await forum.publish(blocked, { body: "Raíz permitida después del rechazo" })).depth, 1);
  });
});

test("PostgreSQL: dos autores sobre cinco hijos producen un éxito, un conflicto y total seis", { skip: !RUN && SKIP_REASON }, async () => {
  await withIsolatedFixture(async ({ forum, database, author, seed }) => {
    const creator = await author(), root = await seed(creator);
    for (let i = 0; i < 5; i++) await seed(creator, root, i === 0);
    const [first, second] = await Promise.all([author(), author()]);
    const results = await Promise.allSettled([
      forum.publish(first, { parentId: root.id, body: "Competidor uno del sexto cupo" }),
      forum.publish(second, { parentId: root.id, body: "Competidor dos del sexto cupo" }),
    ]);
    const successes = results.filter((result) => result.status === "fulfilled");
    const failures = results.filter((result) => result.status === "rejected");
    assert.equal(successes.length, 1);
    assert.equal(successes[0]!.value.depth, 2);
    assert.equal(failures.length, 1);
    assert.ok(failures[0]!.reason instanceof AppError);
    assert.equal(failures[0]!.reason.code, "ROOT_REPLY_LIMIT_REACHED");
    const [total] = await database.client`select count(*)::integer as count from app.comments where parent_id = ${root.id}`;
    assert.equal(total!.count, 6, "Cuenta también la respuesta retirada");
  });
});
