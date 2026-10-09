import type { PublicComment } from "@blogdpc/contracts";

/**
 * Elegibilidad compartida de respuesta bajo la política de respuestas directas:
 * solo una raíz con participación habilitada, no retirada y con cupo disponible.
 * El conteo de `replies` incluye las respuestas retiradas; el historial
 * multinivel permanece legible pero no admite nuevas respuestas.
 */
export function canReplyToRoot(
  comment: PublicComment,
  participationEnabled: boolean,
  maximumDirectReplies: number,
): boolean {
  return (
    participationEnabled &&
    !comment.isRemoved &&
    comment.parentId === null &&
    comment.rootId === comment.id &&
    comment.depth === 1 &&
    comment.replies.length < maximumDirectReplies
  );
}
