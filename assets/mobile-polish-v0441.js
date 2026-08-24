(()=>{
'use strict';
const MOBILE='(max-width:760px)';
const BUILD=`v${window.ZEKE_BUILD?.version||'0.46.0'} · build ${window.ZEKE_BUILD?.build||'2026.08.24.1'}`;
const mobile=()=>matchMedia(MOBILE).matches;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function ensureVersion(root=document){
  const screens=[];
  if(root.matches?.('.startup-screen'))screens.push(root);
  screens.push(...(root.querySelectorAll?.('.startup-screen')||[]));
  screens.forEach(screen=>{
    let v=screen.querySelector('.startup-version');
    if(!v){v=document.createElement('div');v.className='startup-version';(screen.querySelector('.startup-card')||screen).appendChild(v)}
    v.textContent=BUILD;
  });
}
function collapseCoach(root=document){
  if(!mobile())return;
  const scopes=[];
  if(root.matches?.('.mobile-exercise-coach,.coach-rec'))scopes.push(root);
  scopes.push(...(root.querySelectorAll?.('.mobile-exercise-coach,.activity-expanded-detail .coach-rec')||[]));
  scopes.forEach(scope=>{
    $$('details',scope).forEach(d=>{
      if(!d.dataset.zekeCollapsed){d.dataset.zekeCollapsed='1';d.removeAttribute('open')}
    });
  });
}
function addHistoryAffordance(root=document){
  if(!mobile())return;
  const areas=[];
  if(root.matches?.('.activity-expanded-detail'))areas.push(root);
  areas.push(...(root.querySelectorAll?.('.activity-expanded-detail')||[]));
  areas.forEach(area=>{
    $$('tbody tr',area).forEach(row=>{
      if(row.dataset.zekeHistoryReady)return;
      row.dataset.zekeHistoryReady='1';
      row.tabIndex=0;
      row.setAttribute('role','button');
      row.setAttribute('aria-label','Open this historical exercise record');
    });
  });
}
function ensureMore(){
  if(!mobile())return;
  const b=$('#mobileMoreButton');
  if(b&&!b.dataset.zekeMoreReliable){
    b.dataset.zekeMoreReliable='1';
    b.addEventListener('click',()=>document.body.classList.add('nav-open'),true);
  }
}
function adapt(root=document){
  if(!mobile())return;
  ensureVersion(root);collapseCoach(root);addHistoryAffordance(root);ensureMore();
}
document.addEventListener('keydown',e=>{
  if(!mobile())return;
  const row=e.target.closest?.('.activity-expanded-detail tbody tr');
  if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();row.click()}
});
const mo=new MutationObserver(rs=>{
  for(const r of rs)for(const n of r.addedNodes)if(n.nodeType===1)adapt(n);
  requestAnimationFrame(()=>adapt());
});
function start(){adapt();mo.observe(document.body,{subtree:true,childList:true});matchMedia(MOBILE).addEventListener?.('change',()=>adapt())}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();