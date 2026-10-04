CREATE SCHEMA IF NOT EXISTS "extensions";
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "ltree" WITH SCHEMA "extensions";
--> statement-breakpoint
SET search_path TO "app", "extensions", "public";
--> statement-breakpoint
CREATE SCHEMA "app";
--> statement-breakpoint
CREATE TABLE "app"."account_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_tokens_purpose_ck" CHECK ("app"."account_tokens"."purpose" in ('VERIFY_EMAIL', 'RESET_PASSWORD')),
	CONSTRAINT "account_tokens_expiry_ck" CHECK ("app"."account_tokens"."expires_at" > "app"."account_tokens"."created_at")
);
--> statement-breakpoint
CREATE TABLE "app"."comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_id" uuid,
	"root_id" uuid NOT NULL,
	"path" "ltree" NOT NULL,
	"body" text NOT NULL,
	"is_removed" boolean DEFAULT false NOT NULL,
	"removed_at" timestamp with time zone,
	"removed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_body_length_ck" CHECK (char_length(btrim("app"."comments"."body")) between 3 and 2000),
	CONSTRAINT "comments_depth_ck" CHECK (extensions.nlevel("app"."comments"."path") between 1 and 8),
	CONSTRAINT "comments_root_shape_ck" CHECK (("app"."comments"."parent_id" is null and "app"."comments"."root_id" = "app"."comments"."id" and extensions.nlevel("app"."comments"."path") = 1) or ("app"."comments"."parent_id" is not null and extensions.nlevel("app"."comments"."path") > 1)),
	CONSTRAINT "comments_moderation_fields_ck" CHECK (("app"."comments"."is_removed" and "app"."comments"."removed_at" is not null and "app"."comments"."removed_by" is not null) or (not "app"."comments"."is_removed" and "app"."comments"."removed_at" is null and "app"."comments"."removed_by" is null))
);
--> statement-breakpoint
CREATE TABLE "app"."refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"family_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"replaced_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_expiry_ck" CHECK ("app"."refresh_tokens"."expires_at" > "app"."refresh_tokens"."created_at")
);
--> statement-breakpoint
CREATE TABLE "app"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"password_hash" text,
	"google_subject" text,
	"role" text DEFAULT 'USER' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"is_banned" boolean DEFAULT false NOT NULL,
	"banned_at" timestamp with time zone,
	"banned_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_normalized_ck" CHECK ("app"."users"."email" = lower(btrim("app"."users"."email"))),
	CONSTRAINT "users_display_name_length_ck" CHECK (char_length(btrim("app"."users"."display_name")) between 2 and 100),
	CONSTRAINT "users_role_ck" CHECK ("app"."users"."role" in ('USER', 'ADMIN')),
	CONSTRAINT "users_login_method_ck" CHECK ("app"."users"."password_hash" is not null or "app"."users"."google_subject" is not null),
	CONSTRAINT "users_ban_fields_ck" CHECK (("app"."users"."is_banned" and "app"."users"."banned_at" is not null and "app"."users"."banned_by" is not null) or (not "app"."users"."is_banned" and "app"."users"."banned_at" is null and "app"."users"."banned_by" is null))
);
--> statement-breakpoint
ALTER TABLE "app"."account_tokens" ADD CONSTRAINT "account_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "app"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "app"."comments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_root_id_comments_id_fk" FOREIGN KEY ("root_id") REFERENCES "app"."comments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_removed_by_users_id_fk" FOREIGN KEY ("removed_by") REFERENCES "app"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_replaced_by_id_refresh_tokens_id_fk" FOREIGN KEY ("replaced_by_id") REFERENCES "app"."refresh_tokens"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."users" ADD CONSTRAINT "users_banned_by_users_id_fk" FOREIGN KEY ("banned_by") REFERENCES "app"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_tokens_hash_uq" ON "app"."account_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "account_tokens_user_purpose_idx" ON "app"."account_tokens" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE UNIQUE INDEX "comments_path_uq" ON "app"."comments" USING btree ("path");--> statement-breakpoint
CREATE INDEX "comments_path_gist_idx" ON "app"."comments" USING gist ("path");--> statement-breakpoint
CREATE INDEX "comments_roots_page_idx" ON "app"."comments" USING btree ("created_at","id") WHERE "app"."comments"."parent_id" is null;--> statement-breakpoint
CREATE INDEX "comments_root_children_idx" ON "app"."comments" USING btree ("root_id","created_at","id");--> statement-breakpoint
CREATE INDEX "comments_author_recent_idx" ON "app"."comments" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_hash_uq" ON "app"."refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_tokens_family_idx" ON "app"."refresh_tokens" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_idx" ON "app"."refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "app"."users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_subject_uq" ON "app"."users" USING btree ("google_subject");--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
		AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
		EXECUTE 'REVOKE ALL ON SCHEMA app FROM anon, authenticated';
		EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA app FROM anon, authenticated';
		EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA app FROM anon, authenticated';
		EXECUTE 'REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app FROM anon, authenticated';
		EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE ALL ON TABLES FROM anon, authenticated';
		EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE ALL ON SEQUENCES FROM anon, authenticated';
		EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE ALL ON FUNCTIONS FROM anon, authenticated';
	END IF;
END
$$;
