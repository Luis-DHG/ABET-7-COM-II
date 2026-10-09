# Foro de retroalimentación Specification

## Purpose

Foro público y dinámico, única sección editorial dinámica del sitio, para recoger retroalimentación de los visitantes sobre los módulos.

## Requirements

### Requirement: Publicación autenticada
La lectura del foro SHALL ser pública. Publicar un comentario SHALL requerir sesión activa con correo verificado.

#### Scenario: Visitante sin sesión
- **WHEN** un visitante sin autenticación intenta publicar
- **THEN** la publicación se rechaza y la lectura permanece disponible

### Requirement: Texto plano acotado
El texto del comentario SHALL ser texto plano de entre 3 y 2000 caracteres, sin interpretar HTML ni Markdown.

#### Scenario: Contenido con etiquetas
- **WHEN** se envía un comentario que incluye etiquetas HTML
- **THEN** se publica como texto plano, sin ejecutarse como marcado

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

### Requirement: Orden y paginación por cursor
El listado principal SHALL mostrar raíces y respuestas directas, con raíces ordenadas por `created_at DESC, id DESC` y respuestas por `created_at ASC, id ASC`; la conversación completa se consulta en la vista enfocada del hilo. La paginación SHALL usar cursor compuesto, sin `OFFSET`.

#### Scenario: Continuar el listado
- **WHEN** el visitante carga la siguiente página del foro
- **THEN** la petición usa el cursor compuesto y conserva el orden establecido

### Requirement: Cooldown transaccional
Publicar SHALL aplicar un cooldown transaccional de 30 segundos por autor en PostgreSQL.

#### Scenario: Publicación seguida
- **WHEN** un autor publica dos comentarios en menos de 30 segundos
- **THEN** el segundo se rechaza por cooldown

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

### Requirement: Suspensión preserva la lectura
Un usuario suspendido SHALL poder iniciar sesión y leer el foro, y SHALL quedar impedido de publicar.

#### Scenario: Usuario suspendido
- **WHEN** un usuario suspendido inicia sesión y visita el foro
- **THEN** puede leer conversaciones y la publicación le queda bloqueada

### Requirement: Legibilidad del árbol con sangría visual acumulada acotada

La presentación del foro SHALL distinguir raíces y respuestas por jerarquía, guías visuales y relación con el padre donde actualmente se muestra, sin depender solo de color. Autor, fecha, mensaje y acciones existentes SHALL permanecer legibles, con mensajes en texto plano y sus saltos de línea conservados. La sangría visual acumulada entre la raíz y el nivel 6 SHALL ser como máximo 32 px en móvil de ancho efectivo inferior a 768 px y 48 px desde 768 px; el límite SHALL aplicarse a la suma de sangrías/bordes/paddings anidados, no solo a cada comentario por separado.

El rediseño SHALL conservar todo el historial hasta seis niveles, su orden, padres, descendientes y enlaces a hilo/anclas, sin borrar, ocultar, truncar ni reparentar nodos para aplanarlo. El comentario retirado SHALL conservar su tratamiento y descendientes, sin añadir edición ni borrado. A 360 px, el área útil del cuerpo de un comentario histórico de nivel 6 SHALL mantener al menos 240 px de ancho y permitir leer y accionar las acciones disponibles sin overflow horizontal global.

Las ediciones puramente visuales SHALL conservar las condiciones de responder y las acciones de publicación/cancelación, y SHALL NOT añadir etiquetas o mensajes por motivos visuales. Al integrar ambos changes aprobados, la elegibilidad y el copy funcional de nuevas publicaciones SHALL regirse exclusivamente por `foro-respuestas-directas-limitadas`: respuestas solo a raíz, profundidad máxima de escritura 2 y hasta seis respuestas directas totales por raíz, incluidas las retiradas. Esa política SHALL permanecer fuera del scope visual; conservar el historial hasta seis niveles SHALL NOT autorizar nuevas publicaciones multinivel ni impedir los ajustes funcionales aprobados.

#### Scenario: Conversación completa de seis niveles en móvil
- **WHEN** se abre un hilo histórico con comentarios en los niveles 1 a 6 a 360 px de ancho
- **THEN** la sangría acumulada no supera 32 px, el mensaje más profundo tiene al menos 240 px de ancho útil y autor, fecha y acciones disponibles son legibles sin desplazar horizontalmente la página

#### Scenario: Nivel máximo y comentario retirado
- **WHEN** se presenta una rama histórica que llega al nivel 6 y contiene un comentario retirado con descendientes
- **THEN** el nivel 6 sigue sin ofrecer respuesta, se conservan el aviso actual y los descendientes del retirado y no aparecen acciones nuevas

#### Scenario: Listado y vista enfocada conservados
- **WHEN** un visitante pasa del listado a una conversación profunda y a una ancla de comentario
- **THEN** se mantienen raíces/respuestas directas en el listado, el árbol completo en el hilo, el orden y destinos actuales, con foco y comentario de destino visibles bajo la cabecera

### Requirement: Composer claro blanco y azul sin cambios funcionales

Los composers existentes de comentario raíz y respuesta SHALL compartir superficie blanca, borde azul sobrio, padding cómodo y foco visible con contraste AA, usando el sistema claro del MVP y sin sombras llamativas. Su feedback visual SHALL ser inmediato o usar el token rápido de 120 ms, y con movimiento reducido SHALL ser inmediato o de como máximo 1 ms. El cambio SHALL limitarse a presentación local y SHALL NOT modificar los otros formularios, inputs globales o handlers funcionales.

SHALL conservar labels y copy existentes, filas del campo, texto plano, contador, límites y validaciones actuales, errores y sus asociaciones/anuncios, cooldown, envío pendiente, permisos, elegibilidad, Cancelar y comportamiento del borrador. La dirección blanca y azul SHALL NO ocultar la semántica de error ni cambiar condiciones de deshabilitado, requests o secuencias de publicación. Las respuestas nuevas SHALL seguir limitadas a raíz con cupo, sin confundir el historial multinivel con permiso de publicación.

#### Scenario: Comentario y respuesta con la misma dirección clara
- **WHEN** una persona habilitada abre el composer de comentario y el de respuesta a una raíz con cupo y los recorre por teclado
- **THEN** ambos muestran superficie blanca, borde azul sobrio, padding cómodo y foco visible sin sombras llamativas, manteniendo sus labels, filas, contador y acciones actuales

#### Scenario: Error y cancelación conservados bajo ambos modos de movimiento
- **WHEN** el composer recibe un error existente, queda deshabilitado por una condición actual o se cancela una respuesta, con preferencia normal o reducida
- **THEN** conserva mensajes, anuncios, contador, borrador y efecto de Cancelar conforme al comportamiento previo, la semántica de error sigue diferenciada y el feedback visual cumple 120 ms o reduce de como máximo 1 ms sin cambiar validaciones, permisos o peticiones
