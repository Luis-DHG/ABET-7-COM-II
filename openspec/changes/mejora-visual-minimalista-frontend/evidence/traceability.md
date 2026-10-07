# Trazabilidad de contratos de presentación

Matriz para la revisión Spec de `mejora-visual-minimalista-frontend`: **14 requirements y 33 scenarios de los cuatro deltas**, vinculados a áreas existentes, tareas y evidencia necesaria para decidir cumplimiento.

**Estado de todas las filas: pendiente de verificación; implementación en curso.** Esta matriz no acredita resultados, no marca tareas completadas y no convierte una lectura de código en evidencia de ejecución. Los identificadores PF/ME/FR/SW son referencias locales de esta matriz, no IDs nuevos de OpenSpec.

## Fuentes y uso

- Contratos: [presentacion-frontend](../specs/presentacion-frontend/spec.md), [modulos-editoriales](../specs/modulos-editoriales/spec.md), [foro-retroalimentacion](../specs/foro-retroalimentacion/spec.md) y [sesion-web](../specs/sesion-web/spec.md). Los nombres de requirement/scenario se conservan en los encabezados y filas.
- Implementación y oráculos aprobados: [design.md](../design.md), especialmente Decisions 1–9; alcance y exclusiones: [proposal.md](../proposal.md).
- Los números de la columna «Tareas» corresponden a [tasks.md](../tasks.md). Las tareas de integración/revisión 8.1–8.3 y cierre 8.6 atraviesan toda la matriz; no sustituyen las comprobaciones de cada ciclo.
- Las rutas de código de las tablas son relativas a `apps/web/src/`, salvo las que comienzan con `apps/web/`, que parten de la raíz del repo. El código consultado identifica puntos de observación, no certifica su conformidad ni congela el trabajo concurrente.

El ingeniero modifica presentación; el tester conserva la titularidad de inventarios, hashes, matriz de estados, pruebas y capturas. Esta matriz solo describe qué evidencia permitiría revisar cada contrato: no reproduce esos entregables, no prescribe archivos de test nuevos ni ejecuta el navegador. La revisión posterior debe referenciar la evidencia del tester con caso, resultado y condiciones reproducibles; mientras falte esa asociación, la fila sigue pendiente.

## Condiciones comunes de evidencia

1. **Conservación:** reutilizar la baseline del tester y comparar unidades identificadas, no solo apariencia. El comparador editorial debe detectar pérdidas/duplicaciones mediante su control negativo (1.2); el whitespace de render es la única normalización editorial permitida por el diseño. Activos/dataset y cálculos requieren sus oráculos propios, no un dictamen visual.
2. **Geometría y accesibilidad:** cuando la fila implique reflow, usar ventanas 360×800, 768×1024 y 1440×900 a 100 % y a **zoom real 200 %**, registrando ancho CSS efectivo. No sustituir zoom por `transform`, cambio de escala de una captura o solo reducción del viewport. Exigir `scrollWidth <= clientWidth + 1` en el documento, con scroll local únicamente para recursos designados.
3. **Movimiento:** observar estilos/animaciones computados y opciones efectivas de cámara/captors. Los tokens aprobados son **120 ms rápido y 160 ms normal**, sin delay; la respuesta nativa inmediata puede mantenerse. En reduce, movimiento eliminado o **<=1 ms**, sin recorrido perceptible, también en canvas y al cambiar la preferencia en curso.
4. **Negocio y requests:** comparar condiciones/handlers y trazas con las mismas fixtures autorizadas: método, destino, parámetros/cuerpo y secuencia de peticiones originales; conservar sesión, caché, permisos y validaciones. No usar datos sensibles ni escrituras en producción. La evidencia frontend no certifica por sí sola seguridad o conformidad histórica del backend.
5. **Separación de oráculos:** medidas y aserciones deterministas prueban umbrales/conservación; capturas pareadas y revisión independiente evalúan jerarquía, calma editorial y legibilidad. Una captura no prueba exactitud de datos, foco, requests o cancelación de cámara; una prueba numérica tampoco acredita estética.

## Delta: presentacion-frontend

### PF-01 — Requirement: Lenguaje visual editorial compartido

Contrato: Inter local y capa visual única; paleta y semántica del delta, sin decoración arbitraria por módulo. Prosa a 17 px equivalentes al 100 %, interlineado 1,7–1,8, izquierda y medida máxima 65–72ch cuando quepa; el diseño concreta 1,75/68ch y espaciado 8/16/24/32/48 px. Los recursos pueden ser más anchos que la prosa.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| PF-01.1 — Lectura y exploración en una pantalla amplia | `index.css`; `components/ModuleLayout.tsx`; wrappers de `pages/moduleContent.tsx`; mapa/explorador | 1.2; 2.1–2.2; 2.6–2.7; 7.1–7.2 | Medición de fuente, interlineado, alineación, medida de prosa y gaps a 1440 px/100 %; bounds separados de párrafo y recurso que demuestren ancho exploratorio sin extender lectura. Comparación editorial contra baseline y revisión visual pareada. |
| PF-01.2 — Lenguaje visual sin decoración por módulo | `index.css`; `components/ui/{button,input,textarea,badge}.tsx`; shell, módulos, auxiliares y colores de `components/BibliometricMap.tsx` | 2.2–2.4; 4.2–4.4; 5.6–5.9; 7.4; 7.6 | Estilos computados y revisión de reutilización de tokens/primitivas; contraste medido en combinaciones y estados relevantes; recorrido visual que conserve error/éxito diferenciados y categorías distinguibles del grafo, sin degradados grandes, sombras decorativas repetidas ni tarjetas para cada párrafo. |

### PF-02 — Requirement: Shell compacto con navegación y cuenta diferenciadas

Contrato: identidad/navegación/cuenta distinguibles, cabecera sticky, ruta activa no indicada solo por color; destinos, acciones, banner y footer preservados. `/` conduce a `/planeacion` y el foro permanece independiente.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| PF-02.1 — Cambio de módulo desde el menú móvil | `components/AppShell.tsx` (Header/Sheet); `components/ui/sheet.tsx`; `pages/ModulePage.tsx` (HomeRedirect); `lib/manifest.ts` como referencia de conservación | 1.4; 2.1; 2.3–2.4; 2.7; 7.3 | Recorrido a 360 px: abrir, elegir destino y constatar cierre y ruta; comparar enlaces con baseline, incluida entrada `/`. Evidencia DOM/visual de énfasis o forma además de color para ubicación activa, con operación por teclado conservada. |
| PF-02.2 — Cuenta y degradación conservadas | `components/AppShell.tsx` (Header/OfflineBanner/Footer), según estado de sesión/conectividad | 1.5; 2.4; 5.10; 7.5 | Casos del inventario de estados del tester: igualdad de acciones, mensajes y enlaces, visibilidad administrativa según estado original y lectura disponible en degradación. Diff de condiciones/handlers y comparación de requests; no crear un estado/copy para uniformar la cabecera. |

### PF-03 — Requirement: Adaptación sin desbordamiento global

Contrato: lectura y acciones disponibles a 360/768/1440 px y zoom real 200 %; sin overflow horizontal global, con scroll local operable de tablas/fórmulas, overlays contenidos y columnas apiladas en orden lógico.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| PF-03.1 — Móvil y ampliación | `components/AppShell.tsx`, `components/ModuleLayout.tsx`, `index.css`; figuras, Formula, mapa, OFDM, foro y auxiliares | 1.6; 7.1–7.2; 7.6 | Barrido geométrico bajo las condiciones comunes: ancho desplazable global <= ancho útil +1 px; bounds/orden de columnas y acceso a todos los textos/controles; tablas/fórmulas anchas con scroll local por teclado sin clipping. Canvas con tamaño válido tras resize y reflow, sin recreación por breakpoint. |
| PF-03.2 — Overlay con poco espacio vertical | `components/ui/{sheet,dropdown-menu,dialog}.tsx`; `components/AppShell.tsx`; `pages/admin/ConfirmDialog.tsx` | 2.3–2.4; 5.8; 7.1–7.3; 7.6 | Menú/diálogo abierto al 200 % con poco alto: bounds dentro del viewport y recorrido hasta cierre/confirmación; scroll interno cuando haga falta. Registro de foco y acciones visibles, sin quedar ocultos por cabecera u overlay. |

### PF-04 — Requirement: Movimiento reactivo rápido y no decorativo

Contrato: inmediato o tokens 120/160 ms, delay 0; apertura/cierre, glosario, feedback y cámara no retrasan foco, lectura ni datos. Sin resets de 350 ms, pulsos permanentes, movimiento decorativo o contadores ficticios; seleccionar término no añade vuelo de cámara.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| PF-04.1 — Apertura y cierre rápidos | `index.css`; `components/ui/{sheet,dropdown-menu,dialog,button,input,textarea,badge}.tsx`; `components/Glossary.tsx`; `components/ModuleLayout.tsx` (paginación); reset del mapa | 2.2; 6.1–6.4; 6.7; 7.3 | Duraciones/delays computados en apertura y cierre, expansión/feedback y reset con preferencia normal: 120 o 160 ms cuando se anime, delay 0. Recorrido que muestre foco/acciones sin espera y datos reales sin interpolación; revisión de ausencia de reveal por scroll, parallax u hover exagerado. |
| PF-04.2 — Cámara y carga sin duraciones residuales | `components/BibliometricMap.tsx` (montaje/reset/cámara/captors); `components/LazyBibliometricMap.tsx`; `components/ui/skeleton.tsx` y consumidores de carga | 3.5–3.6; 6.1–6.2; 6.4; 6.7 | Registro de opciones reales de ambos resets y de zoom/doble clic/inercia a normal 160 ms; observación de gestos y mismo estado final, factores de zoom y selección. Animaciones computadas sin residuales 100/200/350 ms ni iteración infinita/pulso; labels de carga intactos. Buscar literales en fuente no basta. |

### PF-05 — Requirement: Movimiento reducido también en la cámara

Contrato: CSS y cámara/captors atienden reduce desde el primer movimiento y durante la sesión; <=1 ms o eliminación, sin scroll suave ni recorridos perceptibles, con los mismos controles y destinos.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| PF-05.1 — Preferencia activa al entrar | `index.css` (media query); overlays; `components/Glossary.tsx`; `components/BibliometricMap.tsx` (encuadre inicial/reset/gestos) | 6.1–6.2; 6.5; 6.7 | Entrada con reduce ya activo: estilos/animaciones <=1 ms o ausentes y scroll no suave; encuadre, reset, zoom e inercia sin recorrido perceptible. Opciones/estado de cámara y controles finales equivalentes a normal, preferencia aplicada antes del primer movimiento y limpieza del listener al desmontar. |
| PF-05.2 — Cambio durante una animación | Cámara/captors de `components/BibliometricMap.tsx`; media query y animaciones de overlays | 6.5–6.7 | Cambio a reduce durante interpolación de cámara y durante overlay: observar que el recorrido pendiente no reaparece, estado válido y siguiente interacción reducida sin recarga. Registrar restauración a 160 ms al volver a normal, sin refetch del JSON ni remount del grafo; cancelación/resolución mediante API pública, sin frames privados ni duración cero asumida segura. |

### PF-06 — Requirement: Flujos auxiliares y estados existentes sin ampliación funcional

Contrato: jerarquía/campos/acciones/errores coherentes, conservando copy, datos ingresados, asociaciones, anuncios, gating, confirmación y efectos. Ninguna ampliación de estados, validación, permisos, sesión, caché, seguridad o requests; los pendientes siguen pendientes donde existan.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| PF-06.1 — Formulario con errores y operación en curso | `pages/auth/*.tsx`; AuthShell en `pages/auth/LoginPage.tsx`; `components/StatusNotice.tsx` (StatusNotice/FieldError); campos/primitivas compartidos | 1.5; 5.5–5.7; 5.9–5.10; 7.5 | Fixtures de validación fallida/envío pendiente: mensajes, valores, labels, `aria-invalid`/asociaciones y anuncios iguales; acción primaria y deshabilitado bajo las mismas condiciones. Diff de handlers y trazas HTTP contra baseline, incluyendo captura/limpieza de token y reintentos actuales sin exponer secretos ni añadir peticiones. |
| PF-06.2 — Confirmación administrativa | `pages/admin/{AdminCommentsPage,AdminUsersPage,ConfirmDialog,RequireAdmin}.tsx`; `components/ui/dialog.tsx` | 5.5; 5.8; 5.10; 7.3–7.5 | Recorrido con gating original: solicitar, cancelar y confirmar acciones existentes; conservar copy/procesando y efecto sobre filas/contexto padre. Ninguna mutación al cancelar; secuencia/request original al confirmar. Etiqueta y tratamiento destructivo no dependientes solo de color, foco/targets/contraste medidos; sin acción de reactivación nueva. |
| PF-06.3 — Estado pendiente o no implementado | Avisos de `pages/moduleContent.tsx`; `pages/LegalPage.tsx`; StatusNotice y fallbacks Lazy/Skeleton existentes | 1.5; 4.1; 4.3; 5.9–5.10; 7.5 | Comparación de avisos/condiciones con el inventario del tester; registro de ausencia y consulta antes de incorporar cualquier estado/copy no existente. No llenar una matriz genérica ni convertir pendientes en materiales disponibles. La discordancia legal entre diseño y fuente se trata como límite, no como orden de añadir/restaurar un aviso (véase límites). |

## Delta: modulos-editoriales

### ME-01 — Requirement: Conservación integral del contenido editorial actual

Contrato: siete módulos, todas sus unidades y controles colapsables actuales preservados; solo presentación/agrupación con orden lógico. Sin vaciar, reformular, añadir secciones, duplicar figuras u ocultar prosa visible en acordeones nuevos. Entrada y recorrido mantienen siete rutas y los accesos actuales de glosario al foro independiente.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| ME-01.1 — Comparación con la versión anterior al rediseño | `pages/moduleContent.tsx`; `components/ModuleLayout.tsx`; figuras/Formula/Glossary y recursos montados; `pages/ModulePage.tsx`, `lib/manifest.ts` y `components/EditorialExtras.tsx` como referencias de conservación | 1.2; 1.4; 2.6; 3.2–3.4; 4.1–4.5; 8.1 | Comparador por módulo/sección del tester: texto, titulares, introducción, ids/anclas, orden lógico, links/destinos/atributos, alt/captions/fuentes/licencias, fórmulas y referencias iguales; sin pérdidas/duplicaciones ni acordeones añadidos. Recorrido de siete rutas, anterior/siguiente y ambos accesos actuales desde glosario al foro, sin módulo ocho. |
| ME-01.2 — Materiales todavía pendientes | Contenido y estados actuales de `/divulgacion` y `/bitacora` en `pages/moduleContent.tsx` | 1.2; 1.5; 4.1; 4.3; 4.5; 7.5 | Igualdad de textos y significado de los pendientes respecto de baseline; DOM y revisión visual muestran las unidades existentes sin video simulado, experiencias, fechas, lecciones o media nueva. |

### ME-02 — Requirement: Jerarquía editorial y ubicación sin progreso completado

Contrato: ubicación → nombre → headline → introducción → metadatos, hero ajustado al contenido sin altura de viewport/spacer y solo posición actual enfatizada. Índice abierto desde 768 px efectivos y activable en móvil; anclas, glosario de módulos 1–6 y paginación actuales conservados.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| ME-02.1 — Entrada directa a un módulo intermedio | `components/ModuleLayout.tsx` (ModuleProgress/hero); `index.css`; `/mini-caso` | 2.1–2.2; 2.5; 2.7; 4.5 | Entrada directa: ubicación 4 de 7 y todas las posiciones no actuales neutrales, sin progreso guardado. Orden DOM del hero, estilos/bounds sin min-height de viewport ni spacer; gap tras metadatos <=48 px según diseño. Comparación del texto/metadatos con baseline y evaluación visual separada. |
| ME-02.2 — Índice y anclas en ambos layouts | `components/ModuleLayout.tsx` (useIsDesktop/índice/PreviousNext); `index.css`; cabecera sticky | 1.4; 2.1; 2.5; 4.5; 7.1; 7.3 | Activación de índice/ancla a 360 px y apertura mantenida a >=768 px efectivos, también al cambiar layout/zoom. Mismos ids/textos/destinos, encabezado y foco visibles bajo cabecera; accesos al glosario 1–6 y paginación conservados. |

### ME-03 — Requirement: Composición de lectura y recursos técnicos

Contrato: ancho de lectura contenido y recursos con más espacio; parejas explicación/figura solo como unidades existentes, apiladas en orden lógico cuando no quepan. Jerarquía sobria de tablas/fórmulas/notas/ejemplos/citas/referencias, sin clipping ni tarjeta para cada párrafo.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| ME-03.1 — Recurso ancho junto a texto de lectura | `index.css`; wrappers de `pages/moduleContent.tsx`; `components/{BibliometricMap,BibliometricFindings,OfdmExplorer,Formula,EditorialExtras}.tsx` | 2.6–2.7; 3.4; 3.6–3.7; 3.9–3.10 | Bounds de prosa frente a mapa/explorador en `/analisis` y `/mini-caso` desktop; recursos más anchos sin extender párrafos. MathML y fallback TeX completos, símbolos y URLs sin clipping, scroll local por teclado y foco visible; comparación de notas/tablas/citas y pruebas de fórmulas como apoyo, no sustituto de layout. |
| ME-03.2 — Unidad explicación y figura en móvil | Wrappers de `pages/moduleContent.tsx`; `components/{ReferenceFigure,SignalDiagram,ODDMDiagram}.tsx`; `index.css` | 3.1–3.4; 3.10; 7.1–7.2 | Comparación DOM/semántica de unidades contiguas antes/después: explicación → figura → figcaption/fuente conservadas, sin inversión mediante orden CSS, duplicación ni ocultación. Bounds y revisión de etiquetas/apilado a 360 px y zoom real 200 %. |

### ME-04 — Requirement: Figuras científicas íntegras y atribuidas

Contrato: información, proporciones, significado, etiquetas/ejes/símbolos, fuentes/licencias y ampliación existente preservados. Sin recorte/distorsión/filtros; modificación o sustitución externa solo con justificación y permiso comprobado. No suponer que los componentes Diagram son esquemas propios.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| ME-04.1 — Revisión de figuras externas | `components/{ReferenceFigure,SignalDiagram,ODDMDiagram}.tsx`; figuras montadas en `pages/moduleContent.tsx`; `.signal-figure` en `index.css` | 1.2–1.3; 3.1–3.3; 3.10; 7.1 | Evidencia de activos del tester con igualdad de archivos, alt/caption/fuente y asociación con explicación; comparación desktop/móvil de proporción y contenido científico íntegro. Probar enlaces de ampliación ya existentes de ReferenceFigure sin nuevo visor. ODDM debe quedar separado como limitación preexistente, no como conservación acreditada. |
| ME-04.2 — Licencia o autoría no establecidas | En particular `components/ODDMDiagram.tsx`; área de activos externos y wrappers | 1.2–1.3; 3.2; 3.10; 8.2–8.3 | Diff que limite cambios a presentación y preserve referencia/copy, sin sustitución, redibujo o atribución inventada; referencia al registro de licencia/autoría desconocida del tester. Una licencia ausente no puede darse por verificada; el activo ODDM no se restaura ni convierte dentro de esta matriz. |

### ME-05 — Requirement: Mapa bibliométrico legible sin cambiar su representación científica

Contrato: controles → plot/detalle → leyenda, con detalle debajo si no cabe; búsqueda/selección/filtro/reset y vía textual operables sin hover. Dataset, geometría, métricas, transferencias cuantitativas, conjuntos de hasta 1.000 enlaces y resúmenes intactos; solo presentación/contraste/política temporal.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| ME-05.1 — Término seleccionado y reset | `components/BibliometricMap.tsx` (búsqueda/sugerencias/selectedTerm/reducers/resetView); `components/LazyBibliometricMap.tsx` | 1.3; 3.5–3.6; 3.10; 6.4–6.7 | Mismo término/fixture: comparación de métricas y conexiones antes/después; reset con mismo estado final de consulta, selección, filtro y encuadre. Registro de opciones de cámara conforme a PF-04/PF-05, sin añadir vuelo al seleccionar; mensajes de carga/error originales conservados. |
| ME-05.2 — Filtro y lectura en móvil | `components/BibliometricMap.tsx` (select/detalle `aria-live`/leyenda); `index.css` | 3.5–3.6; 3.10; 7.1–7.4 | Casos a 360/768 px: select, búsqueda y botones de coincidencias operables sin hover; detalle debajo cuando no cabe al lado, etiquetas textuales de términos/clústeres además de color y leyenda accesible. Bounds del host no nulos al montar/resize, sin remount por reflow y sin nuevo control de búsqueda. |
| ME-05.3 — Fidelidad cuantitativa | `components/{BibliometricMap,BibliometricFindings,LazyBibliometricFindings}.tsx`; dataset `apps/web/public/data/isac/vosviewer-cooccurrence-network.json` (ruta desde raíz) como referencia de conservación | 1.3; 3.5–3.7; 3.10; 8.1 | Reutilizar hashes/recuentos y comparación de ids/labels/x/y/cluster/weights/scores del tester; contrastar red completa, nodo y clúster, orden por fuerza y conjuntos globales/filtrados/seleccionados hasta 1.000 enlaces. Igualdad de radio `max(1.3, sqrt(Occurrences) * 1.55)`, realce `1.65` y grosor global visible `0.18 + min(1, log2(strength + 1)/5) * 0.95`; pares, normalización, métricas, lecturas y referencias de Findings iguales. Hash del JSON por sí solo no prueba reducers ni resúmenes. |

### ME-06 — Requirement: Explorador OFDM con parámetros y resultados diferenciados

Contrato: parámetros/resultados/supuestos existentes distinguibles; cifras/unidades alineadas sin resultados ni simulación nueva. Preservar límites/pasos: banda 10–80 MHz/10, símbolos 64–512/64, distancia 10–200 m/5, velocidad −30–30 m/s/1; reset 20 MHz/256/80 m/15 m/s. Cálculo, fórmulas y formato actuales intactos; actualización directa de datos reales y advertencias visibles, sin añadir α como control.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| ME-06.1 — Valores predeterminados y restablecimiento | `components/OfdmExplorer.tsx` (fieldset/ranges/outputs/reset/resultados); `lib/ofdm.ts` (OFDM_DEFAULTS/ofdmMetrics) y supuestos de `pages/moduleContent.tsx` como referencias de conservación | 1.4; 3.8–3.10 | Cambiar/restablecer y comparar todos los resultados con baseline y defaults del contrato; formato `es-CO`, unidades, redondeos y signos iguales. Apoyarse en `apps/web/tests/ofdm.test.ts` sin declarar ejecución; comprobar además outputs/`aria-valuetext`, supuestos/advertencias disponibles y ausencia de contadores ficticios o nuevos resultados. |
| ME-06.2 — Extremos de los controles | `components/OfdmExplorer.tsx`; `lib/{ofdm,formulas}.ts` como referencias de conservación; `components/Formula.tsx` | 1.4; 3.8–3.10; 7.3; 8.1 | Recorrido de cada mínimo/máximo/paso aprobado y comparación de todas las salidas/unidades/cálculo/formato con baseline, incluidos velocidad y Doppler. Pruebas existentes OFDM/fórmulas más comprobación de controles renderizados, targets y grupos distinguibles; no asumir que los tests existentes cubren cada paso, formato o geometría. Sin curva, α interactivo o simulación añadida. |

## Delta: foro-retroalimentacion

### FR-01 — Requirement: Legibilidad del árbol con sangría visual acumulada acotada

Contrato: seis niveles sin alterar árbol/orden/padres/descendientes, texto plano y saltos de línea, destinos o condiciones/acciones actuales. Raíz/respuesta distinguibles sin color exclusivo, autor/fecha/cuerpo/acciones legibles. Desplazamiento **acumulado**, incluyendo sangrías/bordes/paddings, <=32 px con ancho efectivo <768 px y <=48 px desde 768 px; cuerpo de nivel 6 **>=240 px a 360 px**, sin overflow global.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| FR-01.1 — Conversación completa de seis niveles en móvil | Recursión y cuerpo de `pages/forum/CommentItem.tsx`; contenedor de `pages/forum/ThreadPage.tsx`; composer y `index.css` | 1.6; 5.1–5.4; 7.1–7.3 | Fixture de rama 1–6 con nombres/mensajes largos: bounds del borde inicial del cuerpo respecto de la raíz, sumando desplazamiento real de ancestros. A 360 px: <=32 px acumulados y cuerpo nivel 6 >=240 px; medición adicional en >=768 px: <=48 px. Texto/saltos/autor/fecha/acciones conservados, targets y overflow medidos. Un tope en el estilo de cada li no demuestra el contrato. |
| FR-01.2 — Nivel máximo y comentario retirado | `pages/forum/CommentItem.tsx` (condición Responder/isRemoved/replies); `pages/forum/CommentComposer.tsx` | 5.1–5.4; 7.3; 7.5 | DOM/acciones con la fixture de padre retirado y rama profunda: nivel 6 sin respuesta, mismo aviso/tratamiento del retirado y descendientes disponibles. Comparar ids/parent/root/orden y condiciones de acciones; texto plano/publicar/cancelar y requests originales, sin edición/borrado/etiquetas nuevas ni corrección de diferencias heredadas de gating. |
| FR-01.3 — Listado y vista enfocada conservados | `pages/forum/{ForumPage,ThreadPage,CommentItem}.tsx`; anclas `comment-*` y cabecera sticky | 1.4; 5.1; 5.3–5.4; 7.3; 8.1 | Recorrido listado → hilo → ancla: raíces y respuestas directas en listado, árbol completo en hilo, mismo orden/relaciones/destinos. Registro de comentario/foco visibles bajo cabecera; trazas de lectura/publicación y caché/revalidación comparadas con baseline sin reemplazar contenido útil por carga vacía. |

## Delta: sesion-web

### SW-01 — Requirement: Accesibilidad operativa

Contrato: foco visible/no oculto, anuncios actuales y glosario por clic/foco/teclado; manejo de foco/teclado de overlays conservado. AA: texto normal >=4,5:1, grande >=3:1 e indicadores esenciales de controles/foco >=3:1 frente a colores adyacentes. Targets independientes, entradas de menú, iconos accionables, campos y sliders **>=44×44 px equivalentes**; excepciones solo para enlaces en texto conforme al delta. Mismas condiciones tras reflow/zoom 200 %, sin depender de hover/color ni sustituir nombres/etiquetas por iconos/copy nueva.

| ID / Scenario | Componente o área / punto de observación | Tareas | Evidencia que permitiría verificarlo |
|---|---|---|---|
| SW-01.1 — Navegación por teclado | `components/AppShell.tsx`; `components/ModuleLayout.tsx`; `components/{Glossary,LazyGlossary,BibliometricMap,OfdmExplorer}.tsx`; foro/formularios; foco en `index.css` | 2.1; 2.3–2.5; 4.4; 5.4; 5.10; 7.3 | Recorrido exclusivamente con teclado por controles montados: foco visible en cada control, índice/glosario activables y búsqueda/conteos/expansión actuales preservados; mapa seleccionable mediante búsqueda/filtro/detalle textual, ranges operables y acciones de foro/forms disponibles. Asociaciones y anuncios actuales conservados, sin hover requerido. |
| SW-01.2 — Menú y diálogo con foco restaurado | `components/ui/{sheet,dropdown-menu,dialog}.tsx`; triggers del shell; `pages/admin/ConfirmDialog.tsx` | 2.4; 5.8; 5.10; 6.2; 7.3 | Secuencia de foco al abrir/recorrer/cerrar por acción actual o Escape donde corresponda: inicial correcto, elemento enfocado visible y vuelta al disparador sin esperar animación. Comprobar overlays superpuestos y altura reducida bajo preferencias normal/reduce; una captura de overlay abierto no prueba restauración. |
| SW-01.3 — Contraste y acciones sin hover | Navegación activa; selección/leyenda de mapa; `components/StatusNotice.tsx`; campos/controles compartidos; acciones admin y foro | 2.3–2.4; 3.6; 5.2–5.3; 5.6–5.10; 7.3–7.4 | Ratios medidos con colores efectivos/adyacentes en reposo, hover, activo, selección, error y foco; umbrales AA del contrato. Bounds de **ambas dimensiones** de cada target independiente >=44×44 px, no solo min-height CSS. Revisar sin hover que forma/texto/jerarquía comuniquen estado/selección/destrucción además de color; documentar excepciones de enlaces en prosa sin extenderlas a botones o iconos. |
| SW-01.4 — Reflow accesible | `index.css`; índice/paginación, wrappers `.editorial-table-wrap`/`.equation`, mapa/OFDM, foro/forms/overlays | 3.1; 3.4; 5.4; 5.10; 7.1–7.3; 7.6 | Recorrido por teclado a 360 px y zoom real 200 % bajo las condiciones comunes: controles/mensajes/lectura disponibles, foco sin recorte/ocultación, targets conservados. Tabla/fórmula ancha desplazable localmente con teclado sin mover horizontalmente el documento; orden de lectura/foco preservado al apilar y anclas no tapadas. |

## Límites y seams aún por cerrar

«Seam» designa aquí un punto donde observar el contrato, no una nueva abstracción exigida. Ninguna entrada siguiente acredita un fallo ejecutado ni autoriza cambios de alcance.

| Filas afectadas | Límite del punto de observación | Tratamiento para revisión |
|---|---|---|
| PF-01, ME-02/ME-03 y evaluación visual transversal | Calma editorial, sobriedad y legibilidad no tienen un oráculo unitario único. Los tokens/bounds son medibles, pero no bastan para el juicio visual. | Pendiente de evidencia visual pareada y revisión independiente del tester/revisor, separada de medidas y conservación. No inventar un test de estética ni sustituirlo por typecheck. |
| PF-03, FR-01 y SW-01 | La suma real de sangrías, ancho útil, foco, targets, contraste y zoom requieren DOM/layout del navegador. Las pruebas existentes de caché/sesión no observan esa geometría. | Hay áreas concretas identificadas, pero la evidencia geométrica/operativa sigue pendiente del tester. No inferir cumplimiento de clases ni ejecutar otro navegador desde esta tarea documental. |
| PF-04/PF-05; ME-05.1/ME-05.3 | Cámara/captors y transformación/reducers/resúmenes bibliométricos están integrados en los componentes; no se identificó un helper puro compartido que por sí solo pruebe opciones efectivas, interrupción de cámara y representación completa. | Pendiente de observación/instrumentación del tester sobre renderer/estado real, además de comparación de datos. No importar WebGL a un test Node ni imponer extracción nueva solo para la matriz; tests de política aislada o hash del JSON no bastan. |
| ME-04.1/ME-04.2; conservación de activos | [visual-notes.md](visual-notes.md) registra el PNG ODDM eliminado y un AVIF nuevo ajeno preexistente; `components/ODDMDiagram.tsx` sigue refiriendo al PNG. Tampoco hay permiso/autoría establecidos en ese componente. | No prometer restauración, conversión, sustitución ni atribución. Separar esta limitación de regresiones del rediseño; no declarar imagen disponible, hash conservado o permiso comprobado sin la evidencia correspondiente del tester. |
| PF-06.3 y tarea 5.9 | El diseño describe el aviso legal «Documento en preparación», pero `pages/LegalPage.tsx` leído contiene DOCUMENTS/secciones renderizadas y no ese aviso. No hay un seam actual de ese estado legal pendiente que pueda ejercitarse tal como lo describe el diseño. | Pendiente de conciliar la referencia con la baseline del tester para revisión Spec, sin añadir/restaurar copy, reescribir legales ni modificar planning. Aplicar conservación al contenido observado; el estado ausente no se incorpora para hacer coincidir una tabla. |
| Conservación de negocio en PF-02/PF-06 y FR-01 | Las pruebas existentes `apps/web/tests/{forum-cache,session-refresh,session-race}.test.ts` observan caché/HTTP/guardas, no todas las vistas, requests o estados auxiliares. OFDM/fórmulas tampoco prueban formato renderizado o accesibilidad. | Pendiente de resultados de regresión y comparación de trazas/DOM con fixtures del tester. No atribuir cobertura integral a esas pruebas ni declarar sus resultados. Las diferencias históricas de permisos/estados no se remedian mediante presentación. |

Los inventarios/estados/hashes/capturas y sus resultados permanecen en los entregables del tester, sin copias aquí. La reparación operativa autorizada del manifest no se evalúa ni se vuelve a documentar en esta matriz. Las demás discrepancias históricas y exclusiones siguen delimitadas por proposal/design; **SEO está explícitamente fuera de alcance**, sin objetivos ni tareas asociados. Este archivo no modifica producción, pruebas, planning ni specs principales y no acredita cierre, sync o archive del change.
