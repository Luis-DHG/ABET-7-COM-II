import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/http";
import { StatusNotice } from "@/components/StatusNotice";
import { ConfirmDialog } from "@/pages/admin/ConfirmDialog";

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
  emailVerifiedAt: string | null;
  isBanned: boolean;
  createdAt: string;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [banning, setBanning] = useState(false);

  const fetchPage = useCallback(async (search: string, cursor: string | null, signal?: AbortSignal) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (search) params.set("query", search);
    if (cursor) params.set("cursor", cursor);
    return api<AdminUser[]>(`/api/admin/users?${params.toString()}`, { signal });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchPage(submittedQuery, null, controller.signal)
      .then(({ data, meta }) => {
        setUsers(data);
        setNextCursor(meta?.nextCursor ?? null);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los usuarios.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [submittedQuery, fetchPage]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data, meta } = await fetchPage(submittedQuery, nextCursor);
      setUsers((current) => [...current, ...data]);
      setNextCursor(meta?.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar más usuarios.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function ban() {
    if (!selected) return;
    setBanning(true);
    setActionError(null);
    try {
      await api(`/api/admin/users/${selected.id}/ban`, { method: "POST" });
      setUsers((current) =>
        current.map((user) => (user.id === selected.id ? { ...user, isBanned: true } : user)),
      );
      setSelected(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo suspender al usuario.");
    } finally {
      setBanning(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Administración de usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Suspender impide publicar; la cuenta conserva lectura. No hay borrado de cuentas ni edición de roles.
        </p>
      </header>

      <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1 space-y-1.5">
          <Label htmlFor="search">Buscar por nombre o correo</Label>
          <Input
            id="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej.: ana@ejemplo.com"
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {actionError ? (
        <StatusNotice tone="destructive" title="Acción no completada">
          {actionError}
        </StatusNotice>
      ) : null}

      {loading ? (
        <div className="space-y-3" aria-label="Cargando usuarios">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <StatusNotice tone="destructive" title="Error de carga">
          {error}{" "}
          <Button variant="outline" size="sm" className="ml-2" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </StatusNotice>
      ) : users.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No hay usuarios que coincidan con la búsqueda.
        </p>
      ) : (
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-medium">{user.displayName}</span>
                <span className="text-muted-foreground">{user.email}</span>
                {user.role === "ADMIN" ? <Badge variant="secondary">Administrador</Badge> : null}
                {user.emailVerifiedAt ? <Badge>Verificado</Badge> : <Badge variant="outline">Sin verificar</Badge>}
                {user.isBanned ? <Badge variant="destructive">Suspendido</Badge> : null}
              </div>
              {!user.isBanned && user.role !== "ADMIN" ? (
                <div className="mt-3">
                  <Button variant="destructive" size="sm" onClick={() => setSelected(user)}>
                    Suspender para publicar
                  </Button>
                </div>
              ) : null}
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
        title="Suspender usuario"
        description={
          selected
            ? `${selected.displayName} (${selected.email}) no podrá publicar comentarios. Mantendrá acceso de lectura.`
            : ""
        }
        confirmLabel="Suspender para publicar"
        pending={banning}
        onConfirm={() => void ban()}
      />
    </div>
  );
}
