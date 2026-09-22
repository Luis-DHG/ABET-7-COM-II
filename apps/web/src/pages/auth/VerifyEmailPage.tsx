import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { PublicUser } from "@blogdpc/contracts";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/http";
import { StatusNotice } from "@/components/StatusNotice";
import { AuthShell } from "@/pages/auth/LoginPage";
import { useSession } from "@/session/SessionProvider";

type State = "processing" | "verified" | "invalid" | "network";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [token] = useState(() => params.get("token") ?? "");
  const { setUser, user } = useSession();
  const [state, setState] = useState<State>("processing");

  useEffect(() => {
    // El token se captura una vez y se retira de la URL visible (plan §7.5).
    window.history.replaceState(null, "", "/verificar-correo");
    if (!token) {
      setState("invalid");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let disposed = false;
    api("/api/auth/verify-email", { method: "POST", body: { token }, signal: controller.signal })
      .then(() => {
        setState("verified");
        void api<{ user: PublicUser | null }>("/api/auth/session")
          .then(({ data }) => {
            if (data.user) setUser(data.user);
          })
          .catch(() => undefined);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          if (!disposed) setState("network");
          return;
        }
        setState(error instanceof ApiError && error.isNetwork ? "network" : "invalid");
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [setUser, token]);

  return (
    <AuthShell title="Verificación de correo">
      {state === "processing" ? (
        <p role="status" className="text-sm text-muted-foreground">
          Verificando tu enlace…
        </p>
      ) : null}

      {state === "verified" ? (
        <StatusNotice tone="success" title="Correo verificado">
          {user ? (
            <>
              Tu cuenta quedó verificada. Ya puedes publicar en la retroalimentación.{" "}
              <Link to="/retroalimentacion" className="text-primary underline underline-offset-4">
                Ir a la retroalimentación
              </Link>
            </>
          ) : (
            <>
              Tu cuenta quedó verificada. Ahora ingresa para participar.{" "}
              <Link to="/login" className="text-primary underline underline-offset-4">
                Ir a ingresar
              </Link>
            </>
          )}
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
