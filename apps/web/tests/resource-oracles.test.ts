import assert from "node:assert/strict";
import { test } from "node:test";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { pairKey, rendererDifferences, ofdmDisplayDifferences } from "./helpers/resource-oracles.js";

const item = (id: number, cluster = 1, occurrences = 4) => ({
  id, label: `term-${id}`, x: id / 10, y: -id / 10, cluster,
  weights: { Occurrences: occurrences, Links: 1, "Total link strength": 15 },
});
const edge = (source_id: number, target_id: number, strength: number) => ({ source_id, target_id, strength });
const sizeFor = (strength: number) => 0.18 + Math.min(1, Math.log2(strength + 1) / 5) * 0.95;

function clusterTieFixture() {
  const items = Array.from({ length: 47 }, (_, index) => item(index + 1, 1, (index % 7) + 1));
  const links: ReturnType<typeof edge>[] = [];
  for (let source = 1; source <= items.length && links.length < 1002; source++) {
    for (let target = source + 1; target <= items.length && links.length < 1002; target++) {
      const index = links.length;
      links.push(edge(source, target, index < 999 ? 1001 - index : index < 1001 ? 2 : 1));
    }
  }
  return { items, links };
}

function clusterProjection(network: ReturnType<typeof clusterTieFixture>, visibleKeys: Set<string>) {
  const globallySized = new Set([...network.links].sort((a, b) => b.strength - a.strength).slice(0, 1000).map((link) => pairKey(link.source_id, link.target_id)));
  return {
    nodes: network.items.map((term) => {
      const size = Math.max(1.3, Math.sqrt(term.weights.Occurrences) * 1.55);
      return { id: String(term.id), label: term.label, x: term.x, y: term.y, cluster: term.cluster, baseSize: size, renderedSize: size };
    }),
    edges: network.links.map((link) => {
      const key = pairKey(link.source_id, link.target_id), visible = visibleKeys.has(key);
      return { source: String(link.source_id), target: String(link.target_id), strength: link.strength,
        baseSize: globallySized.has(key) ? sizeFor(link.strength) : 0,
        visible, renderedSize: visible ? sizeFor(link.strength) : 0 };
    }),
  };
}

test("proyección Sigma válida preserva ubicación, tamaño de nodo y transferencia global", () => {
  const network = { items: [item(1), item(2, 2, 9)], links: [edge(1, 2, 15)] };
  const actual = {
    nodes: [
      { id: "1", label: "term-1", x: 0.1, y: -0.1, cluster: 1, baseSize: 3.1, renderedSize: 3.1 },
      { id: "2", label: "term-2", x: 0.2, y: -0.2, cluster: 2, baseSize: 4.65, renderedSize: 4.65 },
    ],
    edges: [{ source: "1", target: "2", strength: 15, baseSize: 0.94, visible: true, renderedSize: 0.94 }],
  };
  assert.deepEqual(rendererDifferences(network, actual), []);
});

test("mutaciones del render detectan coordenada, tamaño, grosor y visibilidad distintos", () => {
  const network = { items: [item(1), item(2, 2, 9)], links: [edge(1, 2, 15)] };
  const actual = {
    nodes: [
      { id: "1", label: "term-1", x: 0.1, y: -0.1, cluster: 1, baseSize: 3.1, renderedSize: 3.1 },
      { id: "2", label: "term-2", x: 0.2, y: -0.2, cluster: 2, baseSize: 4.65, renderedSize: 4.65 },
    ],
    edges: [{ source: "1", target: "2", strength: 15, baseSize: 0.94, visible: true, renderedSize: 0.94 }],
  };
  const moved = structuredClone(actual); moved.nodes[0].x += 0.001;
  assert.ok(rendererDifferences(network, moved).includes("node:1:x"));
  const resized = structuredClone(actual); resized.nodes[0].renderedSize += 1;
  assert.ok(rendererDifferences(network, resized).includes("node:1:selected-size"));
  const relinked = structuredClone(actual); relinked.edges[0].strength += 1;
  assert.ok(rendererDifferences(network, relinked).includes("edge:1:2:strength"));
  const hidden = structuredClone(actual); hidden.edges[0].visible = false;
  assert.ok(rendererDifferences(network, hidden).includes("edge:1:2:visibility"));
  const thinned = structuredClone(actual); thinned.edges[0].renderedSize = 0;
  assert.ok(rendererDifferences(network, thinned).includes("edge:1:2:rendered-size"));
});

test("la selección dibuja con tamaño positivo un enlace permitido fuera del top 1.000 global", () => {
  // Node 2 solo tiene un enlace: el más débil global, pero está dentro del
  // conjunto de hasta 1.000 conexiones directas para el término seleccionado.
  const items = Array.from({ length: 1002 }, (_, index) => item(index + 1));
  const links = [edge(1, 2, 1), ...Array.from({ length: 1000 }, (_, index) => edge(1, index + 3, index + 2))];
  const network = { items, links };
  const nodes = items.map((term) => ({ id: String(term.id), label: term.label, x: term.x, y: term.y, cluster: term.cluster,
    baseSize: 3.1, renderedSize: term.id === 2 ? 5.115 : 3.1 }));
  const global = new Set([...links].sort((a, b) => b.strength - a.strength).slice(0, 1000).map((entry) => `${entry.source_id}:${entry.target_id}`));
  const edges = links.map((entry) => {
    const selected = entry.source_id === 2 || entry.target_id === 2;
    const isGlobal = global.has(`${entry.source_id}:${entry.target_id}`);
    return { source: String(entry.source_id), target: String(entry.target_id), strength: entry.strength,
      baseSize: isGlobal ? sizeFor(entry.strength) : 0, visible: selected,
      renderedSize: selected ? sizeFor(entry.strength) : 0 };
  });
  const result = rendererDifferences(network, { nodes, edges }, { selected: 2 });
  assert.deepEqual(result, []);
  const productionPattern = structuredClone(edges[0]);
  productionPattern.renderedSize = 0;
  const mutated = [...edges]; mutated[0] = productionPattern;
  assert.ok(rendererDifferences(network, { nodes, edges: mutated }, { selected: 2 }).includes("edge:1:2:rendered-size"));
});

test("cluster acepta permutas solo dentro del empate del umbral de los 1.000", () => {
  const network = clusterTieFixture();
  const sorted = [...network.links].sort((a, b) => b.strength - a.strength);
  const top = sorted.slice(0, 1000);
  const threshold = top.at(-1)!.strength;
  assert.equal(threshold, 2);
  assert.equal(top.filter((link) => link.strength > threshold).length, 999);
  assert.equal(network.links.filter((link) => link.strength === threshold).length, 2);

  const stableNetworkOrder = new Set(top.map((link) => pairKey(link.source_id, link.target_id)));
  const tieReplacement = new Set(stableNetworkOrder);
  tieReplacement.delete(pairKey(network.links[999].source_id, network.links[999].target_id));
  tieReplacement.add(pairKey(network.links[1000].source_id, network.links[1000].target_id));
  assert.deepEqual(rendererDifferences(network, clusterProjection(network, tieReplacement), { cluster: 1 }), []);
  assert.deepEqual(rendererDifferences(network, clusterProjection(network, stableNetworkOrder), { cluster: 1 }), []);
});

test("cluster rechaza candidatos visibles por debajo del umbral o fuertes omitidos", () => {
  const network = clusterTieFixture();
  const ranked = [...network.links].sort((a, b) => b.strength - a.strength);
  const top = ranked.slice(0, 1000);
  const accepted = new Set(top.map((link) => pairKey(link.source_id, link.target_id)));

  const weakerVisible = new Set(accepted);
  weakerVisible.delete(pairKey(network.links[999].source_id, network.links[999].target_id));
  weakerVisible.add(pairKey(network.links[1001].source_id, network.links[1001].target_id));
  const weakLink = network.links[1001];
  assert.ok(rendererDifferences(network, clusterProjection(network, weakerVisible), { cluster: 1 })
    .includes(`cluster:visible-below-threshold:${weakLink.source_id}:${weakLink.target_id}`));

  const strongerOmitted = new Set(accepted);
  strongerOmitted.delete(pairKey(network.links[0].source_id, network.links[0].target_id));
  strongerOmitted.add(pairKey(network.links[1000].source_id, network.links[1000].target_id));
  const strongLink = network.links[0];
  assert.ok(rendererDifferences(network, clusterProjection(network, strongerOmitted), { cluster: 1 })
    .includes(`cluster:missing-above-threshold:${strongLink.source_id}:${strongLink.target_id}`));
});

test("valores OFDM visibles concuerdan con el golden y los mutantes de unidad o salida fallan", () => {
  const outputs = { rangeResolution: 7.49481145, velocityResolution: 1.5506677556442, observationMs: 16.384,
    rawRateMbps: 32, delayUs: 0.5337025523, dopplerHz: 590.4084485 };
  const actual = {
    metrics: [["Resolución de distancia", "7,49", "m"], ["Resolución de velocidad", "1,55", "m/s"],
      ["Tiempo de observación", "16,38", "ms"], ["Tasa bruta QPSK", "32", "Mbit/s"]],
    echo: "Eco del objetivo τ = 0,534 μs fD = 590,41 Hz",
  };
  assert.deepEqual(ofdmDisplayDifferences(outputs, actual), []);
  const noMetric = structuredClone(actual); noMetric.metrics.pop();
  assert.ok(ofdmDisplayDifferences(outputs, noMetric).includes("ofdm-metrics-format-values-units"));
  const wrongUnit = structuredClone(actual); wrongUnit.metrics[0][2] = "km";
  assert.ok(ofdmDisplayDifferences(outputs, wrongUnit).includes("ofdm-metrics-format-values-units"));
  const wrongDelay = structuredClone(actual); wrongDelay.echo = wrongDelay.echo.replace("0,534", "0,535");
  assert.ok(ofdmDisplayDifferences(outputs, wrongDelay).includes("delay"));
});

test("el scroll horizontal local responde a flechas solo si existe desbordamiento", async () => {
  const module = await import("../src/lib/utils.ts");
  const helper = module.scrollHorizontallyWithArrowKeys;
  assert.equal(typeof helper, "function", "utils debe exportar scrollHorizontallyWithArrowKeys");

  const element = { scrollWidth: 340, clientWidth: 311, scrollLeft: 0 };
  const press = (key: string, target = element) => {
    let prevented = false;
    const event = {
      key,
      currentTarget: target,
      preventDefault() { prevented = true; },
    } as unknown as ReactKeyboardEvent<HTMLElement>;
    helper(event);
    return { prevented, scrollLeft: target.scrollLeft };
  };

  assert.deepEqual(press("ArrowRight"), { prevented: true, scrollLeft: 29 });
  element.scrollLeft = 29;
  assert.deepEqual(press("ArrowLeft"), { prevented: true, scrollLeft: 0 });

  const fits = { scrollWidth: 311, clientWidth: 311, scrollLeft: 0 };
  assert.deepEqual(press("ArrowRight", fits), { prevented: false, scrollLeft: 0 });

  element.scrollLeft = 7;
  assert.deepEqual(press("Tab"), { prevented: false, scrollLeft: 7 });
});
