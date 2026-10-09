# Design

## Context

La motivación está en `proposal.md`; el contrato funcional está en `specs/foro-retroalimentacion/spec.md` y la corrección acotada de términos en `specs/paginas-legales/spec.md`. Las siguientes observaciones históricas corresponden a la inspección inicial de solo lectura, anterior a la política implementada:

- `forum/module.ts:132–189` ya publica dentro de una transacción: lock del autor, verificación de correo/suspensión, cooldown y luego lock del padre. Actualmente solo rechaza profundidad mayor que seis.
- `module.ts:86–110` incluye todas las respuestas directas, sin filtrar retiradas; `getThread` y `tree.ts` reconstruyen el árbol completo. `PublicComment.replies` basta para el conteo visual; no requiere nuevos campos ni endpoints.
- `CommentItem.tsx:75` ofrece Responder según profundidad y `!isRemoved`; `ForumPage.tsx:186–187` anuncia varios niveles. `CommentComposer` solo inserta en caché después de recibir éxito y conserva el texto ante error. El hilo relee tras éxito, mientras la caché principal incorpora la publicación aceptada.
- `db/schema.ts:113` mantiene profundidad física 1–6. `db/client.ts` no configura un aislamiento distinto del predeterminado. La documentación oficial de PostgreSQL confirma que READ COMMITTED obtiene un snapshot por sentencia y mantiene los locks de fila durante la transacción: https://www.postgresql.org/docs/18/sql-set-transaction.html y https://www.postgresql.org/docs/18/explicit-locking.html. No se consultó la configuración de ninguna base real.

El cierre anterior fue 11/11, incluida la alineación acotada de 5.1; los deltas de foro y legales ya fueron sincronizados. La auditoría del 2026-10-08 reabre únicamente 3.3: `ThreadPage.tsx:52–60` revalida con una promesa sin captura ni comprobación de vigencia, que puede sobrescribir el sexto éxito incorporado localmente o actualizar un hilo abandonado. Las demás casillas y evidencias permanecen históricas e intactas; el cierre anterior no acredita esta carrera. Los documentos legales completos proceden de la spec principal `paginas-legales` y del archive preexistente `2026-10-06-publica-paginas-legales`; no son una ampliación del change visual.

La decisión explícita más reciente mantiene F 3.3 completo (guardias, rechazos y aviso existente), con estado recibido 10/11 y 3.3 abierta. No se marca ningún cierre en este update. Las retiradas 1.6/3.10/5.4/8.1 del visual solo eliminan verificaciones amplias de ese plan, no los requisitos raíz/conteo/lectura histórica, seguridad ni la regresión funcional de 3.3. El tester se delega únicamente para TDD de cambios funcionales deterministas; visual/docs los verifica directamente el ingeniero.

## Goals / Non-Goals

**Goals:**
- Separar política de escritura y lectura histórica con cambios mínimos en los tres paquetes.
- Serializar el último cupo entre autores distintos sin perder la exclusión mutua por autor ni introducir locks de tabla.
- Mantener rechazo autoritativo y experiencia coherente aun con caché desactualizada.

**Non-Goals:**
- Cambiar esquema, `ltree`, constraints, RLS, privilegios, índices, moderación, autenticación o endpoints.
- Aplanar el árbol, truncar respuestas históricas, crear contadores persistidos, nuevas dependencias, WebSockets o una infraestructura de tests.
- Rediseñar CSS, tocar contenido editorial o redactar nuevos textos legales. La única excepción legal autorizada fue corregir la frase de límites del foro en términos y ya está cerrada; el change visual preserva su baseline legal completa, sin reintroducir placeholders. Sus correcciones locales aprobadas de presentación/pruebas se definen allí y no amplían la política funcional. Acceder a `.env`, migrar o probar contra producción sigue fuera de alcance.

## Decisions

### 1. Límites compartidos de escritura, DTO sin cambios

Actualizar `MAX_COMMENT_DEPTH` a 2 y añadir `MAX_DIRECT_REPLIES_PER_ROOT = 6` en `packages/contracts/src/constants.ts`, exportados también desde `index.ts`. El primero describe exclusivamente nuevas publicaciones, no un filtro o validador de lectura. Mantener `PublicComment.depth` como número y la recursión de `replies` para aceptar historial hasta seis niveles. Backend y frontend consumen las mismas constantes, también al construir copy; no duplicar los literales de la nueva política.

Alternativa descartada: un campo `directReplyCount` o un endpoint de capacidad. Las respuestas directas ya están completas en ambas lecturas; duplicar el dato añadiría sincronización innecesaria. No contar todo el subárbol ni filtrar `isRemoved`.

### 2. Validación y conteo bajo el lock existente de la raíz

Conservar la transacción y el orden actual **autor → comentario raíz**. Reconsultar y bloquear al autor antes de permisos y cooldown; no usar datos del JWT como autorización ni trasladar el cooldown fuera de la transacción.

Para una publicación con `parentId`:
1. Obtener el padre mediante el `SELECT ... FOR UPDATE` existente. Conservar `404 PARENT_NOT_FOUND` si falta.
2. Rechazar si `parent.parentId !== null`; comprobar la forma de raíz esperada (`depth = 1`, `rootId = id`) antes de derivar una nueva ruta. No admitir respuestas históricas como padres ni confiar en datos de profundidad enviados por el cliente.
3. **Después de adquirir el lock**, ejecutar una sentencia separada de conteo de `comments` con `parent_id = parent.id`, sin condición sobre `is_removed`. Si el total es mayor o igual al límite compartido, rechazar.
4. Insertar únicamente si hay cupo, con padre/raíz igual a la raíz bloqueada y ruta de nivel 2. Mantener el lock hasta commit/rollback; raíces nuevas siguen el flujo sin padre.

Usar Drizzle/SQL nativo existentes. Mantener READ COMMITTED para esta transacción, explicitándolo con la opción existente del driver si hace falta garantizar independencia de defaults del servidor: el conteo posterior al lock debe ver el commit del anterior titular. No combinar lock y conteo en una misma sentencia/snapshot anterior a la espera. Todos los publicadores pasan por el mismo lock; no basta un conteo fuera de transacción ni un mutex en memoria. La moderación no cambia el número de nodos y ya sigue usuario actor → comentario, por lo que no exige un lock adicional de respuestas.

Errores propuestos: `409 REPLY_ROOT_ONLY` («Solo puedes responder a un comentario raíz; las respuestas no admiten nuevas respuestas.») y `409 ROOT_REPLY_LIMIT_REACHED` (máximo compartido de respuestas directas). Reutilizar `AppError` y el envelope HTTP existente. Conservar `AUTH_REQUIRED`, `EMAIL_NOT_VERIFIED`, `USER_BANNED`, `COMMENT_COOLDOWN` y sus prioridades actuales. El rechazo revierte la transacción y no deja un nodo que active otro cooldown. No añadir excepciones por rol ADMIN ni cambiar en esta entrega el tratamiento backend de padres retirados; la UI mantiene su exclusión actual `!isRemoved`.

Alternativas descartadas: bajar la constraint física a dos (rechazaría historial y futuras operaciones sobre él), trigger/migración o contador persistido (innecesarios), bloquear primero la raíz (alteraría el orden vigente), o serializar todo el foro (exceso de contención).

### 3. Una elegibilidad en listado e hilo, manteniendo lectura recursiva

`CommentItem` deriva elegibilidad de participación habilitada, `parentId === null`, profundidad de raíz, `!isRemoved` y `replies.length < MAX_DIRECT_REPLIES_PER_ROOT`. Reutilizar esa decisión tanto en el botón como en el envío del composer abierto; si pierde cupo, deshabilitar Publicar sin borrar el borrador ni impedir Cancelar. No eliminar la recursión, `hasDeepConversation`, enlaces/anclas, autores, fechas, orden ni descendientes retirados.

Conservar los criterios de sesión y degradación existentes; usar el estado de red ya expuesto por `useSession` también al habilitar el hilo, sin refactorizar el proveedor de sesión. Cambiar solo el copy funcional que anuncia la regla antigua, en especial «Cómo participar», y los nuevos errores. No crear etiquetas de profundidad ni reescribir textos legales, salvo la corrección posterior explícitamente autorizada de la frase de límites del foro en términos.

Alternativa descartada: cortar el render a nivel 2. El límite afecta a nuevas escrituras, no a la visibilidad del historial.

### 4. Conflictos de caché sin publicaciones ficticias

Después de éxito, conservar `publishForumComment` y las páginas/cursor; la sexta respuesta debe actualizar la elegibilidad de inmediato. En el hilo, incorporar el éxito recibido o bloquear nuevos envíos mientras se relee para evitar una ventana con cupo aparente.

Ante `ROOT_REPLY_LIMIT_REACHED` o `REPLY_ROOT_ONLY`, anunciar el error accesible, mantener el borrador y no insertar nada en caché. Usar `invalidateForumCache` y un callback mínimo del composer hacia su página para revalidar listado/hilo por las rutas existentes. Un rechazo por cupo deja esa raíz no publicable hasta obtener lectura actualizada; no inventar nodos para rellenar su conteo. Si la red falla, conservar la última lectura y sesión, no borrar cookies ni disparar refresh por un `409`. Conservar la protección de `refreshForumCache` contra sobreescribir publicaciones recientes. No añadir polling ni modificar el cliente HTTP global.

**Reparación acotada de 3.3:** aplicar protección local de vigencia a las lecturas iniciales y callbacks de revalidación del hilo, incluidos `then`, `catch` y finalización de carga. Identificar el hilo/ciclo vigente y el orden de lecturas/publicaciones; invalidar lecturas anteriores al sexto éxito, a una revalidación más reciente o a navegación/desmontaje. Cancelar la petición cuando corresponda, pero no asumir que abortar basta para impedir un resultado ya resuelto. Capturar los rechazos: cancelación obsoleta no anuncia errores; fallo vigente conserva el árbol y usa el error/degradación accesible existente sin nuevo copy. Mantener bloqueado el reenvío tras conflicto hasta lectura vigente. El callback antiguo de publicación tampoco puede aplicar datos a otra raíz. Reutilizar el componente, `appendThreadReply`, caché y rutas actuales; no extraer un gestor global, modificar sesión/CSRF/HTTP, crear DTO/endpoints ni rediseñar permisos.

Este alcance vuelve autorizado íntegro: una guardia en `then` no basta si `catch`, finalización de carga o el callback antiguo todavía pueden modificar la vista/avisos. Mantener captura de todos los rechazos pertinentes y el aviso accesible existente del fallo vigente; no retirar ese tratamiento por considerarlo visual ni crear nuevos mensajes. El requirement `Interfaz de respuesta coherente con el cupo` y todos sus escenarios del delta se conservan sin recortes.

El tester registra Red contra el componente/callback real mediante promesas HTTP controladas o rutas interceptadas antes de navegar: lectura vieja de cinco hijos → sexto éxito → lectura nueva de seis → resolución tardía de la vieja; invertir también el orden de dos revalidaciones, cambiar de raíz/desmontar con petición pendiente y rechazar por red tras conflicto/éxito. Observar árbol, cupo, carga/error, borrador y ausencia de `unhandledrejection`, no solo una función pura de caché. El ingeniero aporta Green con la reparación mínima y regresión del listado, páginas/cursor, anclas, READ states, sesión y mensajes existentes. Fixtures HTTP no certifican concurrencia PostgreSQL.

Como `Interfaz de respuesta coherente con el cupo` ya está sincronizado en la spec principal, su bloque completo revisado se declara `MODIFIED`, no `ADDED`. Los otros bloques históricos y el delta legal se conservan; este ajuste de operación ocurre solo en el delta del change y no ejecuta otra sincronización.

## Risks / Trade-offs

- [El lock solo protege escritores que lo respetan] → Toda publicación nueva usa `forum.publish` vía Express; no hay escritura directa de cliente ni una segunda ruta autorizada. El SQL usado para sembrar fixtures históricas es exclusivamente de prueba aislada.
- [Aislamiento configurado externamente] → Garantizar READ COMMITTED en esta transacción; un conteo con snapshot congelado no certifica el cupo. Una prueba simulada tampoco demuestra atomicidad PostgreSQL.
- [Más de seis respuestas antiguas] → No truncar DTO ni render; comprobar `>=` en servidor y `<` en UI, contando retiradas y solo hijos directos.
- [Planes concurrentes] → Las cláusulas de conservación visual no bloquean 3.3 completa ni cambian la política funcional. Las ramas de seis niveles siguen siendo historial, no permiso de escritura multinivel. V 5.4 está retirada: no exigir corregir/reejecutar su script obsoleto ni aceptarlo como certificación actual; la regresión afectada de F 3.3 mantiene raíz/cupo/historial con el contrato correcto.
- [Referencia histórica de contexto/legal a seis niveles, ya corregida en 5.1] → Conservar la alineación acotada de `apps/web/src/pages/LegalPage.tsx:82`, `docs/context.md:85` y `AGENTS.md:16`: raíz de nivel 1, hasta seis respuestas directas de nivel 2, sin respuestas a respuestas; retiradas cuentan cupo, descendientes indirectos históricos no, e historial hasta seis niveles intacto. El delta legal ya sincronizado sustituye solo «seis niveles» por esa regla y conserva el resto de la descripción y el escenario, incluida la omisión de una sección de moderación. No reabrirlo ni modificar privacidad, retención, proveedores, SEO u otras declaraciones aprobadas.

## Migration Plan

No hay migración de datos ni de esquema: desplegar contracts, backend y frontend coherentes desde el mismo monorepo. El backend puede endurecerse primero si no se despliega todo junto; clientes antiguos recibirán los conflictos nuevos. Evitar convivencia de servidores escritores con la política antigua, pues no aplicarían el cupo. Los checks de constraint y las fixtures de lectura histórica permanecen válidos.

En implementación, usar TDD mínimo con `node:test` existente: rechazar padre respuesta; sexto aceptado/séptimo rechazado; permisos y cooldown preservados; elegibilidad y caché; y una prueba de carrera entre autores sobre cinco hijos. Adaptar `depth.db.test.ts`: no volver a generar una cadena histórica mediante la API ya restringida; sembrarla solo en una base aislada autorizada y comprobar su lectura. Esa prueba PostgreSQL queda protegida por `ALLOW_DATABASE_TESTS` y `DATABASE_TEST_URL`, sin ejecutarla ni prometer un resultado si no hay base aislada y permiso. No sustituirla por mocks presentados como garantía real ni añadir un e2e grande.

Para cada nuevo cambio funcional, incluido 3.3, el ingeniero ejecutará check y lint desde raíz (procedimiento existente `pnpm --config.verifyDepsBeforeRun=false check` y `lint` con el mismo flag), tests afectados con la infraestructura actual y build frontend. Usar el script `test` raíz con ese flag cuando corresponda; registrar selección, comandos, salidas y skips reales. Contracts se reconstruye antes del typecheck. Conservar 4.1 marcada como histórico, no como verificación de la nueva reparación; retirar V 8.1 no prohíbe ni dispensa esta obligación técnica. No alegar CI, instalar dependencias automáticamente, leer `.env` ni ejecutar DB/SQL/migraciones. Este update solo valida el CLI de OpenSpec.

La tarea 5.1 y su sincronización ya están cerradas; no repetir alineación ni editar el delta legal. Tester/TDD solo ante cambios funcionales con resultado determinista que puedan romper funcionalidad: 3.3 mantiene el Red/Green del componente/callback real y su regresión asociada. Inspecciones visuales/docs las verifica directamente el ingeniero, sin delegación al tester ni tests artificiales. La prueba PostgreSQL de 2.3 conserva su guard y la excepción explícita de skip sin base aislada y permiso específico; no reabrirla ni afirmar carrera real ejecutada, y no acceder a `.env`, SQL o producción.

El cierre vigente requiere Green real de 3.3 completa, regresión afectada y check/lint raíz, tests afectados y build; este update no los ejecuta ni acredita reparación runtime. Coordinar con V 8.3/8.5/8.6 únicamente para el alcance vigente: declarar verificaciones retiradas, baseline no recreada y V 3.6 aceptada por fuente/evidencia de entrega con GREEN puntual de cuatro estados ejecutado/registrado en `map-size-green.json` y suite unitaria 7/7 ejecutada; solo el runner AMPLIO histórico `resource-checks` quedó cancelado/no acreditado por timeout MCP sin reporte y retirado por V 3.10/8.1, además del skip PostgreSQL. No atribuir nueva ejecución ni más cobertura, exigir las reejecuciones omitidas o sostener READY con casos retenidos sin ejecutar. Un aviso futuro READY se limita al alcance cerrado y explicita esas limitaciones, no es aprobación runtime integral. Unión, sync, archive y commits quedan fuera de este update y requieren una petición posterior.

Un rollback de interfaz no altera datos pero mantiene los rechazos backend. Revertir también el backend reabriría la política antigua y requiere una decisión funcional explícita; no es una solución automática a una discrepancia visual.
