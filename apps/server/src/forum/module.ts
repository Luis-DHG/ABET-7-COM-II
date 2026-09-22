import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import type { CommentsQuery, CreateCommentInput, PublicComment } from "@blogdpc/contracts";
import type { Database } from "../db/client.js";
import { comments, users } from "../db/schema.js";
import { decodeCursor, encodeCursor } from "../http/cursor.js";
import { AppError } from "../http/errors.js";
import { buildCommentTree, type FlatPublicComment } from "./tree.js";

const REMOVED_MESSAGE = "Este mensaje incumple las normas del proyecto";
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;

interface CommentRow {
  id: string;
  parentId: string | null;
  rootId: string;
  path: string;
  body: string;
  isRemoved: boolean;
  createdAt: Date;
  authorName: string;
}

export function normalizeCommentBody(value: string): string {
  const body = value.normalize("NFC").replace(/\r\n?/gu, "\n").trim();
  if (CONTROL_CHARACTERS.test(body)) {
    throw new AppError(400, "COMMENT_INVALID_CHARACTERS", "El comentario contiene caracteres no permitidos.");
  }
  const length = [...body].length;
  if (length < 3 || length > 2000) {
    throw new AppError(400, "COMMENT_LENGTH", "El comentario debe tener entre 3 y 2000 caracteres.");
  }
  return body;
}

function depthOf(path: string): number {
  return path.split(".").length;
}

function toPublic(row: CommentRow): FlatPublicComment {
  return {
    id: row.id,
    parentId: row.parentId,
    rootId: row.rootId,
    authorName: row.authorName,
    body: row.isRemoved ? REMOVED_MESSAGE : row.body,
    isRemoved: row.isRemoved,
    createdAt: row.createdAt.toISOString(),
    depth: depthOf(row.path),
  };
}

const publicSelection = {
  id: comments.id,
  parentId: comments.parentId,
  rootId: comments.rootId,
  path: comments.path,
  body: comments.body,
  isRemoved: comments.isRemoved,
  createdAt: comments.createdAt,
  authorName: users.displayName,
};

export function createForumModule(db: Database) {
  return {
    async list(query: CommentsQuery): Promise<{ comments: PublicComment[]; nextCursor: string | null }> {
      const cursor = decodeCursor(query.cursor);
      const cursorCondition = cursor
        ? or(
            lt(comments.createdAt, cursor.createdAt),
            and(eq(comments.createdAt, cursor.createdAt), lt(comments.id, cursor.id)),
          )
        : undefined;
      const roots = await db.select(publicSelection)
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(and(isNull(comments.parentId), cursorCondition))
        .orderBy(desc(comments.createdAt), desc(comments.id))
        .limit(query.limit + 1);

      const hasMore = roots.length > query.limit;
      const pageRoots = hasMore ? roots.slice(0, query.limit) : roots;
      if (pageRoots.length === 0) return { comments: [], nextCursor: null };

      const rootIds = pageRoots.map((root) => root.id);
      const directReplies = await db.select(publicSelection)
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(and(inArray(comments.rootId, rootIds), sql`extensions.nlevel(${comments.path}) = 2`))
        .orderBy(asc(comments.createdAt), asc(comments.id));
      const deepRows = await db.select({ rootId: comments.rootId })
        .from(comments)
        .where(and(inArray(comments.rootId, rootIds), sql`extensions.nlevel(${comments.path}) > 2`))
        .groupBy(comments.rootId);
      const deepRoots = new Set(deepRows.map((row) => row.rootId));
      const repliesByRoot = new Map<string, PublicComment[]>();
      for (const reply of directReplies) {
        const list = repliesByRoot.get(reply.rootId) ?? [];
        list.push({ ...toPublic(reply), replies: [] });
        repliesByRoot.set(reply.rootId, list);
      }

      const result = pageRoots.map((root) => ({
        ...toPublic(root),
        hasDeepConversation: deepRoots.has(root.id),
        replies: repliesByRoot.get(root.id) ?? [],
      }));
      const last = pageRoots.at(-1)!;
      return {
        comments: result,
        nextCursor: hasMore ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
      };
    },

    async getThread(rootId: string): Promise<PublicComment> {
      const rows = await db.select(publicSelection)
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(eq(comments.rootId, rootId))
        .orderBy(asc(comments.createdAt), asc(comments.id));
      if (rows.length === 0 || !rows.some((row) => row.id === rootId && row.parentId === null)) {
        throw new AppError(404, "THREAD_NOT_FOUND", "La conversación no existe.");
      }
      const [root] = buildCommentTree(rows.map(toPublic));
      if (!root) throw new AppError(404, "THREAD_NOT_FOUND", "La conversación no existe.");
      return root;
    },

    async publish(authorId: string, input: CreateCommentInput): Promise<PublicComment> {
      const body = normalizeCommentBody(input.body);
      return db.transaction(async (tx) => {
        const [author] = await tx.select().from(users).where(eq(users.id, authorId)).limit(1).for("update");
        if (!author) throw new AppError(401, "AUTH_REQUIRED", "Debes iniciar sesión.");
        if (!author.emailVerifiedAt) throw new AppError(403, "EMAIL_NOT_VERIFIED", "Verifica tu correo antes de publicar.");
        if (author.isBanned) throw new AppError(403, "USER_BANNED", "Tu cuenta está suspendida para publicar.");

        const now = new Date();
        const [latest] = await tx.select({ createdAt: comments.createdAt }).from(comments)
          .where(eq(comments.authorId, authorId))
          .orderBy(desc(comments.createdAt)).limit(1);
        if (latest) {
          const remainingMs = 30_000 - (now.getTime() - latest.createdAt.getTime());
          if (remainingMs > 0) {
            throw new AppError(429, "COMMENT_COOLDOWN", "Espera antes de publicar de nuevo.", {
              retryAfterSeconds: Math.ceil(remainingMs / 1000),
            });
          }
        }

        const id = randomUUID();
        const label = `n${id.replaceAll("-", "")}`;
        let parentId: string | null = null;
        let rootId: string = id;
        let path = label;
        if (input.parentId) {
          const [parent] = await tx.select().from(comments)
            .where(eq(comments.id, input.parentId)).limit(1).for("update");
          if (!parent) throw new AppError(404, "PARENT_NOT_FOUND", "El comentario al que respondes no existe.");
          if (depthOf(parent.path) >= 6) {
            throw new AppError(409, "MAX_THREAD_DEPTH", "La conversación alcanzó el máximo de seis niveles.");
          }
          parentId = parent.id;
          rootId = parent.rootId;
          path = `${parent.path}.${label}`;
        }

        await tx.insert(comments).values({
          id,
          authorId,
          parentId,
          rootId,
          path,
          body,
          createdAt: now,
        });
        return {
          id,
          parentId,
          rootId,
          authorName: author.displayName,
          body,
          isRemoved: false,
          createdAt: now.toISOString(),
          depth: depthOf(path),
          replies: [],
        };
      });
    },
  };
}

export type ForumModule = ReturnType<typeof createForumModule>;
