import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { requirePostgresUrl } from "./url.js";

const databaseUrl = requirePostgresUrl(
  process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL,
  process.env.DATABASE_MIGRATION_URL ? "DATABASE_MIGRATION_URL" : "DATABASE_URL",
);

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(currentDirectory, "../../drizzle");
const isLocal = /(?:localhost|127\.0\.0\.1)/u.test(databaseUrl);
const client = postgres(databaseUrl, {
  max: 1,
  ssl: process.env.DATABASE_SSL === "false" || isLocal ? false : "require",
});

try {
  await migrate(drizzle(client), {
    migrationsFolder,
    migrationsSchema: "drizzle",
    migrationsTable: "__drizzle_migrations",
  });
  console.log(JSON.stringify({ level: "info", event: "database_migrated" }));
} finally {
  await client.end({ timeout: 5 });
}
