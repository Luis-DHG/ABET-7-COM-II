# Tasks

## 1. Verificación de la base y el alcance

- [x] 1.1 Comparar directamente los árboles `origin/main` y `dev_content` para los archivos editoriales, sus componentes, estilos y recursos, sin usar una comparación de tres puntos; la comparación directa verificó el alcance del delta de `modulos-editoriales`.
- [x] 1.2 Inspeccionar las rutas, los siete módulos, sus componentes, estilos y recursos visuales/interactivos en `dev_content`; la revisión confirmó el mapa bibliométrico, el índice interno, el glosario, el foro independiente y los límites del explorador OFDM.

## 2. Validación y sincronización OpenSpec

- [x] 2.1 Validar el change y las specs con `openspec validate actualiza-modulos-editoriales --strict` y `openspec validate --specs --strict`; ambos pasaron.
- [x] 2.2 Sincronizar `openspec/specs/modulos-editoriales/spec.md` con el delta mediante el flujo OpenSpec y verificar el Purpose y la navegación con `openspec show "modulos-editoriales" --type spec`; no se modificó código y el change no se archivó.
