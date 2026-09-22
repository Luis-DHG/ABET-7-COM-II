import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Radio, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditorialNote as Note, ForumInvitation } from "@/components/EditorialExtras";
import { SignalDiagram } from "@/components/SignalDiagram";
import { OfdmExplorer } from "@/components/OfdmExplorer";
import { Formula } from "@/components/Formula";
import { LazyGlossary } from "@/components/LazyGlossary";
import { MODULES } from "@/lib/manifest";
import { FORMULAS } from "@/lib/formulas";

export interface EditorialModule {
  headline: string;
  introduction: string;
  status?: string;
  sections: { id: string; title: string; content: ReactNode }[];
}

export const MODULE_CONTENT: Record<number, EditorialModule> = {
  1: {
    headline: "Comunicar también puede ser percibir.",
    introduction: "Una introducción a Integrated Sensing and Communications: señales que transportan datos y ayudan a comprender el entorno. Un recorrido para estudiantes de ingeniería, desde la idea hasta sus métricas.",
    sections: [
      { id: "que-es-isac", title: "Una señal, dos funciones", content: <>
        <p>Las redes inalámbricas transportan información. Los radares observan objetos a través de sus ecos. <strong>ISAC estudia cómo integrar ambas capacidades</strong>, compartiendo espectro, infraestructura y, en determinados diseños, la misma forma de onda.</p>
        <p>Una señal puede llevar datos a un usuario y reflejarse en un objeto. El retardo del eco aporta información de distancia; sus cambios de frecuencia ayudan a estimar movimiento. La integración abre una pregunta de ingeniería: ¿cómo diseñar recursos que sirvan a ambas tareas?</p>
        <SignalDiagram />
        <div className="concept-pair">
          <div><h3>Comunicar</h3><p>Recuperar los datos que enviamos.</p><span>Bits · tasa de datos · BER</span></div>
          <div><h3>Percibir</h3><p>Extraer información del entorno.</p><span>Distancia · velocidad · detección</span></div>
        </div>
      </> },
      { id: "pregunta-guia", title: "La pregunta que nos guía", content: <>
        <blockquote>¿Qué es ISAC, para qué puede utilizarse y por qué es relevante para la evolución de las redes inalámbricas?</blockquote>
        <p>Queremos divulgar sus fundamentos con explicaciones, ejemplos y métricas que conecten con la formación en ingeniería. Al terminar, podrás reconocer literatura clave, conceptos y líneas de investigación, y compartir tus preguntas en el foro.</p>
        <ul><li>Entender qué comparten comunicación y sensing.</li><li>Interpretar OFDM, DFRC, BER, retardo y Doppler.</li><li>Relacionar la tecnología con aplicaciones concretas.</li><li>Leer un modelo técnico reconociendo sus supuestos.</li></ul>
      </> },
      { id: "recorrido", title: "Un recorrido en siete módulos", content: <>
        <p>Lee en orden o entra al tema que te interese. El glosario está disponible como apoyo durante todo el recorrido.</p>
        <ol className="module-directory">{MODULES.map((module) => <li key={module.path}><Link to={module.path} aria-current={module.number === 1 ? "page" : undefined}><span>{String(module.number).padStart(2, "0")}</span><div><strong>{module.title}</strong><p>{module.scope}</p></div><ArrowUpRight aria-hidden /></Link></li>)}</ol>
      </> },
      { id: "alcance", title: "Hasta dónde llegamos", content: <>
        <p>Ofrecemos una introducción general con un hilo técnico: la forma de onda OFDM-DFRC. Exploramos varias aplicaciones sin pretender una formación exhaustiva ni diseñar una red comercial. Bibliometría y video se completarán cuando existan sus materiales.</p>
        <h3>Aprender a aprender</h3><p>Relacionamos este trabajo con ABET SO7: adquirir y aplicar nuevos conocimientos mediante estrategias de aprendizaje apropiadas. Buscar literatura, interpretar un modelo y explicar sus supuestos son parte del proceso que documentaremos.</p>
        <p className="editorial-caption">Universidad Industrial de Santander (UIS).</p>
        <details className="editorial-details"><summary>Declaración de divulgación pública</summary><p>La presente Divulgación Pública de la Ciencia, a través del siguiente desarrollo web, tiene una ruta de circulación nacional sin enfoque diferencial y está dirigida a la comunidad o público objetivo conformado por jóvenes, adultos, empresarios y/o empresas, en género literario informativo de tipo blog, con componente digital a través de soporte web.</p></details>
      </> },
    ],
  },
  2: {
    headline: "Leer la investigación antes de dibujar sus tendencias.",
    introduction: "La bibliometría nos ayuda a ordenar un campo amplio. Aquí explicamos cómo relacionar palabras clave, publicaciones y preguntas de ingeniería.",
    status: "Búsqueda bibliométrica pendiente",
    sections: [
      { id: "metodo", title: "De la búsqueda a la interpretación", content: <>
        <p>ISAC conecta comunicaciones, radar, antenas y procesamiento de señales. Un mapa bibliométrico puede mostrar qué términos aparecen juntos y orientar la lectura de artículos; la interpretación requiere volver a los documentos.</p>
        <ol className="editorial-steps"><li><h3>Buscar</h3><p>Definir una consulta reproducible en Scopus e IEEE Xplore.</p></li><li><h3>Organizar</h3><p>Registrar términos, parámetros y criterios del análisis antes de crear el mapa.</p></li><li><h3>Interpretar</h3><p>Leer las publicaciones asociadas para explicar las relaciones encontradas.</p></li></ol>
      </> },
      { id: "estado-busqueda", title: "Qué está definido", content: <>
        <Note title="Todavía no hay resultados bibliométricos">Las cadenas, fechas, filtros y archivos de búsqueda están por definir. Publicaremos el mapa y sus conclusiones cuando el análisis sea reproducible.</Note>
        <dl className="editorial-facts"><div><dt>Bases previstas</dt><dd>Scopus e IEEE Xplore</dd></div><div><dt>Cadena y fecha de búsqueda</dt><dd>Por definir</dd></div><div><dt>Periodo y filtros</dt><dd>Por definir</dd></div><div><dt>VOSviewer y parámetros</dt><dd>Versión y configuración por definir</dd></div><div><dt>Mapa y hallazgos</dt><dd>Pendientes del análisis</dd></div></dl>
      </> },
      { id: "clusters", title: "Cómo leer un cluster", content: <>
        <p>En una red de coocurrencia, los nodos representan términos y los enlaces expresan que aparecen juntos en los documentos. Un cluster agrupa términos según sus conexiones y el algoritmo utilizado.</p>
        <div className="example-block"><h3>Un ejemplo conceptual</h3><p>Si OFDM, Doppler y estimación de distancia aparecen relacionados, podríamos explorar una línea de procesamiento de señales. Es una pregunta de lectura, no un resultado de nuestra búsqueda.</p></div>
        <p>El color de un cluster no demuestra importancia científica, y la proximidad visual no prueba causalidad. Hay que revisar artículos, parámetros y cobertura de la base consultada.</p>
        <details className="editorial-details"><summary>¿Qué significa “ZamoraCluster” en la guía?</summary><p>La guía menciona este nombre sin definir su procedimiento. Su significado académico está pendiente de aclaración. Por ahora explicamos el análisis de clusters en términos generales, sin atribuirle un teorema o resultados.</p></details>
      </> },
    ],
  },
  3: {
    headline: "Del eco a la información útil.",
    introduction: "Exploramos las formas de onda de doble propósito, las arquitecturas de sensing y cuatro escenarios que ayudan a entender por qué se investiga ISAC.",
    sections: [
      { id: "dfrc", title: "OFDM-DFRC: compartir la forma de onda", content: <>
        <p><strong>DFRC</strong> significa Dual-Function Radar-Communication. Su objetivo es que una forma de onda transporte información y permita obtener observaciones del entorno. En OFDM, los datos se distribuyen entre subportadoras ortogonales.</p>
        <p>El eco modifica la fase a través de las subportadoras y los símbolos: esas variaciones contienen información de retardo y Doppler. Conocer la señal transmitida ayuda a separar su contenido de datos de la respuesta del objetivo.</p>
        <div className="equation" tabIndex={0}><Formula tex={FORMULAS.subcarrierSpacing} display /><small>Separación de subportadoras [Hz] y duración útil del símbolo [s].</small></div>
        <p>El diseño exige observar varias métricas a la vez. Una mayor tasa de datos no garantiza una mayor precisión de sensing, y mejorar una resolución puede modificar el tiempo de observación necesario.</p>
      </> },
      { id: "arquitecturas", title: "Dónde transmitimos y dónde escuchamos", content: <>
        <SignalDiagram />
        <dl className="editorial-facts"><div><dt>Monostática</dt><dd>Transmisor y receptor de sensing están en el mismo nodo. El eco recorre ida y vuelta.</dd></div><div><dt>Biestática</dt><dd>Transmisor y receptor están separados. La medida depende de ambas posiciones y de la sincronización.</dd></div><div><dt>Multiestática</dt><dd>Varios nodos aportan observaciones desde geometrías diferentes.</dd></div></dl>
      </> },
      { id: "tendencias", title: "Qué se busca mejorar", content: <>
        <p>Estas líneas de investigación orientan nuestro mini-caso; no constituyen un ranking bibliométrico.</p>
        <div className="editorial-table-wrap" role="region" aria-label="Tendencias OFDM-DFRC" tabIndex={0}><table><caption>Preguntas de diseño y métricas relacionadas</caption><thead><tr><th scope="col">Línea</th><th scope="col">Pregunta de ingeniería</th><th scope="col">Qué observar</th></tr></thead><tbody>
          <tr><th scope="row">Forma de onda</th><td>¿Cómo sirve la señal a ambas funciones?</td><td>BER y resolución</td></tr>
          <tr><th scope="row">Recursos</th><td>¿Cómo distribuir banda, potencia y tiempo?</td><td>Tasa y precisión</td></tr>
          <tr><th scope="row">MIMO y haces</th><td>¿Hacia dónde dirigir la energía?</td><td>Cobertura y ángulo</td></tr>
          <tr><th scope="row">Procesamiento</th><td>¿Cómo extraer parámetros del eco?</td><td>Distancia y Doppler</td></tr>
        </tbody></table></div>
        <p>El vínculo con redes futuras consiste en explorar cómo añadir percepción a la infraestructura de conectividad. El <Link to="/glosario#referencias">informe 3GPP TR 22.837</Link> ofrece escenarios de estudio.</p>
      </> },
      { id: "aplicaciones", title: "Cuatro formas de imaginar su uso", content: <>
        <div className="application-grid">
          <div><Radio aria-hidden /><h3>Transporte y V2X</h3><p>Combinar intercambio de datos entre vehículos e infraestructura con observación de obstáculos. La geometría y la propagación determinan qué puede percibirse.</p><span>Pregunta: ¿qué ocurre detrás de una obstrucción?</span></div>
          <div><Radio aria-hidden /><h3>Drones y espacio aéreo</h3><p>Estudiar detección y seguimiento de trayectorias mediante nodos distribuidos. Distinguir un dron de otros ecos es parte del problema.</p><span>Pregunta: ¿cómo seguir un objetivo en movimiento?</span></div>
          <div><Radio aria-hidden /><h3>Salud e interiores</h3><p>Explorar movimiento, respiración o caídas a través de cambios del canal. Son usos de investigación que requieren validación para aplicaciones clínicas.</p><span>Pregunta: ¿qué cambios del entorno son observables?</span></div>
          <div><Radio aria-hidden /><h3>Industria conectada</h3><p>Relacionar conectividad y localización de vehículos guiados automáticamente con la coordinación de procesos industriales.</p><span>Pregunta: ¿cómo unir posición y comunicación oportuna?</span></div>
        </div>
        <p className="editorial-caption">Escenarios ilustrativos; no describen despliegues realizados por el grupo.</p>
      </> },
    ],
  },
  4: {
    headline: "Una forma de onda. Varios compromisos.",
    introduction: "Modifica un escenario OFDM-DFRC y observa la relación entre ancho de banda, resolución y tiempo. Una primera exploración analítica para entender qué medir en una simulación.",
    status: "Modelo hipotético ideal",
    sections: [
      { id: "escenario", title: "Un nodo, un usuario y un objetivo", content: <>
        <p>Proponemos un nodo monostático a 5,9 GHz que transmite OFDM con QPSK hacia un usuario y recibe el eco de un objetivo. Fijamos 1024 subportadoras activas y un prefijo cíclico del 25 % de la duración útil.</p>
        <p>El explorador calcula relaciones ideales. La tasa supone todas las subportadoras cargadas con datos, sin pilotos, codificación ni retransmisiones. No modela pérdidas de propagación, ruido, clutter o interferencia entre subportadoras.</p>
      </> },
      { id: "explorador", title: "Explora los parámetros", content: <>
        <OfdmExplorer />
        <div className="example-block"><h3>Prueba este compromiso</h3><p>Duplica el ancho de banda manteniendo el número de símbolos. Mejora la resolución de distancia y aumenta la tasa bruta, pero se acorta la observación y empeora la resolución de velocidad. Después duplica los símbolos para recuperar tiempo de observación.</p></div>
      </> },
      { id: "ecuaciones", title: "Las relaciones detrás del resultado", content: <>
        <div className="equation" tabIndex={0}><Formula tex={FORMULAS.rangeResolution} display /><small>Resolución ideal de distancia [m]. B es el ancho de banda [Hz].</small></div>
        <div className="equation" tabIndex={0}><Formula tex={FORMULAS.velocityResolution} display /><small>Resolución de velocidad [m/s]. M símbolos observados de duración Tsym, incluido el prefijo.</small></div>
        <div className="equation" tabIndex={0}><Formula tex={FORMULAS.delayAndDoppler} display /><small>Retardo [s] y Doppler [Hz] para la geometría monostática.</small></div>
        <p>Usamos <Formula tex={FORMULAS.speedOfLight} />, <Formula tex={FORMULAS.bandwidthSpacing} /> y <Formula tex={FORMULAS.symbolDuration} />. La tasa bruta QPSK es <Formula tex={FORMULAS.qpskRate} />. Los controles mantienen el objetivo dentro del retardo admitido por el prefijo y del intervalo Doppler no ambiguo.</p>
        <h3>Cómo se construiría el mapa Rango-Doppler</h3><p>En el modelo de baja variación durante cada símbolo, el eco normalizado tiene una fase que depende del índice de subportadora k y del índice de símbolo m.</p>
        <div className="equation" tabIndex={0}><Formula tex={FORMULAS.echoResponse} display /><small>Respuesta ideal de un objetivo después de compensar los símbolos transmitidos.</small></div>
        <p>Con esta convención, aplicamos una IFFT sobre las subportadoras para obtener retardo y una FFT sobre los símbolos para obtener Doppler. El valor absoluto al cuadrado produce el mapa. La distancia y la velocidad se obtienen convirtiendo los ejes a unidades físicas.</p>
      </> },
      { id: "validacion", title: "De la predicción a la simulación", content: <>
        <p>La siguiente etapa incorporará un canal, ruido y procesamiento de recepción. Entonces podremos evaluar estas métricas con ensayos reproducibles:</p>
        <dl className="editorial-facts"><div><dt>BER frente a SNR</dt><dd>Comparar bits transmitidos y recuperados, especificando modulación y canal.</dd></div><div><dt>Probabilidad de detección</dt><dd>Definir detector y umbral, controlar falsas alarmas y repetir ensayos.</dd></div><div><dt>Error y CRLB</dt><dd>Comparar estimaciones con una cota derivada bajo el mismo modelo estadístico.</dd></div></dl>
        <Note title="Alcance de esta primera versión">Los valores del explorador son cálculos analíticos. BER, probabilidad de detección, CRLB y mapas con ruido quedan pendientes de una simulación validada.</Note>
      </> },
    ],
  },
  5: {
    headline: "ISAC, contado paso a paso.",
    introduction: "Una síntesis para conectar la idea de una señal compartida con el mini-caso de ingeniería. Este será el recorrido de nuestra pieza de divulgación.",
    status: "Video por definir",
    sections: [
      { id: "video", title: "Una explicación para ver y escuchar", content: <>
        <div className="video-pending"><Video aria-hidden /><Badge variant="secondary">Video pendiente</Badge><h3>De la señal al entorno</h3><p>Estamos definiendo el material audiovisual. Mientras tanto, puedes recorrer las ideas principales en este resumen.</p><Link to="/mini-caso">Explorar el mini-caso</Link></div>
      </> },
      { id: "resumen", title: "Cinco ideas para llevar contigo", content: <>
        <ol className="editorial-steps"><li><h3>Una infraestructura compartida</h3><p>ISAC integra el transporte de datos y la percepción del entorno.</p></li><li><h3>Una forma de onda con doble propósito</h3><p>DFRC conecta comunicación y radar. OFDM ofrece una estructura de subportadoras y símbolos para estudiarlo.</p></li><li><h3>El eco contiene información</h3><p>Retardo y Doppler ayudan a describir la distancia y el movimiento de un objetivo.</p></li><li><h3>Una métrica no cuenta toda la historia</h3><p>BER, detección y resolución responden a preguntas distintas. El diseño necesita considerarlas juntas.</p></li><li><h3>Las aplicaciones dan sentido al modelo</h3><p>Transporte, drones, interiores e industria permiten plantear escenarios concretos de investigación.</p></li></ol>
      </> },
      { id: "lectura-complementaria", title: "Continúa el recorrido", content: <>
        <p>Cuando el video esté definido, este espacio incluirá su transcripción, subtítulos y créditos. Por ahora, las explicaciones escritas permanecen disponibles para consultar a tu ritmo.</p><ForumInvitation />
      </> },
    ],
  },
  6: {
    headline: "También observamos cómo aprendemos.",
    introduction: "Una bitácora grupal para conectar decisiones, estrategias y evidencias. Partimos del alcance acordado y dejamos espacio para documentar la experiencia real del equipo.",
    status: "Reflexión grupal en construcción",
    sections: [
      { id: "decisiones", title: "Nuestro punto de partida", content: <>
        <p>Elegimos explicar ISAC para estudiantes de ingeniería, combinando lenguaje divulgativo con conceptos y métricas. Organizamos el recorrido en siete módulos y seleccionamos OFDM-DFRC como hilo técnico.</p>
        <ol className="editorial-steps"><li><h3>Delimitar la pregunta</h3><p>Qué es ISAC, para qué sirve y por qué se investiga.</p><Badge variant="secondary">Acordado</Badge></li><li><h3>Elegir un caso técnico</h3><p>Evaluar relaciones entre comunicación y sensing con una forma de onda OFDM-DFRC.</p><Badge variant="secondary">Acordado</Badge></li><li><h3>Construir la evidencia</h3><p>Documentar la búsqueda bibliográfica y validar una simulación reproducible.</p><Badge variant="outline">Pendiente</Badge></li><li><h3>Explicar y reflexionar</h3><p>Completar el video y registrar aprendizajes a partir del trabajo y de la retroalimentación.</p><Badge variant="outline">Pendiente</Badge></li></ol>
        <p className="editorial-caption">Este recorrido muestra el estado del proyecto. Las fechas y las experiencias del grupo aún no están documentadas.</p>
      </> },
      { id: "estrategias", title: "Estrategias que vamos a aplicar", content: <>
        <ul><li>Dividir el tema en preguntas concretas antes de buscar información.</li><li>Comparar definiciones y conservar la relación con su fuente.</li><li>Acompañar las ecuaciones con variables, unidades y supuestos.</li><li>Relacionar cada métrica con una decisión de ingeniería.</li><li>Revisar las explicaciones desde la perspectiva de alguien que se acerca al tema por primera vez.</li></ul>
        <h3>Aprendizaje autónomo y SO7</h3><p>Identificar qué desconocemos, buscar fuentes pertinentes y aplicar lo aprendido en un modelo nos permite practicar el aprendizaje autónomo. La reflexión final debe apoyarse en decisiones y evidencias del equipo.</p>
      </> },
      { id: "reflexion", title: "Preguntas para nuestra bitácora", content: <>
        <div className="reflection-prompts"><blockquote>¿Qué supuesto tuvimos que cambiar al contrastarlo con una fuente?</blockquote><blockquote>¿Qué resultado no esperábamos y cómo comprobamos su causa?</blockquote><blockquote>¿Qué explicación mejoró después de recibir retroalimentación?</blockquote></div>
        <p>Vigilaremos tres confusiones: asumir que integrar siempre mejora todo, interpretar un cluster como prueba suficiente y presentar una predicción ideal como medición. Las respuestas se completarán con hechos del trabajo grupal.</p>
        <Note title="Reflexiones por documentar">Las lecciones aprendidas, los errores y las fechas se incorporarán cuando el grupo aporte su experiencia. Las preguntas anteriores son una guía para registrarla.</Note>
      </> },
    ],
  },
  7: {
    headline: "Un vocabulario para seguir la señal.",
    introduction: "Consulta las siglas, sus unidades y un ejemplo concreto. Al final encontrarás las lecturas iniciales que acompañan el proyecto.",
    sections: [
      { id: "conceptos", title: "Glosario esencial", content: <LazyGlossary /> },
      { id: "referencias", title: "Lecturas de referencia", content: <>
        <p>Conservamos las cuatro entradas de la guía. Las fichas sin identificación bibliográfica confirmada se muestran como pendientes.</p>
        <ol className="reference-list">
          <li><span>[1]</span><div><h3>Integrated Sensing and Communications: Toward Dual-Functional Wireless Networks for 6G</h3><p>F. Liu, C. Masouros, A. Li, H. Sun y L. Hanzo.</p><p className="editorial-caption">Ficha de la guía pendiente de verificar: título y autores no coinciden con el artículo de título similar “...for 6G and Beyond”. DOI por confirmar.</p></div></li>
          <li><span>[2]</span><div><h3>Overview of Integrated Sensing and Communications (ISAC)</h3><p>A. Zhang, M. L. Rahman, X. Huang, Y. J. Guo, S. Chen y R. W. Heath.</p><p className="editorial-caption">Ficha y DOI pendientes de verificación bibliográfica.</p></div></li>
          <li><span>[3]</span><div><h3>Study on Integrated Sensing and Communication</h3><p>3GPP · TR 22.837.</p><a href="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=4044">Consultar el informe en 3GPP</a><p className="editorial-caption">Informe identificado por su número técnico. DOI no disponible en la ficha consultada.</p></div></li>
          <li><span>[4]</span><div><h3>An Overview of Signal Processing Techniques for Joint Communication and Radar Sensing</h3><p>J. A. Zhang, F. Liu, C. Masouros, R. W. Heath, Z. Feng, L. Zheng y A. Petropulu.</p><a href="https://doi.org/10.1109/JSTSP.2021.3113120">DOI: 10.1109/JSTSP.2021.3113120</a></div></li>
        </ol>
      </> },
      { id: "conversacion", title: "Conversemos sobre lo aprendido", content: <ForumInvitation /> },
    ],
  },
};
