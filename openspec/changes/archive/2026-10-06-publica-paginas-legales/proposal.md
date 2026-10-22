# Proposal

## Why

Las rutas de privacidad y términos todavía muestran un aviso de documento en preparación. El usuario aprobó el contenido en esta conversación y pidió publicarlo en ambas páginas.

## What Changes

- Sustituir el placeholder por los dos textos aprobados, en secciones numeradas y legibles.
- Publicar responsable Grupo 3, contacto, finalidad de cuentas y foro, proveedores técnicos, West US, logs en Supabase, IP sin almacenamiento persistente, cookies y cierre el 31 de marzo de 2027 sin respaldos.
- Incluir en términos el permiso técnico limitado de los comentarios, los límites de participación y el alcance educativo, sin sección de moderación.
- Conservar acceso público, enlaces de contacto y enlace entre documentos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `paginas-legales`: concreta el contenido aprobado de las dos páginas públicas y elimina el estado de preparación.

## Impact

`apps/web/src/pages/LegalPage.tsx` y el delta de `paginas-legales`. Los datos operativos de región, logs, borrado y ausencia de respaldos proceden de las declaraciones explícitas del usuario; se publican como contenido, sin implementar envío de logs ni borrado programado. No requiere dependencias, tablas o endpoints nuevos.
