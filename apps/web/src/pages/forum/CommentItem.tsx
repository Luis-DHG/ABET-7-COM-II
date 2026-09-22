import { memo, useState } from "react";
import { Link } from "react-router-dom";
import type { PublicComment } from "@blogdpc/contracts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CommentComposer } from "@/pages/forum/CommentComposer";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

interface CommentItemProps {
  comment: PublicComment;
  canReply: boolean;
  threadMode?: boolean;
  parentAuthorName?: string;
  onReplyPublished: (comment: PublicComment) => void;
}

export const CommentItem = memo(function CommentItem({
  comment,
  canReply,
  threadMode = false,
  parentAuthorName,
  onReplyPublished,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);

  // Sangría acotada: niveles profundos se señalan con barra lateral + etiqueta (plan §6.3).
  const depthIndent = Math.min(comment.depth - 1, 3);

  return (
    <li
      className={cn(comment.depth > 1 && "border-l-2 border-border pl-4", "list-none")}
      style={comment.depth > 1 ? { marginLeft: `${depthIndent * 0.75}rem` } : undefined}
    >
      <article className="py-4">
        <header className="flex flex-wrap items-center gap-2 text-sm">
          <Avatar className="size-7">
            <AvatarFallback>{initials(comment.authorName)}</AvatarFallback>
          </Avatar>
          <span className={cn("font-medium", comment.isRemoved && "text-muted-foreground")}>
            {comment.authorName}
          </span>
          <time dateTime={comment.createdAt} className="text-xs text-muted-foreground">
            {formatDateTime(comment.createdAt)}
          </time>
          {comment.isRemoved ? <Badge variant="secondary">Retirado</Badge> : null}
        </header>

        {comment.depth > 1 && threadMode ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Respuesta a {parentAuthorName ?? "este comentario"}
          </p>
        ) : null}

        <p
          className={cn(
            "mt-2 max-w-prose whitespace-pre-line leading-relaxed",
            comment.isRemoved && "text-muted-foreground italic",
          )}
        >
          {comment.body}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {canReply && !comment.isRemoved ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => setReplying((value) => !value)}
              aria-expanded={replying}
            >
              Responder
            </Button>
          ) : null}
          {!threadMode && comment.hasDeepConversation ? (
            <Link
              to={`/retroalimentacion/${comment.rootId}`}
              className="text-xs text-primary underline underline-offset-4"
            >
              Ver conversación completa
            </Link>
          ) : null}
        </div>

        {replying ? (
          <div className="mt-3 rounded-lg border bg-card p-4">
            <CommentComposer
              parentId={comment.id}
              autoFocus
              onCancel={() => setReplying(false)}
              onPublished={(published) => {
                setReplying(false);
                onReplyPublished(published);
              }}
            />
          </div>
        ) : null}
      </article>

      {comment.replies.length > 0 ? (
        <ul className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              canReply={canReply}
              threadMode={threadMode}
              parentAuthorName={comment.authorName}
              onReplyPublished={onReplyPublished}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
});
