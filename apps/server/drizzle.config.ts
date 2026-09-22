import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL ?? "postgresql://localhost/blogdpc",
  },
  migrations: {
    schema: "drizzle",
    table: "__drizzle_migrations",
  },
  entities: {
    roles: {
      include: ["blogdpc_app"],
    },
  },
});
