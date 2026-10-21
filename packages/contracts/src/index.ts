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

export { MAX_COMMENT_DEPTH, MAX_DIRECT_REPLIES_PER_ROOT } from "./constants.js";

export const createCommentSchema = z.object({
  body: z.string().max(4000),
  parentId: z.string().uuid().optional(),
}).strict();

export const chatRequestSchema = z.strictObject({
  tabSessionId: z.uuidv4(),
  // Zod 4.6 mide max() en puntos de código; el contrato del chat usa unidades UTF-16.
  message: z.string().min(1).max(300)
    .refine((value) => value.length <= 300, "El mensaje no puede superar las 300 unidades UTF-16.")
    .refine((value) => value.trim().length > 0, "Escribe un mensaje que no contenga solo espacios."),
});

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
export type ChatRequest = z.infer<typeof chatRequestSchema>;
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
