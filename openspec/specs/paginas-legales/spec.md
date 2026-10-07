# Páginas legales Specification

## Purpose

Páginas estáticas de política de privacidad y términos y condiciones, derivadas de los documentos legales aprobados.

## Requirements

### Requirement: Rutas legales públicas
El sitio SHALL servir `/privacidad` con la política de tratamiento de datos personales y `/terminos` con los términos y condiciones aprobados por el Grupo 3 para BlogDPC, como páginas estáticas de lectura pública. Ambas páginas SHALL mostrar sus secciones completas y numeradas, contacto mediante enlace de correo y enlace al documento relacionado, sin el aviso de documento en preparación.

#### Scenario: Acceso directo
- **WHEN** un visitante abre `/privacidad`
- **THEN** la política de datos personales se muestra completa sin autenticación

#### Scenario: Lectura de términos
- **WHEN** un visitante abre `/terminos` sin sesión
- **THEN** encuentra los términos completos, con cuenta, foro, permiso técnico limitado de comentarios, contenido educativo, proveedores, cierre y contacto

### Requirement: Contenido de privacidad aprobado
La política SHALL identificar al Grupo 3 como responsable y publicar `chaconvargasfabiancamilo@gmail.com` como contacto. SHALL describir datos de cuenta y Google, comentarios públicos, finalidad de operar cuentas y foro, ausencia de venta y publicidad, proveedores técnicos, ubicación West US, logs en Supabase, ausencia de almacenamiento persistente de IP, cookies técnicas, cierre y eliminación de la base y registros el 31 de marzo de 2027 sin respaldos, ausencia de eliminación individual en la interfaz y solicitudes sobre datos por correo. Las declaraciones operativas SHALL reproducir las indicaciones del usuario sin añadir datos faltantes ni presentarse como funciones nuevas de la aplicación.

#### Scenario: Consulta de retención
- **WHEN** el visitante consulta la sección de retención de `/privacidad`
- **THEN** lee la fecha de cierre del 31 de marzo de 2027, el borrado de base y registros, la ausencia de copias de respaldo y la ausencia de una opción de eliminar cuenta en la aplicación

### Requirement: Contenido de términos aprobado
Los términos SHALL describir el servicio educativo ISAC/6G, cuentas y correo verificado, responsabilidad sobre credenciales, lectura pública del foro, límites de 3 a 2000 caracteres y seis niveles, intervalo de publicación, ausencia de edición y eliminación individual de comentarios, conservación de derechos del autor con autorización limitada de alojamiento y visualización sin publicidad, proveedores, cierre y contacto. SHALL omitir la sección de moderación conforme a la instrucción del usuario.

#### Scenario: Consulta sobre comentarios
- **WHEN** el visitante lee los términos del foro
- **THEN** encuentra la visibilidad pública del nombre y comentario, la privacidad del correo, el permiso técnico limitado y los límites de publicación sin una sección de moderación

### Requirement: Enlaces legales en la navegación global
El footer y la navegación SHALL enlazar las páginas legales y el foro sin alterar la jerarquía de los siete módulos.

#### Scenario: Acceso desde cualquier página
- **WHEN** el visitante está en cualquier módulo
- **THEN** el pie de página ofrece los enlaces a privacidad, términos y retroalimentación
