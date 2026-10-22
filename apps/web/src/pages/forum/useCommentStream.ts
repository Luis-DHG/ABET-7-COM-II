import { useEffect, useRef } from "react";

export interface CommentCreatedStreamEvent {
  rootId: string;
}

export interface UseCommentStreamOptions {
  enabled?: boolean;
  onCommentCreated?: (event: CommentCreatedStreamEvent) => void;
  onReconnect?: () => void;
  streamKey?: string;
}

export function useCommentStream({
  enabled = true,
  onCommentCreated,
  onReconnect,
  streamKey,
}: UseCommentStreamOptions = {}): void {
  const onCommentCreatedRef = useRef(onCommentCreated);
  const onReconnectRef = useRef(onReconnect);

  useEffect(() => {
    onCommentCreatedRef.current = onCommentCreated;
    onReconnectRef.current = onReconnect;
  });

  useEffect(() => {
    if (!enabled || typeof EventSource === "undefined") {
      return;
    }

    const source = new EventSource("/api/comments/stream");
    let hasConnected = false;

    const handleOpen = () => {
      if (hasConnected) {
        onReconnectRef.current?.();
      } else {
        hasConnected = true;
      }
    };

    const handleCommentCreated = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as unknown;
        if (
          payload !== null &&
          typeof payload === "object" &&
          "rootId" in payload &&
          typeof (payload as { rootId: unknown }).rootId === "string"
        ) {
          onCommentCreatedRef.current?.({
            rootId: (payload as { rootId: string }).rootId,
          });
        }
      } catch {
        // Ignorar tramas no parseables o malformadas
      }
    };

    source.addEventListener("open", handleOpen);
    source.addEventListener("comment.created", handleCommentCreated);

    return () => {
      source.removeEventListener("open", handleOpen);
      source.removeEventListener("comment.created", handleCommentCreated);
      source.close();
    };
  }, [enabled, streamKey]);
}
