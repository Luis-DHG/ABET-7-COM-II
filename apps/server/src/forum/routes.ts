import { Router } from "express";
import { z } from "zod";
import { commentsQuerySchema, createCommentSchema } from "@blogdpc/contracts";
import type { AuthModule } from "../auth/module.js";
import { ACCESS_COOKIE, readCookie } from "../http/cookies.js";
import { parseWith } from "../http/errors.js";
import { createCommentBroadcaster, type CommentBroadcaster } from "./broadcaster.js";
import type { ForumModule } from "./module.js";

export function createForumRouter(
  forum: ForumModule,
  auth: AuthModule,
  broadcaster: CommentBroadcaster = createCommentBroadcaster(),
  heartbeatIntervalMs = 15_000,
): Router {
  const router = Router();
  const uuidSchema = z.string().uuid();

  router.get("/", async (request, response) => {
    const result = await forum.list(parseWith(commentsQuerySchema, request.query));
    response.json({ data: result.comments, meta: { nextCursor: result.nextCursor } });
  });

  router.get("/stream", (request, response) => {
    response.status(200);
    response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    response.setHeader("Cache-Control", "no-store, no-transform");
    response.setHeader("X-Accel-Buffering", "no");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders();

    let cleanedUp = false;
    let heartbeatTimer: NodeJS.Timeout | null = null;
    let unsubscribe: (() => void) | null = null;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      if (unsubscribe !== null) {
        unsubscribe();
        unsubscribe = null;
      }
    };

    if (request.destroyed || response.destroyed || response.writableEnded) {
      cleanup();
      return;
    }

    heartbeatTimer = setInterval(() => {
      if (response.destroyed || response.writableEnded) {
        cleanup();
        return;
      }
      response.write(": heartbeat\n\n");
    }, heartbeatIntervalMs);
    heartbeatTimer.unref();

    unsubscribe = broadcaster.subscribe(({ rootId }) => {
      if (response.destroyed || response.writableEnded) {
        cleanup();
        return;
      }
      response.write(`event: comment.created\ndata: ${JSON.stringify({ rootId })}\n\n`);
    });

    request.on("close", cleanup);
    response.on("close", cleanup);
  });

  router.get("/:rootId/thread", async (request, response) => {
    const rootId = parseWith(uuidSchema, request.params.rootId);
    response.json({ data: await forum.getThread(rootId) });
  });

  router.post("/", async (request, response) => {
    const claims = await auth.authenticateAccessToken(readCookie(request, ACCESS_COOKIE));
    const comment = await forum.publish(claims.sub, parseWith(createCommentSchema, request.body));
    broadcaster.emit({ rootId: comment.rootId });
    response.status(201).json({ data: comment });
  });

  return router;
}
