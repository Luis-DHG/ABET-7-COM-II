import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EditorialModule } from "@/pages/moduleContent";
import { FORUM_PATH, MODULES, previousOf, nextOf, type ModuleInfo } from "@/lib/manifest";
import { cn } from "@/lib/utils";

// En escritorio el índice siempre está abierto; en móvil es colapsable.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export function ModuleLayout({ module, content }: { module: ModuleInfo; content: EditorialModule }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const isDesktop = useIsDesktop();
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const target = hash ? document.getElementById(hash) : heading.current;
    if (hash && target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    target?.focus({ preventScroll: true });
  }, []);

  return (
    <article className="editorial-module">
      <title>{`${module.title} | BlogDPC · ISAC`}</title>
      <meta name="description" content={module.scope} />
      <header className="module-hero">
        <ModuleProgress module={module} />
        <div className="module-hero-copy">
          <p className="module-subject">{module.title}</p>
          <h1 ref={heading} tabIndex={-1}>{content.headline}</h1>
          <p className="module-introduction">{content.introduction}</p>
          <div className="module-meta">
            <span>Universidad Industrial de Santander</span>
            {content.status ? <Badge variant="outline">{content.status}</Badge> : <Badge variant="secondary">Guía de lectura</Badge>}
          </div>
        </div>
      </header>

      <div className="editorial-grid">
        <aside className="module-index">
          <nav aria-label="En este módulo">
            <details
              className="module-index-details"
              open={isDesktop ? true : undefined}
              onToggle={(event) => {
                if (isDesktop) event.currentTarget.open = true;
              }}
            >
              <summary>En este módulo</summary>
              <ol>{content.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
            </details>
          </nav>
          {module.number !== 7 ? <Link className="glossary-shortcut" to="/glosario"><BookOpen aria-hidden /> Consultar glosario <ArrowUpRight aria-hidden /></Link> : null}
          <p className="editorial-caption">Divulgación para estudiantes de ingeniería.</p>
        </aside>
        <div className="editorial-body">{content.sections.map((section) => (
          <section key={section.id} id={section.id} tabIndex={-1} aria-labelledby={`${section.id}-title`} className="editorial-section">
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.content}
          </section>
        ))}</div>
      </div>

      <PreviousNext current={module} />
    </article>
  );
}

export function ModuleProgress({ module }: { module: ModuleInfo }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Módulo {module.number} de {MODULES.length}
      </p>
      <ol className="flex items-end gap-1.5" aria-hidden>
        {MODULES.map(({ number: n }) => (
          <li
            key={n}
            className={cn(
              "w-[7px] rounded-[2px]",
              n < module.number && "h-3.5 bg-primary/40",
              n === module.number && "h-6 bg-primary",
              n > module.number && "h-3.5 border border-border bg-transparent",
            )}
          />
        ))}
      </ol>
    </div>
  );
}

export function PreviousNext({ current }: { current: ModuleInfo }) {
  const previous = previousOf(current);
  const next = nextOf(current);
  return (
    <nav aria-label="Navegación entre módulos" className="module-pagination flex flex-wrap items-stretch gap-3 border-t pt-6">
      <Link
        to={`${MODULES[0].path}#recorrido`}
        className="self-center text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Índice completo
      </Link>
      {previous ? (
        <Link
          to={previous.path}
          className="flex min-h-11 flex-1 flex-col rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/50"
        >
          <span className="text-xs text-muted-foreground">← Módulo anterior</span>
          <span className="text-sm font-medium">
            {previous.number}. {previous.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" aria-hidden />
      )}

      {next ? (
        <Link
          to={next.path}
          className="flex min-h-11 flex-1 flex-col items-end rounded-lg border bg-card px-4 py-3 text-right transition-colors hover:border-primary/50"
        >
          <span className="text-xs text-muted-foreground">Módulo siguiente →</span>
          <span className="text-sm font-medium">
            {next.number}. {next.title}
          </span>
        </Link>
      ) : (
        <Link
          to={FORUM_PATH}
          className="flex min-h-11 flex-1 flex-col items-end rounded-lg border bg-card px-4 py-3 text-right transition-colors hover:border-primary/50"
        >
          <span className="text-xs text-muted-foreground">A continuación</span>
          <span className="text-sm font-medium">Retroalimentación — sección independiente</span>
        </Link>
      )}
    </nav>
  );
}
