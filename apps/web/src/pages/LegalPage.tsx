import { Link } from "react-router-dom";

const CONTACT_EMAIL = "chaconvargasfabiancamilo@gmail.com";

interface LegalDoc {
  title: string;
  summary: string;
  crossLink: { to: string; label: string };
  sections: { title: string; paragraphs: string[] }[];
}

const DOCUMENTS: Record<string, LegalDoc> = {
  privacidad: {
    title: "Política de Tratamiento de Datos Personales",
    summary: "Qué datos se recogen, con qué finalidad y cómo ejercer tus derechos sobre ellos.",
    crossLink: { to: "/terminos", label: "Términos y condiciones" },
    sections: [
      {
        title: "Responsable",
        paragraphs: [
          "El responsable del tratamiento es el Grupo 3, equipo responsable de BlogDPC.",
        ],
      },
      {
        title: "Datos que tratamos y para qué",
        paragraphs: [
          "Al crear una cuenta tratamos tu nombre visible y correo electrónico. Si utilizas el inicio de sesión con Google, tratamos la información necesaria para identificar tu cuenta. Las contraseñas no se guardan en texto legible.",
          "Usamos estos datos para crear y administrar cuentas, verificar correos, permitir el inicio de sesión y restablecer contraseñas, así como para proteger el servicio. No vendemos tus datos ni los usamos para publicidad.",
          "Si publicas en el foro, tratamos el nombre visible y el contenido del comentario para mostrarlo allí. El foro es público: quienes lo visiten pueden ver ese nombre y comentario. El correo electrónico no se muestra públicamente.",
        ],
      },
      {
        title: "Proveedores y almacenamiento",
        paragraphs: [
          "La base de datos, el servidor y los registros operativos del proyecto se alojan en servicios ubicados en West US, según la configuración definida para BlogDPC. Para operar el sitio se utilizan proveedores de alojamiento, base de datos, correo electrónico e inicio de sesión con Google. Estos procesan la información necesaria para prestar esos servicios; el Grupo 3 no vende tus datos ni los destina a fines publicitarios.",
          "Los registros técnicos se almacenan en Supabase. No guardamos direcciones IP de forma persistente. La IP puede procesarse temporalmente en memoria para limitar solicitudes repetidas a los servicios de autenticación.",
        ],
      },
      {
        title: "Cookies y sesiones",
        paragraphs: [
          "El sitio utiliza cookies técnicas necesarias para iniciar y mantener sesiones y completar el inicio de sesión con Google. No se usan para publicidad. Las cookies de sesión tienen una duración limitada y cuentan con protecciones de seguridad en producción.",
        ],
      },
      {
        title: "Retención y eliminación",
        paragraphs: [
          "La fecha prevista de cierre del proyecto es el 31 de marzo de 2027. En esa fecha, el Grupo 3 eliminará la base de datos y los registros del proyecto. El equipo no conservará copias de respaldo.",
          "La aplicación no ofrece una función para eliminar una cuenta individual. Para consultas o solicitudes sobre tus datos, puedes escribir al correo indicado en esta política.",
        ],
      },
      {
        title: "Tus derechos",
        paragraphs: [
          "Puedes comunicarte con el Grupo 3 para solicitar información sobre el tratamiento de tus datos o pedir su actualización, rectificación o supresión, conforme a las normas aplicables. El equipo revisará las solicitudes recibidas a través del correo de contacto.",
        ],
      },
    ],
  },
  terminos: {
    title: "Términos y condiciones",
    summary: "Condiciones de uso de BlogDPC, sus cuentas y el foro de retroalimentación.",
    crossLink: { to: "/privacidad", label: "Política de datos personales" },
    sections: [
      {
        title: "El servicio",
        paragraphs: [
          "BlogDPC es un sitio educativo sobre Integrated Sensing and Communications (ISAC), redes perceptivas 6G y temas relacionados. Incluye contenido informativo y un foro público de retroalimentación.",
        ],
      },
      {
        title: "Cuenta y acceso",
        paragraphs: [
          "Para participar en el foro necesitas una cuenta y un correo verificado. Puedes crear la cuenta con correo y contraseña o iniciar sesión mediante Google. Eres responsable de mantener la confidencialidad de tus credenciales.",
          "Al crear una cuenta aceptas estos términos y la Política de Tratamiento de Datos Personales.",
        ],
      },
      {
        title: "Participación en el foro",
        paragraphs: [
          "La lectura del foro es pública. Si publicas un comentario, tu nombre visible y el contenido se mostrarán a quienes visiten el sitio; tu correo electrónico no se muestra públicamente.",
          "Los comentarios deben ser texto plano, tener entre 3 y 2000 caracteres y pueden formar conversaciones de hasta seis niveles. La plataforma aplica un intervalo entre publicaciones consecutivas.",
          "La aplicación no incluye opciones para editar o eliminar comentarios individualmente.",
        ],
      },
      {
        title: "Contenido que publicas",
        paragraphs: [
          "Conservas tus derechos sobre los comentarios que escribas. Al publicarlos, autorizas a BlogDPC, de manera no exclusiva y limitada, a almacenarlos y mostrarlos dentro del foro, y a realizar las operaciones técnicas necesarias para prestar ese servicio. Esta autorización no incluye el uso de tus comentarios para publicidad ni para otros fines promocionales.",
        ],
      },
      {
        title: "Contenido educativo",
        paragraphs: [
          "Los contenidos de BlogDPC tienen fines educativos y de divulgación. Se presentan como material informativo y no garantizan resultados técnicos particulares.",
        ],
      },
      {
        title: "Proveedores y datos",
        paragraphs: [
          "Los proveedores tecnológicos necesarios para alojar el servicio, almacenar datos, enviar correos y permitir el inicio de sesión con Google pueden procesar la información necesaria para prestar esas funciones. El Grupo 3 no vende los datos ni los destina a publicidad.",
        ],
      },
      {
        title: "Cierre del proyecto",
        paragraphs: [
          "El cierre de BlogDPC está previsto para el 31 de marzo de 2027. En esa fecha, el Grupo 3 eliminará la base de datos y los registros del proyecto. El equipo no conservará copias de respaldo. La aplicación no permite eliminar una cuenta individual desde el sitio.",
        ],
      },
    ],
  },
};

export default function LegalPage({ kind }: { kind: "privacidad" | "terminos" }) {
  const doc = DOCUMENTS[kind];
  return (
    <article className="max-w-prose space-y-6 break-words">
      <title>{`${doc.title} | BlogDPC · ISAC`}</title>
      <meta name="description" content={doc.summary} />
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{doc.title}</h1>
        <p className="text-muted-foreground">{doc.summary}</p>
      </header>

      {doc.sections.map((section, index) => (
        <section key={section.title} aria-labelledby={`${kind}-${index + 1}`} className="space-y-3">
          <h2 id={`${kind}-${index + 1}`} className="text-lg font-semibold tracking-tight">
            {index + 1}. {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed">{paragraph}</p>
          ))}
        </section>
      ))}

      <p className="text-sm text-muted-foreground">
        Consultas sobre este documento:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <p className="text-sm">
        Documento relacionado:{" "}
        <Link to={doc.crossLink.to} className="text-primary underline underline-offset-4">
          {doc.crossLink.label}
        </Link>
      </p>
    </article>
  );
}
