(()=>{'use strict';
const $=s=>document.querySelector(s);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
const cockpit=$('.cockpit'),oldDock=$('.dock'),pill=$('#jx-neural-pill');
if(!cockpit||!pill)return;
// The sanctuary / astrolabe has been physically removed. Use the cockpit as the
// layout anchor so the HUD still initializes without the legacy visual core.
const core=cockpit;
document.documentElement.dataset.exocortex='cinema-hud';
pill.innerHTML='<div class="ex-pill-brand"><span class="ex-live-dot"></span><div><b>JARVIS-X / EXOCORTEX</b><small>LOCAL PREVIEW · iPad OPTIMIZED</small></div></div><div class="ex-pill-state"><span>OFFLINE AES-GCM</span><i>·</i><span>BEHAVIORAL ENGINE: NOT WIRED</span></div><div class="ex-mode-group" role="group" aria-label="Sensory display mode"><button type="button" data-ex-mode="normal">NORMAL</button><button type="button" data-ex-mode="focus">FOCUS · 40 HZ</button><button type="button" data-ex-mode="sun">SUNSET</button></div><button class="ex-audio-toggle" type="button" aria-pressed="false">AUDIO OFF</button><button class="ex-chat-open" type="button">CHAT</button><button class="ex-audio-stop" type="button" aria-label="Stop audio">■ AUDIO STOP</button>';
const left=make('aside','ex-side ex-left'),right=make('aside','ex-side ex-right');
function info(title,body){let modal=$('#ex-info');if(!modal){modal=make('section','ex-info');modal.id='ex-info';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Information');const card=make('div','ex-info-card'),h=make('h2'),p=make('p'),b=make('button','','CLOSE');b.type='button';b.addEventListener('click',()=>modal.classList.remove('open'));card.append(h,p,b);modal.append(card);modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});modal._h=h;modal._p=p;document.body.append(modal)}modal._h.textContent=title;modal._p.textContent=body;modal.classList.add('open')}
function panel(kicker,title,copy,status,action,kind='neutral'){const p=make('section','ex-panel ex-'+kind);p.append(make('small','ex-kicker',kicker),make('h2','',title),make('p','',copy),make('strong','ex-status',status));if(action){const b=make('button','ex-panel-action',action.label);b.type='button';b.addEventListener('click',action.run);p.append(b)}return p}
left.append(panel('01 / RADAR','PRONOTE × FOOTBALL','Calendars are not connected in this isolated preview. Import and sync status appear only after a real source is authorized.','DATA: NOT LOADED',null,'amber'),panel('02 / APPROVAL GATE','L3 APPROVAL','No pending proposal is loaded. Approval stays locked until a real proposal, hash and policy check are present.','PENDING: UNKNOWN',{label:'L3 APPROVAL · LOCKED',run:()=>info('L3 approval locked','No real proposal or verified SHA-256 is loaded. Nothing can be approved from this preview.')},'amber'));
right.append(panel('03 / EVIDENCE LEDGER','INTEGRITY & AUDIT','No live SaboteurAgent or gateway connection is claimed. Evidence appears only when produced by the connected runtime.','SABOTEUR: UNKNOWN',null),panel('04 / OFFLINE TELEMETRY','ENCRYPTED OUTBOX','Open the real P5 outbox, encrypted Memory Vault or portable Secure Vault.','QUEUE: OPEN ON DEMAND',{label:'OPEN MEMORY',run:()=>openModule('memory')}));cockpit.classList.add('ex-cockpit');const workspace=make('section','ex-workspace');workspace.append(make('small','ex-kicker','CENTRAL WORKSPACE'),make('h1','','WORKSPACE READY'),make('p','','Open Voice, Perception, AI Builder, Memory or Chat. Your active module appears here.'));cockpit.append(left,workspace,right);
function openExisting(key,label){const target=document.querySelector('[data-v29-add="'+key+'"]')||(key==='builder'?document.querySelector('[data-v29-open]'):document.querySelector('[data-v29-open="'+key+'"]'));if(target){target.click();return true}return false}
const modules={
 voice:{label:'VOICE LIVE',title:'Voice Live',state:'BROWSER VOICE CONTROLS · EXPLICIT PERMISSION',view:'chat',summary:'Contrôles vocaux réels du HQ : test de synthèse, sélection FR/EN/ES et reconnaissance vocale si Safari expose l’API. Le micro reste inactif jusqu’à ton clic.'},
 perception:{label:'PERCEPTION & PENCIL',title:'Perception & Pencil',state:'P4.3 · LOCAL IMPORT / PDF.JS / CANVAS',view:'perception',summary:'Module P4.3 réel : import local de fichiers, extraction PDF.js, coach oral et canvas tactile/Apple Pencil. Les fonctions matérielles restent à tester sur ton iPad.'},
 builder:{label:'AI BUILDER',title:'AI Builder · Capability Forge',state:'REGISTRY AVAILABLE · SANDBOX NOT RUNNABLE HERE',view:'forge',summary:'Le registre Forge est monté depuis le vrai HQ. Le moteur AI Builder source dépend de Node.js et de son sandbox runner : cette preview GitHub Pages ne peut pas prétendre exécuter ni approuver un outil.'},
 memory:{label:'MEMORY & OFFLINE',title:'Memory & Offline',state:'P5 · ENCRYPTED LOCAL OUTBOX',view:'p5',summary:'Outbox P5 réelle : IndexedDB, AES-GCM et CRDT. Les vues Memory Vault et Secure Vault sont aussi accessibles depuis les onglets du tiroir.'},
 chat:{label:'CHAT',title:'JARVIS-X · Local Chat',state:'WEBGPU LOCAL MODEL · USER INITIATED',src:'./local-chat.html',summary:'Vrai moteur Local Chat WebLLM. Le téléchargement du modèle démarre uniquement après ton clic sur Load selected model. Pas d’inférence hébergée ni de fallback cloud automatique.'}
};
let active='';let drawer=$('#ex-drawer');
if(!drawer){
 drawer=make('section','ex-drawer');drawer.id='ex-drawer';drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','false');drawer.setAttribute('aria-label','HQ module drawer');
 const head=make('header','ex-drawer-head'),eyebrow=make('small','ex-kicker','EXOCORTEX / MODULE'),title=make('h2','ex-drawer-title','Module'),close=make('button','ex-drawer-close','×');close.type='button';close.setAttribute('aria-label','Close module');close.addEventListener('click',closeDrawer);head.append(eyebrow,title,close);
 const state=make('strong','ex-drawer-state'),summary=make('p','ex-drawer-copy'),tabs=make('nav','ex-drawer-tabs');tabs.setAttribute('aria-label','Module views');
 const frame=make('iframe','ex-module-frame');frame.title='JARVIS-X module';frame.loading='eager';frame.referrerPolicy='no-referrer';frame.setAttribute('allow','microphone; clipboard-read; clipboard-write');
 drawer.append(head,state,summary,tabs,frame);drawer._title=title;drawer._state=state;drawer._body=summary;drawer._tabs=tabs;drawer._frame=frame;document.body.append(drawer);
}
function closeDrawer(){drawer.classList.remove('open');active='';document.documentElement.dataset.activeModule='';core.style.removeProperty('--core-speed');core.style.removeProperty('--core-tilt');core.style.removeProperty('--core-accent');dock.querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed','false'))}
function addFrameStyles(doc,kind){
 if(!doc||!doc.head||!doc.body)return;
 doc.body.classList.add(kind==='local'?'ex-local-chat-frame':'ex-hq-module-frame');
 if(!doc.querySelector('link[data-ex-module-frame]')){const link=doc.createElement('link');link.rel='stylesheet';link.href='./module-frame.css';link.dataset.exModuleFrame='true';doc.head.append(link)}
}
function selectHQView(view){
 try{const doc=drawer._frame.contentDocument;if(!doc)return false;addFrameStyles(doc,'hq');doc.querySelector('#jx-arrival-skip')?.click();const target=doc.querySelector('[data-view="'+view+'"]');if(!target)return false;target.click();return true}catch{return false}
}
function renderDrawerTabs(key){
 const tabs=drawer._tabs;tabs.replaceChildren();
 const options=key==='memory'?[['P5 OUTBOX','p5'],['MEMORY VAULT','memory'],['SECURE VAULT','sync']]:key==='builder'?[['CAPABILITY FORGE','forge'],['PROMPT WORKBENCH','console']]:[];
 for(const [label,view] of options){const b=make('button','ex-drawer-tab',label);b.type='button';b.dataset.view=view;b.addEventListener('click',()=>{selectHQView(view);tabs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});tabs.append(b)}
 tabs.hidden=options.length===0;
}
function openModule(key,button){
 const m=modules[key];if(!m)return;active=key;document.documentElement.dataset.activeModule=key;
 core.style.setProperty('--core-accent',key==='voice'?'#67f7ed':key==='perception'?'#54e6a5':key==='builder'?'#f2c56b':key==='memory'?'#ffb45f':'#67f7ed');
 drawer.dataset.tone=key==='voice'?'cyan':key==='perception'?'emerald':key==='builder'?'gold':key==='memory'?'amber':'cyan';
 drawer._title.textContent=m.title;drawer._state.textContent=m.state;drawer._body.textContent=m.summary;renderDrawerTabs(key);
 const frame=drawer._frame;
 const targetSrc=m.src||'./hq-grid.html';
 if(frame.dataset.src!==targetSrc){
   frame.dataset.src=targetSrc;
   frame.onload=()=>{if(m.src){try{addFrameStyles(frame.contentDocument,'local')}catch{}}else selectHQView(m.view)};
   frame.src=targetSrc;
 }else if(!m.src){selectHQView(m.view)}
 if(key==='memory'){tabsSelect('p5')}
 if(key==='builder'){tabsSelect('forge')}
 function tabsSelect(view){const b=drawer._tabs.querySelector('[data-view="'+view+'"]');if(b)b.setAttribute('aria-pressed','true')}
 drawer.classList.add('open');dock.querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.module===key)));if(button)button.blur();
}
const dock=make('nav','ex-dock');dock.setAttribute('aria-label','Main control dock');
[['VOICE','voice'],['PERCEPTION','perception'],['AI BUILDER','builder'],['MEMORY','memory']].forEach(([label,key])=>{const b=make('button','ex-dock-button',label);b.type='button';b.dataset.module=key;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>active===key?closeDrawer():openModule(key,b));dock.append(b)});
const grid=make('a','ex-dock-button ex-grid-link','HQ GRID');grid.href='./hq-grid.html';grid.setAttribute('aria-label','Open full HQ Grid with 15 modules');dock.append(grid);document.body.append(dock);
if(oldDock){oldDock.setAttribute('aria-hidden','true');oldDock.classList.add('ex-retired-dock');}
const modeButtons=[...pill.querySelectorAll('[data-ex-mode]')],audioToggle=pill.querySelector('.ex-audio-toggle');
function renderModes(){const mode=window.JXSpatial?.mode||'normal';modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exMode===mode)));const on=Boolean(window.JXSpatial?.enabled);audioToggle.setAttribute('aria-pressed',String(on));audioToggle.textContent=on?'AUDIO ON':'AUDIO OFF'}
modeButtons.forEach(b=>b.addEventListener('click',()=>{window.JXSpatial?.setMode(b.dataset.exMode);renderModes()}));
audioToggle.addEventListener('click',()=>{window.JXSpatial?.toggleAudio();renderModes()});
renderModes();
$('.ex-chat-open').addEventListener('click',()=>openModule('chat'));
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(reg=>reg.update()).catch(()=>{});}
const stop=$('.ex-audio-stop');stop.addEventListener('click',()=>{try{window.speechSynthesis?.cancel()}catch{}document.querySelectorAll('audio').forEach(a=>{a.pause();a.currentTime=0});info('Audio stop','Browser speech and audio elements were asked to stop.')});
const boot=$('#jx-cinema-boot');if(boot){const skip=()=>boot.classList.add('done','boot-dismissed');$('#skip-boot')?.addEventListener('click',skip);window.setTimeout(skip,1500)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();$('#ex-info')?.classList.remove('open')}});
/* Lightweight particle field: visual-only canvas, pointer events remain on the page. */
const canvas=make('canvas','ex-particles');canvas.setAttribute('aria-hidden','true');document.body.append(canvas);const ctx=canvas.getContext('2d',{alpha:true});let w=0,h=0,dpr=1,particles=[],pointer={x:-9999,y:-9999,down:false},raf=0,last=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);const count=Math.min(90,Math.max(32,Math.round(w*h/14500)));particles=Array.from({length:count},(_,i)=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:.7+Math.random()*1.25,a:.2+Math.random()*.45,phase:Math.random()*6.28}))}
function position(e){pointer.x=e.clientX;pointer.y=e.clientY;pointer.down=e.buttons>0||e.pointerType==='touch'}
document.addEventListener('pointermove',position,{passive:true});document.addEventListener('pointerdown',position,{passive:true});document.addEventListener('pointerup',()=>pointer.down=false,{passive:true});document.addEventListener('pointercancel',()=>pointer.down=false,{passive:true});addEventListener('resize',resize,{passive:true});resize();
function draw(t){raf=0;ctx.clearRect(0,0,w,h);const cx=core.getBoundingClientRect().left+core.getBoundingClientRect().width/2,cy=core.getBoundingClientRect().top+core.getBoundingClientRect().height/2;const accent=getComputedStyle(core).getPropertyValue('--core-accent').trim()||'#67f7ed';for(const p of particles){if(!reduced){p.x+=p.vx;p.y+=p.vy;p.phase+=.008;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;const dx=p.x-pointer.x,dy=p.y-pointer.y,dist=Math.hypot(dx,dy);if(dist<125){const force=(1-dist/125)*.045*(pointer.down?-1:1);p.vx+=dx/(dist||1)*force;p.vy+=dy/(dist||1)*force}p.vx*=.995;p.vy*=.995}const dx=p.x-cx,dy=p.y-cy,near=Math.hypot(dx,dy)<Math.max(150,core.getBoundingClientRect().width*.65);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=near?accent:'rgba(135,190,210,'+p.a+')';ctx.globalAlpha=p.a;ctx.fill();ctx.globalAlpha=1}if(pointer.down){const d=Math.hypot(pointer.x-cx,pointer.y-cy);if(d<230){ctx.beginPath();ctx.arc(pointer.x,pointer.y,14+((t/8)%34),0,Math.PI*2);ctx.strokeStyle=accent;ctx.globalAlpha=.42;ctx.lineWidth=1.4;ctx.stroke();ctx.globalAlpha=1}}if(!reduced)raf=requestAnimationFrame(draw)}
if(ctx){if(reduced)draw(0);else raf=requestAnimationFrame(draw)}
})();
