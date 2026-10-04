# Autenticación Specification

## Purpose

Autenticación de usuarios mediante registro tradicional con verificación por correo y Google OIDC, sesiones basadas en cookies HttpOnly con rotación de refresh tokens, como puerta previa al foro y la administración.

## Requirements

### Requirement: Registro con verificación de correo
El registro tradicional SHALL verificar el correo mediante un enlace SMTP de un solo uso. La verificación SHALL entregar una sesión completa: cookies de acceso y refresh establecidas y usuario verificado en la misma respuesta.

#### Scenario: Enlace de verificación válido
- **WHEN** un usuario abre un enlace de verificación vigente
- **THEN** queda autenticado con cookies HttpOnly y estado de correo verificado, sin una segunda petición de sesión

#### Scenario: Enlace vencido o usado
- **WHEN** se abre un enlace de verificación vencido o ya consumido
- **THEN** la verificación falla

### Requirement: Google OIDC sin fusión de cuentas
El ingreso por Google OIDC SHALL crear una cuenta independiente; dos cuentas con el mismo correo SHALL permanecer separadas, sin enlace automático.

#### Scenario: Correo ya registrado
- **WHEN** un usuario se autentica por Google con un correo que ya tiene cuenta tradicional
- **THEN** se crea una cuenta OIDC distinta, sin fusionar credenciales

### Requirement: Secretos solo como hash
Las contraseñas SHALL usar `crypto.scrypt`. Los tokens opacos (refresh, verificación, reset) SHALL generarse de forma aleatoria y almacenarse únicamente como hash.

#### Scenario: Compromiso de la tabla de tokens
- **WHEN** se expone el contenido de la tabla de tokens
- **THEN** los valores originales no son recuperables

### Requirement: Rotación de refresh con revocación de familia
El refresh token SHALL durar 7 días en cookie HttpOnly y rotar en cada uso. La presentación de un refresh ya rotado SHALL revocar toda su familia de sesiones.

#### Scenario: Reutilización detectada
- **WHEN** un refresh token ya rotado se presenta de nuevo
- **THEN** se revocan las sesiones derivadas de esa familia

### Requirement: Reset de contraseña de un solo uso
El reset de contraseña SHALL usar un token de 1 hora y un solo uso, y SHALL revocar las sesiones persistentes al completarse.

#### Scenario: Reset completado
- **WHEN** un usuario completa el reset dentro de la vigencia
- **THEN** su contraseña cambia y sus sesiones persistentes quedan revocadas

### Requirement: Autorización reconsultando la base de datos
Un access JWT SHALL durar 2 horas en cookie HttpOnly y servir solo de identificación; cada operación autorizada SHALL reconsultar el estado del usuario en PostgreSQL dentro de una transacción.

#### Scenario: Token válido con cuenta suspendida
- **WHEN** un access JWT vigente pertenece a un usuario suspendido
- **THEN** la autorización se evalúa contra el estado actual en la base de datos, no contra el token

### Requirement: Cookies seguras y origen verificado
En producción las cookies SHALL ser `Secure`, `HttpOnly` y `SameSite=Lax` con el origen unificado. Las mutaciones SHALL exigir `Origin == APP_ORIGIN`. El access token SHALL permanecer en cookie HttpOnly durante toda la sesión del navegador, fuera del alcance de JavaScript.

#### Scenario: Mutación desde otro origen
- **WHEN** una mutación llega con un `Origin` distinto de `APP_ORIGIN`
- **THEN** se rechaza

### Requirement: Rol ADMIN por comando interno
El rol inicial SHALL ser `USER`; el rol `ADMIN` SHALL asignarse únicamente mediante el comando interno de administración.

#### Scenario: Registro ordinario
- **WHEN** un usuario crea su cuenta
- **THEN** su rol es `USER`
