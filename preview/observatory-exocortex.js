(()=>{'use strict';
const $=s=>document.querySelector(s);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
const cockpit=$('.cockpit'),core=$('.sanctuary'),oldDock=$('.dock'),pill=$('#jx-neural-pill');
if(!cockpit||!core||!oldDock||!pill)return;
document.documentElement.dataset.exocortex='cinema-hud';
pill.innerHTML='<div class="ex-pill-brand"><span class="ex-live-dot"></span><div><b>JARVIS-X / EXOCORTEX</b><small>LOCAL PREVIEW · iPad OPTIMIZED</small></div></div><div class="ex-pill-state"><span>OFFLINE AES-GCM</span><i>·</i><span>VOICE FR / EN / ES</span><i>·</i><span>SABOTEUR: UNKNOWN</span><i>·</i><span>GATEWAY: NOT CONNECTED</span></div><button class="ex-audio-stop" type="button" aria-label="Stop audio">■ AUDIO STOP</button>';
const left=make('aside','ex-side ex-left');
const right=make('aside','ex-side ex-right');
function panel(kicker,title,copy,status,action,kind='neutral'){
 const p=make('section','ex-panel ex-'+kind);const k=make('small','ex-kicker',kicker),h=make('h2','',title),d=make('p','',copy),s=make('strong','ex-status',status);
 p.append(k,h,d,s);
 if(action){const b=make('button','ex-panel-action',action.label);b.type='button';b.addEventListener('click',action.run);p.append(b)}
 return p;
}
function info(title,body){
 let modal=$('#ex-info');if(!modal){modal=make('section','ex-info');modal.id='ex-info';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');const card=make('div','ex-info-card');const h=make('h2');const p=make('p');const b=make('button','','CLOSE');b.type='button';b.addEventListener('click',()=>modal.classList.remove('open'));card.append(h,p,b);modal.append(card);modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});modal._h=h;modal._p=p;document.body.append(modal)}
 modal._h.textContent=title;modal._p.textContent=body;modal.classList.add('open');
}
left.append(
 panel('01 / RADAR','PRONOTE × FOOTBALL','Calendars are not connected in this isolated preview. Import or sync status will appear here only after a real source is authorized.','DATA: NOT LOADED',null,'amber'),
 panel('02 / APPROVAL GATE','L3 APPROVAL','No pending proposal is loaded. Approval remains disabled until a real proposal, hash and policy check are present.','PENDING: UNKNOWN',{label:'L3 APPROVAL · LOCKED',run:()=>info('L3 approval locked','No real proposal or verified SHA-256 is loaded. Nothing can be approved from this preview.')},'amber')
);
right.append(
 panel('03 / EVIDENCE LEDGER','INTEGRITY & AUDIT','No live SaboteurAgent or gateway connection is claimed. Evidence will be shown only when produced by the connected runtime.','SABOTEUR: UNKNOWN',null),
 panel('04 / OFFLINE TELEMETRY','ENCRYPTED OUTBOX','IndexedDB queue and encryption key status are not inspected by this display layer. Open the memory module to inspect local records.','QUEUE: NOT INSPECTED',{label:'OPEN MEMORY',run:()=>document.querySelector('[data-v29-add="vault"]')?.click()||info('Memory','The memory module is not available in this preview.')})
);
cockpit.classList.add('ex-cockpit');
cockpit.insertBefore(left,core);cockpit.append(right);
const dock=make('nav','ex-dock');dock.setAttribute('aria-label','Main control dock');
const entries=[
 ['VOICE LIVE','VOICE','Voice capability status is not connected in this preview. The control does not start microphone capture.'],
 ['PERCEPTION & PENCIL','PERCEPTION','PDF import and Apple Pencil pressure support must be validated on the target iPad. This preview does not claim either is active.'],
 ['AI BUILDER','BUILDER','Open the existing local agent/module launcher. No code is executed or approved by this shortcut.'],
 ['MEMORY & OFFLINE','MEMORY','Open the existing local memory vault. Queue encryption status is not inferred from this screen.'],
 ['HQ GRID','HQ','Return to the isolated HQ preview.']
];
entries.forEach(([label,key,desc])=>{const b=make(key==='HQ'?'a':'button','ex-dock-button',label);b.type=key==='HQ'?'':'button';if(key==='HQ')b.href='./index.html';else b.addEventListener('click',()=>{if(key==='MEMORY'){const target=document.querySelector('[data-v29-add="vault"]');if(target){target.click();return}}if(key==='BUILDER'){const target=document.querySelector('[data-v29-open]');if(target){target.click();return}}info(label,desc)});dock.append(b)});
document.body.append(dock);
oldDock.setAttribute('aria-hidden','true');oldDock.classList.add('ex-retired-dock');
const stop=$('.ex-audio-stop');stop.addEventListener('click',()=>{try{window.speechSynthesis?.cancel()}catch{}document.querySelectorAll('audio').forEach(a=>{a.pause();a.currentTime=0});info('Audio stop','Browser speech and audio elements were asked to stop. No background audio session is claimed.')});
const boot=$('#jx-cinema-boot');if(boot){const skip=()=>boot.classList.add('done','boot-dismissed');$('#skip-boot')?.addEventListener('click',skip);window.setTimeout(skip,1500)}
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#ex-info')?.classList.remove('open')});
})();