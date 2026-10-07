async (page) => {
  const base = "http://127.0.0.1:5173";
  const read = () => page.evaluate(() => ({ innerWidth, innerHeight, dpr: devicePixelRatio,
    visualScale: visualViewport.scale, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    indexOpen: document.querySelector('nav[aria-label="En este módulo"] details')?.open }));
  await page.route("**/api/**", (route) => route.fulfill({ status: 401, contentType: "application/json",
    body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Sin sesión" } }) }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/planeacion`);
  const before = await read();
  let saved = 1;
  const checks = [];
  try {
    await page.goto("chrome://settings/appearance");
    saved = await page.evaluate(() => new Promise((resolve) => chrome.settingsPrivate.getDefaultZoom(resolve)));
    await page.evaluate(() => new Promise((resolve) => chrome.settingsPrivate.setDefaultZoom(2, resolve)));
    for (const viewport of [{ width: 360, height: 800 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      for (const route of ["planeacion", "analisis", "mini-caso"]) {
        await page.goto(`${base}/${route}`);
        await page.locator("main article h1").waitFor();
        if (route === "analisis") await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
        const actual = await read();
        checks.push({ route, window: viewport, actual, native200Verified: actual.dpr === before.dpr * 2 && actual.innerWidth <= viewport.width / 2 + 1 && actual.visualScale === 1 });
      }
    }
  } finally {
    await page.goto("chrome://settings/appearance");
    await page.evaluate((saved) => new Promise((resolve) => chrome.settingsPrivate.setDefaultZoom(saved, resolve)), saved);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/planeacion`);
  }
  const result = { method: "Chrome nativo settingsPrivate.setDefaultZoom(2); restauración en finally",
    noFakeZoom: "Sin Emulation.setPageScaleFactor, deviceScaleFactor ni transform CSS",
    before, restored: await read(), checks };
  await page.evaluate((result) => { window.__nativeZoomChecks = result; }, result);
  return result;
}
