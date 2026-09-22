import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/http";
import { StatusNotice } from "@/components/StatusNotice";
import { AuthShell } from "@/pages/auth/LoginPage";

type State = "processing" | "verified" | "invalid" | "network";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>("processing");
  const attempted = useRef(false);

  useEffect(() => {
    // El token se captura una vez y se retira de la URL visible (plan §7.5).
    const token = params.get("token") ?? "";
    window.history.replaceState(null, "", "/verificar-correo");
    if (!token) {
      setState("invalid");
      return;
    }
    if (attempted.current) return;
    attempted.current = true;

    const controller = new AbortController();
    api("/api/auth/verify-email", { method: "POST", body: { token }, signal: controller.signal })
      .then(() => setState("verified"))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState(error instanceof ApiError && error.isNetwork ? "network" : "invalid");
      });
    return () => controller.abort();
  }, [params]);

  return (
    <AuthShell title="Verificación de correo">
      {state === "processing" ? (
        <p role="status" className="text-sm text-muted-foreground">
          Verificando tu enlace…
        </p>
      ) : null}

      {state === "verified" ? (
        <StatusNotice tone="success" title="Correo verificado">
          Tu cuenta quedó verificada. Ya puedes publicar en la retroalimentación.{" "}
          <Link to="/retroalimentacion" className="text-primary underline underline-offset-4">
            Ir a la retroalimentación
          </Link>
        </StatusNotice>
      ) : null}

      {state === "invalid" ? (
        <StatusNotice tone="destructive" title="Enlace inválido o vencido">
          El enlace es inválido, venció o ya fue utilizado. Si tu cuenta aún no está verificada, ingresa y solicita un
          reenvío.{" "}
          <Link to="/login" className="text-primary underline underline-offset-4">
            Ir a ingresar
          </Link>
        </StatusNotice>
      ) : null}

      {state === "network" ? (
        <div className="space-y-3">
          <StatusNotice tone="destructive" title="Error de conexión">
            No pudimos contactar el servidor.
          </StatusNotice>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      ) : null}
    </AuthShell>
  );
}
