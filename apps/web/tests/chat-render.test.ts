import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { MODULES } from "../src/lib/manifest.ts";

const EXPECTED_KATEX_VERSION = "0.18.7";
const katexEdges = ["rehype-katex", "micromark-extension-math"] as const;
const APP_SHELL_SOURCE = new URL("../src/components/AppShell.tsx", import.meta.url);
const CHAT_MESSAGE_SOURCE = new URL("../src/components/chat/ChatMessage.tsx", import.meta.url);
const CHAT_WIDGET_SOURCE = new URL("../src/components/chat/ChatWidget.tsx", import.meta.url);
const INTERNAL_CHAT_ROUTES = [
  "/planeacion",
  "/analisis",
  "/tendencias",
  "/mini-caso",
  "/divulgacion",
  "/bitacora",
  "/glosario",
] as const;

function resolvedKatexVersionFrom(pluginName: string): string {
  const pluginPath = import.meta.resolve(pluginName);
  const requireFromPlugin = createRequire(pluginPath);
  const manifestPath = requireFromPlugin.resolve("katex/package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { name?: string; version?: string };
  assert.equal(manifest.name, "katex", `${pluginName} debe resolver el manifiesto real de KaTeX`);
  assert.equal(typeof manifest.version, "string");
  return manifest.version!;
}

function renderMarkdown(markdown: string): string {
  return renderToStaticMarkup(React.createElement(ReactMarkdown, {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  }, markdown));
}

// Este helper prueba el pipeline puro, no el componente de producción ChatMessage.
function renderSafePluginPipeline(markdown: string): string {
  return renderToStaticMarkup(React.createElement(ReactMarkdown, {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { trust: false }]],
    skipHtml: true,
    disallowedElements: ["img"],
  }, markdown));
}

function readChatMessageSource(): string {
  assert.ok(existsSync(CHAT_MESSAGE_SOURCE), "Falta crear apps/web/src/components/chat/ChatMessage.tsx");
  return readFileSync(CHAT_MESSAGE_SOURCE, "utf8");
}

function readChatWidgetSource(): string {
  assert.ok(existsSync(CHAT_WIDGET_SOURCE), "Falta crear apps/web/src/components/chat/ChatWidget.tsx");
  return readFileSync(CHAT_WIDGET_SOURCE, "utf8");
}

function hasEnabledProp(source: string, prop: string): boolean {
  const escapedProp = prop.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const valuedProp = new RegExp(`\\b${escapedProp}\\s*(?:=\\s*\\{\\s*true\\s*\\}|:\\s*true\\b)`, "u");
  const jsxBooleanShorthand = new RegExp(`<ReactMarkdown\\b[^>]*\\b${escapedProp}(?=[\\s/>])`, "su");
  return valuedProp.test(source) || jsxBooleanShorthand.test(source);
}

for (const edge of katexEdges) {
  test(`${edge} resuelve KaTeX ${EXPECTED_KATEX_VERSION}`, () => {
    const version = resolvedKatexVersionFrom(edge);
    assert.equal(version, EXPECTED_KATEX_VERSION, `${edge} resuelve KaTeX ${version}, no ${EXPECTED_KATEX_VERSION}`);
  });
}

test("ReactMarkdown + remark-math + rehype-katex renderiza texto, matemática inline y de bloque", () => {
  const markup = renderMarkdown([
    "Texto normal antes.",
    "",
    "Matemática inline $x^2$ conserva texto después.",
    "",
    "$$",
    "\\frac{a}{b}",
    "$$",
  ].join("\n"));

  assert.match(markup, /Texto normal antes\./u);
  assert.match(markup, /Matemática inline/u);
  assert.match(markup, /conserva texto después\./u);
  assert.equal((markup.match(/class="katex"/gu) ?? []).length, 2, "se renderizan ambas fórmulas");
  assert.match(markup, /class="katex-display"/u, "la fórmula de bloque conserva su presentación display");
});

test("una fórmula KaTeX inválida no lanza durante el render del pipeline real", () => {
  let markup = "";
  assert.doesNotThrow(() => {
    markup = renderMarkdown("Texto antes $\\notARealKatexCommand{x}$ texto después.");
  });
  assert.match(markup, /Texto antes/u);
  assert.match(markup, /texto después\./u);
});

test("el pipeline puro seguro no emite HTML crudo, imágenes ni URLs ejecutables", () => {
  const hostileMarkdown = [
    "<script>globalThis.chatAttack = true</script>",
    '<img src="https://attacker.invalid/pixel.png" onerror="alert(1)" />',
    "![tracking](https://attacker.invalid/pixel.png)",
    "[unsafe](javascript:alert(1))",
    "$\\href{javascript:alert(1)}{unsafe TeX link}$",
  ].join("\n\n");
  const markup = renderSafePluginPipeline(hostileMarkdown);

  assert.doesNotMatch(markup, /<(?:script|img)\b/iu);
  assert.doesNotMatch(markup, /\bonerror\s*=/iu);
  assert.doesNotMatch(markup, /\bhref\s*=\s*["']javascript:/iu);
});

test("una fórmula LaTeX parcial se degrada a texto en el pipeline puro", () => {
  let markup = "";
  assert.doesNotThrow(() => {
    markup = renderSafePluginPipeline("Respuesta parcial $\\frac{1}{");
  });
  assert.match(markup, /Respuesta parcial/u);
  assert.match(markup, /frac/u);
  assert.doesNotMatch(markup, /class="katex"/u, "la expresión incompleta no se presenta como fórmula completa");
});

test("A44 ChatMessage conecta el pipeline y aplica la política de contenido no confiable", () => {
  const source = readChatMessageSource();

  assert.match(source, /from\s*["']react-markdown["']/u);
  assert.match(source, /from\s*["']remark-math["']/u);
  assert.match(source, /from\s*["']rehype-katex["']/u);
  assert.doesNotMatch(source, /rehype-raw|dangerouslySetInnerHTML/u);
  assert.match(source, /\btrust\s*:\s*false\b/u, "KaTeX conserva trust false");
  assert.ok(hasEnabledProp(source, "skipHtml"), "ReactMarkdown omite HTML crudo");

  const removesMarkdownImages = /\bdisallowedElements\s*(?:=\s*\{\s*|:\s*)\[[^\]]*["'`]img["'`][^\]]*\]/su.test(source);
  const nullImageRenderer = /\bimg\s*:\s*\([^)]*\)\s*=>\s*(?:null|\{\s*return\s+null\s*;?\s*\})/u.test(source);
  assert.ok(removesMarkdownImages || nullImageRenderer, "las imágenes remotas se omiten");
  assert.doesNotMatch(source, /\burlTransform\s*[:=]/u, "no se debilita la transformación URL segura por defecto");
});

test("A45 ChatMessage enruta solo los siete módulos acordados y conserva enlaces externos seguros", () => {
  const source = readChatMessageSource();
  const compactSource = source.replace(/\s+/gu, "");

  assert.match(source, /import\s*\{[^}]*\bLink\b[^}]*\}\s*from\s*["']react-router-dom["']/su);
  assert.match(source, /<Link\b/su, "los destinos internos usan React Router");
  assert.match(source, /<a\b/su, "otros destinos mantienen un ancla normal con la política URL por defecto");
  const modulesImport = source.match(/import\s*\{\s*MODULES(?:\s+as\s+([A-Za-z_$][\w$]*))?\s*\}\s*from\s*["'][^"']*manifest["']/u);
  if (modulesImport) {
    const modulesBinding = modulesImport[1] ?? "MODULES";
    assert.deepEqual(
      [...MODULES.map((module) => module.path)].sort(),
      [...INTERNAL_CHAT_ROUTES].sort(),
      "el manifiesto real contiene exactamente las siete rutas internas permitidas",
    );
    assert.match(source, new RegExp(`\\b${modulesBinding}\\.(?:some|find|filter)\\s*\\(`, "u"), "el router se limita mediante el manifiesto importado");
    assert.match(source, /(?:[A-Za-z_$][\w$]*\.path|\bpath)\s*===\s*[A-Za-z_$][\w$]*/u, "el filtro comprueba la ruta declarada del módulo");
  } else {
    const inlineRoutes = [...source.matchAll(/["'`](\/[a-z0-9-]+)["'`]/giu)].map((match) => match[1]!);
    assert.deepEqual(
      [...new Set(inlineRoutes)].sort(),
      [...INTERNAL_CHAT_ROUTES].sort(),
      "el mapa inline contiene exactamente las siete rutas internas permitidas",
    );
  }
  assert.ok(
    compactSource.includes("to={href}") || (/\.search\b/u.test(source) && /\.hash\b/u.test(source)),
    "los destinos internos conservan query/hash cuando están presentes",
  );
});

test("A38 ChatWidget consume useChatSession y aplica disabled nativo sin truncar el borrador", () => {
  const source = readChatWidgetSource();

  assert.match(source, /\buseChatSession\s*\(\s*draft\s*\)/u);
  assert.match(
    source,
    /<(?:textarea|input)\b[^>]*\bdisabled\s*=\s*\{[^}]*\binputDisabled\b[^}]*\}[^>]*>/su,
    "el control de texto refleja inputDisabled con su atributo disabled nativo",
  );
  assert.match(
    source,
    /<(?:button|Button)\b[^>]*\bdisabled\s*=\s*\{[^}]*\bsendDisabled\b[^}]*\}[^>]*>/su,
    "el botón refleja sendDisabled con su atributo disabled nativo",
  );
  assert.doesNotMatch(source, /\bmaxLength\s*=/u, "el input no trunca el borrador durante la escritura");
  assert.match(source, /\bdraft\s*\.\s*length[\s\S]{0,40}\/\s*300\b/u, "el contador usa draft.length / 300");
});

test("ChatWidget ofrece nombre, título, label, Escape con retorno de foco y estado aria-live sin tokens", () => {
  const source = readChatWidgetSource();
  const liveRegions = [...source.matchAll(/<(p|div|span)\b(?=[^>]*\baria-live\s*=)[^>]*>([\s\S]*?)<\/\1\s*>/gu)];

  assert.match(source, /<(?:button|Button)\b[^>]*\b(?:aria-label|aria-labelledby)\s*=/su, "launcher con nombre accesible");
  assert.match(source, /<h[1-6]\b/u, "el panel tiene título");
  assert.match(source, /<(?:section|div)\b[^>]*\b(?:aria-labelledby|aria-label|role\s*=\s*["']region["'])/su, "el panel puede exponerse como región no modal");
  assert.match(source, /<label\b/u, "el campo de texto tiene label asociado");
  assert.match(source, /<(?:textarea|input)\b/u);
  assert.match(source, /["']Escape["']/u, "Escape se reconoce como cierre de teclado");
  assert.match(source, /\bset[A-Za-z]*(?:Open|Expanded|Visible)\s*\(\s*false\s*\)|\bclose[A-Za-z]*\s*\(/u, "Escape cierra el panel");
  assert.match(source, /\.focus\s*\(/u, "el cierre restaura foco programáticamente");
  assert.match(source, /\b(?:launcher|trigger|opener|toggle|button)[A-Za-z_$]*Ref\b/iu, "el foco de retorno pertenece al launcher");
  assert.ok(liveRegions.length > 0, "los estados se anuncian con aria-live");
  assert.doesNotMatch(liveRegions.map((match) => match[2]).join("\n"), /pending(?:\?\.|\.)assistant|messages\s*\.\s*map/iu, "aria-live no envuelve los tokens de respuesta");

  const normalized = source.replace(/\s+/gu, " ");
  assert.doesNotMatch(normalized, /El historial de esta pestaña no se borra al cerrar sesión/u, "no se muestra el aviso de historial compartido por cuenta");
  assert.doesNotMatch(normalized, /Enter envía; Shift\+Enter añade una línea/u, "no se muestra la ayuda de teclado del composer");
  assert.doesNotMatch(source, /<select\b|type\s*=\s*["']file["']/iu, "no hay selector de modelo ni adjuntos");
  assert.doesNotMatch(source, /<(?:button|Button)\b[\s\S]{0,160}?(?:exportar|restablecer|reiniciar|limpiar historial|seleccionar modelo|cambiar modelo)/iu, "no hay controles de exportación, reset o modelo");
});

test("ChatWidget renderiza la secuencia cronológica de turnos completados y tentativas fallidas con acción de reintento", () => {
  const source = readChatWidgetSource();

  assert.match(source, /\bchat\s*\.\s*timeline\s*\.\s*map\b/u, "el widget itera sobre la secuencia cronológica unificada");
  assert.match(source, /Intento no completado/u, "cada intento fallido se distingue en la secuencia");
  assert.match(source, /chat\s*\.\s*submit\s*\(\s*item\s*\.\s*user\s*\)/u, "Reintentar ejecuta un POST nuevo con la pregunta original");
  assert.match(source, /aria-label\s*=\s*["']Mensajes completados["']/u, "se conserva la lista accesible de mensajes");
});

test("ChatWidget desplaza el scroll al fondo al enviar un prompt y no lo altera durante el streaming", () => {
  const source = readChatWidgetSource();

  assert.match(source, /\bhistoryRef\b/u, "el contenedor de historial tiene referencia asignada");
  assert.match(source, /\bscrollHistoryToBottom\b/u, "existe función de desplazamiento hacia el fondo");
  assert.match(source, /scrollTo\s*\(\s*\{\s*top\s*:\s*[A-Za-z_$][\w$]*\.scrollHeight/u, "desplaza hacia scrollHeight");
  assert.match(source, /\[\s*pendingUser\s*\]/u, "el efecto de scroll depende únicamente del usuario que envía el turno");
  assert.doesNotMatch(source, /\[[^\]]*\b(?:chat\s*\.\s*)?pending\s*\?\.\s*assistant\b/u, "el scroll no se dispara con cada fragmento recibido del LLM");
});

test("AppShell importa y monta ChatWidget una vez fuera del Outlet de contenido", () => {
  const source = readFileSync(APP_SHELL_SOURCE, "utf8");
  assert.match(source, /import\s+\{\s*ChatWidget\s*\}\s+from\s*["']@\/components\/chat\/ChatWidget["']/u);

  const widgetMounts = [...source.matchAll(/<ChatWidget\b[^>]*\/?>/gu)];
  assert.equal(widgetMounts.length, 1, "AppShell monta una sola instancia del widget");
  assert.doesNotMatch(widgetMounts[0]![0], /\bkey\s*=/u, "el widget no se remonta por ruta, módulo, usuario o apertura");

  const outletIndex = source.indexOf("<Outlet");
  const mainStart = source.lastIndexOf("<main", outletIndex);
  const mainEnd = source.indexOf("</main>", outletIndex);
  assert.ok(outletIndex >= 0 && mainStart >= 0 && mainEnd > mainStart, "AppShell conserva el Outlet dentro de main");
  const widgetIndex = widgetMounts[0]!.index;
  assert.ok(widgetIndex < mainStart || widgetIndex > mainEnd, "ChatWidget se monta fuera del subtree reemplazado por Outlet/ModuleLayout");
});
