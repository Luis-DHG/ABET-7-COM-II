# Proposal

## Why

BlogDPC ya ofrece contenido científico, un mapa bibliométrico y un explorador OFDM; su presentación necesita una jerarquía editorial más consistente para facilitar la lectura y la exploración técnica en escritorio y móvil. El rediseño aprobado adopta un minimalismo editorial con carácter técnico, sin alterar el contenido ni el comportamiento de la aplicación.

## What Changes

- Unificar tipografía, anchos de lectura y exploración, espaciado, superficies y controles mediante los tokens y componentes existentes; conservar Inter local y la paleta del proyecto, sin un sistema visual paralelo.
- Afinar la cabecera, navegación desktop/móvil, cuenta, banner de degradación y footer, conservando destinos, mensajes y acciones; indicar la ubicación activa también por forma y contraste.
- Ordenar los heroes editoriales como ubicación, nombre, headline, introducción y metadatos, sin altura artificial de viewport. Mantener índice abierto en desktop, colapsable en móvil, anclas, glosario y paginación entre los siete módulos.
- Mejorar escala, agrupación y presentación de figuras, tablas, fórmulas, notas, ejemplos, citas y referencias. Permitir parejas explicación/figura cuando constituyan una unidad, sin ocultar contenido hoy visible, recortar información científica ni modificar textos.
- Reorganizar controles, plot, detalle y leyenda del mapa, y parámetros/resultados/supuestos del explorador. Conservar íntegros dataset VOSviewer, coordenadas, clústeres, métricas, reglas de representación, fórmulas, valores y límites OFDM.
- Mejorar la lectura de raíces y respuestas del foro hasta seis niveles, y armonizar la presentación de autenticación, administración, legales y estados existentes, sin cambiar permisos, validación, sesión, API ni lógica.
- Normalizar todas las animaciones del alcance a tokens rápido de 120 ms y normal de 160 ms, sin demoras ni movimiento decorativo permanente. Aplicar movimiento reducido también a la cámara y los gestos nativos del grafo, no solo a CSS.
- Verificar conservación, layout, contraste AA, teclado, foco, targets y movimiento con criterios deterministas separados de la evaluación visual, a 360/768/1440 px y zoom del 200 %.

## Capabilities

### New Capabilities

- `presentacion-frontend`: contrato transversal de lenguaje visual, shell, movimiento rápido, adaptación responsive y presentación de estados y flujos auxiliares existentes; no introduce una nueva funcionalidad de negocio.

### Modified Capabilities

- `modulos-editoriales`: añadir criterios de conservación y composición editorial, ubicación sin progreso completado y presentación fiel de figuras, mapa bibliométrico y explorador OFDM.
- `foro-retroalimentacion`: añadir legibilidad de raíces y respuestas con sangría visual acumulada acotada, sin cambiar el árbol ni sus reglas.
- `sesion-web`: ampliar la accesibilidad operativa con contraste AA, foco no oculto, targets y operación equivalente sin hover ni color como único indicador; conservar sus reglas de sesión y caché.

## Impact

La implementación futura se limita a presentación en `apps/web`: `index.css`, `components/ui`, `AppShell`, `ModuleLayout`, wrappers de `moduleContent.tsx`, recursos editoriales y vistas públicas/auxiliares. Se reutilizan React 19, Vite, Tailwind 4, shadcn/Radix, Sigma/Graphology y recursos locales; no se prevén dependencias nuevas ni cambios de stack.

No hay cambios de endpoints, backend, contracts, base de datos, seguridad ni flujos de autenticación. Las pruebas futuras se concentran en conservación y presentación frontend; esta propuesta no implementa producto ni tests.

### Non-goals

SEO; redacción o corrección editorial/legal; nuevas secciones, estados, copy, funcionalidades o controles; contenido para video o experiencia grupal pendientes; sustituciones decorativas de activos externos; CMS, modo oscuro, nuevas plataformas, librerías de animación y refactors ajenos. Las discrepancias preexistentes de contexto/specs/implementación se documentan en el diseño, sin resolverlas dentro del rediseño.
