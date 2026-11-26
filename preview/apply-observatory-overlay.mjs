import { copyFileSync, existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const overlay = path.resolve("overlay/preview");
const output = path.resolve("source/dist/hq-p5-safe-preview");
const htmlPath = path.join(output, "observatory.html");
const indexPath = path.join(output, "index.html");
const gridPath = path.join(output, "hq-grid.html");

for (const file of ["observatory-exocortex.css", "observatory-exocortex.js", "module-frame.css"]) {
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
sw = sw.replaceAll("jarvis-x-p5-safe-preview-v6", "jarvis-x-p5-safe-preview-v6")
       .replaceAll("jarvis-x-p5-safe-preview-v6", "jarvis-x-p5-safe-preview-v6")
       .replaceAll("jarvis-x-p5-safe-preview-v6", "jarvis-x-p5-safe-preview-v6")
       .replaceAll("jarvis-x-p5-safe-preview-v6", "jarvis-x-p5-safe-preview-v6");
if (!sw.includes("jarvis-x-p5-safe-preview-v6") || /jarvis-x-p5-safe-preview-v[1234]/.test(sw)) {
  throw new Error("PREVIEW_SERVICE_WORKER_CACHE_VERSION_NOT_V6");
}
const shellMarker = "const SHELL = [";
if (!sw.includes(shellMarker)) throw new Error("PREVIEW_SERVICE_WORKER_SHELL_MISSING");
// Retired source scripts are removed from the published artifact and its offline shell.
for (const retired of ["observatory.js", "v54-observatory.js"]) {
  const target = path.join(output, retired);
  if (existsSync(target)) unlinkSync(target);
  sw = sw.replaceAll(JSON.stringify("./" + retired) + ",", "");
}
const assets = ["./hq-grid.html", "./observatory-exocortex.css", "./observatory-exocortex.js", "./module-frame.css"];
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
  manifest.policy.service_worker_cache_namespace = "jarvis-x-p5-safe-preview-v6";
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

// Permit only public model-artifact hosts for the explicitly user-initiated local WebLLM download.
const localChatPath = path.join(output, "local-chat.html");
if (existsSync(localChatPath)) {
  let localChat = readFileSync(localChatPath, "utf8");
  localChat = localChat.replace("connect-src 'self'; font-src", "connect-src 'self' https://huggingface.co https://*.huggingface.co https://cdn-lfs.huggingface.co https://cas-bridge.xethub.hf.co https://*.xethub.hf.co https://*.hf.co https://raw.githubusercontent.com; font-src");
  if (!localChat.includes("https://huggingface.co") || localChat.includes("https://xfewajxkqntflfntisut.supabase.co")) throw new Error("LOCAL_CHAT_MODEL_CSP_NOT_SAFE");
  writeFileSync(localChatPath, localChat);
}

let html = readFileSync(htmlPath, "utf8");
// These legacy scripts recreate the removed visual core or assume its DOM exists.
for (const scriptTag of [
  '<script src="./observatory.js" defer></script>',
  '<script src="./v54-observatory.js" defer></script>'
]) html = html.replaceAll(scriptTag, "");
if (html.includes('src="./observatory.js"') || html.includes('src="./v54-observatory.js"')) {
  throw new Error("LEGACY_OBSERVATORY_SCRIPT_STILL_REFERENCED");
}

// Remove obsolete CSS rules for the retired sphere and dynamically injected v54 orb.
const cssFiles = ["observatory.css","interstellar-v30.css","interstellar-v31.css","interstellar-v32.css","spatial-liquid-hud.css","v54-harmony.css","observatory-exocortex.css"];
const legacySelector = /(?:[.]sanctuary|#astrolabe|[.]astrolabe|[.]crystal|[.]jx-v54-shell|[.]jx-v54-orb|[.]jx-v54-panel|[.]jx-v54-title|[.]jx-v54-value)/;
const legacyRule = /[^{}]*(?:[.]sanctuary|#astrolabe|[.]astrolabe|[.]crystal|[.]jx-v54-shell|[.]jx-v54-orb|[.]jx-v54-panel|[.]jx-v54-title|[.]jx-v54-value)[^{}]*\{[^{}]*\}/g;
for (const name of cssFiles) {
  const target = path.join(output, name);
  if (!existsSync(target)) continue;
  let css = readFileSync(target, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  let previous;
  do { previous = css; css = css.replace(legacyRule, ""); } while (css !== previous);
  if (legacySelector.test(css)) throw new Error("LEGACY_VISUAL_CORE_CSS_REMAINS: " + name);
  writeFileSync(target, css);
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
// Recompute the preview manifest after all transformations and retired-file removals.
const finalManifestPath = path.join(output, "preview-manifest.json");
if (existsSync(finalManifestPath)) {
  const manifest = JSON.parse(readFileSync(finalManifestPath, "utf8"));
  manifest.policy.service_worker_cache_namespace = "jarvis-x-p5-safe-preview-v6";
  const paths = [...new Set([...manifest.files.map(file => file.path), "index.html", "hq-grid.html", "observatory-exocortex.css", "observatory-exocortex.js", "module-frame.css", "sw.js"])]
    .filter(name => existsSync(path.join(output, name)));
  manifest.files = paths.map(name => {
    const bytes = readFileSync(path.join(output, name));
    return { path: name, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  });
  manifest.file_count = manifest.files.length;
  writeFileSync(finalManifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
console.log(JSON.stringify({entry:"observatory.html", removed:[".sanctuary","#astrolabe",".dock"], cache:"jarvis-x-p5-safe-preview-v6", grid:"hq-grid.html"}, null, 2));
