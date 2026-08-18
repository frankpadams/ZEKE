(()=>{
'use strict';
const isMobile=()=>matchMedia('(max-width:760px)').matches;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
let fitnessMode='library';
function route(){return $('.mobile-nav-item.active[data-route]')?.dataset.route||($('.page-head h1')?.textContent||'').trim().toLowerCase()||'dashboard'}
function addFitnessTabs(){
  if(!isMobile()||route()!=='fitness')return;
  const head=$('.page-head'), workspace=$('.fitness-workspace'); if(!head||!workspace)return;
  let tabs=$('.mockup-fitness-tabs');
  if(!tabs){tabs=document.createElement('nav');tabs.className='mockup-fitness-tabs';tabs.innerHTML=`<button data-mf="library">Library</button><button data-mf="mine">My Exercises</button><button data-mf="workouts">Workouts</button>`;head.insertAdjacentElement('afterend',tabs)}
  $$('[data-mf]',tabs).forEach(b=>b.classList.toggle('active',b.dataset.mf===fitnessMode));
  const library=$('.fitness-library-panel'), history=$('.fitness-history-panel');
  if(library)library.hidden=fitnessMode==='workouts'; if(history)history.hidden=fitnessMode!=='workouts';
  const select=$('#activityLibrarySelect'); if(select&&fitnessMode!=='workouts'){
    const desired=fitnessMode==='mine'?'favorites':'all'; if([...select.options].some(o=>o.value===desired)&&select.value!==desired){select.value=desired;select.dispatchEvent(new Event('change',{bubbles:true}))}
  }
}
function collapseGuides(root=document){if(!isMobile())return;const items=root.matches?.('.mobile-exercise-form')?[root]:$$('.mobile-exercise-form',root);items.forEach(x=>{if(!x.dataset.mobileCollapsed){x.dataset.mobileCollapsed='1';x.removeAttribute('open')}})}
function adapt(){document.body.dataset.mobileRoute=route();addFitnessTabs();collapseGuides();}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-mf]');if(b){fitnessMode=b.dataset.mf;addFitnessTabs()}},{passive:true});
const mo=new MutationObserver(rs=>{for(const r of rs)for(const n of r.addedNodes)if(n.nodeType===1)collapseGuides(n);requestAnimationFrame(adapt)});
function start(){adapt();mo.observe(document.body,{childList:true,subtree:true});matchMedia('(max-width:760px)').addEventListener?.('change',adapt)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
