import assert from "node:assert/strict";
import test from "node:test";
import { type SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import type { Database } from "../db/client.js";
import { comments, users } from "../db/schema.js";
import { AppError } from "../http/errors.js";
import { createForumModule } from "./module.js";

const AUTHOR_ID = "00000000-0000-4000-8000-000000000001";
const ROOT_ID = "00000000-0000-4000-8000-000000000101";
const REPLY_ID = "00000000-0000-4000-8000-000000000102";
const root = { id: ROOT_ID, parentId: null as string | null, rootId: ROOT_ID, path: `n${ROOT_ID.replaceAll("-", "")}`, isRemoved: false };
type Author = { id: string; displayName: string; emailVerifiedAt: Date | null; isBanned: boolean };
type Child = { parentId: string; isRemoved: boolean };
const author: Author = { id: AUTHOR_ID, displayName: "Autor de prueba", emailVerifiedAt: new Date("2026-01-01T00:00:00Z"), isBanned: false };
const directChildren = (count: number, removed = false): Child[] => Array.from({ length: count }, (_, i) => ({ parentId: ROOT_ID, isRemoved: removed && i === 0 }));

// Adapter del seam público Database/transaction. No pool, SQL ejecutado ni BD.
// La selección responde por tabla/proyección y verifica el WHERE real de Drizzle;
// no hay una cola posicional que pueda convertir consultas equivocadas en verde.
function fixture(options: { author?: Author | null; parent?: typeof root; children?: Child[]; cooldown?: boolean } = {}) {
  const trace: string[] = [], inserted: Record<string, unknown>[] = [], counts: number[] = [];
  let transactionConfig: unknown, inTransaction = false;
  const dialect = new PgDialect();
  const assertWhere = (condition: SQL | undefined, column: string, value: string) => {
    assert.ok(condition, "La consulta necesita criterio de WHERE");
    const query = dialect.sqlToQuery(condition);
    // Quitar solo calificadores/whitespace/paréntesis de una igualdad simple.
    const predicate = query.sql.replace(/"[^"]+"\./gu, "").replace(/[()\s]/gu, "");
    assert.equal(predicate, `"${column}"=$1`, `WHERE debe limitarse a ${column}; no filtrar retiradas ni contar descendientes`);
    assert.deepEqual(query.params, [value]);
  };
  const tx = {
    select(selection?: Record<string, unknown>) {
      let table: unknown, condition: SQL | undefined, lock: string | undefined, limit: number | undefined;
      const execute = (): unknown[] => {
        assert.ok(inTransaction, "Toda consulta de publish debe ejecutarse dentro de la transacción");
        if (table === users) {
          assertWhere(condition, "id", AUTHOR_ID);
          assert.equal(limit, 1);
          trace.push(lock === "update" ? "author-lock" : "author-unlocked");
          const value = options.author === undefined ? author : options.author;
          return value ? [value] : [];
        }
        assert.equal(table, comments);
        if (selection && "count" in selection) {
          trace.push("count");
          assert.ok(trace.includes("parent-lock"), "El count debe ser una sentencia posterior al lock de raíz");
          assertWhere(condition, "parent_id", options.parent?.id ?? ROOT_ID);
          const aggregate = dialect.sqlToQuery(selection.count as SQL).sql.replace(/\s/gu, "");
          assert.match(aggregate, /count\(\*\)/iu, "La proyección count debe contar todos los nodos");
          const count = (options.children ?? []).filter((child) => child.parentId === (options.parent?.id ?? ROOT_ID)).length;
          counts.push(count);
          return [{ count }];
        }
        if (selection && "createdAt" in selection) {
          trace.push("latest");
          assertWhere(condition, "author_id", AUTHOR_ID);
          return options.cooldown ? [{ createdAt: new Date(Date.now() - 10_000) }] : [];
        }
        trace.push(lock === "update" ? "parent-lock" : "parent-unlocked");
        assertWhere(condition, "id", options.parent?.id ?? ROOT_ID);
        assert.equal(limit, 1);
        return [options.parent ?? root];
      };
      const builder = {
        from(value: unknown) { table = value; return builder; },
        where(value: SQL) { condition = value; return builder; },
        orderBy(..._values: unknown[]) { return builder; },
        limit(value: number) { limit = value; return builder; },
        for(value: string) { lock = value; return builder; },
        then(resolve?: (rows: unknown[]) => unknown, reject?: (error: unknown) => unknown) {
          return Promise.resolve().then(execute).then(resolve, reject);
        },
      };
      return builder;
    },
    insert(table: unknown) {
      assert.equal(table, comments);
      return { values: async (value: Record<string, unknown>) => {
        assert.ok(inTransaction);
        trace.push("insert"); inserted.push(value);
      } };
    },
  };
  const db = {
    select() { assert.fail("publish no debe consultar fuera de tx"); },
    async transaction(work: (transaction: typeof tx) => Promise<unknown>, config?: unknown) {
      transactionConfig = config; inTransaction = true;
      try { return await work(tx); } finally { inTransaction = false; }
    },
  } as unknown as Database;
  return { forum: createForumModule(db), trace, inserted, counts, config: () => transactionConfig };
}

const rejectsCode = (code: string, status: number) => (error: unknown) => error instanceof AppError && error.code === code && error.status === status;

test("publish conserva una raíz nueva sin padre", async () => {
  const f = fixture();
  const published = await f.forum.publish(AUTHOR_ID, { body: "  Raíz en texto plano  " });
  assert.equal(published.depth, 1);
  assert.equal(published.parentId, null);
  assert.equal(published.rootId, published.id);
  assert.equal(published.body, "Raíz en texto plano");
  assert.equal(f.inserted.length, 1);
  assert.deepEqual(f.trace, ["author-lock", "latest", "insert"]);
});

test("publish rechaza padre respuesta histórica con REPLY_ROOT_ONLY sin insertar", async () => {
  const parent = { ...root, id: REPLY_ID, parentId: ROOT_ID, path: `${root.path}.n${REPLY_ID.replaceAll("-", "")}` };
  const f = fixture({ parent });
  await assert.rejects(f.forum.publish(AUTHOR_ID, { parentId: REPLY_ID, body: "No debe crearse un nieto" }), rejectsCode("REPLY_ROOT_ONLY", 409));
  assert.equal(f.inserted.length, 0);
  assert.deepEqual(f.trace, ["author-lock", "latest", "parent-lock"]);
});

test("publish acepta la sexta directa y cuenta después de locks con read committed", async () => {
  const f = fixture({ children: [...directChildren(5), { parentId: REPLY_ID, isRemoved: false }] });
  const published = await f.forum.publish(AUTHOR_ID, { parentId: ROOT_ID, body: "  Sexta directa\r\n<b>literal</b>  " });
  assert.equal(published.depth, 2);
  assert.equal(published.parentId, ROOT_ID);
  assert.equal(published.rootId, ROOT_ID);
  assert.equal(published.body, "Sexta directa\n<b>literal</b>");
  assert.equal(f.inserted.length, 1);
  assert.deepEqual(f.trace, ["author-lock", "latest", "parent-lock", "count", "insert"], "Falta el count separado posterior al lock de raíz");
  assert.deepEqual(f.counts, [5], "Descendientes indirectos no consumen cupo directo");
  assert.deepEqual(f.config(), { isolationLevel: "read committed" });
});

for (const removed of [false, true]) {
  test(`publish rechaza la séptima directa${removed ? " incluyendo una retirada" : ""}`, async () => {
    const f = fixture({ children: directChildren(6, removed) });
    await assert.rejects(f.forum.publish(AUTHOR_ID, { parentId: ROOT_ID, body: "Séptima fuera de cupo" }), rejectsCode("ROOT_REPLY_LIMIT_REACHED", 409));
    assert.equal(f.inserted.length, 0);
    assert.deepEqual(f.counts, [6]);
    assert.deepEqual(f.trace, ["author-lock", "latest", "parent-lock", "count"]);
    assert.deepEqual(f.config(), { isolationLevel: "read committed" });
  });
}

for (const condition of [
  { name: "sin autor", author: null, code: "AUTH_REQUIRED", status: 401, cooldown: false },
  { name: "correo no verificado", author: { ...author, emailVerifiedAt: null }, code: "EMAIL_NOT_VERIFIED", status: 403, cooldown: false },
  { name: "autor suspendido", author: { ...author, isBanned: true }, code: "USER_BANNED", status: 403, cooldown: false },
  { name: "cooldown vigente", author, code: "COMMENT_COOLDOWN", status: 429, cooldown: true },
]) {
  test(`publish preserva rechazo por ${condition.name} antes de consultar raíz/cupo`, async () => {
    const f = fixture({ author: condition.author, cooldown: condition.cooldown, children: directChildren(6) });
    await assert.rejects(f.forum.publish(AUTHOR_ID, { parentId: ROOT_ID, body: "No autorizado para publicar" }), rejectsCode(condition.code, condition.status));
    assert.equal(f.inserted.length, 0);
    assert.deepEqual(f.trace, condition.cooldown ? ["author-lock", "latest"] : ["author-lock"]);
  });
}
