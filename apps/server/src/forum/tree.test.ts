import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../http/errors.js";
import { normalizeCommentBody } from "./module.js";
import { buildCommentTree, type FlatPublicComment } from "./tree.js";

function comment(id: string, parentId: string | null, depth: number): FlatPublicComment {
  return {
    id,
    parentId,
    rootId: "00000000-0000-4000-8000-000000000001",
    authorName: "Usuario",
    body: id,
    isRemoved: false,
    createdAt: "2026-09-21T00:00:00.000Z",
    depth,
  };
}

test("construye un árbol sin perder el orden de hermanos", () => {
  const rows = [comment("root", null, 1), comment("a", "root", 2), comment("b", "root", 2), comment("c", "a", 3)];
  const tree = buildCommentTree(rows);
  assert.equal(tree.length, 1);
  assert.deepEqual(tree[0]?.replies.map((reply) => reply.id), ["a", "b"]);
  assert.equal(tree[0]?.replies[0]?.replies[0]?.id, "c");
});

test("normaliza texto plano y rechaza controles o longitudes inválidas", () => {
  assert.equal(normalizeCommentBody("  línea 1\r\nlínea 2  "), "línea 1\nlínea 2");
  assert.throws(() => normalizeCommentBody("ab"), (error) => error instanceof AppError && error.code === "COMMENT_LENGTH");
  assert.throws(() => normalizeCommentBody("texto\u0000"), (error) => error instanceof AppError && error.code === "COMMENT_INVALID_CHARACTERS");
});
