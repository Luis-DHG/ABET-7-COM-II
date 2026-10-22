# Coherencia documental autorizada — tarea 5.1

## Autorización y alcance

El usuario indicó «Lo que acabamos de hacer es la fuente de verdad, corrige la spec» y confirmó continuar. La política de publicación implementada no se cambió en esta tarea. Se corrigió únicamente su descripción y la frase de términos que anunciaba seis niveles publicables.

La autorización resuelve las referencias pendientes de los informes anteriores (`verification.md` y `openspec/changes/mejora-visual-minimalista-frontend/evidence/final-verification.md`); esos informes se conservan como registro de la revisión previa.

## Specs sincronizadas

- `openspec/specs/foro-retroalimentacion/spec.md`: eliminado el requisito de anidamiento publicable hasta seis niveles; incorporados los tres requisitos del delta (respuestas solo a raíz, cupo de seis directas e interfaz coherente); ampliada la integridad del historial con sus escenarios. Se conservaron Purpose, autorización, texto plano, paginación, cooldown y suspensión.
- `openspec/specs/paginas-legales/spec.md`: modificado únicamente `Contenido de términos aprobado` conforme al delta, conservando el escenario y el resto de la spec.
- Los deltas proceden de las dos rutas declaradas por `openspec status`; se consultó `openspec instructions specs` antes de escribir las specs principales.
- El especificador reconcilió la baseline legal del change visual con los documentos completos ya aprobados. No se restauraron avisos de preparación ni se revirtió el trabajo del usuario.

## Copy y contexto

- `LegalPage.tsx`: los términos explican respuestas solo a raíz, máximo seis directas y ninguna respuesta a respuestas. El cupo se obtiene de `MAX_DIRECT_REPLIES_PER_ROOT`, sin duplicar un límite numérico en el componente.
- `docs/context.md` y `AGENTS.md`: nuevas publicaciones distinguidas del historial multinivel; el contexto incluye el conteo de retiradas y la exclusión de descendientes indirectos históricos.
- Privacidad, retención, proveedores, SEO, contenido editorial, schema y política de publicación sin cambios en esta tarea.

## Verificación ejecutada

| Verificación | Resultado |
|---|---|
| `openspec validate --specs` | 8 specs válidas, 0 fallos; avisos informativos por requisitos largos |
| Validación `--strict` de ambos changes | Válidos |
| `pnpm --config.verifyDepsBeforeRun=false check` desde raíz | Exit 0; contracts reconstruido antes de server/web |
| `pnpm --config.verifyDepsBeforeRun=false lint` | Exit 0; 8 warnings previos |
| Build server y pruebas compiladas de publish/tree/depth | 11 pass, 0 fail, 2 skips de PostgreSQL |
| Pruebas web existentes de reply-policy/forum-cache | 4 pass, 0 fail |
| `pnpm --config.verifyDepsBeforeRun=false --filter @blogdpc/web build` | Exit 0; aviso de chunk mayor que 500 kB |
| `git diff --check` en los cinco archivos de implementación/sync | Exit 0 |
| Revisión independiente, eje Estándares | Sin hallazgos en el ajuste 5.1 |
| Revisión independiente, eje Spec | Delta sincronizado coherentemente |

El tester ejecutó únicamente las pruebas existentes del foro, sin añadir pruebas visuales. Las dos pruebas PostgreSQL quedaron deshabilitadas explícitamente: no hubo conexión, seeds ni ejecución SQL, y no se certifica atomicidad real mediante dobles.

## Límites y estado

La navegación a `http://localhost:5173/terminos` devolvió `ERR_CONNECTION_REFUSED`; no se declara una revisión browser en vivo de esta corrección. La coherencia de la frase se comprobó en fuente, typecheck y build, y las specs se validaron por CLI.

La sincronización no archivó changes ni creó commits. Los cambios ajenos de arranque local se dejaron intactos.
