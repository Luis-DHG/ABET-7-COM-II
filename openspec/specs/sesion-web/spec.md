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

#### Scenario: Navegación por teclado
- **WHEN** un usuario recorre la interfaz solo con teclado
- **THEN** el foco es visible en cada control y el glosario responde a foco y activación por teclado
