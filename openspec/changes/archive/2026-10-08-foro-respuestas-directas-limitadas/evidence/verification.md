# Evidencia de verificación integrada (tasks 4.1 y 4.2)

Fecha: 2026-10-07. Comandos ejecutados desde la raíz del monorepo con `--config.verifyDepsBeforeRun=false` (sin instalaciones automáticas, sin `.env`, sin BD, sin producción).

## 4.1 Resultados

| Comando | Resultado |
|---|---|
| `pnpm --config.verifyDepsBeforeRun=false check` | Exit 0. Contracts se reconstruye primero (`tsc -p tsconfig.json`); después typecheck de contracts, web y server sin errores. |
| `pnpm --config.verifyDepsBeforeRun=false lint` | Exit 0 con los **8 warnings previos** heredados (badge, button, SessionProvider `only-export-components`; AdminCommentsPage, ThreadPage, VerifyEmailPage, AdminUsersPage, ForumPage `set-state-in-effect`). Sin warnings nuevos de este change. |
| `pnpm --config.verifyDepsBeforeRun=false test` | Server: 20 tests, **17 pass, 0 fail, 3 skipped**. Web: 29 tests, **29 pass, 0 fail**. |

### Skips reales (no ejecutados)

- `registro → correo → verify-email…` — requiere `ALLOW_DATABASE_TESTS=true` y `DATABASE_TEST_URL` (base aislada).
- `historial hasta nivel 6 y descendientes de retirado se leen; raíz histórica >6 queda cerrada` — ídem.
- `PostgreSQL: dos autores sobre cinco hijos producen un éxito, un conflicto y total seis` — ídem. **La carrera real entre autores no se ejecutó**: la atomicidad del cupo queda garantizada por revisión del lock/conteo/insert dentro de la misma transacción READ COMMITTED (`forum/module.ts`), no por mocks. No se afirma una corrida PostgreSQL ni una garantía no probada.

### Ciclos TDD registrados

- RED backend: `apps/server/src/forum/publish.test.ts` (4 fallos esperados frente a la política anterior) → GREEN 11 pass. Evidencia en `evidence/publish-red.md`.
- RED frontend: `apps/web/tests/reply-policy.test.ts` (2 fallos: faltaba `replyPolicy.ts` y `appendThreadReply`) → GREEN 4/4 junto con `forum-cache.test.ts` existente.

## 4.2 Conservación histórica y discrepancias

### Conservación histórica verificada

- `PublicComment.depth` sigue siendo número y `replies` recursivo: la lectura admite profundidades históricas sin campos nuevos ni validación restrictiva (contracts sin cambios de DTO).
- `tree.test.ts` verde: el árbol conserva orden de hermanos; `depth.db.test.ts` (parte determinista) mantiene la lectura de historial hasta nivel 6, descendientes de retirados y raíz histórica con más de seis directas legible pero cerrada, sin tocar `db/schema.ts`, constraints ni migraciones.
- `forum-cache.test.ts` verde: páginas/cursor/borrador conservados; una revalidación antigua no sobrescribe una publicación reciente; la sexta respuesta actualiza elegibilidad sin nodos ficticios ni duplicar ids.
- El render recursivo, `hasDeepConversation`, anclas (`#comment-*`), relaciones padre/raíz, texto plano y las clases del rediseño visual (`comment-item`, `data-depth`) permanecen intactas.

### Discrepancias con textos que aún describen la política anterior (documentadas, NO modificadas por instrucción del design)

| Ubicación | Texto vigente |
|---|---|
| `apps/web/src/pages/LegalPage.tsx:82` | «…pueden formar conversaciones de hasta seis niveles…» |
| `docs/context.md:85` | «Comentarios máximo **6 niveles**:» |
| `AGENTS.md:16` | «foro `/retroalimentacion` (6 niveles)» |
| `openspec/specs/paginas-legales/spec.md:28` | «…límites de 3 a 2000 caracteres y seis niveles…» (spec principal; se actualiza al archivar/sincronizar, no aquí) |
| `openspec/specs/foro-retroalimentacion/spec.md:23` | «Anidamiento máximo de seis niveles» (spec principal; el delta de este change la REMUEVE al archivar) |

La corrección del texto legal requiere autorización específica; el cambio de las specs principales ocurre al archivar este change, no como parte de esta entrega.

### Alcance respetado

- Sin nuevos endpoints, dependencias, migraciones, cambios de `db/schema.ts`, auditoría, RLS, edición de legales/contenido/assets/CSS ni cambios a `mejora-visual-minimalista-frontend` (cuyos artefactos fueron reconciliados por el especificador en paralelo).
- Sin sync de specs principales, archive ni commits.

## F 3.3 — revalidación de hilo (2026-10-09)

- RED funcional reproducido antes del fix: `thread-revalidation-red-confirmation.json`, 20 checks / 7 fallos; evidencia de lectura vieja borrando la sexta y reabriendo Responder, overwrite entre raíces, rechazos no capturados y falta de aviso accesible.
- GREEN del mismo runner después del fix: `thread-revalidation-engineer-green.json`, 20/20, y `thread-revalidation-final-engineer-green.json`, resumen 20/20 tras retirar una limpieza redundante de `thread` al cambiar raíz. El suplemento `thread-revalidation-supplement-final-engineer-green.json` añade 12/12 para lecturas iniciales obsoletas y callback POST tardío A→B→A. Todas las rutas API de estas ejecuciones fueron fixtures interceptadas antes de navegar.
- Verificación técnica posterior a la reparación: `pnpm --config.verifyDepsBeforeRun=false check` exit 0 (contracts, web, server); `pnpm --config.verifyDepsBeforeRun=false lint` exit 0 con 8 warnings conocidos; `pnpm --config.verifyDepsBeforeRun=false test`: server 17 pass/3 skips DB protegidos, web 29/29; build web con exit 0 y aviso existente de chunk >500 kB.
- La suite PostgreSQL aislada no se ejecutó. Estas fixtures comprueban vigencia/rechazos del cliente real en navegador, no atomicidad PostgreSQL.
