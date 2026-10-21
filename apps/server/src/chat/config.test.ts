import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../config.js";

// Todas las variables runtime son ficticias; no se lee .env ni process.env.
function fakeEnv(): NodeJS.ProcessEnv {
  return {
    PORT: "3000",
    APP_ORIGIN: "https://blog.example.invalid",
    DATABASE_URL: "postgresql://fake_user:fake_password@db.example.invalid:5432/fake_blog",
    DATABASE_SSL: "true",
    DATABASE_PREPARE: "true",
    DB_MAX_CONNECTIONS: "5",
    JWT_ACCESS_SECRET: "fake-jwt-secret-with-more-than-thirty-two-characters",
    COOKIE_SECURE: "true",
    TRUST_PROXY_HOPS: "1",
    SMTP_HOST: "smtp.example.invalid",
    SMTP_PORT: "465",
    SMTP_USER: "fake-mailer@example.invalid",
    SMTP_APP_PASSWORD: "fake-smtp-password",
    MAIL_FROM: "BlogDPC Test <fake-mailer@example.invalid>",
    GOOGLE_CLIENT_ID: "fake-google-client-id",
    GOOGLE_CLIENT_SECRET: "fake-google-client-secret",
    GOOGLE_REDIRECT_URI: "https://blog.example.invalid/api/auth/google/callback",
    WEB_DIST_PATH: "fake-web-dist",
    NVIDIA_NIM_API_KEY: "fake-nvidia-api-key",
    OPENROUTER_API_KEY: "fake-openrouter-api-key",
    GEMINI_API_KEY: "fake-gemini-api-key",
  };
}

test("loadConfig devuelve chat con las tres claves del entorno completo", () => {
  // Cast solo de tipos: no añade chat en runtime ni oculta su ausencia al assert.
  const config = loadConfig(fakeEnv()) as ReturnType<typeof loadConfig> & { chat?: unknown };

  assert.deepEqual(config.chat, {
    nvidiaApiKey: "fake-nvidia-api-key",
    openrouterApiKey: "fake-openrouter-api-key",
    geminiApiKey: "fake-gemini-api-key",
  });
});

for (const key of ["NVIDIA_NIM_API_KEY", "OPENROUTER_API_KEY", "GEMINI_API_KEY"] as const) {
  for (const state of ["ausente", "vacía"] as const) {
    test(`loadConfig rechaza ${key} ${state} con solo el nombre del campo, sin valores`, () => {
      const env = fakeEnv();
      if (state === "ausente") {
        delete env[key];
      } else {
        env[key] = "";
      }

      assert.throws(() => loadConfig(env), {
        name: "Error",
        message: `Configuración inválida o incompleta: ${key}`,
      });
    });
  }
}
