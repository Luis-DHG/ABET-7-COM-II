// Generador one-shot de fixtures de testing. No escribe ningún archivo de producto.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { OFDM_DEFAULTS, ofdmMetrics } from "../../src/lib/ofdm.ts";
import { FORMULAS } from "../../src/lib/formulas.ts";
import { networkFingerprint, sha256 } from "../helpers/science-baseline.js";

const web = new URL("../../", import.meta.url);
const fixture = new URL("../fixtures/science-baseline.json", import.meta.url);
assert.ok(!existsSync(fixture), "Baseline ya congelada; no regenerarla para aceptar cambios científicos");
const read = (path: string) => readFileSync(new URL(path, web));
const datasetPath = "public/data/isac/vosviewer-cooccurrence-network.json";
const dataset = read(datasetPath);
const paths = [
  "liu-jsac-2022/fig01-use-cases.avif", "liu-jsac-2022/fig03-framework.avif",
  "liu-jsac-2022/fig06-radar-sensing.avif", "liu-jsac-2022/fig08-target-time-division-manner.avif",
  "liu-jsac-2022/fig11-ofdm-isac.avif", "liu-jsac-2022/fig17--isac--v2I.avif",
  "liu-jsac-2022/fig19-ISAC-edge-ai.avif", "liu-jsac-2022/fig20-ISAC.avif", "liu-jsac-2022/fig21-ISAC-aerial.avif",
  "ericsson/sensing-topologies.avif", "huawei/fig08-thz-isac.avif", "huawei/fig09-virtual-aperture.avif",
  "huawei/fig10-hardware.avif", "huawei/fig18-hardware-impairments.avif",
].map((path) => `public/images/isac/${path}`);
const assets = paths.map((path) => { const bytes = read(path); return { path, bytes: bytes.length, sha256: sha256(bytes) }; });
const corners = [];
for (const bandwidthMHz of [10, 80]) for (const symbols of [64, 512]) {
  for (const range of [10, 200]) for (const velocity of [-30, 30]) {
    const parameters = { bandwidthMHz, symbols, range, velocity };
    corners.push({ parameters, outputs: ofdmMetrics(parameters) });
  }
}
const missing = "public/images/oddm-isac-paper.png";
assert.ok(!existsSync(new URL(missing, web)), "El estado preexistente del PNG cambió; revisar, no reaprobarlo aquí");
const replacement = read("public/images/oddm-isac-paper.avif");
const baseline = {
  provenance: "Baseline anterior a cambios frontend; golden de conservación, no redefinición científica",
  dataset: { path: datasetPath, bytes: dataset.length, sha256: sha256(dataset), ...networkFingerprint(JSON.parse(dataset.toString().replace(/^\uFEFF/u, "")).network) },
  assets,
  unresolvedAsset: { referenced: missing, status: "ausente por borrado previo del usuario; NO aprobado como baseline válida",
    unreferencedReplacement: "public/images/oddm-isac-paper.avif", replacementSha256: sha256(replacement),
    source: "src/components/ODDMDiagram.tsx:6", license: null },
  ofdm: { defaults: OFDM_DEFAULTS, outputs: ofdmMetrics(OFDM_DEFAULTS), corners,
    controls: [
      { key: "bandwidthMHz", min: 10, max: 80, step: 10, unit: "MHz" },
      { key: "symbols", min: 64, max: 512, step: 64, unit: "símbolos" },
      { key: "range", min: 10, max: 200, step: 5, unit: "m" },
      { key: "velocity", min: -30, max: 30, step: 1, unit: "m/s" },
    ], locale: "es-CO", maximumFractionDigits: { metrics: 2, delayUs: 3 }, formulas: FORMULAS },
  bibliographyRules: {
    nodeSize: "max(1.3, sqrt(Occurrences) * 1.55)", selectedMultiplier: 1.65,
    globalEdgeSize: "0.18 + min(1, log2(strength + 1) / 5) * 0.95",
    maxLinks: 1000, nodeAndClusterEdges: "adyacentes, fuerza descendente; slice(0,1000), misma deduplicación y desempate estable",
    associationStrength: "2 * sum(unique edge strengths) * edge.strength / (totalStrengthA * totalStrengthB); 0 si denominador no positivo",
    sources: ["BibliometricMap.tsx:54-82,117-157", "BibliometricFindings.tsx:54-100"],
    coverageLimit: "Reglas identificadas por lectura; este golden no ejecuta Sigma/reducers ni sustituye su ciclo futuro",
  },
};
writeFileSync(fixture, `${JSON.stringify(baseline, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify({ fixture: fixture.pathname, assets: assets.length, dataset: baseline.dataset, corners: corners.length }));
