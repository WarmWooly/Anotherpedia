import fs from "fs";
import path from "path";
import pages from "../docs/scripts/pages.js";
const { PAGESTORAGE } = pages;

const outDir = path.join(process.cwd(), "docs/html");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Inputs from workflow
const LIMIT = parseInt(process.env.LIMIT || "500");
const START = parseInt(process.env.START || "0");

const entries = Object.entries(PAGESTORAGE);
const slice = entries.slice(START, START + LIMIT);

console.log(`Rendering pages ${START} to ${START + LIMIT - 1}`);

for (const [key, page] of slice) {
  const title = page.name;
  const content = page.content;

  const safeFile = key.replace(/[^a-z0-9-_]/gi, "_");
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
  console.log("✔️ " + safeFile);
}

console.log("Pre-render batch complete.");
