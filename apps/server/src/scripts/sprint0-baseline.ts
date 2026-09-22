// Sprint 0: baseline cuantitativo del foro antes de optimizar (plan.md §Sprint 0).
// Corre las tres consultas de forum/module.ts list() con EXPLAIN (ANALYZE, BUFFERS),
// recolecta pg_stat_statements / índices y, si BASELINE_HTTP_URL está definida,
// mide p50/p95 HTTP de GET /api/comments. Escribe el resultado en docs/sprint0-baseline.json.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { requirePostgresUrl } from "../db/url.js";

const databaseUrl = requirePostgresUrl(process.env.DATABASE_URL, "DATABASE_URL");
const isLocal = /(?:localhost|127\.0\.0\.1)/u.test(databaseUrl);
const client = postgres(databaseUrl, {
  max: 2,
  ssl: process.env.DATABASE_SSL === "false" || isLocal ? false : "require",
});

interface SectionResult {
  ok: boolean;
  note?: string;
  [key: string]: unknown;
}

async function section(run: () => Promise<Record<string, unknown>>): Promise<SectionResult> {
  try {
    return { ok: true, ...(await run()) };
  } catch (error) {
    return { ok: false, note: error instanceof Error ? error.message : "error desconocido" };
  }
}

async function explain(label: string, statement: string): Promise<Record<string, unknown>> {
  const rows = await client.unsafe(`explain (analyze, buffers, format json) ${statement}`);
  const plan = (rows[0] as Record<string, unknown>)["QUERY PLAN"] as {
    "Execution Time": number;
    "Planning Time": number;
    Plan: { "Node Type": string; "Shared Hit Blocks"?: number; "Shared Read Blocks"?: number };
  }[];
  const [entry] = plan;
  if (!entry) throw new Error(`EXPLAIN vacío para ${label}`);
  return {
    label,
    executionMs: entry["Execution Time"],
    planningMs: entry["Planning Time"],
    node: entry.Plan["Node Type"],
    sharedHitBlocks: entry.Plan["Shared Hit Blocks"] ?? 0,
    sharedReadBlocks: entry.Plan["Shared Read Blocks"] ?? 0,
    plan,
  };
}

const httpUrl = process.env.BASELINE_HTTP_URL;
const outputPath = process.env.BASELINE_OUT
  ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../../docs/sprint0-baseline.json");

const startedAt = new Date().toISOString();
const result: Record<string, unknown> = { generatedAt: startedAt, databaseHost: new URL(databaseUrl).host };

try {
  result.tables = await section(async () => {
    const [row] = await client<{ comments: number; users: number; deepThreads: number }[]>`
      select
        (select count(*)::int from app.comments) as comments,
        (select count(*)::int from app.users) as users,
        (
          select count(distinct root_id)::int from app.comments
          where extensions.nlevel(path) > 2
        ) as "deepThreads"
    `;
    return row ?? {};
  });

  const rootIds = (await client<{ id: string }[]>`
    select id from app.comments where parent_id is null
    order by created_at desc, id desc limit 20
  `).map((row) => row.id);
  const rootIdList = rootIds.length > 0
    ? `(${rootIds.map((id) => `'${id}'::uuid`).join(",")})`
    : "(null::uuid)";
  const sampleRootId = rootIds[0] ?? "00000000-0000-0000-0000-000000000000";

  result.explain = await section(async () => ({
    // Réplicas de las tres consultas de forum/module.ts list() (limit=20 → 21 filas).
    rootsPage: await explain("list: raíces paginadas", `
      select c.id, c.parent_id, c.root_id, c.path, c.body, c.is_removed, c.created_at, u.display_name
      from app.comments c
      join app.users u on u.id = c.author_id
      where c.parent_id is null
      order by c.created_at desc, c.id desc
      limit 21
    `),
    directReplies: await explain("list: respuestas directas (nivel 2)", `
      select c.id, c.parent_id, c.root_id, c.path, c.body, c.is_removed, c.created_at, u.display_name
      from app.comments c
      join app.users u on u.id = c.author_id
      where c.root_id in ${rootIdList}
        and extensions.nlevel(c.path) = 2
      order by c.created_at asc, c.id asc
    `),
    deepThreads: await explain("list: existencia de conversación profunda", `
      select c.root_id
      from app.comments c
      where c.root_id in ${rootIdList}
        and extensions.nlevel(c.path) > 2
      group by c.root_id
    `),
    thread: await explain("hilo completo por raíz", `
      select c.id, c.parent_id, c.root_id, c.path, c.body, c.is_removed, c.created_at, u.display_name
      from app.comments c
      join app.users u on u.id = c.author_id
      where c.root_id = '${sampleRootId}'::uuid
      order by c.created_at asc, c.id asc
    `),
  }));

  result.pgStatStatements = await section(async () => {
    const rows = await client<{
      calls: number;
      totalMs: number;
      meanMs: number;
      query: string;
    }[]>`
      select
        s.calls::int,
        round(s.total_exec_time::numeric, 2) as "totalMs",
        round(s.mean_exec_time::numeric, 2) as "meanMs",
        left(regexp_replace(s.query, '\\s+', ' ', 'g'), 160) as query
      from pg_stat_statements s
      where s.query ilike '%comments%'
      order by s.total_exec_time desc
      limit 10
    `;
    return { rows };
  });

  result.indexes = await section(async () => {
    const rows = await client<{
      name: string;
      sizeBytes: number;
      scans: number;
    }[]>`
      select
        i.indexname as name,
        pg_relation_size(format('%I.%I', i.schemaname, i.indexname))::int as "sizeBytes",
        coalesce(s.idx_scan, 0)::int as scans
      from pg_indexes i
      left join pg_stat_user_indexes s
        on s.schemaname = i.schemaname and s.indexrelname = i.indexname
      where i.schemaname = 'app'
      order by i.tablename, i.indexname
    `;
    return { rows };
  });

  if (httpUrl) {
    result.http = await section(async () => {
      const samples: number[] = [];
      let bytes = 0;
      for (let i = 0; i < 105; i += 1) {
        const start = performance.now();
        const response = await fetch(`${httpUrl}/api/comments?limit=20`, {
          headers: { Origin: httpUrl },
        });
        const body = await response.arrayBuffer();
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (i >= 5) {
          samples.push(performance.now() - start);
          bytes = body.byteLength;
        }
      }
      samples.sort((a, b) => a - b);
      const pick = (ratio: number) => samples[Math.min(samples.length - 1, Math.floor(samples.length * ratio))]!;
      return {
        requests: samples.length,
        p50Ms: Math.round(pick(0.5) * 100) / 100,
        p95Ms: Math.round(pick(0.95) * 100) / 100,
        maxMs: Math.round(samples.at(-1)! * 100) / 100,
        responseBytes: bytes,
      };
    });
  } else {
    result.http = { ok: false, note: "BASELINE_HTTP_URL no definida; medición HTTP omitida." };
  }

  console.log(JSON.stringify(result, null, 2));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.error(`baseline escrito en ${outputPath}`);
} finally {
  await client.end({ timeout: 5 });
}
