// Oráculo de dominio independiente del renderer. Constantes tomadas del contrato
// y golden anterior, no de clases CSS, ids internos de aristas o código de Sigma.
export const pairKey = (a, b) => [Number(a), Number(b)].sort((x, y) => x - y).join(":");

export function rendererDifferences(network, observed, state = {}) {
  const errors = [];
  const byId = new Map(network.items.map((item) => [String(item.id), item]));
  const ordered = [...network.links].sort((a, b) => b.strength - a.strength);
  const global = new Set(ordered.slice(0, 1000).map((edge) => pairKey(edge.source_id, edge.target_id)));
  const candidates = state.selected ? network.links.filter((edge) => [edge.source_id, edge.target_id].includes(Number(state.selected)))
    : state.cluster ? network.links.filter((edge) => byId.get(String(edge.source_id)).cluster === Number(state.cluster) || byId.get(String(edge.target_id)).cluster === Number(state.cluster)) : null;
  const focused = candidates ? [...candidates].sort((a, b) => b.strength - a.strength).slice(0, 1000) : null;
  const visible = state.cluster ? null : focused ? new Set(focused.map((edge) => pairKey(edge.source_id, edge.target_id))) : global;
  const clusterCandidateKeys = state.cluster ? new Set(candidates.map((edge) => pairKey(edge.source_id, edge.target_id))) : null;
  const clusterVisibleCount = state.cluster ? Math.min(1000, candidates.length) : 0;
  const clusterThreshold = state.cluster && focused.length ? focused.at(-1).strength : null;
  let clusterActualVisibleCount = 0;
  if (observed.nodes.length !== network.items.length) errors.push("node-count");
  if (observed.edges.length !== network.links.length) errors.push("edge-count");
  const close = (a, b) => Number.isFinite(a) && Math.abs(a - b) <= 1e-9;
  for (const node of observed.nodes) {
    const expected = byId.get(String(node.id));
    if (!expected) { errors.push(`unknown-node:${node.id}`); continue; }
    for (const field of ["label", "x", "y", "cluster"]) if (node[field] !== expected[field]) errors.push(`node:${node.id}:${field}`);
    const size = Math.max(1.3, Math.sqrt(expected.weights.Occurrences ?? 0) * 1.55);
    if (!close(node.baseSize, size)) errors.push(`node:${node.id}:base-size`);
    if (!close(node.renderedSize, size * (String(node.id) === String(state.selected) ? 1.65 : 1))) errors.push(`node:${node.id}:selected-size`);
  }
  const expectedEdges = new Map(network.links.map((edge) => [pairKey(edge.source_id, edge.target_id), edge]));
  const seen = new Set();
  for (const edge of observed.edges) {
    const key = pairKey(edge.source, edge.target), expected = expectedEdges.get(key);
    if (seen.has(key)) errors.push(`duplicated-edge:${key}`);
    seen.add(key);
    if (!expected) { errors.push(`unknown-edge:${key}`); continue; }
    if (edge.strength !== expected.strength) errors.push(`edge:${key}:strength`);
    if (state.cluster) {
      if (edge.visible) {
        clusterActualVisibleCount++;
        if (!clusterCandidateKeys.has(key)) errors.push(`cluster:visible-outside-candidates:${key}`);
        if (edge.strength < clusterThreshold) errors.push(`cluster:visible-below-threshold:${key}`);
      } else if (clusterCandidateKeys.has(key) && edge.strength > clusterThreshold) {
        errors.push(`cluster:missing-above-threshold:${key}`);
      }
    } else if (edge.visible !== visible.has(key)) errors.push(`edge:${key}:visibility`);
    const baseSize = global.has(key) ? 0.18 + Math.min(1, Math.log2(expected.strength + 1) / 5) * 0.95 : 0;
    if (!close(edge.baseSize, baseSize)) errors.push(`edge:${key}:base-size`);
    // Transferencia científica original (fuente del expected, spec del hallazgo
    // 3.6): solo el top-1.000 global por fuerza tiene representación positiva.
    // Al enfocar, un enlace fuera del top global puede entrar al conjunto
    // enfocado (des-ocultarse) pero NO adquiere tamaño positivo: conserva su
    // tamaño original 0. Nunca más de 1.000 enlaces positivos. Verificar el
    // size retornado por el reducer, no el caché/escala de display del renderer.
    const isVisible = state.cluster ? edge.visible : visible.has(key);
    const renderedSize = isVisible && global.has(key) ? 0.18 + Math.min(1, Math.log2(expected.strength + 1) / 5) * 0.95 : 0;
    if (!close(edge.renderedSize, renderedSize)) errors.push(`edge:${key}:rendered-size`);
  }
  if (state.cluster && clusterActualVisibleCount !== clusterVisibleCount) errors.push("cluster:visible-count");
  return errors;
}

export function ofdmDisplayDifferences(outputs, actual) {
  const format = (value, digits = 2) => value.toLocaleString("es-CO", { maximumFractionDigits: digits });
  const expected = [
    ["Resolución de distancia", format(outputs.rangeResolution), "m"],
    ["Resolución de velocidad", format(outputs.velocityResolution), "m/s"],
    ["Tiempo de observación", format(outputs.observationMs), "ms"],
    ["Tasa bruta QPSK", format(outputs.rawRateMbps), "Mbit/s"],
  ];
  const errors = [];
  if (JSON.stringify(actual.metrics) !== JSON.stringify(expected)) errors.push("ofdm-metrics-format-values-units");
  if (!actual.echo.includes(`τ = ${format(outputs.delayUs, 3)} μs`)) errors.push("delay");
  if (!actual.echo.includes(`fD = ${format(outputs.dopplerHz)} Hz`)) errors.push("doppler");
  return errors;
}
