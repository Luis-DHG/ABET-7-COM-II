import { lazy, Suspense } from "react";

const BibliometricMap = lazy(() => import("@/components/BibliometricMap"));

export function LazyBibliometricMap() {
  return (
    <Suspense fallback={<p className="editorial-caption" role="status">Preparando la visualización interactiva…</p>}>
      <BibliometricMap />
    </Suspense>
  );
}
