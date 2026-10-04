import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { PublicComment } from "@blogdpc/contracts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/http";
import { useSession } from "@/session/SessionProvider";
import { StatusNotice } from "@/components/StatusNotice";
import { CommentItem } from "@/pages/forum/CommentItem";

export default function ThreadPage() {
  const { rootId } = useParams();
  const { hash } = useLocation();
  const { status, user } = useSession();
  const [thread, setThread] = useState<PublicComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    if (!rootId) return;
    const controller = new AbortController();
    setLoading(true);
    api<PublicComment>(`/api/comments/${rootId}/thread`, { signal: controller.signal })
      .then(({ data }) => {
        setThread(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof ApiError
            ? { code: err.code, message: err.message }
            : { code: "UNKNOWN", message: "No se pudo cargar la conversación." },
        );
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [rootId]);

  const canReply = status === "authenticated" && Boolean(user?.emailVerified) && !user?.isBanned;
  const threadId = thread?.id;

  useEffect(() => {
    if (!threadId || !hash.startsWith("#comment-")) return;
    const element = document.getElementById(hash.slice(1));
    if (!element) return;
    element.scrollIntoView({ block: "center" });
    element.focus();
  }, [threadId, hash]);

  const handleReplyPublished = useCallback((_comment: PublicComment) => {
    // Releer el hilo para reflejar el árbol definitivo del servidor.
    if (!rootId) return;
    void api<PublicComment>(`/api/comments/${rootId}/thread`).then(({ data }) => setThread(data));
  }, [rootId]);

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

      {thread ? (
        <div className="rounded-lg border bg-card px-4 sm:px-6">
          <CommentItem comment={thread} canReply={canReply} threadMode onReplyPublished={handleReplyPublished} />
        </div>
      ) : null}
    </div>
  );
}
