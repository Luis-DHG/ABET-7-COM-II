import type { SessionStatus } from "../session/SessionProvider";

const STORAGE_KEY = "blogdpc.chat.v1";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export type CompletedChatMessage = { role: "user" | "assistant"; content: string; status: "completed" };
type Envelope = { tabSessionId: string; messages: CompletedChatMessage[] };

export function canSubmit(status: SessionStatus, online: boolean, isStreaming: boolean, message: string): boolean {
  return status === "authenticated" && online && !isStreaming
    && message.length > 0 && message.length <= 300 && message.trim().length > 0;
}

export function shouldSendOnEnter(key: string, shiftKey: boolean, isComposing: boolean): boolean {
  return key === "Enter" && !shiftKey && !isComposing;
}

export function createChatSendGuard() {
  let busy = false;
  return {
    acquire() {
      if (busy) return false;
      busy = true;
      return true;
    },
    release() { busy = false; },
  };
}

function validEnvelope(value: unknown): value is Envelope {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Partial<Envelope>;
  return typeof envelope.tabSessionId === "string" && UUID_V4.test(envelope.tabSessionId)
    && Array.isArray(envelope.messages) && envelope.messages.length % 2 === 0
    && envelope.messages.every((entry, index) => entry && typeof entry === "object"
      && entry.role === (index % 2 === 0 ? "user" : "assistant") && entry.status === "completed"
      && typeof entry.content === "string" && entry.content.length > 0
      && (index % 2 !== 0 || (entry.content.length <= 300 && entry.content.trim().length > 0)));
}

export function createChatSession(storage?: Pick<Storage, "getItem" | "setItem">) {
  let envelope: Envelope | undefined;
  let storageDegraded = false;
  try {
    storage ??= window.sessionStorage;
    const raw = storage.getItem(STORAGE_KEY);
    if (raw !== null) {
      // Un JSON corrupto no implica que el almacenamiento esté bloqueado.
      try {
        const parsed: unknown = JSON.parse(raw);
        if (validEnvelope(parsed)) envelope = {
          tabSessionId: parsed.tabSessionId,
          messages: parsed.messages.map(({ role, content, status }) => ({ role, content, status })),
        };
      } catch { /* Recuperar un envelope vacío. */ }
    }
  } catch {
    storageDegraded = true;
    storage = undefined;
  }
  const fresh = !envelope;
  let current: Envelope = envelope ?? { tabSessionId: crypto.randomUUID(), messages: [] };
  function persist() {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      storageDegraded = true;
      storage = undefined;
    }
  }
  if (fresh) persist();
  return {
    get tabSessionId() { return current.tabSessionId; },
    get messages() { return current.messages; },
    get storageDegraded() { return storageDegraded; },
    commit(user: string, assistant: string) {
      if (!user.trim() || user.length > 300 || !assistant.length) throw new Error("El turno no está completo o es inválido.");
      current = { tabSessionId: current.tabSessionId, messages: [
        ...current.messages,
        { role: "user", content: user, status: "completed" },
        { role: "assistant", content: assistant, status: "completed" },
      ] };
      persist();
    },
  };
}
