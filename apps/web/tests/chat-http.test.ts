import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, api, apiResponse, onSessionInvalid } from "../src/lib/http.ts";

const CHAT_PATH = "/api/chat";
const REFRESH_PATH = "/api/auth/refresh";
const SSE_HEADERS = { "Content-Type": "text/event-stream; charset=utf-8" };

function unauthorizedResponse(): Response {
  return Response.json({ error: { code: "ACCESS_EXPIRED", message: "La sesión expiró." } }, { status: 401 });
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise; });
  return { promise, resolve };
}

async function usingFetch(fakeFetch: typeof fetch, run: () => Promise<void>): Promise<void> {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = fakeFetch;
  try {
    await run();
  } finally {
    globalThis.fetch = previousFetch;
  }
}

function assertNetworkApiError(error: unknown): true {
  assert.ok(error instanceof ApiError);
  assert.equal(error.status, 0);
  assert.equal(error.code, "NETWORK_ERROR");
  assert.equal(error.isNetwork, true);
  return true;
}

test("apiResponse entrega Response SSE intacta y conserva las opciones HTTP de api", async () => {
  const body = { tabSessionId: "00000000-0000-4000-8000-000000000001", message: "¿Qué significa ISAC?" };
  const signal = new AbortController().signal;
  const sseBody = 'data: {"chunk":"respuesta 📡"}\n\n';
  const response = new Response(sseBody, { status: 200, headers: SSE_HEADERS });
  let requestedPath = "";
  let requestInit: RequestInit | undefined;

  await usingFetch(async (input, init) => {
    requestedPath = String(input);
    requestInit = init;
    return response;
  }, async () => {
    const result = await apiResponse(CHAT_PATH, { method: "POST", body, signal });

    assert.strictEqual(result, response);
    assert.equal(result.bodyUsed, false, "el helper no consume el stream exitoso");
    assert.equal(requestedPath, CHAT_PATH);
    assert.equal(requestInit?.method, "POST");
    assert.equal(requestInit?.credentials, "same-origin");
    assert.equal(requestInit?.body, JSON.stringify(body));
    assert.equal(requestInit?.signal, signal);
    assert.equal(new Headers(requestInit?.headers).get("content-type"), "application/json");
    assert.equal(await result.text(), sseBody, "el consumidor puede leer el stream original");
  });
});

test("A40 chat y api comparten un único refresh concurrente y cada operación reintenta una vez", { timeout: 5_000 }, async () => {
  const refreshStarted = deferred<void>();
  const refreshGate = deferred<Response>();
  const calls: Array<{ path: string; init?: RequestInit }> = [];
  let refreshCalls = 0;
  let chatCalls = 0;
  let commentsCalls = 0;
  let invalidations = 0;
  const unsubscribe = onSessionInvalid(() => { invalidations += 1; });
  const signal = new AbortController().signal;
  const chatBody = { tabSessionId: "00000000-0000-4000-8000-000000000001", message: "Pregunta del chat" };
  let chatRequest: Promise<Response> | undefined;
  let commentsRequest: Promise<{ data: { id: string }; meta?: unknown }> | undefined;

  try {
    await usingFetch(async (input, init) => {
      const path = String(input);
      calls.push({ path, init });
      if (path === REFRESH_PATH) {
        refreshCalls += 1;
        refreshStarted.resolve(undefined);
        return refreshGate.promise;
      }
      if (path === CHAT_PATH) {
        chatCalls += 1;
        return chatCalls === 1
          ? unauthorizedResponse()
          : new Response('data: {"chunk":"respuesta del chat"}\n\n', { status: 200, headers: SSE_HEADERS });
      }
      if (path === "/api/comments") {
        commentsCalls += 1;
        return commentsCalls === 1
          ? unauthorizedResponse()
          : Response.json({ data: { id: "comment-1" } });
      }
      throw new Error(`Fetch inesperado: ${path}`);
    }, async () => {
      chatRequest = apiResponse(CHAT_PATH, { method: "POST", body: chatBody, signal });
      commentsRequest = api<{ id: string }>("/api/comments");

      await refreshStarted.promise;
      await new Promise<void>((resolve) => setImmediate(resolve));
      assert.equal(refreshCalls, 1, "ambos 401 concurrentes deben compartir el refresh en curso");
      refreshGate.resolve(new Response(null, { status: 204 }));

      const [chatResponse, commentsResponse] = await Promise.all([chatRequest, commentsRequest]);
      assert.equal(chatCalls, 2, "el POST de chat se reintenta una sola vez");
      assert.equal(commentsCalls, 2, "api conserva un único retry JSON");
      assert.equal(refreshCalls, 1);
      assert.equal(commentsResponse.data.id, "comment-1");
      assert.equal(chatResponse.bodyUsed, false);
      assert.equal(await chatResponse.text(), 'data: {"chunk":"respuesta del chat"}\n\n');
      assert.equal(invalidations, 0, "el refresh exitoso no invalida la sesión");

      const chatAttempts = calls.filter((call) => call.path === CHAT_PATH);
      assert.equal(chatAttempts.length, 2);
      for (const attempt of chatAttempts) {
        assert.equal(attempt.init?.method, "POST");
        assert.equal(attempt.init?.credentials, "same-origin");
        assert.equal(attempt.init?.body, JSON.stringify(chatBody));
        assert.equal(attempt.init?.signal, signal);
      }
    });
  } finally {
    refreshGate.resolve(new Response(null, { status: 204 }));
    if (chatRequest || commentsRequest) {
      await Promise.allSettled([chatRequest, commentsRequest].filter(Boolean) as Promise<unknown>[]);
    }
    unsubscribe();
  }
});

test("A41 un segundo 401 es terminal, no abre otro refresh y notifica al listener compartido", async () => {
  let chatCalls = 0;
  let refreshCalls = 0;
  let invalidations = 0;
  const unsubscribe = onSessionInvalid(() => { invalidations += 1; });

  try {
    await usingFetch(async (input) => {
      const path = String(input);
      if (path === REFRESH_PATH) {
        refreshCalls += 1;
        return new Response(null, { status: 204 });
      }
      if (path === CHAT_PATH) {
        chatCalls += 1;
        return unauthorizedResponse();
      }
      throw new Error(`Fetch inesperado: ${path}`);
    }, async () => {
      await assert.rejects(apiResponse(CHAT_PATH, { method: "POST", body: { message: "reintento único" } }), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 401);
        assert.equal(error.code, "ACCESS_EXPIRED");
        return true;
      });
      assert.equal(chatCalls, 2, "solicitud original más un retry, sin bucle");
      assert.equal(refreshCalls, 1, "el segundo 401 no renueva otra vez");
      assert.equal(invalidations, 1, "el 401 terminal notifica una vez");
    });
  } finally {
    unsubscribe();
  }
});

test("A41 refresh de red, 429 o 5xx es no verificable: no logout ni retry del POST", async () => {
  const refreshFailures: Array<{ label: string; respond(): Promise<Response> }> = [
    { label: "red", async respond() { throw new TypeError("refresh offline"); } },
    { label: "429", async respond() { return new Response(null, { status: 429 }); } },
    { label: "5xx", async respond() { return new Response(null, { status: 503 }); } },
  ];

  for (const scenario of refreshFailures) {
    let postCalls = 0;
    let refreshCalls = 0;
    let invalidations = 0;
    const unsubscribe = onSessionInvalid(() => { invalidations += 1; });
    try {
      await usingFetch(async (input) => {
        const path = String(input);
        if (path === REFRESH_PATH) {
          refreshCalls += 1;
          return scenario.respond();
        }
        if (path === CHAT_PATH) {
          postCalls += 1;
          return unauthorizedResponse();
        }
        throw new Error(`Fetch inesperado: ${path}`);
      }, async () => {
        await assert.rejects(apiResponse(CHAT_PATH, { method: "POST", body: { message: scenario.label } }), assertNetworkApiError);
      });
      assert.equal(postCalls, 1, `${scenario.label}: el POST no se reintenta`);
      assert.equal(refreshCalls, 1, `${scenario.label}: una sola renovación`);
      assert.equal(invalidations, 0, `${scenario.label}: no se destruye/invalida la sesión local`);
    } finally {
      unsubscribe();
    }
  }
});

test("A41 un fallo de red inicial no reintenta ni renueva; errores/EOF SSE tras 200 siguen en manos del consumidor", async () => {
  const errorEvent = 'event: error\ndata: {"error":{"code":"CHAT_STREAM_INTERRUPTED"}}\n\n';
  const incompleteEvent = 'data: {"chunk":"fragmento parcial"}\n\n';
  const brokenStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(incompleteEvent));
      controller.error(new TypeError("respuesta interrumpida"));
    },
  });
  let calls = 0;
  let invalidations = 0;
  const paths: string[] = [];
  const unsubscribe = onSessionInvalid(() => { invalidations += 1; });

  try {
    await usingFetch(async (input) => {
      calls += 1;
      const path = String(input);
      paths.push(path);
      if (calls === 1) throw new TypeError("red caída antes de respuesta");
      if (calls === 2) return new Response(errorEvent, { status: 200, headers: SSE_HEADERS });
      if (calls === 3) return new Response(incompleteEvent, { status: 200, headers: SSE_HEADERS });
      if (calls === 4) return new Response(brokenStream, { status: 200, headers: SSE_HEADERS });
      throw new Error("No debe haber replay");
    }, async () => {
      await assert.rejects(apiResponse(CHAT_PATH, { method: "POST", body: { message: "red" } }), assertNetworkApiError);
      assert.equal(calls, 1, "el fallo de red pre-respuesta no se reintenta");

      const errorResponse = await apiResponse(CHAT_PATH);
      assert.equal(errorResponse.bodyUsed, false);
      assert.equal(await errorResponse.text(), errorEvent, "el helper no interpreta ni reintenta un event:error SSE");

      const eofResponse = await apiResponse(CHAT_PATH);
      assert.equal(await eofResponse.text(), incompleteEvent, "EOF sin DONE queda visible para el parser SSE, sin replay");

      const partialResponse = await apiResponse(CHAT_PATH);
      assert.equal(partialResponse.bodyUsed, false);
      await assert.rejects(partialResponse.text(), TypeError, "el error al consumir el body lo maneja el caller");
      assert.equal(calls, 4, "no hay retries tras respuestas HTTP 200, ni siquiera al fallar el body");
      assert.deepEqual(paths, Array(4).fill(CHAT_PATH), "ningún fallo inicia refresh");
      assert.equal(invalidations, 0);
    });
  } finally {
    unsubscribe();
  }
});

test("apiResponse conserva fieldErrors y retryAfterSeconds en ApiError", async () => {
  const payload = {
    error: {
      code: "CHAT_RATE_LIMITED",
      message: "Espera antes de enviar otro mensaje.",
      fieldErrors: { message: ["El mensaje excede el límite."] },
      retryAfterSeconds: 37,
    },
  };
  let calls = 0;

  await usingFetch(async () => {
    calls += 1;
    return Response.json(payload, { status: 429 });
  }, async () => {
    await assert.rejects(apiResponse(CHAT_PATH, { method: "POST", body: { message: "x" } }), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 429);
      assert.equal(error.code, "CHAT_RATE_LIMITED");
      assert.equal(error.message, "Espera antes de enviar otro mensaje.");
      assert.deepEqual(error.fieldErrors, { message: ["El mensaje excede el límite."] });
      assert.equal(error.retryAfterSeconds, 37);
      return true;
    });
    assert.equal(calls, 1, "429 de negocio no inicia refresh ni replay");
  });
});

test("api conserva la respuesta JSON y el comportamiento exitoso 204", async () => {
  let calls = 0;
  await usingFetch(async (_input, init) => {
    calls += 1;
    assert.equal(init?.credentials, "same-origin");
    return new Response(null, { status: 204 });
  }, async () => {
    const result = await api<void>("/api/auth/logout", { method: "POST" });
    assert.deepEqual(result, { data: undefined });
    assert.equal(calls, 1);
  });
});
