## MODIFIED Requirements

### Requirement: El mini-caso evalúa el trade-off OFDM-DFRC
El módulo mini-caso SHALL centrarse en la evaluación del trade-off de una forma de onda OFDM-DFRC (opción A de la guía de estructura) mediante un escenario monostático e ideal. SHALL explicar el eco a partir de retardo y Doppler, la resolución de rango dependiente del ancho de banda, la resolución de velocidad dependiente del tiempo de observación y el modelo teórico de reparto de potencia α entre comunicación y sensing, con sus ecuaciones y supuestos simplificadores.

El explorador OFDM existente SHALL permitir variar ancho de banda, cantidad de símbolos observados, distancia y velocidad radial del objetivo, y SHALL presentar resolución de distancia, resolución de velocidad, tiempo de observación, tasa bruta QPSK, retardo y Doppler del eco. El contenido SHALL identificar estas salidas como predicciones deterministas ideales.

El explorador del reparto α SHALL presentarse después de «Cómo leer el explorador» y antes de la nota de límites. Antes del componente SHALL mostrar una frase de entrada que invite a predecir qué ocurre al transferir potencia entre eco y datos. SHALL ofrecer una apuesta opcional, en español, sobre el aumento de tasa al pasar α de 50 % a 90 %, con las categorías «Más de un 50 %», «Entre un 10 % y un 50 %» y «Menos de un 10 %». La apuesta SHALL ser local y no persistirse ni enviarse. Después de elegir, SHALL aparecer «Comprobar con el modelo»; al activarlo, α SHALL fijarse en 90 % y se SHALL mostrar la categoría elegida, el cambio porcentual de tasa y la caída de eco desde el valor de α = 50 %, calculados desde el modelo.

El componente SHALL ofrecer una perilla α nativa de 1 a 99 en pasos de 1, etiquetas «Todo para el radar» y «Todo para datos», valores de α, P_c y P_s, un objetivo táctil de al menos 44 px y `aria-valuetext` descriptivo. SHALL ofrecer dos grupos de radio independientes: «Tu usuario», con «Cerca (100 m)» y «Lejos (1,5 km)»; y «Lo que quieres ver», con «Peatón a 50 m» y «Auto a 200 m». Sus valores iniciales SHALL ser Cerca y Peatón, y cambiar uno SHALL NOT cambiar el otro.

El explorador SHALL mostrar una pantalla SVG de eco con distancia de 0 a 250 m y potencia recibida en dB sobre el nivel de ruido. SHALL calcular y dibujar `10·log10(P(x))` para `P(x) = n(x) + SNR_lineal·exp(−(x−R)²/(2s²))`, donde el ruido determinista `n(x)` tenga semilla fija, media 1 e idéntica forma para cualquier α y escenario; solo SHALL cambiar la amplitud del pico. El pico SHALL estar centrado en la distancia R del objeto y su anchura SHALL corresponder a la resolución c/(2B). La gráfica SHALL identificarse como ilustración de SNR y SHALL NOT afirmar detección, alcance máximo, codo u óptimo.

El medidor SHALL mostrar la tasa como porcentaje de la velocidad máxima posible (α = 1 equivale a 100 %) y una cota teórica de Shannon en Mbit/s, identificada como no alcanzable en un sistema real. La curva SHALL representar para el escenario actual el barrido de α = 0,01 a 0,99 en pasos de 0,01, con SNR de radar en dB en el eje x y tasa en Mbit/s en el eje y. El punto de α actual SHALL poder seleccionarse o arrastrarse sobre la curva y SHALL admitir teclado; el SVG SHALL tener `role="img"` y un `aria-label` dinámico. La curva SHALL incluir el texto de lectura práctica: «Así se elegiría α en la práctica: se calcula esta curva para la situación y se lee el punto que cumple los requisitos.» Una alternativa textual SHALL exponer una tabla de cinco puntos α = 0,1; 0,3; 0,5; 0,7; 0,9.

La ficha de datos SHALL permanecer visible como `dl.editorial-facts` y SHALL incluir los parámetros fijados, las selecciones del usuario y objeto, y los supuestos del modelo. Los parámetros de la ficha SHALL provenir de la misma constante de fuente única usada por el cálculo. La ficha SHALL incluir: portadora 5,9 GHz; ancho de banda 20 MHz; potencia total 1 W (30 dBm); antena del nodo 15 dBi; antena del dispositivo 3 dBi; figura de ruido 6 dB; distancia al usuario; distancia y tamaño σ del objeto; cota de Shannon; espacio libre con línea de vista; un objeto; ruido térmico; ausencia de clutter y detección real; y que el pico radar ilustra la SNR.

El contenido SHALL cerrar con tres preguntas sobre el reparto para un objeto pequeño y lejano frente a máxima velocidad, los cambios en la curva al alejar usuario u objeto, y la información que necesitaría el nodo para decidir α por sí mismo. Si corresponde, SHALL reutilizar la invitación existente `ForumInvitation` sin duplicarla.

Todos los resultados del nuevo explorador SHALL identificarse como predicciones deterministas ideales. El contenido SHALL NOT afirmar que un α sea óptimo ni que el modelo detecte objetos. La nota de límites SHALL indicar que ambos exploradores trabajan con relaciones ideales deterministas, que el ruido es un nivel térmico fijo y no una simulación, y que el ruido simulado, el canal real y la detección de objetivos son una etapa posterior del mini-caso.

#### Scenario: Enfoque técnico del mini-caso
- **WHEN** un visitante abre `/mini-caso`
- **THEN** encuentra el escenario OFDM-DFRC monostático ideal, las relaciones de comunicación y sensing, el reparto teórico α y sus supuestos declarados

#### Scenario: Exploración de parámetros OFDM
- **WHEN** un visitante cambia el ancho de banda, los símbolos observados, la distancia o la velocidad radial en el explorador
- **THEN** se actualizan las métricas de resolución, tiempo de observación, tasa bruta QPSK y retardo/Doppler que corresponden al modelo ideal

#### Scenario: Apuesta antes de explorar
- **WHEN** un visitante selecciona una categoría de apuesta antes de ajustar α
- **THEN** aparece el botón «Comprobar con el modelo» y, al activarlo, α pasa a 90 % y se presentan la categoría, el cambio de tasa y la caída del eco calculados para el escenario

#### Scenario: Cambio de escenario
- **WHEN** un visitante cambia por separado la distancia del usuario o el objeto
- **THEN** solo cambia la selección accionada y la curva, métricas y pico de eco se actualizan para el escenario resultante

#### Scenario: Ficha de datos
- **WHEN** un visitante consulta el explorador en cualquier ancho de pantalla
- **THEN** la ficha visible reúne parámetros fijados, selecciones y supuestos tomados de la constante compartida con el modelo

#### Scenario: Preguntas de cierre
- **WHEN** un visitante termina de explorar la curva y los escenarios
- **THEN** encuentra las tres preguntas de reflexión sobre prioridades, cambios de escenario y decisión autónoma del nodo

#### Scenario: Carga diferida
- **WHEN** el bloque del nuevo explorador aún no se aproxima al viewport
- **THEN** se conserva espacio reservado y texto de fallback; al aproximarse, el componente se carga con margen de intersección cercano a 400 px
