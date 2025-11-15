// Full credits to ChatGPT
// 11/15/25 v1.1
import fs from "fs";
import path from "path";
import vm from "vm";

// -----------------------------
// Configuration
// -----------------------------
const outDir = path.join(process.cwd(), "docs/html");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const LIMIT = parseInt(process.env.LIMIT || "1000");

function safeName(key) {
  return key.replace(/[^a-z0-9-_]/gi, "_");
}

// -----------------------------
// Load pages.js in VM
// -----------------------------
const pagesCode = fs.readFileSync("docs/scripts/pages.js", "utf8");
const pagesSandbox = {};
vm.createContext(pagesSandbox);
vm.runInContext(pagesCode, pagesSandbox);

const { PAGESTORAGE, REDIRECTSTORAGE, SITUATIONSSTORAGE,
        MADPAGESTORAGE, DATEPAGESTORAGE, GUESSPAGESTORAGE,
        GUESSPAGEIMGSTORAGE, ACHIEVEMENTSTORAGE } = pagesSandbox;

if (!PAGESTORAGE) throw new Error("PAGESTORAGE not found");

// -----------------------------
// Load script.js in VM with constants injected
// -----------------------------
const scriptCode = fs.readFileSync("docs/scripts/script.js", "utf8");
const scriptSandbox = {
  PAGE: PAGESTORAGE,
  REDIRECT: REDIRECTSTORAGE,
  SITUATIONS: SITUATIONSSTORAGE,
  MADPAGE: MADPAGESTORAGE,
  DATEPAGE: DATEPAGESTORAGE,
  GUESSPAGE: GUESSPAGESTORAGE,
  GUESSPAGEIMG: GUESSPAGEIMGSTORAGE,
  ACHIEVEMENT: ACHIEVEMENTSTORAGE,
  // minimal DOM mocks if wikifyText uses document/window
  document: { createElement: () => ({}), querySelector: () => null },
  window: {},
};
vm.createContext(scriptSandbox);
vm.runInContext(scriptCode, scriptSandbox);

const wikifyText = scriptSandbox.wikifyText;
if (typeof wikifyText !== "function") {
  throw new Error("wikifyText() not found in script.js or cannot run without DOM mocks");
}

// -----------------------------
// Build list of pages to render
// -----------------------------
const allKeys = Object.keys(PAGESTORAGE);
const existingFiles = fs.existsSync(outDir)
  ? fs.readdirSync(outDir).filter(f => f.endsWith(".html")).map(f => f.replace(".html", ""))
  : [];

const missingPages = allKeys.filter(key => !existingFiles.includes(safeName(key)));
let renderList = [...missingPages];

// Fill remaining slots randomly
if (renderList.length < LIMIT) {
  const remaining = LIMIT - renderList.length;
  const shuffled = [...allKeys].sort(() => Math.random() - 0.5);
  for (const key of shuffled) {
    if (!renderList.includes(key)) {
      renderList.push(key);
      if (renderList.length >= LIMIT) break;
    }
  }
}

console.log(`Rendering ${renderList.length} pages (random refresh mode).`);
console.log(`Missing pages: ${missingPages.length}`);

// -----------------------------
// Render pages
// -----------------------------
const updatedSafeKeys = [];

for (const key of renderList) {
  const page = PAGESTORAGE[key];
  if (!page) continue;

  const title = page.name.replace(/{{i/g, "").replace(/}}/g, "");
  const content = wikifyText(page.content); // apply wikifyText
  const safeKey = safeName(key);
  const filePath = path.join(outDir, `${safeKey}.html`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} | Anotherpedia</title>
  <meta name="description" content="${title} page on Anotherpedia">
  <meta name="robots" content="index, follow">
  <meta name="x-page-title" content="${key}">
</head>
<body>
  <h1>${title}</h1>
  <div>${content}</div>
  <p><em>This is a pre-rendered snapshot for search engines.</em></p>
</body>
</html>`;

  fs.writeFileSync(filePath, html);
  updatedSafeKeys.push(safeKey);
}

// Alphabetical display
updatedSafeKeys.sort((a, b) => a.localeCompare(b));
console.log("<< UPDATED PAGES >>");
for (const k of updatedSafeKeys) console.log("Updated: ", k);

console.log("Prerender batch complete.");
