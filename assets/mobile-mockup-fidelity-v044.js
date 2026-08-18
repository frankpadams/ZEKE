(()=>{
  'use strict';
  const brokenVisual = img => {
    if (!img || img.dataset.zekeBroken === 'true') return;
    img.dataset.zekeBroken = 'true';
    const figure = img.closest('figure');
    if (!figure) return;
    const alt = img.getAttribute('alt') || 'Exercise form guide';
    const fallback = document.createElement('div');
    fallback.className = 'zeke-visual-fallback';
    fallback.innerHTML = `<strong>${escapeHtml(alt)}</strong><span>The visual reference did not load. Setup and movement cues remain available below.</span>`;
    figure.replaceWith(fallback);
  };
  const escapeHtml = value => String(value||'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const inspect = root => {
    (root.matches?.('.mobile-exercise-form img') ? [root] : [...root.querySelectorAll?.('.mobile-exercise-form img')||[]]).forEach(img=>{
      img.addEventListener('error',()=>brokenVisual(img),{once:true});
      if (img.complete && img.naturalWidth === 0) brokenVisual(img);
    });
  };
  const start = () => {
    document.body.classList.add('zeke-mobile-mockup-fidelity');
    inspect(document);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(node=>{if(node.nodeType===1)inspect(node)}))).observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
