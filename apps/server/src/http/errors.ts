import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError, type ZodType } from "zod";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: {
      fieldErrors?: Record<string, string[]>;
      retryAfterSeconds?: number;
    },
  ) {
    super(message);
  }
}

export function parseWith<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (!(error instanceof ZodError)) throw error;
    const flattened = error.flatten();
    throw new AppError(400, "VALIDATION_ERROR", "Revisa los datos enviados.", {
      fieldErrors: flattened.fieldErrors as Record<string, string[]>,
    });
  }
}

export const notFound: RequestHandler = (request, _response, next) => {
  next(new AppError(404, "NOT_FOUND", `No existe ${request.method} ${request.path}.`));
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const appError = error instanceof AppError
    ? error
    : typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed"
      ? new AppError(400, "INVALID_JSON", "El cuerpo JSON no es válido.")
      : new AppError(500, "INTERNAL_ERROR", "Ocurrió un error interno.");

  if (appError.details?.retryAfterSeconds !== undefined) {
    response.setHeader("Retry-After", String(appError.details.retryAfterSeconds));
  }

  if (appError.status >= 500) {
    console.error(JSON.stringify({
      level: "error",
      event: "request_failed",
      requestId: response.locals.requestId,
      method: request.method,
      path: request.path,
      code: appError.code,
      error: error instanceof Error ? error.message : "unknown",
    }));
  }

  response.status(appError.status).json({
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details?.fieldErrors ? { fieldErrors: appError.details.fieldErrors } : {}),
      ...(appError.details?.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: appError.details.retryAfterSeconds }
        : {}),
    },
    requestId: response.locals.requestId,
  });
};
