import { useEffect, useRef, useState } from "react";
import type { PublicComment } from "@blogdpc/contracts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/http";

const MIN_LENGTH = 3;
const MAX_LENGTH = 2000;

let composerCounter = 0;

export function CommentComposer({
  parentId,
  autoFocus = false,
  onPublished,
  onCancel,
}: {
  parentId?: string;
  autoFocus?: boolean;
  onPublished: (comment: PublicComment) => void;
  onCancel?: () => void;
}) {
  const [idPrefix] = useState(() => `composer-${++composerCounter}`);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const announcementRef = useRef<HTMLParagraphElement>(null);

  const length = body.trim().length;
  const valid = length >= MIN_LENGTH && length <= MAX_LENGTH;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function publish() {
    setError(null);
    setPending(true);
    try {
      const { data } = await api<PublicComment>("/api/comments", {
        method: "POST",
        body: { body, ...(parentId ? { parentId } : {}) },
      });
      setBody("");
      onPublished(data);
      announcementRef.current?.focus();
    } catch (error_) {
      if (error_ instanceof ApiError && error_.code === "COMMENT_COOLDOWN") {
        setCooldown(error_.retryAfterSeconds ?? 30);
        setError(error_.message);
      } else if (error_ instanceof ApiError) {
        setError(error_.message);
      } else {
        setError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <p ref={announcementRef} tabIndex={-1} aria-live="polite" className="sr-only" />

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-body`}>{parentId ? "Escribe tu respuesta" : "Escribe tu comentario"}</Label>
        <Textarea
          id={`${idPrefix}-body`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={parentId ? 3 : 5}
          autoFocus={autoFocus}
          maxLength={MAX_LENGTH * 2}
          aria-describedby={`${idPrefix}-counter${error ? ` ${idPrefix}-error` : ""}`}
          aria-invalid={Boolean(error)}
        />
        <div className="flex items-baseline justify-between gap-4 text-xs text-muted-foreground">
          <span>Mínimo {MIN_LENGTH} caracteres.</span>
          <span id={`${idPrefix}-counter`} aria-live="polite" className="tabular-nums">
            {length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {error ? (
        <p id={`${idPrefix}-error`} role="alert" className="text-sm text-destructive">
          {error}
          {cooldown > 0 ? ` Podrás publicar en ${cooldown} s.` : null}
        </p>
      ) : cooldown > 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          Podrás publicar de nuevo en {cooldown} s.
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button onClick={() => void publish()} disabled={pending || !valid || cooldown > 0}>
          {pending ? "Publicando…" : parentId ? "Publicar respuesta" : "Publicar comentario"}
        </Button>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
