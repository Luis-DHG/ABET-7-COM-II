import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/session/SessionProvider";
import { StatusNotice } from "@/components/StatusNotice";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, user } = useSession();

  if (status === "unknown") {
    return <Skeleton className="h-48 w-full" aria-label="Verificando sesión" />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
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
