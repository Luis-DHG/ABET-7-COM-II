# Graph Report - Blog  (2026-10-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 795 nodes · 1686 edges · 51 communities (45 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00320e8e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- moduleContent.tsx
- verify-session.db.test.ts
- sprint0-baseline.ts
- auth/module.ts
- auth/routes.ts
- BibliometricMap.tsx
- AppShell.tsx
- src/index.ts
- migrate.ts
- components.json
- compilerOptions
- Requirement: Contenido editorial y recursos implementados en los siete módulos
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
- postgres
- Plantilla React + TypeScript + Vite
- AppError
- drizzle-kit
- OpenSpec schema: spec-driven
- Regla de idioma: artefactos en español
- allowBuilds: esbuild
- nodeLinker: hoisted
- app.ts
- Proposal
- start-dev.ps1
- Design
- provision-role.ts
- ref_node_path
- Tasks

## God Nodes (most connected - your core abstractions)
1. `Button()` - 42 edges
2. `react` - 37 edges
3. `api()` - 33 edges
4. `StatusNotice()` - 29 edges
5. `AppError` - 22 edges
6. `App()` - 19 edges
7. `react-router-dom` - 19 edges
8. `compilerOptions` - 19 edges
9. `Header()` - 17 edges
10. `ApiError` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Despliegue` --references--> `BlogDPC — Sensing & Communications (ISAC)`  [INFERRED]
  openspec/specs/despliegue/spec.md → README.md
- `Foro de retroalimentación` --references--> `Foro de retroalimentación`  [INFERRED]
  openspec/specs/foro-retroalimentacion/spec.md → README.md
- `Moderación y administración` --references--> `Foro de retroalimentación`  [INFERRED]
  openspec/specs/moderacion-administracion/spec.md → README.md
- `Acceso a datos` --references--> `Stack: React, Express y PostgreSQL sobre Supabase`  [INFERRED]
  openspec/specs/acceso-datos/spec.md → README.md
- `index.html — shell de la aplicación BlogDPC · ISAC` --conceptually_related_to--> `BlogDPC — Sensing & Communications (ISAC)`  [INFERRED]
  apps/web/index.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Navegación global: siete módulos, raíz y enlaces legales** — openspec_specs_modulos_editoriales_navegacion_secuencial_de_los_siete_modulos, openspec_specs_paginas_legales_enlaces_legales_en_la_navegacion_global, openspec_specs_modulos_editoriales_la_raiz_redirige_al_primer_modulo [EXTRACTED 1.00]
- **Renovación y contención de la sesión del navegador** — openspec_specs_autenticacion_rotacion_de_refresh_con_revocacion_de_familia, openspec_specs_sesion_web_renovacion_unica_ante_401, openspec_specs_autenticacion_cookies_seguras_y_origen_verificado [INFERRED 0.75]
- **Flujo de moderación y estado de usuarios del foro** — openspec_specs_foro_retroalimentacion_suspension_preserva_la_lectura, openspec_specs_moderacion_administracion_gestion_de_usuarios, openspec_specs_moderacion_administracion_acceso_restringido_por_rol [INFERRED 0.85]

## Communities (51 total, 6 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (86): AdminCommentsPage, AdminFallback(), AdminUsersPage, App(), RouteErrorBoundary(), FieldError(), ICONS, StatusNotice() (+78 more)

### Community 1 - "moduleContent.tsx"
Cohesion: 0.09
Nodes (25): EditorialNote(), ForumInvitation(), Formula(), Glossary(), normalize(), terms, Glossary, LazyGlossary() (+17 more)

### Community 2 - "verify-session.db.test.ts"
Cohesion: 0.13
Nodes (19): config, Fixture, startApp(), createDatabase(), accountTokens, appRole, appSchema, comments (+11 more)

### Community 3 - "sprint0-baseline.ts"
Cohesion: 0.20
Nodes (7): client, databaseUrl, isLocal, result, SectionResult, startedAt, ref_node_fs

### Community 4 - "auth/module.ts"
Cohesion: 0.17
Nodes (24): AccessClaims, accessClaimsSchema, createOpaqueToken(), deriveKey(), GoogleState, googleStateSchema, hashOpaqueToken(), hashPassword() (+16 more)

### Community 5 - "auth/routes.ts"
Cohesion: 0.14
Nodes (25): createAdminRouter(), uuidSchema, AuthModule, createAuthRouter(), createForumRouter(), ACCESS_COOKIE, clearSessionCookies(), GOOGLE_STATE_COOKIE (+17 more)

### Community 6 - "BibliometricMap.tsx"
Cohesion: 0.15
Nodes (12): BibliometricMap(), CLUSTER_NOTES, COLORS, MapTerm, number(), VOSItem, VOSLink, VOSNetwork (+4 more)

### Community 7 - "AppShell.tsx"
Cohesion: 0.11
Nodes (35): AppShell(), Footer(), Header(), OfflineBanner(), ModuleLayout(), ModuleProgress(), PreviousNext(), useIsDesktop() (+27 more)

### Community 8 - "src/index.ts"
Cohesion: 0.09
Nodes (22): MAX_COMMENT_DEPTH, AdminCommentsQuery, adminCommentsQuerySchema, AdminUsersQuery, adminUsersQuerySchema, CommentsQuery, commentsQuerySchema, CreateCommentInput (+14 more)

### Community 9 - "migrate.ts"
Cohesion: 0.29
Nodes (6): client, currentDirectory, databaseUrl, isLocal, migrationsFolder, ref_node_url

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
Cohesion: 0.11
Nodes (17): @blogdpc/contracts, @types/node, typescript, zod, main, name, private, type (+9 more)

### Community 15 - "web/package.json"
Cohesion: 0.11
Nodes (18): @blogdpc/contracts, @types/node, typescript, name, private, type, version, @fontsource-variable/inter (+10 more)

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
Cohesion: 0.20
Nodes (11): CommentRow, depthOf(), ForumModule, normalizeCommentBody(), publicSelection, toPublic(), buildCommentTree(), FlatPublicComment (+3 more)

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

### Community 36 - "postgres"
Cohesion: 0.22
Nodes (7): client, databaseUrl, isLocal, client, databaseUrl, isLocal, postgres

### Community 37 - "Plantilla React + TypeScript + Vite"
Cohesion: 0.67
Nodes (3): Configuración de Oxlint, Plantilla React + TypeScript + Vite, React Compiler

### Community 38 - "AppError"
Cohesion: 0.14
Nodes (21): AdminModule, createAdminModule(), ensureAdmin(), parentAuthors, parentComments, createApp(), createForumModule(), Cursor (+13 more)

### Community 44 - "app.ts"
Cohesion: 0.10
Nodes (20): AppConfig, booleanFromEnv, envSchema, loadConfig(), Database, createdUserIds, database, databaseUrl (+12 more)

### Community 45 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 47 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 48 - "provision-role.ts"
Cohesion: 0.40
Nodes (4): client, databaseUrl, input, isLocal

### Community 49 - "ref_node_path"
Cohesion: 0.40
Nodes (4): ref_node_path, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 50 - "Tasks"
Cohesion: 0.50
Nodes (3): 1. Verificación de la base y el alcance, 2. Validación y sincronización OpenSpec, Tasks

## Knowledge Gaps
- **331 isolated node(s):** `Tone`, `ApiOptions`, `ApiResult`, `SessionInvalidListener`, `AdminComment` (+326 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 385 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `moduleContent.tsx`, `BibliometricMap.tsx`, `AppShell.tsx`, `web/package.json`, `dialog.tsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `drizzle-orm` connect `app.ts` to `verify-session.db.test.ts`, `auth/module.ts`, `AppError`, `migrate.ts`, `server/package.json`, `forum/module.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `react-router-dom` connect `App.tsx` to `moduleContent.tsx`, `AppShell.tsx`, `web/package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `Tone`, `ApiOptions`, `ApiResult` to the rest of the system?**
  _331 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06058221872541306 - nodes in this community are weakly interconnected._
- **Should `moduleContent.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08780487804878048 - nodes in this community are weakly interconnected._
- **Should `verify-session.db.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1282051282051282 - nodes in this community are weakly interconnected._