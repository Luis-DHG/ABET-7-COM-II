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
import { ReferenceFigure } from "@/components/ReferenceFigure";
import { LazyBibliometricMap } from "@/components/LazyBibliometricMap";
import { LazyBibliometricFindings } from "@/components/LazyBibliometricFindings";
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

    introduction: "Una introducción a Integrated Sensing and Communications (ISAC): la visión de una infraestructura inalámbrica que no solo conecta dispositivos, sino que percibe el entorno, procesa esa información y la convierte en nuevos servicios y en mejores comunicaciones. Un recorrido para estudiantes de ingeniería, desde la visión completa de la tecnología hasta el compromiso técnico que estudiamos en el mini-caso.", 

    sections: [ 

      { id: "que-es-isac", title: "Una señal, dos funciones", content: <> 

        <p>
        Durante décadas, las redes de comunicaciones y los sistemas de
        percepción tipo radar se desarrollaron como mundos separados:
        infraestructura propia, espectros propios, formas de onda propias
        y métricas propias. Una red móvil se juzga por su tasa de datos y
        la calidad del enlace; un radar, por su capacidad de detectar
        objetivos y estimar su distancia y velocidad. <strong>ISAC
        (Integrated Sensing and Communications) estudia cómo integrar
        ambas capacidades</strong> en un mismo sistema, compartiendo
        recursos como el espectro, la infraestructura y, en determinados
        diseños, la misma forma de onda [1], [4].
        </p> 

        <p>
        El cambio de paradigma es el siguiente: las señales que hoy solo
        transportan información pueden, al mismo tiempo, interactuar con
        los objetos del entorno. Una señal viaja hacia un usuario y una
        parte de ella regresa reflejada. Ese eco no es ruido que descartar:
        su retardo contiene información de distancia y los cambios de
        frecuencia permiten estimar movimiento mediante el efecto Doppler.
        La red no solo comunica; también percibe [1]. Esta visión de redes
        que «ven» su entorno aparece tanto en la literatura académica como
        en las hojas de ruta industriales hacia 6G de{" "}
        <a href="https://www.qualcomm.com/research/6g/isac" target="_blank" rel="noreferrer">Qualcomm Research</a>,
        {" "}<a href="https://www.ericsson.com/en/6g/isac" target="_blank" rel="noreferrer">Ericsson</a> y{" "}
        <a href="https://www.huawei.com/en/huaweitech/future-technologies/integrated-sensing-communication-concept-practice" target="_blank" rel="noreferrer">Huawei</a>,
        y el 3GPP ya la estudia en el informe técnico TR 22.837 [3].
        </p> 

        <p>
        Por eso conviene definir ISAC con amplitud: no es solo «un radar
        añadido a la red», sino una <strong>metodología de diseño y un
        conjunto de tecnologías que integran sensado y comunicaciones para
        usar los recursos inalámbricos con eficiencia y para que ambas
        funciones se beneficien mutuamente</strong> [1]. En la práctica,
        eso significa una infraestructura que adquiere capacidad de
        percepción del mundo físico, que procesa esa información y que la
        convierte en inteligencia y servicios —incluidos servicios que
        hoy exigen sensores dedicados, como el radar o el LiDAR—.
        </p> 

        <SignalDiagram /> 

        <div className="concept-pair"> 

          <div><h3>Comunicar</h3><p>Transmitir y recuperar información entre dispositivos.</p><span>Bits · tasa de datos · BER · calidad del enlace</span></div> 

          <div><h3>Percibir</h3><p>Obtener información del entorno mediante señales inalámbricas.</p><span>Distancia · velocidad · detección · Doppler</span></div> 

        </div> 

      </> }, 


      { id: "vision", title: "La visión: una infraestructura que percibe y entiende", content: <> 

        <p>
        En las redes actuales el sensado es, como mucho, un método
        auxiliar: se posiciona un dispositivo, se estima un canal, se
        ajusta un haz. La propuesta de ISAC es más profunda: que la
        percepción sea una <strong>capacidad nativa de la red</strong>,
        ofrecida como un servicio de la infraestructura inalámbrica [1]. Con
        ella, la infraestructura celular «abre los ojos» y se convierte en
        lo que la literatura llama una <em>red perceptiva</em>: un tejido
        de estaciones base y dispositivos que observa el entorno de forma
        ubicua —tráfico urbano, condiciones del tiempo, actividad de las
        personas— y alimenta con esos datos a las aplicaciones y a la
        propia red [1].
        </p>

        <p>
        La cadena completa es la que da sentido a esta tecnología:
        percibir el entorno, procesar esa percepción y convertirla en
        inteligencia y servicios —desde un mapa del entorno en tiempo
        real hasta un <strong>gemelo digital</strong> de la fábrica o de
        la ciudad—. Y en cada eslabón aparecen las dos ganancias que
        organizan todo el campo [1]:
        </p>

        <dl className="editorial-facts">

          <div>
          <dt>Ganancia de integración</dt>
          <dd>
          La que se obtiene al compartir espectro, infraestructura,
          hardware y hasta la misma forma de onda para ambos propósitos:
          se evita duplicar transmisiones, dispositivos y despliegues, y
          mejoran la eficiencia espectral y energética de todo el sistema.
          </dd>
          </div>

          <div>
          <dt>Ganancia de coordinación</dt>
          <dd>
          La que surge cuando las dos funciones dejan de ser fines
          separados y se diseñan para ayudarse: la comunicación aporta
          señales y sincronización para percibir mejor, y la percepción
          aporta conocimiento del entorno para comunicar mejor [1], [8].
          </dd>
          </div>

        </dl>

        <p>
        Integrar tiene, además, un costo conceptual que atravesará el resto
        del recorrido: <strong>ambas funciones comparten recursos
        limitados</strong>. La misma potencia, el mismo ancho de banda y
        el mismo tiempo de transmisión deben repartirse entre comunicar y
        percibir. Aparecen así compromisos de diseño —<em>trade-offs</em>—
        que la ingeniería debe entender y cuantificar. Uno de ellos, el
        reparto de potencia entre ambas funciones, es precisamente el que
        estudiamos de forma cuantitativa en el{" "}
        <Link to="/mini-caso">mini-caso técnico</Link>, al final del
        recorrido.
        </p>

      </> }, 


      { id: "capacidades", title: "Qué puede percibir una red", content: <> 

        <p>
        ¿Y qué información puede extraer una red de sus propias señales?
        Las tareas de sensado se agrupan en tres familias [1]:{" "}
        <strong>detección</strong> (¿hay algo ahí?), <strong>estimación</strong>
        (¿a qué distancia, con qué velocidad, en qué dirección?) y{" "}
        <strong>reconocimiento</strong> (¿qué es, qué hace?). Todas se
        alimentan de las huellas que los objetos dejan en la señal:
        </p>

        <ul>
        <li>El <strong>retardo</strong> del eco revela la <strong>distancia</strong>.</li>
        <li>El <strong>Doppler</strong> revela la <strong>velocidad radial</strong>.</li>
        <li>La <strong>fase entre antenas</strong> de un arreglo revela la <strong>dirección</strong> de llegada.</li>
        <li>La <strong>amplitud y la microestructura</strong> del eco revelan tamaño, material y hasta gestos, respiración o parpadeos [1], [4].</li>
        </ul>

        <p>
        La figura sitúa la resolución en los tres parámetros que el
        receptor estima: retardo, Doppler y ángulo.
        </p>

        <ReferenceFigure
          src="/images/isac/liu-jsac-2022/fig06-radar-sensing.avif"
          alt="Celda de resolución en tres dimensiones: retardo, Doppler y ángulo"
          caption="La celda de resolución en retardo, Doppler y ángulo: dos objetivos próximos pueden resultar difíciles de separar si sus respuestas caen dentro de la misma celda. La figura resume el límite que imponen esas dimensiones; no fija por sí sola el desempeño de un sistema concreto."
          source="Fig. 6 de F. Liu et al., IEEE JSAC, 2022. Licencia CC BY 4.0."
        />

        <p>
        La resolución depende del ancho de banda, la geometría de antenas
        y el tiempo de observación; no hay una cifra única que describa
        todas las aplicaciones. Release 17 de 5G NR incluyó mejoras y
        requisitos de posicionamiento; para IIoT, 3GPP fijó como objetivo
        una precisión horizontal inferior a 0,2 m para el 90 % de los
        equipos. Es un requisito de posicionamiento, antecedente
        relacionado, no una medida de resolución de sensing ni una
        especificación completa de ISAC (véase el <a href="https://portal.3gpp.org/DesktopModules/CRs/CrDetails.aspx?CrId=482202" target="_blank" rel="noreferrer">requisito 3GPP de Release 17</a>). Como ejemplo
        distinto de percepción radar integrada en un dispositivo, Google
        Soli combina un radar milimétrico compacto con algoritmos de
        aprendizaje automático para reconocer gestos; el artículo reporta
        seguimiento a más de 10 000 cuadros por segundo en hardware
        embebido, un resultado de Soli que no debe generalizarse a ISAC.
        Soli es tecnología de radar/sensing, no un sistema ISAC [10].
        Los resultados dependen del sensor, el escenario y el método de
        evaluación.
        </p>

        <p>
        Detrás de esos números hay una regla simple que el mini-caso
        convertirá en ecuaciones: <strong>más ancho de banda da más
        detalle en distancia; más antenas, más detalle en dirección; más
        tiempo de observación, más detalle en velocidad</strong>. La
        percepción no es gratis: es una función que consume los mismos
        recursos que la comunicación.
        </p>

      </> }, 


      { id: "pregunta-guia", title: "La pregunta que nos guía", content: <> 

        <blockquote>
        ¿Cómo puede la infraestructura inalámbrica no solo conectar
        dispositivos, sino percibir el mundo físico, procesar esa
        información y convertirla en nuevos servicios y en mejores
        comunicaciones?
        </blockquote> 

        <p>
        Queremos divulgar los fundamentos de ISAC mediante explicaciones,
        ejemplos y métricas que conecten la comunicación inalámbrica, el
        procesamiento de señales y sus aplicaciones en ingeniería. Al terminar,
        podrás reconocer los conceptos principales, tecnologías relacionadas y
        líneas actuales de investigación.
        </p> 

        <ul>
        <li>Entender por qué el sensado se convierte en una capacidad nativa de las redes hacia 6G.</li>
        <li>Reconocer qué puede percibir una red y con qué límites físicos.</li>
        <li>Identificar aplicaciones reales: localización, imagen del entorno, transporte, industria, monitoreo ambiental e interacción.</li>
        <li>Describir el mapa de tecnologías: formas de onda duales, procesamiento, antenas y hardware compartido.</li>
        <li>Distinguir la ganancia de integración (recursos compartidos) de la ganancia de coordinación (beneficio mutuo).</li>
        <li>Situar el papel de la fusión de sensores, el Edge AI y los gemelos digitales.</li>
        <li>Comprender el compromiso cuando ambas funciones comparten potencia y ancho de banda, y cuantificarlo en el mini-caso.</li>
        </ul> 

      </> }, 


      { id: "recorrido", title: "Un recorrido en siete módulos", content: <> 

        <p>
        Explora ISAC desde la visión completa de la tecnología hasta el
        compromiso técnico que da lugar al mini-caso: primero qué es y qué
        puede percibir una red; luego la literatura y el estado del
        arte —aplicaciones, tecnologías, redes perceptivas e inteligencia
        en el borde—; después el modelo cuantitativo y, al cierre, la
        divulgación, la bitácora y el glosario.
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
    headline: "De la literatura al mapa de conocimiento.",
    introduction: "Seguimos el rastro desde una pregunta sobre ISAC hasta una red de palabras clave: una forma de organizar la búsqueda y decidir qué conviene leer con más atención.",
    status: "Exploración bibliométrica del equipo",
    sections: [
      { id: "metodo", title: "De la búsqueda a la interpretación", content: <>
        <p>La pregunta de partida fue amplia: ¿qué se está investigando alrededor de Integrated Sensing and Communications? El proceso documentado por el equipo parte de Scopus, depura los términos y utiliza VOSviewer para construir una red de coocurrencia. Así pasamos de una búsqueda extensa a una estructura que podemos explorar y luego contrastar con los artículos.</p>
        <ol className="editorial-steps"><li><h3>Buscar</h3><p>El informe registra una búsqueda inicial de 17.661 documentos y 2.552 palabras clave.</p></li><li><h3>Depurar y organizar</h3><p>Con VOSviewer se trabajó con 541 términos distribuidos en ocho agrupaciones temáticas. El mapa que sigue conserva sus coordenadas, enlaces, pesos y clústeres.</p></li><li><h3>Interpretar y conectar</h3><p>Las agrupaciones son pistas para orientar la lectura, no conclusiones por sí solas. Después de observar sus relaciones, podremos examinar qué significan técnicamente.</p></li></ol>
      </> },
      { id: "mapa", title: "Explora la red de coocurrencia", content: <>
        <p>La red completa reúne cientos de términos. Explórala por clúster o busca una palabra para ver sus enlaces y métricas. El propósito no es sustituir la lectura de las publicaciones: es encontrar relaciones que merecen una pregunta mejor.</p>
        <LazyBibliometricMap />
        <p className="editorial-caption">Fuente: red exportada desde VOSviewer. Se conservan las posiciones y relaciones del análisis original.</p>
      </> },
      { id: "resultados", title: "¿Qué relaciones encontramos?", content: <>
        <p>La frecuencia muestra qué términos aparecen reiteradamente; el número de enlaces cuenta cuántos vecinos tiene cada término; la fuerza total suma los pesos de sus enlaces. Para interpretar la red, miramos también parejas concretas y distinguimos relaciones dentro de un clúster de puentes entre grupos.</p>
        <LazyBibliometricFindings />
        <div className="example-block"><h3>De las relaciones a la lectura técnica</h3><p>El grupo más directamente ligado a ISAC incluye integración, antenas, beamforming y aprendizaje profundo; otros reúnen fotónica, recursos de red, sensado vestible o términos biomédicos y experimentales. Los pesos ayudan a decidir por dónde continuar, pero la coocurrencia no demuestra causalidad ni convierte a un clúster en una categoría definitiva.</p></div>
        <p>En el siguiente recorrido examinaremos qué implican técnicamente algunas de estas líneas: cómo se comparten recursos, qué tecnologías y arquitecturas intervienen, qué aplicaciones se proponen y qué desafíos siguen abiertos.</p>
        <p><Link to="/tendencias">Continuar: interpretar técnicamente las tendencias de ISAC <ArrowUpRight aria-hidden /></Link></p>
        <p>Más adelante, el mini-caso estudia cuantitativamente un compromiso concreto entre comunicación y sensing bajo un escenario simplificado; es una aplicación acotada, no una extensión del mapa.</p>
      </> },
    ],
  },
  3: {
    headline: "Cuando toda la red se vuelve un sensor.",
    introduction: "El panorama de ISAC en ocho paradas: las aplicaciones que lo motivan, las tecnologías que lo hacen posible, qué significa integrar de verdad, la evolución de nodos individuales a redes perceptivas, el beneficio mutuo entre sensing y comunicaciones, el procesamiento y la IA en el borde, lo que la industria ya demuestra y los desafíos abiertos. La última parada nos deja en la puerta del mini-caso.",

    sections: [

      { id: "aplicaciones", title: "Dónde importaría percibir: las aplicaciones", content: <>

        <p>
        El valor de ISAC no está en la señal compartida, sino en lo que la
        red puede hacer con ella. Si cada estación base y cada dispositivo
        ya emiten y reciben señales, la red celular entera puede actuar
        como un <strong>sensor desplegado a gran escala</strong>: lo que
        hoy hacen equipos dedicados —radar, LiDAR, cámaras térmicas—
        pasaría a ser un servicio de la propia infraestructura, el{" "}
        <em>sensado como servicio</em> [1]. Huawei organiza esos
        servicios futuros en cuatro categorías funcionales: localización y
        seguimiento de alta precisión; imagen, mapeo y localización
        simultáneos; sentidos humanos aumentados; y reconocimiento de
        gestos y actividades [8].
        </p>

        <div className="application-grid">

          <div>
          <Radio aria-hidden />
          <h3>Localización y seguimiento</h3>
          <p>
          Localizar y seguir objetos con o sin dispositivo conectado:
          desde intrusos en un perímetro hasta pequeños componentes en un
          almacén.
          </p>
          </div>

          <div>
          <Radio aria-hidden />
          <h3>Imagen y mapeo del entorno</h3>
          <p>
          «Ver» el entorno con radio para construir mapas: SLAM vehicular,
          reconstrucción de espacios interiores, gemelos digitales.
          </p>
          <span>
          Pregunta: ¿puede la red mapear lo que la cámara no ve?
          </span>
          </div>

          <div>
          <Radio aria-hidden />
          <h3>Transporte inteligente</h3>
          <p>
          Detectar peatones y obstáculos más allá de la línea de vista del
          conductor, coordinar platoones y asistir la comunicación
          vehículo–infraestructura.
          </p>
          <span>
          Pregunta: ¿cómo extender la percepción de un vehículo?
          </span>
          </div>

          <div>
          <Radio aria-hidden />
          <h3>Industria inteligente</h3>
          <p>
          Navegación y coordinación de robots, alineación de módulos,
          control de procesos: percibir y comunicar con la misma red, con
          latencia mínima.
          </p>
          <span>
          Pregunta: ¿cómo unir comunicación y posición?
          </span>
          </div>

          <div>
          <Radio aria-hidden />
          <h3>Monitoreo ambiental</h3>
          <p>
          La propagación revela el medio: humedad, lluvia, contaminantes e
          insectos pueden monitorearse midiendo cómo cambian los enlaces de
          la red [1].
          </p>
          <span>
          Pregunta: ¿puede la red ser un observatorio atmosférico?
          </span>
          </div>

          <div>
          <Radio aria-hidden />
          <h3>Entornos inteligentes e interacción</h3>
          <p>
          Hogares y cabinas que investigan cómo reconocer presencia,
          caídas, respiración o gestos mediante señales inalámbricas;
          Soli es un ejemplo relacionado de radar compacto para gestos,
          no una implementación ISAC [10].
          </p>
          <span>
          Pregunta: ¿cómo percibir personas sin cámaras?
          </span>
          </div>

        </div>

        <p>
        La siguiente figura reúne tres papeles posibles de los vehículos
        aéreos no tripulados en redes perceptivas: objetivo observado,
        usuario conectado y plataforma que incorpora el transceptor de
        sensado.
        </p>

        <ReferenceFigure
          src="/images/isac/liu-jsac-2022/fig21-ISAC-aerial.avif"
          alt="ISAC con vehículos aéreos no tripulados en tres roles: objetivo vigilado, usuario localizado y plataforma aérea de sensado"
          caption="Los drones ilustran la amplitud del campo: pueden ser objetivos que la red vigila en espacios aéreos bajos, usuarios que la red localiza mientras se comunican, o plataformas aéreas que perciben y conectan a demanda [1]."
          source="Fig. 21 de F. Liu et al., IEEE JSAC, 2022. Licencia CC BY 4.0."
        />

        <p>
        Las flechas discontinuas representan sensado y los haces verdes,
        comunicación. La ilustración organiza escenarios posibles de
        investigación entre nodos terrestres y aéreos; no documenta por
        sí misma despliegues comerciales.
        </p>

        <p>
        Estas ideas ya dejaron los artículos de visión: el{" "}
        <Link to="/glosario#referencias">informe 3GPP TR 22.837</Link>{" "}
        convierte casos como la detección de intrusos, el seguimiento de
        drones o la monitorización de tráfico en escenarios de estudio con
        requisitos formales [3]. En la sección «industria» retomamos qué
        está demostrado y qué sigue en estudio.
        </p>

      </> },


      { id: "tecnologias", title: "El mapa de tecnologías que lo hace posible", content: <>

        <p>
        ISAC es posible porque <strong>comunicaciones y radar evolucionaron
        hacia el mismo punto</strong>: ambos suben en frecuencia, usan
        arreglos de antenas cada vez mayores y comparten arquitectura de
        hardware, características de canal y técnicas de procesamiento
        [1], [4]. El tutorial de Liu et al. organiza todo el campo en un
        marco que va de las aplicaciones y sus ganancias al diseño de
        formas de onda, la recepción y las redes perceptivas:
        </p>

        <ReferenceFigure
          src="/images/isac/liu-jsac-2022/fig03-framework.avif"
          alt="Marco de las tecnologías ISAC: aplicaciones, ganancias, trade-offs, formas de onda, recepción y redes perceptivas"
          caption="El marco de las tecnologías ISAC: arriba, las aplicaciones y las dos ganancias que las motivan; debajo, los pilares técnicos —compromisos de desempeño, diseño de forma de onda, procesamiento en recepción y redes perceptivas— que sostienen el campo [1]."
          source="Fig. 3 de F. Liu et al., IEEE JSAC, 2022. Licencia CC BY 4.0."
        />

        <p>
        El corazón técnico es la <strong>forma de onda dual</strong>: una
        señal capaz de transportar datos y de servir de referencia para
        percibir. Hay tres filosofías de diseño [1], [4]:
        </p>

        <dl className="editorial-facts">

          <div>
          <dt>Sensado-céntrica</dt>
          <dd>
          Se parte de una señal de radar —por ejemplo, un chirp— y se
          incrustan datos en ella. Primero percibir; comunicar, sin
          degradar esa función.
          </dd>
          </div>

          <div>
          <dt>Comunicación-céntrica</dt>
          <dd>
          Se parte de la señal de la red —OFDM, la de 4G y 5G— y se le
          añade procesamiento de radar. Es el enfoque <strong>DFRC</strong>
          (Dual-Function Radar-Communication) que sigue este proyecto.
          </dd>
          </div>

          <div>
          <dt>Diseño conjunto</dt>
          <dd>
          La señal se optimiza desde el inicio para ambas métricas a la
          vez; es el diseño más ambicioso y el que promete la mayor
          integración [1].
          </dd>
          </div>

        </dl>

        <p>
        En sistemas OFDM, los datos se distribuyen en subportadoras
        ortogonales: la misma estructura que permite transmitir
        información permite, con transformadas adecuadas, separar las
        huellas de retardo y Doppler de los objetos del entorno [1], [2],
        [4].
        </p>

        <div className="equation" tabIndex={0}>
          <Formula tex={FORMULAS.subcarrierSpacing} display />
          <small>
          Separación de subportadoras [Hz] y duración útil del símbolo [s].
          </small>
        </div>

        <p>
        La figura muestra cómo se separa la señal OFDM recibida en dos
        caminos de procesamiento: recuperación de datos y estimación de
        parámetros del eco.
        </p>

        <ReferenceFigure
          src="/images/isac/liu-jsac-2022/fig11-ofdm-isac.avif"
          alt="Flujo de procesamiento de una señal OFDM ISAC hacia el receptor de comunicaciones y el estimador de sensing"
          caption="Un mismo OFDM, dos lecturas: la señal recibida se demodula para recuperar datos y, en paralelo, se procesa con transformadas para estimar retardo y Doppler. No se transmite nada «extra»: el sensado aprovecha la señal que ya viaja [1]."
          source="Fig. 11 de F. Liu et al., IEEE JSAC, 2022. Licencia CC BY 4.0."
        />

        <p>
        Para escenarios con alta movilidad se estudian además formas de
        onda en el dominio retardo–Doppler, como ODDM, que buscan
        robustez frente al desvanecimiento rápido del canal:
        </p>

        <ODDMDiagram />

        <p>
        Completan el mapa dos piezas transversales: los <strong>arreglos
        MIMO y el beamforming</strong>, que concentran la energía en haces
        espaciales útiles para transmitir y para iluminar objetivos, y el{" "}
        <strong>co-diseño de hardware</strong>, que integra baseband y RF
        de ambas funciones en un solo equipo para reducir tamaño, consumo y
        latencia [1], [8]:
        </p>

        <ReferenceFigure
          src="/images/isac/huawei/fig10-hardware.avif"
          alt="Arquitectura de hardware del prototipo ISAC de Huawei con arreglos de transmisión y recepción"
          caption="Hardware compartido en la práctica: arquitectura del prototipo ISAC de Huawei, con arreglos MIMO de transmisión y recepción integrados en un mismo módulo [8]."
          source="Fig. 10 de A. Bayesteh et al. (Huawei), «ISAC — From Concept to Practice», 2022. © Huawei; utilizado como referencia."
        />

        <p>
        Cada línea de este mapa es hoy una pregunta de investigación
        abierta:
        </p>

        <div className="editorial-table-wrap" role="region" aria-label="Líneas de investigación ISAC" tabIndex={0}>

        <table>

        <caption>
        Líneas de investigación en sistemas ISAC
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

      </> },


      { id: "integracion", title: "Qué significa integrar: compartir recursos", content: <>

        <p>
        «Integrar» es una escalera, no un interruptor. Huawei describe
        tres niveles, del más laxo al más profundo [8]:
        </p>

        <ol className="editorial-steps">
        <li><h3>Coexistencia</h3><p>Sensado y comunicación comparten espectro y hardware, pero mantienen sus señales y procesamiento separados. Ya es más eficiente que dedicar equipos y espectro a cada función.</p></li>
        <li><h3>Integración de forma de onda</h3><p>Una misma señal y un mismo procesamiento sirven a ambos propósitos: el tiempo, la frecuencia y el espacio se usan con un objetivo común.</p></li>
        <li><h3>Integración completa</h3><p>La información fluye entre capas, módulos y nodos: sensing y comunicación se ayudan mutuamente y se reduce el costo, el tamaño y el consumo del sistema completo.</p></li>
        </ol>

        <p>
        El peldaño más accesible de la escalera reparte los recursos en
        dominios que no se solapan: <strong>división en tiempo, en
        frecuencia, en espacio o en código</strong> [1]. En la división
        temporal, el mismo nodo alterna entre ciclos de radar y ciclos de
        radio:
        </p>

        <p>
        El siguiente esquema ilustra esa división temporal: se alternan
        intervalos de sensing y comunicación, y el objetivo se observa en
        los intervalos reservados al radar.
        </p>

        <ReferenceFigure
          src="/images/isac/liu-jsac-2022/fig08-target-time-division-manner.avif"
          alt="Reconocimiento de objetivos y comunicación alternados en el tiempo en un nodo ISAC"
          caption="División temporal de sensing y comunicación: los intervalos se asignan por turnos, de modo que cada función deja de transmitir mientras opera la otra. Se han publicado propuestas y demostraciones de radar que reutilizan campos de estimación de canal de IEEE 802.11p y 802.11ad; esas normas de comunicación no incorporan por ello una función ISAC nativa [1]."
          source="Fig. 8 de F. Liu et al., IEEE JSAC, 2022. Licencia CC BY 4.0."
        />

        <p>
        En el extremo opuesto está la <strong>forma de onda totalmente
        unificada</strong>: la misma señal, la misma potencia y el mismo
        ancho de banda sirven a las dos funciones a la vez. Es el diseño
        que maximiza la ganancia de integración —y también donde el
        compromiso se hace inevitable: un watt no puede estar en dos
        funciones al mismo tiempo, y los objetivos de ambas métricas
        pueden tirar en direcciones opuestas [1].
        </p>

        <Note title="Integrar no es gratis">
        Cuanto más profunda es la integración, más complejos son el
        receptor, la gestión de interferencias y la evaluación del
        sistema: las métricas de comunicación (tasa, BER) y de sensado
        (detección, resolución, error de estimación) responden a preguntas
        distintas y deben optimizarse juntas [1], [4].
        </Note>

      </> },


      { id: "redes-perceptivas", title: "De nodos individuales a redes perceptivas", content: <>

        <p>
        Un radar clásico es un nodo aislado. ISAC propone algo mayor: que
        la red celular completa —decenas de estaciones base
        interconectadas— perciba de forma coordinada, como un radar
        distribuido [1]. La literatura llama a esta idea <strong>red
        móvil perceptiva</strong> (perceptive mobile network): la
        infraestructura 5G y 6G, con sus señales de referencia y sus
        enlaces de coordinación, se convierte en la plataforma de sensado
        [1]. La geometría básica ya la conocen los radares:
        </p>

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

        <p>
        La figura compara el sensado monostático, bistático y multiestático;
        fíjate en la ubicación del receptor con respecto al transmisor y
        en cuántos nodos aportan observaciones.
        </p>

        <ReferenceFigure
          src="/images/isac/ericsson/sensing-topologies.avif"
          alt="Topologías de sensado de red: monostática, bistática y multiestática con estaciones base y dispositivos"
          caption="Topologías de sensado en una red móvil: dónde se coloca el receptor respecto del transmisor define qué se puede medir y con qué precisión."
          source="Ericsson, «Integrated Sensing and Communication (ISAC)», página 6G (ericsson.com/en/6g/isac). © Ericsson; utilizado como referencia."
        />

        <p>
        La posición relativa de transmisores y receptores determina la
        geometría del eco: un mismo objetivo puede observarse desde un
        nodo o desde varios. El esquema distingue las topologías antes de
        discutir cómo se combinan sus señales.
        </p>

        <p>
        La arquitectura C-RAN de 5G resulta ser un marco natural para
        esto: las unidades de radio remotas actúan como sensores de radar
        y envían sus observaciones —o las señales crudas— por el
        fronthaul óptico hacia un pool de procesamiento centralizado que
        fusiona todo [1]. Hay dos formas de fusionar: intercambiar{" "}
        <strong>resultados</strong> (fusión de información, más barata)
        o intercambiar <strong>señales</strong> (fusión de señal, más
        precisa) [1]. Y aparece un giro conceptual revelador: la
        interferencia entre celdas, enemiga histórica de las
        comunicaciones, contiene información útil del objetivo —para la
        red perceptiva es un aliado que conviene explotar, no cancelar—
        [1].
        </p>

        <p>
        Huawei ilustra el uso de una apertura virtual en su prototipo de
        imagen THz: un arreglo pequeño se desplaza y sus mediciones se
        combinan en el procesamiento, como si se hubiera observado desde
        una apertura mayor.
        </p>

        <ReferenceFigure
          src="/images/isac/huawei/fig09-virtual-aperture.avif"
          alt="Apertura virtual MIMO: el movimiento de un arreglo pequeño crea una apertura equivalente mucho mayor"
          caption="Apertura virtual: mover y combinar arreglos pequeños en el tiempo y el espacio equivale a una antena mucho mayor. Con esta idea, el prototipo THz de Huawei logró imagen de resolución milimétrica a 140 GHz con un módulo portátil [8]."
          source="Fig. 9 de A. Bayesteh et al. (Huawei), «ISAC — From Concept to Practice», 2022. © Huawei; utilizado como referencia."
        />

        <p>
        El esquema muestra el movimiento del arreglo y la combinación de
        muestras para formar esa apertura virtual. El resultado milimétrico
        citado corresponde al prototipo concreto descrito por Huawei [8].
        </p>

      </> },


      { id: "beneficio-mutuo", title: "Beneficio mutuo: cuando cada función ayuda a la otra", content: <>

        <p>
        La promesa más profunda de ISAC no es hacer dos cosas con un
        equipo, sino que <strong>cada función mejore a la otra</strong>:
        la ganancia de coordinación en acción [1].
        </p>

        <dl className="editorial-facts">

          <div>
          <dt>El sensado ayuda a comunicar</dt>
          <dd>
          En mmWave, alinear haces cuesta muchos pilotos y retroalimentación.
          Con el sensado, la base puede predecir dónde estará el usuario y
          apuntar el haz sin barrer: en un sistema V2I con 1024 pares de
          haces, la búsqueda se reduce a 32 usando las medidas del radar,
          con la misma precisión que el barrido completo [1]. En el
          seguimiento, el eco del vehículo reemplaza la retroalimentación:
          mientras un esquema clásico pierde el ángulo y su tasa cae a
          cero, el esquema ISAC mantiene el enlace [1]. El conocimiento del
          entorno también reduce la sobrecarga de estimar el canal y ayuda
          a gestionar los recursos [8].
          </dd>
          </div>

          <div>
          <dt>La comunicación ayuda a percibir</dt>
          <dd>
          Las señales que la red ya transmite —sincronización, pilotos,
          referencias de posicionamiento, incluso los propios datos— sirven
          de señal de radar sin costo adicional; la sincronización por
          fronthaul entre estaciones resuelve el problema de fase que
          separa a los radares cooperativos; y la coordinación de la red
          permite observar el mismo objetivo desde varias direcciones,
          compensando las fluctuaciones de su reflectividad [1], [3].
          </dd>
          </div>

        </dl>

        <div className="example-block">
        <h3>Un lazo que se cierra solo</h3>

        <p>
        En el escenario V2I del tutorial, la estación al borde de la vía{" "}
        <em>predice</em> la posición del vehículo, <em>apunta</em> su haz
        con esa predicción, <em>lee</em> el eco que devuelve el propio
        mensaje y <em>corrige</em> la predicción con un filtro de Kalman.
        Comunicar produce la señal que percibe; percibir produce la
        información que mejora la comunicación [1].
        </p>

        </div>

        <p>
        La figura siguiente representa el escenario V2I: una estación de
        carretera (RSU) usa la señal ISAC y el eco del vehículo para
        seguirlo y predecir la dirección del haz.
        </p>

        <ReferenceFigure
          src="/images/isac/liu-jsac-2022/fig17--isac--v2I.avif"
          alt="Escenario V2I con vehículo en movimiento y una RSU que usa la señal ISAC para seguimiento y predicción del haz"
          caption="La RSU recibe la comunicación del vehículo y procesa el eco de la señal ISAC para apoyar el seguimiento y la predicción del haz. El diagrama ilustra este flujo V2I; no presenta mediciones de desempeño."
          source="Fig. 17 de F. Liu et al., IEEE JSAC, 2022. Licencia CC BY 4.0."
        />

      </> },


      { id: "procesamiento", title: "Del eco a la inteligencia: fusión, Edge AI y gemelos digitales", content: <>

        <p>
        Percibir es solo el primer eslabón. Los datos de sensado que
        genera una red son masivos, llegan distribuidos entre distintos
        nodos y solo valen si se procesan a tiempo —un gesto, una falla
        de respiración, un intruso: todos son eventos que exigen
        una respuesta oportuna [1]. De ahí dos movimientos
        complementarios:
        </p>

        <p>
        <strong>Fusión de sensores.</strong> El radar de la red no trabaja
        solo: sus observaciones se combinan con cámaras, LiDAR y otros
        sensores para lograr una percepción más robusta que la de
        cualquier sensor individual [1]. <strong>Inteligencia en el
        borde.</strong> El procesamiento con IA se acerca al lugar donde
        nacen los datos —la propia estación base— para cumplir las latencias,
        y los dispositivos pueden entrenar modelos localmente y compartir
        solo las actualizaciones: es una forma de aprendizaje federado.
        Esto reduce el intercambio de datos brutos, aunque por sí solo no
        garantiza la privacidad [1]. La figura resume este flujo:
        </p>

        <ReferenceFigure
          src="/images/isac/liu-jsac-2022/fig19-ISAC-edge-ai.avif"
          alt="ISAC e inteligencia en el borde: dispositivos que perciben, entrenan modelos locales y comparten actualizaciones con el servidor de borde"
          caption="ISAC se encuentra con la inteligencia en el borde: cada dispositivo perceptivo entrena su modelo local y la red agrega las actualizaciones; el tráfico de modelos compite con el de datos y de sensado por el mismo espectro [1]."
          source="Fig. 19 de F. Liu et al., IEEE JSAC, 2022. Licencia CC BY 4.0."
        />

        <p>
        La figura anterior muestra dispositivos que comparten modelos
        locales con un servidor de borde, donde se agregan para formar un
        modelo global; después se distribuye el modelo actualizado.
        Representa el flujo de aprendizaje federado aplicado al escenario
        ISAC estudiado en el tutorial.
        </p>

        <p>
        La integración introduce un compromiso adicional —el de{" "}
        <strong>sensado, comunicación y computo</strong>: más precisión
        de sensado genera más datos que transmitir y más cómputo que
        ejecutar, de modo que el objetivo final (por ejemplo, la exactitud
        de un clasificador) debería optimizarse de extremo a extremo, no
        métrica por métrica [1].
        </p>

        <p>
        Una superficie inteligente reconfigurable (RIS) puede redirigir
        la propagación para habilitar una trayectoria reflejada hacia un
        objetivo o un dispositivo sin línea de vista directa. La figura
        muestra dos RIS y trayectorias alternativas en torno a un
        obstáculo; ilustra una arquitectura estudiada, no una garantía de
        cobertura en cualquier entorno [1].
        </p>

        <ReferenceFigure
          src="/images/isac/liu-jsac-2022/fig20-ISAC.avif"
          alt="ISAC asistido por superficie inteligente reconfigurable que crea enlaces con objetivos sin línea de vista"
          caption="ISAC servido por una superficie reconfigurable: el RIS crea líneas de vista donde no las hay y permite ver el objetivo desde otro ángulo; el sensado, a su vez, ayuda a estimar el canal del propio RIS [1]."
          source="Fig. 20 de F. Liu et al., IEEE JSAC, 2022. Licencia CC BY 4.0."
        />

        <p>
        En el dibujo, las trayectorias reflejadas por RIS 1 y RIS 2
        ofrecen rutas adicionales entre el transceptor ISAC, los
        objetivos y el equipo de usuario; el obstáculo bloquea la
        trayectoria directa. A continuación se muestra por separado un
        esquema de aplicaciones THz descrito por Huawei.
        </p>

        <ReferenceFigure
          src="/images/isac/huawei/fig08-thz-isac.avif"
          alt="Aplicaciones de ISAC en terahercio: localización, reconocimiento de gestos, comunicación y observación espacial"
          caption="Aplicaciones de ISAC-THz previstas por Huawei: localización y seguimiento, reconocimiento de gestos y actividades, comunicación y observación espacial: la misma señal milimétrica que conecta también revela [8]."
          source="Fig. 8 de A. Bayesteh et al. (Huawei), «ISAC — From Concept to Practice», 2022. © Huawei; utilizado como referencia."
        />

        <p>
        Y en el extremo de la cadena, la recompensa conceptual: si la red
        percibe el mundo físico en tiempo real, puede mantener de él una{" "}
        <strong>réplica digital viva</strong>. Huawei describe el sensing
        como el «nuevo canal» que conecta el mundo físico con el mundo
        ciber, la base para que el gemelo digital deje de ser metáfora
        [8].
        </p>

      </> },


      { id: "industria", title: "Lo que la industria ya está demostrando", content: <>

        <p>
        ISAC ya no es solo literatura: la estandarización y los
        fabricantes lo tienen en sus hojas de ruta hacia 6G. Un repaso
        de los hitos verificables:
        </p>

        <dl className="editorial-facts">

          <div>
          <dt>3GPP</dt>
          <dd>
          <Link to="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=4044" target="_blank" rel="noreferrer">TR 22.837</Link>
          (Release 19) es un informe de estudio de casos de uso y
          requisitos, no una especificación de implementación [3]. El
          trabajo posterior separa etapas: <Link to="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=4198" target="_blank" rel="noreferrer">TS 22.137</Link>
          (Stage 1), <Link to="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=5516" target="_blank" rel="noreferrer">TS 23.137</Link>
          (Stage 2) y <Link to="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=5533" target="_blank" rel="noreferrer">TS 29.545</Link>
          (servicios de sensing, Stage 3; draft). En paralelo, RAN mantiene
          un <Link to="https://portal.3gpp.org/desktopmodules/WorkItem/WorkItemDetails.aspx?workitemId=1080070" target="_blank" rel="noreferrer">estudio de ISAC para NR</Link> y un <Link to="https://portal.3gpp.org/desktopmodules/WorkItem/WorkItemDetails.aspx?workitemId=1020086" target="_blank" rel="noreferrer">estudio de modelado de canal</Link>.
          Release 17 aporta
          antecedentes de posicionamiento y requisitos relacionados; no
          es una especificación completa de ISAC.
          </dd>
          </div>

          <div>
          <dt>IEEE</dt>
          <dd>
          <Link to="https://standards.ieee.org/ieee/802.11bf/11574/" target="_blank" rel="noreferrer">IEEE 802.11bf-2025</Link>
          estandariza sensing para WLAN. Esto es distinto de 802.11p y 802.11ad, cuyas señales de
          comunicación se han reutilizado en propuestas y demostraciones
          de radar mediante campos de estimación de canal o pilotos; esos
          usos no significan que las normas originales definan ISAC [1].
          </dd>
          </div>

          <div>
          <dt>Huawei</dt>
          <dd>
          El artículo técnico citado presenta una propuesta de ISAC para
          6G y un prototipo de imagen THz descrito por sus autores como
          ISAC. El equipo opera a 140 GHz con 8 GHz de ancho de banda y
          reporta resolución de imagen milimétrica; se trata de un
          resultado de prototipo, no de una capacidad desplegada en red
          comercial [8].
          </dd>
          </div>

          <div>
          <dt>Ericsson</dt>
          <dd>
          Ericsson presenta su visión, casos de uso y arquitectura de ISAC
          para 6G [7]; la fuente enlazada es una hoja de ruta y no evidencia
          un prototipo desplegado.
          </dd>
          </div>

          <div>
          <dt>Qualcomm</dt>
          <dd>
          Presenta ISAC como capacidad nativa de 6G: la infraestructura
          celular como sensor, útil a la vez como herramienta de eficiencia
          de red y como plataforma de nuevos servicios [5], [9].
          </dd>
          </div>

        </dl>

        <p>
        La literatura también recoge ensayos de investigación que
        reutilizan estructuras de señal de redes móviles para sensing.
        Estos resultados experimentales no equivalen a una función
        normalizada ni a un despliegue comercial de ISAC [1].
        </p>

      </> },


      { id: "desafios", title: "Desafíos abiertos y por qué cuantificar el compromiso", content: <>

        <p>
        Que la visión sea convincente no significa que esté resuelta.
        Los desafíos abiertos de ISAC tocan todas las capas del sistema:
        </p>

        <ul>
        <li><strong>Compromisos de desempeño.</strong> Las métricas de comunicación y de sensado compiten por los mismos recursos en numerosos dominios: límites de teoría de la información, capa física, grados de libertad espaciales y diseño entre capas [1].</li>
        <li><strong>Hardware.</strong> El sensado acumula señales coherentemente durante mucho tiempo, así que es más sensible que la comunicación al ruido de fase, los desajustes de I/Q y las no linealidades del amplificador; y el radar monostático exige aislamiento de dúplex completo [8].</li>
        <li><strong>Sincronización.</strong> Entre dispositivos no sincronizados por cable, un reloj con 20 ppm de error acumula 20 ns en 1 ms: ese desfase equivale a 6 m de recorrido de la señal, o aproximadamente 3 m de error de distancia en una medición monostática de ida y vuelta [1].</li>
        <li><strong>Planificación de recursos.</strong> El eco de un objetivo aparece cuando el objetivo quiere: es un «atípico» que los planificadores de red, diseñados para dispositivos controlables, no sabían manejar [1].</li>
        <li><strong>Métricas y cotas.</strong> Todavía no hay una forma establecida de medir la ganancia de integración, ni una cota de Pareto que diga hasta dónde puede llegar el compromiso entre ambas eficiencias [1].</li>
        <li><strong>Privacidad y regulación.</strong> Una red que percibe es una red que observa: los requisitos de ISAC se estudian junto con sus implicaciones regulatorias [3].</li>
        </ul>

        <p>
        Para ver cómo aparecen esos errores, la figura de Huawei recorre
        una cadena de transmisión y recepción con ruido de fase,
        desviaciones de frecuencia y muestreo, no linealidades e
        interferencia entre transmisor y receptor.
        </p>

        <ReferenceFigure
          src="/images/isac/huawei/fig18-hardware-impairments.avif"
          alt="Cadena de transmisión ISAC con las imperfecciones de hardware que degradan el sensado"
          caption="Las imperfecciones que el sensado no perdona: ruido de fase, desviación de frecuencia, fluctuación de muestreo, no linealidades e interferencia de dúplex aparecen en toda la cadena de radio y el sensado coherente las acumula [8]."
          source="Fig. 18 de A. Bayesteh et al. (Huawei), «ISAC — From Concept to Practice», 2022. © Huawei; utilizado como referencia."
        />

        <p>
        De todos estos desafíos, hay uno que un estudiante de ingeniería
        puede tomar con las herramientas de un primer curso de
        comunicaciones: <strong>el compromiso por recursos compartidos</strong>.
        Si un nodo reparte su potencia entre comunicar y percibir, ¿qué le
        pasa a la tasa de datos cuando el radar recibe más? ¿Y al eco
        cuando gana la comunicación? Responder con ecuaciones —no con
        intuición— es exactamente el propósito del{" "}
        <Link to="/mini-caso">mini-caso técnico</Link> que sigue.
        </p>

      </> },

    ],
  },
  4: {
    headline: "Evaluar una señal que comunica y percibe.",
    introduction: "Construimos paso a paso el modelo del mini-caso: qué información trae el eco, qué papel juegan el ancho de banda y la potencia, cómo se reparte el recurso compartido mediante el parámetro α y qué ecuaciones conectan todo. Al llegar al explorador, cada variable tendrá un significado físico.",
    status: "Modelo hipotético ideal",

    sections: [

      { id: "escenario", title: "El escenario: un nodo, una señal y un objetivo", content: <>

        <p>
        Proponemos un escenario ISAC con arquitectura monostática: un mismo
        nodo transmite una señal OFDM hacia un usuario y, con esa misma
        señal, escucha el eco que regresa de un objetivo del entorno. El
        nodo tiene una potencia total limitada, un ancho de banda
        disponible y una portadora de 5,9 GHz, banda típica de
        comunicaciones vehiculares [2].
        </p>

        <p>
        Antes de observar un solo número conviene responder tres preguntas:
        qué información trae el eco, qué recursos se reparten ambas
        funciones y con qué ecuaciones se describe cada una. Este módulo
        construye esa base conceptual; el explorador interactivo, al
        final, la pone en movimiento.
        </p>

      </> },


      { id: "el-eco", title: "Qué significa «sensing»: leer el eco", content: <>

        <p>
        Cuando la señal encuentra un objeto, una pequeña parte de su
        energía regresa como eco. <strong>Sensing es leer ese eco</strong>:
        no se transmite una señal nueva para percibir, sino que se
        aprovecha la que ya viaja. El eco llega más tarde y con una
        frecuencia levemente desplazada, y esas dos huellas contienen la
        información física del objetivo [4].
        </p>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.delayAndDoppler} display />
        <small>
        El retardo τ depende de la distancia R: la señal recorre dos veces
        el camino, de ida y vuelta, a la velocidad de la luz c. El Doppler
        f_D depende de la velocidad radial v y de la portadora f_c.
        </small>
        </div>

        <p>
        Un objetivo a 80 m produce un eco que regresa 0,53 μs después de la
        transmisión; si se acerca a 15 m/s, su eco sube de frecuencia unos
        590 Hz. Medir retardo y Doppler equivale, respectivamente, a medir
        distancia y velocidad.
        </p>

        <p>
        En OFDM, ese eco afecta a cada subportadora con un giro de fase
        distinto. Tras compensar la señal transmitida, el receptor observa
        una respuesta que depende solo del objetivo:
        </p>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.echoResponse} display />
        <small>
        Modelo ideal del eco en la subportadora k y el símbolo m: β es la
        intensidad de la reflexión, τ su retardo y f_D su desplazamiento
        Doppler.
        </small>
        </div>

        <p>
        Al aplicar transformadas de frecuencia sobre esta respuesta se
        construye el <Link to="/glosario">mapa rango-Doppler</Link>: una
        representación donde cada pico potencial corresponde a un objetivo
        con cierta distancia y cierta velocidad radial. Declarar que un
        pico «es» un objetivo exige además una regla de detección, algo
        que este modelo ideal todavía no incluye.
        </p>

      </> },


      { id: "ancho-de-banda", title: "El papel del ancho de banda: la resolución de rango", content: <>

        <p>
        ¿Qué tan cerca pueden estar dos objetos para que el sistema los vea
        separados? Esa pregunta la responde la <strong>resolución de
        rango</strong>, y su respuesta depende directamente del ancho de
        banda B de la señal:
        </p>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.rangeResolution} display />
        <small>
        Δr: mínima distancia distinguible [m]; c: velocidad de la luz; B:
        ancho de banda de la señal [Hz].
        </small>
        </div>

        <p>
        La física es intuitiva: para distinguir dos ecos, la señal debe
        «verlos» en tiempos distintos. Un eco corto en el tiempo —que exige
        una señal de gran ancho de banda— ocupa poca duración y no se
        solapa con el eco del vecino. Con 20 MHz, Δr ≈ 7,5 m: dos objetivos
        separados menos de 7,5 metros aparecen como uno solo. Con 80 MHz,
        Δr ≈ 1,9 m. Más ancho de banda significa, literalmente, una mirada
        más fina sobre el rango.
        </p>

        <div className="example-block">
        <h3>El ancho de banda también es un recurso compartido</h3>

        <p>
        Para el radar, más B mejora la resolución de rango. Para la
        comunicación, más B aumenta la tasa alcanzable. Pero hay una
        tensión: el ruido térmico del receptor también crece
        proporcionalmente a B, de modo que repartir la señal en más
        espectro puede reducir la SNR disponible. El ancho de banda, como
        la potencia, es un recurso que ambas funciones comparten y que el
        diseño debe dosificar.
        </p>

        </div>

      </> },


      { id: "potencia", title: "El papel de la potencia: la SNR del eco", content: <>

        <p>
        ¿Y si el eco es tan débil que no se distingue del ruido? Para
        responder esa pregunta necesitamos la <strong>relación señal/ruido
        (SNR)</strong>: cuántas veces supera la potencia útil a la potencia
        del ruido en el receptor. Suele expresarse en decibeles:
        </p>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.snr} display />
        <small>
        SNR de 10 dB equivale a «diez veces más potencia útil que de
        ruido»; +3 dB significa duplicar la relación.
        </small>
        </div>

        <p>
        La potencia es el recurso más directo del compromiso ISAC.
        Dedicar más potencia al sensado fortalece el eco y mejora su SNR;
        pero esa potencia sale de algún lado: reducir la potencia de
        comunicaciones baja la SNR del enlace de datos y, con ella, la
        tasa de transmisión. Un watt no puede estar en dos funciones a la
        vez.
        </p>

      </> },


      { id: "reparto", title: "Cómo representar el reparto: el parámetro α", content: <>

        <p>
        Para estudiar el compromiso con una sola perilla, repartimos la
        potencia total del nodo entre las dos funciones:
        </p>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.powerSplit} display />
        <small>
        P_c: potencia para comunicaciones; P_s: potencia para sensing;
        P_total: potencia total del nodo; α: fracción asignada a
        comunicaciones.
        </small>
        </div>

        <p>
        α es un número entre 0 y 1. Con α = 1 el nodo dedica toda su
        potencia a comunicar y el sensing desaparece; con α = 0 ocurre lo
        contrario. Cada valor intermedio define un <em>punto de
        operación</em> con una tasa de datos y una SNR de radar
        específicas: al recorrer α de 0 a 1 se dibuja la curva de
        compromiso del sistema.
        </p>

        <p>
        ¿Y el punto medio α = 0,5? No es una ley de ISAC. El valor
        conveniente depende del escenario, de los requisitos de cada
        función y de cómo se ponderen sus resultados. Si en algún
        experimento aparece como punto de operación, es una conclusión de
        ese escenario estudiado, no una regla general de la tecnología.
        </p>

      </> },


      { id: "modelos", title: "Las dos ecuaciones del compromiso", content: <>

        <p>
        Con las variables definidas, solo falta una ecuación por función.
        Para la comunicación usamos la <strong>capacidad de
        Shannon</strong> de un canal con ruido gaussiano, alimentada por
        la SNR del enlace:
        </p>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.commSnr} display />
        <small>
        SNR de comunicaciones: |h|² modela la atenuación fija del canal,
        P_c = α·P_total es la potencia asignada y k·T₀·B·F es la potencia
        de ruido térmico (constante de Boltzmann, temperatura, ancho de
        banda y figura de ruido del receptor).
        </small>
        </div>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.shannonCapacity} display />
        <small>
        Tasa máxima teórica [bit/s] de un canal de ancho de banda B y SNR
        dada. Es una cota ideal: ningún esquema práctico la supera.
        </small>
        </div>

        <p>
        La lectura es directa: más banda o más SNR, más bits por segundo.
        Como P_c = α·P_total, cualquier aumento de α sube la tasa de
        datos… y deja menos potencia para el radar.
        </p>

        <p>
        Para el sensing, el eco que regresa del objetivo se describe con la
        forma monostática de la ecuación de radar, simplificada para el
        escenario de este mini-caso:
        </p>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.radarSnr} display />
        <small>
        SNR del eco: P_s = (1−α)·P_total es la potencia de sensing; G es la
        ganancia de antena, al cuadrado porque la misma antena transmite y
        recibe; λ la longitud de onda; σ la sección recta radar del
        objetivo; R la distancia al objetivo; k·T₀·B·F el ruido térmico
        del receptor.
        </small>
        </div>

        <p>
        Cada término tiene una lectura física. σ (sección recta radar)
        describe cuánto refleja el objetivo: un dron pequeño refleja mucho
        menos que un camión. El factor R⁴ es la firma del radar
        monostático: el eco viaja de ida y de vuelta, y en cada trayecto la
        potencia se diluye sobre una esfera que crece con la distancia;
        duplicar R reduce la SNR del eco dieciséis veces (−12 dB). Por eso
        detectar objetivos lejanos exige tanta potencia.
        </p>

        <Note title="Ambos modelos son simplificaciones declaradas">
        Las ecuaciones describen un solo objetivo, sin ecos del entorno
        (clutter), sin interferencia entre subportadoras y con antena y
        procesamiento ideales. Son las relaciones que el mini-caso utiliza
        para comprender el compromiso; no constituyen un modelo universal
        de todos los sistemas ISAC [1], [4].
        </Note>

      </> },


      { id: "kpis", title: "Los KPIs: qué observaremos y por qué", content: <>

        <p>
        El mini-caso observa cuatro indicadores, cada uno ligado a una
        variable y a una pregunta de ingeniería:
        </p>

        <div className="editorial-table-wrap" role="region" aria-label="KPIs del mini-caso" tabIndex={0}>
        <table>
        <caption>Indicadores del compromiso ISAC en el mini-caso</caption>
        <thead>
        <tr>
        <th scope="col">KPI</th>
        <th scope="col">Depende de</th>
        <th scope="col">Pregunta que responde</th>
        </tr>
        </thead>
        <tbody>
          <tr>
          <th scope="row">Tasa de datos</th>
          <td>α y B, a través de la SNR de comunicaciones</td>
          <td>¿Cuántos bits por segundo llegan al usuario?</td>
          </tr>
          <tr>
          <th scope="row">SNR de radar</th>
          <td>1−α, R y σ, a través de la ecuación de radar</td>
          <td>¿El eco se distingue del ruido?</td>
          </tr>
          <tr>
          <th scope="row">Resolución de rango</th>
          <td>Ancho de banda B</td>
          <td>¿A qué distancia mínima se separan dos objetivos?</td>
          </tr>
          <tr>
          <th scope="row">Resolución de velocidad</th>
          <td>Tiempo de observación (M símbolos)</td>
          <td>¿Qué tan próximas pueden ser dos velocidades distinguibles?</td>
          </tr>
        </tbody>
        </table>
        </div>

        <div className="equation" tabIndex={0}>
        <Formula tex={FORMULAS.velocityResolution} display />
        <small>
        Resolución de velocidad [m/s]: se reduce —mejora— observando la
        señal durante más tiempo (más símbolos M); f_c es la portadora.
        </small>
        </div>

        <p>
        Así se cierra el mapa conceptual: α controla la potencia, B controla
        la resolución y aparece en ambas relaciones señal/ruido, y el
        tiempo de observación gobierna la velocidad. Mover α desplaza el
        sistema sobre la curva tasa ↔ SNR de radar; mover B cambia la
        «finura» del sensado y la capacidad del enlace a la vez.
        </p>

      </> },


      { id: "explorador", title: "Explora el compromiso", content: <>

        <p>
        El explorador pone en movimiento la parte implementada del
        mini-caso: con la potencia total fija, puedes variar el ancho de
        banda B, el número de símbolos observados M y la posición y
        velocidad del objetivo, y observar cómo responden la resolución de
        rango, la resolución de velocidad, el retardo y el Doppler del
        eco.
        </p>

        <OfdmExplorer />

        <div className="example-block">
        <h3>Cómo leer el explorador con lo aprendido</h3>

        <p>
        Al subir B, la resolución de distancia baja —la ecuación c/(2B) en
        acción— mientras la tasa bruta crece: el mismo recurso beneficia a
        ambas funciones, aunque también agranda el ruido térmico del
        receptor. Al subir M, la resolución de velocidad mejora porque el
        sistema observa el movimiento durante más tiempo. Cambiar la
        distancia o la velocidad del objetivo desplaza el eco (τ, f_D),
        pero no cambia la resolución del sistema. La «tasa bruta QPSK» es
        una cuenta determinista de símbolos por segundo, no la capacidad
        de Shannon: sirve como orden de magnitud del enlace.
        </p>

        </div>

        <Note title="Qué todavía no muestra el explorador">
        Esta primera versión trabaja con relaciones ideales deterministas.
        Las curvas de tasa de datos y de SNR de radar en función de α, el
        ruido, el canal real y la detección de objetivos son la siguiente
        etapa del mini-caso; las ecuaciones de este módulo ya las
        anticipan.
        </Note>

      </> },


      { id: "validacion", title: "De la predicción a la simulación", content: <>

        <p>
        Las relaciones ideales del mini-caso son el primer paso, no el
        último. Para acercarse a escenarios reales, el modelo debe
        incorporar elementos adicionales como ruido, características del
        canal inalámbrico, interferencias y algoritmos de procesamiento de
        recepción.
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
        <ol className="editorial-steps"><li><h3>Una infraestructura que percibe</h3><p>ISAC integra el transporte de datos y la percepción del entorno, y ambas funciones pueden ayudarse mutuamente: la red comunica, percibe y entiende.</p></li><li><h3>Una forma de onda con doble propósito</h3><p>DFRC conecta comunicación y radar. OFDM ofrece una estructura de subportadoras y símbolos para estudiarlo.</p></li><li><h3>El eco contiene información</h3><p>Retardo y Doppler ayudan a describir la distancia y el movimiento de un objetivo.</p></li><li><h3>Una métrica no cuenta toda la historia</h3><p>BER, detección y resolución responden a preguntas distintas. El diseño necesita considerarlas juntas.</p></li><li><h3>Las aplicaciones dan sentido al modelo</h3><p>Transporte, drones, interiores e industria permiten plantear escenarios concretos de investigación.</p></li></ol>
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
        <p>Las fichas académicas fueron verificadas contra los registros de DOI (Crossref) y las páginas de sus editores; corregimos las dos entradas cuyos autores o títulos no coincidían con la publicación real. Añadimos también las fuentes industriales citadas a lo largo de los módulos.</p>
        <ol className="reference-list">
          <li><span>[1]</span><div><h3>Integrated Sensing and Communications: Toward Dual-Functional Wireless Networks for 6G and Beyond</h3><p>F. Liu, Y. Cui, C. Masouros, J. Xu, T. X. Han, Y. C. Eldar y S. Buzzi. <em>IEEE Journal on Selected Areas in Communications</em>, vol. 40, n.º 6, pp. 1728–1767, 2022.</p><a href="https://doi.org/10.1109/JSAC.2022.3156632">DOI: 10.1109/JSAC.2022.3156632</a><p className="editorial-caption">Ficha corregida: la guía atribuía el artículo a autores de otra publicación. Artículo de acceso abierto (CC BY 4.0 según sus metadatos), útil como tutorial del compromiso ISAC.</p></div></li>
          <li><span>[2]</span><div><h3>Enabling Joint Communication and Radar Sensing in Mobile Networks—A Survey</h3><p>J. A. Zhang, M. L. Rahman, K. Wu, X. Huang, Y. J. Guo, S. Chen y J. Yuan. <em>IEEE Communications Surveys & Tutorials</em>, vol. 24, n.º 1, pp. 306–345, 2022.</p><a href="https://doi.org/10.1109/COMST.2021.3122519">DOI: 10.1109/COMST.2021.3122519</a><p className="editorial-caption">Ficha corregida: la guía mezclaba un título distinto con una lista parcial de autores. Encuesta sobre OFDM-DFRC y detección con señales de redes móviles.</p></div></li>
          <li><span>[3]</span><div><h3>Study on Integrated Sensing and Communication</h3><p>3GPP · TR 22.837 · Release 19 (versión 19.4.0, 2024).</p><a href="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=4044">Consultar el informe en 3GPP</a><p className="editorial-caption">Informe técnico de estudio de casos de uso y requisitos; confirmado en el portal 3GPP (SA 1).</p></div></li>
          <li><span>[4]</span><div><h3>An Overview of Signal Processing Techniques for Joint Communication and Radar Sensing</h3><p>J. A. Zhang, F. Liu, C. Masouros, R. W. Heath, Z. Feng, L. Zheng y A. Petropulu. <em>IEEE Journal of Selected Topics in Signal Processing</em>, vol. 15, n.º 6, pp. 1295–1315, 2021.</p><a href="https://doi.org/10.1109/JSTSP.2021.3113120">DOI: 10.1109/JSTSP.2021.3113120</a><p className="editorial-caption">Ficha verificada; base de la formulación retardo-Doppler usada en el mini-caso.</p></div></li>
          <li><span>[5]</span><div><h3>6G ISAC insights for future mobile connectivity</h3><p>Qualcomm Research · página de investigación.</p><a href="https://www.qualcomm.com/research/6g/isac">qualcomm.com/research/6g/isac</a><p className="editorial-caption">Visión industrial de ISAC como capacidad de 6G: sensado con la misma infraestructura celular.</p></div></li>
          <li><span>[6]</span><div><h3>Integrated Sensing and Communication (ISAC) in 6G</h3><p>Qualcomm · documento técnico.</p><a href="https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/6G-ISAC.pdf">Descargar el PDF</a><p className="editorial-caption">Documento técnico con casos de uso y principios de diseño; complementa la referencia [5].</p></div></li>
          <li><span>[7]</span><div><h3>Integrated Sensing and Communication (ISAC)</h3><p>Ericsson · página 6G.</p><a href="https://www.ericsson.com/en/6g/isac">ericsson.com/en/6g/isac</a><p className="editorial-caption">Qué es ISAC, por qué importa, casos de uso, arquitectura y línea de tiempo hacia 6G.</p></div></li>
          <li><span>[8]</span><div><h3>Integrated Sensing and Communication (ISAC) — From Concept to Practice</h3><p>A. Bayesteh, J. He, Y. Chen, P. Zhu, J. Ma, A. W. Shaban, Z. Yu, Y. Zhang, Z. Zhou y G. Wang (equipo de investigación 6G de Huawei). HuaweiTech, 2022.</p><a href="https://www.huawei.com/en/huaweitech/future-technologies/integrated-sensing-communication-concept-practice">Consultar el artículo en HuaweiTech</a><p className="editorial-caption">Niveles de integración de sensing y comunicación, casos de uso y dos estudios de caso (localización e imagen milimétrica).</p></div></li>
          <li><span>[9]</span><div><h3>Qualcomm sees 6G ISAC as both a network efficiency tool and a new service platform</h3><p>RCR Wireless News · contenido patrocinado, abril de 2026.</p><a href="https://www.rcrwireless.com/20260423/sponsored/qualcomm-6g-isac">Consultar la nota en RCR Wireless</a><p className="editorial-caption">Contenido patrocinado que presenta la perspectiva de Qualcomm sobre posibles aplicaciones de ISAC en 6G; no es evidencia de un despliegue.</p></div></li>
          <li><span>[10]</span><div><h3>Soli: Ubiquitous Gesture Sensing with Millimeter Wave Radar</h3><p>J. Lien, N. Gillian, M. E. Karagozler, P. Amihood, C. Schwesig, E. Olson, H. Raja e I. Poupyrev. <em>ACM Transactions on Graphics</em>, vol. 35, n.º 4, artículo 142, 2016.</p><a href="https://doi.org/10.1145/2897824.2925953">DOI: 10.1145/2897824.2925953</a><p className="editorial-caption">Sistema de sensing por radar milimétrico para reconocimiento de gestos; ejemplo relacionado, no sistema ISAC.</p></div></li>
        </ol>
      </> },
      { id: "conversacion", title: "Conversemos sobre lo aprendido", content: <ForumInvitation /> },
    ],
  },
};
