import * as core from './index-B4jPvT6w.js';
import * as interpreter from './interpreter-CwMccpfV.js';

const UI_KEY='ZEKE_EXPERIENCE_UI_V064';
const CONVO_KEY='ZEKE_CONVERSATION_V064';
const RANGE_OPTIONS=[['Week',7],['Month',30],['Quarter',90],['6 months',180],['Year',365],['All',0]];
const RESEARCH={
  acsm:{title:'ACSM progression models for resistance training',year:2009,url:'https://pubmed.ncbi.nlm.nih.gov/19204579/',note:'Load progression of roughly 2–10% is recommended when the current workload can be performed for 1–2 repetitions beyond the target range.'},
  dose:{title:'Resistance training prescription network meta-analysis',year:2023,url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10579494/',note:'Across prescriptions, resistance training improves strength and hypertrophy; higher loads tend to maximize strength gains, while multiple prescriptions can support hypertrophy.'},
  cvdFamily:{title:'Family history and premature coronary heart disease risk',year:2020,url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7256470/',note:'Family history of cardiovascular disease can add meaningful risk context, especially with premature disease in close relatives.'},
  adhdSuicide:{title:'Suicidal behavior in ADHD: role of comorbidity and context',year:2024,url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11538115/',note:'Population studies report increased suicide-attempt risk in adults with ADHD; individual risk assessment must consider current symptoms, comorbidity, and context.'}
};

const api={
  listEvents:core.S,
  addEvent:core.D,
  askLocal:core.i,
  listDiscoveries:core.x,
  listFactors:core.C,
  saveFactor:core.O,
  metrics:core.P,
  listCalendar:core.b
};
const parseLocal=interpreter.t;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function loadUI(){
  const defaults={range:90,hideEmpty:true,visible:{weight:true,rhr:true,steps:true,a1c:true,workouts:true,labs:true,coach:true,thoughts:true,calendar:true}};
  try{const saved=JSON.parse(localStorage.getItem(UI_KEY)||'{}');return{...defaults,...saved,visible:{...defaults.visible,...(saved.visible||{})}}}catch{return defaults}
}
function saveUI(x){localStorage.setItem(UI_KEY,JSON.stringify(x));}
function loadConvo(){try{return JSON.parse(sessionStorage.getItem(CONVO_KEY)||'[]')}catch{return[]}}
function saveConvo(x){sessionStorage.setItem(CONVO_KEY,JSON.stringify(x.slice(-24)));}
function clarificationFactors(factors){return (factors||[]).filter(x=>x.type==='clarification_question'&&x.status!=='resolved'&&x.status!=='dismissed');}
async function saveQuestion(q){return api.saveFactor({id:q.id||`clarify_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,type:'clarification_question',status:q.status||'open',priority:q.priority||'normal',question:q.question,why:q.why||'',topic:q.topic||'',created_at:q.created_at||new Date().toISOString(),source:'ZEKE uncertainty manager'});}
function localDayKey(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
function isConfirmedToday(e){const status=e?.structured?.interpretation_status||e?.structured?.confirmation_status||'';return localDayKey(new Date(e.timestamp))===localDayKey()&&/confirmed/i.test(status);}
function humanEvent(e){const s=e?.structured||{},cat=e?.category||'entry';if(cat==='measurement'&&s.metric_id==='weight')return `weight ${s.value??''} ${s.unit||'lb'}`.trim();if(cat==='measurement'&&(s.metric_id==='bp_systolic'||s.metric_id==='blood_pressure'))return `blood pressure ${s.systolic??s.value??''}${s.diastolic?'/'+s.diastolic:''} ${s.unit||'mmHg'}`.trim();if(cat==='workout'){const name=s.exercise||s.session_type||'workout',parts=[s.weight?`${s.weight} ${s.unit||'lb'}`:'',s.reps?`${s.reps} reps`:'',s.sets?`${s.sets} sets`:''].filter(Boolean);return `${name}${parts.length?': '+parts.join(', '):''}`;}if(cat==='medication')return `${s.medication_name||s.name||'medication'}${s.dose?` ${s.dose}${s.unit||''}`:''}`;return `${cat}: ${e.raw_text||Object.entries(s).map(([k,v])=>`${k.replaceAll('_',' ')} ${v}`).join(', ')}`;}
function likelyDuplicate(newEvent,events){const ns=newEvent?.structured||{},now=Date.now();return (events||[]).find(e=>{if(e.category!==newEvent.category)return false;const age=Math.abs(now-new Date(e.timestamp).getTime());if(age>6*3600e3)return false;const es=e.structured||{};const keys=['metric_id','value','exercise','weight','reps','sets','medication_name','dose'];const comparable=keys.filter(k=>ns[k]!=null&&es[k]!=null);return comparable.length>=1&&comparable.every(k=>String(ns[k]).toLowerCase()===String(es[k]).toLowerCase());});}
function fmtDate(d){return new Date(d).toLocaleDateString(undefined,{month:'short',day:'numeric'});}
function num(v,d=1){return Number(v).toLocaleString(undefined,{maximumFractionDigits:d});}
function metricPoints(events,id,days=0){
  const cutoff=days?Date.now()-days*864e5:0;
  return events.filter(e=>['measurement','lab'].includes(e.category)&&e.structured?.metric_id===id&&Number.isFinite(Number(e.structured?.value))&&new Date(e.timestamp).getTime()>=cutoff)
    .map(e=>({id:e.id,date:e.timestamp,value:Number(e.structured.value),unit:e.structured.unit||'',source:e.structured.source||e.provenance?.source||'unknown',raw:e.raw_text||''}))
    .sort((a,b)=>new Date(a.date)-new Date(b.date));
}
function latest(points){return points.at(-1)||null;}
function delta(points){return points.length>1?points.at(-1).value-points[0].value:0;}
function workoutEvents(events,days=0){const cutoff=days?Date.now()-days*864e5:0;return events.filter(e=>e.category==='workout'&&new Date(e.timestamp).getTime()>=cutoff).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));}
function groupWeeks(events,days){
  const map=new Map();for(const e of workoutEvents(events,days)){const d=new Date(e.timestamp),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);const key=d.toISOString().slice(0,10);const cur=map.get(key)||{date:key,sessions:new Set(),volume:0};cur.sessions.add(e.timestamp.slice(0,10));cur.volume+=Number(e.structured?.total_volume_lb||0);map.set(key,cur);}return[...map.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(x=>({...x,sessions:x.sessions.size}));
}
function exerciseSeries(events){
  const map=new Map();for(const e of workoutEvents(events)){const s=e.structured||{},name=(s.exercise||s.session_type||'').trim();if(!name||!Number(s.weight))continue;const arr=map.get(name)||[];arr.push({date:e.timestamp,weight:Number(s.weight),reps:Number(s.reps||0),sets:Number(s.sets||0),rpe:Number(s.rpe||0),pain:Number(s.pain||0),id:e.id});map.set(name,arr);}for(const arr of map.values())arr.sort((a,b)=>new Date(a.date)-new Date(b.date));return map;
}
function lineSvg(points,{unit='',empty='Not enough data'}={}){
  if(points.length<2)return `<div class="zx-empty-chart">${esc(empty)}</div>`;
  const w=560,h=170,pad=24,vals=points.map(p=>p.value),min=Math.min(...vals),max=Math.max(...vals),span=max-min||1;
  const xs=points.map((p,i)=>pad+(w-pad*2)*(i/(points.length-1))),ys=points.map(p=>h-pad-(h-pad*2)*((p.value-min)/span));
  const path=xs.map((x,i)=>(i?'L':'M')+x.toFixed(1)+' '+ys[i].toFixed(1)).join(' ');
  const area=`M ${xs[0]} ${h-pad} ${path.replace(/^M /,'L ')} L ${xs.at(-1)} ${h-pad} Z`;
  return `<div class="zx-chart-shell"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="trend chart"><defs><linearGradient id="zxg${Math.random().toString(36).slice(2)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".18"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><g class="zx-gridlines"><line x1="${pad}" y1="${pad}" x2="${w-pad}" y2="${pad}"/><line x1="${pad}" y1="${h/2}" x2="${w-pad}" y2="${h/2}"/><line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}"/></g><path class="zx-area" d="${area}"/><path class="zx-line" d="${path}"/>${points.map((p,i)=>`<circle class="zx-point" cx="${xs[i]}" cy="${ys[i]}" r="4.5" data-tip="${esc(fmtDate(p.date))}: ${esc(num(p.value,2))} ${esc(p.unit||unit)} · ${esc(p.source||'')}" tabindex="0"><title>${esc(fmtDate(p.date))}: ${esc(num(p.value,2))} ${esc(p.unit||unit)}</title></circle>`).join('')}<text x="${pad}" y="14" class="zx-axis-label">${esc(num(max,1))} ${esc(unit)}</text><text x="${pad}" y="${h-5}" class="zx-axis-label">${esc(num(min,1))} ${esc(unit)}</text></svg><div class="zx-chart-tooltip" hidden></div></div>`;
}
function barsSvg(rows,key='sessions'){
  if(!rows.length)return '<div class="zx-empty-chart">No workout history in this range.</div>';
  const w=560,h=170,pad=24,max=Math.max(1,...rows.map(r=>Number(r[key]||0))),bw=Math.max(8,(w-pad*2)/rows.length*.62),step=(w-pad*2)/rows.length;
  return `<div class="zx-chart-shell"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="workout consistency chart"><g class="zx-gridlines"><line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}"/><line x1="${pad}" y1="${h/2}" x2="${w-pad}" y2="${h/2}"/></g>${rows.map((r,i)=>{const val=Number(r[key]||0),bh=(h-pad*2)*(val/max),x=pad+i*step+(step-bw)/2,y=h-pad-bh;return `<rect class="zx-bar" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" data-tip="Week of ${esc(fmtDate(r.date))}: ${val} session${val===1?'':'s'}" tabindex="0"><title>Week of ${esc(fmtDate(r.date))}: ${val} sessions</title></rect>`}).join('')}</svg><div class="zx-chart-tooltip" hidden></div></div>`;
}
function card(title,subtitle,body,extra=''){return `<section class="zx-card"><div class="zx-card-head"><div><h3>${esc(title)}</h3>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div>${extra}</div>${body}</section>`;}
function rangeSelector(ui){return `<div class="zx-range" role="group" aria-label="Time range">${RANGE_OPTIONS.map(([lab,val])=>`<button data-range="${val}" class="${Number(ui.range)===val?'active':''}">${lab}</button>`).join('')}</div>`;}
function metricTile(label,points,{unit='',tone='neutral',metricId=''}={}){const l=latest(points),d=delta(points);return `<div class="zx-metric ${tone}"><div class="zx-metric-label">${esc(label)}</div><div class="zx-metric-value">${l?`${esc(num(l.value,1))}<small>${esc(l.unit||unit)}</small>`:'—'}</div><div class="zx-metric-delta">${points.length>1?`${d>0?'▲':d<0?'▼':'•'} ${esc(num(Math.abs(d),1))} ${esc(l?.unit||unit)} over range`:'Need more observations'}</div><button class="zx-log-here" data-log-context="${esc(metricId||label.toLowerCase())}">+ Log</button></div>`;}
function labTiles(events,days){const ids=['a1c','ldl','apob','lpa','triglycerides','hdl'];const rows=ids.map(id=>[id,latest(metricPoints(events,id,days||0))]).filter(([,p])=>p).slice(0,4);if(!rows.length)return '<div class="zx-empty-chart">No lab results loaded yet.</div>';return `<div class="zx-lab-grid">${rows.map(([id,p])=>{const name=api.metrics.find(m=>m.id===id)?.name||id;return `<div class="zx-lab-tile"><span>${esc(name)}</span><strong>${esc(num(p.value,2))} <small>${esc(p.unit)}</small></strong><em>${esc(fmtDate(p.date))}</em></div>`}).join('')}</div>`;}

function hasLabData(events,days){return ['a1c','ldl','apob','lpa','triglycerides','hdl'].some(id=>metricPoints(events,id,days||0).length>0);}
function calendarList(rows){
  if(!rows?.length)return '<div class="zx-empty-state">No relevant upcoming events found.</div>';
  return `<div class="zx-calendar-list">${rows.slice(0,6).map(e=>{const d=new Date(e.start);return `<div><time><strong>${esc(d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}))}</strong><span>${esc(d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))}</span></time><p>${esc(e.title||'Untitled event')}</p></div>`}).join('')}</div>`;
}
function getTrackingPreference(factors){return factors.find(x=>x.id==='tracking_preferences'||x.type==='tracking_preferences')||null;}
function shouldAskTracking(factors){const pref=getTrackingPreference(factors);if(!pref)return true;if(pref.decision!=='not_now')return false;if(!pref.next_prompt_after)return false;return Date.now()>=new Date(pref.next_prompt_after).getTime();}
function trackingPrompt(){return `<section class="zx-track-prompt"><div><span>💬</span><div><strong>Would it help if I kept track of a few recurring things for you?</strong><p>You can choose prescribed medications, supplements, injections, protein shakes, creatine, or anything else that matters. I’ll still show you my interpretation before structured entries are saved.</p></div></div><div class="zx-track-actions"><button class="zx-primary" data-track-setup>Choose what to track</button><button class="zx-info" data-track-later>Not now</button></div></section>`;}
function customizeButton(){return '<button class="zx-customize" type="button">Customize</button>';}
function coachInsights(events){
  const out=[],series=exerciseSeries(events);for(const [name,arr] of series){if(arr.length<2)continue;const prev=arr.at(-2),last=arr.at(-1),jump=prev.weight?((last.weight-prev.weight)/prev.weight)*100:0;
    if(last.pain>=4||last.pain-prev.pain>=2){out.push({kind:'caution',title:`Pause progression on ${name}`,body:`Pain is ${last.pain||'reported'} /10 in the latest entry${prev.pain?`, up from ${prev.pain}/10`:''}. Repeat, reduce, or change the exercise before adding load, and use your clinical/PT guidance where applicable.`,evidence:['acsm'],exercise:name,score:100});continue;}
    if(jump>10){out.push({kind:'caution',title:`Hold ${name} at the current load`,body:`The most recent load jump was ${jump.toFixed(0)}%. A conservative next step is to repeat the current load and confirm technique, reps, RPE, and pain before increasing again.`,evidence:['acsm'],exercise:name,score:90});continue;}
    if(last.reps>=12 && (!last.rpe||last.rpe<=7) && last.pain<=2){out.push({kind:'progress',title:`${name}: a small increase may be reasonable`,body:`You completed ${last.reps} reps at ${last.weight} lb${last.rpe?` with RPE ${last.rpe}`:''} and low recorded pain. Consider the smallest available load increase, then re-check reps, RPE, and pain.`,evidence:['acsm','dose'],exercise:name,score:80});continue;}
    if(last.reps>=15){out.push({kind:'consider',title:`${name}: clarify the goal of the set`,body:`Your latest set uses ${last.reps} reps at ${last.weight} lb. If strength is the priority, a somewhat heavier load with fewer reps may be worth testing; if endurance is the goal, the current pattern may be appropriate.`,evidence:['dose'],exercise:name,score:60});}
  }
  if(!out.length){const w=workoutEvents(events,90);if(w.length)out.push({kind:'consider',title:'Add RPE and pain to improve coaching',body:'ZEKE can make safer progression suggestions when load, reps, sets, RPE, and pain are recorded together.',evidence:['acsm'],score:30});}
  return out.sort((a,b)=>b.score-a.score).slice(0,4);
}
function researchIdeas(events,factors){const ideas=[];const fam=factors.filter(f=>f.type==='family_history');if(fam.some(f=>/heart|cardio|myocard|coronary|stroke/i.test(`${f.condition||''} ${f.notes||''}`))){ideas.push({title:'Family cardiovascular history belongs in your risk context',body:'You recorded cardiovascular disease in a close relative. ZEKE should treat this as context when discussing lipids, blood pressure, glucose, smoking, and prevention—but not as a diagnosis or a substitute for a clinician.',evidence:['cvdFamily']});}
  if(fam.some(f=>/suicide|adhd|depress|bipolar|mental/i.test(`${f.condition||''} ${f.notes||''}`))){ideas.push({title:'Mental-health family history can add context without defining you',body:'Family and personal psychiatric history can be relevant context for patterns in mood, sleep, stress, attention, and safety. ZEKE should use it cautiously, avoid causal claims, and never infer current symptoms from history alone.',evidence:['adhdSuicide']});}
  const raw=events.map(e=>e.raw_text||'').join(' ').toLowerCase();for(const [term,label] of [['nurri','Nurri protein shakes'],['creatine','creatine'],['protein shake','protein shakes']]){const count=(raw.match(new RegExp(term.replace(' ','\\s+'),'g'))||[]).length;if(count>=2)ideas.push({title:`Would it help if I tracked ${label}?`,body:`You have mentioned ${label} ${count} times. I can treat it as an optional trackable without turning on full food logging.`,evidence:[]});}
  if(!ideas.length)ideas.push({title:'I’m still learning what matters to you',body:'As you talk to ZEKE, I’ll notice repeated themes and ask whether you want them tracked. You can say no, not now, or never suggest it again.',evidence:[]});return ideas.slice(0,3);}
function evidenceLinks(ids){return ids.map(id=>{const s=RESEARCH[id];return `<a href="${s.url}" target="_blank" rel="noopener"><strong>${esc(s.title)}</strong><span>${s.year} · ${esc(s.note)}</span></a>`}).join('');}

function todayActions(events,factors){
  const pref=getTrackingPreference(factors)||{}, tracked=pref.tracked_items||[];
  const candidates=[];
  const meds=(events||[]).filter(e=>e.category==='medication');
  const names=[...new Set(meds.map(e=>e.structured?.medication_name||e.structured?.name).filter(Boolean))];
  names.forEach(name=>{const today=meds.some(e=>(e.structured?.medication_name||e.structured?.name)===name&&isConfirmedToday(e));candidates.push({label:name,done:today,kind:'medication'});});
  if(tracked.includes('creatine'))candidates.push({label:'Creatine',done:(events||[]).some(e=>/creatine/i.test(e.raw_text||'')&&isConfirmedToday(e)),kind:'supplement'});
  if(tracked.includes('protein_shakes'))candidates.push({label:'Protein shake',done:(events||[]).some(e=>/nurri|protein shake/i.test(e.raw_text||'')&&isConfirmedToday(e)),kind:'nutrition'});
  candidates.push({label:'Workout',done:(events||[]).some(e=>e.category==='workout'&&isConfirmedToday(e)),kind:'workout'});
  if(!candidates.length)return '';
  return `<section class="zx-card zx-today"><div class="zx-card-head"><div><h3>Today’s actions</h3><p>Only confirmed events from today count as complete.</p></div></div><div class="zx-action-scroll" tabindex="0">${candidates.map(a=>`<button class="zx-action-tile ${a.done?'done':'pending'}" data-action-log="${esc(a.label)}"><span>${a.done?'✓':'○'}</span><strong>${esc(a.label)}</strong><small>${a.done?'Confirmed today':'Not confirmed today'}</small></button>`).join('')}</div></section>`;
}
async function renderDashboard(){
  const main=$('.dashboard-main');if(!main)return;if($('#zeke-experience-dashboard'))return;
  const ui=loadUI();
  const [events,factors,calendar]=await Promise.all([api.listEvents(),api.listFactors(),api.listCalendar?.(14).catch(()=>[])||[]]);
  const days=Number(ui.range)||0;
  const weight=metricPoints(events,'weight',days),rhr=metricPoints(events,'resting_hr',days),steps=metricPoints(events,'steps',days),a1c=metricPoints(events,'a1c',days);
  const weeks=groupWeeks(events,days||365),coaches=coachInsights(events),ideas=researchIdeas(events,factors);
  const metrics=[
    ['Weight',weight,{unit:'lb',metricId:'weight'},'weight'],['Resting heart rate',rhr,{unit:'bpm',metricId:'resting heart rate'},'rhr'],['Steps',steps,{unit:'steps',metricId:'steps'},'steps'],['A1c',a1c,{unit:'%',metricId:'A1c'},'a1c']
  ].filter(([,pts,,id])=>ui.visible[id]&&(!ui.hideEmpty||pts.length)).map(([label,pts,opt])=>metricTile(label,pts,opt)).join('');
  const graphs=[];
  if(ui.visible.weight&&weight.length>=2)graphs.push(card('Weight trend',`${weight.length} observations in selected range`,lineSvg(weight,{unit:'lb'}),'<button class="zx-info" data-explain="weight">?</button>'));
  if(ui.visible.rhr&&rhr.length>=2)graphs.push(card('Resting heart rate',`${rhr.length} observations in selected range`,lineSvg(rhr,{unit:'bpm'}),'<button class="zx-info" data-explain="rhr">?</button>'));
  if(ui.visible.workouts&&weeks.length)graphs.push(card('Workout consistency','Sessions per week',barsSvg(weeks,'sessions'),'<a class="zx-link" href="#/health/workouts/analytics">Open analytics</a>'));
  if(ui.visible.labs&&hasLabData(events,days))graphs.push(card('Recent labs','Values first; context and reference logic expand from here',labTiles(events,days)));
  if(ui.visible.calendar&&calendar?.length)graphs.push(card('Upcoming events','Date and time together so the schedule is unambiguous',calendarList(calendar)));
  const wrap=document.createElement('div');wrap.id='zeke-experience-dashboard';wrap.className='zx-dashboard';
  wrap.innerHTML=`
    <section class="zx-hero-row"><div><span class="zx-eyebrow">YOUR HEALTH BRIEFING</span><h2>Here’s what matters right now.</h2><p>Real data first. Interpretation second. Evidence and uncertainty are available when you want the detail.</p></div><div class="zx-hero-actions">${customizeButton()}${rangeSelector(ui)}</div></section>
    <section class="zx-conversation" id="zx-conversation"><div class="zx-convo-head"><div class="zx-avatar">Z</div><div><h3>Talk to ZEKE</h3><p>Ask a question or tell me what happened. The conversation and response stay together.</p></div><div class="zx-convo-tools"><button class="zx-questions-indicator" type="button" hidden></button><button class="zx-ai-status" type="button">AI connections</button></div></div><div class="zx-thread"></div><div class="zx-compose"><textarea placeholder="Ask ZEKE something, or tell ZEKE what happened…"></textarea><button class="zx-send" type="button">Send</button></div><div class="zx-convo-hints"><button>Summarize my recent workouts</button><button>What changed this quarter?</button><button>Am I progressing too fast?</button></div></section>
    ${todayActions(events,factors)}
    ${shouldAskTracking(factors)?trackingPrompt():''}
    ${metrics?`<section class="zx-metrics">${metrics}</section>`:'<section class="zx-card zx-start-card"><strong>What would you like ZEKE to help you keep an eye on?</strong><p>Your dashboard will grow around the things you actually track. Use Customize or tell ZEKE what matters to you.</p><button class="zx-primary" data-track-setup>Choose what to track</button></section>'}
    ${graphs.length?`<section class="zx-grid-two">${graphs.join('')}</section>`:''}
    <section class="zx-grid-two zx-insight-grid">
      ${ui.visible.coach?card('Coach’s eye','Evidence-aware prompts based on your logged load, reps, RPE, pain, and progression',coaches.length?`<div class="zx-coach-list">${coaches.map((c,i)=>`<button class="zx-coach ${c.kind}" data-coach="${i}"><span>${c.kind==='caution'?'⚠':'↗'}</span><div><strong>${esc(c.title)}</strong><p>${esc(c.body)}</p></div><em>Why?</em></button>`).join('')}</div>`:'<div class="zx-empty-state">Log more workout details to unlock progression coaching.</div>'):''}
      ${ui.visible.thoughts?card('I’ve been thinking…','Quiet, conversational prompts—not a suggestion queue',`<div class="zx-thoughts">${ideas.map((x,i)=>`<button data-idea="${i}"><span>💬</span><div><strong>${esc(x.title)}</strong><p>${esc(x.body)}</p></div></button>`).join('')}</div>`,'<div class="zx-card-actions"><button class="zx-track-prefs" type="button">Tracking preferences</button></div>'):''}
    </section>`;
  const first=main.firstElementChild;main.insertBefore(wrap,first?.nextSibling||first);
  const layout=main.closest('.dashboard-layout');layout?.classList.add('zx-experience-layout');
  const pageTitle=layout?.previousElementSibling;if(pageTitle?.classList.contains('page-title-row'))pageTitle.classList.add('zx-legacy-hidden');
  hideLegacyDashboard();bindDashboard(wrap,{events,factors,coaches,ideas});bindChartTooltips(wrap);renderThread(wrap);
}
function hideLegacyDashboard(){
  const selectors=['.tell-zeke-card','.widgets-grid','.right-rail','.calendar-card','.ask-zeke-card','.discoveries-card','.zeke-response-card'];selectors.forEach(sel=>$$(sel).forEach(el=>el.classList.add('zx-legacy-hidden')));
  const forbidden=['Talk to ZEKE','Tell ZEKE','Ask ZEKE','Your Discoveries','ZEKE Response'];
  $$('h1,h2,h3,strong,label').forEach(node=>{const text=(node.textContent||'').trim();if(forbidden.some(x=>text.toLowerCase()===x.toLowerCase())){let card=node.closest('section,.card,[class*=card]');if(card&&!card.closest('#zeke-experience-dashboard'))card.classList.add('zx-legacy-hidden');}});
  const actionsHeading=$$('h1,h2,h3,strong').find(n=>/today.?s actions/i.test(n.textContent||''));if(actionsHeading){const card=actionsHeading.closest('section,.card,[class*=card]');card?.classList.add('zx-legacy-hidden');}
}
function bindChartTooltips(root){
  $$('[data-tip]',root).forEach(el=>{const shell=el.closest('.zx-chart-shell'),tip=$('.zx-chart-tooltip',shell);const show=e=>{tip.hidden=false;tip.textContent=el.dataset.tip;tip.style.left=Math.min((e.clientX||shell.getBoundingClientRect().left)-shell.getBoundingClientRect().left+10,shell.clientWidth-220)+'px';tip.style.top='8px';};el.addEventListener('mouseenter',show);el.addEventListener('mousemove',show);el.addEventListener('focus',show);['mouseleave','blur'].forEach(ev=>el.addEventListener(ev,()=>tip.hidden=true));});
}
function bindDashboard(root,state){
  $$('.zx-range button',root).forEach(b=>b.onclick=()=>{const ui=loadUI();ui.range=Number(b.dataset.range);saveUI(ui);root.remove();renderDashboard();});
  $('.zx-ai-status',root).onclick=()=>window.ZekeAIRouter?.open();
  bindClarifications(root,state.factors);
  $$('.zx-log-here',root).forEach(b=>b.onclick=()=>{const ta=$('.zx-compose textarea',root);ta.value=`Log ${b.dataset.logContext}: `;ta.focus();ta.scrollIntoView({behavior:'smooth',block:'center'});});
  $$('.zx-action-tile',root).forEach(b=>b.onclick=()=>{const ta=$('.zx-compose textarea',root);ta.value=`${b.dataset.actionLog}: `;ta.focus();ta.scrollIntoView({behavior:'smooth',block:'center'});});
  $('.zx-customize',root)?.addEventListener('click',()=>openCustomizeModal());
  $$('[data-track-setup]',root).forEach(b=>b.onclick=()=>openTrackingModal(state.factors));
  $('[data-track-later]',root)?.addEventListener('click',()=>deferTrackingPrompt(root));
  $('.zx-track-prefs',root)?.addEventListener('click',()=>openTrackingModal(state.factors));
  $('.zx-send',root).onclick=()=>sendConversation(root,state.events);
  const ta=$('.zx-compose textarea',root);ta.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')sendConversation(root,state.events);});
  $$('.zx-convo-hints button',root).forEach(b=>b.onclick=()=>{ta.value=b.textContent;sendConversation(root,state.events);});
  $$('.zx-coach',root).forEach(b=>b.onclick=()=>openEvidenceModal(state.coaches[Number(b.dataset.coach)]));
  $$('.zx-thoughts button',root).forEach(b=>b.onclick=()=>openIdeaModal(state.ideas[Number(b.dataset.idea)]));
  $$('[data-explain]',root).forEach(b=>b.onclick=()=>openSimpleModal(b.dataset.explain==='weight'?'Weight trend':'Resting heart rate','Hover or focus each point for date, value, and source. Change the global time range to week, month, quarter, 6 months, year, or all-time. ZEKE keeps the values visible and uses the chart to show direction—not to decorate the dashboard.'));
}
async function sendConversation(root,events){
  const ta=$('.zx-compose textarea',root),text=ta.value.trim();if(!text)return;ta.value='';const convo=loadConvo();convo.push({role:'user',text});saveConvo(convo);renderThread(root);
  const lower=text.toLowerCase(),escalate=window.ZekeAIRouter?.shouldEscalate?.(text);
  if(/^bp\s+\d+\s+\d+\s+\d+\s*$/i.test(text)){
    convo.push({role:'zeke',kind:'clarification',text:'I’m not completely sure what you meant there. Were you logging a blood-pressure reading, or a bench-press set?',raw:text,choices:['Blood pressure','Bench press','Something else','Ignore this question']});saveConvo(convo);renderThread(root);bindThreadActions(root);return;
  }
  const isQuestion=/\?|^(why|what|how|when|where|who|am i|should i|can you|could you|tell me about|summarize|compare)\b/i.test(text)||escalate;
  if(!isQuestion){const parsed=parseLocal(text,'note');convo.push({role:'zeke',kind:'interpretation',text:'Here’s what I understood. Did I get that right?',raw:text,events:parsed});saveConvo(convo);renderThread(root);bindThreadActions(root);return;}
  convo.push({role:'zeke',kind:'thinking',text:escalate?'I’ll take another pass and use the AI Router.':'I’m looking at your stored ZEKE data first…'});saveConvo(convo);renderThread(root);
  try{
    if(escalate){const msgs=convo.filter(x=>['user','zeke'].includes(x.role)&&x.kind!=='thinking').slice(-8).map(x=>({role:x.role==='user'?'user':'assistant',content:x.text}));const r=await window.ZekeAIRouter.ask(text,{task:'chat',messages:msgs});convo.pop();convo.push({role:'zeke',kind:'ai',text:r.text,meta:`AI Router · ${r.providerLabel} · ${r.model}`});}
    else{const answer=await api.askLocal(text,events,'local');convo.pop();convo.push({role:'zeke',kind:'local',text:answer.answer,meta:`Local evidence · Confidence ${answer.confidence||'unknown'}`,followups:['Look deeper with AI','Show me the evidence']});}
  }catch(e){convo.pop();convo.push({role:'zeke',kind:'error',text:`I couldn’t complete that pass: ${e.message}`});}
  saveConvo(convo);renderThread(root);bindThreadActions(root);
}
function renderThread(root){const box=$('.zx-thread',root);if(!box)return;const convo=loadConvo();box.innerHTML=convo.length?convo.slice(-14).map((m,i)=>{
  if(m.kind==='interpretation')return `<div class="zx-bubble zeke interpretation" data-msg="${i}"><b>ZEKE</b><p>${esc(m.text)}</p><div class="zx-natural-understanding">${(m.events||[]).map(e=>`<span>${esc(humanEvent(e))}</span>`).join('')}</div><div class="zx-inline-actions"><button data-action="confirm">Yes, that’s right</button><button data-action="ai">Not quite—look deeper</button><button data-action="edit">Let me correct it</button></div></div>`;
  if(m.kind==='clarification')return `<div class="zx-bubble zeke clarification" data-msg="${i}"><b>ZEKE</b><p>${esc(m.text)}</p><div class="zx-inline-actions">${(m.choices||[]).map(c=>`<button data-clarify-choice="${esc(c)}">${esc(c)}</button>`).join('')}<button data-clarify-choice="Later">Later</button></div></div>`;
  if(m.kind==='duplicate')return `<div class="zx-bubble zeke clarification" data-msg="${i}"><b>ZEKE</b><p>${esc(m.text)}</p><div class="zx-inline-actions"><button data-duplicate="keep">Keep both</button><button data-duplicate="one">Use only one</button><button data-duplicate="cancel">Cancel this entry</button></div></div>`;
  return `<div class="zx-bubble ${m.role==='user'?'user':'zeke'} ${m.kind||''}" data-msg="${i}"><b>${m.role==='user'?'You':'ZEKE'}</b><p>${esc(m.text).replace(/\n/g,'<br>')}</p>${m.meta?`<small>${esc(m.meta)}</small>`:''}${m.followups?`<div class="zx-inline-actions">${m.followups.map(f=>`<button data-followup="${esc(f)}">${esc(f)}</button>`).join('')}</div>`:''}</div>`}).join(''):'<div class="zx-welcome"><strong>Good to see you.</strong><span>Tell me what happened, ask about a trend, or say “look deeper” when a local answer isn’t enough.</span></div>';box.scrollTop=box.scrollHeight;bindThreadActions(root);}
function bindClarifications(root,factors){const open=clarificationFactors(factors);const events=window.__ZX_EVENTS||[];const schedules=(factors||[]).filter(x=>/schedule|cadence/i.test(x.type||''));const medNames=[...new Set(events.filter(e=>e.category==='medication').map(e=>e.structured?.medication_name||e.structured?.name).filter(Boolean))];for(const name of medNames){const known=schedules.some(x=>String(x.medication_name||x.name||x.topic||'').toLowerCase()===String(name).toLowerCase());if(!known)open.push({id:`cadence_${String(name).toLowerCase().replace(/[^a-z0-9]+/g,'_')}`,question:`I know ${name} is part of your medication history, but I don’t want to guess its schedule. How often is it supposed to be taken?`,why:'This affects Today’s Actions and adherence summaries.',topic:name,status:'open',priority:'high'});}const btn=$('.zx-questions-indicator',root);if(!btn)return;btn.hidden=!open.length;btn.textContent=`${open.length} question${open.length===1?'':'s'} for you`;btn.onclick=()=>{const q=open[0];if(!q)return;const convo=loadConvo();convo.push({role:'zeke',kind:'clarification',text:q.question,questionId:q.id,choices:['Answer now','I don’t know','Ignore this question']});saveConvo(convo);renderThread(root);};}
function bindThreadActions(root){
  $$('[data-clarify-choice]',root).forEach(b=>b.onclick=async()=>{const bubble=b.closest('.zx-bubble'),idx=Number(bubble.dataset.msg),convo=loadConvo(),m=convo[idx],choice=b.dataset.clarifyChoice;if(choice==='Later'){m.text='No problem. I’ll keep this open and ask again only when it is useful.';m.kind='deferred';saveConvo(convo);renderThread(root);return;}if(choice==='Ignore this question'){m.text='Understood. I won’t keep asking about this.';m.kind='dismissed';if(m.questionId)await saveQuestion({id:m.questionId,question:m.text,status:'dismissed'}).catch(()=>{});saveConvo(convo);renderThread(root);return;}if(choice==='Blood pressure'||choice==='Bench press'){const ta=$('.zx-compose textarea',root);ta.value=choice==='Blood pressure'?`Blood pressure: `:`Bench press: `;m.text=`Thanks. I’ll treat that as ${choice.toLowerCase()} context. Add the details you want me to log.`;m.kind='resolved';saveConvo(convo);renderThread(root);ta.focus();return;}const ta=$('.zx-compose textarea',root);ta.value='';ta.placeholder='Type your answer…';ta.focus();});
  $$('[data-duplicate]',root).forEach(b=>b.onclick=async()=>{const bubble=b.closest('.zx-bubble'),idx=Number(bubble.dataset.msg),convo=loadConvo(),m=convo[idx],choice=b.dataset.duplicate;if(choice==='keep'){for(const e of m.pendingEvents||[])await api.addEvent({...e,structured:{...(e.structured||{}),interpretation_status:'confirmed_by_user',duplicate_review:'kept_as_discrete_event',original_raw_text:m.raw}});m.text='Understood. I kept both as separate events.';m.kind='saved';delete m.pendingEvents;window.dispatchEvent(new Event('zeke:data-changed'));}else if(choice==='one'){m.text='Got it. I kept the existing record and did not add another data point.';m.kind='saved';delete m.pendingEvents;}else{m.text='Cancelled. Nothing new was saved.';m.kind='saved';delete m.pendingEvents;}saveConvo(convo);renderThread(root);});
  $$('[data-followup]',root).forEach(b=>b.onclick=()=>{const ta=$('.zx-compose textarea',root);ta.value=b.dataset.followup;sendConversation(root,window.__ZX_EVENTS||[]);});
  $$('.zx-bubble.interpretation [data-action]',root).forEach(b=>b.onclick=async()=>{const bubble=b.closest('.zx-bubble'),idx=Number(bubble.dataset.msg),convo=loadConvo(),m=convo[idx];if(!m)return;
    if(b.dataset.action==='confirm'){try{const dup=(m.events||[]).map(e=>[e,likelyDuplicate(e,window.__ZX_EVENTS||[])]).find(([,d])=>d);if(dup){convo[idx]={role:'zeke',kind:'duplicate',text:`I may already have a very similar ${humanEvent(dup[0])} entry from today. Was this a separate event, or an accidental duplicate?`,pendingEvents:m.events,raw:m.raw};saveConvo(convo);renderThread(root);return;}for(const e of m.events||[])await api.addEvent({...e,structured:{...(e.structured||{}),interpretation_status:'confirmed_by_user',original_raw_text:m.raw}});m.text='Confirmed and saved.';m.kind='saved';delete m.events;saveConvo(convo);renderThread(root);window.dispatchEvent(new Event('zeke:data-changed'));}catch(e){openSimpleModal('Could not save',e.message);}}
    if(b.dataset.action==='edit'){const ta=$('.zx-compose textarea',root);ta.value=m.raw;ta.focus();}
    if(b.dataset.action==='ai'){try{m.text='I’m asking the AI Router for another interpretation…';m.kind='thinking';saveConvo(convo);renderThread(root);const r=await window.ZekeAIRouter.ask(`Interpret this ZEKE entry. Return a concise explanation of what you understood and a JSON array named events with objects containing category, raw_text, and structured. Do not claim anything was saved. Entry: ${m.raw}`,{task:'interpretation'});convo[idx]={role:'zeke',kind:'ai',text:r.text,meta:`AI reinterpretation · ${r.providerLabel}`};saveConvo(convo);renderThread(root);}catch(e){openSimpleModal('AI reinterpretation unavailable',`${e.message}\n\nYour original entry remains unsaved.`);}}
  });
}
function modalShell(title,body){const back=document.createElement('div');back.className='zx-modal-backdrop';back.innerHTML=`<div class="zx-modal"><div class="zx-modal-head"><div><span class="zx-eyebrow">ZEKE</span><h2>${esc(title)}</h2></div><button class="zx-modal-close">×</button></div><div class="zx-modal-body">${body}</div></div>`;document.body.appendChild(back);$('.zx-modal-close',back).onclick=()=>back.remove();back.onclick=e=>{if(e.target===back)back.remove()};return back;}
function openEvidenceModal(item){modalShell(item.title,`<p>${esc(item.body)}</p><h3>Why ZEKE is saying this</h3><p>ZEKE is combining your recorded progression with conservative training guidance. This is coaching support—not medical clearance—and missing RPE, pain, or technique data lowers confidence.</p><div class="zx-evidence-links">${evidenceLinks(item.evidence||[])}</div>`);}
function openIdeaModal(item){modalShell(item.title,`<p>${esc(item.body)}</p>${item.evidence?.length?`<h3>Research context</h3><div class="zx-evidence-links">${evidenceLinks(item.evidence)}</div>`:'<p class="zx-muted">This suggestion comes from repeated themes in your own ZEKE records, not from a research claim.</p>'}`);}
function openSimpleModal(title,text){modalShell(title,`<p>${esc(text).replace(/\n/g,'<br>')}</p>`);}
async function deferTrackingPrompt(root){
  const next=new Date(Date.now()+30*864e5).toISOString();
  try{await api.saveFactor({id:'tracking_preferences',type:'tracking_preferences',decision:'not_now',next_prompt_after:next,source:'user confirmed'});root.querySelector('.zx-track-prompt')?.remove();}
  catch(e){openSimpleModal('Could not save preference',e.message)}
}
function openTrackingModal(existing){
  const pref=getTrackingPreference(existing)||{};const selected=new Set(pref.tracked_items||[]);const custom=(pref.custom_items||[]).join(', ');
  const options=[['prescribed_medications','Prescribed medications'],['supplements','Supplements'],['injections','Injections or scheduled treatments'],['protein_shakes','Protein shakes or drinks'],['creatine','Creatine'],['other_recurring','Other recurring items']];
  const body=`<p>What would be useful for ZEKE to keep track of? You can change this later. Mentioning an item does not bypass the early-release confirmation step.</p><form class="zx-track-form"><div class="zx-track-options">${options.map(([id,label])=>`<label><input type="checkbox" name="items" value="${id}" ${selected.has(id)?'checked':''}><span><strong>${label}</strong><small>${id==='prescribed_medications'?'Taken, skipped, started, stopped, or dose changes':id==='supplements'?'Vitamins, minerals, and other supplements':id==='injections'?'Examples: GLP-1 injections or allergy shots':id==='protein_shakes'?'Examples: Nurri or another protein drink':id==='creatine'?'Dose and whether it was taken':'Anything else that repeats often enough to matter'}</small></span></label>`).join('')}</div><label class="zx-track-custom">Anything else you want ZEKE to notice?<textarea name="custom" placeholder="e.g., electrolyte drink, PT exercises, caffeine before workouts">${esc(custom)}</textarea></label><div class="zx-track-actions"><button class="zx-primary" type="submit">Save tracking choices</button></div></form>`;
  const back=modalShell('What should ZEKE help you track?',body);const form=$('.zx-track-form',back);form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),items=fd.getAll('items'),customItems=String(fd.get('custom')||'').split(/[,
]/).map(x=>x.trim()).filter(Boolean);try{await api.saveFactor({id:'tracking_preferences',type:'tracking_preferences',decision:'track',tracked_items:items,custom_items:customItems,auto_recognize:true,confirmation_required:true,source:'user confirmed'});back.remove();const old=$('#zeke-experience-dashboard');old?.remove();renderDashboard();}catch(err){openSimpleModal('Could not save tracking choices',err.message)}};
}
function openCustomizeModal(){
  const ui=loadUI();const choices=[['weight','Weight'],['rhr','Resting heart rate'],['steps','Steps'],['a1c','A1c'],['workouts','Workout consistency'],['labs','Labs'],['calendar','Upcoming events'],['coach','Coach’s eye'],['thoughts','I’ve been thinking…']];
  const back=modalShell('Customize your dashboard',`<p>Show what matters to you. Empty cards are hidden by default so the dashboard stays useful rather than decorative.</p><form class="zx-custom-form"><label class="zx-toggle-row"><input type="checkbox" name="hideEmpty" ${ui.hideEmpty?'checked':''}><span><strong>Hide cards with no data</strong><small>Recommended for a cleaner dashboard.</small></span></label><div class="zx-custom-grid">${choices.map(([id,label])=>`<label><input type="checkbox" name="visible" value="${id}" ${ui.visible[id]?'checked':''}> ${label}</label>`).join('')}</div><div class="zx-track-actions"><button class="zx-primary" type="submit">Save dashboard</button></div></form>`);const form=$('.zx-custom-form',back);form.onsubmit=e=>{e.preventDefault();const fd=new FormData(form),visible={...ui.visible};Object.keys(visible).forEach(k=>visible[k]=fd.getAll('visible').includes(k));saveUI({...ui,hideEmpty:fd.get('hideEmpty')==='on',visible});back.remove();const old=$('#zeke-experience-dashboard');old?.remove();renderDashboard();};
}
function openHistoryModal(existing){
  const hist=existing.filter(x=>['family_history','personal_history'].includes(x.type));
  const back=modalShell('Personal & family health history',`<p>Add only what you want ZEKE to use as context. This can include your own important historical diagnoses or events, as well as relatives’ history. Context should shape questions and discoveries—not become a diagnosis.</p><form class="zx-family-form"><div class="zx-form-grid"><label>Person / relationship<input name="relation" list="zx-relations" placeholder="e.g., self, sister, father, maternal uncle" required><datalist id="zx-relations"><option value="Self (historical)"><option value="Mother"><option value="Father"><option value="Sister"><option value="Brother"><option value="Maternal uncle"><option value="Paternal uncle"></datalist></label><label>Condition or event<input name="condition" placeholder="e.g., heart attack, depression, melanoma, ADHD" required></label><label>Age at diagnosis/event<input name="age" type="number" min="0" max="120" placeholder="optional"></label><label>Status / outcome<input name="status" placeholder="e.g., living, deceased, resolved, ongoing treatment"></label><label class="full">Notes<textarea name="notes" placeholder="Only context you want ZEKE to retain"></textarea></label></div><button class="zx-primary" type="submit">Add history</button></form><h3>Recorded context</h3><div class="zx-family-list">${hist.length?hist.map(f=>`<div><strong>${esc(f.relation||'Person')} · ${esc(f.condition||'History')}</strong><span>${f.age_at_event?`Age ${esc(f.age_at_event)} · `:''}${esc(f.status_note||'')}</span></div>`).join(''):'<p class="zx-muted">No personal or family history entries yet.</p>'}</div>`);
  const form=$('.zx-family-form',back);form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),relation=String(fd.get('relation')||'').trim(),type=/^self/i.test(relation)?'personal_history':'family_history';try{await api.saveFactor({type,relation,condition:fd.get('condition'),age_at_event:fd.get('age')?Number(fd.get('age')):null,status_note:fd.get('status'),notes:fd.get('notes'),source:'user confirmed'});back.remove();const old=$('#zeke-experience-dashboard');old?.remove();renderDashboard();}catch(err){openSimpleModal('Could not save health history',err.message)}};
}

function enhanceWorkoutPage(){const page=$('.data-page');if(!page||$('#zx-workout-coach'))return;if(!location.pathname.includes('/health/workouts')&&!location.hash.includes('/health/workouts'))return;api.listEvents().then(events=>{const insights=coachInsights(events);const el=document.createElement('section');el.id='zx-workout-coach';el.className='zx-card zx-workout-coach';el.innerHTML=`<div class="zx-card-head"><div><span class="zx-eyebrow">COACH’S EYE</span><h3>What I’d consider next</h3><p>Evidence-aware progression prompts from your actual workout history.</p></div><a class="zx-link" href="#/health/workouts/analytics">Progress analytics</a></div><div class="zx-coach-list">${insights.map((c,i)=>`<button class="zx-coach ${c.kind}" data-i="${i}"><span>${c.kind==='caution'?'⚠':'↗'}</span><div><strong>${esc(c.title)}</strong><p>${esc(c.body)}</p></div><em>Evidence</em></button>`).join('')}</div>`;const title=$('.page-title-row',page);title?.after(el);$$('[data-i]',el).forEach(b=>b.onclick=()=>openEvidenceModal(insights[Number(b.dataset.i)]));});}

function enhanceSettingsPage(){const page=$('.settings-page');if(!page||$('#zx-provider-settings'))return;const title=$('.page-title-row',page);const section=document.createElement('section');section.id='zx-provider-settings';section.className='zx-settings-stack';section.innerHTML=`
<section class="zx-card"><div class="zx-card-head"><div><span class="zx-eyebrow">CONNECTIONS</span><h3>Storage</h3><p>Choose where your ZEKE workspace lives. Connect once; normal launches should reconnect silently when the provider supports it.</p></div></div><div class="zx-provider-grid"><button class="active"><strong>Google Drive</strong><small>Available in this alpha</small></button><button disabled><strong>OneDrive</strong><small>Adapter planned</small></button><button disabled><strong>Dropbox</strong><small>Adapter planned</small></button><button disabled><strong>Private SFTP / server</strong><small>User-controlled storage</small></button><button disabled><strong>Nextcloud / WebDAV</strong><small>Standards-based option</small></button><button disabled><strong>Local device</strong><small>May limit multi-device features</small></button></div></section>
<section class="zx-card"><div class="zx-card-head"><div><span class="zx-eyebrow">CALENDAR</span><h3>Calendar connections</h3><p>Calendars provide context for relevant events and reminders. A scheduled event is never treated as proof that the action happened.</p></div></div><div class="zx-provider-grid"><button class="active"><strong>Google Calendar</strong><small>Available in this alpha</small></button><button disabled><strong>Apple Calendar / iCloud</strong><small>Connector planned</small></button><button disabled><strong>Outlook / Exchange</strong><small>Connector planned</small></button><button disabled><strong>CalDAV / ICS</strong><small>Standards-based option</small></button></div></section>
<section class="zx-card"><div class="zx-card-head"><div><span class="zx-eyebrow">AI</span><h3>AI connections</h3><p>Connect and test services here. You do not choose an active AI—ZEKE’s router selects among connected services based on task fit, privacy, availability, limits, and free-first rules.</p></div><button class="zx-primary" data-open-ai>Manage connections</button></div><p class="zx-muted">Manual packet export/import remains available for users who prefer it or when live providers are unavailable.</p></section>`;
  title?.after(section);$('[data-open-ai]',section)?.addEventListener('click',()=>window.ZekeAIRouter?.open());
  // Hide legacy provider-specific connection sections so Settings does not contradict the provider-agnostic architecture.
  $$('.settings-section',page).forEach(el=>{const h=$('h2',el)?.textContent||'';if(/CONNECTED STORAGE PROVIDER|CALENDAR CONNECTION|AI/i.test(h))el.classList.add('zx-legacy-hidden');});
}
async function refresh(){window.__ZX_EVENTS=await api.listEvents().catch(()=>[]);if($('.dashboard-main')){const old=$('#zeke-experience-dashboard');if(old){old.remove();}await renderDashboard();}enhanceWorkoutPage();enhanceSettingsPage();}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;setTimeout(async()=>{scheduled=false;try{if($('.dashboard-main')&&!$('#zeke-experience-dashboard'))await renderDashboard();enhanceWorkoutPage();enhanceSettingsPage();}catch(e){console.warn('[ZEKE experience]',e)}},220);}
const mo=new MutationObserver(schedule);mo.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);window.addEventListener('popstate',schedule);window.addEventListener('zeke:data-changed',()=>setTimeout(refresh,300));window.addEventListener('zeke:storage-connected',()=>setTimeout(refresh,500));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
