# Graph Report - Blog  (2026-10-08)

## Corpus Check
- 174 files · ~213,211 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 25 file(s) not represented in the graph (top: .avif 17, (none) 4, .css 1)

## Summary
- 1127 nodes · 2117 edges · 76 communities (65 shown, 11 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1aeb5996`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- ref_node_assert
- verify-session.db.test.ts
- sprint0-baseline.ts
- auth/module.ts
- app.ts
- BibliometricMap.tsx
- ModuleLayout.tsx
- src/index.ts
- Requirement: Interfaz de respuesta coherente con el cupo
- components.json
- compilerOptions
- ADDED Requirements
- contracts/package.json
- server/package.json
- web/package.json
- dependencies
- compilerOptions
- scripts
- forum/module.ts
- dependencies
- Despliegue
- Foro de retroalimentación
- Módulos editoriales
- dialog.tsx
- Autenticación
- compilerOptions
- devDependencies
- compilerOptions
- Shared SVG Icon Sprite (external-use symbol set for BlogDPC web app)
- contracts/tsconfig.json
- devDependencies
- scripts
- BlogDPC — Sensing & Communications (ISAC)
- .oxlintrc.json
- web/tsconfig.json
- Requirements
- Plantilla React + TypeScript + Vite
- ADDED Requirements
- drizzle-kit
- OpenSpec schema: spec-driven
- Regla de idioma: artefactos en español
- allowBuilds: esbuild
- nodeLinker: hoisted
- verify.ts
- Requirement: Contenido editorial y recursos implementados en los siete módulos
- Decisions
- moduleContent.tsx
- AppShell.tsx
- freeze-science.ts
- AppShell
- ADDED Requirements
- editorial-conservation.test.ts
- Tasks
- 4.2 Conservación histórica y discrepancias
- Requirement: Legibilidad del árbol con sangría visual acumulada acotada
- Proposal
- OfdmExplorer.tsx
- Design
- Proposal
- resource-oracles.test.ts
- Publicación backend: RED de respuestas directas limitadas
- Tasks
- README.md
- Requirement: Accesibilidad operativa
- Coherencia documental autorizada — tarea 5.1
- scripts
- sheet.tsx
- Design
- MODIFIED Requirements
- Tasks
- cn
- packages_contracts_dist_constants_max_comment_depth
- packages_contracts_dist_index_max_comment_depth

## God Nodes (most connected - your core abstractions)
1. `Button()` - 42 edges
2. `react` - 41 edges
3. `api()` - 32 edges
4. `StatusNotice()` - 27 edges
5. `AppError` - 24 edges
6. `App()` - 19 edges
7. `react-router-dom` - 19 edges
8. `compilerOptions` - 19 edges
9. `Header()` - 17 edges
10. `useSession()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `2. Política autoritativa y transacción` --references--> `publish()`  [INFERRED]
  openspec/changes/archive/2026-10-08-foro-respuestas-directas-limitadas/tasks.md → apps/web/src/pages/forum/CommentComposer.tsx
- `3. Elegibilidad, copy y caché del frontend` --references--> `ThreadPage()`  [INFERRED]
  openspec/changes/archive/2026-10-08-foro-respuestas-directas-limitadas/tasks.md → apps/web/src/pages/forum/ThreadPage.tsx
- `Ciclos TDD registrados` --references--> `appendThreadReply()`  [INFERRED]
  openspec/changes/archive/2026-10-08-foro-respuestas-directas-limitadas/evidence/verification.md → apps/web/src/pages/forum/forumCache.ts
- `2. Validación y conteo bajo el lock existente de la raíz` --references--> `AppError`  [INFERRED]
  openspec/changes/archive/2026-10-08-foro-respuestas-directas-limitadas/design.md → apps/server/src/http/errors.ts
- `3. Una elegibilidad en listado e hilo, manteniendo lectura recursiva` --references--> `useSession()`  [INFERRED]
  openspec/changes/archive/2026-10-08-foro-respuestas-directas-limitadas/design.md → apps/web/src/session/SessionProvider.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Navegación global: siete módulos, raíz y enlaces legales** — openspec_specs_modulos_editoriales_navegacion_secuencial_de_los_siete_modulos, openspec_specs_paginas_legales_enlaces_legales_en_la_navegacion_global, openspec_specs_modulos_editoriales_la_raiz_redirige_al_primer_modulo [EXTRACTED 1.00]
- **Renovación y contención de la sesión del navegador** — openspec_specs_autenticacion_rotacion_de_refresh_con_revocacion_de_familia, openspec_specs_sesion_web_renovacion_unica_ante_401, openspec_specs_autenticacion_cookies_seguras_y_origen_verificado [INFERRED 0.75]
- **Flujo de moderación y estado de usuarios del foro** — openspec_specs_foro_retroalimentacion_suspension_preserva_la_lectura, openspec_specs_moderacion_administracion_gestion_de_usuarios, openspec_specs_moderacion_administracion_acceso_restringido_por_rol [INFERRED 0.85]

## Communities (76 total, 11 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (82): AdminCommentsPage, AdminFallback(), AdminUsersPage, App(), RouteErrorBoundary(), EditorialNote(), Formula(), Glossary() (+74 more)

### Community 1 - "ref_node_assert"
Cohesion: 0.07
Nodes (41): Textarea(), CommentComposer(), publish(), appendForumPage(), appendThreadReply(), cache, ForumCache, invalidateForumCache() (+33 more)

### Community 2 - "verify-session.db.test.ts"
Cohesion: 0.15
Nodes (18): config, Fixture, startApp(), createDatabase(), accountTokens, appRole, appSchema, ltree (+10 more)

### Community 3 - "sprint0-baseline.ts"
Cohesion: 0.07
Nodes (23): client, databaseUrl, isLocal, client, databaseUrl, isLocal, client, currentDirectory (+15 more)

### Community 4 - "auth/module.ts"
Cohesion: 0.15
Nodes (26): AccessClaims, accessClaimsSchema, createOpaqueToken(), deriveKey(), GoogleState, googleStateSchema, hashOpaqueToken(), hashPassword() (+18 more)

### Community 5 - "app.ts"
Cohesion: 0.12
Nodes (32): AdminModule, createAdminRouter(), uuidSchema, createApp(), AuthModule, createAuthRouter(), ForumModule, createForumRouter() (+24 more)

### Community 6 - "BibliometricMap.tsx"
Cohesion: 0.08
Nodes (27): BibliometricFindings(), CLUSTER_READINGS, decimal(), LinkWeight, METHOD_REFERENCES, NetworkData, number(), PAIR_LABELS (+19 more)

### Community 7 - "ModuleLayout.tsx"
Cohesion: 0.22
Nodes (14): ModuleLayout(), ModuleProgress(), PreviousNext(), useIsDesktop(), FORUM_PATH, moduleByPath(), ModuleInfo, nextOf() (+6 more)

### Community 8 - "src/index.ts"
Cohesion: 0.05
Nodes (36): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why, 1. Contratos compartidos (+28 more)

### Community 9 - "Requirement: Interfaz de respuesta coherente con el cupo"
Cohesion: 0.08
Nodes (25): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Anidamiento máximo de seis niveles, Requirement: Cupo atómico de seis respuestas directas por raíz, Requirement: Integridad del historial, Requirement: Interfaz de respuesta coherente con el cupo, Requirement: Nuevas respuestas solo a comentarios raíz (+17 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 12 - "ADDED Requirements"
Cohesion: 0.08
Nodes (23): ADDED Requirements, Purpose, Requirement: Adaptación sin desbordamiento global, Requirement: Flujos auxiliares y estados existentes sin ampliación funcional, Requirement: Lenguaje visual editorial compartido, Requirement: Movimiento reactivo rápido y no decorativo, Requirement: Movimiento reducido también en la cámara, Requirement: Shell compacto con navegación y cuenta diferenciadas (+15 more)

### Community 13 - "contracts/package.json"
Cohesion: 0.10
Nodes (20): import, types, dependencies, zod, devDependencies, typescript, exports, ./constants (+12 more)

### Community 14 - "server/package.json"
Cohesion: 0.11
Nodes (18): @blogdpc/contracts, @types/node, typescript, zod, main, name, private, type (+10 more)

### Community 15 - "web/package.json"
Cohesion: 0.09
Nodes (21): @blogdpc/contracts, @types/node, typescript, name, private, type, version, @fontsource-variable/inter (+13 more)

### Community 16 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, @blogdpc/contracts, class-variance-authority, cn, @fontsource-variable/inter, graphology, katex, lucide-react (+11 more)

### Community 17 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 18 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, admin:create, build, check, db:audit, db:cleanup, db:generate, db:migrate (+7 more)

### Community 19 - "forum/module.ts"
Cohesion: 0.09
Nodes (28): createAdminModule(), ensureAdmin(), parentAuthors, parentComments, Database, comments, CommentRow, createForumModule() (+20 more)

### Community 20 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, @blogdpc/contracts, cookie, drizzle-orm, express, express-rate-limit, helmet, jose (+4 more)

### Community 21 - "Despliegue"
Cohesion: 0.18
Nodes (12): Migraciones versionadas y cadenas PostgreSQL, Cookies seguras y origen verificado, Rotación de refresh con revocación de familia, Despliegue, Ciclo de vida del proceso, Política de caché, Un solo origen, Orden y paginación por cursor (+4 more)

### Community 22 - "Foro de retroalimentación"
Cohesion: 0.20
Nodes (12): Rol ADMIN por comando interno, Anidamiento máximo de seis niveles, Foro de retroalimentación, Cooldown transaccional, Integridad del historial, Suspensión preserva la lectura, Texto plano acotado, Acceso restringido por rol (+4 more)

### Community 23 - "Módulos editoriales"
Cohesion: 0.20
Nodes (12): Módulos editoriales, Contenido reservado hasta aprobación, El mini-caso evalúa el trade-off OFDM-DFRC, La raíz redirige al primer módulo, Navegación secuencial de los siete módulos, Páginas legales, Enlaces legales en la navegación global, Rutas legales públicas (+4 more)

### Community 24 - "dialog.tsx"
Cohesion: 0.44
Nodes (9): Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogPortal(), DialogTitle() (+1 more)

### Community 25 - "Autenticación"
Cohesion: 0.20
Nodes (11): Acceso a datos, Esquema privado aislado, Puerta única de acceso, Rol de aplicación con privilegios mínimos, Autorización reconsultando la base de datos, Autenticación, Google OIDC sin fusión de cuentas, Registro con verificación de correo (+3 more)

### Community 26 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, noUncheckedIndexedAccess, skipLibCheck (+2 more)

### Community 27 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+2 more)

### Community 28 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, declaration, outDir, rootDir, sourceMap, extends, include, ../../tsconfig.base.json

### Community 29 - "Shared SVG Icon Sprite (external-use symbol set for BlogDPC web app)"
Cohesion: 0.39
Nodes (8): Favicon Wave Mark (purple zigzag bolt with blurred lavender wave streaks), Bluesky Icon (butterfly social logo, dark fill), Discord Icon (community platform logo, dark fill), Documentation Icon (document glyph with code chevrons, purple stroke), GitHub Icon (Octocat-in-circle logo, dark fill), Social Icon (person with star glyph, purple stroke), Shared SVG Icon Sprite (external-use symbol set for BlogDPC web app), X Icon (X/Twitter social logo, dark fill)

### Community 30 - "contracts/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, declaration, outDir, rootDir, extends, include, ../../tsconfig.base.json

### Community 31 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, drizzle-kit, tsx, @types/express, @types/node, @types/nodemailer, typescript

### Community 32 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, check, dev, lint, preview, test

### Community 33 - "BlogDPC — Sensing & Communications (ISAC)"
Cohesion: 0.33
Nodes (6): Módulo de entrada /src/main.tsx, index.html — shell de la aplicación BlogDPC · ISAC, Paquetes del workspace (apps/*, packages/*), BlogDPC — Sensing & Communications (ISAC), Reto ABET SO7 — Comunicaciones II (27145), UIS, Stack: React, Express y PostgreSQL sobre Supabase

### Community 34 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 35 - "web/tsconfig.json"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 36 - "Requirements"
Cohesion: 0.08
Nodes (23): Presentación frontend Specification, Purpose, Requirement: Adaptación sin desbordamiento global, Requirement: Flujos auxiliares y estados existentes sin ampliación funcional, Requirement: Lenguaje visual editorial compartido, Requirement: Movimiento reactivo rápido y no decorativo, Requirement: Movimiento reducido también en la cámara, Requirement: Shell compacto con navegación y cuenta diferenciadas (+15 more)

### Community 37 - "Plantilla React + TypeScript + Vite"
Cohesion: 0.67
Nodes (3): Configuración de Oxlint, Plantilla React + TypeScript + Vite, React Compiler

### Community 38 - "ADDED Requirements"
Cohesion: 0.09
Nodes (22): ADDED Requirements, Requirement: Composición de lectura y recursos técnicos, Requirement: Conservación integral del contenido editorial actual, Requirement: Explorador OFDM con parámetros y resultados diferenciados, Requirement: Figuras científicas íntegras y atribuidas, Requirement: Jerarquía editorial y ubicación sin progreso completado, Requirement: Mapa bibliométrico legible sin cambiar su representación científica, Scenario: Comparación con la versión anterior al rediseño (+14 more)

### Community 44 - "verify.ts"
Cohesion: 0.09
Nodes (18): AppConfig, booleanFromEnv, envSchema, loadConfig(), createdUserIds, database, databaseUrl, isLocal (+10 more)

### Community 45 - "Requirement: Contenido editorial y recursos implementados en los siete módulos"
Cohesion: 0.09
Nodes (21): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Contenido editorial y recursos implementados en los siete módulos, Requirement: Contenido reservado hasta aprobación, Requirement: El mini-caso evalúa el trade-off OFDM-DFRC, Requirement: Navegación secuencial de los siete módulos, Scenario: El estado del arte enlaza aplicaciones y fundamentos técnicos (+13 more)

### Community 46 - "Decisions"
Cohesion: 0.11
Nodes (18): 1. Una sola capa de tokens y primitivas, 2. Shell compacto y editorial con dos anchos, 3. Figuras y bloques técnicos: presentación antes que nuevos activos, 4. Bibliometría y OFDM: separar organización de cálculo, 5. Foro: limitar la sangría del árbol completo, no por componente, 6. Auxiliares y matriz cerrada de estados observados, 7. Movimiento: dos tokens, CSS primero y puente nativo al canvas, 8. Contratos y oráculos de referencia, sin reejecución amplia retirada (+10 more)

### Community 47 - "moduleContent.tsx"
Cohesion: 0.17
Nodes (10): ForumInvitation(), Glossary, LazyGlossary(), ODDMDiagram(), ReferenceFigure(), ReferenceFigureProps, SignalDiagram(), MODULES (+2 more)

### Community 48 - "AppShell.tsx"
Cohesion: 0.30
Nodes (13): Header(), DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), Separator() (+5 more)

### Community 49 - "freeze-science.ts"
Cohesion: 0.18
Nodes (11): FORMULAS, assets, baseline, corners, dataset, fixture, paths, read() (+3 more)

### Community 50 - "AppShell"
Cohesion: 0.17
Nodes (11): AppShell(), Footer(), OfflineBanner(), Capabilities, Impact, Modified Capabilities, New Capabilities, Non-goals (+3 more)

### Community 51 - "ADDED Requirements"
Cohesion: 0.18
Nodes (10): ADDED Requirements, MODIFIED Requirements, Requirement: Contenido de privacidad aprobado, Requirement: Contenido de términos aprobado, Requirement: Rutas legales públicas, Scenario: Acceso directo, Scenario: Consulta de retención, Scenario: Consulta sobre comentarios (+2 more)

### Community 52 - "editorial-conservation.test.ts"
Cohesion: 0.29
Nodes (7): routes, captureEditorial(), conservationDifferences(), normalizeText(), networkFingerprint(), sha256(), sortedMap()

### Community 53 - "Tasks"
Cohesion: 0.18
Nodes (10): 1. Baseline de conservación, estados y entorno, 2. Tokens, shell y piloto editorial, 4. Propagación a los siete módulos y glosario, 5. Foro y flujos auxiliares, 6. Movimiento rápido y preferencia reducida completa, 7. Responsive, teclado, contraste y estados, 8. Integración, revisiones independientes y verificación final, 9. Correcciones locales solicitadas: foto 1 y composer aprobado (+2 more)

### Community 54 - "4.2 Conservación histórica y discrepancias"
Cohesion: 0.20
Nodes (9): 4.1 Resultados, 4.2 Conservación histórica y discrepancias, Alcance respetado, Ciclos TDD registrados, Conservación histórica verificada, Discrepancias con textos que aún describen la política anterior (documentadas, NO modificadas por instrucción del design), Evidencia de verificación integrada (tasks 4.1 y 4.2), F 3.3 — revalidación de hilo (2026-10-09) (+1 more)

### Community 55 - "Requirement: Legibilidad del árbol con sangría visual acumulada acotada"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Composer claro blanco y azul sin cambios funcionales, Requirement: Legibilidad del árbol con sangría visual acumulada acotada, Scenario: Comentario y respuesta con la misma dirección clara, Scenario: Conversación completa de seis niveles en móvil, Scenario: Error y cancelación conservados bajo ambos modos de movimiento, Scenario: Listado y vista enfocada conservados, Scenario: Nivel máximo y comentario retirado (+1 more)

### Community 56 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 57 - "OfdmExplorer.tsx"
Cohesion: 0.46
Nodes (5): controls, number(), OfdmExplorer(), OFDM_DEFAULTS, ofdmMetrics()

### Community 58 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 59 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 60 - "resource-oracles.test.ts"
Cohesion: 0.33
Nodes (8): ofdmDisplayDifferences(), pairKey(), rendererDifferences(), clusterProjection(), clusterTieFixture(), edge(), item(), sizeFor()

### Community 61 - "Publicación backend: RED de respuestas directas limitadas"
Cohesion: 0.25
Nodes (7): Archivos y handoff, Ejecución real, GREEN heredado, PostgreSQL guardado: NO ejecutado, Publicación backend: RED de respuestas directas limitadas, Qué demuestra el doble, y qué no, RED esperado del módulo actual

### Community 62 - "Tasks"
Cohesion: 0.50
Nodes (3): 1. Publicación del contenido, 2. Verificación integrada, Tasks

### Community 64 - "Requirement: Accesibilidad operativa"
Cohesion: 0.25
Nodes (7): MODIFIED Requirements, Requirement: Accesibilidad operativa, Scenario: Contraste y acciones sin hover, Scenario: Menú y diálogo con foco restaurado, Scenario: Navegación por teclado, Scenario: Reflow accesible en la matriz responsive, Spec Delta

### Community 65 - "Coherencia documental autorizada — tarea 5.1"
Cohesion: 0.29
Nodes (6): Autorización y alcance, Coherencia documental autorizada — tarea 5.1, Copy y contexto, Límites y estado, Specs sincronizadas, Verificación ejecutada

### Community 66 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, check, dev, lint, test

### Community 67 - "sheet.tsx"
Cohesion: 0.47
Nodes (5): SheetContent(), SheetOverlay(), SheetPortal(), lucide-react, @radix-ui/react-dialog

### Community 68 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 70 - "MODIFIED Requirements"
Cohesion: 0.40
Nodes (4): MODIFIED Requirements, Requirement: Contenido de términos aprobado, Scenario: Consulta sobre comentarios, Spec Delta

### Community 72 - "Tasks"
Cohesion: 0.50
Nodes (3): 1. Verificación de la base y el alcance, 2. Validación y sincronización OpenSpec, Tasks

## Knowledge Gaps
- **502 isolated node(s):** `SeededComment`, `CommentRow`, `publicSelection`, `root`, `Author` (+497 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 583 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `ref_node_assert`, `sheet.tsx`, `BibliometricMap.tsx`, `ModuleLayout.tsx`, `cn`, `moduleContent.tsx`, `AppShell.tsx`, `web/package.json`, `dialog.tsx`, `OfdmExplorer.tsx`, `resource-oracles.test.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `server/package.json`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `drizzle-orm` connect `verify-session.db.test.ts` to `sprint0-baseline.ts`, `auth/module.ts`, `app.ts`, `verify.ts`, `server/package.json`, `forum/module.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `SeededComment`, `CommentRow`, `publicSelection` to the rest of the system?**
  _502 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06316094451687672 - nodes in this community are weakly interconnected._
- **Should `ref_node_assert` be split into smaller, more focused modules?**
  _Cohesion score 0.06623376623376623 - nodes in this community are weakly interconnected._
- **Should `sprint0-baseline.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._