# Sesión en el frontend Specification

## Purpose

Comportamiento del navegador frente a la sesión y a los fallos de red: la sesión se degrada sin perderse por accidente y la interfaz conserva foco y anuncios accesibles.

## Requirements

### Requirement: Renovación única ante 401
Un `401` confirmado SHALL activar exactamente una renovación compartida; las peticiones simultáneas SHALL esperar esa misma renovación en vez de disparar las suyas.

#### Scenario: Expiración con peticiones en vuelo
- **WHEN** el access token expira con varias peticiones en vuelo
- **THEN** ocurre una sola renovación y todas las peticiones se reintentan con el nuevo token

### Requirement: Resiliencia ante fallos de red
Un error de red SHALL conservar las cookies y la sesión local. El evento `online` SHALL reintentar la renovación y la comprobación de sesión.

#### Scenario: Caída temporal de red
- **WHEN** la red falla durante una renovación
- **THEN** el usuario conserva su sesión local y, al volver la red, la renovación se reintenta

### Requirement: Caché del foro en memoria
La página del foro SHALL conservar en memoria comentarios, cursor y páginas cargadas: al volver a la ruta pinta el contenido almacenado de inmediato y revalida en segundo plano cuando la caché está vencida. Publicar SHALL actualizar la caché y moderar SHALL marcarla obsoleta.

#### Scenario: Retorno al foro
- **WHEN** el usuario vuelve a `/retroalimentacion` tras navegar otra ruta
- **THEN** ve el contenido almacenado de inmediato, sin pantalla vacía ni skeletons que reemplacen contenido útil

### Requirement: Accesibilidad operativa

Formularios, diálogos, popovers y mensajes SHALL mantener foco visible y usar `aria-live` cuando corresponda. El glosario SHALL operar con clic, foco y teclado, con el hover solo como mejora secundaria.

La interfaz SHALL satisfacer contraste de nivel AA: al menos 4,5:1 para texto normal, 3:1 para texto grande y 3:1 para indicadores esenciales de controles y foco respecto de sus colores adyacentes. La selección, estados activos, errores y acciones destructivas SHALL entenderse por texto, forma o jerarquía además de color. Los controles y la lectura SHALL operar sin depender de hover; menús y diálogos SHALL conservar su manejo de teclado, foco inicial, cierre y devolución de foco, sin que cabecera u overlays oculten el elemento enfocado.

Los controles independientes de acción, entradas de menú, iconos accionables, campos y sliders SHALL disponer de targets de al menos 44 por 44 px equivalentes. Los enlaces integrados en texto SHALL cumplir las excepciones de targets de WCAG 2.2 AA sin reducir su legibilidad ni ocultar su foco. La interfaz SHALL conservar estas condiciones en la matriz responsive de 360, 768 y 1440 px de ancho a zoom 100 %, incluidos índice, tablas/fórmulas con scroll local, búsqueda/filtros del mapa y acciones del foro. Esa matriz verifica adaptación responsive y no constituye una afirmación de cumplimiento de criterios WCAG de ampliación al 200 %. Las ediciones puramente visuales SHALL conservar los nombres, etiquetas y anuncios actuales, sin sustituirlos por iconos o copy nueva; el copy funcional de publicación del foro autorizado exclusivamente por `foro-respuestas-directas-limitadas` SHALL quedar fuera de esa restricción visual y SHALL mantener las mismas condiciones de accesibilidad, sin cambiar las reglas de sesión.

#### Scenario: Navegación por teclado
- **WHEN** un usuario recorre la interfaz solo con teclado
- **THEN** el foco es visible en cada control y el glosario responde a foco y activación por teclado

#### Scenario: Menú y diálogo con foco restaurado
- **WHEN** se abre un menú o diálogo por teclado, se recorre y se cierra con su acción existente o Escape cuando corresponda
- **THEN** se conserva su manejo de foco, el elemento enfocado es visible y el foco vuelve al disparador sin esperar a una animación

#### Scenario: Contraste y acciones sin hover
- **WHEN** se revisan navegación activa, mapa seleccionado, formularios con errores y acciones destructivas sin hover
- **THEN** se alcanzan los contrastes exigidos, los controles independientes tienen targets de 44 por 44 px y la información o selección no depende únicamente de color

#### Scenario: Reflow accesible en la matriz responsive
- **WHEN** se navega con teclado en los viewports de 360, 768 y 1440 px de ancho a zoom 100 %
- **THEN** siguen disponibles controles, mensajes y lectura, no se recorta el foco y el scroll de una tabla o fórmula ancha se opera localmente sin desbordar la página
