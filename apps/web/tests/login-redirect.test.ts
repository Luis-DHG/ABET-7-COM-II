import assert from "node:assert/strict";
import { test } from "node:test";

// Sanitizer logic tested directly
function sanitizeReturnTo(target: unknown): string | null {
  if (typeof target !== "string") return null;
  const trimmed = target.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return null;
  }
  if (trimmed.startsWith("/login") || trimmed.startsWith("/registro")) {
    return null;
  }
  return trimmed;
}

test("sanitizeReturnTo acepta rutas relativas seguras", () => {
  assert.equal(sanitizeReturnTo("/planeacion"), "/planeacion");
  assert.equal(sanitizeReturnTo("/glosario#termino-1"), "/glosario#termino-1");
  assert.equal(sanitizeReturnTo("/retroalimentacion?page=2"), "/retroalimentacion?page=2");
  assert.equal(sanitizeReturnTo("/admin/comentarios"), "/admin/comentarios");
});

test("sanitizeReturnTo rechaza open redirects y destinos inseguros", () => {
  assert.equal(sanitizeReturnTo("https://evil.com"), null);
  assert.equal(sanitizeReturnTo("//evil.com"), null);
  assert.equal(sanitizeReturnTo("/\\evil.com"), null);
  assert.equal(sanitizeReturnTo("javascript:alert(1)"), null);
  assert.equal(sanitizeReturnTo("/login"), null);
  assert.equal(sanitizeReturnTo("/registro"), null);
  assert.equal(sanitizeReturnTo(null), null);
  assert.equal(sanitizeReturnTo(undefined), null);
});
