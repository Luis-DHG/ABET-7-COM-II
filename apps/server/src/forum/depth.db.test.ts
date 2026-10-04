// Sprint 0 — pruebas del árbol raíz → hijo → nieto y del límite de seis niveles
// (plan.md §Sprint 0/§Sprint 2). Documentan el contrato vigente de forum/module.ts;
// sirven como regresión para los cambios del Sprint 2.
import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase } from "../db/client.js";
import { users } from "../db/schema.js";
import { AppError } from "../http/errors.js";
import { createForumModule } from "./module.js";
import { requirePostgresUrl } from "../db/url.js";

const RUN = process.env.ALLOW_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_TEST_URL);
const SKIP_REASON = "requiere ALLOW_DATABASE_TESTS=true y DATABASE_TEST_URL (base aislada)";

test(
  "foro: raíz → hijo → nieto hasta nivel 6; nivel 7 rechazado",
  { skip: !RUN && SKIP_REASON },
  async () => {
    const databaseUrl = requirePostgresUrl(process.env.DATABASE_TEST_URL, "DATABASE_TEST_URL");
    const database = createDatabase({
      databaseUrl,
      databaseMaxConnections: 4,
      databasePrepare: true,
      databaseSsl: !/(?:localhost|127\.0\.0\.1)/u.test(databaseUrl),
    });
    const forum = createForumModule(database.db);
    const suffix = Date.now();
    const authorIds: string[] = [];

    // Autores distintos por nivel: el cooldown de 30 s es por usuario (plan §6).
    const author = async (index: number): Promise<string> => {
      const id = crypto.randomUUID();
      authorIds.push(id);
      await database.db.insert(users).values({
        id,
        email: `sprint0-depth-${suffix}-${index}@example.com`,
        displayName: `Nivel ${index}`,
        passwordHash: "test-hash",
        emailVerifiedAt: new Date(),
      });
      return id;
    };

    try {
      const chain: string[] = [];
      let parentId: string | undefined;
      for (let depth = 1; depth <= 6; depth += 1) {
        const published = await forum.publish(await author(depth), {
          ...(parentId ? { parentId } : {}),
          body: `Comentario de nivel ${depth}`,
        });
        assert.equal(published.depth, depth);
        parentId = published.id;
        chain.push(published.id);
      }

      // El nivel 7 supera el máximo y debe rechazarse.
      await assert.rejects(
        forum.publish(await author(7), { parentId: parentId!, body: "Séptimo nivel" }),
        (error: unknown) => error instanceof AppError && error.code === "MAX_THREAD_DEPTH",
      );

      // El hilo completo expone los seis niveles anidados en orden.
      const thread = await forum.getThread(chain[0]!);
      let node = thread;
      assert.equal(node.id, chain[0]);
      for (let depth = 2; depth <= 6; depth += 1) {
        assert.equal(node.replies.length, 1, `nivel ${depth - 1} debe tener una respuesta`);
        node = node.replies[0]!;
        assert.equal(node.id, chain[depth - 1]);
        assert.equal(node.depth, depth);
      }
      assert.equal(node.replies.length, 0);

      // El listado principal deja la respuesta profunda en el hilo (plan §F1):
      // raíz visible, solo respuestas de nivel 2 y marca de conversación profunda.
      const { comments: listed } = await forum.list({ limit: 20 });
      const root = listed.find((entry) => entry.id === chain[0]);
      assert.ok(root, "la raíz publicada debe aparecer en el listado");
      assert.equal(root.hasDeepConversation, true);
      assert.equal(root.replies.length, 1);
      assert.equal(root.replies[0]?.depth, 2);
    } finally {
      // Limpieza en hojas hacia la raíz: los hijos referencian a los padres.
      for (let round = 0; round < 8; round += 1) {
        await database.client`
          delete from app.comments candidate
          where candidate.author_id = any(${authorIds}::uuid[])
            and not exists (
              select 1 from app.comments child where child.parent_id = candidate.id
            )
        `;
      }
      await database.client`delete from app.users where id = any(${authorIds}::uuid[])`;
      await database.close();
    }
  },
);
