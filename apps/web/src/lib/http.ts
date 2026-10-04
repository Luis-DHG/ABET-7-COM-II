// Cliente HTTP mínimo sobre fetch (plan §8.4):
// - credenciales same-origin (cookies HttpOnly)
// - parseo uniforme del envelope { data } / { error }
// - un solo reintento tras refresh, refresh compartido (single-flight)
// - AbortController vía signal

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: Record<string, string[]>;
  readonly retryAfterSeconds?: number;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string[]>,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
}

type SessionInvalidListener = () => void;
const sessionInvalidListeners = new Set<SessionInvalidListener>();

export function onSessionInvalid(listener: SessionInvalidListener): () => void {
  sessionInvalidListeners.add(listener);
  return () => sessionInvalidListeners.delete(listener);
}

let refreshPromise: Promise<"ok" | "invalid" | "unverifiable"> | null = null;

function refreshSession(): Promise<"ok" | "invalid" | "unverifiable"> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
        });
        return response.ok ? "ok" : response.status === 429 || response.status >= 500 ? "unverifiable" : "invalid";
      } catch {
        return "unverifiable";
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

export interface ApiResult<T> {
  data: T;
  meta?: { nextCursor: string | null };
}

export async function api<T>(path: string, options: ApiOptions = {}, canRetry = true): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method ?? "GET",
      credentials: "same-origin",
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "NETWORK_ERROR", "No hay conexión con el servidor. Reintentar más tarde.");
  }

  if (response.status === 401 && canRetry && (!path.startsWith("/api/auth/") || path === "/api/auth/session")) {
    const refreshed = await refreshSession();
    if (refreshed === "ok") return api<T>(path, options, false);
    if (refreshed === "unverifiable") throw new ApiError(0, "NETWORK_ERROR", "No se pudo comprobar la sesión.");
    for (const listener of sessionInvalidListeners) listener();
  }
  if (response.status === 401 && !canRetry) {
    for (const listener of sessionInvalidListeners) listener();
  }

  if (response.status === 204) return { data: undefined as T };

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!response.ok) {
    const errorBody = (payload as { error?: { code?: string; message?: string; fieldErrors?: Record<string, string[]>; retryAfterSeconds?: number } })?.error;
    throw new ApiError(
      response.status,
      errorBody?.code ?? "UNKNOWN_ERROR",
      errorBody?.message ?? "Ocurrió un error inesperado.",
      errorBody?.fieldErrors,
      errorBody?.retryAfterSeconds,
    );
  }

  const body = payload as { data: T; meta?: { nextCursor: string | null } };
  return { data: body.data, meta: body.meta };
}
