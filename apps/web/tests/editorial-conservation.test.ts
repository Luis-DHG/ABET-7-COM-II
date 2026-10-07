import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { conservationDifferences } from "./helpers/editorial-inventory.js";
import { networkFingerprint, sha256 } from "./helpers/science-baseline.js";
import { OFDM_DEFAULTS, ofdmMetrics } from "../src/lib/ofdm.ts";
import { FORMULAS } from "../src/lib/formulas.ts";
import { MODULES, FORUM_PATH, previousOf, nextOf } from "../src/lib/manifest.ts";

const readJSON = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8").replace(/^\uFEFF/u, ""));
const routes = ["planeacion", "analisis", "tendencias", "mini-caso", "divulgacion", "bitacora", "glosario"];

test("el inventario cubre siete rutas, secciones identificables y paginación sin módulo ocho", () => {
  assert.deepEqual(MODULES.map((module) => module.path), routes.map((route) => `/${route}`));
  assert.equal(FORUM_PATH, "/retroalimentacion");
  routes.forEach((route, index) => {
    const inventory = readJSON(`./fixtures/editorial/${route}.json`);
    assert.equal(inventory.route, `/${route}`);
    assert.ok(inventory.headline && inventory.introduction && inventory.sections.length > 0);
    assert.equal(new Set(inventory.sections.map((section: { id: string }) => section.id)).size, inventory.sections.length);
    assert.deepEqual(inventory.index.map((link: { href: string }) => link.href), inventory.sections.map((section: { id: string }) => `#${section.id}`));
    assert.equal(previousOf(MODULES[index])?.path ?? null, index ? `/${routes[index - 1]}` : null);
    assert.equal(nextOf(MODULES[index])?.path ?? null, index < 6 ? `/${routes[index + 1]}` : null);
    assert.ok(inventory.pagination.some((link: { href: string }) => link.href === (index < 6 ? `/${routes[index + 1]}` : FORUM_PATH)));
    for (const section of inventory.sections) {
      assert.ok(section.text && section.title && section.ids.includes(`${section.id}-title`));
      for (const image of section.images) assert.ok(image.src && image.alt && image.caption);
    }
  });
});

test("controles negativos reales detectan pérdida/duplicación de sección, texto, enlace y figura", () => {
  const expected = readJSON("./fixtures/editorial/planeacion.json");
  const lost = structuredClone(expected);
  lost.sections.splice(0, 1);
  assert.ok(conservationDifferences(expected, lost).includes("/planeacion:section-order/count"));
  const duplicated = structuredClone(expected);
  duplicated.sections.push(structuredClone(duplicated.sections[0]));
  assert.ok(conservationDifferences(expected, duplicated).includes("/planeacion:section-order/count"));
  const changedText = structuredClone(expected);
  changedText.sections[0].text = changedText.sections[0].text.replace("ISAC", "EXTRA");
  assert.ok(conservationDifferences(expected, changedText).some((difference: string) => difference.endsWith(":text")));
  const duplicatedFigure = structuredClone(expected);
  duplicatedFigure.sections[0].images.push(structuredClone(duplicatedFigure.sections[0].images[0]));
  assert.ok(conservationDifferences(expected, duplicatedFigure).some((difference: string) => difference.endsWith(":images")));
  const lostLink = structuredClone(expected);
  lostLink.sections[0].links.pop();
  assert.ok(conservationDifferences(expected, lostLink).some((difference: string) => difference.endsWith(":links")));
});

test("activos presentes y campos científicos VOSviewer conservan los hashes congelados", () => {
  const baseline = readJSON("./fixtures/science-baseline.json");
  const bytes = readFileSync(new URL(`../${baseline.dataset.path}`, import.meta.url));
  assert.equal(sha256(bytes), baseline.dataset.sha256, "Dataset VOSviewer cambió");
  const actual = networkFingerprint(JSON.parse(bytes.toString().replace(/^\uFEFF/u, "")).network);
  for (const [key, value] of Object.entries(actual)) assert.deepEqual(value, baseline.dataset[key], key);
  for (const asset of baseline.assets) {
    assert.equal(sha256(readFileSync(new URL(`../${asset.path}`, import.meta.url))), asset.sha256, asset.path);
  }
  // El PNG ausente es un bloqueo informado, NO un activo válido ni un hash aprobado.
});

test("el fingerprint científico rechaza coordenadas, pesos y enlaces alterados en copias reales", () => {
  const baseline = readJSON("./fixtures/science-baseline.json");
  const network = readJSON(`../${baseline.dataset.path}`).network;
  const coords = structuredClone(network);
  coords.items[0].x += 0.001;
  assert.notEqual(networkFingerprint(coords).itemsSha256, baseline.dataset.itemsSha256);
  const weight = structuredClone(network);
  weight.items[0].weights.Occurrences += 1;
  assert.notEqual(networkFingerprint(weight).itemsSha256, baseline.dataset.itemsSha256);
  const link = structuredClone(network);
  link.links[0].strength += 1;
  assert.notEqual(networkFingerprint(link).linksSha256, baseline.dataset.linksSha256);
});

test("defaults, nueve salidas OFDM, dieciséis extremos y fórmulas mantienen el golden previo", () => {
  const { ofdm } = readJSON("./fixtures/science-baseline.json");
  assert.deepEqual(OFDM_DEFAULTS, { bandwidthMHz: 20, symbols: 256, range: 80, velocity: 15 });
  assert.deepEqual(OFDM_DEFAULTS, ofdm.defaults);
  assert.deepEqual(ofdmMetrics(OFDM_DEFAULTS), ofdm.outputs);
  assert.equal(ofdm.corners.length, 16);
  for (const { parameters, outputs } of ofdm.corners) assert.deepEqual(ofdmMetrics(parameters), outputs, JSON.stringify(parameters));
  assert.deepEqual(FORMULAS, ofdm.formulas);
});
