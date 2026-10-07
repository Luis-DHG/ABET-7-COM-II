# Evidencia visual de implementación

## Línea base

- Servidores locales ya existentes: Vite en `http://localhost:5173` y API en `:3000`; no se iniciaron procesos de backend ni migraciones.
- Las peticiones `/api/*` de la revisión del navegador se interceptan con fixtures sin datos personales, antes de recorrer las vistas.
- `/planeacion`, ventana 1440×900, antes del rediseño: hero de 543,16 px; primer párrafo de 17 px, interlineado 30,6 px y máximo de 72ch. Ancho desplazable y útil del documento: 1425 px; sin desbordamiento global en este caso.
- Trabajo ajeno preexistente: PNG de ODDM eliminado y AVIF sin versionar, mientras `ODDMDiagram.tsx` aún refiere al PNG. No se restaura, convierte ni sustituye ese activo dentro de la presentación.
- Los archivos de `graphify-out/` ya estaban modificados antes de iniciar.

## Reparación previa autorizada

El usuario seleccionó «Autorizar reparación previa» para crear un manifest raíz mínimo basado en scripts existentes, sin dependencias nuevas ni cambios en el comportamiento de la aplicación. Antes de reparar, `pnpm check`, `pnpm lint` y `pnpm test` devolvieron código 1 y `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND`.

La delegación del ajuste documental a `especificador` fue denegada por los permisos de esta sesión. Se conservan intactos proposal, design y deltas; esta evidencia registra la autorización explícita de la reparación operativa. No se añaden scripts de despliegue, migración o gestión de datos.
