import { z } from "zod";

const booleanFromEnv = z.enum(["true", "false"]).transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  APP_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().refine((value) => /^postgres(?:ql)?:\/\//u.test(value)),
  DATABASE_SSL: booleanFromEnv.default(true),
  DATABASE_PREPARE: booleanFromEnv.default(true),
  DB_MAX_CONNECTIONS: z.coerce.number().int().min(1).max(20).default(5),
  JWT_ACCESS_SECRET: z.string().min(32),
  COOKIE_SECURE: booleanFromEnv.default(true),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65_535).default(465),
  SMTP_USER: z.string().email(),
  SMTP_APP_PASSWORD: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  WEB_DIST_PATH: z.string().optional(),
});

export interface AppConfig {
  nodeEnv: "development" | "test" | "production";
  port: number;
  appOrigin: string;
  databaseUrl: string;
  databaseSsl: boolean;
  databasePrepare: boolean;
  databaseMaxConnections: number;
  jwtAccessSecret: string;
  cookieSecure: boolean;
  trustProxyHops: number;
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  webDistPath?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Configuración inválida o incompleta: ${fields}`);
  }

  const value = parsed.data;
  return {
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    appOrigin: new URL(value.APP_ORIGIN).origin,
    databaseUrl: value.DATABASE_URL,
    databaseSsl: value.DATABASE_SSL,
    databasePrepare: value.DATABASE_PREPARE,
    databaseMaxConnections: value.DB_MAX_CONNECTIONS,
    jwtAccessSecret: value.JWT_ACCESS_SECRET,
    cookieSecure: value.COOKIE_SECURE,
    trustProxyHops: value.TRUST_PROXY_HOPS,
    smtp: {
      host: value.SMTP_HOST,
      port: value.SMTP_PORT,
      user: value.SMTP_USER,
      password: value.SMTP_APP_PASSWORD,
      from: value.MAIL_FROM,
    },
    google: {
      clientId: value.GOOGLE_CLIENT_ID,
      clientSecret: value.GOOGLE_CLIENT_SECRET,
      redirectUri: value.GOOGLE_REDIRECT_URI,
    },
    ...(value.WEB_DIST_PATH ? { webDistPath: value.WEB_DIST_PATH } : {}),
  };
}
