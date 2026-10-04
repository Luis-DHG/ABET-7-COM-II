import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "../auth/crypto.js";
import { createDatabase } from "../db/client.js";
import { users } from "../db/schema.js";

const input = z.object({
  databaseUrl: z.string().min(1),
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  displayName: z.string().trim().min(2).max(100),
  password: z.string().min(10).max(128),
}).parse({
  databaseUrl: process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL,
  email: process.env.ADMIN_EMAIL,
  displayName: process.env.ADMIN_NAME,
  password: process.env.ADMIN_PASSWORD,
});

const database = createDatabase({
  databaseUrl: input.databaseUrl,
  databaseMaxConnections: 1,
  databasePrepare: true,
  databaseSsl: process.env.DATABASE_SSL !== "false",
});

try {
  const [existing] = await database.db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
  if (existing) throw new Error("Ya existe una cuenta con ADMIN_EMAIL; no se modificó.");
  await database.db.insert(users).values({
    id: randomUUID(),
    email: input.email,
    displayName: input.displayName,
    passwordHash: await hashPassword(input.password),
    role: "ADMIN",
    emailVerifiedAt: new Date(),
  });
  console.log("Administrador creado.");
} finally {
  await database.close();
}
