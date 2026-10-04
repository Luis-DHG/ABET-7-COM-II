import assert from "node:assert/strict";
import { test } from "node:test";
import type { PublicComment } from "@blogdpc/contracts";
import {
  appendForumPage,
  invalidateForumCache,
  isForumCacheStale,
  publishForumComment,
  readForumCache,
  refreshForumCache,
} from "../src/pages/forum/forumCache.ts";

function comment(id: string, parentId: string | null = null, rootId = id, depth = 1): PublicComment {
  return { id, parentId, rootId, depth, authorName: "Autora", body: "Comentario", isRemoved: false, createdAt: "2026-09-22T00:00:00.000Z", replies: [] };
}

test("conserva páginas, actualiza publicaciones y revalida sin perder contenido útil", async () => {
  const first = comment("first");
  const second = comment("second");
  await refreshForumCache(async () => ({ data: [first], meta: { nextCursor: "page-2" } }));
  const refreshedAt = readForumCache().updatedAt;
  appendForumPage([second], null);
  assert.deepEqual(readForumCache().comments.map((root) => root.id), ["first", "second"]);
  assert.equal(readForumCache().pageCount, 2);
  assert.equal(readForumCache().updatedAt, refreshedAt);

  publishForumComment(comment("new"));
  publishForumComment(comment("reply", "first", "first", 2));
  publishForumComment(comment("deep", "reply", "first", 3));
  assert.deepEqual(readForumCache().comments.map((root) => root.id), ["new", "first", "second"]);
  assert.equal(readForumCache().comments[1]?.replies[0]?.id, "reply");
  assert.equal(readForumCache().comments[1]?.hasDeepConversation, true);

  invalidateForumCache();
  assert.equal(isForumCacheStale(), true);
  assert.equal(readForumCache().comments.length, 3);
  const cursors: (string | null)[] = [];
  await refreshForumCache(async (cursor) => {
    cursors.push(cursor);
    return cursor === null
      ? { data: [comment("new"), first], meta: { nextCursor: "updated-page-2" } }
      : { data: [second], meta: { nextCursor: null } };
  });
  assert.deepEqual(cursors, [null, "updated-page-2"]);
  assert.equal(readForumCache().pageCount, 2);
  assert.deepEqual(readForumCache().comments.map((root) => root.id), ["new", "first", "second"]);
  assert.equal(isForumCacheStale(), false);

  await assert.rejects(refreshForumCache(async () => { throw new Error("sin red"); }));
  assert.equal(readForumCache().comments.length, 3);
  invalidateForumCache();
  publishForumComment(comment("published-while-stale"));
  assert.equal(isForumCacheStale(), true);
});

test("una revalidación antigua no sobrescribe una publicación reciente", async () => {
  let resolvePage!: (value: { data: PublicComment[]; meta: { nextCursor: null } }) => void;
  const pending = refreshForumCache(() => new Promise((resolve) => { resolvePage = resolve; }));
  publishForumComment(comment("during-refresh"));
  resolvePage({ data: [comment("old")], meta: { nextCursor: null } });
  await pending;
  assert.equal(readForumCache().comments[0]?.id, "during-refresh");
});
