import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formula } from "@/components/Formula";
import { FORMULAS } from "@/lib/formulas";

const terms = [
  { term: "ISAC", name: "Integrated Sensing and Communications", definition: "Integra comunicación y percepción del entorno mediante recursos compartidos: espectro, infraestructura o señales. El grado de integración depende del diseño.", example: "Una estación base transmite datos y analiza ecos para localizar un vehículo." },
  { term: "JCS", name: "Joint Communication and Sensing", definition: "Denominación cercana a ISAC que destaca el diseño conjunto de las funciones de comunicación y sensing.", example: "Un receptor procesa información del enlace y parámetros del entorno." },
  { term: "DFRC", name: "Dual-Function Radar-Communication", definition: "Sistema que utiliza una forma de onda con funciones de radar y comunicación. Su diseño considera simultáneamente el transporte de datos y la estimación de parámetros del objetivo.", example: "La señal OFDM del mini-caso permite estudiar retardo y Doppler mientras transporta símbolos QPSK." },
  { term: "OFDM", name: "Orthogonal Frequency Division Multiplexing", definition: "Distribuye símbolos entre subportadoras ortogonales. En condiciones ideales, su separación Δf es el inverso de la duración útil Tu del símbolo.", equation: FORMULAS.subcarrierSpacing, example: "1024 subportadoras en 20 MHz dan Δf = 19,53125 kHz." },
  { term: "FMCW", name: "Frequency-Modulated Continuous Wave", definition: "Emite una onda continua cuya frecuencia varía durante un barrido. El retardo del eco genera una frecuencia de batido relacionada con la distancia; el movimiento también influye en ella.", example: "Un radar usa varios chirps para estimar distancia y velocidad. Es una alternativa a OFDM." },
  { term: "Clutter", name: "Ecos del entorno", definition: "Respuestas de elementos que no son el objetivo de interés. No es equivalente al ruido térmico: puede tener estructura espacial y temporal.", example: "Una pared produce un eco fuerte que puede ocultar a una persona." },
  { term: "OTFS", name: "Orthogonal Time Frequency Space", definition: "Ubica los símbolos de información en el dominio retardo-Doppler y los transforma para su transmisión. Se investiga, entre otros motivos, por su comportamiento en canales con movilidad.", example: "Un enlace con vehículos rápidos puede estudiarse en retardo-Doppler para representar los caminos de propagación." },
  { term: "MIMO", name: "Multiple-Input Multiple-Output", definition: "Emplea varias antenas transmisoras y receptoras para aprovechar la dimensión espacial. Puede aportar multiplexación, diversidad o información angular según el diseño.", example: "Un arreglo de antenas ayuda a distinguir la dirección de llegada de dos ecos." },
  { term: "Beamforming", name: "Conformación de haces", definition: "Ajusta amplitudes y fases de las señales de un arreglo para orientar la transmisión o recepción hacia determinadas direcciones.", example: "Un nodo concentra energía hacia un usuario y una región de interés para sensing." },
  { term: "mmWave", name: "Ondas milimétricas", definition: "En sentido físico, corresponde a frecuencias entre 30 y 300 GHz, con longitudes de onda de 10 a 1 mm. En comunicaciones, el término también se usa para bandas próximas, como 28 GHz.", equation: FORMULAS.wavelength, example: "A 60 GHz, la longitud de onda es aproximadamente 5 mm." },
  { term: "Sub-THz", name: "Bandas subterahercio", definition: "Denominación usada para bandas por debajo de 1 THz, frecuentemente en el entorno de 100–300 GHz. Sus límites varían entre publicaciones y deben declararse.", example: "Un estudio a 140 GHz puede analizar canales con gran ancho de banda." },
  { term: "Doppler", name: "Desplazamiento de frecuencia", definition: "Cambio de frecuencia asociado con el movimiento relativo. En el modelo monostático del blog depende de la velocidad radial v y de la portadora fc.", equation: FORMULAS.doppler, example: "A 5,9 GHz, un objetivo acercándose a 15 m/s produce unos 590,4 Hz." },
  { term: "Rango-Doppler", name: "Mapa de distancia y movimiento", definition: "Representación de la respuesta procesada según distancia y frecuencia Doppler. Un máximo puede corresponder a un objetivo; hace falta una regla de detección para declararlo.", example: "Un pico puede indicar un vehículo a 80 m con una velocidad radial determinada." },
  { term: "BER", name: "Bit Error Rate", definition: "Fracción de bits recibidos incorrectamente respecto al total transmitido. Es adimensional y debe acompañarse del canal, la modulación y la cantidad de bits evaluados.", equation: FORMULAS.ber, example: "10 errores en 100 000 bits dan una BER de 0,0001." },
  { term: "SNR", name: "Signal-to-Noise Ratio", definition: "Relación entre potencia de señal y ruido en un punto y ancho de banda definidos. Su valor en dB es una transformación logarítmica, no una unidad de potencia.", equation: FORMULAS.snr, example: "Una señal con diez veces la potencia del ruido tiene SNR = 10 dB." },
  { term: "Pd", name: "Probabilidad de detección", definition: "Probabilidad de declarar un objetivo cuando está presente. Depende del detector, del umbral y del modelo estadístico; se interpreta junto a la probabilidad de falsa alarma.", equation: FORMULAS.detectionProbability, example: "Detectar en 90 de 100 ensayos con objetivo da una estimación de 0,90." },
  { term: "CRLB", name: "Cramér-Rao Lower Bound", definition: "Cota inferior de la varianza de estimadores insesgados bajo condiciones de regularidad y un modelo estadístico especificado. No es el error medido de un algoritmo.", equation: FORMULAS.crlb, example: "La raíz de una cota de 0,04 m² es 0,2 m, una cota de desviación estándar." },
  { term: "NLOS", name: "Non-Line-of-Sight", definition: "Escenario sin una trayectoria directa despejada entre los puntos de interés. La señal puede llegar por reflexión o difracción, lo que complica la interpretación de retardos.", example: "Un edificio bloquea el trayecto directo hacia un vehículo." },
  { term: "V2X", name: "Vehicle-to-Everything", definition: "Intercambio de información entre vehículos y otros actores: infraestructura, peatones, redes u otros vehículos.", example: "Un vehículo comunica su velocidad a una intersección conectada." },
  { term: "UAV", name: "Unmanned Aerial Vehicle", definition: "Aeronave no tripulada. En ISAC puede ser un objetivo que se desea detectar o un nodo que participa en la comunicación y observación.", example: "Varios nodos observan el movimiento de un dron." },
  { term: "gNB", name: "Estación base de 5G NR", definition: "Nodo de acceso radio de 5G New Radio. Incorporar sensing exige funciones y capacidades específicas; no se supone que cualquier estación ya las tenga.", example: "Una arquitectura de investigación estudia aprovechar la infraestructura celular para observar ecos." },
  { term: "TSN", name: "Time-Sensitive Networking", definition: "Familia de mecanismos IEEE 802.1 para sincronización y transporte con comportamiento temporal controlado en redes Ethernet.", example: "Una línea industrial necesita mensajes de control con latencia acotada." },
  { term: "AGV", name: "Automated Guided Vehicle", definition: "Vehículo guiado automáticamente para tareas como transporte interno de materiales. Conectividad y localización son funciones importantes para su coordinación.", example: "Un vehículo recorre una planta mientras intercambia órdenes con el sistema de control." },
  { term: "3GPP", name: "3rd Generation Partnership Project", definition: "Colaboración de organizaciones que desarrolla especificaciones para telecomunicaciones móviles. Sus informes de estudio exploran requisitos y escenarios.", example: "TR 22.837 estudia casos de uso de comunicación y sensing integrados." },
  { term: "IEEE 802.11bf", name: "WLAN sensing", definition: "Trabajo de estandarización de la familia IEEE 802.11 relacionado con sensing mediante redes inalámbricas de área local.", example: "Estudiar cambios del canal Wi-Fi para obtener información del entorno." },
];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");

export function Glossary() {
  const [query, setQuery] = useState("");
  const matches = terms.filter(({ term, name, definition }) => normalize(`${term} ${name} ${definition}`).includes(normalize(query.trim())));
  return (
    <div className="glossary">
      <div className="flex flex-col gap-3">
        <Label htmlFor="glossary-search">Buscar un concepto o una sigla</Label>
        <Input id="glossary-search" type="search" className="min-h-11" value={query}
          placeholder="Por ejemplo: OFDM, Doppler o distancia" onChange={(event) => setQuery(event.target.value)} />
        <p className="editorial-caption" role="status">{matches.length} de {terms.length} conceptos. Abre un término para ver su definición y ejemplo.</p>
      </div>
      <div className="glossary-list">
        {matches.map(({ term, name, definition, equation, example }) => (
          <details key={term}>
            <summary><strong>{term}</strong><span>{name}</span></summary>
            <div className="glossary-definition">
              <p>{definition}</p>
              {equation ? <p className="equation" tabIndex={0}><Formula tex={equation} display /></p> : null}
              <p><strong>Ejemplo.</strong> {example}</p>
            </div>
          </details>
        ))}
      </div>
      {matches.length === 0 ? <p>No encontramos ese término. Prueba con su sigla o una palabra más general.</p> : null}
    </div>
  );
}
