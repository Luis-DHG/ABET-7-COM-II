# BlogDPC — Aplicación web full-stack

Aplicación web construida con React, Express y PostgreSQL alojado en Supabase. Este README describe la implementación y ejecución de la rama `dev_content`.

## Descripción técnica

El proyecto es un monorepo pnpm con tres partes principales:

- **Frontend (`apps/web`)**: aplicación de una sola página con React 19, TypeScript, Vite y React Router. Incluye rutas de contenido, autenticación, foro y administración.
- **Backend (`apps/server`)**: API REST en Node.js y Express 5. Gestiona sesiones, autorización, correo, lógica del foro y el acceso a la base de datos.
- **Base de datos**: PostgreSQL alojado en Supabase. El backend se conecta usando `postgres` y Drizzle ORM; el navegador no usa el cliente de Supabase ni accede directamente a la base de datos.

En desarrollo, Vite sirve el frontend y reenvía `/api` al servidor local. En producción, Express puede servir el frontend compilado y la API desde el mismo origen.

## Motivo de las tecnologías

Se priorizaron herramientas que permitieran implementar y mantener los flujos del proyecto con rapidez, sin administrar infraestructura de base de datos propia.

- **React** permite organizar la interfaz en componentes reutilizables y gestionar estado de cliente en los flujos interactivos de sesión, formularios, conversaciones del foro y administración.
- **Express** centraliza las reglas de negocio, la autenticación y la autorización en el servidor. Así, las credenciales y las operaciones de base de datos no quedan expuestas al navegador.
- **Supabase** proporciona PostgreSQL administrado, evitando tener que instalar y operar un servidor de base de datos. Se usa como proveedor de PostgreSQL, no como proveedor de autenticación ni como API directa para el frontend.
- **Drizzle ORM** ofrece consultas y esquema tipados desde TypeScript, y Drizzle Kit genera migraciones SQL a partir del esquema. Las migraciones se guardan y revisan como código antes de aplicarlas; las capacidades específicas de PostgreSQL siguen expresándose en SQL cuando hace falta.

## Requisitos

- Node.js y pnpm instalados.
- Una base de datos PostgreSQL disponible en Supabase.
- Credenciales SMTP para enviar correos de verificación y recuperación de contraseña.
- Credenciales de Google OIDC para el inicio de sesión con Google, con la URL de redirección configurada para la aplicación.

El servidor valida la configuración al arrancar y requiere las credenciales SMTP y Google OIDC aunque se quiera probar solo la interfaz.

## Instalación y configuración

Desde la raíz del repositorio:

```sh
pnpm install
```

Aplica las migraciones existentes a la base de datos:

```sh
pnpm --filter @blogdpc/server db:migrate
```

## Ejecución

### Comandos manuales

Abre dos terminales desde la raíz del repositorio.

Terminal 1 — backend, en `http://localhost:3000`:

```sh
pnpm dev
```

Terminal 2 — frontend, normalmente en `http://localhost:5173`:

```sh
pnpm --filter @blogdpc/web dev
```

Abre la dirección del frontend en el navegador. Vite reenvía las solicitudes `/api` al backend local.

### Atajo para Windows

También puedes ejecutar `start-dev.bat` desde la raíz del repositorio. El archivo instala las dependencias e inicia el backend y el frontend en ventanas separadas.

## Uso de la aplicación

- Navega por las secciones disponibles desde el frontend.
- Usa el registro con correo —requiere verificarlo mediante el mensaje enviado por SMTP— o inicia sesión con Google.
- El foro permite consultar conversaciones y publicar después de iniciar sesión y verificar el correo.
- Las rutas de administración requieren una cuenta con rol `ADMIN`; la asignación inicial del rol se realiza mediante el comando interno `pnpm --filter @blogdpc/server admin:create` (requiere `ADMIN_EMAIL`, `ADMIN_NAME` y `ADMIN_PASSWORD` en `.env`).

## Comprobaciones y build

Desde la raíz del repositorio:

```sh
pnpm check
pnpm lint
pnpm test
pnpm build
```

`pnpm lint` ejecuta Oxlint en el frontend. Las pruebas de base de datos requieren una base de pruebas aislada y no se ejecutan con la configuración local predeterminada.
