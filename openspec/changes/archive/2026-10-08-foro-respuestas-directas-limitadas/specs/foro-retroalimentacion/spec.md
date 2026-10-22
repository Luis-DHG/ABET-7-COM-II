# Spec Delta

## REMOVED Requirements

### Requirement: Anidamiento máximo de seis niveles

**Reason**: La regla aprobada limita la cantidad de respuestas directas a seis, no la profundidad a seis niveles. Ninguna respuesta admite nuevas respuestas.

**Migration**: Aplicar la nueva política únicamente a nuevas publicaciones; conservar lectura, estructura y destinos de los comentarios históricos, sin borrar, ocultar ni reparentar nodos para adaptarlos a la regla.

## ADDED Requirements

### Requirement: Nuevas respuestas solo a comentarios raíz

Las nuevas publicaciones SHALL tener profundidad máxima 2: raíz de nivel 1 o respuesta directa de nivel 2. Una publicación con padre SHALL aceptarse únicamente si el padre identifica un comentario raíz; cualquier intento de responder a una respuesta, incluida una respuesta histórica, SHALL rechazarse también mediante petición directa a la API. Los límites de nuevas publicaciones SHALL ser compartidos entre backend y frontend.

#### Scenario: Nueva raíz y respuesta directa
- **WHEN** un autor autorizado y fuera de cooldown publica sin padre o responde a una raíz con cupo disponible
- **THEN** se crea respectivamente una raíz de nivel 1 o una respuesta de nivel 2 con esa raíz como padre

#### Scenario: Respuesta a una respuesta
- **WHEN** un autor autorizado y fuera de cooldown intenta publicar usando como padre una respuesta de cualquier profundidad, incluso vía API directa
- **THEN** la API rechaza la publicación con un error de conflicto que explica que solo se responde a comentarios raíz y no crea un nuevo nodo

### Requirement: Cupo atómico de seis respuestas directas por raíz

Cada raíz SHALL admitir como máximo seis nodos de respuesta directa totales. El conteo SHALL incluir los nodos retirados por moderación y excluir los descendientes indirectos históricos; retirar una respuesta SHALL NOT liberar cupo. La comprobación del cupo y la publicación SHALL ser atómicas entre autores concurrentes. Una raíz con seis o más respuestas directas existentes SHALL rechazar nuevas respuestas sin modificar su historial. La nueva regla SHALL conservar la autorización vigente y el cooldown transaccional de 30 segundos por autor; una publicación rechazada por esta regla SHALL NOT crear un comentario ni consumir un nuevo cooldown.

#### Scenario: Sexta respuesta aceptada y séptima rechazada
- **WHEN** una raíz tiene cinco respuestas directas y autores autorizados y fuera de cooldown envían una sexta y luego una séptima
- **THEN** se acepta la sexta y se rechaza la séptima con un error de conflicto que explica el máximo de seis respuestas directas

#### Scenario: Dos autores compiten por el último cupo
- **WHEN** dos autores distintos, autorizados y fuera de cooldown, publican simultáneamente sobre una raíz con cinco respuestas directas
- **THEN** exactamente una respuesta se acepta, la otra se rechaza por cupo y el total final es seis

#### Scenario: Moderación no permite reemplazos
- **WHEN** una raíz tiene seis respuestas directas y una o varias están retiradas
- **THEN** una nueva respuesta se rechaza porque los seis nodos siguen ocupando cupo

#### Scenario: Cupo en una raíz con descendientes históricos
- **WHEN** una raíz tiene cinco respuestas directas y descendientes históricos indirectos, y un autor autorizado y fuera de cooldown responde a la raíz
- **THEN** se acepta su sexta respuesta directa sin contar los descendientes indirectos ni modificar sus relaciones

#### Scenario: Autorización y cooldown preservados
- **WHEN** un visitante sin sesión, un usuario sin correo verificado, un usuario suspendido o un autor aún en cooldown intenta publicar
- **THEN** se conserva el rechazo correspondiente de autenticación, autorización o cooldown y no se añade ningún nodo, aunque la raíz tenga cupo

## MODIFIED Requirements

### Requirement: Interfaz de respuesta coherente con el cupo

La interfaz SHALL ofrecer Responder únicamente en un comentario raíz no retirado, con menos de seis respuestas directas y con participación habilitada por el estado de sesión y red vigente. SHALL NOT ofrecer esa acción ni habilitar su envío en respuestas de ninguna profundidad histórica, ni en raíces con el cupo agotado. Tanto listado como hilo SHALL usar los límites compartidos y contar también las respuestas retiradas. El copy funcional de participación y errores SHALL explicar que solo se responde a la raíz y que admite hasta seis respuestas directas, sin anunciar nuevos niveles anidados. La API SHALL seguir siendo la autoridad ante datos desactualizados.

La revalidación SHALL preservar la última publicación aceptada y la lectura útil: una respuesta antigua SHALL NOT eliminar ese nodo, reabrir su cupo ni sustituir una lectura más reciente. Si cambia el hilo consultado o se abandona la vista, una lectura pendiente de la vista anterior SHALL NOT actualizar el hilo, sus estados de lectura o sus anuncios. Un fallo de revalidación SHALL conservar lectura, borrador y sesión, usando los estados y mensajes de error/degradación existentes, sin rechazos no capturados ni publicaciones ficticias.

#### Scenario: Acciones en raíz, respuestas y cupo completo
- **WHEN** una persona habilitada para publicar ve una raíz con cinco respuestas directas y sus respuestas históricas en el listado o en el hilo
- **THEN** solo la raíz ofrece Responder; al alcanzar seis respuestas directas deja de ofrecerlo y cualquier formulario ya abierto deja de permitir el envío

#### Scenario: Caché desactualizada y conflicto concurrente
- **WHEN** la interfaz muestra cupo disponible pero la API rechaza por cupo agotado una publicación que compitió con otro autor
- **THEN** muestra el motivo, no incorpora una respuesta ficticia, conserva borrador y sesión, y solicita revalidar la lectura para reflejar la elegibilidad actual sin borrar el contenido útil si la red falla

#### Scenario: Sexta respuesta publicada desde la interfaz
- **WHEN** la API acepta la sexta respuesta directa desde el listado o el hilo
- **THEN** la lectura y la caché reflejan el nodo publicado y la raíz deja de permitir nuevos envíos, sin alterar cursor ni páginas cargadas

#### Scenario: Revalidación anterior resuelta después del sexto éxito
- **WHEN** una lectura iniciada antes de aceptar la sexta respuesta se resuelve después de ese éxito o después de una lectura más reciente
- **THEN** no elimina la respuesta aceptada, no vuelve a habilitar el envío ni sobrescribe la lectura vigente; se conservan el árbol y las páginas/cursor del listado

#### Scenario: Lectura pendiente de un hilo abandonado
- **WHEN** una lectura inicial o revalidación pendiente se resuelve o rechaza después de cambiar de hilo o abandonar la vista
- **THEN** no actualiza el hilo nuevo ni sus estados de carga/error o anuncios y no provoca un rechazo no capturado

#### Scenario: Fallo de red al revalidar un hilo legible
- **WHEN** una revalidación por conflicto o publicación falla con un hilo ya disponible
- **THEN** se mantienen la última lectura útil, la publicación aceptada si existe, el borrador y la sesión, y el fallo se refleja mediante el tratamiento accesible existente sin vaciar el árbol ni habilitar un cupo ya rechazado

### Requirement: Integridad del historial

La moderación SHALL ocultar comentarios mediante borrado lógico conservando sus descendientes. Los usuarios no dispondrán de edición ni borrado de comentarios. La política de nuevas publicaciones SHALL conservar los comentarios históricos multinivel, sus padres, profundidades, orden y enlaces: SHALL NOT borrarlos, ocultarlos ni reparentarlos para simular un modelo plano. El listado SHALL mantener raíces y respuestas directas, incluidas las retiradas, y la vista enfocada SHALL mantener el árbol histórico completo legible. Las raíces históricas con seis o más respuestas directas SHALL permanecer legibles con todos sus nodos, pero sin admitir nuevas respuestas.

#### Scenario: Moderación con respuestas
- **WHEN** se modera un comentario que tiene respuestas
- **THEN** el comentario se oculta y sus descendientes permanecen

#### Scenario: Lectura de una rama histórica de seis niveles
- **WHEN** un visitante abre una conversación preexistente con comentarios hasta nivel 6 y navega a una ancla histórica
- **THEN** el hilo conserva todos los nodos, relaciones, niveles, orden y destino de la ancla; las respuestas no ofrecen nuevas respuestas

#### Scenario: Raíz histórica con más de seis respuestas directas
- **WHEN** se consulta una raíz preexistente con siete o más respuestas directas
- **THEN** se muestran todas en el orden vigente y la API rechaza nuevas respuestas a esa raíz sin recortar el historial
