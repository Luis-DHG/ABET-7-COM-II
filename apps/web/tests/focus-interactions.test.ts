import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const loginPage = source("../src/pages/auth/LoginPage.tsx");
const registerPage = source("../src/pages/auth/RegisterPage.tsx");
const commentItem = source("../src/pages/forum/CommentItem.tsx");
const composer = source("../src/pages/forum/CommentComposer.tsx");
const forumPage = source("../src/pages/forum/ForumPage.tsx");
const statusNotice = source("../src/components/StatusNotice.tsx");
const alert = source("../src/components/ui/alert.tsx");

function assertNoProgrammaticFocus(sourceText: string, scenario: string) {
  assert.equal(
    /\.focus\s*\(/u.test(sourceText),
    false,
    `${scenario}: no debe haber una transferencia programática de foco`,
  );
}

function assertAuthErrorUi(page: string, fields: string[]) {
  assert.ok(page.includes("{formError ? ("), "el resumen sigue condicionado al error del formulario");
  assert.ok(page.includes('<StatusNotice tone="destructive"'), "el resumen de error sigue renderizado");
  assert.ok(page.includes("{formError}"), "se conserva el mensaje del error");
  assert.ok(statusNotice.includes("<Alert className="), "StatusNotice conserva el contenedor accesible");
  assert.match(alert, /role="alert"/u, "el resumen continúa anunciado como alert");
  assert.match(statusNotice, /role="alert"/u, "los errores de campo continúan anunciados como alert");

  for (const field of fields) {
    assert.ok(page.includes(`value={${field}}`), `${field}: el valor controlado se conserva`);
    assert.ok(page.includes(`aria-invalid={Boolean(fieldErrors.${field})}`), `${field}: se conserva aria-invalid`);
    assert.ok(page.includes(`<FieldError id="${field}-error"`), `${field}: se conserva FieldError`);
    assert.ok(
      page.includes(`aria-describedby={fieldErrors.${field} ?`) ||
        page.includes(`aria-describedby="${field}-hint ${field}-error"`),
      `${field}: se conserva la asociación aria-describedby`,
    );
  }
}

test("un error de ingresar conserva alertas y asociaciones sin enfocar el resumen", () => {
  assertAuthErrorUi(loginPage, ["email", "password"]);
  assertNoProgrammaticFocus(loginPage, "Error de ingresar");
});

test("un error de registro conserva alertas y asociaciones sin enfocar el resumen", () => {
  assertAuthErrorUi(registerPage, ["displayName", "email", "password", "confirm"]);
  assertNoProgrammaticFocus(registerPage, "Error de registro");
});

test("Responder abre y cancela el composer sin autoenfocar y conserva sus callbacks", () => {
  assert.ok(commentItem.includes("onClick={() => setReplying((value) => !value)}"), "Responder conserva el toggle de apertura/cierre");
  assert.ok(commentItem.includes("aria-expanded={replying}"), "el estado abierto continúa expuesto");
  assert.ok(commentItem.includes("{replying ? ("), "el composer sigue condicionado al estado de respuesta");
  assert.ok(commentItem.includes("onCancel={() => setReplying(false)}"), "Cancelar conserva el cierre actual");
  assert.ok(commentItem.includes("onReplyPublished(published)"), "el resultado publicado sigue pasando al callback padre");
  assert.ok(composer.includes("value={body}"), "el borrador sigue controlado por el estado del composer");
  assert.ok(composer.includes("onChange={(event) => setBody(event.target.value)}"), "la edición del borrador se conserva");
  assert.ok(composer.includes("aria-invalid={Boolean(error)}"), "el textarea sigue reflejando errores de publicación");
  assert.ok(composer.includes('aria-describedby={`${idPrefix}-counter${error ? ` ${idPrefix}-error` : ""}`}'), "el textarea conserva su asociación al contador y al error");
  assert.ok(composer.includes('role="alert"'), "los errores del composer siguen anunciándose");
  const autoFocusProp = commentItem.match(/\bautoFocus(?:\s*=\s*\{([^}]*)\})?/u);
  assert.ok(!autoFocusProp || autoFocusProp[1]?.trim() === "false", "abrir Responder no activa autoFocus en el composer de respuesta");
});

test("una publicación conserva resultado y notice aria-live sin enfocar el anuncio", () => {
  const request = composer.indexOf('const { data } = await api<PublicComment>("/api/comments"');
  const clearDraft = composer.indexOf('setBody("")');
  const cachePublish = composer.indexOf("publishForumComment(data)");
  const callback = composer.indexOf("onPublished(data)");
  const catchBlock = composer.indexOf("} catch (error_) {");

  assert.ok(request >= 0, "la publicación sigue enviándose a la API");
  assert.ok(clearDraft > request && clearDraft < catchBlock, "el borrador solo se limpia al recibir éxito, no ante error");
  assert.ok(cachePublish > clearDraft && callback > cachePublish, "el éxito conserva actualización de cache y callback");
  assert.equal((composer.match(/setBody\(""\)/gu) ?? []).length, 1, "los errores no añaden una limpieza del borrador");
  assert.match(composer, /<p\b(?=[^>]*\baria-live="polite")(?=[^>]*\bclassName="sr-only")[^>]*\/>/u, "el anuncio accesible del composer permanece sin depender de ref ni tabIndex");
  assert.ok(forumPage.includes('<div aria-live="polite" className="sr-only">'), "el notice padre conserva aria-live polite");
  assert.ok(forumPage.includes("{notice}"), "el notice padre conserva el contenido dinámico");
  assert.ok(forumPage.includes('setNotice("Tu comentario fue publicado.")'), "se conserva la confirmación para comentarios");
  assert.ok(forumPage.includes('setNotice("Tu respuesta fue publicada.")'), "se conserva la confirmación para respuestas");
  assert.ok(composer.includes('role="alert"'), "los errores del composer continúan anunciándose");
  assertNoProgrammaticFocus(composer, "Publicación confirmada");
});
