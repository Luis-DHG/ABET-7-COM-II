# Design

## Context

La motivación y el alcance aprobado están en `proposal.md`. Este diseño aplica a sus cuatro deltas, no a una reconstrucción de la aplicación. La exploración fue de solo lectura y contrastó las seis specs pertinentes completas: módulos, sesión web, foro, autenticación, administración y legales.

### Estado observado y puntos de intervención

| Área | Fuentes actuales | Consecuencia técnica |
|---|---|---|
| Stack y tokens | `apps/web/package.json`, `components.json`, `src/index.css` | React 19, Vite, Tailwind 4, shadcn/Radix, Inter local y paleta ya disponibles; extender la capa actual |
| Shell | `components/AppShell.tsx` | Cabecera sticky de 56 px, menú desktop desde `md`, Sheet móvil, cuenta, banner y footer compartidos |
| Editorial | `components/ModuleLayout.tsx`, `pages/moduleContent.tsx`, `lib/manifest.ts` | Siete módulos con contenido; hero, índice abierto desde 768 px, glosario, foco de ruta/anclas y paginación ya operativos |
| Figuras | `SignalDiagram.tsx`, `ODDMDiagram.tsx`, `ReferenceFigure.tsx` | Los dos componentes denominados Diagram actualmente renderizan imágenes externas, no esquemas SVG propios; ReferenceFigure ya enlaza al activo para ampliar |
| Bibliometría | `BibliometricMap.tsx`, `BibliometricFindings.tsx`, sus wrappers Lazy | Sigma/Graphology, JSON local, coordenadas VOSviewer, selección/búsqueda/filtro/reset y resúmenes existentes; no cambiar transformación científica |
| OFDM y ecuaciones | `OfdmExplorer.tsx`, `lib/ofdm.ts`, `lib/formulas.ts` referenciado por las vistas, `Formula.tsx` | Controles nativos range y resultados síncronos; fórmulas cargadas con KaTeX como MathML, con TeX como fallback actual |
| Glosario | `Glossary.tsx`, `LazyGlossary.tsx` | Búsqueda y details nativos; mensaje de cero coincidencias y fallback de carga existentes |
| Foro | `pages/forum/{ForumPage,ThreadPage,CommentItem,CommentComposer}.tsx` | Árbol recursivo; el tope por nodo de sangría actual no limita la suma real de sangrías anidadas |
| Auxiliares | `pages/auth/*.tsx`, `pages/admin/{AdminCommentsPage,AdminUsersPage,ConfirmDialog,RequireAdmin}.tsx`, `LegalPage.tsx`, `StatusNotice.tsx` | AuthShell común, errores/éxitos existentes, confirmaciones y gating que deben conservarse |
| Pruebas existentes | `tests/{ofdm,formulas,forum-cache,session-refresh,session-race}.test.ts` | Harness `node:test`; se leyeron las pruebas de OFDM, fórmulas y caché para identificar invariantes y límites de los seams |

### Discrepancias preexistentes: no corregir en este change

1. `docs/context.md` §§1/3/4/11 y el resumen de `AGENTS.md` describen módulos vacíos. La spec principal `modulos-editoriales` y `moduleContent.tsx` ya contienen textos, imágenes, ecuaciones, bibliometría y exploración OFDM. El brief exige conservar este contenido; no vaciarlo ni corregir documentación ajena.
2. `paginas-legales` exige documentos completos; `LegalPage.tsx` muestra «Documento en preparación» y su aviso actual. Además, la spec menciona el foro en el footer, mientras el footer observado ofrece privacidad, términos y contacto. Se conserva la implementación actual y sus destinos; no se redactan textos legales ni se corrige este incumplimiento heredado bajo una tarea visual.
3. `moderacion-administracion` contempla suspender y reactivar; `AdminUsersPage.tsx` solo expone suspensión. No añadir reactivación ni rediseñar permisos/API para cerrar ese gap.
4. ODDMDiagram usa `/images/oddm-isac-paper.png` sin fuente/licencia en su componente. No se ha establecido permiso de modificación. Conservar archivo y copy; no inventar una atribución. SignalDiagram usa una figura externa atribuida CC BY 4.0; tampoco debe confundirse con un esquema propio.
5. `package.json` de la raíz no estuvo disponible: Read devolvió «File not found» y el listado de la raíz no lo incluyó. `pnpm-workspace.yaml` sí existe y usa `nodeLinker: hoisted`; se confirmó Sigma 3.0.3 en `node_modules/sigma/package.json`. Los scripts de verificación desde raíz declarados en las instrucciones deberán comprobarse al iniciar la implementación, sin crear/restaurar configuración fuera de alcance por iniciativa propia.

No se usan estas discrepancias para modificar specs principales, el change editorial previo ni producto. La comparación de conservación es contra lo observado, y no certifica que la aplicación ya cumpla todos los requisitos históricos.

## Goals / Non-Goals

**Goals:**

- Llevar los contratos de presentación a la capa CSS/primitivas existente, con intervenciones locales verificables y sin cambiar límites entre frontend, contratos y backend.
- Separar texto, unidad visual científica y recurso exploratorio para ajustar densidad sin introducir un segundo sistema de componentes.
- Proteger contenido y comportamiento mediante un inventario previo, pruebas de conservación y ciclos verticales con tester antes de cada cambio observable.
- Resolver el movimiento como una política compartida CSS/cámara, incluyendo los gestos nativos que una regla CSS global no controla.

**Non-Goals:**

- No tocar `apps/server`, `packages/contracts`, DB, migraciones, configuración de despliegue, gestión de sesión/HTTP/caché ni los handlers de autenticación o moderación. Un requerimiento que lo necesite obliga a detener la parte afectada y consultar.
- No rediseñar el modelo de datos, extraer un framework editorial, reemplazar Sigma/KaTeX/Radix ni instalar dependencias decorativas o de animación.
- No crear un estado ausente, un visor nuevo, un acordeón para prosa visible ni reformular copy para lograr simetría de diseño. Las exclusiones funcionales y editoriales restantes son las del proposal.

## Decisions

### 1. Una sola capa de tokens y primitivas

**Elección:** reutilizar variables de `:root`, el puente `@theme inline` y `components/ui`. Consolidar reglas editoriales duplicadas y ajustar clases en los consumidores; no introducir otro catálogo de botones/cards.

| Token o dimensión | Valor decidido | Uso |
|---|---|---|
| `--background` / `--card` / `--foreground` | `#F8F9FA` / `#FFFFFF` / `#1A252C` | Canvas, superficie y tinta existentes |
| `--primary` / `--border` | `#0077B6` / `#D9E4EA` | Acción, foco, enlaces y separadores |
| Acento cian | `#00B4D8` solo donde su contraste lo permita | Acentos limitados, nunca texto fino ni único indicador; conservar tintas de superficies actuales |
| Semántica | Mantener `--muted-foreground`, `--destructive`, `--success` y tintas existentes, verificando contraste | No reemplazar estados de error/éxito por azules indistinguibles |
| Fuente y lectura | Inter local; `1.0625rem` con raíz 16 px; line-height `1.75`; medida `68ch` | Párrafos editoriales y lectura legal; no aumentar automáticamente todos los labels a 17 px |
| Escala | Metadatos 13–14 px, controles 14–16 px, lectura 17 px, h3 20 px, h2 24–28 px, h1 fluido 32–48 px | Jerarquía deliberada; preservar zoom y wrapping, no comprimir la introducción para forzar altura |
| Espaciado de composición | 8/16/24/32/48 px | Gaps, padding y separación entre unidades; microespaciado de iconos/bordes no constituye otra escala de layout |
| Radios y sombras | Conservar base de 10 px y variantes moderadas | Superficies técnicas; sombra principalmente en overlays, no en cada unidad de lectura |
| `--motion-fast` / `--motion-normal` | `120ms` / `160ms` | Feedback local / apertura-cierre de overlays y cámara |
| Curva CSS | `ease-out`, delay `0ms` | Sin rebotes ni encadenado de demoras |

El texto principal se alinea a la izquierda. Los números de recursos usan cifras tabulares; no transformar todos los datos en tarjetas de dashboard. Comprobar estados normal/hover/activo/foco/deshabilitado; un color correcto en reposo no asegura el contraste del hover con opacidad.

**Alternativas:** un sistema visual paralelo aumenta drift y mantenimiento; estilos por módulo crean excepciones sin necesidad. Se descartan. Una abstracción nueva solo se extrae tras demostrar un segundo consumidor real; las primitivas ya compartidas son el punto de partida.

### 2. Shell compacto y editorial con dos anchos

**Elección:** conservar los 80 rem máximos y gutters de AppShell como ancho de exploración; mantener cabecera de 56 px, sin añadir una segunda barra. Separar grupos mediante gaps y alineación; permitir wrapping en cuenta/menús y usar el Sheet existente cuando el espacio efectivo sea móvil. Las rutas activas se señalan con el texto existente, atributo de ubicación cuando corresponda y borde/fondo/peso distinguible; no añadir un estado de progreso de usuario.

En ModuleLayout, mantener el DOM en orden ubicación → nombre → headline → introducción → metadatos. Reestilizar ModuleProgress como marcador de posición: solo la posición actual recibe énfasis, las restantes son neutrales, sin diferenciar «anteriores completadas». No persistir lectura ni porcentajes.

Mantener breakpoint editorial de 768 px efectivo: índice abierto en desktop, details colapsable en móvil. La rejilla usa `minmax(0, 1fr)` y `min-width: 0` para evitar que una fórmula o un canvas ensanche el documento. Ancho de prosa `68ch`, recursos a lo ancho disponible dentro de la columna editorial. En 768 px el mapa puede apilar su detalle aunque el índice permanezca abierto; no asumir que «tablet» implica dos columnas para todo.

No imponer `min-height: 100vh`/`100dvh` al hero ni añadir separadores vacíos. Después de sus metadatos, el siguiente bloque sigue el gap de composición, como máximo 48 px. Con una introducción larga el hero puede ocupar más pantalla por texto, no por relleno.

Las parejas explicación/figura se crean solo alrededor de unidades contiguas que ya se refieren entre sí en `moduleContent.tsx`. Su orden DOM permanece lógico al apilar; no usar `order` CSS para invertir explicación/fuente. Preservar ids, textos, enlaces y componentes montados. No mover figuras entre secciones si ello rompe sus referencias.

**Alternativas:** un ancho único de prosa hace pequeño el mapa; un ancho único exploratorio dificulta lectura. Acordeones nuevos reducen visibilidad del contenido y contradicen conservación. Se descartan ambos.

### 3. Figuras y bloques técnicos: presentación antes que nuevos activos

**Elección:** intervenir `index.css` y wrappers de ReferenceFigure/SignalDiagram/ODDMDiagram. Usar altura automática y contención proporcional; eliminar límites o overflow que recorten símbolos, figcaption o foco. Mantener figcaption/fuente unidos a la figura, con contraste de texto normal. Preservar los enlaces de ampliación ya ofrecidos por ReferenceFigure, no extenderlos mediante un nuevo visor.

Mantener activos externos por defecto, incluidos los no licenciados explícitamente. No ejecutar reemplazos ni redibujos hasta comprobar permiso y equivalencia científica; las tareas no exigen generar ilustraciones nuevas. En lo inspeccionado no hay un SVG propio en los componentes Diagram. Si una intervención posterior encuentra un esquema propio realmente existente, se puede uniformar trazo/flechas/layout solo con inventario de relaciones y comparación uno a uno; no reinterpretar una imagen externa como «propia» por estar en el repositorio.

Reusar `.equation`, `.editorial-table-wrap`, `.example-block`, notas y referencias, evitando enmarcar cada párrafo. Las tablas/fórmulas anchas conservan scroll local con foco visible y nombre actual cuando existe. No fijar un alto que corte MathML/TeX. Los URLs largos admiten wrap sin cambiar su contenido. La carga lazy y el fallback actual de Formula se mantienen.

**Alternativas:** sustituir todos los activos o redibujar gráficos científicos añade riesgos de permiso y precisión sin resolver un problema de layout. Un visor nuevo amplía comportamiento. Se descartan.

### 4. Bibliometría y OFDM: separar organización de cálculo

**Elección para el mapa:** cambios locales a controles, host, aside y leyenda. Layout amplio: controles → plot con detalle lateral → leyenda. Layout estrecho: controles → plot → detalle → leyenda. El host conserva dimensión no nula al montar y tras resize; no remount del renderer solo por cambiar breakpoint o CSS. Ajustar labels, contraste y color de conexiones sin tocar la geometría o las transferencias cuantitativas.

Invariantes explícitos de BibliometricMap: JSON `public/data/isac/vosviewer-cooccurrence-network.json`, ids/labels/x/y/cluster/weights/scores; radio `max(1.3, sqrt(Occurrences) * 1.55)`; realce seleccionado por factor `1.65`; hasta 1.000 enlaces más fuertes con los mismos conjuntos globales y de selección/filtro; grosor `0.18 + min(1, log2(strength + 1)/5) * 0.95` para enlaces globales visibles. Mantener el orden de fuerza y la lógica de reducers, búsqueda y reset. No introducir ForceAtlas/layout recalculado. Conservar métrica, pares, normalización, lecturas de clústeres y referencias metodológicas de BibliometricFindings, incluidos sus details actuales.

El canvas no necesita volverse una lista de cientos de targets. La vía accesible existente es búsqueda + botones de coincidencias + filtro select + detalle textual `aria-live`; probar que alcanza los mismos resultados sin hover. No convertir la búsqueda en un nuevo combobox ni añadir nuevos controles. La cámara solo recibe política de duración/preferencia, no nueva navegación a término seleccionado.

**Elección para OFDM:** conservar `lib/ofdm.ts`, `OFDM_DEFAULTS`, cálculos y handlers. Cambiar clases/wrappers para separar parámetros y resultados; cifras tabulares, unidades alineadas, métricas en grupos sin headings/copy nuevos. Mantener fieldset/legend, inputs range, outputs y `aria-valuetext`; reset y todos los límites/pasos originales. Alinear no significa reformatear: conservar `es-CO`, redondeos y signos actuales.

Referencia de conservación: configuración 20 MHz/256 símbolos/80 m/15 m/s; los tests actuales fijan resolución 7.49481145 m, observación 16.384 ms, tasa 32 Mbit/s y retardo aproximado 0.5337025523 μs. Comparar también velocidad, Doppler y extremos con el baseline, no solo estos cuatro números. Las ecuaciones y advertencias sobre α, ruido/canal/detección permanecen en su contexto; no añadir α como control ni exponer métricas internas nuevas.

**Alternativas:** dividir librerías o mover el procesamiento a servidor no aporta al rediseño. Cambiar transferencias del grafo para «hacerlo más limpio» alteraría significado. Se descartan.

### 5. Foro: limitar la sangría del árbol completo, no por componente

**Elección:** conservar recursion, semántica de listas, `comment-*`, parent/root ids, cuerpo de texto plano y lógica de respuestas. Reducir padding/margin por nivel o desplazar el marco visual con una medida acumulada limitada; verificar la geometría real de toda la rama. El tope se calcula respecto de la raíz: 32 px acumulados en móvil y 48 px en desktop, incluyendo bordes y paddings anidados. No basta con `Math.min(depth - 1, 3)` aplicado a cada li porque los ancestros siguen sumando desplazamiento.

Distinguir raíz y respuesta con separación, guía y jerarquía existentes; reutilizar «Respuesta a…» donde ya se muestra, sin añadir copy o etiquetas de profundidad al foro público. Mantener autor/fecha arriba, cuerpo debajo y acciones visibles, no solo al hover. Los wrappers de respuesta se adaptan sin disminuir el target de Responder/Cancelar/Publicar. No cambiar el `canReply` actual ni corregir diferencias heredadas entre foro e hilo como parte de una modificación CSS.

**Alternativas:** aplanar el árbol alteraría navegación/semántica; scroll horizontal para seis niveles perjudica lectura móvil. Se descartan. Puede ajustarse un wrapper o un dato puramente visual de profundidad acumulada, sin cambiar el árbol o contratos.

### 6. Auxiliares y matriz cerrada de estados observados

**Elección:** reutilizar AuthShell y StatusNotice/FieldError para jerarquía y alineación; tocar en cada página únicamente presentación y asociaciones accesibles que no alteren condiciones/handlers. Conservar nombres, valores, autocomplete, required, errores, destinos y confirmaciones. No homogeneizar flujos de registro/recuperación/verificación copiando uno sobre otro. La lectura legal se estiliza sobre el aviso existente, no sobre un documento supuesto.

| Superficie | Estados existentes que deben cubrirse | Qué no se añade |
|---|---|---|
| AppShell/sesión | unknown, cuenta/anonimato, offline/unverifiable; banner actual | Skeleton/copy nuevos para cuenta unknown |
| Lazy mapa y mapa | «Preparando la visualización interactiva…», «Cargando la red…», error/copy actual, red completa, término y clúster | Mensaje nuevo de búsqueda sin coincidencias o éxito genérico |
| Resúmenes bibliométricos | Fallback Lazy, cálculo/carga y error actuales, datos y details | Nuevos insights, vacío genérico o cambio de normalización |
| Glosario | Fallback, conteo/coincidencias, cero coincidencias, abierto/cerrado | Estado de error/success que no existe |
| Formula y figuras | TeX mientras no hay MathML y al fallar render; imágenes y carga lazy actuales | Error UI nuevo, nuevo texto alternativo o estado de carga de imagen |
| OFDM | Parámetros y predicciones reales, reset | Loading/error/success ficticios de cálculo síncrono |
| Foro | Carga inicial, revalidación con contenido, vacío, error con/sin caché, publicación/notices, paginación, cooldown, anonimato/no verificado/suspendido/offline | Mensajes nuevos, sustitución de contenido cacheado por skeleton o cambio de permisos |
| Hilo | Carga, error, hilo no encontrado y árbol actual | Éxito/empty genérico no implementado |
| Auth | Pending, errores de campo/formulario, fallos Google, cuenta creada, recuperación enviada, enlace ausente/inválido, verificación/red/éxito | Nuevos resultados o cambios de peticiones, token/URL o validación |
| Admin | Gating, carga, filtro/búsqueda vacíos, error de carga/acción, confirmación/procesando y estado de filas | Reactivar usuarios o banner de éxito ausente |
| Editorial pendiente y legales | Video, reflexiones y documentación legal pendientes | Video, experiencias o documentos completos inventados |

Los huecos de estado arriba identificados no se incorporan: no son decisiones que haya que adivinar para este scope. Si se solicita cubrirlos o se demuestra que un criterio de aceptación necesita copy nueva, detener esa ampliación y preguntar al usuario con la vista/estado concreto; no añadirla de oficio. Igual tratamiento para errores heredados de semántica que requieran nuevas funciones.

**Alternativas:** completar por obligación loading/empty/error/success en cada componente introduciría mensajes y funcionalidades no aprobados. Se descarta.

### 7. Movimiento: dos tokens, CSS primero y puente nativo al canvas

**Elección:** `--motion-fast: 120ms` para feedback de control y cambios de énfasis; `--motion-normal: 160ms` para menús/diálogos y toda interpolación de cámara existente. Opacidad/transform leve solo si comunica la acción; color/borde sin `transition-all` general cuando bastan propiedades explícitas. Delay siempre 0. Mantener las capacidades de teclado/foco de Radix; apertura/cierre no debe esperar a un temporizador añadido.

Inventario a normalizar: `duration-100` de DropdownMenu/Dialog/overlays, `duration-200` de Sheet, transiciones implícitas en Button/paginación/inputs/badges y `tw-animate-css`. Sustituir el pulso de Skeleton por superficie de carga estática, conservando todos sus labels/estados. El glosario y details existentes pueden conservar expansión nativa inmediata; si se suaviza algún feedback de estado, usar 120 ms sin animar una altura arbitraria o ocultar lectura.

Para Sigma, consultar `getComputedStyle` del host para convertir el token normal de ms a número y reutilizarlo en los resets y ajustes nativos; no duplicar un 160 literal en varias rutas ni crear una infraestructura global de animación. La consulta inicial de `matchMedia('(prefers-reduced-motion: reduce)')` se hace antes del primer movimiento, y su listener se limpia al desmontar. Actualizar la política del renderer al cambiar la preferencia, sin volver a pedir el JSON ni recrear el grafo.

API corroborada en la instalación Sigma 3.0.3 (`dist/declarations/src/core/camera.d.ts`, `settings.d.ts` y la implementación distribuida): `animatedReset`, `animate`, `setState`, `isAnimated`; ajustes `zoomDuration`, `doubleClickZoomingDuration`, `inertiaDuration` y `inertiaRatio`. No usar `goTo` de documentación antigua ni un método `cancelAnimation` no declarado.

- Movimiento normal: los dos resets hoy de 350 ms pasan a normal 160 ms. Normalizar zoom/doble clic/inercia temporal del captor a 160 ms. No cambiar factores de zoom, hit-testing, límites de representación ni agregar fly-to al seleccionar.
- Movimiento reducido: encuadre/reset sin animación en reposo mediante estado nativo; transiciones CSS eliminadas o hasta 1 ms. Minimizar también captors, sin inercia perceptible. No desactivar selección o navegación de la cámara.
- Cambio a reduce durante animación: sustituir/interrumpir mediante API pública el recorrido pendiente para que no reaparezca después de un `setState`. Sigma cancela el frame previo al recibir otra `animate`; una transición al estado actual de duración mínima positiva (p. ej. 0,01 ms) permite resolver el movimiento en curso sin recorrido y continuar con el estado final pertinente. `setState` aislado no cancela una animación pendiente. No prescribir `duration: 0` sin pruebas: la implementación leída divide por duración, por lo que debe evitarse el caso 0/0. No acceder a `nextFrame` privado ni crear otro bucle requestAnimationFrame.
- Cambio de reduce a normal: restaurar las duraciones aprobadas y la inercia normal conservada. En ambos modos, el estado final del reset es el mismo y todas las métricas se actualizan al valor real, no por interpolación.

**Alternativas:** CSS global ya existente cubre DOM, pero no canvas; una librería de motion duplica responsabilidades. Conservar 180–240 ms o 350 ms incumple el ajuste final. Se descartan.

### 8. Verificación determinista separada de la evaluación visual

La baseline se genera antes de implementación en evidencias del change, con fixtures sin datos reales sensibles, no contra producción/BD. Capturas antes/después usan iguales rutas, viewport, zoom, datos, término/clúster seleccionado y parámetros OFDM. No se generan capturas en esta fase de planificación.

| Control | Oráculo determinista |
|---|---|
| Conservación editorial | Por módulo/sección: texto normalizando únicamente whitespace de render, orden lógico de unidades, ids/anclas, enlaces con href/to/rel/target, alt/captions/fuentes y referencias; inventario de details abiertos/cerrados y pending. Comparar antes/después, no snapshots enormes sin identificación por sección |
| Datos y activos | Hash y recuentos previos/posteriores del JSON y activos externos; igualdad exacta de coordenadas/clústeres/weights/scores y conjunto de enlaces; los activos externos no requieren sustitución para aceptar el diseño |
| Bibliometría | Comparar mismas selecciones/filtros y resúmenes, factores/tamaños/grosores y conjuntos de hasta 1.000 enlaces; permitir solo contraste/typography/organización y política temporal |
| OFDM/fórmulas | Tests existentes verdes; límites/pasos/defaults/formato y todos los resultados de baseline/extremos iguales; MathML y TeX sin clipping y fuente de expresiones intacta |
| Navegación | `/` → `/planeacion`; siete rutas en orden, anclas y anterior/siguiente; desde glosario se conserva «A continuación» al foro y CTA actual, sin octavo módulo; destinos de cuenta/legales/admin actuales |
| Geometría | Viewports de referencia 360×800, 768×1024, 1440×900 a 100 %, y los mismos tamaños de ventana a zoom real 200 %. Registrar ancho CSS efectivo; medir `scrollWidth <= clientWidth + 1` en documento, ancho de prosa 68ch cuando quepa, recursos locales accesibles y overlays contenidos. No sustituir zoom real por un transform CSS |
| Hero e índice | Orden DOM fijado; sin min-height relativo al viewport ni spacer; gap tras metadatos <=48 px; índice abierto desde 768 px efectivos; headings de anclas no tapados |
| Foro | Fixtures de niveles 1–6, padres retirados y nombres/mensajes largos; diferencia acumulada de borde inicial del cuerpo <=32/48 px y ancho del cuerpo a nivel 6 >=240 px en 360 px; no solo comprobar estilos del li individual |
| Accesibilidad | Contraste 4,5:1 normal/3:1 grande y UI esencial; targets independientes >=44×44 px; teclado, Escape, devolución/visibilidad de foco, aria actuales, selección sin hover/color; scroll local operable y foco no cortado |
| Movimiento | Estilos/animaciones computados y opciones reales enviadas a cámara/captors: 120 o 160 ms, delay 0, ninguna iteración infinita/pulso; reduced <=1 ms sin recorrido de cámara, incluidos mount/reset/gestos y cambio de preferencia en curso; no basta buscar «350» en fuentes |
| Negocio conservado | Condiciones y handlers sin alteración; requests/endpoints y secuencias de la baseline iguales en fixtures de sesión/foro/admin/auth; caché útil no reemplazada al revalidar; pruebas existentes de sesión/caché verdes |

Evaluación visual independiente: calma editorial, carácter técnico, jerarquía, legibilidad científica, densidad cómoda y ausencia de vacío excesivo o apariencia de dashboard genérico. Se evalúa con browser y pares de capturas, no se declara probada por snapshot o typecheck. Un juicio estético no puede dispensar una conservación fallida o un contraste insuficiente.

### 9. Ciclos verticales y seams de TDD

Secuencia de dependencias: baseline → tokens/primitivas/shell y piloto (`/planeacion`, `/analisis`, `/mini-caso`) → figuras/recursos → siete módulos y auxiliares → normalización final de movimiento → responsive/teclado/estados → revisión independiente y verificación. Los tokens de movimiento se definen al principio; la fase posterior elimina residuales y prueba canvas, no autoriza duraciones temporales más lentas.

En cada ciclo con comportamiento/contrato automatizable, el tester prepara una aserción fallida antes del cambio (Red), el ingeniero ajusta la presentación (Green) y ambos eliminan duplicación mínima manteniendo pruebas (Refactor). Seams: inventario por sección, rutas/DOM renderizado, bounds reales del árbol, opciones de cámara/captors y media query simulada. Usar `node:test` existente para seams puros de conservación/política; no importar el renderer WebGL en tests Node ni acoplar pruebas a clases Tailwind completas. El límite de helper nuevo sigue siendo un segundo uso real, no extraer todo solo por testearlo.

CSS, canvas, foco, targets y zoom exigen además browser. Usar herramientas de navegador disponibles con respuestas interceptadas/fixtures para estados backend, sin instalar un runner nuevo por decoración ni escribir casos que cambien contenido. Donde una cualidad solo sea visual, documentar revisión/captura en lugar de inventar TDD que no la mide. Revisiones Estándares y Spec al final son independientes de quien implementa y del juicio visual; no se delega esta redacción a otros agentes.

Verificación del repo en implementación: desde raíz y en orden `pnpm check` → `pnpm lint` → `pnpm test`. Los warnings de lint previos se separan de regresiones. Tests de BD permanecen omitidos por defecto; no activar opt-in sin base aislada y autorización específica. No ejecutar migraciones ni leer `.env`/secretos. Si sigue ausente el manifest raíz o los comandos están restringidos, registrar el fallo exacto y consultar antes de cualquier reparación fuera de alcance.

## Risks / Trade-offs

- [Alterar contenido al mover wrappers] → Inventario por sección/activo y diff semántico previo/posterior; no aprobar solo con capturas.
- [Figuras ilegibles al reducir escala o sin permiso] → Mantener activos y proporciones, comprobar etiquetas a tamaños reales y zoom; permiso desconocido impide redibujar, no impide ajustar márgenes.
- [Canvas mal dimensionado tras reflow] → Host no nulo, `min-width: 0`, resize verificado y ninguna recreación ligada al breakpoint.
- [Cambiar datos para mejorar claridad visual] → Congelar hashes, transferencias de ocurrencias/fuerza y cálculos; separar contraste del significado cuantitativo.
- [Sangría recursiva todavía acumulativa] → Medir rama completa de seis niveles con viewport móvil, no confiar en un tope local.
- [Duraciones de librerías fuera de rango o movimiento activo en reduce] → Auditar primitivas, CSS computado y captors; prueba de preferencia dinámica y cancelación sin estado privado.
- [Tokens primarios/tintas con contraste insuficiente en hover o canvas] → Medir cada combinación relevante; acentos no sustituyen contraste o identificación textual.
- [Inventar estados para uniformar componentes] → Matriz cerrada de estados; cualquier incorporación exige pregunta concreta y cambio de alcance autorizado.
- [Tocar lógica sensible en archivos mixtos de vista/handlers] → Ediciones pequeñas de clases/wrappers; review de requests, gating y handlers; detener la parte que necesite lógica de negocio.
- [Contexto/specs históricos contradictorios o scripts raíz no disponibles] → Registrar baseline y limitaciones separadas de este change; no prometer remediación ni aprobación funcional global.

## Migration Plan

No hay migración de datos ni configuración de backend. Implementar incrementalmente los ciclos de `tasks.md`, revisando el piloto y recursos antes de propagar estilos a las demás vistas. La revisión del piloto comprueba la dirección ya aprobada, no abre otra aprobación genérica.

Antes de publicar el frontend, cerrar conservación, responsive, movimiento/accesibilidad y verificaciones del repo; generar el build web con el procedimiento existente cuando el entorno esté operativo. No ejecutar `pnpm start` si eso dispara migraciones como efecto lateral, ni modificar despliegue para una prueba visual.

Rollback: revertir únicamente los cambios de presentación de esta implementación, conservando cualquier trabajo ajeno; volver al build frontend anterior sin tocar datos, tokens de sesión ni recursos científicos. Evidencias y pruebas identifican qué ciclo introdujo una regresión.

## Open Questions

No queda una decisión de contenido o comportamiento que sea necesaria para redactar o implementar la presentación aprobada. Los estados ausentes y las discrepancias históricas están identificados y excluidos, no resueltos por suposición.

Queda por confirmar operativamente, antes de ejecutar las comprobaciones del repo, la disponibilidad del `package.json` raíz y sus scripts declarados. Su ausencia puede bloquear la verificación de implementación, no la creación de artefactos; no se autoriza crearlo/restaurarlo ni saltarse la verificación. Los permisos/licencias no establecidos solo necesitan consulta si se pretende modificar o sustituir el activo, acción no necesaria para este plan.
