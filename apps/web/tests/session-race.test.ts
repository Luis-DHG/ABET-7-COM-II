// Sprint 0 — prueba fallida (plan.md §Sprint 1):
// Una respuesta antigua de GET /api/auth/session no debe sobrescribir un setUser
// más reciente (p. ej. el usuario que llega con verify-email mientras la carga
// inicial sigue en vuelo, o el doble ciclo de StrictMode en desarrollo).
// SessionProvider aún no tiene guarda de generación: la prueba importa
// src/session/sessionGate.ts, que el Sprint 1 debe crear y usar allí.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createSessionGate } from "../src/session/sessionGate.ts";

test("la carga inicial antigua no pisa un setUser más reciente", async () => {
  const gate = createSessionGate();

  // Carga inicial lenta: resuelve "sin sesión" después de que el usuario ya verificó.
  const userVerified = { id: "u1" };
  const staleLoad = gate.run(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return null;
  });

  gate.notifyExternalUpdate(userVerified); // setUser(verify-email) durante la carga

  const stale = await staleLoad;
  assert.equal(stale.applied, false, "una respuesta vieja de /session no debe aplicarse");

  const fresh = await gate.run(async () => userVerified);
  assert.equal(fresh.applied, true);
  assert.equal(fresh.value, userVerified);
});

test("sin actualización intermedia la carga inicial sí se aplica", async () => {
  const gate = createSessionGate();
  const user = { id: "u2" };
  const result = await gate.run(async () => user);
  assert.equal(result.applied, true);
  assert.equal(result.value, user);
});
