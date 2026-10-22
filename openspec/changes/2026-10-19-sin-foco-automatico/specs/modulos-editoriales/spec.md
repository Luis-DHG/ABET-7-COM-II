# Spec Delta

## MODIFIED Requirements

### Requirement: Jerarquía editorial y ubicación sin progreso completado
El encabezado editorial SHALL ordenar ubicación entre siete módulos, nombre del módulo, headline, introducción y metadatos. Su altura SHALL responder al contenido y al espaciado de composición, sin imponer una altura mínima de viewport o un espacio vacío equivalente. El indicador SHALL expresar únicamente la ubicación actual; las otras posiciones no SHALL representar lectura completada, resultados o avance guardado.

El índice de secciones SHALL permanecer abierto en desktop desde 768 px de ancho efectivo y colapsable por activación en móvil, conservando las anclas actuales. La cabecera sticky no SHALL ocultar el encabezado de la sección enlazada. La navegación a una ancla SHALL conservar el desplazamiento al destino visible, pero SHALL NOT transferir automáticamente el foco al encabezado o sección de destino. Los accesos al glosario de los módulos 1 a 6 y la paginación actual SHALL mantenerse.

#### Scenario: Entrada directa a un módulo intermedio
- **WHEN** un visitante abre directamente `/mini-caso` sin haber leído otros módulos
- **THEN** se muestra su ubicación como módulo 4 de 7, no hay posiciones anteriores marcadas como completadas y el hero sigue la jerarquía indicada sin altura de viewport artificial

#### Scenario: Índice y anclas en ambos layouts
- **WHEN** el visitante activa una ancla a 360 px y después consulta el módulo a 768 o 1440 px de ancho efectivo
- **THEN** el índice puede expandirse en móvil, permanece abierto en desktop, el encabezado de destino queda visible bajo la cabecera y no recibe foco automáticamente, sin cambiar el contenido ni el identificador de la sección
