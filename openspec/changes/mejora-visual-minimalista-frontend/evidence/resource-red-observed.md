# Evidencia del RED inicial de recursos científicos

## Estado del ciclo del piloto

El piloto no se reabre: `pilot-green-results.json` y `pilot-green-verification.json` guardan `GREEN`, 101/101. `conservation-green-verification.json` guarda 7/7 rutas y 35 secciones. `shell-green-verification.json` guarda 17/17; la sugerencia adicional de foco activo visible queda expresamente para el próximo ciclo de teclado/responsive, no bloquea recursos.

Desde `apps/web` se volvió a ejecutar la suite Node del área. Incluye los comparadores científicos, sus controles negativos y el test del manifiesto raíz persistente.

## Ejecución browser RED ya observada

La primera ejecución browser real de `evidence/resource-checks.js`, antes de esta entrega, terminó **RED, 129 correctos / 7 fallidos de 136**. Sus resultados quedaron en la salida de herramienta de la sesión anterior y se condensan, sin alterar producción, en `resource-red-observed.json`.

### Tres hallazgos de comportamiento separados de los defectos del inspector

1. **Scroll de ecuaciones por teclado:** `mini-caso@360` y `mini-caso@768`. En los recursos overflowados observados (6 px y 3 px), el wrapper recibía foco y mostraba outline, pero `scrollLeft` seguía en 0 al pulsar ArrowRight; el documento no tenía overflow horizontal. Estos son RED observados, aunque su tamaño residual es pequeño: el ingeniero debe decidir si representan información recortada significativa al contrastar DOM y visual.
2. **Mapa con poco ancho del contenedor:** con viewport desktop de 1440 px y la región del mapa limitada a 240 px, el host `.bibliometric-plot` midió **0 px** y el detalle ocupó la región de 240 px. El control no depende de las clases completas: comprueba bounds del DOM bajo ancho disponible reducido. RED reproducible para organización del plot/detalle; no afirma qué breakpoint de producto implementar.

### Cuatro resultados iniciales que NO atribuimos al producto

Los otros cuatro fallos procedían del primer inspector de renderer: comparaba `getEdgeDisplayData()` con los tamaños de edge del oráculo para estados completo/selección/clúster/reset. Ese display-cache público no era una lectura válida del resultado final del reducer para todos los enlaces. Por honestidad se retiran de los hallazgos. `resource-checks.js` ya usa el `Graph` y los reducers obtenidos por `getGraph()`/`getSetting()` y aplica las funciones a los atributos públicos del grafo. La variante corregida **no se ejecutó en browser** porque el usuario reservó el browser compartido para el ingeniero al terminar este turno. Será su primer paso al validar el GREEN.

Los tests Node del oracle ahora incluyen mutaciones de coordenada, tamaño de nodo, grosor, visibilidad, salida OFDM/unidad/retardo, y una arista más débil que no está en el top 1000 global pero sí debe dibujarse al seleccionar su término. Son controles del comparador/golden; no sustituyen la ejecución corregida del renderer en browser.

## Alcance cubierto y condición heredada

- La ejecución observó figuras del piloto científico: asociación DOM src/alt/figcaption/fuente, carga, proporción, clipping, foco de ampliación; las imágenes disponibles pasaron en esa ejecución.
- El PNG `public/images/oddm-isac-paper.png` faltante fue detectado y anotado como heredado, no congelado ni aprobado. No se modifican ni el activo ni la referencia de ODDM.
- Se cubrieron controles OFDM, defaults, unidades, salidas, extremos, reset y formato con el golden previo. En esa ejecución del browser estos checks no están entre los siete resultados fallidos. No se cambió ni refreezó el golden.
- La operación de búsqueda/selección, filtro de clúster, métricas visibles y reset se ejecutó. Hasta que se ejecute la versión corregida del inspector no certificamos conservación de todas las reglas del renderer Sigma.
- No se inicia ciclo de foro/auth/cámara/reduced-motion ni se añade matriz de trazabilidad nueva.

## Entrega al ingeniero

Desde `apps/web` el test afectado es:

```powershell
node --experimental-strip-types --test tests/*.test.ts
```

Browser RED corregido para reejecutar mediante `browser_run_code_unsafe(filename=...)`:

```text
openspec/changes/mejora-visual-minimalista-frontend/evidence/resource-checks.js
```

La suite Node protege oráculos/golden y mutaciones; Green de mapa/presentación requiere que el test vivo se ejecute de nuevo contra los reducers públicos. No tomar los cuatro errores de `getEdgeDisplayData` del primer ensayo como regresión, no restaurar el lockfile, los assets o cambios legales concurrentes, y no tocar tasks/planning.

## Verificación tester antes del handoff

Tras incorporar `resource-oracles.test.ts` se ejecutó la suite afectada completa desde `apps/web`:

```powershell
node --experimental-strip-types --test tests/*.test.ts
```

**21 tests, 21 pass, 0 fail, 0 skipped, 0 cancelled; exit 0.** Incluye el test existente del manifiesto y el test nuevo del comparador. `package.json` raíz se verificó presente después de la ejecución. `node --check` terminó con exit 0 para `apps/web/tests/helpers/resource-oracles.js` y `evidence/resource-checks.js`. Búsqueda de `only`/`skip` en los tests: ninguna coincidencia.

No se ejecutó `pnpm install`, `pnpm check` ni se modificó el lockfile; los checks root 0/0/0 con sus warnings/skips previos son los reportados por el ingeniero. El browser compartido no se usó durante este turno. La ejecución browser registrada corresponde al primer inspector y conserva su conteo original; el inspector corregido queda preparado para que el ingeniero lo ejecute tras este handoff.
