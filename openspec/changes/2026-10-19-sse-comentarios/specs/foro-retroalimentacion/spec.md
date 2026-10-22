# Spec Delta

## ADDED Requirements

### Requirement: Actualización de comentarios en vistas activas mediante SSE

El foro SHALL ofrecer un stream SSE público para las vistas activas de listado e hilo, sin requerir sesión ni cambiar el requisito de autenticación de publicación. Tras el commit exitoso de una nueva publicación, SHALL emitir un evento `comment.created` cuyo único dato de aplicación sea `rootId`; SHALL NOT incluir el texto, cuerpo ni otros datos del comentario. Al recibir un evento, la lista SHALL realizar una sola consulta puntual al endpoint REST público existente para actualizar su lectura autoritativa; un hilo SHALL realizarla únicamente cuando el `rootId` recibido coincida con la raíz de ese hilo. Al reconectar un stream que ya se había establecido, cada vista activa SHALL realizar exactamente una consulta REST puntual para ponerse al día, sin replay de eventos. El cliente SHALL NOT usar polling periódico ni polling como fallback. La conexión SHALL limitarse a las vistas de lista/hilo y cerrarse al abandonarlas o al cerrar el cliente. El servidor SHALL mantener el stream con heartbeats compatibles con el proxy que no generen consultas ni eventos de comentario. El GET de lectura seguirá público y el POST, autenticación, sesión y cookies conservarán sus contratos vigentes.

#### Scenario: Publicación confirmada emite un aviso mínimo
- **WHEN** una publicación autorizada se confirma correctamente en la base de datos
- **THEN** se emite después del commit un `comment.created` con `rootId` como único dato de aplicación y sin texto/cuerpo; una publicación rechazada o fallida no emite el evento

#### Scenario: Lista activa se actualiza ante una creación
- **WHEN** una lista pública del foro recibe un `comment.created`
- **THEN** realiza una sola consulta al endpoint REST público de lista y muestra el estado devuelto por el servidor, sin confiar en texto de comentario transportado por SSE

#### Scenario: Hilo activo filtra por su raíz
- **WHEN** una vista de hilo recibe un `comment.created` con `rootId` igual o distinto a la raíz consultada
- **THEN** solo ante coincidencia realiza una consulta puntual al endpoint REST público de ese hilo; ante otra raíz no hace una lectura ni modifica el hilo

#### Scenario: Reconexión recupera cambios sin replay
- **WHEN** EventSource restablece una conexión que ya había llegado a estar abierta después de una interrupción
- **THEN** la vista activa realiza exactamente una consulta REST puntual a su lectura autoritativa y no depende de replay, persistencia de eventos ni polling

#### Scenario: Alcance y cierre de la conexión
- **WHEN** una persona entra a la lista o a un hilo del foro y luego abandona esa vista o cierra el cliente
- **THEN** el stream solo permanece abierto mientras esa vista está activa y se cierra al salir; sus heartbeats mantienen el transporte sin refrescar datos

#### Scenario: Acceso público y publicación autenticada sin cambios
- **WHEN** una persona anónima consulta la lista, el hilo o el stream, o intenta publicar
- **THEN** la lectura y el stream permanecen públicos y el POST conserva el requisito actual de sesión activa con correo verificado
