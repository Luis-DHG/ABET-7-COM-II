import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { AppError } from "../http/errors.js";

const SCRYPT_N = 32_768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;
const JWT_ISSUER = "blogdpc";
const ACCESS_AUDIENCE = "blogdpc-web";
const GOOGLE_STATE_AUDIENCE = "blogdpc-google-state";

const accessClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  emailVerified: z.boolean(),
});

const googleStateSchema = z.object({
  state: z.string().min(1),
  nonce: z.string().min(1),
  codeVerifier: z.string().min(1),
});

export type AccessClaims = z.infer<typeof accessClaimsSchema>;
export type GoogleState = z.infer<typeof googleStateSchema>;

function deriveKey(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, { N: n, r, p, maxmem: SCRYPT_MAX_MEMORY }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P);
  return ["scrypt", "v1", SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, version, nText, rText, pText, saltText, keyText] = encoded.split("$");
  if (!algorithm || algorithm !== "scrypt" || version !== "v1" || !nText || !rText || !pText || !saltText || !keyText) {
    return false;
  }

  const n = Number(nText);
  const r = Number(rText);
  const p = Number(pText);
  if (![n, r, p].every(Number.isSafeInteger) || n <= 1 || r <= 0 || p <= 0 || n > SCRYPT_N) return false;

  try {
    const expected = Buffer.from(keyText, "base64url");
    const actual = await deriveKey(password, Buffer.from(saltText, "base64url"), n, r, p);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(claims: AccessClaims, secret: string): Promise<string> {
  return new SignJWT({
    email: claims.email,
    displayName: claims.displayName,
    role: claims.role,
    emailVerified: claims.emailVerified,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuer(JWT_ISSUER)
    .setAudience(ACCESS_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secretKey(secret));
}

export async function verifyAccessToken(token: string, secret: string): Promise<AccessClaims> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: ACCESS_AUDIENCE,
    });
    return accessClaimsSchema.parse(payload);
  } catch {
    throw new AppError(401, "AUTH_REQUIRED", "La sesión no es válida o expiró.");
  }
}

export async function signGoogleState(state: GoogleState, secret: string): Promise<string> {
  return new SignJWT(state)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(JWT_ISSUER)
    .setAudience(GOOGLE_STATE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey(secret));
}

export async function verifyGoogleState(token: string, secret: string): Promise<GoogleState> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: GOOGLE_STATE_AUDIENCE,
    });
    return googleStateSchema.parse(payload);
  } catch {
    throw new AppError(400, "GOOGLE_STATE_INVALID", "La solicitud de Google expiró o no es válida.");
  }
}
