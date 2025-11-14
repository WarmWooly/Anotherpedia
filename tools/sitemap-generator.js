// Full credits to ChatGPT
// 11/14/25 v1.0
import fs from "fs";
import path from "path";

// The folder containing all prerendered HTML
const htmlDir = path.join(process.cwd(), "docs/html");

// The base URL your pages will be served from (GitHub Pages)
const BASE_URL = "https://anotherpedia.com";

if (!fs.existsSync(htmlDir)) {
  console.error("HTML directory not found:", htmlDir);
  process.exit(1);
}

const files = fs.readdirSync(htmlDir).filter(f => f.endsWith(".html"));

let urls = files.map(file => {
  // Remove .html extension for nicer URLs if needed, or keep as-is
  return `${BASE_URL}/${file}`;
});

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(url => `  <url><loc>${url}</loc></url>`)
    .join("\n") +
  `\n</urlset>\n`;

const outPath = path.join(htmlDir, "sitemap.xml");
fs.writeFileSync(outPath, sitemap);

console.log(`Generated sitemap with ${urls.length} URLs → ${outPath}`);
