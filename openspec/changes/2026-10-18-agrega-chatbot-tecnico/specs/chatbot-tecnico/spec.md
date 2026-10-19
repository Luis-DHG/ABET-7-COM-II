# Spec Delta

## Purpose

Asistente técnico autenticado de BlogDPC que responde en español, con streaming SSE, Markdown y LaTeX, sobre ISAC, redes perceptivas 6G y los siete módulos del proyecto, con contexto temporal en RAM del servidor e historial por pestaña en `sessionStorage`.

## ADDED Requirements

### Requirement: Acceso autenticado sin restricciones del foro

El sistema SHALL exigir un access token válido leído de la cookie existente y SHALL reconsultar la existencia del usuario en `users` dentro de una transacción breve que termina antes de iniciar cualquier solicitud al proveedor. La capacidad SHALL estar disponible para roles `USER` y `ADMIN` sin exigir correo verificado; la suspensión que impide publicar en el foro SHALL NOT bloquear el chat. El sistema SHALL NOT consultar comentarios ni aplicar reglas editoriales del foro.

#### Scenario: Credenciales inválidas o usuario inexistente

- **WHEN** falta la cookie, el token es inválido o el usuario de `claims.sub` no existe
- **THEN** el endpoint responde 401 en envelope JSON antes de abrir SSE y no llama al proveedor

#### Scenario: Usuario sin permiso de publicar en el foro

- **WHEN** un usuario autenticado tiene correo no verificado o está suspendido para publicar
- **THEN** puede usar el chat sin restricciones adicionales

#### Scenario: Transacción liberada antes del proveedor

- **WHEN** comienza el fetch al proveedor
- **THEN** la consulta transaccional de `users` ya finalizó

### Requirement: Contrato de entrada estricto

El endpoint `POST /api/chat` SHALL exigir `Origin` exactamente igual a `APP_ORIGIN` y un body estricto con únicamente `tabSessionId` (UUID versión 4 válido) y `message` (string no vacío, no compuesto solo de espacios, máximo 300 unidades UTF-16 según `.length` sobre el texto original antes de `trim()`). El sistema SHALL rechazar propiedades adicionales, incluido `history`, y SHALL NOT aceptar historial, identidad, prompt, modelo ni parámetros de generación desde el cliente.

#### Scenario: Límite de longitud exacto

- **WHEN** el mensaje tiene exactamente 300 unidades UTF-16
- **THEN** supera la validación
- **WHEN** tiene 301 unidades
- **THEN** recibe 400 `VALIDATION_ERROR` sin llamada al proveedor

#### Scenario: Campos no admitidos

- **WHEN** el body incluye `history`, un UUID de otra versión o un mensaje solo de espacios
- **THEN** recibe 400 `VALIDATION_ERROR`

#### Scenario: Origen inválido

- **WHEN** falta `Origin` o difiere de `APP_ORIGIN`
- **THEN** recibe 403 `INVALID_ORIGIN` sin llamada al proveedor

### Requirement: Cuota deslizante por usuario

El sistema SHALL admitir como máximo 15 peticiones por `userId` en los últimos 60 000 ms mediante una ventana deslizante `(now - 60000, now]` en RAM, con un `Map<string, number[]>` separado del Map de conversaciones. Antes de contar, el sistema SHALL eliminar los timestamps `t <= now - 60000`; con 15 vigentes SHALL rechazar con 429 `CHAT_RATE_LIMITED` sin registrar la rechazada, e incluir `Retry-After` y `error.retryAfterSeconds` iguales a `Math.ceil((oldest + 60000 - now) / 1000)`. Las peticiones admitidas SHALL consumir cuota aunque fallen upstream, reciban 409, excedan contexto o se desconecten; los fallos de origen, autenticación o body SHALL NOT consumirla. No SHALL existir cuota por IP ni por pestaña. El barrido de cinco minutos SHALL podar timestamps vencidos y entradas vacías; la disposición SHALL vaciar los contadores.

#### Scenario: Frontera de ventana sin dobles admisiones

- **WHEN** se admiten 15 peticiones en `t = 59000` ms y llegan más en `t = 60000` ms
- **THEN** las adicionales reciben 429 con `Retry-After: 59` y no se registran

#### Scenario: Recuperación progresiva

- **WHEN** hay 15 timestamps en `0, 1000, ..., 14000` ms
- **THEN** en `59999` ms se rechaza con espera de 1 s, en `60000` ms expira solo el timestamp `0` y se admite una petición, y en `61000` ms expira el timestamp `1000` liberando otro cupo, sin reset global de ventana fija

#### Scenario: Fallos posteriores consumen cuota

- **WHEN** una petición contada falla en el proveedor o agota el pool
- **THEN** sigue consumiendo cuota

### Requirement: Exclusión por conversación

El sistema SHALL impedir generaciones simultáneas para una misma clave `${userId}:${tabSessionId}` mediante un `Set<string>` separado, con adquisición sin punto de espera entre comprobar y registrar. Una segunda solicitud para una clave activa SHALL recibir 409 `CHAT_IN_PROGRESS`. El lock SHALL liberarse en todos los caminos terminales y SHALL NOT bloquear claves distintas.

#### Scenario: Solicitud concurrente para la misma clave

- **WHEN** llega una segunda solicitud válida mientras la clave tiene una generación activa
- **THEN** recibe 409 y no se inicia otro intento upstream

#### Scenario: Otra clave progresa

- **WHEN** una clave está activa y otra clave realiza una solicitud
- **THEN** la segunda clave no queda bloqueada

### Requirement: Contexto en memoria separado por identidad real

El sistema SHALL mantener el historial confirmado en un `Map<string, {messages: Array<{role, content}>, lastActive: number}>` con clave `${userId}:${tabSessionId}`, conteniendo únicamente pares completos alternados `user`/`assistant`, sin el mensaje `system` ni turnos pendientes. El sistema SHALL NOT persistir el Map ni rehidratarlo desde el navegador: una clave ausente por pestaña nueva, TTL o reinicio SHALL iniciar contexto vacío silenciosamente.

#### Scenario: Usuarios distintos con el mismo UUID

- **WHEN** dos usuarios autenticados distintos envían el mismo `tabSessionId`
- **THEN** sus contextos backend viven en claves distintas

#### Scenario: Contexto inexistente

- **WHEN** no existe la clave y el navegador muestra historia local
- **THEN** el modelo recibe contexto conversacional vacío y no se envía `history`

### Requirement: Expiración de contexto

El sistema SHALL actualizar `lastActive` al admitir una solicitud válida con lock adquirido, al procesar fragmentos de texto no vacíos y al confirmar un turno; headers, comentarios SSE y metadatos SHALL NOT actualizarla. Un intervalo de cinco minutos con `unref()` SHALL eliminar únicamente entradas con `Date.now() - lastActive > 30 * 60 * 1000`; a exactamente 30 minutos la entrada se conserva. La disposición del módulo SHALL cancelar el intervalo sin eliminar locks de solicitudes activas.

#### Scenario: Frontera de TTL

- **WHEN** una pasada encuentra exactamente 30 minutos de inactividad
- **THEN** conserva la entrada
- **WHEN** encuentra más de 30 minutos
- **THEN** la elimina

#### Scenario: Actividad que no cuenta

- **WHEN** solo llegan headers, keep-alives o deltas de rol sin contenido
- **THEN** `lastActive` no se actualiza

### Requirement: Presupuesto de entrada y rollover transaccional

El sistema SHALL estimar la entrada como `(longitudDelPromptLiteral + sumaDeLongitudesDelHistorial + longitudDelNuevoMensaje) / 4` en unidades UTF-16, sin redondear antes de comparar. Con estimación mayor a 6000 el sistema SHALL construir un candidato conservando exactamente el último par completo `user`/`assistant` (cero mensajes si no hay pares), sin resumir, recortar prompt o puente, ni aplicar FIFO continuo; si el candidato aún supera 6000, SHALL responder 422 `CHAT_CONTEXT_TOO_LARGE` sin llamar al proveedor. El candidato SHALL sustituir `messages` solo al confirmar un turno exitoso; un fallo SHALL conservar el historial original. El presupuesto es exclusivamente de entrada: no reserva los 700 tokens de salida ni usa un umbral de 5300.

#### Scenario: Frontera del presupuesto

- **WHEN** la entrada estima exactamente 6000 tokens
- **THEN** no se aplica rollover
- **WHEN** estima 6001
- **THEN** el candidato conserva solo el último par completo

#### Scenario: Candidato aún excedido

- **WHEN** prompt, último par y nuevo mensaje siguen superando 6000
- **THEN** se responde 422 sin truncar prompt ni puente y sin llamada upstream

#### Scenario: Fallo con rollover preparado

- **WHEN** se construyó un candidato reducido y la generación falla
- **THEN** el historial original permanece sin cambios

### Requirement: Pool secuencial de modelos

El sistema SHALL intentar en orden exacto: 1) `nvidia/nemotron-3.5-lightning-30b-a3b` en `https://integrate.api.nvidia.com/v1/chat/completions` con `NVIDIA_NIM_API_KEY` (TTFB 4000 ms), 2) `nvidia/nemotron-3.5-super-vl-120b-a12b` en el mismo endpoint y clave (5000 ms), 3) `nvidia/nemotron-3.5-lightning:free` en `https://openrouter.ai/api/v1/chat/completions` con `OPENROUTER_API_KEY` (6000 ms). Cada intento SHALL ser un POST compatible con OpenAI con `{model, messages, stream: true, max_tokens: 700}` y Bearer server-only, con el primer mensaje `system` conteniendo el prompt literal completo del Appendix A de `openspec/CHATBOT_SPEC.md` sin modificaciones. Cada modelo SHALL intentarse como máximo una vez por solicitud, sin paralelismo. El payload SHALL excluir herramientas, imágenes, cookies, identidad, IP y `tabSessionId`.

#### Scenario: Construcción de cada intento

- **WHEN** se construye una solicitud para cualquier modelo del pool
- **THEN** `messages[0]` es `system` con el literal exacto, seguido del historial candidato y el nuevo mensaje `user`, con `stream: true` y `max_tokens: 700`

#### Scenario: Fallback secuencial

- **WHEN** falla el primer modelo antes del contenido y después falla el segundo
- **THEN** se intenta el tercero una sola vez, sin llamadas paralelas ni reintentos del mismo modelo

### Requirement: Deadline hasta el primer contenido

Cada intento SHALL usar su propio `AbortController` con un timer que comienza inmediatamente antes del fetch y solo se detiene al recibir el primer `delta.content` string no vacío. Headers, keep-alives, comentarios, deltas de rol, contenido vacío, razonamiento, metadatos y tool calls SHALL NOT satisfacer el deadline. El sistema SHALL extraer únicamente texto de `delta.content` y SHALL NOT introducir timeout total ni entre chunks después del primer contenido.

#### Scenario: Metadatos no detienen el timer

- **WHEN** el proveedor entrega headers, roles o razonamiento sin contenido dentro del plazo
- **THEN** el timer sigue activo y al vencer se aborta el intento

#### Scenario: Primer contenido válido

- **WHEN** llega el primer string no vacío dentro del plazo
- **THEN** el timer se cancela y no se activa ningún otro timeout

### Requirement: Fallback solo antes de contenido

Antes de emitir el primer frame de contenido al cliente, HTTP 4xx/5xx, error de red, timeout, body ausente, protocolo inválido, terminal sin contenido o EOF sin terminal válido SHALL cancelar el intento y habilitar el siguiente modelo, liberando reader y timer del intento anterior. Después de comenzar la emisión del primer frame de contenido, el sistema SHALL aplicar cero fallback y cero retry: un fallo produce el evento de error SSE y cierre, sin guardar el par. Si los tres intentos fallan antes del contenido, el sistema SHALL responder 503 `CHAT_UNAVAILABLE` en JSON. Los errores upstream 401/403/429 SHALL NOT presentarse como errores de sesión, origen o cuota del usuario.

#### Scenario: Fallo después del primer fragmento

- **WHEN** el proveedor falla después de emitido el primer frame de contenido
- **THEN** se emite `CHAT_STREAM_INTERRUPTED` si la conexión sigue escribible, se cierra el stream y no se consulta otro modelo ni se guarda el turno

#### Scenario: Agotamiento del pool

- **WHEN** los tres modelos fallan antes de emitir contenido
- **THEN** la respuesta es 503 JSON con `CHAT_UNAVAILABLE`, no 200 SSE vacío

### Requirement: Protocolo SSE de salida

El sistema SHALL emitir frames UTF-8 terminados en doble LF: `data: {"chunk":"..."}\n\n`, `data: [DONE]\n\n` y `event: error\ndata: {"error":{"code":"CHAT_STREAM_INTERRUPTED","message":"La respuesta se interrumpió. Intenta de nuevo."},"requestId":"..."}\n\n`, serializando el contenido con `JSON.stringify`. Los headers SSE (`text/event-stream; charset=utf-8`, `Cache-Control: no-store, no-transform`, `X-Accel-Buffering: no`) SHALL diferirse hasta el primer contenido no vacío. Los errores previos a SSE SHALL usar el envelope JSON existente; los posteriores SHALL permanecer dentro de SSE sin cambiar el status ni emitir `[DONE]` tras error.

#### Scenario: Error antes del primer fragmento

- **WHEN** ocurre un fallo terminal antes del contenido
- **THEN** no se enviaron headers SSE y la respuesta usa el status y envelope JSON correspondientes

#### Scenario: Error con stream iniciado

- **WHEN** se envía el evento de error con headers SSE ya emitidos
- **THEN** el status sigue en 200, no se escribe JSON externo ni `[DONE]`

### Requirement: Terminación explícita y orden de confirmación

El sistema SHALL considerar exitoso un turno solo con contenido no vacío y terminal upstream válido `[DONE]`; EOF SHALL NOT sustituir al terminal. `finish_reason` `stop` o `length` con terminal válido cuentan como éxito de transporte. El servidor SHALL confirmar el Map con el candidato más el nuevo par y actualizar `lastActive` ANTES de emitir `[DONE]` al cliente. El cliente SHALL confirmar y persistir el par solo al recibir `[DONE]`. La divergencia por un `[DONE]` perdido tras commit SHALL quedar sin ACK, replay ni reconciliación automática.

#### Scenario: EOF sin terminal

- **WHEN** el proveedor cierra sin `[DONE]`
- **THEN** el turno no es exitoso y se aplica fallback o interrupción según haya comenzado el contenido

#### Scenario: Commit previo al terminal downstream

- **WHEN** el servidor confirma el par y emite `[DONE]`
- **THEN** el Map ya contiene el turno completo antes de la emisión

### Requirement: Desconexión y cierre ordenado

Si el cliente se desconecta antes de la confirmación, el sistema SHALL abortar el fetch upstream, cancelar reader y timers, liberar el lock y descartar el turno pendiente sin fallback. La detección SHALL distinguir el cierre prematuro de la finalización normal de la lectura del body del POST. El cierre del módulo SHALL cancelar el intervalo de TTL, abortar proveedores activos e integrarse con `SIGTERM`/`SIGINT` sin ampliar el cierre forzado existente de ocho segundos.

#### Scenario: Cliente desconectado

- **WHEN** se detecta cierre prematuro de la respuesta durante la generación
- **THEN** se cancelan fetch, reader y timers, se libera el lock y no se inicia fallback ni se guarda el turno

#### Scenario: Cierre del proceso

- **WHEN** llega `SIGTERM` o `SIGINT`
- **THEN** se cancelan intervalo y aborts activos dentro del cierre existente

### Requirement: Persistencia de pares completos por pestaña

El cliente SHALL usar exclusivamente `window.sessionStorage` con la clave `blogdpc.chat.v1` y el envelope `{tabSessionId, messages: [{role, content, status: "completed"}]}`, generando un UUIDv4 cuando no exista un envelope válido. Solo SHALL persistir cada par `user`/`assistant` completado, conjuntamente en una sola escritura; el turno pendiente SHALL permanecer en RAM. Una recarga durante espera o streaming SHALL descartar el turno pendiente completo y restaurar solo los pares confirmados. El cliente SHALL NOT usar `localStorage` ni `BroadcastChannel`, y el logout SHALL NOT borrar ni rotar el envelope.

#### Scenario: Recarga durante generación

- **WHEN** se recarga la pestaña mientras se espera o recibe una respuesta
- **THEN** el turno pendiente completo se descarta y no aparece un mensaje de usuario huérfano ni una respuesta parcial

#### Scenario: Recarga tras éxito

- **WHEN** se recibió `[DONE]` y se recarga la pestaña
- **THEN** se restauran el UUID y los pares completados disponibles

### Requirement: Recuperación de almacenamiento degradado

El cliente SHALL tolerar envelope corrupto, `SecurityError` o cuota agotada recuperando una conversación vacía o continuando en RAM con un aviso no bloqueante, sin impedir que cargue el blog. El cliente SHALL NOT prometer recuperación en recarga de turnos no persistidos, exclusividad del UUID entre pestañas clonadas ni borrado seguro al cerrar.

#### Scenario: Envelope corrupto

- **WHEN** el JSON almacenado es inválido o su estructura es incoherente
- **THEN** se recupera una conversación vacía con un nuevo UUIDv4 y el blog funciona

#### Scenario: Storage no disponible

- **WHEN** `sessionStorage` lanza `SecurityError` o error de cuota
- **THEN** la conversación continúa en RAM con aviso visible y sin borrar los turnos en memoria

### Requirement: Historial no aislado por cuenta

El cliente SHALL conservar el historial local y el `tabSessionId` al cerrar sesión o cambiar de cuenta en la misma pestaña; otra cuenta puede ver la historia anterior. El backend SHALL seguir separando el contexto por el usuario autenticado real, de modo que usuarios distintos con el mismo UUID usan claves distintas, y una pestaña clonada con UUID copiado bajo la misma cuenta puede compartir clave backend protegida por el lock.

#### Scenario: Cambio de cuenta en la misma pestaña

- **WHEN** una cuenta sale y otra entra en la misma pestaña
- **THEN** la nueva cuenta ve la historia local existente y sus peticiones usan una clave backend distinta

#### Scenario: Pestaña clonada

- **WHEN** el navegador duplica el storage con el mismo UUID y la misma cuenta
- **THEN** ambas pestañas pueden dirigirse a la misma clave backend y el 409 protege la concurrencia

### Requirement: Controlador global persistente

El widget SHALL montarse una sola vez en `AppShell` fuera de `Outlet`, sin `key` derivada de ruta, módulo, usuario o apertura del panel. Navegar entre las siete rutas durante una generación SHALL conservar el stream y la historia; cerrar el panel SHALL NOT abortar la solicitud y reabrirlo SHALL mostrar el estado actual.

#### Scenario: Navegación durante streaming

- **WHEN** se navega entre módulos mientras se recibe una respuesta
- **THEN** el stream y la historia continúan sin reiniciarse

#### Scenario: Cierre y reapertura del panel

- **WHEN** se cierra el panel durante la generación y se reabre
- **THEN** la solicitud continúa y el panel refleja el estado actual

### Requirement: Bloqueo de envío durante streaming

El cliente SHALL activar `isStreaming` desde la aceptación del envío, incluyendo renovación de sesión y espera del primer contenido, hasta `[DONE]`, error terminal o aborto. Mientras `isStreaming === true`, el input y el botón de envío SHALL tener su propiedad nativa `disabled` en `true`; un guard síncrono antes del rerender SHALL impedir doble envío sin sustituir el bloqueo real de ambos controles. El envío SHALL requerir sesión `authenticated`, conexión online, texto válido y ausencia de turno activo: `anonymous` muestra CTA a `/login` sin POST, y `unknown`, `unverifiable` u offline bloquean el envío conservando la historia.

#### Scenario: Doble activación antes del rerender

- **WHEN** dos eventos intentan enviar antes del siguiente render
- **THEN** solo se inicia una operación y ambos controles quedan con `disabled === true` durante toda la operación

#### Scenario: Sesión no apta

- **WHEN** la sesión es anónima
- **THEN** se muestra el CTA de login sin POST al chat
- **WHEN** es desconocida, no verificable u offline
- **THEN** se bloquea el envío sin destruir la historia

### Requirement: Renovación compartida sin replay

El cliente SHALL reutilizar la misma renovación single-flight de `lib/http.ts` mediante un seam que devuelve `Response` sin consumir su body exitoso, y SHALL permitir como máximo un reintento del POST tras un 401 prestream con refresh exitoso. Un segundo 401 SHALL NOT iniciar otra renovación para esa operación. El cliente SHALL NOT autorrepetir solicitudes por error de red, EOF, respuesta parcial o error SSE después de iniciado el stream.

#### Scenario: 401 concurrente con otra llamada

- **WHEN** el chat y otra llamada elegible reciben 401 concurrentemente
- **THEN** comparten una única renovación y el chat reintenta una sola vez

#### Scenario: Stream interrumpido

- **WHEN** falla la conexión después de comenzar la respuesta
- **THEN** no se inicia refresh ni replay automático y se informa el fallo

### Requirement: Parser SSE incremental robusto

El cliente SHALL consumir el stream con `fetch`, `getReader()` y `TextDecoder` en modo streaming, soportando UTF-8 dividido entre lecturas, LF y CRLF partidos, eventos fragmentados o agrupados, comentarios SSE y campos `event`/`data`. Los eventos de negocio aceptados son JSON con `chunk` string, `[DONE]` y `event: error` con el envelope definido. Un evento malformado, body nulo, Content-Type de éxito distinto de SSE o EOF sin `[DONE]` SHALL producir fallo controlado, liberación del reader y desbloqueo sin persistir el turno.

#### Scenario: Fragmentación arbitraria

- **WHEN** una fórmula con caracteres multibyte y eventos CRLF llegan divididos en posiciones arbitrarias o agrupados
- **THEN** el texto reconstruido y la secuencia de eventos coinciden con el contenido original

#### Scenario: Respuesta inválida

- **WHEN** falta el body, el Content-Type no es SSE o llega EOF sin `[DONE]`
- **THEN** el turno no se confirma ni persiste y la interfaz se desbloquea con error controlado

### Requirement: Render seguro de Markdown y matemáticas

El cliente SHALL renderizar Markdown y LaTeX tratando los mensajes del usuario y del modelo como no confiables: sin HTML crudo, sin `dangerouslySetInnerHTML` sobre salida del modelo, sin imágenes remotas, sin protocolos de URL inseguros y con KaTeX `trust: false`. Fórmulas inválidas o parciales SHALL degradar a texto seguro sin derribar el panel. Los enlaces a `/planeacion`, `/analisis`, `/tendencias`, `/mini-caso`, `/divulgacion`, `/bitacora` y `/glosario` SHALL navegarse vía router sin recarga completa.

#### Scenario: Contenido hostil

- **WHEN** una respuesta contiene HTML, una URL ejecutable, una imagen remota o una construcción que requiere confianza
- **THEN** no se ejecuta ni se carga ese contenido

#### Scenario: LaTeX parcial durante streaming

- **WHEN** una fórmula aún incompleta se recibe
- **THEN** se muestra como texto seguro y el panel sigue funcionando

### Requirement: Accesibilidad y diseño adaptable

El widget SHALL ofrecer launcher con nombre accesible, panel con título, historial, campo con label, contador del límite de 300, botón de envío y cierre, con estados de espera, generación, error, storage degradado y CTA de acceso. Los controles principales SHALL tener objetivos mínimos de 44 × 44 CSS px, foco visible, operación completa por teclado, Escape para cerrar restaurando el foco al launcher, y `aria-live` para estados relevantes sin anunciar cada token. El widget SHALL ser utilizable a 360, 768 y 1440 CSS px, respetar `prefers-reduced-motion` y no provocar desbordamiento horizontal de la página.

#### Scenario: Operación por teclado

- **WHEN** el usuario abre el panel, interactúa y pulsa Escape
- **THEN** completa la operación por teclado y el foco vuelve al launcher

#### Scenario: Viewports y movimiento reducido

- **WHEN** se evalúa a 360, 768 y 1440 CSS px o con `prefers-reduced-motion`
- **THEN** el chat permanece utilizable, respeta la preferencia y no desborda la página

### Requirement: Privacidad y observabilidad

El módulo de chat SHALL limitar su acceso a datos persistentes a la consulta de `users` para autenticación: sin SQL sobre `comments`, sin tablas ni escrituras de conversaciones, prompts o respuestas. Los logs SHALL excluir secretos, cookies, el prompt de sistema, textos de usuario y respuesta, y cuerpos de error upstream; solo se admiten metadatos operativos sanitizados. La entrada al proveedor SHALL contener exclusivamente el prompt literal y los textos conversacionales.

#### Scenario: Inspección de acceso a datos

- **WHEN** se ejecuta una conversación autenticada
- **THEN** no se ejecuta SQL sobre `comments` ni se insertan textos conversacionales en la base de datos

#### Scenario: Logs sin contenido sensible

- **WHEN** un intento upstream falla con detalles sensibles
- **THEN** los logs solo contienen metadatos sanitizados como requestId, código genérico, duración e intento/modelo

### Requirement: Configuración server-only

El sistema SHALL validar `NVIDIA_NIM_API_KEY` y `OPENROUTER_API_KEY` como strings no vacíos obligatorios al cargar la configuración, con fallo temprano si falta alguna. Ambas SHALL permanecer exclusivamente en el servidor, sin prefijo `VITE_`, sin exposición en contratos públicos ni en el bundle del navegador. Los modelos, endpoints, deadlines y límites SHALL ser constantes de la capacidad, no parámetros configurables.

#### Scenario: Configuración incompleta

- **WHEN** falta una de las dos claves o es vacía
- **THEN** la carga de configuración falla temprano y el servidor no arranca

#### Scenario: Sin exposición al navegador

- **WHEN** se inspecciona el bundle web y los contratos públicos
- **THEN** ninguna de las dos claves aparece
