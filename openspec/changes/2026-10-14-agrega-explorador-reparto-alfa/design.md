# Design

## Context

El mini-caso ya presenta las ecuaciones del reparto OFDM-DFRC y un primer explorador. La nueva interacción usa un modelo ideal determinista para hacer legible cómo α reparte potencia entre tasa de comunicación y SNR de radar. La apuesta es opcional y vive solo durante la sesión de la página; las salidas se presentan como predicciones, sin clasificación de detección ni recomendación de α.

## Goals / Non-Goals

**Goals:**

- Permitir predecir y comprobar el efecto de cambiar α en dos escenarios discretos y comprensibles.
- Mantener independientes la distancia del usuario y la selección de objeto.
- Hacer visibles tanto los datos fijados como las elecciones y los supuestos del modelo.
- Ofrecer operación con teclado, diseño responsive y carga diferida.

**Non-Goals:**

- Simular un canal, clutter, ruido aleatorio del sistema o detección de objetos.
- Determinar automáticamente si un objeto fue visto, recomendar un α o guardar la apuesta.
- Añadir sliders de distancia/tamaño sin límites para los escenarios.
- Cambiar otras secciones, el índice, las anclas, las baselines editoriales o la spec principal.

## Decisions

1. **Usar dos elecciones discretas e independientes.** El usuario elige cerca/lejos y el objeto peatón/auto. Estas alternativas hacen comparables los cambios entre escenarios y evitan que una curva dependa de una combinación arbitraria de sliders libres. Cada grupo usa radios nativos independientes.
2. **Fijar los parámetros reproducibles en una única constante del modelo.** Portadora, ancho de banda, potencia, ganancias y figura de ruido alimentan tanto las ecuaciones como la ficha visible, para evitar discrepancias editoriales.
3. **Usar un slider α entre 1 % y 99 %.** Excluir los extremos mantiene finitas las dos salidas mostradas. La curva cubre 1 % a 99 % y permite seleccionar un punto con teclado mediante el slider y con puntero táctil/ratón sobre la gráfica.
4. **Dibujar el eco como ilustración de SNR.** El ruido de fondo se deriva de una semilla fija, común a todos los escenarios y valores de α; el pico gaussiano cambia con la SNR calculada y usa la resolución c/(2B) como escala de anchura. No se interpreta el gráfico con umbral de detección.
5. **Separar la interacción pesada con carga diferida.** Un observador de intersección activa el componente con margen aproximado de 400 px, igual que los recursos diferidos existentes. Se reserva una altura mínima y se mantiene un fallback textual coherente.
6. **Conservar la apuesta solo en memoria.** Elegir una categoría no altera métricas hasta activar «Comprobar con el modelo», que fija α a 90 %. No se envían ni persisten respuestas.

## Risks / Trade-offs

- [Riesgo] La curva puede sugerir que existe una decisión universal → el pie explica que en la práctica se lee el punto que cumple requisitos y no declara un α óptimo.
- [Riesgo] El pico visual podría confundirse con una detección → rotular explícitamente como ilustración de SNR y declarar que no hay clutter ni detección real.
- [Riesgo] Las cifras de tasas de Shannon pueden interpretarse como rendimiento alcanzable → identificarlas como cota teórica no alcanzable en un sistema real y como predicciones deterministas ideales.
- [Riesgo] La carga diferida puede mover el contenido al aparecer → reservar altura para el bloque y conservar un fallback visible.
