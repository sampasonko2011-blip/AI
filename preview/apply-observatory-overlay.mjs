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

// Keep the existing HQ Grid as a separate entry point.
copyFileSync(indexPath, gridPath);
const rootEntry = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; manifest-src 'self'; worker-src 'self' blob:; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'">
<meta http-equiv="refresh" content="0;url=./observatory.html"><title>JARVIS-X // EXOCORTEX HQ</title></head>
<body><main><h1>JARVIS-X // EXOCORTEX HQ</h1><p>Opening the Spatial Observatory…</p><p><a href="./observatory.html">Open Observatory</a> · <a href="./hq-grid.html">Open full HQ Grid</a></p></main></body></html>`;
writeFileSync(indexPath, rootEntry);

// Generate a new isolated preview cache namespace. Never unregister unrelated workers.
const swPath = path.join(output, "sw.js");
if (!existsSync(swPath)) throw new Error("PREVIEW_SERVICE_WORKER_MISSING");
let sw = readFileSync(swPath, "utf8");
sw = sw.replaceAll("jarvis-x-p5-safe-preview-v4", "jarvis-x-p5-safe-preview-v4")
       .replaceAll("jarvis-x-p5-safe-preview-v4", "jarvis-x-p5-safe-preview-v4");
if (!sw.includes("jarvis-x-p5-safe-preview-v4") || /jarvis-x-p5-safe-preview-v[12]/.test(sw)) {
  throw new Error("PREVIEW_SERVICE_WORKER_CACHE_VERSION_NOT_V3");
}
const shellMarker = "const SHELL = [";
if (!sw.includes(shellMarker)) throw new Error("PREVIEW_SERVICE_WORKER_SHELL_MISSING");
const assets = ["./hq-grid.html", "./observatory-exocortex.css", "./observatory-exocortex.js"];
for (const asset of assets) {
  if (!sw.includes(JSON.stringify(asset))) {
    sw = sw.replace(shellMarker, shellMarker + JSON.stringify(asset) + ", ");
  }
}
if (!assets.every(asset => sw.includes(JSON.stringify(asset)))) throw new Error("PREVIEW_ASSETS_OFFLINE_SHELL_INJECTION_FAILED");
writeFileSync(swPath, sw);

const manifestPath = path.join(output, "preview-manifest.json");
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.policy.service_worker_cache_namespace = "jarvis-x-p5-safe-preview-v4";
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

let html = readFileSync(htmlPath, "utf8");
// Remove scripts that recreate the retired sphere or assume its DOM still exists.
for (const script of ["observatory.js", "v54-observatory.js"]) {
  const tag = new RegExp('<script\\b(?=[^>]*src=["\\']\\./' + script.replace(".", "\\\\.") + '["\\'])[^>]*>\\\\s*<\\\\/script>', "gi");
  html = html.replace(tag, "");
}
if (/src=["']\\.\\/(?:observatory|v54-observatory)\\.js["']/.test(html)) {
  throw new Error("LEGACY_OBSERVATORY_SCRIPT_STILL_REFERENCED");
}

// Physically remove the complete central sanctuary / astrolabe section.
const sanctuaryStart = html.indexOf('<section class="sanctuary">');
if (sanctuaryStart >= 0) {
  const sanctuaryEnd = html.indexOf("</section>", sanctuaryStart);
  if (sanctuaryEnd < 0) throw new Error("SANCTUARY_DOM_CLOSE_NOT_FOUND");
  html = html.slice(0, sanctuaryStart) + html.slice(sanctuaryEnd + "</section>".length);
}
if (html.includes('id="astrolabe"') || html.includes('class="sanctuary"')) {
  throw new Error("SANCTUARY_DOM_REMOVAL_FAILED");
}

// Physically remove the obsolete toolbar; the new dock is created by the overlay.
const dockStart = html.indexOf('<nav class="dock">');
if (dockStart >= 0) {
  const dockEnd = html.indexOf("</nav>", dockStart);
  if (dockEnd < 0) throw new Error("LEGACY_DOCK_CLOSE_NOT_FOUND");
  html = html.slice(0, dockStart) + html.slice(dockEnd + "</nav>".length);
}
for (const forbidden of ['<nav class="dock">', "＋ ADD MODULE", "CHAT IA</a>"]) {
  if (html.includes(forbidden)) throw new Error("LEGACY_DOCK_DOM_REMOVAL_FAILED: " + forbidden);
}
if (!html.includes("observatory-exocortex.css")) html = html.replace("</head>", '<link rel="stylesheet" href="./observatory-exocortex.css">\n</head>');
if (!html.includes("observatory-exocortex.js")) html = html.replace("</body>", '<script src="./observatory-exocortex.js" defer></script>\n</body>');
if (!html.includes("observatory-exocortex.css") || !html.includes("observatory-exocortex.js")) throw new Error("OVERLAY_INJECTION_FAILED");
writeFileSync(htmlPath, html);
console.log(JSON.stringify({entry:"observatory.html", removed:[".sanctuary","#astrolabe",".dock"], cache:"jarvis-x-p5-safe-preview-v4", grid:"hq-grid.html"}, null, 2));
