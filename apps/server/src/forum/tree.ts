import type { PublicComment } from "@blogdpc/contracts";

export type FlatPublicComment = Omit<PublicComment, "replies">;

export function buildCommentTree(rows: FlatPublicComment[]): PublicComment[] {
  const nodes = new Map<string, PublicComment>();
  const roots: PublicComment[] = [];

  for (const row of rows) nodes.set(row.id, { ...row, replies: [] });
  for (const row of rows) {
    const node = nodes.get(row.id)!;
    if (!row.parentId) {
      roots.push(node);
      continue;
    }
    const parent = nodes.get(row.parentId);
    if (parent) parent.replies.push(node);
  }

  return roots;
}
