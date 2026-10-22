// Mismo seam para el DOM vivo (browser) y sus controles negativos (Node).
export const normalizeText = (text) => (text ?? "").replace(/\s+/gu, " ").trim();

export function captureEditorial(document) {
  const article = document.querySelector("main article");
  if (!article) throw new Error("No se encontró el artículo editorial");
  const text = (element) => normalizeText(element?.textContent);
  const links = (element) => [...element.querySelectorAll("a[href]")].map((a) => ({
    text: text(a), href: a.getAttribute("href"), rel: a.getAttribute("rel"),
    target: a.getAttribute("target"), label: a.getAttribute("aria-label"),
  }));
  return {
    route: document.location.pathname,
    headline: text(article.querySelector("h1")),
    subject: text(article.querySelector(".module-subject")),
    introduction: text(article.querySelector(".module-introduction")),
    metadata: text(article.querySelector(".module-meta")),
    index: links(article.querySelector('nav[aria-label="En este módulo"]')),
    pagination: links(article.querySelector('nav[aria-label="Navegación entre módulos"]')),
    sections: [...article.querySelectorAll("section[id]")].map((section) => ({
      id: section.id, title: text(section.querySelector("h2")), text: text(section),
      ids: [...section.querySelectorAll("[id]")].map((node) => node.id),
      links: links(section),
      images: [...section.querySelectorAll("img")].map((img) => ({
        src: img.getAttribute("src"), alt: img.getAttribute("alt"),
        caption: text(img.closest("figure")?.querySelector("figcaption")),
        sourceOrLicense: text(img.closest("figure")?.querySelector(".figure-source")) || null,
      })),
      figures: [...section.querySelectorAll("figure")].map((figure) => ({
        caption: text(figure.querySelector("figcaption")), images: figure.querySelectorAll("img").length,
      })),
      details: [...section.querySelectorAll("details")].map((details) => ({
        summary: text(details.querySelector("summary")), open: details.open, text: text(details),
      })),
      formulas: [...section.querySelectorAll('annotation[encoding="application/x-tex"]')].map(text),
    })),
  };
}

export function conservationDifferences(expected, actual) {
  const differences = [];
  for (const key of ["route", "headline", "subject", "introduction", "metadata", "index", "pagination"]) {
    if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) differences.push(`${expected.route}:${key}`);
  }
  if (JSON.stringify(expected.sections.map((s) => s.id)) !== JSON.stringify(actual.sections.map((s) => s.id))) {
    differences.push(`${expected.route}:section-order/count`);
  }
  expected.sections.forEach((section, index) => {
    const observed = actual.sections[index];
    for (const key of ["id", "title", "text", "ids", "links", "images", "figures", "details", "formulas"]) {
      if (JSON.stringify(section[key]) !== JSON.stringify(observed?.[key])) differences.push(`${expected.route}#${section.id}:${key}`);
    }
  });
  return differences;
}
