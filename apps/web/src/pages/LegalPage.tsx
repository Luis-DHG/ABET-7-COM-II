import { Link } from "react-router-dom";
import { StatusNotice } from "@/components/StatusNotice";

const CONTACT_EMAIL = "chaconvargasfabiancamilo@gmail.com";

interface LegalDoc {
  title: string;
  summary: string;
  crossLink: { to: string; label: string };
}

const DOCUMENTS: Record<string, LegalDoc> = {
  privacidad: {
    title: "Política de datos personales",
    summary: "Qué datos se recogen, con qué finalidad y cómo ejercer tus derechos sobre ellos.",
    crossLink: { to: "/terminos", label: "Términos y condiciones" },
  },
  terminos: {
    title: "Términos y condiciones",
    summary: "Reglas de uso del sitio, la participación en el foro y la moderación.",
    crossLink: { to: "/privacidad", label: "Política de datos personales" },
  },
};

export default function LegalPage({ kind }: { kind: "privacidad" | "terminos" }) {
  const doc = DOCUMENTS[kind];
  return (
    <article className="max-w-prose space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{doc.title}</h1>
        <p className="text-muted-foreground">{doc.summary}</p>
      </header>

      <StatusNotice tone="info" title="Documento en preparación">
        El texto completo de este documento se publicará en una iteración posterior. Esta versión no constituye
        asesoría legal validada.
      </StatusNotice>

      <p className="text-sm text-muted-foreground">
        Consultas sobre este documento:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <p className="text-sm">
        Documento relacionado:{" "}
        <Link to={doc.crossLink.to} className="text-primary underline underline-offset-4">
          {doc.crossLink.label}
        </Link>
      </p>
    </article>
  );
}
