import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Radio, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditorialNote as Note, ForumInvitation } from "@/components/EditorialExtras";
import { SignalDiagram } from "@/components/SignalDiagram";
import { ODDMDiagram } from "@/components/ODDMDiagram";
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

    introduction: "Una introducción a Integrated Sensing and Communications (ISAC): una tecnología que integra comunicación inalámbrica y percepción del entorno mediante señales capaces de transportar información y obtener características físicas. Un recorrido para estudiantes de ingeniería desde el concepto fundamental hasta los desafíos actuales de esta tecnología.", 

    sections: [ 

      { id: "que-es-isac", title: "Una señal, dos funciones", content: <> 

        <p>
        Las redes inalámbricas tradicionalmente transportan información,
        mientras que los sistemas de sensado utilizan señales para obtener
        información del entorno. <strong>ISAC estudia cómo integrar ambas capacidades</strong>,
        compartiendo recursos como espectro, infraestructura y, en determinados
        diseños, la misma forma de onda.
        </p> 

        <p>
        Una señal puede llevar datos a un usuario y al mismo tiempo interactuar
        con objetos del entorno. El retardo del eco aporta información de
        distancia; los cambios de frecuencia permiten estimar movimiento mediante
        el efecto Doppler. Esta integración plantea una pregunta de ingeniería:
        ¿cómo diseñar señales capaces de comunicar y percibir simultáneamente?
        </p> 

        <SignalDiagram /> 

        <div className="concept-pair"> 

          <div><h3>Comunicar</h3><p>Transmitir y recuperar información entre dispositivos.</p><span>Bits · tasa de datos · BER · calidad del enlace</span></div> 

          <div><h3>Percibir</h3><p>Obtener información del entorno mediante señales inalámbricas.</p><span>Distancia · velocidad · detección · Doppler</span></div> 

        </div> 

      </> }, 


      { id: "pregunta-guia", title: "La pregunta que nos guía", content: <> 

        <blockquote>
        ¿Cómo puede una misma señal transmitir información y al mismo tiempo
        permitir percibir el entorno en los sistemas inalámbricos del futuro?
        </blockquote> 

        <p>
        Queremos divulgar los fundamentos de ISAC mediante explicaciones,
        ejemplos y métricas que conecten la comunicación inalámbrica, el
        procesamiento de señales y sus aplicaciones en ingeniería. Al terminar,
        podrás reconocer los conceptos principales, tecnologías relacionadas y
        líneas actuales de investigación.
        </p> 

        <ul>
        <li>Entender la integración entre comunicación y sensing.</li>
        <li>Reconocer el papel de OFDM, DFRC y las formas de onda ISAC.</li>
        <li>Relacionar la tecnología con aplicaciones futuras.</li>
        <li>Comprender los desafíos del diseño de señales duales.</li>
        </ul> 

      </> }, 


      { id: "recorrido", title: "Un recorrido en siete módulos", content: <> 

        <p>
        Explora el concepto de ISAC desde sus fundamentos hasta sus aplicaciones.
        El recorrido inicia con la integración entre comunicación y sensado,
        continúa con las tecnologías utilizadas y finaliza con sus escenarios
        de aplicación e impacto futuro.
        </p> 

        <ol className="module-directory">{MODULES.map((module) => <li key={module.path}><Link to={module.path} aria-current={module.number === 1 ? "page" : undefined}><span>{String(module.number).padStart(2, "0")}</span><div><strong>{module.title}</strong><p>{module.scope}</p></div><ArrowUpRight aria-hidden /></Link></li>)}</ol> 

      </> }, 


      { id: "alcance", title: "Hasta dónde llegamos", content: <> 

        <p>
        Presentamos una introducción a Integrated Sensing and Communications
        desde la perspectiva de las formas de onda y el procesamiento de señales.
        Exploramos sus principios, tecnologías asociadas y aplicaciones sin
        pretender desarrollar un sistema comercial completo.
        </p> 

        <h3>Aprender a aprender</h3>

        <p>
        Relacionamos este trabajo con ABET SO7: adquirir y aplicar nuevos
        conocimientos mediante estrategias de aprendizaje apropiadas. Revisar
        literatura científica, interpretar modelos técnicos y comprender sus
        supuestos forman parte del proceso de aprendizaje en ingeniería.
        </p> 

        <p className="editorial-caption">Universidad Industrial de Santander (UIS).</p> 

        <details className="editorial-details">
        <summary>Declaración de divulgación pública</summary>
        <p>
        La presente Divulgación Pública de la Ciencia tiene como propósito
        acercar conceptos relacionados con Integrated Sensing and Communications
        a estudiantes y público interesado en tecnologías inalámbricas
        emergentes mediante un formato digital educativo.
        </p>
        </details> 

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
    introduction: "Exploramos las tecnologías que permiten integrar comunicación y sensado en una misma señal, desde las formas de onda OFDM-DFRC hasta los nuevos esquemas basados en el dominio retardo-Doppler para sistemas ISAC.",

    sections: [

      { id: "dfrc", title: "OFDM-DFRC: compartir la forma de onda", content: <>

        <p>
        <strong>DFRC</strong> significa Dual-Function Radar-Communication.
        Esta tecnología busca que una misma forma de onda pueda transmitir
        información y, al mismo tiempo, obtener características del entorno.
        En sistemas OFDM, los datos se distribuyen mediante subportadoras
        ortogonales que permiten estudiar simultáneamente comunicación y
        sensado.
        </p>

        <p>
        La señal reflejada por un objetivo contiene información asociada al
        retardo y al desplazamiento Doppler. Analizando estas variaciones es
        posible estimar parámetros como distancia y velocidad, mientras se
        mantiene el objetivo principal de transmitir información.
        </p>

        <div className="equation" tabIndex={0}>
          <Formula tex={FORMULAS.subcarrierSpacing} display />
          <small>
          Separación de subportadoras [Hz] y duración útil del símbolo [s].
          </small>
        </div>

        <p>
        El diseño de formas de onda ISAC requiere encontrar un equilibrio
        entre las métricas de comunicación y sensado. Mejorar la tasa de
        transmisión no siempre implica una mayor precisión de detección,
        por lo que es necesario optimizar ambos objetivos simultáneamente.
        </p>

      </> },


      { id: "arquitecturas", title: "Dónde transmitimos y dónde escuchamos", content: <>

        <ODDMDiagram />

        <dl className="editorial-facts">

          <div>
          <dt>Monostática</dt>
          <dd>
          El transmisor y receptor de sensado se encuentran en el mismo nodo.
          La señal enviada hacia el objetivo regresa como eco al mismo sistema.
          </dd>
          </div>

          <div>
          <dt>Biestática</dt>
          <dd>
          El transmisor y receptor están ubicados en posiciones diferentes.
          La estimación depende de la sincronización y la geometría entre
          ambos elementos.
          </dd>
          </div>

          <div>
          <dt>Multiestática</dt>
          <dd>
          Múltiples nodos colaboran para obtener diferentes observaciones del
          entorno y mejorar la información disponible.
          </dd>
          </div>

        </dl>

      </> },


      { id: "tendencias", title: "Qué se busca mejorar", content: <>

        <p>
        Las investigaciones actuales buscan diseñar sistemas donde la
        comunicación y el sensado compartan recursos de manera eficiente,
        especialmente para escenarios futuros como las redes 6G.
        </p>

        <div className="editorial-table-wrap" role="region" aria-label="Tendencias ISAC" tabIndex={0}>

        <table>

        <caption>
        Retos de diseño en sistemas ISAC
        </caption>

        <thead>
        <tr>
        <th scope="col">Línea</th>
        <th scope="col">Pregunta de ingeniería</th>
        <th scope="col">Qué observar</th>
        </tr>
        </thead>

        <tbody>

          <tr>
          <th scope="row">Forma de onda</th>
          <td>
          ¿Cómo diseñar señales útiles para comunicación y sensado?
          </td>
          <td>
          BER · resolución · lóbulos laterales
          </td>
          </tr>


          <tr>
          <th scope="row">ODDM-ISAC</th>
          <td>
          ¿Cómo mejorar el desempeño en escenarios con movilidad?
          </td>
          <td>
          Retardo · Doppler · precisión
          </td>
          </tr>


          <tr>
          <th scope="row">MIMO y haces</th>
          <td>
          ¿Cómo aprovechar múltiples antenas para transmitir y percibir?
          </td>
          <td>
          Cobertura · dirección · resolución espacial
          </td>
          </tr>


          <tr>
          <th scope="row">Procesamiento</th>
          <td>
          ¿Cómo extraer información del eco recibido?
          </td>
          <td>
          Detección · estimación · filtrado
          </td>
          </tr>

        </tbody>

        </table>

        </div>


        <p>
        El desarrollo de ISAC está relacionado con la evolución hacia redes
        inalámbricas 6G, donde la infraestructura de comunicación podrá
        incorporar capacidades de percepción del entorno.
        El <Link to="/glosario#referencias">informe 3GPP TR 22.837</Link>
        presenta escenarios de estudio relacionados con esta tecnología.
        </p>

      </> },


      { id: "aplicaciones", title: "Cuatro formas de imaginar su uso", content: <>

        <div className="application-grid">

          <div>
          <Radio aria-hidden />
          <h3>Transporte inteligente</h3>
          <p>
          Integrar comunicación entre vehículos e infraestructura con la
          detección de obstáculos y análisis del entorno.
          </p>
          <span>
          Pregunta: ¿cómo mejorar la percepción en movilidad?
          </span>
          </div>


          <div>
          <Radio aria-hidden />
          <h3>Drones y sistemas autónomos</h3>
          <p>
          Utilizar señales inalámbricas para comunicación, localización y
          seguimiento de objetivos en movimiento.
          </p>
          <span>
          Pregunta: ¿cómo estimar trayectorias?
          </span>
          </div>


          <div>
          <Radio aria-hidden />
          <h3>Industria inteligente</h3>
          <p>
          Combinar conectividad y percepción para apoyar procesos
          automatizados y sistemas industriales.
          </p>
          <span>
          Pregunta: ¿cómo unir comunicación y posición?
          </span>
          </div>


          <div>
          <Radio aria-hidden />
          <h3>Redes 6G</h3>
          <p>
          Incorporar capacidades de sensado dentro de la infraestructura
          inalámbrica futura.
          </p>
          <span>
          Pregunta: ¿cómo evolucionará la conectividad?
          </span>
          </div>


        </div>

        <p className="editorial-caption">
        Escenarios ilustrativos de aplicación de ISAC.
        </p>

      </> },

    ],
  },
  4: {
    headline: "Evaluar una señal que comunica y percibe.",
    introduction: "Exploramos cómo se analiza el desempeño de un sistema ISAC mediante simulación, observando el equilibrio entre comunicación y sensado a través de parámetros como ancho de banda, resolución, velocidad y calidad del enlace.",
    status: "Modelo hipotético ideal",

    sections: [

      { id: "escenario", title: "Un nodo, una señal y un objetivo", content: <>

        <p>
        Proponemos un escenario ISAC basado en una arquitectura monostática,
        donde un mismo nodo transmite una señal OFDM hacia un usuario y utiliza
        el eco recibido para obtener información del entorno.
        </p>

        <p>
        El modelo permite estudiar cómo parámetros de la señal, como el ancho
        de banda, número de subportadoras y duración de símbolos, afectan el
        desempeño conjunto de comunicación y sensado. La simulación representa
        condiciones ideales para comprender las relaciones fundamentales del
        sistema.
        </p>

      </> },


      { id: "explorador", title: "Explora los parámetros", content: <>

        <OfdmExplorer />

        <div className="example-block">
        <h3>El compromiso entre comunicación y sensado</h3>

        <p>
        Aumentar el ancho de banda puede mejorar la resolución de distancia y
        beneficiar la capacidad de detectar objetos, pero modificar otros
        parámetros puede afectar la observación temporal y la estimación de
        velocidad. Por esta razón, ISAC requiere encontrar un equilibrio entre
        diferentes objetivos de diseño.
        </p>

        </div>

      </> },


      { id: "ecuaciones", title: "Las relaciones detrás del resultado", content: <>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.rangeResolution} display />
        <small>
        Resolución ideal de distancia [m] relacionada con el ancho de banda.
        </small>
        </div>


        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.velocityResolution} display />
        <small>
        Resolución de velocidad obtenida mediante observación temporal.
        </small>
        </div>


        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.delayAndDoppler} display />
        <small>
        Relación entre retardo y desplazamiento Doppler en el sensado.
        </small>
        </div>


        <p>
        Estas relaciones permiten analizar cómo una misma señal puede aportar
        información para comunicación y percepción. La estimación del entorno
        se obtiene mediante el procesamiento de la respuesta recibida después
        de interactuar con un objetivo.
        </p>


        <h3>Construcción del mapa Rango-Doppler</h3>

        <p>
        El procesamiento de la señal recibida permite transformar las
        variaciones de fase producidas por el retardo y el movimiento en una
        representación del entorno. El análisis conjunto de estos parámetros
        permite identificar la posición y velocidad de un objetivo.
        </p>


        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.echoResponse} display />
        <small>
        Modelo ideal de la respuesta recibida después de compensar la señal transmitida.
        </small>
        </div>


        <p>
        Mediante transformadas en frecuencia es posible obtener información de
        retardo y Doppler, generando representaciones que permiten analizar el
        comportamiento del sistema de sensado.
        </p>


      </> },


      { id: "validacion", title: "De la predicción a la simulación", content: <>

        <p>
        Para acercarse a escenarios reales, el modelo debe incorporar elementos
        adicionales como ruido, características del canal inalámbrico,
        interferencias y algoritmos de procesamiento de recepción.
        </p>


        <dl className="editorial-facts">

        <div>
        <dt>BER frente a SNR</dt>
        <dd>
        Evaluar la calidad de la comunicación mediante la comparación entre
        información transmitida y recuperada.
        </dd>
        </div>


        <div>
        <dt>Probabilidad de detección</dt>
        <dd>
        Analizar la capacidad del sistema para identificar objetivos bajo
        diferentes condiciones.
        </dd>
        </div>


        <div>
        <dt>Error de estimación</dt>
        <dd>
        Comparar la precisión con la que se calculan parámetros como distancia
        y velocidad.
        </dd>
        </div>


        </dl>


        <Note title="Alcance de esta primera versión">
        El explorador representa relaciones ideales del sistema ISAC. La
        incorporación de ruido, canales reales, detección avanzada y validación
        experimental corresponde a etapas posteriores del desarrollo.
        </Note>


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
