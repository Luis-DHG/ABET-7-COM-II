# Proposal

## Why

BlogDPC ya ofrece contenido científico, un mapa bibliométrico y un explorador OFDM; su presentación necesita una jerarquía editorial más consistente para facilitar la lectura y la exploración técnica en escritorio y móvil. El rediseño aprobado adopta un minimalismo editorial con carácter técnico, sin alterar el contenido ni el comportamiento de la aplicación.

La auditoría posterior al cierre 57/57 identifica pendientes reales de conservación, tipografía y evidencia de navegador. Esta revisión incorpora además las dos correcciones locales solicitadas: altura independiente de fichas cerradas en `/analisis` (foto 1) y composer «Blanco + azul» ya aprobado, sin convertirlas en un nuevo proyecto de arquitectura.

## What Changes

- Unificar tipografía, anchos de lectura y exploración, espaciado, superficies y controles mediante los tokens y componentes existentes; conservar Inter local y la paleta del proyecto, sin un sistema visual paralelo.
- Afinar la cabecera, navegación desktop/móvil, cuenta, banner de degradación y footer, conservando destinos, mensajes y acciones; indicar la ubicación activa también por forma y contraste.
- Ordenar los heroes editoriales como ubicación, nombre, headline, introducción y metadatos, sin altura artificial de viewport. Mantener índice abierto en desktop, colapsable en móvil, anclas, glosario y paginación entre los siete módulos.
- Mejorar escala, agrupación y presentación de figuras, tablas, fórmulas, notas, ejemplos, citas y referencias. Permitir parejas explicación/figura cuando constituyan una unidad, sin ocultar contenido hoy visible, recortar información científica ni modificar textos.
- Reorganizar controles, plot, detalle y leyenda del mapa, y parámetros/resultados/supuestos del explorador. Conservar íntegros dataset VOSviewer, coordenadas, clústeres, métricas, reglas de representación, fórmulas, valores y límites OFDM.
- Mejorar la lectura de todo el historial de raíces y respuestas del foro hasta seis niveles, y armonizar la presentación de autenticación, administración, legales y estados existentes, sin cambiar permisos, validación, sesión, API ni lógica como parte del rediseño visual.
- Normalizar todas las animaciones del alcance a tokens rápido de 120 ms y normal de 160 ms, sin demoras ni movimiento decorativo permanente. Aplicar movimiento reducido también a la cámara y los gestos nativos del grafo, no solo a CSS.
- Conservar los contratos de contenido, layout, contraste AA, teclado, foco, targets y movimiento. Las verificaciones se limitan al alcance vigente, separando pruebas funcionales deterministas de inspección visual directa; 7.6 usó únicamente la matriz responsive 360/768/1440 px a zoom 100 %. Esta matriz no se presenta como comprobación WCAG de ampliación al 200 % y no reabre pruebas ya concluidas.
- Corregir el estiramiento por la rejilla de los details de clústeres cerrados: altura propia de summary y bordes, independiente del vecino abierto; conservar ocho fichas, apertura múltiple, teclado y todos sus datos/textos.
- Aplicar exclusivamente al composer de comentario y respuesta superficie blanca, borde azul sobrio, padding cómodo y foco visible, sin sombras llamativas ni modo oscuro. Preservar errores, contador, Cancelar, borrador, validaciones, permisos y handlers; no cambiar otros formularios ni estilos globales de inputs.
- Incorporar la decisión más reciente: retirar del checklist activo 5.10, 8.5 y 8.6, además de 1.6, 3.10, 5.4 y 8.1 retiradas antes, sin renumerar ni declararlas hechas. El change queda con 52 casillas activas, todas completas. La retirada es por decisión del usuario, no verificación aprobada: el recorrido admin queda sin exigir y los hallazgos de loading prematuro y devolución de foco permanecen documentados como no remediados en `evidence/admin-engineer-inspection-outcome.md`; el build+revisión browser integrada final deja de exigirse y el build y las verificaciones ya ejecutadas conservan su valor histórico; el reporte de cierre/gate READY deja de exigirse, no se emite READY ni se afirma certificación runtime integral. 2.2, 3.4, 3.6, 6.7, 7.6, 8.3/8.4 y 9.1/9.2 conservan sus cierres históricos. Los requisitos de producto, incluidas transferencias científicas originales y política funcional del foro, no se retiran al omitir esas verificaciones.
- Aceptar el ajuste de una línea ya entregado de 3.6 que conserva el tamaño base del enlace, con oráculo corregido, RED real y check raíz verde histórico. Según la corrección factual confirmada por el usuario, el GREEN puntual de cuatro estados sí fue ejecutado y registrado en `map-size-green.json` (cuatro checks sin diferencias; positivos 1000/45/38/1000), y la suite unitaria 7/7 también se ejecutó. Solo la revalidación AMPLIA histórica `resource-checks` fue cancelada/no acreditada por timeout MCP sin reporte y queda retirada por 3.10/8.1. 3.6 quedó cerrada tras la lectura de fuente/evidencia por el ingeniero, sin nueva ejecución ni cobertura adicional atribuida.

## Capabilities

### New Capabilities

- `presentacion-frontend`: contrato transversal de lenguaje visual, shell, movimiento rápido, adaptación responsive y presentación de estados y flujos auxiliares existentes; no introduce una nueva funcionalidad de negocio.

### Modified Capabilities

- `modulos-editoriales`: añadir criterios de conservación y composición editorial, ubicación sin progreso completado y presentación fiel de figuras, mapa bibliométrico y explorador OFDM.
- `foro-retroalimentacion`: añadir legibilidad de raíces y respuestas con sangría visual acumulada acotada, conservando el árbol histórico; la política y el copy de nuevas publicaciones pertenecen exclusivamente a `foro-respuestas-directas-limitadas`.
- `sesion-web`: ampliar la accesibilidad operativa con contraste AA, foco no oculto, targets y operación equivalente sin hover ni color como único indicador; conservar sus reglas de sesión y caché.

## Impact

La implementación futura se limita a presentación en `apps/web`: `index.css`, `components/ui`, `AppShell`, `ModuleLayout`, wrappers de `moduleContent.tsx`, recursos editoriales y vistas públicas/auxiliares. Se reutilizan React 19, Vite, Tailwind 4, shadcn/Radix, Sigma/Graphology y recursos locales; no se prevén dependencias nuevas ni cambios de stack.

No hay cambios de endpoints, backend, contracts, base de datos, seguridad ni flujos de autenticación dentro del rediseño visual. Las pruebas futuras se concentran en conservación y presentación frontend; esta propuesta no implementa producto ni tests. Al continuar ambos planes aprobados, la elegibilidad de nuevas respuestas solo a raíz, el cupo de seis respuestas directas y su copy funcional mínimo quedan fuera de este scope y autorizados exclusivamente por `foro-respuestas-directas-limitadas`. Las cláusulas de conservación de condiciones, mensajes y lógica de este planning se aplican a ediciones puramente visuales y no bloquean esa implementación funcional independiente; no autorizan ningún otro cambio de comportamiento ni de textos editoriales o legales.

La reparación completa del ciclo de revalidación del hilo pertenece a 3.3 del change funcional, no al estilo del composer. Retirar 5.4 elimina la obligación de corregir/reejecutar su script histórico, no la regla vigente de Responder solo a raíz ni la lectura hasta nivel 6; ese oráculo multinivel no sirve para certificar la política actual. Conservar todos los informes pasados como historial, sin borrar ni rebaselinar contra regresiones. No se modifican el change `actualiza-modulos-editoriales`, legales completos aprobados, specs principales ni documentación ajena.

El tester se delega únicamente para TDD de cambios funcionales con resultado determinista que puedan romper funcionalidad; inspecciones visuales y documentación las verifica directamente el ingeniero. Todo nuevo cambio funcional mantiene check/lint desde raíz, tests afectados y build frontend como verificación técnica obligatoria: retirar 8.1 no la prohíbe ni la dispensa. 8.3 revisó solo el alcance vigente e identificó verificaciones retiradas/no ejecutadas; 8.5 y 8.6 están retiradas y ninguna casilla, retirada o validación CLI sostiene READY con resultados inexistentes. La prueba de carrera PostgreSQL conserva su excepción protegida y su skip explícito si falta base aislada/autorización; los mocks no la certifican. El gate READY deja de exigirse: no se emite READY ni se afirma certificación runtime integral; cualquier cierre futuro que el usuario solicite distinguiría el GREEN puntual documentado y la suite 7/7 de 3.6 de la revalidación amplia `resource-checks` cancelada/no acreditada, con las limitaciones declaradas. Este update no implementa, ejecuta tests, sincroniza, archiva ni crea commits.

### Non-goals

SEO; redacción o corrección editorial/legal; nuevas secciones, estados, copy, funcionalidades o controles; contenido para video o experiencia grupal pendientes; sustituciones decorativas de activos externos; CMS, modo oscuro, nuevas plataformas, librerías de animación y refactors ajenos. Las discrepancias preexistentes de contexto/specs/implementación se documentan en el diseño, sin resolverlas dentro del rediseño.
