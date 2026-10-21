import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link as LinkIcon, MessageCircle, Send, X } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { useChatSession } from "@/chat/useChatSession";
import { shouldSendOnEnter } from "@/chat/session";
import { useSession } from "@/session/SessionProvider";

const PANEL_ID = "blogdpc-chat-panel";
const PANEL_TITLE_ID = "blogdpc-chat-title";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const previousPendingUserRef = useRef<string | null>(null);
  const [completionAnnouncement, setCompletionAnnouncement] = useState("");
  const session = useSession();
  // Keep the stream controller mounted even while the visible panel is closed.
  const chat = useChatSession(draft);
  const previousMessagesLength = useRef(chat.messages.length);

  function scrollHistoryToBottom() {
    const el = historyRef.current;
    if (!el) return;
    const prefersReducedMotion = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  }

  const pendingUser = chat.pending?.user ?? null;

  useEffect(() => {
    if (pendingUser !== null && previousPendingUserRef.current !== pendingUser) {
      scrollHistoryToBottom();
    }
    previousPendingUserRef.current = pendingUser;
  }, [pendingUser]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      if (chat.inputDisabled) closeButtonRef.current?.focus();
      else inputRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open, chat.inputDisabled]);

  useEffect(() => {
    if (chat.messages.length > previousMessagesLength.current) {
      setCompletionAnnouncement("Respuesta recibida.");
    }
    previousMessagesLength.current = chat.messages.length;
  }, [chat.messages.length]);

  function closePanel() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (chat.sendDisabled) return;

    const submittedDraft = draft;
    setDraft("");
    void chat.submit(submittedDraft);
    requestAnimationFrame(scrollHistoryToBottom);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!shouldSendOnEnter(event.key, event.shiftKey, event.nativeEvent.isComposing)) return;
    event.preventDefault();
    if (!chat.sendDisabled) event.currentTarget.form?.requestSubmit();
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
    }
  }

  const panelStatus = chat.error
    ?? (chat.isStreaming
      ? chat.pending?.assistant ? "Generando respuesta." : "Esperando respuesta."
      : session.status === "unknown"
        ? "Comprobando tu sesión."
        : session.status === "unverifiable"
          ? "No se pudo verificar la sesión. El historial se conserva."
          : session.status === "anonymous"
            ? "Inicia sesión para usar el asistente."
            : !session.online
              ? "Sin conexión. El historial se conserva."
              : completionAnnouncement || "Disponible para conversar.");

  const sessionHelp = session.status === "unknown" || session.status === "unverifiable"
    ? "La sesión no está disponible; puedes consultar el historial guardado."
    : !session.online
      ? "Conéctate para enviar un mensaje."
      : null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-4 font-sans sm:left-auto sm:w-96">
      <section
        id={PANEL_ID}
        role="region"
        aria-labelledby={PANEL_TITLE_ID}
        hidden={!open}
        onKeyDown={handlePanelKeyDown}
        className={open
          ? "chat-widget-panel flex max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg"
          : "hidden"}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 id={PANEL_TITLE_ID} className="flex items-center gap-2 text-base font-semibold leading-snug">
              <LinkIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <span>Asistente técnico</span>
            </h2>
            <p aria-live={chat.error ? "assertive" : "polite"} aria-atomic="true" className="mt-1 text-sm text-muted-foreground">
              {panelStatus}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            ref={closeButtonRef}
            aria-label="Cerrar asistente técnico"
            onClick={closePanel}
            className="motion-reduce:transition-none"
          >
            <X aria-hidden="true" />
          </Button>
        </header>

        <div
          ref={historyRef}
          role="region"
          aria-label="Historial del asistente técnico"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3"
        >
          {chat.timeline.length === 0 && !chat.pending ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pregunta sobre ISAC, redes perceptivas 6G o el recorrido por los módulos.
            </p>
          ) : (
            <div className="flex min-w-0 flex-col gap-4">
              <ol aria-label="Mensajes completados" className="flex min-w-0 flex-col gap-3">
                {chat.timeline.map((item) => {
                  if (item.kind === "completed") {
                    return (
                      <li
                        key={item.id}
                        className={item.role === "user"
                          ? "min-w-0 rounded-lg bg-secondary p-3 text-secondary-foreground"
                          : "min-w-0 rounded-lg border border-border bg-background p-3 text-foreground"}
                      >
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">
                          {item.role === "user" ? "Tú" : "Asistente"}
                        </p>
                        <ChatMessage content={item.content} />
                      </li>
                    );
                  }

                  return (
                    <li
                      key={item.id}
                      className="min-w-0 rounded-lg border border-border bg-background p-3 text-foreground"
                    >
                      <p className="mb-1 text-xs font-semibold text-destructive">
                        Intento no completado
                      </p>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">Pregunta</p>
                      <ChatMessage content={item.user} />
                      {item.assistant && (
                        <div className="mt-3 border-t border-border pt-2">
                          <p className="mb-1 text-xs font-semibold text-muted-foreground">Fragmento recibido</p>
                          <ChatMessage content={item.assistant} />
                        </div>
                      )}
                      <p className="mt-2 text-sm text-destructive">
                        {item.error || "No completado."}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={chat.inputDisabled}
                        onClick={() => { void chat.submit(item.user); }}
                        aria-label="Reintentar este intento"
                        className="mt-2 motion-reduce:transition-none"
                      >
                        Reintentar
                      </Button>
                    </li>
                  );
                })}
              </ol>

              {chat.pending && (
                <ol aria-label="Turno en curso" className="flex min-w-0 flex-col gap-3">
                  <li className="min-w-0 rounded-lg bg-secondary p-3 text-secondary-foreground">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Tú</p>
                    <ChatMessage content={chat.pending.user} />
                  </li>
                  <li
                    aria-busy={chat.isStreaming}
                    className="min-w-0 rounded-lg border border-border bg-background p-3 text-foreground"
                  >
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Asistente</p>
                    {chat.pending.assistant
                      ? <ChatMessage content={chat.pending.assistant} />
                      : <p className="text-sm text-muted-foreground">Esperando respuesta…</p>}
                  </li>
                </ol>
              )}
            </div>
          )}
        </div>

        {chat.storageDegraded && (
          <p role="note" className="mx-4 mb-2 rounded-md border border-border bg-muted p-2 text-xs leading-relaxed text-muted-foreground">
            El historial no se pudo guardar en esta pestaña y solo estará disponible mientras la página permanezca abierta.
          </p>
        )}

        {session.status === "anonymous" && (
          <div className="border-t border-border px-4 py-3">
            <p className="mb-2 text-sm text-muted-foreground">Inicia sesión para enviar mensajes.</p>
            <Button asChild variant="outline" className="motion-reduce:transition-none">
              <RouterLink to="/login">Iniciar sesión</RouterLink>
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="shrink-0 border-t border-border p-4">
          <div className="flex min-w-0 items-end gap-2">
            <textarea
              ref={inputRef}
              id="blogdpc-chat-input"
              value={draft}
              disabled={chat.inputDisabled}
              onChange={(event) => setDraft(event.currentTarget.value)}
              onKeyDown={handleComposerKeyDown}
              rows={2}
              aria-describedby={`${sessionHelp ? "blogdpc-chat-help " : ""}blogdpc-chat-counter${draft.length > 300 || (draft.length > 0 && !draft.trim()) ? " blogdpc-chat-validation" : ""}`}
              aria-invalid={draft.length > 300 || (draft.length > 0 && !draft.trim()) || undefined}
              className="block min-h-11 min-w-0 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            />
            <Button
              type="submit"
              disabled={chat.sendDisabled}
              className="shrink-0 motion-reduce:transition-none"
            >
              Enviar
              <Send aria-hidden="true" data-icon="inline-end" />
            </Button>
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap items-baseline justify-end gap-x-2 gap-y-1">
            <label htmlFor="blogdpc-chat-input" className="sr-only">
              Tu mensaje
            </label>
            <p
              id="blogdpc-chat-counter"
              className={`shrink-0 text-xs tabular-nums ${draft.length > 300 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {draft.length} / 300
            </p>
          </div>
          {sessionHelp && (
            <p id="blogdpc-chat-help" className="mt-1 text-xs text-muted-foreground">
              {sessionHelp}
            </p>
          )}
          {draft.length > 300 || (draft.length > 0 && !draft.trim()) ? (
            <p id="blogdpc-chat-validation" className="mt-1 text-xs text-destructive">
              {draft.length > 300
                ? "El mensaje supera el máximo de 300 caracteres."
                : "Escribe un mensaje con contenido."}
            </p>
          ) : null}
        </form>
      </section>

      <Button
        ref={launcherRef}
        type="button"
        size="icon"
        aria-label={open ? "Cerrar asistente técnico" : "Abrir asistente técnico"}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => {
          if (open) closePanel();
          else setOpen(true);
        }}
        className="size-11 shadow-md motion-reduce:transition-none"
      >
        {open
          ? <X aria-hidden="true" />
          : <MessageCircle aria-hidden="true" />}
      </Button>
    </div>
  );
}
