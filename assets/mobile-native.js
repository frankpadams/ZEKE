/* ZEKE v0.45.0 mobile presentation/runtime affordances. */
(() => {
  'use strict';
  const isMobile=()=>matchMedia('(max-width:760px)').matches;
  function normalize(){
    document.documentElement.classList.toggle('zeke-mobile',isMobile());
    if(!isMobile())return;
    document.querySelectorAll('.fitness-history-panel table tbody tr').forEach(row=>{row.setAttribute('tabindex','0');row.setAttribute('role','button');row.setAttribute('aria-label','Workout history record');});
    document.querySelectorAll('.direct-entry-card').forEach(card=>card.setAttribute('role','dialog'));
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(normalize));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('resize',normalize,{passive:true});normalize();
})();
