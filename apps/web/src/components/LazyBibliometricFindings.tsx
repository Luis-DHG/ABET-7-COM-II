import { lazy, Suspense } from "react";

const BibliometricFindings = lazy(() => import("@/components/BibliometricFindings"));

export function LazyBibliometricFindings() {
  return (
    <Suspense fallback={<p className="editorial-caption" role="status">Preparando el resumen de resultados…</p>}>
      <BibliometricFindings />
    </Suspense>
  );
}
