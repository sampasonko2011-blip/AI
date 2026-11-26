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
  // Isolated preview owns a dedicated cache namespace; never reuse v1 after DOM changes.
  if (sw.includes("jarvis-x-p5-safe-preview-v1")) {
    sw = sw.replaceAll("jarvis-x-p5-safe-preview-v1", "jarvis-x-p5-safe-preview-v3");
    writeFileSync(swPath, sw);
  }
  if (!sw.includes("jarvis-x-p5-safe-preview-v3") || sw.includes("jarvis-x-p5-safe-preview-v1")) {
    throw new Error("PREVIEW_SERVICE_WORKER_CACHE_VERSION_NOT_V2");
  }
  for (const asset of ["./hq-grid.html","./observatory-exocortex.css","./observatory-exocortex.js"]) {
    if (!sw.includes(JSON.stringify(asset))) sw = sw.replace("const SHELL = [", 'const SHELL = [' + JSON.stringify(asset) + ',');
  }
    if (!sw.includes('"./hq-grid.html"') || !sw.includes('"./observatory-exocortex.css"') || !sw.includes('"./observatory-exocortex.js"')) throw new Error("PREVIEW_ASSETS_OFFLINE_SHELL_INJECTION_FAILED");
    writeFileSync(swPath, sw);
  }
  const manifestPath = path.join(output, "preview-manifest.json");
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifest.policy.service_worker_cache_namespace = "jarvis-x-p5-safe-preview-v3";
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\\n");
  }
}
let html = readFileSync(htmlPath, "utf8");
// Physically remove the legacy central sanctuary/astrolabe from the published DOM.
// This is intentionally not a CSS hide: the opaque crystal and its enclosing hero
// section must not ship in the Observatory document at all.
const sanctuaryStart = html.indexOf('<section class="sanctuary">');
if (sanctuaryStart >= 0) {
  const sanctuaryEnd = html.indexOf("</section>", sanctuaryStart);
  if (sanctuaryEnd < 0) throw new Error("SANCTUARY_DOM_CLOSE_NOT_FOUND");
  html = html.slice(0, sanctuaryStart) + html.slice(sanctuaryEnd + "</section>".length);
}
if (html.includes('id="astrolabe"') || html.includes('class="sanctuary"')) {
  throw new Error("SANCTUARY_DOM_REMOVAL_FAILED");
}
// Remove the obsolete multi-button toolbar from the published DOM, not merely via CSS.
const legacyDockStart = html.indexOf('<nav class="dock">');
if (legacyDockStart >= 0) {
  const legacyDockEnd = html.indexOf("</nav>", legacyDockStart);
  if (legacyDockEnd < 0) throw new Error("LEGACY_DOCK_CLOSE_NOT_FOUND");
  html = html.slice(0, legacyDockStart) + html.slice(legacyDockEnd + "</nav>".length);
}
if (html.includes('<nav class="dock">') || html.includes("＋ ADD MODULE") || html.includes("CHAT IA</a>")) {
  throw new Error("LEGACY_DOCK_DOM_REMOVAL_FAILED");
}
if (!html.includes("observatory-exocortex.css")) html = html.replace("</head>", '<link rel="stylesheet" href="./observatory-exocortex.css">\n</head>');
if (!html.includes("observatory-exocortex.js")) html = html.replace("</body>", '<script src="./observatory-exocortex.js" defer></script>\n</body>');
if (!html.includes("observatory-exocortex.css") || !html.includes("observatory-exocortex.js")) throw new Error("OVERLAY_INJECTION_FAILED");
writeFileSync(htmlPath, html);
console.log(JSON.stringify({ root: "index.html -> observatory.html", grid: "hq-grid.html", entry: "observatory.html", overlay: ["observatory-exocortex.css", "observatory-exocortex.js"], output }, null, 2));
