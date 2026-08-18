(()=>{
'use strict';
const MOBILE='(max-width:760px)';
let activeFitnessTab='library';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function isMobile(){return matchMedia(MOBILE).matches}
function route(){
  const active=$('.mobile-nav-item.active[data-route]');
  if(active?.dataset.route) return active.dataset.route;
  const h=$('.page-head h1');
  const t=(h?.textContent||'').trim().toLowerCase();
  if(t.startsWith('fitness')) return 'fitness';
  if(t.startsWith('health')) return 'health';
  return 'dashboard';
}
function markRoute(){
  if(!isMobile()){delete document.body.dataset.mobileRoute;return}
  document.body.dataset.mobileRoute=route();
}
function fitnessTabs(){
  if(!isMobile()||route()!=='fitness') return;
  const pageHead=$('.page-head');
  const workspace=$('.fitness-workspace');
  if(!pageHead||!workspace) return;
  let tabs=$('.mobile-fitness-tabs');
  if(!tabs){
    tabs=document.createElement('nav');
    tabs.className='mobile-fitness-tabs';
    tabs.setAttribute('aria-label','Fitness sections');
    tabs.innerHTML=[
      ['library','Library'],
      ['mine','My exercises'],
      ['workouts','Workouts']
    ].map(([id,label])=>`<button type="button" class="mobile-fitness-tab" data-mobile-fitness-tab="${id}">${label}</button>`).join('');
    pageHead.insertAdjacentElement('afterend',tabs);
  }
  $$('.mobile-fitness-tab',tabs).forEach(b=>{
    b.classList.toggle('active',b.dataset.mobileFitnessTab===activeFitnessTab);
    b.setAttribute('aria-current',b.classList.contains('active')?'page':'false');
  });
}
function compactFormGuides(root=document){
  if(!isMobile()) return;
  const guides = root.matches?.('.mobile-exercise-form') ? [root] : $$('.mobile-exercise-form',root);
  guides.forEach(d=>{
    if(d.dataset.zekeInitialCollapse) return;
    d.dataset.zekeInitialCollapse='true';
    d.removeAttribute('open');
  });
}
function safeActionBars(root=document){
  if(!isMobile()) return;
  const candidates = $$('div,footer,section',root).filter(el=>{
    if(el.classList.contains('mobile-safe-actionbar')||el.classList.contains('mobile-exercise-actions')||el.classList.contains('direct-entry-actions')) return false;
    if(!el.closest('.direct-entry-card,.drawer,.modal-card,.mobile-exercise-page')) return false;
    const buttons=$$('button',el);
    if(!buttons.length||buttons.length>4) return false;
    return buttons.some(b=>/^(save|submit|confirm|done|add|update|log it|save changes)/i.test((b.textContent||'').trim()));
  });
  candidates.forEach(el=>{
    const directButtons=[...el.children].filter(n=>n.tagName==='BUTTON');
    if(directButtons.length) el.classList.add('mobile-safe-actionbar');
  });
}
function brokenVisuals(root=document){
  const imgs=root.matches?.('.mobile-exercise-form img')?[root]:$$('.mobile-exercise-form img',root);
  imgs.forEach(img=>{
    if(img.dataset.zekeGuarded) return;
    img.dataset.zekeGuarded='true';
    const fallback=()=>{
      if(img.dataset.zekeBroken==='true') return;
      img.dataset.zekeBroken='true';
      const figure=img.closest('figure');
      if(!figure) return;
      const box=document.createElement('div');
      box.className='zeke-visual-fallback';
      const alt=(img.getAttribute('alt')||'Exercise form guide').replace(/[<>&]/g,'');
      box.innerHTML=`<strong>${alt}</strong><span>The visual reference did not load. Setup and movement cues remain available.</span>`;
      figure.replaceWith(box);
    };
    img.addEventListener('error',fallback,{once:true});
    if(img.complete&&img.naturalWidth===0) fallback();
  });
}
function adapt(){
  markRoute();
  if(!isMobile()) return;
  fitnessTabs();
  compactFormGuides();
  safeActionBars();
  brokenVisuals();
}
function selectFitnessView(value){
  const select=$('#activityLibrarySelect');
  if(!select) return;
  const option=[...select.options].find(o=>o.value===value);
  if(!option) return;
  select.value=value;
  select.dispatchEvent(new Event('change',{bubbles:true}));
}
document.addEventListener('click',e=>{
  const tab=e.target.closest?.('[data-mobile-fitness-tab]');
  if(tab&&isMobile()){
    activeFitnessTab=tab.dataset.mobileFitnessTab;
    if(activeFitnessTab==='library'){
      selectFitnessView('all');
      requestAnimationFrame(()=>$('.fitness-library-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }else if(activeFitnessTab==='mine'){
      selectFitnessView('favorites');
      requestAnimationFrame(()=>$('.fitness-library-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }else{
      requestAnimationFrame(()=>$('.fitness-history-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }
    fitnessTabs();
  }
},{passive:true});
const mo=new MutationObserver(records=>{
  if(!isMobile()) return;
  for(const r of records) for(const n of r.addedNodes) if(n.nodeType===1){compactFormGuides(n);safeActionBars(n);brokenVisuals(n)}
  requestAnimationFrame(adapt);
});
function start(){
  document.body.classList.add('zeke-mobile-first-rebuild');
  adapt();
  mo.observe(document.body,{childList:true,subtree:true});
  matchMedia(MOBILE).addEventListener?.('change',adapt);
  window.addEventListener('resize',adapt,{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();