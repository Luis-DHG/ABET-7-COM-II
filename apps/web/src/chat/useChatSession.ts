import { useEffect, useRef, useState } from "react";
import { useSession } from "../session/SessionProvider";
import { apiResponse, ApiError } from "../lib/http";
import { canSubmit, createChatSendGuard, createChatSession } from "./session";
import { consumeChatStream } from "./stream";

export type ChatTimelineEntry =
  | { kind: "completed"; role: "user" | "assistant"; content: string; id: string }
  | { kind: "failed"; user: string; assistant: string; error: string; id: string };

export function useChatSession(draft: string) {
  const { status, online } = useSession();
  const [session] = useState(() => createChatSession());
  const [messages, setMessages] = useState(session.messages);
  const [pending, setPending] = useState<{ user: string; assistant: string } | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<Array<{ user: string; assistant: string; error: string }>>([]);
  const [timeline, setTimeline] = useState<ChatTimelineEntry[]>(() =>
    session.messages.map((m, index) => ({
      kind: "completed" as const,
      role: m.role,
      content: m.content,
      id: `restored-${index}`,
    }))
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageDegraded, setStorageDegraded] = useState(session.storageDegraded);
  const guard = useRef(createChatSendGuard());
  const active = useRef<AbortController | null>(null);
  const nextId = useRef(0);

  useEffect(() => () => {
    active.current?.abort();
    active.current = null;
  }, []);

  async function submit(message = draft): Promise<boolean> {
    if (!canSubmit(status, online, isStreaming, message) || !guard.current.acquire()) return false;
    const controller = new AbortController();
    active.current = controller;
    setIsStreaming(true);
    setError(null);
    setPending({ user: message, assistant: "" });
    let partial = "";
    try {
      const response = await apiResponse("/api/chat", {
        method: "POST",
        body: { tabSessionId: session.tabSessionId, message },
        signal: controller.signal,
      });
      const content = await consumeChatStream(response, (chunk) => {
        if (active.current === controller) {
          partial += chunk;
          setPending((previous) => previous ? { ...previous, assistant: previous.assistant + chunk } : previous);
        }
      }, controller.signal);
      if (controller.signal.aborted || active.current !== controller) return false;
      session.commit(message, content);
      setMessages(session.messages);
      setStorageDegraded(session.storageDegraded);
      const userMsgId = `turn-${nextId.current++}-u`;
      const assistantMsgId = `turn-${nextId.current++}-a`;
      setTimeline((previous) => [
        ...previous,
        { kind: "completed", role: "user", content: message, id: userMsgId },
        { kind: "completed", role: "assistant", content, id: assistantMsgId },
      ]);
      return true;
    } catch (failure) {
      if (active.current === controller) {
        const messageError = failure instanceof ApiError ? failure.message : "La respuesta se interrumpió. Intenta de nuevo.";
        setError(messageError);
        const failedId = `failed-${nextId.current++}`;
        setFailedAttempts((previous) => [...previous, { user: message, assistant: partial, error: messageError }]);
        setTimeline((previous) => [
          ...previous,
          { kind: "failed", user: message, assistant: partial, error: messageError, id: failedId },
        ]);
      }
      return false;
    } finally {
      guard.current.release();
      if (active.current === controller) {
        active.current = null;
        setPending(null);
        setIsStreaming(false);
      }
    }
  }

  return {
    messages, pending, failedAttempts, timeline, isStreaming, error, storageDegraded, submit,
    inputDisabled: status !== "authenticated" || !online || isStreaming,
    sendDisabled: !canSubmit(status, online, isStreaming, draft),
  };
}
