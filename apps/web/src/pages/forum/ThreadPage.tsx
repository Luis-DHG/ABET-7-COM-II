import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { PublicComment } from "@blogdpc/contracts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/http";
import { useSession } from "@/session/SessionProvider";
import { StatusNotice } from "@/components/StatusNotice";
import { CommentItem } from "@/pages/forum/CommentItem";
import { appendThreadReply } from "@/pages/forum/forumCache";

export default function ThreadPage() {
  const { rootId } = useParams();
  const { hash } = useLocation();
  const { status, user, online } = useSession();
  const [thread, setThread] = useState<PublicComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const scope = useMemo(() => ({ rootId }), [rootId]);
  const readCycle = useRef({ scope, active: false, latest: 0, controller: null as AbortController | null });

  const refreshThread = useCallback(() => {
    const cycle = readCycle.current;
    if (!scope.rootId || cycle.scope !== scope || !cycle.active) return;
    const request = ++cycle.latest;
    const current = () => readCycle.current === cycle && cycle.active && request === cycle.latest;
    void api<PublicComment>(`/api/comments/${scope.rootId}/thread`, { signal: cycle.controller?.signal })
      .then(({ data }) => {
        if (!current()) return;
        setThread(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!current()) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof ApiError
            ? { code: err.code, message: err.message }
            : { code: "UNKNOWN", message: "No se pudo cargar la conversación." },
        );
      })
      .finally(() => {
        if (current()) setLoading(false);
      });
  }, [scope]);

  useEffect(() => {
    const cycle = { scope, active: true, latest: 0, controller: new AbortController() };
    readCycle.current = cycle;
    setError(null);
    setLoading(true);
    refreshThread();
    return () => {
      cycle.active = false;
      cycle.latest++;
      cycle.controller.abort();
    };
  }, [scope, refreshThread]);

  const canReply = status === "authenticated" && Boolean(user?.emailVerified) && !user?.isBanned && online;
  const threadId = thread?.id;

  useEffect(() => {
    if (!threadId || !hash.startsWith("#comment-")) return;
    const element = document.getElementById(hash.slice(1));
    if (!element) return;
    element.scrollIntoView({ block: "center" });
    element.focus();
  }, [threadId, hash]);

  const handleReplyPublished = useCallback((comment: PublicComment) => {
    const cycle = readCycle.current;
    if (!cycle.active || cycle.scope !== scope || comment.parentId !== scope.rootId) return;
    // Incorporar el éxito recibido y releer el hilo para reflejar el árbol definitivo del servidor.
    setThread((current) => (current && comment.parentId === current.id ? appendThreadReply(current, comment) : current));
    refreshThread();
  }, [refreshThread, scope]);

  return (
    <div className="space-y-6">
      <Link to="/retroalimentacion" className="text-sm text-primary underline underline-offset-4">
        ← Volver a retroalimentación
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Conversación</h1>

      {loading ? <Skeleton className="h-48 w-full" aria-label="Cargando conversación" /> : null}

      {error ? (
        <StatusNotice tone="destructive" title={error.code === "THREAD_NOT_FOUND" ? "Conversación no encontrada" : "Error"}>
          {error.message}{" "}
          {error.code !== "THREAD_NOT_FOUND" ? (
            <Button variant="outline" size="sm" className="ml-2" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          ) : null}
        </StatusNotice>
      ) : null}

      {thread && thread.id === rootId ? (
        <div className="rounded-lg border bg-card px-4 sm:px-6">
          <CommentItem
            comment={thread}
            canReply={canReply}
            threadMode
            onReplyPublished={handleReplyPublished}
            onConflict={refreshThread}
          />
        </div>
      ) : null}
    </div>
  );
}
