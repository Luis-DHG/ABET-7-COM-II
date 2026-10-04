export interface ModuleInfo {
  number: number;
  path: string;
  title: string;
  scope: string;
}

export const MODULES: ModuleInfo[] = [
  {
    number: 1,
    path: "/planeacion",
    title: "Inicio y marco del reto",
    scope: "Qué es ISAC, para qué sirve y cómo recorrer sus conceptos, aplicaciones y literatura.",
  },
  {
    number: 2,
    path: "/analisis",
    title: "Inteligencia bibliométrica",
    scope: "Cómo leer la investigación en ISAC. Búsqueda en Scopus e IEEE Xplore pendiente de realizar.",
  },
  {
    number: 3,
    path: "/tendencias",
    title: "Estado del arte y tendencias",
    scope: "De una señal compartida a cuatro escenarios de aplicación: transporte, drones, salud e industria.",
  },
  {
    number: 4,
    path: "/mini-caso",
    title: "Mini-caso técnico aplicado",
    scope: "Explora cómo el ancho de banda y el tiempo de observación cambian un escenario OFDM-DFRC ideal.",
  },
  {
    number: 5,
    path: "/divulgacion",
    title: "Divulgación multimedia",
    scope: "Las ideas esenciales del proyecto y el recorrido del futuro video de divulgación.",
  },
  {
    number: 6,
    path: "/bitacora",
    title: "Bitácora metacognitiva",
    scope: "Cómo organizamos el aprendizaje: decisiones del proyecto, estrategias y preguntas para reflexionar.",
  },
  {
    number: 7,
    path: "/glosario",
    title: "Glosario y referencias",
    scope: "Conceptos, unidades, ejemplos y lecturas para acompañar tu recorrido por ISAC.",
  },
];

export const FORUM_PATH = "/retroalimentacion";

export function moduleByPath(path: string): ModuleInfo | undefined {
  return MODULES.find((module) => module.path === path);
}

export function previousOf(module: ModuleInfo): ModuleInfo | null {
  return MODULES[module.number - 2] ?? null;
}

export function nextOf(module: ModuleInfo): ModuleInfo | null {
  return MODULES[module.number] ?? null;
}
