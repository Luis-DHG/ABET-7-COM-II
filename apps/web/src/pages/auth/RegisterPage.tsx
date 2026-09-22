import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/lib/http";
import { FieldError, StatusNotice } from "@/components/StatusNotice";
import { AuthShell } from "@/pages/auth/LoginPage";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [registered, setRegistered] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formError) summaryRef.current?.focus();
  }, [formError]);

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
      await api("/api/auth/register", {
        method: "POST",
        body: { displayName, email, password },
      });
      setRegistered(true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) setFieldErrors(error.fieldErrors);
        setFormError(error.message);
      } else {
        setFormError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } finally {
      setPending(false);
    }
  }

  if (registered) {
    return (
      <AuthShell title="Revisa tu correo">
        <StatusNotice tone="success" title="Cuenta creada">
          Enviamos un enlace de verificación a <strong>{email}</strong>. Debes verificar tu correo antes de publicar
          en la retroalimentación.
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
    <AuthShell title="Crear cuenta" subtitle="Necesitas una cuenta verificada para participar en el foro.">
      {formError ? (
        <div ref={summaryRef} tabIndex={-1} className="mb-4">
          <StatusNotice tone="destructive" title="No se pudo crear la cuenta">
            {formError}
          </StatusNotice>
        </div>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Nombre visible</Label>
          <Input
            id="displayName"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.displayName)}
            aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined}
          />
          <p className="text-xs text-muted-foreground">Se mostrará junto a tus comentarios.</p>
          <FieldError id="displayName-error" message={fieldErrors.displayName?.[0]} />
        </div>

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
          {pending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Al crear una cuenta aceptas los{" "}
        <Link to="/terminos" className="text-primary underline underline-offset-4">
          términos y condiciones
        </Link>{" "}
        y la{" "}
        <Link to="/privacidad" className="text-primary underline underline-offset-4">
          política de datos personales
        </Link>
        .
      </p>

      <p className="mt-4 text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-primary underline underline-offset-4">
          Ingresa
        </Link>
      </p>
    </AuthShell>
  );
}
