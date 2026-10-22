# Publicación backend: RED de respuestas directas limitadas

Scope: tasks 2.1–2.4, interfaz pública `createForumModule(db).publish`. Leídos proposal, design, tasks, delta completo de foro, módulo y tests existentes. No hay cambio de producto, contracts/constants, rutas, schema, migraciones, frontend o planning.

## Ejecución real

Antes del build se verificaron los padres raíz, `apps/server`, `src/forum`, `node_modules`, `packages/contracts` y su `dist`.

Desde raíz:

```powershell
pnpm --config.verifyDepsBeforeRun=false --filter @blogdpc/server build
```

**Exit 0.** Compila tests y servidor usando los contracts dist existentes, sin reconstruir ni modificar sus límites actuales.

Desde `apps/server`:

```powershell
node --test dist/forum/publish.test.js dist/forum/tree.test.js dist/forum/depth.db.test.js
```

Se forzó `ALLOW_DATABASE_TESTS=false` solo durante esta invocación y se restituyó su valor anterior en `finally`. No se consultaron credenciales ni `.env`.

**Exit 1; 13 tests: 7 pass, 4 fail, 2 skipped, 0 cancelled.** No es fallo de build/import/harness.

## RED esperado del módulo actual

- Padre respuesta histórica (path nivel 2, parentId no nulo): `Missing expected rejection`; hoy admite el nuevo nieto en vez de `409 REPLY_ROOT_ONLY`.
- Sexta directa sobre cinco hijos: la respuesta se crea con depth 2 y relaciones correctas, pero el rastro es `author-lock → latest → parent-lock → insert`; falta `count` separado antes de insertar. El test también exige config `{ isolationLevel: 'read committed' }` al avanzar hasta esa aserción.
- Séptima directa sobre seis: `Missing expected rejection` en vez de `409 ROOT_REPLY_LIMIT_REACHED`.
- Mismo rechazo contando una retirada: `Missing expected rejection`; la moderación no debe liberar cupo.

## GREEN heredado

- Raíz sin padre: depth 1, rootId propio, texto normalizado e insert único.
- `AUTH_REQUIRED`, `EMAIL_NOT_VERIFIED`, `USER_BANNED`, `COMMENT_COOLDOWN` mantienen prioridad y no llegan a raíz/conteo/insert.
- `tree.test.ts` existente: orden de hermanos y normalización/rechazo de texto siguen pasando.

## Qué demuestra el doble, y qué no

`publish.test.ts` adapta la interfaz Database/tx con builders mínimos. Clasifica por tabla y proyección, no por una cola de respuestas prefabricadas. Inspecciona el WHERE real mediante `PgDialect.sqlToQuery`: el count solo acepta igualdad `parent_id = raíz`, sin filtro de retiradas, root_id, autor o descendientes. Calcula `{count}` sobre los hijos de la fixture, incluidas retiradas; un descendiente indirecto no se cuenta.

Las consultas/inserciones exigen estar dentro de tx. Se observa `FOR UPDATE`, el orden autor→latest→padre→count→insert y la configuración de aislamiento solicitada. No se afirma lock efectivo, rollback o atomicidad PostgreSQL por pasar un doble. La ausencia real de validación/cupo/conteo en la implementación anterior hace RED las nuevas aserciones; no se ajustan expectativas para volver verde.

## PostgreSQL guardado: NO ejecutado

`depth.db.test.ts` se adapta a sembrar historial **solo por SQL dentro del test opt-in**, nunca publicando una cadena multinivel mediante la API endurecida:

- Historial físico 1–6, padre nivel 3 retirado y descendientes/orden/lectura intactos.
- Raíz histórica con siete directas, retirada incluida: legible en hilo/listado, cerrada a nuevas publicaciones; rechazos sin comentario ni nuevo cooldown.
- Dos autores distintos compitiendo por el sexto cupo sobre cinco hijos, una retirada: exactamente un éxito, un conflicto de cupo y total seis.

Ambos callbacks quedaron **SKIP real**, protegidos por `ALLOW_DATABASE_TESTS === 'true' && DATABASE_TEST_URL`. En esta entrega no se abrió conexión ni se ejecutaron seeds, limpieza o carrera. No se garantiza concurrencia real hasta una ejecución autorizada con base aislada. La limpieza preparada afecta solo autores/filas de la fixture, de hojas a raíz, no tablas globales.

## Archivos y handoff

- `apps/server/src/forum/publish.test.ts`: 9 casos mínimos de publicación, 5 verdes / 4 RED actuales.
- `apps/server/src/forum/depth.db.test.ts`: dos pruebas PostgreSQL omitidas.
- Esta evidencia; ninguna tarea marcada ni spec editada.

Siguiente GREEN: ingeniero modifica únicamente la política de publish, constantes autorizadas y tx para satisfacer esos contratos. No hay nuevo route harness ni cambio de envelope HTTP en este ciclo. Las pruebas guarded de PG continúan pendientes, no deben habilitarse con una URL de producción ni por iniciativa automática.
