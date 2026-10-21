## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## BlogDPC

Contexto primario: **`context.md`** antes de modificar (se auto-carga como instrucción). Cubre: 7 módulos vacíos por decisión, foro `/retroalimentacion` (respuestas solo a raíz, máximo 6 directas; historial multinivel conservado), chatbot técnico flotante con SSE y pool secuencial NVIDIA/OpenRouter/Gemini (RAM context, sin DB, 10 req/60s), auth JWT HttpOnly + OIDC, admin rol interno, DB Postgres/Supabase solo vía Express, Koyeb mismo origen.

### Specs: fuentes de verdad

- Los requisitos del proyecto viven en **`openspec/specs/`**, un directorio por capacidad. Antes de cambiar una capacidad, leer su spec completa con escenarios (`openspec show "<id>" --type spec`); inventario con `openspec list --specs`.
- Todo cambio de comportamiento empieza como cambio OpenSpec: `/opsx-propose` redacta los deltas (ADDED/MODIFIED/REMOVED), `/opsx-apply` implementa y `/opsx-archive` fusiona los deltas de vuelta a las specs. Las specs no se editan directo para cambiar comportamiento.
- Artefactos en español con encabezados estructurales y SHALL/MUST en inglés (`openspec/config.yaml`); `openspec validate --specs` comprueba el formato.

### Verificación (todo verificado localmente; no hay CI — no existe `.github/`)

- `pnpm check` → typecheck de los 3 paquetes. Usar **siempre desde la raíz**: reconstruye `packages/contracts` antes de revisar server/web, que lo resuelven desde `dist/`. `pnpm --filter @blogdpc/server check` en solitaro tras editar contracts usa `dist/` viejo.
- `pnpm lint` → solo oxlint de `apps/web` (server y contracts no tienen linter). Ya hay warnings; exit 0.
- `pnpm test` → server + web. No requiere `.env` ni BD.
- Orden recomendado: `pnpm check` → `pnpm lint` → `pnpm test`.

### Tests individuales

- Server: corren **compilados**. `pnpm --filter @blogdpc/server build` y luego `node --test dist/<ruta>/<archivo>.test.js` desde `apps/server`.
- Web: TS en vivo. `node --experimental-strip-types --test tests/<archivo>.test.ts` desde `apps/web` (los tests evitan a propósito el alias `@/` y los imports en runtime de contracts).
- `*.db.test.ts` se saltan salvo `ALLOW_DATABASE_TESTS=true` + `DATABASE_TEST_URL` con una base **aislada** (nunca la de producción; `pnpm db:verify` lo exige igual).

### Desarrollo local

- `pnpm dev` levanta **solo el servidor** (tsx watch, :3000). El frontend es otro proceso: `pnpm --filter @blogdpc/web dev` (Vite con proxy `/api` → localhost:3000).
- Scripts del server cargan la raíz `.env` con `--env-file-if-exists`. `loadConfig` (apps/server/src/config.ts:51) exige **todas** las 25 variables requeridas (SMTP, Google OIDC, JWT ≥ 32 chars, `NVIDIA_NIM_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`): sin `.env` completo el server no arranca. `check`/`lint`/`test` sí funcionan sin `.env`.
- `DATABASE_URL` debe ser `postgresql://` (rol restringido `blogdpc_app`); `DATABASE_MIGRATION_URL` es la conexión admin para migraciones. Nunca la URL HTTPS de Supabase — hay un test que la rechaza.
- Migraciones: `pnpm db:generate` (drizzle-kit, offline) → revisar el SQL generado en `apps/server/drizzle` → `pnpm db:migrate`. **No corren en `pnpm dev`**, solo en `prestart` de `pnpm start`.
- `pnpm admin:create` asigna rol ADMIN (requiere `ADMIN_EMAIL`/`ADMIN_NAME`/`ADMIN_PASSWORD` en `.env`).

### Arquitectura (lo no obvio por nombres)

- pnpm workspace: `apps/web` (React 19 + Vite + Tailwind 4), `apps/server` (Express 5, ESM, `tsc` → `dist`), `packages/contracts` (Zod, **consumido desde `dist/`**: reconstruir tras editar).
- Patrón del server por feature: `src/<feature>/module.ts` (lógica) + `routes.ts` (HTTP) (p. ej. `auth`, `forum`, `chat`); errores vía `AppError` en `src/http/errors.ts`.
- Express sirve `apps/web/dist` (si `WEB_DIST_PATH` está definido) y la API bajo `/api/*` desde el mismo origen; en desarrollo sirve Vite con proxy.
- Los límites de cada capacidad (duraciones de tokens, profundidad y cooldown del foro, RLS y rol de BD, política de caché, cuotas y timeouts del chatbot) viven en las specs `autenticacion`, `foro-retroalimentacion`, `acceso-datos`, `despliegue` y `chatbot-tecnico`: basarse en ellas, no en este archivo.

### Contenido

- Los 7 módulos están vacíos **por decisión**: no rellenar contenido editorial sin instrucción explícita (`context.md` §4). Voz, plataformas externas de la guía y CMS fuera de alcance; el chatbot técnico de consulta ISAC/6G ya está implementado (`openspec/changes/2026-10-18-agrega-chatbot-tecnico`, specs `chatbot-tecnico`).
