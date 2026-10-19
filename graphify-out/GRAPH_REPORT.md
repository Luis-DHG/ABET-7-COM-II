# Graph Report - Blog  (2026-10-18)

## Corpus Check
- 186 files · ~234,617 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .avif 17, (none) 4, .ico 1)

## Summary
- 1324 nodes · 2383 edges · 103 communities (91 shown, 12 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 97 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b2b7476`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- verify-session.db.test.ts
- sprint0-baseline.ts
- auth/module.ts
- app.ts
- BibliometricMap.tsx
- moduleContent.tsx
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
- Design
- AppShell.tsx
- ModuleLayout.tsx
- ref_node_path
- ADDED Requirements
- loadConfig
- admin/module.ts
- 4.2 Conservación histórica y discrepancias
- Requirement: Legibilidad del árbol con sangría visual acumulada acotada
- Proposal
- BibliometricFindings.tsx
- Design
- Proposal
- resource-oracles.test.ts
- Publicación backend: RED de respuestas directas limitadas
- Tasks
- README.md
- Requirement: Accesibilidad operativa
- Coherencia documental autorizada — tarea 5.1
- scripts
- Requirement: El mini-caso evalúa el trade-off OFDM-DFRC
- Design
- MODIFIED Requirements
- Tasks
- Proposal
- Design
- ADDED Requirements
- Requirement: Acceso autenticado sin restricciones del foro
- Design
- Tasks
- Requirement: Contrato de entrada estricto
- Requirement: Cuota deslizante por usuario
- packages_contracts_dist_constants_max_comment_depth
- Requirement: Presupuesto de entrada y rollover transaccional
- Spec Delta
- Requirement: Bloqueo de envío durante streaming
- Requirement: Configuración server-only
- Requirement: Contexto en memoria separado por identidad real
- Requirement: Controlador global persistente
- Requirement: Deadline hasta el primer contenido
- Requirement: Desconexión y cierre ordenado
- Requirement: Exclusión por conversación
- Requirement: Expiración de contexto
- Requirement: Fallback solo antes de contenido
- packages_contracts_dist_index_max_comment_depth
- Requirement: Historial no aislado por cuenta
- Requirement: Parser SSE incremental robusto
- Requirement: Persistencia de pares completos por pestaña
- Requirement: Pool secuencial de modelos
- Requirement: Privacidad y observabilidad
- Requirement: Protocolo SSE de salida
- Requirement: Recuperación de almacenamiento degradado
- Requirement: Renovación compartida sin replay
- Requirement: Terminación explícita y orden de confirmación

## God Nodes (most connected - your core abstractions)
1. `react` - 44 edges
2. `Button()` - 42 edges
3. `api()` - 36 edges
4. `Design` - 27 edges
5. `StatusNotice()` - 27 edges
6. `AppError` - 26 edges
7. `ADDED Requirements` - 25 edges
8. `App()` - 20 edges
9. `react-router-dom` - 19 edges
10. `compilerOptions` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Orden de admisión` --references--> `requestContext()`  [INFERRED]
  openspec/CHATBOT_SPEC.md → apps/server/src/http/middleware.ts
- `Errores y recuperación` --references--> `parseWith()`  [INFERRED]
  openspec/CHATBOT_SPEC.md → apps/server/src/http/errors.ts
- `Sesión web y seam HTTP` --references--> `api()`  [INFERRED]
  openspec/CHATBOT_SPEC.md → apps/web/src/lib/http.ts
- `Risks / Trade-offs` --references--> `errorHandler()`  [INFERRED]
  openspec/changes/2026-10-18-agrega-chatbot-tecnico/design.md → apps/server/src/http/errors.ts
- `Impact` --references--> `ModuleLayout()`  [INFERRED]
  openspec/changes/2026-10-18-agrega-chatbot-tecnico/proposal.md → apps/web/src/components/ModuleLayout.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Navegación global: siete módulos, raíz y enlaces legales** — openspec_specs_modulos_editoriales_navegacion_secuencial_de_los_siete_modulos, openspec_specs_paginas_legales_enlaces_legales_en_la_navegacion_global, openspec_specs_modulos_editoriales_la_raiz_redirige_al_primer_modulo [EXTRACTED 1.00]
- **Renovación y contención de la sesión del navegador** — openspec_specs_autenticacion_rotacion_de_refresh_con_revocacion_de_familia, openspec_specs_sesion_web_renovacion_unica_ante_401, openspec_specs_autenticacion_cookies_seguras_y_origen_verificado [INFERRED 0.75]
- **Flujo de moderación y estado de usuarios del foro** — openspec_specs_foro_retroalimentacion_suspension_preserva_la_lectura, openspec_specs_moderacion_administracion_gestion_de_usuarios, openspec_specs_moderacion_administracion_acceso_restringido_por_rol [INFERRED 0.85]

## Communities (103 total, 12 thin omitted)

### Community 0 - "react"
Cohesion: 0.05
Nodes (97): AdminCommentsPage, AdminFallback(), AdminUsersPage, App(), RouteErrorBoundary(), FieldError(), ICONS, StatusNotice() (+89 more)

### Community 2 - "verify-session.db.test.ts"
Cohesion: 0.10
Nodes (29): config, Fixture, startApp(), createDatabase(), Database, accountTokens, appRole, appSchema (+21 more)

### Community 3 - "sprint0-baseline.ts"
Cohesion: 0.08
Nodes (20): client, databaseUrl, isLocal, client, currentDirectory, databaseUrl, isLocal, migrationsFolder (+12 more)

### Community 4 - "auth/module.ts"
Cohesion: 0.17
Nodes (24): AccessClaims, accessClaimsSchema, createOpaqueToken(), deriveKey(), GoogleState, googleStateSchema, hashOpaqueToken(), hashPassword() (+16 more)

### Community 5 - "app.ts"
Cohesion: 0.11
Nodes (37): AdminModule, createAdminRouter(), uuidSchema, createApp(), AuthModule, createAuthRouter(), ForumModule, createForumRouter() (+29 more)

### Community 6 - "BibliometricMap.tsx"
Cohesion: 0.14
Nodes (16): BibliometricMap(), COLORS, edgeSize(), MapTerm, number(), rgb(), VOSItem, VOSLink (+8 more)

### Community 7 - "moduleContent.tsx"
Cohesion: 0.07
Nodes (40): AlphaResponseChart(), AlphaTradeoffExplorer(), chart, number(), panels, percent(), EditorialNote(), ForumInvitation() (+32 more)

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
Cohesion: 0.10
Nodes (19): @blogdpc/contracts, @types/node, typescript, name, private, type, version, @fontsource-variable/inter (+11 more)

### Community 16 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, @blogdpc/contracts, class-variance-authority, cn, @fontsource-variable/inter, graphology, katex, lucide-react (+11 more)

### Community 17 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 18 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, admin:create, build, check, db:cleanup, db:generate, db:migrate, db:provision-role (+6 more)

### Community 19 - "forum/module.ts"
Cohesion: 0.22
Nodes (10): CommentRow, depthOf(), normalizeCommentBody(), publicSelection, toPublic(), buildCommentTree(), FlatPublicComment, packages_contracts_dist_index_commentsquery (+2 more)

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
Cohesion: 0.10
Nodes (16): AppConfig, booleanFromEnv, envSchema, createdUserIds, database, databaseUrl, isLocal, migrationsFolder (+8 more)

### Community 45 - "Requirement: Contenido editorial y recursos implementados en los siete módulos"
Cohesion: 0.09
Nodes (21): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Contenido editorial y recursos implementados en los siete módulos, Requirement: Contenido reservado hasta aprobación, Requirement: El mini-caso evalúa el trade-off OFDM-DFRC, Requirement: Navegación secuencial de los siete módulos, Scenario: El estado del arte enlaza aplicaciones y fundamentos técnicos (+13 more)

### Community 46 - "Decisions"
Cohesion: 0.11
Nodes (18): 1. Una sola capa de tokens y primitivas, 2. Shell compacto y editorial con dos anchos, 3. Figuras y bloques técnicos: presentación antes que nuevos activos, 4. Bibliometría y OFDM: separar organización de cálculo, 5. Foro: limitar la sangría del árbol completo, no por componente, 6. Auxiliares y matriz cerrada de estados observados, 7. Movimiento: dos tokens, CSS primero y puente nativo al canvas, 8. Contratos y oráculos de referencia, sin reejecución amplia retirada (+10 more)

### Community 47 - "Design"
Cohesion: 0.05
Nodes (42): Acceptance and verification, Actividad y TTL, Appendix A — Literal system prompt, Archivos nuevos propuestos, Arquitectura general, Autenticación y autorización, Client state machine, Context and compatibility (+34 more)

### Community 48 - "AppShell.tsx"
Cohesion: 0.11
Nodes (30): AppShell(), Footer(), Header(), OfflineBanner(), DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+22 more)

### Community 49 - "ModuleLayout.tsx"
Cohesion: 0.05
Nodes (49): ModuleLayout(), ModuleProgress(), PreviousNext(), useIsDesktop(), controls, number(), OfdmExplorer(), FORUM_PATH (+41 more)

### Community 50 - "ref_node_path"
Cohesion: 0.40
Nodes (4): ref_node_path, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 51 - "ADDED Requirements"
Cohesion: 0.18
Nodes (10): ADDED Requirements, MODIFIED Requirements, Requirement: Contenido de privacidad aprobado, Requirement: Contenido de términos aprobado, Requirement: Rutas legales públicas, Scenario: Acceso directo, Scenario: Consulta de retención, Scenario: Consulta sobre comentarios (+2 more)

### Community 52 - "loadConfig"
Cohesion: 0.09
Nodes (20): loadConfig(), Context, Decisions, Design, Goals / Non-Goals, Migration Plan, Risks / Trade-offs, Capabilities (+12 more)

### Community 53 - "admin/module.ts"
Cohesion: 0.23
Nodes (10): createAdminModule(), ensureAdmin(), parentAuthors, parentComments, Cursor, cursorSchema, decodeCursor(), encodeCursor() (+2 more)

### Community 54 - "4.2 Conservación histórica y discrepancias"
Cohesion: 0.20
Nodes (9): 4.1 Resultados, 4.2 Conservación histórica y discrepancias, Alcance respetado, Ciclos TDD registrados, Conservación histórica verificada, Discrepancias con textos que aún describen la política anterior (documentadas, NO modificadas por instrucción del design), Evidencia de verificación integrada (tasks 4.1 y 4.2), F 3.3 — revalidación de hilo (2026-10-09) (+1 more)

### Community 55 - "Requirement: Legibilidad del árbol con sangría visual acumulada acotada"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Composer claro blanco y azul sin cambios funcionales, Requirement: Legibilidad del árbol con sangría visual acumulada acotada, Scenario: Comentario y respuesta con la misma dirección clara, Scenario: Conversación completa de seis niveles en móvil, Scenario: Error y cancelación conservados bajo ambos modos de movimiento, Scenario: Listado y vista enfocada conservados, Scenario: Nivel máximo y comentario retirado (+1 more)

### Community 56 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 57 - "BibliometricFindings.tsx"
Cohesion: 0.21
Nodes (11): BibliometricFindings(), CLUSTER_READINGS, decimal(), LinkWeight, METHOD_REFERENCES, NetworkData, number(), PAIR_LABELS (+3 more)

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

### Community 67 - "Requirement: El mini-caso evalúa el trade-off OFDM-DFRC"
Cohesion: 0.20
Nodes (9): MODIFIED Requirements, Requirement: El mini-caso evalúa el trade-off OFDM-DFRC, Scenario: Apuesta antes de explorar, Scenario: Cambio de escenario, Scenario: Carga diferida, Scenario: Enfoque técnico del mini-caso, Scenario: Exploración de parámetros OFDM, Scenario: Ficha de datos (+1 more)

### Community 68 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 70 - "MODIFIED Requirements"
Cohesion: 0.40
Nodes (4): MODIFIED Requirements, Requirement: Contenido de términos aprobado, Scenario: Consulta sobre comentarios, Spec Delta

### Community 72 - "Tasks"
Cohesion: 0.50
Nodes (3): 1. Verificación de la base y el alcance, 2. Validación y sincronización OpenSpec, Tasks

### Community 73 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 74 - "Design"
Cohesion: 0.20
Nodes (9): 1. Límites compartidos de escritura, DTO sin cambios, 2. Validación y conteo bajo el lock existente de la raíz, 3. Una elegibilidad en listado e hilo, manteniendo lectura recursiva, Context, Decisions, Design, Goals / Non-Goals, Migration Plan (+1 more)

### Community 75 - "ADDED Requirements"
Cohesion: 0.29
Nodes (7): ADDED Requirements, Requirement: Accesibilidad y diseño adaptable, Requirement: Render seguro de Markdown y matemáticas, Scenario: Contenido hostil, Scenario: LaTeX parcial durante streaming, Scenario: Operación por teclado, Scenario: Viewports y movimiento reducido

### Community 76 - "Requirement: Acceso autenticado sin restricciones del foro"
Cohesion: 0.50
Nodes (4): Requirement: Acceso autenticado sin restricciones del foro, Scenario: Credenciales inválidas o usuario inexistente, Scenario: Transacción liberada antes del proveedor, Scenario: Usuario sin permiso de publicar en el foro

### Community 77 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 78 - "Tasks"
Cohesion: 0.33
Nodes (5): 1. OpenSpec, 2. Modelo y pruebas, 3. Explorador, 4. Verificación y entrega, Tasks

### Community 79 - "Requirement: Contrato de entrada estricto"
Cohesion: 0.50
Nodes (4): Requirement: Contrato de entrada estricto, Scenario: Campos no admitidos, Scenario: Límite de longitud exacto, Scenario: Origen inválido

### Community 80 - "Requirement: Cuota deslizante por usuario"
Cohesion: 0.50
Nodes (4): Requirement: Cuota deslizante por usuario, Scenario: Fallos posteriores consumen cuota, Scenario: Frontera de ventana sin dobles admisiones, Scenario: Recuperación progresiva

### Community 82 - "Requirement: Presupuesto de entrada y rollover transaccional"
Cohesion: 0.50
Nodes (4): Requirement: Presupuesto de entrada y rollover transaccional, Scenario: Candidato aún excedido, Scenario: Fallo con rollover preparado, Scenario: Frontera del presupuesto

### Community 84 - "Requirement: Bloqueo de envío durante streaming"
Cohesion: 0.67
Nodes (3): Requirement: Bloqueo de envío durante streaming, Scenario: Doble activación antes del rerender, Scenario: Sesión no apta

### Community 85 - "Requirement: Configuración server-only"
Cohesion: 0.67
Nodes (3): Requirement: Configuración server-only, Scenario: Configuración incompleta, Scenario: Sin exposición al navegador

### Community 86 - "Requirement: Contexto en memoria separado por identidad real"
Cohesion: 0.67
Nodes (3): Requirement: Contexto en memoria separado por identidad real, Scenario: Contexto inexistente, Scenario: Usuarios distintos con el mismo UUID

### Community 87 - "Requirement: Controlador global persistente"
Cohesion: 0.67
Nodes (3): Requirement: Controlador global persistente, Scenario: Cierre y reapertura del panel, Scenario: Navegación durante streaming

### Community 88 - "Requirement: Deadline hasta el primer contenido"
Cohesion: 0.67
Nodes (3): Requirement: Deadline hasta el primer contenido, Scenario: Metadatos no detienen el timer, Scenario: Primer contenido válido

### Community 89 - "Requirement: Desconexión y cierre ordenado"
Cohesion: 0.67
Nodes (3): Requirement: Desconexión y cierre ordenado, Scenario: Cierre del proceso, Scenario: Cliente desconectado

### Community 90 - "Requirement: Exclusión por conversación"
Cohesion: 0.67
Nodes (3): Requirement: Exclusión por conversación, Scenario: Otra clave progresa, Scenario: Solicitud concurrente para la misma clave

### Community 91 - "Requirement: Expiración de contexto"
Cohesion: 0.67
Nodes (3): Requirement: Expiración de contexto, Scenario: Actividad que no cuenta, Scenario: Frontera de TTL

### Community 92 - "Requirement: Fallback solo antes de contenido"
Cohesion: 0.67
Nodes (3): Requirement: Fallback solo antes de contenido, Scenario: Agotamiento del pool, Scenario: Fallo después del primer fragmento

### Community 94 - "Requirement: Historial no aislado por cuenta"
Cohesion: 0.67
Nodes (3): Requirement: Historial no aislado por cuenta, Scenario: Cambio de cuenta en la misma pestaña, Scenario: Pestaña clonada

### Community 95 - "Requirement: Parser SSE incremental robusto"
Cohesion: 0.67
Nodes (3): Requirement: Parser SSE incremental robusto, Scenario: Fragmentación arbitraria, Scenario: Respuesta inválida

### Community 96 - "Requirement: Persistencia de pares completos por pestaña"
Cohesion: 0.67
Nodes (3): Requirement: Persistencia de pares completos por pestaña, Scenario: Recarga durante generación, Scenario: Recarga tras éxito

### Community 97 - "Requirement: Pool secuencial de modelos"
Cohesion: 0.67
Nodes (3): Requirement: Pool secuencial de modelos, Scenario: Construcción de cada intento, Scenario: Fallback secuencial

### Community 98 - "Requirement: Privacidad y observabilidad"
Cohesion: 0.67
Nodes (3): Requirement: Privacidad y observabilidad, Scenario: Inspección de acceso a datos, Scenario: Logs sin contenido sensible

### Community 99 - "Requirement: Protocolo SSE de salida"
Cohesion: 0.67
Nodes (3): Requirement: Protocolo SSE de salida, Scenario: Error antes del primer fragmento, Scenario: Error con stream iniciado

### Community 100 - "Requirement: Recuperación de almacenamiento degradado"
Cohesion: 0.67
Nodes (3): Requirement: Recuperación de almacenamiento degradado, Scenario: Envelope corrupto, Scenario: Storage no disponible

### Community 101 - "Requirement: Renovación compartida sin replay"
Cohesion: 0.67
Nodes (3): Requirement: Renovación compartida sin replay, Scenario: 401 concurrente con otra llamada, Scenario: Stream interrumpido

### Community 102 - "Requirement: Terminación explícita y orden de confirmación"
Cohesion: 0.67
Nodes (3): Requirement: Terminación explícita y orden de confirmación, Scenario: Commit previo al terminal downstream, Scenario: EOF sin terminal

## Knowledge Gaps
- **613 isolated node(s):** `Purpose`, `In scope`, `Non-goals`, `Desfase documental reconocido`, `Arquitectura general` (+608 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 705 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `BibliometricMap.tsx`, `moduleContent.tsx`, `web/package.json`, `AppShell.tsx`, `ModuleLayout.tsx`, `dialog.tsx`, `BibliometricFindings.tsx`, `resource-oracles.test.ts`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell.tsx` to `react`, `loadConfig`, `app.ts`, `Requirement: Controlador global persistente`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `ADDED Requirements` connect `ADDED Requirements` to `Requirement: Acceso autenticado sin restricciones del foro`, `Requirement: Contrato de entrada estricto`, `Requirement: Cuota deslizante por usuario`, `Requirement: Presupuesto de entrada y rollover transaccional`, `Spec Delta`, `Requirement: Bloqueo de envío durante streaming`, `Requirement: Configuración server-only`, `Requirement: Contexto en memoria separado por identidad real`, `Requirement: Controlador global persistente`, `Requirement: Deadline hasta el primer contenido`, `Requirement: Desconexión y cierre ordenado`, `Requirement: Exclusión por conversación`, `Requirement: Expiración de contexto`, `Requirement: Fallback solo antes de contenido`, `Requirement: Historial no aislado por cuenta`, `Requirement: Parser SSE incremental robusto`, `Requirement: Persistencia de pares completos por pestaña`, `Requirement: Pool secuencial de modelos`, `Requirement: Privacidad y observabilidad`, `Requirement: Protocolo SSE de salida`, `Requirement: Recuperación de almacenamiento degradado`, `Requirement: Renovación compartida sin replay`, `Requirement: Terminación explícita y orden de confirmación`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `api()` (e.g. with `Decisions` and `4. Estado y Hook de Streaming en React`) actually correct?**
  _`api()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Purpose`, `In scope`, `Non-goals` to the rest of the system?**
  _613 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05421749556876238 - nodes in this community are weakly interconnected._
- **Should `verify-session.db.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09872241579558652 - nodes in this community are weakly interconnected._