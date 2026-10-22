# Design

## Context

Ver `proposal.md` y el delta de `paginas-legales`. `LegalPage.tsx` ya comparte título, contacto y enlace cruzado entre ambas rutas; solo falta el cuerpo aprobado.

## Goals / Non-Goals

**Goals:** contenido estático legible, con encabezados semánticos y enlaces existentes.

**Non-Goals:** nuevos flujos de consentimiento, eliminación de cuentas, envío de logs, borrado programado o cambios de backend.

## Decisions

Extender los documentos existentes con secciones y párrafos estáticos y renderizarlos con el layout actual. Evitar un parser Markdown o dependencias para dos documentos. Añadir título y descripción de página siguiendo el patrón ya usado en los módulos.

## Risks / Trade-offs

- [Riesgo] Las declaraciones de West US, logs en Supabase y eliminación sin respaldos son decisiones del usuario, no comprobaciones de infraestructura → conservar su procedencia en este change sin atribuir implementación técnica a la publicación del texto.
- [Riesgo] Hay trabajo concurrente de estética en el repo → limitar el código a `LegalPage.tsx` y usar sus clases existentes.
