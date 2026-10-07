# Spec Delta

## Purpose

Definir una presentación frontend editorial, coherente y adaptable que facilite leer y explorar los recursos técnicos actuales de BlogDPC, sin añadir funcionalidades ni cambiar contenido, datos o reglas de negocio.

## ADDED Requirements

### Requirement: Lenguaje visual editorial compartido

La interfaz SHALL conservar Inter local y un único lenguaje visual compartido: fondo `#F8F9FA`, superficies `#FFFFFF`, texto `#1A252C`, color principal `#0077B6` y separadores `#D9E4EA`. El cian `#00B4D8` SHALL limitarse a acentos que satisfagan el contraste exigible; los colores semánticos de error/éxito y los colores categóricos del grafo SHALL conservar funciones diferenciadas. La interfaz SHALL evitar degradados grandes, colores arbitrarios por módulo, sombras repetidas como decoración y tarjetas para cada párrafo.

El texto principal de lectura SHALL usar 17 px equivalentes a zoom del 100 %, interlineado entre 1,7 y 1,8 y alineación izquierda sin justificado. Cuando exista espacio suficiente, el contenedor de párrafos SHALL tener una medida máxima entre 65 y 72 `ch`; los recursos técnicos SHALL poder usar un ancho mayor sin ensanchar los párrafos. El espaciado de composición SHALL seguir una escala de 8/16/24/32/48 px, con radios moderados y sombras reservadas principalmente a overlays. Los controles y metadatos SHALL mantener una jerarquía tipográfica legible, no necesariamente el tamaño de los párrafos.

#### Scenario: Lectura y exploración en una pantalla amplia
- **WHEN** un visitante abre un módulo a 1440 px de ancho y zoom del 100 %
- **THEN** los párrafos usan la medida e interlineado establecidos, el recurso técnico puede ocupar más ancho y ambos comparten tipografía, colores y ritmo de espaciado

#### Scenario: Lenguaje visual sin decoración por módulo
- **WHEN** un visitante recorre módulos y flujos auxiliares
- **THEN** las superficies, campos, botones y separadores son coherentes, las señales de error/éxito permanecen diferenciadas y los clústeres del grafo no pierden sus colores categóricos distinguibles

### Requirement: Shell compacto con navegación y cuenta diferenciadas

La cabecera SHALL presentar identidad, navegación y cuenta como grupos distinguibles, conservar su comportamiento sticky y todos los destinos y acciones existentes. El estado de la ruta activa SHALL ser perceptible por forma o énfasis y contraste además de color. Los menús desktop/móvil SHALL conservar apertura, cierre, selección de destinos, controles de cuenta y visibilidad administrativa según el estado existente de sesión. El banner de conexión/sesión y el footer SHALL conservar mensajes y enlaces actuales. La ruta `/` SHALL seguir conduciendo a `/planeacion`; el foro SHALL permanecer una sección independiente.

#### Scenario: Cambio de módulo desde el menú móvil
- **WHEN** un visitante abre el menú a 360 px de ancho y elige un módulo
- **THEN** el destino conserva su ruta, el menú se cierra como antes y la ubicación activa se distingue sin depender solo del color

#### Scenario: Cuenta y degradación conservadas
- **WHEN** cambia el estado existente de cuenta o de conectividad
- **THEN** la cabecera conserva las acciones correspondientes y el banner muestra el mensaje actual, sin generar nuevos estados de sesión ni ocultar la lectura disponible

### Requirement: Adaptación sin desbordamiento global

La interfaz SHALL conservar lectura, controles y acciones a 360/768/1440 px de ancho y con zoom del 200 %. La página SHALL carecer de desbordamiento horizontal global; tablas y fórmulas intrínsecamente anchas SHALL admitir scroll horizontal local, accesible por teclado, sin clipping de información. Los menús y diálogos SHALL mantenerse dentro del viewport y permitir acceder a sus acciones cuando la altura disponible sea reducida. Las composiciones en columnas SHALL apilarse cuando no quepan, preservando el orden lógico de lectura y foco.

#### Scenario: Móvil y ampliación
- **WHEN** se recorren las vistas representativas a 360/768/1440 px y luego con zoom del 200 %
- **THEN** el ancho desplazable del documento no supera el viewport en más de 1 px de redondeo, no se pierde contenido ni acciones y solo los recursos anchos designados requieren scroll horizontal local

#### Scenario: Overlay con poco espacio vertical
- **WHEN** se abre un menú o un diálogo con zoom del 200 %
- **THEN** su contenido y sus acciones de cierre/confirmación se alcanzan sin salir del viewport ni quedar tapados por la cabecera

### Requirement: Movimiento reactivo rápido y no decorativo

Toda animación o transición con movimiento visible incluida en el rediseño SHALL durar entre 120 y 160 ms, sin retraso artificial. La presentación SHALL usar dos duraciones semánticas: rápido de 120 ms y normal de 160 ms. El feedback de apertura/cierre de menú o diálogo, expansión del glosario y selección/restablecimiento del mapa SHALL ser inmediato o usar estas duraciones, sin retrasar lectura, foco ni actualización de datos.

El movimiento de cámara, zoom e inercia del mapa que tenga interpolación temporal SHALL cumplir el mismo rango; ningún reset SHALL conservar una duración de 350 ms. La interfaz SHALL evitar parallax, partículas, pulsos permanentes, revelado de cada sección al hacer scroll, hover exagerado y contadores interpolados con valores ficticios. Los indicadores de carga SHALL conservar su significado y mensajes existentes sin pulsos permanentes. No SHALL añadirse un vuelo de cámara u otra interacción nueva al seleccionar un término.

#### Scenario: Apertura y cierre rápidos
- **WHEN** se abren y cierran menús o diálogos, se expande un término o se restablece el mapa sin preferencia de movimiento reducido
- **THEN** las animaciones visibles terminan en 120–160 ms con delay de 0 ms, las acciones y el foco no esperan a la animación y los valores mostrados son los reales

#### Scenario: Cámara y carga sin duraciones residuales
- **WHEN** se carga el mapa, se restablece o se usan sus gestos de zoom/desplazamiento
- **THEN** la interpolación temporal que exista respeta 120–160 ms, no queda un reset de 350 ms y los estados de carga no muestran pulsos permanentes

### Requirement: Movimiento reducido también en la cámara

Con `prefers-reduced-motion: reduce`, la interfaz SHALL eliminar o minimizar a como máximo 1 ms las transiciones/animaciones, eliminar desplazamientos decorativos y evitar scroll suave. El mapa SHALL aplicar la preferencia a su lógica de cámara y gestos, no únicamente a CSS: encuadre inicial, reset, zoom e inercia SHALL evitar recorridos animados perceptibles y conservar los destinos y controles. La preferencia SHALL responder a cambios durante la sesión; el movimiento en curso SHALL detenerse o resolverse sin continuar su recorrido interpolado.

#### Scenario: Preferencia activa al entrar
- **WHEN** un visitante con movimiento reducido abre un menú, expande el glosario o carga/restablece el mapa
- **THEN** obtiene el mismo contenido y estado final sin desplazamientos animados perceptibles, incluidos los del canvas del mapa

#### Scenario: Cambio durante una animación
- **WHEN** se activa movimiento reducido mientras la cámara o un overlay está animándose
- **THEN** no continúa la interpolación perceptible, se conserva una vista válida y la siguiente interacción aplica la preferencia sin recargar la página

### Requirement: Flujos auxiliares y estados existentes sin ampliación funcional

Autenticación, administración y legales SHALL compartir jerarquía de lectura, campos, botones, acción primaria, errores y tratamiento de acciones destructivas. La interfaz SHALL conservar textos, enlaces, valores ingresados, condiciones de visibilidad/deshabilitado, anuncios accesibles, confirmaciones y acciones actuales. La consistencia visual no SHALL alterar permisos, validación, texto plano, sesión, caché, endpoints, seguridad ni secuencia de autenticación.

Los estados de carga, vacío, error, éxito y pendiente SHALL recibir tratamiento coherente solo donde ya existan, usando sus mensajes actuales. Un estado no implementado o una necesidad de copy nueva MUST identificarse para consultar al usuario antes de incorporarse; no SHALL añadirse para completar una matriz genérica. Los avisos legales y editoriales pendientes SHALL seguir siendo pendientes, no documentos o materiales disponibles.

#### Scenario: Formulario con errores y operación en curso
- **WHEN** un formulario auxiliar entra en un estado actual de validación fallida o envío pendiente
- **THEN** conserva los mensajes y asociaciones a campos, la acción primaria y sus condiciones de deshabilitado, sin nuevas validaciones ni peticiones

#### Scenario: Confirmación administrativa
- **WHEN** un administrador solicita una acción destructiva existente
- **THEN** sigue siendo necesario confirmar en el diálogo actual, con copy y efecto originales, y la acción se distingue por etiqueta y tratamiento visual además del color

#### Scenario: Estado pendiente o no implementado
- **WHEN** se presenta un aviso pendiente actual o la revisión detecta un estado que la vista no ofrece
- **THEN** el aviso conserva su texto y significado, y el estado ausente se registra para consulta antes de cualquier incorporación, sin inventar mensajes ni funciones
