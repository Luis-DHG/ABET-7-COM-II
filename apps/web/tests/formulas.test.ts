import assert from "node:assert/strict";
import { test } from "node:test";
import katex from "katex/dist/katex.mjs";
import { FORMULAS } from "../src/lib/formulas.ts";

test("todas las expresiones editoriales producen MathML válido", () => {
  for (const [name, tex] of Object.entries(FORMULAS)) {
    const markup = katex.renderToString(tex, { output: "mathml", throwOnError: true });
    assert.match(markup, /<math\b/u, name);
  }
});
