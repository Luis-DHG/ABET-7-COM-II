# Tasks

Verificación por tarea = prueba escrita primero (RED) que pasa tras la tarea (GREEN). Fuente de verdad de comportamiento: `openspec/CHATBOT_SPEC.md` (matriz A01–A50); requisitos: `specs/chatbot-tecnico/spec.md`. Comandos: raíz `pnpm check` / `pnpm lint` / `pnpm test`; server individual `pnpm --filter @blogdpc/server build` y `node --test dist/<ruta>.test.js` desde `apps/server`; web individual `node --experimental-strip-types --test tests/<archivo>.test.ts` desde `apps/web`. Sin secretos reales ni LLM real: fakes deterministas. Sin DB: las pruebas del chat no requieren `DATABASE_URL`.

## 1. Configuración y Estado en Backend

- [x] 1.1 Plantilla de configuración y versionado

  Crear `.env.example` (raíz) y modificar `.gitignore` para versionarlo: documentar las 24 variables —
  18 runtime de `apps/server/src/config.ts` (`PORT`, `APP_ORIGIN`, `DATABASE_URL`, `DATABASE_SSL`,
  `DATABASE_PREPARE`, `DB_MAX_CONNECTIONS`, `JWT_ACCESS_SECRET`, `COOKIE_SECURE`, `TRUST_PROXY_HOPS`,
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_APP_PASSWORD`, `MAIL_FROM`, `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `WEB_DIST_PATH` opcional) + `DATABASE_MIGRATION_URL`
  (solo scripts de migración) + `ADMIN_EMAIL`/`ADMIN_NAME`/`ADMIN_PASSWORD` (solo `pnpm admin:create`,
  opcionales) + `NVIDIA_NIM_API_KEY` y `OPENROUTER_API_KEY` (nuevas, server-only).
  Añadir `!.env.example` en `.gitignore` tras la línea `.env.*` (hoy lo ignora).
  Entrada: inventario de variables de `config.ts`, `context.md` §5 y el spec;
  salida: plantilla con valores de ejemplo no secretos.
  Verificación: `git check-ignore .env.example` termina con código 1 (no ignorado) y
  `git status --porcelain .env.example` lo lista como sin rastrear.

- [x] 1.2 Claves LLM server-only

  Modificar `apps/server/src/config.ts`: añadir `NVIDIA_NIM_API_KEY: z.string().min(1)` y
  `OPENROUTER_API_KEY: z.string().min(1)` a `envSchema` y exponerlas en `AppConfig`
  (p. ej. `chat: { nvidiaApiKey, openrouterApiKey }`), server-only, sin prefijo `VITE_`.
  Entrada: env del proceso; salida: `loadConfig` fail-fast si falta alguna.
  Verificación: `pnpm --filter @blogdpc/server build` verde y, desde `apps/server`,
  `node -e "import('./dist/config.js').then(m=>{try{m.loadConfig({})}catch(e){console.log(e.message)}})"`
  imprime un error que incluye `NVIDIA_NIM_API_KEY` y `OPENROUTER_API_KEY`.

- [x] 1.3 Prompt de sistema literal

  Crear `apps/server/src/chat/prompt.ts`: constante `SYSTEM_PROMPT` con el literal EXACTO del
  Appendix A de `openspec/CHATBOT_SPEC.md` (sin comillas externas, prefijos ni abreviaciones) y crear
  `apps/server/src/chat/module.test.ts` con la prueba del literal (A01-parte: integridad del texto fuente;
  la cobertura completa de A01 — el literal como `messages[0]` en los tres intentos del pool — vive en 2.2):
  no vacío, comienza por «Eres el asistente técnico oficial de BlogDPC», contiene los candados de
  `/analisis`, `/mini-caso` y `/bitacora` y los 7 módulos.
  Verificación (RED→GREEN): `pnpm --filter @blogdpc/server build` verde y
  `node --test dist/chat/module.test.js` pasa la prueba del prompt.

- [x] 1.4 Estado, locks y rollover del backend

  Crear `apps/server/src/chat/module.ts`: `createChatModule` con el store exacto
  `Map<string, { messages: Array<{ role, content }>, lastActive: number }>` con clave
  `${userId}:${tabSessionId}` (solo pares completos alternados `user`/`assistant`, sin `system`
  ni turnos pendientes), locks en `Set<string>` separado con liberación en todos los caminos terminales,
  estimación de tokens `(SYSTEM_PROMPT.length + Σ history.content.length + message.length) / 4`
  en unidades UTF-16 sin redondear, rollover si `> 6000` conservando exactamente el último par completado
  (puente de 2 mensajes; cero si no hay pares), snapshot local del candidato con commit solo en éxito
  (fallo conserva el original), `lastActive` actualizada en admisión/chunk no vacío/commit,
  `setInterval` de 5 min con `unref()` que elimina solo `Date.now() - lastActive > 30*60*1000`
  (a 30 min exactos conserva) y `dispose()` que cancela el interval sin tocar locks activos.
  Extender `module.test.ts`: A12 (locks liberados en éxito, fallo y dispose del módulo),
  A13 (usuarios distintos con mismo UUID → claves distintas; un mismo usuario con UUID distintos → claves distintas),
  A14 (clave ausente → contexto vacío sin rehidratar), A15 (frontera TTL 30 exacto / >30),
  A16/A50 (intervalo 5 min, `unref`, dispose lo cancela; disponer pierde el Map RAM sin borrar la historia disponible del navegador),
  A17 (touch solo en admisión, chunk no vacío y commit),
  A18 (24 000 unidades totales → 6000 sin rollover; 24 004 → 6001 con rollover; fracción superior también),
  A19 (último par exacto, casos 0 y 1 par; sin reserva de 700 ni umbral 5300),
  A20 (candidato aún excedido → error de presupuesto sin truncar),
  A21 (fallo conserva original; éxito confirma candidato + par).
  Verificación: `pnpm --filter @blogdpc/server build` verde y
  `node --test dist/chat/module.test.js` en verde con reloj controlado.

## 2. Orquestador LLM y Streaming SSE

- [x] 2.1 Intento upstream y parser SSE

  Crear `apps/server/src/chat/provider.ts` (intentos upstream): función de intento único que recibe
  `{ model, endpoint, apiKey, messages, ttfbMs, externalSignal }` y ejecuta `fetch` POST OpenAI-compatible
  `{model, messages, stream: true, max_tokens: 700}` con `Authorization: Bearer` server-only;
  `AbortController` propio con timer iniciado inmediatamente antes del `fetch` y cancelado solo por el
  primer `delta.content` string no vacío (headers, keep-alives, roles, reasoning, tool calls y contenido vacío NO lo detienen);
  parser incremental del SSE upstream (eventos `data:` JSON, terminal `[DONE]`, UTF-8, CRLF/LF);
  extracción exclusiva de `delta.content`; sin timeout total ni entre chunks tras el primer contenido.
  Crear `apps/server/src/chat/provider.test.ts` con fetch falso y reloj falso:
  A22 (headers/rol/reasoning/contenido vacío no detienen el timer; el timeout aborta),
  A23 (primer contenido válido cancela el timer y no aparece timeout posterior),
  A29-parte (`[DONE]` válido termina en éxito; EOF sin `[DONE]` es fallo de protocolo;
  `finish_reason` `stop`/`length` con terminal válido son éxito de transporte).
  Verificación: `pnpm --filter @blogdpc/server build` verde y
  `node --test dist/chat/provider.test.js` en verde.

- [x] 2.2 Pool secuencial y fallback

  Extender `apps/server/src/chat/provider.ts` (pool secuencial): orden exacto 1)
  `nvidia/nemotron-3.5-lightning-30b-a3b` @ `https://integrate.api.nvidia.com/v1/chat/completions`
  (`NVIDIA_NIM_API_KEY`, 8000 ms) → 2) `nvidia/nemotron-3.5-super-vl-120b-a12b`
  (mismo endpoint/clave, 10000 ms) → 3) `nvidia/nemotron-3.5-lightning:free` @
  `https://openrouter.ai/api/v1/chat/completions` (`OPENROUTER_API_KEY`, 12000 ms);
  máximo un intento por modelo, sin paralelismo ni retry del mismo;
  fallback solo ante fallo ANTES de emitir contenido al cliente (HTTP 4xx/5xx, red, timeout, body ausente,
  protocolo inválido, terminal sin contenido, EOF sin terminal), cancelando reader/timer del intento anterior;
  tras el primer frame al cliente: cero fallback y cero retry;
  agotados los tres → error `CHAT_UNAVAILABLE` (la ruta lo traduce a 503);
  desconexión del cliente (señal externa) aborta sin fallback.
  Extender `provider.test.ts`: A01 (en cada intento `messages[0]` es `system` con el literal,
  orden correcto, `stream: true`, `max_tokens: 700`, Bearer correcto, sin identidad/IP/tools),
  A24 (403/429/red/timeout/inválido precontenido → siguiente modelo una vez con cancelación previa),
  A25 (fallo tras el primer frame → error sin otro modelo ni retry),
  A26 (tres fallos precontenido → `CHAT_UNAVAILABLE`), A31 (abort externo libera reader/timers sin fallback).
  Verificación: `pnpm --filter @blogdpc/server build` verde y
  `node --test dist/chat/provider.test.js` en verde.

## 3. Controlador, Rate Limiter y Ruta en Express

- [x] 3.1 Cuota deslizante por usuario

  Modificar `apps/server/src/chat/module.ts` (cuota deslizante estricta): `Map<string, number[]>`
  separado del Map de conversaciones, máximo 10 timestamps por `userId`;
  en cada petición admitida por auth+body y antes de lock/presupuesto: `now = Date.now()`,
  eliminar `t <= now - 60000` (ventana `(now-60000, now]`), con 10 vigentes rechazar la 11.ª petición
  con 429 `CHAT_RATE_LIMITED` sin registrar la rechazada y con
  `retryAfterSeconds = Math.ceil((oldest + 60000 - now) / 1000)`, en otro caso registrar `now`;
  los fallos posteriores (upstream, 409, 422, disconnect) consumen cuota; sin cuota por IP ni pestaña;
  el barrido de 5 min poda timestamps vencidos y entradas vacías; `dispose()` vacía los contadores;
  sin `express-rate-limit` para el chat (queda solo en `authLimiter` de `/api/auth`).
  Extender `module.test.ts`: A08 (10 admitidas en `t=59000`; adicionales en `t=60000` → 429 con
  `Retry-After: 59`, no registradas, sin 20 en frontera), A09 (10 timestamps `0,1000,...,9000`:
  en `59999` rechaza con espera 1 s; en `60000` expira solo `0` y admite una; en `60001` rechaza;
  en `61000` expira `1000`; sin reset fijo), A10 (fallo upstream consume; la cuota no se descuenta).
  Verificación: `pnpm --filter @blogdpc/server build` verde y
  `node --test dist/chat/module.test.js` en verde.

- [x] 3.2 Contrato estricto del chat

  Modificar `packages/contracts/src/index.ts`: añadir `chatRequestSchema` como `z.strictObject`
  con `tabSessionId` (UUIDv4 con variante RFC 4122: posición 14 = `4`, posición 19 ∈ {8,9,a,b}) y
  `message` (string `.min(1).max(300)` sobre el texto original, con refine que rechaza whitespace-only
  vía `trim()`), rechazando propiedades adicionales incluido `history`; exportar `ChatRequest = z.infer<...>`.
  Entrada: body del POST; salida: contrato compartido server/web.
  Verificación: `pnpm check` desde la raíz en verde (reconstruye `dist/` de contracts antes de typecheck
  server y web); el RED→GREEN del schema se ejercita en 3.4 (`routes.test.ts`, A05–A07);
  esta tarea verifica contrato compilado y tipos, sin añadir infraestructura de pruebas a contracts.

- [x] 3.3 Autenticación transaccional

  Modificar `apps/server/src/auth/module.ts`: helper mínimo (p. ej. `authenticateChatUser(token)`)
  que reutiliza `authenticateAccessToken` (identidad desde `claims.sub`, nunca del body) y reconsulta
  la existencia del usuario en `users` dentro de una transacción breve que termina ANTES del fetch al proveedor;
  lanza 401 `AUTH_REQUIRED` si falta cookie, el token es inválido o el usuario no existe;
  sin restricciones del foro: `USER` y `ADMIN` admitidos, sin exigir correo verificado,
  `isBanned` no bloquea el chat; sin consultar `comments`.
  Crear `apps/server/src/auth/chat-auth.test.ts` con dobles del acceso a datos (sin `DATABASE_URL`):
  A02 (cookie ausente/token inválido/usuario inexistente → 401 sin llamada LLM),
  A03 (la transacción de `users` finaliza antes de devolver el control al flujo del chat),
  A04 (USER, ADMIN, no verificado y suspendido para publicar → admitidos).
  Verificación: `pnpm --filter @blogdpc/server build` verde y
  `node --test dist/auth/chat-auth.test.js` en verde.

- [x] 3.4 Ruta HTTP y streaming SSE

  Crear `apps/server/src/chat/routes.ts`: `POST /api/chat` con orden de admisión sameOrigin
  (global existente) → auth helper → `parseWith(chatRequestSchema)` → cuota → lock → presupuesto → provider;
  SSE exacto `data: {"chunk":"..."}\n\n`, `data: [DONE]\n\n` y
  `event: error\ndata: {"error":{"code":"CHAT_STREAM_INTERRUPTED","message":"La respuesta se interrumpió. Intenta de nuevo."},"requestId":"..."}\n\n`
  con `JSON.stringify` (escapes de comillas/barras/saltos); headers 200 `text/event-stream; charset=utf-8`,
  `Cache-Control: no-store, no-transform`, `X-Accel-Buffering: no` diferidos hasta el primer contenido no vacío;
  commit del Map ANTES de emitir `[DONE]`; errores pre-SSE vía `AppError` en envelope JSON existente
  (400 `VALIDATION_ERROR`, 401 `AUTH_REQUIRED`, 403 `INVALID_ORIGIN`, 409 `CHAT_IN_PROGRESS`,
  422 `CHAT_CONTEXT_TOO_LARGE`, 429 `CHAT_RATE_LIMITED` con `Retry-After`, 503 `CHAT_UNAVAILABLE`);
  errores post-SSE capturados y cerrados en la ruta, nunca vía `errorHandler` JSON;
  logs de la ruta y del módulo sanitizados (sin secretos, cookies, prompt, textos de usuario/respuesta
  ni cuerpos upstream; solo metadatos: requestId, código genérico, duración, intento/modelo);
  `request.on("close")` distingue cierre prematuro (abort upstream, liberar lock, descartar turno, sin fallback)
  del fin normal de la lectura del body.
  Crear `apps/server/src/chat/routes.test.ts` montando la app Express con fakes de auth/provider:
  A05 (300 acepta / 301 rechaza, con espacios exteriores y pares sustitutos),
  A06 (UUID no v4, whitespace-only, `history` y extras → 400),
  A07 (origen ausente/distinto → 403; JSON inválido → 400 `INVALID_JSON`),
  A11 (clave activa → 409; otra clave progresa),
  A36 (dos peticiones con la misma clave — caso pestaña clonada con UUID copiado bajo la misma cuenta —
  producen una generación y un 409; no se promete aislamiento entre clones),
  A17 (touch en admisión/chunk/commit, no en headers), A20 (422 sin truncar),
  A26 (pool agotado → 503 JSON, no 200 SSE vacío), A27 (framing UTF-8 con doble LF y escapes JSON),
  A28 (error postheaders no atraviesa `errorHandler` ni cambia status),
  A29 (`[DONE]` confirma; EOF sin `[DONE]` falla), A30 (commit del Map observado antes del `[DONE]` downstream),
  A12/A31 (disconnect libera lock, reader y timers sin fallback;
  el fin normal de la lectura del body no aborta la generación),
  A48 (espías: sin SQL sobre `comments` ni escrituras de chat),
  A49-parte (con un stub de `console`, las líneas de log de una conversación de prueba no contienen
  el texto del mensaje del usuario, el contenido asistente ni cuerpos upstream;
  solo requestId, código, duración e intento/modelo).
  Verificación: `pnpm --filter @blogdpc/server build` verde y
  `node --test dist/chat/routes.test.js` en verde.

- [x] 3.5 Registro de ruta y cierre ordenado

  Modificar `apps/server/src/app.ts`: componer el módulo de chat y montar `app.use("/api/chat", chatRoutes)`
  ANTES del fallback 404 de `/api`, sin heredar `authLimiter` (este queda solo en `/api/auth`),
  conservando el orden existente de middleware y rutas; modificar `apps/server/src/server.ts`:
  invocar `chatModule.dispose()` dentro del cierre `SIGTERM`/`SIGINT` existente
  (cancela intervalo y aborta proveedores activos; A50: el shutdown cancela intervalo/aborts y el restart
  pierde la RAM sin modificar la historia disponible del navegador) sin ampliar el cierre forzado de 8 s.
  Extender `apps/server/src/chat/routes.test.ts` con una prueba de integración que importe el `createApp`
  real de `apps/server/src/app.ts` con dobles (AppConfig completo construido en el test;
  db/mailer falsos según el patrón de inyección existente) y verifique que `POST /api/chat` sin cookie
  responde 401 y no 404 (A02: la ruta queda registrada antes del fallback de `/api`).
  Verificación: `pnpm --filter @blogdpc/server build` verde, `pnpm check` desde la raíz en verde y
  `pnpm test` desde la raíz en verde (suite server completa, incluida la prueba contra `createApp` real
  que confirma que `/api/chat` responde 401 y no 404).

## 4. Estado y Hook de Streaming en React

- [x] 4.1 Historial por pestaña y almacenamiento

  Crear `apps/web/src/chat/session.ts`: clave única `blogdpc.chat.v1` en `window.sessionStorage`
  (sin `localStorage` ni `BroadcastChannel`); envelope
  `{tabSessionId, messages: [{role, content, status: "completed"}]}` con `tabSessionId` UUIDv4 generado al vacío;
  validación de UUID, roles, alternancia en pares y estados; persistencia atómica del par `user`/`assistant`
  completado en una sola escritura del envelope completo (turno pendiente solo en RAM);
  corrupción → estado vacío con nuevo UUIDv4 sin tumbrar el blog;
  `SecurityError`/quota → conversación en RAM con flag degradado y sin borrar la memoria;
  el logout no borra ni rota el envelope (el módulo no expone borrado por sesión);
  storage inyectable como parámetro para pruebas.
  Crear `apps/web/tests/chat-session.test.ts` con storage fake:
  A32 (F5 tras éxito restaura pares; el pendiente nunca se persiste),
  A33 (JSON corrupto, UUID inválido y pares incoherentes → vacío funcional),
  A34 (`SecurityError`/quota → RAM + aviso, sin `localStorage`), A35 (logout no borra ni rota el envelope).
  Verificación: `node --experimental-strip-types --test tests/chat-session.test.ts` desde `apps/web` en verde.

- [x] 4.2 Respuesta HTTP y renovación compartida

  Modificar `apps/web/src/lib/http.ts`: seam mínimo `apiResponse(path, options, canRetry = true)`
  que devuelve `Response` sin consumir su body exitoso, con `credentials: "same-origin"`,
  compartiendo EXACTAMENTE la misma `refreshPromise` single-flight y notificaciones de sesión que `api`
  (sin circuito de refresh propio); ante 401 pre-stream: una renovación y un solo reintento del POST;
  un segundo 401 no inicia otra renovación; sin replay por red, EOF, respuesta parcial o error SSE;
  `api` conserva firma y comportamiento JSON intactos.
  Crear `apps/web/tests/chat-http.test.ts` con fetch falso:
  A40 (401 concurrente chat + otra llamada → una sola renovación compartida, un retry del chat),
  A41 (segundo 401, refresh no verificable, error de red y fallo parcial → sin loops ni replay;
  la sesión local no se destruye).
  Verificación: `node --experimental-strip-types --test tests/chat-http.test.ts` desde `apps/web` en verde y
  `pnpm check` desde la raíz en verde.

- [x] 4.3 Parser SSE del cliente

  Crear `apps/web/src/chat/stream.ts`: consumo SSE con `fetch` + `response.body.getReader()` +
  `TextDecoder` en modo streaming y buffer incremental; soporta UTF-8 multibyte dividido entre lecturas,
  LF y CRLF partidos, eventos fragmentados o agrupados, varios eventos por lectura, comentarios SSE
  y campos `event`/`data`; eventos de negocio aceptados: JSON con `chunk` string, `[DONE]` y
  `event: error` con el envelope definido; body nulo, Content-Type de éxito distinto de SSE,
  evento malformado o EOF sin `[DONE]` → fallo controlado; liberación del reader en todos los finales.
  Crear `apps/web/tests/chat-stream.test.ts` con streams fake:
  A42 (fragmentación arbitraria de bytes/eventos produce texto y secuencia correctos),
  A43 (Content-Type incorrecto, body nulo y evento inválido fallan y desbloquean sin persistencia).
  Verificación: `node --experimental-strip-types --test tests/chat-stream.test.ts` desde `apps/web` en verde.

- [x] 4.4 Hook de sesión y envío

  Crear `apps/web/src/chat/useChatSession.ts` (extracción de la lógica de controlador del widget
  autorizada por el encargo de Fase 2, Bloque 4; ver D13 en design.md): hook `useChatSession` sobre
  `useSession` que expone `{ messages, pending, isStreaming, error, storageDegraded, submit, inputDisabled, sendDisabled }`;
  `isStreaming === true` desde la aceptación del envío (incluye refresh y espera del primer contenido)
  hasta `[DONE]`, error terminal o aborto, con `disabled` nativo en input Y botón durante toda la operación;
  guard síncrono (ref antes del rerender) contra doble envío que no sustituye el bloqueo real;
  elegibilidad pura `canSubmit(status, online, isStreaming, message)`
  (solo `authenticated` + online + texto válido + sin turno activo);
  envío vía `apiResponse` + `stream.ts`, persistiendo el par solo al recibir `[DONE]` vía `session.ts`;
  F5 descarta el turno pendiente completo (vive en RAM); `anonymous` → CTA login sin POST;
  `unknown`/`unverifiable`/offline bloquean envío conservando historia.
  Extender `apps/web/tests/chat-session.test.ts` con los helpers puros del hook:
  casos de `canSubmit` por estado de sesión (A39) y del guard síncrono (parte de A38).
  Verificación: `pnpm check` desde la raíz en verde y
  `node --experimental-strip-types --test tests/chat-session.test.ts` desde `apps/web` en verde.

## 5. Componente UI e Integración en Layout

- [x] 5.1 Dependencias de renderizado

  Modificar `apps/web/package.json`: añadir SOLO `react-markdown`, `remark-math` y `rehype-katex`
  (reutilizar `katex` 0.18.7 existente; sin SDK LLM ni más dependencias); añadir en el
  `pnpm-workspace.yaml` raíz únicamente estos overrides de arista:

  ```yaml
  overrides:
    "rehype-katex>katex": "0.18.7"
    "micromark-extension-math>katex": "0.18.7"
  ```

  Ejecutar `pnpm install` desde la raíz para actualizar `pnpm-lock.yaml` con esas tres dependencias
  y sus transitivas necesarias.
  Verificación: `pnpm install` termina sin error, `pnpm why katex` confirma 0.18.7 en ambas aristas
  transitivas, `pnpm check` desde la raíz queda en verde, y la revisión de
  `git diff -- pnpm-lock.yaml apps/web/package.json pnpm-workspace.yaml` muestra solo las tres
  dependencias directas, las transitivas necesarias y esos dos overrides, sin override global.

- [x] 5.2 Render seguro de mensajes

  Crear `apps/web/src/components/chat/ChatMessage.tsx`: render seguro de Markdown + LaTeX con
  `react-markdown` + `remark-math` + `rehype-katex` (KaTeX `trust: false`), sin `rehype-raw`,
  sin `dangerouslySetInnerHTML` sobre salida del modelo, sin imágenes remotas y con las URLs seguras
  por defecto sin debilitar; fórmulas inválidas o parciales durante streaming → texto seguro sin derribar el panel;
  enlaces a `/planeacion`, `/analisis`, `/tendencias`, `/mini-caso`, `/divulgacion`, `/bitacora` y
  `/glosario` navegados vía router sin recarga; otros destinos conservan la política segura de URLs.
  Crear `apps/web/tests/chat-render.test.ts` con lo verificable en el entorno existente
  (lecturas de política, helpers puros y prueba de compatibilidad integrada del pipeline real, sin runner DOM):
  A44 (sin `rehype-raw` ni `dangerouslySetInnerHTML`, KaTeX `trust: false`, URLs sin override permisivo);
  comprobar que Markdown ordinario y matemáticas inline/bloque se renderizan con las dependencias instaladas
  y KaTeX 0.18.7, y que fórmulas inválidas o parciales no rompen el panel y degradan a texto seguro;
  A45 (mapeo exacto de las 7 rutas a navegación por router).
  Verificación: `node --experimental-strip-types --test tests/chat-render.test.ts` desde `apps/web` en verde y
  `pnpm check` desde la raíz en verde.

- [x] 5.3 Widget y accesibilidad

  Crear `apps/web/src/components/chat/ChatWidget.tsx`: launcher (nombre accesible, target 44×44) +
  panel flotante con título, historial, campo con label asociado cuyo texto puede presentarse visualmente oculto
  sin perder el nombre accesible, contador del límite de 300, botón de envío y control de cierre;
  consume `useChatSession` aplicando `disabled` nativo del hook al `textarea` y botón de envío; el composer
  SHALL conservar el diseño visual, con ambos controles en una fila compacta y alineada. Enter envía una
  vez, Shift+Enter inserta línea y Enter durante composición IME no envía; al aceptar el envío se vacía el
  borrador inmediatamente y se baja el scroll del historial hasta el fondo automáticamente, sin desplazar
  el scroll de manera automática mientras el LLM responde (streaming); no se vuelve a insertar automáticamente tras un error;
  estados de espera, generación, error, CTA de login (`anonymous`), aviso de storage degradado y
  accesibilidad sin aviso persistente sobre aislamiento entre cuentas ni texto de ayuda sobre los atajos
  Enter/Shift+Enter; foco visible, apertura y cierre por teclado,
  Escape cierra y restaura el foco al launcher, `aria-live` para estados (nunca por token),
  `prefers-reduced-motion`, usable a 360/768/1440 CSS px sin desbordamiento horizontal global;
  cada error conserva la pregunta y el fragmento parcial (si existe) en una tentativa no completada/fallida
  visible en RAM; el historial en RAM mantiene el orden cronológico estricto de turnos completados y tentativas
  fallidas, de modo que una pregunta reintentada exitosa y la respuesta del modelo aparecen debajo del intento
  no completado previo, distinguiendo cada tarjeta fallida.
  **Reintentar** inicia solo por acción explícita un POST
nuevo con la pregunta original, sometido a la cuota normal; cada nuevo fallo agrega una tentativa visible
aparte sin reemplazar tarjetas previas ni concatenar fragmentos. No se restauran preguntas en el composer
ni se persisten tentativas fallidas en `sessionStorage` o el contexto del servidor; solo `[DONE]` confirma
el par completado. Verificar en navegador con stream simulado y respuestas controladas: Enter/Shift+Enter,
guard IME, limpieza inmediata, label asociado con nombre accesible preservado pese a su presentación
visualmente oculta, ausencia de rótulo visible duplicado, texto de ayuda de atajos y aviso persistente de
historial, fallo antes/después de fragmento, dos fallos visibles separados, POST nuevo solo al reintentar,
contenido no concatenado y ausencia de intentos fallidos tras recarga; esta aceptación sigue pendiente y
el fake verifica solo la UX y el render progresivo del frontend, no el streaming real del proveedor;
cerrar el panel NO aborta el stream (el controlador vive montado);
  sin exportación, reset, adjuntos, selector de modelos ni analítica.
Verificación: completar la aceptación en navegador descrita arriba;
A38 (aplicación DOM del `disabled` nativo en ambos controles),
A46/A47 (teclado, foco, viewports, movimiento reducido) quedan para aceptación en navegador
conforme al spec, que no añade runner E2E.

- [x] 5.4 Montaje global y estilos

  Modificar `apps/web/src/components/AppShell.tsx`: montar `<ChatWidget />` UNA sola vez fuera de
  `<Outlet />` (hermano de Header/Footer), sin `key` por ruta, módulo, usuario o apertura del panel;
  modificar `apps/web/src/index.css`: importar el CSS de KaTeX si el renderer produce `htmlAndMathml`
  y añadir solo los estilos acotados del chat con los tokens existentes, incluyendo la fila compacta
  del `textarea` y el botón alineados sin alterar el diseño visual compartido ni el objetivo mínimo de 44×44 px
  (sin tocar `Formula.tsx` ni su salida MathML).
  Verificación: `pnpm check`, `pnpm lint` y `pnpm test` desde la raíz en verde;
  A37 (navegación por las 7 rutas y cierre/reapertura del panel durante streaming sin perder stream ni historia)
  queda para aceptación en navegador conforme al spec.

- [x] 5.5 Verificación integral

  Verificación integral final: ejecutar desde la raíz, en este orden,
  `pnpm check` → `pnpm lint` → `pnpm test`, todos en verde;
  no usar proveedor LLM real, DB o red para certificar esta verificación UX. La aceptación con stream
  simulado solo verifica el frontend y no el streaming del proveedor real. El diagnóstico del reporte
  «Esperando... y luego todo junto» sigue pendiente: requiere reproducción y revisión de traza real
  sanitizada en contexto autorizado, sin leer ni exponer `.env` ni invocar LLM no autorizado; esta tarea
  no declara resuelto el reporte. No cambiar pool, modelos, deadlines o límites como conjetura;
  confirmar con `git status --porcelain` que solo aparecen los archivos previstos por este change
  (sin commits: la persistencia la decide el usuario) y que una búsqueda de
  `NVIDIA_NIM_API_KEY|OPENROUTER_API_KEY` sobre `apps/web/src`, `apps/web/package.json` y `apps/web/dist`
  (si existe) no devuelve coincidencias (A49-parte: ni el código ni el bundle web contienen las claves).
Verificación: los tres comandos terminan con código 0, el estado de git no contiene archivos fuera de
los listados en estas tareas y la búsqueda de las claves en `apps/web` no devuelve coincidencias.

- [x] 5.6 Retirada de textos no pertinentes del widget

  Retirar el aviso persistente de aislamiento entre cuentas, el texto de ayuda de atajos y la presentación
  visible del rótulo del campo, manteniendo su label asociado y el nombre accesible; el texto de ayuda
  descriptivo con `id="blogdpc-chat-help"` solo se renderiza con sesión `unknown`/`unverifiable` u offline,
  y `aria-describedby` se construye condicionalmente para no apuntar a un id inexistente. Archivos tocados:
  `apps/web/src/components/chat/ChatWidget.tsx` y `apps/web/tests/chat-render.test.ts`.
  Verificación ya ejecutada desde la raíz: `pnpm check`, `pnpm lint` y `pnpm test` en verde;
  `apps/web/tests/chat-render.test.ts` comprueba la ausencia de los textos retirados.
