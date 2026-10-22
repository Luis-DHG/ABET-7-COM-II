import { lazy, Suspense, useEffect, useRef, useState } from "react";

const AlphaTradeoffExplorer = lazy(() => import("@/components/AlphaTradeoffExplorer").then((module) => ({ default: module.AlphaTradeoffExplorer })));

export function LazyAlphaTradeoffExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || shouldLoad) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px" });
    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="alpha-lazy-shell">
      {shouldLoad ? <Suspense fallback={<p className="editorial-caption" role="status">Preparando la visualización interactiva…</p>}><AlphaTradeoffExplorer /></Suspense>
        : <p className="editorial-caption" role="status">Preparando la visualización interactiva…</p>}
    </div>
  );
}
