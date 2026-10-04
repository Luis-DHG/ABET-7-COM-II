import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { PublicUser } from "@blogdpc/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/lib/http";
import { useSession } from "@/session/SessionProvider";
import { FieldError, StatusNotice } from "@/components/StatusNotice";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-md space-y-6 py-8">
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
  const { setUser } = useSession();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const googleFailed = params.get("error") === "google_auth_failed";

  useEffect(() => {
    if (formError) summaryRef.current?.focus();
  }, [formError]);

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
      navigate("/retroalimentacion", { replace: true });
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
        <div ref={summaryRef} tabIndex={-1} className="mb-4">
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

      <Button asChild variant="outline" className="w-full">
        <a href="/api/auth/google/start">Continuar con Google</a>
      </Button>

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        <Link to="/registro" className="text-primary underline underline-offset-4">
          Crear cuenta
        </Link>
        <Link to="/olvide-contrasena" className="text-primary underline underline-offset-4">
          Olvidé mi contraseña
        </Link>
      </div>
    </AuthShell>
  );
}
