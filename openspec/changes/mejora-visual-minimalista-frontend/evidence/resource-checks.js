async (page) => {
  const base = "http://127.0.0.1:5173", checks = [], inherited = [], negativeControls = [];
  const add = (name, pass, actual, scope) => checks.push({ name, pass, actual, scope });
  const json = async (path) => {
    const response = await page.request.get(`${base}${path}`);
    if (!response.ok()) throw new Error(`Fixture/dato no disponible ${path}: ${response.status()}`);
    return JSON.parse((await response.text()).replace(/^\uFEFF/u, ""));
  };
  const golden = await json("/tests/fixtures/science-baseline.json");
  const { network } = await json("/data/isac/vosviewer-cooccurrence-network.json");
  await page.unroute("**/api/**");
  await page.route("**/api/**", (route) => route.fulfill({ status: 401, json: { error: { code: "UNAUTHENTICATED", message: "Sin sesión" } } }));
  // Observador transitorio de un método PUBLICO en el navegador real. No subclase,
  // no mock de WebGL, no React fibers/refs ni acceso a campos privados. Se llama
  // siempre el método original, se conserva retorno y se limpia al finalizar.
  const mapPattern = "**/src/components/BibliometricMap.tsx*";
  await page.route(mapPattern, async (route) => {
    const response = await route.fetch(), source = await response.text();
    const pattern = /import\s+Sigma\s+from\s+["'][^"']+["'];?/u;
    if (!pattern.test(source)) throw new Error("Inspector no instalable: import Sigma no localizado; no es un RED de producto");
    const observer = `
if (!window.__resourceObserver) {
  const original = Sigma.prototype.setSetting;
  window.__resourceObserver = { prototype: Sigma.prototype, original };
  window.__resourceRenderers = [];
  Sigma.prototype.setSetting = function(...args) {
    const result = original.apply(this, args);
    if (!window.__resourceRenderers.includes(this)) window.__resourceRenderers.push(this);
    return result;
  };
}
`;
    await route.fulfill({ response, body: source.replace(pattern, (match) => `${match}\n${observer}`) });
  });
  const frames = () => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const renderer = async (state = {}) => {
    await frames();
    return page.evaluate(async ({ network, state }) => {
      const { rendererDifferences } = await import("/tests/helpers/resource-oracles.js");
      const instance = window.__resourceRenderers?.at(-1);
      if (!instance) throw new Error("Inspector sin instancia pública; no certificar reducers");
      const graph = instance.getGraph();
      const nodeReducer = instance.getSetting("nodeReducer");
      const edgeReducer = instance.getSetting("edgeReducer");
      if (typeof nodeReducer !== "function" || typeof edgeReducer !== "function") throw new Error("Sigma aún no tiene reducers instalados; esperar al siguiente frame");
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
      const differences = rendererDifferences(network, observed, state);
      const negative = structuredClone(observed);
      negative.nodes[0].x += 0.001;
      const negativeErrors = rendererDifferences(network, negative, state);
      const sizeNegative = structuredClone(observed);
      sizeNegative.nodes[0].renderedSize += 1;
      return { nodes: observed.nodes.length, edges: observed.edges.length, visible: observed.edges.filter((edge) => edge.visible).length,
        differences, coordinateMutationDetected: negativeErrors.some((error) => error.endsWith(":x")),
        sizeMutationDetected: rendererDifferences(network, sizeNegative, state).some((error) => error.endsWith(":selected-size")) };
    }, { network, state });
  };
  try {
    for (const viewport of [{ width: 360, height: 800 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      for (const route of ["planeacion", "tendencias", "mini-caso", "analisis"]) {
        await page.goto(`${base}/${route}`);
        await page.locator("main article h1").waitFor();
        if (route === "analisis") await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
        const expected = await json(`/tests/fixtures/editorial/${route}.json`);
        const expectedImages = expected.sections.flatMap((section) => section.images);
        const images = page.locator("main article figure img");
        const observedImages = [];
        for (let i = 0; i < await images.count(); i++) {
          const image = images.nth(i);
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((img) => img.decode().catch(() => {}));
          const observation = await image.evaluate((img) => {
            const figure = img.closest("figure"), caption = figure.querySelector("figcaption"), s = getComputedStyle(img);
            const box = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
            const text = (el) => (el?.textContent ?? "").replace(/\s+/gu, " ").trim();
            return { src: img.getAttribute("src"), alt: img.getAttribute("alt"), caption: text(caption), sourceOrLicense: text(figure.querySelector(".figure-source")) || null,
              loaded: img.complete && img.naturalWidth > 0, natural: [img.naturalWidth, img.naturalHeight], image: box(img), figure: box(figure), captionBox: box(caption),
              objectFit: s.objectFit, captionUnclipped: caption.scrollHeight <= caption.clientHeight + 1 && box(caption).bottom <= box(figure).bottom + 1,
              proportional: img.naturalWidth > 0 && (s.objectFit === "contain" || Math.abs(box(img).width / box(img).height - img.naturalWidth / img.naturalHeight) < 0.01) };
          });
          observedImages.push(Object.fromEntries(["src", "alt", "caption", "sourceOrLicense"].map((key) => [key, observation[key]])));
          if (!observation.loaded && observation.src === "/images/oddm-isac-paper.png") inherited.push({ name: "ODDM-asset-preexisting-missing", route, width: viewport.width, observation });
          else add("figure-proportion-caption-unclipped", observation.loaded && observation.proportional && observation.captionUnclipped, observation, `${route}@${viewport.width}`);
          const link = image.locator("xpath=ancestor::a[1]");
          if (await link.count()) {
            await page.keyboard.press("Tab"); await link.focus();
            const focused = await link.evaluate((el) => {
              const s = getComputedStyle(el), r = el.getBoundingClientRect(), f = el.closest("figure").getBoundingClientRect();
              const outside = Math.max(0, parseFloat(s.outlineWidth) + parseFloat(s.outlineOffset));
              return { outline: [s.outlineStyle, s.outlineWidth, s.outlineOffset], focused: document.activeElement === el,
                unclipped: r.left - outside >= f.left - 1 && r.right + outside <= f.right + 1 && r.top - outside >= f.top - 1 && r.bottom + outside <= f.bottom + 1 };
            });
            add("figure-link-keyboard-focus", focused.focused && focused.outline[0] !== "none" && focused.unclipped, focused, `${route}@${viewport.width}`);
          }
        }
        add("figure-association-copy-multiplicity", JSON.stringify(observedImages) === JSON.stringify(expectedImages), { observed: observedImages, expected: expectedImages }, `${route}@${viewport.width}`);
        const scrolls = page.locator('main .editorial-table-wrap, main .equation');
        for (let i = 0; i < await scrolls.count(); i++) {
          const el = scrolls.nth(i);
          const before = await el.evaluate((el) => ({ overflow: el.scrollWidth - el.clientWidth, keyboard: el.tabIndex >= 0, name: el.getAttribute("aria-label"), table: Boolean(el.querySelector("table")), width: el.clientWidth }));
          if (before.overflow > 1) {
            await el.scrollIntoViewIfNeeded(); await el.focus(); await el.evaluate((el) => { el.scrollLeft = 0; });
            await page.keyboard.press("ArrowRight"); await frames();
            const after = await el.evaluate((el) => ({ left: el.scrollLeft, outline: getComputedStyle(el).outlineStyle,
              focused: document.activeElement === el, globalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
            add("local-scroll-keyboard-no-global-overflow", before.keyboard && after.left > 0 && after.outline !== "none" && after.globalOverflow <= 1, { before, after }, `${route}@${viewport.width}:${i}`);
          }
        }
        if (route === "analisis") {
          const geometry = await page.evaluate(() => {
            const box = (selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
            return { plot: box(".bibliometric-plot"), detail: box(".bibliometric-detail"), region: box(".bibliometric-explorer") };
          });
          add("map-host-positive-contained", geometry.plot.width > 0 && geometry.plot.height > 0 && geometry.detail.right <= geometry.region.right + 1, geometry, `${route}@${viewport.width}`);
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/analisis`);
    await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
    await page.waitForFunction(() => window.__resourceRenderers?.length > 0);
    let result = await renderer();
    add("renderer-full-network-domain-and-cache", result.differences.length === 0, result, "map:full");
    negativeControls.push({ from: "actual public renderer projection", coordinate: result.coordinateMutationDetected, renderedSize: result.sizeMutationDetected });
    const term = network.items.find((item) => item.label === "integrated sensing");
    const search = page.getByRole("textbox", { name: "Buscar un término" });
    await search.fill("integrated sensing");
    const suggestion = page.getByRole("list", { name: "Términos coincidentes" }).locator("button").filter({ hasText: /^integrated sensing\s*Clúster/u });
    await suggestion.focus(); await page.keyboard.press("Enter");
    await page.locator(".bibliometric-detail h3").getByText(term.label, { exact: true }).waitFor();
    result = await renderer({ selected: term.id });
    add("renderer-selection-preserved", result.differences.length === 0, result, `map:term:${term.id}`);
    const metrics = await page.locator(".bibliometric-detail dl > div").evaluateAll((rows) => rows.map((row) => [row.querySelector("dt").textContent, row.querySelector("dd").textContent]));
    const format = (value) => value.toLocaleString("es-CO", { maximumFractionDigits: 2 });
    const wanted = [["Ocurrencias", format(term.weights.Occurrences)], ["Enlaces", format(term.weights.Links)], ["Fuerza total de enlace", format(term.weights["Total link strength"])], ...Object.entries(term.scores ?? {}).map(([label, value]) => [label, format(value)])];
    add("map-selected-metrics", JSON.stringify(metrics) === JSON.stringify(wanted), { metrics, wanted }, "map:selected");
    await page.getByRole("combobox", { name: "Explorar agrupación" }).selectOption("1");
    await page.locator(".bibliometric-detail h3").getByText("Clúster 1", { exact: true }).waitFor();
    result = await renderer({ cluster: 1 });
    add("renderer-cluster-preserved", result.differences.length === 0, result, "map:cluster:1");
    await page.getByRole("button", { name: "Ver mapa completo", exact: true }).click();
    await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
    result = await renderer();
    add("map-reset-state-and-renderer", result.differences.length === 0 && await search.inputValue() === "" && await page.getByRole("combobox", { name: "Explorar agrupación" }).inputValue() === "", result, "map:reset");
    // Misma ventana desktop, menos espacio real en la región; no se exige un
    // breakpoint ni una anchura mínima inventada. Detail debe caber y host >0.
    const region = page.locator(".bibliometric-map");
    const originalWidth = await region.evaluate((el) => el.style.maxWidth);
    await region.evaluate((el) => { el.style.maxWidth = "240px"; });
    await frames();
    const constrained = await page.evaluate(() => {
      const b = (selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width }; };
      return { region: b(".bibliometric-explorer"), plot: b(".bibliometric-plot"), detail: b(".bibliometric-detail"), viewport: innerWidth };
    });
    add("map-responsive-to-available-space", constrained.plot.width > 0 && constrained.detail.right <= constrained.region.right + 1 && constrained.detail.top >= constrained.plot.bottom - 1, constrained, "map:desktop-region-240px");
    await region.evaluate((el, width) => { el.style.maxWidth = width; }, originalWidth);

    await page.goto(`${base}/mini-caso`);
    await page.locator(".ofdm-explorer").waitFor();
    const actualControls = await page.locator('.ofdm-explorer input[type="range"]').evaluateAll((elements) => elements.map((el) => ({ key: el.id.replace("ofdm-", ""), min: Number(el.min), max: Number(el.max), step: Number(el.step), value: Number(el.value), ariaValue: el.getAttribute("aria-valuetext") })));
    add("ofdm-controls-defaults-limits-steps", actualControls.length === 4 && golden.ofdm.controls.every((control) => { const actual = actualControls.find((a) => a.key === control.key); return actual && actual.min === control.min && actual.max === control.max && actual.step === control.step && actual.value === golden.ofdm.defaults[control.key] && actual.ariaValue === `${actual.value} ${control.unit}`; }), actualControls, "ofdm:defaults");
    const display = async (outputs) => page.evaluate(async (outputs) => {
      const { ofdmDisplayDifferences } = await import("/tests/helpers/resource-oracles.js");
      const actual = { metrics: [...document.querySelectorAll(".ofdm-explorer .metric-grid > div")].map((row) => {
        const dd = row.querySelector("dd"); return [row.querySelector("dt").textContent.trim(), dd.firstChild.textContent.trim(), dd.querySelector("small").textContent.trim()]; }), echo: document.querySelector(".echo-readout").textContent };
      return { actual, differences: ofdmDisplayDifferences(outputs, actual) };
    }, outputs);
    let ofdm = await display(golden.ofdm.outputs);
    add("ofdm-six-visible-outputs-default", ofdm.differences.length === 0, ofdm, "ofdm:default");
    for (const control of golden.ofdm.controls) {
      const input = page.locator(`#ofdm-${control.key}`);
      await input.focus(); await page.keyboard.press("Home"); await page.keyboard.press("ArrowRight");
      add("ofdm-native-keyboard-step", Number(await input.inputValue()) === control.min + control.step, await input.inputValue(), control.key);
    }
    for (const corner of golden.ofdm.corners) {
      for (const control of golden.ofdm.controls) {
        await page.locator(`#ofdm-${control.key}`).focus();
        await page.keyboard.press(corner.parameters[control.key] === control.min ? "Home" : "End");
      }
      ofdm = await display(corner.outputs);
      add("ofdm-corner-display-conservation", ofdm.differences.length === 0, ofdm, JSON.stringify(corner.parameters));
    }
    await page.getByRole("button", { name: "Restablecer valores", exact: true }).click();
    ofdm = await display(golden.ofdm.outputs);
    const resetValues = await page.locator('.ofdm-explorer input[type="range"]').evaluateAll((elements) => Object.fromEntries(elements.map((el) => [el.id.replace("ofdm-", ""), Number(el.value)])));
    add("ofdm-reset-values-outputs", ofdm.differences.length === 0 && JSON.stringify(resetValues) === JSON.stringify(golden.ofdm.defaults), { resetValues, ofdm }, "ofdm:reset");
    const tabular = await page.locator(".ofdm-explorer .metric-grid dd").evaluateAll((elements) => elements.map((el) => getComputedStyle(el).fontVariantNumeric));
    add("ofdm-tabular-results", tabular.every((value) => value.includes("tabular-nums")), tabular, "ofdm:presentation");
    const zones = await page.evaluate(() => ({ fieldset: Boolean(document.querySelector(".ofdm-explorer fieldset legend")), live: document.querySelector(".explorer-results")?.getAttribute("aria-live"), separate: document.querySelector(".explorer-controls")?.contains(document.querySelector(".explorer-results")) === false }));
    add("ofdm-parameters-results-distinct-live", zones.fieldset && zones.live === "polite" && zones.separate, zones, "ofdm:presentation");
    const report = { status: checks.every((check) => check.pass) ? "GREEN" : "RED", checks, inherited, negativeControls,
      limitations: ["No cámara/duración/reduced-motion, foro o auth RED", "No certifica equivalencia pixel a pixel WebGL, contraste completo ni todos los términos/clústeres", "Region 240px es una fixture de espacio disponible, no un cambio de producto", "Missing PNG ODDM es bloqueo heredado separado"] };
    await page.evaluate((report) => { window.__resourceChecks = report; }, report);
    return { status: report.status, passed: checks.filter((c) => c.pass).length, failed: checks.filter((c) => !c.pass).length, failures: checks.filter((c) => !c.pass), inherited: inherited.map(({ name, route, width }) => ({ name, route, width })), negativeControls };
  } finally {
    await page.evaluate(() => { const observer = window.__resourceObserver; if (observer) observer.prototype.setSetting = observer.original; });
    await page.unroute(mapPattern);
  }
}
