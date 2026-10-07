# Baseline editorial previa al rediseño

Fixtures de DOM por ruta/sección, no snapshots de JSX, CSS ni clases Tailwind. Se capturan con sesión anónima interceptada antes de navegar, sin peticiones a la API real. Texto normalizado solo por whitespace; los arrays preservan orden y multiplicidad para detectar pérdida y duplicación. Incluyen contenido de details cerrados, imágenes/alt/captions/fuentes (sin inventar licencias), enlaces y anclas.

La comparación contra DOM vivo se ejecuta con `evidence/pilot-checks.js`. Los controles negativos offline usan el mismo comparador en `tests/editorial-conservation.test.ts`. Estos controles no sustituyen la comprobación viva ni certifican que los estados históricos ya cumplan sus specs.

No regenerar esta baseline para hacer pasar una regresión. Las capturas BEFORE y `visual-notes.md` del change son trabajo previo y no se modifican.
