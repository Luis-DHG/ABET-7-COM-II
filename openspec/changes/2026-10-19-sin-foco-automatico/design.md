# Design

## Context

See `proposal.md` for motivation and `specs/` for the behavior contract. El frontend actual desplaza al inicio o al hash al abrir una página editorial, pero también enfoca su H1/destino; el hilo desplaza al comentario del hash y lo enfoca. Hay transferencias adicionales al resumen de error de login/registro, al textarea de respuesta y al párrafo `sr-only` después de publicar. La cabecera editorial es sticky y el foro conserva anclas históricas. Los controles Dialog, Sheet y DropdownMenu usan primitivos Radix cuya gestión de foco es deliberada y debe permanecer intacta.

## Goals / Non-Goals

**Goals:**
- Separar el movimiento de scroll necesario para mantener navegación y fragmentos del movimiento programático de foco que se elimina.
- Retirar únicamente los focos iniciados por la aplicación en los flujos observados y conservar los anuncios accesibles, datos y estados.
- Proteger explícitamente la gestión de foco de Radix y el estilo de foco visible de la navegación real por teclado.

**Non-Goals:**
- Cambiar rutas, identificadores de ancla, secuencia de navegación, contenido, posición de scroll intencional, anuncios, mensajes, borradores, formularios o reglas del foro.
- Eliminar `tabIndex` o mecanismos que permiten enfocar un destino por una acción explícita de la persona.
- Modificar Dialog, Sheet, DropdownMenu, su foco inicial, trapping/confinamiento o restauración al cerrar.
- Cambiar estilos globales, `:focus-visible`, endpoints, autenticación o lógica de publicación.

## Decisions

1. **Quitar los focos explícitos de la aplicación, no la navegación de scroll.** En la carga editorial se conserva el scroll al inicio o al hash; en el hilo se conserva el scroll al comentario. Se elimina la transferencia automática al H1, sección o comentario. Se conserva la navegación con fragmentos y se verifica que el destino quede visible bajo la cabecera sticky. Quitar también el scroll fue considerado y descartado porque alteraría el comportamiento de navegación solicitado.

2. **No enfocar resúmenes ni anuncios para comunicar errores o publicaciones.** Se retiran las transferencias al resumen de error de login/registro y al párrafo de anuncio después de publicar; la apertura de Responder deja el foco donde lo puso la activación y no autoenfoca el campo. Se mantienen intactos `role`, `aria-live`, asociaciones de campos, anuncios, resultado publicado, valores y borradores. Sustituir estas acciones con otro foco automático o eliminar los anuncios fueron alternativas descartadas: la primera mantendría el salto y la segunda perdería información accesible.

3. **La excepción Radix queda limitada a la gestión propia del primitivo.** No se desactivan handlers ni opciones de foco de Dialog, Sheet o DropdownMenu, ni se hace una limpieza global de `autoFocus` que afecte esos componentes. Los cambios de foco que resulten de la interacción nativa de la persona (por ejemplo, tabular o activar un control) siguen permitidos. Una eliminación global de toda gestión automática fue descartada porque rompería los patrones de accesibilidad de overlays y menús.

4. **No cambiar la presentación del foco visible.** Los estilos `:focus-visible` actuales permanecen; no se resuelven saltos de foco ocultando outlines ni cambiando el orden de tabulación.

## Risks / Trade-offs

- [Al retirar el foco de un resumen, el usuario de tecnología asistiva puede no percibir un error] → conservar los anuncios/roles `alert` y las asociaciones actuales a campos; validar que sigan anunciándose sin transferencia de foco.
- [El destino de un hash puede quedar debajo de la cabecera sticky al conservar solo el scroll] → comprobar anclas de módulos y comentarios en layouts móviles y desktop; ajustar únicamente la posición de scroll si hace falta, sin enfocar el destino.
- [Una limpieza demasiado amplia puede degradar Dialog, Sheet o DropdownMenu] → limitar los cambios a los focos de aplicación inventariados y verificar apertura, navegación por teclado, cierre y restauración de foco de Radix.
- [Un cambio colateral puede ocultar el indicador de foco por teclado] → verificar `:focus-visible` en navegación y formularios, sin modificar sus estilos.
