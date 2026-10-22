import assert from "node:assert/strict";
import { test } from "node:test";

const STORAGE_KEY = "blogdpc.chat.v1";
const VALID_UUID = "00000000-0000-4000-8000-000000000001";
const UUID_V4_RFC_VARIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

type StoragePort = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};
type CompletedChatMessage = {
  role: "user" | "assistant";
  content: string;
  status: "completed";
};
type ChatSession = {
  readonly tabSessionId: string;
  readonly messages: CompletedChatMessage[];
  readonly storageDegraded: boolean;
  commit(user: string, assistant: string): void;
};
type CreateChatSession = (storage?: StoragePort) => ChatSession;
type SessionExports = { createChatSession?: CreateChatSession };
type SessionStatus = "unknown" | "anonymous" | "authenticated" | "unverifiable";
type CanSubmit = (status: SessionStatus, online: boolean, isStreaming: boolean, message: string) => boolean;
type ChatSendGuard = { acquire(): boolean; release(): void };
type SessionHelperExports = {
  canSubmit?: CanSubmit;
  createChatSendGuard?: () => ChatSendGuard;
  shouldSendOnEnter?: (key: string, shiftKey: boolean, isComposing: boolean) => boolean;
};

// Se calcula antes de que src/chat/session.ts exista para mantener el import runtime sin alias.
const sessionModuleUrl = new URL("../src/chat/session.ts", import.meta.url);

async function loadCreateChatSession(): Promise<CreateChatSession> {
  const module = await import(sessionModuleUrl.href) as SessionExports;
  assert.equal(typeof module.createChatSession, "function", "Falta exportar createChatSession desde src/chat/session.ts");
  return module.createChatSession!;
}

async function loadSessionHelpers(): Promise<SessionHelperExports> {
  return await import(sessionModuleUrl.href) as SessionHelperExports;
}

function memoryStorage(initial: string | null = null) {
  let current = initial;
  const reads: string[] = [];
  const writes: Array<{ key: string; value: string }> = [];
  const storage: StoragePort = {
    getItem(key) {
      reads.push(key);
      return current;
    },
    setItem(key, value) {
      writes.push({ key, value });
      current = value;
    },
  };
  return {
    storage,
    reads,
    writes,
    get value() { return current; },
  };
}

function completedPair(user: string, assistant: string): CompletedChatMessage[] {
  return [
    { role: "user", content: user, status: "completed" },
    { role: "assistant", content: assistant, status: "completed" },
  ];
}

function installGlobalProperty(name: string, descriptor: PropertyDescriptor): () => void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, ...descriptor });
  return () => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else Reflect.deleteProperty(globalThis, name);
  };
}

test("persistencia de sesión de chat por pestaña", async (t) => {
  const createChatSession = await loadCreateChatSession();
  const sessionHelpers = await loadSessionHelpers();

  await t.test("A32 inicializa un envelope exacto y restaura solo pares confirmados", () => {
    const stored = memoryStorage();
    const session = createChatSession(stored.storage);

    assert.match(session.tabSessionId, UUID_V4_RFC_VARIANT, "la pestaña nueva usa UUIDv4 con variante RFC 4122");
    assert.deepEqual(session.messages, []);
    assert.equal(session.storageDegraded, false);
    assert.deepEqual(stored.reads, [STORAGE_KEY]);
    assert.equal(stored.writes.length, 1, "el estado inicial vacío se persiste una vez");
    assert.equal(stored.writes[0]!.key, STORAGE_KEY);
    assert.deepEqual(JSON.parse(stored.writes[0]!.value), {
      tabSessionId: session.tabSessionId,
      messages: [],
    }, "el envelope no lleva versión ni campos adicionales");

    const user = ` ${"a".repeat(296)}📡 `;
    const assistant = "respuesta amplia ".repeat(25);
    assert.equal(user.length, 300, "el límite mide unidades UTF-16 del texto original");
    assert.ok(assistant.length > 300, "la respuesta no usa el límite de 300 del mensaje de usuario");

    const writesBeforeCommit = stored.writes.length;
    session.commit(user, assistant);
    assert.equal(stored.writes.length, writesBeforeCommit + 1, "el par completo se guarda en una sola escritura");
    assert.deepEqual(JSON.parse(stored.writes.at(-1)!.value), {
      tabSessionId: session.tabSessionId,
      messages: completedPair(user, assistant),
    });
    assert.deepEqual(session.messages, completedPair(user, assistant));

    const afterReload = createChatSession(stored.storage);
    assert.equal(afterReload.tabSessionId, session.tabSessionId);
    assert.deepEqual(afterReload.messages, completedPair(user, assistant), "F5 restaura el par confirmado");
    assert.equal(afterReload.storageDegraded, false);
  });

  await t.test("A33 JSON, UUID y pares incoherentes se reemplazan por una sesión vacía", () => {
    const user = { role: "user", content: "pregunta", status: "completed" };
    const assistant = { role: "assistant", content: "respuesta", status: "completed" };
    const invalidEnvelopes: Array<[string, string]> = [
      ["JSON corrupto", "{no-json"],
      ["UUID versión 3", JSON.stringify({ tabSessionId: "00000000-0000-3000-8000-000000000001", messages: [] })],
      ["variante UUID inválida", JSON.stringify({ tabSessionId: "00000000-0000-4000-7000-000000000001", messages: [] })],
      ["turno user huérfano", JSON.stringify({ tabSessionId: VALID_UUID, messages: [user] })],
      ["roles fuera de alternancia", JSON.stringify({ tabSessionId: VALID_UUID, messages: [assistant, user] })],
      ["estado pendiente", JSON.stringify({ tabSessionId: VALID_UUID, messages: [user, { ...assistant, status: "pending" }] })],
      ["contenido vacío", JSON.stringify({ tabSessionId: VALID_UUID, messages: [{ ...user, content: "" }, assistant] })],
      ["contenido no textual", JSON.stringify({ tabSessionId: VALID_UUID, messages: [{ ...user, content: 17 }, assistant] })],
      ["rol no admitido", JSON.stringify({ tabSessionId: VALID_UUID, messages: [{ ...user, role: "system" }, assistant] })],
    ];

    for (const [label, invalidValue] of invalidEnvelopes) {
      const stored = memoryStorage(invalidValue);
      const session = createChatSession(stored.storage);

      assert.match(session.tabSessionId, UUID_V4_RFC_VARIANT, `${label}: se genera un UUIDv4 nuevo`);
      assert.notEqual(session.tabSessionId, VALID_UUID, `${label}: no se conserva el UUID del envelope inválido`);
      assert.deepEqual(session.messages, [], `${label}: no se restaura historial parcial`);
      assert.equal(session.storageDegraded, false);
      assert.equal(stored.writes.length, 1, `${label}: reemplaza el envelope por el estado vacío`);
      assert.equal(stored.writes[0]!.key, STORAGE_KEY);
      assert.deepEqual(JSON.parse(stored.value!), { tabSessionId: session.tabSessionId, messages: [] });
    }
  });

  await t.test("commit rechaza entradas inválidas sin confirmar y conserva el texto aceptado", () => {
    const stored = memoryStorage();
    const session = createChatSession(stored.storage);
    const writesAfterInitialization = stored.writes.length;
    const tooLongUser = ` ${"a".repeat(297)}📡 `;
    assert.equal(tooLongUser.length, 301);

    for (const invalidUser of ["", " \t\n ", tooLongUser]) {
      assert.throws(() => session.commit(invalidUser, "respuesta"), "usuario vacío/solo espacios o mayor de 300 UTF-16 se rechaza");
      assert.deepEqual(session.messages, []);
      assert.equal(stored.writes.length, writesAfterInitialization, "una entrada inválida no se persiste");
    }
    assert.throws(() => session.commit("pregunta", ""), "la respuesta asistente debe ser no vacía");
    assert.deepEqual(session.messages, []);
    assert.equal(stored.writes.length, writesAfterInitialization);

    const validUser = "  pregunta original  ";
    const validAssistant = " ";
    session.commit(validUser, validAssistant);
    assert.deepEqual(session.messages, completedPair(validUser, validAssistant), "conserva texto original y acepta respuesta no vacía sin límite 300");
    assert.equal(stored.writes.length, writesAfterInitialization + 1);
  });

  await t.test("A34 SecurityError al obtener sessionStorage degrada a RAM sin APIs de persistencia compartida", () => {
    const securityError = new Error("sessionStorage bloqueado");
    securityError.name = "SecurityError";
    let forbiddenStorageAccesses = 0;
    const forbidden = () => {
      forbiddenStorageAccesses += 1;
      throw new Error("No se debe acceder a localStorage ni BroadcastChannel");
    };
    const fakeWindow = {};
    Object.defineProperties(fakeWindow, {
      sessionStorage: { configurable: true, get() { throw securityError; } },
      localStorage: { configurable: true, get: forbidden },
      BroadcastChannel: { configurable: true, get: forbidden },
    });

    const restoreWindow = installGlobalProperty("window", { value: fakeWindow, writable: true });
    const restoreLocalStorage = installGlobalProperty("localStorage", { get: forbidden });
    const restoreBroadcastChannel = installGlobalProperty("BroadcastChannel", { get: forbidden });
    try {
      const session = createChatSession();
      assert.equal(session.storageDegraded, true);
      assert.match(session.tabSessionId, UUID_V4_RFC_VARIANT);
      assert.deepEqual(session.messages, []);

      session.commit("pregunta en RAM", "respuesta en RAM");
      assert.equal(session.storageDegraded, true);
      assert.deepEqual(session.messages, completedPair("pregunta en RAM", "respuesta en RAM"));
      assert.equal(forbiddenStorageAccesses, 0);
    } finally {
      restoreBroadcastChannel();
      restoreLocalStorage();
      restoreWindow();
    }
  });

  await t.test("A34 cuota agotada conserva el commit en memoria y marca storage degradado", () => {
    const writes: string[] = [];
    const quotaStorage: StoragePort = {
      getItem(key) {
        assert.equal(key, STORAGE_KEY);
        return null;
      },
      setItem(key, value) {
        assert.equal(key, STORAGE_KEY);
        writes.push(value);
        const quotaError = new Error("cuota llena");
        quotaError.name = "QuotaExceededError";
        throw quotaError;
      },
    };
    const session = createChatSession(quotaStorage);

    assert.equal(session.storageDegraded, true);
    session.commit("pregunta", "respuesta que debe seguir en RAM");
    assert.equal(session.storageDegraded, true);
    assert.deepEqual(session.messages, completedPair("pregunta", "respuesta que debe seguir en RAM"));
    assert.ok(writes.length >= 1, "la persistencia se intentó y el fallo de cuota fue tolerado");
  });

  await t.test("A35 no expone borrado/logout/rotación y una sesión posterior conserva el envelope", () => {
    const stored = memoryStorage();
    const session = createChatSession(stored.storage);
    session.commit("historia anterior", "respuesta anterior");
    const savedEnvelope = stored.value;

    for (const forbiddenMethod of ["clear", "reset", "logout", "rotate"]) {
      assert.equal(forbiddenMethod in session, false, `la API no expone ${forbiddenMethod}`);
    }

    const afterLogoutAndReload = createChatSession(stored.storage);
    assert.equal(afterLogoutAndReload.tabSessionId, session.tabSessionId);
    assert.deepEqual(afterLogoutAndReload.messages, completedPair("historia anterior", "respuesta anterior"));
    assert.equal(stored.value, savedEnvelope, "el historial local no se borra ni rota al cambiar la sesión de cuenta");
  });

  await t.test("A39 canSubmit exige authenticated, online, sin streaming y mensaje original válido", () => {
    assert.equal(typeof sessionHelpers.canSubmit, "function", "Falta exportar canSubmit desde src/chat/session.ts");
    const canSubmit = sessionHelpers.canSubmit!;

    assert.equal(canSubmit("authenticated", true, false, " pregunta "), true);
    for (const status of ["unknown", "anonymous", "unverifiable"] as const) {
      assert.equal(canSubmit(status, true, false, "pregunta"), false, `${status} no puede enviar`);
    }
    assert.equal(canSubmit("authenticated", false, false, "pregunta"), false, "offline bloquea envío");
    assert.equal(canSubmit("authenticated", true, true, "pregunta"), false, "un turno activo bloquea envío");
    assert.equal(canSubmit("authenticated", true, false, ""), false);
    assert.equal(canSubmit("authenticated", true, false, " \t\n "), false);

    const exactly300 = ` ${"a".repeat(296)}📡 `;
    const tooLong301 = ` ${"a".repeat(297)}📡 `;
    assert.equal(exactly300.length, 300);
    assert.equal(tooLong301.length, 301);
    assert.equal(canSubmit("authenticated", true, false, exactly300), true, "300 unidades UTF-16 originales se admiten");
    assert.equal(canSubmit("authenticated", true, false, tooLong301), false, "301 unidades UTF-16 se rechazan");
  });

  await t.test("A38 guard síncrono bloquea doble adquisición hasta release idempotente", () => {
    assert.equal(typeof sessionHelpers.createChatSendGuard, "function", "Falta exportar createChatSendGuard desde src/chat/session.ts");
    const guard = sessionHelpers.createChatSendGuard!();

    assert.equal(guard.acquire(), true, "la primera operación adquiere el guard");
    assert.equal(guard.acquire(), false, "un segundo evento previo al rerender queda bloqueado");
    guard.release();
    guard.release();
    assert.equal(guard.acquire(), true, "release repetido es seguro y permite otra operación");
    assert.equal(guard.acquire(), false, "la nueva operación vuelve a bloquear dobles envíos");
    guard.release();
    assert.equal(guard.acquire(), true, "release vuelve a habilitar una adquisición");
    guard.release();
  });

  await t.test("Enter envía solo sin Shift y fuera de composición IME", () => {
    assert.equal(typeof sessionHelpers.shouldSendOnEnter, "function", "Falta exportar shouldSendOnEnter desde src/chat/session.ts");
    const shouldSendOnEnter = sessionHelpers.shouldSendOnEnter!;

    assert.equal(shouldSendOnEnter("Enter", false, false), true, "Enter confirma el envío");
    assert.equal(shouldSendOnEnter("Enter", true, false), false, "Shift+Enter conserva el salto de línea");
    assert.equal(shouldSendOnEnter("Enter", false, true), false, "Enter durante composición IME no envía");
    assert.equal(shouldSendOnEnter("Escape", false, false), false);
    assert.equal(shouldSendOnEnter("a", false, false), false);
  });
});
