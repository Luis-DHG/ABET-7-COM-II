import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { AppConfig } from "../config.js";
import * as schema from "./schema.js";
import { requirePostgresUrl } from "./url.js";

export type Database = PostgresJsDatabase<typeof schema>;

export function createDatabase(config: Pick<AppConfig, "databaseUrl" | "databaseMaxConnections" | "databasePrepare" | "databaseSsl">) {
  const client = postgres(requirePostgresUrl(config.databaseUrl, "DATABASE_URL"), {
    max: config.databaseMaxConnections,
    prepare: config.databasePrepare,
    ssl: config.databaseSsl ? "require" : false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return {
    client,
    db: drizzle(client, { schema }),
    close: () => client.end({ timeout: 5 }),
  };
}
