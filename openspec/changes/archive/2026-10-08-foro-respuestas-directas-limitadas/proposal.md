# Proposal

## Why

La política anterior permitía seis niveles anidados, pero la regla aprobada exige hasta seis respuestas directas por comentario raíz y ninguna respuesta a otra respuesta. La política y su alineación documental ya están implementadas y los dos deltas fueron sincronizados; la auditoría posterior detectó que la revalidación del hilo todavía puede perder una sexta respuesta aceptada o rechazar sin captura, por lo que esta revisión reabre solo la reparación mínima del contrato ya aprobado.

## What Changes

- **BREAKING**: para nuevas publicaciones, solo se permite crear raíces de nivel 1 o responder a una raíz con nivel 2; la API rechaza cualquier padre que sea una respuesta.
- Limitar cada raíz a seis nodos de respuesta directa totales, incluidos los retirados: aceptar el sexto y rechazar el séptimo, también entre autores concurrentes, dentro de la transacción existente.
- Compartir los límites entre contracts, backend y frontend. Ofrecer Responder únicamente en raíces habilitadas para la participación y con menos de seis respuestas directas; explicar la regla y los rechazos con copy funcional mínimo.
- Preservar íntegros árbol, orden, enlaces y lectura del historial multinivel; las raíces históricas con seis o más respuestas directas no admiten nuevas respuestas.
- Completar íntegramente 3.3, nuevamente autorizada: guardias de vigencia en lecturas/callbacks y finalización, captura de rechazos y aviso accesible existente. Ninguna respuesta antigua puede sobrescribir una publicación aceptada ni actualizar otro hilo tras navegación/desmontaje; ante fallo vigente se conserva la última lectura útil y el borrador, sin rechazos no capturados ni nuevo copy. No se reduce a una guardia parcial ni introduce un nuevo flujo de publicación; su requirement y todos sus escenarios permanecen vigentes.
- Mantener autorización, cookies/sesión/refresh, caché en memoria, texto plano de 3–2000 caracteres, cooldown transaccional de 30 segundos, cursores y moderación lógica. La excepción legal original autorizó corregir solo la frase de límites del foro en los términos y ya está cerrada; conservar los documentos legales completos aprobados y la omisión de la sección de moderación. No editar contenido académico ni ampliar el alcance funcional del change visual; sus correcciones locales aprobadas se documentan en su propio planning, no en esta reparación funcional.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `foro-retroalimentacion`: sustituir el anidamiento publicable de seis niveles por respuestas solo a raíz; añadir límite atómico de seis respuestas directas, coherencia de la interfaz y compatibilidad del historial existente.
- `paginas-legales`: modificar únicamente la mención de seis niveles en `Contenido de términos aprobado` para reflejar respuestas solo a raíz, máximo seis directas y ninguna respuesta a respuestas; conservar el resto del requisito y su escenario íntegros.

## Impact

- `packages/contracts/src/{constants,index}.ts`: límites de nuevas publicaciones; se conserva `PublicComment` porque `replies` ya contiene todas las respuestas directas de cada raíz, incluidas las retiradas, tanto en listado como en hilo.
- `apps/server/src/forum/module.ts`: validación del padre y conteo bajo lock de la raíz, conservando el lock previo del autor y la transacción. `routes.ts` conserva rutas y formato HTTP; se añaden errores de dominio sin endpoints ni dependencias nuevos.
- `apps/web/src/pages/forum/{CommentItem,CommentComposer,ForumPage,ThreadPage}.tsx` y caché existente: elegibilidad, mensajes y revalidación tras conflicto concurrente, sin rediseñar CSS ni sesión.
- Sin cambio de esquema, migraciones, acceso a `.env`/secretos o ejecución contra bases de datos. Todo nuevo cambio funcional mantiene check/lint desde raíz, tests afectados y build frontend como verificación técnica obligatoria; los resultados históricos no certifican 3.3 reparada. Este update solo modifica planning.
- `apps/web/src/pages/LegalPage.tsx:82`, `docs/context.md:85` y `AGENTS.md:16`: la alineación acotada y la sincronización de los dos deltas ya realizadas son antecedentes cerrados; no se reabre 5.1 ni se vuelven a editar esas fuentes o las specs principales en esta revisión.
- El change `mejora-visual-minimalista-frontend` conserva su ámbito visual y la política funcional de este change; la revisión legal autorizada preserva documentos completos preexistentes y no introduce nueva redacción legal.
- La política vigente delega tester/TDD SOLO para cambios que puedan romper funcionalidad y tengan resultado determinista; F 3.3 exige Red/Green sobre la carrera de lecturas del componente/callback real. Inspecciones visuales y documentación las verifica directamente el ingeniero. Las retiradas visuales 1.6/3.10/5.4/8.1 no retiran la política raíz/conteo/historial ni F 3.3 y su verificación técnica; 8.3/8.5/8.6 visuales revisan solo alcance vigente y distinguen el GREEN puntual de cuatro estados de V 3.6 ejecutado/registrado en `map-size-green.json` y la suite unitaria 7/7 ejecutada del runner AMPLIO histórico `resource-checks`, único cancelado/no acreditado por timeout MCP sin reporte, retirado por V 3.10/8.1. No se atribuye una nueva ejecución ni más cobertura. No se autoriza `.env`, SQL, migraciones ni DB; la carrera PostgreSQL conserva el guard/skip de 2.3 y no se certifica con mocks. Aquí solo se valida planning con OpenSpec, sin producto, tests, evidencia de ejecución, sync ni archive.
