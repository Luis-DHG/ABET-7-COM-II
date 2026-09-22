import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/http";
import { FieldError, StatusNotice } from "@/components/StatusNotice";
import { AuthShell } from "@/pages/auth/LoginPage";

export default function ResetPasswordPage() {
  // Captura del token una vez y limpieza de la URL (plan §7.5).
  const [params] = useSearchParams();
  const [token] = useState(() => params.get("token") ?? "");

  useEffect(() => {
    if (params.get("token")) window.history.replaceState(null, "", "/restablecer-contrasena");
  }, [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const tokenMissing = useMemo(() => !token, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    if (password !== confirm) {
      setFieldErrors({ confirm: ["Las contraseñas no coinciden."] });
      return;
    }
    setPending(true);
    try {
      await api("/api/auth/reset-password", { method: "POST", body: { token, password } });
      setDone(true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) setFieldErrors(error.fieldErrors);
        setFormError(error.code === "TOKEN_INVALID" ? "El enlace es inválido, venció o ya fue utilizado." : error.message);
      } else {
        setFormError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } finally {
      setPending(false);
    }
  }

  if (tokenMissing) {
    return (
      <AuthShell title="Restablecer contraseña">
        <StatusNotice tone="destructive" title="Falta el enlace">
          Abre esta página desde el enlace enviado a tu correo.{" "}
          <Link to="/olvide-contrasena" className="text-primary underline underline-offset-4">
            Solicitar un nuevo enlace
          </Link>
        </StatusNotice>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Restablecer contraseña">
        <StatusNotice tone="success" title="Contraseña actualizada">
          Tu contraseña fue actualizada. Inicia sesión con la nueva contraseña.
        </StatusNotice>
        <p className="mt-4 text-sm">
          <Link to="/login" className="text-primary underline underline-offset-4">
            Ir a ingresar
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Restablecer contraseña">
      {formError ? (
        <StatusNotice tone="destructive" title="No se pudo restablecer" className="mb-4">
          {formError}
          {formError.includes("inválido") ? (
            <>
              {" "}
              <Link to="/olvide-contrasena" className="text-primary underline underline-offset-4">
                Solicitar un nuevo enlace
              </Link>
            </>
          ) : null}
        </StatusNotice>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby="password-hint password-error"
          />
          <p id="password-hint" className="text-xs text-muted-foreground">
            Entre 10 y 128 caracteres.
          </p>
          <FieldError id="password-error" message={fieldErrors.password?.[0]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar contraseña</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={Boolean(fieldErrors.confirm)}
            aria-describedby={fieldErrors.confirm ? "confirm-error" : undefined}
          />
          <FieldError id="confirm-error" message={fieldErrors.confirm?.[0]} />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Actualizando…" : "Restablecer contraseña"}
        </Button>
      </form>
    </AuthShell>
  );
}
