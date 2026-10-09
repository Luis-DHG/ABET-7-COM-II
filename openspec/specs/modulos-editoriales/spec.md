# Módulos editoriales Specification

## Purpose

Siete módulos editoriales estáticos y secuenciales que divulgan los fundamentos, aplicaciones y tecnologías de ISAC y las redes perceptivas 6G mediante contenido y recursos visuales e interactivos. Los módulos ya presentan contenido editorial; el video de divulgación y la documentación de la experiencia grupal siguen pendientes.

## Requirements

### Requirement: Navegación secuencial de los siete módulos
El sistema SHALL exponer siete rutas editoriales en orden fijo: `/planeacion`, `/analisis`, `/tendencias`, `/mini-caso`, `/divulgacion`, `/bitacora` y `/glosario`. Los enlaces de módulo anterior y siguiente SHALL recorrer únicamente ese conjunto. Como no existe un módulo editorial siguiente a `/glosario`, la paginación SHALL mostrar en la posición visual del módulo siguiente el enlace «A continuación» / «Retroalimentación — sección independiente» hacia `/retroalimentacion`; el cuerpo de `/glosario` SHALL ofrecer además el CTA «Compartir en el foro» hacia la misma ruta. Estos enlaces SHALL mantener al foro como sección independiente y no SHALL crear un octavo módulo.

#### Scenario: Recorrido completo
- **WHEN** un visitante avanza con el enlace siguiente desde `/planeacion`
- **THEN** recorre los siete módulos en orden y termina en `/glosario`

#### Scenario: El foro queda fuera del recorrido
- **WHEN** el visitante llega a `/glosario`
- **THEN** no existe un siguiente módulo editorial, la navegación anterior vuelve a `/bitacora`, la posición visual del siguiente en la paginación enlaza a `/retroalimentacion` con la etiqueta «A continuación» / «Retroalimentación — sección independiente» y el CTA del cuerpo «Compartir en el foro» enlaza a la misma ruta, sin convertirla en módulo ocho

### Requirement: La raíz redirige al primer módulo
La ruta `/` SHALL redirigir a `/planeacion`.

#### Scenario: Entrada por la raíz
- **WHEN** un visitante abre `/`
- **THEN** termina en `/planeacion`

### Requirement: Contenido editorial y recursos implementados en los siete módulos
Las páginas editoriales SHALL presentar el contenido y los recursos que ya están implementados, sin tratar el conjunto como siete espacios vacíos. El recorrido SHALL cubrir: (1) fundamentos de ISAC, capacidades de sensado, pregunta guía, alcance ABET SO7 e índice del recorrido; (2) método bibliométrico desde la búsqueda hasta la interpretación, con la red de coocurrencia VOSviewer; (3) aplicaciones, tecnologías, niveles de integración, redes perceptivas, beneficio mutuo, procesamiento en el borde, estado industrial y desafíos; (4) el mini-caso OFDM-DFRC descrito en el requisito correspondiente; (5) una síntesis de cinco ideas y el estado pendiente del video; (6) decisiones y estrategias de aprendizaje con preguntas de reflexión, sin presentar experiencias grupales aún no documentadas; y (7) glosario consultable y lecturas de referencia.

Cada página SHALL mostrar su posición dentro de los siete módulos y un índice de secciones con enlaces a sus anclas; en pantallas amplias el índice permanece abierto y en móvil puede expandirse o contraerse. Los módulos 1 a 6 SHALL ofrecer además el acceso directo al glosario.

Las explicaciones y recursos visuales SHALL conservar su carácter divulgativo y las distinciones que presenta el propio contenido: las agrupaciones bibliométricas son pistas exploratorias, los esquemas ilustran escenarios o propuestas, y los prototipos o estudios citados no se presentarán como despliegues comerciales. Los estados de video y reflexión aún pendientes SHALL identificarse explícitamente como pendientes.

#### Scenario: Índice interno y progreso del módulo
- **WHEN** un visitante abre un módulo y sigue un elemento de su índice de secciones
- **THEN** la página muestra su posición entre siete módulos, lleva al visitante a la sección vinculada, mantiene el índice abierto en pantallas amplias y permite desplegarlo en móvil

#### Scenario: El primer módulo presenta ISAC y organiza el recorrido
- **WHEN** un visitante abre `/planeacion`
- **THEN** encuentra una introducción a la integración entre comunicación y sensado, sus capacidades, la pregunta guía, el directorio de los siete módulos y el alcance de aprendizaje ABET SO7, junto con su diagrama de contexto

#### Scenario: El módulo bibliométrico permite explorar la red
- **WHEN** un visitante abre `/analisis`
- **THEN** encuentra el proceso de búsqueda y depuración del equipo, el mapa VOSviewer con búsqueda de términos, filtro por clúster y detalle de ocurrencias y enlaces, y la advertencia de que las agrupaciones orientan la lectura pero no constituyen conclusiones por sí solas

#### Scenario: El estado del arte enlaza aplicaciones y fundamentos técnicos
- **WHEN** un visitante abre `/tendencias`
- **THEN** encuentra explicaciones de aplicaciones y tecnologías ISAC, integración de recursos, topologías de redes perceptivas, cooperación entre sensing y comunicación, procesamiento/Edge AI, evidencia industrial y desafíos, apoyadas por figuras, diagramas, ecuaciones y tablas

#### Scenario: La divulgación multimedia distingue el video pendiente
- **WHEN** un visitante abre `/divulgacion`
- **THEN** encuentra la síntesis de cinco ideas principales y un estado visible de video pendiente, sin que se presente un video como disponible

#### Scenario: La bitácora separa acuerdos de experiencias aún no registradas
- **WHEN** un visitante abre `/bitacora`
- **THEN** encuentra decisiones del proyecto, estrategias de aprendizaje y preguntas para reflexionar, con la experiencia, fechas y lecciones del equipo señaladas como pendientes de documentación

#### Scenario: El glosario ofrece consulta y referencias
- **WHEN** un visitante abre `/glosario`
- **THEN** puede buscar términos y abrir sus definiciones y ejemplos, incluidos los casos que muestran fórmulas, y encuentra la lista de lecturas de referencia

### Requirement: El mini-caso evalúa el trade-off OFDM-DFRC
El módulo mini-caso SHALL centrarse en la evaluación del trade-off de una forma de onda OFDM-DFRC (opción A de la guía de estructura) mediante un escenario monostático e ideal. SHALL explicar el eco a partir de retardo y Doppler, la resolución de rango dependiente del ancho de banda, la resolución de velocidad dependiente del tiempo de observación y el modelo teórico de reparto de potencia α entre comunicación y sensing, con sus ecuaciones y supuestos simplificadores.

El explorador interactivo SHALL permitir variar ancho de banda, cantidad de símbolos observados, distancia y velocidad radial del objetivo, y SHALL presentar resolución de distancia, resolución de velocidad, tiempo de observación, tasa bruta QPSK, retardo y Doppler del eco. El contenido SHALL identificar estas salidas como predicciones deterministas ideales y SHALL distinguirlas de la curva teórica de tasa y SNR frente a α, ruido, canal real y detección, que el propio módulo señala como etapas no incluidas en el explorador.

#### Scenario: Enfoque técnico del mini-caso
- **WHEN** un visitante abre `/mini-caso`
- **THEN** encuentra el escenario OFDM-DFRC monostático ideal, las relaciones de comunicación y sensing, el reparto teórico α y sus supuestos declarados

#### Scenario: Exploración de parámetros OFDM
- **WHEN** un visitante cambia el ancho de banda, los símbolos observados, la distancia o la velocidad radial en el explorador
- **THEN** se actualizan las métricas de resolución, tiempo de observación, tasa bruta QPSK y retardo/Doppler que corresponden al modelo ideal

#### Scenario: El explorador declara sus límites
- **WHEN** un visitante consulta la explicación del explorador
- **THEN** se informa que la interacción no muestra una curva frente a α ni simula ruido, canal real o detección de objetivos

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

Las ocho fichas colapsables existentes de clústeres en `/analisis` SHALL conservar apertura/cierre nativos, teclado y apertura múltiple independiente. Una ficha cerrada SHALL tener únicamente la altura necesaria para su summary y bordes, independiente del alto de otra ficha abierta en la misma fila; SHALL NOT estirarse para igualar al vecino ni reservar espacio vacío del cuerpo cerrado. Una ficha abierta SHALL mostrar su contenido completo sin clipping. Este ajuste SHALL conservar datos, textos y orden, sin añadir un acordeón de apertura exclusiva ni ocultar prosa en controles nuevos.

#### Scenario: Recurso ancho junto a texto de lectura
- **WHEN** se abre `/analisis` o `/mini-caso` en desktop
- **THEN** el mapa o explorador puede ocupar el ancho de exploración sin extender los párrafos a ese mismo ancho, y notas, tablas y fórmulas se distinguen sin clipping

#### Scenario: Unidad explicación y figura en la matriz responsive
- **WHEN** una unidad presentada en columnas se visualiza a 360, 768 o 1440 px de ancho con el navegador a zoom 100 %
- **THEN** explicación, figura, figcaption y fuente se apilan en orden lógico, sin ocultarse ni separarse en unidades decorativas duplicadas

#### Scenario: Fichas cerradas junto a clústeres abiertos
- **WHEN** se abren por teclado la primera y la octava ficha de `/analisis` en desktop de dos columnas y luego en layouts de 768 y 360 px
- **THEN** ambas permanecen abiertas con su contenido íntegro, las fichas cerradas conservan altura de summary y bordes sin estiramiento por sus vecinas, y al cerrar se recupera la altura propia sin cambiar las ocho fichas, sus textos o datos

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

El dataset, coordenadas, etiquetas, clústeres, pesos, métricas y resúmenes derivados SHALL permanecer iguales. Las relaciones que convierten ocurrencias en tamaños y fuerza en grosor, el realce de selección, la selección de hasta los 1.000 enlaces más fuertes y la lógica de filtrado SHALL conservarse. Esto SHALL preservar las transferencias originales, incluidos los tamaños base cero de enlaces fuera del conjunto global: seleccionar un término o clúster SHALL NOT convertir esos tamaños cero en grosores positivos ni ampliar la representación científica original. El rediseño SHALL mejorar contraste de etiquetas, conexiones y selección sin reinterpretar las métricas, cambiar la disposición de nodos ni añadir otra regla científica.

#### Scenario: Término seleccionado y reset
- **WHEN** se busca y selecciona el mismo término antes y después del rediseño y después se activa el restablecimiento
- **THEN** se obtienen el mismo término, métricas y conjunto de conexiones, el reset conserva su estado final y solo cambia la presentación y duración de movimiento conforme al contrato compartido

#### Scenario: Filtro y lectura en móvil
- **WHEN** se selecciona un clúster a 360 o 768 px de ancho
- **THEN** controles y leyenda siguen accesibles, el detalle se coloca debajo del plot cuando no cabe al lado y la selección se entiende por el detalle textual además del color

#### Scenario: Fidelidad cuantitativa
- **WHEN** se compara la red completa, un nodo seleccionado y un clúster con la representación científica original previa al rediseño
- **THEN** permanecen iguales coordenadas, pesos, conjuntos de enlaces representados, tamaños relativos y reglas de realce, incluidos los tamaños base cero que no se convierten en positivos por selección/filtro, así como las métricas y resúmenes bibliométricos

### Requirement: Explorador OFDM con parámetros y resultados diferenciados

El explorador SHALL separar visualmente parámetros, resultados y supuestos existentes, alinear números y unidades y agrupar las métricas sin añadir resultados. SHALL conservar valores predeterminados, formato numérico actual, fórmulas, cálculo y límites de controles: ancho de banda de 10 a 80 MHz con paso de 10; símbolos de 64 a 512 con paso de 64; distancia de 10 a 200 m con paso de 5; velocidad radial de −30 a 30 m/s con paso de 1. Su restablecimiento SHALL recuperar 20 MHz, 256 símbolos, 80 m y 15 m/s.

Los supuestos y advertencias actuales SHALL permanecer visibles, incluida la diferencia entre predicción ideal, tasa bruta QPSK y las etapas no implementadas. Los valores SHALL actualizarse directamente al resultado real, sin contadores animados con números intermedios ficticios.

#### Scenario: Valores predeterminados y restablecimiento
- **WHEN** se modifican los parámetros y se restablecen
- **THEN** se recuperan 20 MHz, 256 símbolos, 80 m y 15 m/s, con los mismos resultados y formato de la versión previa y los supuestos existentes disponibles

#### Scenario: Extremos de los controles
- **WHEN** se recorre cada mínimo, máximo y paso permitido antes y después del rediseño
- **THEN** límites, resultados numéricos, unidades y cálculo coinciden, los parámetros se distinguen de las métricas y no aparece una curva o simulación nueva
