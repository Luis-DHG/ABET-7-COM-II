import { once } from "node:events";
import { Router } from "express";
import { chatRequestSchema } from "@blogdpc/contracts";
import type { AuthModule } from "../auth/module.js";
import type { AppConfig } from "../config.js";
import { ACCESS_COOKIE, readCookie } from "../http/cookies.js";
import { AppError, parseWith } from "../http/errors.js";
import type { ChatModule } from "./module.js";
import { streamChat } from "./provider.js";

export function createChatRouter(
  chat: ChatModule,
  auth: Pick<AuthModule, "authenticateChatUser">,
  config: Pick<AppConfig, "chat">,
  provider: typeof streamChat = streamChat,
): Router {
  const router = Router();
  router.post("/", async (request, response, next) => {
    let turn: ReturnType<ChatModule["beginTurn"]> | undefined;
    let disconnected = false;
    const abort = () => {
      disconnected = true;
      turn?.abort();
    };
    const requestClose = () => {
      if (request.aborted || !request.complete) abort();
    };
    const responseClose = () => {
      if (!response.writableEnded) abort();
    };
    request.on("close", requestClose);
    response.on("close", responseClose);
    try {
      const userId = await auth.authenticateChatUser(readCookie(request, ACCESS_COOKIE));
      const { tabSessionId, message } = parseWith(chatRequestSchema, request.body);
      if (disconnected || response.destroyed) return;
      chat.consumeQuota(userId);
      const activeTurn = chat.beginTurn(userId, tabSessionId, message);
      turn = activeTurn;
      const write = async (frame: string) => {
        if (activeTurn.signal.aborted || response.destroyed) throw new Error("Solicitud cancelada.");
        if (!response.write(frame)) await once(response, "drain", { signal: activeTurn.signal });
      };
      const content = await provider({
        ...config.chat,
        messages: activeTurn.messages,
        externalSignal: activeTurn.signal,
      }, async (chunk) => {
        if (!chunk) return;
        if (activeTurn.signal.aborted || response.destroyed) throw new Error("Solicitud cancelada.");
        activeTurn.touch();
        if (!response.headersSent) {
          response.status(200);
          response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
          response.setHeader("Cache-Control", "no-store, no-transform");
          response.setHeader("X-Accel-Buffering", "no");
        }
        await write(`data: ${JSON.stringify({ chunk })}\n\n`);
      });
      if (activeTurn.signal.aborted || response.destroyed) return;
      activeTurn.commit(content);
      await write("data: [DONE]\n\n");
      response.end();
    } catch (error) {
      if (disconnected || response.destroyed) return;
      if (response.headersSent) {
        response.end(`event: error\ndata: ${JSON.stringify({
          error: { code: "CHAT_STREAM_INTERRUPTED", message: "La respuesta se interrumpió. Intenta de nuevo." },
          requestId: response.locals.requestId,
        })}\n\n`);
      } else if (error instanceof AppError && error.code === "CHAT_STREAM_INTERRUPTED") {
        next(new AppError(503, "CHAT_UNAVAILABLE", "El asistente no está disponible en este momento. Intenta de nuevo."));
      } else {
        next(error instanceof AppError ? error : new AppError(500, "INTERNAL_ERROR", "Ocurrió un error interno."));
      }
    } finally {
      request.off("close", requestClose);
      response.off("close", responseClose);
      turn?.release();
    }
  });
  return router;
}
