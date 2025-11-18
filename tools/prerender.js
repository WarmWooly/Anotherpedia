// Full credits to ChatGPT
// 11/18/25 v1.3
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

function scrapeImage(output) {
  // Match the first image block
  const imgMatch = output.match(/<<img\((.*?)\)>>/);
  if (!imgMatch) return { output, imgTag: "" };

  const inner = imgMatch[1];

  // Allow spaces in filenames
  const srcMatch = inner.match(/src=([^(\s][^(\)]*)/);
  const capMatch = inner.match(/cap=(.*?)((?=\.img)|$)/);

  if (!srcMatch) return { output, imgTag: "" };

  let src = srcMatch[1].trim();
  let caption = capMatch ? capMatch[1].trim() : "";

  // git/ rules
  if (src.startsWith("git/")) {
    src = src.replace("git/", "https://warmwooly.github.io/Anotherpedia/files/");
    src += "?raw=true";
  }

  src = src.replace(/\+\+/g, "%2B%2B");
  src = src.replace(/ /g, "%20");

  const imgTag = `<img src="${src}" alt="${caption}" loading="lazy">`;

  // Replace only the first block
  const newOutput = output.replace(imgMatch[0], imgTag);

  return { output: newOutput, imgTag };
}

function removeTags(text) {

  // 1. Remove special codes (but keep braces)
  text = text.replace(/{{\s*(b|i|t|a-i)\s*/g, "{{");

  // 2. Remove all remaining {{ and }}
  text = text.replace(/{{/g, "");
  text = text.replace(/}}/g, "");

  return text;
}

// Helper to clean up raw page content
function cleanText(text) {
  let output = text;

  // Remove template wrapping
  output = output.replace(/<<nostyle([\s\S]*?)nostyle>>/g, '$1');
  output = output.replace(/<<safe([\s\S]*?)safe>>/g, '$1');
  output = output.replace(/<<comment[\s\S]*?comment>>/g, '');
  output = output.replace(/<<short[\s\S]*?short>>/g, '');

  // Extract *and replace* top image
  const imageResult = scrapeImage(output);
  output = imageResult.output;
  const imgTag = imageResult.imgTag; // "" if nothing found

  // Remove remaining media
  output = output.replace(/<<img[\s\S]*?img>>/g, '');
  output = output.replace(/<<vid[\s\S]*?vid>>/g, '');
  output = output.replace(/<<aud[\s\S]*?aud>>/g, '');
  output = output.replace(/<<graph[\s\S]*?graph>>/g, '');
  output = output.replace(/<<pdf[\s\S]*?pdf>>/g, '');
  output = output.replace(/<<yt[\s\S]*?yt>>/g, '');
  output = output.replace(/<<web[\s\S]*?web>>/g, '');
  output = output.replace(/<<ref[\s\S]*?ref>>/g, '');
  output = output.replace(/<<note[\s\S]*?note>>/g, '');

  // Formatting cleanup
  output = output.replace(/<<quo([\s\S]*?)quo>>/g, '$1');
  output = output.replace(/<<code([\s\S]*?)code>>/g, '$1');
  output = output.replace(/<<hr2([\s\S]*?)hr2>>/g, m => '\n' + m.replace(/<<.*?>>/g, '') + '\n');
  output = output.replace(/<<hr3([\s\S]*?)hr3>>/g, m => '\n' + m.replace(/<<.*?>>/g, '') + '\n');
  output = output.replace(/<<hr([\s\S]*?)hr>>/g, m => '\n' + m.replace(/<<.*?>>/g, '') + '\n');

  // Wiki links
  output = output.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g,
    (m, p1, p2) => p1 || p2);

  // Remove {{...}}
  output = output.replace(/{{(b|i|t|a-i)?(.*?)}}/g, (_, s, content) => content);

  // Convert &sp / &p
  output = output.replace(/&sp/g, '<br>');
  output = output.replace(/&p/g, '<br><br>');

  return { content: output.trim(), imgTag };
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
  const { content, imgTag } = cleanText(page.content);
  const safeKey = safeName(key);
  const filePath = path.join(outDir, `${safeKey}.html`);

  const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <!-- Favicons come first! -->
      <link rel="icon" type="image/png" sizes="32x32" href="https://anotherpedia.com/favicon-32.png">
      <link rel="icon" type="image/png" sizes="192x192" href="https://anotherpedia.com/icon-192.png">
      <link rel="icon" type="image/png" sizes="512x512" href="https://anotherpedia.com/icon-512.png">

      <!-- Other meta stuff -->
      <meta charset="utf-8">
      <title>${title} | Anotherpedia</title>
      <meta name="description" content="${title} on Anotherpedia">
      <meta name="robots" content="index, follow">
      <meta name="x-page-title" content="${key}">
      <meta property="og:site_name" content="Anotherpedia">

      <!-- Search content stuff -->
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://anotherpedia.com/",
        "name": "Anotherpedia",
        "alternateName": "Anotherpedia Wiki"
      }
      </script>
    </head>
    <body>
      ${imgTag}
      <h1>${title}</h1>
      <div>${content}</div>
      <!-- Pre-rendered for browsers -->
      <p><em>${title} on Anotherpedia.</em></p>
    </body>
    </html>
    `;
  
  // Only write when changed
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf8");
    if (existing === html) {
      continue;
    }
  }
  
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
