DROP POLICY "comments_backend_access" ON "app"."comments" CASCADE;--> statement-breakpoint
DROP POLICY "users_backend_access" ON "app"."users" CASCADE;--> statement-breakpoint
CREATE POLICY "comments_backend_select" ON "app"."comments" AS PERMISSIVE FOR SELECT TO "blogdpc_app" USING (true);--> statement-breakpoint
CREATE POLICY "comments_backend_insert" ON "app"."comments" AS PERMISSIVE FOR INSERT TO "blogdpc_app" WITH CHECK (not "app"."comments"."is_removed" and "app"."comments"."removed_at" is null and "app"."comments"."removed_by" is null);--> statement-breakpoint
CREATE POLICY "comments_backend_update" ON "app"."comments" AS PERMISSIVE FOR UPDATE TO "blogdpc_app" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "users_backend_select" ON "app"."users" AS PERMISSIVE FOR SELECT TO "blogdpc_app" USING (true);--> statement-breakpoint
CREATE POLICY "users_backend_insert" ON "app"."users" AS PERMISSIVE FOR INSERT TO "blogdpc_app" WITH CHECK ("app"."users"."role" = 'USER');--> statement-breakpoint
CREATE POLICY "users_backend_update" ON "app"."users" AS PERMISSIVE FOR UPDATE TO "blogdpc_app" USING (true) WITH CHECK (true);