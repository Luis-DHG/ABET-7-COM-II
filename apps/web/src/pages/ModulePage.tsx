import { Navigate, useParams } from "react-router-dom";
import { ModuleLayout } from "@/components/ModuleLayout";
import { moduleByPath } from "@/lib/manifest";
import NotFoundPage from "@/pages/NotFoundPage";
import { MODULE_CONTENT } from "@/pages/moduleContent";

export default function ModulePage() {
  const { moduleSlug } = useParams();
  const module = moduleByPath(`/${moduleSlug ?? ""}`);
  if (!module) return <NotFoundPage />;
  return <ModuleLayout key={module.path} module={module} content={MODULE_CONTENT[module.number]} />;
}

export function HomeRedirect() {
  return <Navigate to="/planeacion" replace />;
}
