import { useEffect, useMemo, useRef, useState } from "react";
import Graph from "graphology";
import Sigma from "sigma";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type VOSItem = {
  id: number;
  label: string;
  x: number;
  y: number;
  cluster: number;
  weights: Record<string, number>;
  scores?: Record<string, number>;
};

type VOSLink = { source_id: number; target_id: number; strength: number };
type VOSNetwork = { network: { items: VOSItem[]; links: VOSLink[] } };
type MapTerm = VOSItem & { occurrences: number; links: number; linkStrength: number };

const COLORS = ["#2463a6", "#a54b42", "#4d8065", "#9a6c1c", "#765a9e", "#25858b", "#bd657f", "#647386"];
const MAX_VISIBLE_LINKS = 1000;
const rgb = (hex: string) => hex.match(/[\da-f]{2}/gi)?.map((part) => Number.parseInt(part, 16)).join(", ") ?? "89, 105, 123";
const DEFAULT_EDGE_COLOR = "rgba(76, 90, 106, 0.46)";
const number = (value: number) => value.toLocaleString("es-CO", { maximumFractionDigits: 2 });

export function BibliometricMap() {
  const host = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [terms, setTerms] = useState<MapTerm[]>([]);
  const [query, setQuery] = useState("");
  const [cluster, setCluster] = useState("");
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let renderer: Sigma | null = null;
    fetch(`${import.meta.env.BASE_URL}data/isac/vosviewer-cooccurrence-network.json`)
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar el archivo de la red.");
        return response.json() as Promise<VOSNetwork>;
      })
      .then(({ network }) => {
        if (cancelled || !host.current) return;
        const graph = new Graph({ type: "undirected", multi: false });
        const parsed: MapTerm[] = network.items.map((item) => ({
          ...item,
          occurrences: item.weights.Occurrences ?? 0,
          links: item.weights.Links ?? 0,
          linkStrength: item.weights["Total link strength"] ?? 0,
        }));
        for (const item of parsed) {
          graph.addNode(String(item.id), {
            label: item.label,
            x: item.x,
            y: item.y,
            cluster: item.cluster,
            size: Math.max(1.3, Math.sqrt(item.occurrences) * 1.55),
            color: COLORS[(item.cluster - 1) % COLORS.length],
            occurrences: item.occurrences,
          });
        }
        const strongestLinkIndexes = new Set(network.links
          .map((link, index) => ({ index, strength: link.strength }))
          .sort((first, second) => second.strength - first.strength)
          .slice(0, MAX_VISIBLE_LINKS)
          .map(({ index }) => index));
        for (const [index, link] of network.links.entries()) {
          const source = String(link.source_id);
          const target = String(link.target_id);
          if (!graph.hasNode(source) || !graph.hasNode(target) || graph.hasEdge(source, target)) continue;
          const strengthScale = Math.min(1, Math.log2(link.strength + 1) / 5);
          const defaultVisible = strongestLinkIndexes.has(index);
          graph.addEdgeWithKey(`link-${index}`, source, target, {
            size: defaultVisible ? 0.18 + strengthScale * 0.95 : 0,
            color: defaultVisible ? DEFAULT_EDGE_COLOR : "rgba(76, 90, 106, 0)",
            hidden: !defaultVisible,
            defaultVisible,
            strength: link.strength,
          });
        }
        graphRef.current = graph;
        setTerms(parsed);
        renderer = new Sigma(graph, host.current, {
          renderLabels: true,
          labelRenderedSizeThreshold: 4,
          labelFont: "Inter Variable, Inter, sans-serif",
          labelSize: 12,
          defaultEdgeColor: DEFAULT_EDGE_COLOR,
          allowInvalidContainer: false,
        });
        sigmaRef.current = renderer;
        renderer.on("clickNode", ({ node }) => setSelected(node));
        renderer.getCamera().animatedReset({ duration: 350 });
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "No se pudo cargar el mapa.");
      });
    return () => {
      cancelled = true;
      renderer?.kill();
      sigmaRef.current = null;
      graphRef.current = null;
    };
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    const renderer = sigmaRef.current;
    if (!graph || !renderer) return;
    const focusedEdges = new Set<string>();
    const focusedNodes = new Set<string>();
    let focusColor: string | null = null;

    if (selected !== "") {
      const clusterId = graph.getNodeAttribute(selected, "cluster") as number;
      focusColor = COLORS[(clusterId - 1) % COLORS.length];
      focusedNodes.add(selected);
      graph.edges(selected)
        .sort((first, second) => (graph.getEdgeAttribute(second, "strength") as number) - (graph.getEdgeAttribute(first, "strength") as number))
        .slice(0, MAX_VISIBLE_LINKS)
        .forEach((edge) => {
          focusedEdges.add(edge);
          graph.extremities(edge).forEach((node) => focusedNodes.add(node));
        });
    } else if (cluster !== "") {
      const clusterNodes: string[] = [];
      graph.forEachNode((node, attributes) => {
        if (Number(attributes.cluster) === Number(cluster)) {
          clusterNodes.push(node);
          focusedNodes.add(node);
        }
      });
      focusColor = COLORS[(Number(cluster) - 1) % COLORS.length];
      [...new Set(clusterNodes.flatMap((node) => graph.edges(node)))]
        .sort((first, second) => (graph.getEdgeAttribute(second, "strength") as number) - (graph.getEdgeAttribute(first, "strength") as number))
        .slice(0, MAX_VISIBLE_LINKS)
        .forEach((edge) => {
          focusedEdges.add(edge);
          graph.extremities(edge).forEach((node) => focusedNodes.add(node));
        });
    }
    renderer.setSetting("nodeReducer", (node, attributes) => {
      const dim = (selected !== "" || cluster !== "") && !focusedNodes.has(node);
      return { ...attributes, color: dim ? "#c8cdd3" : attributes.color, size: node === selected ? attributes.size * 1.65 : attributes.size };
    });
    renderer.setSetting("edgeReducer", (edge, attributes) => {
      const visible = selected !== "" || cluster !== "" ? focusedEdges.has(edge) : attributes.defaultVisible === true;
      if (!visible) return { ...attributes, hidden: true, size: 0 };
      return {
        ...attributes,
        hidden: false,
        color: focusColor ? `rgba(${rgb(focusColor)}, 0.86)` : DEFAULT_EDGE_COLOR,
      };
    });
    renderer.refresh();
  }, [cluster, selected, terms]);

  const clusters = useMemo(() => [...new Set(terms.map((term) => term.cluster))].sort((a, b) => a - b), [terms]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return [];
    return terms.filter((term) => term.label.toLocaleLowerCase("es").includes(normalized)).slice(0, 6);
  }, [query, terms]);
  const selectedTerm = terms.find((term) => String(term.id) === selected);
  const clusterTerms = cluster ? terms.filter((term) => term.cluster === Number(cluster)).sort((a, b) => b.occurrences - a.occurrences) : [];

  function chooseCluster(value: string) {
    setCluster(value);
    setSelected("");
  }

  function resetView() {
    setCluster("");
    setSelected("");
    setQuery("");
    sigmaRef.current?.getCamera().animatedReset({ duration: 350 });
  }

  return (
    <div className="bibliometric-map">
      <div className="bibliometric-controls">
        <label className="bibliometric-search">
          <span>Buscar un término</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. beamforming" autoComplete="off" />
        </label>
        <label className="bibliometric-cluster">
          <span>Explorar agrupación</span>
          <select value={cluster} onChange={(event) => chooseCluster(event.target.value)}>
            <option value="">Todos los clústeres</option>
            {clusters.map((id) => <option key={id} value={id}>Clúster {id} · {terms.filter((term) => term.cluster === id).length} términos</option>)}
          </select>
        </label>
        <Button variant="outline" className="min-h-11" onClick={resetView}><RotateCcw data-icon="inline-start" aria-hidden /> Ver mapa completo</Button>
        {filtered.length ? <div className="bibliometric-suggestions" role="list" aria-label="Términos coincidentes">
          {filtered.map((term) => <button type="button" role="listitem" key={term.id} onClick={() => { setSelected(String(term.id)); setCluster(""); setQuery(term.label); }}>{term.label}<span>Clúster {term.cluster}</span></button>)}
        </div> : null}
      </div>

      <div className="bibliometric-explorer">
        <div className="bibliometric-plot" ref={host} role="img" aria-label="Red interactiva de coocurrencia de palabras clave de VOSviewer; selecciona un nodo para consultar sus métricas y conexiones." />
        <aside className="bibliometric-detail" aria-live="polite" aria-atomic="true">
          {selectedTerm ? <>
            <p className="bibliometric-eyebrow">Término seleccionado · clúster {selectedTerm.cluster}</p>
            <h3>{selectedTerm.label}</h3>
            <dl><div><dt>Ocurrencias</dt><dd>{number(selectedTerm.occurrences)}</dd></div><div><dt>Enlaces</dt><dd>{number(selectedTerm.links)}</dd></div><div><dt>Fuerza total de enlace</dt><dd>{number(selectedTerm.linkStrength)}</dd></div>
              {selectedTerm.scores && Object.entries(selectedTerm.scores).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{number(value)}</dd></div>)}
            </dl>
            <p className="editorial-caption">Se resaltan este término y los nodos conectados directamente en la red.</p>
          </> : cluster ? <>
            <p className="bibliometric-eyebrow">Agrupación temática observada</p><h3>Clúster {cluster}</h3>
            <p><strong>Términos más frecuentes:</strong> {clusterTerms.slice(0, 3).map((term) => `${term.label} (${number(term.occurrences)})`).join(" · ")}.</p>
            <p className="editorial-caption">Datos observados en la exportación de VOSviewer; la interpretación de los ocho grupos aparece después del mapa.</p>
            <p><strong>{number(clusterTerms.length)}</strong> términos en esta agrupación.</p>
          </> : <>
            <p className="bibliometric-eyebrow">Red completa</p><h3>{terms.length ? `${number(terms.length)} términos · ${clusters.length} clústeres` : error ? "Mapa no disponible" : "Cargando la red…"}</h3>
            <p>{error || "Selecciona un nodo, busca una palabra o elige un clúster para consultar sus conexiones y métricas."}</p>
          </>}
        </aside>
      </div>
      <div className="bibliometric-legend" aria-label="Leyenda del mapa">
        {clusters.map((id) => <span key={id}><i style={{ backgroundColor: COLORS[(id - 1) % COLORS.length] }} aria-hidden />Clúster {id}</span>)}
        <p>El color del nodo identifica su clúster y el grosor de cada línea representa la fuerza del vínculo. Se muestran los 1.000 enlaces más fuertes; al seleccionar un nodo o clúster, se ocultan los demás para destacar sus conexiones.</p>
      </div>
    </div>
  );
}

export default BibliometricMap;
