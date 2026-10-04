import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { PublicUser } from "@blogdpc/contracts";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/http";
import { StatusNotice } from "@/components/StatusNotice";
import { AuthShell } from "@/pages/auth/LoginPage";
import { useSession } from "@/session/SessionProvider";

type State = "processing" | "verified" | "invalid" | "network";
const verificationRequests = new Map<string, Promise<PublicUser>>();

function verifyEmail(token: string): Promise<PublicUser> {
  const pending = verificationRequests.get(token);
  if (pending) return pending;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  const request = api<{ user: PublicUser }>("/api/auth/verify-email", {
    method: "POST", body: { token }, signal: controller.signal,
  }).then(({ data }) => data.user).finally(() => {
    window.clearTimeout(timeout);
    verificationRequests.delete(token);
  });
  verificationRequests.set(token, request);
  return request;
}

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [token] = useState(() => params.get("token") ?? "");
  const { setUser } = useSession();
  const [state, setState] = useState<State>("processing");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // El token se captura una vez y se retira de la URL visible (plan §7.5).
    window.history.replaceState(null, "", "/verificar-correo");
    if (!token) {
      setState("invalid");
      return;
    }

    let disposed = false;
    verifyEmail(token)
      .then((user) => {
        if (disposed) return;
        setUser(user);
        setState("verified");
      })
      .catch((error: unknown) => {
        if (disposed) return;
        if (error instanceof DOMException && error.name === "AbortError") {
          setState("network");
          return;
        }
        setState(error instanceof ApiError && error.isNetwork ? "network" : "invalid");
      });
    return () => {
      disposed = true;
    };
  }, [attempt, setUser, token]);

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
          <Button variant="outline" onClick={() => { setState("processing"); setAttempt((current) => current + 1); }}>
            Reintentar
          </Button>
        </div>
      ) : null}
    </AuthShell>
  );
}
