export interface CommentCreatedEvent {
  rootId: string;
}

export type CommentListener = (event: CommentCreatedEvent) => void;

export interface CommentBroadcaster {
  subscribe(listener: CommentListener): () => void;
  emit(event: CommentCreatedEvent): void;
  listenerCount(): number;
}

export function createCommentBroadcaster(): CommentBroadcaster {
  const listeners = new Set<CommentListener>();

  return {
    subscribe(listener: CommentListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(event: CommentCreatedEvent): void {
      for (const listener of Array.from(listeners)) {
        try {
          listener(event);
        } catch {
          // Un error en un listener no debe afectar a los demás
        }
      }
    },
    listenerCount(): number {
      return listeners.size;
    },
  };
}
