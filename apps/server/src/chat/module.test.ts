import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import test, { type TestContext } from "node:test";
import nodeTimers from "node:timers";
import { AppError } from "../http/errors.js";

test("SYSTEM_PROMPT coincide exactamente con todo el literal de Appendix A", async () => {
  // Desde apps/server/dist/chat/ (también válido desde src/chat/), sin depender del cwd.
  const specUrl = new URL("../../../../openspec/CHATBOT_SPEC.md", import.meta.url);
  const markdown = (await readFile(specUrl, "utf8")).replace(/\r\n/gu, "\n");
  const appendix = /^## Appendix A — Literal system prompt\n([\s\S]*)$/mu.exec(markdown)?.[1];
  assert.ok(appendix, "Debe existir Appendix A en la spec fuente");

  const fencedPrompt = /^```text\n([\s\S]*?\n)```(?:\n|$)/mu.exec(appendix)?.[1];
  assert.ok(fencedPrompt, "Appendix A debe contener el bloque text completo y cerrado");
  // Quitar exactamente el LF previo al cierre; preservar el resto, incluido whitespace.
  const expectedPrompt = fencedPrompt.slice(0, -1);
  assert.notEqual(expectedPrompt, "", "El literal de Appendix A no puede estar vacío");

  // URL dinámica: compila antes de existir prompt.ts; su ausencia debe fallar en runtime.
  const { SYSTEM_PROMPT } = await import(new URL("./prompt.js", import.meta.url).href);
  assert.equal(
    SYSTEM_PROMPT,
    expectedPrompt,
    "SYSTEM_PROMPT debe preservar todo el texto, incluidos backticks y escapes LaTeX",
  );
});

// Contrato acordado para 1.4, solo tipos: no se sustituye ni simula el módulo real.
type Message = { role: string; content: string };
type Session = { messages: Message[]; lastActive: number };
interface Turn {
  messages: Message[];
  signal: AbortSignal;
  abort(): void;
  touch(): void;
  commit(content: string): void;
  release(): void;
}
interface ChatModule {
  sessions: Map<string, Session>;
  quotas: Map<string, number[]>;
  beginTurn(userId: string, tabSessionId: string, message: string): Turn;
  consumeQuota(userId: string): void;
  sweep(): void;
  dispose(): void;
}
type CreateChatModule = (options?: { now?: () => number }) => ChatModule;

const USER = "00000000-0000-4000-8000-000000000001";
const OTHER_USER = "00000000-0000-4000-8000-000000000002";
const TAB = "00000000-0000-4000-8000-000000000101";
const OTHER_TAB = "00000000-0000-4000-8000-000000000102";
const KEY = `${USER}:${TAB}`;
const TTL_MS = 30 * 60 * 1000;
const SWEEP_MS = 5 * 60 * 1000;
const QUOTA_LIMIT = 10;
const QUOTA_WINDOW_MS = 60_000;

function pair(user: string, assistant: string): Message[] {
  return [{ role: "user", content: user }, { role: "assistant", content: assistant }];
}

function seed(chat: ChatModule, key: string, messages: Message[], lastActive = 0): void {
  chat.sessions.set(key, { messages: structuredClone(messages), lastActive });
}

function session(chat: ChatModule, key = KEY): Session {
  const stored = chat.sessions.get(key);
  assert.ok(stored, `Debe existir el contexto confirmado de ${key}`);
  return stored;
}

function payload(prompt: string, history: Message[], message: string): Message[] {
  return [{ role: "system", content: prompt }, ...history, { role: "user", content: message }];
}

function assertChatError(work: () => unknown, status: number, code: string): void {
  assert.throws(work, { status, code });
}

function assertQuotaError(work: () => unknown, retryAfterSeconds: number): void {
  assert.throws(work, (error: unknown) => {
    assert.ok(error instanceof AppError, "La cuota debe rechazar mediante AppError");
    assert.equal(error.status, 429);
    assert.equal(error.code, "CHAT_RATE_LIMITED");
    assert.equal(error.details?.retryAfterSeconds, retryAfterSeconds);
    return true;
  });
}

async function quotaFixture(t: TestContext, options: { observeTimers?: boolean; defaultClock?: boolean } = {}) {
  const f = await fixture(t, options);
  assert.ok(f.chat.quotas instanceof Map, "createChatModule debe exponer un Map de cuotas separado");
  assert.equal(typeof f.chat.consumeQuota, "function", "createChatModule debe exponer consumeQuota(userId)");
  return f;
}

function assertClosedCommitCannotMutate(chat: ChatModule, turn: Turn): void {
  const before = structuredClone([...chat.sessions]);
  // No se acordó cómo rechazar el commit cerrado: no-op o Error son válidos,
  // pero ni siquiera un rechazo puede haber modificado contenido o actividad.
  try {
    turn.commit("Respuesta tardía que no debe confirmarse");
  } catch (error) {
    assert.ok(error instanceof Error, "Un rechazo explícito debe ser un Error");
  }
  assert.deepEqual([...chat.sessions], before, "Un turno cerrado no puede hacer commit");
}

type IntervalObservation = {
  delay: number | undefined;
  firings(): number;
  unrefCalls(): number;
};

function observeIntervals(t: TestContext): IntervalObservation[] {
  const observed: IntervalObservation[] = [];
  // Instrumentación de la frontera de timers, no del store: soporta globals
  // y node:timers. El scheduler sigue siendo el mock nativo de node:test.
  const boundaries: Array<Pick<typeof globalThis, "setInterval">> = [globalThis, nodeTimers];
  for (const boundary of boundaries) {
    const schedule = boundary.setInterval;
    t.mock.method(boundary, "setInterval", (...args: Parameters<typeof setInterval>) => {
      const [callback, delay, ...callbackArgs] = args;
      const fire = t.mock.fn(callback);
      const handle = schedule(fire, delay, ...callbackArgs);
      const unref = t.mock.method(handle, "unref");
      observed.push({
        delay,
        firings: () => fire.mock.callCount(),
        unrefCalls: () => unref.mock.callCount(),
      });
      return handle;
    });
  }
  syncBuiltinESMExports();
  return observed;
}

async function fixture(t: TestContext, options: { observeTimers?: boolean; defaultClock?: boolean } = {}) {
  t.mock.timers.enable({ apis: ["setInterval", "Date"], now: 0 });
  let chat: ChatModule | undefined;
  let disposed = false;
  const dispose = () => {
    if (chat && !disposed) {
      chat.dispose();
      disposed = true;
    }
  };
  t.after(() => {
    try {
      dispose();
    } finally {
      t.mock.restoreAll();
      t.mock.timers.reset();
      syncBuiltinESMExports();
    }
  });
  const intervals = options.observeTimers ? observeIntervals(t) : [];
  // Import computado: el RED por módulo ausente debe ser de runtime, no de tsc.
  const { createChatModule } = await import(new URL("./module.js", import.meta.url).href) as {
    createChatModule: CreateChatModule;
  };
  const { SYSTEM_PROMPT } = await import(new URL("./prompt.js", import.meta.url).href) as {
    SYSTEM_PROMPT: string;
  };
  const clock = { now: 0 };
  chat = options.defaultClock ? createChatModule() : createChatModule({ now: () => clock.now });
  assert.ok(chat.sessions instanceof Map, "sessions es el Map acordado de contextos RAM");
  return { chat, clock, prompt: SYSTEM_PROMPT, intervals, dispose, createChatModule };
}

// Tres pares; el primero aporta el padding y los dos últimos son distinguibles.
// Usar el prompt REAL y emojis hace observables el umbral y el cómputo UTF-16.
function historyAtInputSize(prompt: string, message: string, inputUnits: number): Message[] {
  const tail = [
    { role: "assistant", content: "Respuesta antigua" },
    ...pair("Pregunta intermedia", "Respuesta intermedia"),
    ...pair("Pregunta puente", "Respuesta puente"),
  ];
  const padding = inputUnits - prompt.length - message.length
    - tail.reduce((sum, entry) => sum + entry.content.length, 0);
  assert.ok(padding > 0, "La fixture debe caber alrededor del prompt real");
  const oldestQuestion = "📡".repeat(Math.floor(padding / 2)) + (padding % 2 ? "x" : "");
  return [{ role: "user", content: oldestQuestion }, ...tail];
}

test("store RAM aísla usuario y pestaña y permite turnos simultáneos en claves distintas", async (t) => {
  const { chat, prompt } = await fixture(t);
  const identities = [[USER, TAB], [OTHER_USER, TAB], [USER, OTHER_TAB]] as const;
  const turns = identities.map(([userId, tabId], index) => {
    const turn = chat.beginTurn(userId, tabId, `Pregunta ${index}`);
    assert.deepEqual(turn.messages, payload(prompt, [], `Pregunta ${index}`));
    assert.ok(turn.signal instanceof AbortSignal);
    assert.equal(turn.signal.aborted, false);
    return turn;
  });
  turns.forEach((turn, index) => {
    turn.commit(`Respuesta ${index}`);
    turn.release();
  });
  assert.equal(chat.sessions.size, 3);
  identities.forEach(([userId, tabId], index) => {
    assert.deepEqual(session(chat, `${userId}:${tabId}`), {
      messages: pair(`Pregunta ${index}`, `Respuesta ${index}`), lastActive: 0,
    });
  });
});

test("store vacío no guarda el pendiente ni system y confirma el primer par con reloj cero", async (t) => {
  const { chat, prompt } = await fixture(t);
  assert.equal(chat.sessions.size, 0);
  const turn = chat.beginTurn(USER, TAB, "Pregunta nueva");
  assert.deepEqual(turn.messages, payload(prompt, [], "Pregunta nueva"));
  // El contenedor vacío durante admisión es opcional; el contenido pendiente no.
  assert.deepEqual(chat.sessions.get(KEY)?.messages ?? [], []);
  turn.touch();
  assert.deepEqual(chat.sessions.get(KEY)?.messages ?? [], []);
  turn.commit("Respuesta completa");
  assert.deepEqual(session(chat), { messages: pair("Pregunta nueva", "Respuesta completa"), lastActive: 0 });
  turn.release();
});

test("store con un par conserva el historial completo y solo añade otro par al commit", async (t) => {
  const { chat, prompt } = await fixture(t);
  const original = pair("Pregunta previa", "Respuesta previa");
  seed(chat, KEY, original);
  const turn = chat.beginTurn(USER, TAB, "Siguiente pregunta");
  assert.deepEqual(turn.messages, payload(prompt, original, "Siguiente pregunta"));
  assert.deepEqual(session(chat).messages, original);
  turn.commit("Siguiente respuesta");
  turn.release();
  const completed = [...original, ...pair("Siguiente pregunta", "Siguiente respuesta")];
  assert.deepEqual(session(chat).messages, completed);
  const next = chat.beginTurn(USER, TAB, "Tercera pregunta");
  assert.deepEqual(next.messages, payload(prompt, completed, "Tercera pregunta"));
  next.release();
});

for (const rollover of [false, true]) {
  test(`release sin commit conserva el historial original${rollover ? " aun con rollover preparado" : " sin rollover"}`, async (t) => {
    const { chat, prompt } = await fixture(t);
    const original = rollover ? historyAtInputSize(prompt, "Nueva", 24_004) : pair("Previa", "Anterior");
    seed(chat, KEY, original);
    const turn = chat.beginTurn(USER, TAB, "Nueva");
    assert.deepEqual(turn.messages, payload(prompt, rollover ? original.slice(-2) : original, "Nueva"));
    assert.deepEqual(session(chat).messages, original, "Preparar el candidato no es un commit");
    turn.release();
    assert.deepEqual(session(chat).messages, original, "El fallo no aplica rollover ni guarda un user huérfano");
    const retry = chat.beginTurn(USER, TAB, "Reintento");
    retry.release();
  });
}

for (const inputUnits of [24_000, 24_001, 24_004]) {
  test(`presupuesto ${inputUnits} unidades UTF-16 (${inputUnits / 4} tokens): ${inputUnits === 24_000 ? "sin rollover" : "solo el último par"}`, async (t) => {
    const { chat, prompt } = await fixture(t);
    const message = "Nueva pregunta";
    const original = historyAtInputSize(prompt, message, inputUnits);
    seed(chat, KEY, original);
    const turn = chat.beginTurn(USER, TAB, message);
    const retained = inputUnits === 24_000 ? original : original.slice(-2);
    assert.deepEqual(turn.messages, payload(prompt, retained, message));
    assert.deepEqual(session(chat).messages, original, "El candidato es local hasta el éxito");
    turn.commit("Respuesta final");
    turn.release();
    assert.deepEqual(session(chat).messages, [...retained, ...pair(message, "Respuesta final")]);
  });
}

for (const previousPairs of [0, 1, 2]) {
  test(`presupuesto rechaza 422 sin truncar con ${previousPairs} pares si prompt + puente + mensaje siguen excedidos y libera el lock`, async (t) => {
    const { chat, prompt } = await fixture(t);
    const shortMessage = "Nueva";
    const bridge = pair("b".repeat(24_001 - prompt.length - shortMessage.length - 1), "R");
    const original = previousPairs === 0 ? []
      : previousPairs === 1 ? bridge : [...pair("Antigua", "Antigua respuesta"), ...bridge];
    const message = previousPairs === 0 ? "x".repeat(24_001 - prompt.length) : shortMessage;
    seed(chat, KEY, original);
    // Las longitudes grandes prueban este seam; el límite HTTP de 300 no corresponde al store.
    assertChatError(() => chat.beginTurn(USER, TAB, message), 422, "CHAT_CONTEXT_TOO_LARGE");
    assert.deepEqual(session(chat).messages, original);
    seed(chat, KEY, pair("Ahora breve", "Cabe"));
    const retry = chat.beginTurn(USER, TAB, "Admitida");
    assert.deepEqual(retry.messages, payload(prompt, pair("Ahora breve", "Cabe"), "Admitida"));
    retry.release();
  });
}

test("lastActive usa el reloj inyectado en admisión, touch y commit; una colisión no lo prolonga", async (t) => {
  const { chat, clock } = await fixture(t);
  const original = pair("Previa", "Anterior");
  seed(chat, KEY, original, -100);
  const turn = chat.beginTurn(USER, TAB, "Nueva");
  assert.equal(session(chat).lastActive, 0);
  clock.now = 50;
  assertChatError(() => chat.beginTurn(USER, TAB, "Colisión"), 409, "CHAT_IN_PROGRESS");
  assert.equal(session(chat).lastActive, 0);
  clock.now = 100;
  assert.equal(session(chat).lastActive, 0, "Sin touch no hay actividad de contenido");
  turn.touch();
  assert.equal(session(chat).lastActive, 100);
  assert.deepEqual(session(chat).messages, original);
  clock.now = 200;
  turn.commit("Completa");
  assert.equal(session(chat).lastActive, 200);
  turn.release();
});

test("createChatModule sin opciones usa Date.now y acepta el timestamp cero", async (t) => {
  const { chat } = await fixture(t, { defaultClock: true });
  seed(chat, KEY, []);
  const turn = chat.beginTurn(USER, TAB, "Nueva");
  assert.equal(session(chat).lastActive, 0);
  t.mock.timers.tick(123);
  turn.touch();
  assert.equal(session(chat).lastActive, 123);
  t.mock.timers.tick(77);
  turn.commit("Completa");
  assert.equal(session(chat).lastActive, 200);
  turn.release();
});

test("sweep conserva a 30 minutos exactos, elimina solo después y no confunde lastActive cero con ausencia", async (t) => {
  const { chat, clock } = await fixture(t);
  const original = pair("Previa", "Anterior");
  const recentKey = `${OTHER_USER}:${TAB}`;
  seed(chat, KEY, original, 0);
  seed(chat, recentKey, original, 1);
  clock.now = TTL_MS;
  chat.sweep();
  assert.deepEqual(session(chat), { messages: original, lastActive: 0 });
  clock.now = TTL_MS + 1;
  chat.sweep();
  assert.equal(chat.sessions.has(KEY), false);
  assert.deepEqual(session(chat, recentKey), { messages: original, lastActive: 1 });
});

for (const outcome of ["commit", "release", "abort"] as const) {
  test(`TTL durante un turno conserva el lock y el snapshot; ${outcome} ${outcome === "commit" ? "puede confirmar de nuevo" : "no restaura el historial expirado"}`, async (t) => {
    const { chat, clock, prompt } = await fixture(t);
    const original = pair("Previa", "Anterior");
    seed(chat, KEY, original);
    const turn = chat.beginTurn(USER, TAB, "Nueva");
    clock.now = TTL_MS + 1;
    chat.sweep();
    assert.equal(chat.sessions.has(KEY), false);
    assert.deepEqual(turn.messages, payload(prompt, original, "Nueva"));
    assertChatError(() => chat.beginTurn(USER, TAB, "Colisión tras TTL"), 409, "CHAT_IN_PROGRESS");
    if (outcome === "commit") {
      turn.commit("Completa tras TTL");
      assert.deepEqual(session(chat), {
        messages: [...original, ...pair("Nueva", "Completa tras TTL")], lastActive: TTL_MS + 1,
      });
      turn.release();
    } else {
      turn[outcome]();
      assert.equal(chat.sessions.has(KEY), false);
      assertClosedCommitCannotMutate(chat, turn);
    }
    const next = chat.beginTurn(USER, TAB, "Siguiente");
    if (outcome !== "commit") {
      assert.deepEqual(next.messages, payload(prompt, [], "Siguiente"));
    }
    next.release();
  });
}

test("intervalo barre cada cinco minutos, usa unref y dispose cancela su callback sin waits", async (t) => {
  const f = await fixture(t, { observeTimers: true });
  assert.equal(f.intervals.length, 1, "Hay un único intervalo de limpieza del módulo");
  const interval = f.intervals[0]!;
  assert.equal(interval.delay, SWEEP_MS);
  assert.equal(interval.unrefCalls(), 1, "El intervalo no debe retener el proceso");
  seed(f.chat, KEY, pair("Expirada", "Anterior"), -TTL_MS - 1);
  t.mock.timers.tick(SWEEP_MS - 1);
  assert.equal(interval.firings(), 0);
  assert.equal(f.chat.sessions.has(KEY), true);
  t.mock.timers.tick(1);
  assert.equal(interval.firings(), 1);
  assert.equal(f.chat.sessions.has(KEY), false);
  seed(f.chat, KEY, pair("Otra expirada", "Anterior"), -TTL_MS - 1);
  t.mock.timers.tick(SWEEP_MS - 1);
  assert.equal(f.chat.sessions.has(KEY), true);
  t.mock.timers.tick(1);
  assert.equal(interval.firings(), 2);
  assert.equal(f.chat.sessions.has(KEY), false, "El barrido es recurrente, no un timeout único");
  f.dispose();
  seed(f.chat, KEY, [], -TTL_MS - 1);
  t.mock.timers.tick(2 * SWEEP_MS);
  assert.equal(interval.firings(), 2, "dispose debe cancelar realmente el timer, no solo ignorar el callback");
  assert.equal(f.chat.sessions.has(KEY), true);
});

test("release es idempotente y un turno viejo no desbloquea ni modifica el turno posterior", async (t) => {
  const { chat, clock } = await fixture(t);
  seed(chat, KEY, pair("Previa", "Anterior"));
  const first = chat.beginTurn(USER, TAB, "Falla");
  first.release();
  first.release();
  const second = chat.beginTurn(USER, TAB, "Activa");
  clock.now = 100;
  first.release();
  assertClosedCommitCannotMutate(chat, first);
  assertChatError(() => chat.beginTurn(USER, TAB, "No debe entrar"), 409, "CHAT_IN_PROGRESS");
  first.abort();
  first.release();
  assertChatError(() => chat.beginTurn(USER, TAB, "Tampoco debe entrar"), 409, "CHAT_IN_PROGRESS");
  second.commit("Completa");
  second.release();
  const third = chat.beginTurn(USER, TAB, "Ya libre");
  third.release();
});

test("abort señala una sola vez, descarta el pendiente y libera la clave sin depender de release", async (t) => {
  const { chat, clock } = await fixture(t);
  const original = pair("Previa", "Anterior");
  seed(chat, KEY, original);
  const turn = chat.beginTurn(USER, TAB, "No completa");
  const onAbort = t.mock.fn();
  turn.signal.addEventListener("abort", onAbort);
  turn.abort();
  turn.abort();
  assert.equal(turn.signal.aborted, true);
  assert.equal(onAbort.mock.callCount(), 1);
  assert.deepEqual(session(chat).messages, original);
  clock.now = 500;
  assertClosedCommitCannotMutate(chat, turn);
  const next = chat.beginTurn(USER, TAB, "Admitida tras abort");
  turn.release();
  assertChatError(() => chat.beginTurn(USER, TAB, "Aún ocupada"), 409, "CHAT_IN_PROGRESS");
  next.release();
});

test("commit es de un solo uso: un segundo commit no añade ni sustituye pares o actividad", async (t) => {
  const { chat, clock } = await fixture(t);
  const turn = chat.beginTurn(USER, TAB, "Pregunta");
  turn.commit("Primera respuesta completa");
  assert.deepEqual(session(chat), { messages: pair("Pregunta", "Primera respuesta completa"), lastActive: 0 });
  clock.now = 100;
  assertClosedCommitCannotMutate(chat, turn);
  turn.release();
});

test("dispose aborta todos los activos, borra la RAM y los commits tardíos no la repueblan", async (t) => {
  const f = await fixture(t);
  seed(f.chat, KEY, pair("Previa", "Anterior"));
  const first = f.chat.beginTurn(USER, TAB, "Pendiente uno");
  const second = f.chat.beginTurn(OTHER_USER, TAB, "Pendiente dos");
  assert.equal(first.signal.aborted, false);
  assert.equal(second.signal.aborted, false);
  f.dispose();
  assert.equal(first.signal.aborted, true);
  assert.equal(second.signal.aborted, true);
  assert.equal(f.chat.sessions.size, 0);
  f.clock.now = 500;
  assertClosedCommitCannotMutate(f.chat, first);
  assertClosedCommitCannotMutate(f.chat, second);
  first.release();
  second.release();
  const restarted = f.createChatModule({ now: () => f.clock.now });
  try {
    const fresh = restarted.beginTurn(USER, TAB, "Tras reiniciar");
    assert.deepEqual(fresh.messages, payload(f.prompt, [], "Tras reiniciar"));
    fresh.release();
  } finally {
    restarted.dispose();
  }
});

test("A08 cuota deslizante: 10 consumos en t=59000 no admiten otros 10 en t=60000", async (t) => {
  const { chat, clock } = await quotaFixture(t);
  clock.now = 59_000;
  for (let request = 0; request < QUOTA_LIMIT; request += 1) chat.consumeQuota(USER);
  assert.deepEqual(chat.quotas.get(USER), Array(10).fill(59_000));

  clock.now = 60_000;
  for (let request = 0; request < QUOTA_LIMIT; request += 1) {
    assertQuotaError(() => chat.consumeQuota(USER), 59);
  }
  assert.deepEqual(chat.quotas.get(USER), Array(10).fill(59_000), "Las rechazadas no se registran ni crean una ventana fija nueva");
});

test("A09 cuota deslizante: timestamp cero, frontera 59999/60000/60001 y expiración progresiva sin reset fijo", async (t) => {
  const { chat, clock } = await quotaFixture(t);
  for (let timestamp = 0; timestamp <= 9_000; timestamp += 1_000) {
    clock.now = timestamp;
    chat.consumeQuota(USER);
  }
  assert.deepEqual(chat.quotas.get(USER), [0, 1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000, 8_000, 9_000]);

  clock.now = 59_999;
  assertQuotaError(() => chat.consumeQuota(USER), 1);
  assert.deepEqual(chat.quotas.get(USER), [0, 1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000, 8_000, 9_000]);

  clock.now = 60_000;
  chat.consumeQuota(USER);
  assert.deepEqual(chat.quotas.get(USER), [1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000, 8_000, 9_000, 60_000]);

  clock.now = 60_001;
  assertQuotaError(() => chat.consumeQuota(USER), 1);
  assert.deepEqual(chat.quotas.get(USER), [1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000, 8_000, 9_000, 60_000]);

  clock.now = 61_000;
  chat.consumeQuota(USER);
  assert.deepEqual(chat.quotas.get(USER), [2_000, 3_000, 4_000, 5_000, 6_000, 7_000, 8_000, 9_000, 60_000, 61_000]);
});

test("cuota es por userId, comparte el cupo entre pestañas y permanece separada de sesiones/beginTurn", async (t) => {
  const { chat } = await quotaFixture(t);
  const firstTab = chat.beginTurn(USER, TAB, "Pregunta de una pestaña");
  const secondTab = chat.beginTurn(USER, OTHER_TAB, "Pregunta de otra pestaña");
  assert.equal(chat.sessions.size, 2, "El historial sigue aislado por usuario y tabSessionId");
  assert.equal(chat.quotas.size, 0, "beginTurn no consume cuota implícitamente");
  firstTab.release();
  secondTab.release();

  // Diez admisiones bajo la misma identidad real; el tab/IP no forma parte del seam de cuota.
  for (let request = 0; request < QUOTA_LIMIT; request += 1) chat.consumeQuota(USER);
  assert.equal(chat.quotas.size, 1);
  assert.deepEqual(chat.quotas.get(USER), Array(10).fill(0));
  assertQuotaError(() => chat.consumeQuota(USER), 60);

  chat.consumeQuota(OTHER_USER);
  assert.deepEqual([...chat.quotas.keys()], [USER, OTHER_USER], "Otro usuario dispone de su propia ventana");
  assert.equal(chat.sessions.size, 2, "Consumir cuota no crea ni modifica sesiones conversacionales");
});

test("A10 fallo upstream simulado, abort y release posteriores no reembolsan consumo", async (t) => {
  const { chat, clock } = await quotaFixture(t);
  chat.consumeQuota(USER);
  const turn = chat.beginTurn(USER, TAB, "Falla el proveedor");
  assert.deepEqual(chat.quotas.get(USER), [0], "beginTurn no consume ni reembolsa cuota");
  try {
    assert.throws(() => { throw new Error("fallo upstream simulado"); }, /fallo upstream simulado/u);
  } finally {
    turn.release();
  }
  assert.deepEqual(chat.quotas.get(USER), [0], "Un fallo posterior no devuelve el consumo");

  clock.now = 1;
  chat.consumeQuota(USER);
  const aborted = chat.beginTurn(USER, OTHER_TAB, "Cliente desconectado");
  aborted.abort();
  aborted.release();
  assert.deepEqual(chat.quotas.get(USER), [0, 1], "Abortar y liberar tampoco reembolsa la admisión");
});

test("consumo previo a conflictos 409 y 422 permanece en la cuota", async (t) => {
  const { chat, clock, prompt } = await quotaFixture(t);
  chat.consumeQuota(USER);
  const active = chat.beginTurn(USER, TAB, "Turno activo");

  clock.now = 1;
  chat.consumeQuota(USER);
  assertChatError(() => chat.beginTurn(USER, TAB, "Conflicto posterior"), 409, "CHAT_IN_PROGRESS");
  assert.deepEqual(chat.quotas.get(USER), [0, 1], "El conflicto no revierte la cuota consumida antes del lock");

  clock.now = 2;
  chat.consumeQuota(USER);
  const oversized = "x".repeat(24_001 - prompt.length);
  assertChatError(() => chat.beginTurn(USER, OTHER_TAB, oversized), 422, "CHAT_CONTEXT_TOO_LARGE");
  assert.deepEqual(chat.quotas.get(USER), [0, 1, 2], "El rechazo de presupuesto tampoco reembolsa la cuota");
  active.release();
});

test("barrido del intervalo de cinco minutos poda cuotas vencidas, borra entradas vacías y conserva lo demás", async (t) => {
  const { chat, clock, intervals } = await quotaFixture(t, { observeTimers: true });
  assert.equal(intervals.length, 1);
  assert.equal(intervals[0]!.delay, SWEEP_MS);
  assert.equal(intervals[0]!.unrefCalls(), 1);

  chat.quotas.set("expired-user", [0, 240_000]);
  chat.quotas.set("mixed-user", [240_000, 240_001]);
  chat.quotas.set("fresh-user", [300_000]);
  const active = chat.beginTurn(USER, TAB, "Sesión no vencida");
  clock.now = SWEEP_MS;
  t.mock.timers.tick(SWEEP_MS);

  assert.equal(intervals[0]!.firings(), 1);
  assert.equal(chat.quotas.has("expired-user"), false, "La entrada vacía después de podar se elimina");
  assert.deepEqual(chat.quotas.get("mixed-user"), [240_001], "Poda timestamps <= now - 60000 solamente");
  assert.deepEqual(chat.quotas.get("fresh-user"), [300_000]);
  assert.equal(chat.sessions.has(KEY), true, "La limpieza de cuotas no toca conversaciones aún vigentes");
  assertChatError(() => chat.beginTurn(USER, TAB, "Lock preservado"), 409, "CHAT_IN_PROGRESS");
  active.release();
});

test("dispose vacía cuotas y cierra admisión de nuevas consumiciones", async (t) => {
  const { chat, dispose } = await quotaFixture(t);
  chat.consumeQuota(USER);
  chat.consumeQuota(OTHER_USER);
  assert.equal(chat.quotas.size, 2);

  dispose();
  assert.equal(chat.quotas.size, 0);
  assert.throws(() => chat.consumeQuota(USER), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.status, 503);
    assert.equal(error.code, "CHAT_UNAVAILABLE");
    return true;
  });
});
