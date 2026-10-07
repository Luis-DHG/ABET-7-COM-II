# Ciclo vertical 1: manifiesto del workspace — RED

## Autorización y límites

- La invocación comunica la autorización explícita del usuario: **«Autorizar reparación previa»**.
- Reparación autorizada al ingeniero: crear un `package.json` raíz mínimo a partir de scripts existentes, sin dependencias nuevas ni cambios de comportamiento de la aplicación.
- Este turno del tester añade únicamente `apps/web/tests/workspace-manifest.test.ts` y esta evidencia. **No crea el manifiesto ni modifica producción, lockfile, workspace, `tasks.md` o artefactos de planificación.**
- La invocación informa que la documentación del permiso mediante el especificador fue denegada; el permiso se registra aquí, sin reinterpretar ni editar el planning.
- No se lee `.env`, se accede a BD, se instala una dependencia, se arranca `dev`/`start`, se ejecutan migraciones ni se crea un commit.

## Mapeo previo y seam confirmado

- Entorno observado: Windows, Node **v24.14.1**, CLI pnpm **11.13.0**.
- `package.json` raíz no existe (`Test-Path`: `False`) y `git ls-files -- package.json` no devuelve archivos versionados.
- `pnpm-workspace.yaml` incluye `apps/*` y `packages/*`; `nodeLinker` es `hoisted`. No hay `.github/` ni CI; las instrucciones exigen verificación local desde raíz.
- Leídos los manifiestos completos de `packages/contracts`, `apps/server` y `apps/web`.
- Contracts expone `dist/index.js` y `dist/index.d.ts`, y dispone de scripts `build` y `check`; server y web dependen de `@blogdpc/contracts` como `workspace:*`. Revisar consumidores sin reconstruir contracts puede comprobar un `dist/` antiguo.
- Server ya tiene `build`, `check`, `dev` y `test`. Su `dev` reconstruye contracts antes de `tsx watch`; su `test` reconstruye contracts y server antes de `node --test dist/**/*.test.js`.
- Web ya tiene `build`, `check`, `lint` y `test`. Su `lint` usa oxlint; su `test` usa `node --experimental-strip-types --test tests/*.test.ts`.
- Convención reutilizada: `apps/web/tests/*.test.ts`, `node:test` y `node:assert/strict`, TypeScript en vivo y sin alias `@/` ni imports runtime de contracts. El test nuevo entra en el glob existente sin cambiar configuración.
- Seam autorizado: **contrato público declarativo del manifiesto raíz y sus delegaciones a scripts de paquetes existentes**. La ruta se resuelve desde `import.meta.url`, no desde el cwd. El fallo observado identifica exactamente `C:\Users\USER\Desktop\Blog\package.json`.
- El test no ejecuta los scripts declarados: compara las secuencias propuestas separadas por `&&`, normalizando espacios y el alias `pnpm run <script>`. No compara texto JSON, indentación ni orden de claves. No es un intérprete general de shell ni certifica por sí solo el éxito de los comandos reales.
- Consultados `docs/context.md`, proposal/design del change y la spec completa `despliegue` (`openspec show "despliegue" --type spec`). No se cambia ninguna capacidad ni se inicia el trabajo visual.
- Codegraph no tiene índice en este repo; se usó `graphify query` de solo consulta y después las herramientas nativas. No se actualiza el grafo: la escritura autorizada en este turno está limitada a tests/evidencia.

## Casos propuestos y autorizados

Los casos enumerados por el solicitante se materializan como **un único test de contrato**, en un único seam:

| Caso | Oráculo |
|---|---|
| Manifiesto raíz disponible y privado | Existe un objeto JSON y `private === true` |
| Sin dependencias nuevas | `dependencies`, `devDependencies`, `optionalDependencies` y `peerDependencies` ausentes o mapas vacíos |
| Delegaciones resolubles | Los tres nombres `@blogdpc/*` coinciden con sus manifiestos y los scripts delegados existen y no están vacíos |
| Check sin contracts obsoletos | Build de contracts antes del check recursivo de los paquetes, unido por `&&` |
| Lint acotado | Solo se delega al lint de web |
| Test completo por scripts existentes | Test de server seguido de test de web, unido por `&&` |
| Build ordenado | Contracts, server y web, unidos por `&&` |
| Dev existente | Delegación al dev de server, sin arrancarlo en el test |

Entradas de error cubiertas por las aserciones del mismo contrato: manifiesto ausente/no objeto, `private` falso o ausente, mapas de dependencias inválidos/no vacíos, scripts ausentes/vacíos, paquetes incorrectos, secuencias incompletas/desordenadas o separadores que no sean `&&`. En este RED se alcanza primero la ausencia del manifiesto; las restantes aserciones se alcanzarán después de la reparación.

Secuencias propuestas por el solicitante y protegidas por el test:

```text
check: pnpm --filter @blogdpc/contracts build && pnpm -r check
lint:  pnpm --filter @blogdpc/web lint
test:  pnpm --filter @blogdpc/server test && pnpm --filter @blogdpc/web test
build: pnpm --filter @blogdpc/contracts build && pnpm --filter @blogdpc/server build && pnpm --filter @blogdpc/web build
dev:   pnpm --filter @blogdpc/server dev
```

**No se impone `packageManager`.** El lockfile registra pnpm **12.5.1** en `importers['.'].packageManagerDependencies`, mientras la CLI observada es **11.13.0**. No se elige una versión arbitraria ni se modifica ninguna de las dos. Tampoco se fijan `name`, `version` o `type` de la raíz ni se prohíben otros scripts.

## Reproducción de las tres verificaciones raíz

Directorio: `C:\Users\USER\Desktop\Blog`. Se ejecutaron los tres comandos, capturando `$LASTEXITCODE` por separado; no se detuvo la reproducción después del primero.

| Comando | Código de salida | Error observado |
|---|---:|---|
| `pnpm check` | **1** | `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` |
| `pnpm lint` | **1** | `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` |
| `pnpm test` | **1** | `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` |

Mensaje idéntico para los tres:

```text
[ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND] No package.json (or package.yaml, or package.json5) was found in "C:\Users\USER\Desktop\Blog".
```

Por tanto, ninguno llega a ejecutar el script raíz esperado. No se atribuye el bloqueo a typecheck, lint, tests, `.env` o BD, ni se declara verde la suite global/server.

## Test determinista: RED esperado, no fallo de harness

Archivo: `apps/web/tests/workspace-manifest.test.ts`.

Desde `C:\Users\USER\Desktop\Blog\apps\web`:

```powershell
node --experimental-strip-types --test tests/workspace-manifest.test.ts
```

Resultado: **exit 1; 1 test, 0 pass, 1 fail, 0 cancelled, 0 skipped, 0 todo**.

Señal relevante:

```text
el manifiesto raíz privado orquesta los scripts existentes sin añadir dependencias
AssertionError [ERR_ASSERTION]: Falta C:\Users\USER\Desktop\Blog\package.json: el workspace necesita su manifiesto
actual: false
expected: true
```

La aserción ocurre dentro del callback de `node:test`, al leer el manifiesto. No hay error de carga de TypeScript, resolución de imports, descubrimiento de archivos o arranque del runner. No se crea un manifiesto temporal para forzar GREEN.

## Suite completa del área afectada

Desde `apps/web` se ejecutó el mismo glob del script web existente, directamente con Node para evitar el bloqueo del comando raíz:

```powershell
node --experimental-strip-types --test tests/*.test.ts
```

Resultado: **exit 1; 11 tests, 10 pass, 1 fail, 0 cancelled, 0 skipped, 0 todo**.

- Verdes los 10 tests existentes de fórmulas, OFDM, caché de foro y sesión.
- Único fallo: el test nuevo, por la misma ausencia del manifiesto raíz.
- Ningún `skip`, `only` o snapshot se añade. No se activan tests opt-in de BD.

## Sensibilidad a regresión

Revisión por **mutación mental**, sin tocar producción:

- Con un manifiesto futuro válido, eliminar el primer paso de `check` deja solo `pnpm -r check`: la comparación con las dos etapas esperadas falla, aunque el JSON siga siendo válido.
- Cambiar `private` a `false`, añadir una dependencia o omitir el test de web también dispara una aserción independiente.
- Reindentar/reordenar las claves JSON, cambiar espacios entre argumentos o usar `pnpm run <script>` no altera el resultado del contrato.

No se presenta esta revisión mental como una ejecución de mutaciones ni como GREEN del manifiesto aún ausente.

## Entrega al ingeniero: siguiente seam GREEN

1. Crear únicamente el `package.json` raíz mínimo permitido, privado y sin dependencias nuevas, delegando a los scripts existentes en las secuencias anteriores. No cambiar comportamiento app ni elegir `packageManager` para satisfacer el test: el test no lo exige.
2. Reejecutar el test aislado y la suite web completa; ambos deben quedar verdes una vez que el manifiesto satisfaga el contrato.
3. Desde raíz ejecutar **`pnpm check` → `pnpm lint` → `pnpm test`**, completando las tres verificaciones y distinguiendo warnings/fallos preexistentes de regresiones.
4. Registrar cualquier nuevo bloqueo con su reproducción, sin instalar dependencias, leer `.env`, activar BD ni cambiar expectativas para fabricar verde. No ejecutar `dev` o `start` para probar la delegación declarativa.

Estado final de este ciclo: **RED reproducible entregado para reparación; GREEN pendiente del ingeniero.** No se modifica `tasks.md` ni se marca avance del rediseño visual.
