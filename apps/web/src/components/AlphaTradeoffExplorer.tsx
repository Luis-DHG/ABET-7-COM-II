import { useRef, useState, type PointerEvent } from "react";
import { ForumInvitation } from "@/components/EditorialExtras";
import {
  ALPHA_MODEL,
  alphaMetrics,
  alphaModelFacts,
  echoIllustration,
  predictionResult,
  tradeoffCurve,
  type ObjectScenario,
  type UserScenario,
} from "@/lib/alphaTradeoff";

const number = (value: number, digits = 1) => value.toLocaleString("es-CO", { maximumFractionDigits: digits });
const percent = (value: number, digits = 1) => `${number(value * 100, digits)} %`;
const chart = { width: 720, height: 270, left: 66, right: 18, top: 18, bottom: 48 };

function EchoChart({ alpha, object }: { alpha: number; object: ObjectScenario }) {
  const samples = echoIllustration(alpha, object);
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const yMin = -3;
  const yMax = 35;
  const path = samples.map(({ distanceM, powerDb }, index) => {
    const x = chart.left + (distanceM / 250) * plotWidth;
    const y = chart.top + ((yMax - powerDb) / (yMax - yMin)) * plotHeight;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const objectDistance = ALPHA_MODEL.objects[object].distanceM;
  return (
    <svg className="alpha-chart" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img"
      aria-label={`Ilustración de SNR del eco para ${ALPHA_MODEL.objects[object].label} con α ${percent(alpha)}. Pico centrado a ${objectDistance} metros.`}>
      {[0, 10, 20, 30].map((tick) => {
        const y = chart.top + ((yMax - tick) / (yMax - yMin)) * plotHeight;
        return <g key={tick}><line x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} className="alpha-gridline" /><text x={chart.left - 9} y={y + 4} textAnchor="end">{tick}</text></g>;
      })}
      {[0, 50, 100, 150, 200, 250].map((tick) => {
        const x = chart.left + (tick / 250) * plotWidth;
        return <g key={tick}><line x1={x} x2={x} y1={chart.top} y2={chart.height - chart.bottom} className="alpha-gridline" /><text x={x} y={chart.height - chart.bottom + 19} textAnchor="middle">{tick}</text></g>;
      })}
      <line x1={chart.left} x2={chart.width - chart.right} y1={chart.height - chart.bottom} y2={chart.height - chart.bottom} className="alpha-axis" />
      <path d={path} className="alpha-echo-line" />
      <line x1={chart.left + (objectDistance / 250) * plotWidth} x2={chart.left + (objectDistance / 250) * plotWidth}
        y1={chart.top} y2={chart.height - chart.bottom} className="alpha-object-line" />
      <text x={chart.width / 2} y={chart.height - 6} textAnchor="middle">Distancia (m)</text>
      <text transform={`translate(15 ${chart.height / 2}) rotate(-90)`} textAnchor="middle">Potencia sobre ruido (dB)</text>
    </svg>
  );
}

function TradeoffChart({ user, object, alpha, onAlphaChange }: {
  user: UserScenario;
  object: ObjectScenario;
  alpha: number;
  onAlphaChange: (value: number) => void;
}) {
  const curve = tradeoffCurve(user, object);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const minSnr = Math.min(...curve.map((point) => point.radarSnrDb));
  const maxSnr = Math.max(...curve.map((point) => point.radarSnrDb));
  const maxRate = Math.max(...curve.map((point) => point.dataRateMbps));
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const xFor = (snr: number) => chart.left + ((snr - minSnr) / (maxSnr - minSnr)) * plotWidth;
  const yFor = (rate: number) => chart.top + (1 - rate / maxRate) * plotHeight;
  const curvePath = curve.map((point, index) => `${index ? "L" : "M"}${xFor(point.radarSnrDb).toFixed(1)},${yFor(point.dataRateMbps).toFixed(1)}`).join(" ");
  const current = alphaMetrics(alpha, user, object);
  const updateFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const svgX = ((event.clientX - bounds.left) / bounds.width) * chart.width;
    const targetSnr = minSnr + ((svgX - chart.left) / plotWidth) * (maxSnr - minSnr);
    const closest = curve.reduce((best, point) => Math.abs(point.radarSnrDb - targetSnr) < Math.abs(best.radarSnrDb - targetSnr) ? point : best);
    onAlphaChange(Math.round(closest.alpha * 100));
  };
  const label = `Curva de compromiso para usuario ${ALPHA_MODEL.users[user].label} y ${ALPHA_MODEL.objects[object].label}. Punto actual α ${percent(alpha)}, SNR radar ${number(current.radarSnrDb)} dB y tasa ${number(current.dataRateMbps)} Mbit/s.`;
  return (
    <svg ref={svgRef} className="alpha-chart alpha-tradeoff-chart" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img"
      aria-label={label} aria-valuemin={1} aria-valuemax={99} aria-valuenow={Math.round(alpha * 100)}
      aria-valuetext={`α ${percent(alpha)}; SNR de radar ${number(current.radarSnrDb)} dB; tasa ${number(current.dataRateMbps)} Mbit/s`}
      tabIndex={0} onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); onAlphaChange(Math.max(1, Math.round(alpha * 100) - 1)); }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); onAlphaChange(Math.min(99, Math.round(alpha * 100) + 1)); }
        if (event.key === "Home") { event.preventDefault(); onAlphaChange(1); }
        if (event.key === "End") { event.preventDefault(); onAlphaChange(99); }
      }} onPointerDown={(event) => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); updateFromPointer(event); }}
      onPointerMove={(event) => { if (dragging.current) updateFromPointer(event); }}
      onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
      {[0, 0.5, 1].map((fraction) => {
        const y = chart.top + fraction * plotHeight;
        return <g key={fraction}><line x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} className="alpha-gridline" /><text x={chart.left - 9} y={y + 4} textAnchor="end">{number(maxRate * (1 - fraction), 0)}</text></g>;
      })}
      {[minSnr, (minSnr + maxSnr) / 2, maxSnr].map((tick) => <g key={tick}><line x1={xFor(tick)} x2={xFor(tick)} y1={chart.top} y2={chart.height - chart.bottom} className="alpha-gridline" /><text x={xFor(tick)} y={chart.height - chart.bottom + 19} textAnchor="middle">{number(tick)} </text></g>)}
      <line x1={chart.left} x2={chart.width - chart.right} y1={chart.height - chart.bottom} y2={chart.height - chart.bottom} className="alpha-axis" />
      <path d={curvePath} className="alpha-curve-line" />
      <circle cx={xFor(current.radarSnrDb)} cy={yFor(current.dataRateMbps)} r="8" className="alpha-current-point" />
      <text x={chart.width / 2} y={chart.height - 6} textAnchor="middle">SNR de radar (dB)</text>
      <text transform={`translate(15 ${chart.height / 2}) rotate(-90)`} textAnchor="middle">Tasa (Mbit/s)</text>
    </svg>
  );
}

export function AlphaTradeoffExplorer() {
  const [alphaPercent, setAlphaPercent] = useState(50);
  const [user, setUser] = useState<UserScenario>("near");
  const [object, setObject] = useState<ObjectScenario>("pedestrian");
  const [prediction, setPrediction] = useState("");
  const [hasCheckedPrediction, setHasCheckedPrediction] = useState(false);
  const alpha = alphaPercent / 100;
  const metrics = alphaMetrics(alpha, user, object);
  const facts = alphaModelFacts();
  const comparison = prediction ? predictionResult(user, object) : null;
  const ratePercent = (metrics.dataRateMbps / metrics.maximumDataRateMbps) * 100;

  return (
    <div className="alpha-explorer">
      <section className="alpha-bet" aria-labelledby="alpha-bet-title">
        <h3 id="alpha-bet-title">Apuesta antes de tocar nada</h3>
        <p>En el escenario de abajo, si pasas de 50 % a 90 % de la potencia para datos, ¿cuánto crees que sube la velocidad de transmisión?</p>
        <fieldset className="alpha-radio-group">
          <legend>Elige una predicción (opcional)</legend>
          {(["Más de un 50 %", "Entre un 10 % y un 50 %", "Menos de un 10 %"] as const).map((option) => (
            <label key={option}><input type="radio" name="alpha-prediction" value={option} checked={prediction === option} onChange={() => { setPrediction(option); setHasCheckedPrediction(false); }} /> {option}</label>
          ))}
        </fieldset>
        {prediction && <button type="button" className="alpha-button" onClick={() => { setAlphaPercent(90); setHasCheckedPrediction(true); }}>Comprobar con el modelo</button>}
        {comparison && hasCheckedPrediction && alphaPercent === 90 && <p className="alpha-feedback">Apostaste «{prediction}». En este escenario, pasar de 50 % a 90 % para datos sube la velocidad un {number(comparison.gainPercent)} %, y el eco baja de {number(comparison.echoAtHalfDb)} dB a {number(comparison.echoAtNinetyDb)} dB.</p>}
      </section>

      <section className="alpha-controls" aria-label="Controles del reparto de potencia">
        <div className="alpha-knob range-control">
          <label htmlFor="alpha-power">Perilla α</label>
          <output htmlFor="alpha-power">α = {percent(alpha)} · P<sub>c</sub> = {number(metrics.communicationPowerW, 2)} W · P<sub>s</sub> = {number(metrics.sensingPowerW, 2)} W</output>
          <input id="alpha-power" type="range" min="1" max="99" step="1" value={alphaPercent}
            aria-valuetext={`Alfa ${alphaPercent} por ciento; ${number(metrics.communicationPowerW, 2)} vatios para datos y ${number(metrics.sensingPowerW, 2)} vatios para radar`}
            onChange={(event) => setAlphaPercent(event.currentTarget.valueAsNumber)} />
          <span>Todo para el radar</span><span>Todo para datos</span>
        </div>
        <fieldset className="alpha-radio-group">
          <legend>Tu usuario</legend>
          {(Object.keys(ALPHA_MODEL.users) as UserScenario[]).map((key) => <label key={key}><input type="radio" name="alpha-user" checked={user === key} onChange={() => setUser(key)} /> {ALPHA_MODEL.users[key].label}</label>)}
        </fieldset>
        <fieldset className="alpha-radio-group">
          <legend>Lo que quieres ver</legend>
          {(Object.keys(ALPHA_MODEL.objects) as ObjectScenario[]).map((key) => <label key={key}><input type="radio" name="alpha-object" checked={object === key} onChange={() => setObject(key)} /> {ALPHA_MODEL.objects[key].label}</label>)}
        </fieldset>
      </section>

      <div className="alpha-readouts">
        <section className="alpha-panel">
          <h3>Pantalla de eco</h3>
          <p className="editorial-caption">Ilustración de la SNR · predicción determinista ideal</p>
          <EchoChart alpha={alpha} object={object} />
        </section>
        <section className="alpha-panel alpha-meter-panel">
          <h3>Medidor de datos</h3>
          <p className="alpha-meter-value">{number(ratePercent)} % de la velocidad máxima posible</p>
          <progress max="100" value={Math.min(100, ratePercent)} aria-label={`Velocidad de datos, ${number(ratePercent)} por ciento de la máxima`} />
          <p className="editorial-caption">α = 1 equivale a 100 %; hasta {number(metrics.maximumDataRateMbps)} Mbit/s (cota teórica de Shannon, no alcanzable en un sistema real)</p>
          <dl className="alpha-live-metrics" aria-live="polite" aria-atomic="true"><div><dt>SNR de radar</dt><dd>{number(metrics.radarSnrDb)} dB</dd></div><div><dt>Tasa predicha</dt><dd>{number(metrics.dataRateMbps)} Mbit/s</dd></div></dl>
        </section>
      </div>

      <section className="alpha-panel alpha-curve-panel">
        <h3>Curva de compromiso</h3>
        <p className="editorial-caption">Predicción determinista ideal para {ALPHA_MODEL.users[user].label.toLowerCase()} y {ALPHA_MODEL.objects[object].label.toLowerCase()}.</p>
        <TradeoffChart user={user} object={object} alpha={alpha} onAlphaChange={setAlphaPercent} />
        <p className="editorial-caption">Así se elegiría α en la práctica: se calcula esta curva para la situación y se lee el punto que cumple los requisitos.</p>
        <details className="editorial-details alpha-table-details">
          <summary>Ver cinco puntos de la curva</summary>
          <div className="editorial-table-wrap" role="region" aria-label="Cinco puntos de la curva de compromiso" tabIndex={0}>
            <table><caption>Predicciones ideales del escenario actual</caption><thead><tr><th scope="col">α</th><th scope="col">SNR de radar (dB)</th><th scope="col">Tasa (Mbit/s)</th></tr></thead>
              <tbody>{[0.1, 0.3, 0.5, 0.7, 0.9].map((point) => { const row = alphaMetrics(point, user, object); return <tr key={point}><th scope="row">{percent(point)}</th><td>{number(row.radarSnrDb)}</td><td>{number(row.dataRateMbps)}</td></tr>; })}</tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="alpha-facts-section">
        <h3>Ficha de datos</h3>
        <dl className="editorial-facts alpha-facts">
          <div><dt>Lo que fijamos</dt><dd>Portadora {number(facts.carrierGHz)} GHz; ancho de banda {number(facts.bandwidthMHz, 0)} MHz; potencia total {number(facts.totalPowerW, 0)} W ({number(facts.totalPowerDbm, 0)} dBm); antena del nodo {number(facts.nodeGainDbi, 0)} dBi; antena del dispositivo {number(facts.deviceGainDbi, 0)} dBi; figura de ruido {number(facts.noiseFigureDb, 0)} dB.</dd></div>
          <div><dt>Lo que eliges</dt><dd>Distancia al usuario: {number(ALPHA_MODEL.users[user].distanceM, 0)} m; objeto: {ALPHA_MODEL.objects[object].label.toLowerCase()}, σ = {number(ALPHA_MODEL.objects[object].sigmaM2)} m² a {number(ALPHA_MODEL.objects[object].distanceM, 0)} m.</dd></div>
          <div><dt>Supuestos del modelo</dt><dd>Cota de Shannon; espacio libre con línea de vista; un solo objeto; solo ruido térmico a {number(facts.temperatureK, 0)} K; sin clutter ni detección real. El pico del radar es una ilustración de la SNR.</dd></div>
        </dl>
      </section>

      <section className="reflection-prompts alpha-reflections" aria-label="Preguntas para reflexionar">
        <blockquote>Si tu prioridad fuera ver un objeto pequeño y lejano, ¿qué reparto elegirías? ¿Y si fuera descargar lo más rápido posible?</blockquote>
        <blockquote>¿Qué cambió en la curva cuando alejaste al usuario? ¿Y cuando alejaste el objeto?</blockquote>
        <blockquote>¿Qué tendría que saber el nodo para decidir α por sí solo?</blockquote>
      </section>
      <ForumInvitation />
    </div>
  );
}
