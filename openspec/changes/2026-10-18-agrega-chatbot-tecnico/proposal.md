# Proposal

## Why

BlogDPC necesita un asistente técnico en español que resuelva dudas de estudiantes de ingeniería sobre ISAC, redes perceptivas 6G y los siete módulos del proyecto, sin sustituir el foro ni añadir infraestructura persistente. La especificación aprobada `openspec/CHATBOT_SPEC.md` define por completo el comportamiento; este change la convierte en capacidad ejecutable.

## What Changes

- Se agrega la capacidad `chatbot-tecnico`: un endpoint `POST /api/chat` autenticado con streaming SSE, contexto conversacional en RAM del servidor y pool secuencial de tres modelos LLM con fallback solo antes del primer contenido.
- Se agrega un widget global de chat en `AppShell` (montado una vez, fuera de `Outlet`) con historial de turnos completados en `window.sessionStorage`, render seguro de Markdown/LaTeX y accesibilidad por teclado.
- Se agrega cuota deslizante estricta de 15 peticiones por `userId` en los últimos 60 000 ms, lock por conversación, rollover transaccional del contexto a 6000 tokens estimados y TTL de 30 minutos con barrido cada 5 minutos.
- Se agregan dos variables server-only obligatorias: `NVIDIA_NIM_API_KEY` y `OPENROUTER_API_KEY`, validadas fail-fast en `loadConfig`.
- Se crea `.env.example` versionado con todas las variables del proyecto y se ajusta `.gitignore` (`!.env.example`) porque `.env.*` lo ignora hoy.
- Se añaden solo tres dependencias web de render: `react-markdown`, `remark-math`, `rehype-katex` (KaTeX 0.18.7 ya existe).

### Non-goals (literales del usuario)

- Persistir conversaciones en PostgreSQL o en otro servicio.
- Leer comentarios del foro.
- RAG, embeddings, bases vectoriales o recuperación documental.
- Herramientas del modelo, ejecución de código o navegación autónoma.
- Cero soporte para adjuntos/imágenes o aislamiento multi-cuenta tras logout en una misma pestaña.
- Redis, coordinación multiproceso o cuotas distribuidas.
- Sincronización entre pestañas.
- Borrado seguro del almacenamiento del navegador.
- Rehidratar el contexto del servidor desde el historial del cliente.
- Exportación, reinicio manual de conversación, selector de modelos o analítica.
- Modificar el contenido de los módulos, incorporar un CMS o completar la bitácora.
- Garantizar ausencia de alucinaciones o retención cero en los proveedores.

## Capabilities

### New Capabilities

- `chatbot-tecnico`: asistente técnico autenticado con streaming SSE, dominio ISAC/6G, contexto RAM por `${userId}:${tabSessionId}`, cuota deslizante por usuario, pool secuencial de tres modelos, persistencia de pares completos en `sessionStorage` y render seguro de Markdown/LaTeX.

### Modified Capabilities

(ninguna: el helper de autenticación reutiliza el mecanismo existente de reconsulta transaccional de `users` exigido por `autenticacion`; no cambia ningún requisito de specs existentes)

## Impact

- **Backend (`apps/server`)**: nuevos `src/chat/{module,routes,provider,prompt}.ts`; modificaciones acotadas en `src/config.ts` (dos claves nuevas), `src/auth/module.ts` (helper de autenticación transaccional), `src/app.ts` (montar `/api/chat` antes del fallback 404 de `/api`, sin `authLimiter`) y `src/server.ts` (dispose en shutdown).
- **Contratos (`packages/contracts`)**: `chatRequestSchema` estricto en `src/index.ts`; `dist/` se reconstruye vía `pnpm check` desde la raíz.
- **Frontend (`apps/web`)**: nuevos `src/chat/{session,stream,useChatSession}.ts` y `src/components/chat/{ChatWidget,ChatMessage}.tsx`; modificaciones acotadas en `src/lib/http.ts` (seam `apiResponse` que comparte `refreshPromise`), `src/components/AppShell.tsx` (montaje único), `src/index.css` (CSS de KaTeX y estilos del chat) y `package.json` (tres dependencias de render).
- **Configuración**: `.env.example` nuevo y `.gitignore` con `!.env.example`; `pnpm-lock.yaml` refleja las tres dependencias.
- **Sin impacto**: esquema/migraciones de PostgreSQL, specs canónicas, foro, páginas de módulos, `App.tsx`, `ModuleLayout`, grafo. Sin SDK LLM, sin Redis, sin DB de chats.
