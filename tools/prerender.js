// Full credits to ChatGPT
// 11/13/25 v1.0
import fs from "fs";
import path from "path";
import pages from "../docs/scripts/pages.js";

const { PAGESTORAGE } = pages;

const outDir = path.join(process.cwd(), "docs/html");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// How many pages to regenerate per run
const LIMIT = parseInt(process.env.LIMIT || "500");

// Convert key → safe filename
function safeName(key) {
  return key.replace(/[^a-z0-9-_]/gi, "_");
}

// 1. Build a list of existing HTML files with ages
let existingFiles = [];
if (fs.existsSync(outDir)) {
  for (const file of fs.readdirSync(outDir)) {
    const fullPath = path.join(outDir, file);
    const stats = fs.statSync(fullPath);
    existingFiles.push({
      file,
      mtime: stats.mtimeMs
    });
  }
}

// Sort by oldest first
existingFiles.sort((a, b) => a.mtime - b.mtime);

// 2. Find missing pages
const missingPages = [];
for (const key of Object.keys(PAGESTORAGE)) {
  const safe = safeName(key);
  const filename = safe + ".html";
  if (!existingFiles.find(f => f.file === filename)) {
    missingPages.push(key);
  }
}

// 3. Build render list
let renderList = [];

// Missing pages always come first
for (const key of missingPages) {
  if (renderList.length < LIMIT) renderList.push(key);
}

// After missing pages, add oldest existing pages
if (renderList.length < LIMIT) {
  for (const entry of existingFiles) {
    const base = entry.file.replace(".html", "");
    // reverse map the safeName to a real key:
    // but since PAGESTORAGE keys sanitize 1-to-1, we can search for it
    const key = Object.keys(PAGESTORAGE).find(
      k => safeName(k) === base
    );
    if (!key) continue;
    if (!renderList.includes(key)) renderList.push(key);
    if (renderList.length >= LIMIT) break;
  }
}

console.log(`Rendering ${renderList.length} pages`);
console.log("Missing pages:", missingPages.length);

// 4. Render selected pages
for (const key of renderList) {
  const page = PAGESTORAGE[key];
  if (!page) continue; // safety

  const title = page.name;
  const content = page.content;
  const safeFile = safeName(key);
  const filePath = path.join(outDir, `${safeFile}.html`);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} - Anotherpedia</title>
  <meta name="description" content="${title} page on Anotherpedia">
  <meta name="robots" content="index, follow">
  <script>window.location.replace("/#${encodeURIComponent(title)}");</script>
</head>
<body>
  <h1>${title}</h1>
  <div>${content}</div>
  <p><em>This is a pre-rendered snapshot for search engines.</em></p>
</body>
</html>
`;

  fs.writeFileSync(filePath, html);
  console.log("Updated: ", safeFile);
}

console.log("Prerender batch complete.");
