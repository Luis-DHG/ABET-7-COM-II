import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { PublicUser } from "@blogdpc/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/lib/http";
import { useSession } from "@/session/SessionProvider";
import { FieldError, StatusNotice } from "@/components/StatusNotice";

function sanitizeReturnTo(target: unknown): string | null {
  if (typeof target !== "string") return null;
  const trimmed = target.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return null;
  }
  if (trimmed.startsWith("/login") || trimmed.startsWith("/registro")) {
    return null;
  }
  return trimmed;
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="auth-shell mx-auto w-full max-w-md space-y-6 py-8">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>
      <div className="rounded-lg border bg-card p-6 shadow-sm">{children}</div>
    </section>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useSession();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const googleFailed = params.get("error") === "google_auth_failed";

  const stateFrom = (location.state as { from?: string | { pathname: string; search?: string; hash?: string } } | null)?.from;
  const statePath = typeof stateFrom === "string"
    ? stateFrom
    : stateFrom?.pathname
      ? `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`
      : null;
  const paramPath = params.get("returnTo");
  const destination = sanitizeReturnTo(statePath) ?? sanitizeReturnTo(paramPath) ?? "/planeacion";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const { data } = await api<{ user: PublicUser }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setUser(data.user);
      navigate(destination, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) setFieldErrors(error.fieldErrors);
        // Mensaje único para credenciales incorrectas (no revelar cuál campo falla).
        setFormError(error.code === "INVALID_CREDENTIALS" ? "El correo o la contraseña no son correctos." : error.message);
      } else {
        setFormError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell title="Ingresar" subtitle="Accede a tu cuenta para participar en la retroalimentación.">
      {googleFailed ? (
        <StatusNotice tone="destructive" title="No se completó el ingreso con Google" className="mb-4">
          El proceso fue cancelado o la cuenta no pudo verificarse. Intenta de nuevo o usa tu correo.
        </StatusNotice>
      ) : null}

      {formError ? (
        <div tabIndex={-1} className="mb-4">
          <StatusNotice tone="destructive" title="No fue posible ingresar">
            {formError}
          </StatusNotice>
        </div>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={fieldErrors.email?.[0]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          <FieldError id="password-error" message={fieldErrors.password?.[0]} />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden />
        o
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <Button asChild variant="outline" className="google-signin w-full">
        <a href={destination !== "/planeacion" ? `/api/auth/google/start?returnTo=${encodeURIComponent(destination)}` : "/api/auth/google/start"}>
          <svg aria-hidden="true" focusable="false" className="size-5" viewBox="10 10 20 20" fill="none">
            <path d="M29.6 20.2273C29.6 19.5182 29.5364 18.8364 29.4182 18.1818H20V22.05H25.3818C25.15 23.3 24.4455 24.3591 23.3864 25.0682V27.5773H26.6182C28.5091 25.8364 29.6 23.2727 29.6 20.2273Z" fill="#4285F4" />
            <path d="M20 30C22.7 30 24.9636 29.1045 26.6181 27.5773L23.3863 25.0682C22.4909 25.6682 21.3454 26.0227 20 26.0227C17.3954 26.0227 15.1909 24.2636 14.4045 21.9H11.0636V24.4909C12.7091 27.7591 16.0909 30 20 30Z" fill="#34A853" />
            <path d="M14.4045 21.9C14.2045 21.3 14.0909 20.6591 14.0909 20C14.0909 19.3409 14.2045 18.7 14.4045 18.1V15.5091H11.0636C10.3864 16.8591 10 18.3864 10 20C10 21.6136 10.3864 23.1409 11.0636 24.4909L14.4045 21.9Z" fill="#FBBC04" />
            <path d="M20 13.9773C21.4681 13.9773 22.7863 14.4818 23.8227 15.4727L26.6909 12.6045C24.9591 10.9909 22.6954 10 20 10C16.0909 10 12.7091 12.2409 11.0636 15.5091L14.4045 18.1C15.1909 15.7364 17.3954 13.9773 20 13.9773Z" fill="#E94235" />
          </svg>
          Continuar con Google
        </a>
      </Button>

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        <Link to={destination !== "/planeacion" ? `/registro?returnTo=${encodeURIComponent(destination)}` : "/registro"} className="text-primary underline underline-offset-4">
          Crear cuenta
        </Link>
        <Link to="/olvide-contrasena" className="text-primary underline underline-offset-4">
          Olvidé mi contraseña
        </Link>
      </div>
    </AuthShell>
  );
}
