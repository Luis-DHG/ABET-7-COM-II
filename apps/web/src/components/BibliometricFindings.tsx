import { useEffect, useMemo, useState } from "react";

type Term = { id: number; label: string; cluster: number; weights: Record<string, number> };
type LinkWeight = { source_id: number; target_id: number; strength: number };
type NetworkData = { network: { items: Term[]; links: LinkWeight[] } };

const CLUSTER_READINGS: Record<number, string> = {
  1: "Es el núcleo más directamente relacionado con ISAC: la asociación entre las dos variantes del término es dominante. Antenas, beamforming, UAV y aprendizaje profundo apuntan a preguntas sobre arquitectura, formas de onda y procesamiento; la literatura técnica ayuda a precisar cada una.",
  2: "La fotónica y la comunicación óptica forman un grupo consistente. Su enlace directo con integrated sensing es menor que sus enlaces internos, así que aquí aparecen como una línea adyacente que merece lectura específica, no como el centro del conjunto.",
  3: "Conviven comunicación inalámbrica con diagnóstico, personas, dispositivos y biosensado. Esa mezcla puede reflejar el alcance amplio de la búsqueda o términos de indexación generales; no basta para afirmar que diagnóstico sea una línea central de ISAC.",
  4: "IoT, energía, asignación de recursos y comunicaciones satelitales sugieren una lectura de infraestructura y gestión de recursos. El enlace con network layers ofrece un puente cuantificable hacia el núcleo ISAC.",
  5: "Aparecen sensores vestibles, sistemas de comunicación y términos multimodales. Es una pista sobre plataformas y aplicaciones de sensado, aunque las fuerzas de enlace son menores y su pertinencia debe verificarse en los artículos fuente.",
  6: "Bandwidth y polarization comparten grupo con controlled study y nonhuman, términos experimentales generales. La combinación aconseja revisar el contexto documental antes de interpretarla como una categoría técnica homogénea.",
  7: "Learning systems y machine learning están conectados, junto a algorithm y términos genéricos de personas. Puede orientar una búsqueda sobre métodos de aprendizaje, pero los enlaces genéricos entre clústeres no describen por sí solos una función ISAC.",
  8: "Es el grupo más pequeño y reúne técnicas de caracterización de materiales, absorción y electromagnetismo. En esta red queda periférico al núcleo de ISAC; su relación con el tema requiere contrastarse con los documentos asociados.",
};

const PAIR_LABELS = [
  ["integrated sensing", "integrated sensing and communication"],
  ["antennas", "unmanned aerial vehicles (uav)"],
  ["optical communication", "photonic integration technology"],
  ["integrated sensing", "network layers"],
  ["integrated sensing and communication", "network layers"],
  ["integrated sensing", "optical communication"],
];

const METHOD_REFERENCES = [
  ["Tendencias recientes de la Educación Virtual y su fuerte conexión con los Entornos Inmersivos", "2017", "https://revistaespacios.com/a17v38n15/17381504.html"],
  ["Trends in Modeling and Simulation in the Automotive Industry Concerning the Bond Graph framework", "2018", "https://doi.org/10.14419/ijet.v7i4.16.22876"],
  ["Innovation, Technology and User Experience in Museums: Insights from Scientific Literature", "2020", "https://doi.org/10.1007/978-3-030-58799-4_59"],
  ["Reverse Logistics and Sustainability: A Bibliometric Analysis", "2024", "https://doi.org/10.3390/su16135279"],
  ["Analysis in circular economy research in Latin America: A bibliometric review", "2023", "https://doi.org/10.1016/j.heliyon.2023.e19999"],
] as const;

const number = (value: number) => value.toLocaleString("es-CO");
const decimal = (value: number) => value.toLocaleString("es-CO", { maximumFractionDigits: 3 });

export function BibliometricFindings() {
  const [data, setData] = useState<NetworkData["network"] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}data/isac/vosviewer-cooccurrence-network.json`)
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo leer el conjunto bibliométrico.");
        return response.json() as Promise<NetworkData>;
      })
      .then(({ network }) => { if (!cancelled) setData(network); })
      .catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No se pudo leer el conjunto."); });
    return () => { cancelled = true; };
  }, []);

  const findings = useMemo(() => {
    if (!data) return null;
    const byId = new Map(data.items.map((term) => [term.id, term]));
    const byLabel = new Map(data.items.map((term) => [term.label, term]));
    const orderedLinks = [...data.links].sort((a, b) => b.strength - a.strength);
    const networkWeight = data.links.reduce((sum, link) => sum + link.strength, 0);
    const associationStrength = (link: LinkWeight, a: Term, b: Term) => {
      const strengthA = a.weights["Total link strength"] ?? 0;
      const strengthB = b.weights["Total link strength"] ?? 0;
      return strengthA > 0 && strengthB > 0 ? (2 * networkWeight * link.strength) / (strengthA * strengthB) : 0;
    };
    const normalizedPairs = data.links.map((link) => {
      const a = byId.get(link.source_id)!;
      const b = byId.get(link.target_id)!;
      return { a, b, link, associationStrength: associationStrength(link, a, b) };
    }).sort((a, b) => b.associationStrength - a.associationStrength);
    const strongestPair = orderedLinks[0];
    const strongestCrossCluster = orderedLinks.find((link) => byId.get(link.source_id)?.cluster !== byId.get(link.target_id)?.cluster);
    const selectedPairs = PAIR_LABELS.flatMap(([left, right]) => {
      const a = byLabel.get(left);
      const b = byLabel.get(right);
      if (!a || !b) return [];
      const link = data.links.find((edge) => (edge.source_id === a.id && edge.target_id === b.id) || (edge.source_id === b.id && edge.target_id === a.id));
      return link ? [{ a, b, link, associationStrength: associationStrength(link, a, b) }] : [];
    });
    const clusters = [...new Set(data.items.map((term) => term.cluster))].sort((a, b) => a - b).map((id) => {
      const items = data.items.filter((term) => term.cluster === id);
      const memberIds = new Set(items.map((term) => term.id));
      const within = data.links.filter((link) => memberIds.has(link.source_id) && memberIds.has(link.target_id)).sort((a, b) => b.strength - a.strength);
      return {
        id,
        items,
        representatives: [...items].sort((a, b) => (b.weights.Occurrences ?? 0) - (a.weights.Occurrences ?? 0)).slice(0, 3),
        strongestWithin: within[0] ? { link: within[0], associationStrength: associationStrength(within[0], byId.get(within[0].source_id)!, byId.get(within[0].target_id)!) } : undefined,
      };
    });
    return {
      topOccurrence: [...data.items].sort((a, b) => (b.weights.Occurrences ?? 0) - (a.weights.Occurrences ?? 0))[0],
      topDegree: [...data.items].sort((a, b) => (b.weights.Links ?? 0) - (a.weights.Links ?? 0))[0],
      topStrength: [...data.items].sort((a, b) => (b.weights["Total link strength"] ?? 0) - (a.weights["Total link strength"] ?? 0))[0],
      strongestPair: strongestPair ? { a: byId.get(strongestPair.source_id), b: byId.get(strongestPair.target_id), link: strongestPair } : null,
      strongestCrossCluster: strongestCrossCluster ? { a: byId.get(strongestCrossCluster.source_id), b: byId.get(strongestCrossCluster.target_id), link: strongestCrossCluster } : null,
      strongestNormalizedPair: normalizedPairs[0],
      networkWeight,
      selectedPairs,
      clusters,
    };
  }, [data]);

  if (!findings) return <p className="editorial-caption" role="status">{error || "Calculando resúmenes desde los pesos exportados por VOSviewer…"}</p>;

  const { topOccurrence, topDegree, topStrength, strongestPair, strongestCrossCluster, strongestNormalizedPair } = findings;
  return (
    <div className="bibliometric-findings">
      <div className="bibliometric-stat-grid" aria-label="Términos destacados por las métricas exportadas">
        <article><span>Más ocurrencias</span><strong>{topOccurrence.label}</strong><p>{number(topOccurrence.weights.Occurrences)} · clúster {topOccurrence.cluster}</p></article>
        <article><span>Más términos enlazados</span><strong>{topDegree.label}</strong><p>{number(topDegree.weights.Links)} enlaces distintos</p></article>
        <article><span>Mayor fuerza total de enlace</span><strong>{topStrength.label}</strong><p>{number(topStrength.weights["Total link strength"])} · suma de pesos adyacentes</p></article>
        {strongestPair?.a && strongestPair.b ? <article><span>Enlace de mayor peso</span><strong>{strongestPair.a.label} ↔ {strongestPair.b.label}</strong><p>{number(strongestPair.link.strength)} · clúster {strongestPair.a.cluster}</p></article> : null}
      </div>

      {strongestCrossCluster?.a && strongestCrossCluster.b ? <p className="bibliometric-observation"><strong>Una señal para leer con cuidado:</strong> el enlace entre clústeres de mayor peso en toda la red es “{strongestCrossCluster.a.label} ↔ {strongestCrossCluster.b.label}” ({number(strongestCrossCluster.link.strength)}, clústeres {strongestCrossCluster.a.cluster} y {strongestCrossCluster.b.cluster}). Como son términos genéricos, su peso no basta para llamarlo una tendencia técnica de ISAC.</p> : null}

      {strongestNormalizedPair ? <p className="bibliometric-observation"><strong>La normalización responde a otra pregunta:</strong> la mayor fuerza de asociación relativa de toda la red es “{strongestNormalizedPair.a.label} ↔ {strongestNormalizedPair.b.label}” (Sᵢⱼ = {decimal(strongestNormalizedPair.associationStrength)}), pero su peso observado es {number(strongestNormalizedPair.link.strength)}. Una asociación relativa alta con pocas coocurrencias no basta para llamarla tendencia.
      </p> : null}

      <div className="editorial-table-wrap" role="region" aria-label="Relaciones seleccionadas por su coocurrencia y fuerza de asociación" tabIndex={0}>
        <table>
          <caption>Pares elegidos por su conexión con ISAC: peso de coocurrencia y fuerza de asociación normalizada.</caption>
          <thead><tr><th scope="col">Término</th><th scope="col">Término relacionado</th><th scope="col">Coocurrencias cᵢⱼ</th><th scope="col">Fuerza Sᵢⱼ</th><th scope="col">Clústeres</th></tr></thead>
          <tbody>{findings.selectedPairs.map(({ a, b, link, associationStrength: value }) => <tr key={`${a.id}-${b.id}`}>
            <th scope="row">{a.label}</th><td>{b.label}</td><td>{number(link.strength)}</td><td>{decimal(value)}</td><td>{a.cluster === b.cluster ? `${a.cluster} · relación interna` : `${a.cluster} ↔ ${b.cluster} · cruce`}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="editorial-caption">Para Sᵢⱼ aplicamos la fórmula de fuerza de asociación de los artículos metodológicos: <code>Sᵢⱼ = 2m cᵢⱼ / (kᵢ kⱼ)</code>. Aquí <code>cᵢⱼ</code> es el peso original del enlace, <code>kᵢ</code> y <code>kⱼ</code> son las fuerzas totales de enlace de cada término y <code>m = {number(findings.networkWeight)}</code> es la suma de pesos de los enlaces únicos. No cambiamos nodos, clústeres ni coordenadas.</p>

      <div className="bibliometric-cluster-results">
        <h3>Ocho agrupaciones observadas en el conjunto</h3>
        <p>Los términos y enlaces de cada ficha son datos observados; la lectura propuesta es una interpretación provisional, contrastable con los documentos del estudio.</p>
        <div className="bibliometric-cluster-list">
          {findings.clusters.map(({ id, items, representatives, strongestWithin }) => {
            const left = strongestWithin ? data?.items.find((term) => term.id === strongestWithin.link.source_id) : undefined;
            const right = strongestWithin ? data?.items.find((term) => term.id === strongestWithin.link.target_id) : undefined;
            return <details className="bibliometric-cluster-card" key={id}>
              <summary><span>Clúster {id}</span><span>{items.length} términos</span></summary>
              <div className="bibliometric-cluster-content">
                <p><strong>Datos observados.</strong> {representatives.map((term) => `${term.label} (${number(term.weights.Occurrences ?? 0)})`).join(" · ")}{left && right && strongestWithin ? `; una de las coocurrencias internas más altas: ${left.label} ↔ ${right.label} (${number(strongestWithin.link.strength)}; Sᵢⱼ ${decimal(strongestWithin.associationStrength)}).` : "."}</p>
                <p><strong>Interpretación posible.</strong> {CLUSTER_READINGS[id]}</p>
              </div>
            </details>;
          })}
        </div>
      </div>

      <details className="editorial-details bibliometric-method-references">
        <summary>Referencias metodológicas consultadas</summary>
        <p>Tomamos como guía su secuencia de mapa, comparación cuantitativa de parejas, lectura de clústeres y discusión de tendencias. Los valores presentados aquí proceden exclusivamente de nuestra exportación de VOSviewer.</p>
        <ul>{METHOD_REFERENCES.map(([title, year, href]) => <li key={href}><a href={href} target="_blank" rel="noreferrer">{title} ({year})</a></li>)}</ul>
      </details>
    </div>
  );
}

export default BibliometricFindings;
