import { Link } from "react-router-dom";
import { FORUM_PATH } from "@/lib/manifest";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-prose space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Página no encontrada</h1>
      <p className="text-muted-foreground">La dirección solicitada no existe o fue movida.</p>
      <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm">
        <Link to="/planeacion" className="text-primary underline underline-offset-4">
          Ir al módulo 1: Inicio y marco del reto
        </Link>
        <Link to={FORUM_PATH} className="text-primary underline underline-offset-4">
          Ir a retroalimentación
        </Link>
      </div>
    </section>
  );
}
