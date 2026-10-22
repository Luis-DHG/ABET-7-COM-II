import { useRef, useState, type PointerEvent } from "react";
import { ForumInvitation } from "@/components/EditorialExtras";
import {
  ALPHA_MODEL,
  alphaMetrics,
  alphaModelFacts,
  tradeoffCurve,
  type ObjectScenario,
  type UserScenario,
} from "@/lib/alphaTradeoff";

const number = (value: number, digits = 1) => value.toLocaleString("es-CO", { maximumFractionDigits: digits });
const percent = (value: number, digits = 0) => `${number(value * 100, digits)} %`;
const chart = { width: 760, height: 410, left: 78, right: 24, top: 22, bottom: 46 };
const panels = { rate: { top: 24, bottom: 166 }, radar: { top: 208, bottom: 350 } };

function AlphaResponseChart({ user, object, alpha, onAlphaChange }: {
  user: UserScenario;
  object: ObjectScenario;
  alpha: number;
  onAlphaChange: (value: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const curve = tradeoffCurve(user, object);
  const current = alphaMetrics(alpha, user, object);
  const maximumRate = Math.ceil(Math.max(...curve.map((point) => point.dataRateMbps)) / 50) * 50;
  const minimumRadar = Math.floor(Math.min(...curve.map((point) => point.radarSnrDb)) / 5) * 5;
  const maximumRadar = Math.ceil(Math.max(...curve.map((point) => point.radarSnrDb)) / 5) * 5;
  const radarSpan = maximumRadar - minimumRadar || 1;
  const plotWidth = chart.width - chart.left - chart.right;
  const xFor = (value: number) => chart.left + ((value - 0.01) / 0.98) * plotWidth;
  const yRate = (value: number) => panels.rate.bottom - (value / maximumRate) * (panels.rate.bottom - panels.rate.top);
  const yRadar = (value: number) => panels.radar.bottom - ((value - minimumRadar) / radarSpan) * (panels.radar.bottom - panels.radar.top);
  const ratePath = curve.map((point, index) => `${index ? "L" : "M"}${xFor(point.alpha).toFixed(1)},${yRate(point.dataRateMbps).toFixed(1)}`).join(" ");
  const radarPath = curve.map((point, index) => `${index ? "L" : "M"}${xFor(point.alpha).toFixed(1)},${yRadar(point.radarSnrDb).toFixed(1)}`).join(" ");
  const pointerAlpha = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const svgX = ((event.clientX - bounds.left) / bounds.width) * chart.width;
    const value = 0.01 + ((svgX - chart.left) / plotWidth) * 0.98;
    onAlphaChange(Math.max(1, Math.min(99, Math.round(value * 100))));
  };
  const label = `Curvas de tasa de comunicación y SNR de radar frente a alfa para usuario ${ALPHA_MODEL.users[user].label} y ${ALPHA_MODEL.objects[object].label}. Ajusta alfa con flechas, inicio o fin.`;
  const rateTicks = [0, maximumRate / 2, maximumRate];
  const radarTicks = [minimumRadar, minimumRadar + radarSpan / 2, maximumRadar];

  return (
    <svg ref={svgRef} className="alpha-chart" viewBox={`0 0 ${chart.width} ${chart.height}`} role="slider" aria-orientation="horizontal"
      aria-label={label} aria-valuemin={1} aria-valuemax={99} aria-valuenow={Math.round(alpha * 100)}
      aria-valuetext={`Alfa ${percent(alpha)}; tasa ${number(current.dataRateMbps)} Mbit/s; SNR de radar ${number(current.radarSnrDb)} dB`}
      tabIndex={0} onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); onAlphaChange(Math.max(1, Math.round(alpha * 100) - 1)); }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); onAlphaChange(Math.min(99, Math.round(alpha * 100) + 1)); }
        if (event.key === "Home") { event.preventDefault(); onAlphaChange(1); }
        if (event.key === "End") { event.preventDefault(); onAlphaChange(99); }
      }} onPointerDown={(event) => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); pointerAlpha(event); }}
      onPointerMove={(event) => { if (dragging.current) pointerAlpha(event); }}
      onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
      <text x={chart.left} y="15" className="alpha-chart-heading">Tasa de comunicación · Mbit/s</text>
      <text x={chart.left} y="198" className="alpha-chart-heading">SNR de radar · dB</text>
      {rateTicks.map((tick) => {
        const y = yRate(tick);
        return <g key={`rate-${tick}`}><line x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} className="alpha-gridline" /><text x={chart.left - 10} y={y + 5} textAnchor="end">{number(tick, 0)}</text></g>;
      })}
      {radarTicks.map((tick) => {
        const y = yRadar(tick);
        return <g key={`radar-${tick}`}><line x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} className="alpha-gridline" /><text x={chart.left - 10} y={y + 5} textAnchor="end">{number(tick, 0)}</text></g>;
      })}
      {[0.01, 0.5, 0.99].map((tick) => <g key={tick}><line x1={xFor(tick)} x2={xFor(tick)} y1={panels.rate.top} y2={panels.radar.bottom} className="alpha-gridline alpha-gridline-vertical" /><text x={xFor(tick)} y={chart.height - 23} textAnchor="middle">{percent(tick)}</text></g>)}
      <line x1={chart.left} x2={chart.width - chart.right} y1={panels.rate.bottom} y2={panels.rate.bottom} className="alpha-axis" />
      <line x1={chart.left} x2={chart.width - chart.right} y1={panels.radar.bottom} y2={panels.radar.bottom} className="alpha-axis" />
      <path d={ratePath} className="alpha-curve-line alpha-rate-line" />
      <path d={radarPath} className="alpha-curve-line alpha-radar-line" />
      <line x1={xFor(alpha)} x2={xFor(alpha)} y1={panels.rate.top} y2={panels.radar.bottom} className="alpha-cursor" />
      <circle cx={xFor(alpha)} cy={yRate(current.dataRateMbps)} r="7" className="alpha-point alpha-rate-point" />
      <circle cx={xFor(alpha)} cy={yRadar(current.radarSnrDb)} r="7" className="alpha-point alpha-radar-point" />
      <text x={chart.width / 2} y={chart.height - 3} textAnchor="middle">Fracción para comunicación · α</text>
    </svg>
  );
}

export function AlphaTradeoffExplorer() {
  const [alphaPercent, setAlphaPercent] = useState(50);
  const [user, setUser] = useState<UserScenario>("near");
  const [object, setObject] = useState<ObjectScenario>("pedestrian");
  const alpha = alphaPercent / 100;
  const metrics = alphaMetrics(alpha, user, object);
  const reference = alphaMetrics(0.5, user, object);
  const facts = alphaModelFacts();
  const rateChange = metrics.dataRateMbps - reference.dataRateMbps;
  const radarChange = metrics.radarSnrDb - reference.radarSnrDb;

  return (
    <div className="alpha-explorer">
      <section className="alpha-controls" aria-label="Reparto de potencia">
        <div className="alpha-knob range-control">
          <label htmlFor="alpha-power">Reparto de potencia · α</label>
          <output htmlFor="alpha-power">{percent(alpha)} para comunicación · {percent(1 - alpha)} para sensado</output>
          <input id="alpha-power" type="range" min="1" max="99" step="1" value={alphaPercent}
            aria-valuetext={`Alfa ${percent(alpha)} para comunicación y ${percent(1 - alpha)} para sensado`}
            onChange={(event) => setAlphaPercent(event.currentTarget.valueAsNumber)} />
          <span>99 % para sensado</span><span>99 % para comunicación</span>
        </div>
        <div className="alpha-power-values" aria-label="Potencia asignada">
          <span>Datos <strong>P<sub>c</sub> = {number(metrics.communicationPowerW, 2)} W</strong></span>
          <span>Sensado <strong>P<sub>s</sub> = {number(metrics.sensingPowerW, 2)} W</strong></span>
        </div>
      </section>

      <details className="editorial-details alpha-scenarios">
        <summary>Escenario: usuario {ALPHA_MODEL.users[user].label.toLowerCase()} · {ALPHA_MODEL.objects[object].label.toLowerCase()}</summary>
        <div className="alpha-scenario-fields">
          <fieldset className="alpha-radio-group">
            <legend>Usuario de comunicación</legend>
            {(Object.keys(ALPHA_MODEL.users) as UserScenario[]).map((key) => <label key={key}><input type="radio" name="alpha-user" checked={user === key} onChange={() => setUser(key)} /> {ALPHA_MODEL.users[key].label}</label>)}
          </fieldset>
          <fieldset className="alpha-radio-group">
            <legend>Objeto de sensado</legend>
            {(Object.keys(ALPHA_MODEL.objects) as ObjectScenario[]).map((key) => <label key={key}><input type="radio" name="alpha-object" checked={object === key} onChange={() => setObject(key)} /> {ALPHA_MODEL.objects[key].label}</label>)}
          </fieldset>
        </div>
      </details>

      <section className="alpha-response" aria-labelledby="alpha-response-title">
        <div className="alpha-response-heading">
          <h3 id="alpha-response-title">Cómo responde el modelo</h3>
          <p>El punto vertical marca α en las dos curvas: tasa y SNR de radar.</p>
        </div>
        <AlphaResponseChart user={user} object={object} alpha={alpha} onAlphaChange={setAlphaPercent} />
        <dl className="alpha-live-metrics" aria-live="polite" aria-atomic="true">
          <div><dt>Tasa ideal de datos</dt><dd>{number(metrics.dataRateMbps)} <small>Mbit/s</small></dd></div>
          <div><dt>SNR ideal de radar</dt><dd>{number(metrics.radarSnrDb)} <small>dB</small></dd></div>
        </dl>
        <p className="alpha-interpretation" aria-live="polite">
          {alphaPercent === 50
            ? "Con el reparto igual (α = 50 %), el modelo sirve como punto de comparación."
            : `Frente a α = 50 %, la tasa ${rateChange >= 0 ? "sube" : "baja"} ${number(Math.abs(rateChange))} Mbit/s y la SNR de radar ${radarChange >= 0 ? "sube" : "baja"} ${number(Math.abs(radarChange))} dB.`}
        </p>
      </section>

      <details className="editorial-details alpha-depth">
        <summary>Parámetros, ecuaciones y supuestos</summary>
        <div className="alpha-depth-content">
          <dl className="editorial-facts alpha-facts">
            <div><dt>Fijados en α</dt><dd>{number(facts.carrierGHz)} GHz · {number(facts.bandwidthMHz, 0)} MHz · {number(facts.totalPowerW, 0)} W ({number(facts.totalPowerDbm, 0)} dBm) · antenas {number(facts.nodeGainDbi, 0)} / {number(facts.deviceGainDbi, 0)} dBi · figura de ruido {number(facts.noiseFigureDb, 0)} dB · temperatura {number(facts.temperatureK, 0)} K · resolución de rango {number(facts.rangeResolutionM)} m.</dd></div>
            <div><dt>Elegidos en escenario</dt><dd>Usuario a {number(ALPHA_MODEL.users[user].distanceM, 0)} m; {ALPHA_MODEL.objects[object].label.toLowerCase()}, σ = {number(ALPHA_MODEL.objects[object].sigmaM2)} m².</dd></div>
          </dl>
          <ul className="alpha-equations">
            <li><code>P<sub>c</sub> = αP<sub>total</sub>; P<sub>s</sub> = (1−α)P<sub>total</sub></code></li>
            <li><code>SNR<sub>com</sub> = |h|²P<sub>c</sub>/(kT₀BF); R = B log₂(1 + SNR<sub>com</sub>)</code></li>
            <li><code>SNR<sub>radar</sub> = P<sub>s</sub>G²λ²σ/((4π)³R⁴kT₀BF)</code></li>
          </ul>
          <p className="editorial-caption">La vista OFDM usa la misma portadora y 20 MHz como valor inicial, permite cambiar B y parte de un objetivo a 80 m. El barrido α fija B en 20 MHz y usa sus propias distancias de usuario y objeto; son dos modelos ideales complementarios, no un escenario sincronizado.</p>
          <p className="editorial-caption">El código del repositorio no documenta una fuente para la potencia, ganancias, figura de ruido y geometrías fijadas en α: aquí se conservan como supuestos explícitos. El término de ruido es un nivel térmico fijo; las relaciones son deterministas y no incluyen canal real, clutter, ruido aleatorio ni detección.</p>
        </div>
      </details>

      <details className="editorial-details alpha-table-details">
        <summary>Tabla de referencia del barrido</summary>
        <div className="editorial-table-wrap" role="region" aria-label="Valores del reparto de potencia" tabIndex={0}>
          <table><caption>Predicciones ideales para el escenario seleccionado</caption>
            <thead><tr><th scope="col">α</th><th scope="col">P<sub>c</sub> (W)</th><th scope="col">P<sub>s</sub> (W)</th><th scope="col">Tasa (Mbit/s)</th><th scope="col">SNR radar (dB)</th></tr></thead>
            <tbody>{[0.1, 0.3, 0.5, 0.7, 0.9].map((point) => { const row = alphaMetrics(point, user, object); return <tr key={point}><th scope="row">{percent(point)}</th><td>{number(row.communicationPowerW, 2)}</td><td>{number(row.sensingPowerW, 2)}</td><td>{number(row.dataRateMbps)}</td><td>{number(row.radarSnrDb)}</td></tr>; })}</tbody>
          </table>
        </div>
        <p className="editorial-caption">La tasa mostrada es una cota ideal de Shannon; no representa el rendimiento alcanzable de un sistema real.</p>
      </details>

      <section className="alpha-reflection">
        <h3>Para interpretar</h3>
        <blockquote>Si tu prioridad fuera ver un objeto pequeño y lejano, ¿qué reparto elegirías? ¿Y si fuera descargar lo más rápido posible?</blockquote>
        <details className="editorial-details alpha-more-questions">
          <summary>Otras preguntas para seguir explorando</summary>
          <div className="reflection-prompts">
            <blockquote>¿Qué cambió en las curvas al alejar al usuario? ¿Y al alejar el objeto?</blockquote>
            <blockquote>¿Qué tendría que saber el nodo para decidir α por sí solo?</blockquote>
          </div>
        </details>
      </section>
      <ForumInvitation />
    </div>
  );
}
