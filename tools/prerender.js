// Original generation using ChatGPT, updated by Warm_Wooly
// 6/27/26 v1.4
import fs from "fs";
import path from "path";
import vm from "vm";

// Configuration
const outDir = path.join(process.cwd(), "docs/html");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const LIMIT = parseInt(process.env.LIMIT || "999");

// Helper to sanitize filenames
function safeName(key) {
  return key.replace(/[^a-z0-9-_]/gi, "_");
}

function scrapeImage(text) {
  // Match first <<img(...)…img>> block
  const imgMatch = text.match(/<<img\(([\s\S]*?)img>>/);
  let imgTag = "";
  let imgSrc = ""

  if (imgMatch) {
    const rawBlock = imgMatch[0];
    const inner = imgMatch[1];

    const srcMatch = inner.match(/src=([^\s()]+(?: [^\s()]+)*)/);
    const capMatch = inner.match(/cap=(.*?)$/);

    if (srcMatch) {
      imgSrc = srcMatch[1].trim();
      let caption = capMatch ? capMatch[1].trim() : "";

      if (imgSrc.startsWith("git/")) {
        imgSrc = imgSrc.replace("git/", "https://warmwooly.github.io/Anotherpedia/files/") + "?raw=true";
      }
      if (imgSrc.startsWith("cdn/")) {
        imgSrc = imgSrc.replace("cdn/", "https://cdn.anotherpedia.com/");
      }

      imgSrc = imgSrc.replace(/\+\+/g, "%2B%2B").replace(/ /g, "%20");
      imgTag = `<img src="${imgSrc}" alt="${caption}" loading="lazy">`;
    }
  }

  // Remove all <<info>> and <<img>> blocks
  const output = text.replace(/<<info[\s\S]*?info>>/g, "").replace(/<<img[\s\S]*?img>>/g, "");

  return { output, imgSrc, imgTag };
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
  // Get the extracted image and cleaned content
  let { output, imgSrc, imgTag } = scrapeImage(text);

  // Remove template wrapping, remaining media blocks, and formatting
  purgeList = [
    ["nostyle", "$1"],
    ["safe", "$1"],
    ["comment", ""],
    ["short", ""],
    ["seealso", ""],
    ["vid", ""],
    ["aud", ""],
    ["graph", ""],
    ["pdf", ""],
    ["yt", ""],
    ["web", ""],
    ["ref", ""],
    ["note", ""],
    ["quo", "$1"],
    ["code", "$1"],
    ["hr3", "\n\n"],
    ["hr2", "\n\n"],
    ["hr", "\n\n"],
  ];

  purgeList.forEach(([tag, replacement]) => {
    output = output.replace(
      new RegExp(`<<${tag}([\\s\\S]*?)${tag}>>`, 'g'),
      replacement
    );
  });

  // Wiki links cleanup
  output = output.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (m, p1, p2) => p1 || p2);

  // Remove {{b...}}, {{i...}}, nested forms
  output = output.replace(/{{(?:b|i|t|a-i|code|u|s-u|s-b|s-p)?(.*?)}}/g, '$1');

  // Convert spacing codes
  output = output.replace(/&sp/g, "<br>");
  output = output.replace(/&p/g, "<br><br>");

  return { content: output.trim(), imgSrc, imgTag };
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
  const { content, imgSrc, imgTag } = cleanText(page.content);
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
      <meta property="og:image" content="${imgSrc}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${title} on Anotherpedia">
      <meta property="og:url" content="https://anotherpedia.com/${key}">

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
