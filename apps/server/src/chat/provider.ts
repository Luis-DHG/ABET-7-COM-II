import { AppError } from "../http/errors.js";
import type { ChatMessage } from "./module.js";

type AttemptInput = {
  model: string;
  endpoint: string;
  apiKey: string;
  messages: ChatMessage[];
  ttfbMs: number;
  externalSignal?: AbortSignal;
};
type OnChunk = (chunk: string) => void | Promise<void>;

export async function streamChat(input: {
  messages: ChatMessage[];
  nvidiaApiKey: string;
  openrouterApiKey: string;
  geminiApiKey: string;
  externalSignal?: AbortSignal;
  fetchImpl?: typeof fetch;
}, onChunk: OnChunk): Promise<string> {
  const pool = [
    { model: "nvidia/nemotron-3.5-lightning-30b-a3b", endpoint: "https://integrate.api.nvidia.com/v1/chat/completions", apiKey: input.nvidiaApiKey, ttfbMs: 5000 },
    { model: "nvidia/nemotron-3.5-lightning:free", endpoint: "https://openrouter.ai/api/v1/chat/completions", apiKey: input.openrouterApiKey, ttfbMs: 6000 },
    { model: "gemini-2.5-flash", endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", apiKey: input.geminiApiKey, ttfbMs: 6000 },
  ];
  let emitted = false;
  for (const provider of pool) {
    if (input.externalSignal?.aborted) {
      throw new AppError(503, "CHAT_STREAM_INTERRUPTED", "La respuesta se interrumpió. Intenta de nuevo.");
    }
    try {
      return await streamChatAttempt({
        ...provider,
        messages: input.messages,
        externalSignal: input.externalSignal,
      }, (chunk) => {
        emitted = true;
        return onChunk(chunk);
      }, input.fetchImpl);
    } catch {
      if (emitted || input.externalSignal?.aborted) {
        throw new AppError(503, "CHAT_STREAM_INTERRUPTED", "La respuesta se interrumpió. Intenta de nuevo.");
      }
    }
  }
  throw new AppError(503, "CHAT_UNAVAILABLE", "El asistente no está disponible en este momento. Intenta de nuevo.");
}

export async function streamChatAttempt(input: AttemptInput, onChunk: OnChunk, fetchImpl = fetch): Promise<string> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  let rejectAbort!: () => void;
  const interrupted = new Promise<never>((_resolve, reject) => {
    rejectAbort = () => reject(new Error("La solicitud del proveedor fue cancelada."));
  });
  // La carrera también cancela lecturas de streams inyectados que no observan signal.
  controller.signal.addEventListener("abort", rejectAbort, { once: true });
  input.externalSignal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, input.ttfbMs);
  let response: Response | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let output = "";
  let buffer = "";
  let data: string[] = [];
  let eventName = "message";
  try {
    if (input.externalSignal?.aborted) throw new Error("Solicitud cancelada.");
    const pending = fetchImpl(input.endpoint, {
      method: "POST",
      redirect: "error",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${input.apiKey}` },
      body: JSON.stringify({ model: input.model, messages: input.messages, stream: true, max_tokens: 700 }),
      signal: controller.signal,
    });
    void pending.then((lateResponse) => {
      if (controller.signal.aborted && lateResponse !== response) void lateResponse.body?.cancel().catch(() => undefined);
    }, () => undefined);
    response = await Promise.race([pending, interrupted]);
    if (!response.ok || !response.body || !/^text\/event-stream(?:\s*;|$)/iu.test(response.headers.get("content-type") ?? "")) {
      throw new Error("Respuesta de proveedor inválida.");
    }
    reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const part = await Promise.race([reader.read(), interrupted]);
      if (part.done) throw new Error("Falta el terminal del proveedor.");
      buffer += decoder.decode(part.value, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newline).replace(/\r$/u, "");
        buffer = buffer.slice(newline + 1);
        if (line === "") {
          const raw = data.join("\n");
          const name = eventName;
          data = [];
          eventName = "message";
          if (!raw) continue;
          if (name === "error") throw new Error("Error del proveedor.");
          if (raw === "[DONE]") {
            if (!output) throw new Error("Respuesta vacía.");
            return output;
          }
          const payload = JSON.parse(raw);
          if (!payload || typeof payload !== "object" || payload.error || !Array.isArray(payload.choices)) {
            throw new Error("Evento del proveedor inválido.");
          }
          const content = payload.choices[0]?.delta?.content;
          if (content !== undefined && content !== null && typeof content !== "string") throw new Error("Contenido inválido.");
          if (typeof content === "string" && content.length > 0) {
            clearTimeout(timer);
            await Promise.race([Promise.resolve(onChunk(content)), interrupted]);
            output += content;
          }
        } else if (!line.startsWith(":")) {
          const colon = line.indexOf(":");
          const field = colon < 0 ? line : line.slice(0, colon);
          const value = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /u, "");
          if (field === "data") data.push(value);
          if (field === "event") eventName = value;
        }
      }
    }
  } catch {
    // No propagar cuerpos, claves, errores de fetch ni cause del proveedor a logs.
    throw new Error("No se pudo completar la respuesta del proveedor.");
  } finally {
    clearTimeout(timer);
    input.externalSignal?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", rejectAbort);
    controller.abort();
    if (reader) {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
    } else {
      await response?.body?.cancel().catch(() => undefined);
    }
  }
}
