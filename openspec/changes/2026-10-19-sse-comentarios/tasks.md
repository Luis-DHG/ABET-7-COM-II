# Tasks

## 1. Transporte SSE y emisión post-commit

- [x] 1.1 Añadir el broadcaster efímero de una instancia y el stream SSE público con heartbeats y liberación al cerrar la respuesta; verificar con pruebas que una conexión anónima recibe `comment.created` con solo `rootId`, que el heartbeat no es un evento de comentario y que cerrar el stream elimina el listener.
- [x] 1.2 Emitir desde el flujo HTTP solo después de que la publicación transaccional haya concluido; probar que una publicación confirmada emite una vez y una publicación rechazada o con rollback no emite, y que GET público y POST autenticado conservan sus contratos.

## 2. Suscripciones del listado e hilo

- [x] 2.1 Conectar la lista al stream solo mientras su vista esté activa, refrescar una vez por evento con el GET público existente y una vez al reconectar después de la apertura inicial; verificar conteos de GET, estado autoritativo, ausencia de polling/fallback y cierre al navegar fuera.
- [x] 2.2 Conectar el hilo al stream solo mientras esté activo, filtrar por `rootId` y consultar una vez el GET de ese hilo solo cuando coincide; verificar que raíces ajenas no hacen requests ni alteran el hilo, que la reconexión hace una sola lectura y que abandonar/cambiar el hilo cierra la conexión y descarta respuestas tardías.
- [ ] 2.3 Verificar que las lecturas disparadas por SSE preservan caché, paginación, publicaciones recientes, borradores y estado de lectura ante respuestas fuera de orden; ejecutar las pruebas del foro y verificar que no se introdujeron polling, replay ni persistencia.

## 3. Verificación de operación live

- [ ] 3.1 Validar el flujo completo tras desplegar en el Railway live actual: evento post-commit, stream y heartbeat sin buffering/corte prematuro, recuperación mediante una lectura tras reconexión, cierre al abandonar las vistas y `sleepApplication` conservado cuando no hay lectores; registrar cualquier limitación si la topología deja de ser una sola réplica.
