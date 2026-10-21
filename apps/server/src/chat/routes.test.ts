import assert from "node:assert/strict";
import express, { type ErrorRequestHandler, type Router } from "express";
import { request as httpRequest } from "node:http";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test, { type TestContext } from "node:test";
import { createApp } from "../app.js";
import type { AuthModule } from "../auth/module.js";
import { createAuthModule } from "../auth/module.js";
import { signAccessToken } from "../auth/crypto.js";
import type { AppConfig } from "../config.js";
import type { Database } from "../db/client.js";
import { comments, users, type User } from "../db/schema.js";
import { ACCESS_COOKIE } from "../http/cookies.js";
import { AppError, errorHandler } from "../http/errors.js";
import { requestContext, requireSameOrigin } from "../http/middleware.js";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import type { Mailer } from "../mail/index.js";
import { createChatModule, type ChatModule } from "./module.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { streamChat } from "./provider.js";

type ChatRequest = { tabSessionId: string; message: string };
type ParseResult = { success: true; data: ChatRequest } | { success: false; error: unknown };
type ChatRequestSchema = { safeParse(value: unknown): ParseResult };
type ContractExports = { chatRequestSchema?: ChatRequestSchema };

const VALID_UUID = "00000000-0000-4000-8000-000000000001";
const BASE_REQUEST: ChatRequest = { tabSessionId: VALID_UUID, message: "¿Qué significa ISAC?" };

async function chatRequestSchema(): Promise<ChatRequestSchema> {
  // Resuelto desde apps/server/dist/chat/routes.test.js; no requiere alias ni contrato estático.
  const contractsUrl = new URL("../../../../packages/contracts/dist/index.js", import.meta.url);
  const contracts = await import(contractsUrl.href) as ContractExports;
  const schema = contracts.chatRequestSchema;
  assert.ok(schema && typeof schema.safeParse === "function", "Falta exportar chatRequestSchema desde @blogdpc/contracts");
  return schema;
}

function assertAccepted(schema: ChatRequestSchema, value: unknown): ChatRequest {
  const parsed = schema.safeParse(value);
  assert.ok(parsed.success, "La entrada válida debe pasar el contrato");
  return parsed.data;
}

function assertRejected(schema: ChatRequestSchema, value: unknown): void {
  assert.equal(schema.safeParse(value).success, false, "La entrada inválida debe ser rechazada");
}

type CreateChatRouter = (
  chat: ChatModule,
  auth: Pick<AuthModule, "authenticateChatUser">,
  config: Pick<AppConfig, "chat">,
  provider?: typeof streamChat,
) => Router;
type RouteExports = { createChatRouter?: CreateChatRouter };
type ProviderInput = Parameters<typeof streamChat>[0];
type ProviderOnChunk = Parameters<typeof streamChat>[1];
type ProviderBehavior = (input: ProviderInput, onChunk: ProviderOnChunk) => Promise<string>;

const APP_ORIGIN = "https://blog.example.invalid";
const ACCESS_TOKEN = "fake-access-cookie-token";
const USER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_USER_ID = "22222222-2222-4222-8222-222222222222";
const TAB_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_TAB_ID = "44444444-4444-4444-8444-444444444444";
const CHAT_UNAVAILABLE_MESSAGE = "El asistente no está disponible en este momento. Intenta de nuevo.";
const CHAT_INTERRUPTED_MESSAGE = "La respuesta se interrumpió. Intenta de nuevo.";
const CHAT_KEYS = { nvidiaApiKey: "fake-nvidia-route-key", openrouterApiKey: "fake-openrouter-route-key", geminiApiKey: "fake-gemini-route-key" };

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function errorEnvelope(value: unknown): { error: { code: string; message: string; retryAfterSeconds?: number }; requestId: string } {
  assert.ok(value && typeof value === "object");
  assert.ok("error" in value && value.error && typeof value.error === "object");
  assert.ok("requestId" in value && typeof value.requestId === "string");
  return value as { error: { code: string; message: string; retryAfterSeconds?: number }; requestId: string };
}

type HarnessOptions = {
  auth?: Pick<AuthModule, "authenticateChatUser">;
  authenticate?: (token: string | undefined) => Promise<string>;
  provider?: typeof streamChat;
  providerBehavior?: ProviderBehavior;
  clock?: { now: number };
  onResponseWrite?: (chunk: string, chat: ChatModule) => void;
};

async function routeHarness(t: TestContext, options: HarnessOptions = {}) {
  const clock = options.clock ?? { now: 0 };
  const chat = createChatModule({ now: () => clock.now });
  let server: Server | undefined;
  const logs: string[] = [];
  const errors: string[] = [];
  const authCalls: Array<string | undefined> = [];
  const providerCalls: ProviderInput[] = [];
  let errorHandlerCalls = 0;

  t.mock.method(console, "log", (...values: unknown[]) => { logs.push(values.map(String).join(" ")); });
  t.mock.method(console, "error", (...values: unknown[]) => { errors.push(values.map(String).join(" ")); });
  t.after(async () => {
    chat.dispose();
    if (server) {
      const closed = new Promise<void>((resolveClose) => server!.close(() => resolveClose()));
      server.closeAllConnections();
      await closed;
    }
  });

  const authImplementation = options.auth ?? {
    authenticateChatUser: options.authenticate ?? (async (token: string | undefined) => {
      if (token !== ACCESS_TOKEN) throw new AppError(401, "AUTH_REQUIRED", "Debes iniciar sesión.");
      return USER_ID;
    }),
  };
  const auth: Pick<AuthModule, "authenticateChatUser"> = {
    authenticateChatUser(token) {
      authCalls.push(token);
      return authImplementation.authenticateChatUser(token);
    },
  };
  const providerBehavior: ProviderBehavior = options.providerBehavior ?? (async (_input, onChunk) => {
    const answer = "Respuesta de proveedor falso";
    await onChunk(answer);
    return answer;
  });
  const provider: typeof streamChat = (input, onChunk) => {
    providerCalls.push(input);
    return providerBehavior(input, onChunk);
  };

  const app = express();
  app.use(requestContext);
  app.use(express.json({ limit: "32kb" }));
  app.use(requireSameOrigin(APP_ORIGIN));
  if (options.onResponseWrite) {
    app.use((_request, response, next) => {
      const originalWrite = response.write.bind(response);
      response.write = ((...args: Parameters<typeof response.write>) => {
        const [chunk] = args;
        if (chunk !== undefined && chunk !== null) {
          options.onResponseWrite!(typeof chunk === "string" ? chunk : Buffer.from(chunk as Uint8Array).toString("utf8"), chat);
        }
        return originalWrite(...args);
      }) as typeof response.write;
      const originalEnd = response.end.bind(response);
      response.end = ((...args: Parameters<typeof response.end>) => {
        const [chunk] = args;
        if (chunk !== undefined && chunk !== null) {
          options.onResponseWrite!(typeof chunk === "string" ? chunk : Buffer.from(chunk as Uint8Array).toString("utf8"), chat);
        }
        return originalEnd(...args);
      }) as typeof response.end;
      next();
    });
  }

  // Import URL so the RED is caused by missing routes.js, not a static TS resolution failure.
  const routeExports = await import(new URL("./routes.js", import.meta.url).href) as RouteExports;
  const createChatRouter = routeExports.createChatRouter;
  assert.equal(typeof createChatRouter, "function", "Falta exportar createChatRouter desde chat/routes.ts");
  assert.ok(createChatRouter);
  app.use("/api/chat", createChatRouter(chat, auth, { chat: CHAT_KEYS }, options.provider ?? provider));
  const errorSpy: ErrorRequestHandler = (error, request, response, next) => {
    errorHandlerCalls += 1;
    errorHandler(error, request, response, next);
  };
  // Error handler spy is the actual public HTTP error boundary.
  app.use(errorSpy);

  server = await new Promise<Server>((resolveServer, rejectServer) => {
    const instance = app.listen(0, "127.0.0.1", () => resolveServer(instance));
    instance.once("error", rejectServer);
  });
  const { port } = server.address() as AddressInfo;
  return {
    app,
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    chat,
    clock,
    authCalls,
    providerCalls,
    logs,
    errors,
    errorHandlerCalls: () => errorHandlerCalls,
  };
}

async function postChat(
  harness: Awaited<ReturnType<typeof routeHarness>>,
  body: unknown,
  options: { origin?: string | null; cookie?: string | null } = {},
): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const origin = options.origin === undefined ? APP_ORIGIN : options.origin;
  const cookie = options.cookie === undefined ? `${ACCESS_COOKIE}=${ACCESS_TOKEN}` : options.cookie;
  if (origin !== null) headers.Origin = origin;
  if (cookie !== null) headers.Cookie = cookie;
  const serialized = JSON.stringify(body);
  return fetch(`${harness.baseUrl}/api/chat`, {
    method: "POST",
    headers,
    ...(serialized === undefined ? {} : { body: serialized }),
  });
}

async function postRawChat(
  harness: Awaited<ReturnType<typeof routeHarness>>,
  rawBody: string,
  options: { origin?: string | null; cookie?: string | null } = {},
): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const origin = options.origin === undefined ? APP_ORIGIN : options.origin;
  const cookie = options.cookie === undefined ? `${ACCESS_COOKIE}=${ACCESS_TOKEN}` : options.cookie;
  if (origin !== null) headers.Origin = origin;
  if (cookie !== null) headers.Cookie = cookie;
  return fetch(`${harness.baseUrl}/api/chat`, { method: "POST", headers, body: rawBody });
}

function chatBody(tabSessionId = TAB_ID, message = "Pregunta técnica") {
  return { tabSessionId, message };
}

function chatSessionKey(userId = USER_ID, tabSessionId = TAB_ID): string {
  return `${userId}:${tabSessionId}`;
}

test("A05 acepta 300 unidades UTF-16 con espacios exteriores y par sustituto, sin normalizar el texto", async () => {
  const schema = await chatRequestSchema();
  const message = ` ${"a".repeat(296)}📡 `;
  assert.equal(message.length, 300);

  const parsed = assertAccepted(schema, { tabSessionId: VALID_UUID, message });
  assert.deepEqual(parsed, { tabSessionId: VALID_UUID, message });
  assert.equal(parsed.message, message, "El contrato preserva espacios, emoji y texto original");
});

test("A05 rechaza 301 unidades UTF-16 contando espacios exteriores y el par sustituto", async () => {
  const schema = await chatRequestSchema();
  const message = ` ${"a".repeat(297)}📡 `;
  assert.equal(message.length, 301);
  assertRejected(schema, { ...BASE_REQUEST, message });
});

test("A06 acepta UUIDv4 RFC 4122 en mayúsculas y preserva el mensaje aceptado", async () => {
  const schema = await chatRequestSchema();
  const tabSessionId = "ABCDEFAB-CDEF-4ABC-9DEF-ABCDEFABCDEF";
  const message = "  texto original con espacios  ";

  assert.deepEqual(assertAccepted(schema, { tabSessionId, message }), { tabSessionId, message });
});

test("A06 rechaza UUID de versiones distintas, nil y variante RFC 4122 inválida", async () => {
  const schema = await chatRequestSchema();
  for (const tabSessionId of [
    "00000000-0000-1000-8000-000000000001", // v1
    "00000000-0000-3000-8000-000000000001", // v3
    "00000000-0000-5000-8000-000000000001", // v5
    "00000000-0000-0000-0000-000000000000", // nil
    "00000000-0000-4000-7000-000000000001", // variante no RFC 4122
  ]) {
    assertRejected(schema, { ...BASE_REQUEST, tabSessionId });
  }
});

test("A06 rechaza mensaje vacío o compuesto solo por whitespace", async () => {
  const schema = await chatRequestSchema();
  for (const message of ["", "   ", "\t\n\r "]) {
    assertRejected(schema, { ...BASE_REQUEST, message });
  }
});

test("A06 rechaza history, identidad, modelo, prompt, IP y demás propiedades adicionales", async () => {
  const schema = await chatRequestSchema();
  const extras: Record<string, unknown> = {
    history: [],
    identity: "usuario-falso",
    userId: "usuario-falso",
    model: "modelo-cliente",
    system: "prompt-cliente",
    ip: "203.0.113.1",
    tools: [],
    metadata: {},
  };
  for (const [key, value] of Object.entries(extras)) {
    assertRejected(schema, { ...BASE_REQUEST, [key]: value });
  }
});

test("A06 rechaza bodies malformados o incompletos", async () => {
  const schema = await chatRequestSchema();
  for (const value of [null, [], "texto", {}, { message: BASE_REQUEST.message }, { tabSessionId: VALID_UUID }]) {
    assertRejected(schema, value);
  }
});

test("A05 HTTP acepta 300 unidades UTF-16 originales y rechaza 301 antes de cuota/proveedor", async (t) => {
  const h = await routeHarness(t);
  const acceptedMessage = ` ${"a".repeat(296)}📡 `;
  const accepted = await postChat(h, chatBody(TAB_ID, acceptedMessage));
  assert.equal(accepted.status, 200);
  assert.equal(accepted.headers.get("content-type"), "text/event-stream; charset=utf-8");
  assert.deepEqual(h.providerCalls[0]!.messages.at(-1), { role: "user", content: acceptedMessage });

  const rejectedMessage = ` ${"a".repeat(297)}📡 `;
  const rejected = await postChat(h, chatBody(OTHER_TAB_ID, rejectedMessage));
  assert.equal(rejected.status, 400);
  assert.equal(errorEnvelope(await rejected.json()).error.code, "VALIDATION_ERROR");
  assert.equal(h.authCalls.length, 2, "El flujo autentica antes de parsear el schema");
  assert.equal(h.providerCalls.length, 1);
  assert.deepEqual(h.chat.quotas.get(USER_ID), [0], "El body inválido no consume cuota");
});

test("A06 HTTP rechaza UUID no v4, whitespace-only, history y campos extra sin consumir cuota", async (t) => {
  const h = await routeHarness(t);
  const badBodies: unknown[] = [
    { ...BASE_REQUEST, tabSessionId: "00000000-0000-5000-8000-000000000001" },
    { ...BASE_REQUEST, message: " \t\n " },
    { ...BASE_REQUEST, history: [] },
    { ...BASE_REQUEST, identity: USER_ID },
    { ...BASE_REQUEST, userId: USER_ID },
    { ...BASE_REQUEST, model: "client-model" },
    { ...BASE_REQUEST, system: "client-system" },
    { ...BASE_REQUEST, ip: "203.0.113.1" },
    { ...BASE_REQUEST, tools: [] },
  ];
  for (const body of badBodies) {
    const response = await postChat(h, body);
    assert.equal(response.status, 400);
    assert.equal(errorEnvelope(await response.json()).error.code, "VALIDATION_ERROR");
  }
  assert.equal(h.authCalls.length, badBodies.length);
  assert.equal(h.providerCalls.length, 0);
  assert.equal(h.chat.quotas.size, 0);
});

test("A07 origen ausente/distinto da 403 antes de auth; JSON inválido da 400 INVALID_JSON", async (t) => {
  const h = await routeHarness(t);
  for (const origin of [null, "https://attacker.example.invalid"]) {
    const response = await postChat(h, chatBody(), { origin });
    assert.equal(response.status, 403);
    assert.equal(errorEnvelope(await response.json()).error.code, "INVALID_ORIGIN");
  }
  const malformed = await postRawChat(h, "{not-json", { origin: APP_ORIGIN });
  assert.equal(malformed.status, 400);
  assert.equal(errorEnvelope(await malformed.json()).error.code, "INVALID_JSON");
  assert.equal(h.authCalls.length, 0);
  assert.equal(h.providerCalls.length, 0);
  assert.equal(h.chat.quotas.size, 0);
  assert.equal(h.errorHandlerCalls(), 3);
});

test("A02 HTTP cookie ausente/token inválido rechaza antes de cuota y provider", async (t) => {
  const h = await routeHarness(t);
  for (const cookie of [null, `${ACCESS_COOKIE}=no-es-token-valido`]) {
    const response = await postChat(h, chatBody(), { cookie });
    assert.equal(response.status, 401);
    assert.equal(errorEnvelope(await response.json()).error.code, "AUTH_REQUIRED");
  }
  assert.deepEqual(h.authCalls, [undefined, "no-es-token-valido"]);
  assert.equal(h.chat.quotas.size, 0);
  assert.equal(h.providerCalls.length, 0);
});

test("cuota HTTP llena devuelve 429 con Retry-After y retryAfterSeconds coherentes", async (t) => {
  const h = await routeHarness(t);
  for (let count = 0; count < 10; count += 1) h.chat.consumeQuota(USER_ID);
  const response = await postChat(h, chatBody());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
  const body = errorEnvelope(await response.json());
  assert.equal(body.error.code, "CHAT_RATE_LIMITED");
  assert.equal(body.error.retryAfterSeconds, 60);
  assert.deepEqual(h.chat.quotas.get(USER_ID), Array(10).fill(0));
  assert.equal(h.providerCalls.length, 0);
});

test("A11/A36 una pestaña clonada colisiona con 409 y otra tabSessionId progresa", async (t) => {
  const firstStarted = deferred<void>();
  const releaseFirst = deferred<void>();
  t.after(() => releaseFirst.resolve());
  let invocations = 0;
  const h = await routeHarness(t, {
    providerBehavior: async (_input, onChunk) => {
      invocations += 1;
      if (invocations === 1) {
        firstStarted.resolve();
        await releaseFirst.promise;
      }
      const answer = `respuesta-${invocations}`;
      await onChunk(answer);
      return answer;
    },
  });

  const firstPromise = postChat(h, chatBody(TAB_ID, "primer turno"));
  await firstStarted.promise;
  const clone = await postChat(h, chatBody(TAB_ID, "misma pestaña clonada"));
  assert.equal(clone.status, 409);
  assert.equal(errorEnvelope(await clone.json()).error.code, "CHAT_IN_PROGRESS");
  assert.equal(h.providerCalls.length, 1, "La colisión no empieza otra generación");

  const otherTab = await postChat(h, chatBody(OTHER_TAB_ID, "otra pestaña progresa"));
  assert.equal(otherTab.status, 200);
  assert.equal(h.providerCalls.length, 2);
  releaseFirst.resolve();
  const first = await firstPromise;
  assert.equal(first.status, 200);
  assert.equal(h.chat.quotas.get(USER_ID)?.length, 3, "429/409/concurrencia no devuelve el consumo de cuota");
  assert.deepEqual(h.chat.sessions.get(chatSessionKey(USER_ID, TAB_ID))?.messages, [
    { role: "user", content: "primer turno" }, { role: "assistant", content: "respuesta-2" },
  ]);
  assert.deepEqual(h.chat.sessions.get(chatSessionKey(USER_ID, OTHER_TAB_ID))?.messages, [
    { role: "user", content: "otra pestaña progresa" }, { role: "assistant", content: "respuesta-2" },
  ]);
});

test("A17 touch ocurre en admisión, chunk no vacío y commit; espera de headers no prolonga actividad", async (t) => {
  const clock = { now: 10 };
  const providerStarted = deferred<ProviderOnChunk>();
  const finishProvider = deferred<string>();
  const h = await routeHarness(t, {
    clock,
    providerBehavior: async (_input, onChunk) => {
      providerStarted.resolve(onChunk);
      return finishProvider.promise;
    },
  });
  let responseReceived = false;
  const responsePromise = postChat(h, chatBody()).then((response) => {
    responseReceived = true;
    return response;
  });
  const onChunk = await providerStarted.promise;
  const sessionKey = chatSessionKey(USER_ID, TAB_ID);
  assert.equal(h.chat.sessions.get(sessionKey)?.lastActive, 10, "La admisión actualiza actividad");

  clock.now = 15;
  assert.equal(responseReceived, false, "Los headers SSE se difieren hasta el primer contenido");
  assert.equal(h.chat.sessions.get(sessionKey)?.lastActive, 10, "La espera/headers no actualiza actividad");
  await onChunk("");
  assert.equal(h.chat.sessions.get(sessionKey)?.lastActive, 10, "Chunk vacío no prolonga actividad");
  assert.equal(responseReceived, false);

  clock.now = 20;
  await onChunk("respuesta confirmada");
  const response = await responsePromise;
  assert.equal(response.status, 200);
  assert.equal(h.chat.sessions.get(sessionKey)?.lastActive, 20, "El contenido no vacío actualiza actividad");
  clock.now = 30;
  finishProvider.resolve("respuesta confirmada");
  await response.text();
  assert.deepEqual(h.chat.sessions.get(sessionKey), {
    messages: [{ role: "user", content: "Pregunta técnica" }, { role: "assistant", content: "respuesta confirmada" }],
    lastActive: 30,
  }, "El commit final actualiza actividad y conserva el par completo");
});

test("A20 presupuesto 422 tras consumir cuota no llama provider y libera el lock", async (t) => {
  const h = await routeHarness(t);
  const sessionKey = chatSessionKey(USER_ID, TAB_ID);
  const originalMessages = [
    { role: "user", content: "x".repeat(25_000) },
    { role: "assistant", content: "y" },
  ];
  h.chat.sessions.set(sessionKey, { messages: structuredClone(originalMessages), lastActive: 0 });

  const response = await postChat(h, chatBody(TAB_ID, "corta"));
  assert.equal(response.status, 422);
  assert.equal(errorEnvelope(await response.json()).error.code, "CHAT_CONTEXT_TOO_LARGE");
  assert.equal(h.providerCalls.length, 0);
  assert.deepEqual(h.chat.sessions.get(sessionKey)?.messages, originalMessages);
  assert.deepEqual(h.chat.quotas.get(USER_ID), [0], "El fallo posterior de presupuesto no reembolsa cuota");

  h.chat.sessions.set(sessionKey, { messages: [], lastActive: 0 });
  const retry = h.chat.beginTurn(USER_ID, TAB_ID, "lock liberado");
  retry.release();
});

test("A26 agotamiento del pool devuelve 503 JSON antes de SSE y conserva el consumo de cuota", async (t) => {
  const h = await routeHarness(t, {
    providerBehavior: async () => { throw new AppError(503, "CHAT_UNAVAILABLE", CHAT_UNAVAILABLE_MESSAGE); },
  });
  const response = await postChat(h, chatBody());
  assert.equal(response.status, 503);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/iu);
  assert.doesNotMatch(response.headers.get("content-type") ?? "", /text\/event-stream/iu);
  assert.equal(errorEnvelope(await response.json()).error.code, "CHAT_UNAVAILABLE");
  assert.deepEqual(h.chat.quotas.get(USER_ID), [0]);
  assert.equal(h.providerCalls.length, 1);
  assert.equal(h.errorHandlerCalls(), 1);
});

test("A27 emite chunks y DONE con framing SSE doble LF y JSON.stringify para texto hostil", async (t) => {
  const assistant = 'comillas " barra \\ salto\nlínea 📡';
  const h = await routeHarness(t, {
    providerBehavior: async (_input, onChunk) => {
      await onChunk(assistant);
      return assistant;
    },
  });
  const response = await postChat(h, chatBody());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/event-stream; charset=utf-8");
  assert.equal(response.headers.get("cache-control"), "no-store, no-transform");
  assert.equal(response.headers.get("x-accel-buffering"), "no");
  assert.equal(await response.text(), `data: ${JSON.stringify({ chunk: assistant })}\n\ndata: [DONE]\n\n`);
});

test("A28 error post-SSE es evento CHAT_STREAM_INTERRUPTED, status permanece 200 y no llega al errorHandler JSON", async (t) => {
  const h = await routeHarness(t, {
    providerBehavior: async (_input, onChunk) => {
      await onChunk("fragmento parcial");
      throw new AppError(503, "CHAT_STREAM_INTERRUPTED", CHAT_INTERRUPTED_MESSAGE);
    },
  });
  const response = await postChat(h, chatBody());
  assert.equal(response.status, 200);
  const requestId = response.headers.get("x-request-id");
  assert.ok(requestId);
  assert.equal(await response.text(),
    `data: ${JSON.stringify({ chunk: "fragmento parcial" })}\n\n`
    + `event: error\ndata: ${JSON.stringify({ error: { code: "CHAT_STREAM_INTERRUPTED", message: CHAT_INTERRUPTED_MESSAGE }, requestId })}\n\n`);
  assert.equal(h.errorHandlerCalls(), 0, "El error después de headers no debe atravesar errorHandler JSON");
  assert.deepEqual(h.chat.sessions.get(chatSessionKey())?.messages, [], "No se confirma un turno interrumpido");
});

test("A29 observa commit del Map antes del frame downstream [DONE]", async (t) => {
  let committedAtDone: unknown;
  const h = await routeHarness(t, {
    onResponseWrite(chunk, chat) {
      if (chunk.includes("data: [DONE]")) committedAtDone = structuredClone(chat.sessions.get(chatSessionKey())?.messages ?? []);
    },
  });
  const response = await postChat(h, chatBody());
  assert.equal(response.status, 200);
  assert.match(await response.text(), /data: \[DONE\]\n\n/u);
  assert.deepEqual(committedAtDone, [
    { role: "user", content: "Pregunta técnica" },
    { role: "assistant", content: "Respuesta de proveedor falso" },
  ]);
});

test("A29 integración ruta/pool fake: DONE confirma y EOF tras contenido emite error SSE sin commit ni fallback", async (t) => {
  let mode: "done" | "eof" = "done";
  let fetchCalls = 0;
  const fetchFake: typeof fetch = async () => {
    fetchCalls += 1;
    const delta = `data: ${JSON.stringify({ choices: [{ delta: { content: mode === "done" ? "terminada" : "parcial" } }] })}\n\n`;
    const body = mode === "done" ? delta + "data: [DONE]\n\n" : delta;
    return new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream; charset=utf-8" } });
  };
  const realPoolProvider: typeof streamChat = (input, onChunk) => streamChat({ ...input, fetchImpl: fetchFake }, onChunk);
  const h = await routeHarness(t, { provider: realPoolProvider });

  const success = await postChat(h, chatBody(TAB_ID, "termina correctamente"));
  assert.equal(success.status, 200);
  const successText = await success.text();
  assert.match(successText, /data: \[DONE\]\n\n/u);
  assert.deepEqual(h.chat.sessions.get(chatSessionKey(USER_ID, TAB_ID))?.messages, [
    { role: "user", content: "termina correctamente" },
    { role: "assistant", content: "terminada" },
  ]);

  mode = "eof";
  const interrupted = await postChat(h, chatBody(OTHER_TAB_ID, "falta terminal"));
  assert.equal(interrupted.status, 200);
  const interruptedText = await interrupted.text();
  assert.match(interruptedText, /event: error\ndata: /u);
  assert.doesNotMatch(interruptedText, /\[DONE\]/u);
  assert.deepEqual(h.chat.sessions.get(chatSessionKey(USER_ID, OTHER_TAB_ID))?.messages, [], "EOF nunca confirma el turno");
  assert.equal(fetchCalls, 2, "EOF postcontenido no activa fallback a otro modelo");
  assert.equal(h.errorHandlerCalls(), 0);
});

test("A31 disconnect aborta proveedor/libera lock; completar el body POST normalmente no aborta", { timeout: 10_000 }, async (t) => {
  const providerStarted = deferred<AbortSignal>();
  const firstAborted = deferred<void>();
  let providerCalls = 0;
  const h = await routeHarness(t, {
    providerBehavior: async (input, onChunk) => {
      providerCalls += 1;
      if (providerCalls === 1) {
        const signal = input.externalSignal;
        assert.ok(signal);
        providerStarted.resolve(signal);
        if (signal.aborted) firstAborted.resolve();
        else await new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve(), { once: true }));
        firstAborted.resolve();
        throw new AppError(503, "CHAT_STREAM_INTERRUPTED", CHAT_INTERRUPTED_MESSAGE);
      }
      await onChunk("retry after disconnect");
      return "retry after disconnect";
    },
  });
  const address = h.server.address() as AddressInfo;
  const request = httpRequest({
    host: "127.0.0.1",
    port: address.port,
    path: "/api/chat",
    method: "POST",
    headers: { Origin: APP_ORIGIN, Cookie: `${ACCESS_COOKIE}=${ACCESS_TOKEN}`, "Content-Type": "application/json" },
  }, (response) => { response.resume(); });
  request.on("error", () => undefined); // destroy() del socket es intencional en esta prueba.
  request.end(JSON.stringify(chatBody(TAB_ID, "body POST completo antes de disconnect")));

  const signal = await providerStarted.promise;
  assert.equal(signal.aborted, false, "El fin normal de lectura del body POST no cancela provider");
  assert.deepEqual(h.chat.sessions.get(chatSessionKey())?.messages, []);
  request.destroy();
  await firstAborted.promise;
  assert.equal(signal.aborted, true);
  assert.deepEqual(h.chat.sessions.get(chatSessionKey())?.messages, [], "Disconnect descarta turno pendiente");

  const retry = await postChat(h, chatBody(TAB_ID, "turno posterior"));
  assert.equal(retry.status, 200, "El lock se libera al abortar la conexión");
  await retry.text();
  assert.equal(providerCalls, 2, "El intento cancelado no hace fallback; una nueva petición sí progresa");
  assert.deepEqual(h.chat.quotas.get(USER_ID), [0, 0], "Disconnect consume cuota y no la reembolsa");
  assert.deepEqual(h.chat.sessions.get(chatSessionKey())?.messages, [
    { role: "user", content: "turno posterior" },
    { role: "assistant", content: "retry after disconnect" },
  ]);
});

test("A48 ruta usa auth transaccional con fake DB solo SELECT users, sin comments ni escrituras", async (t) => {
  const dialect = new PgDialect();
  const metrics = { transactions: 0, userReads: 0, globalReads: 0, commentsReads: 0, writes: 0, inTransaction: false };
  const user: User = {
    id: USER_ID,
    email: "db-user@example.invalid",
    displayName: "Usuario DB falso",
    passwordHash: "fake-password-hash",
    googleSubject: null,
    role: "USER",
    emailVerifiedAt: null,
    isBanned: true,
    bannedAt: new Date("2026-01-01T00:00:00Z"),
    bannedBy: OTHER_USER_ID,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
  const tx = {
    select(_selection?: Record<string, unknown>) {
      let table: unknown;
      let condition: SQL | undefined;
      const execute = () => {
        assert.equal(metrics.inTransaction, true);
        if (table === comments) metrics.commentsReads += 1;
        assert.equal(table, users, "La ruta/chat solo autoriza mediante users");
        assert.ok(condition);
        const query = dialect.sqlToQuery(condition);
        const predicate = query.sql.replace(/"[^"]+"\./gu, "").replace(/[()\s]/gu, "");
        assert.equal(predicate, '"id"=$1');
        assert.deepEqual(query.params, [USER_ID]);
        metrics.userReads += 1;
        return [user];
      };
      const builder = {
        from(value: unknown) { table = value; return builder; },
        where(value: SQL) { condition = value; return builder; },
        limit(_value: number) { return builder; },
        then(resolve?: (rows: unknown[]) => unknown, reject?: (error: unknown) => unknown) {
          return Promise.resolve().then(execute).then(resolve, reject);
        },
      };
      return builder;
    },
    insert(_table: unknown) { metrics.writes += 1; assert.fail("No se permiten escrituras durante chat"); },
    update(_table: unknown) { metrics.writes += 1; assert.fail("No se permiten escrituras durante chat"); },
    delete(_table: unknown) { metrics.writes += 1; assert.fail("No se permiten escrituras durante chat"); },
  };
  const db = {
    select() { metrics.globalReads += 1; assert.fail("No se permite consulta fuera de la transacción"); },
    insert(_table: unknown) { metrics.writes += 1; assert.fail("No se permiten escrituras durante chat"); },
    update(_table: unknown) { metrics.writes += 1; assert.fail("No se permiten escrituras durante chat"); },
    delete(_table: unknown) { metrics.writes += 1; assert.fail("No se permiten escrituras durante chat"); },
    async transaction<T>(work: (transaction: typeof tx) => Promise<T>): Promise<T> {
      metrics.transactions += 1;
      metrics.inTransaction = true;
      try { return await work(tx); } finally { metrics.inTransaction = false; }
    },
  } as unknown as Database;
  const config: AppConfig = {
    port: 0, appOrigin: APP_ORIGIN,
    databaseUrl: "postgresql://fake-role:fake-password@db.example.invalid:5432/fake-blog",
    databaseSsl: false, databasePrepare: true, databaseMaxConnections: 1,
    jwtAccessSecret: "fake-chat-route-auth-secret-over-thirty-two-chars",
    cookieSecure: false, trustProxyHops: 0,
    smtp: { host: "smtp.example.invalid", port: 465, user: "fake@example.invalid", password: "fake-mail", from: "BlogDPC <fake@example.invalid>" },
    google: { clientId: "fake-client", clientSecret: "fake-secret", redirectUri: "https://blog.example.invalid/callback" },
    chat: CHAT_KEYS,
  };
  const auth = createAuthModule(db, config, {
    async sendVerification() {}, async sendPasswordReset() {},
  });
  const token = await signAccessToken({
    sub: USER_ID, email: "jwt-claim@example.invalid", displayName: "JWT claim",
    role: "ADMIN", emailVerified: false,
  }, config.jwtAccessSecret);
  const h = await routeHarness(t, { auth, providerBehavior: async (_input, onChunk) => {
    await onChunk("respuesta DB fake"); return "respuesta DB fake";
  } });

  const response = await postChat(h, chatBody(), { cookie: `${ACCESS_COOKIE}=${token}` });
  assert.equal(response.status, 200);
  await response.text();
  assert.deepEqual(metrics, { transactions: 1, userReads: 1, globalReads: 0, commentsReads: 0, writes: 0, inTransaction: false });
});

test("A49 request logs no incluyen mensajes, respuesta, cookies, claves ni cuerpo upstream", async (t) => {
  const privateUser = "private-route-user-message-49";
  const privateAssistant = "private-route-assistant-answer-49";
  const privateUpstream = "private-route-upstream-body-49";
  let invocation = 0;
  const fakeFetch: typeof fetch = async () => new Response(JSON.stringify({ error: privateUpstream }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
  const realPoolProvider: typeof streamChat = (input, onChunk) => {
    invocation += 1;
    if (invocation === 1) return (async () => { await onChunk(privateAssistant); return privateAssistant; })();
    return streamChat({ ...input, fetchImpl: fakeFetch }, onChunk);
  };
  const h = await routeHarness(t, { provider: realPoolProvider });

  const success = await postChat(h, chatBody(TAB_ID, privateUser));
  assert.equal(success.status, 200);
  await success.text();
  const unavailable = await postChat(h, chatBody(OTHER_TAB_ID, privateUser));
  assert.equal(unavailable.status, 503);
  await unavailable.text();
  const allLogs = [...h.logs, ...h.errors].join("\n");
  for (const forbidden of [privateUser, privateAssistant, privateUpstream, ACCESS_TOKEN, CHAT_KEYS.nvidiaApiKey, CHAT_KEYS.openrouterApiKey, CHAT_KEYS.geminiApiKey]) {
    assert.equal(allLogs.includes(forbidden), false, `Los logs no deben contener ${forbidden}`);
  }
});

test("A02 createApp registra /api/chat antes del 404 y fuera del authLimiter", { timeout: 15_000 }, async (t) => {
  t.mock.method(console, "log", () => undefined);
  t.mock.method(console, "error", () => undefined);
  t.mock.method(console, "warn", () => undefined);

  const config: AppConfig = {
    port: 0,
    appOrigin: APP_ORIGIN,
    databaseUrl: "postgresql://fake-role:fake-password@db.example.invalid:5432/fake-blog",
    databaseSsl: false,
    databasePrepare: true,
    databaseMaxConnections: 1,
    jwtAccessSecret: "fake-chat-route-auth-secret-over-thirty-two-chars",
    cookieSecure: false,
    trustProxyHops: 0,
    smtp: { host: "smtp.example.invalid", port: 465, user: "fake@example.invalid", password: "fake-mail", from: "BlogDPC <fake@example.invalid>" },
    google: { clientId: "fake-client", clientSecret: "fake-secret", redirectUri: "https://blog.example.invalid/callback" },
    chat: CHAT_KEYS,
  };
  const db = {} as unknown as Database;
  const mailer: Mailer = { async sendVerification() {}, async sendPasswordReset() {} };
  const app = createApp(config, db, mailer);
  const server = await new Promise<Server>((resolveServer, rejectServer) => {
    const instance = app.listen(0, "127.0.0.1", () => resolveServer(instance));
    instance.once("error", rejectServer);
  });
  t.after(async () => {
    const closed = new Promise<void>((resolveClose) => server.close(() => resolveClose()));
    server.closeAllConnections();
    await closed;
  });

  const { port } = server.address() as AddressInfo;
  const statuses: number[] = [];
  const codes: string[] = [];
  for (let requestNumber = 0; requestNumber < 61; requestNumber += 1) {
    const response = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: "POST",
      headers: { Origin: APP_ORIGIN, "Content-Type": "application/json" },
      body: JSON.stringify(chatBody()),
    });
    statuses.push(response.status);
    codes.push(errorEnvelope(await response.json()).error.code);
  }

  assert.deepEqual(statuses, Array(61).fill(401), "la ruta registrada exige auth sin caer en 404 ni authLimiter");
  assert.deepEqual(codes, Array(61).fill("AUTH_REQUIRED"));
});
