# Despliegue Specification

## Purpose

Aplicación Node persistente en Koyeb que sirve el frontend compilado y la API desde un único origen.

## Requirements

### Requirement: Un solo origen
En producción, Express SHALL servir el frontend compilado y la API bajo `/api/*` desde el mismo origen.

#### Scenario: Visita pública
- **WHEN** un visitante carga cualquier ruta del sitio en producción
- **THEN** una única aplicación Node atiende la página y la API

### Requirement: Política de caché
`index.html` SHALL servirse sin caché; los activos versionados SHALL servirse con caché inmutable.

#### Scenario: Redespliegue
- **WHEN** se publica una nueva versión
- **THEN** el visitante recibe el `index.html` nuevo de inmediato y reutiliza los activos intactos

### Requirement: Ciclo de vida del proceso
El preinicio SHALL aplicar migraciones antes de atender tráfico. `SIGTERM` SHALL cerrar el servidor y el pool de conexiones de forma ordenada.

#### Scenario: Apagado ordenado
- **WHEN** la plataforma envía `SIGTERM`
- **THEN** el servidor completa el cierre del pool y termina
