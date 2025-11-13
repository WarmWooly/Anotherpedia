// Full credits to ChatGPT
// 11/13/25 v1.0
import fs from "fs";
import path from "path";
import vm from "vm";

// --- Load pages.js and script.js into VM sandbox ---
const sandbox = { console };
vm.createContext(sandbox);

function loadIntoSandbox(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  vm.runInContext(code, sandbox, { filename: filePath });
}

// Load both scripts
loadIntoSandbox("docs/scripts/pages.js");
loadIntoSandbox("docs/scripts/script.js");

// Extract exported values from the sandbox
const PAGESTORAGE = sandbox.PAGESTORAGE;
const wikifyText = sandbox.wikifyText;

// Ensure output directory exists
const outDir = path.join(process.cwd(), "docs/html");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Limit for batch size
const LIMIT = parseInt(process.env.LIMIT || "500");

// Convert unsafe keys → safe filenames
function safeName(key) {
  return key.replace(/[^a-z0-9-_]/gi, "_");
}

// Build a list of existing files and their ages
let existingFiles = [];
if (fs.existsSync(outDir)) {
  for (const file of fs.readdirSync(outDir)) {
    const fullPath = path.join(outDir, file);
    const stats = fs.statSync(fullPath);
    existingFiles.push({
      file,
      mtime: stats.mtimeMs,
    });
  }
}

// Sort oldest first
existingFiles.sort((a, b) => a.mtime - b.mtime);

// Find missing pages
const missingPages = [];
for (const key of Object.keys(PAGESTORAGE)) {
  const safe = safeName(key) + ".html";
  if (!existingFiles.find(f => f.file === safe)) {
    missingPages.push(key);
  }
}

let renderList = [];

// Add missing pages first
for (const key of missingPages) {
  if (renderList.length < LIMIT) renderList.push(key);
}

// Then add oldest existing pages
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

// Render
for (const key of renderList) {
  const page = PAGESTORAGE[key];
  if (!page) continue;

  const title = page.name;
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
</html>
`;

  fs.writeFileSync(filePath, html);
  console.log("Updated: ", safeKey);
}

console.log("Prerender batch complete.");
