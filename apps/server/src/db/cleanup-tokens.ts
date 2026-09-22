import postgres from "postgres";
import { requirePostgresUrl } from "./url.js";

const databaseUrl = requirePostgresUrl(process.env.DATABASE_URL, "DATABASE_URL");

const isLocal = /(?:localhost|127\.0\.0\.1)/u.test(databaseUrl);
const client = postgres(databaseUrl, {
  max: 1,
  ssl: process.env.DATABASE_SSL === "false" || isLocal ? false : "require",
});

try {
  const [result] = await client.begin(async (transaction) => {
    const accountTokens = await transaction`
      delete from app.account_tokens
      where greatest(expires_at, coalesce(consumed_at, '-infinity'::timestamptz))
        < now() - interval '7 days'
      returning id
    `;
    const refreshTokens = await transaction`
      delete from app.refresh_tokens
      where greatest(
        expires_at,
        coalesce(used_at, '-infinity'::timestamptz),
        coalesce(revoked_at, '-infinity'::timestamptz)
      ) < now() - interval '30 days'
      returning id
    `;
    return [{ accountTokens: accountTokens.length, refreshTokens: refreshTokens.length }];
  });
  console.log(JSON.stringify({ level: "info", event: "expired_tokens_cleaned", ...result }));
} finally {
  await client.end({ timeout: 5 });
}
