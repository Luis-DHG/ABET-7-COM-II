import { createHash } from "node:crypto";

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sortedMap = (value = {}) => Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, "en")));

export function networkFingerprint(network) {
  const items = network.items.map((item) => ({
    id: item.id, label: item.label, x: item.x, y: item.y, cluster: item.cluster,
    weights: sortedMap(item.weights), scores: sortedMap(item.scores),
  }));
  const links = network.links.map(({ source_id, target_id, strength }) => ({ source_id, target_id, strength }));
  return {
    items: items.length, links: links.length,
    clusters: sortedMap(items.reduce((counts, item) => ({ ...counts, [item.cluster]: (counts[item.cluster] ?? 0) + 1 }), {})),
    itemsSha256: sha256(JSON.stringify(items)), linksSha256: sha256(JSON.stringify(links)),
    globalStrongest1000Sha256: sha256(JSON.stringify(links.map((link, index) => ({ ...link, index }))
      .sort((a, b) => b.strength - a.strength).slice(0, 1000))),
    networkWeight: links.reduce((sum, link) => sum + link.strength, 0),
  };
}
