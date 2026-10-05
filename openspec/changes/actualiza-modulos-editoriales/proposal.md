# Proposal

## Why

Este change se creó para corregir la discrepancia entre la implementación editorial ya presente y la spec que entonces describía espacios reservados. La spec principal ya fue sincronizada mediante el flujo OpenSpec; no se modificó código, y el contrato distingue los contenidos implementados de los elementos que siguen pendientes.

## What Changes

- Se sustituyó el requisito de contenido exclusivamente reservado por una descripción verificable de la estructura temática implementada en los siete módulos, sin copiar bloques extensos de contenido.
- Se precisó que los estados pendientes de video y reflexión grupal se presentan como tales, sin atribuirles contenido o experiencias no documentadas.
- Se completó el requisito del mini-caso con el modelo OFDM-DFRC ideal, sus métricas e interacciones observables, distinguiendo las ecuaciones del reparto de potencia α de los controles reales del explorador.
- Se aclaró que, tras el séptimo módulo, la paginación ocupa visualmente el espacio del siguiente con un enlace a la ruta independiente del foro y el cuerpo también ofrece un CTA; ninguno crea un octavo módulo.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `modulos-editoriales`: actualizó el alcance editorial observable de los siete módulos y precisó la navegación al foro y el comportamiento del mini-caso.

## Impact

El delta describe el comportamiento visible en `apps/web/src/pages/moduleContent.tsx`, la composición de páginas y navegación de `apps/web/src/pages/ModulePage.tsx`, `apps/web/src/components/ModuleLayout.tsx` y `apps/web/src/lib/manifest.ts`, y los componentes y estilos editoriales que usan. La spec principal `openspec/specs/modulos-editoriales/spec.md` ya fue sincronizada mediante el flujo OpenSpec. No se modificó código de aplicación, API, dependencias ni otras capacidades; el change permanece sin archivar.
