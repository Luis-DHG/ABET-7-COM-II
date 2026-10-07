async (page) => {
  // Ejecutar con browser_run_code_unsafe(filename). Solo API mock; no backend/BD.
  const base = "http://127.0.0.1:5173";
  const routes = ["/planeacion", "/analisis", "/mini-caso"];
  const viewports = [{ width: 360, height: 800 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }];
  const checks = [];
  const assets = [];
  const add = (name, pass, actual, expected, route, width) => checks.push({ name, pass, actual, expected, route, width });
  await page.route("**/api/**", (route) => route.fulfill({
    status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Sin sesión" } }),
  }));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(`${base}${route}`);
      await page.locator("main article h1").waitFor();
      if (route === "/analisis") await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
      if (route === "/mini-caso") await page.locator(".ofdm-explorer").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const readings = await page.evaluate(() => {
        const style = (el) => getComputedStyle(el);
        const box = (el) => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height, top: r.top, bottom: r.bottom }; };
        const prose = [...document.querySelectorAll(".editorial-section > p:not(.editorial-caption)")].map((p) => {
          const s = style(p);
          // Medida ch con la misma fuente real, no ancho basado en un literal CSS.
          const probe = document.createElement("span");
          probe.style.cssText = `position:absolute;visibility:hidden;width:68ch;font:${s.font};letter-spacing:${s.letterSpacing}`;
          document.body.append(probe);
          const ch68 = probe.getBoundingClientRect().width;
          probe.remove();
          return { font: parseFloat(s.fontSize), lineRatio: parseFloat(s.lineHeight) / parseFloat(s.fontSize),
            max: parseFloat(s.maxWidth), width: box(p).width, available: box(p.parentElement).width, ch68, align: s.textAlign };
        });
        const progress = [...document.querySelectorAll(".module-hero ol[aria-hidden] li")].map((li) => {
          const s = style(li); return { height: box(li).height, background: s.backgroundColor, border: s.borderColor, borderWidth: s.borderWidth, opacity: s.opacity };
        });
        const number = Number(document.querySelector(".module-hero")?.textContent.match(/Módulo (\d) de 7/u)?.[1]);
        const targets = [...document.querySelectorAll('body > #root button, main input, main select, main textarea, main [data-slot="button"], header [data-slot="button"]')]
          .filter((el) => el.getClientRects().length && style(el).visibility !== "hidden")
          .map((el) => ({ label: el.getAttribute("aria-label") || el.textContent.trim() || el.id || el.tagName, ...box(el) }));
        const hero = document.querySelector(".module-hero"), index = document.querySelector('nav[aria-label="En este módulo"] details');
        const root = style(document.documentElement);
        const images = [...document.querySelectorAll("main img")].map((img) => ({ src: img.getAttribute("src"), complete: img.complete, naturalWidth: img.naturalWidth }));
        return { prose, progress, number, targets, images, indexOpen: index.open,
          heroMinHeight: style(hero).minHeight, heroHeight: box(hero).height,
          heroGap: box(document.querySelector(".editorial-grid")).top - box(hero.querySelector(".module-meta")).bottom,
          heroOrder: [...hero.querySelectorAll('.module-subject,h1,.module-introduction,.module-meta')].map((el) =>
            el.matches("h1") ? "headline" : el.matches(".module-subject") ? "subject" : el.matches(".module-introduction") ? "introduction" : "metadata"),
          width: innerWidth, dpr: devicePixelRatio, scale: visualViewport.scale,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          motionFast: root.getPropertyValue("--motion-fast").trim(), motionNormal: root.getPropertyValue("--motion-normal").trim() };
      });
      add("prose-17px", readings.prose.length > 0 && readings.prose.every((p) => Math.abs(p.font - 17) < 0.05), readings.prose.map((p) => p.font), 17, route, viewport.width);
      add("prose-line-1.75", readings.prose.every((p) => Math.abs(p.lineRatio - 1.75) < 0.01), readings.prose.map((p) => p.lineRatio), 1.75, route, viewport.width);
      add("prose-68ch", readings.prose.every((p) => Math.abs(p.max - p.ch68) < 1 && p.width <= Math.min(p.available, p.ch68) + 1), readings.prose.map(({ max, ch68, width, available }) => ({ max, ch68, width, available })), "68ch cap; bounded by available width", route, viewport.width);
      add("motion-tokens", readings.motionFast === "120ms" && readings.motionNormal === "160ms", [readings.motionFast, readings.motionNormal], ["120ms", "160ms"], route, viewport.width);
      const neutral = readings.progress.filter((_, index) => index !== readings.number - 1);
      const current = readings.progress[readings.number - 1];
      add("location-not-completed", readings.progress.length === 7 && neutral.every((p) => JSON.stringify(p) === JSON.stringify(neutral[0])) && JSON.stringify(current) !== JSON.stringify(neutral[0]), readings.progress, "solo la posición actual recibe énfasis; otras seis neutrales", route, viewport.width);
      add("targets-44", readings.targets.length > 0 && readings.targets.every((t) => t.width >= 44 - 0.5 && t.height >= 44 - 0.5), readings.targets.filter((t) => t.width < 43.5 || t.height < 43.5), "44x44 CSS px", route, viewport.width);
      add("index-responsive", readings.indexOpen === (readings.width >= 768), readings.indexOpen, readings.width >= 768, route, viewport.width);
      add("hero-order", readings.number >= 1 && JSON.stringify(readings.heroOrder) === JSON.stringify(["subject", "headline", "introduction", "metadata"]), readings.heroOrder, "ubicación antes de nombre/headline/intro/meta", route, viewport.width);
      add("hero-content-gap", (readings.heroMinHeight === "auto" || parseFloat(readings.heroMinHeight) === 0) && readings.heroGap <= 48 + 1, { minHeight: readings.heroMinHeight, gap: readings.heroGap }, "altura determinada por contenido (auto/0); gap tras metadatos <=48px", route, viewport.width);
      add("no-global-overflow", readings.overflow <= 1, readings.overflow, "<=1px", route, viewport.width);
      assets.push({ route, width: viewport.width, images: readings.images });

      // Semántica de ubicación en el menú realmente abierto, no clases del JSX.
      if (viewport.width < 768) await page.getByRole("button", { name: "Abrir menú de navegación" }).click();
      else await page.getByRole("button", { name: "Módulos", exact: true }).click();
      const active = await page.evaluate((route) => {
        const candidates = [...document.querySelectorAll(`[role="menu"] a[href="${route}"], nav[aria-label="Móvil"] a[href="${route}"]`)].filter((a) => a.getClientRects().length);
        return candidates.map((a) => ({ text: a.textContent.trim(), current: a.getAttribute("aria-current"), weight: getComputedStyle(a).fontWeight }));
      }, route);
      add("active-navigation-semantic", active.some((a) => a.current === "page" || a.current === "location"), active, "aria-current page/location en destino activo del menú", route, viewport.width);
      await page.keyboard.press("Escape");
    }
  }
  // Campos de las primitivas compartidas: ruta existente, sin enviar formulario.
  await page.goto(`${base}/login`);
  await page.getByRole("heading", { name: "Ingresar", exact: true }).waitFor();
  const fields = await page.locator('main input:not([type="hidden"])').evaluateAll((elements) => elements.map((el) => ({ id: el.id, height: el.getBoundingClientRect().height, width: el.getBoundingClientRect().width })));
  add("fields-44", fields.length > 0 && fields.every((field) => field.height >= 43.5 && field.width >= 43.5), fields, "44x44 CSS px", "/login", 1440);
  await page.goto(`${base}/`);
  await page.locator("main article h1").waitFor();
  add("root-redirect", new URL(page.url()).pathname === "/planeacion", page.url(), "/planeacion", "/", 1440);
  const result = { fixture: "anonymous API 401, all API intercepted before navigation", status: checks.every((c) => c.pass) ? "GREEN" : "RED",
    passed: checks.filter((c) => c.pass).length, failed: checks.filter((c) => !c.pass).length, checks, assets,
    limitations: ["No sustituye revisión estética, contraste AA o prueba completa de cámara Sigma", "Zoom 200% real requiere evidencia independiente; setViewportSize no equivale a zoom"] };
  await page.evaluate((result) => { window.__pilotChecksResult = result; }, result);
  return { status: result.status, passed: result.passed, failed: result.failed,
    failures: checks.filter((c) => !c.pass).map((c) => ({ name: c.name, route: c.route, width: c.width,
      actual: Array.isArray(c.actual) ? { count: c.actual.length, sample: c.actual.slice(0, 2) } : c.actual, expected: c.expected })) };
}
