import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/http";
import { FieldError, StatusNotice } from "@/components/StatusNotice";
import { AuthShell } from "@/pages/auth/LoginPage";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldError(null);
    setPending(true);
    try {
      await api("/api/auth/forgot-password", { method: "POST", body: { email } });
      setSent(true);
    } catch (error_) {
      if (error_ instanceof ApiError) {
        setFieldError(error_.fieldErrors?.email?.[0] ?? null);
        if (!error_.fieldErrors) setError(error_.message);
      } else {
        setError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Recuperar contraseña">
        <StatusNotice tone="success" title="Solicitud recibida">
          Si existe una cuenta con <strong>{email}</strong>, recibirás un enlace para restablecer la contraseña.
        </StatusNotice>
        <p className="mt-4 text-sm">
          <Link to="/login" className="text-primary underline underline-offset-4">
            Volver a ingresar
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Recuperar contraseña" subtitle="Te enviaremos un enlace de restablecimiento.">
      {error ? (
        <StatusNotice tone="destructive" title="No se pudo procesar la solicitud" className="mb-4">
          {error}
        </StatusNotice>
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
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={fieldError ?? undefined} />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enviando…" : "Enviar enlace"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-primary underline underline-offset-4">
          Volver a ingresar
        </Link>
      </p>
    </AuthShell>
  );
}
