import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

type Manifest = Record<string, unknown>;

// La ruta no depende del cwd ni de que el manifiesto raíz declare type: module.
const workspaceRoot = new URL("../../../", import.meta.url);

function readManifest(relativePath: string): Manifest {
  const url = new URL(relativePath, workspaceRoot);
  assert.ok(existsSync(url), `Falta ${fileURLToPath(url)}: el workspace necesita su manifiesto`);
  const manifest: unknown = JSON.parse(readFileSync(url, "utf8"));
  assert.ok(manifest !== null && typeof manifest === "object" && !Array.isArray(manifest),
    `${relativePath} debe contener un objeto JSON`);
  return manifest as Manifest;
}

function scriptSteps(manifest: Manifest, name: string): string[][] {
  const scripts = manifest.scripts;
  assert.ok(scripts !== null && typeof scripts === "object" && !Array.isArray(scripts),
    `Debe existir scripts.${name}`);
  const script = (scripts as Record<string, unknown>)[name];
  assert.ok(typeof script === "string" && script.trim().length > 0,
    `scripts.${name} debe ser un comando no vacío`);

  // Comparamos las cadenas && autorizadas, no el formato JSON o sus espacios.
  return script.split("&&").map((command) => {
    const tokens = command.trim().split(/\s+/u);
    // pnpm <script> y pnpm run <script> son la misma delegación pública.
    if (tokens[0] === "pnpm" && tokens.at(-2) === "run") tokens.splice(-2, 1);
    return tokens;
  });
}

function assertWorkspaceManifest(root: Manifest) {
  assert.equal(root.private, true, "El workspace raíz no debe publicarse");

  for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    if (root[field] === undefined) continue;
    const dependencies = root[field];
    assert.ok(dependencies !== null && typeof dependencies === "object" && !Array.isArray(dependencies),
      `${field} debe ser un mapa vacío o estar ausente`);
    assert.deepEqual(Object.keys(dependencies), [], `La reparación no puede añadir ${field}`);
  }

  const packages = [
    { path: "packages/contracts/package.json", name: "@blogdpc/contracts", scripts: ["build", "check"] },
    { path: "apps/server/package.json", name: "@blogdpc/server", scripts: ["build", "check", "test", "dev"] },
    { path: "apps/web/package.json", name: "@blogdpc/web", scripts: ["build", "check", "test", "lint"] },
  ];
  for (const entry of packages) {
    const manifest = readManifest(entry.path);
    assert.equal(manifest.name, entry.name, `El filtro debe resolver ${entry.path}`);
    for (const script of entry.scripts) scriptSteps(manifest, script);
  }

  const expected: Record<string, string[][]> = {
    check: [
      ["pnpm", "--filter", "@blogdpc/contracts", "build"],
      ["pnpm", "-r", "check"],
    ],
    lint: [["pnpm", "--filter", "@blogdpc/web", "lint"]],
    test: [
      ["pnpm", "--filter", "@blogdpc/server", "test"],
      ["pnpm", "--filter", "@blogdpc/web", "test"],
    ],
    build: [
      ["pnpm", "--filter", "@blogdpc/contracts", "build"],
      ["pnpm", "--filter", "@blogdpc/server", "build"],
      ["pnpm", "--filter", "@blogdpc/web", "build"],
    ],
    dev: [["pnpm", "--filter", "@blogdpc/server", "dev"]],
  };
  for (const [script, steps] of Object.entries(expected)) {
    assert.deepEqual(scriptSteps(root, script), steps,
      `scripts.${script} debe delegar en los paquetes existentes en el orden autorizado, usando &&`);
  }
  // No fijamos name, version, type ni packageManager: no forman parte de este contrato.
}

test("el manifiesto raíz privado orquesta los scripts existentes sin añadir dependencias", () => {
  assertWorkspaceManifest(readManifest("package.json"));
});

test("el comparador rechaza regresiones reales en manifiestos simulados sin escribir la raíz", () => {
  // Fixture canónica de los comandos autorizados; el control no depende del SUT.
  const original = JSON.parse(readFileSync(new URL("./fixtures/workspace-manifest.json", import.meta.url), "utf8")) as Manifest;
  assertWorkspaceManifest(original);
  const withoutBuild = structuredClone(original);
  (withoutBuild.scripts as Record<string, string>).check = "pnpm -r check";
  assert.throws(() => assertWorkspaceManifest(withoutBuild), /scripts\.check debe delegar/u);

  const withoutWebTests = structuredClone(original);
  (withoutWebTests.scripts as Record<string, string>).test = "pnpm --filter @blogdpc/server test";
  assert.throws(() => assertWorkspaceManifest(withoutWebTests), /scripts\.test debe delegar/u);

  assert.throws(() => assertWorkspaceManifest({ ...original, private: false }), /no debe publicarse/u);
  assert.throws(() => assertWorkspaceManifest({ ...original, dependencies: { accidental: "1.0.0" } }),
    /no puede añadir dependencies/u);
  assertWorkspaceManifest(original);
});
