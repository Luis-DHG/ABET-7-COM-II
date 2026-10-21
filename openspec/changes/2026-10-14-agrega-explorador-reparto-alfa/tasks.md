# Tasks

## 1. OpenSpec

- [x] 1.1 Crear el proposal, design, delta completo de `modulos-editoriales` y tareas del change.
- [x] 1.2 Validar el change con `openspec validate "2026-10-14-agrega-explorador-reparto-alfa" --type change --strict`; la spec principal se sincronizó por instrucción del usuario y el change permanece sin archivar.

## 2. Modelo y pruebas

- [x] 2.1 Implementar el modelo puro de reparto, escenarios, curva, ilustración de eco, apuesta y ficha con una única fuente de parámetros.
- [x] 2.2 Añadir pruebas de conservación de potencia, presupuesto de enlace independiente en dB, monotonía, ley de (1−α), sensibilidad, extremos finitos, cifras de referencia y categoría de apuesta.

## 3. Explorador

- [ ] 3.1 Crear el componente accesible y responsive con apuesta, slider, radios independientes, pantalla de eco, medidor, curva interactiva y tabla alternativa.
- [ ] 3.2 Añadir ficha visible, preguntas de cierre, invitación existente al foro, estilos mínimos con prefijo `alpha-` y carga diferida con espacio reservado.
- [x] 3.3 Insertar la frase y componente en el lugar solicitado del módulo 4 y reescribir únicamente la nota de límites.

> Auditoría QA pendiente: faltan la apuesta opcional con «Comprobar con el modelo» que fija α=90 %, la curva tasa-vs-SNR en SVG `role="img"` (los dos paneles actuales grafican α con `role="slider"`) y la pantalla SVG del eco con distancia/log-potencia.
> La ficha `dl.editorial-facts` está dentro de un `<details>` cerrado, por lo que no permanece visible.

## 4. Verificación y entrega

- [x] 4.1 Ejecutar contratos, check, lint, tests y build; la suite web pasó completa, incluido `editorial-conservation`; medir chunks.
- [x] 4.2 Revisar en Edge a 360, 768 y 1440 px; no hubo desbordamiento horizontal. Registrar el resultado y los textos existentes modificados en la entrega.
