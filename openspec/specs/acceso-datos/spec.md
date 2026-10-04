# Acceso a datos Specification

## Purpose

PostgreSQL administrado por Supabase como único almacén persistente, alcanzable exclusivamente a través de la API Express bajo un esquema privado y privilegios mínimos.

## Requirements

### Requirement: Puerta única de acceso
Toda lectura y escritura de datos SHALL pasar por la API Express. Supabase Auth y la Data API SHALL permanecer fuera como vías de acceso a datos.

#### Scenario: Cliente directo a la base
- **WHEN** un cliente intenta alcanzar los datos sin pasar por Express
- **THEN** carece de credenciales y permisos para hacerlo

### Requirement: Esquema privado aislado
Los datos de aplicación SHALL vivir en el esquema privado `app` (`users`, `account_tokens`, `refresh_tokens`, `comments`), con `ltree` disponible en `extensions`. Los módulos estáticos y las páginas legales SHALL carecer de representación en base de datos.

#### Scenario: Roles públicos de Supabase
- **WHEN** `anon`, `authenticated` o `service_role` intenta leer el esquema `app`
- **THEN** el RLS habilitado y forzado lo impide

### Requirement: Rol de aplicación con privilegios mínimos
La aplicación SHALL conectarse con el rol dedicado `blogdpc_app`, con permisos por tabla y columna y sin privilegios administrativos.

#### Scenario: Intento administrativo desde la aplicación
- **WHEN** la aplicación intenta una operación administrativa
- **THEN** PostgreSQL la rechaza por falta de privilegio

### Requirement: Migraciones versionadas y cadenas PostgreSQL
Los cambios de esquema SHALL generarse con drizzle-kit, revisarse en SQL y versionarse en el repositorio antes de producción. Las cadenas de conexión SHALL ser PostgreSQL (`postgresql://` o `postgres://`), con `DATABASE_MIGRATION_URL` administrativa separada de la `DATABASE_URL` restringida de la aplicación.

#### Scenario: URL HTTPS del proyecto Supabase
- **WHEN** se configura la URL HTTPS del proyecto Supabase como cadena de conexión
- **THEN** la configuración la rechaza
