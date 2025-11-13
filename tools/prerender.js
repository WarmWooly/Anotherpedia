// Full credits to ChatGPT
import fs from "fs";
import path from 'path';
import pages from '../docs/scripts/pages.js';
const { PAGESTORAGE } = pages;

const outDir = path.join(process.cwd(), 'docs/html');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

var limit = 50
for (const [key, page] of Object.entries(PAGESTORAGE)) {
  const title = page.name;
  const content = page.content;

  const safeFile = key.replace(/[^a-z0-9-_]/gi, "_");
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} - Anotherpedia</title>
  <meta name="description" content="${title} page on Anotherpedia">
  <meta name="robots" content="index, follow">
  <script>
    // Redirect users to the dynamic version
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

  if (limit > 0) {
    fs.writeFileSync(path.join(outDir, `${key}.html`), html);
    console.log("Wrote HTML for page " + key); // test that PAGESTORAGE is loaded
    limit -= 1;
  }
}

console.log("Pre-render complete.");
