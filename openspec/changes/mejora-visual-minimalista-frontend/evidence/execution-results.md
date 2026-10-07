# Ejecución: manifiesto, conservación y RED del piloto

## Alcance de esta entrega

Tests/fixtures/evidencia para la reparación raíz y el piloto de tokens/shell/layout (2.1). No hay implementación frontend, modificación de tasks/planning ni avance de ciclos de recursos, foro o cámara/movimiento. No se crea otra matriz de trazabilidad: `traceability.md` del documentador no se modifica ni duplica. No se repiten capturas BEFORE ni se modifica `visual-notes.md`.

## Manifiesto: GREEN observado y bloqueo posterior comprobado

Al comenzar, se leyó el `package.json` raíz creado por el ingeniero: privado, sin dependencias, con exactamente las delegaciones autorizadas. No se exige `packageManager`.

Se ejecutó desde `apps/web`:

```powershell
node --experimental-strip-types --test tests/workspace-manifest.test.ts
node --experimental-strip-types --test tests/*.test.ts
```

- Test raíz original: **exit 0, 1/1 verde**.
- Tras incorporar el control negativo real: **exit 0, 2/2 verdes**; suite web entonces **exit 0, 12/12 verdes**.
- Desde raíz, en orden: **`pnpm check` exit 0 → `pnpm lint` exit 0 → `pnpm test` exit 0**. Server: **8 pass, 0 fail, 2 skipped**; web, antes de ampliar controles: **11 pass, 0 fail**.
- Antes de las herramientas que generan builds se verificaron los padres raíz, `packages/contracts`, `apps/server`, `apps/web` y sus `node_modules`; todos existían. No se ejecutaron backend, `start`, migraciones ni opt-in de BD.

**No es honesto declarar ahora el cierre GREEN definitivo:** en una ejecución posterior el manifiesto desapareció del filesystem. `Test-Path package.json` volvió a `False`; el listado de raíz no lo contiene. No lo borró ni recreó el tester; el origen de ese cambio externo no está establecido.

Última ejecución de raíz (con `--config.verifyDepsBeforeRun=false` para impedir instalaciones automáticas): **check 1 → lint 1 → test 1**. Los tres mensajes fueron:

```text
[ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND] No package.json (or package.yaml, or package.json5) was found in "C:\Users\USER\Desktop\Blog".
```

Última ejecución del test aislado: **exit 1, 1 pass / 1 fail**, solo falla la aserción del manifiesto real ausente. Última suite web completa: **exit 1, 16 pass / 1 fail / 0 skipped / 0 cancelled / 0 todo**; los 10 tests previos, los cinco tests de baseline y el control negativo del manifiesto pasan. No se ajusta ninguna expectativa ni se oculta el fallo.

### Warnings y efecto lateral del gestor

- Lint inicial: 8 warnings previos y exit 0. Tres `react(only-export-components)` en Button, Badge y SessionProvider; cinco `react(set-state-in-effect)` en ThreadPage, VerifyEmailPage, AdminUsersPage, AdminCommentsPage y ForumPage.
- Los dos skips de server exigen `ALLOW_DATABASE_TESTS=true` y `DATABASE_TEST_URL` aislada; están justificados y no se activan. No son GREEN de integración con BD.
- El primer `pnpm check` ejecutó automáticamente la verificación de dependencias de pnpm 11: `Packages: -154`, `reused 154`, **downloaded 0, added 0**, y añadió `.: {}` al lockfile. No se solicitó un install. Se restituyeron únicamente esas dos líneas automáticas; `git diff --stat -- pnpm-lock.yaml` no muestra delta de contenido tras esa restitución. Las siguientes invocaciones usan la opción de configuración en CLI que reporta `false`. No se elige una versión del gestor ni se introducen dependencias nuevas.

## Control negativo REAL del manifiesto

`workspace-manifest.test.ts` usa el mismo validador para el manifiesto real y la fixture canónica `tests/fixtures/workspace-manifest.json`, independiente del SUT. Sobre copias en memoria, efectivamente:

1. Se elimina la reconstrucción de contracts de `check`; el comparador lanza la aserción específica `scripts.check`.
2. Se omite el test web; lanza la aserción específica `scripts.test`.
3. Se cambia `private` a falso; rechaza la publicación raíz.
4. Se añade una dependencia simulada; rechaza `dependencies` no vacío.

`assert.throws` verifica la causa en cada mutante y el control positivo de la fixture sigue pasando. Este control se ejecutó también en la última suite; no escribe el manifiesto real, no depende de su presencia y no cambia el resultado esperado para fabricar verde.

## Baseline congelada y conservación ejecutada

Archivos canónicos: `apps/web/tests/fixtures/editorial/{planeacion,analisis,tendencias,mini-caso,divulgacion,bitacora,glosario}.json`.

- **7 rutas / 35 secciones**: 6, 3, 8, 9, 3, 3 y 3 secciones respectivamente.
- Inventario semántico por sección: texto (solo whitespace normalizado), title/id/anclas, href/rel/target, figuras/imágenes/src/alt/figcaption/fuente/licencia disponible, details y su apertura inicial, TeX de las anotaciones MathML. Headline/introducción/metadatos, índice y paginación se conservan aparte.
- Arrays con orden y multiplicidad: no se convierte el contenido en sets que oculten duplicaciones. No hay snapshots de clases Tailwind, estilos completos o todo el árbol DOM.
- Estado canónico: sesión anónima con **todo `/api/**` interceptado antes de navegar**; mapa y resúmenes cargados, sin término ni clúster seleccionados; OFDM default; glosario cargado sin filtro, 28 details; cierres/aperturas nativas iniciales. Los pending editoriales se conservan literalmente en las fixtures, no se completan.
- `conservation-checks.js` compara el **DOM vivo** contra esas fixtures usando `tests/helpers/editorial-inventory.js`, el mismo comparador que usan los negativos Node. **Ejecutado dos veces: GREEN, 7/7 rutas y ninguna diferencia**. Resultado persistido en `conservation-results.json`.
- No se afirma haber ejecutado aquí toda la matriz auxiliar de auth/foro/admin, cámara Sigma o fallbacks/error/carga de recursos: pertenecen a siguientes ciclos. Los campos del login se miden sin enviar el formulario. No se crea una matriz nueva para esos estados.

### Negativos de conservación ejecutados

En `editorial-conservation.test.ts`, sobre copias de las fixtures capturadas, se pierde una sección, se duplica una sección, se altera texto, se duplica una imagen y se pierde un enlace. El comparador detecta las cinco modificaciones, con diferencias por ruta/sección/campo. Todos estos controles pasan porque rechazan el mutante, no porque acepten contenido modificado.

### Ciencia, activos y OFDM: golden previo, no ciclo de recursos

`tests/fixtures/science-baseline.json` fija:

- Hashes SHA-256 y tamaños de **14 activos presentes**; no sustituye imágenes ni atribuciones.
- VOSviewer: **541 items, 10.523 links, 8 clústeres**, suma de pesos **13.328**. SHA-256 bruto: `d9537537367e9ad6bac7072ffd13abd475b6e6133dbe0877f8bdcadfe037f846`. Fingerprints semánticos preservan ids/labels/x/y/cluster/weights/scores, enlaces y conjunto global más fuerte de 1.000 enlaces.
- Se modificaron realmente, en copias del dataset leído, una coordenada (`x += 0.001`), un peso de ocurrencia y una fuerza de enlace. Los fingerprints respectivos difieren de la baseline y las aserciones negativas pasan. El dataset de producto queda intacto.
- Defaults OFDM **20/256/80/15**, las **nueve salidas** de su interfaz pura, **16 combinaciones de extremos**, límites/pasos/unidades/formato `es-CO` y FORMULAS. Comparación ejecutada contra la función pública `ofdmMetrics`, sin imports runtime de aliases o contracts; todos esos controles están verdes, al igual que los tests anteriores OFDM/MathML.
- Reglas de radios/grosor/realce/top 1.000 y normalización identificadas con referencias de origen. **No se presenta la identificación como ejecución de los reducers, selecciones o cámara de Sigma**: ese seam queda para su ciclo.
- El generador one-shot `tests/tools/freeze-science.ts` impide sobrescribir la fixture ya existente. El primer intento reveló BOM en el JSON: se corrigió únicamente la lectura del harness para omitir BOM al parsear, manteniendo el hash sobre bytes originales; el siguiente freeze terminó exit 0. No se modificó el JSON científico ni se regeneró una expectativa para admitir cambios de producto.

## RED REAL del piloto 2.1

Ejecutado mediante `browser_run_code_unsafe(filename)`:

```text
openspec/changes/mejora-visual-minimalista-frontend/evidence/pilot-checks.js
```

Tres rutas (`/planeacion`, `/analisis`, `/mini-caso`) por tres viewports (360×800, 768×1024, 1440×900), preferencia normal de movimiento y API completamente mock. Último resultado: **RED, 43 comprobaciones pasan y 58 fallan**. Detalle completo en `pilot-red-results.json`.

Los fallos se deben a contratos nuevos incumplidos, no a carga, imports ni runner:

- Prosa: **16 px en 360/768** frente a 17 px; en 1440 el tamaño de 17 ya pasa.
- Interlineado: **1,8** frente al objetivo de diseño **1,75**.
- Medida: **72ch** observados frente a **68ch**, con probe de 68ch en la fuente real y bounds computados. Ejemplo a 1440: max-width 772,172 px frente a probe 729,266 px; no es una búsqueda de strings CSS.
- `--motion-fast` / `--motion-normal`: ambos vacíos frente a **120ms/160ms**. Esto verifica tokens, **no** promete aún duraciones/cámara completas del ciclo de movimiento.
- `/analisis` y `/mini-caso`: posiciones anteriores rellenas y posteriores transparentes/con borde; las seis posiciones no actuales no son neutrales equivalentes. `/planeacion` ya pasa ese control.
- Menús realmente abiertos: enlaces de la ruta actual sin `aria-current`, tanto desktop como móvil.
- Login: campos de **32 px** de alto frente a **44 px**.
- Gap desde metadatos al siguiente bloque: **53 px móvil y 89 px desktop** frente a máximo 48 px. `min-height: auto` es válido como altura por contenido; no se exige incidentalmente la cadena `0px`.

Ya pasan en el piloto: jerarquía de hero observada, índice cerrado móvil/abierto desde 768 efectivos, redirección `/` → `/planeacion`, ausencia de overflow global al 100 %, targets muestreados del piloto y otros contratos existentes. No se declara GREEN el diseño por esos controles ni por los tests Node: calidad visual y contraste necesitan revisión browser independiente.

La herramienta MCP de browser devuelve un veredicto y lecturas; **no hay código de proceso que confundir con exit 0 de Node**. El resultado guardado tiene `status: RED` y las 58 aserciones fallidas, sin excepciones de harness ni skips.

## Zoom REAL 200 % ejecutado

Se encontró una vía nativa en Chrome 154: `chrome.settingsPrivate.setDefaultZoom(2)` desde `chrome://settings/appearance`. No se usa pageScale, transform CSS ni `deviceScaleFactor` para fingir zoom.

`native-zoom-checks.js` ejecutó las tres rutas y los tres tamaños de ventana, restaurando la preferencia original en `finally`. `native-zoom-results.json` registra:

- 1440×900: **1440×900 CSS / DPR 1** al 100 %, **720×450 CSS / DPR 2** al 200 %, `visualViewport.scale = 1`; después se restaura el valor inicial.
- 360×800 → **180×400 CSS**, 768×1024 → **384×512 CSS**, 1440×900 → **720×450 CSS**, todos con DPR 2. Se verificó zoom nativo en **9/9 recorridos**.
- A ventana 360 con zoom 200 % ya existe overflow global: **45 px planeacion, 46 px analisis, 13 px mini-caso**. A 768/1440 medidos: 0 px. Se registra como baseline fallida, no como aprobado ni como un ciclo responsive completado.

No se repiten capturas BEFORE.

## Bloqueos y límites exactos

1. **Manifiesto raíz actualmente ausente**: impide cerrar GREEN sostenido de raíz. El ingeniero debe restablecer el archivo autorizado y reejecutar el test/suite/comandos; el tester no crea producción/config raíz ni altera el test para ignorarlo.
2. **ODDM PNG preexistente borrado**: `ODDMDiagram.tsx:6` sigue referenciando `/images/oddm-isac-paper.png`; el archivo no existe. El AVIF no versionado existe pero no está referenciado. Se registra en `science-baseline.json.unresolvedAsset`, sin aprobar sustitución, inventar licencia, recrear PNG o congelar el activo ausente como válido. El GREEN de conservación del DOM no certifica disponibilidad de esa imagen.
3. Vite 5173 dejó de responder con `ERR_CONNECTION_REFUSED` durante el trabajo; se levantó únicamente frontend con dependencias verificadas y `--config.verifyDepsBeforeRun=false`, sin backend/migraciones, para terminar mediciones sobre fuente actual. Queda sirviendo en 127.0.0.1:5173 para el siguiente ciclo.
4. TestSprite bootstrap devolvió **MCP -32001 / Request timed out**. Creó config/log de testing pero no generó ni ejecutó una suite; no se declara E2E TestSprite verde ni hay tests suyos corriendo a medias. Las mediciones browser solicitadas sí se ejecutaron mediante MCP Playwright; no se instaló runner/dependencia.
5. Cambios ajenos concurrentes visibles (LegalPage, spec legal, `.gitignore`, archivo de change legal, grafo y activos) se preservan; no se usan para reparar o replanificar este change. No hay nuevas matrices, marks de tasks, commits, lecturas de `.env` ni acceso a BD.

## Archivos listos para el ingeniero

- Test de manifiesto y fixture de mutación: `apps/web/tests/workspace-manifest.test.ts`, `tests/fixtures/workspace-manifest.json`.
- Conservación offline y controles reales: `tests/editorial-conservation.test.ts`, `tests/helpers/{editorial-inventory,science-baseline}.js`, fixtures editoriales/ciencia. No refreezear para aceptar regresiones.
- Comprobación viva reutilizable: `evidence/conservation-checks.js`.
- RED de tokens/shell/layout: `evidence/pilot-checks.js` y `pilot-red-results.json`. El objetivo del próximo GREEN es satisfacer esos checks manteniendo conservación; no ampliar a recursos/foro/cámara.
- Zoom nativo reproducible: `evidence/native-zoom-checks.js` y su JSON.

Comandos Node directos desde `apps/web` siguen ejecutables aun con la raíz ausente:

```powershell
node --experimental-strip-types --test tests/workspace-manifest.test.ts
node --experimental-strip-types --test tests/*.test.ts
```

Una vez que el ingeniero restablezca el manifiesto, repetir raíz en orden check → lint → test, impidiendo el auto-install con la opción CLI de testing. No se marca ninguna tarea ni se afirma un GREEN actual que los resultados finales contradigan.
