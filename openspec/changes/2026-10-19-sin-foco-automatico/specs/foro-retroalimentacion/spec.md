# Spec Delta

## MODIFIED Requirements

### Requirement: Legibilidad del árbol con sangría visual acumulada acotada

La presentación del foro SHALL distinguir raíces y respuestas por jerarquía, guías visuales y relación con el padre donde actualmente se muestra, sin depender solo de color. Autor, fecha, mensaje y acciones existentes SHALL permanecer legibles, con mensajes en texto plano y sus saltos de línea conservados. La sangría visual acumulada entre la raíz y el nivel 6 SHALL ser como máximo 32 px en móvil de ancho efectivo inferior a 768 px y 48 px desde 768 px; el límite SHALL aplicarse a la suma de sangrías/bordes/paddings anidados, no solo a cada comentario por separado.

El rediseño SHALL conservar todo el historial hasta seis niveles, su orden, padres, descendientes y enlaces a hilo/anclas, sin borrar, ocultar, truncar ni reparentar nodos para aplanarlo. El comentario retirado SHALL conservar su tratamiento y descendientes, sin añadir edición ni borrado. A 360 px, el área útil del cuerpo de un comentario histórico de nivel 6 SHALL mantener al menos 240 px de ancho y permitir leer y accionar las acciones disponibles sin overflow horizontal global.

Las ediciones puramente visuales SHALL conservar las condiciones de responder y las acciones de publicación/cancelación, y SHALL NOT añadir etiquetas o mensajes por motivos visuales. Al integrar ambos changes aprobados, la elegibilidad y el copy funcional de nuevas publicaciones SHALL regirse exclusivamente por `foro-respuestas-directas-limitadas`: respuestas solo a raíz, profundidad máxima de escritura 2 y hasta seis respuestas directas totales por raíz, incluidas las retiradas. Esa política SHALL permanecer fuera del scope visual; conservar el historial hasta seis niveles SHALL NOT autorizar nuevas publicaciones multinivel ni impedir los ajustes funcionales aprobados.

#### Scenario: Conversación completa de seis niveles en móvil
- **WHEN** se abre un hilo histórico con comentarios en los niveles 1 a 6 a 360 px de ancho
- **THEN** la sangría acumulada no supera 32 px, el mensaje más profundo tiene al menos 240 px de ancho útil y autor, fecha y acciones disponibles son legibles sin desplazar horizontalmente la página

#### Scenario: Nivel máximo y comentario retirado
- **WHEN** se presenta una rama histórica que llega al nivel 6 y contiene un comentario retirado con descendientes
- **THEN** el nivel 6 sigue sin ofrecer respuesta, se conservan el aviso actual y los descendientes del retirado y no aparecen acciones nuevas

#### Scenario: Listado y vista enfocada conservados
- **WHEN** un visitante pasa del listado a una conversación profunda y navega a una ancla de comentario
- **THEN** se mantienen raíces/respuestas directas en el listado, el árbol completo en el hilo, el orden y destinos actuales; el comentario de destino permanece visible bajo la cabecera sin que la aplicación le transfiera el foco automáticamente
