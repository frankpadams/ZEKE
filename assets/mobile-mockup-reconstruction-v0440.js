
(()=>{
'use strict';

const BUILD={version:'0.44.0',build:'2026.08.17.5',label:'Mobile Mockup Reconstruction'};
const MOBILE='(max-width:760px)';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
let route='dashboard';
let fitnessTab='train';
let shell=null;
let sheet=null;
let secondary=null;
let renderQueued=false;
let startupShown=false;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function isMobile(){return matchMedia(MOBILE).matches}

function sourceRoot(){return $('#root>.app-shell')||$('#root')}

function clickSource(selector){
  const el=$(selector,sourceRoot())||$(selector);
  if(!el)return false;
  el.click();
  return true;
}

function clickRoute(id){
  const candidates=[
    `[data-route="${id}"]`,
    `.nav-item[data-route="${id}"]`,
    `.mobile-nav-item[data-route="${id}"]`
  ];
  for(const sel of candidates){
    const el=$(sel,sourceRoot());
    if(el){el.click();return true}
  }
  return false;
}

function textClean(s=''){return String(s).replace(/\s+/g,' ').trim()}

function metricSource(){
  const cards=$$('.dashboard-health-glance .metric-card',sourceRoot());
  const parsed=cards.map(card=>{
    const label=textClean(card.querySelector('.metric-head')?.textContent||'Metric').replace(/[⋮…]/g,'');
    const value=textClean(card.querySelector('.metric-number')?.textContent||'—');
    const change=textClean(card.querySelector('.metric-change')?.textContent||'');
    return {label,value,change};
  }).filter(x=>x.label&&x.value);
  if(parsed.length)return parsed;
  const any=$$('.metric-card',sourceRoot()).slice(0,8).map(card=>({
    label:textClean(card.querySelector('.metric-head')?.textContent||'Metric'),
    value:textClean(card.querySelector('.metric-number')?.textContent||'—'),
    change:textClean(card.querySelector('.metric-change')?.textContent||'')
  })).filter(x=>x.label);
  return any;
}

function actionSource(){
  const rows=$$('.action-tile',sourceRoot()).slice(0,4).map(card=>({
    title:textClean(card.querySelector('strong')?.textContent||'Action'),
    detail:textClean(card.querySelector('small')?.textContent||card.querySelector('.action-state')?.textContent||''),
    done:card.classList.contains('done')
  }));
  if(rows.length)return rows;
  const fallback=$$('.truthful-recent-list article',sourceRoot()).slice(0,3).map(a=>({
    title:textClean(a.querySelector('strong')?.textContent||'Recent activity'),
    detail:textClean(a.querySelector('small')?.textContent||a.querySelector('p')?.textContent||''),
    done:true
  }));
  return fallback;
}

function coachSource(){
  const coach=$('.coach-panel',sourceRoot())||$('.story-card.thinking',sourceRoot());
  if(!coach)return {title:'ZEKE is watching your trends',body:'As more verified records accumulate, useful coaching will appear here.'};
  const title=textClean(coach.querySelector('h2')?.textContent||coach.querySelector('strong')?.textContent||'Coach’s Eye');
  const body=textClean(coach.querySelector('p')?.textContent||'');
  return {title,body};
}

function fitnessCards(){
  const cards=$$('.fitness-progress-card',sourceRoot()).slice(0,20);
  return cards.map(card=>{
    const name=textClean(card.querySelector('.fitness-card-head strong')?.textContent||'Exercise');
    const sub=textClean(card.querySelector('.fitness-card-head span')?.textContent||'');
    const value=textClean(card.querySelector('.fitness-latest-value')?.textContent||'');
    const variations=$$('.variation-legend-item b',card).slice(0,4).map(x=>textClean(x.textContent));
    return {name,sub,value,variations,source:card};
  }).filter(x=>x.name);
}

function healthMetrics(){
  const cards=$$('.metric-card',sourceRoot());
  return cards.map(card=>({
    label:textClean(card.querySelector('.metric-head')?.textContent||'Metric').replace(/[⋮…]/g,''),
    value:textClean(card.querySelector('.metric-number')?.textContent||'—'),
    change:textClean(card.querySelector('.metric-change')?.textContent||'')
  })).filter(x=>x.label&&x.value).slice(0,12);
}

function greeting(){
  const top=$('.topbar h1',sourceRoot());
  return textClean(top?.textContent||'Good evening');
}

function todayLabel(){
  try{return new Date().toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
  catch(_){return ''}
}

function header(subtitle=''){
  return `<header class="zm-topbar">
    <div class="zm-brand">
      <div class="zm-mark">Z</div>
      <div class="zm-brand-copy"><strong>ZEKE</strong><span>${esc(subtitle||greeting())}</span></div>
    </div>
    <div class="zm-top-actions">
      <button class="zm-icon-button" data-zm-talk aria-label="Talk to ZEKE">✦</button>
      <button class="zm-icon-button" data-zm-secondary aria-label="More">☰</button>
      <button class="zm-avatar-button" data-zm-secondary aria-label="Profile and settings">Z</button>
    </div>
  </header>`;
}

function bottomNav(active){
  return `<nav class="zm-bottom-nav" aria-label="Primary navigation">
    <button class="zm-nav ${active==='dashboard'?'active':''}" data-zm-route="dashboard"><span>⌂</span><b>Dashboard</b></button>
    <button class="zm-nav ${active==='fitness'?'active':''}" data-zm-route="fitness"><span>⌁</span><b>Fitness</b></button>
    <button class="zm-nav ${active==='health'?'active':''}" data-zm-route="health"><span>♡</span><b>Health</b></button>
  </nav>`;
}

function dashboardHTML(){
  const metrics=metricSource().slice(0,3);
  const actions=actionSource().slice(0,3);
  const coach=coachSource();
  return `${header(greeting())}
  <main class="zm-page">
    <section class="zm-section">
      <div class="zm-card zm-glance">
        <div class="zm-glance-title"><strong>Today at a glance</strong><span>${esc(todayLabel())}</span></div>
        <div class="zm-glance-grid">
          ${(metrics.length?metrics:[
            {label:'Weight',value:'—',change:'Latest verified'},
            {label:'Activity',value:'—',change:'Today'},
            {label:'Resting HR',value:'—',change:'Latest verified'}
          ]).map(m=>`<article class="zm-stat"><small>${esc(m.label)}</small><strong>${esc(m.value)}</strong><em>${esc(m.change||'Verified')}</em><div class="zm-mini-line"></div></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="zm-section">
      <div class="zm-section-head"><h2>Today’s Actions</h2><button class="zm-link" data-zm-secondary>View all</button></div>
      <div class="zm-card zm-actions-card">
        ${(actions.length?actions:[
          {title:'Workout',detail:'Not logged yet',done:false},
          {title:'Health check-in',detail:'Review today’s verified data',done:false}
        ]).map(a=>`<button class="zm-action-row" data-zm-action="${esc(a.title)}">
          <span class="zm-action-icon ${a.done?'':'pending'}">${a.done?'✓':'○'}</span>
          <span class="zm-action-main"><strong>${esc(a.title)}</strong><small>${esc(a.detail||'')}</small></span>
          <span class="zm-chevron">›</span>
        </button>`).join('')}
      </div>
    </section>

    <section class="zm-section">
      <div class="zm-section-head"><h2>Coach’s Eye</h2><button class="zm-link" data-zm-coach>See more</button></div>
      <div class="zm-card zm-coach">
        <div class="zm-coach-top"><span class="zm-coach-badge">✦</span><div class="zm-coach-copy"><strong>${esc(coach.title)}</strong><p>${esc(coach.body)}</p></div></div>
        <div class="zm-coach-spark"></div>
      </div>
    </section>

    <section class="zm-section"><button class="zm-log-primary" data-zm-log>＋ Log exercise or activity</button></section>
  </main>${bottomNav('dashboard')}`;
}

function fitnessHTML(){
  const cards=fitnessCards();
  const visible=cards.slice(0,12);
  return `${header('Fitness')}
  <main class="zm-page">
    <section class="zm-card zm-fitness-hero">
      <span class="eyebrow">GYM-OPTIMIZED FITNESS</span>
      <h1>Ready to train?</h1>
      <p>Start a focused workout, log one activity, or review your full exercise history and progress.</p>
      <div class="zm-train-actions">
        <button class="zm-start-workout" data-zm-start-workout>Start workout</button>
        <button class="zm-log-one" data-zm-log>Log one</button>
      </div>
    </section>

    <nav class="zm-tabs" aria-label="Fitness views">
      <button class="zm-tab ${fitnessTab==='train'?'active':''}" data-zm-fit-tab="train">Train</button>
      <button class="zm-tab ${fitnessTab==='exercises'?'active':''}" data-zm-fit-tab="exercises">Exercises</button>
      <button class="zm-tab ${fitnessTab==='progress'?'active':''}" data-zm-fit-tab="progress">Progress</button>
    </nav>

    ${fitnessTab==='train'?trainView(cards):fitnessTab==='progress'?progressView(cards):exerciseView(visible)}
  </main>${bottomNav('fitness')}`;
}

function trainView(cards){
  const recent=cards.slice(0,4);
  return `<section class="zm-section">
    <div class="zm-section-head"><h2>Quick start</h2><button class="zm-link" data-zm-start-workout>Workout options</button></div>
    <div class="zm-card zm-progress-card">
      <button class="zm-progress-row" data-zm-start-workout><span><strong>Start from a routine</strong><small>Load a routine as editable suggestions</small></span><b>Start ›</b></button>
      <button class="zm-progress-row" data-zm-repeat-workout><span><strong>Repeat last workout</strong><small>Bring forward the last session as editable suggestions</small></span><b>Load ›</b></button>
      <button class="zm-progress-row" data-zm-log><span><strong>Enter one exercise or activity</strong><small>Walking, PT, kayaking, strength training, anything</small></span><b>Log ›</b></button>
    </div>
  </section>
  <section class="zm-section"><div class="zm-section-head"><h2>Recent exercises</h2><button class="zm-link" data-zm-fit-tab="exercises">View all</button></div>${exerciseView(recent)}</section>`;
}

function exerciseView(cards){
  return `<div class="zm-search"><input id="zmExerciseSearch" type="search" placeholder="Search exercises"><span>⌕</span></div>
  <section class="zm-exercise-list" id="zmExerciseList">
    ${cards.map(c=>`<button class="zm-exercise" data-zm-exercise="${esc(c.name)}">
      <span class="zm-exercise-head"><span><strong>${esc(c.name)}</strong><small>${esc(c.sub)}</small></span><span class="zm-exercise-value">${esc(c.value)}</span></span>
      <span class="zm-chart"></span>
      <span class="zm-variation-pills">${(c.variations.length?c.variations:['History']).map(v=>`<span class="zm-pill">${esc(v)}</span>`).join('')}</span>
    </button>`).join('')||`<div class="zm-card" style="padding:18px;font-size:12px;color:#758597">No exercise history is available in the current view yet.</div>`}
  </section>`;
}

function progressView(cards){
  const rows=cards.slice(0,8);
  return `<section class="zm-section"><div class="zm-section-head"><h2>Progress</h2><button class="zm-link" data-zm-source-route="fitness">Full fitness history</button></div>
    <div class="zm-card zm-progress-card">
      ${rows.map(c=>`<button class="zm-progress-row" data-zm-exercise="${esc(c.name)}"><span><strong>${esc(c.name)}</strong><small>${esc(c.sub||'Exercise history')}</small></span><b>${esc(c.value||'View')}</b></button>`).join('')||`<div style="padding:12px;font-size:12px;color:#758597">Progress appears here as verified workouts accumulate.</div>`}
    </div>
  </section>`;
}

function healthHTML(){
  const metrics=healthMetrics();
  return `${header('Health')}
  <main class="zm-page">
    <section class="zm-section"><div class="zm-section-head"><h2>Health at a glance</h2><button class="zm-link" data-zm-source-route="health">Full Health</button></div>
      <div class="zm-health-grid">
        ${(metrics.length?metrics.slice(0,8):[
          {label:'Weight',value:'—',change:'No verified value'},
          {label:'A1c',value:'—',change:'No verified value'},
          {label:'Blood pressure',value:'—',change:'No verified value'},
          {label:'Sleep',value:'—',change:'No verified value'}
        ]).map(m=>`<button class="zm-card zm-health-metric" data-zm-health="${esc(m.label)}"><small>${esc(m.label)}</small><strong>${esc(m.value)}</strong><em>${esc(m.change||'Verified')}</em><div class="zm-mini-line"></div></button>`).join('')}
      </div>
    </section>
    <section class="zm-section"><div class="zm-section-head"><h2>Health tools</h2></div>
      <div class="zm-card zm-progress-card">
        <button class="zm-progress-row" data-zm-source-route="health"><span><strong>Health library</strong><small>Measurements, labs, medications, conditions and history</small></span><b>Open ›</b></button>
        <button class="zm-progress-row" data-zm-questions><span><strong>Questions for You</strong><small>Review information ZEKE needs you to confirm</small></span><b>Review ›</b></button>
        <button class="zm-progress-row" data-zm-log-health><span><strong>Log health information</strong><small>Add a measurement, symptom, medication, or observation</small></span><b>Log ›</b></button>
      </div>
    </section>
  </main>${bottomNav('health')}`;
}

function logSheetHTML(){
  return `<div class="zm-scrim" id="zmSheet"><section class="zm-sheet" role="dialog" aria-modal="true" aria-label="Log exercise or activity">
    <div class="zm-handle"></div>
    <div class="zm-sheet-head"><h2>Log exercise or activity</h2><button class="zm-sheet-close" data-zm-sheet-close>×</button></div>
    <button class="zm-choice" data-zm-log-one><span class="zm-choice-icon">⌁</span><span><strong>Enter one exercise or activity</strong><small>Log any activity or single exercise</small></span><span class="zm-chevron">›</span></button>
    <button class="zm-choice" data-zm-start-workout><span class="zm-choice-icon">▤</span><span><strong>Start from routine</strong><small>Load a saved routine as editable suggestions</small></span><span class="zm-chevron">›</span></button>
    <button class="zm-choice" data-zm-repeat-workout><span class="zm-choice-icon">↻</span><span><strong>Repeat last workout</strong><small>Load your last workout as editable suggestions</small></span><span class="zm-chevron">›</span></button>
    <button class="zm-sheet-cancel" data-zm-sheet-close>Cancel</button>
  </section></div>`;
}

function secondaryHTML(){
  const links=[
    ['questions','Questions for You'],['calendar','Calendar'],['insights','Discover'],['documents','Documents'],
    ['medications','Medications & supplements'],['settings','Settings']
  ];
  return `<div class="zm-secondary" id="zmSecondary"><aside class="zm-secondary-panel">
    <div class="zm-secondary-head"><strong>ZEKE</strong><button class="zm-sheet-close" data-zm-secondary-close>×</button></div>
    <div class="zm-secondary-list">
      <button class="zm-secondary-item" data-zm-talk>✦ &nbsp; Talk to ZEKE</button>
      ${links.map(([id,label])=>`<button class="zm-secondary-item" data-zm-secondary-route="${id}">${esc(label)}</button>`).join('')}
    </div>
    <div class="zm-version">v${BUILD.version} · ${BUILD.build}<br>Mobile Mockup Reconstruction</div>
  </aside></div>`;
}

function ensureStartup(){
  if(!isMobile()||startupShown)return;
  startupShown=true;
  const root=$('#root');
  if(!root)return;
  const clone=document.createElement('div');
  clone.className='startup-screen zm-startup-clone';
  clone.innerHTML=`<div class="zm-startup-card"><div class="zm-startup-mark">Z</div><div class="zm-startup-name">ZEKE</div><div class="zm-startup-message">Starting ZEKE…</div><div class="zm-startup-version">v${BUILD.version}</div><div class="zm-startup-build">build ${BUILD.build}</div></div>`;
  root.prepend(clone);
  const clear=()=>clone.remove();
  setTimeout(clear,900);
}

function ensureShell(){
  if(!isMobile()){
    document.body.classList.remove('zm-mobile-active');
    $('#zekeMobileApp')?.remove();
    return;
  }
  document.body.classList.add('zm-mobile-active');
  if(!shell){
    shell=document.createElement('div');
    shell.id='zekeMobileApp';
    document.body.appendChild(shell);
  }
}

function render(){
  if(!isMobile())return;
  ensureShell();
  shell.innerHTML=route==='fitness'?fitnessHTML():route==='health'?healthHTML():dashboardHTML();
}

function scheduleRender(){
  if(renderQueued)return;
  renderQueued=true;
  requestAnimationFrame(()=>{renderQueued=false;render()});
}

function openSheet(){
  closeSheet();
  document.body.insertAdjacentHTML('beforeend',logSheetHTML());
  sheet=$('#zmSheet');
}
function closeSheet(){sheet?.remove();sheet=null;$('#zmSheet')?.remove()}
function openSecondary(){
  closeSecondary();
  document.body.insertAdjacentHTML('beforeend',secondaryHTML());
  secondary=$('#zmSecondary');
}
function closeSecondary(){secondary?.remove();secondary=null;$('#zmSecondary')?.remove()}

function openTalk(){
  closeSecondary();
  if(clickSource('#globalTalkButton'))return;
  if(clickSource('#openTalkNav'))return;
  if(clickSource('#mobileLogButton'))return;
}

function logOne(){
  closeSheet();
  if(clickSource('#fitnessLogBtn')){
    setTimeout(()=>{
      const button=$$('[data-quick-log],button',document).find(b=>/enter one|single exercise|log activity|exercise or activity/i.test(textClean(b.textContent)));
      button?.click();
    },60);
    return;
  }
  clickSource('#mobileLogButton');
}

function startWorkout(repeat=false){
  closeSheet();
  const selector=repeat?'#repeatLastWorkoutBtn':'#fitnessLogBtn';
  if(repeat&&clickSource(selector))return;
  if(clickSource('#fitnessLogBtn')){
    setTimeout(()=>{
      const candidates=$$('button',document);
      const re=repeat?/repeat last workout/i:/start from routine|start workout|routine/i;
      candidates.find(b=>re.test(textClean(b.textContent)))?.click();
    },80);
  }
}

function openExercise(name){
  const cards=$$('.fitness-progress-card',sourceRoot());
  const card=cards.find(c=>textClean(c.querySelector('.fitness-card-head strong')?.textContent||'')===name);
  if(card){
    card.click();
    setTimeout(()=>{
      const guide=card.querySelector('[data-form-guide]');
      // preserve user's action: opening tile first; guide remains explicit inside source detail.
    },50);
  }
}

function openHealthMetric(label){
  const cards=$$('.metric-card',sourceRoot());
  const card=cards.find(c=>textClean(c.querySelector('.metric-head')?.textContent||'').replace(/[⋮…]/g,'')===label);
  card?.click();
}

function textClean(s=''){return String(s).replace(/\s+/g,' ').trim()}

document.addEventListener('click',e=>{
  if(!isMobile())return;
  const routeBtn=e.target.closest('[data-zm-route]');
  if(routeBtn){route=routeBtn.dataset.zmRoute; clickRoute(route); scheduleRender();return}
  if(e.target.closest('[data-zm-secondary]')){openSecondary();return}
  if(e.target.closest('[data-zm-secondary-close]')){closeSecondary();return}
  const sr=e.target.closest('[data-zm-secondary-route]');
  if(sr){closeSecondary();clickRoute(sr.dataset.zmSecondaryRoute);return}
  if(e.target.closest('[data-zm-talk]')){openTalk();return}
  if(e.target.closest('[data-zm-log]')){openSheet();return}
  if(e.target.closest('[data-zm-sheet-close]')){closeSheet();return}
  if(e.target.closest('[data-zm-log-one]')){logOne();return}
  if(e.target.closest('[data-zm-start-workout]')){startWorkout(false);return}
  if(e.target.closest('[data-zm-repeat-workout]')){startWorkout(true);return}
  const tab=e.target.closest('[data-zm-fit-tab]');
  if(tab){fitnessTab=tab.dataset.zmFitTab;render();return}
  const ex=e.target.closest('[data-zm-exercise]');
  if(ex){openExercise(ex.dataset.zmExercise);return}
  const hm=e.target.closest('[data-zm-health]');
  if(hm){openHealthMetric(hm.dataset.zmHealth);return}
  if(e.target.closest('[data-zm-source-route]')){clickRoute(e.target.closest('[data-zm-source-route]').dataset.zmSourceRoute);return}
  if(e.target.closest('[data-zm-questions]')){clickRoute('questions');return}
  if(e.target.closest('[data-zm-log-health]')){if(!clickSource('#mobileLogButton'))clickRoute('health');return}
  if(e.target.id==='zmSheet'){closeSheet();return}
  if(e.target.id==='zmSecondary'){closeSecondary();return}
});

document.addEventListener('input',e=>{
  if(e.target.id!=='zmExerciseSearch')return;
  const q=e.target.value.trim().toLowerCase();
  $$('#zmExerciseList .zm-exercise').forEach(card=>{
    card.hidden=q&&!textClean(card.textContent).toLowerCase().includes(q);
  });
});

const observer=new MutationObserver(records=>{
  if(!isMobile())return;
  // Ignore mutations inside our shell to prevent loops.
  if(records.every(r=>r.target.closest?.('#zekeMobileApp,#zmSheet,#zmSecondary')))return;
  scheduleRender();
});

function start(){
  if(!isMobile())return;
  ensureStartup();
  ensureShell();
  render();
  observer.observe($('#root')||document.body,{subtree:true,childList:true,characterData:true});
  matchMedia(MOBILE).addEventListener?.('change',()=>location.reload());
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
