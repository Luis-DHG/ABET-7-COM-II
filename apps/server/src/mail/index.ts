import nodemailer from "nodemailer";
import type { AppConfig } from "../config.js";

export interface Mailer {
  sendVerification(input: { email: string; displayName: string; token: string }): Promise<void>;
  sendPasswordReset(input: { email: string; displayName: string; token: string }): Promise<void>;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/gu, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function link(appOrigin: string, path: string, token: string): string {
  const url = new URL(path, appOrigin);
  url.searchParams.set("token", token);
  return url.toString();
}

function renderAuthEmail(input: {
  preheader: string;
  title: string;
  greeting: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
  note: string;
}): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f4f7fb;color:#172033;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dbe3ef;border-radius:16px;overflow:hidden;">
          <tr><td style="background:#14213d;padding:28px 32px;color:#ffffff;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#b9c9e8;">BlogDPC · ISAC</p>
            <h1 style="margin:0;font-size:28px;line-height:1.2;">${escapeHtml(input.title)}</h1>
          </td></tr>
          <tr><td style="padding:32px;">
            <p style="margin:0 0 18px;font-size:17px;line-height:1.5;">Hola <strong>${escapeHtml(input.greeting)}</strong>,</p>
            <p style="margin:0 0 26px;font-size:16px;line-height:1.7;color:#43506a;">${escapeHtml(input.message)}</p>
            <p style="margin:0 0 26px;text-align:center;"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#1769e0;border-radius:10px;color:#ffffff;font-size:16px;font-weight:bold;padding:14px 24px;text-decoration:none;">${escapeHtml(input.actionLabel)}</a></p>
            <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#68758c;">${escapeHtml(input.note)}</p>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#68758c;">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="${escapeHtml(input.actionUrl)}" style="color:#1769e0;word-break:break-all;">${escapeHtml(input.actionUrl)}</a></p>
          </td></tr>
          <tr><td style="border-top:1px solid #e7edf5;padding:20px 32px;color:#7b879b;font-size:12px;line-height:1.6;">Este mensaje fue enviado automáticamente por BlogDPC · ISAC.<br>Si no solicitaste esta acción, puedes ignorarlo.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function createMailer(config: AppConfig): Mailer {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });

  return {
    async sendVerification(input) {
      const url = link(config.appOrigin, "/verificar-correo", input.token);
      await transporter.sendMail({
        from: config.smtp.from,
        to: input.email,
        subject: "Confirma tu correo · BlogDPC ISAC",
        text: `Hola ${input.displayName},

Gracias por crear tu cuenta en BlogDPC · ISAC. Confirma tu correo para participar en la retroalimentación del proyecto:
${url}

Este enlace vence en 24 horas. Si no solicitaste esta cuenta, puedes ignorar este mensaje.

Equipo BlogDPC · ISAC`,
        html: renderAuthEmail({
          preheader: "Confirma tu correo para participar en BlogDPC · ISAC.",
          title: "Confirma tu correo",
          greeting: input.displayName,
          message: "Gracias por crear tu cuenta. Confirma tu correo para participar en las conversaciones y compartir tu retroalimentación sobre el proyecto.",
          actionLabel: "Verificar mi correo",
          actionUrl: url,
          note: "Este enlace es válido durante 24 horas y solo puede utilizarse una vez.",
        }),
      });
    },
    async sendPasswordReset(input) {
      const url = link(config.appOrigin, "/restablecer-contrasena", input.token);
      await transporter.sendMail({
        from: config.smtp.from,
        to: input.email,
        subject: "Restablece tu contraseña · BlogDPC ISAC",
        text: `Hola ${input.displayName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en BlogDPC · ISAC:
${url}

Este enlace vence en una hora. Si no solicitaste este cambio, puedes ignorar este mensaje.

Equipo BlogDPC · ISAC`,
        html: renderAuthEmail({
          preheader: "Restablece de forma segura tu contraseña de BlogDPC · ISAC.",
          title: "Restablece tu contraseña",
          greeting: input.displayName,
          message: "Recibimos una solicitud para cambiar la contraseña de tu cuenta. Usa el botón para continuar de forma segura.",
          actionLabel: "Restablecer contraseña",
          actionUrl: url,
          note: "Este enlace es válido durante una hora y solo puede utilizarse una vez.",
        }),
      });
    },
  };
}
