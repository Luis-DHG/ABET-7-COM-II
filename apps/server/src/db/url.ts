export function requirePostgresUrl(value: string | undefined, variableName: string): string {
  if (!value) throw new Error(`${variableName} es obligatoria`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} debe ser una URL PostgreSQL válida`);
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error(`${variableName} debe comenzar por postgres:// o postgresql://; la URL https:// del proyecto Supabase no es una conexión de base de datos`);
  }
  return value;
}
