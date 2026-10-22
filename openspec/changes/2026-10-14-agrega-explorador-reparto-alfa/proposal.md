# Proposal

## Why

El módulo 4 explica el reparto teórico de potencia α entre comunicación y sensado, pero su explorador actual no permite recorrer esa relación. Un segundo explorador convierte la ecuación en una experiencia de predicción, comparación y reflexión, sin declarar un reparto universalmente mejor ni una detección real.

## What Changes

- Se añade, después de «Cómo leer el explorador», una experiencia interactiva para apostar por el cambio de tasa, ajustar α, elegir dos escenarios de usuario/objeto independientes y observar las salidas ideales de comunicación y radar.
- Se muestran la curva de compromiso, la ficha de parámetros y supuestos, y preguntas para interpretar la relación entre comunicar y percibir.
- Se reemplaza la nota sobre límites de un explorador por una nota breve sobre los límites compartidos de ambos exploradores.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `modulos-editoriales`: amplía el mini-caso OFDM-DFRC con un explorador interactivo del reparto de potencia α y escenarios para sus comportamientos observables.

## Impact

El cambio afecta el contenido del módulo 4 en `apps/web/src/pages/moduleContent.tsx`, un modelo puro en `apps/web/src/lib/alphaTradeoff.ts`, el componente diferido del nuevo explorador, estilos editoriales y pruebas unitarias del modelo. No añade dependencias, rutas, entradas al índice, APIs ni almacenamiento persistente. No sincroniza la spec principal ni archiva este change.
