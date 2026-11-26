import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const overlay = path.resolve("overlay/preview");
const output = path.resolve("source/dist/hq-p5-safe-preview");
const htmlPath = path.join(output, "observatory.html");
const indexPath = path.join(output, "index.html");
const gridPath = path.join(output, "hq-grid.html");

for (const file of ["observatory-exocortex.css", "observatory-exocortex.js"]) {
  if (!existsSync(path.join(overlay, file))) throw new Error("OVERLAY_ASSET_MISSING: " + file);
  copyFileSync(path.join(overlay, file), path.join(output, file));
}
if (!existsSync(htmlPath) || !existsSync(indexPath)) throw new Error("PREVIEW_ENTRY_MISSING");

// Preserve the original 15-module HQ as a separate destination. The preview root
// becomes the Observatory command station, while HQ GRID remains one tap away.
copyFileSync(indexPath, gridPath);
const rootEntry = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; manifest-src 'self'; worker-src 'self' blob:; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'">
<meta http-equiv="refresh" content="0;url=./observatory.html"><title>JARVIS-X // EXOCORTEX HQ</title></head>
<body><main><h1>JARVIS-X // EXOCORTEX HQ</h1><p>Opening the Spatial Observatory…</p><p><a href="./observatory.html">Open Observatory</a> · <a href="./hq-grid.html">Open full HQ Grid</a></p></main></body></html>`;
writeFileSync(indexPath, rootEntry);
const swPath = path.join(output, "sw.js");
if (existsSync(swPath)) {
  let sw = readFileSync(swPath, "utf8");
  if (!sw.includes('"./hq-grid.html"')) {
    sw = sw.replace("const SHELL = [", 'const SHELL = ["./hq-grid.html",');
    if (!sw.includes('"./hq-grid.html"')) throw new Error("HQ_GRID_OFFLINE_SHELL_INJECTION_FAILED");
    writeFileSync(swPath, sw);
  }
}
let html = readFileSync(htmlPath, "utf8");
if (!html.includes("observatory-exocortex.css")) html = html.replace("</head>", '<link rel="stylesheet" href="./observatory-exocortex.css">\n</head>');
if (!html.includes("observatory-exocortex.js")) html = html.replace("</body>", '<script src="./observatory-exocortex.js" defer></script>\n</body>');
if (!html.includes("observatory-exocortex.css") || !html.includes("observatory-exocortex.js")) throw new Error("OVERLAY_INJECTION_FAILED");
writeFileSync(htmlPath, html);
console.log(JSON.stringify({ root: "index.html -> observatory.html", grid: "hq-grid.html", entry: "observatory.html", overlay: ["observatory-exocortex.css", "observatory-exocortex.js"], output }, null, 2));
