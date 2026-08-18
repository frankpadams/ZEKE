(()=>{
'use strict';
const MOBILE='(max-width:760px)';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
let tab='overview';

function mobile(){return matchMedia(MOBILE).matches}
function currentRoute(){
  const active=$('.mobile-nav-item.active[data-route]');
  if(active?.dataset.route)return active.dataset.route;
  const title=($('.page-head h1')?.textContent||'').toLowerCase();
  if(title.includes('fitness'))return'fitness';
  if(title.includes('health'))return'health';
  return'dashboard';
}
function markRoute(){
  if(!mobile()){delete document.body.dataset.mobileRoute;return}
  document.body.dataset.mobileRoute=currentRoute();
}
function repairMore(){
  if(!mobile())return;
  const more=$('#mobileMoreButton');
  if(more&&!more.dataset.zekeReliableMore){
    more.dataset.zekeReliableMore='true';
    /* Existing app also binds this. This capture-phase handler guarantees the drawer opens
       even when another mobile layer has changed sidebar visibility. */
    more.addEventListener('click',e=>{
      document.body.classList.add('nav-open');
    },true);
  }
}
function tabs(){
  if(!mobile()||currentRoute()!=='fitness')return;
  const pageHead=$('.page-head'), workspace=$('.fitness-workspace');
  if(!pageHead||!workspace)return;
  let nav=$('.mobile-fitness-tabs');
  if(!nav){
    nav=document.createElement('nav');
    nav.className='mobile-fitness-tabs';
    nav.setAttribute('aria-label','Fitness sections');
    nav.innerHTML=[
      ['overview','Overview'],['workouts','Workouts'],['exercises','Exercises'],['progress','Progress']
    ].map(([id,label])=>`<button type="button" class="mobile-fitness-tab" data-mobile-fitness-tab="${id}">${label}</button>`).join('');
    pageHead.insertAdjacentElement('afterend',nav);
  }
  $$('.mobile-fitness-tab',nav).forEach(b=>{
    const on=b.dataset.mobileFitnessTab===tab;
    b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false');
  });
}
function chooseLibrary(value){
  const select=$('#activityLibrarySelect');
  if(!select)return false;
  if(![...select.options].some(o=>o.value===value))return false;
  select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));return true;
}
function collapseGuides(root=document){
  if(!mobile())return;
  const guides=root.matches?.('.mobile-exercise-form')?[root]:$$('.mobile-exercise-form',root);
  guides.forEach(d=>{
    if(d.dataset.zekeInitialCollapse)return;
    d.dataset.zekeInitialCollapse='true';d.removeAttribute('open');
  });
}
function safeBars(root=document){
  if(!mobile())return;
  const scope=root.nodeType===1?root:document;
  $$('form',scope).forEach(form=>{
    if(form.closest('.direct-entry-card,.mobile-exercise-page,.zeke-form-sheet,.drawer,.modal-card')){
      const groups=$$('div,footer,section',form).filter(el=>{
        if(el.classList.contains('direct-entry-actions')||el.classList.contains('mobile-exercise-actions')||el.classList.contains('mobile-safe-actionbar'))return false;
        const buttons=[...el.children].filter(x=>x.tagName==='BUTTON');
        return buttons.length>0&&buttons.length<=3&&buttons.some(b=>/^(save|submit|confirm|done|add|update|log|finish)/i.test((b.textContent||'').trim()));
      });
      groups.forEach(g=>g.classList.add('mobile-safe-actionbar'));
    }
  });
}
function adapt(){
  markRoute();if(!mobile())return;
  repairMore();tabs();collapseGuides();safeBars();
}
document.addEventListener('click',e=>{
  if(!mobile())return;
  const t=e.target.closest?.('[data-mobile-fitness-tab]');
  if(t){
    tab=t.dataset.mobileFitnessTab;tabs();
    if(tab==='workouts'){
      requestAnimationFrame(()=>$('.fitness-history-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }else if(tab==='exercises'){
      chooseLibrary('all');
      requestAnimationFrame(()=>$('.fitness-library-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }else if(tab==='progress'){
      chooseLibrary('favorites');
      requestAnimationFrame(()=>$('.fitness-library-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }else{
      requestAnimationFrame(()=>$('.fitness-library-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
    }
  }
  if(e.target.closest?.('.sidebar [data-route],.sidebar #openTalkNav')){
    document.body.classList.remove('nav-open');
  }
},{passive:true});

const observer=new MutationObserver(records=>{
  if(!mobile())return;
  for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1){collapseGuides(n);safeBars(n)}
  requestAnimationFrame(adapt);
});
function start(){
  document.body.classList.add('zeke-mobile-mockup-fidelity-v0433');
  adapt();observer.observe(document.body,{childList:true,subtree:true});
  matchMedia(MOBILE).addEventListener?.('change',adapt);
  window.addEventListener('resize',adapt,{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();