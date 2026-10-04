import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { AppError } from "./errors.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const requestContext: RequestHandler = (request, response, next) => {
  const requestId = request.get("x-request-id")?.slice(0, 100) || randomUUID();
  response.locals.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  const startedAt = performance.now();

  response.on("finish", () => {
    console.log(JSON.stringify({
      level: "info",
      event: "request_completed",
      requestId,
      method: request.method,
      path: request.route?.path ?? request.path,
      status: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    }));
  });

  next();
};

export function requireSameOrigin(appOrigin: string): RequestHandler {
  return (request, _response, next) => {
    if (SAFE_METHODS.has(request.method)) return next();
    if (request.get("origin") !== appOrigin) {
      return next(new AppError(403, "INVALID_ORIGIN", "El origen de la solicitud no es válido."));
    }
    next();
  };
}
