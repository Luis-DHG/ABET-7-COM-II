import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EditorialModule } from "@/pages/moduleContent";
import { FORUM_PATH, MODULES, previousOf, nextOf, type ModuleInfo } from "@/lib/manifest";
import { cn } from "@/lib/utils";

export function ModuleLayout({ module, content }: { module: ModuleInfo; content: EditorialModule }) {
  const heading = useRef<HTMLHeadingElement>(null);
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
            <h2>En este módulo</h2>
            <ol>{content.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
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
      <ol className="flex items-center gap-1.5" aria-hidden>
        {MODULES.map(({ number: n }) => (
          <li
            key={n}
            className={cn(
              "size-2.5 rounded-full border",
              n < module.number && "border-primary bg-primary",
              n === module.number && "border-primary bg-primary/30",
              n > module.number && "border-border bg-transparent",
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
        to={MODULES[0].path}
        className="flex min-h-11 items-center rounded-lg border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/50"
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
