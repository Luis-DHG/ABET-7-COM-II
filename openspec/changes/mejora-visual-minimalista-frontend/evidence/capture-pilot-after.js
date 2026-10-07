async (page) => {
  const root = "C:/Users/USER/Desktop/Blog/openspec/changes/mejora-visual-minimalista-frontend/evidence";
  await page.unroute("**/api/**");
  await page.route("**/api/**", (route) => route.fulfill({ status: 401, json: { error: { code: "UNAUTHENTICATED", message: "Sin sesión" } } }));
  await page.context().setOffline(false);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const captured = [];
  for (const viewport of [{ width: 360, height: 800 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const route of ["planeacion", "analisis", "mini-caso"]) {
      await page.goto(`http://127.0.0.1:5173/${route}`);
      await page.locator("main article h1").waitFor();
      if (route === "analisis") await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.mouse.click(2, 2);
      await page.evaluate(() => window.scrollTo(0, 0));
      const metrics = await page.evaluate(() => ({ innerWidth, innerHeight, dpr: devicePixelRatio, scale: visualViewport.scale, scrollY }));
      if (metrics.dpr !== 1 || metrics.innerWidth !== viewport.width || metrics.scrollY !== 0) throw new Error(`Captura no comparable: ${JSON.stringify(metrics)}`);
      const path = `${root}/after-${route}-${viewport.width}.png`;
      await page.screenshot({ path, fullPage: false, scale: "css" });
      captured.push({ route, viewport, path, metrics, fixture: "anon, mapa completo sin selección, OFDM default, menú cerrado" });
    }
  }
  return { captures: captured, noBeforeOverwrite: true };
}
