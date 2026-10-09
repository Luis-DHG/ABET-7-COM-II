import { memo, useState } from "react";
import { Link } from "react-router-dom";
import type { PublicComment } from "@blogdpc/contracts";
import { MAX_DIRECT_REPLIES_PER_ROOT } from "@blogdpc/contracts/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CommentComposer } from "@/pages/forum/CommentComposer";
import { canReplyToRoot } from "@/pages/forum/replyPolicy";

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
  onConflict?: () => void;
}

export const CommentItem = memo(function CommentItem({
  comment,
  canReply,
  threadMode = false,
  parentAuthorName,
  onReplyPublished,
  onConflict,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  // Un rechazo por cupo bloquea el reenvío de esta lectura hasta que llegue una actualizada.
  const [rejectedReading, setRejectedReading] = useState<PublicComment | null>(null);

  const replyEligible =
    canReplyToRoot(comment, canReply, MAX_DIRECT_REPLIES_PER_ROOT) && rejectedReading !== comment;

  return (
    <li
      id={`comment-${comment.id}`}
      tabIndex={-1}
      className="comment-item"
      data-depth={comment.depth}
    >
      <article className="py-4">
        <header className="flex flex-wrap items-center gap-2 text-sm">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback>{initials(comment.authorName)}</AvatarFallback>
          </Avatar>
          <span className={cn("font-medium", comment.isRemoved && "text-muted-foreground")}>
            {comment.authorName}
          </span>
          <time dateTime={comment.createdAt} className="text-[0.8125rem] text-muted-foreground">
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
            "comment-message mt-2 whitespace-pre-line",
            comment.isRemoved && "text-muted-foreground italic",
          )}
        >
          {comment.body}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {replyEligible ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplying((value) => !value)}
              aria-expanded={replying}
            >
              Responder
            </Button>
          ) : null}
          {!threadMode && comment.hasDeepConversation ? (
            <Link
              to={`/retroalimentacion/${comment.rootId}`}
              className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
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
              disabled={!replyEligible}
              onCancel={() => setReplying(false)}
              onPublished={(published) => {
                setReplying(false);
                onReplyPublished(published);
              }}
              onConflict={() => {
                setRejectedReading(comment);
                onConflict?.();
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
