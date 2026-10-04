import { Router } from "express";
import { z } from "zod";
import { commentsQuerySchema, createCommentSchema } from "@blogdpc/contracts";
import type { AuthModule } from "../auth/module.js";
import { ACCESS_COOKIE, readCookie } from "../http/cookies.js";
import { parseWith } from "../http/errors.js";
import type { ForumModule } from "./module.js";

export function createForumRouter(forum: ForumModule, auth: AuthModule): Router {
  const router = Router();
  const uuidSchema = z.string().uuid();

  router.get("/", async (request, response) => {
    const result = await forum.list(parseWith(commentsQuerySchema, request.query));
    response.json({ data: result.comments, meta: { nextCursor: result.nextCursor } });
  });

  router.get("/:rootId/thread", async (request, response) => {
    const rootId = parseWith(uuidSchema, request.params.rootId);
    response.json({ data: await forum.getThread(rootId) });
  });

  router.post("/", async (request, response) => {
    const claims = await auth.authenticateAccessToken(readCookie(request, ACCESS_COOKIE));
    const comment = await forum.publish(claims.sub, parseWith(createCommentSchema, request.body));
    response.status(201).json({ data: comment });
  });

  return router;
}
