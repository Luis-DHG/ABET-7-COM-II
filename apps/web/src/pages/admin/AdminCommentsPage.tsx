import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/http";
import { formatDateTime } from "@/lib/format";
import { StatusNotice } from "@/components/StatusNotice";
import { ConfirmDialog } from "@/pages/admin/ConfirmDialog";

interface AdminComment {
  id: string;
  rootId: string;
  parentId: string | null;
  body: string;
  isRemoved: boolean;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
}

type StatusFilter = "ALL" | "ACTIVE" | "REMOVED";
const PAGE_SIZE = 20;

export default function AdminCommentsPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminComment | null>(null);
  const [moderating, setModerating] = useState(false);

  const fetchPage = useCallback(async (statusFilter: StatusFilter, cursor: string | null, signal?: AbortSignal) => {
    const params = new URLSearchParams({ status: statusFilter, limit: String(PAGE_SIZE) });
    if (cursor) params.set("cursor", cursor);
    return api<AdminComment[]>(`/api/admin/comments?${params.toString()}`, { signal });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchPage(status, null, controller.signal)
      .then(({ data, meta }) => {
        setComments(data);
        setNextCursor(meta?.nextCursor ?? null);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los comentarios.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [status, fetchPage]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data, meta } = await fetchPage(status, nextCursor);
      setComments((current) => [...current, ...data]);
      setNextCursor(meta?.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar más comentarios.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function moderate() {
    if (!selected) return;
    setModerating(true);
    setActionError(null);
    try {
      await api(`/api/admin/comments/${selected.id}`, { method: "PATCH" });
      setComments((current) =>
        current.map((comment) => (comment.id === selected.id ? { ...comment, isRemoved: true } : comment)),
      );
      setSelected(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo retirar el comentario.");
    } finally {
      setModerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Moderación de comentarios</h1>
        <p className="text-sm text-muted-foreground">
          Retirar un comentario lo sustituye por un aviso de moderación. No hay borrado permanente.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {(["ALL", "ACTIVE", "REMOVED"] as const).map((option) => (
          <Button
            key={option}
            variant={status === option ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(option)}
            aria-pressed={status === option}
          >
            {option === "ALL" ? "Todos" : option === "ACTIVE" ? "Activos" : "Retirados"}
          </Button>
        ))}
      </div>

      {actionError ? (
        <StatusNotice tone="destructive" title="Acción no completada">
          {actionError}
        </StatusNotice>
      ) : null}

      {loading ? (
        <div className="space-y-3" aria-label="Cargando comentarios">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <StatusNotice tone="destructive" title="Error de carga">
          {error}{" "}
          <Button variant="outline" size="sm" className="ml-2" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </StatusNotice>
      ) : comments.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No hay comentarios con este filtro.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-medium">{comment.authorName}</span>
                <span className="text-muted-foreground">{comment.authorEmail}</span>
                <time dateTime={comment.createdAt} className="text-xs text-muted-foreground">
                  {formatDateTime(comment.createdAt)}
                </time>
                {comment.isRemoved ? <Badge variant="secondary">Retirado</Badge> : <Badge>Activo</Badge>}
              </div>
              <p className="mt-2 max-w-prose whitespace-pre-line text-sm leading-relaxed">
                {comment.body.length > 240 ? `${comment.body.slice(0, 240)}…` : comment.body}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/retroalimentacion/${comment.rootId}`}>Ver en contexto</Link>
                </Button>
                {!comment.isRemoved ? (
                  <Button variant="destructive" size="sm" onClick={() => setSelected(comment)}>
                    Retirar comentario
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {nextCursor && !loading ? (
        <div className="text-center">
          <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
            {loadingMore ? "Cargando…" : "Cargar más"}
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Retirar comentario"
        description={
          selected
            ? `El comentario de ${selected.authorName} será reemplazado por el aviso de moderación. La acción es visible para todos los lectores y no puede revertirse desde la interfaz.`
            : ""
        }
        confirmLabel="Retirar comentario"
        pending={moderating}
        onConfirm={() => void moderate()}
      />
    </div>
  );
}
