import { z } from "zod";

const email = z.string().trim().email().max(320).transform((value) => value.toLowerCase());
const password = z.string().min(10).max(128);

export const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  email,
  password,
}).strict();

export const loginSchema = z.object({ email, password }).strict();

export const tokenSchema = z.object({
  token: z.string().min(32).max(512),
}).strict();

export const resendVerificationSchema = z.object({ email }).strict();
export const forgotPasswordSchema = z.object({ email }).strict();

export const resetPasswordSchema = tokenSchema.extend({
  password,
}).strict();

export const createCommentSchema = z.object({
  body: z.string().max(4000),
  parentId: z.string().uuid().optional(),
}).strict();

export const commentsQuerySchema = z.object({
  cursor: z.string().max(512).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(20),
});

export const adminCommentsQuerySchema = z.object({
  cursor: z.string().max(512).optional(),
  status: z.enum(["ALL", "ACTIVE", "REMOVED"]).default("ALL"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminUsersQuerySchema = z.object({
  cursor: z.string().max(512).optional(),
  query: z.string().trim().max(320).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentsQuery = z.infer<typeof commentsQuerySchema>;
export type AdminCommentsQuery = z.infer<typeof adminCommentsQuerySchema>;
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  isBanned: boolean;
}

export interface PublicComment {
  id: string;
  parentId: string | null;
  rootId: string;
  authorName: string;
  body: string;
  isRemoved: boolean;
  createdAt: string;
  depth: number;
  hasDeepConversation?: boolean;
  replies: PublicComment[];
}
