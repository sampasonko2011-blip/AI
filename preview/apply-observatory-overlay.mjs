import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const overlay = path.resolve("overlay/preview");
const output = path.resolve("source/dist/hq-p5-safe-preview");
const htmlPath = path.join(output, "observatory.html");
for (const file of ["observatory-exocortex.css", "observatory-exocortex.js"]) {
  if (!existsSync(path.join(overlay, file))) throw new Error("OVERLAY_ASSET_MISSING: " + file);
  copyFileSync(path.join(overlay, file), path.join(output, file));
}
if (!existsSync(htmlPath)) throw new Error("OBSERVATORY_ENTRY_MISSING");
let html = readFileSync(htmlPath, "utf8");
if (!html.includes("observatory-exocortex.css")) {
  html = html.replace("</head>", '<link rel="stylesheet" href="./observatory-exocortex.css">\n</head>');
}
if (!html.includes("observatory-exocortex.js")) {
  html = html.replace("</body>", '<script src="./observatory-exocortex.js" defer></script>\n</body>');
}
if (!html.includes("observatory-exocortex.css") || !html.includes("observatory-exocortex.js")) {
  throw new Error("OVERLAY_INJECTION_FAILED");
}
writeFileSync(htmlPath, html);
console.log(JSON.stringify({ entry: "observatory.html", overlay: ["observatory-exocortex.css", "observatory-exocortex.js"], output }, null, 2));
