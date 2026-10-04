import { existsSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { sql } from "drizzle-orm";
import type { AppConfig } from "./config.js";
import type { Database } from "./db/client.js";
import type { Mailer } from "./mail/index.js";
import { createAuthModule } from "./auth/module.js";
import { createAuthRouter } from "./auth/routes.js";
import { createForumModule } from "./forum/module.js";
import { createForumRouter } from "./forum/routes.js";
import { createAdminModule } from "./admin/module.js";
import { createAdminRouter } from "./admin/routes.js";
import { errorHandler, notFound } from "./http/errors.js";
import { requestContext, requireSameOrigin } from "./http/middleware.js";

export function createApp(config: AppConfig, db: Database, mailer: Mailer): Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxyHops);
  app.use(requestContext);
  app.use(helmet());
  app.use(express.json({ limit: "32kb" }));
  app.use(requireSameOrigin(config.appOrigin));

  const auth = createAuthModule(db, config, mailer);
  const forum = createForumModule(db);
  const admin = createAdminModule(db);
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: { code: "RATE_LIMITED", message: "Demasiadas solicitudes. Intenta más tarde." },
        requestId: response.locals.requestId,
      });
    },
  });

  app.get("/api/health/live", (_request, response) => {
    response.json({ data: { status: "ok" } });
  });
  app.get("/api/health/ready", async (_request, response) => {
    await db.execute(sql`select 1`);
    response.json({ data: { status: "ready" } });
  });
  app.use("/api/auth", authLimiter, createAuthRouter(auth, config));
  app.use("/api/comments", createForumRouter(forum, auth));
  app.use("/api/admin", createAdminRouter(admin, auth));
  app.use("/api", notFound);

  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const webDistPath = config.webDistPath
    ? resolve(config.webDistPath)
    : resolve(currentDirectory, "../../web/dist");
  const indexPath = join(webDistPath, "index.html");

  if (existsSync(webDistPath)) {
    app.use("/assets", express.static(join(webDistPath, "assets"), {
      immutable: true,
      index: false,
      maxAge: "1y",
    }));
    app.use(express.static(webDistPath, { index: false, maxAge: "1h" }));
  }

  app.use((request, response, next) => {
    if (request.method !== "GET" || extname(request.path) || !request.accepts("html") || !existsSync(indexPath)) return next();
    response.setHeader("Cache-Control", "no-store");
    response.sendFile(indexPath);
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
