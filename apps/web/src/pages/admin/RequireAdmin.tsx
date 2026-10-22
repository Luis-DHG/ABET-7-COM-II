import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/session/SessionProvider";
import { StatusNotice } from "@/components/StatusNotice";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, user } = useSession();
  const location = useLocation();

  if (status === "unknown") {
    return <Skeleton className="h-48 w-full" aria-label="Verificando sesión" />;
  }
  if (!user) {
    const currentPath = location.pathname + location.search + location.hash;
    const loginTarget = `/login?returnTo=${encodeURIComponent(currentPath)}`;
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }
  if (user.role !== "ADMIN") {
    return (
      <StatusNotice tone="destructive" title="Acceso denegado">
        Esta sección requiere permisos de administración. Tu sesión sigue activa.
      </StatusNotice>
    );
  }
  return <>{children}</>;
}
