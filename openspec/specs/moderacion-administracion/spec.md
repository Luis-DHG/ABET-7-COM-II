# Moderación y administración Specification

## Purpose

Panel interno para moderar comentarios y gestionar usuarios, con contexto relacional suficiente para decidir sin interpretar identificadores opacos.

## Requirements

### Requirement: Acceso restringido por rol
El panel administrativo SHALL exigir rol `ADMIN`.

#### Scenario: Usuario común
- **WHEN** un usuario con rol `USER` abre una ruta administrativa
- **THEN** se le niega el acceso

### Requirement: Contexto de relación en el listado de comentarios
La vista administrativa de comentarios SHALL mostrar profundidad, autor y extracto del padre, y estado del padre, manteniendo el orden cronológico.

#### Scenario: Respuesta profunda
- **WHEN** un administrador revisa una respuesta de nivel 3
- **THEN** ve su nivel y el extracto del padre, y puede saltar al padre o al hilo completo

### Requirement: Gestión de usuarios
El administrador SHALL poder suspender y reactivar usuarios desde el panel.

#### Scenario: Suspensión aplicada
- **WHEN** un administrador suspende a un usuario
- **THEN** ese usuario conserva lectura e inicio de sesión, y pierde la publicación según la especificación del foro

### Requirement: Confirmación de acciones
Las acciones del panel que afectan a terceros SHALL confirmarse en un diálogo antes de ejecutarse.

#### Scenario: Ocultar un comentario
- **WHEN** un administrador solicita ocultar un comentario
- **THEN** un diálogo pide confirmación y la acción solo se ejecuta al aceptar
