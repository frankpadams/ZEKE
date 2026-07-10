(() => {
  'use strict';

  const BUILD = window.ZEKE_BUILD || { version:'0.7.0', build:'unknown' };
  const state = {
    route:'dashboard', range:'month', selectedMetric:'weight',
    events:[], factors:[], discoveries:[], actions:{catalog:[],daily_states:{}}, calendar:[],
    conversation:[], pending:null, context:{}, storage:null, ai:null,
    coachExpanded:false, customizeOpen:false, metricMenuOpen:false,
    hiddenWidgets:new Set(), busy:false, importStatus:''
  };

  const RANGE_DAYS = { week:7, month:31, quarter:92, '6months':183, year:366, all:null };
  const METRICS = {
    weight:{label:'Weight',unit:'lb', icon:'⚖️'},
    blood_pressure:{label:'Blood pressure',unit:'mmHg', icon:'❤'},
    a1c:{label:'A1c',unit:'%', icon:'◈'},
    resting_hr:{label:'Resting HR',unit:'bpm', icon:'♥'},
    sleep_duration:{label:'Sleep',unit:'hr', icon:'☾'},
    steps:{label:'Steps',unit:'steps', icon:'◌'},
    ldl:{label:'LDL cholesterol',unit:'mg/dL', icon:'⬡'}
  };

  const EVIDENCE = [
    { title:'ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults', year:2026, pmid:'41843416' },
    { title:'ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults', year:2009, pmid:'19204579' }
  ];

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate = (d, opts={month:'short',day:'numeric'}) => new Date(d).toLocaleDateString(undefined, opts);
  const fmtTime = (d) => new Date(d).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
  const localDay = (d=new Date()) => {
    const p = new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    const get = t => p.find(x=>x.type===t)?.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  };
  const debounce = (fn, ms=200) => { let t; return (...a) => { clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

  function push(role, text, meta={}) {
    state.conversation.push({ id:crypto.randomUUID(), role, text, at:new Date().toISOString(), ...meta });
    if (state.conversation.length > 80) state.conversation = state.conversation.slice(-80);
  }
  const pushZeke = (text, meta={}) => push('zeke', text, meta);
  const pushUser = (text, meta={}) => push('user', text, meta);

  function routeFromHash() {
    const h = location.hash.replace(/^#\/?/,'').split('?')[0];
    const map = {
      '':'dashboard','health/dashboard':'dashboard','dashboard':'dashboard',
      'health':'health','health/overview':'health','fitness':'fitness','health/workouts':'fitness',
      'medications':'medications','health/medications':'medications','labs':'labs','health/labs':'labs',
      'calendar':'calendar','settings':'settings'
    };
    return map[h] || 'dashboard';
  }

  function go(route) {
    const hashes = {dashboard:'health/dashboard',health:'health',fitness:'fitness',medications:'medications',labs:'labs',calendar:'calendar',settings:'settings'};
    location.hash = `#/${hashes[route] || route}`;
  }

  async function refreshData() {
    if (window.ZekeData?.snapshot().status !== 'connected') return;
    [state.events,state.factors,state.discoveries,state.actions] = await Promise.all([
      ZekeData.listEvents(), ZekeData.listFactors(), ZekeData.listDiscoveries(), ZekeData.getActions()
    ]);
    try { state.calendar = await ZekeData.listCalendarEvents(21); } catch { state.calendar=[]; }
    state.storage = ZekeData.snapshot();
    state.ai = ZekeAIRouter.status();
    await ensureUsefulQuestions();
  }

  async function ensureUsefulQuestions() {
    let open = state.factors.filter(f=>f.type==='clarification_question' && !['resolved','dismissed','unknown'].includes(f.status));
    const meds = new Map();
    for (const e of state.events) {
      if (e.category !== 'medication') continue;
      const st=e.structured||{}; const name=(st.medication_name||st.medication||st.name||'').trim();
      if (name) meds.set(name.toLowerCase(), name);
    }
    const actionLabels = (state.actions.catalog||[]).map(a=>String(a.label||a.name||'').toLowerCase());
    for (const [key,name] of meds) {
      const hasSchedule = actionLabels.some(x=>x.includes(key));
      const already = state.factors.some(f=>f.type==='clarification_question' && f.question_key===`med_schedule:${key}` && !['dismissed','resolved','unknown'].includes(f.status));
      if (!hasSchedule && !already && open.length < 4) {
        await ZekeData.saveFactor({
          type:'clarification_question', status:'open', priority:'high', question_key:`med_schedule:${key}`,
          question:`I know ${name} is part of your history, but I don't want to guess its schedule. How often is it supposed to be taken?`,
          why_it_matters:`This helps ZEKE decide when, if ever, it belongs in Today's Actions.`
        });
        open = openQuestions();
      }
    }
    const trackingKnown = state.factors.some(f=>f.question_key==='tracking_preferences' && ['resolved','dismissed','unknown'].includes(f.status));
    const trackingOpen = state.factors.some(f=>f.question_key==='tracking_preferences' && !['resolved','dismissed','unknown'].includes(f.status));
    if (!trackingKnown && !trackingOpen && open.length < 4) {
      await ZekeData.saveFactor({
        type:'clarification_question', status:'open', priority:'low', question_key:'tracking_preferences',
        question:'Would it be helpful if I tracked any recurring things for you—prescribed medications, supplements, injections, protein shakes, creatine, or something else?',
        why_it_matters:'This lets ZEKE tailor Today’s Actions and tracking without assuming you want full nutrition or medication tracking.'
      });
    }
    state.factors = await ZekeData.listFactors();
  }

  function parseCadence(answer) {
    const a=String(answer||'').toLowerCase();
    const days={sunday:0,sun:0,monday:1,mon:1,tuesday:2,tue:2,tues:2,wednesday:3,wed:3,thursday:4,thu:4,thur:4,thurs:4,friday:5,fri:5,saturday:6,sat:6};
    if (/every\s*day|daily|once\s+a\s+day|each\s+day/.test(a)) return {type:'daily'};
    const matched=[...new Set(Object.entries(days).filter(([name])=>new RegExp(`\\b${name}\\b`,'i').test(a)).map(([,n])=>n))];
    if (/weekly|once\s+a\s+week|every\s+week/.test(a) || matched.length) return {type:'weekly',days:matched.length?matched:[new Date().getDay()]};
    return null;
  }

  async function applyQuestionAnswer(q, answer) {
    if (q.question_key?.startsWith('med_schedule:')) {
      const medication=q.question_key.split(':').slice(1).join(':');
      const schedule=parseCadence(answer);
      if (!schedule) return {applied:false,message:'Thanks. I saved your answer, but I could not safely turn that wording into a schedule. I’ll keep it as context rather than guessing.'};
      const catalog=[...(state.actions.catalog||[])];
      const existing=catalog.find(a=>String(a.label||a.name||'').toLowerCase().includes(medication));
      const entry={
        id:existing?.id||`med-${medication.replace(/[^a-z0-9]+/g,'-')}`,
        kind:'medication', label:existing?.label||medication.replace(/\b\w/g,c=>c.toUpperCase()),
        icon:existing?.icon||'✚', active:true, schedule,
        subtitle:schedule.type==='daily'?'Daily':`Weekly${schedule.days?.length?` · ${schedule.days.map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}`:''}`
      };
      const next=existing?catalog.map(a=>a.id===existing.id?{...a,...entry}:a):[...catalog,entry];
      state.actions=await ZekeData.saveActions({...state.actions,catalog:next});
      return {applied:true,message:'Thanks. I saved that schedule and will use it to decide when the action belongs in Today’s Actions.'};
    }
    if (q.question_key==='tracking_preferences') {
      await ZekeData.saveFactor({type:'tracking_preferences',status:'active',answer,source_question_id:q.id,summary:answer});
      return {applied:true,message:'Thanks. I’ll use that preference to shape what I offer to track, without assuming you want anything else.'};
    }
    return {applied:false,message:'Thanks. I’ll use that confirmed answer as context going forward.'};
  }

  function historyContextFromText(text) {
    const l=String(text||'').toLowerCase();
    const relations=[
      ['self',/\b(i|me|myself|user)\b/],['sister',/\bsister\b/],['brother',/\bbrother\b/],
      ['mother',/\b(mother|mom|mum)\b/],['father',/\b(father|dad)\b/],['daughter',/\bdaughter\b/],['son',/\bson\b/],
      ['maternal uncle',/\bmaternal uncle\b/],['paternal uncle',/\bpaternal uncle\b/],['uncle',/\buncle\b/],['aunt',/\baunt\b/],
      ['grandmother',/\bgrandmother|grandma\b/],['grandfather',/\bgrandfather|grandpa\b/]
    ];
    const relation=(relations.find(([,re])=>re.test(l))||['family member'])[0];
    return {relation,summary:String(text||'').trim(),history_type:relation==='self'?'personal_history':'family_history'};
  }

  function metricId(e) {
    const s=e.structured||{};
    return String(s.metric_id||s.metricId||s.metric||s.test_id||'').toLowerCase().replace(/\s+/g,'_');
  }

  function metricValue(e) {
    const s=e.structured||{};
    const v=s.value ?? s.result ?? s.measurement_value;
    return Number.isFinite(Number(v)) ? Number(v) : null;
  }

  function canonicalMetric(id) {
    const x=String(id||'').toLowerCase();
    if (/weight/.test(x)) return 'weight';
    if (/a1c|hba1c/.test(x)) return 'a1c';
    if (/resting.*hr|resting.*heart|rhr/.test(x)) return 'resting_hr';
    if (/sleep.*duration|sleep_hours|sleep/.test(x)) return 'sleep_duration';
    if (/steps?/.test(x)) return 'steps';
    if (/ldl/.test(x)) return 'ldl';
    if (/bp.*systolic|systolic/.test(x)) return 'bp_systolic';
    if (/bp.*diastolic|diastolic/.test(x)) return 'bp_diastolic';
    return x;
  }

  function metricSeries(id) {
    const days = RANGE_DAYS[state.range]; const cutoff = days ? Date.now()-days*864e5 : 0;
    return state.events.filter(e=>['measurement','lab'].includes(e.category)).map(e=>{
      const cid=canonicalMetric(metricId(e)); const value=metricValue(e); const s=e.structured||{};
      return {id:e.id,metric:cid,value,unit:s.unit||s.value_unit||'',date:e.timestamp||e.recorded_at,source:e.provenance?.source||s.source||'ZEKE'};
    }).filter(p=>p.metric===id && p.value!=null && new Date(p.date).getTime()>=cutoff).sort((a,b)=>new Date(a.date)-new Date(b.date));
  }

  function bloodPressureSeries() {
    const sys=metricSeries('bp_systolic'), dia=metricSeries('bp_diastolic');
    return {sys,dia};
  }

  function latestMetric(id) {
    if (id==='blood_pressure') {
      const {sys,dia}=bloodPressureSeries(); return sys.length&&dia.length?{value:`${sys.at(-1).value}/${dia.at(-1).value}`,unit:'mmHg',date:sys.at(-1).date}:null;
    }
    const s=metricSeries(id); return s.at(-1)||null;
  }

  function metricDelta(id) {
    const s=metricSeries(id); if(s.length<2) return null;
    return s.at(-1).value-s[0].value;
  }

  function availableMetrics() {
    return Object.keys(METRICS).filter(id=>id==='blood_pressure'?(bloodPressureSeries().sys.length&&bloodPressureSeries().dia.length):metricSeries(id).length);
  }

  function miniSpark(points, id) {
    if(points.length<2) return '';
    const w=160,h=48,p=3, vals=points.map(x=>x.value), min=Math.min(...vals),max=Math.max(...vals),span=max-min||1;
    const xy=points.map((x,i)=>[p+(w-2*p)*i/(points.length-1),h-p-(h-2*p)*(x.value-min)/span]);
    const d=xy.map((q,i)=>(i?'L':'M')+q.join(' ')).join(' ');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-label="${esc(METRICS[id]?.label||id)} trend"><path d="${d}"/>${xy.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="2.6" data-tip="${esc(fmtDate(points[i].date))}: ${esc(points[i].value)} ${esc(points[i].unit||'')}"/>`).join('')}</svg>`;
  }

  function metricCard(id) {
    const meta=METRICS[id], latest=latestMetric(id); if(!latest) return '';
    const delta=metricDelta(id); const points=id==='blood_pressure'?bloodPressureSeries().sys.slice(-12):metricSeries(id).slice(-12);
    let deltaText='Latest verified observation';
    if(delta!=null) deltaText=`${delta>0?'↑':'↓'} ${Math.abs(delta).toFixed(Math.abs(delta)<1?1:0)} ${latest.unit||meta.unit} over range`;
    return `<article class="metric-card" data-metric="${id}">
      <div class="metric-head"><span class="metric-icon">${meta.icon}</span><span>${esc(meta.label)}</span><button class="icon-btn metric-more" aria-label="More options">⋮</button></div>
      <div class="metric-number">${esc(latest.value)} <small>${esc(latest.unit||meta.unit)}</small></div>
      <div class="metric-change">${esc(deltaText)}</div>
      ${miniSpark(points,id)}
      <div class="metric-foot"><span>${esc(fmtDate(latest.date))}</span><button class="text-action" data-log-metric="${id}">+ Log</button></div>
    </article>`;
  }

  function healthGlanceHTML() {
    const metrics=availableMetrics().filter(id=>!state.hiddenWidgets.has(`metric:${id}`));
    if(!metrics.length) return `<section class="panel health-glance"><div class="section-head"><div><h2>Health at a glance</h2><p>Verified values from your connected ZEKE records.</p></div></div><div class="empty-inline">No verified health metrics are available yet. Log a value through Talk to ZEKE or import existing history.</div></section>`;
    return `<section class="health-glance"><div class="section-head"><div><h2>Health at a glance</h2><p>Verified values from your connected records.</p></div><button class="text-action" data-route="health">View all</button></div><div class="metrics-row">${metrics.map(metricCard).join('')}</div></section>`;
  }

  function trendChartSVG(id) {
    let points;
    if(id==='blood_pressure') points=bloodPressureSeries().sys;
    else points=metricSeries(id);
    if(points.length<2) return `<div class="chart-empty">There are not enough verified observations in this range to draw a trend. ZEKE will not invent or interpolate personal data.</div>`;
    const w=780,h=280,pl=58,pr=20,pt=18,pb=42; const vals=points.map(x=>x.value); let min=Math.min(...vals),max=Math.max(...vals); const pad=(max-min)*.12||1; min-=pad;max+=pad;
    const xy=points.map((x,i)=>[pl+(w-pl-pr)*i/(points.length-1),pt+(h-pt-pb)*(1-(x.value-min)/(max-min))]);
    const path=xy.map((q,i)=>(i?'L':'M')+q.join(' ')).join(' ');
    const area=`M ${xy[0][0]} ${h-pb} ${path.replace(/^M/,'L')} L ${xy.at(-1)[0]} ${h-pb} Z`;
    const ticks=[max,(2*max+min)/3,(max+2*min)/3,min];
    const xIdx=[0,Math.floor((points.length-1)/2),points.length-1];
    return `<div class="chart-wrap"><svg class="trend-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(METRICS[id]?.label||id)} trend">
      <defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2563eb" stop-opacity=".20"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></linearGradient></defs>
      ${ticks.map((v,i)=>{const y=pt+i*(h-pt-pb)/(ticks.length-1);return `<line class="grid-line" x1="${pl}" x2="${w-pr}" y1="${y}" y2="${y}"/><text class="axis-label" x="4" y="${y+4}">${Number(v).toFixed(Math.abs(v)<10?1:0)}</text>`}).join('')}
      <path class="chart-area" d="${area}"/><path class="chart-line" d="${path}"/>
      ${xy.map((q,i)=>`<circle class="chart-point" cx="${q[0]}" cy="${q[1]}" r="4.5" data-tip="${esc(fmtDate(points[i].date,{month:'short',day:'numeric',year:'numeric'}))}: ${esc(points[i].value)} ${esc(points[i].unit||METRICS[id]?.unit||'')} · ${esc(points[i].source)}" data-event-id="${esc(points[i].id)}"/>`).join('')}
      ${xIdx.map(i=>`<text class="axis-label x" x="${xy[i][0]}" y="${h-10}" text-anchor="middle">${esc(fmtDate(points[i].date))}</text>`).join('')}
    </svg><div class="chart-tooltip" id="chartTooltip"></div></div>`;
  }

  function trendPanelHTML() {
    const available=availableMetrics(); if(!available.includes(state.selectedMetric)) state.selectedMetric=available[0]||'weight';
    const meta=METRICS[state.selectedMetric]||METRICS.weight; const latest=latestMetric(state.selectedMetric);
    return `<section class="panel trend-panel">
      <div class="section-head"><div><h2>${esc(meta.label)} trend</h2><p>${latest?`Current: ${esc(latest.value)} ${esc(latest.unit||meta.unit)}`:'No data yet'}</p></div>
        <div class="metric-tabs">${available.slice(0,5).map(id=>`<button class="mini-tab ${id===state.selectedMetric?'active':''}" data-select-metric="${id}">${esc(METRICS[id].label)}</button>`).join('')}${available.length>5?`<button class="mini-tab" id="moreMetrics">More ▾</button>`:''}</div>
      </div>${trendChartSVG(state.selectedMetric)}
      <div class="chart-caption"><span>Only verified connected data is plotted.</span><span>${latest?`Source: ${esc(metricSeries(state.selectedMetric).at(-1)?.source||'ZEKE')}`:''}</span></div>
    </section>`;
  }

  function workoutGroups() {
    const map=new Map();
    for(const e of state.events.filter(e=>e.category==='workout')) {
      const s=e.structured||{}; const name=(s.exercise||s.session_type||s.exercise_name||'').trim(); if(!name) continue;
      const item={event:e,date:e.timestamp,weight:Number(s.weight||s.load||0),reps:Number(s.reps||0),sets:Number(s.sets||0),rpe:Number(s.rpe||0),pain:Number(s.pain||0)};
      if(!map.has(name)) map.set(name,[]); map.get(name).push(item);
    }
    for(const arr of map.values()) arr.sort((a,b)=>new Date(a.date)-new Date(b.date));
    return map;
  }

  function coachInsight() {
    const groups=workoutGroups(); let best=null;
    for(const [name,sessions] of groups) {
      if(sessions.length<2) continue;
      const recent=sessions.slice(-4); const last=recent.at(-1), prev=recent.at(-2);
      let score=0, title='', rationale='', suggestion='';
      if(last.pain>=4 || (last.pain&&prev.pain&&last.pain-prev.pain>=2)) {
        score=100; title=`${name}: pain trend deserves attention before progression.`;
        rationale='Recorded pain is elevated or increasing. ZEKE is separating this observation from medical clearance.';
        suggestion='Hold progression, review technique and recovery, and follow your clinician/PT guidance where applicable.';
      } else if(last.weight&&prev.weight&&last.weight>prev.weight*1.10) {
        score=85; title=`${name}: consider repeating the current load before another increase.`;
        rationale=`The most recent load increase was more than 10% (${prev.weight} → ${last.weight} lb).`;
        suggestion='A repeat session can show whether reps, effort, pain, and technique remain stable before progressing again.';
      } else if(recent.length>=3 && recent.slice(-3).every(x=>x.reps>=12 && (!x.rpe||x.rpe<=8) && (!x.pain||x.pain<=2)) && last.weight) {
        score=80; title=`${name} may be ready for a small increase.`;
        rationale='Recent sessions show repeated high-rep performance without high recorded RPE or pain.';
        suggestion='Consider a small load increase while keeping technique and shoulder/joint response as constraints.';
      } else if(last.weight&&prev.weight&&last.weight>prev.weight) {
        score=55; title=`${name}: progression is visible.`;
        rationale=`Load increased from ${prev.weight} to ${last.weight} lb in the recent record.`;
        suggestion='Repeat or progress based on target reps, effort, pain, technique, and recovery rather than load alone.';
      } else continue;
      const insight={name,sessions,recent,last,score,title,rationale,suggestion}; if(!best||score>best.score) best=insight;
    }
    return best;
  }

  function coachChart(insight) {
    const pts=insight.sessions.filter(x=>x.weight).slice(-8); if(pts.length<2) return '';
    const w=460,h=155,pl=36,pr=12,pt=10,pb=28; const vals=pts.map(x=>x.weight),min=Math.min(...vals)-5,max=Math.max(...vals)+5;
    const xy=pts.map((x,i)=>[pl+(w-pl-pr)*i/(pts.length-1),pt+(h-pt-pb)*(1-(x.weight-min)/(max-min||1))]); const d=xy.map((q,i)=>(i?'L':'M')+q.join(' ')).join(' ');
    return `<svg class="coach-chart" viewBox="0 0 ${w} ${h}">${[max,(max+min)/2,min].map((v,i)=>{const y=pt+i*(h-pt-pb)/2;return `<line class="grid-line" x1="${pl}" x2="${w-pr}" y1="${y}" y2="${y}"/><text class="axis-label" x="2" y="${y+4}">${Math.round(v)}</text>`}).join('')}<path class="chart-line" d="${d}"/>${xy.map((q,i)=>`<circle class="chart-point" cx="${q[0]}" cy="${q[1]}" r="4" data-tip="${esc(fmtDate(pts[i].date))}: ${pts[i].weight} lb${pts[i].reps?`, ${pts[i].reps} reps`:''}"/>`).join('')}${[0,pts.length-1].map(i=>`<text class="axis-label x" x="${xy[i][0]}" y="${h-6}" text-anchor="middle">${esc(fmtDate(pts[i].date))}</text>`).join('')}</svg>`;
  }

  function coachHTML() {
    const x=coachInsight();
    if(!x) return `<section class="panel coach-panel"><div class="coach-badge">Coach's Eye</div><h2>More workout history will unlock coaching trends.</h2><p>ZEKE needs repeated exercise observations to compare load, reps, effort, pain, and consistency without guessing.</p><button class="primary ghost" data-context-exercise="">Log a workout</button></section>`;
    return `<section class="panel coach-panel"><div class="coach-top"><div><div class="coach-badge">🏋 Coach's Eye</div><h2>${esc(x.title)}</h2><p>${esc(x.rationale)}</p></div><span class="insight-tag">Training insight</span></div>
      <div class="coach-grid"><div class="coach-stats"><div><strong>${x.last.weight||'—'} lb</strong><span>Latest load</span></div><div><strong>${x.last.rpe||'Not logged'}</strong><span>Latest RPE</span></div><div><strong>${x.last.pain||0}/10</strong><span>Recorded pain</span></div></div><div>${coachChart(x)}</div></div>
      <div class="coach-rec"><strong>ZEKE's observation</strong><p>${esc(x.suggestion)}</p></div>
      <button class="text-action" id="toggleCoachEvidence">${state.coachExpanded?'Hide evidence':'View reasoning & evidence'}</button>
      ${state.coachExpanded?`<div class="evidence-box"><p><strong>How this was generated:</strong> ZEKE used only your recorded sessions for ${esc(x.name)} and applied conservative progression heuristics. This is training decision support, not medical clearance.</p>${EVIDENCE.map(e=>`<div class="evidence-row"><span>${esc(e.title)} (${e.year})</span><a href="https://pubmed.ncbi.nlm.nih.gov/${e.pmid}/" target="_blank" rel="noopener">PubMed</a></div>`).join('')}</div>`:''}
    </section>`;
  }

  function openQuestions() { return state.factors.filter(f=>f.type==='clarification_question'&&!['resolved','dismissed','unknown','deferred'].includes(f.status)).sort((a,b)=>priorityWeight(b.priority)-priorityWeight(a.priority)); }
  function priorityWeight(p){return ({critical:4,high:3,medium:2,low:1}[p]||1)}

  function conversationHTML() {
    const msgs=state.conversation.length?state.conversation:[{role:'zeke',text:'Tell me anything. I can help log data, answer questions, clarify uncertainty, correct records, or look deeper with connected AI.'}];
    const last=msgs.at(-1);
    const choices=last?.choices||[];
    return `<section class="panel conversation-panel">
      <div class="section-head conversation-head"><div><h2>Talk to ZEKE</h2><p>One ongoing conversation for questions, logging, clarification, and corrections.</p></div><button class="question-pill" id="questionPill">${openQuestions().length} question${openQuestions().length===1?'':'s'} for you</button></div>
      <div class="conversation-thread" id="conversationThread">${msgs.map(m=>`<div class="bubble-row ${m.role}"><div class="avatar">${m.role==='zeke'?'Z':'You'}</div><div class="bubble"><span class="bubble-name">${m.role==='zeke'?'ZEKE':'You'}</span><p>${esc(m.text)}</p></div></div>`).join('')}</div>
      ${choices.length?`<div class="choice-row">${choices.map(c=>`<button class="choice" data-conversation-choice="${esc(c.value)}">${esc(c.label)}</button>`).join('')}</div>`:''}
      <div class="composer"><textarea id="talkInput" rows="1" placeholder="Tell ZEKE anything…"></textarea><button class="attach" id="attachBtn" title="Attach a file">＋</button><button class="send" id="sendBtn" aria-label="Send">➤</button></div>
    </section>`;
  }

  function actionScheduleMatches(action, date=new Date()) {
    const schedule=action.schedule||{};
    if(schedule.type==='daily') return true;
    if(schedule.type==='weekly') return (schedule.days||[]).includes(date.getDay());
    if(schedule.type==='date') return schedule.date===localDay(date);
    return false;
  }

  function actionDoneToday(action) {
    const today=localDay(); const label=String(action.label||action.name||'').toLowerCase();
    return state.events.some(e=>{
      const day=localDay(new Date(e.timestamp||e.recorded_at)); if(day!==today) return false;
      const s=e.structured||{}; const confirmed=/confirmed/i.test(String(s.interpretation_status||s.confirmation_status||'')) || e.provenance?.source==='quick_action';
      if(!confirmed && e.category==='raw_input') return false;
      const med=String(s.medication_name||s.medication||s.name||'').toLowerCase(); const ex=String(s.exercise||'').toLowerCase();
      return s.action_id===action.id || (label&&med&&label.includes(med)) || (action.kind==='workout'&&e.category==='workout') || (label&&ex&&label.includes(ex));
    });
  }

  function todayActionsHTML() {
    const catalog=(state.actions.catalog||[]).filter(a=>a.active!==false && actionScheduleMatches(a));
    if(!catalog.length) return `<section class="panel today-panel"><div class="section-head"><div><h2>Today's Actions</h2><p>No confirmed recurring schedules are due today.</p></div></div><div class="empty-inline">ZEKE will add actions here only after schedules are known or confirmed. It will not infer completion from past days.</div></section>`;
    return `<section class="panel today-panel"><div class="section-head"><div><h2>Today's Actions</h2><p>Current-day status only. Past completion does not carry forward.</p></div><div class="scroll-controls"><button id="actionsLeft">‹</button><button id="actionsRight">›</button></div></div><div class="actions-strip" id="actionsStrip">${catalog.map(a=>{const done=actionDoneToday(a);return `<button class="action-tile ${done?'done':''}" data-action-id="${esc(a.id)}"><span class="action-icon">${a.icon||'✓'}</span><strong>${esc(a.label||a.name)}</strong><small>${esc(a.subtitle||scheduleText(a.schedule))}</small><span class="action-state">${done?'✓ Confirmed today':'Confirm or log'}</span></button>`}).join('')}</div></section>`;
  }

  function scheduleText(s={}) { if(s.type==='daily')return'Daily'; if(s.type==='weekly')return'Weekly'; if(s.type==='date')return fmtDate(s.date,{month:'short',day:'numeric'}); return'Schedule unknown'; }

  function thinkingHTML() {
    const allText=state.events.map(e=>e.raw_text||'').join(' ').toLowerCase();
    let text='I’ll surface a thoughtful question or pattern here when there is enough evidence to make it useful.'; let buttons='';
    if(/nurri|protein shake/.test(allText) && !(state.actions.catalog||[]).some(a=>/nurri|protein shake/i.test(a.label||''))) {
      text="You've mentioned protein shakes several times. Would it be helpful if I tracked them automatically when you mention one?";
      buttons=`<button class="choice" data-thinking="track-shakes">Yes</button><button class="choice" data-thinking="later">Not now</button><button class="choice" data-thinking="ignore">Ignore</button>`;
    } else if(/creatine/.test(allText) && !(state.actions.catalog||[]).some(a=>/creatine/i.test(a.label||''))) {
      text="You've mentioned creatine more than once. Would you like me to track it as a recurring supplement?";
      buttons=`<button class="choice" data-thinking="track-creatine">Yes</button><button class="choice" data-thinking="later">Not now</button><button class="choice" data-thinking="ignore">Ignore</button>`;
    } else if(state.discoveries.length) {
      const d=state.discoveries[0]; text=d.summary||d.title||text;
      buttons=`<button class="text-action" data-route="health">Explore</button>`;
    }
    return `<section class="panel thinking-panel"><div class="thinking-title">💡 I've been thinking…</div><p>${esc(text)}</p>${buttons?`<div class="choice-row compact">${buttons}</div>`:''}</section>`;
  }

  function upcomingHTML() {
    if(!state.calendar.length) return '';
    const rows=state.calendar.slice(0,4).map(e=>`<div class="calendar-row"><div class="calendar-date"><strong>${esc(fmtDate(e.start,{month:'short',day:'numeric'}))}</strong><span>${esc(fmtTime(e.start))}</span></div><div><strong>${esc(e.title)}</strong>${e.location?`<small>${esc(e.location)}</small>`:''}</div></div>`).join('');
    return `<section class="panel upcoming-panel"><div class="section-head"><div><h2>Upcoming</h2><p>Calendar events are scheduled context, not proof of completion.</p></div><button class="text-action" data-route="calendar">View all</button></div>${rows}</section>`;
  }

  function dashboardHTML() {
    return `<div class="dashboard-grid">
      <div class="conversation-zone">${conversationHTML()}</div>
      <div class="glance-zone">${healthGlanceHTML()}</div>
      <div class="trend-zone">${trendPanelHTML()}</div>
      <div class="coach-zone">${coachHTML()}</div>
      <div class="actions-zone">${todayActionsHTML()}</div>
      <div class="thinking-zone">${thinkingHTML()}${upcomingHTML()}</div>
    </div>`;
  }

  function recordsTable(filterFn, columns) {
    const rows=state.events.filter(filterFn).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    if(!rows.length) return `<div class="empty-page">No records yet.</div>`;
    return `<div class="table-wrap"><table><thead><tr>${columns.map(c=>`<th>${esc(c.label)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(e=>`<tr>${columns.map(c=>`<td>${esc(c.value(e))}</td>`).join('')}<td><button class="text-action" data-edit-event="${e.id}">Review / edit</button></td></tr>`).join('')}</tbody></table></div>`;
  }

  function healthPageHTML() {
    const cards=availableMetrics().map(metricCard).join('');
    const history=state.factors.filter(f=>['family_history','personal_history'].includes(f.type));
    const historyRows=history.length?history.map(h=>`<div class="history-row"><div><strong>${esc(h.relation||h.type.replace('_',' '))}</strong><p>${esc(h.summary||h.answer||'')}</p></div><span class="provider-status">${h.type==='personal_history'?'Personal history':'Family history'}</span></div>`).join(''):`<div class="empty-inline">No personal or family health context has been added yet.</div>`;
    return `<div class="page-head"><div><h1>Health</h1><p>Your health overview, including sleep, measurements, labs, medications, history, and context.</p></div><button class="primary" data-log-metric="weight">+ Log health data</button></div>
      <section class="panel"><div class="section-head"><div><h2>Health overview</h2><p>Sleep belongs here as part of health, not as a separate top-level domain.</p></div></div><div class="metrics-row">${cards||'<div class="empty-inline">No verified health metrics yet.</div>'}</div></section>
      <section class="panel"><div class="section-head"><div><h2>Personal & family health history</h2><p>Optional context that can improve discoveries. It stays off the main dashboard and surfaces only when relevant.</p></div><button class="secondary" id="addHealthHistory">+ Add context</button></div><div class="history-list">${historyRows}</div></section>
      <section class="panel"><div class="section-head"><div><h2>Recent health record</h2><p>Review and correct entries while preserving provenance.</p></div></div>${recordsTable(e=>['measurement','lab','medication'].includes(e.category),[
        {label:'Date',value:e=>fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})},
        {label:'Type',value:e=>e.category},
        {label:'Summary',value:e=>humanEvent(e)},
        {label:'Source',value:e=>e.provenance?.source||'ZEKE'}
      ])}</section>`;
  }

  function fitnessPageHTML() {
    const groups=workoutGroups();
    const exerciseCards=[...groups.entries()].map(([name,arr])=>{const last=arr.at(-1);return `<article class="exercise-card"><div><strong>${esc(name)}</strong><p>${arr.length} recorded session${arr.length===1?'':'s'}</p></div><div class="exercise-last">${last.weight?`${last.weight} lb`:''}${last.reps?` · ${last.reps} reps`:''}</div><button class="text-action" data-context-exercise="${esc(name)}">+ Log</button></article>`}).join('');
    return `<div class="page-head"><div><h1>Fitness</h1><p>Workout history, progression, coaching observations, and exercise-specific trends.</p></div><button class="primary" data-context-exercise="">+ Log workout</button></div>
      ${coachHTML()}<section class="panel"><div class="section-head"><div><h2>Exercises</h2><p>Log directly from an exercise to reduce ambiguity and preselect the correct fields.</p></div></div><div class="exercise-grid">${exerciseCards||'<div class="empty-inline">No workout history yet.</div>'}</div></section>`;
  }

  function medicationsPageHTML() {
    return `<div class="page-head"><div><h1>Medications & supplements</h1><p>Schedules, confirmed doses, supplements, injections, and corrections.</p></div><button class="primary" data-context-medication="">+ Log medication or supplement</button></div>
      <section class="panel"><div class="section-head"><div><h2>Recorded entries</h2><p>ZEKE does not infer today’s completion from prior days.</p></div></div>${recordsTable(e=>e.category==='medication',[
        {label:'Date',value:e=>fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})},
        {label:'Medication / item',value:e=>e.structured?.medication_name||e.structured?.name||'Medication'},
        {label:'Dose',value:e=>e.structured?.dose?`${e.structured.dose}${e.structured.unit||''}`:'Not recorded'},
        {label:'Status',value:e=>e.structured?.status||'recorded'}
      ])}</section>`;
  }

  function labsPageHTML() {
    return `<div class="page-head"><div><h1>Labs & vitals</h1><p>Verified results, reference context when available, and longitudinal trends.</p></div><button class="primary" data-log-metric="a1c">+ Log result</button></div>
      <section class="panel"><div class="section-head"><div><h2>Lab results</h2><p>ZEKE shows source reference information when it exists; it does not imply one universal normal range.</p></div></div>${recordsTable(e=>e.category==='lab',[
        {label:'Date',value:e=>fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})},
        {label:'Test',value:e=>METRICS[canonicalMetric(metricId(e))]?.label||metricId(e)||'Lab'},
        {label:'Value',value:e=>`${metricValue(e)??'—'} ${e.structured?.unit||''}`},
        {label:'Reference',value:e=>e.structured?.reference_range||'Not recorded'}
      ])}</section>`;
  }

  function calendarPageHTML() {
    const rows=state.calendar.map(e=>`<div class="calendar-full-row"><div class="calendar-date"><strong>${esc(fmtDate(e.start,{weekday:'short',month:'short',day:'numeric'}))}</strong><span>${esc(fmtTime(e.start))}</span></div><div><h3>${esc(e.title)}</h3>${e.location?`<p>${esc(e.location)}</p>`:''}</div></div>`).join('');
    return `<div class="page-head"><div><h1>Calendar</h1><p>Relevant scheduled context from connected calendars. Scheduling is not proof of completion.</p></div></div><section class="panel">${rows||'<div class="empty-inline">No connected upcoming events.</div>'}</section>`;
  }

  function storageCardsHTML() {
    const current=state.storage?.providerId;
    const cards=[
      ['google-drive','Google Drive','Available now','Cloud sync across devices','☁'],
      ['onedrive','Microsoft OneDrive','Adapter planned','Cloud sync across devices','▦'],
      ['dropbox','Dropbox','Adapter planned','Cloud sync across devices','◇'],
      ['webdav','Nextcloud / WebDAV','Adapter planned','User-controlled server storage','⌂'],
      ['sftp','Private SFTP server','Adapter planned','User-controlled private server','⇄'],
      ['local-folder','Local folder','Adapter planned','May limit multi-device sync and background automation','▣']
    ];
    return `<div class="provider-grid">${cards.map(([id,label,status,desc,icon])=>`<article class="provider-card ${current===id?'connected':''} ${status!=='Available now'?'planned':''}"><span class="provider-icon">${icon}</span><div><strong>${esc(label)}</strong><p>${esc(desc)}</p><span class="provider-status">${current===id?'Connected':status}</span></div>${id==='google-drive'&&current!==id?`<button class="text-action" data-connect-storage="google-drive">Connect</button>`:''}</article>`).join('')}</div>`;
  }

  function aiConnectionCardsHTML() {
    const defs=ZekeAIRouter.listProviderDefinitions(); const statusMap=new Map((state.ai?.providers||[]).map(x=>[x.provider,x]));
    return `<div class="provider-grid ai-grid">${Object.values(defs).filter(d=>d.id!=='relay').map(def=>{const st=statusMap.get(def.id);return `<article class="provider-card ai-card ${st?.connected?'connected':''}" data-provider="${def.id}"><div class="provider-card-head"><span class="provider-icon">AI</span><div><strong>${esc(def.label)}</strong><span class="provider-status">${st?.connected?'Test passed this session':st?.hasSessionKey?'Configured · not tested':'Not connected'}</span></div></div><label>API key<input type="password" data-ai-key="${def.id}" placeholder="Paste key for this session"></label><label>Model<select data-ai-model="${def.id}">${def.models.map(m=>`<option value="${esc(m.id)}" ${st?.model===m.id?'selected':''}>${esc(m.label)}</option>`).join('')}</select></label><div class="card-actions"><button class="secondary" data-save-ai="${def.id}">Connect & test</button><button class="text-action" data-test-ai="${def.id}">Test</button></div><small>ZEKE’s router chooses among connected services automatically for each task.</small></article>`}).join('')}</div>`;
  }

  function settingsPageHTML() {
    return `<div class="page-head"><div><h1>Settings</h1><p>Connections and preferences. ZEKE's router and provider managers handle the technical choices.</p></div></div>
      <section class="panel settings-section"><div class="section-head"><div><h2>Storage</h2><p>Choose where ZEKE keeps your workspace. Normal launches should reconnect silently when the provider allows it.</p></div></div>${storageCardsHTML()}<div class="settings-actions"><button class="secondary" id="reconnectStorage">Reconnect storage</button><button class="text-action danger" id="forgetStorage">Disconnect & forget setup</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>AI Connections</h2><p>Connect and test services. ZEKE's AI Router decides which available model to use based on task, privacy, availability, and free-first policy.</p></div><span class="badge">${(state.ai?.providers||[]).filter(x=>x.connected).length} connected</span></div>${aiConnectionCardsHTML()}<div class="manual-packet"><strong>Manual AI packet</strong><p>Export a structured packet for use with any external AI, then import the response back into ZEKE without treating it as raw fact.</p><div class="card-actions"><button class="secondary" id="exportAIPacket">Export packet</button><label class="secondary file-button">Import AI response<input type="file" id="importAIResponse" accept=".json,application/json" hidden></label></div><div id="aiImportStatus" class="status-line"></div></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Calendar connections</h2><p>Calendar providers are context sources. An event on a calendar does not prove that it happened.</p></div></div><div class="provider-grid"><article class="provider-card connected"><span class="provider-icon">▣</span><div><strong>Google Calendar</strong><p>Available with the current Google connection.</p><span class="provider-status">${state.storage?.providerId==='google-drive'?'Connected':'Available'}</span></div></article><article class="provider-card planned"><span class="provider-icon">◫</span><div><strong>Apple Calendar / iCloud</strong><p>CalDAV/ICS-compatible connector planned.</p><span class="provider-status">Planned</span></div></article><article class="provider-card planned"><span class="provider-icon">▤</span><div><strong>Outlook / Exchange</strong><p>Microsoft calendar connector planned.</p><span class="provider-status">Planned</span></div></article><article class="provider-card"><span class="provider-icon">ICS</span><div><strong>ICS import</strong><p>Import an exported calendar file as contextual history.</p><span class="provider-status">Coming next</span></div></article></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Import existing history</h2><p>Import XLSX, JSON, CSV, or TSV history. ZEKE preserves source provenance and checks for likely duplicates.</p></div></div><input type="file" id="importFile" accept=".xlsx,.json,.csv,.tsv,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"><div id="importStatus" class="status-line">${esc(state.importStatus||'')}</div></section>
      <section class="panel about"><h2>About this build</h2><p><strong>ZEKE v${esc(BUILD.version)}</strong> · build ${esc(BUILD.build)}</p><p>${esc(BUILD.label||'Repair release')}</p></section>`;
  }

  function navHTML() {
    const items=[['dashboard','⌂','Dashboard'],['health','♡','Health'],['fitness','⌁','Fitness'],['medications','✚','Medications'],['labs','⌬','Labs & Vitals'],['calendar','▣','Calendar'],['settings','⚙','Settings']];
    return `<aside class="sidebar"><div class="brand"><div class="brand-mark">Z</div><div><strong>ZEKE</strong><span>Your context engine</span></div></div><nav>${items.map(([id,icon,label])=>`<button class="nav-item ${state.route===id?'active':''}" data-route="${id}"><span>${icon}</span>${esc(label)}</button>`).join('')}</nav><div class="sidebar-spacer"></div><div class="privacy-note">Your records stay with your chosen storage provider.</div><div class="build-label">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></aside>`;
  }

  function topbarHTML() {
    const greeting=new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
    return `<header class="topbar"><div><h1>${greeting}</h1><p>${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p></div>${state.route==='dashboard'?`<div class="range-tabs">${[['week','Week'],['month','Month'],['quarter','Quarter'],['6months','6 months'],['year','Year'],['all','All']].map(([id,label])=>`<button class="range ${state.range===id?'active':''}" data-range="${id}">${label}</button>`).join('')}</div><button class="secondary customize" id="customizeBtn">☷ Customize</button>`:''}<span class="top-build" title="Build ${esc(BUILD.build)}">v${esc(BUILD.version)}</span><div class="top-actions"><button class="icon-btn" title="Help">?</button><button class="icon-btn" title="Notifications">♢</button></div></header>`;
  }

  function connectedAppHTML() {
    let content='';
    if(state.route==='dashboard') content=dashboardHTML();
    else if(state.route==='health') content=healthPageHTML();
    else if(state.route==='fitness') content=fitnessPageHTML();
    else if(state.route==='medications') content=medicationsPageHTML();
    else if(state.route==='labs') content=labsPageHTML();
    else if(state.route==='calendar') content=calendarPageHTML();
    else if(state.route==='settings') content=settingsPageHTML();
    return `<div class="app-shell">${navHTML()}<main class="main-shell">${topbarHTML()}<div class="content-shell">${content}</div></main>${customizeDrawerHTML()}<div class="toast" id="toast"></div><input type="file" id="conversationFile" hidden></div>`;
  }

  function customizeDrawerHTML() {
    if(!state.customizeOpen) return '';
    const opts=Object.keys(METRICS).map(id=>`<label><input type="checkbox" data-toggle-widget="metric:${id}" ${state.hiddenWidgets.has(`metric:${id}`)?'':'checked'}> ${esc(METRICS[id].label)}</label>`).join('');
    return `<div class="drawer-backdrop" id="drawerBackdrop"><aside class="drawer"><div class="drawer-head"><h2>Customize dashboard</h2><button class="icon-btn" id="closeDrawer">×</button></div><p>Show only the information that is useful to you. Empty cards remain hidden.</p><div class="drawer-list">${opts}</div></aside></div>`;
  }

  function setupHTML(storage) {
    const reconnect=storage.status==='reconnect-required';
    if(reconnect) return `<div class="connection-screen"><div class="connect-card"><div class="brand-mark big">Z</div><h1>Reconnect your storage</h1><p>ZEKE remembers that this browser uses ${esc(storage.providerId==='google-drive'?'Google Drive':storage.providerId||'your storage provider')}. Your workspace setup is preserved; you do not need to repeat onboarding.</p><button class="primary large" id="reconnectNow">Reconnect Google</button><button class="text-action" id="changeStorage">Choose a different storage provider</button><small>${storage.lastError?`Last connection message: ${esc(storage.lastError)}`:''}</small><div class="build-label center">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></div></div>`;
    return `<div class="connection-screen"><div class="connect-card wide"><div class="brand-mark big">Z</div><h1>Choose where ZEKE keeps your data</h1><p>Connect a user-owned storage provider. Google Drive is available in this alpha; the architecture is ready for additional adapters.</p>${storageCardsHTML()}<button class="primary large" data-connect-storage="google-drive">Connect Google Drive</button><div class="build-label center">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></div></div>`;
  }

  function loadingHTML(message='Starting ZEKE…') { return `<div class="loading-screen"><div class="brand-mark big">Z</div><div class="spinner"></div><p>${esc(message)}</p><div class="build-label center">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></div>`; }

  function render() {
    const root=$('#root'); if(!root)return;
    const storage=ZekeData.snapshot(); state.storage=storage; state.ai=ZekeAIRouter.status(); state.route=routeFromHash();
    if(['booting','connecting','reconnecting'].includes(storage.status)) root.innerHTML=loadingHTML(storage.status==='reconnecting'?'Reconnecting to your workspace…':'Starting ZEKE…');
    else if(storage.status!=='connected') root.innerHTML=setupHTML(storage);
    else root.innerHTML=connectedAppHTML();
    bind();
    requestAnimationFrame(()=>{const t=$('#conversationThread'); if(t)t.scrollTop=t.scrollHeight});
  }

  function humanEvent(e) {
    const s=e.structured||{};
    if(e.category==='measurement'||e.category==='lab') return `${METRICS[canonicalMetric(metricId(e))]?.label||metricId(e)||e.category}: ${metricValue(e)??'—'} ${s.unit||''}`.trim();
    if(e.category==='workout') return `${s.exercise||'Workout'}${s.weight?` · ${s.weight} ${s.weight_unit||'lb'}`:''}${s.reps?` · ${s.reps} reps`:''}${s.sets?` · ${s.sets} sets`:''}`;
    if(e.category==='medication') return `${s.medication_name||s.name||'Medication'}${s.dose?` ${s.dose}${s.unit||''}`:''} · ${s.status||'recorded'}`;
    return e.raw_text||e.category||'Record';
  }

  async function sendConversation(text) {
    text=String(text||'').trim(); if(!text||state.busy)return;
    state.busy=true; pushUser(text); render();
    let raw=null;
    try { raw=await ZekeData.addRawInput(text,state.context); state.events=await ZekeData.listEvents(); }
    catch(e){ pushZeke(`I couldn't preserve that input in connected storage yet. I won't pretend it was saved. ${e.message}`); state.busy=false; render(); return; }

    if (state.context.healthHistory) {
      const history=historyContextFromText(text);
      state.pending={type:'history-confirm',rawId:raw.id,rawText:text,history};
      pushZeke(`I understood that as ${history.relation} health history: ${history.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'history-save'},{label:'Not quite',value:'history-correct'},{label:'Later',value:'confirm-later'},{label:'Ignore',value:'confirm-ignore'}]});
      state.busy=false; render(); return;
    }

    const escalation=/\b(look deeper|try harder|use ai|check again|that'?s not right|not right)\b/i.test(text);
    const question=/\?$|^(what|why|how|should|can|could|tell me|explain|do you)/i.test(text);
    if(escalation||question) {
      try {
        const r=await ZekeAIRouter.ask(text,{task:'chat',history:state.conversation});
        pushZeke(r.text,{source:`${r.provider}/${r.model}`});
      } catch(e) { pushZeke(`I can answer some things locally, but I couldn't reach a connected AI service just now. ${e.message}`); }
      state.busy=false; render(); return;
    }

    let parsed=ZekeParser.interpret(text,state.context);
    if(parsed.type==='ambiguity') {
      state.pending={type:'ambiguity',rawId:raw.id,rawText:text};
      pushZeke("I'm not completely sure what you meant. Were you logging a blood-pressure reading, or a bench-press set?",{choices:[
        {label:'Blood pressure',value:'ambig-bp'},{label:'Bench press',value:'ambig-bench'},{label:'Later',value:'ambig-later'},{label:'Ignore',value:'ambig-ignore'}
      ]});
      state.busy=false;render();return;
    }

    if((parsed.confidence||0)<0.75 || parsed.type==='unstructured' || parsed.needsClarification) {
      try {
        const ai=await ZekeAIRouter.interpret(text,{context:state.context,localSummary:parsed.summary});
        if(ai.status==='clarify' || ai.clarificationQuestion) {
          state.pending={type:'ai-clarify',rawId:raw.id,rawText:text,ai};
          pushZeke(ai.clarificationQuestion||'I need one more detail before I save this. What did you mean?',{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});
          state.busy=false;render();return;
        }
        parsed={confidence:ai.confidence||0.8,summary:ai.summary||'AI-assisted interpretation',events:ai.events||[],aiSource:`${ai.provider}/${ai.model}`};
      } catch(e) {
        if(!(parsed.events||[]).length) {
          state.pending={type:'needs-detail',rawId:raw.id,rawText:text};
          pushZeke(`I preserved what you said, but I don't understand it well enough to structure it without guessing. Could you say a little more about what you want me to record?`,{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});
          state.busy=false;render();return;
        }
      }
    }

    if(!(parsed.events||[]).length) {
      pushZeke('I preserved your note, but I do not have enough certainty to create structured data from it yet.'); state.busy=false;render();return;
    }
    state.pending={type:'confirm',rawId:raw.id,rawText:text,parsed};
    pushZeke(`I understood that as ${parsed.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'},{label:'Later',value:'confirm-later'},{label:'Ignore',value:'confirm-ignore'}]});
    state.busy=false; render();
  }

  async function handleChoice(value) {
    const p=state.pending;
    if(value==='ambig-bp') {
      state.context={metric:'blood_pressure'};
      pushZeke('Thanks. For blood pressure I need the systolic and diastolic values explicitly, such as 120/82. What were the two numbers?');
      state.pending={...p,type:'needs-detail'}; render(); return;
    }
    if(value==='history-save') {
      await ZekeData.saveFactor({type:p.history.history_type,status:'active',relation:p.history.relation,summary:p.history.summary,source_raw_event_id:p.rawId,provenance:{source:'conversation'}});
      await ZekeData.updateEvent(p.rawId,{structured:{interpretation_status:'confirmed',context_type:p.history.history_type,factor_relation:p.history.relation},correction_note:'Health history interpretation confirmed'},{appendCorrection:false});
      pushZeke('Saved. I’ll keep that as health-history context and use it only when relevant.'); state.pending=null; state.context={}; await refreshData(); render(); return;
    }
    if(value==='history-correct') { pushZeke('Thanks for catching that. Tell me what relationship or detail I misunderstood.'); state.pending={...p,type:'history-correction-awaiting'}; render(); return; }
    if(value==='ambig-bench') {
      state.context={exercise:'bench press'}; const parsed=ZekeParser.interpret(p.rawText.replace(/^bp\s*/i,''),state.context);
      state.pending={type:'confirm',rawId:p.rawId,rawText:p.rawText,parsed}; pushZeke(`I understood that as ${parsed.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'}]}); render(); return;
    }
    if(['ambig-later','pending-later','confirm-later'].includes(value)) { pushZeke('No problem. I’ll keep the original input unresolved and we can come back to it later.'); state.pending=null; state.context={}; render(); return; }
    if(['ambig-ignore','pending-ignore','confirm-ignore'].includes(value)) { pushZeke('Okay. I won’t keep asking about that interpretation. The original note remains preserved, but I won’t turn it into structured data.'); state.pending=null; state.context={}; render(); return; }
    if(value==='confirm-correct') { pushZeke('Thanks for catching that. Tell me what I got wrong, and I’ll try again without overwriting the original note.'); state.pending={...p,type:'correction-awaiting'}; render(); return; }
    if(value==='confirm-save') {
      const candidate=(p.parsed.events||[])[0]; const dupes=await ZekeData.findLikelyDuplicates(candidate);
      if(dupes.length) {
        state.pending={...p,type:'duplicate',dupe:dupes[0].event}; pushZeke(`This looks very similar to ${humanEvent(dupes[0].event)} already in your record. Was this a separate event, or an accidental duplicate?`,{choices:[{label:'Separate event',value:'dupe-keep'},{label:'Duplicate—keep one',value:'dupe-discard'},{label:'Cancel',value:'dupe-cancel'}]}); render();return;
      }
      await savePendingConfirmed(p); return;
    }
    if(value==='dupe-keep') { await savePendingConfirmed(p); return; }
    if(value==='dupe-discard') { pushZeke('Got it. I kept the existing record and did not create another structured data point.'); state.pending=null;state.context={};await refreshData();render();return; }
    if(value==='dupe-cancel') { pushZeke('Okay. I left the original note unresolved and made no structured change.'); state.pending=null;state.context={};render();return; }
    if(value==='answer-pending') { pushZeke('Go ahead—tell me the missing detail in your own words.'); render(); return; }
  }

  async function savePendingConfirmed(p) {
    await ZekeData.confirmRawInput(p.rawId,p.parsed.events);
    pushZeke(`Saved. I recorded ${p.parsed.summary}.`);
    state.pending=null; state.context={}; await refreshData(); render();
  }

  async function openNextQuestion() {
    const q=openQuestions()[0]; if(!q){pushZeke("I don't have any unresolved questions for you right now.");render();return;}
    state.pending={type:'question',question:q};
    pushZeke(q.question,{choices:[{label:'Answer now',value:'question-answer'},{label:'Later',value:'question-later'},{label:"I don't know",value:'question-unknown'},{label:'Ignore this question',value:'question-ignore'}]}); render();
  }

  async function handleQuestionChoice(value) {
    const q=state.pending?.question; if(!q)return;
    if(value==='question-answer'){pushZeke('Go ahead—answer in your own words.'); state.pending={type:'question-awaiting',question:q}; render();return;}
    if(value==='question-later'){await ZekeData.resolveFactor(q.id,'deferred','');pushZeke('Okay. I’ll keep it for later without repeatedly nagging you.');state.pending=null;await refreshData();render();return;}
    if(value==='question-unknown'){await ZekeData.resolveFactor(q.id,'unknown',"I don't know");pushZeke("That's fine. I’ll treat it as unknown rather than guessing.");state.pending=null;await refreshData();render();return;}
    if(value==='question-ignore'){await ZekeData.resolveFactor(q.id,'dismissed','Ignored by user');pushZeke('Understood. I won’t keep asking about that unless new context makes it materially important, and then I’ll explain why.');state.pending=null;await refreshData();render();return;}
  }

  async function handlePendingAnswer(text) {
    if(state.pending?.type==='question-awaiting') {
      const q=state.pending.question; await ZekeData.resolveFactor(q.id,'resolved',text); const applied=await applyQuestionAnswer(q,text); pushZeke(applied.message);state.pending=null;await refreshData();render();return true;
    }
    if(state.pending?.type==='history-correction-awaiting') {
      const p=state.pending; const history=historyContextFromText(text); state.pending={type:'history-confirm',rawId:p.rawId,rawText:p.rawText,history};
      pushZeke(`Thanks. I now understand that as ${history.relation} health history: ${history.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'history-save'},{label:'Not quite',value:'history-correct'}]}); render(); return true;
    }
    if(state.pending?.type==='correction-awaiting') {
      const original=state.pending; const parsed=ZekeParser.interpret(text,state.context);
      if((parsed.events||[]).length){state.pending={type:'confirm',rawId:original.rawId,rawText:original.rawText,parsed};pushZeke(`Thanks. I now understand it as ${parsed.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'}]});render();return true;}
    }
    if(['needs-detail','ai-clarify'].includes(state.pending?.type)) {
      const interpretationText=state.context.metric==='blood_pressure'?text:`${state.pending.rawText}. Clarification: ${text}`;
      const parsed=ZekeParser.interpret(interpretationText,state.context);
      if((parsed.events||[]).length){state.pending={type:'confirm',rawId:state.pending.rawId,rawText:state.pending.rawText,parsed};pushZeke(`Thanks. I now understand that as ${parsed.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'}]});render();return true;}
      pushZeke('I still do not have enough detail to save that safely. Please give the values in the clearest form you can.'); render(); return true;
    }
    return false;
  }

  async function handleAction(actionId) {
    const action=(state.actions.catalog||[]).find(a=>a.id===actionId); if(!action)return;
    state.context={actionId:action.id,medication:action.kind==='medication'?action.label:null};
    pushZeke(`Let's confirm ${action.label||action.name}. What happened today?`); render(); $('#talkInput')?.focus();
  }

  function startContextLog(type,value='') {
    if(type==='metric') {
      const meta=METRICS[value]; state.context={metric:value==='blood_pressure'?'blood_pressure':value}; pushZeke(`Let's log ${meta?.label||value}. What is the value?`);
    } else if(type==='exercise') { state.context={exercise:value||null}; pushZeke(value?`Let's log ${value}. You can tell me weight, reps, sets, RPE, pain, or anything else that matters.`:'Tell me about the workout.'); }
    else if(type==='medication') { state.context={medication:value||null}; pushZeke(value?`Let's log ${value}. What happened?`:'Tell me the medication, supplement, or injection and what happened.'); }
    go('dashboard'); render(); setTimeout(()=>$('#talkInput')?.focus(),0);
  }

  async function editEvent(id) {
    const e=state.events.find(x=>x.id===id); if(!e)return;
    pushZeke(`You selected ${humanEvent(e)} from ${fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})}. Tell me what should be corrected. I’ll preserve the change history.`);
    state.pending={type:'edit-event',event:e}; go('dashboard'); render();
  }

  async function handleEditAnswer(text) {
    if(state.pending?.type!=='edit-event') return false;
    const target=state.pending.event; const parsed=ZekeParser.interpret(text,{});
    if(!(parsed.events||[]).length){pushZeke('I could not interpret the correction safely. Please include the corrected value or details.');render();return true;}
    const replacement=parsed.events[0]; state.pending={type:'edit-confirm',event:target,replacement}; pushZeke(`I understand the correction as ${parsed.summary}. Replace the structured details for the selected record while keeping an audit trail?`,{choices:[{label:'Yes, correct it',value:'edit-confirm'},{label:'Cancel',value:'edit-cancel'}]});render();return true;
  }

  async function handleEditChoice(value) {
    if(state.pending?.type!=='edit-confirm')return;
    if(value==='edit-cancel'){pushZeke('Canceled. I made no changes.');state.pending=null;render();return;}
    if(value==='edit-confirm'){
      await ZekeData.updateEvent(state.pending.event.id,{category:state.pending.replacement.category,structured:state.pending.replacement.structured,correction_note:'Corrected through Talk to ZEKE'});pushZeke('Corrected. The previous version is preserved in the audit history.');state.pending=null;await refreshData();render();
    }
  }

  function bindTooltips() {
    const tooltip=$('#chartTooltip');
    $$('[data-tip]').forEach(el=>{
      el.addEventListener('mouseenter',e=>{const t=tooltip||ensureGlobalTooltip(); t.textContent=el.dataset.tip; t.classList.add('show'); positionTooltip(t,e)});
      el.addEventListener('mousemove',e=>positionTooltip(tooltip||ensureGlobalTooltip(),e));
      el.addEventListener('mouseleave',()=>{(tooltip||$('#globalTooltip'))?.classList.remove('show')});
    });
  }
  function ensureGlobalTooltip(){let t=$('#globalTooltip');if(!t){t=document.createElement('div');t.id='globalTooltip';t.className='chart-tooltip';document.body.appendChild(t)}return t}
  function positionTooltip(t,e){if(!t)return;t.style.left=`${e.clientX+12}px`;t.style.top=`${e.clientY+12}px`}

  function rowCandidates(row, fileName='') {
    const normalized={};
    for(const [k,v] of Object.entries(row||{})) normalized[String(k).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')]=v;
    const get=(...keys)=>{for(const k of keys){if(normalized[k]!==undefined&&normalized[k]!=='')return normalized[k]}return null};
    const asNum=v=>{const cleaned=String(v??'').trim().replace(/,/g,'').replace(/[^0-9.+-]/g,'');if(!cleaned)return null;const n=Number(cleaned);return Number.isFinite(n)?n:null};
    const rawDate=get('date','datetime','timestamp','recorded_at','event_date','measurement_date','session_date');
    let timestamp=new Date().toISOString();
    if(rawDate){const d=new Date(rawDate);if(!Number.isNaN(d.getTime()))timestamp=d.toISOString()}
    const source={source:'import',file:fileName,sheet:get('__sheet')||undefined};
    const out=[];
    const addMetric=(id,value,unit,category='measurement')=>{const n=asNum(value);if(n!=null)out.push({category,timestamp,raw_text:'',structured:{metric_id:id,value:n,unit,interpretation_status:'confirmed'},provenance:source})};

    const exercise=get('exercise','exercise_name','movement','activity');
    const reps=asNum(get('reps','repetitions')); const sets=asNum(get('sets','set_count')); const workoutWeight=asNum(get('workout_weight','load','weight_lbs','weight_lb','weight'));
    if(exercise && (reps!=null||sets!=null||workoutWeight!=null)) {
      out.push({category:'workout',timestamp,raw_text:'',structured:{exercise:String(exercise).toLowerCase(),weight:workoutWeight,weight_unit:workoutWeight!=null?'lb':'',reps,sets,rpe:asNum(get('rpe')),pain:asNum(get('pain','pain_score')),duration_min:asNum(get('duration_min','minutes','duration')),distance_mi:asNum(get('distance_mi','miles','distance')),interpretation_status:'confirmed'},provenance:source});
      return out;
    }

    addMetric('weight',get('body_weight','bodyweight','weight_lbs','weight_lb','weight'),'lb');
    addMetric('resting_hr',get('resting_hr','resting_heart_rate','rhr'),'bpm');
    addMetric('a1c',get('a1c','hba1c'),'%','lab');
    addMetric('ldl',get('ldl','ldl_cholesterol'),'mg/dL','lab');
    addMetric('steps',get('steps','step_count'),'steps');
    addMetric('sleep_duration',get('sleep_duration','sleep_hours','hours_slept'),'hr');
    addMetric('bp_systolic',get('systolic','bp_systolic','systolic_bp'),'mmHg');
    addMetric('bp_diastolic',get('diastolic','bp_diastolic','diastolic_bp'),'mmHg');

    const medication=get('medication','medication_name','drug','medicine');
    if(medication) {
      out.push({category:'medication',timestamp,raw_text:'',structured:{medication_name:String(medication),dose:asNum(get('dose','dose_amount')),unit:get('dose_unit','unit')||'',status:String(get('status','taken_status')||'recorded').toLowerCase(),interpretation_status:'confirmed'},provenance:source});
    }
    return out;
  }

  async function handleImport(file) {
    const status=$('#importStatus'); state.importStatus='Reading file…'; if(status)status.textContent=state.importStatus;
    try {
      const lowerName=file.name.toLowerCase(); let rows=[];
      if(lowerName.endsWith('.xlsx')) {
        if(!window.XLSX) throw new Error('Spreadsheet reader did not load. Refresh and try again.');
        const buffer=await file.arrayBuffer(); const workbook=window.XLSX.read(buffer,{type:'array',cellDates:true});
        for(const sheetName of workbook.SheetNames) {
          const sheet=workbook.Sheets[sheetName];
          rows.push(...window.XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false}).map(row=>({...row,__sheet:sheetName})));
        }
      } else {
        const text=await file.text();
        if(lowerName.endsWith('.json')) {
          const parsed=JSON.parse(text); rows=Array.isArray(parsed)?parsed:(parsed.events||[]);
        } else {
          const delimiter=lowerName.endsWith('.tsv')?'\t':','; const lines=text.split(/\r?\n/).filter(Boolean); const headers=parseDelimited(lines[0],delimiter);
          rows=lines.slice(1).map(line=>{const vals=parseDelimited(line,delimiter);return Object.fromEntries(headers.map((h,i)=>[h,vals[i]??'']))});
        }
      }
      const candidates=[];
      for(const row of rows) {
        if(row.category&&row.structured) candidates.push(row);
        else {
          const mapped=rowCandidates(row,file.name);
          if(mapped.length) candidates.push(...mapped);
          else {
            const raw=Object.entries(row).map(([k,v])=>`${k}: ${v}`).join('; '); const parsedRow=ZekeParser.interpret(raw,{});
            if((parsedRow.events||[]).length)candidates.push(...parsedRow.events.map(e=>({...e,provenance:{source:'import',file:file.name}})));
          }
        }
      }
      if(!candidates.length) throw new Error('No safely interpretable records were found. The file was not imported.');
      let imported=0,skipped=0;
      for(const c of candidates) { const dupes=await ZekeData.findLikelyDuplicates(c); if(dupes.length){skipped++;continue} await ZekeData.addEvent({...c,provenance:{...(c.provenance||{}),source:'import',file:file.name}});imported++; }
      state.importStatus=`Imported ${imported} record${imported===1?'':'s'}; skipped ${skipped} likely duplicate${skipped===1?'':'s'}.`; if(status)status.textContent=state.importStatus;
      await refreshData(); render();
    } catch(e){state.importStatus=`Import failed: ${e.message}`;if(status)status.textContent=state.importStatus;render()}
  }

  function parseDelimited(line,delimiter) {
    const out=[]; let cur='',quoted=false;
    for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++}else quoted=!quoted}else if(ch===delimiter&&!quoted){out.push(cur.trim());cur=''}else cur+=ch} out.push(cur.trim()); return out;
  }

  function bind() {
    $$('[data-route]').forEach(el=>el.onclick=()=>go(el.dataset.route));
    $$('[data-range]').forEach(el=>el.onclick=()=>{state.range=el.dataset.range;render()});
    $$('[data-select-metric]').forEach(el=>el.onclick=()=>{state.selectedMetric=el.dataset.selectMetric;render()});
    $$('[data-log-metric]').forEach(el=>el.onclick=()=>startContextLog('metric',el.dataset.logMetric));
    $$('[data-context-exercise]').forEach(el=>el.onclick=()=>startContextLog('exercise',el.dataset.contextExercise));
    $$('[data-context-medication]').forEach(el=>el.onclick=()=>startContextLog('medication',el.dataset.contextMedication));
    $$('[data-action-id]').forEach(el=>el.onclick=()=>handleAction(el.dataset.actionId));
    $$('[data-edit-event]').forEach(el=>el.onclick=()=>editEvent(el.dataset.editEvent));

    $('#sendBtn')?.addEventListener('click',async()=>{const input=$('#talkInput');const text=input?.value||'';if(input)input.value='';if(await handlePendingAnswer(text))return;if(await handleEditAnswer(text))return;sendConversation(text)});
    $('#talkInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#sendBtn')?.click()}});
    $('#questionPill')?.addEventListener('click',openNextQuestion);
    $('#addHealthHistory')?.addEventListener('click',()=>{state.context={healthHistory:true};pushZeke('Tell me the personal or family health-history detail you want ZEKE to remember. You can say it naturally, for example: “My sister had a heart attack at 45.”');go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0)});
    $$('[data-conversation-choice]').forEach(el=>el.onclick=async()=>{const v=el.dataset.conversationChoice;if(v.startsWith('question-'))return handleQuestionChoice(v);if(v.startsWith('edit-'))return handleEditChoice(v);return handleChoice(v)});
    $('#toggleCoachEvidence')?.addEventListener('click',()=>{state.coachExpanded=!state.coachExpanded;render()});
    $('#actionsLeft')?.addEventListener('click',()=>$('#actionsStrip')?.scrollBy({left:-300,behavior:'smooth'}));
    $('#actionsRight')?.addEventListener('click',()=>$('#actionsStrip')?.scrollBy({left:300,behavior:'smooth'}));
    $('#customizeBtn')?.addEventListener('click',()=>{state.customizeOpen=true;render()});
    $('#closeDrawer')?.addEventListener('click',()=>{state.customizeOpen=false;render()});
    $('#drawerBackdrop')?.addEventListener('click',e=>{if(e.target.id==='drawerBackdrop'){state.customizeOpen=false;render()}});
    $$('[data-toggle-widget]').forEach(el=>el.onchange=()=>{el.checked?state.hiddenWidgets.delete(el.dataset.toggleWidget):state.hiddenWidgets.add(el.dataset.toggleWidget);render()});

    $$('[data-thinking]').forEach(el=>el.onclick=async()=>{const v=el.dataset.thinking;if(v==='track-shakes'||v==='track-creatine'){const label=v==='track-shakes'?'Protein shake':'Creatine';pushZeke(`Great. How often do you normally use ${label.toLowerCase()}, and do you want it in Today's Actions or only logged when you mention it?`);render();$('#talkInput')?.focus()}else if(v==='later'){pushZeke('No problem. I’ll leave that for later.');render()}else{pushZeke('Understood. I won’t keep suggesting that.');render()}});

    $('[data-connect-storage="google-drive"]')?.addEventListener('click',async()=>{try{await ZekeData.connect('google-drive');await refreshData();render()}catch(e){showToast(e.message,'error');render()}});
    $('#reconnectNow')?.addEventListener('click',async()=>{try{await ZekeData.reconnect();await refreshData();render()}catch(e){showToast(e.message,'error');render()}});
    $('#reconnectStorage')?.addEventListener('click',async()=>{try{await ZekeData.reconnect();await refreshData();render();showToast('Storage reconnected.')}catch(e){showToast(e.message,'error')}});
    $('#forgetStorage')?.addEventListener('click',async()=>{if(confirm('Disconnect and forget this browser setup? Your Drive data will not be deleted.')){await ZekeData.disconnect({forgetSetup:true,revoke:false});render()}});
    $('#changeStorage')?.addEventListener('click',async()=>{await ZekeData.disconnect({forgetSetup:true});render()});

    $$('[data-save-ai]').forEach(el=>el.onclick=async()=>{const id=el.dataset.saveAi;const key=$(`[data-ai-key="${id}"]`)?.value.trim();const model=$(`[data-ai-model="${id}"]`)?.value;try{await ZekeAIRouter.configure({provider:id,key,model,privacy:'minimum-necessary'});const r=await ZekeAIRouter.testProvider(id);state.ai=ZekeAIRouter.status();showToast(`Connection test passed: ${r.provider} · ${r.model}`);render()}catch(e){state.ai=ZekeAIRouter.status();showToast(`Connection failed: ${e.message}`,'error');render()}});
    $$('[data-test-ai]').forEach(el=>el.onclick=async()=>{const id=el.dataset.testAi;try{const key=$(`[data-ai-key="${id}"]`)?.value.trim();const model=$(`[data-ai-model="${id}"]`)?.value;if(key)await ZekeAIRouter.configure({provider:id,key,model,privacy:'minimum-necessary'});const r=await ZekeAIRouter.testProvider(id);showToast(`Connection test passed: ${r.provider} · ${r.model}`);state.ai=ZekeAIRouter.status();render()}catch(e){showToast(`Test failed: ${e.message}`,'error')}});

    $('#exportAIPacket')?.addEventListener('click',()=>{const packet={packet_type:'ZEKE Manual AI Packet',build:BUILD,created_at:new Date().toISOString(),instructions:'Return analysis as observations, interpretations, evidence, limitations, and proposed actions. Do not treat inferred claims as raw facts.',context:{recent_events:state.events.slice(-50),open_questions:openQuestions(),discoveries:state.discoveries.slice(0,10)}};downloadJSON(packet,`zeke-ai-packet-${localDay()}.json`)});
    $('#importAIResponse')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;const status=$('#aiImportStatus');try{const response=JSON.parse(await file.text());await ZekeData.saveFactor({type:'external_ai_response',status:'review',summary:response.summary||response.analysis||response.title||'Imported AI analysis awaiting review',response,provenance:{source:'manual-ai-packet',file:file.name}});if(status)status.textContent='Imported for review. ZEKE will not treat the AI response as raw fact.';await refreshData()}catch(err){if(status)status.textContent=`Import failed: ${err.message}`}});
    $('#importFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)handleImport(f)});
    $('#attachBtn')?.addEventListener('click',()=>$('#conversationFile')?.click());
    $('#conversationFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f){pushZeke(`I received ${f.name}. File interpretation through the conversation is not complete in this repair build yet; use Settings → Import existing history for XLSX, JSON, CSV, or TSV data.`);render()}});
    bindTooltips();
  }

  function showToast(message,type='ok'){const t=$('#toast');if(!t)return;t.textContent=message;t.className=`toast show ${type}`;setTimeout(()=>t.classList.remove('show'),5000)}
  function downloadJSON(value,name){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

  async function init() {
    window.addEventListener('hashchange',()=>{state.route=routeFromHash();render()});
    window.addEventListener('zeke:data-changed',debounce(async()=>{await refreshData();render()},100));
    window.addEventListener('zeke:storage-state',render);
    await ZekeAIRouter.hydrateMetadata();
    render();
    await ZekeData.bootstrap();
    if(ZekeData.snapshot().status==='connected') await refreshData();
    render();
  }

  document.addEventListener('DOMContentLoaded',init);
})();
