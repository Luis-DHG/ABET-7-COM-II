# Design

## Context

La especificación aprobada `openspec/CHATBOT_SPEC.md` (~1150 líneas) es el diseño detallado y la fuente de verdad de esta capacidad; este documento es un resumen ejecutivo que remite a ella y no la reproduce. La motivación del change está en `proposal.md`; los requisitos normativos, en `specs/chatbot-tecnico/spec.md` de este change.

El proyecto es un monorepo pnpm (`apps/web` React 19 + Vite, `apps/server` Express 5 ESM, `packages/contracts` Zod consumido desde `dist/`), desplegado como proceso único en Koyeb con Express sirviendo API y SPA en el mismo origen. No existe middleware global de auth: cada ruta lee `ACCESS_COOKIE` y autentica por sí misma (patrón de `forum/routes.ts`). `context.md` excluía históricamente el chatbot; este change es la autorización nueva y acotada de la capacidad.

## Goals / Non-Goals

**Goals:**

- Implementar exactamente el comportamiento de `openspec/CHATBOT_SPEC.md` con la mínima superficie de cambio sobre archivos existentes.
- Mantener todas las decisiones cerradas del spec: pool, deadlines, cuota deslizante, rollover transaccional, SSE, storage por pestaña, render seguro.
- Ser verificable con pruebas deterministas sin secretos, LLM real ni DB.

**Non-Goals (nivel diseño):**

- No rediseñar auth, shutdown, foro ni layout: solo puntos de integración acotados listados en el spec (sección «Archivos existentes con cambios futuros previstos»).
- No sincronizar el desfase entre `context.md`, specs editoriales y contenido actual (sección «Desfase documental reconocido» del spec).
- No añadir infraestructura: sin Redis, sin SDK LLM, sin runner E2E nuevo.

## Decisions

Cada decisión remite a la sección de `openspec/CHATBOT_SPEC.md` que la define en detalle.

| # | Decisión | Rationale y alternativa descartada | Referencia |
|---|---|---|---|
| D1 | Autenticación por ruta con helper en `auth/module.ts` que reutiliza `authenticateAccessToken` y reconsulta `users` en transacción breve cerrada antes del fetch al proveedor. | La spec `autenticacion` exige reconsulta transaccional; no existe `requireAuth` global. Alternativa (middleware nuevo global) descartada: cambia superficie de otras rutas. | «Autenticación y autorización» |
| D2 | Cuota deslizante 15/60 000 ms con `Map<string, number[]>` propio, sin `express-rate-limit` en el chat. | La ventana fija de `MemoryStore` admitiría ~30 peticiones en fronteras; el mandato es máximo 15/min estricto. La librería queda solo en `authLimiter` de `/api/auth`. | «Cuota y concurrencia» |
| D3 | Contexto en `Map` RAM con clave `${userId}:${tabSessionId}`, TTL estricto `> 30 min` con barrido de 5 min `unref()`, locks en `Set` separado. | Proceso único Koyeb; sin DB de chats. Alternativa (Postgres) descartada: non-goal persistencia. | «Estado del servidor», «Actividad y TTL» |
| D4 | Presupuesto entrada `(prompt+historial+mensaje)/4 > 6000` con rollover que conserva exactamente el último par; commit del candidato solo en éxito. | Estimación UTF-16 reproducible sin tokenizer; snapshot local evita mutar historial en fallo. Alternativas (resumen, FIFO, 5300) prohibidas por el spec. | «Presupuesto de entrada y rollover» |
| D5 | Pool secuencial cerrado de 3 modelos NVIDIA/OpenRouter, un intento por modelo, `max_tokens: 700`, TTFB 4000/5000/6000 ms hasta primer `delta.content` no vacío. | Fallback solo precontenido; tras el primer frame al cliente: cero retry. Alternativa (paralelo/retry mismo modelo) descartada: duplica carga y puede emitir texto tardío. | «Contrato upstream y pool de modelos», «TTFB, fallback y extracción de contenido» |
| D6 | SSE con headers diferidos al primer contenido; errores pre-SSE en envelope JSON existente, post-SSE solo `event: error`; commit del Map antes de `[DONE]`. | Permite 503 JSON si el pool falla sin romper el contrato SSE iniciado. Alternativa (headers inmediatos) descartada: impediría el 503 JSON. | «Contrato HTTP del navegador», «Errores y recuperación», «Terminación y atomicidad del turno» |
| D7 | Historial del navegador solo en `sessionStorage` clave `blogdpc.chat.v1`, pares completos en una escritura, turno pendiente en RAM, degradación a RAM con aviso. | `localStorage` y `BroadcastChannel` descartados por el spec; la divergencia Map/`[DONE]` perdido se acepta sin ACK. | «Estado y persistencia del navegador» |
| D8 | Widget montado una vez en `AppShell` fuera de `Outlet`, sin `key` por ruta/usuario; `ModuleLayout` se remonta por módulo y no puede alojar el controlador. | Preserva stream e historia al navegar. Alternativa (montar en `ModulePage`) descartada: el `key={module.path}` remonta y perdería el stream. | «Integración con React y navegación» |
| D9 | Seam `apiResponse` en `lib/http.ts` que devuelve `Response` compartiendo la misma `refreshPromise` single-flight; un solo retry tras 401 prestream, sin replay post-contenido. | `api` consume JSON y no sirve para SSE; un refresh paralelo rompería la renovación compartida existente. | «Sesión web y seam HTTP» |
| D10 | Render con `react-markdown` + `remark-math` + `rehype-katex` (KaTeX 0.18.7 existente), HTML crudo deshabilitado, `trust: false`, fórmulas parciales como texto seguro; enlaces a los 7 módulos vía router. | Únicas 3 dependencias nuevas; sin `rehype-raw` ni override permisivo de URLs. | «Dependencias y presentación», «Markdown, enlaces y contenido no confiable» |
| D11 | `isStreaming` desde la aceptación hasta `[DONE]`/error/abort con `disabled` nativo en input y botón + guard síncrono. | El guard solo cubre la ventana pre-rerender; el bloqueo real de ambos controles es el mandato del usuario. | «Integración con React y navegación» |
| D12 | `.env.example` nuevo + `!.env.example` en `.gitignore` (`.env.*` lo ignora hoy); dos claves nuevas validadas fail-fast en `loadConfig`. | Documenta el entorno completo sin tocar `.env` real; el spec prohíbe inventar que ya existía. | «Configuración» |

## Risks / Trade-offs

La sección «Risks and limitations» de `openspec/CHATBOT_SPEC.md` es el inventario completo (RAM no durable, divergencia commit/`[DONE]`, clones de pestaña, buffering en Koyeb, modelos no verificados operativamente, estimación por caracteres, retención de proveedores). Adicionales de integración:

- [Riesgo] `pnpm --filter @blogdpc/server check` tras editar contracts usa `dist/` viejo → [Mitigación] verificación siempre con `pnpm check` desde la raíz (reconstruye contracts); recordado en tasks.
- [Riesgo] Pruebas server corren compiladas → [Mitigación] cada criterio de verificación server incluye `pnpm --filter @blogdpc/server build` antes de `node --test dist/...`.
- [Riesgo] Los errores post-SSE podrían llegar al `errorHandler` JSON y provocar doble respuesta → [Mitigación] la ruta captura y cierra el stream ella misma; criterio A28 del spec.
- [Riesgo] `express.json` de 32 KB podría rechazar bodies válidos de chat → [Mitigación] el máximo real del body del chat (~300 caracteres + UUID) es muy inferior al límite; no se amplía el parser global.

## Migration Plan

- Despliegue: añadir `NVIDIA_NIM_API_KEY` y `OPENROUTER_API_KEY` al entorno de Koyeb junto al `.env` existente; sin cambios de esquema ni migraciones DB. El `prestart` existente aplica migraciones sin novedad.
- Rollback: revertir el deploy; no hay estado persistente nuevo que migrar (el Map RAM y el `sessionStorage` se pierden sin efecto sobre el resto del blog).
