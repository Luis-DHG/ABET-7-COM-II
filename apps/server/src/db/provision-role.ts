import postgres from "postgres";
import { z } from "zod";
import { requirePostgresUrl } from "./url.js";

const input = z.object({
  databaseUrl: z.string().min(1),
  password: z.string().min(24),
}).parse({
  databaseUrl: process.env.DATABASE_MIGRATION_URL,
  password: process.env.DATABASE_APP_PASSWORD,
});

const databaseUrl = requirePostgresUrl(input.databaseUrl, "DATABASE_MIGRATION_URL");
const isLocal = /(?:localhost|127\.0\.0\.1)/u.test(databaseUrl);
const client = postgres(databaseUrl, {
  max: 1,
  ssl: process.env.DATABASE_SSL === "false" || isLocal ? false : "require",
});

try {
  const [role] = await client<{ exists: boolean }[]>`
    select exists(select 1 from pg_roles where rolname = 'blogdpc_app') as exists
  `;
  if (!role?.exists) throw new Error("El rol blogdpc_app no existe; ejecuta primero pnpm db:migrate.");

  const [statement] = await client<{ command: string }[]>`
    select format('alter role %I password %L', 'blogdpc_app', ${input.password}) as command
  `;
  if (!statement) throw new Error("No se pudo preparar el cambio de contraseña del rol.");
  await client.unsafe(statement.command);
  console.log(JSON.stringify({ level: "info", event: "database_app_role_provisioned" }));
} finally {
  await client.end({ timeout: 5 });
}
