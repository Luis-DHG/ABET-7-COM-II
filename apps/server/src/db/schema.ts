import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  char,
  check,
  customType,
  index,
  pgPolicy,
  pgRole,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const appSchema = pgSchema("app");
export const appRole = pgRole("blogdpc_app", { createDb: false, createRole: false, inherit: false });

const ltree = customType<{ data: string }>({
  dataType() {
    return "ltree";
  },
});

export const users = appSchema.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  passwordHash: text("password_hash"),
  googleSubject: text("google_subject"),
  role: text("role").notNull().default("USER"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true, mode: "date" }),
  isBanned: boolean("is_banned").notNull().default(false),
  bannedAt: timestamp("banned_at", { withTimezone: true, mode: "date" }),
  bannedBy: uuid("banned_by").references((): AnyPgColumn => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("users_email_uq").on(table.email),
  uniqueIndex("users_google_subject_uq").on(table.googleSubject),
  check("users_email_normalized_ck", sql`${table.email} = lower(btrim(${table.email}))`),
  check("users_display_name_length_ck", sql`char_length(btrim(${table.displayName})) between 2 and 100`),
  check("users_role_ck", sql`${table.role} in ('USER', 'ADMIN')`),
  check("users_login_method_ck", sql`${table.passwordHash} is not null or ${table.googleSubject} is not null`),
  check("users_ban_fields_ck", sql`(${table.isBanned} and ${table.bannedAt} is not null and ${table.bannedBy} is not null) or (not ${table.isBanned} and ${table.bannedAt} is null and ${table.bannedBy} is null)`),
  pgPolicy("users_backend_select", { for: "select", to: appRole, using: sql`true` }),
  pgPolicy("users_backend_insert", { for: "insert", to: appRole, withCheck: sql`${table.role} = 'USER'` }),
  pgPolicy("users_backend_update", { for: "update", to: appRole, using: sql`true`, withCheck: sql`true` }),
]);

export const refreshTokens = appSchema.table("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  familyId: uuid("family_id").notNull(),
  tokenHash: char("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true, mode: "date" }),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  replacedById: uuid("replaced_by_id").references((): AnyPgColumn => refreshTokens.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("refresh_tokens_hash_uq").on(table.tokenHash),
  index("refresh_tokens_family_idx").on(table.familyId),
  index("refresh_tokens_user_idx").on(table.userId),
  check("refresh_tokens_expiry_ck", sql`${table.expiresAt} > ${table.createdAt}`),
  check("refresh_tokens_max_lifetime_ck", sql`${table.expiresAt} <= ${table.createdAt} + interval '7 days'`),
  check("refresh_tokens_hash_ck", sql`${table.tokenHash} ~ '^[0-9a-f]{64}$'`),
  check("refresh_tokens_rotation_ck", sql`(${table.usedAt} is null and ${table.replacedById} is null) or (${table.usedAt} is not null and ${table.replacedById} is not null)`),
  check("refresh_tokens_timestamps_ck", sql`(${table.usedAt} is null or ${table.usedAt} >= ${table.createdAt}) and (${table.revokedAt} is null or ${table.revokedAt} >= ${table.createdAt})`),
  pgPolicy("refresh_tokens_backend_access", { for: "all", to: appRole, using: sql`true`, withCheck: sql`true` }),
]);

export const accountTokens = appSchema.table("account_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  purpose: text("purpose").notNull(),
  tokenHash: char("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("account_tokens_hash_uq").on(table.tokenHash),
  index("account_tokens_user_purpose_idx").on(table.userId, table.purpose),
  check("account_tokens_purpose_ck", sql`${table.purpose} in ('VERIFY_EMAIL', 'RESET_PASSWORD')`),
  check("account_tokens_expiry_ck", sql`${table.expiresAt} > ${table.createdAt}`),
  check("account_tokens_max_lifetime_ck", sql`(${table.purpose} = 'VERIFY_EMAIL' and ${table.expiresAt} <= ${table.createdAt} + interval '24 hours') or (${table.purpose} = 'RESET_PASSWORD' and ${table.expiresAt} <= ${table.createdAt} + interval '1 hour')`),
  check("account_tokens_hash_ck", sql`${table.tokenHash} ~ '^[0-9a-f]{64}$'`),
  check("account_tokens_consumed_at_ck", sql`${table.consumedAt} is null or ${table.consumedAt} >= ${table.createdAt}`),
  pgPolicy("account_tokens_backend_access", { for: "all", to: appRole, using: sql`true`, withCheck: sql`true` }),
]);

export const comments = appSchema.table("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, { onDelete: "restrict" }),
  rootId: uuid("root_id").notNull().references((): AnyPgColumn => comments.id, { onDelete: "restrict" }),
  path: ltree("path").notNull(),
  body: text("body").notNull(),
  isRemoved: boolean("is_removed").notNull().default(false),
  removedAt: timestamp("removed_at", { withTimezone: true, mode: "date" }),
  removedBy: uuid("removed_by").references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("comments_path_uq").on(table.path),
  index("comments_path_gist_idx").using("gist", table.path),
  index("comments_roots_page_idx").on(table.createdAt.desc(), table.id.desc()).where(sql`${table.parentId} is null`),
  index("comments_root_children_idx").on(table.rootId, table.createdAt.asc(), table.id.asc()),
  index("comments_author_recent_idx").on(table.authorId, table.createdAt.desc()),
  check("comments_body_length_ck", sql`char_length(btrim(${table.body})) between 3 and 2000`),
  check("comments_depth_ck", sql`extensions.nlevel(${table.path}) between 1 and 6`),
  check("comments_root_shape_ck", sql`(${table.parentId} is null and ${table.rootId} = ${table.id} and extensions.nlevel(${table.path}) = 1) or (${table.parentId} is not null and extensions.nlevel(${table.path}) > 1)`),
  check("comments_path_label_ck", sql`extensions.subpath(${table.path}, -1)::text = 'n' || replace(${table.id}::text, '-', '')`),
  check("comments_moderation_fields_ck", sql`(${table.isRemoved} and ${table.removedAt} is not null and ${table.removedBy} is not null) or (not ${table.isRemoved} and ${table.removedAt} is null and ${table.removedBy} is null)`),
  check("comments_removed_at_ck", sql`${table.removedAt} is null or ${table.removedAt} >= ${table.createdAt}`),
  pgPolicy("comments_backend_select", { for: "select", to: appRole, using: sql`true` }),
  pgPolicy("comments_backend_insert", { for: "insert", to: appRole, withCheck: sql`not ${table.isRemoved} and ${table.removedAt} is null and ${table.removedBy} is null` }),
  pgPolicy("comments_backend_update", { for: "update", to: appRole, using: sql`true`, withCheck: sql`true` }),
]);

export type User = typeof users.$inferSelect;
