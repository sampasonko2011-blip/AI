import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
const root = path.resolve("source/dist/hq-p5-safe-preview");
const read = (name) => readFileSync(path.join(root, name), "utf8");
const required = ["index.html","observatory.html","hq-grid.html","observatory-exocortex.css","observatory-exocortex.js","sw.js"];
for (const name of required) if (!existsSync(path.join(root,name))) throw new Error("SMOKE_MISSING_FILE: "+name);
const index=read("index.html"), html=read("observatory.html"), grid=read("hq-grid.html"), js=read("observatory-exocortex.js"), css=read("observatory-exocortex.css"), sw=read("sw.js");
for (const retired of ["observatory.js","v54-observatory.js"]) if (existsSync(path.join(root,retired))) throw new Error("RETIRED_SCRIPT_STILL_PUBLISHED: "+retired);
for (const name of ["observatory.css","interstellar-v30.css","interstellar-v31.css","interstellar-v32.css","spatial-liquid-hud.css","v54-harmony.css","observatory-exocortex.css"]) {
  const content=read(name);
  if (/(?:\\.sanctuary|#astrolabe|\\.astrolabe|\\.crystal|\\.jx-v54-shell|\\.jx-v54-orb|\\.jx-v54-panel|\\.jx-v54-title|\\.jx-v54-value)/.test(content)) throw new Error("LEGACY_VISUAL_CORE_CSS_REMAINS: "+name);
}
for (const needle of ['url=./observatory.html','href="./hq-grid.html"']) if(!index.includes(needle)) throw new Error("ROOT_ENTRY_INVALID: "+needle);
for (const needle of ['id="jx-neural-pill"','class="cockpit"','id="v29-launcher"','id="skip-boot"']) if(!html.includes(needle)) throw new Error("OBSERVATORY_DOM_CONTRACT_MISSING: "+needle);
for (const forbidden of ['class="sanctuary"','id="astrolabe"','class="astrolabe"','class="crystal"','NEURAL CONSTELLATION // VISUAL CORE','<nav class="dock">','＋ ADD MODULE','CHAT IA</a>','src="./observatory.js"','src="./v54-observatory.js"']) if(html.includes(forbidden)) throw new Error("LEGACY_VISUAL_CORE_STILL_PUBLISHED: "+forbidden);
for (const needle of ["VOICE LIVE","PERCEPTION & PENCIL","AI BUILDER","MEMORY & OFFLINE","CHAT","pointermove","pointerdown","prefers-reduced-motion","./hq-grid.html"]) if(!js.includes(needle)) throw new Error("OVERLAY_JS_CONTRACT_MISSING: "+needle);
if(!css.includes("pointer-events:none")||!css.includes("@media(prefers-reduced-motion:reduce)")||!css.includes("min-height:48px")) throw new Error("OVERLAY_CSS_TOUCH_OR_MOTION_CONTRACT_MISSING");
if(!grid.includes("APEX CAREER OS") && !grid.includes("JARVIS")) throw new Error("HQ_GRID_SOURCE_NOT_PRESERVED");
for (const retired of ['"./observatory.js"','"./v54-observatory.js"']) if(sw.includes(retired)) throw new Error("RETIRED_SCRIPT_IN_OFFLINE_SHELL: "+retired);
for (const asset of ['"./hq-grid.html"','"./observatory-exocortex.css"','"./observatory-exocortex.js"']) if(!sw.includes(asset)) throw new Error("PREVIEW_ASSET_NOT_IN_OFFLINE_SHELL: "+asset);
if(!sw.includes('jarvis-x-p5-safe-preview-v5') || /jarvis-x-p5-safe-preview-v[1234]/.test(sw)) throw new Error("SERVICE_WORKER_CACHE_NAMESPACE_NOT_V5");
if (html.includes('<nav class="dock">') || html.includes("＋ ADD MODULE") || html.includes("CHAT IA</a>")) throw new Error("LEGACY_TOOLBAR_STILL_PUBLISHED");
console.log("OBSERVATORY_OVERLAY_SMOKE: PASS (static contract only; no browser/device E2E)");

const dockButtons = (js.match(/\['(?:VOICE|PERCEPTION|AI BUILDER|MEMORY)'/g) || []).length;
if (dockButtons !== 4 || !js.includes("HQ GRID") || !js.includes("ex-chat-open") || !js.includes("const core=cockpit")) throw new Error("CONTROL_DOCK_OR_CHAT_ACCESS_CONTRACT_FAILED");
if (!css.includes("grid-template-columns:280px minmax(0,1fr) 280px") || !css.includes("height:100dvh") || !css.includes("min-height:48px")) throw new Error("LANDSCAPE_LAYOUT_CONTRACT_MISSING");
console.log("LANDSCAPE_LAYOUT_AND_FIVE_CONTROL_DOCK: PASS");
