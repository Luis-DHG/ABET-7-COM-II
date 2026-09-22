import postgres from "postgres";
import { requirePostgresUrl } from "./url.js";

const databaseUrl = requirePostgresUrl(
  process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL,
  process.env.DATABASE_MIGRATION_URL ? "DATABASE_MIGRATION_URL" : "DATABASE_URL",
);

const isLocal = /(?:localhost|127\.0\.0\.1)/u.test(databaseUrl);
const client = postgres(databaseUrl, {
  max: 1,
  ssl: process.env.DATABASE_SSL === "false" || isLocal ? false : "require",
});

try {
  const [database] = await client<{
    currentUser: string;
    serverVersion: string;
  }[]>`
    select
      current_user as "currentUser",
      current_setting('server_version') as "serverVersion"
  `;
  const [appRole] = await client<{
    canBypassRls: boolean;
    canCreateDb: boolean;
    canCreateRole: boolean;
    canLogin: boolean;
    inherits: boolean;
    isSuperuser: boolean;
  }[]>`
    select
      rolbypassrls as "canBypassRls",
      rolcreatedb as "canCreateDb",
      rolcreaterole as "canCreateRole",
      rolcanlogin as "canLogin",
      rolinherit as inherits,
      rolsuper as "isSuperuser"
    from pg_roles
    where rolname = 'blogdpc_app'
  `;
  const tables = await client<{
    name: string;
    forceRls: boolean;
    rlsEnabled: boolean;
  }[]>`
    select
      c.relname as name,
      c.relforcerowsecurity as "forceRls",
      c.relrowsecurity as "rlsEnabled"
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'app' and c.relkind = 'r'
    order by c.relname
  `;
  const policies = await client<{ command: string; name: string; tableName: string; withCheck: string | null }[]>`
    select policyname as name, tablename as "tableName", cmd as command, with_check as "withCheck"
    from pg_policies
    where schemaname = 'app'
      and roles = array['blogdpc_app']::name[]
    order by tablename, policyname
  `;
  const apiAccess = await client<{ role: string; schemaUsage: boolean; tableGrants: number }[]>`
    select
      r.rolname as role,
      has_schema_privilege(r.oid, n.oid, 'USAGE') as "schemaUsage",
      (
        select count(*)::int
        from information_schema.role_table_grants g
        where g.table_schema = 'app' and g.grantee = r.rolname
      ) as "tableGrants"
    from pg_roles r
    cross join pg_namespace n
    where r.rolname in ('anon', 'authenticated', 'service_role')
      and n.nspname = 'app'
    order by r.rolname
  `;
  const [appCapabilities] = await client<{
    canDeleteContent: boolean;
    canDeleteTokens: boolean;
    canInsertComments: boolean;
    canInsertTokens: boolean;
    canInsertUsers: boolean;
    canSelectAll: boolean;
    canUpdateCommentsSafely: boolean;
    canUpdateRefreshSafely: boolean;
    canUpdateUsersSafely: boolean;
  }[]>`
    select
      has_table_privilege('blogdpc_app', 'app.users', 'SELECT')
        and has_table_privilege('blogdpc_app', 'app.account_tokens', 'SELECT')
        and has_table_privilege('blogdpc_app', 'app.refresh_tokens', 'SELECT')
        and has_table_privilege('blogdpc_app', 'app.comments', 'SELECT') as "canSelectAll",
      has_table_privilege('blogdpc_app', 'app.users', 'INSERT') as "canInsertUsers",
      has_table_privilege('blogdpc_app', 'app.account_tokens', 'INSERT')
        and has_table_privilege('blogdpc_app', 'app.refresh_tokens', 'INSERT') as "canInsertTokens",
      has_table_privilege('blogdpc_app', 'app.comments', 'INSERT') as "canInsertComments",
      has_column_privilege('blogdpc_app', 'app.users', 'password_hash', 'UPDATE')
        and has_column_privilege('blogdpc_app', 'app.users', 'is_banned', 'UPDATE')
        and not has_column_privilege('blogdpc_app', 'app.users', 'role', 'UPDATE')
        and not has_column_privilege('blogdpc_app', 'app.users', 'email', 'UPDATE') as "canUpdateUsersSafely",
      has_column_privilege('blogdpc_app', 'app.refresh_tokens', 'revoked_at', 'UPDATE')
        and not has_column_privilege('blogdpc_app', 'app.refresh_tokens', 'token_hash', 'UPDATE') as "canUpdateRefreshSafely",
      has_column_privilege('blogdpc_app', 'app.comments', 'is_removed', 'UPDATE')
        and not has_column_privilege('blogdpc_app', 'app.comments', 'body', 'UPDATE')
        and not has_column_privilege('blogdpc_app', 'app.comments', 'author_id', 'UPDATE') as "canUpdateCommentsSafely",
      has_table_privilege('blogdpc_app', 'app.account_tokens', 'DELETE')
        and has_table_privilege('blogdpc_app', 'app.refresh_tokens', 'DELETE') as "canDeleteTokens",
      has_table_privilege('blogdpc_app', 'app.users', 'DELETE')
        or has_table_privilege('blogdpc_app', 'app.comments', 'DELETE') as "canDeleteContent"
  `;
  const roleMemberships = await client<{ role: string }[]>`
    select parent.rolname as role
    from pg_auth_members membership
    join pg_roles member on member.oid = membership.member
    join pg_roles parent on parent.oid = membership.roleid
    where member.rolname = 'blogdpc_app'
  `;
  const [ltree] = await client<{ schema: string }[]>`
    select n.nspname as schema
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'ltree'
  `;
  const [depthConstraint] = await client<{ definition: string }[]>`
    select pg_get_constraintdef(c.oid) as definition
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'app'
      and t.relname = 'comments'
      and c.conname = 'comments_depth_ck'
  `;

  const expectedTables = ["account_tokens", "comments", "refresh_tokens", "users"];
  const violations: string[] = [];
  if (!database) violations.push("No se pudo leer la información de PostgreSQL.");
  if (!appRole?.canLogin) violations.push("El rol blogdpc_app no existe o no admite login.");
  if (appRole && (appRole.isSuperuser || appRole.canBypassRls || appRole.canCreateDb || appRole.canCreateRole || appRole.inherits)) {
    violations.push("El rol blogdpc_app conserva privilegios administrativos.");
  }
  if (tables.map(({ name }) => name).join(",") !== expectedTables.join(",")) {
    violations.push("El esquema app no contiene exactamente las cuatro tablas esperadas.");
  }
  if (tables.some(({ forceRls, rlsEnabled }) => !forceRls || !rlsEnabled)) {
    violations.push("RLS no está habilitado y forzado en todas las tablas de app.");
  }
  const expectedPolicies = [
    "account_tokens_backend_access",
    "comments_backend_insert",
    "comments_backend_select",
    "comments_backend_update",
    "refresh_tokens_backend_access",
    "users_backend_insert",
    "users_backend_select",
    "users_backend_update",
  ];
  if (policies.map(({ name }) => name).sort().join(",") !== expectedPolicies.sort().join(",")) {
    violations.push("Las políticas exclusivas de blogdpc_app no coinciden con el conjunto esperado.");
  }
  const usersInsert = policies.find(({ name }) => name === "users_backend_insert");
  const commentsInsert = policies.find(({ name }) => name === "comments_backend_insert");
  if (!usersInsert?.withCheck?.includes("role") || !commentsInsert?.withCheck?.includes("is_removed")) {
    violations.push("Las políticas de inserción no protegen rol de usuario y moderación inicial.");
  }
  if (apiAccess.some(({ schemaUsage, tableGrants }) => schemaUsage || tableGrants > 0)) {
    violations.push("anon, authenticated o service_role aún tienen acceso al esquema app.");
  }
  if (!appCapabilities || Object.entries(appCapabilities).some(([capability, enabled]) => (
    capability === "canDeleteContent" ? enabled : !enabled
  ))) {
    violations.push("Los permisos por tabla/columna de blogdpc_app no coinciden con el mínimo esperado.");
  }
  if (roleMemberships.length > 0) violations.push("blogdpc_app hereda permisos de otro rol.");
  if (ltree?.schema !== "extensions") violations.push("ltree no está instalado en el esquema extensions.");
  if (!depthConstraint?.definition.includes("<= 6")) {
    violations.push("La profundidad máxima de comentarios no está limitada a seis.");
  }

  console.log(JSON.stringify({
    status: violations.length === 0 ? "ok" : "failed",
    database,
    appRole: appRole ?? null,
    tables,
    policies,
    apiAccess,
    appCapabilities: appCapabilities ?? null,
    roleMemberships,
    ltreeSchema: ltree?.schema ?? null,
    violations,
  }, null, 2));
  if (violations.length > 0) process.exitCode = 1;
} finally {
  await client.end({ timeout: 5 });
}
