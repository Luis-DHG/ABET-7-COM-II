import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFDM_DEFAULTS, ofdmMetrics } from "@/lib/ofdm";

const controls = [
  { key: "bandwidthMHz", label: "Ancho de banda", unit: "MHz", min: 10, max: 80, step: 10 },
  { key: "symbols", label: "Símbolos observados", unit: "símbolos", min: 64, max: 512, step: 64 },
  { key: "range", label: "Distancia del objetivo", unit: "m", min: 10, max: 200, step: 5 },
  { key: "velocity", label: "Velocidad radial", unit: "m/s", min: -30, max: 30, step: 1 },
] as const;
const number = (value: number, digits = 2) => value.toLocaleString("es-CO", { maximumFractionDigits: digits });

export function OfdmExplorer() {
  const [parameters, setParameters] = useState(OFDM_DEFAULTS);
  const metrics = ofdmMetrics(parameters);
  return (
    <div className="ofdm-explorer">
      <div className="explorer-controls">
        <fieldset>
          <legend>Configura el escenario</legend>
          {controls.map(({ key, label, unit, min, max, step }) => (
            <div className="range-control" key={key}>
              <label htmlFor={`ofdm-${key}`}>{label}</label>
              <output htmlFor={`ofdm-${key}`}>{parameters[key]} {unit}</output>
              <input id={`ofdm-${key}`} type="range" min={min} max={max} step={step}
                value={parameters[key]} aria-valuetext={`${parameters[key]} ${unit}`}
                onChange={(event) => setParameters({ ...parameters, [key]: event.target.valueAsNumber })} />
              <span>{min} {unit}</span><span>{max} {unit}</span>
            </div>
          ))}
        </fieldset>
        <Button variant="outline" className="min-h-11" onClick={() => setParameters(OFDM_DEFAULTS)}>
          <RotateCcw data-icon="inline-start" aria-hidden /> Restablecer valores
        </Button>
        <p className="editorial-caption">Portadora: 5,9 GHz · 1024 subportadoras · QPSK · prefijo cíclico: 25 % del símbolo útil.</p>
      </div>
      <div className="explorer-results" aria-live="polite" aria-atomic="true">
        <h3>Predicción del modelo ideal</h3>
        <dl className="metric-grid">
          <div><dt>Resolución de distancia</dt><dd>{number(metrics.rangeResolution)} <small>m</small><p>Menor es mejor para separar objetivos.</p></dd></div>
          <div><dt>Resolución de velocidad</dt><dd>{number(metrics.velocityResolution)} <small>m/s</small><p>Menor distingue velocidades más próximas.</p></dd></div>
          <div><dt>Tiempo de observación</dt><dd>{number(metrics.observationMs)} <small>ms</small><p>Duración de los símbolos observados.</p></dd></div>
          <div><dt>Tasa bruta QPSK</dt><dd>{number(metrics.rawRateMbps)} <small>Mbit/s</small><p>Incluye CP; sin pilotos ni codificación.</p></dd></div>
        </dl>
        <div className="echo-readout">
          <span>Eco del objetivo a {parameters.range} m</span>
          <strong>τ = {number(metrics.delayUs, 3)} μs</strong>
          <strong>f<sub>D</sub> = {number(metrics.dopplerHz)} Hz</strong>
        </div>
        <p className="editorial-caption">El signo Doppler sigue la convención v positiva al acercarse. Cambiar distancia o velocidad desplaza el eco; no cambia la resolución del sistema.</p>
      </div>
    </div>
  );
}
