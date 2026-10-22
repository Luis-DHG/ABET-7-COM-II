import assert from "node:assert/strict";
import { getEventListeners } from "node:events";
import { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import test, { type TestContext } from "node:test";
import nodeTimers from "node:timers";
import { inspect } from "node:util";
import type { ChatMessage } from "./module.js";

// API acordada de 2.1, solo tipos. No hay pool, SDK ni sustituto del provider.
type AttemptInput = {
  model: string;
  endpoint: string;
  apiKey: string;
  messages: Array<{ role: string; content: string }>;
  ttfbMs: number;
  externalSignal?: AbortSignal;
  maxTokens?: number;
  chatTemplateKwargs?: Record<string, unknown>;
};
type OnChunk = (chunk: string) => void | Promise<void>;
type StreamChatAttempt = (
  input: AttemptInput,
  onChunk: OnChunk,
  fetchImpl?: typeof globalThis.fetch,
) => Promise<string>;

// API acordada de 2.2. El import de producción sigue siendo computado.
type PoolInput = {
  messages: ChatMessage[];
  nvidiaApiKey: string;
  openrouterApiKey: string;
  geminiApiKey: string;
  externalSignal?: AbortSignal;
  fetchImpl?: typeof globalThis.fetch;
};
type StreamChat = (input: PoolInput, onChunk: OnChunk) => Promise<string>;

const API_KEY = "fake-api-key-never-in-errors";
const RAW = "raw-upstream-private-text";
const OUTPUT = "private-assistant-output";
const SSE_TYPE = "text/event-stream; charset=utf-8";
const encoder = new TextEncoder();
const PRIVATE_TEXTS = [API_KEY, RAW, OUTPUT, "private-system-prompt", "private-user-message", "private-history-answer"];

function input(externalSignal?: AbortSignal): AttemptInput {
  return {
    model: "fake-single-attempt-model",
    endpoint: "https://provider.example.invalid/v1/chat/completions",
    apiKey: API_KEY,
    messages: [
      { role: "system", content: "private-system-prompt: `ISAC` y $\\tau$" },
      { role: "user", content: "Pregunta previa" },
      { role: "assistant", content: "private-history-answer" },
      { role: "user", content: "private-user-message" },
    ],
    ttfbMs: 4000,
    ...(externalSignal ? { externalSignal } : {}),
  };
}

function event(value: unknown, eol = "\n"): string {
  return `data: ${JSON.stringify(value)}${eol}${eol}`;
}

function content(text: string, finishReason: string | null = null): string {
  return event({ choices: [{ delta: { content: text }, finish_reason: finishReason }] });
}

function done(eol = "\n"): string {
  return `data: [DONE]${eol}${eol}`;
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise; });
  return { promise, resolve };
}

// Solo microtareas, sin sleeps, polling de reloj real ni I/O. El límite convierte
// un bloqueo en un fallo de aserción en vez de dejar un test pendiente indefinido.
async function drainUntil(condition: () => boolean, message: string): Promise<void> {
  for (let step = 0; step < 10_000 && !condition(); step += 1) await Promise.resolve();
  assert.ok(condition(), message);
}

type Outcome = { kind: "fulfilled"; value: string } | { kind: "rejected"; error: unknown };
function track(promise: Promise<string>) {
  const state: { outcome?: Outcome } = {};
  // El handler de rechazo se instala inmediatamente, también en pruebas de abort.
  void promise.then(
    (value) => { state.outcome = { kind: "fulfilled", value }; },
    (error: unknown) => { state.outcome = { kind: "rejected", error }; },
  );
  return state;
}
type Job = ReturnType<typeof track>;

async function fulfilled(job: Job): Promise<string> {
  await drainUntil(() => Boolean(job.outcome), "El intento debe finalizar sin esperas reales");
  const outcome = job.outcome!;
  assert.equal(outcome.kind, "fulfilled", "El protocolo válido debe resolver el intento");
  return outcome.value;
}

async function rejectedSanitized(job: Job): Promise<void> {
  await drainUntil(() => Boolean(job.outcome), "El fallo debe rechazar el intento y liberar la lectura pendiente");
  assert.equal(job.outcome!.kind, "rejected", "Un fallo no puede devolver éxito ni texto parcial");
  const error = job.outcome!.error;
  assert.ok(error instanceof Error);
  assert.ok(error.message.length > 0, "Debe existir un mensaje genérico, no un error vacío");
  // Incluye stack, cause y propiedades: ocultar el RAW solo en .message no basta.
  const rendered = inspect(error, { depth: null });
  for (const secret of PRIVATE_TEXTS) {
    assert.equal(rendered.includes(secret), false, "El error no debe contener claves ni textos privados");
  }
}

type TimerObservation = { delay: number | undefined; firings(): number; cleared(): boolean };
function observeTimers(t: TestContext): TimerObservation[] {
  const observed: TimerObservation[] = [];
  const cleared = new Set<Parameters<typeof clearTimeout>[0]>();
  const boundaries: Array<Pick<typeof globalThis, "setTimeout" | "setInterval" | "clearTimeout" | "clearInterval">> = [globalThis, nodeTimers];
  for (const boundary of boundaries) {
    for (const kind of ["clearTimeout", "clearInterval"] as const) {
      const cancel = boundary[kind];
      t.mock.method(boundary, kind, (handle: Parameters<typeof clearTimeout>[0]) => {
        cleared.add(handle);
        return cancel(handle);
      });
    }
    for (const kind of ["setTimeout", "setInterval"] as const) {
      const schedule = boundary[kind];
      t.mock.method(boundary, kind, (...args: Parameters<typeof setTimeout>) => {
        const [callback, delay, ...callbackArgs] = args;
        const fire = t.mock.fn(callback);
        const handle = schedule(fire, delay, ...callbackArgs);
        observed.push({ delay, firings: () => fire.mock.callCount(), cleared: () => cleared.has(handle) });
        return handle;
      });
    }
  }
  syncBuiltinESMExports();
  return observed;
}

function controlledBody(t: TestContext, onCancel?: () => void | Promise<void>) {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let terminal = false;
  let pulls = 0;
  const cancel = t.mock.fn((_reason?: unknown) => { terminal = true; return onCancel?.(); });
  const stream = new ReadableStream<Uint8Array>({
    start(value) { controller = value; },
    pull() { pulls += 1; },
    cancel,
  }, { highWaterMark: 0 });
  return {
    stream,
    cancel,
    pulls: () => pulls,
    isTerminal: () => terminal,
    push(text: string) { controller.enqueue(encoder.encode(text)); },
    bytes(bytes: Uint8Array) { controller.enqueue(bytes); },
    close() {
      if (!terminal) { terminal = true; controller.close(); }
    },
    error(error: Error) {
      if (!terminal) { terminal = true; controller.error(error); }
    },
  };
}
type Body = ReturnType<typeof controlledBody>;
type FetchCall = { request: Request; signal: AbortSignal | null | undefined; at: number };
function fakeFetch(answer: Response | ((signal: AbortSignal | null | undefined) => Response | Promise<Response>)) {
  const calls: FetchCall[] = [];
  const impl = (async (resource: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const request = new Request(resource, init);
    const signal = init?.signal ?? (resource instanceof Request ? resource.signal : undefined);
    calls.push({ request, signal, at: Date.now() });
    return typeof answer === "function" ? await answer(signal) : answer;
  }) as typeof globalThis.fetch;
  return { impl, calls };
}
type FakeFetch = ReturnType<typeof fakeFetch>;

function onlyCall(fetch: FakeFetch): FetchCall & { signal: AbortSignal } {
  assert.equal(fetch.calls.length, 1, "Este seam realiza un solo intento, sin retries ni pool");
  const call = fetch.calls[0]!;
  assert.ok(call.signal instanceof AbortSignal, "fetch debe recibir la señal propia del intento");
  return { ...call, signal: call.signal };
}

function pendingHeaders(signal: AbortSignal | null | undefined): Promise<Response> {
  assert.ok(signal instanceof AbortSignal);
  return new Promise<Response>((_resolve, reject) => {
    const abort = () => reject(new Error(`${RAW} ${API_KEY}`));
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
}

async function fixture(t: TestContext) {
  t.mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"], now: 0 });
  const bodies: Body[] = [];
  const gates: Array<ReturnType<typeof deferred<void>>> = [];
  const jobs: Job[] = [];
  const external = new AbortController();
  t.after(async () => {
    try {
      external.abort();
      for (const gate of gates) gate.resolve();
      for (const body of bodies) body.close();
      for (let step = 0; step < 1000 && jobs.some((job) => !job.outcome); step += 1) await Promise.resolve();
    } finally {
      t.mock.restoreAll();
      t.mock.timers.reset();
      syncBuiltinESMExports();
    }
  });
  const timers = observeTimers(t);
  // Protección independiente del fake inyectado: jamás puede salir una petición real.
  t.mock.method(globalThis, "fetch", async () => { assert.fail("Red prohibida: usa el fetch falso del test"); });
  const { streamChatAttempt, streamChat } = await import(new URL("./provider.js", import.meta.url).href) as {
    streamChatAttempt: StreamChatAttempt;
    streamChat?: StreamChat;
  };
  const data = input(external.signal);
  const chunks: string[] = [];
  const observe = (promise: Promise<string>) => {
    const job = track(promise);
    jobs.push(job);
    return job;
  };
  return {
    attempt: streamChatAttempt,
    poolCandidate: streamChat,
    input: data,
    chunks,
    external,
    timers,
    track: observe,
    run(fetch: FakeFetch, onChunk: OnChunk = (chunk) => { chunks.push(chunk); }, options = data) {
      return observe(streamChatAttempt(options, onChunk, fetch.impl));
    },
    body(onCancel?: () => void | Promise<void>) {
      const body = controlledBody(t, onCancel);
      bodies.push(body);
      return body;
    },
    gate() {
      const gate = deferred<void>();
      gates.push(gate);
      return gate;
    },
    clean() {
      for (const body of bodies) {
        assert.equal(body.stream.locked, false, "El intento debe liberar el lock del reader");
        assert.equal(body.isTerminal(), true, "Un body abierto debe cancelarse al terminar");
      }
      assert.equal(getEventListeners(external.signal, "abort").length, 0, "No dejar listeners de abort externos");
      const before = timers.map((timer) => timer.firings());
      t.mock.timers.tick(10_000_000);
      assert.deepEqual(timers.map((timer) => timer.firings()), before, "No dejar callbacks de timers vivos");
    },
  };
}

function response(body: Body, status = 200, contentType: string | null = SSE_TYPE): Response {
  return new Response(body.stream, { status, headers: contentType ? { "Content-Type": contentType } : {} });
}

test("intento envía POST OpenAI exacto y Bearer; devuelve concatenación y callback solo de delta.content", async (t) => {
  const f = await fixture(t);
  const body = f.body();
  const fetch = fakeFetch(response(body));
  const original = structuredClone(f.input.messages);
  const job = f.run(fetch);
  await drainUntil(() => body.stream.locked, "Debe adquirir el reader sin esperar a todo el body");
  const call = onlyCall(fetch);
  assert.equal(call.request.url, f.input.endpoint);
  assert.equal(call.request.method, "POST");
  assert.equal(call.request.headers.get("Content-Type"), "application/json");
  assert.equal(call.request.headers.get("Authorization"), `Bearer ${API_KEY}`);
  assert.equal(call.request.headers.get("Cookie"), null);
  assert.notEqual(call.signal, f.external.signal);
  assert.deepEqual(await call.request.json(), {
    model: "fake-single-attempt-model", messages: original, stream: true, max_tokens: 700,
  });
  body.push(event({ choices: [{ delta: { role: "assistant", reasoning_content: RAW, tool_calls: [{ id: RAW }] } }] })
    + content("Señal ") + content("📡") + done() + content("No emitir después de DONE"));
  assert.equal(await fulfilled(job), "Señal 📡");
  assert.deepEqual(f.chunks, ["Señal ", "📡"]);
  assert.deepEqual(f.input.messages, original);
  assert.equal(body.cancel.mock.callCount(), 1);
  f.clean();
});

test("sin externalSignal y con tercer argumento omitido usa fetch global falso, nunca la red", async (t) => {
  const f = await fixture(t);
  const body = f.body();
  const fetch = fakeFetch(response(body));
  t.mock.method(globalThis, "fetch", fetch.impl);
  const job = f.track(f.attempt(input(), (chunk) => { f.chunks.push(chunk); }));
  body.push(content("Texto") + done());
  assert.equal(await fulfilled(job), "Texto");
  onlyCall(fetch);
  assert.deepEqual(f.chunks, ["Texto"]);
  f.clean();
});

for (const eol of ["\n", "\r\n"]) {
  for (const fragmentation of ["agrupado", "byte a byte"] as const) {
    test(`SSE ${eol === "\n" ? "LF" : "CRLF"} ${fragmentation}: UTF-8, comentarios y data multilínea intactos`, async (t) => {
      const f = await fixture(t);
      const body = f.body();
      const fetch = fakeFetch(response(body));
      const job = f.run(fetch);
      const wire = `: comentario 📡${eol}${eol}event: message${eol}id: ignorado${eol}`
        + `data: {"choices":[${eol}data: {"delta":{"content":"Señal 📡 α"}}]}${eol}${eol}`
        + event({ choices: [{ delta: { content: " y $\\tau$\nfin" } }] }, eol) + done(eol);
      const bytes = encoder.encode(wire);
      if (fragmentation === "agrupado") body.bytes(bytes);
      else for (const byte of bytes) body.bytes(Uint8Array.of(byte));
      assert.equal(await fulfilled(job), "Señal 📡 α y $\\tau$\nfin");
      assert.deepEqual(f.chunks, ["Señal 📡 α", " y $\\tau$\nfin"]);
      onlyCall(fetch);
      f.clean();
    });
  }
}

for (const finishReason of ["stop", "length"]) {
  test(`finish_reason ${finishReason} es metadata: no completa hasta DONE ni invalida el éxito`, async (t) => {
    const f = await fixture(t);
    const body = f.body();
    const fetch = fakeFetch(response(body));
    const job = f.run(fetch);
    body.push(content("Respuesta", finishReason));
    await drainUntil(() => f.chunks.length === 1 && body.pulls() > 0, "Debe seguir leyendo tras finish_reason");
    assert.equal(job.outcome, undefined);
    body.push(done());
    assert.equal(await fulfilled(job), "Respuesta");
    onlyCall(fetch);
    f.clean();
  });
}

test("onChunk async aplica backpressure; el primer contenido cancela TTFB antes de esperar al callback", async (t) => {
  const f = await fixture(t);
  const body = f.body();
  const gate = f.gate();
  const fetch = fakeFetch(response(body));
  const job = f.run(fetch, async (chunk) => {
    f.chunks.push(chunk);
    if (f.chunks.length === 1) await gate.promise;
  });
  body.push(content("Primero") + content("Segundo") + done());
  await drainUntil(() => f.chunks.length > 0, "Debe invocar el primer callback");
  // Dar oportunidades de microtarea a una implementación que olvidara await.
  for (let step = 0; step < 100; step += 1) await Promise.resolve();
  assert.deepEqual(f.chunks, ["Primero"]);
  assert.equal(job.outcome, undefined);
  t.mock.timers.tick(1_000_000);
  assert.equal(onlyCall(fetch).signal.aborted, false);
  assert.ok(f.timers.every((timer) => timer.firings() === 0));
  gate.resolve();
  assert.equal(await fulfilled(job), "PrimeroSegundo");
  assert.deepEqual(f.chunks, ["Primero", "Segundo"]);
  f.clean();
});

for (const ttfbMs of [15000, 20000]) {
  test(`TTFB ${ttfbMs} ms: headers, rol, keep-alive, tools y vacío no evitan abort en el plazo exacto`, async (t) => {
    const f = await fixture(t);
    const body = f.body();
    const fetch = fakeFetch(response(body));
    const job = f.run(fetch, undefined, { ...f.input, ttfbMs });
    await drainUntil(() => body.pulls() > 0, "Debe esperar el primer contenido");
    body.push(": keep-alive\r\n\r\n"
      + event({ choices: [{ delta: { role: "assistant" } }] })
      + event({ choices: [{ delta: { tool_calls: [{ id: RAW }] } }] })
      + event({ choices: [{ delta: { content: null } }], usage: { total_tokens: 1 } })
      + content(""));
    await drainUntil(() => body.pulls() >= 2, "Debe consumir metadata y volver a esperar contenido");
    const call = onlyCall(fetch);
    assert.equal(call.at, 0);
    t.mock.timers.tick(ttfbMs - 1);
    assert.equal(call.signal.aborted, false);
    assert.equal(job.outcome, undefined);
    assert.deepEqual(f.chunks, []);
    t.mock.timers.tick(1);
    assert.equal(call.signal.aborted, true, "Se aborta al alcanzar el deadline, no un ms después");
    await rejectedSanitized(job);
    assert.equal(body.cancel.mock.callCount(), 1);
    assert.deepEqual(f.chunks, []);
    f.clean();
  });
}

test("reasoning_content detiene TTFB pero no se emite a onChunk ni se incluye en la respuesta final", async (t) => {
  const f = await fixture(t);
  const body = f.body();
  const fetch = fakeFetch(response(body));
  const job = f.run(fetch, undefined, { ...f.input, ttfbMs: 5000 });
  await drainUntil(() => body.pulls() > 0, "Debe esperar el primer contenido");
  body.push(event({ choices: [{ delta: { reasoning_content: "Pensando..." } }] }));
  body.push(event({ choices: [{ delta: { reasoning: "Más razonamiento..." } }] }));
  await drainUntil(() => body.pulls() >= 2, "Debe consumir razonamiento");
  t.mock.timers.tick(10000);
  assert.equal(onlyCall(fetch).signal.aborted, false);
  assert.deepEqual(f.chunks, []);
  assert.equal(job.outcome, undefined);
  body.push(content("Respuesta final") + done());
  assert.equal(await fulfilled(job), "Respuesta final");
  assert.deepEqual(f.chunks, ["Respuesta final"]);
  f.clean();
});

test("TTFB empieza antes de fetch: también aborta si no llegan headers", async (t) => {
  const f = await fixture(t);
  const fetch = fakeFetch(pendingHeaders);
  const job = f.run(fetch);
  await drainUntil(() => fetch.calls.length === 1, "Debe iniciar fetch");
  const call = onlyCall(fetch);
  t.mock.timers.tick(f.input.ttfbMs - 1);
  assert.equal(call.signal.aborted, false);
  assert.equal(job.outcome, undefined);
  t.mock.timers.tick(1);
  assert.equal(call.signal.aborted, true);
  await rejectedSanitized(job);
  assert.deepEqual(f.chunks, []);
  f.clean();
});

for (const first of ["Contenido", " "]) {
  test(`primer string no vacío ${first === " " ? "de espacio" : "normal"} antes del plazo cancela TTFB; no hay timeout total ni entre chunks`, async (t) => {
    const f = await fixture(t);
    const body = f.body();
    const fetch = fakeFetch(response(body));
    const job = f.run(fetch);
    await drainUntil(() => body.pulls() > 0, "Debe leer el body");
    t.mock.timers.tick(f.input.ttfbMs - 1);
    body.push(content(first));
    await drainUntil(() => f.chunks.length === 1, "Un espacio también es contenido no vacío");
    const registered = f.timers.length;
    assert.ok(registered > 0, "Debe existir el deadline previo al primer contenido");
    t.mock.timers.tick(1_000_000);
    assert.equal(onlyCall(fetch).signal.aborted, false);
    assert.equal(job.outcome, undefined);
    assert.ok(f.timers.every((timer) => timer.firings() === 0));
    body.push(content("Final"));
    await drainUntil(() => f.chunks.length === 2, "Debe continuar sin timeout entre chunks");
    assert.equal(f.timers.length, registered, "No introducir timers tras el primer contenido");
    t.mock.timers.tick(1_000_000);
    assert.equal(onlyCall(fetch).signal.aborted, false);
    body.push(done());
    assert.equal(await fulfilled(job), `${first}Final`);
    f.clean();
  });
}

for (const status of [400, 401, 403, 429, 500, 503]) {
  test(`HTTP ${status} rechaza sanitizado, cancela body y timer y no reintenta`, async (t) => {
    const f = await fixture(t);
    const body = f.body();
    body.push(`${RAW} ${API_KEY} private-user-message`);
    const fetch = fakeFetch(response(body, status));
    const job = f.run(fetch);
    await rejectedSanitized(job);
    onlyCall(fetch);
    assert.deepEqual(f.chunks, []);
    assert.equal(body.cancel.mock.callCount(), 1);
    f.clean();
  });
}

for (const contentType of ["application/json", "text/html", null]) {
  test(`HTTP 200 con Content-Type ${contentType ?? "ausente"} no es SSE válido y rechaza sin filtrar RAW`, async (t) => {
    const f = await fixture(t);
    const body = f.body();
    body.push(JSON.stringify({ error: { message: `${RAW} ${API_KEY}` } }));
    const fetch = fakeFetch(response(body, 200, contentType));
    const job = f.run(fetch);
    await rejectedSanitized(job);
    onlyCall(fetch);
    assert.deepEqual(f.chunks, []);
    f.clean();
  });
}

test("HTTP 200 SSE sin body rechaza sanitizado y limpia el timer", async (t) => {
  const f = await fixture(t);
  const fetch = fakeFetch(new Response(null, { headers: { "Content-Type": SSE_TYPE } }));
  const job = f.run(fetch);
  await rejectedSanitized(job);
  onlyCall(fetch);
  assert.deepEqual(f.chunks, []);
  f.clean();
});

const invalidStreams = [
  { name: "JSON malformado antes del contenido", wire: `data: {"raw":"${RAW}","key":"${API_KEY}",\n\n`, close: false, chunks: [] },
  { name: "JSON malformado tras contenido", wire: content(OUTPUT) + `data: {${RAW}\n\n`, close: false, chunks: [OUTPUT] },
  { name: "error upstream dentro de HTTP 200", wire: event({ error: { message: `${RAW} ${API_KEY} private-user-message` } }), close: false, chunks: [] },
  { name: "error upstream tras contenido dentro de HTTP 200", wire: content(OUTPUT) + event({ error: { message: `${RAW} ${API_KEY}` } }), close: false, chunks: [OUTPUT] },
  { name: "evento error SSE dentro de HTTP 200", wire: `event: error\n${event({ error: { message: RAW } })}`, close: false, chunks: [] },
  { name: "DONE sin contenido", wire: ": keep-alive\n\n" + content("") + done(), close: false, chunks: [] },
  { name: "EOF sin contenido", wire: "", close: true, chunks: [] },
  { name: "EOF tras contenido sin DONE", wire: content(OUTPUT), close: true, chunks: [OUTPUT] },
  { name: "finish_reason stop y EOF no sustituyen DONE", wire: content(OUTPUT, "stop"), close: true, chunks: [OUTPUT] },
  { name: "finish_reason length y EOF no sustituyen DONE", wire: content(OUTPUT, "length"), close: true, chunks: [OUTPUT] },
];
for (const scenario of invalidStreams) {
  test(`protocolo inválido: ${scenario.name} rechaza genérico sin devolver éxito parcial`, async (t) => {
    const f = await fixture(t);
    const body = f.body();
    const fetch = fakeFetch(response(body));
    const job = f.run(fetch);
    if (scenario.wire) body.push(scenario.wire);
    if (scenario.close) body.close();
    await rejectedSanitized(job);
    assert.deepEqual(f.chunks, scenario.chunks);
    onlyCall(fetch);
    f.clean();
  });
}

test("error de fetch no expone ni el mensaje RAW ni su causa con claves y textos", async (t) => {
  const f = await fixture(t);
  const fetch = fakeFetch(() => {
    throw new Error(`${RAW} ${API_KEY} private-system-prompt private-user-message`);
  });
  const job = f.run(fetch);
  await rejectedSanitized(job);
  onlyCall(fetch);
  assert.deepEqual(f.chunks, []);
  f.clean();
});

test("error de reader después de contenido rechaza sanitizado, sin retry ni lock de lectura retenido", async (t) => {
  const f = await fixture(t);
  const body = f.body();
  const fetch = fakeFetch(response(body));
  const job = f.run(fetch);
  body.push(content(OUTPUT));
  await drainUntil(() => f.chunks.length === 1, "Debe entregar el primer delta");
  body.error(new Error(`${RAW} ${API_KEY} ${OUTPUT}`));
  await rejectedSanitized(job);
  assert.deepEqual(f.chunks, [OUTPUT]);
  onlyCall(fetch);
  f.clean();
});

test("externalSignal ya abortada rechaza sin iniciar fetch ni emitir contenido", async (t) => {
  const f = await fixture(t);
  f.external.abort(new Error(`${RAW} ${API_KEY}`));
  const fetch = fakeFetch(new Response(null));
  const job = f.run(fetch);
  await rejectedSanitized(job);
  assert.equal(fetch.calls.length, 0);
  assert.deepEqual(f.chunks, []);
  f.clean();
});

test("abort externo antes de headers aborta la señal del fetch y elimina el deadline", async (t) => {
  const f = await fixture(t);
  const fetch = fakeFetch(pendingHeaders);
  const job = f.run(fetch);
  await drainUntil(() => fetch.calls.length === 1, "Debe iniciar fetch");
  const call = onlyCall(fetch);
  assert.notEqual(call.signal, f.external.signal);
  f.external.abort(new Error(`${RAW} ${API_KEY}`));
  await rejectedSanitized(job);
  assert.equal(call.signal.aborted, true);
  assert.deepEqual(f.chunks, []);
  f.clean();
});

for (const partial of [false, true]) {
  test(`abort externo ${partial ? "tras contenido" : "durante lectura sin contenido"} cancela reader, libera lock y timer`, async (t) => {
    const f = await fixture(t);
    const body = f.body();
    const fetch = fakeFetch(response(body));
    const job = f.run(fetch);
    await drainUntil(() => body.pulls() > 0, "Debe tener una lectura pendiente");
    if (partial) {
      body.push(content(OUTPUT));
      await drainUntil(() => f.chunks.length === 1 && body.pulls() >= 2, "Debe esperar el siguiente delta");
    }
    f.external.abort(new Error(`${RAW} ${API_KEY}`));
    await rejectedSanitized(job);
    assert.equal(onlyCall(fetch).signal.aborted, true);
    assert.equal(body.cancel.mock.callCount(), 1);
    assert.deepEqual(f.chunks, partial ? [OUTPUT] : []);
    f.clean();
  });
}

test("rechazo de onChunk async termina el intento, cancela reader y no procesa los siguientes deltas", async (t) => {
  const f = await fixture(t);
  const body = f.body();
  const fetch = fakeFetch(response(body));
  const job = f.run(fetch, async (chunk) => {
    f.chunks.push(chunk);
    throw new Error(`${RAW} ${API_KEY} ${OUTPUT}`);
  });
  body.push(content(OUTPUT) + content("No entregar") + done());
  await rejectedSanitized(job);
  assert.deepEqual(f.chunks, [OUTPUT]);
  onlyCall(fetch);
  assert.equal(body.cancel.mock.callCount(), 1);
  f.clean();
});

// 2.2 — pool real, fakes únicamente en fetch, stream, reloj y timers.
const NVIDIA_POOL_KEY = "fake-nvidia-pool-api-key";
const OPENROUTER_POOL_KEY = "fake-openrouter-pool-api-key";
const GEMINI_POOL_KEY = "fake-gemini-pool-api-key";
const UNAVAILABLE_MESSAGE = "El asistente no está disponible en este momento. Intenta de nuevo.";
const INTERRUPTED_MESSAGE = "La respuesta se interrumpió. Intenta de nuevo.";
const EXPECTED_POOL = [
  {
    model: "nvidia/nemotron-3.5-super-vl-120b-a12b",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    key: NVIDIA_POOL_KEY,
    ttfbMs: 15000,
    maxTokens: 16384,
    chatTemplateKwargs: { enable_thinking: true },
  },
  {
    model: "nvidia/nemotron-3.5-lightning:free",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    key: OPENROUTER_POOL_KEY,
    ttfbMs: 20000,
    maxTokens: 700,
  },
  {
    model: "gemini-3.1-flash-lite",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    key: GEMINI_POOL_KEY,
    ttfbMs: 10000,
    maxTokens: 700,
  },
] as const;

async function poolFixture(t: TestContext) {
  const f = await fixture(t);
  const streamChat = f.poolCandidate;
  assert.equal(typeof streamChat, "function", "Falta el export streamChat en provider.js (tarea 2.2)");
  assert.ok(streamChat);
  const markdown = (await readFile(new URL("../../../../openspec/CHATBOT_SPEC.md", import.meta.url), "utf8"))
    .replace(/\r\n/gu, "\n");
  const appendix = /^## Appendix A — Literal system prompt\n([\s\S]*)$/mu.exec(markdown)?.[1];
  assert.ok(appendix);
  const fenced = /^```text\n([\s\S]*?\n)```(?:\n|$)/mu.exec(appendix)?.[1];
  assert.ok(fenced);
  const literal = fenced.slice(0, -1);
  assert.notEqual(literal, "");
  // Igual que beginTurn: payload completo, no se duplica ni reemplaza system.
  const data: PoolInput = {
    messages: [
      { role: "system", content: literal },
      { role: "user", content: "Pregunta previa" },
      { role: "assistant", content: "private-history-answer" },
      { role: "user", content: "private-user-message: ¿ISAC y $\\tau$?" },
    ],
    nvidiaApiKey: NVIDIA_POOL_KEY,
    openrouterApiKey: OPENROUTER_POOL_KEY,
    geminiApiKey: GEMINI_POOL_KEY,
    externalSignal: f.external.signal,
  };
  return {
    ...f,
    poolInput: data,
    literal,
    runPool(fetch: FakeFetch | undefined, onChunk: OnChunk = (chunk) => { f.chunks.push(chunk); }, options = data) {
      return f.track(streamChat({ ...options, ...(fetch ? { fetchImpl: fetch.impl } : {}) }, onChunk));
    },
  };
}
type PoolFixture = Awaited<ReturnType<typeof poolFixture>>;
type Reply = "403" | "429" | "500" | "network" | "body-null" | "non-sse" | "bad-json"
  | "empty-done" | "eof" | "upstream-error" | "timeout" | "headers-timeout" | "manual" | "success";
type Hop = {
  previousBodies: Array<{ locked: boolean; terminal: boolean }>;
  previousTimersCleared: boolean[];
  previousSignalsAborted: boolean[];
  timerDelay: number | undefined;
};

function scriptedPoolFetch(
  f: PoolFixture,
  replies: Reply[],
  cancelHooks: Partial<Record<number, () => void | Promise<void>>> = {},
) {
  const sources: Array<Body | undefined> = [];
  const hops: Hop[] = [];
  const fetch = fakeFetch((signal) => {
    const index = fetch.calls.length - 1;
    // Registrar evidencia ANTES de responder. No hacer asserts dentro del fake:
    // el pool podría sanitizarlos y convertir un fallo del test en otro fallback.
    hops.push({
      previousBodies: sources.filter((body): body is Body => Boolean(body))
        .map((body) => ({ locked: body.stream.locked, terminal: body.isTerminal() })),
      previousTimersCleared: f.timers.slice(0, -1).map((timer) => timer.cleared()),
      previousSignalsAborted: fetch.calls.slice(0, -1).map((call) => call.signal?.aborted === true),
      timerDelay: f.timers.at(-1)?.delay,
    });
    const reply = replies[index];
    if (reply === "network") throw new Error(`${RAW} ${NVIDIA_POOL_KEY} ${OPENROUTER_POOL_KEY}`);
    if (reply === "body-null") return new Response(null, { headers: { "Content-Type": SSE_TYPE } });
    if (reply === "headers-timeout") return pendingHeaders(signal);
    if (!reply) return new Response(null, { status: 503 });
    const body = f.body(cancelHooks[index]);
    sources[index] = body;
    if (reply === "403" || reply === "429" || reply === "500") {
      body.push(`${RAW} ${NVIDIA_POOL_KEY} ${OPENROUTER_POOL_KEY}`);
      return response(body, Number(reply));
    }
    if (reply === "non-sse") {
      body.push(JSON.stringify({ error: `${RAW} ${OPENROUTER_POOL_KEY}` }));
      return response(body, 200, "application/json");
    }
    if (reply === "bad-json") body.push(`data: {${RAW}\n\n`);
    if (reply === "empty-done") body.push(": keep-alive\n\n" + content("") + done());
    if (reply === "upstream-error") body.push(event({ error: { message: `${RAW} ${NVIDIA_POOL_KEY}` } }));
    if (reply === "eof") {
      body.push(event({ choices: [{ delta: { role: "assistant", reasoning_content: RAW } }] }));
      body.close();
    }
    if (reply === "success") body.push(content("Respuesta pool") + done());
    return response(body);
  });
  return { fetch, sources, hops };
}
type PoolScript = ReturnType<typeof scriptedPoolFetch>;

function assertSequentialCleanup(script: PoolScript): void {
  script.hops.forEach((hop, index) => {
    assert.ok(hop.previousBodies.every((body) => !body.locked && body.terminal), `Reader anterior liberado antes del fetch ${index + 1}`);
    assert.ok(hop.previousTimersCleared.every(Boolean), `Timers anteriores cancelados antes del fetch ${index + 1}`);
    assert.ok(hop.previousSignalsAborted.every(Boolean), `Intentos anteriores cancelados antes del fetch ${index + 1}`);
  });
}

async function assertPoolRequests(f: PoolFixture, script: PoolScript, expectedCount: number): Promise<void> {
  assert.equal(script.fetch.calls.length, expectedCount, "Un intento por modelo y corte inmediato tras éxito o fallo postcontenido");
  assert.equal(script.hops.length, expectedCount);
  for (const [index, call] of script.fetch.calls.entries()) {
    const expected = EXPECTED_POOL[index];
    assert.ok(expected, "Nunca existe un cuarto intento ni un retry");
    assert.equal(call.request.url, expected.endpoint);
    assert.equal(call.request.method, "POST");
    assert.equal(call.request.headers.get("Authorization"), `Bearer ${expected.key}`);
    assert.equal(call.request.headers.get("Content-Type"), "application/json");
    for (const header of ["Cookie", "X-Forwarded-For", "X-User-ID"]) assert.equal(call.request.headers.get(header), null);
    assert.deepEqual(await call.request.json(), {
      model: expected.model,
      messages: f.poolInput.messages,
      stream: true,
      max_tokens: expected.maxTokens,
      ...("chatTemplateKwargs" in expected ? { chat_template_kwargs: expected.chatTemplateKwargs } : {}),
    }, "Solo los campos acordados: sin credenciales, tools, imágenes, identidad ni metadata del cliente");
    assert.equal(script.hops[index]!.timerDelay, expected.ttfbMs);
    assert.ok(call.signal instanceof AbortSignal);
    assert.notEqual(call.signal, f.external.signal);
  }
  assert.equal(f.poolInput.messages[0]!.role, "system");
  assert.equal(f.poolInput.messages[0]!.content, f.literal);
  assertSequentialCleanup(script);
}

async function rejectedPool(job: Job, code?: string, message?: string, status?: number): Promise<void> {
  await rejectedSanitized(job);
  assert.equal(job.outcome!.kind, "rejected");
  const error = job.outcome!.error as Error & { code?: string; status?: number };
  for (const key of [NVIDIA_POOL_KEY, OPENROUTER_POOL_KEY, GEMINI_POOL_KEY]) {
    assert.equal(inspect(error, { depth: null }).includes(key), false, "No filtrar ninguna clave del pool, ni en cause");
  }
  if (code !== undefined) assert.equal(error.code, code);
  if (message !== undefined) assert.equal(error.message, message);
  if (status !== undefined) assert.equal(error.status, status);
}

for (const successAt of [0, 1, 2]) {
  test(`pool A01: éxito en modelo ${successAt + 1}; orden, endpoints, prompt literal, Bearer y payload exactos sin retry`, async (t) => {
    const f = await poolFixture(t);
    const replies: Reply[] = [...Array<Reply>(successAt).fill("403"), "success"];
    const script = scriptedPoolFetch(f, replies);
    const original = structuredClone(f.poolInput.messages);
    // La variante de primer éxito cubre fetchImpl y externalSignal opcionales.
    if (successAt === 0) t.mock.method(globalThis, "fetch", script.fetch.impl);
    const job = successAt === 0
      ? f.runPool(undefined, undefined, { ...f.poolInput, externalSignal: undefined })
      : f.runPool(script.fetch);
    assert.equal(await fulfilled(job), "Respuesta pool");
    assert.deepEqual(f.chunks, ["Respuesta pool"]);
    assert.deepEqual(f.poolInput.messages, original, "No modificar los mensajes incoming");
    await assertPoolRequests(f, script, successAt + 1);
    f.clean();
  });
}

const preContentFailures: Reply[] = ["403", "429", "500", "network", "body-null", "non-sse", "bad-json", "empty-done", "eof", "upstream-error"];
for (const failure of preContentFailures) {
  test(`pool A24: ${failure} precontenido habilita el segundo modelo solo tras liberar recursos`, async (t) => {
    const f = await poolFixture(t);
    const script = scriptedPoolFetch(f, [failure, "success"]);
    const job = f.runPool(script.fetch);
    assert.equal(await fulfilled(job), "Respuesta pool");
    assert.deepEqual(f.chunks, ["Respuesta pool"], "No emitir metadata ni texto del intento fallido");
    await assertPoolRequests(f, script, 2);
    f.clean();
  });
}

test("pool A24/A26: deadlines 15000 → 20000 → 10000 exactos, secuenciales, sin paralelismo y agotamiento 503", async (t) => {
  const f = await poolFixture(t);
  const script = scriptedPoolFetch(f, ["timeout", "timeout", "timeout"]);
  const job = f.runPool(script.fetch);
  for (const [index, row] of EXPECTED_POOL.entries()) {
    await drainUntil(() => Boolean(script.sources[index]?.pulls()), `Debe estar activo solo el intento ${index + 1}`);
    assert.equal(script.fetch.calls.length, index + 1);
    const call = script.fetch.calls[index]!;
    assert.equal(call.at, [0, 15000, 35000][index]);
    assert.ok(call.signal instanceof AbortSignal);
    t.mock.timers.tick(row.ttfbMs - 1);
    assert.equal(call.signal.aborted, false);
    assert.equal(script.fetch.calls.length, index + 1, "No arrancar el siguiente antes del deadline");
    t.mock.timers.tick(1);
    assert.equal(call.signal.aborted, true);
    if (index < 2) await drainUntil(() => script.fetch.calls.length >= index + 2, "Fallback después de limpiar");
  }
  await rejectedPool(job, "CHAT_UNAVAILABLE", UNAVAILABLE_MESSAGE, 503);
  assert.equal(Date.now(), 45_000);
  assert.deepEqual(f.timers.map((timer) => timer.delay), [15000, 20000, 10000]);
  assert.deepEqual(f.chunks, []);
  await assertPoolRequests(f, script, 3);
  f.clean();
});

test("pool A24: espera la cancelación async del reader antes de lanzar otro fetch", async (t) => {
  const f = await poolFixture(t);
  const gate = f.gate();
  const script = scriptedPoolFetch(f, ["bad-json", "success"], { 0: () => gate.promise });
  const job = f.runPool(script.fetch);
  await drainUntil(() => script.sources[0]?.cancel.mock.callCount() === 1, "Debe cancelar el primer reader");
  for (let step = 0; step < 100; step += 1) await Promise.resolve();
  assert.equal(script.fetch.calls.length, 1, "No iniciar el segundo mientras reader.cancel siga pendiente");
  assert.equal(f.timers[0]!.cleared(), true);
  assert.equal(job.outcome, undefined);
  gate.resolve();
  assert.equal(await fulfilled(job), "Respuesta pool");
  await assertPoolRequests(f, script, 2);
  f.clean();
});

test("pool A26: tres fallos precontenido distintos agotan el pool una sola vez con error 503 exacto y sanitizado", async (t) => {
  const f = await poolFixture(t);
  const script = scriptedPoolFetch(f, ["403", "empty-done", "network"]);
  const job = f.runPool(script.fetch);
  await rejectedPool(job, "CHAT_UNAVAILABLE", UNAVAILABLE_MESSAGE, 503);
  assert.deepEqual(f.chunks, []);
  await assertPoolRequests(f, script, 3);
  f.clean();
});

const postContentFailures = [
  { at: 0, kind: "reader" },
  { at: 1, kind: "eof" },
  { at: 2, kind: "bad-json" },
  { at: 0, kind: "upstream-error" },
  { at: 0, kind: "callback-sync" },
  { at: 1, kind: "callback-async" },
] as const;
for (const scenario of postContentFailures) {
  test(`pool A25: ${scenario.kind} tras primer chunk del modelo ${scenario.at + 1} da CHAT_STREAM_INTERRUPTED, sin fallback`, async (t) => {
    const f = await poolFixture(t);
    const script = scriptedPoolFetch(f, [...Array<Reply>(scenario.at).fill("403"), "manual"]);
    const callback: OnChunk = scenario.kind === "callback-sync"
      ? (chunk) => { f.chunks.push(chunk); throw new Error(`${RAW} ${NVIDIA_POOL_KEY}`); }
      : scenario.kind === "callback-async"
        ? async (chunk) => { f.chunks.push(chunk); await Promise.resolve(); throw new Error(`${RAW} ${OPENROUTER_POOL_KEY}`); }
        : (chunk) => { f.chunks.push(chunk); };
    const job = f.runPool(script.fetch, callback);
    await drainUntil(() => Boolean(script.sources[scenario.at]?.pulls()), "Debe alcanzar el intento bajo prueba");
    const body = script.sources[scenario.at]!;
    body.push(content(OUTPUT));
    if (!scenario.kind.startsWith("callback")) {
      await drainUntil(() => f.chunks.length === 1 && body.pulls() >= 2, "El primer chunk ya se comenzó a emitir");
      if (scenario.kind === "reader") body.error(new Error(`${RAW} ${NVIDIA_POOL_KEY}`));
      if (scenario.kind === "eof") body.close();
      if (scenario.kind === "bad-json") body.push(`data: {${RAW}\n\n`);
      if (scenario.kind === "upstream-error") body.push(event({ error: { message: `${RAW} ${OPENROUTER_POOL_KEY}` } }));
    }
    await rejectedPool(job, "CHAT_STREAM_INTERRUPTED", INTERRUPTED_MESSAGE);
    assert.deepEqual(f.chunks, [OUTPUT]);
    await assertPoolRequests(f, script, scenario.at + 1);
    f.clean();
  });
}

test("pool A25: onChunk async es serial y su backpressure no activa fallback ni timeout después del primer texto", async (t) => {
  const f = await poolFixture(t);
  const gate = f.gate();
  const script = scriptedPoolFetch(f, ["manual"]);
  const job = f.runPool(script.fetch, async (chunk) => {
    f.chunks.push(chunk);
    if (f.chunks.length === 1) await gate.promise;
  });
  await drainUntil(() => Boolean(script.sources[0]?.pulls()), "Debe iniciar la lectura");
  script.sources[0]!.push(content("Primero") + content("Segundo") + done());
  await drainUntil(() => f.chunks.length === 1, "Debe iniciar el primer callback");
  for (let step = 0; step < 100; step += 1) await Promise.resolve();
  assert.deepEqual(f.chunks, ["Primero"]);
  t.mock.timers.tick(1_000_000);
  assert.equal(script.fetch.calls.length, 1);
  assert.equal(script.fetch.calls[0]!.signal!.aborted, false);
  assert.equal(job.outcome, undefined);
  assert.ok(f.timers.every((timer) => timer.firings() === 0));
  gate.resolve();
  assert.equal(await fulfilled(job), "PrimeroSegundo");
  assert.deepEqual(f.chunks, ["Primero", "Segundo"]);
  await assertPoolRequests(f, script, 1);
  f.clean();
});

test("pool A31: externalSignal ya abortada impide incluso el primer fetch", async (t) => {
  const f = await poolFixture(t);
  f.external.abort(new Error(`${RAW} ${NVIDIA_POOL_KEY}`));
  const script = scriptedPoolFetch(f, ["success"]);
  const job = f.runPool(script.fetch);
  await rejectedPool(job);
  assert.equal(script.fetch.calls.length, 0);
  assert.deepEqual(f.chunks, []);
  f.clean();
});

test("pool A31: abort antes de headers cancela el fetch sin fallback", async (t) => {
  const f = await poolFixture(t);
  const script = scriptedPoolFetch(f, ["headers-timeout", "success"]);
  const job = f.runPool(script.fetch);
  await drainUntil(() => script.fetch.calls.length === 1, "Debe iniciar el primer fetch");
  f.external.abort(new Error(`${RAW} ${NVIDIA_POOL_KEY}`));
  await rejectedPool(job);
  assert.equal(script.fetch.calls[0]!.signal!.aborted, true);
  assert.deepEqual(f.chunks, []);
  await assertPoolRequests(f, script, 1);
  f.clean();
});

for (const scenario of [{ at: 0, partial: false }, { at: 1, partial: false }, { at: 0, partial: true }, { at: 2, partial: true }]) {
  test(`pool A31: abort en modelo ${scenario.at + 1} ${scenario.partial ? "tras contenido" : "precontenido"} cancela reader/timer sin otro intento`, async (t) => {
    const f = await poolFixture(t);
    const script = scriptedPoolFetch(f, [...Array<Reply>(scenario.at).fill("403"), "manual"]);
    const job = f.runPool(script.fetch);
    await drainUntil(() => Boolean(script.sources[scenario.at]?.pulls()), "Debe leer el intento seleccionado");
    const body = script.sources[scenario.at]!;
    if (scenario.partial) {
      body.push(content(OUTPUT));
      await drainUntil(() => f.chunks.length === 1 && body.pulls() >= 2, "Debe estar emitido el primer chunk");
    }
    f.external.abort(new Error(`${RAW} ${OPENROUTER_POOL_KEY}`));
    await rejectedPool(job);
    assert.equal(script.fetch.calls[scenario.at]!.signal!.aborted, true);
    assert.equal(body.cancel.mock.callCount(), 1);
    assert.deepEqual(f.chunks, scenario.partial ? [OUTPUT] : []);
    await assertPoolRequests(f, script, scenario.at + 1);
    f.clean();
  });
}

test("pool A31: abort durante onChunk async pendiente no hace fallback ni entrega deltas tardíos", async (t) => {
  const f = await poolFixture(t);
  const gate = f.gate();
  const script = scriptedPoolFetch(f, ["manual"]);
  const job = f.runPool(script.fetch, async (chunk) => { f.chunks.push(chunk); await gate.promise; });
  await drainUntil(() => Boolean(script.sources[0]?.pulls()), "Debe adquirir el reader");
  script.sources[0]!.push(content(OUTPUT) + content("No entregar") + done());
  await drainUntil(() => f.chunks.length === 1, "Debe estar pendiente el primer callback");
  f.external.abort(new Error(`${RAW} ${NVIDIA_POOL_KEY}`));
  await rejectedPool(job);
  gate.resolve();
  for (let step = 0; step < 100; step += 1) await Promise.resolve();
  assert.deepEqual(f.chunks, [OUTPUT]);
  await assertPoolRequests(f, script, 1);
  f.clean();
});

test("pool A31: abort durante limpieza async de un fallo precontenido impide el siguiente modelo", async (t) => {
  const f = await poolFixture(t);
  const gate = f.gate();
  const script = scriptedPoolFetch(f, ["bad-json", "success"], { 0: () => gate.promise });
  const job = f.runPool(script.fetch);
  await drainUntil(() => script.sources[0]?.cancel.mock.callCount() === 1, "Debe estar cancelando el reader anterior");
  f.external.abort(new Error(`${RAW} ${NVIDIA_POOL_KEY}`));
  gate.resolve();
  await rejectedPool(job);
  assert.deepEqual(f.chunks, []);
  await assertPoolRequests(f, script, 1);
  f.clean();
});
