import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("el AVIF ODDM autorizado existe y conserva los bytes de la conversión fiel", (t) => {
  const bytes = readFileSync(new URL("../public/images/oddm-isac-paper.avif", import.meta.url));
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  assert.ok(bytes.length > 0);
  assert.equal(sha256, "cbfc98de22e44574c0aebaecf13f15c183c58c222c11971c2b1fe945e7054427");
  t.diagnostic(JSON.stringify({ path: "public/images/oddm-isac-paper.avif", bytes: bytes.length, sha256 }));
});

test("ODDMDiagram usa el AVIF fiel autorizado sin cambiar alt ni figcaption", () => {
  // Seam autorizado: JSX pequeño y estático, sin ejecutarlo ni importar aliases.
  // Solo se leen atributos literales y el texto de figcaption; no clases CSS.
  const source = readFileSync(new URL("../src/components/ODDMDiagram.tsx", import.meta.url), "utf8");
  const images = [...source.matchAll(/<img\b[^>]*\/?>/gu)];
  assert.equal(images.length, 1, "La figura ODDM debe seguir conteniendo una sola imagen");
  const attribute = (name: string) => images[0][0].match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "u"))?.[2];
  const captions = [...source.matchAll(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gu)];
  assert.equal(captions.length, 1);
  assert.equal(attribute("alt"), "Diseño de forma de onda ODDM-ISAC");
  assert.equal(captions[0][1].replace(/\s+/gu, " ").trim(),
    "Diseño de forma de onda ODDM-ISAC y optimización conjunta para comunicación y sensado.");
  assert.equal(attribute("src"), "/images/oddm-isac-paper.avif",
    "La autorización «Usar el AVIF fiel» exige referenciar el AVIF existente, no el PNG ausente");
});
