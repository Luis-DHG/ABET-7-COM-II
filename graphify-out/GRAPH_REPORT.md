# Graph Report - Blog  (2026-10-20)

## Corpus Check
- 220 files · ~273,615 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .avif 17, (none) 4, .ico 1)

## Summary
- 1764 nodes · 3065 edges · 159 communities (146 shown, 13 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7068c9de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ForumPage.tsx
- Requirement: Interfaz de respuesta coherente con el cupo
- ADDED Requirements
- auth/module.ts
- Design
- ADDED Requirements
- AlphaTradeoffExplorer.tsx
- src/index.ts
- provider.test.ts
- Configuracion shadcn
- TypeScript: aplicacion web
- chat-session.test.ts
- Paquete de contratos
- server/package.json
- web/package.json
- app.ts
- TypeScript: build de Vite
- Scripts del servidor
- module.test.ts
- CommentItem.tsx
- Spec: despliegue y sesion web
- Spec: foro y moderacion
- Spec: modulos y paginas legales
- verify.ts
- Spec: autenticacion y acceso a datos
- TypeScript: configuracion base
- Requirement: Contenido editorial y recursos implementados en los siete módulos
- TypeScript: servidor
- Iconos SVG compartidos
- TypeScript: contratos
- devDependencies
- ModuleLayout.tsx
- README y shell HTML
- Configuracion de Oxlint
- TypeScript: referencias web
- Spec: presentacion frontend
- README de la app web
- moduleContent.tsx
- dependencies
- Esquema de OpenSpec
- Regla de idioma
- Builds permitidos (esbuild)
- Enlace de node_modules (hoisted)
- config.ts
- BlogDPC
- Decisions
- Glossary.tsx
- BibliometricMap.tsx
- AppShell.tsx
- freeze-science.ts
- useChatSession.ts
- Configuracion de Railpack
- forum/module.ts
- dependencies
- routes.test.ts
- ChatMessage.tsx
- ChatWidget
- App.tsx
- ADDED Requirements
- Oraculos de recursos
- react
- StatusNotice.tsx
- README de fixtures editoriales
- devDependencies
- Requirement: Actualización de comentarios en vistas activas mediante SSE
- Scripts de la raiz
- Design
- 4.2 Conservación histórica y discrepancias
- Requirement: Legibilidad del árbol con sangría visual acumulada acotada
- chat-render.test.ts
- Requirement: El foco de la aplicación cambia por interacción explícita, no automáticamente
- http.ts
- OfdmExplorer.tsx
- Proposal
- Proposal
- Proposal
- Proposal
- Publicación backend: RED de respuestas directas limitadas
- Artefacto dist: limite de comentarios
- Requirement: Accesibilidad operativa
- scripts
- focus-interactions.test.ts
- BibliometricFindings.tsx
- Contexto operativo del proyecto BlogDPC
- Proposal
- Requirement: Legibilidad del árbol con sangría visual acumulada acotada
- Design
- Coherencia documental autorizada — tarea 5.1
- Button
- Design
- Artefacto dist: limite de comentarios (index)
- Tasks
- Design
- Requirement: Jerarquía editorial y ubicación sin progreso completado
- Design
- Design
- Tasks
- Tasks
- MODIFIED Requirements
- Proposal
- Proposal
- ADDED Requirements
- Requirements
- Design
- Tasks
- Tasks
- Tasks
- Requirement: Bloqueo de envío durante streaming
- Requirement: Bloqueo de envío durante streaming
- Requirement: Intentos fallidos temporales y reintento explícito
- Requirement: Intentos fallidos temporales y reintento explícito
- web/tests/helpers/editorial-inventory.js
- Requirement: Accesibilidad y diseño adaptable
- Requirement: Acceso autenticado sin restricciones del foro
- Requirement: Contrato de entrada estricto
- Requirement: Cuota deslizante por usuario
- Requirement: Historial no aislado por cuenta
- Requirement: Presupuesto de entrada y rollover transaccional
- Tasks
- Requirement: Accesibilidad y diseño adaptable
- Requirement: Acceso autenticado sin restricciones del foro
- Requirement: Contrato de entrada estricto
- Requirement: Cuota deslizante por usuario
- Requirement: Historial no aislado por cuenta
- Requirement: Presupuesto de entrada y rollover transaccional
- Spec Delta
- Requirement: Configuración server-only
- Requirement: Contexto en memoria separado por identidad real
- Requirement: Controlador global persistente
- Requirement: Desconexión y cierre ordenado
- Requirement: Exclusión por conversación
- Requirement: Expiración de contexto
- Requirement: Persistencia de pares completos por pestaña
- drizzle-kit
- Requirement: Pool secuencial de modelos
- Requirement: Privacidad y observabilidad
- Requirement: Protocolo SSE de salida
- Requirement: Recuperación de almacenamiento degradado
- Requirement: Render seguro de Markdown y matemáticas
- Requirement: Renovación compartida sin replay
- Requirement: Terminación explícita y orden de confirmación
- Requirement: Contexto en memoria separado por identidad real
- Requirement: Deadline hasta el primer contenido
- Requirement: Desconexión y cierre ordenado
- Requirement: Exclusión por conversación
- Requirement: Expiración de contexto
- Requirement: Fallback solo antes de contenido
- Requirement: Persistencia de pares completos por pestaña
- Requirement: Pool secuencial de modelos
- Requirement: Privacidad y observabilidad
- Requirement: Protocolo SSE de salida
- Requirement: Recuperación de almacenamiento degradado
- Requirement: Render seguro de Markdown y matemáticas
- Requirement: Renovación compartida sin replay
- Requirement: Terminación explícita y orden de confirmación

## God Nodes (most connected - your core abstractions)
1. `react` - 48 edges
2. `Button()` - 44 edges
3. `AppError` - 38 edges
4. `api()` - 34 edges
5. `StatusNotice()` - 27 edges
6. `Design` - 27 edges
7. `ADDED Requirements` - 26 edges
8. `Requirements` - 26 edges
9. `useSession()` - 22 edges
10. `react-router-dom` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Desarrollo local` --references--> `loadConfig()`  [INFERRED]
  AGENTS.md → apps/server/src/config.ts
- `Configuración` --references--> `loadConfig()`  [INFERRED]
  openspec/CHATBOT_SPEC.md → apps/server/src/config.ts
- `Arquitectura (lo no obvio por nombres)` --references--> `AppError`  [INFERRED]
  AGENTS.md → apps/server/src/http/errors.ts
- `2. Validación y conteo bajo el lock existente de la raíz` --references--> `AppError`  [INFERRED]
  openspec/changes/archive/2026-10-08-foro-respuestas-directas-limitadas/design.md → apps/server/src/http/errors.ts
- `Errores y recuperación` --references--> `parseWith()`  [INFERRED]
  openspec/CHATBOT_SPEC.md → apps/server/src/http/errors.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Navegación global: siete módulos, raíz y enlaces legales** — openspec_specs_modulos_editoriales_navegacion_secuencial_de_los_siete_modulos, openspec_specs_paginas_legales_enlaces_legales_en_la_navegacion_global, openspec_specs_modulos_editoriales_la_raiz_redirige_al_primer_modulo [EXTRACTED 1.00]
- **Renovación y contención de la sesión del navegador** — openspec_specs_autenticacion_rotacion_de_refresh_con_revocacion_de_familia, openspec_specs_sesion_web_renovacion_unica_ante_401, openspec_specs_autenticacion_cookies_seguras_y_origen_verificado [INFERRED 0.75]
- **Flujo de moderación y estado de usuarios del foro** — openspec_specs_foro_retroalimentacion_suspension_preserva_la_lectura, openspec_specs_moderacion_administracion_gestion_de_usuarios, openspec_specs_moderacion_administracion_acceso_restringido_por_rol [INFERRED 0.85]

## Communities (159 total, 13 thin omitted)

### Community 0 - "ForumPage.tsx"
Cohesion: 0.20
Nodes (20): Textarea(), CommentComposer(), publish(), appendForumPage(), appendThreadReply(), cache, ForumCache, invalidateForumCache() (+12 more)

### Community 2 - "Requirement: Interfaz de respuesta coherente con el cupo"
Cohesion: 0.08
Nodes (25): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Anidamiento máximo de seis niveles, Requirement: Cupo atómico de seis respuestas directas por raíz, Requirement: Integridad del historial, Requirement: Interfaz de respuesta coherente con el cupo, Requirement: Nuevas respuestas solo a comentarios raíz (+17 more)

### Community 3 - "ADDED Requirements"
Cohesion: 0.08
Nodes (23): ADDED Requirements, Purpose, Requirement: Adaptación sin desbordamiento global, Requirement: Flujos auxiliares y estados existentes sin ampliación funcional, Requirement: Lenguaje visual editorial compartido, Requirement: Movimiento reactivo rápido y no decorativo, Requirement: Movimiento reducido también en la cámara, Requirement: Shell compacto con navegación y cuenta diferenciadas (+15 more)

### Community 4 - "auth/module.ts"
Cohesion: 0.08
Nodes (43): ChatAuthSurface, deferred(), fakeConfig(), FakeDatabase, fakeMailer(), QueryEvidence, requireChatAuth(), signedToken() (+35 more)

### Community 5 - "Design"
Cohesion: 0.05
Nodes (41): Acceptance and verification, Actividad y TTL, Appendix A — Literal system prompt, Archivos nuevos propuestos, Arquitectura general, Client state machine, Configuración, Context and compatibility (+33 more)

### Community 6 - "ADDED Requirements"
Cohesion: 0.09
Nodes (22): ADDED Requirements, Requirement: Composición de lectura y recursos técnicos, Requirement: Conservación integral del contenido editorial actual, Requirement: Explorador OFDM con parámetros y resultados diferenciados, Requirement: Figuras científicas íntegras y atribuidas, Requirement: Jerarquía editorial y ubicación sin progreso completado, Requirement: Mapa bibliométrico legible sin cambiar su representación científica, Scenario: Comparación con la versión anterior al rediseño (+14 more)

### Community 7 - "AlphaTradeoffExplorer.tsx"
Cohesion: 0.11
Nodes (29): AlphaResponseChart(), AlphaTradeoffExplorer(), chart, number(), panels, percent(), ForumInvitation(), AlphaTradeoffExplorer (+21 more)

### Community 8 - "src/index.ts"
Cohesion: 0.05
Nodes (38): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why, 1. Contratos compartidos (+30 more)

### Community 9 - "provider.test.ts"
Cohesion: 0.05
Nodes (46): assertPoolRequests(), assertSequentialCleanup(), AttemptInput, Body, content(), done(), drainUntil(), encoder (+38 more)

### Community 10 - "Configuracion shadcn"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "TypeScript: aplicacion web"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 12 - "chat-session.test.ts"
Cohesion: 0.11
Nodes (10): CanSubmit, ChatSendGuard, ChatSession, CompletedChatMessage, CreateChatSession, SessionExports, SessionHelperExports, sessionModuleUrl (+2 more)

### Community 13 - "Paquete de contratos"
Cohesion: 0.10
Nodes (20): import, types, dependencies, zod, devDependencies, typescript, exports, ./constants (+12 more)

### Community 14 - "server/package.json"
Cohesion: 0.12
Nodes (16): @blogdpc/contracts, @types/node, typescript, zod, main, name, private, type (+8 more)

### Community 15 - "web/package.json"
Cohesion: 0.09
Nodes (22): @blogdpc/contracts, @types/node, typescript, name, private, type, version, @fontsource-variable/inter (+14 more)

### Community 16 - "app.ts"
Cohesion: 0.11
Nodes (42): AdminModule, createAdminRouter(), uuidSchema, createApp(), AuthModule, authenticateAccessToken(), createAuthRouter(), createChatRouter() (+34 more)

### Community 17 - "TypeScript: build de Vite"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 18 - "Scripts del servidor"
Cohesion: 0.14
Nodes (14): scripts, admin:create, build, check, db:cleanup, db:generate, db:migrate, db:provision-role (+6 more)

### Community 19 - "module.test.ts"
Cohesion: 0.11
Nodes (14): assertClosedCommitCannotMutate(), ChatModule, CreateChatModule, fixture(), historyAtInputSize(), IntervalObservation, Message, observeIntervals() (+6 more)

### Community 20 - "CommentItem.tsx"
Cohesion: 0.21
Nodes (11): Avatar(), AvatarFallback(), formatDateTime(), CommentItem, CommentItemProps, initials(), canReplyToRoot(), DOCUMENTS (+3 more)

### Community 21 - "Spec: despliegue y sesion web"
Cohesion: 0.18
Nodes (12): Migraciones versionadas y cadenas PostgreSQL, Cookies seguras y origen verificado, Rotación de refresh con revocación de familia, Despliegue, Ciclo de vida del proceso, Política de caché, Un solo origen, Orden y paginación por cursor (+4 more)

### Community 22 - "Spec: foro y moderacion"
Cohesion: 0.20
Nodes (12): Rol ADMIN por comando interno, Anidamiento máximo de seis niveles, Foro de retroalimentación, Cooldown transaccional, Integridad del historial, Suspensión preserva la lectura, Texto plano acotado, Acceso restringido por rol (+4 more)

### Community 23 - "Spec: modulos y paginas legales"
Cohesion: 0.20
Nodes (12): Módulos editoriales, Contenido reservado hasta aprobación, El mini-caso evalúa el trade-off OFDM-DFRC, La raíz redirige al primer módulo, Navegación secuencial de los siete módulos, Páginas legales, Enlaces legales en la navegación global, Rutas legales públicas (+4 more)

### Community 24 - "verify.ts"
Cohesion: 0.06
Nodes (34): config, Fixture, startApp(), client, databaseUrl, isLocal, createDatabase(), client (+26 more)

### Community 25 - "Spec: autenticacion y acceso a datos"
Cohesion: 0.20
Nodes (11): Acceso a datos, Esquema privado aislado, Puerta única de acceso, Rol de aplicación con privilegios mínimos, Autorización reconsultando la base de datos, Autenticación, Google OIDC sin fusión de cuentas, Registro con verificación de correo (+3 more)

### Community 26 - "TypeScript: configuracion base"
Cohesion: 0.18
Nodes (10): compilerOptions, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, noUncheckedIndexedAccess, skipLibCheck (+2 more)

### Community 27 - "Requirement: Contenido editorial y recursos implementados en los siete módulos"
Cohesion: 0.09
Nodes (21): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Contenido editorial y recursos implementados en los siete módulos, Requirement: Contenido reservado hasta aprobación, Requirement: El mini-caso evalúa el trade-off OFDM-DFRC, Requirement: Navegación secuencial de los siete módulos, Scenario: El estado del arte enlaza aplicaciones y fundamentos técnicos (+13 more)

### Community 28 - "TypeScript: servidor"
Cohesion: 0.22
Nodes (8): compilerOptions, declaration, outDir, rootDir, sourceMap, extends, include, ../../tsconfig.base.json

### Community 29 - "Iconos SVG compartidos"
Cohesion: 0.39
Nodes (8): Favicon Wave Mark (purple zigzag bolt with blurred lavender wave streaks), Bluesky Icon (butterfly social logo, dark fill), Discord Icon (community platform logo, dark fill), Documentation Icon (document glyph with code chevrons, purple stroke), GitHub Icon (Octocat-in-circle logo, dark fill), Social Icon (person with star glyph, purple stroke), Shared SVG Icon Sprite (external-use symbol set for BlogDPC web app), X Icon (X/Twitter social logo, dark fill)

### Community 30 - "TypeScript: contratos"
Cohesion: 0.25
Nodes (7): compilerOptions, declaration, outDir, rootDir, extends, include, ../../tsconfig.base.json

### Community 31 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, drizzle-kit, tsx, @types/express, @types/node, @types/nodemailer, typescript

### Community 32 - "ModuleLayout.tsx"
Cohesion: 0.19
Nodes (16): ModuleLayout(), ModuleProgress(), PreviousNext(), useIsDesktop(), FORUM_PATH, moduleByPath(), ModuleInfo, MODULES (+8 more)

### Community 33 - "README y shell HTML"
Cohesion: 0.33
Nodes (6): Módulo de entrada /src/main.tsx, index.html — shell de la aplicación BlogDPC · ISAC, Paquetes del workspace (apps/*, packages/*), BlogDPC — Sensing & Communications (ISAC), Reto ABET SO7 — Comunicaciones II (27145), UIS, Stack: React, Express y PostgreSQL sobre Supabase

### Community 34 - "Configuracion de Oxlint"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 35 - "TypeScript: referencias web"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 36 - "Spec: presentacion frontend"
Cohesion: 0.08
Nodes (23): Presentación frontend Specification, Purpose, Requirement: Adaptación sin desbordamiento global, Requirement: Flujos auxiliares y estados existentes sin ampliación funcional, Requirement: Lenguaje visual editorial compartido, Requirement: Movimiento reactivo rápido y no decorativo, Requirement: Movimiento reducido también en la cámara, Requirement: Shell compacto con navegación y cuenta diferenciadas (+15 more)

### Community 37 - "README de la app web"
Cohesion: 0.67
Nodes (3): Configuración de Oxlint, Plantilla React + TypeScript + Vite, React Compiler

### Community 38 - "moduleContent.tsx"
Cohesion: 0.20
Nodes (8): Glossary, LazyGlossary(), ODDMDiagram(), ReferenceFigure(), ReferenceFigureProps, SignalDiagram(), EditorialModule, ISAC_VIDEO_RESOURCES

### Community 39 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, @blogdpc/contracts, class-variance-authority, cn, @fontsource-variable/inter, graphology, katex, lucide-react (+14 more)

### Community 44 - "config.ts"
Cohesion: 0.08
Nodes (18): booleanFromEnv, envSchema, loadConfig(), client, databaseUrl, input, isLocal, createMailer() (+10 more)

### Community 45 - "BlogDPC"
Cohesion: 0.22
Nodes (8): Arquitectura (lo no obvio por nombres), BlogDPC, Contenido, Desarrollo local, graphify, Specs: fuentes de verdad, Tests individuales, Verificación (todo verificado localmente; no hay CI — no existe `.github/`)

### Community 46 - "Decisions"
Cohesion: 0.11
Nodes (18): 1. Una sola capa de tokens y primitivas, 2. Shell compacto y editorial con dos anchos, 3. Figuras y bloques técnicos: presentación antes que nuevos activos, 4. Bibliometría y OFDM: separar organización de cálculo, 5. Foro: limitar la sangría del árbol completo, no por componente, 6. Auxiliares y matriz cerrada de estados observados, 7. Movimiento: dos tokens, CSS primero y puente nativo al canvas, 8. Contratos y oráculos de referencia, sin reejecución amplia retirada (+10 more)

### Community 47 - "Glossary.tsx"
Cohesion: 0.29
Nodes (6): Formula(), Glossary(), normalize(), terms, FORMULAS, katex

### Community 48 - "BibliometricMap.tsx"
Cohesion: 0.14
Nodes (16): BibliometricMap(), COLORS, edgeSize(), MapTerm, number(), rgb(), VOSItem, VOSLink (+8 more)

### Community 49 - "AppShell.tsx"
Cohesion: 0.23
Nodes (17): Header(), DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), Separator() (+9 more)

### Community 50 - "freeze-science.ts"
Cohesion: 0.21
Nodes (12): networkFingerprint(), sha256(), sortedMap(), assets, baseline, corners, dataset, fixture (+4 more)

### Community 51 - "useChatSession.ts"
Cohesion: 0.14
Nodes (14): canSubmit(), CompletedChatMessage, createChatSendGuard(), createChatSession(), Envelope, validEnvelope(), consumeChatStream(), ChatTimelineEntry (+6 more)

### Community 52 - "Configuracion de Railpack"
Cohesion: 0.50
Nodes (3): deploy, startCommand, $schema

### Community 53 - "forum/module.ts"
Cohesion: 0.09
Nodes (27): createAdminModule(), ensureAdmin(), parentAuthors, parentComments, Database, comments, CommentRow, createForumModule() (+19 more)

### Community 54 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, @blogdpc/contracts, cookie, drizzle-orm, express, express-rate-limit, helmet, jose (+4 more)

### Community 55 - "routes.test.ts"
Cohesion: 0.05
Nodes (25): ChatMessage, ChatModule, ChatSession, createChatModule(), beginTurn(), SYSTEM_PROMPT, AttemptInput, OnChunk (+17 more)

### Community 56 - "ChatMessage.tsx"
Cohesion: 0.18
Nodes (8): ChatMessage(), components, MessageProps, MessageRenderer, RenderState, react-markdown, rehype-katex, remark-math

### Community 57 - "ChatWidget"
Cohesion: 0.16
Nodes (16): shouldSendOnEnter(), AppShell(), Footer(), OfflineBanner(), ChatWidget(), closePanel(), handleComposerKeyDown(), handlePanelKeyDown() (+8 more)

### Community 58 - "App.tsx"
Cohesion: 0.17
Nodes (21): AdminCommentsPage, AdminFallback(), AdminUsersPage, App(), Skeleton(), apps_web_src_index, RequireAdmin(), State (+13 more)

### Community 59 - "ADDED Requirements"
Cohesion: 0.18
Nodes (10): ADDED Requirements, MODIFIED Requirements, Requirement: Contenido de privacidad aprobado, Requirement: Contenido de términos aprobado, Requirement: Rutas legales públicas, Scenario: Acceso directo, Scenario: Consulta de retención, Scenario: Consulta sobre comentarios (+2 more)

### Community 60 - "Oraculos de recursos"
Cohesion: 0.33
Nodes (8): ofdmDisplayDifferences(), pairKey(), rendererDifferences(), clusterProjection(), clusterTieFixture(), edge(), item(), sizeFor()

### Community 61 - "react"
Cohesion: 0.19
Nodes (22): FieldError(), StatusNotice(), Input(), Label(), api(), ApiError, moderate(), AdminUser (+14 more)

### Community 62 - "StatusNotice.tsx"
Cohesion: 0.29
Nodes (9): EditorialNote(), ICONS, Tone, TONE_CLASS, Alert(), AlertDescription(), AlertTitle(), alertVariants (+1 more)

### Community 64 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+2 more)

### Community 65 - "Requirement: Actualización de comentarios en vistas activas mediante SSE"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Actualización de comentarios en vistas activas mediante SSE, Scenario: Acceso público y publicación autenticada sin cambios, Scenario: Alcance y cierre de la conexión, Scenario: Hilo activo filtra por su raíz, Scenario: Lista activa se actualiza ante una creación, Scenario: Publicación confirmada emite un aviso mínimo, Scenario: Reconexión recupera cambios sin replay (+1 more)

### Community 66 - "Scripts de la raiz"
Cohesion: 0.20
Nodes (9): name, packageManager, private, scripts, build, check, dev, lint (+1 more)

### Community 67 - "Design"
Cohesion: 0.20
Nodes (9): 1. Límites compartidos de escritura, DTO sin cambios, 2. Validación y conteo bajo el lock existente de la raíz, 3. Una elegibilidad en listado e hilo, manteniendo lectura recursiva, Context, Decisions, Design, Goals / Non-Goals, Migration Plan (+1 more)

### Community 68 - "4.2 Conservación histórica y discrepancias"
Cohesion: 0.20
Nodes (9): 4.1 Resultados, 4.2 Conservación histórica y discrepancias, Alcance respetado, Ciclos TDD registrados, Conservación histórica verificada, Discrepancias con textos que aún describen la política anterior (documentadas, NO modificadas por instrucción del design), Evidencia de verificación integrada (tasks 4.1 y 4.2), F 3.3 — revalidación de hilo (2026-10-09) (+1 more)

### Community 70 - "Requirement: Legibilidad del árbol con sangría visual acumulada acotada"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Requirement: Composer claro blanco y azul sin cambios funcionales, Requirement: Legibilidad del árbol con sangría visual acumulada acotada, Scenario: Comentario y respuesta con la misma dirección clara, Scenario: Conversación completa de seis niveles en móvil, Scenario: Error y cancelación conservados bajo ambos modos de movimiento, Scenario: Listado y vista enfocada conservados, Scenario: Nivel máximo y comentario retirado (+1 more)

### Community 72 - "chat-render.test.ts"
Cohesion: 0.15
Nodes (6): APP_SHELL_SOURCE, CHAT_MESSAGE_SOURCE, CHAT_WIDGET_SOURCE, INTERNAL_CHAT_ROUTES, katexEdges, ref_node_module

### Community 73 - "Requirement: El foco de la aplicación cambia por interacción explícita, no automáticamente"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Requirement: El foco de la aplicación cambia por interacción explícita, no automáticamente, Scenario: Entrada a una página editorial, Scenario: Error en autenticación o apertura de respuesta, Scenario: Gestión de foco de primitivos Radix, Scenario: Indicador de foco visible, Scenario: Publicación de un comentario, Spec Delta

### Community 74 - "http.ts"
Cohesion: 0.14
Nodes (8): ApiOptions, ApiResult, onSessionInvalid(), refreshSession(), SessionInvalidListener, sessionInvalidListeners, SSE_HEADERS, start()

### Community 75 - "OfdmExplorer.tsx"
Cohesion: 0.46
Nodes (5): controls, number(), OfdmExplorer(), OFDM_DEFAULTS, ofdmMetrics()

### Community 76 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 77 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 78 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 79 - "Proposal"
Cohesion: 0.25
Nodes (7): Capabilities, Impact, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 80 - "Publicación backend: RED de respuestas directas limitadas"
Cohesion: 0.25
Nodes (7): Archivos y handoff, Ejecución real, GREEN heredado, PostgreSQL guardado: NO ejecutado, Publicación backend: RED de respuestas directas limitadas, Qué demuestra el doble, y qué no, RED esperado del módulo actual

### Community 82 - "Requirement: Accesibilidad operativa"
Cohesion: 0.25
Nodes (7): MODIFIED Requirements, Requirement: Accesibilidad operativa, Scenario: Contraste y acciones sin hover, Scenario: Menú y diálogo con foco restaurado, Scenario: Navegación por teclado, Scenario: Reflow accesible en la matriz responsive, Spec Delta

### Community 83 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, check, dev, lint, preview, test

### Community 84 - "focus-interactions.test.ts"
Cohesion: 0.07
Nodes (17): alert, commentItem, composer, forumPage, loginPage, registerPage, statusNotice, commentItem (+9 more)

### Community 85 - "BibliometricFindings.tsx"
Cohesion: 0.21
Nodes (11): BibliometricFindings(), CLUSTER_READINGS, decimal(), LinkWeight, METHOD_REFERENCES, NetworkData, number(), PAIR_LABELS (+3 more)

### Community 86 - "Contexto operativo del proyecto BlogDPC"
Cohesion: 0.20
Nodes (9): 10. Fuera de alcance actual, 11. Regla de trabajo para agentes, 1. Estado y alcance actual, 2. Fuentes de contenido y planes, 4. Decisiones editoriales vigentes, 6. Base de datos y límites implementados, 7. Autenticación y autorización, 9. Red y degradación (+1 more)

### Community 87 - "Proposal"
Cohesion: 0.29
Nodes (6): Capabilities, Modified Capabilities, New Capabilities, Proposal, What Changes, Why

### Community 88 - "Requirement: Legibilidad del árbol con sangría visual acumulada acotada"
Cohesion: 0.29
Nodes (6): MODIFIED Requirements, Requirement: Legibilidad del árbol con sangría visual acumulada acotada, Scenario: Conversación completa de seis niveles en móvil, Scenario: Listado y vista enfocada conservados, Scenario: Nivel máximo y comentario retirado, Spec Delta

### Community 89 - "Design"
Cohesion: 0.29
Nodes (6): Context, Decisions, Design, Goals / Non-Goals, Migration Plan, Risks / Trade-offs

### Community 90 - "Coherencia documental autorizada — tarea 5.1"
Cohesion: 0.29
Nodes (6): Autorización y alcance, Coherencia documental autorizada — tarea 5.1, Copy y contexto, Límites y estado, Specs sincronizadas, Verificación ejecutada

### Community 91 - "Button"
Cohesion: 0.18
Nodes (19): RouteErrorBoundary(), Badge(), badgeVariants, Button(), buttonVariants, Dialog(), DialogContent(), DialogDescription() (+11 more)

### Community 92 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 94 - "Tasks"
Cohesion: 0.33
Nodes (5): 1. OpenSpec, 2. Modelo y pruebas, 3. Explorador, 4. Verificación y entrega, Tasks

### Community 95 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 96 - "Requirement: Jerarquía editorial y ubicación sin progreso completado"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, Requirement: Jerarquía editorial y ubicación sin progreso completado, Scenario: Entrada directa a un módulo intermedio, Scenario: Índice y anclas en ambos layouts, Spec Delta

### Community 97 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 98 - "Design"
Cohesion: 0.33
Nodes (5): Context, Decisions, Design, Goals / Non-Goals, Risks / Trade-offs

### Community 99 - "Tasks"
Cohesion: 0.40
Nodes (4): 1. Navegación editorial y anclas del foro, 2. Errores y composers sin foco automático, 3. Regresión de accesibilidad, Tasks

### Community 100 - "Tasks"
Cohesion: 0.40
Nodes (4): 1. Transporte SSE y emisión post-commit, 2. Suscripciones del listado e hilo, 3. Verificación de operación live, Tasks

### Community 101 - "MODIFIED Requirements"
Cohesion: 0.40
Nodes (4): MODIFIED Requirements, Requirement: Contenido de términos aprobado, Scenario: Consulta sobre comentarios, Spec Delta

### Community 102 - "Proposal"
Cohesion: 0.20
Nodes (9): Capabilities, Diagnóstico pendiente: streaming real, Impact, Modified Capabilities, New Capabilities, Non-goals (literales del usuario), Proposal, What Changes (+1 more)

### Community 103 - "Proposal"
Cohesion: 0.22
Nodes (8): Capabilities, Impact, Modified Capabilities, New Capabilities, Non-goals, Proposal, What Changes, Why

### Community 104 - "ADDED Requirements"
Cohesion: 0.29
Nodes (7): ADDED Requirements, Requirement: Deadline hasta el primer contenido, Requirement: Fallback solo antes de contenido, Scenario: Agotamiento del pool, Scenario: Fallo después del primer fragmento, Scenario: Metadatos no detienen el timer, Scenario: Primer contenido válido

### Community 105 - "Requirements"
Cohesion: 0.29
Nodes (6): chatbot-tecnico Specification, Purpose, Requirement: Configuración server-only, Requirements, Scenario: Configuración incompleta, Scenario: Sin exposición al navegador

### Community 106 - "Design"
Cohesion: 0.33
Nodes (5): Context, Design, Goals / Non-Goals, Migration Plan, Risks / Trade-offs

### Community 107 - "Tasks"
Cohesion: 0.50
Nodes (3): 1. Publicación del contenido, 2. Verificación integrada, Tasks

### Community 108 - "Tasks"
Cohesion: 0.50
Nodes (3): 1. Verificación de la base y el alcance, 2. Validación y sincronización OpenSpec, Tasks

### Community 109 - "Tasks"
Cohesion: 0.15
Nodes (12): scrollHorizontallyWithArrowKeys(), 1. Baseline de conservación, estados y entorno, 2. Tokens, shell y piloto editorial, 3. Figuras, bloques científicos y recursos exploratorios, 4. Propagación a los siete módulos y glosario, 5. Foro y flujos auxiliares, 6. Movimiento rápido y preferencia reducida completa, 7. Responsive, teclado, contraste y estados (+4 more)

### Community 110 - "Requirement: Bloqueo de envío durante streaming"
Cohesion: 0.33
Nodes (6): Requirement: Bloqueo de envío durante streaming, Scenario: Desplazamiento automático al enviar y estabilidad en streaming, Scenario: Doble activación antes del rerender, Scenario: Enter durante composición IME, Scenario: Enter envía y Shift+Enter inserta una línea, Scenario: Sesión no apta

### Community 111 - "Requirement: Bloqueo de envío durante streaming"
Cohesion: 0.33
Nodes (6): Requirement: Bloqueo de envío durante streaming, Scenario: Desplazamiento automático al enviar y estabilidad en streaming, Scenario: Doble activación antes del rerender, Scenario: Enter durante composición IME, Scenario: Enter envía y Shift+Enter inserta una línea, Scenario: Sesión no apta

### Community 112 - "Requirement: Intentos fallidos temporales y reintento explícito"
Cohesion: 0.40
Nodes (5): Requirement: Intentos fallidos temporales y reintento explícito, Scenario: Borrador vaciado y fallo visible sin restauración, Scenario: Orden cronológico tras reintento exitoso, Scenario: Reintento completado y recarga, Scenario: Reintento manual conserva intentos separados

### Community 113 - "Requirement: Intentos fallidos temporales y reintento explícito"
Cohesion: 0.40
Nodes (5): Requirement: Intentos fallidos temporales y reintento explícito, Scenario: Borrador vaciado y fallo visible sin restauración, Scenario: Orden cronológico tras reintento exitoso, Scenario: Reintento completado y recarga, Scenario: Reintento manual conserva intentos separados

### Community 114 - "web/tests/helpers/editorial-inventory.js"
Cohesion: 0.67
Nodes (3): captureEditorial(), conservationDifferences(), normalizeText()

### Community 115 - "Requirement: Accesibilidad y diseño adaptable"
Cohesion: 0.50
Nodes (4): Requirement: Accesibilidad y diseño adaptable, Scenario: Label accesible sin duplicación visual ni ayuda de atajos, Scenario: Operación por teclado, Scenario: Viewports y movimiento reducido

### Community 116 - "Requirement: Acceso autenticado sin restricciones del foro"
Cohesion: 0.50
Nodes (4): Requirement: Acceso autenticado sin restricciones del foro, Scenario: Credenciales inválidas o usuario inexistente, Scenario: Transacción liberada antes del proveedor, Scenario: Usuario sin permiso de publicar en el foro

### Community 117 - "Requirement: Contrato de entrada estricto"
Cohesion: 0.50
Nodes (4): Requirement: Contrato de entrada estricto, Scenario: Campos no admitidos, Scenario: Límite de longitud exacto, Scenario: Origen inválido

### Community 118 - "Requirement: Cuota deslizante por usuario"
Cohesion: 0.50
Nodes (4): Requirement: Cuota deslizante por usuario, Scenario: Fallos posteriores consumen cuota, Scenario: Frontera de ventana sin dobles admisiones, Scenario: Recuperación progresiva

### Community 119 - "Requirement: Historial no aislado por cuenta"
Cohesion: 0.50
Nodes (4): Requirement: Historial no aislado por cuenta, Scenario: Ausencia de aviso persistente de multicuenta, Scenario: Cambio de cuenta en la misma pestaña, Scenario: Pestaña clonada

### Community 120 - "Requirement: Presupuesto de entrada y rollover transaccional"
Cohesion: 0.50
Nodes (4): Requirement: Presupuesto de entrada y rollover transaccional, Scenario: Candidato aún excedido, Scenario: Fallo con rollover preparado, Scenario: Frontera del presupuesto

### Community 121 - "Tasks"
Cohesion: 0.50
Nodes (3): 2. Orquestador LLM y Streaming SSE, 5. Componente UI e Integración en Layout, Tasks

### Community 122 - "Requirement: Accesibilidad y diseño adaptable"
Cohesion: 0.50
Nodes (4): Requirement: Accesibilidad y diseño adaptable, Scenario: Label accesible sin duplicación visual ni ayuda de atajos, Scenario: Operación por teclado, Scenario: Viewports y movimiento reducido

### Community 123 - "Requirement: Acceso autenticado sin restricciones del foro"
Cohesion: 0.50
Nodes (4): Requirement: Acceso autenticado sin restricciones del foro, Scenario: Credenciales inválidas o usuario inexistente, Scenario: Transacción liberada antes del proveedor, Scenario: Usuario sin permiso de publicar en el foro

### Community 124 - "Requirement: Contrato de entrada estricto"
Cohesion: 0.50
Nodes (4): Requirement: Contrato de entrada estricto, Scenario: Campos no admitidos, Scenario: Límite de longitud exacto, Scenario: Origen inválido

### Community 125 - "Requirement: Cuota deslizante por usuario"
Cohesion: 0.50
Nodes (4): Requirement: Cuota deslizante por usuario, Scenario: Fallos posteriores consumen cuota, Scenario: Frontera de ventana sin dobles admisiones, Scenario: Recuperación progresiva

### Community 126 - "Requirement: Historial no aislado por cuenta"
Cohesion: 0.50
Nodes (4): Requirement: Historial no aislado por cuenta, Scenario: Ausencia de aviso persistente de multicuenta, Scenario: Cambio de cuenta en la misma pestaña, Scenario: Pestaña clonada

### Community 127 - "Requirement: Presupuesto de entrada y rollover transaccional"
Cohesion: 0.50
Nodes (4): Requirement: Presupuesto de entrada y rollover transaccional, Scenario: Candidato aún excedido, Scenario: Fallo con rollover preparado, Scenario: Frontera del presupuesto

### Community 130 - "Requirement: Configuración server-only"
Cohesion: 0.67
Nodes (3): Requirement: Configuración server-only, Scenario: Configuración incompleta, Scenario: Sin exposición al navegador

### Community 131 - "Requirement: Contexto en memoria separado por identidad real"
Cohesion: 0.67
Nodes (3): Requirement: Contexto en memoria separado por identidad real, Scenario: Contexto inexistente, Scenario: Usuarios distintos con el mismo UUID

### Community 132 - "Requirement: Controlador global persistente"
Cohesion: 0.67
Nodes (3): Requirement: Controlador global persistente, Scenario: Cierre y reapertura del panel, Scenario: Navegación durante streaming

### Community 133 - "Requirement: Desconexión y cierre ordenado"
Cohesion: 0.67
Nodes (3): Requirement: Desconexión y cierre ordenado, Scenario: Cierre del proceso, Scenario: Cliente desconectado

### Community 134 - "Requirement: Exclusión por conversación"
Cohesion: 0.67
Nodes (3): Requirement: Exclusión por conversación, Scenario: Otra clave progresa, Scenario: Solicitud concurrente para la misma clave

### Community 135 - "Requirement: Expiración de contexto"
Cohesion: 0.67
Nodes (3): Requirement: Expiración de contexto, Scenario: Actividad que no cuenta, Scenario: Frontera de TTL

### Community 136 - "Requirement: Persistencia de pares completos por pestaña"
Cohesion: 0.67
Nodes (3): Requirement: Persistencia de pares completos por pestaña, Scenario: Recarga durante generación, Scenario: Recarga tras éxito

### Community 138 - "Requirement: Pool secuencial de modelos"
Cohesion: 0.67
Nodes (3): Requirement: Pool secuencial de modelos, Scenario: Construcción de cada intento, Scenario: Fallback secuencial

### Community 139 - "Requirement: Privacidad y observabilidad"
Cohesion: 0.67
Nodes (3): Requirement: Privacidad y observabilidad, Scenario: Inspección de acceso a datos, Scenario: Logs sin contenido sensible

### Community 140 - "Requirement: Protocolo SSE de salida"
Cohesion: 0.67
Nodes (3): Requirement: Protocolo SSE de salida, Scenario: Error antes del primer fragmento, Scenario: Error con stream iniciado

### Community 141 - "Requirement: Recuperación de almacenamiento degradado"
Cohesion: 0.67
Nodes (3): Requirement: Recuperación de almacenamiento degradado, Scenario: Envelope corrupto, Scenario: Storage no disponible

### Community 142 - "Requirement: Render seguro de Markdown y matemáticas"
Cohesion: 0.67
Nodes (3): Requirement: Render seguro de Markdown y matemáticas, Scenario: Contenido hostil, Scenario: LaTeX parcial durante streaming

### Community 143 - "Requirement: Renovación compartida sin replay"
Cohesion: 0.67
Nodes (3): Requirement: Renovación compartida sin replay, Scenario: 401 concurrente con otra llamada, Scenario: Stream interrumpido

### Community 144 - "Requirement: Terminación explícita y orden de confirmación"
Cohesion: 0.67
Nodes (3): Requirement: Terminación explícita y orden de confirmación, Scenario: Commit previo al terminal downstream, Scenario: EOF sin terminal

### Community 145 - "Requirement: Contexto en memoria separado por identidad real"
Cohesion: 0.67
Nodes (3): Requirement: Contexto en memoria separado por identidad real, Scenario: Contexto inexistente, Scenario: Usuarios distintos con el mismo UUID

### Community 146 - "Requirement: Deadline hasta el primer contenido"
Cohesion: 0.67
Nodes (3): Requirement: Deadline hasta el primer contenido, Scenario: Metadatos no detienen el timer, Scenario: Primer contenido válido

### Community 147 - "Requirement: Desconexión y cierre ordenado"
Cohesion: 0.67
Nodes (3): Requirement: Desconexión y cierre ordenado, Scenario: Cierre del proceso, Scenario: Cliente desconectado

### Community 148 - "Requirement: Exclusión por conversación"
Cohesion: 0.67
Nodes (3): Requirement: Exclusión por conversación, Scenario: Otra clave progresa, Scenario: Solicitud concurrente para la misma clave

### Community 149 - "Requirement: Expiración de contexto"
Cohesion: 0.67
Nodes (3): Requirement: Expiración de contexto, Scenario: Actividad que no cuenta, Scenario: Frontera de TTL

### Community 150 - "Requirement: Fallback solo antes de contenido"
Cohesion: 0.67
Nodes (3): Requirement: Fallback solo antes de contenido, Scenario: Agotamiento del pool, Scenario: Fallo después del primer fragmento

### Community 151 - "Requirement: Persistencia de pares completos por pestaña"
Cohesion: 0.67
Nodes (3): Requirement: Persistencia de pares completos por pestaña, Scenario: Recarga durante generación, Scenario: Recarga tras éxito

### Community 152 - "Requirement: Pool secuencial de modelos"
Cohesion: 0.67
Nodes (3): Requirement: Pool secuencial de modelos, Scenario: Construcción de cada intento, Scenario: Fallback secuencial

### Community 153 - "Requirement: Privacidad y observabilidad"
Cohesion: 0.67
Nodes (3): Requirement: Privacidad y observabilidad, Scenario: Inspección de acceso a datos, Scenario: Logs sin contenido sensible

### Community 154 - "Requirement: Protocolo SSE de salida"
Cohesion: 0.67
Nodes (3): Requirement: Protocolo SSE de salida, Scenario: Error antes del primer fragmento, Scenario: Error con stream iniciado

### Community 155 - "Requirement: Recuperación de almacenamiento degradado"
Cohesion: 0.67
Nodes (3): Requirement: Recuperación de almacenamiento degradado, Scenario: Envelope corrupto, Scenario: Storage no disponible

### Community 156 - "Requirement: Render seguro de Markdown y matemáticas"
Cohesion: 0.67
Nodes (3): Requirement: Render seguro de Markdown y matemáticas, Scenario: Contenido hostil, Scenario: LaTeX parcial durante streaming

### Community 157 - "Requirement: Renovación compartida sin replay"
Cohesion: 0.67
Nodes (3): Requirement: Renovación compartida sin replay, Scenario: 401 concurrente con otra llamada, Scenario: Stream interrumpido

### Community 158 - "Requirement: Terminación explícita y orden de confirmación"
Cohesion: 0.67
Nodes (3): Requirement: Terminación explícita y orden de confirmación, Scenario: Commit previo al terminal downstream, Scenario: EOF sin terminal

## Knowledge Gaps
- **818 isolated node(s):** `name`, `version`, `private`, `type`, `main` (+813 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 985 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppShell()` connect `ChatWidget` to `Requirement: Controlador global persistente`, `Proposal`, `Proposal`, `app.ts`, `AppShell.tsx`, `useChatSession.ts`, `App.tsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `ForumPage.tsx`, `AlphaTradeoffExplorer.tsx`, `web/package.json`, `CommentItem.tsx`, `ModuleLayout.tsx`, `moduleContent.tsx`, `Glossary.tsx`, `BibliometricMap.tsx`, `AppShell.tsx`, `useChatSession.ts`, `ChatMessage.tsx`, `ChatWidget`, `App.tsx`, `Oraculos de recursos`, `StatusNotice.tsx`, `chat-render.test.ts`, `OfdmExplorer.tsx`, `BibliometricFindings.tsx`, `Button`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `ADDED Requirements` connect `ADDED Requirements` to `Spec Delta`, `Requirement: Configuración server-only`, `Requirement: Contexto en memoria separado por identidad real`, `Requirement: Controlador global persistente`, `Requirement: Desconexión y cierre ordenado`, `Requirement: Exclusión por conversación`, `Requirement: Expiración de contexto`, `Requirement: Persistencia de pares completos por pestaña`, `provider.test.ts`, `Requirement: Pool secuencial de modelos`, `Requirement: Privacidad y observabilidad`, `Requirement: Protocolo SSE de salida`, `Requirement: Recuperación de almacenamiento degradado`, `Requirement: Render seguro de Markdown y matemáticas`, `Requirement: Renovación compartida sin replay`, `Requirement: Terminación explícita y orden de confirmación`, `Requirement: Bloqueo de envío durante streaming`, `Requirement: Intentos fallidos temporales y reintento explícito`, `Requirement: Accesibilidad y diseño adaptable`, `Requirement: Acceso autenticado sin restricciones del foro`, `Requirement: Contrato de entrada estricto`, `Requirement: Cuota deslizante por usuario`, `Requirement: Historial no aislado por cuenta`, `Requirement: Presupuesto de entrada y rollover transaccional`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `AppError` (e.g. with `Arquitectura (lo no obvio por nombres)` and `2. Validación y conteo bajo el lock existente de la raíz`) actually correct?**
  _`AppError` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `api()` (e.g. with `Decisions` and `4. Estado y Hook de Streaming en React`) actually correct?**
  _`api()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _818 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Requirement: Interfaz de respuesta coherente con el cupo` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._