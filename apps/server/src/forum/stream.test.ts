import assert from "node:assert/strict";
import { type Server } from "node:http";
import { type AddressInfo } from "node:net";
import test, { type TestContext } from "node:test";
import express from "express";
import { ACCESS_COOKIE } from "../http/cookies.js";
import { AppError, errorHandler } from "../http/errors.js";
import { createCommentBroadcaster, type CommentBroadcaster } from "./broadcaster.js";
import type { ForumModule } from "./module.js";
import { createForumRouter } from "./routes.js";
import type { AuthModule } from "../auth/module.js";

async function setupServer(
  t: TestContext,
  options: {
    broadcaster?: CommentBroadcaster;
    heartbeatIntervalMs?: number;
    publishError?: boolean;
  } = {},
) {
  const broadcaster = options.broadcaster ?? createCommentBroadcaster();
  const validRootId = "00000000-0000-4000-8000-000000000001";
  const dummyComment = {
    id: validRootId,
    parentId: null,
    rootId: validRootId,
    authorName: "Usuario",
    body: "Texto",
    isRemoved: false,
    createdAt: new Date().toISOString(),
    depth: 1,
    replies: [],
  };

  const forum = {
    list: async () => ({ comments: [dummyComment], nextCursor: null }),
    getThread: async (rootId: string) => ({ ...dummyComment, id: rootId, rootId }),
    publish: async (_authorId: string, input: { body: string; parentId?: string | null }) => {
      if (options.publishError || input.body === "trigger-error") {
        throw new AppError(500, "TRANSACTION_FAILED", "Falló la base de datos.");
      }
      return {
        id: "new-comment-id",
        parentId: input.parentId ?? null,
        rootId: input.parentId ?? "new-comment-id",
        authorName: "Autor",
        body: input.body,
        isRemoved: false,
        createdAt: new Date().toISOString(),
        depth: input.parentId ? 2 : 1,
        replies: [],
      };
    },
  } as unknown as ForumModule;

  const auth = {
    authenticateAccessToken: async (token?: string | null) => {
      if (!token || token === "invalid") {
        throw new AppError(401, "AUTH_REQUIRED", "Autenticación requerida.");
      }
      return { sub: "user-id-1", email: "user@example.invalid", role: "USER", emailVerified: true };
    },
  } as unknown as AuthModule;

  const app = express();
  app.use(express.json());
  app.use(
    "/api/comments",
    createForumRouter(forum, auth, broadcaster, options.heartbeatIntervalMs ?? 15_000),
  );
  app.use(errorHandler);

  const server = await new Promise<Server>((resolve, reject) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    instance.once("error", reject);
  });

  t.after(async () => {
    const closed = new Promise<void>((resolveClose) => server.close(() => resolveClose()));
    server.closeAllConnections();
    await closed;
  });

  const { port } = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    broadcaster,
    validRootId,
  };
}

test("conexión anónima a /api/comments/stream con encabezados SSE", async (t) => {
  const { baseUrl } = await setupServer(t);
  const controller = new AbortController();

  const response = await fetch(`${baseUrl}/api/comments/stream`, { signal: controller.signal });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/event-stream; charset=utf-8");
  assert.equal(response.headers.get("cache-control"), "no-store, no-transform");
  assert.equal(response.headers.get("x-accel-buffering"), "no");
  assert.equal(response.headers.get("connection"), "keep-alive");

  controller.abort();
});

test("transmisión recibe comment.created con rootId como único dato de aplicación", async (t) => {
  const { baseUrl, broadcaster, validRootId } = await setupServer(t);
  const controller = new AbortController();

  const response = await fetch(`${baseUrl}/api/comments/stream`, { signal: controller.signal });
  const reader = response.body!.getReader();

  broadcaster.emit({ rootId: validRootId });

  const { value } = await reader.read();
  const text = new TextDecoder().decode(value);

  assert.ok(text.includes("event: comment.created\n"));
  assert.ok(text.includes(`data: {"rootId":"${validRootId}"}\n\n`));

  const match = text.match(/data:\s*(\{.*\})/);
  assert.ok(match?.[1], "Debe contener una línea data con JSON");
  const payload = JSON.parse(match[1]);
  assert.deepEqual(Object.keys(payload), ["rootId"], "El payload solo debe contener rootId");
  assert.equal(payload.rootId, validRootId);

  controller.abort();
});

test("el comentario de transporte : heartbeat\\n\\n se envía y no es un evento de comentario", async (t) => {
  const { baseUrl } = await setupServer(t, { heartbeatIntervalMs: 25 });
  const controller = new AbortController();

  const response = await fetch(`${baseUrl}/api/comments/stream`, { signal: controller.signal });
  const reader = response.body!.getReader();

  let receivedHeartbeat = false;
  for (let i = 0; i < 10; i++) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = new TextDecoder().decode(value);
    if (text.includes(": heartbeat\n\n")) {
      receivedHeartbeat = true;
      assert.equal(text.includes("event: comment.created"), false, "Heartbeat no debe contener evento de comentario");
      assert.ok(text.startsWith(":"), "Heartbeat debe ser un comentario SSE que comienza con ':'");
      break;
    }
  }

  assert.equal(receivedHeartbeat, true, "Debe recibirse el comentario de heartbeat");
  controller.abort();
});

test("cerrar la conexión elimina el listener del broadcaster", async (t) => {
  const { baseUrl, broadcaster } = await setupServer(t);
  assert.equal(broadcaster.listenerCount(), 0);

  const controller = new AbortController();
  const response = await fetch(`${baseUrl}/api/comments/stream`, { signal: controller.signal });
  const reader = response.body!.getReader();

  // Conexión abierta: broadcaster tiene un listener
  assert.equal(broadcaster.listenerCount(), 1);

  // Cerrar cliente
  controller.abort();
  try {
    await reader.read();
  } catch {
    // Ignorar abort error
  }

  // Esperar a que el servidor reciba el cierre y limpie
  for (let attempt = 0; attempt < 30; attempt++) {
    if (broadcaster.listenerCount() === 0) break;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  assert.equal(broadcaster.listenerCount(), 0, "Al cerrar el stream el listener debe ser eliminado");
});

test("emisión post-commit en POST: publicación exitosa emite una vez, fallida no emite", async (t) => {
  const { baseUrl, broadcaster } = await setupServer(t);
  const emitted: Array<{ rootId: string }> = [];
  broadcaster.subscribe((event) => emitted.push(event));

  // 1. Fallo por falta de autenticación -> no emite
  const unauthResponse = await fetch(`${baseUrl}/api/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: "Sin autenticación" }),
  });
  assert.equal(unauthResponse.status, 401);
  assert.equal(emitted.length, 0, "No debe emitir si falla la autenticación");

  // 2. Fallo por cuerpo inválido -> no emite
  const invalidBodyResponse = await fetch(`${baseUrl}/api/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${ACCESS_COOKIE}=valid-token`,
    },
    body: JSON.stringify({ body: "Texto", parentId: "not-a-uuid" }),
  });
  assert.equal(invalidBodyResponse.status, 400);
  assert.equal(emitted.length, 0, "No debe emitir si la entrada es inválida");

  // 3. Fallo en la base de datos (rollback/throw) -> no emite
  const errorResponse = await fetch(`${baseUrl}/api/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${ACCESS_COOKIE}=valid-token`,
    },
    body: JSON.stringify({ body: "trigger-error" }),
  });
  assert.equal(errorResponse.status, 500);
  assert.equal(emitted.length, 0, "No debe emitir si la transacción falla");

  // 4. Publicación confirmada exitosa -> emite exactamente una vez
  const successResponse = await fetch(`${baseUrl}/api/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${ACCESS_COOKIE}=valid-token`,
    },
    body: JSON.stringify({ body: "Comentario exitoso" }),
  });
  assert.equal(successResponse.status, 201);
  assert.equal(emitted.length, 1, "Debe emitir exactamente una vez tras commit exitoso");
  assert.equal(emitted[0]?.rootId, "new-comment-id");
});

test("contratos GET list y GET thread se mantienen intactos", async (t) => {
  const { baseUrl, validRootId } = await setupServer(t);

  // GET /api/comments
  const listResponse = await fetch(`${baseUrl}/api/comments`);
  assert.equal(listResponse.status, 200);
  const listJson = (await listResponse.json()) as { data: unknown[]; meta: { nextCursor: unknown } };
  assert.ok(Array.isArray(listJson.data));
  assert.equal(listJson.data.length, 1);
  assert.equal(listJson.meta.nextCursor, null);

  // GET /api/comments/:rootId/thread
  const threadResponse = await fetch(`${baseUrl}/api/comments/${validRootId}/thread`);
  assert.equal(threadResponse.status, 200);
  const threadJson = (await threadResponse.json()) as { data: { id: string; rootId: string } };
  assert.equal(threadJson.data.id, validRootId);
  assert.equal(threadJson.data.rootId, validRootId);
});
