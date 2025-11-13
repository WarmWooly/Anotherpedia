// Full credits to ChatGPT
import fs from "fs";
import pages from '../docs/scripts/pages.js';
const { PAGESTORAGE } = pages;

const OUTPUT_DIR = "./dist";
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

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

  fs.writeFileSync(`${OUTPUT_DIR}/${safeFile}.html`, html);
  console.log("Wrote HTML for page " + key); // test that PAGESTORAGE is loaded
}

console.log("Pre-render complete. Files in /dist/");
