# Páginas legales Specification

## Purpose

Páginas estáticas de política de privacidad y términos y condiciones, derivadas de los documentos legales aprobados.

## Requirements

### Requirement: Rutas legales públicas
El sitio SHALL servir `/privacidad` con la política de datos personales y `/terminos` con los términos y condiciones, como páginas estáticas de lectura pública.

#### Scenario: Acceso directo
- **WHEN** un visitante abre `/privacidad`
- **THEN** la política de datos personales se muestra completa sin autenticación

### Requirement: Enlaces legales en la navegación global
El footer y la navegación SHALL enlazar las páginas legales y el foro sin alterar la jerarquía de los siete módulos.

#### Scenario: Acceso desde cualquier página
- **WHEN** el visitante está en cualquier módulo
- **THEN** el pie de página ofrece los enlaces a privacidad, términos y retroalimentación
