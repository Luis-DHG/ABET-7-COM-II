import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const moduleLayout = source("../src/components/ModuleLayout.tsx");
const threadPage = source("../src/pages/forum/ThreadPage.tsx");
const commentItem = source("../src/pages/forum/CommentItem.tsx");
const routes = source("../src/App.tsx");
const styles = source("../src/index.css");

function assertNoFocusCall(sourceText: string, scenario: string) {
  assert.equal(
    /\.focus\s*\(/u.test(sourceText),
    false,
    `${scenario}: la carga de la ruta no debe llamar focus() sobre el H1 o el destino`,
  );
}

test("abrir un módulo sin hash conserva el scroll inicial sin enfocar el H1", () => {
  assert.ok(moduleLayout.includes("heading.current"), "el H1 sigue siendo el fallback cuando no hay hash");
  assert.ok(moduleLayout.includes("window.scrollTo(0, 0)"), "sin hash se conserva el desplazamiento al inicio");
  assertNoFocusCall(moduleLayout, "Módulo abierto sin hash");
});

test("abrir un módulo con hash conserva ancla, scroll y offset responsive sin enfocar el destino", () => {
  assert.ok(moduleLayout.includes("window.location.hash.slice(1)"), "se conserva la lectura del fragmento de ruta");
  assert.ok(moduleLayout.includes("document.getElementById(hash)"), "el fragmento sigue resolviendo su destino");
  assert.ok(moduleLayout.includes("target.scrollIntoView()"), "se conserva el scroll hasta el destino");
  assert.ok(moduleLayout.includes("href={`#${section.id}`}"), "el índice mantiene sus enlaces de fragmento");
  assert.ok(moduleLayout.includes("id={section.id}"), "las secciones mantienen los IDs enlazables");
  assert.ok(moduleLayout.includes('window.matchMedia("(min-width: 768px)")'), "se conserva el breakpoint del índice desktop");
  assert.ok(moduleLayout.includes("open={isDesktop ? true : undefined}"), "el índice sigue abierto en desktop y colapsable en móvil");
  assert.match(styles, /\.editorial-section\s*\{[^}]*scroll-margin-top:\s*5rem/s, "el encabezado de sección conserva su offset sticky");
  assert.match(routes, /<Route path="\/:moduleSlug"/u, "la ruta editorial existente se conserva");
  assertNoFocusCall(moduleLayout, "Módulo abierto con hash");
});

test("abrir un hilo con hash conserva la ruta y el scroll al comentario histórico sin enfocarlo", () => {
  assert.ok(threadPage.includes('hash.startsWith("#comment-")'), "se conserva el formato de fragmento del foro");
  assert.ok(threadPage.includes("document.getElementById(hash.slice(1))"), "el fragmento sigue resolviendo el comentario destino");
  assert.match(threadPage, /scrollIntoView\(\{\s*block:\s*"center"\s*\}\)/u, "el destino conserva el scroll centrado");
  assert.match(routes, /<Route path="\/retroalimentacion\/:rootId"/u, "la ruta del hilo existente se conserva");
  assert.ok(commentItem.includes("id={`comment-${comment.id}`}"), "cada comentario conserva su ID de ancla histórica");
  assert.match(commentItem, /comment\.replies\.map\(\(reply\) => \(\s*<CommentItem/su, "los comentarios anidados conservan sus destinos");
  assert.match(styles, /:target\s*\{\s*scroll-margin-top:\s*5rem;/u, "los destinos conservan su offset bajo la cabecera sticky");
  assertNoFocusCall(threadPage, "Hilo abierto con hash de comentario");
});
