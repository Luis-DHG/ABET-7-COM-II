import { AppError } from "../http/errors.js";
import { SYSTEM_PROMPT } from "./prompt.js";

export type ChatMessage = { role: string; content: string };
type ChatSession = { messages: ChatMessage[]; lastActive: number };

export function createChatModule({ now = () => Date.now() }: { now?: () => number } = {}) {
  const sessions = new Map<string, ChatSession>();
  const quotas = new Map<string, number[]>();
  const locks = new Set<string>();
  const controllers = new Set<AbortController>();
  let disposed = false;

  function sweep() {
    const time = now();
    for (const [key, session] of sessions) {
      if (time - session.lastActive > 30 * 60 * 1000) sessions.delete(key);
    }
    for (const [userId, timestamps] of quotas) {
      const active = timestamps.filter((timestamp) => timestamp > time - 60000);
      if (active.length) quotas.set(userId, active);
      else quotas.delete(userId);
    }
  }

  const interval = setInterval(sweep, 5 * 60 * 1000);
  interval.unref();

  function beginTurn(userId: string, tabSessionId: string, message: string) {
    if (disposed) throw new AppError(503, "CHAT_UNAVAILABLE", "El asistente no está disponible en este momento. Intenta de nuevo.");
    const key = `${userId}:${tabSessionId}`;
    if (locks.has(key)) throw new AppError(409, "CHAT_IN_PROGRESS", "Ya hay una respuesta en curso en esta conversación.");
    locks.add(key);
    const session = sessions.get(key) ?? { messages: [], lastActive: now() };
    session.lastActive = now();
    sessions.set(key, session);
    let candidate = session.messages.map((entry) => ({ ...entry }));
    const inputSize = () => SYSTEM_PROMPT.length + message.length
      + candidate.reduce((size, entry) => size + entry.content.length, 0);
    if (inputSize() / 4 > 6000) candidate = candidate.slice(-2);
    if (inputSize() / 4 > 6000) {
      locks.delete(key);
      throw new AppError(422, "CHAT_CONTEXT_TOO_LARGE", "El contexto de la conversación excede el límite permitido.");
    }

    const controller = new AbortController();
    controllers.add(controller);
    let released = false;
    let committed = false;

    function release() {
      if (released) return;
      released = true;
      locks.delete(key);
      controllers.delete(controller);
      controller.signal.removeEventListener("abort", release);
    }
    controller.signal.addEventListener("abort", release, { once: true });

    return {
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...candidate.map((entry) => ({ ...entry })), { role: "user", content: message }],
      signal: controller.signal,
      abort: () => controller.abort(),
      touch() {
        if (released || committed || disposed) return;
        const current = sessions.get(key);
        if (current) current.lastActive = now();
      },
      commit(content: string) {
        if (released || committed || disposed || controller.signal.aborted) return;
        if (!content) throw new Error("No se puede confirmar una respuesta vacía.");
        committed = true;
        sessions.set(key, {
          messages: [...candidate, { role: "user", content: message }, { role: "assistant", content }],
          lastActive: now(),
        });
      },
      release,
    };
  }

  return {
    sessions,
    quotas,
    consumeQuota(userId: string) {
      if (disposed) throw new AppError(503, "CHAT_UNAVAILABLE", "El asistente no está disponible en este momento. Intenta de nuevo.");
      const time = now();
      const active = (quotas.get(userId) ?? []).filter((timestamp) => timestamp > time - 60000);
      if (active.length >= 10) {
        throw new AppError(429, "CHAT_RATE_LIMITED", "Demasiadas solicitudes al asistente. Intenta más tarde.", {
          retryAfterSeconds: Math.ceil((active[0]! + 60000 - time) / 1000),
        });
      }
      active.push(time);
      quotas.set(userId, active);
    },
    beginTurn,
    sweep,
    dispose() {
      if (disposed) return;
      disposed = true;
      clearInterval(interval);
      for (const controller of controllers) controller.abort();
      sessions.clear();
      quotas.clear();
    },
  };
}

export type ChatModule = ReturnType<typeof createChatModule>;
