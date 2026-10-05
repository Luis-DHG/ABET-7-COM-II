interface ReferenceFigureProps {
  src: string;
  alt: string;
  caption: string;
  source?: string;
}

/* Figura de una fuente externa con leyenda y atribución obligatoria. */
export function ReferenceFigure({ src, alt, caption, source }: ReferenceFigureProps) {
  return (
    <figure className="signal-figure">
      <img src={src} alt={alt} loading="lazy" className="signal-image" />
      <figcaption>
        {caption}
        {source ? <span className="figure-source">{source}</span> : null}
      </figcaption>
    </figure>
  );
}

/* Figura pendiente de extraer: describe qué debe explicar la imagen. */
export function FigurePlaceholder({ children }: { children: string }) {
  return (
    <div className="figure-placeholder" role="note">
      <p>[PLACEHOLDER: FIGURA — {children}]</p>
    </div>
  );
}
