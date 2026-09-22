import { and, desc, eq, ilike, isNull, lt, or } from "drizzle-orm";
import type { AdminCommentsQuery, AdminUsersQuery } from "@blogdpc/contracts";
import type { Database } from "../db/client.js";
import { comments, users } from "../db/schema.js";
import { decodeCursor, encodeCursor } from "../http/cursor.js";
import { AppError } from "../http/errors.js";

async function ensureAdmin(db: Database, actorId: string): Promise<void> {
  const [actor] = await db.select({ role: users.role }).from(users).where(eq(users.id, actorId)).limit(1);
  if (!actor || actor.role !== "ADMIN") {
    throw new AppError(403, "ADMIN_REQUIRED", "No tienes permisos de administración.");
  }
}

export function createAdminModule(db: Database) {
  return {
    async listComments(actorId: string, query: AdminCommentsQuery) {
      await ensureAdmin(db, actorId);
      const cursor = decodeCursor(query.cursor);
      const cursorCondition = cursor
        ? or(
            lt(comments.createdAt, cursor.createdAt),
            and(eq(comments.createdAt, cursor.createdAt), lt(comments.id, cursor.id)),
          )
        : undefined;
      const statusCondition = query.status === "ACTIVE"
        ? eq(comments.isRemoved, false)
        : query.status === "REMOVED"
          ? eq(comments.isRemoved, true)
          : undefined;
      const rows = await db.select({
        id: comments.id,
        rootId: comments.rootId,
        parentId: comments.parentId,
        body: comments.body,
        isRemoved: comments.isRemoved,
        createdAt: comments.createdAt,
        authorId: users.id,
        authorName: users.displayName,
        authorEmail: users.email,
      }).from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(and(cursorCondition, statusCondition))
        .orderBy(desc(comments.createdAt), desc(comments.id))
        .limit(query.limit + 1);
      const hasMore = rows.length > query.limit;
      const page = hasMore ? rows.slice(0, query.limit) : rows;
      const last = page.at(-1);
      return {
        comments: page.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
        nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
      };
    },

    async moderateComment(actorId: string, commentId: string): Promise<void> {
      await db.transaction(async (tx) => {
        const [actor] = await tx.select({ role: users.role }).from(users)
          .where(eq(users.id, actorId)).limit(1).for("update");
        if (!actor || actor.role !== "ADMIN") {
          throw new AppError(403, "ADMIN_REQUIRED", "No tienes permisos de administración.");
        }
        const [comment] = await tx.select().from(comments)
          .where(eq(comments.id, commentId)).limit(1).for("update");
        if (!comment) throw new AppError(404, "COMMENT_NOT_FOUND", "El comentario no existe.");
        if (!comment.isRemoved) {
          await tx.update(comments).set({
            isRemoved: true,
            removedAt: new Date(),
            removedBy: actorId,
          }).where(eq(comments.id, commentId));
        }
      });
    },

    async listUsers(actorId: string, query: AdminUsersQuery) {
      await ensureAdmin(db, actorId);
      const cursor = decodeCursor(query.cursor);
      const cursorCondition = cursor
        ? or(
            lt(users.createdAt, cursor.createdAt),
            and(eq(users.createdAt, cursor.createdAt), lt(users.id, cursor.id)),
          )
        : undefined;
      const searchCondition = query.query
        ? or(ilike(users.email, `%${query.query}%`), ilike(users.displayName, `%${query.query}%`))
        : undefined;
      const rows = await db.select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        emailVerifiedAt: users.emailVerifiedAt,
        isBanned: users.isBanned,
        bannedAt: users.bannedAt,
        createdAt: users.createdAt,
      }).from(users)
        .where(and(cursorCondition, searchCondition))
        .orderBy(desc(users.createdAt), desc(users.id))
        .limit(query.limit + 1);
      const hasMore = rows.length > query.limit;
      const page = hasMore ? rows.slice(0, query.limit) : rows;
      const last = page.at(-1);
      return {
        users: page.map((user) => ({
          ...user,
          emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
          bannedAt: user.bannedAt?.toISOString() ?? null,
          createdAt: user.createdAt.toISOString(),
        })),
        nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
      };
    },

    async banUser(actorId: string, userId: string): Promise<void> {
      if (actorId === userId) throw new AppError(409, "CANNOT_BAN_SELF", "No puedes suspender tu propia cuenta.");
      await db.transaction(async (tx) => {
        const [actor] = await tx.select({ role: users.role }).from(users)
          .where(eq(users.id, actorId)).limit(1).for("update");
        if (!actor || actor.role !== "ADMIN") {
          throw new AppError(403, "ADMIN_REQUIRED", "No tienes permisos de administración.");
        }
        const [target] = await tx.select().from(users)
          .where(eq(users.id, userId)).limit(1).for("update");
        if (!target) throw new AppError(404, "USER_NOT_FOUND", "El usuario no existe.");
        if (target.role === "ADMIN") throw new AppError(409, "CANNOT_BAN_ADMIN", "No se puede suspender a otro administrador.");
        if (!target.isBanned) {
          await tx.update(users).set({
            isBanned: true,
            bannedAt: new Date(),
            bannedBy: actorId,
            updatedAt: new Date(),
          }).where(and(eq(users.id, userId), isNull(users.bannedAt)));
        }
      });
    },
  };
}

export type AdminModule = ReturnType<typeof createAdminModule>;
