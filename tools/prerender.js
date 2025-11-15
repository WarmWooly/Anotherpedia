// Full credits to ChatGPT
// 11/15/25 v1.1
import fs from "fs";
import path from "path";
import vm from "vm";
import { execSync } from "child_process";

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

// Build list of existing HTML files with ages from Git history
let existingFiles = [];

if (fs.existsSync(outDir)) {
  const files = fs.readdirSync(outDir).filter(f => f.endsWith(".html"));

  for (const file of files) {
    const fullPath = path.join(outDir, file);
    const relativePath = path.relative(process.cwd(), fullPath);

    let gitTimestamp = null;

    try {
      const cmd = `git log -1 --format=%ct -- "${relativePath}"`;
      gitTimestamp = parseInt(execSync(cmd).toString().trim(), 10);
    } catch (e) {
      // If git fails (untracked file), fallback to filesystem mtime
      gitTimestamp = Math.floor(fs.statSync(fullPath).mtimeMs / 1000);
    }

    existingFiles.push({
      file,
      mtime: gitTimestamp
    });
  }
}

// Sort oldest → newest
existingFiles.sort((a, b) => a.mtime - b.mtime);

// Find missing pages
const missingPages = [];
const allKeys = Object.keys(PAGESTORAGE);

for (const key of allKeys) {
  const filename = safeName(key) + ".html";
  if (!existingFiles.find(f => f.file === filename)) {
    missingPages.push(key);
  }
}

// Build render list
let renderList = [];

// Missing pages first
for (const key of missingPages) {
  if (renderList.length < LIMIT) renderList.push(key);
}

// Oldest existing pages next
if (renderList.length < LIMIT) {
  for (const entry of existingFiles) {
    const base = entry.file.slice(0, -5); // remove .html
    const key = allKeys.find(k => safeName(k) === base);
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
    
      <!-- The REAL title (for redirect handling) -->
      <meta name="x-page-title" content="${title}">
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
