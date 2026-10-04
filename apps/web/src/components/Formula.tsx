import { useEffect, useState } from "react";

export function Formula({ tex, display = false }: { tex: string; display?: boolean }) {
  const [rendered, setRendered] = useState<{ tex: string; display: boolean; html: string } | null>(null);

  useEffect(() => {
    let active = true;
    void import("katex")
      .then(({ default: katex }) => {
        if (active) setRendered({ tex, display, html: katex.renderToString(tex, {
          output: "mathml", displayMode: display, throwOnError: true, trust: false,
        }) });
      })
      .catch((error: unknown) => console.error("No se pudo representar la fórmula", error));
    return () => { active = false; };
  }, [tex, display]);

  const html = rendered?.tex === tex && rendered.display === display ? rendered.html : null;
  return html === null ? <span>{tex}</span> : <span dangerouslySetInnerHTML={{ __html: html }} />;
}
