# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Navegación secuencial de los siete módulos
El sistema SHALL exponer siete rutas editoriales en orden fijo: `/planeacion`, `/analisis`, `/tendencias`, `/mini-caso`, `/divulgacion`, `/bitacora` y `/glosario`. Los enlaces de módulo anterior y siguiente SHALL recorrer únicamente ese conjunto. Como no existe un módulo editorial siguiente a `/glosario`, la paginación SHALL mostrar en la posición visual del módulo siguiente el enlace «A continuación» / «Retroalimentación — sección independiente» hacia `/retroalimentacion`; el cuerpo de `/glosario` SHALL ofrecer además el CTA «Compartir en el foro» hacia la misma ruta. Estos enlaces SHALL mantener al foro como sección independiente y no SHALL crear un octavo módulo.

#### Scenario: Recorrido completo
- **WHEN** un visitante avanza con el enlace siguiente desde `/planeacion`
- **THEN** recorre los siete módulos en orden y termina en `/glosario`

#### Scenario: El foro queda fuera del recorrido
- **WHEN** el visitante llega a `/glosario`
- **THEN** no existe un siguiente módulo editorial, la navegación anterior vuelve a `/bitacora`, la posición visual del siguiente en la paginación enlaza a `/retroalimentacion` con la etiqueta «A continuación» / «Retroalimentación — sección independiente» y el CTA del cuerpo «Compartir en el foro» enlaza a la misma ruta, sin convertirla en módulo ocho

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

## REMOVED Requirements

### Requirement: Contenido reservado hasta aprobación
Cada módulo SHALL mantener layout, navegación, estados y espacios reservados. El contenido editorial SHALL incorporarse solo a partir de texto aprobado.

#### Scenario: Módulo sin contenido aprobado
- **WHEN** un módulo carece de texto aprobado
- **THEN** la página muestra su estructura con espacios reservados, sin contenido editorial inventado

**Reason**: El código actual contiene contenido editorial, mapas, diagramas, fórmulas, referencias e interacciones para los siete módulos; mantener este requisito afirmaría que las páginas están vacías y contradiría el comportamiento visible.

**Migration**: Usar `Contenido editorial y recursos implementados en los siete módulos` para describir la estructura actual y conservar los estados pendientes de video y experiencia grupal. No se requiere migración de rutas ni de contenido de la aplicación.
