# Foro de retroalimentación Specification

## Purpose

Foro público y dinámico, única sección editorial dinámica del sitio, para recoger retroalimentación de los visitantes sobre los módulos.

## Requirements

### Requirement: Publicación autenticada
La lectura del foro SHALL ser pública. Publicar un comentario SHALL requerir sesión activa con correo verificado.

#### Scenario: Visitante sin sesión
- **WHEN** un visitante sin autenticación intenta publicar
- **THEN** la publicación se rechaza y la lectura permanece disponible

### Requirement: Texto plano acotado
El texto del comentario SHALL ser texto plano de entre 3 y 2000 caracteres, sin interpretar HTML ni Markdown.

#### Scenario: Contenido con etiquetas
- **WHEN** se envía un comentario que incluye etiquetas HTML
- **THEN** se publica como texto plano, sin ejecutarse como marcado

### Requirement: Anidamiento máximo de seis niveles
Los comentarios SHALL anidarse hasta un máximo de 6 niveles, con el límite compartido entre backend y frontend.

#### Scenario: Respuesta en el límite
- **WHEN** se responde a un comentario de nivel 6
- **THEN** la respuesta se rechaza

#### Scenario: Interfaz coherente con el límite
- **WHEN** un comentario alcanza el nivel 6
- **THEN** la interfaz oculta o deshabilita la acción de responder

### Requirement: Orden y paginación por cursor
El listado principal SHALL mostrar raíces y respuestas directas, con raíces ordenadas por `created_at DESC, id DESC` y respuestas por `created_at ASC, id ASC`; la conversación completa se consulta en la vista enfocada del hilo. La paginación SHALL usar cursor compuesto, sin `OFFSET`.

#### Scenario: Continuar el listado
- **WHEN** el visitante carga la siguiente página del foro
- **THEN** la petición usa el cursor compuesto y conserva el orden establecido

### Requirement: Cooldown transaccional
Publicar SHALL aplicar un cooldown transaccional de 30 segundos por autor en PostgreSQL.

#### Scenario: Publicación seguida
- **WHEN** un autor publica dos comentarios en menos de 30 segundos
- **THEN** el segundo se rechaza por cooldown

### Requirement: Integridad del historial
La moderación SHALL ocultar comentarios mediante borrado lógico conservando sus descendientes. Los usuarios no dispondrán de edición ni borrado de comentarios.

#### Scenario: Moderación con respuestas
- **WHEN** se modera un comentario que tiene respuestas
- **THEN** el comentario se oculta y sus descendientes permanecen

### Requirement: Suspensión preserva la lectura
Un usuario suspendido SHALL poder iniciar sesión y leer el foro, y SHALL quedar impedido de publicar.

#### Scenario: Usuario suspendido
- **WHEN** un usuario suspendido inicia sesión y visita el foro
- **THEN** puede leer conversaciones y la publicación le queda bloqueada
