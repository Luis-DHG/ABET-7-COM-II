import { lazy, Suspense } from "react";

const Glossary = lazy(() => import("@/components/Glossary").then(({ Glossary }) => ({ default: Glossary })));

export function LazyGlossary() {
  return <Suspense fallback={<p role="status">Cargando glosario…</p>}><Glossary /></Suspense>;
}
