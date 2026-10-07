async (page) => {
  const base = "http://127.0.0.1:5173";
  const checks = [];
  const add = (name, pass, actual, expected) => checks.push({ name, pass, actual, expected });
  const mapPattern = "**/src/components/BibliometricMap.tsx*";
  await page.route("**/api/**", (route) => route.fulfill({ status: 401, contentType: "application/json",
    body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Sin sesión" } }) }));
  await page.route(mapPattern, async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    const pattern = /import\s+Sigma\s+from\s+["'][^"']+["'];?/u;
    if (!pattern.test(source)) throw new Error("No se pudo observar Sigma mediante su API pública");
    const observer = `if (!window.__resourceObserver) { const original = Sigma.prototype.setSetting; window.__resourceObserver = { prototype: Sigma.prototype, original }; window.__resourceRenderers = []; Sigma.prototype.setSetting = function(...args) { const result = original.apply(this, args); if (!window.__resourceRenderers.includes(this)) window.__resourceRenderers.push(this); return result; }; }`;
    await route.fulfill({ response, body: source.replace(pattern, (match) => `${match}\n${observer}`) });
  });

  try {
    for (const width of [360, 768]) {
      await page.setViewportSize({ width, height: width === 360 ? 800 : 1024 });
      await page.goto(`${base}/mini-caso`);
      await page.locator(".ofdm-explorer").waitFor();
      const equations = page.locator("main article .equation");
      for (let i = 0; i < await equations.count(); i++) {
        const equation = equations.nth(i);
        const before = await equation.evaluate((element) => ({ overflow: element.scrollWidth - element.clientWidth, tabIndex: element.tabIndex }));
        if (before.overflow <= 1) continue;
        await equation.focus();
        await equation.evaluate((element) => { element.scrollLeft = 0; });
        await page.keyboard.press("ArrowRight");
        const right = await equation.evaluate((element) => element.scrollLeft);
        await page.keyboard.press("ArrowLeft");
        const left = await equation.evaluate((element) => element.scrollLeft);
        add("equation-keyboard-local-scroll", before.tabIndex >= 0 && right > 0 && left === 0,
          { width, index: i, before, right, left }, "ArrowRight scrolls locally; ArrowLeft returns to origin");
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      add("equation-no-global-overflow", overflow <= 1, { width, overflow }, "<= 1 CSS px");
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/analisis`);
    await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
    await page.waitForFunction(() => window.__resourceRenderers?.length > 0);
    const network = await page.evaluate(async () => JSON.parse((await (await fetch("/data/isac/vosviewer-cooccurrence-network.json")).text()).replace(/^\uFEFF/u, "")).network);
    const rendererResult = async (state = {}) => {
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      return page.evaluate(async ({ network, state }) => {
        const { rendererDifferences } = await import("/tests/helpers/resource-oracles.js");
        const renderer = window.__resourceRenderers.at(-1);
        const graph = renderer.getGraph();
        const nodeReducer = renderer.getSetting("nodeReducer");
        const edgeReducer = renderer.getSetting("edgeReducer");
        const observed = {
          nodes: graph.nodes().map((id) => {
            const attributes = graph.getNodeAttributes(id), reduced = nodeReducer(id, attributes);
            return { id, label: attributes.label, x: attributes.x, y: attributes.y, cluster: attributes.cluster,
              baseSize: attributes.size, renderedSize: reduced.size ?? attributes.size };
          }),
          edges: graph.edges().map((id) => {
            const attributes = graph.getEdgeAttributes(id), [source, target] = graph.extremities(id), reduced = edgeReducer(id, attributes);
            return { source, target, strength: attributes.strength, baseSize: attributes.size,
              visible: (reduced.hidden ?? attributes.hidden) !== true, renderedSize: reduced.size ?? attributes.size };
          }),
        };
        return rendererDifferences(network, observed, state);
      }, { network, state });
    };

    const fullDifferences = await rendererResult();
    add("renderer-full-network-conserved", fullDifferences.length === 0, fullDifferences.slice(0, 10), "same coordinates, nodes, links and global projection");
    const selected = network.items.find((item) => item.label === "integrated sensing");
    await page.getByRole("textbox", { name: "Buscar un término" }).fill(selected.label);
    await page.getByRole("list", { name: "Términos coincidentes" }).locator("button").filter({ hasText: /^integrated sensing\s*Clúster/u }).click();
    await page.locator(".bibliometric-detail h3").getByText(selected.label, { exact: true }).waitFor();
    const selectedDifferences = await rendererResult({ selected: selected.id });
    add("renderer-selected-edges-drawable", selectedDifferences.length === 0, selectedDifferences.slice(0, 10), "all selected connections have the expected visible size");
    await page.getByRole("combobox", { name: "Explorar agrupación" }).selectOption("1");
    await page.locator(".bibliometric-detail h3").getByText("Clúster 1", { exact: true }).waitFor();
    const clusterDifferences = await rendererResult({ cluster: 1 });
    add("renderer-cluster-edges-drawable", clusterDifferences.length === 0, clusterDifferences.slice(0, 10), "top 1000 focused cluster connections retain rendered size");
    await page.getByRole("button", { name: "Ver mapa completo", exact: true }).click();
    await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
    const resetDifferences = await rendererResult();
    add("renderer-reset-conserved", resetDifferences.length === 0, resetDifferences.slice(0, 10), "same full network after reset");

    const region = page.locator(".bibliometric-map");
    const originalWidth = await region.evaluate((element) => element.style.maxWidth);
    await region.evaluate((element) => { element.style.maxWidth = "240px"; });
    const geometry = await page.evaluate(() => {
      const bounds = (selector) => { const rect = document.querySelector(selector).getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width }; };
      return { region: bounds(".bibliometric-explorer"), plot: bounds(".bibliometric-plot"), detail: bounds(".bibliometric-detail") };
    });
    add("map-reflows-to-container-width", geometry.plot.width > 0 && geometry.detail.right <= geometry.region.right + 1 && geometry.detail.top >= geometry.plot.bottom - 1, geometry, "plot remains visible and detail stacks within 240px container");
    await region.evaluate((element, width) => { element.style.maxWidth = width; }, originalWidth);

    const report = { status: checks.every((check) => check.pass) ? "GREEN" : "RED", checks };
    await page.evaluate((value) => { window.__resourceGreenResults = value; }, report);
    return { status: report.status, passed: checks.filter((check) => check.pass).length,
      failed: checks.filter((check) => !check.pass).length, failures: checks.filter((check) => !check.pass) };
  } finally {
    await page.evaluate(() => {
      const observer = window.__resourceObserver;
      if (observer) observer.prototype.setSetting = observer.original;
    });
    await page.unroute(mapPattern);
  }
}
