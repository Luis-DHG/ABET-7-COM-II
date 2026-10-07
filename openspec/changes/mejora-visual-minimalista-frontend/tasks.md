# Tasks

Todas las casillas corresponden a trabajo futuro de implementación/verificación, no a la redacción de este change. Seguir los contratos de `specs/` y las decisiones/oráculos de `design.md`. Cada ciclo automatizable empieza con el tester (Red), continúa con el ingeniero (Green) y cierra con regresión/refactor mínimo; las cualidades visuales se revisan en browser, no se sustituyen por un test artificial. Las evidencias de cada ciclo se guardan bajo `evidence/` de este change, sin datos reales sensibles ni escrituras en documentación ajena.

## 1. Baseline de conservación, estados y entorno

- [x] 1.1 Comprobar disponibilidad del manifest y scripts raíz antes de ejecutar verificaciones o levantar la aplicación; verificar que `pnpm check`, `pnpm lint` y `pnpm test` sean invocables desde raíz y registrar el resultado o bloqueo exacto, consultando si sigue faltando `package.json` sin crearlo/restaurarlo fuera de alcance.
- [x] 1.2 Tester: fijar inventario por módulo/sección de textos, ids/anclas, titulares, links/destinos, figuras/alt/captions/fuentes/licencias y details actuales; verificar que el inventario cubra las siete rutas y detecte pérdidas o duplicaciones mediante un control negativo del comparador, sin cambiar contenido de producto.
- [x] 1.3 Fijar baseline de activos externos y JSON VOSviewer con hashes/recuentos y de transferencias/resúmenes bibliométricos; verificar que coordenadas, clústeres, pesos, scores, conjuntos de enlaces y reglas de tamaños/grosores queden identificados para comparación posterior, sin modificar archivos científicos.
- [x] 1.4 Fijar baseline de parámetros/defaults/pasos/formato y todas las salidas OFDM, fórmulas y recorridos de navegación; verificar los valores de referencia y extremos con las pruebas existentes y registrar `/` → `/planeacion`, siete módulos y foro independiente.
- [ ] 1.5 Inventariar los estados reales de shell, recursos, foro, auth, admin y legales y sus mensajes/condiciones; verificar correspondencia con la matriz del diseño y registrar estados ausentes y discrepancias heredadas sin inventar copy ni exigir funcionalidades para cerrarlas.
- [ ] 1.6 Capturar baseline visual con fixtures autorizadas a 360×800, 768×1024 y 1440×900 y zoom real 200 %, incluyendo pilotos, foro de seis niveles y auxiliares; verificar reproducibilidad de rutas/datos/selecciones, guardar evidencias y separar fallos/warnings previos de futuras regresiones.

## 2. Tokens, shell y piloto editorial

- [x] 2.1 Tester Red: preparar comprobaciones de tokens, lectura, hero/índice, targets y navegación activa del piloto; verificar que fallen para contratos nuevos incumplidos y que el comparador de conservación siga pasando sobre la baseline, sin acoplarse a cadenas completas de clases Tailwind.
- [x] 2.2 Ajustar la capa existente de `index.css`: tipografía, prosa 17 px/1,75/68ch, escala 8/16/24/32/48, colores/radios y tokens `--motion-fast: 120ms`/`--motion-normal: 160ms`; verificar valores computados y conservación de Inter local y semántica de error/éxito, sin sistema paralelo.
- [x] 2.3 Afinar Button/Input/Textarea/Badge y primitivas compartidas usadas por el piloto sin alterar sus APIs; verificar targets independientes de 44×44 px, foco visible y estados disponibles, con contraste de reposo/hover/activo y las pruebas del tester verdes para la parte afectada.
- [x] 2.4 Ajustar AppShell: grupos identidad/navegación/cuenta, estados activos, Sheet móvil, banner y footer; verificar todos los destinos/mensajes/acciones de la baseline y navegación con teclado, manteniendo cabecera compacta y permisos actuales.
- [x] 2.5 Ajustar ModuleLayout y el marcador de ubicación para el piloto; verificar orden ubicación/nombre/headline/introducción/metadatos, posiciones no actuales neutrales, hero sin altura de viewport/spacer, índice abierto desde 768 px efectivos y anclas no tapadas.
- [x] 2.6 Aplicar separación de ancho de prosa/exploración y wrappers de unidades existentes en `/planeacion`, `/analisis` y `/mini-caso`; verificar conservación por sección, orden móvil y ausencia de nuevos acordeones o cambios de textos, fórmulas, ids o links.
- [x] 2.7 Cerrar ciclo piloto con tester Green/Refactor y revisión browser desktop/móvil; verificar pruebas del grupo, medir geometría/targets y registrar capturas comparables más evaluación visual separada en `evidence/`, sin solicitar otra aprobación genérica de dirección.

## 3. Figuras, bloques científicos y recursos exploratorios

- [x] 3.1 Tester Red: preparar comprobaciones de asociación figura/figcaption/fuente, proporciones, unidades explicación/figura y scroll local de tablas/fórmulas; verificar fallos relevantes de clipping/geometría y fixtures reproducibles, sin suponer que Diagram sea un SVG propio.
- [x] 3.2 Mejorar escala/márgenes/contención de ReferenceFigure, SignalDiagram y ODDMDiagram; verificar información completa, hashes de activos intactos, fuentes/copy iguales y enlaces de ampliación actuales operativos, sin sustituciones, filtros ni atribuciones inventadas.
- [ ] 3.3 Componer parejas explicación/figura solo en unidades contiguas existentes que lo admitan; verificar lectura/etiquetas en desktop, orden DOM y apilado móvil, con igualdad de textos/captions/fuentes y sin duplicación de figuras.
- [x] 3.4 Afinar tablas, Formula/equation, notas, ejemplos, citas y referencias existentes; verificar scroll local por teclado, MathML/TeX y símbolos sin clipping, URLs legibles y pruebas de fórmulas verdes, manteniendo el fallback y sin nuevas afirmaciones.
- [x] 3.5 Tester Red: preparar casos de mapa completo, término seleccionado, clúster, búsqueda y reset, incluidos loading/error actuales; verificar oráculos de métricas, conjuntos de enlaces, transferencias científicas y orden móvil, distinguiendo los checks de conservación de los nuevos de presentación.
- [x] 3.6 Reorganizar controles/plot/detalle/leyenda y contraste de BibliometricMap; verificar casos verdes, detalle debajo cuando no quepa, host con tamaño válido tras resize y operación de búsqueda/filtro/selección sin hover, sin recalcular layout ni cambiar datasets/reducers cuantitativos.
- [ ] 3.7 Mejorar presentación de BibliometricFindings y sus tablas/details actuales; verificar idénticos pares, métricas/normalización, interpretaciones, fuentes y mensajes de carga/error contra baseline, con lectura móvil y scroll local adecuados.
- [x] 3.8 Tester Red: preparar controles/render de OFDM con mínimos/máximos/pasos, reset, outputs y supuestos; verificar fallos de organización/targets donde existan y oráculos numéricos de conservación verdes, sin incluir α o estados ficticios.
- [x] 3.9 Reorganizar OfdmExplorer en parámetros/resultados/supuestos con cifras y unidades alineadas; verificar casos del tester, todas las salidas/formato y pruebas OFDM existentes verdes, conservando handlers, límites y reset sin contadores animados.
- [x] 3.10 Cerrar ciclo de recursos con regresión local y revisión científica/visual en browser; verificar hashes, etiquetas, fuentes, métricas, resize y fixtures de selección/reset, y registrar pares de capturas/resultados en `evidence/` antes de propagar estilos.

## 4. Propagación a los siete módulos y glosario

- [ ] 4.1 Tester Red: extender la matriz de presentación a `/tendencias`, `/divulgacion`, `/bitacora` y `/glosario`; verificar oráculos por sección, pending actuales, navegación al foro independiente y glosario/cargas/empty existentes, sin exigir estados ausentes.
- [ ] 4.2 Propagar layout/tipografía y tratamiento científico a `/tendencias`, ajustando solo wrappers/unidades existentes; verificar conservación de sus aplicaciones, figuras, tablas, ecuaciones, referencias y anclas en desktop/móvil con casos verdes.
- [ ] 4.3 Propagar presentación a `/divulgacion` y `/bitacora`; verificar la síntesis, preguntas y textos completos, estados de video/reflexión pendientes y enlaces originales, sin completar documentación grupal ni añadir media.
- [ ] 4.4 Afinar Glossary/LazyGlossary y presentación de `/glosario`; verificar búsqueda, conteos, cero coincidencias, expansión nativa por teclado, fórmulas y referencias iguales y los dos accesos actuales al foro sin módulo ocho.
- [ ] 4.5 Cerrar ciclo editorial con tester Green/Refactor y revisión del recorrido completo; verificar comparador de las siete rutas, índices/anclas, anterior/siguiente y estados pendientes, guardar capturas/evidencias locales sin tocar manifest de rutas ni copy editorial.

## 5. Foro y flujos auxiliares

- [ ] 5.1 Tester Red: preparar rama de foro de niveles 1–6 con padre retirado, nombres largos y texto plano, más listado/hilo/anclas/composer; verificar fallos de sangría acumulada y anchura de mensaje y conservar oráculos de orden, padres, descendientes y acciones por nivel.
- [ ] 5.2 Ajustar presentación de CommentItem para limitar el desplazamiento acumulado del árbol; verificar máximo 32 px móvil/48 px desktop y cuerpo de nivel 6 de al menos 240 px a 360 px, con mismas ids, relaciones, condiciones de responder y mensajes.
- [ ] 5.3 Afinar ForumPage/ThreadPage/CommentComposer en jerarquía, guías, autor/fecha/cuerpo y acciones; verificar casos del tester y todos los estados actuales de carga/caché/error/vacío/publicación/cooldown con requests y validaciones iguales, sin nuevas acciones ni copy.
- [ ] 5.4 Cerrar ciclo foro con tester Green/Refactor y browser; verificar `forum-cache.test.ts` y regresión de sesión existentes, anclas/foco, targets y seis niveles sin overflow, y registrar capturas/resultados sin remediar lógica sensible heredada.
- [ ] 5.5 Tester Red: preparar matriz de presentación de auth, admin, legales y StatusNotice/FieldError con fixtures de estados ya existentes; verificar errores asociados, datos introducidos, gating/confirmación y secuencias de requests preservados antes de cambiar clases/wrappers.
- [ ] 5.6 Ajustar AuthShell y presentación de login/registro; verificar error de campo/formulario/Google, envío y cuenta creada con copy, autocomplete, required, validaciones y destinos actuales, sin alterar handlers ni flujo de autenticación.
- [ ] 5.7 Ajustar presentación de recuperación/reset/verificación de correo; verificar enlace ausente/inválido, error/red, pending y éxito existentes, conservando captura/limpieza de token, reintentos, mensajes y secuencias HTTP originales.
- [ ] 5.8 Ajustar vistas administrativas y ConfirmDialog; verificar contexto de comentarios/parent, búsqueda/filtros/paginación, gating y estados actuales de filas/acciones, confirmar/cancelar por teclado y requests originales, sin añadir reactivación ni acciones nuevas.
- [ ] 5.9 Ajustar LegalPage, StatusNotice y FieldError con los tokens compartidos; verificar lectura izquierda, mensajes/labels/anuncios y enlaces actuales intactos, incluido «Documento en preparación», sin redactar documentos ni añadir banners de éxito ausentes.
- [ ] 5.10 Cerrar ciclo auxiliares con tester Green/Refactor y browser; verificar matriz completa del grupo, errores/confirmación/foco/targets y conservación de requests/gating, guardar evidencias y señalar por separado gaps históricos sin corregirlos en este change.

## 6. Movimiento rápido y preferencia reducida completa

- [ ] 6.1 Tester Red: preparar aserciones de duraciones/delay/iteraciones computados de primitivas y de opciones reales de resets/captors; verificar que detecten valores residuales de 100/200/350 ms, pulsos y la preferencia reduce no atendida por canvas.
- [ ] 6.2 Normalizar transiciones/animaciones de Sheet, DropdownMenu, Dialog, controles y paginación a rápido 120 ms o normal 160 ms, delay 0 y propiedades explícitas; verificar pruebas DOM verdes sin esperar a animación para foco/acciones y quitar el pulso de Skeleton conservando labels de carga.
- [ ] 6.3 Conservar o afinar feedback nativo de glosario/details y selección del mapa sin movimiento añadido de cámara; verificar respuesta inmediata o 120–160 ms, lectura visible, expansión por teclado y ausencia de reveal/hover exagerado/contadores ficticios.
- [ ] 6.4 Leer el token temporal desde CSS y aplicarlo a ambos resets y zoom/doble clic/inercia existentes de Sigma; verificar options de 160 ms, mismos factores de zoom/resultados/estado final y ausencia de hardcodes lentos o dependencias nuevas.
- [ ] 6.5 Aplicar reduce antes del primer movimiento y al cambiar matchMedia, tanto a CSS como a cámara/captors; verificar encuadre/reset/zoom/inercia sin recorrido perceptible, listener limpiado y ningún reload del JSON/remount del grafo por cambio de preferencia.
- [ ] 6.6 Resolver el cambio a reduce con animación de cámara en curso mediante API pública y restaurar normal al desactivarlo; verificar fin del recorrido interpolado, estado válido y futuro reset correcto, sin acceder a frames privados ni usar duración cero sin prueba de seguridad numérica.
- [ ] 6.7 Cerrar ciclo movimiento con tester Green/Refactor y browser en ambas preferencias; verificar que toda animación visible esté en 120–160 ms o eliminada y en reduce <=1 ms, con prueba de cámara en curso/gestos y evidencias separadas de la evaluación visual.

## 7. Responsive, teclado, contraste y estados

- [ ] 7.1 Tester Red: preparar barrido geométrico a 360×800, 768×1024 y 1440×900 más zoom real 200 %, con textos largos y overlays abiertos; verificar detección de overflow global/clipping, foco oculto o acciones inaccesibles sin usar transform CSS como sustituto del zoom.
- [ ] 7.2 Corregir únicamente layout/reflow de los casos fallidos: columnas, gutters, wrapping, host de mapa y overlays con poco alto; verificar `scrollWidth <= clientWidth + 1`, scroll local para recursos anchos y acciones visibles en todos los tamaños efectivos.
- [ ] 7.3 Recorrer teclado/touch de shell/índice/glosario/mapa/OFDM/foro/forms/diálogos; verificar foco inicial/visible/restaurado, Escape donde corresponda, targets independientes de 44×44 px, anclas no tapadas y selección/lectura sin hover ni color exclusivo.
- [ ] 7.4 Medir y corregir contraste AA de texto/controles/foco, estados activos, errores, figuras y etiquetas/conexiones del mapa sin cambiar significado; verificar ratios 4,5:1 o 3:1 según corresponda, incluyendo hover/selección y colores categóricos distinguibles.
- [ ] 7.5 Ejecutar matriz cerrada de loading/empty/error/success/pending y degradación con fixtures; verificar mensajes/condiciones actuales, datos útiles de caché no reemplazados y ninguna incorporación de estados/copy ausentes, consultando antes de ampliar cualquier caso.
- [ ] 7.6 Cerrar ciclo responsive/accesibilidad con tester Green/Refactor; verificar casos del grupo, capturas pareadas y evaluación visual de lectura/densidad/carácter técnico, guardar evidencias y listado de regresiones resueltas separado de limitaciones heredadas.

## 8. Integración, revisiones independientes y verificación final

- [ ] 8.1 Ejecutar integración de los comparadores/pruebas ya entregados en cada ciclo; verificar conservación completa de contenido/links/activos/dataset/fórmulas/resultados, siete rutas y estados, sin dejar creación de tests locales pendiente para esta fase final.
- [ ] 8.2 Obtener revisión independiente de Estándares sobre reutilización, límites, dependencias, accesibilidad y movimiento; verificar informe con evidencias y resolución de hallazgos dentro del alcance, sin aceptar cambios de contenido/lógica o abstracciones sin segundo uso.
- [ ] 8.3 Obtener revisión independiente de Spec con trazabilidad requirement/scenario → prueba/evidencia; verificar cumplimiento de los cuatro deltas y reglas de negocio preservadas, separando los incumplimientos históricos identificados en el diseño.
- [ ] 8.4 Ejecutar desde raíz `pnpm check` → `pnpm lint` → `pnpm test`, registrando cada salida y código de retorno; verificar typecheck/tests sin regresiones, warnings lint previos separados y DB tests opt-in omitidos, sin `.env`, migraciones ni reparación de manifest/config fuera de alcance.
- [ ] 8.5 Verificar el build frontend con el procedimiento existente y la revisión browser integrada antes/después en los tamaños/preferencias acordados; verificar recursos activos, navegación y ausencia de errores nuevos, sin iniciar prestart/migraciones ni cambiar despliegue.
- [ ] 8.6 Cerrar evidencia de implementación y reporte de límites/rollback en el change; verificar todas las tareas mediante sus resultados, sin cambios fuente en backend/contracts/DB, specs principales/docs ajenas ni trabajo gráfico preexistente, sin sync/archive/commits automáticos y sin dar por resuelto un bloqueo de verificación.
