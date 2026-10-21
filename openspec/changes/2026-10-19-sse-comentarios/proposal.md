# Proposal

## Why

Las páginas públicas del foro no reflejan comentarios creados por otras personas hasta una relectura o acción posterior. SSE permitirá avisar a las vistas activas para que consulten el estado público autoritativo, sin sondeo periódico ni incluir contenido del comentario en el evento.

## What Changes

- Añadir una conexión SSE pública, limitada a la lista y vista de hilo del foro, para eventos mínimos `comment.created` que contienen únicamente `rootId`.
- Tras un evento que afecta la vista, consultar una vez el endpoint REST público existente; en el hilo solo refrescar si el `rootId` coincide.
- Al reconectar EventSource, realizar una sola lectura REST puntual para ponerse al día; no añadir polling, fallback de sondeo, replay ni persistencia de eventos.
- Emitir únicamente después de que la publicación y su transacción se hayan completado con éxito; cerrar la conexión al abandonar/cerrar la vista y usar heartbeat compatible con la plataforma.
- Mantener sin cambios la lectura GET pública, la autenticación y publicación POST, cookies y sesión; no añadir Redis, NOTIFY, tablas, dependencias o WebSockets.

## Capabilities

### New Capabilities

### Modified Capabilities
- `foro-retroalimentacion`: incorporar actualización automática y acotada a vistas activas mediante SSE y lectura REST puntual autoritativa, sin polling periódico ni cambios al contrato de acceso/publicación existente.

## Impact

- Backend Express: emisión post-commit y conexión SSE en el proceso único; consultas REST de lista e hilo existentes continúan como fuente de verdad.
- Frontend del listado y del hilo: conexión EventSource durante las vistas del foro, refresco puntual al evento/reconexión y limpieza al salir.
- Operación live conocida en Railway: proyecto `Truis`, servicio `exciting-empathy`, una réplica en `us-west2`, servicio con `sleepApplication: true` y dominio `blogabet.up.railway.app`. Los lectores SSE mantendrán activo el servicio mientras haya conexiones y Railway podrá dormirlo al quedar inactivo.
- No se cambia la spec principal `despliegue` de Koyeb ni se incorpora dependencia o esquema persistente.
