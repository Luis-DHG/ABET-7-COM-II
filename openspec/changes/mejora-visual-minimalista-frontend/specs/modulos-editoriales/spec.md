# Spec Delta

## ADDED Requirements

### Requirement: Conservación integral del contenido editorial actual

El rediseño SHALL conservar todos los textos, titulares, introducciones, nombres y anclas de secciones, mensajes, enlaces y destinos, fuentes, licencias, referencias, fórmulas y recursos actuales de los siete módulos. Las modificaciones SHALL limitarse a presentación y agrupación/ubicación de unidades existentes, manteniendo el orden lógico; no SHALL vaciar módulos, redactar, reformular, añadir afirmaciones, secciones o duplicar figuras como decoración. El contenido actualmente visible no SHALL ocultarse en acordeones nuevos; los controles colapsables existentes SHALL conservarse.

Los estados actuales del video de divulgación y de la experiencia/documentación grupal SHALL conservar su condición pendiente y su copy. La navegación SHALL mantener las siete rutas ordenadas, la entrada por `/planeacion` y los enlaces actuales desde `/glosario` al foro como sección independiente, no como módulo ocho.

#### Scenario: Comparación con la versión anterior al rediseño
- **WHEN** se compara cada módulo y sus estados con el inventario previo al rediseño
- **THEN** cada unidad de texto, enlace, ancla, recurso, fuente y referencia sigue disponible con el mismo contenido y significado, sin pérdidas, duplicaciones ni nuevas secciones

#### Scenario: Materiales todavía pendientes
- **WHEN** se abren `/divulgacion` y `/bitacora`
- **THEN** permanecen los textos y estados pendientes actuales, sin un video simulado ni experiencias, fechas o lecciones inventadas

### Requirement: Jerarquía editorial y ubicación sin progreso completado

El encabezado editorial SHALL ordenar ubicación entre siete módulos, nombre del módulo, headline, introducción y metadatos. Su altura SHALL responder al contenido y al espaciado de composición, sin imponer una altura mínima de viewport o un espacio vacío equivalente. El indicador SHALL expresar únicamente la ubicación actual; las otras posiciones no SHALL representar lectura completada, resultados o avance guardado.

El índice de secciones SHALL permanecer abierto en desktop desde 768 px de ancho efectivo y colapsable por activación en móvil, conservando las anclas actuales. La cabecera sticky no SHALL ocultar el encabezado de la sección enlazada. Los accesos al glosario de los módulos 1 a 6 y la paginación actual SHALL mantenerse.

#### Scenario: Entrada directa a un módulo intermedio
- **WHEN** un visitante abre directamente `/mini-caso` sin haber leído otros módulos
- **THEN** se muestra su ubicación como módulo 4 de 7, no hay posiciones anteriores marcadas como completadas y el hero sigue la jerarquía indicada sin altura de viewport artificial

#### Scenario: Índice y anclas en ambos layouts
- **WHEN** el visitante activa una ancla a 360 px y después consulta el módulo a 768 o 1440 px de ancho efectivo
- **THEN** el índice puede expandirse en móvil, permanece abierto en desktop y el encabezado de destino queda visible bajo la cabecera sin cambiar el contenido ni el identificador de la sección

### Requirement: Composición de lectura y recursos técnicos

Los párrafos SHALL conservar un ancho de lectura contenido conforme a la presentación compartida, mientras mapas, tablas, fórmulas y exploradores SHALL poder usar más espacio. Una explicación y su figura SHALL poder componerse en columnas solo si constituyen una unidad existente y sus textos/etiquetas siguen legibles; cuando no quepan SHALL apilarse respetando el orden lógico. Tablas, fórmulas, notas, ejemplos, citas y referencias SHALL distinguir su jerarquía con tratamiento sobrio sin convertir cada párrafo en tarjeta.

#### Scenario: Recurso ancho junto a texto de lectura
- **WHEN** se abre `/analisis` o `/mini-caso` en desktop
- **THEN** el mapa o explorador puede ocupar el ancho de exploración sin extender los párrafos a ese mismo ancho, y notas, tablas y fórmulas se distinguen sin clipping

#### Scenario: Unidad explicación y figura en móvil
- **WHEN** una unidad presentada en columnas se visualiza a 360 px o a zoom del 200 %
- **THEN** explicación, figura, figcaption y fuente se apilan en orden lógico, sin ocultarse ni separarse en unidades decorativas duplicadas

### Requirement: Figuras científicas íntegras y atribuidas

Las figuras SHALL conservar proporciones, significado, etiquetas, ejes, símbolos, fuentes y licencias. El rediseño SHALL poder ajustar escala, márgenes, contenedores y ubicación, sin recortar información científica, distorsionar ni aplicar filtros que la alteren. Las figuras externas SHALL conservar los activos actuales salvo necesidad justificada y permiso de licencia verificado; sin permiso comprobado no SHALL modificarse ni sustituirse. Los esquemas propios que se redibujen SHALL conservar todas sus relaciones y conceptos. Las acciones actuales de ampliar figuras SHALL seguir disponibles donde existan, sin exigir un nuevo visor.

#### Scenario: Revisión de figuras externas
- **WHEN** se compara una figura científica antes y después del rediseño en desktop y móvil
- **THEN** se conserva su información completa, su proporción y la asociación explicación/figcaption/fuente, y ninguna sustitución o modificación del activo externo ocurre sin permiso de licencia comprobado

#### Scenario: Licencia o autoría no establecidas
- **WHEN** no se puede confirmar que un activo sea propio o modificable
- **THEN** se conserva el archivo y el copy actuales y solo se ajusta su presentación, sin atribuciones inventadas ni redibujo presentado como equivalente

### Requirement: Mapa bibliométrico legible sin cambiar su representación científica

El mapa SHALL organizar controles, plot, detalle y leyenda como zonas distinguibles, con el detalle debajo del plot cuando no quepan en columnas. Búsqueda, selección de término, filtro por clúster y restablecimiento SHALL conservar reglas y resultados actuales. La lectura y selección SHALL disponer de controles operables sin hover, con el detalle y la leyenda identificando textualmente términos y clústeres.

El dataset, coordenadas, etiquetas, clústeres, pesos, métricas y resúmenes derivados SHALL permanecer iguales. Las relaciones que convierten ocurrencias en tamaños y fuerza en grosor, el realce de selección, la selección de hasta los 1.000 enlaces más fuertes y la lógica de filtrado SHALL conservarse. El rediseño SHALL mejorar contraste de etiquetas, conexiones y selección sin reinterpretar las métricas, cambiar la disposición de nodos ni añadir otra regla científica.

#### Scenario: Término seleccionado y reset
- **WHEN** se busca y selecciona el mismo término antes y después del rediseño y después se activa el restablecimiento
- **THEN** se obtienen el mismo término, métricas y conjunto de conexiones, el reset conserva su estado final y solo cambia la presentación y duración de movimiento conforme al contrato compartido

#### Scenario: Filtro y lectura en móvil
- **WHEN** se selecciona un clúster a 360 o 768 px de ancho
- **THEN** controles y leyenda siguen accesibles, el detalle se coloca debajo del plot cuando no cabe al lado y la selección se entiende por el detalle textual además del color

#### Scenario: Fidelidad cuantitativa
- **WHEN** se compara la red completa, un nodo seleccionado y un clúster con la versión previa
- **THEN** permanecen iguales coordenadas, pesos, conjuntos de enlaces representados, tamaños relativos y reglas de realce, así como las métricas y resúmenes bibliométricos

### Requirement: Explorador OFDM con parámetros y resultados diferenciados

El explorador SHALL separar visualmente parámetros, resultados y supuestos existentes, alinear números y unidades y agrupar las métricas sin añadir resultados. SHALL conservar valores predeterminados, formato numérico actual, fórmulas, cálculo y límites de controles: ancho de banda de 10 a 80 MHz con paso de 10; símbolos de 64 a 512 con paso de 64; distancia de 10 a 200 m con paso de 5; velocidad radial de −30 a 30 m/s con paso de 1. Su restablecimiento SHALL recuperar 20 MHz, 256 símbolos, 80 m y 15 m/s.

Los supuestos y advertencias actuales SHALL permanecer visibles, incluida la diferencia entre predicción ideal, tasa bruta QPSK y las etapas no implementadas. Los valores SHALL actualizarse directamente al resultado real, sin contadores animados con números intermedios ficticios.

#### Scenario: Valores predeterminados y restablecimiento
- **WHEN** se modifican los parámetros y se restablecen
- **THEN** se recuperan 20 MHz, 256 símbolos, 80 m y 15 m/s, con los mismos resultados y formato de la versión previa y los supuestos existentes disponibles

#### Scenario: Extremos de los controles
- **WHEN** se recorre cada mínimo, máximo y paso permitido antes y después del rediseño
- **THEN** límites, resultados numéricos, unidades y cálculo coinciden, los parámetros se distinguen de las métricas y no aparece una curva o simulación nueva
