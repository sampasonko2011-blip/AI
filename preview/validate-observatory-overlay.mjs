import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
const root = path.resolve("source/dist/hq-p5-safe-preview");
const read = (name) => readFileSync(path.join(root, name), "utf8");
const required = ["index.html","observatory.html","hq-grid.html","observatory-exocortex.css","observatory-exocortex.js","sw.js"];
for (const name of required) if (!existsSync(path.join(root,name))) throw new Error("SMOKE_MISSING_FILE: "+name);
const index=read("index.html"), html=read("observatory.html"), grid=read("hq-grid.html"), js=read("observatory-exocortex.js"), css=read("observatory-exocortex.css"), sw=read("sw.js");
for (const needle of ['url=./observatory.html','href="./hq-grid.html"']) if(!index.includes(needle)) throw new Error("ROOT_ENTRY_INVALID: "+needle);
for (const needle of ['id="jx-neural-pill"','class="cockpit"','class="sanctuary"','id="v29-launcher"','id="skip-boot"']) if(!html.includes(needle)) throw new Error("OBSERVATORY_DOM_CONTRACT_MISSING: "+needle);
for (const needle of ["VOICE LIVE","PERCEPTION & PENCIL","AI BUILDER","MEMORY & OFFLINE","CHAT","pointermove","pointerdown","prefers-reduced-motion","./hq-grid.html"]) if(!js.includes(needle)) throw new Error("OVERLAY_JS_CONTRACT_MISSING: "+needle);
if(!css.includes("pointer-events:none")||!css.includes("@media(prefers-reduced-motion:reduce)")||!css.includes("min-height:48px")) throw new Error("OVERLAY_CSS_TOUCH_OR_MOTION_CONTRACT_MISSING");
if(!grid.includes("APEX CAREER OS") && !grid.includes("JARVIS")) throw new Error("HQ_GRID_SOURCE_NOT_PRESERVED");
if(!sw.includes('"./hq-grid.html"')) throw new Error("HQ_GRID_NOT_IN_OFFLINE_SHELL");
console.log("OBSERVATORY_OVERLAY_SMOKE: PASS (static contract only; no browser/device E2E)");

const dockButtons = (js.match(/\['(?:VOICE|PERCEPTION|AI BUILDER|MEMORY)'/g) || []).length;
if (dockButtons !== 4 || !js.includes("HQ GRID") || js.includes("['CHAT','chat']")) throw new Error("CONTROL_DOCK_MUST_HAVE_FIVE_CONTROLS");
if (!css.includes("grid-template-columns:280px minmax(0,1fr) 280px") || !css.includes("height:100dvh") || !css.includes("#v29-panels")) throw new Error("LANDSCAPE_LAYOUT_CONTRACT_MISSING");
console.log("LANDSCAPE_LAYOUT_AND_FIVE_CONTROL_DOCK: PASS");
