# Contexto operativo del proyecto BlogDPC

Este archivo es el contexto primario para agentes y desarrolladores. Define el alcance vigente, las decisiones que no deben reinterpretarse y las fuentes que deben consultarse según la tarea.

## 1. Estado y alcance actual

BlogDPC es una aplicación web pública en español para divulgar Integrated Sensing and Communications (ISAC), redes perceptivas 6G y el reto académico ABET SO7 del Grupo 3 de la UIS.

La primera versión se ocupa de que la estructura, navegación, backend y seguridad queden funcionando. El contenido académico de los módulos todavía permanece vacío o como placeholder; no se debe inventar ni completar contenido editorial sin una nueva instrucción.

El alcance editorial está compuesto por:

- Siete módulos de contenido estático y secuencial.
- Un foro dinámico independiente para retroalimentación.
- Una página estática de política de privacidad y protección de datos personales.
- Una página estática de términos y condiciones.

El foro es la única sección editorial dinámica. Autenticación, administración y el asistente técnico (chatbot flotante especializado) son flujos y herramientas de aplicación, no módulos de contenido.

## 2. Fuentes de contenido y planes

- [Guía de estructura ISAC](gu_a_estructura_blogdpc_sensing_communications.md): fuente inicial para temas, actividades y estructura de los siete módulos. Es una primera versión incompleta; debe corregirse en iteraciones posteriores antes de tratarla como definitiva.
- [Política de datos personales](politica-datos_personales.md): fuente de la página legal de privacidad.
- [Términos y condiciones](terminos_condiciones.md): fuente de la página legal de términos.
- [Plan de base de datos](plan_base_datos.md), [plan de backend](plan_backend.md) y [plan de frontend](plan_frontend.md): fuentes técnicas detalladas para sus respectivas áreas.
- Correo de contacto: `chaconvargasfabiancamilo@gmail.com`.

Cuando una tarea sea de contenido estático, consultar la guía o el documento legal correspondiente. Cuando sea de arquitectura o lógica, usar este archivo y los planes técnicos como fuente principal; no convertir los documentos de contenido en tablas de base de datos.

## 3. Rutas de la experiencia pública

La raíz `/` redirige a `/planeacion`. Las siete rutas editoriales son:

| Módulo | Ruta | Estado |
|---|---|---|
| 1. Inicio y marco del reto | `/planeacion` | Estructura estática, contenido pendiente |
| 2. Inteligencia bibliométrica | `/analisis` | Estructura estática, contenido pendiente |
| 3. Estado del arte y tendencias | `/tendencias` | Estructura estática, contenido pendiente |
| 4. Mini-caso técnico | `/mini-caso` | Estructura estática, contenido pendiente |
| 5. Divulgación multimedia | `/divulgacion` | Estructura estática, contenido pendiente |
| 6. Bitácora metacognitiva | `/bitacora` | Estructura estática, contenido pendiente |
| 7. Glosario y referencias | `/glosario` | Estructura estática, contenido pendiente |

Secciones independientes:

- `/retroalimentacion`: listado público y publicación en el foro.
- `/retroalimentacion/:rootId`: conversación completa.
- `/privacidad`: política de datos personales.
- `/terminos`: términos y condiciones.

El asistente técnico (`ChatWidget`) se monta de forma global en `AppShell` y está disponible en todas las vistas como un widget flotante desplegable. No posee una ruta de página propia; interactúa con el backend mediante `POST /api/chat` (streaming SSE).

El footer y la navegación pueden enlazar el foro y las páginas legales, pero el foro no es el módulo 8. Los enlaces anterior/siguiente recorren únicamente los siete módulos.

## 4. Decisiones editoriales vigentes

- El mini-caso usa la **opción A** de la guía: evaluación del trade-off en una forma de onda OFDM-DFRC.
- Los siete módulos se entregan inicialmente vacíos; solo se implementan layout, navegación, estados y espacios reservados.
- El contenido posterior puede incluir glosario, referencias, video, gráficos y código, pero cada integración requiere revisar accesibilidad, privacidad y contrato real.
- Se omiten las plataformas sugeridas en la guía. No integrar Google Sites, WordPress, Notion, Miro, Mentimeter, Padlet, Flourish, Datawrapper ni equivalentes en esta versión.
- Navegación por voz, CMS y plataformas externas de la guía quedan fuera. El chatbot técnico especializado en ISAC/6G y ABET SO7 sí está implementado como widget de consulta interactiva (ver sección 5 y specs `chatbot-tecnico`).

## 5. Arquitectura y despliegue

- Monorepo con `pnpm` workspaces.
- `apps/web`: React, Vite y Tailwind.
- `apps/server`: Node.js, Express y API REST.
- `packages/contracts`: contratos y validaciones HTTP compartidos.
- PostgreSQL administrado por Supabase mediante Drizzle ORM y `postgres`.
- No se usa Supabase Auth ni la Data API: Express es la única puerta de acceso a datos.
- El proyecto completo se despliega en **Koyeb** como aplicación Node persistente.
- Express sirve el frontend compilado y la API bajo `/api/*` desde el mismo origen.
- Asistente técnico: endpoint autenticado `POST /api/chat` con streaming SSE. Implementa pool secuencial de proveedores upstream (NVIDIA NIM 30B a 15s → OpenRouter free a 20s → Google Gemini 3.1 Flash-Lite a 10s, total 45s de TTFB pool), store de contexto efímero en memoria (RAM) por usuario/sesión (sin persistencia en DB, TTL 30 min, barrido cada 5 min, ventana max 6 000 caracteres con rollover conservando último par), lock de concurrencia 409 (`CHAT_IN_PROGRESS`) y rate limit por usuario (10 peticiones / 60 s, `CHAT_RATE_LIMITED` 429).
- `config.ts` exige variables para LLMs en el servidor (`NVIDIA_NIM_API_KEY`, `OPENROUTER_API_KEY` y `GEMINI_API_KEY`), además de JWT, SMTP, Supabase/PostgreSQL y Google OIDC (25 variables requeridas en total).
- En el cliente, la sesión del chat se guarda en `sessionStorage` (`blogdpc.chat.v1`) y se renderiza con soporte Markdown/LaTeX seguro (`react-markdown`, `remark-math`, `rehype-katex` con dependencias unificadas en KaTeX 0.18.7 vía `pnpm-workspace.yaml`, sin HTML crudo ni imágenes).
- `index.html` sin caché; activos versionados con caché inmutable.
- El preinicio aplica migraciones; `SIGTERM` cierra servidor, pool de BD y recursos del módulo de chat (`dispose()`).

`DATABASE_MIGRATION_URL` y `DATABASE_URL` son distintas. Las cadenas deben ser PostgreSQL (`postgresql://` o `postgres://`), nunca la URL HTTPS del proyecto Supabase.

## 6. Base de datos y límites implementados

- Esquema privado `app`: `users`, `account_tokens`, `refresh_tokens`, `comments`.
- `ltree` en `extensions`.
- Rol dedicado `blogdpc_app`, sin privilegios administrativos y con permisos por tabla/columna.
- RLS habilitado y forzado; `anon`, `authenticated` y `service_role` no acceden a `app`.
- Migraciones SQL versionadas en `apps/server/drizzle` se revisan antes de producción.
- Los módulos estáticos, la política y los términos no tienen representación en base de datos.

Nuevas publicaciones: raíz de nivel 1 y máximo **6 respuestas directas** de nivel 2 por raíz; las respuestas no admiten nuevas respuestas.

Las respuestas retiradas siguen ocupando cupo; los descendientes indirectos históricos no cuentan para ese límite. El historial existente hasta nivel 6 conserva todos sus nodos, relaciones, orden y anclas. Las raíces históricas con seis o más respuestas directas permanecen legibles, pero no admiten nuevas respuestas.

- raíces: `created_at DESC, id DESC`;
- respuestas: `created_at ASC, id ASC`;
- lista principal: raíces y respuestas directas; hilo completo en vista enfocada;
- cursor compuesto, no `OFFSET`;
- texto plano de 3–2000 caracteres, sin HTML/Markdown;
- publicar solo autenticado y con correo verificado;
- cooldown transaccional PostgreSQL de 30 segundos;
- no hay edición ni borrado físico por usuarios; la moderación usa borrado lógico y conserva descendientes;
- un usuario suspendido puede leer e iniciar sesión, pero no publicar.

## 7. Autenticación y autorización

- Registro tradicional con verificación SMTP y Google OIDC.
- No se enlazan automáticamente cuentas por correo.
- `crypto.scrypt`; tokens opacos almacenados únicamente como hash.
- Access JWT en cookie HttpOnly, con duración de 2 horas.
- Refresh opaco en cookie HttpOnly, con duración de 7 días, rotación y revocación de familia por reutilización.
- Reset de contraseña de 1 hora y un solo uso; revoca sesiones persistentes.
- El rol inicial es `USER`; `ADMIN` se asigna por comando interno.
- El JWT nunca autoriza por sí solo; el backend reconsulta PostgreSQL dentro de una transacción.
- En producción las cookies son `Secure`, `HttpOnly`, `SameSite=Lax` y el origen está unificado.
- Las mutaciones requieren `Origin == APP_ORIGIN`.
- Las consultas al chatbot (`POST /api/chat`) requieren autenticación mediante JWT HttpOnly y verificación de existencia de usuario activo en base de datos.

## 8. Interfaz y experiencia

- Interfaz minimalista, clara, con tarjetas y espacio en blanco.
- Paleta: `#F8F9FA`, `#FFFFFF`, `#1A252C`, `#0077B6`, `#00B4D8`.
- Navegación global a los siete módulos, foro, autenticación y páginas legales.
- Menú móvil; el foro no altera la jerarquía de módulos.
- Asistente técnico (`ChatWidget`): botón flotante discreto en esquina inferior derecha; panel desplegable con timeline cronológico de turnos y tarjetas de intentos fallidos en RAM con reintento manual explícito, auto-scroll al enviar prompt (sin auto-scroll forzado durante el streaming de respuesta para permitir lectura continua), soporte de teclado accesible (Enter envía, Shift+Enter añade salto de línea, Escape cierra el panel) y foco visible.
- El glosario futuro debe funcionar con clic, foco y teclado; el hover solo será una mejora secundaria.
- Formularios, diálogos, popovers y mensajes deben mantener foco visible y usar `aria-live` cuando corresponda.
- El access token permanece en cookie HttpOnly; JavaScript no lo lee.

## 9. Red y degradación

- Un `401` confirmado activa una sola renovación compartida.
- Un error de red no borra cookies ni cierra la sesión local.
- El foro conserva la última lectura en memoria y pasa a modo lectura no verificable.
- El evento `online` reintenta la renovación y la comprobación de sesión.
- El foro usa SSE público únicamente en sus vistas activas de listado e hilo: `comment.created` transporta solo `rootId` e invalida la lectura para consultar REST; una reconexión provoca una relectura puntual, sin polling, replay ni persistencia de eventos. El broadcaster en RAM requiere un único proceso/réplica. No hay WebSockets ni sincronización en tiempo real fuera del foro.

## 10. Fuera de alcance actual

- Redacción definitiva del contenido de los siete módulos.
- Navegación por voz y agentes autónomos externos (el chatbot técnico de consulta ISAC/6G ya está implementado).
- Plataformas externas de la guía.
- Edición y borrado por usuarios.
- Borrado físico de comentarios.
- WebSockets, notificaciones y analítica avanzada.
- CMS de módulos.
- Modo oscuro, PWA y persistencia offline.

## 11. Regla de trabajo para agentes

Antes de modificar, identificar si la tarea corresponde a contenido estático, foro, autenticación, administración, base de datos o despliegue. Consultar el documento fuente de esa rama y mantener los límites de este contexto.

Para tareas de contenido, conservar los módulos vacíos si no existe texto aprobado. Para backend, mantener el acceso exclusivo por Express, las transacciones y las restricciones PostgreSQL. Para despliegue, asumir Koyeb como único destino.
