// Full credits to ChatGPT
// 11/13/25 v1.0
import fs from "fs";
import path from "path";
import vm from "vm";

// Configuration
const outDir = path.join(process.cwd(), "docs/html");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const LIMIT = parseInt(process.env.LIMIT || "500");

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

// Build list of existing HTML files with ages
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

// Sort oldest first
existingFiles.sort((a, b) => a.mtime - b.mtime);

// Find missing pages
const missingPages = [];
for (const key of Object.keys(PAGESTORAGE)) {
  const filename = safeName(key) + ".html";
  if (!existingFiles.find(f => f.file === filename)) {
    missingPages.push(key);
  }
}

// Build render list
let renderList = [];

// Missing pages always first
for (const key of missingPages) {
  if (renderList.length < LIMIT) renderList.push(key);
}

// Oldest existing pages next
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

// Render selected pages
for (const key of renderList) {
  const page = PAGESTORAGE[key];
  if (!page) continue;

  const title = page.name;
  const content = page.content; // raw content, no wikifyText
  const safeKey = safeName(key);
  const filePath = path.join(outDir, `${safeKey}.html`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} - Anotherpedia</title>
  <meta name="description" content="${title} page on Anotherpedia">
  <meta name="robots" content="index, follow">
  <script>
    // Redirect to dynamic version
    window.location.replace("/#${encodeURIComponent(title)}");
  </script>
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
