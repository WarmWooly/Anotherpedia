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

// Helper to clean up raw page content
function wikifyForSEO(text) {
  let output = text;

  // Remove <<nostyle>> and <<safe>> tags but keep content
  output = output.replace(/<<nostyle([\s\S]*?)nostyle>>/g, '$1');
  output = output.replace(/<<safe([\s\S]*?)safe>>/g, '$1');

  // Remove other template tags entirely
  output = output.replace(/<<comment[\s\S]*?comment>>/g, '');
  output = output.replace(/<<short[\s\S]*?short>>/g, '');
  
  // Remove media: images, videos, audio, graphs, PDFs, YouTube, websites
  output = output.replace(/<<img[\s\S]*?img>>/g, '');
  output = output.replace(/<<vid[\s\S]*?vid>>/g, '');
  output = output.replace(/<<aud[\s\S]*?aud>>/g, '');
  output = output.replace(/<<graph[\s\S]*?graph>>/g, '');
  output = output.replace(/<<pdf[\s\S]*?pdf>>/g, '');
  output = output.replace(/<<yt[\s\S]*?yt>>/g, '');
  output = output.replace(/<<web[\s\S]*?web>>/g, '');

  // Remove quotes and code blocks entirely
  output = output.replace(/<<quo[\s\S]*?quo>>/g, '');
  output = output.replace(/<<code[\s\S]*?code>>/g, '');

  // Convert headings to plain text
  output = output.replace(/<<hr2[\s\S]*?hr2>>/g, match => '\n' + match.replace(/<<.*?>>/g, '') + '\n');
  output = output.replace(/<<hr3[\s\S]*?hr3>>/g, match => '\n' + match.replace(/<<.*?>>/g, '') + '\n');
  output = output.replace(/<<hr[\s\S]*?hr>>/g, match => '\n' + match.replace(/<<.*?>>/g, '') + '\n');
  output = output.replace(/<<devTitle[\s\S]*?devTitle>>/g, match => '\n' + match.replace(/<<.*?>>/g, '') + '\n');

  // Convert internal links [[Page|Text]] → Text
  output = output.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (m, p1, p2) => p2 || p1);

  // Collapse multiple spaces and newlines
  output = output.replace(/\n\s*\n/g, '\n');
  output = output.replace(/[ \t]{2,}/g, ' ');

  return output.trim();
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
  const content = cleanText(page.content);
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
