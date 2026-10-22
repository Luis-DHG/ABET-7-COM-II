# Proposal

## Why

BlogDPC necesita un asistente técnico en español que resuelva dudas de estudiantes de ingeniería sobre ISAC, redes perceptivas 6G y los siete módulos del proyecto, sin sustituir el foro ni añadir infraestructura persistente. La especificación aprobada `openspec/CHATBOT_SPEC.md` define por completo el comportamiento; este change la convierte en capacidad ejecutable.

## What Changes

- Se agrega la capacidad `chatbot-tecnico`: un endpoint `POST /api/chat` autenticado con streaming SSE, contexto conversacional en RAM del servidor y pool secuencial de tres modelos LLM con fallback solo antes del primer contenido.
- Se agrega un widget global de chat en `AppShell` (montado una vez, fuera de `Outlet`) con historial de turnos completados en `window.sessionStorage`, render seguro de Markdown/LaTeX y accesibilidad por teclado.
- Se acota el composer a una fila compacta y alineada con `textarea` y botón, conservando el diseño visual: Enter envía, Shift+Enter inserta una línea y Enter durante composición IME no envía. Al aceptar un envío se limpia inmediatamente el borrador.
- Los fallos conservan en RAM la pregunta y cualquier fragmento parcial como intentos visibles separados y no completados en orden cronológico. Cada reintento requiere una acción explícita y un POST nuevo; no se concatenan ni reemplazan intentos previos, no se restaura la pregunta al composer y ningún intento fallido se persiste en `sessionStorage` ni en el contexto del servidor. Los reintentos exitosos se sitúan cronológicamente debajo de la tarjeta del intento fallido previo.
- Se agrega cuota deslizante estricta de 10 peticiones por `userId` en los últimos 60 000 ms, lock por conversación, rollover transaccional del contexto a 6000 tokens estimados y TTL de 30 minutos con barrido cada 5 minutos.
- Se agregan dos variables server-only obligatorias: `NVIDIA_NIM_API_KEY` y `OPENROUTER_API_KEY`, validadas fail-fast en `loadConfig`.
- Se crea `.env.example` versionado con todas las variables del proyecto y se ajusta `.gitignore` (`!.env.example`) porque `.env.*` lo ignora hoy.
- Se añaden solo tres dependencias web de render: `react-markdown`, `remark-math` y `rehype-katex`; la resolución converge en KaTeX 0.18.7 mediante overrides acotados en `pnpm-workspace.yaml` para `rehype-katex>katex` y `micromark-extension-math>katex`, sin override global.

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
- Añadir overrides globales de `katex` o dependencias/renderers adicionales, incluido soporte SVG.

### Diagnóstico pendiente: streaming real

El reporte real «Esperando... y luego todo junto» sigue dentro de la solicitud de investigación y corrección, pero su causa aún no está reproducida. Está pendiente obtener y revisar una traza real sanitizada, sin leer ni exponer `.env` y sin invocar un LLM real no autorizado. El fake de navegador solo verifica el render progresivo del frontend y no confirma el streaming del proveedor. Se conserva íntegro el requisito original de streaming; no se cambiarán pool, modelos, deadlines ni límites como conjetura.

## Capabilities

### New Capabilities

- `chatbot-tecnico`: asistente técnico autenticado con streaming SSE, dominio ISAC/6G, contexto RAM por `${userId}:${tabSessionId}`, cuota deslizante por usuario, pool secuencial de tres modelos, persistencia de pares completos en `sessionStorage`, intentos fallidos solo en RAM y render seguro de Markdown/LaTeX.

### Modified Capabilities

(ninguna: el helper de autenticación reutiliza el mecanismo existente de reconsulta transaccional de `users` exigido por `autenticacion`; no cambia ningún requisito de specs existentes)

## Impact

- **Backend (`apps/server`)**: nuevos `src/chat/{module,routes,provider,prompt}.ts`; modificaciones acotadas en `src/config.ts` (dos claves nuevas), `src/auth/module.ts` (helper de autenticación transaccional), `src/app.ts` (montar `/api/chat` antes del fallback 404 de `/api`, sin `authLimiter`) y `src/server.ts` (dispose en shutdown).
- **Contratos (`packages/contracts`)**: `chatRequestSchema` estricto en `src/index.ts`; `dist/` se reconstruye vía `pnpm check` desde la raíz.
- **Frontend (`apps/web`)**: nuevos `src/chat/{session,stream,useChatSession}.ts` y `src/components/chat/{ChatWidget,ChatMessage}.tsx`; modificaciones acotadas en `src/lib/http.ts` (seam `apiResponse` que comparte `refreshPromise`), `src/components/AppShell.tsx` (montaje único), `src/index.css` (CSS de KaTeX y estilos del chat, incluido el composer compacto) y `package.json` (tres dependencias de render). La UX del widget cubre el envío por teclado/IME, la limpieza del borrador aceptado y los reintentos manuales separados en RAM.
- **Configuración y dependencias**: `.env.example` nuevo y `.gitignore` con `!.env.example`; `pnpm-workspace.yaml` añade únicamente los dos overrides dirigidos; `pnpm-lock.yaml` refleja las tres dependencias web nuevas, sus transitivas necesarias y la resolución de KaTeX 0.18.7.
- **Sin impacto**: esquema/migraciones de PostgreSQL, specs canónicas, foro, páginas de módulos, `App.tsx`, `ModuleLayout`, grafo. Sin SDK LLM, sin Redis, sin DB de chats.
