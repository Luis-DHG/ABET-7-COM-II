import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import type { PublicComment } from "@blogdpc/contracts";
import { appendForumPage, publishForumComment, readForumCache, refreshForumCache } from "../src/pages/forum/forumCache.ts";

function comment(id: string, parentId: string | null = null, rootId = id, depth = 1): PublicComment {
  return { id, parentId, rootId, depth, authorName: "Autora", body: `Comentario ${id}`, isRemoved: false,
    createdAt: "2026-09-22T00:00:00.000Z", replies: [] };
}

function rootWithFive() {
  const root = { ...comment("root"), hasDeepConversation: true };
  root.replies = Array.from({ length: 5 }, (_, i) => comment(`reply-${i}`, root.id, root.id, 2));
  root.replies[1]!.isRemoved = true;
  root.replies[0]!.replies = [comment("historical-grandchild", "reply-0", root.id, 3)];
  return root;
}

test("solo la raíz habilitada con menos de seis directas puede responder; historial intacto", async () => {
  const url = new URL("../src/pages/forum/replyPolicy.ts", import.meta.url);
  assert.ok(existsSync(url), "Falta replyPolicy.ts: debe ofrecer canReplyToRoot");
  const module = await import(url.href);
  assert.equal(typeof module.canReplyToRoot, "function", "Debe exportarse canReplyToRoot");
  const canReply = module.canReplyToRoot as (comment: PublicComment, enabled: boolean, limit: number) => boolean;
  const root = rootWithFive(), original = structuredClone(root);
  assert.equal(canReply(root, true, 6), true);
  assert.equal(canReply(root, true, 5), false, "Debe usar el límite recibido, no un literal paralelo");
  assert.equal(canReply(root, false, 6), false, "Participación deshabilitada incluye sesión/red/suspensión derivadas");
  assert.equal(canReply({ ...root, isRemoved: true }, true, 6), false);
  assert.equal(canReply({ ...root, rootId: "other-root" }, true, 6), false);
  assert.equal(canReply({ ...root, depth: 2 }, true, 6), false);
  assert.equal(canReply(root.replies[0]!, true, 6), false);
  assert.equal(canReply(root.replies[0]!.replies[0]!, true, 6), false);
  const full = { ...root, replies: [...root.replies, comment("sixth", root.id, root.id, 2)] };
  assert.equal(canReply(full, true, 6), false, "La retirada sigue ocupando uno de los seis cupos");
  assert.deepEqual(root, original, "Elegibilidad no debe recortar ni alterar el historial");
});

test("append directo y sexta publicación preservan historial, páginas y cursor sin duplicar ids", async () => {
  const module = await import("../src/pages/forum/forumCache.ts");
  const helper = (module as Record<string, unknown>).appendThreadReply;
  assert.equal(typeof helper, "function", "forumCache debe exportar appendThreadReply");
  const append = helper as (root: PublicComment, reply: PublicComment) => PublicComment;
  const root = rootWithFive(), original = structuredClone(root);
  const sixth = comment("sixth", root.id, root.id, 2);
  const appended = append(root, sixth);
  assert.deepEqual(appended, { ...root, replies: [...root.replies, sixth] });
  assert.deepEqual(root, original, "El helper puro no modifica la lectura previa");
  assert.deepEqual(append(appended, sixth), appended, "Mismo id no crea un séptimo nodo ficticio");
  assert.deepEqual(append(root, comment("foreign", "other-root", "other-root", 2)), root);
  assert.deepEqual(append(root, comment("nested", "reply-0", root.id, 3)), root);

  await refreshForumCache(async () => ({ data: [root], meta: { nextCursor: "page-2" } }));
  const other = comment("second-page-root");
  appendForumPage([other], "page-3");
  const before = structuredClone(readForumCache());
  publishForumComment(sixth);
  const after = readForumCache();
  assert.equal(after.pageCount, before.pageCount);
  assert.equal(after.nextCursor, before.nextCursor);
  assert.deepEqual(after.comments, [appended, other]);
  assert.deepEqual(after.comments[0]!.replies.slice(0, 5), original.replies);
  publishForumComment(sixth);
  assert.deepEqual(readForumCache().comments, [appended, other]);
  assert.equal(readForumCache().pageCount, 2);
  assert.equal(readForumCache().nextCursor, "page-3");
});
