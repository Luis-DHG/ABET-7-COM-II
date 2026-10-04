import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../http/errors.js";
import {
  createOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  signAccessToken,
  verifyAccessToken,
  verifyPassword,
} from "./crypto.js";

const secret = "test-secret-with-more-than-thirty-two-characters";

test("scrypt verifica la contraseña correcta y rechaza otra", async () => {
  const hash = await hashPassword("frase de contraseña segura");
  assert.equal(await verifyPassword("frase de contraseña segura", hash), true);
  assert.equal(await verifyPassword("contraseña incorrecta", hash), false);
});

test("los tokens opacos son aleatorios y solo se comparan por hash", () => {
  const first = createOpaqueToken();
  const second = createOpaqueToken();
  assert.notEqual(first, second);
  assert.equal(hashOpaqueToken(first).length, 64);
  assert.notEqual(hashOpaqueToken(first), hashOpaqueToken(second));
});

test("firma y valida access tokens con las reclamaciones esperadas", async () => {
  const input = {
    sub: "76c1a339-174c-4f11-8122-246f56f0c4f7",
    email: "usuario@example.com",
    displayName: "Usuario",
    role: "USER" as const,
    emailVerified: true,
  };
  const token = await signAccessToken(input, secret);
  assert.deepEqual(await verifyAccessToken(token, secret), input);
  await assert.rejects(() => verifyAccessToken(token, `${secret}-different`), AppError);
});
