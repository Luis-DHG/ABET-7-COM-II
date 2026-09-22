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
        subject: "Verifica tu correo en BlogDPC",
        text: `Hola ${input.displayName}, verifica tu correo abriendo este enlace: ${url}`,
        html: `<p>Hola ${escapeHtml(input.displayName)},</p><p>Verifica tu correo abriendo <a href="${escapeHtml(url)}">este enlace</a>.</p>`,
      });
    },
    async sendPasswordReset(input) {
      const url = link(config.appOrigin, "/restablecer-contrasena", input.token);
      await transporter.sendMail({
        from: config.smtp.from,
        to: input.email,
        subject: "Restablece tu contraseña de BlogDPC",
        text: `Hola ${input.displayName}, restablece tu contraseña abriendo este enlace: ${url}`,
        html: `<p>Hola ${escapeHtml(input.displayName)},</p><p>Restablece tu contraseña abriendo <a href="${escapeHtml(url)}">este enlace</a>. El enlace vence en una hora.</p>`,
      });
    },
  };
}
