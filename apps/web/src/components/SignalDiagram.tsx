export function SignalDiagram() {
  return (
    <figure className="signal-figure">
      <svg viewBox="0 0 620 300" role="img" aria-labelledby="signal-title signal-description">
        <title id="signal-title">Una señal, dos funciones</title>
        <desc id="signal-description">
          Un nodo ISAC envía datos a un usuario. La misma señal alcanza un objetivo y su eco regresa
          al nodo, donde permite estimar distancia y velocidad. Las líneas continuas representan la
          transmisión y la línea discontinua representa el eco.
        </desc>
        <defs>
          <pattern id="signal-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeOpacity=".08" />
          </pattern>
          <marker id="signal-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        <rect width="620" height="300" fill="url(#signal-grid)" />
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="132" cy="160" r="48" opacity=".15" />
          <circle cx="132" cy="160" r="76" opacity=".12" />
          <circle cx="132" cy="160" r="104" opacity=".08" />
          <path d="M 164 142 L 455 68" markerEnd="url(#signal-arrow)" />
          <path d="M 164 170 L 455 216" markerEnd="url(#signal-arrow)" />
          <path d="M 453 235 Q 295 290 166 192" strokeDasharray="6 6" markerEnd="url(#signal-arrow)" />
          <path d="M 112 195 L 132 138 L 152 195 M 121 171 H 143 M 115 187 H 148" strokeWidth="3" />
          <circle cx="132" cy="128" r="5" fill="currentColor" />
          <path d="M 119 116 Q 105 129 119 141 M 145 116 Q 159 129 145 141" strokeWidth="2" />
          <rect x="478" y="40" width="30" height="48" rx="5" strokeWidth="2" />
          <path d="M 489 80 H 497" />
          <path d="M 470 224 V 212 L 483 204 H 512 L 525 214 V 224 Z M 483 204 L 490 192 H 507 L 515 207" strokeWidth="2" />
          <circle cx="481" cy="226" r="6" fill="var(--card)" strokeWidth="2" />
          <circle cx="514" cy="226" r="6" fill="var(--card)" strokeWidth="2" />
        </g>
        <g fill="var(--foreground)" fontSize="14" fontFamily="inherit">
          <text x="132" y="225" textAnchor="middle" fontWeight="600">Nodo ISAC</text>
          <text x="493" y="112" textAnchor="middle" fontWeight="600">Usuario</text>
          <text x="499" y="257" textAnchor="middle" fontWeight="600">Objetivo</text>
          <text x="277" y="85">Datos</text>
          <text x="272" y="185">Señal emitida</text>
          <text x="286" y="270">Eco recibido</text>
        </g>
      </svg>
      <div className="signal-mobile">
        <strong>Nodo ISAC</strong>
        <div><span>Transmisión de datos</span><strong>Usuario conectado</strong></div>
        <div><span>Señal emitida</span><strong>Objetivo</strong><span>Eco de vuelta al nodo</span></div>
      </div>
      <figcaption>Esquema conceptual monostático. La señal comunica; sus ecos aportan información del entorno.</figcaption>
    </figure>
  );
}
