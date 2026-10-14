// Ejecutable por filename en Playwright MCP, sin imports ni dependencias del VM.
globalThis.checkLegalScroll = async (page) => {
  const origin = "http://localhost:5173";
  const sessionUrl = `${origin}/api/auth/session`;
  const anonymousSession = (route) =>
    route.fulfill({ status: 200, json: { data: { user: null } } });
  const results = [];

  await page.route(sessionUrl, anonymousSession);
  try {
    for (const [linkName, path] of [
      ["Privacidad", "/privacidad"],
      ["Términos", "/terminos"],
    ]) {
      await page.goto(`${origin}/tendencias`, { waitUntil: "domcontentloaded" });
      const heading = page.getByRole("heading", { level: 1 });
      await heading.waitFor({ state: "visible", timeout: 5000 });
      const moduleHeading = await heading.textContent();
      const link = page.locator("footer").getByRole("link", {
        name: linkName,
        exact: true,
      });
      await link.scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo({ top: document.scrollingElement.scrollHeight, behavior: "instant" });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const before = await page.evaluate(() => ({ url: location.href, scrollY: window.scrollY }));
      if (before.scrollY <= 0) {
        throw new Error(`Invalid setup: ${linkName} must be clicked from a scrolled module.`);
      }

      await link.click();
      await page.waitForURL(`${origin}${path}`, { timeout: 5000 });
      await page.waitForFunction(
        (previousHeading) => {
          const currentHeading = document.querySelector("main h1");
          return currentHeading?.textContent.trim() && currentHeading.textContent !== previousHeading;
        },
        moduleHeading,
        { timeout: 5000 },
      );
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      try {
        await page.waitForFunction(() => window.scrollY === 0, null, { timeout: 1500 });
      } catch (error) {
        if (error.name !== "TimeoutError") throw error;
      }
      const after = await page.evaluate(() => ({ url: location.href, scrollY: window.scrollY }));
      results.push({
        link: linkName,
        before,
        after,
        expectedScrollY: 0,
        status: after.scrollY === 0 ? "GREEN" : "RED",
      });
    }
  } finally {
    await page.unroute(sessionUrl, anonymousSession);
  }

  if (results.some((result) => result.status === "RED")) {
    throw new Error(`Legal footer navigation: scrollY must be 0 after render.\n${JSON.stringify(results, null, 2)}`);
  }
  return { status: "GREEN", results };
}
