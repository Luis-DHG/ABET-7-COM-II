import assert from "node:assert/strict";
import test from "node:test";
import { requirePostgresUrl } from "./url.js";

test("acepta URLs PostgreSQL y rechaza la URL HTTPS del proyecto Supabase", () => {
  assert.equal(
    requirePostgresUrl("postgresql://role:password@db.example.com:5432/postgres", "DATABASE_URL"),
    "postgresql://role:password@db.example.com:5432/postgres",
  );
  assert.throws(
    () => requirePostgresUrl("https://project.supabase.co", "DATABASE_URL"),
    /no es una conexión de base de datos/u,
  );
});
