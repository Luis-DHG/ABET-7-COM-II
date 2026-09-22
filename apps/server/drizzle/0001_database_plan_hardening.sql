CREATE ROLE "blogdpc_app" WITH LOGIN NOINHERIT;--> statement-breakpoint
ALTER TABLE "app"."account_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."comments" DROP CONSTRAINT "comments_depth_ck";--> statement-breakpoint
DROP INDEX "app"."comments_roots_page_idx";--> statement-breakpoint
DROP INDEX "app"."comments_author_recent_idx";--> statement-breakpoint
ALTER TABLE "app"."account_tokens" ALTER COLUMN "token_hash" SET DATA TYPE char(64);--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ALTER COLUMN "token_hash" SET DATA TYPE char(64);--> statement-breakpoint
CREATE INDEX "comments_roots_page_idx" ON "app"."comments" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "app"."comments"."parent_id" is null;--> statement-breakpoint
CREATE INDEX "comments_author_recent_idx" ON "app"."comments" USING btree ("author_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "app"."account_tokens" ADD CONSTRAINT "account_tokens_max_lifetime_ck" CHECK (("app"."account_tokens"."purpose" = 'VERIFY_EMAIL' and "app"."account_tokens"."expires_at" <= "app"."account_tokens"."created_at" + interval '24 hours') or ("app"."account_tokens"."purpose" = 'RESET_PASSWORD' and "app"."account_tokens"."expires_at" <= "app"."account_tokens"."created_at" + interval '1 hour'));--> statement-breakpoint
ALTER TABLE "app"."account_tokens" ADD CONSTRAINT "account_tokens_hash_ck" CHECK ("app"."account_tokens"."token_hash" ~ '^[0-9a-f]{64}$');--> statement-breakpoint
ALTER TABLE "app"."account_tokens" ADD CONSTRAINT "account_tokens_consumed_at_ck" CHECK ("app"."account_tokens"."consumed_at" is null or "app"."account_tokens"."consumed_at" >= "app"."account_tokens"."created_at");--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_path_label_ck" CHECK (extensions.subpath("app"."comments"."path", -1)::text = 'n' || replace("app"."comments"."id"::text, '-', ''));--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_removed_at_ck" CHECK ("app"."comments"."removed_at" is null or "app"."comments"."removed_at" >= "app"."comments"."created_at");--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_depth_ck" CHECK (extensions.nlevel("app"."comments"."path") between 1 and 6);--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_max_lifetime_ck" CHECK ("app"."refresh_tokens"."expires_at" <= "app"."refresh_tokens"."created_at" + interval '7 days');--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_hash_ck" CHECK ("app"."refresh_tokens"."token_hash" ~ '^[0-9a-f]{64}$');--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_rotation_ck" CHECK (("app"."refresh_tokens"."used_at" is null and "app"."refresh_tokens"."replaced_by_id" is null) or ("app"."refresh_tokens"."used_at" is not null and "app"."refresh_tokens"."replaced_by_id" is not null));--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_timestamps_ck" CHECK (("app"."refresh_tokens"."used_at" is null or "app"."refresh_tokens"."used_at" >= "app"."refresh_tokens"."created_at") and ("app"."refresh_tokens"."revoked_at" is null or "app"."refresh_tokens"."revoked_at" >= "app"."refresh_tokens"."created_at"));--> statement-breakpoint
CREATE POLICY "account_tokens_backend_access" ON "app"."account_tokens" AS PERMISSIVE FOR ALL TO "blogdpc_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "comments_backend_access" ON "app"."comments" AS PERMISSIVE FOR ALL TO "blogdpc_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "refresh_tokens_backend_access" ON "app"."refresh_tokens" AS PERMISSIVE FOR ALL TO "blogdpc_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "users_backend_access" ON "app"."users" AS PERMISSIVE FOR ALL TO "blogdpc_app" USING (true) WITH CHECK (true);--> statement-breakpoint
REVOKE ALL ON SCHEMA "app" FROM PUBLIC;--> statement-breakpoint
REVOKE ALL ON ALL TABLES IN SCHEMA "app" FROM PUBLIC;--> statement-breakpoint
REVOKE ALL ON ALL SEQUENCES IN SCHEMA "app" FROM PUBLIC;--> statement-breakpoint
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA "app" FROM PUBLIC;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA "app" REVOKE ALL ON TABLES FROM PUBLIC;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA "app" REVOKE ALL ON SEQUENCES FROM PUBLIC;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA "app" REVOKE ALL ON FUNCTIONS FROM PUBLIC;--> statement-breakpoint
DO $$
DECLARE
	api_role text;
BEGIN
	FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
		IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
			EXECUTE format('REVOKE ALL ON SCHEMA app FROM %I', api_role);
			EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA app FROM %I', api_role);
			EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA app FROM %I', api_role);
			EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app FROM %I', api_role);
			EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE ALL ON TABLES FROM %I', api_role);
			EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE ALL ON SEQUENCES FROM %I', api_role);
			EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE ALL ON FUNCTIONS FROM %I', api_role);
		END IF;
	END LOOP;
END
$$;--> statement-breakpoint
GRANT USAGE ON SCHEMA "app", "extensions" TO "blogdpc_app";--> statement-breakpoint
GRANT SELECT ON ALL TABLES IN SCHEMA "app" TO "blogdpc_app";--> statement-breakpoint
GRANT INSERT ON TABLE "app"."users" TO "blogdpc_app";--> statement-breakpoint
GRANT UPDATE ("password_hash", "email_verified_at", "is_banned", "banned_at", "banned_by", "updated_at") ON TABLE "app"."users" TO "blogdpc_app";--> statement-breakpoint
GRANT INSERT ON TABLE "app"."account_tokens", "app"."refresh_tokens", "app"."comments" TO "blogdpc_app";--> statement-breakpoint
GRANT UPDATE ("consumed_at") ON TABLE "app"."account_tokens" TO "blogdpc_app";--> statement-breakpoint
GRANT UPDATE ("used_at", "revoked_at", "replaced_by_id") ON TABLE "app"."refresh_tokens" TO "blogdpc_app";--> statement-breakpoint
GRANT UPDATE ("is_removed", "removed_at", "removed_by") ON TABLE "app"."comments" TO "blogdpc_app";--> statement-breakpoint
GRANT DELETE ON TABLE "app"."account_tokens", "app"."refresh_tokens" TO "blogdpc_app";--> statement-breakpoint
ALTER TABLE "app"."account_tokens" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."comments" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."users" FORCE ROW LEVEL SECURITY;
