async (page) => {
  const base = "http://127.0.0.1:5173";
  const routes = ["planeacion", "analisis", "tendencias", "mini-caso", "divulgacion", "bitacora", "glosario"];
  await page.route("**/api/**", (route) => route.fulfill({ status: 401, contentType: "application/json",
    body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Sin sesión" } }) }));
  await page.setViewportSize({ width: 1440, height: 900 });
  const checks = [];
  for (const route of routes) {
    const response = await page.request.get(`${base}/tests/fixtures/editorial/${route}.json`);
    if (!response.ok()) throw new Error(`Fixture no disponible: ${route}, HTTP ${response.status()}`);
    const expected = await response.json();
    await page.goto(`${base}/${route}`);
    await page.locator("main article h1").waitFor();
    if (route === "analisis") {
      await page.getByText("541 términos · 8 clústeres", { exact: true }).waitFor();
      await page.locator(".bibliometric-findings .bibliometric-stat-grid").waitFor();
    }
    if (route === "glosario") await page.locator(".glossary-list details").first().waitFor({ state: "attached" });
    const formulaCount = expected.sections.reduce((sum, section) => sum + section.formulas.length, 0);
    await page.waitForFunction((count) => document.querySelectorAll('section annotation[encoding="application/x-tex"]').length === count, formulaCount);
    const result = await page.evaluate(async (expected) => {
      const { captureEditorial, conservationDifferences } = await import("/tests/helpers/editorial-inventory.js");
      const actual = captureEditorial(document);
      return { route: actual.route, sections: actual.sections.length, differences: conservationDifferences(expected, actual) };
    }, expected);
    checks.push(result);
  }
  const result = { status: checks.every((c) => c.differences.length === 0) ? "GREEN" : "RED", checks };
  await page.evaluate((result) => { window.__conservationChecks = result; }, result);
  return result;
}
