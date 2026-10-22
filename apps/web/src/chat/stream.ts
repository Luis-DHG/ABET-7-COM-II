export async function consumeChatStream(
  response: Response,
  onChunk: (chunk: string) => void | Promise<void>,
  signal?: AbortSignal,
): Promise<string> {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let abort!: () => void;
  const interrupted = new Promise<never>((_resolve, reject) => {
    abort = () => reject(new Error("Solicitud cancelada."));
  });
  signal?.addEventListener("abort", abort, { once: true });
  try {
    signal?.throwIfAborted();
    if (!response.ok || !response.body || !/^text\/event-stream(?:\s*;|$)/iu.test(response.headers.get("content-type") ?? "")) {
      throw new Error("Respuesta inválida.");
    }
    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let data: string[] = [];
    let eventName = "message";
    let content = "";
    while (true) {
      const part = await Promise.race([reader.read(), interrupted]);
      if (part.done) throw new Error("Falta el terminal del stream.");
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
          if (name !== "message") throw new Error("Respuesta interrumpida.");
          if (raw === "[DONE]") {
            if (!content) throw new Error("Respuesta vacía.");
            return content;
          }
          const payload: unknown = JSON.parse(raw);
          if (!payload || typeof payload !== "object" || !("chunk" in payload) || typeof payload.chunk !== "string") {
            throw new Error("Evento inválido.");
          }
          if (payload.chunk) {
            await Promise.race([Promise.resolve(onChunk(payload.chunk)), interrupted]);
            content += payload.chunk;
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
    throw new Error("La respuesta se interrumpió. Intenta de nuevo.");
  } finally {
    signal?.removeEventListener("abort", abort);
    if (reader) {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
    } else {
      await response.body?.cancel().catch(() => undefined);
    }
  }
}
