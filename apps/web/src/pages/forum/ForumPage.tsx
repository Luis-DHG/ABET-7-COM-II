import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PublicComment } from "@blogdpc/contracts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/http";
import { useSession } from "@/session/SessionProvider";
import { StatusNotice } from "@/components/StatusNotice";
import { CommentComposer } from "@/pages/forum/CommentComposer";
import { CommentItem } from "@/pages/forum/CommentItem";
import { appendForumPage, isForumCacheStale, readForumCache, refreshForumCache } from "@/pages/forum/forumCache";

const PAGE_SIZE = 10;

export default function ForumPage() {
  const { status, user, online } = useSession();
  const navigate = useNavigate();
  const [comments, setComments] = useState<PublicComment[]>(() => readForumCache().comments);
  const [nextCursor, setNextCursor] = useState<string | null>(() => readForumCache().nextCursor);
  const [initialLoading, setInitialLoading] = useState(() => readForumCache().pageCount === 0 && readForumCache().comments.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const loadPage = useCallback(async (cursor: string | null, signal?: AbortSignal) => {
    const query = cursor ? `?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}` : `?limit=${PAGE_SIZE}`;
    return api<PublicComment[]>(`/api/comments${query}`, { signal });
  }, []);

  useEffect(() => {
    if (retry === 0 && !isForumCacheStale()) return;
    const controller = new AbortController();
    let active = true;
    setRefreshing(true);
    refreshForumCache(loadPage, controller.signal)
      .then((cached) => {
        if (!active) return;
        setComments(cached.comments);
        setNextCursor(cached.nextCursor);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los comentarios.");
      })
      .finally(() => {
        if (!active) return;
        setInitialLoading(false);
        setRefreshing(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadPage, retry]);

  useEffect(() => {
    const retryOnline = () => setRetry((current) => current + 1);
    window.addEventListener("online", retryOnline);
    return () => window.removeEventListener("online", retryOnline);
  }, []);

  async function loadMore() {
    if (!nextCursor || loadingMore || refreshing) return;
    setLoadingMore(true);
    try {
      const { data, meta } = await loadPage(nextCursor);
      const cached = appendForumPage(data, meta?.nextCursor ?? null);
      setComments(cached.comments);
      setNextCursor(cached.nextCursor);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar más comentarios.");
    } finally {
      setLoadingMore(false);
    }
  }

  const handlePublished = useCallback((comment: PublicComment) => {
    const cached = readForumCache();
    setComments(cached.comments);
    setNextCursor(cached.nextCursor);
    setError(null);
    if (cached.pageCount === 0) {
      setInitialLoading(false);
    }
    if (isForumCacheStale()) {
      setRetry((current) => current + 1);
    }
    if (comment.depth === 1) {
      setNotice("Tu comentario fue publicado.");
    } else if (comment.depth >= 3) {
      navigate(`/retroalimentacion/${comment.rootId}#comment-${comment.id}`);
    } else {
      setNotice("Tu respuesta fue publicada.");
    }
  }, [navigate]);

  const canPublish = status === "authenticated" && Boolean(user?.emailVerified) && !user?.isBanned && online;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Retroalimentación</h1>
        <p className="max-w-prose text-muted-foreground">
          Conversaciones públicas sobre el proyecto. La lectura es abierta; publicar requiere cuenta verificada.
        </p>
      </header>

      <div aria-live="polite" className="sr-only">
        {notice}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-label="Comentarios" className="space-y-6 min-w-0">
          <ParticipationBox canPublish={canPublish} disabled={Boolean(error)} onPublished={handlePublished} />

          {refreshing && comments.length > 0 ? (
            <p role="status" className="text-sm text-muted-foreground">Actualizando comentarios…</p>
          ) : null}

          {error && comments.length > 0 ? (
            <StatusNotice tone="warning" title="Lectura sin actualizar">
              {error} Los comentarios mostrados siguen disponibles.{" "}
              <Button variant="outline" size="sm" className="ml-2" onClick={() => setRetry((current) => current + 1)}>
                Reintentar
              </Button>
            </StatusNotice>
          ) : null}

          {initialLoading ? (
            <div className="space-y-4" aria-label="Cargando comentarios">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error && comments.length === 0 ? (
            <StatusNotice tone="destructive" title="No se pudieron cargar los comentarios">
              {error}{" "}
              <Button variant="outline" size="sm" className="ml-2" onClick={() => setRetry((current) => current + 1)}>
                Reintentar
              </Button>
            </StatusNotice>
          ) : comments.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aún no hay comentarios. Sé la primera persona en iniciar una conversación.
              </p>
            </div>
          ) : (
            <>
              <ol className="divide-y divide-border rounded-lg border bg-card">
                {comments.map((comment) => (
                  <div key={comment.id} className="px-4 sm:px-6">
                    <CommentItem comment={comment} canReply={canPublish && !error} onReplyPublished={handlePublished} />
                  </div>
                ))}
              </ol>

              {nextCursor ? (
                <div className="text-center">
                  <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore || refreshing}>
                    {loadingMore ? "Cargando…" : "Cargar más"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>

        <aside className="order-first space-y-4 lg:order-none lg:self-start">
          <div className="rounded-lg border bg-card p-4 text-sm">
            <h2 className="font-semibold">Normas del foro</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Comenta con respeto y en torno al proyecto.</li>
              <li>Los mensajes que incumplan las normas serán retirados.</li>
              <li>La moderación es visible: un comentario retirado se muestra como tal.</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-card p-4 text-sm">
            <h2 className="font-semibold">Cómo participar</h2>
            <p className="mt-2 text-muted-foreground">
              Crea una cuenta, verifica tu correo y publica. Puedes responder hasta varios niveles; las conversaciones
              profundas se abren en una vista dedicada.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ParticipationBox({
  canPublish,
  disabled,
  onPublished,
}: {
  canPublish: boolean;
  disabled: boolean;
  onPublished: (comment: PublicComment) => void;
}) {
  const { status, user, online } = useSession();
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resendVerification() {
    if (!user) return;
    setResendState("sending");
    try {
      await api("/api/auth/resend-verification", { method: "POST", body: { email: user.email } });
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  }

  if (!online || status === "unverifiable") {
    return (
      <StatusNotice tone="warning" title="Participación no disponible">
        No se puede verificar tu sesión ahora. La lectura sigue disponible y tus datos de sesión se conservan.
      </StatusNotice>
    );
  }

  if (status === "unknown") {
    return <Skeleton className="h-32 w-full" aria-label="Cargando estado de sesión" />;
  }

  if (status === "anonymous") {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">La lectura es pública. Para publicar necesitas una cuenta.</p>
        <Button asChild className="mt-3">
          <Link to="/login">Ingresar para participar</Link>
        </Button>
      </div>
    );
  }

  if (user?.isBanned) {
    return (
      <StatusNotice tone="warning" title="Cuenta suspendida para publicar">
        Tu cuenta conserva la lectura, pero no puede publicar comentarios por ahora.
      </StatusNotice>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <StatusNotice tone="warning" title="Verifica tu correo para publicar">
        <p>
          Enviamos un enlace de verificación a <strong>{user.email}</strong>.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => void resendVerification()}
          disabled={resendState === "sending" || resendState === "sent"}
        >
          {resendState === "sending"
            ? "Reenviando…"
            : resendState === "sent"
              ? "Enlace reenviado"
              : "Reenviar correo de verificación"}
        </Button>
        {resendState === "error" ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            No se pudo reenviar. Intenta más tarde.
          </p>
        ) : null}
      </StatusNotice>
    );
  }

  if (!canPublish) return null;

  return (
    <div className="rounded-lg border bg-card p-6">
      <CommentComposer disabled={disabled} onPublished={onPublished} />
    </div>
  );
}
