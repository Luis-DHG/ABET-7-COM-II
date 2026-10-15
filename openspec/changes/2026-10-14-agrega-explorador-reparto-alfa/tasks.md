# Tasks

## 1. OpenSpec

- [x] 1.1 Crear el proposal, design, delta completo de `modulos-editoriales` y tareas del change.
- [x] 1.2 Intentar `openspec validate agrega-explorador-reparto-alfa --strict`; la CLI no está instalada en el entorno, por lo que no se pudo validar. No sincronizar la spec principal ni archivar.

## 2. Modelo y pruebas

- [x] 2.1 Implementar el modelo puro de reparto, escenarios, curva, ilustración de eco, apuesta y ficha con una única fuente de parámetros.
- [x] 2.2 Añadir pruebas de conservación de potencia, presupuesto de enlace independiente en dB, monotonía, ley de (1−α), sensibilidad, extremos finitos, cifras de referencia y categoría de apuesta.

## 3. Explorador

- [x] 3.1 Crear el componente accesible y responsive con apuesta, slider, radios independientes, pantalla de eco, medidor, curva interactiva y tabla alternativa.
- [x] 3.2 Añadir ficha visible, preguntas de cierre, invitación existente al foro, estilos mínimos con prefijo `alpha-` y carga diferida con espacio reservado.
- [x] 3.3 Insertar la frase y componente en el lugar solicitado del módulo 4 y reescribir únicamente la nota de límites.

## 4. Verificación y entrega

- [x] 4.1 Ejecutar contratos, check, lint, tests y build; la suite web pasó completa, incluido `editorial-conservation`; medir chunks.
- [x] 4.2 Revisar en Edge a 360, 768 y 1440 px; no hubo desbordamiento horizontal. Registrar el resultado y los textos existentes modificados en la entrega.
