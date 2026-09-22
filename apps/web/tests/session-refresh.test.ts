import assert from "node:assert/strict";
import { test } from "node:test";
import { api, onSessionInvalid } from "../src/lib/http.ts";

test("la sesión con access vencido se renueva y vuelve a consultarse", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = async (input) => {
    const path = String(input);
    calls.push(path);
    if (path === "/api/auth/refresh") return Response.json({ data: { user: { id: "u1" } } });
    if (calls.length === 1) return Response.json({ error: { code: "ACCESS_EXPIRED" } }, { status: 401 });
    return Response.json({ data: { user: { id: "u1" } } });
  };
  try {
    const result = await api<{ user: { id: string } }>("/api/auth/session");
    assert.equal(result.data.user.id, "u1");
    assert.deepEqual(calls, ["/api/auth/session", "/api/auth/refresh", "/api/auth/session"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("un fallo de red al renovar no borra la sesión local", async () => {
  const originalFetch = globalThis.fetch;
  let invalidations = 0;
  const unsubscribe = onSessionInvalid(() => invalidations++);
  globalThis.fetch = async (input) => {
    if (String(input) === "/api/auth/refresh") throw new TypeError("offline");
    return Response.json({ error: { code: "ACCESS_EXPIRED" } }, { status: 401 });
  };
  try {
    await assert.rejects(api("/api/auth/session"), { code: "NETWORK_ERROR" });
    assert.equal(invalidations, 0);
  } finally {
    unsubscribe();
    globalThis.fetch = originalFetch;
  }
});
