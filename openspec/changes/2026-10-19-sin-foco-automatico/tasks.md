# Tasks

## 1. Navegación editorial y anclas del foro

- [x] 1.1 Retirar las transferencias de foco al H1/destino de hash en las páginas editoriales y al comentario hash en el hilo, manteniendo el scroll existente; verificar con pruebas de regresión que los destinos siguen visibles bajo la cabecera sticky y no se convierten en `document.activeElement` por la carga.
- [x] 1.2 Actualizar la cobertura de anclas editoriales e históricas del hilo en móvil y desktop; verificar que permanecen rutas, fragmentos, orden y árbol de comentarios, y que el foco no se transfiere automáticamente.

## 2. Errores y composers sin foco automático

- [x] 2.1 Eliminar el enfoque automático de los resúmenes de error de ingresar/registro, el autoenfoque del textarea de respuesta y el enfoque del párrafo de anuncio al publicar; verificar que errores, asociación a campos, anuncios, publicación confirmada, valores y borradores siguen conservándose.
- [x] 2.2 Añadir o actualizar pruebas de regresión para error de autenticación, apertura de Responder y publicación; verificar que las acciones no transfieren programáticamente el foco y que la apertura/cierre del composer mantiene su comportamiento actual.

## 3. Regresión de accesibilidad

- [x] 3.1 Verificar Dialog, Sheet y DropdownMenu con teclado: enfoque inicial, confinamiento cuando corresponde y restauración al control que los abrió permanecen intactos; comprobar también que los estilos `:focus-visible` siguen visibles y ejecutar `pnpm test` desde la raíz.
