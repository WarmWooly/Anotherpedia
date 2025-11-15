// Full credits to ChatGPT
// 11/15/25 v1.1
import fs from "fs";
import path from "path";
import vm from "vm";

// Configuration
const outDir = path.join(process.cwd(), "docs/html");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const LIMIT = parseInt(process.env.LIMIT || "1000");

// Helper to sanitize filenames
function safeName(key) {
  return key.replace(/[^a-z0-9-_]/gi, "_");
}

// Load pages.js in a VM sandbox
const pagesCode = fs.readFileSync("docs/scripts/pages.js", "utf8");
const pagesSandbox = {};
vm.createContext(pagesSandbox);
vm.runInContext(pagesCode, pagesSandbox);

const { PAGESTORAGE } = pagesSandbox;
if (!PAGESTORAGE) {
  throw new Error("PAGESTORAGE not found in sandbox");
}

// Build render list
const allKeys = Object.keys(PAGESTORAGE);

// If LIMIT < total pages, shuffle to pick a random subset
let renderList = [...allKeys];
if (renderList.length > LIMIT) {
  // Fisher-Yates shuffle
  for (let i = renderList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [renderList[i], renderList[j]] = [renderList[j], renderList[i]];
  }
  renderList = renderList.slice(0, LIMIT);
}

console.log(`Rendering ${renderList.length} pages.`);

// Render selected pages
const updatedSafeKeys = [];

for (const key of renderList) {
  const page = PAGESTORAGE[key];
  if (!page) continue;

  const title = page.name.replace(/{{i/g, "").replace(/}}/g, "");
  const content = page.content;
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
</html>
`;

  fs.writeFileSync(filePath, html);
  updatedSafeKeys.push(safeKey);
}

// Display updated pages alphabetically
updatedSafeKeys.sort((a, b) => a.localeCompare(b));
console.log("<< UPDATED PAGES >>");
for (const key of updatedSafeKeys) {
  console.log("Updated: ", key);
}

console.log("Prerender batch complete.");
