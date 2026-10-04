import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FORUM_PATH } from "@/lib/manifest";

export function EditorialNote({ title, children }: { title: string; children: ReactNode }) {
  return <Alert role="note" className="p-5"><BookOpen aria-hidden /><AlertTitle>{title}</AlertTitle><AlertDescription>{children}</AlertDescription></Alert>;
}

export function ForumInvitation() {
  return (
    <div className="forum-invitation">
      <h3>La siguiente pregunta puede ser tuya</h3>
      <p>¿Qué concepto, aplicación o limitación de ISAC te gustaría que explicáramos con mayor claridad?</p>
      <Button asChild className="min-h-11"><Link to={FORUM_PATH}>Compartir en el foro <ArrowUpRight data-icon="inline-end" aria-hidden /></Link></Button>
    </div>
  );
}
