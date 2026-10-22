# Design

## Context

Ver `proposal.md` para la motivación y `specs/modulos-editoriales/spec.md` para el contrato observable. La aplicación mantiene las siete rutas como contenido estático en español, las proyecta con un layout común y carga algunos recursos interactivos de forma diferida. Los recursos observados incluyen un mapa VOSviewer, un explorador de parámetros OFDM, un glosario desplegable, fórmulas y figuras con texto alternativo, leyendas y atribución. El foro tiene una ruta propia; la invitación que aparece al terminar el séptimo módulo no cambia esa separación. La spec principal ya fue sincronizada con este delta mediante el flujo OpenSpec; no se modificó código de aplicación.

## Goals / Non-Goals

**Goals:**

- Describir el contenido verificable por módulo a nivel de tema y estructura, sin trasladar a la spec los bloques editoriales extensos.
- Distinguir el modelo teórico del mini-caso de los controles y salidas que ofrece hoy el explorador.
- Mantener el estado pendiente del video y de las experiencias grupales no registradas.
- Reflejar la invitación al foro sin integrarlo en la secuencia ni alterar las siete rutas.

**Non-Goals:**

- Modificar código, contenido editorial, rutas, recursos visuales o interacciones.
- Añadir una curva interactiva para α, simulación, video o reflexiones grupales.
- Cambiar capacidades distintas de `modulos-editoriales` o volver a sincronizar la spec principal, que ya fue actualizada mediante OpenSpec.

## Decisions

1. **Reemplazar el requisito de contenido reservado, no conservarlo como regla vigente.** El requisito existente afirma que las páginas no tienen texto editorial. Se elimina con razón y migración explícitas y se añade un requisito resumido por módulo, con escenarios para los recursos/interacciones observables. Así se evita que el título antiguo o la afirmación de contenido reservado contradigan la implementación.
2. **Separar el modelo α del explorador real.** Las ecuaciones de potencia, capacidad y SNR describen el compromiso; los controles disponibles varían ancho de banda, símbolos, distancia y velocidad. La spec documenta ambos niveles y el límite declarado, sin atribuir al explorador una interacción que no tiene.
3. **Mantener la independencia del foro aunque la UI use la posición visual del siguiente.** Después de `/glosario` no existe otro módulo; la paginación muestra allí «A continuación» / «Retroalimentación — sección independiente» hacia `/retroalimentacion`, y el cuerpo incluye además el CTA «Compartir en el foro». Ambos enlaces conducen a la sección independiente sin ampliar la secuencia de siete módulos.
4. **Resumir estructura y límites en lugar de copiar la prosa del sitio.** Se incluyen temas verificables, las formas principales de interacción y los estados pendientes; las cifras o afirmaciones de contenido se conservan solo cuando hacen comprobable la descripción de una sección.

## Risks / Trade-offs

- [Riesgo] El contenido editorial, las métricas del mapa o los recursos pueden cambiar después de la sincronización → revisar los escenarios frente al código y actualizar la spec mediante OpenSpec si cambia el comportamiento.
- [Riesgo] La mención del modelo α puede hacer pensar que el control existe en el explorador → especificar sus controles observables y su limitación de forma expresa.
- [Riesgo] El enlace al foro en la posición visual del módulo siguiente puede confundirse con un octavo módulo → conservar sus etiquetas de sección independiente y declarar que la secuencia editorial termina en `/glosario`.
