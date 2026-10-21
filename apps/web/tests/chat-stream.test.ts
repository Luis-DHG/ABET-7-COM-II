import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeChatStream } from "../src/chat/stream.ts";

const INTERRUPTED_MESSAGE = "La respuesta se interrumpió. Intenta de nuevo.";
const SSE_CONTENT_TYPE = "text/event-stream; charset=utf-8";

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise; });
  return { promise, resolve };
}

function responseWithStream(
  text: string,
  options: { close?: boolean; status?: number; contentType?: string | null; splitBytes?: boolean } = {},
) {
  const bytes = new TextEncoder().encode(text);
  let cancelCalls = 0;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      if (options.splitBytes) {
        for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
      } else if (bytes.length > 0) {
        controller.enqueue(bytes);
      }
      if (options.close) controller.close();
    },
    cancel() { cancelCalls += 1; },
  });
  const contentType = options.contentType === undefined ? SSE_CONTENT_TYPE : options.contentType;
  const headers = contentType === null ? undefined : { "Content-Type": contentType };
  const response = new Response(body, { status: options.status ?? 200, headers });
  return { response, cancelCalls: () => cancelCalls };
}

async function assertInterrupted(promise: Promise<unknown>): Promise<void> {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.equal(error.message, INTERRUPTED_MESSAGE, "el error controlado no revela el cuerpo recibido");
    return true;
  });
}

let unexpectedFetchCalls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  unexpectedFetchCalls += 1;
  throw new Error("El parser SSE no debe iniciar solicitudes HTTP");
};
test.after(() => {
  globalThis.fetch = originalFetch;
  assert.equal(unexpectedFetchCalls, 0, "consumeChatStream solo procesa el Response recibido");
});

test("A42 reconstruye UTF-8 byte a byte, LF/CRLF, data multilinea y eventos agrupados", async () => {
  const wire = [
    ": keep-alive\r\n",
    "id: upstream-17\r\n",
    "retry: 2500\r\n",
    "event: message\r\n",
    'data: {"chunk":\r\n',
    'data: "Hola 📡"}\r\n',
    "\r\n",
    'data: {"chunk":""}\n\n',
    'data: {"chunk":" + mundo"}\n\n',
    "data: [DONE]\n\n",
  ].join("");
  const stream = responseWithStream(wire, { splitBytes: true });
  const chunks: string[] = [];

  const result = await consumeChatStream(stream.response, (chunk) => { chunks.push(chunk); });

  assert.deepEqual(chunks, ["Hola 📡", " + mundo"], "ignora comentarios/metadatos y el chunk vacío");
  assert.equal(result, "Hola 📡 + mundo");
  assert.equal(stream.cancelCalls(), 1, "DONE cancela el reader incluso si la fuente queda abierta");
  assert.equal(stream.response.body?.locked, false, "DONE libera el lock del reader");
});

test("chunk vacío no cuenta como contenido y DONE sin contenido es inválido", async () => {
  const stream = responseWithStream('data: {"chunk":""}\n\ndata: [DONE]\n\n');
  const received: string[] = [];

  await assertInterrupted(consumeChatStream(stream.response, (chunk) => { received.push(chunk); }));

  assert.deepEqual(received, []);
  assert.equal(stream.cancelCalls(), 1);
  assert.equal(stream.response.body?.locked, false);
});

test("A43 rechaza status no exitoso, body nulo y Content-Type que no sea SSE", async () => {
  const notOk = responseWithStream("cuerpo upstream privado", { status: 503 });
  const noBody = new Response(null, { status: 200, headers: { "Content-Type": SSE_CONTENT_TYPE } });
  const wrongType = responseWithStream("no es SSE", { contentType: "application/json" });

  for (const [label, response] of [
    ["status no exitoso", notOk.response],
    ["body nulo", noBody],
    ["Content-Type incorrecto", wrongType.response],
  ] as const) {
    await assertInterrupted(consumeChatStream(response, () => undefined));
    assert.ok(response.body === null || response.body.locked === false, `${label}: no retiene el body`);
  }
});

test("evento error válido se convierte al mensaje fijo y no propaga mensaje ni cuerpo privado", async () => {
  const privateMessage = "token upstream privado que no debe filtrarse";
  const payload = {
    error: { code: "CHAT_STREAM_INTERRUPTED", message: privateMessage },
    requestId: "request-123",
  };
  const stream = responseWithStream(`event: error\ndata: ${JSON.stringify(payload)}\n\n`);
  const received: string[] = [];

  await assertInterrupted(consumeChatStream(stream.response, (chunk) => { received.push(chunk); }));

  assert.deepEqual(received, []);
  assert.equal(stream.cancelCalls(), 1, "el error SSE cancela el reader");
  assert.equal(stream.response.body?.locked, false, "el error SSE libera el reader");
});

test("A43 eventos de negocio malformados fallan de forma controlada y liberan el reader", async () => {
  const invalidEvents: Array<[string, string]> = [
    ["JSON malformado", "data: {no-json}\n\n"],
    ["payload no objeto", "data: []\n\n"],
    ["chunk ausente", "data: {}\n\n"],
    ["chunk no textual", 'data: {"chunk":17}\n\n'],
    ["error sin requestId string", `event: error\ndata: ${JSON.stringify({ error: { code: "CHAT_STREAM_INTERRUPTED", message: "privado" }, requestId: 17 })}\n\n`],
  ];

  for (const [label, wire] of invalidEvents) {
    const stream = responseWithStream(wire);
    const received: string[] = [];
    await assertInterrupted(consumeChatStream(stream.response, (chunk) => { received.push(chunk); }));
    assert.deepEqual(received, [], `${label}: no entrega contenido inválido`);
    assert.equal(stream.cancelCalls(), 1, `${label}: cancela el reader`);
    assert.equal(stream.response.body?.locked, false, `${label}: libera el reader`);
  }
});

test("EOF sin DONE falla controladamente tras entregar el contenido parcial y libera el reader", async () => {
  const stream = responseWithStream('data: {"chunk":"parcial"}\n\n', { close: true });
  const received: string[] = [];

  await assertInterrupted(consumeChatStream(stream.response, (chunk) => { received.push(chunk); }));

  assert.deepEqual(received, ["parcial"]);
  assert.equal(stream.response.body?.locked, false);
});

test("el callback asíncrono aplica backpressure y mantiene el orden de los chunks", { timeout: 5_000 }, async () => {
  const wire = 'data: {"chunk":"uno"}\n\ndata: {"chunk":"dos"}\n\ndata: [DONE]\n\n';
  const stream = responseWithStream(wire);
  const callbackStarted = deferred<void>();
  const releaseCallback = deferred<void>();
  const received: string[] = [];
  let pending: Promise<string> | undefined;

  try {
    pending = consumeChatStream(stream.response, async (chunk) => {
      received.push(chunk);
      if (chunk === "uno") {
        callbackStarted.resolve(undefined);
        await releaseCallback.promise;
      }
    });
    await callbackStarted.promise;
    assert.deepEqual(received, ["uno"], "no procesa el siguiente evento mientras el callback está pendiente");
    releaseCallback.resolve(undefined);
    assert.equal(await pending, "unodos");
    assert.deepEqual(received, ["uno", "dos"]);
    assert.equal(stream.cancelCalls(), 1);
    assert.equal(stream.response.body?.locked, false);
  } finally {
    releaseCallback.resolve(undefined);
    if (pending) await Promise.allSettled([pending]);
  }
});

test("AbortSignal cancela un read pendiente y libera reader y stream", { timeout: 5_000 }, async () => {
  const pullStarted = deferred<void>();
  let cancelCalls = 0;
  let finishPull: (() => void) | undefined;
  const body = new ReadableStream<Uint8Array>({
    pull() {
      pullStarted.resolve(undefined);
      return new Promise<void>((resolve) => { finishPull = resolve; });
    },
    cancel() {
      cancelCalls += 1;
      finishPull?.();
    },
  });
  const response = new Response(body, { status: 200, headers: { "Content-Type": SSE_CONTENT_TYPE } });
  const controller = new AbortController();
  const pending = consumeChatStream(response, () => undefined, controller.signal);

  await pullStarted.promise;
  controller.abort(new Error("razón privada de aborto"));
  await assert.rejects(pending, (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.doesNotMatch(error.message, /razón privada de aborto/u);
    return true;
  });

  assert.equal(cancelCalls, 1);
  assert.equal(response.body?.locked, false);
});
