import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useRouteError } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { SessionProvider } from "@/session/SessionProvider";
import { StatusNotice } from "@/components/StatusNotice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ModulePage, { HomeRedirect } from "@/pages/ModulePage";
import LegalPage from "@/pages/LegalPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ForumPage from "@/pages/forum/ForumPage";
import ThreadPage from "@/pages/forum/ThreadPage";
import { RequireAdmin } from "@/pages/admin/RequireAdmin";

// bundle-dynamic-imports: secciones administrativas fuera del bundle inicial.
const AdminCommentsPage = lazy(() => import("@/pages/admin/AdminCommentsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));

function AdminFallback() {
  return <Skeleton className="h-48 w-full" aria-label="Cargando sección" />;
}

function RouteErrorBoundary() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Algo salió mal</h1>
      <StatusNotice tone="destructive" className="mx-auto max-w-md text-left" title="Error inesperado">
        {message}
      </StatusNotice>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Reintentar
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />} ErrorBoundary={RouteErrorBoundary}>
            <Route index element={<HomeRedirect />} />
            <Route path="/:moduleSlug" element={<ModulePage />} />
            <Route path="/retroalimentacion" element={<ForumPage />} />
            <Route path="/retroalimentacion/:rootId" element={<ThreadPage />} />
            <Route path="/privacidad" element={<LegalPage kind="privacidad" />} />
            <Route path="/terminos" element={<LegalPage kind="terminos" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/verificar-correo" element={<VerifyEmailPage />} />
            <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
            <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
            <Route
              path="/admin/comentarios"
              element={
                <RequireAdmin>
                  <Suspense fallback={<AdminFallback />}>
                    <AdminCommentsPage />
                  </Suspense>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <RequireAdmin>
                  <Suspense fallback={<AdminFallback />}>
                    <AdminUsersPage />
                  </Suspense>
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
