# Proposal

## Why

La aplicación mueve el foco automáticamente al montar páginas, resolver anclas y mostrar algunos errores o composers. Esos saltos pueden interrumpir la lectura y la posición de quien navega; se elimina ese comportamiento de aplicación sin perder los destinos, anuncios accesibles ni la gestión de foco que los primitivos Radix necesitan para diálogos, hojas y menús.

## What Changes

- Eliminar las transferencias de foco iniciadas por la aplicación en páginas editoriales, hilos del foro, errores de formularios de autenticación, apertura del composer de respuesta y publicación de comentarios.
- Mantener los scrolls y fragmentos actuales, y dejar visibles los destinos bajo la cabecera sticky sin enfocar automáticamente los elementos.
- Conservar los anuncios, roles, errores, borradores, navegación por anclas y los estilos `:focus-visible` para la interacción real por teclado.
- Preservar explícitamente el autoenfoque accesible, el confinamiento y la restauración de foco gestionados por los primitivos Radix de Dialog, Sheet y DropdownMenu.

## Capabilities

### New Capabilities

### Modified Capabilities
- `presentacion-frontend`: impedir transferencias automáticas de foco de la aplicación y conservar las excepciones de los primitivos Radix y los indicadores de foco visible.
- `modulos-editoriales`: mantener visible el destino de un fragmento sin mover automáticamente el foco al encabezado o sección.
- `foro-retroalimentacion`: conservar la visibilidad de anclas y eliminar transferencias automáticas de foco en el hilo y los composers sin alterar las funciones del foro.

## Impact

- Frontend: `ModuleLayout`, `ThreadPage`, `LoginPage`, `RegisterPage`, `CommentItem`, `CommentComposer` y las vistas/anclas relacionadas.
- Especificaciones de presentación, módulos editoriales y foro; autenticación solo cambia en su presentación general, pues su spec no contiene hoy un requisito específico de foco.
- No cambia la lógica de navegación, scroll/fragmentos, autenticación, publicación, anuncios o estilos de foco visible; la gestión de foco interna de Radix queda fuera del cambio.
