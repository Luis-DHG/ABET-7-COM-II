# Design

## Context

See `proposal.md` and `specs/foro-retroalimentacion/spec.md` for the motivation and behavior contract. La API Express ya expone lectura pública de lista e hilo y un POST autenticado. El módulo de publicación espera a que su transacción PostgreSQL termine antes de devolver el comentario. Las vistas de lista e hilo ya tienen mecanismos de cache, cancelación/alcance de lecturas y protección frente a respuestas tardías. La app sirve web y API en el mismo origen.

La operación live conocida es Railway: proyecto `Truis`, servicio `exciting-empathy`, fuente `Luis-DHG/ABET-7-COM-II@dev_content`, una réplica en `us-west2`, `sleepApplication: true` y dominio `blogabet.up.railway.app`. Los lectores SSE mantendrán despierto el servicio mientras existan conexiones; se conserva el sleep cuando queda inactivo. La spec principal `despliegue` sigue describiendo Koyeb y no se modifica en este change. `context.md` todavía excluye la sincronización en tiempo real del MVP; la solicitud aprobada establece una excepción deliberadamente limitada al foro y a SSE, sin habilitar push o sincronización para otras capacidades.

## Goals / Non-Goals

**Goals:**
- Avisar a lectores activos de nuevas publicaciones y obtener el estado autoritativo mediante los GET públicos existentes.
- Mantener el transporte efímero y simple para la topología actual de un proceso, con recuperación puntual tras desconexión.
- Mantener la lectura abierta, sin cambiar autenticación, autorización, cookies ni el contrato de publicación.

**Non-Goals:**
- Replay, almacenamiento de eventos, outbox, polling periódico, polling de base de datos o fallback periódico.
- Redis, PostgreSQL `NOTIFY`, nuevas tablas/dependencias, WebSockets u otra infraestructura distribuida.
- Cambios a autenticación/publicación REST, al esquema de comentarios, al despliegue Railway o a la spec principal `despliegue`.
- Actualización en tiempo real fuera de la lista y el hilo del foro.

## Decisions

1. **Broadcaster en memoria en el único proceso.** Crear una instancia compartida por la aplicación Express para registrar conexiones y emitir nuevos `rootId`. El POST invoca la emisión solo después de que la llamada transaccional de publicación haya terminado con éxito y el servidor haya recibido el comentario persistido; no emitir dentro del callback transaccional. Así un rollback o un error nunca anuncia una publicación inexistente. Un hub in-memory evita estado adicional y coincide con la única réplica live actual. Usar un broker compartido fue considerado y descartado mientras la topología siga siendo de una réplica.

2. **El stream comunica invalidación, no contenido.** Exponer un stream SSE público junto a los recursos de comentarios. Cada mensaje usa el evento `comment.created` y contiene únicamente `rootId`, sin cuerpo, autor, texto ni otros campos. No asignar identificadores con historial ni conservar eventos para replay. Los headers y el envío de heartbeats deben mantener el stream abierto a través del proxy; el heartbeat es un comentario SSE de transporte, no un evento de dominio. SSE fue elegido frente a WebSockets por su flujo unidireccional y frente a polling por no hacer consultas periódicas.

3. **REST continúa siendo la autoridad y cada señal causa una lectura puntual.** La lista consulta el GET público de lista una vez por evento. El hilo compara `rootId` y solo para su propia raíz consulta una vez el GET público de ese hilo. El cliente usa la reconexión automática de EventSource; después de la primera apertura, una nueva apertura tras una interrupción dispara exactamente una consulta REST para la vista activa. La apertura inicial no duplica la lectura inicial existente. No hay replay porque una sola lectura autoritativa al reconectar cubre el intervalo perdido; no se incorpora polling de respaldo.

4. **Conexión de alcance local a la vista.** Abrir EventSource solo en el componente/vista de lista o hilo y cerrarlo al desmontar, cambiar de ruta o cerrar la página. El cierre/aborto del cliente debe liberar el listener en el servidor. El stream es público como las lecturas y no debe pasar por la autenticación del POST. Las señales solo disparan las lecturas REST; no se altera el contrato de sesión ni se confía en los datos del evento para modificar comentarios.

5. **Conservar las protecciones de lectura existentes.** Las peticiones iniciadas por evento o reconexión deben usar el alcance/ciclo de lectura vigente y cancelar o descartar resultados de vistas abandonadas o reemplazadas. La respuesta REST actualiza la cache/paginación con las mismas salvaguardas que ya impiden que una lectura antigua borre una publicación reciente. Una respuesta a un POST puede seguir aplicándose desde su resultado; SSE no la sustituye como confirmación de la publicación propia.

6. **Aceptar el coste temporal de mantener Railway activo.** Mientras haya lectores, heartbeats compatibles con el proxy mantienen la conexión y el servicio despierto; al salir el último lector, se cierran streams y se conserva `sleepApplication: true`. Se descarta desactivar el sleep o crear un servicio separado: no es necesario para el alcance aprobado.

## Risks / Trade-offs

- [Si se aumenta a más de una réplica, el proceso que recibe el POST puede no ser el proceso que mantiene al lector SSE y el evento en memoria no llegará a ese lector] → documentar una sola réplica como precondición de esta solución; antes de escalar, introducir y diseñar distribución compartida de eventos. La solución multi-réplica queda fuera de alcance actual.
- [Una interrupción puede perder eventos mientras la conexión está abajo] → EventSource reconecta y la vista realiza una lectura REST puntual; no se necesita retener eventos.
- [Un proxy puede cerrar o almacenar en buffer un stream inactivo] → enviar headers SSE adecuados y heartbeat periódico compatible con Railway; comprobar conexión, reconexión y cierre contra el dominio live.
- [Con lectores activos el servicio Railway no puede dormir y el heartbeat consume tráfico] → coste aceptado por el usuario; abrir conexiones solo en vistas del foro, liberar al salir y conservar el sleep al quedar inactivo.
- [Una lectura tardía puede sobrescribir una vista nueva o el resultado de un POST] → reutilizar la cancelación y protección por ciclo/versión de lectura del listado e hilo y probar eventos con navegación concurrente.
- [Una conexión SSE fallida podría tentar a añadir polling como degradación] → no añadir fallback; conservar el último contenido legible y los mecanismos manuales/de red actuales, sin consultas periódicas.

## Migration Plan

- No se requieren migraciones, nuevos datos persistentes ni cambios a las cookies o variables de Railway.
- Desplegar el endpoint SSE y los consumidores de lista/hilo como una sola versión del servicio de mismo origen. Confirmar desde el dominio live emisión post-commit, heartbeats, reconexión con una lectura puntual y cierre al abandonar la vista; observar que el servicio puede dormir cuando no hay lectores.
- Para revertir, retirar la suscripción SSE del cliente y la ruta/emisión del servidor; los GET públicos y el POST autenticado continúan funcionando sin cambio. No hay eventos almacenados que limpiar.
