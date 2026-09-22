import { Router } from "express";
import { z } from "zod";
import { adminCommentsQuerySchema, adminUsersQuerySchema } from "@blogdpc/contracts";
import type { AuthModule } from "../auth/module.js";
import { ACCESS_COOKIE, readCookie } from "../http/cookies.js";
import { parseWith } from "../http/errors.js";
import type { AdminModule } from "./module.js";

const uuidSchema = z.string().uuid();

export function createAdminRouter(admin: AdminModule, auth: AuthModule): Router {
  const router = Router();

  router.get("/comments", async (request, response) => {
    const claims = await auth.authenticateAccessToken(readCookie(request, ACCESS_COOKIE));
    const result = await admin.listComments(claims.sub, parseWith(adminCommentsQuerySchema, request.query));
    response.json({ data: result.comments, meta: { nextCursor: result.nextCursor } });
  });

  router.patch("/comments/:id", async (request, response) => {
    const claims = await auth.authenticateAccessToken(readCookie(request, ACCESS_COOKIE));
    await admin.moderateComment(claims.sub, parseWith(uuidSchema, request.params.id));
    response.json({ data: { status: "REMOVED" } });
  });

  router.get("/users", async (request, response) => {
    const claims = await auth.authenticateAccessToken(readCookie(request, ACCESS_COOKIE));
    const result = await admin.listUsers(claims.sub, parseWith(adminUsersQuerySchema, request.query));
    response.json({ data: result.users, meta: { nextCursor: result.nextCursor } });
  });

  router.post("/users/:id/ban", async (request, response) => {
    const claims = await auth.authenticateAccessToken(readCookie(request, ACCESS_COOKIE));
    await admin.banUser(claims.sub, parseWith(uuidSchema, request.params.id));
    response.json({ data: { status: "BANNED" } });
  });

  return router;
}
