async (page) => {
  const base = "http://127.0.0.1:5173";
  const checks = [], requests = [];
  let mode = "anonymous";
  const user = { id: "00000000-0000-4000-8000-000000000001", displayName: "QA Administrador", email: "qa-admin@example.invalid", role: "ADMIN", emailVerified: true, isBanned: false };
  const add = (name, pass, actual) => checks.push({ name, pass, actual });
  const focus = () => page.evaluate(() => {
    const el = document.activeElement, s = getComputedStyle(el), r = el.getBoundingClientRect();
    return { text: el.textContent.trim(), label: el.getAttribute("aria-label"), tag: el.tagName,
      visible: r.width > 0 && r.height > 0, inDialog: Boolean(el.closest('[role="dialog"]')),
      outline: [s.outlineStyle, s.outlineWidth, s.outlineColor], highlighted: el.hasAttribute("data-highlighted"),
      rect: { top: r.top, left: r.left, right: r.right, bottom: r.bottom }, href: el.getAttribute("href") };
  });
  try {
  await page.unroute("**/api/**");
  await page.route("**/api/**", async (route) => {
    const req = route.request(), path = new URL(req.url()).pathname;
    requests.push({ path, method: req.method(), fixture: mode });
    if (path === "/api/auth/logout") { mode = "anonymous"; return route.fulfill({ status: 204 }); }
    if (mode === "unverifiable") return route.fulfill({ status: 503, json: { error: { code: "UNAVAILABLE", message: "Fixture indisponible" } } });
    if (path === "/api/auth/session") return route.fulfill({ json: { data: { user: mode === "admin" ? user : null } } });
    return route.fulfill({ status: 401, json: { error: { code: "UNAUTHENTICATED", message: "Sin sesión" } } });
  });
  await page.context().setOffline(false);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/planeacion`);
  await page.getByRole("link", { name: "Ingresar", exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  const font = await page.evaluate(() => ({ family: getComputedStyle(document.documentElement).fontFamily,
    loaded: document.fonts.check('17px "Inter Variable"'),
    files: performance.getEntriesByType("resource").filter((r) => /\.woff2(?:\?|$)/u.test(r.name)).map((r) => ({ url: r.name, local: new URL(r.name).origin === location.origin })) }));
  add("Inter-local", font.loaded && font.family.includes("Inter Variable") && font.files.length > 0 && font.files.every((file) => file.local), font);
  const footer = await page.locator("footer a").evaluateAll((elements) => elements.map((a) => [a.textContent.trim(), a.getAttribute("href")]));
  add("footer-destinations", JSON.stringify(footer) === JSON.stringify([["Privacidad", "/privacidad"], ["Términos", "/terminos"], ["Contacto", "mailto:chaconvargasfabiancamilo@gmail.com"]]), footer);
  add("anonymous-no-admin", await page.getByRole("button", { name: "Administración", exact: true }).count() === 0, "sin controles administrativos");
  await page.mouse.click(2, 2);
  await page.keyboard.press("Tab");
  // Un clic en la cabecera fija el origen secuencial allí. No asumimos que
  // Tab tras ese clic empiece en el primer nodo del documento.
  if ((await focus()).text !== "Saltar al contenido") await page.keyboard.press("Shift+Tab");
  const skip = await focus();
  add("skip-keyboard-visible", skip.text === "Saltar al contenido" && skip.visible && skip.rect.top >= 0 && skip.outline[0] !== "none", skip);
  await page.keyboard.press("Enter");
  add("skip-target", new URL(page.url()).hash === "#contenido", { url: page.url(), focus: await focus() });

  const modules = page.getByRole("button", { name: "Módulos", exact: true });
  await modules.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menu").waitFor();
  const destinations = await page.getByRole("menuitem").evaluateAll((elements) => elements.map((a) => a.getAttribute("href")));
  add("desktop-seven-destinations", JSON.stringify(destinations) === JSON.stringify(["/planeacion", "/analisis", "/tendencias", "/mini-caso", "/divulgacion", "/bitacora", "/glosario"]), destinations);
  await page.keyboard.press("ArrowDown");
  const menuFocus = await focus();
  add("desktop-roving-focus", Boolean(menuFocus.href) && menuFocus.visible && (menuFocus.highlighted || menuFocus.outline[0] !== "none"), menuFocus);
  await page.keyboard.press("Escape");
  add("desktop-Escape-restore", await modules.evaluate((el) => el === document.activeElement), await focus());

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${base}/planeacion`);
  const mobile = page.getByRole("button", { name: "Abrir menú de navegación" });
  await mobile.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("dialog").waitFor();
  const mobileLinks = await page.locator('nav[aria-label="Móvil"] a').evaluateAll((elements) => elements.map((a) => a.getAttribute("href")));
  add("mobile-existing-destinations", ["/planeacion", "/analisis", "/tendencias", "/mini-caso", "/divulgacion", "/bitacora", "/glosario", "/retroalimentacion", "/login", "/privacidad", "/terminos"].every((href) => mobileLinks.includes(href)), mobileLinks);
  const trapped = [];
  for (let i = 0; i < 16; i++) { await page.keyboard.press("Tab"); trapped.push(await focus()); }
  add("mobile-focus-trap", trapped.every((f) => f.inDialog && f.visible), trapped);
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  add("mobile-Escape-restore", await mobile.evaluate((el) => el === document.activeElement), await focus());
  await mobile.focus(); await page.keyboard.press("Enter");
  const destination = page.locator('nav[aria-label="Móvil"] a[href="/analisis"]');
  await destination.focus(); await page.keyboard.press("Enter");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.locator("main article h1").waitFor();
  add("mobile-selection-closes", new URL(page.url()).pathname === "/analisis", { url: page.url(), focus: await focus() });

  mode = "admin";
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/planeacion`);
  const admin = page.getByRole("button", { name: "Administración", exact: true });
  await admin.waitFor(); await admin.focus(); await page.keyboard.press("Enter");
  const adminLinks = await page.getByRole("menuitem").evaluateAll((elements) => elements.map((a) => [a.textContent.trim(), a.getAttribute("href")]));
  add("admin-actions-destinations", JSON.stringify(adminLinks) === JSON.stringify([["Moderar comentarios", "/admin/comentarios"], ["Gestionar usuarios", "/admin/usuarios"]]), adminLinks);
  await page.keyboard.press("Escape");
  const account = page.getByRole("button", { name: "Cuenta de QA Administrador", exact: true });
  await account.focus(); await page.keyboard.press("Enter");
  add("account-copy", await page.getByText("qa-admin@example.invalid", { exact: true }).isVisible(), "nombre/correo de fixture y Cerrar sesión existentes");
  await page.keyboard.press("Escape");
  await page.getByRole("menu").waitFor({ state: "hidden" });
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  const offlineCopy = "Sin conexión. Puedes seguir leyendo el contenido ya cargado; no es posible publicar.";
  await page.getByText(offlineCopy, { exact: true }).waitFor();
  add("offline-copy-reading-account-retained", await account.isVisible() && await page.locator("main article h1").isVisible(), offlineCopy);
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await account.focus(); await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).focus(); await page.keyboard.press("Enter");
  await page.getByRole("link", { name: "Ingresar", exact: true }).waitFor();
  add("logout-public-action", requests.some((req) => req.path === "/api/auth/logout" && req.method === "POST"), requests.filter((req) => req.path === "/api/auth/logout"));
  mode = "unverifiable";
  await page.goto(`${base}/planeacion`);
  const uncertainCopy = "No se puede verificar tu sesión en este momento. La lectura sigue disponible.";
  await page.getByText(uncertainCopy, { exact: true }).waitFor();
  add("unverifiable-copy-reading", await page.locator("main article h1").isVisible(), uncertainCopy);
  mode = "anonymous";
  await page.goto(`${base}/planeacion`);
  const result = { status: checks.every((c) => c.pass) ? "GREEN" : "REPORT", checks, requests,
    limits: ["No cubre todos los estados/auth/admin ni moderación; solo shell y logout simulado", "Trap/foco muestreados; no certifica exhaustivamente contraste AA ni lectores de pantalla"] };
  await page.evaluate((result) => { window.__shellChecks = result; }, result);
  return { status: result.status, passed: checks.filter((c) => c.pass).length, failures: checks.filter((c) => !c.pass), requests };
  } finally {
    await page.context().setOffline(false);
  }
}
