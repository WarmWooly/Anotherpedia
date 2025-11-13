// Full credits to ChatGPT
// 11/13/25 v1.0
import vm from "vm";
import fs from "fs";
import path from "path";

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
  runScripts: "dangerously",
  resources: "usable",
});

// Inject pages.js into the DOM environment
const pagesCode = fs.readFileSync("docs/scripts/pages.js", "utf8");
dom.window.eval(pagesCode);

// Inject script.js (wikifyText lives here)
const scriptCode = fs.readFileSync("docs/scripts/script.js", "utf8");
dom.window.eval(scriptCode);

// Extract the two globals
const PAGESTORAGE = dom.window.PAGESTORAGE;
const wikifyText = dom.window.wikifyText;

if (!PAGESTORAGE) {
  throw new Error("PAGESTORAGE did not load from pages.js");
}

if (typeof wikifyText !== "function") {
  throw new Error("wikifyText() did not load from script.js");
}

console.log("Loaded PAGESTORAGE and wikifyText.");

// Output directory
const outDir = path.join(process.cwd(), "docs/html");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

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
    existingFiles.push({ file, mtime: stats.mtimeMs });
  }
}

// Sort oldest → newest
existingFiles.sort((a, b) => a.mtime - b.mtime);

// 2. Find missing pages
const missingPages = [];
for (const key of Object.keys(PAGESTORAGE)) {
  const safe = safeName(key);
  if (!existingFiles.find(f => f.file === safe + ".html")) {
    missingPages.push(key);
  }
}

// 3. Build render list
let renderList = [];

// Missing pages first
for (const key of missingPages) {
  if (renderList.length < LIMIT) renderList.push(key);
}

// Then oldest pages
if (renderList.length < LIMIT) {
  for (const entry of existingFiles) {
    const base = entry.file.replace(".html", "");
    const key = Object.keys(PAGESTORAGE).find(k => safeName(k) === base);
    if (!key) continue;

    if (!renderList.includes(key)) renderList.push(key);
    if (renderList.length >= LIMIT) break;
  }
}

console.log(`Rendering ${renderList.length} pages`);
console.log(`Missing pages: ${missingPages.length}`);

// 4. Render selected pages
for (const key of renderList) {
  const page = PAGESTORAGE[key];
  if (!page) continue;

  const title = page.name;

  // Apply Wikify
  const content = wikifyText(page.content);

  const safeKey = safeName(key);
  const filePath = path.join(outDir, `${safeKey}.html`);

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
</html>`;

  fs.writeFileSync(filePath, html);
  console.log("Updated: ", safeKey);
}

console.log("Prerender batch complete.");
