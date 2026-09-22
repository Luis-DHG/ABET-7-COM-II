import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicUser } from "@blogdpc/contracts";
import { api, ApiError, onSessionInvalid } from "@/lib/http";

export type SessionStatus = "unknown" | "anonymous" | "authenticated" | "unverifiable";

interface SessionContextValue {
  status: SessionStatus;
  user: PublicUser | null;
  online: boolean;
  setUser: (user: PublicUser | null) => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("unknown");
  const [user, setUser] = useState<PublicUser | null>(null);
  const [online, setOnline] = useState(() => navigator.onLine);

  const loadSession = useCallback(async (signal?: AbortSignal) => {
    try {
      const { data } = await api<{ user: PublicUser | null }>("/api/auth/session", { signal });
      setUser(data.user);
      setStatus(data.user ? "authenticated" : "anonymous");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (error instanceof ApiError && (error.isNetwork || error.status >= 500)) {
        // Sin borrar sesión conocida: puede ser solo pérdida de red (plan §8.3).
        setStatus("unverifiable");
        return;
      }
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  // Limpieza local solo cuando el servidor confirma sesión inválida.
  useEffect(() => onSessionInvalid(() => {
    setUser(null);
    setStatus("anonymous");
  }), []);

  useEffect(() => {
    const controller = new AbortController();
    void loadSession(controller.signal);
    return () => controller.abort();
  }, [loadSession]);

  // Reintento automático al volver la red (plan §8.3).
  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setStatus((previous) => {
        if (previous === "unverifiable") void loadSession();
        return previous;
      });
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [loadSession]);

  const setUserAndStatus = useCallback((next: PublicUser | null) => {
    setUser(next);
    setStatus(next ? "authenticated" : "anonymous");
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  const value: SessionContextValue = {
    status,
    user,
    online,
    setUser: setUserAndStatus,
    logout,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession debe usarse dentro de SessionProvider");
  return context;
}
