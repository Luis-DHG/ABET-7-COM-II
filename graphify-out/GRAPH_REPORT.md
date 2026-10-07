# Graph Report - Blog  (2026-10-06)

## Corpus Check
- 148 files · ~215,262 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .avif 17, (none) 4, .css 1)

## Summary
- 985 nodes · 1880 edges · 68 communities (59 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9146c7f8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- moduleContent.tsx
- schema.ts
- sprint0-baseline.ts
- auth/module.ts
- app.ts
- BibliometricMap.tsx
- AppShell.tsx
- src/index.ts
- ADDED Requirements
- components.json
- compilerOptions
- Requirement: Contenido editorial y recursos implementados en los siete módulos
- contracts/package.json
- server/package.json
- web/package.json
- dependencies
- compilerOptions
- scripts
- requirePostgresUrl
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
- ADDED Requirements
- Plantilla React + TypeScript + Vite
- Trazabilidad de contratos de presentación
- drizzle-kit
- OpenSpec schema: spec-driven
- Regla de idioma: artefactos en español
- allowBuilds: esbuild
- nodeLinker: hoisted
- verify-session.db.test.ts
- Proposal
- start-dev.ps1
- Design
- Decisions
- BibliometricFindings.tsx
- Tasks
- ADDED Requirements
- Ciclo vertical 1: manifiesto del workspace — RED
- Tasks
- verify.ts
- Requirement: Accesibilidad operativa
- Proposal
- Requirement: Legibilidad del árbol con sangría visual acumulada acotada
- Design
- Proposal
- editorial-inventory.js
- traceability.md
- Tasks
- README.md
- OfdmExplorer.tsx
- Requirement: Flujos auxiliares y estados existentes sin ampliación funcional
- Requirement: Movimiento reducido también en la cámara

## God Nodes (most connected - your core abstractions)
1. `Button()` - 42 edges
2. `react` - 39 edges
3. `api()` - 33 edges
4. `StatusNotice()` - 27 edges
5. `AppError` - 22 edges
6. `react-router-dom` - 19 edges
7. `App()` - 19 edges
8. `compilerOptions` - 19 edges
9. `Header()` - 17 edges
10. `scripts` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Impact` --references--> `AppShell()`  [INFERRED]
  openspec/changes/mejora-visual-minimalista-frontend/proposal.md → apps/web/src/components/AppShell.tsx
- `Impact` --references--> `ModuleLayout()`  [INFERRED]
  openspec/changes/mejora-visual-minimalista-frontend/proposal.md → apps/web/src/components/ModuleLayout.tsx
- `Despliegue` --references--> `BlogDPC — Sensing & Communications (ISAC)`  [INFERRED]
  openspec/specs/despliegue/spec.md → README.md
- `Foro de retroalimentación` --references--> `Foro de retroalimentación`  [INFERRED]
  openspec/specs/foro-retroalimentacion/spec.md → README.md
- `Moderación y administración` --references--> `Foro de retroalimentación`  [INFERRED]
  openspec/specs/moderacion-administracion/spec.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Navegación global: siete módulos, raíz y enlaces legales** — openspec_specs_modulos_editoriales_navegacion_secuencial_de_los_siete_modulos, openspec_specs_paginas_legales_enlaces_legales_en_la_navegacion_global, openspec_specs_modulos_editoriales_la_raiz_redirige_al_primer_modulo [EXTRACTED 1.00]
- **Renovación y contención de la sesión del navegador** — openspec_specs_autenticacion_rotacion_de_refresh_con_revocacion_de_familia, openspec_specs_sesion_web_renovacion_unica_ante_401, openspec_specs_autenticacion_cookies_seguras_y_origen_verificado [INFERRED 0.75]
- **Flujo de moderación y estado de usuarios del foro** — openspec_specs_foro_retroalimentacion_suspension_preserva_la_lectura, openspec_specs_moderacion_administracion_gestion_de_usuarios, openspec_specs_moderacion_administracion_acceso_restringido_por_rol [INFERRED 0.85]

## Communities (68 total, 9 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (86): AdminCommentsPage, AdminFallback(), AdminUsersPage, App(), RouteErrorBoundary(), Glossary(), normalize(), terms (+78 more)

### Community 1 - "moduleContent.tsx"
Cohesion: 0.08
Nodes (34): EditorialNote(), ForumInvitation(), Formula(), Glossary, LazyGlossary(), ModuleLayout(), ModuleProgress(), PreviousNext() (+26 more)

### Community 2 - "schema.ts"
Cohesion: 0.12
Nodes (15): client, currentDirectory, databaseUrl, isLocal, migrationsFolder, accountTokens, appRole, appSchema (+7 more)

### Community 3 - "sprint0-baseline.ts"
Cohesion: 0.14
Nodes (13): client, databaseUrl, isLocal, result, SectionResult, startedAt, assertWorkspaceManifest(), Manifest (+5 more)

### Community 4 - "auth/module.ts"
Cohesion: 0.16
Nodes (25): AccessClaims, accessClaimsSchema, createOpaqueToken(), deriveKey(), GoogleState, googleStateSchema, hashOpaqueToken(), hashPassword() (+17 more)

### Community 5 - "app.ts"
Cohesion: 0.07
Nodes (58): AdminModule, createAdminModule(), ensureAdmin(), parentAuthors, parentComments, createAdminRouter(), uuidSchema, createApp() (+50 more)

### Community 6 - "BibliometricMap.tsx"
Cohesion: 0.16
Nodes (12): BibliometricMap(), COLORS, MapTerm, number(), rgb(), VOSItem, VOSLink, VOSNetwork (+4 more)

### Community 7 - "AppShell.tsx"
Cohesion: 0.19
Nodes (21): AppShell(), Footer(), Header(), OfflineBanner(), DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+13 more)

### Community 8 - "src/index.ts"
Cohesion: 0.09
Nodes (22): MAX_COMMENT_DEPTH, AdminCommentsQuery, adminCommentsQuerySchema, AdminUsersQuery, adminUsersQuerySchema, CommentsQuery, commentsQuerySchema, CreateCommentInput (+14 more)

### Community 9 - "ADDED Requirements"
Cohesion: 0.15
Nodes (13): ADDED Requirements, Requirement: Adaptación sin desbordamiento global, Requirement: Lenguaje visual editorial compartido, Requirement: Movimiento reactivo rápido y no decorativo, Requirement: Shell compacto con navegación y cuenta diferenciadas, Scenario: Apertura y cierre rápidos, Scenario: Cambio de módulo desde el menú móvil, Scenario: Cuenta y degradación conservadas (+5 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 12 - "Requirement: Contenido editorial y recursos implementados en los siete módulos"
Cohesion: 0.09
Nodes (21): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Contenido editorial y recursos implementados en los siete módulos, Requirement: Contenido reservado hasta aprobación, Requirement: El mini-caso evalúa el trade-off OFDM-DFRC, Requirement: Navegación secuencial de los siete módulos, Scenario: El estado del arte enlaza aplicaciones y fundamentos técnicos (+13 more)

### Community 13 - "contracts/package.json"
Cohesion: 0.10
Nodes (20): import, types, dependencies, zod, devDependencies, typescript, exports, ./constants (+12 more)

### Community 14 - "server/package.json"
Cohesion: 0.12
Nodes (15): @blogdpc/contracts, @types/node, typescript, zod, main, name, private, type (+7 more)

### Community 15 - "web/package.json"
Cohesion: 0.09
Nodes (22): @blogdpc/contracts, @types/node, typescript, name, private, type, version, @fontsource-variable/inter (+14 more)

### Community 16 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, @blogdpc/contracts, class-variance-authority, cn, @fontsource-variable/inter, graphology, katex, lucide-react (+11 more)

### Community 17 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 18 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, admin:create, build, check, db:audit, db:cleanup, db:generate, db:migrate (+7 more)

### Community 19 - "requirePostgresUrl"
Cohesion: 0.13
Nodes (15): client, databaseUrl, isLocal, client, databaseUrl, isLocal, client, databaseUrl (+7 more)

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

### Community 36 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Requirement: Composición de lectura y recursos técnicos, Requirement: Conservación integral del contenido editorial actual, Requirement: Explorador OFDM con parámetros y resultados diferenciados, Requirement: Figuras científicas íntegras y atribuidas, Requirement: Jerarquía editorial y ubicación sin progreso completado, Requirement: Mapa bibliométrico legible sin cambiar su representación científica, Scenario: Comparación con la versión anterior al rediseño (+13 more)

### Community 37 - "Plantilla React + TypeScript + Vite"
Cohesion: 0.67
Nodes (3): Configuración de Oxlint, Plantilla React + TypeScript + Vite, React Compiler

### Community 38 - "Trazabilidad de contratos de presentación"
Cohesion: 0.09
Nodes (22): Condiciones comunes de evidencia, Delta: foro-retroalimentacion, Delta: modulos-editoriales, Delta: presentacion-frontend, Delta: sesion-web, FR-01 — Requirement: Legibilidad del árbol con sangría visual acumulada acotada, Fuentes y uso, Límites y seams aún por cerrar (+14 more)

### Community 44 - "verify-session.db.test.ts"
Cohesion: 0.11
Nodes (19): config, Fixture, startApp(), AppConfig, booleanFromEnv, envSchema, loadConfig(), createDatabase() (+11 more)

### Community 45 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 47 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 48 - "Decisions"
Cohesion: 0.11
Nodes (18): 1. Una sola capa de tokens y primitivas, 2. Shell compacto y editorial con dos anchos, 3. Figuras y bloques técnicos: presentación antes que nuevos activos, 4. Bibliometría y OFDM: separar organización de cálculo, 5. Foro: limitar la sangría del árbol completo, no por componente, 6. Auxiliares y matriz cerrada de estados observados, 7. Movimiento: dos tokens, CSS primero y puente nativo al canvas, 8. Verificación determinista separada de la evaluación visual (+10 more)

### Community 49 - "BibliometricFindings.tsx"
Cohesion: 0.21
Nodes (11): BibliometricFindings(), CLUSTER_READINGS, decimal(), LinkWeight, METHOD_REFERENCES, NetworkData, number(), PAIR_LABELS (+3 more)

### Community 50 - "Tasks"
Cohesion: 0.50
Nodes (3): 1. Verificación de la base y el alcance, 2. Validación y sincronización OpenSpec, Tasks

### Community 51 - "ADDED Requirements"
Cohesion: 0.18
Nodes (10): ADDED Requirements, MODIFIED Requirements, Requirement: Contenido de privacidad aprobado, Requirement: Contenido de términos aprobado, Requirement: Rutas legales públicas, Scenario: Acceso directo, Scenario: Consulta de retención, Scenario: Consulta sobre comentarios (+2 more)

### Community 52 - "Ciclo vertical 1: manifiesto del workspace — RED"
Cohesion: 0.20
Nodes (9): Autorización y límites, Casos propuestos y autorizados, Ciclo vertical 1: manifiesto del workspace — RED, Entrega al ingeniero: siguiente seam GREEN, Mapeo previo y seam confirmado, Reproducción de las tres verificaciones raíz, Sensibilidad a regresión, Suite completa del área afectada (+1 more)

### Community 53 - "Tasks"
Cohesion: 0.22
Nodes (9): 1. Baseline de conservación, estados y entorno, 2. Tokens, shell y piloto editorial, 3. Figuras, bloques científicos y recursos exploratorios, 4. Propagación a los siete módulos y glosario, 5. Foro y flujos auxiliares, 6. Movimiento rápido y preferencia reducida completa, 7. Responsive, teclado, contraste y estados, 8. Integración, revisiones independientes y verificación final (+1 more)

### Community 54 - "verify.ts"
Cohesion: 0.18
Nodes (6): createdUserIds, database, databaseUrl, isLocal, migrationsFolder, Mailer

### Community 55 - "Requirement: Accesibilidad operativa"
Cohesion: 0.25
Nodes (7): MODIFIED Requirements, Requirement: Accesibilidad operativa, Scenario: Contraste y acciones sin hover, Scenario: Menú y diálogo con foco restaurado, Scenario: Navegación por teclado, Scenario: Reflow accesible, Spec Delta

### Community 56 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 57 - "Requirement: Legibilidad del árbol con sangría visual acumulada acotada"
Cohesion: 0.29
Nodes (6): ADDED Requirements, Requirement: Legibilidad del árbol con sangría visual acumulada acotada, Scenario: Conversación completa de seis niveles en móvil, Scenario: Listado y vista enfocada conservados, Scenario: Nivel máximo y comentario retirado, Spec Delta

### Community 58 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 59 - "Proposal"
Cohesion: 0.22
Nodes (8): Capabilities, Impact, Modified Capabilities, New Capabilities, Non-goals, Proposal, What Changes, Why

### Community 61 - "traceability.md"
Cohesion: 0.22
Nodes (5): Evidencia visual de implementación, Línea base, Reparación previa autorizada, Purpose, Spec Delta

### Community 62 - "Tasks"
Cohesion: 0.50
Nodes (3): 1. Publicación del contenido, 2. Verificación integrada, Tasks

### Community 65 - "OfdmExplorer.tsx"
Cohesion: 0.46
Nodes (5): controls, number(), OfdmExplorer(), OFDM_DEFAULTS, ofdmMetrics()

### Community 66 - "Requirement: Flujos auxiliares y estados existentes sin ampliación funcional"
Cohesion: 0.50
Nodes (4): Requirement: Flujos auxiliares y estados existentes sin ampliación funcional, Scenario: Confirmación administrativa, Scenario: Estado pendiente o no implementado, Scenario: Formulario con errores y operación en curso

### Community 67 - "Requirement: Movimiento reducido también en la cámara"
Cohesion: 0.67
Nodes (3): Requirement: Movimiento reducido también en la cámara, Scenario: Cambio durante una animación, Scenario: Preferencia activa al entrar

## Knowledge Gaps
- **443 isolated node(s):** `name`, `version`, `private`, `type`, `main` (+438 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 505 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Impact` connect `Proposal` to `moduleContent.tsx`, `AppShell.tsx`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell.tsx` to `App.tsx`, `Proposal`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _443 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06267217630853994 - nodes in this community are weakly interconnected._
- **Should `moduleContent.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07616892911010557 - nodes in this community are weakly interconnected._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12418300653594772 - nodes in this community are weakly interconnected._
- **Should `sprint0-baseline.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._