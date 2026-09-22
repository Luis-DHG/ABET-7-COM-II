import type { PublicComment } from "@blogdpc/contracts";

const MAX_AGE_MS = 60_000;

interface ForumCache {
  comments: PublicComment[];
  nextCursor: string | null;
  pageCount: number;
  updatedAt: number;
}

let cache: ForumCache = { comments: [], nextCursor: null, pageCount: 0, updatedAt: 0 };

export function readForumCache(): ForumCache {
  return cache;
}

export function isForumCacheStale(now = Date.now()): boolean {
  return cache.pageCount === 0 || now - cache.updatedAt >= MAX_AGE_MS;
}

export function invalidateForumCache(): void {
  cache = { ...cache, updatedAt: 0 };
}

export function appendForumPage(comments: PublicComment[], nextCursor: string | null): ForumCache {
  const existing = new Set(cache.comments.map((comment) => comment.id));
  cache = {
    comments: [...cache.comments, ...comments.filter((comment) => !existing.has(comment.id))],
    nextCursor,
    pageCount: cache.pageCount + 1,
    updatedAt: cache.updatedAt,
  };
  return cache;
}

export function publishForumComment(comment: PublicComment): ForumCache {
  const comments = comment.depth === 1
    ? [comment, ...cache.comments.filter((root) => root.id !== comment.id)]
    : cache.comments.map((root) => {
        if (comment.parentId === root.id) {
          return { ...root, replies: [...root.replies, comment] };
        }
        if (root.id === comment.rootId && comment.depth >= 3) {
          return { ...root, hasDeepConversation: true };
        }
        return root;
      });
  cache = { ...cache, comments, updatedAt: cache.pageCount && !isForumCacheStale() ? Date.now() : cache.updatedAt };
  return cache;
}

export async function refreshForumCache(
  loadPage: (cursor: string | null, signal?: AbortSignal) => Promise<{ data: PublicComment[]; meta?: { nextCursor: string | null } }>,
  signal?: AbortSignal,
): Promise<ForumCache> {
  const previous = cache;
  const comments: PublicComment[] = [];
  let cursor: string | null = null;
  let pageCount = 0;
  do {
    const page = await loadPage(cursor, signal);
    comments.push(...page.data);
    cursor = page.meta?.nextCursor ?? null;
    pageCount++;
  } while (pageCount < Math.max(1, previous.pageCount) && cursor);
  if (cache === previous) {
    cache = { comments, nextCursor: cursor, pageCount, updatedAt: Date.now() };
  }
  return cache;
}
