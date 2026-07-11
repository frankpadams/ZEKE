(() => {
  'use strict';

  const BUILD = window.ZEKE_BUILD || { version:'0.7.0', build:'unknown' };
  const state = {
    route:'dashboard', range:'month', selectedMetric:'weight',
    events:[], factors:[], discoveries:[], actions:{catalog:[],daily_states:{}}, calendar:[],
    conversation:[], pending:null, context:{}, storage:null, ai:null,
    coachExpanded:false, customizeOpen:false, metricMenuOpen:false,
    hiddenWidgets:new Set(), busy:false, importStatus:'', importReport:null, importBatches:[],
    conversationLoaded:false, preferences:{}, coachAI:null, coachAILoading:false, theme:'dark', draft:''
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
    const message={ id:crypto.randomUUID(), role, text, at:new Date().toISOString(), ...meta };
    state.conversation.push(message);
    if (state.conversation.length > 300) state.conversation = state.conversation.slice(-300);
    if (window.ZekeData?.snapshot().status === 'connected') ZekeData.appendConversation(message).catch(()=>{});
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
    const [events,factors,discoveries,actions,conversation,importBatches,preferences] = await Promise.all([
      ZekeData.listEvents(), ZekeData.listFactors(), ZekeData.listDiscoveries(), ZekeData.getActions(),
      ZekeData.listConversation(), ZekeData.listImportBatches(), ZekeData.getPreferences()
    ]);
    state.events=events; state.factors=factors; state.discoveries=discoveries; state.actions=actions;
    state.importBatches=importBatches; state.preferences=preferences||{}; state.importReport=state.importReport || importBatches?.at(-1) || null;
    if (!state.conversationLoaded || !state.conversation.length) { state.conversation=conversation||[]; state.conversationLoaded=true; }
    state.theme=state.preferences.theme || state.theme || 'dark';
    document.documentElement.dataset.theme=state.theme;
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
    if (/every\s*day|daily|once\s+a\s+day|each\s+day|1\s*x\s*\/?\s*day/.test(a)) return {type:'daily'};
    const matched=[...new Set(Object.entries(days).filter(([name])=>new RegExp(`\\b${name}(?:s)?\\b`,'i').test(a)).map(([,n])=>n))];
    if (/weekly|once\s+(?:a|per)\s+week|every\s+week|1\s*x\s*\/?\s*week|1\s+time\s+(?:a|per)\s+week/.test(a) || matched.length) return {type:'weekly',days:matched.length?matched:[] , usual:true};
    return null;
  }

  async function applyQuestionAnswer(q, answer) {
    const answerText=String(answer||'').toLowerCase();
    if (q.question_key?.startsWith('duplicate_import:')) {
      if (/separate|another|different|keep both|intentional|second/.test(answerText)) {
        if(q.candidate_event) await ZekeData.addEvent({...q.candidate_event,provenance:{...(q.candidate_event.provenance||{}),source:'import-confirmed-separate'}});
        return {applied:true,message:'Thanks. I kept it as a separate real event, so both observations remain in your history.'};
      }
      if (/duplicate|same one|accidental|keep one|remove/.test(answerText)) return {applied:true,message:'Thanks. I kept the existing record and did not add the duplicate candidate.'};
      return {applied:false,message:'I saved your answer, but I’m not sure whether you want both records kept. I’ll leave the imported candidate unresolved rather than guess.'};
    }
    if (q.question_key?.startsWith('import_bp:')) {
      const nums=[...String(answer||'').matchAll(/\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
      if(nums.length>=2 && nums[0]>nums[1]) {
        const base=q.import_candidate||{};
        await ZekeData.addEvent({category:'measurement',timestamp:base.timestamp||new Date().toISOString(),structured:{metric_id:'bp_systolic',value:nums[0],unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(base.provenance||{}),source:'user-confirmed-import'}});
        await ZekeData.addEvent({category:'measurement',timestamp:base.timestamp||new Date().toISOString(),structured:{metric_id:'bp_diastolic',value:nums[1],unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(base.provenance||{}),source:'user-confirmed-import'}});
        return {applied:true,message:`Thanks. I recorded the confirmed blood pressure as ${nums[0]}/${nums[1]} mmHg.`};
      }
      return {applied:false,message:'Thanks. I saved your answer, but I still need the blood-pressure values in systolic/diastolic order, such as 120/80, before I graph them.'};
    }
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
      return {applied:true,message:`Thanks. I saved that schedule${schedule.type==='weekly'&&schedule.days?.length?' and will treat that day as the expected day rather than an absolute requirement':''}. I’ll use it to decide when the action belongs in Today’s Actions.`};
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
    const x=String(id||'').toLowerCase().replace(/[._-]+/g,' ');
    if (/body\s*fat/.test(x)) return 'body_fat_pct';
    if (/waist/.test(x)) return 'waist_circumference';
    if (/weight/.test(x)) return 'weight';
    if (/hemoglobin\s*a1c|hba1c|a1c/.test(x)) return 'a1c';
    if (/resting.*hr|resting.*heart|\brhr\b/.test(x)) return 'resting_hr';
    if (/sleep.*duration|sleep\s*hours|hours\s*slept|\bsleep\b/.test(x)) return 'sleep_duration';
    if (/step/.test(x)) return 'steps';
    if (/apo\s*b|apob/.test(x)) return 'apob';
    if (/lipoprotein\s*\(?a\)?|lp\s*\(?a\)?/.test(x)) return 'lpa';
    if (/ldl/.test(x)) return 'ldl';
    if (/high\s*density|\bhdl\b/.test(x)) return 'hdl';
    if (/trig/.test(x)) return 'triglycerides';
    if (/total\s*chol|^cholesterol$/.test(x)) return 'total_cholesterol';
    if (/average\s*glucose|estimated\s*average\s*glucose/.test(x)) return 'average_glucose';
    if (/fasting\s*glucose|blood\s*glucose|^glucose$/.test(x)) return 'glucose';
    if (/systolic/.test(x)) return 'bp_systolic';
    if (/diastolic/.test(x)) return 'bp_diastolic';
    if (/energy/.test(x)) return 'energy';
    if (/appetite|hunger/.test(x)) return 'appetite';
    if (/protein/.test(x)) return 'protein_g';
    if (/calorie/.test(x)) return 'calories';
    if (/water|hydration/.test(x)) return 'water_oz';
    if (/pain/.test(x)) return 'pain_score';
    if (/cardio.*min|activity.*min/.test(x)) return 'cardio_minutes';
    return String(id||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  }

  function allMetricSeries(id) {
    return state.events.filter(e=>['measurement','lab'].includes(e.category)).map(e=>{
      const cid=canonicalMetric(metricId(e)); const value=metricValue(e); const s=e.structured||{};
      return {id:e.id,metric:cid,value,unit:s.unit||s.value_unit||'',date:e.timestamp||e.recorded_at,source:e.provenance?.source||s.source||'ZEKE'};
    }).filter(p=>p.metric===id && p.value!=null).sort((a,b)=>new Date(a.date)-new Date(b.date));
  }

  function metricSeries(id) {
    const days = RANGE_DAYS[state.range]; const cutoff = days ? Date.now()-days*864e5 : 0;
    return allMetricSeries(id).filter(p=>new Date(p.date).getTime()>=cutoff);
  }

  function bloodPressureSeries(all=false) {
    const series=all?allMetricSeries:metricSeries;
    const sys=series('bp_systolic'), dia=series('bp_diastolic');
    return {sys,dia};
  }

  function latestMetric(id) {
    if (id==='blood_pressure') {
      const {sys,dia}=bloodPressureSeries(true); return sys.length&&dia.length?{value:`${sys.at(-1).value}/${dia.at(-1).value}`,unit:'mmHg',date:sys.at(-1).date}:null;
    }
    const s=allMetricSeries(id); return s.at(-1)||null;
  }

  function metricDelta(id) {
    const s=metricSeries(id); if(s.length<2) return null;
    return s.at(-1).value-s[0].value;
  }

  function availableMetrics() {
    return Object.keys(METRICS).filter(id=>id==='blood_pressure'?(bloodPressureSeries(true).sys.length&&bloodPressureSeries(true).dia.length):allMetricSeries(id).length);
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
    const delta=metricDelta(id); let points=id==='blood_pressure'?bloodPressureSeries().sys.slice(-12):metricSeries(id).slice(-12); if(points.length<2) points=id==='blood_pressure'?bloodPressureSeries(true).sys.slice(-12):allMetricSeries(id).slice(-12);
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

  function healthGlanceHTML(limit=6) {
    const metrics=availableMetrics().filter(id=>!state.hiddenWidgets.has(`metric:${id}`)).slice(0,limit);
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
    const ticks=[max,(2*max+min)/3,(max+2*min)/3,min];
    const xIdx=[0,Math.floor((points.length-1)/2),points.length-1];
    return `<div class="chart-wrap"><svg class="trend-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(METRICS[id]?.label||id)} trend">
      ${ticks.map((v,i)=>{const y=pt+i*(h-pt-pb)/(ticks.length-1);return `<line class="grid-line" x1="${pl}" x2="${w-pr}" y1="${y}" y2="${y}"/><text class="axis-label" x="4" y="${y+4}">${Number(v).toFixed(Math.abs(v)<10?1:0)}</text>`}).join('')}
      <path class="chart-line" d="${path}"/>
      ${xy.map((q,i)=>`<circle class="chart-point" cx="${q[0]}" cy="${q[1]}" r="4.5" data-tip="${esc(fmtDate(points[i].date,{month:'short',day:'numeric',year:'numeric'}))}: ${esc(points[i].value)} ${esc(points[i].unit||METRICS[id]?.unit||'')} · ${esc(points[i].source)}" data-event-id="${esc(points[i].id)}"/>`).join('')}
      ${xIdx.map(i=>`<text class="axis-label x" x="${xy[i][0]}" y="${h-10}" text-anchor="middle">${esc(fmtDate(points[i].date))}</text>`).join('')}
    </svg><div class="chart-tooltip" id="chartTooltip"></div></div>`;
  }

  function trendPanelHTML() {
    const available=availableMetrics().filter(id => id==='blood_pressure' ? bloodPressureSeries().sys.length>=2 : metricSeries(id).length>=2); if(!available.length) return ''; if(!available.includes(state.selectedMetric)) state.selectedMetric=available[0];
    const meta=METRICS[state.selectedMetric]||METRICS.weight; const latest=latestMetric(state.selectedMetric);
    return `<section class="panel trend-panel">
      <div class="section-head"><div><h2>${esc(meta.label)} trend</h2><p>${latest?`Current: ${esc(latest.value)} ${esc(latest.unit||meta.unit)}`:'No data yet'}</p></div>
        <div class="metric-tabs">${available.slice(0,5).map(id=>`<button class="mini-tab ${id===state.selectedMetric?'active':''}" data-select-metric="${id}">${esc(METRICS[id].label)}</button>`).join('')}${available.length>5?`<button class="mini-tab" id="moreMetrics">More ▾</button>`:''}</div>
      </div>${trendChartSVG(state.selectedMetric)}
      <div class="chart-caption"><span>Only verified connected data is plotted.</span><span>${latest?`Source: ${esc(metricSeries(state.selectedMetric).at(-1)?.source||'ZEKE')}`:''}</span></div>
    </section>`;
  }

  function workoutGroups() {
    // Normalize summarized rows and one-row-per-set imports into exercise sessions.
    const byExercise=new Map();
    for(const e of state.events.filter(e=>e.category==='workout')) {
      const s=e.structured||{};
      const name=(s.exercise||s.session_type||s.exercise_name||'').trim();
      if(!name) continue;
      const day=localDay(new Date(e.timestamp||e.recorded_at||Date.now()));
      const sessionKey=String(s.workout_id||s.session_id||`${day}:${name.toLowerCase()}`);
      if(!byExercise.has(name)) byExercise.set(name,new Map());
      const sessions=byExercise.get(name);
      const prev=sessions.get(sessionKey)||{event:e,date:e.timestamp,weight:0,reps:0,sets:0,rpe:0,pain:0,workout_id:s.workout_id||''};
      const weight=Number(s.weight||s.load||0), reps=Number(s.reps||0), sets=Number(s.sets||0);
      const setRows=Number(s.set_number||s.set_no||0)?1:0;
      sessions.set(sessionKey,{...prev,event:e,date:e.timestamp||prev.date,weight:Math.max(prev.weight,weight),reps:Math.max(prev.reps,reps),sets:prev.sets+(sets||setRows||1),rpe:Math.max(prev.rpe,Number(s.rpe||0)),pain:Math.max(prev.pain,Number(s.pain||0))});
    }
    const map=new Map();
    for(const [name,sessions] of byExercise) map.set(name,[...sessions.values()].sort((a,b)=>new Date(a.date)-new Date(b.date)));
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
      <div class="coach-rec"><strong>ZEKE's observation</strong><p>${esc(state.coachAI?.recommendation || x.suggestion)}</p>${state.coachAI?`<small class="ai-provenance">AI-assisted interpretation · ${esc(state.coachAI.confidence||'confidence not stated')} confidence</small>`:''}</div>
      <div class="coach-actions"><button class="text-action" id="toggleCoachEvidence">${state.coachExpanded?'Hide evidence':'View reasoning & evidence'}</button><button class="secondary" id="deeperCoachAI" ${state.coachAILoading?'disabled':''}>${state.coachAILoading?'Thinking…':'Analyze deeper'}</button></div>
      ${state.coachAI?`<div class="coach-ai-box"><strong>Deeper analysis</strong><p>${esc(state.coachAI.observation||'')}</p><p><strong>Limitations:</strong> ${esc(state.coachAI.limitations||'No additional limitations stated.')}</p></div>`:''}
      ${state.coachExpanded?`<div class="evidence-box"><p><strong>How this was generated:</strong> ZEKE used only your recorded sessions for ${esc(x.name)} and applied conservative progression heuristics. AI may interpret patterns but cannot alter the record. This is training decision support, not medical clearance.</p>${EVIDENCE.map(e=>`<div class="evidence-row"><span>${esc(e.title)} (${e.year})</span><a href="https://pubmed.ncbi.nlm.nih.gov/${e.pmid}/" target="_blank" rel="noopener">PubMed</a></div>`).join('')}</div>`:''}
    </section>`;
  }

  function openQuestions() { return state.factors.filter(f=>f.type==='clarification_question'&&!['resolved','dismissed','unknown','deferred'].includes(f.status)).sort((a,b)=>priorityWeight(b.priority)-priorityWeight(a.priority)); }
  function priorityWeight(p){return ({critical:4,high:3,medium:2,low:1}[p]||1)}

  async function runDeeperCoachAnalysis() {
    const x=coachInsight(); if(!x || state.coachAILoading) return;
    state.coachAILoading=true; render();
    try {
      const factors=state.factors.filter(f=>['personal_history','family_history','injury_context','goal'].includes(f.type)).map(f=>({type:f.type,relation:f.relation,summary:f.summary||f.answer})).slice(0,20);
      state.coachAI=await ZekeAIRouter.analyzeCoach({exercise:x.name,sessions:x.sessions.slice(-12).map(v=>({date:v.date,weight:v.weight,reps:v.reps,sets:v.sets,rpe:v.rpe||null,pain:v.pain||null})),relevant_context:factors,evidence:EVIDENCE});
    } catch(e) { showToast(`Deeper coaching analysis unavailable: ${e.message}`,'error'); }
    finally { state.coachAILoading=false; render(); }
  }

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
    const trend=trendPanelHTML();
    return `<div class="dashboard-grid">
      <div class="conversation-zone">${conversationHTML()}</div>
      <div class="glance-zone">${healthGlanceHTML()}</div>
      ${trend?`<div class="trend-zone">${trend}</div>`:''}
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
    return `<div class="provider-grid ai-grid">${Object.values(defs).filter(d=>d.id!=='relay').map(def=>{const st=statusMap.get(def.id);return `<article class="provider-card ai-card ${st?.connected?'connected':''}" data-provider="${def.id}"><div class="provider-card-head"><span class="provider-icon">AI</span><div><strong>${esc(def.label)}</strong><span class="provider-status">${st?.connected?'Test passed this session':st?.hasSessionKey?'Configured · not tested':'Not connected'}</span></div></div>${def.id==='ollama'?'':`<label>API key<input type="password" data-ai-key="${def.id}" placeholder="Paste key for this session"></label>`}${def.requiresEndpoint?`<label>Endpoint<input type="url" data-ai-endpoint="${def.id}" value="${esc(st?.endpoint||'')}" placeholder="Secure relay or compatible endpoint URL"></label>`:''}<label>Model<input type="text" data-ai-model="${def.id}" value="${esc(st?.model||def.suggestedModels?.[0]||'')}" list="models-${def.id}" placeholder="Model ID"><datalist id="models-${def.id}">${(def.suggestedModels||[]).map(m=>`<option value="${esc(m)}"></option>`).join('')}</datalist></label><div class="card-actions"><button class="secondary" data-save-ai="${def.id}">Connect & test</button><button class="text-action" data-test-ai="${def.id}">Test</button></div><small>ZEKE’s router chooses among connected services automatically for each task.</small></article>`}).join('')}</div>`;
  }

  function settingsPageHTML() {
    return `<div class="page-head"><div><h1>Settings</h1><p>Connections and preferences. ZEKE's router and provider managers handle the technical choices.</p></div></div>
      <section class="panel settings-section"><div class="section-head"><div><h2>Storage</h2><p>Choose where ZEKE keeps your workspace. Normal launches should reconnect silently when the provider allows it.</p></div></div>${storageCardsHTML()}<div class="settings-actions"><button class="secondary" id="reconnectStorage">Reconnect storage</button><button class="text-action danger" id="forgetStorage">Disconnect & forget setup</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>AI Connections</h2><p>Connect and test services. ZEKE's AI Router decides which available model to use based on task, privacy, availability, and free-first policy.</p></div><span class="badge">${(state.ai?.providers||[]).filter(x=>x.connected).length} connected</span></div>${aiConnectionCardsHTML()}<div class="manual-packet"><strong>Manual AI packet</strong><p>Export a structured packet for use with any external AI, then import the response back into ZEKE without treating it as raw fact.</p><div class="card-actions"><button class="secondary" id="exportAIPacket">Export packet</button><label class="secondary file-button">Import AI response<input type="file" id="importAIResponse" accept=".json,application/json" hidden></label></div><div id="aiImportStatus" class="status-line"></div></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Calendar connections</h2><p>Calendar providers are context sources. An event on a calendar does not prove that it happened.</p></div></div><div class="provider-grid"><article class="provider-card connected"><span class="provider-icon">▣</span><div><strong>Google Calendar</strong><p>Available with the current Google connection.</p><span class="provider-status">${state.storage?.providerId==='google-drive'?'Connected':'Available'}</span></div></article><article class="provider-card planned"><span class="provider-icon">◫</span><div><strong>Apple Calendar / iCloud</strong><p>CalDAV/ICS-compatible connector planned.</p><span class="provider-status">Planned</span></div></article><article class="provider-card planned"><span class="provider-icon">▤</span><div><strong>Outlook / Exchange</strong><p>Microsoft calendar connector planned.</p><span class="provider-status">Planned</span></div></article><article class="provider-card"><span class="provider-icon">ICS</span><div><strong>ICS import</strong><p>Import an exported calendar file as contextual history.</p><span class="provider-status">Coming next</span></div></article></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Import existing history</h2><p>Import XLSX, JSON, CSV, or TSV history. ZEKE preserves source provenance and checks for likely duplicates.</p></div></div><input type="file" id="importFile" accept=".xlsx,.json,.csv,.tsv,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"><div id="importStatus" class="status-line">${esc(state.importStatus||'')}</div>${state.importReport?`<div class="import-report"><strong>Latest import report</strong><div class="import-stats">${Object.entries(state.importReport.counts||{}).map(([k,v])=>`<span><b>${esc(v)}</b>${esc(k.replaceAll('_',' '))}</span>`).join('')}</div><p>${esc(state.importReport.message||'Dashboard data refreshed from accepted records.')}</p></div>`:''}</section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Appearance</h2><p>Choose Dark, Light, or follow your system setting.</p></div></div><div class="theme-buttons"><button class="secondary ${state.theme==='dark'?'active':''}" data-theme="dark">Dark</button><button class="secondary ${state.theme==='light'?'active':''}" data-theme="light">Light</button><button class="secondary ${state.theme==='system'?'active':''}" data-theme="system">System</button></div></section>
      <section class="panel about"><h2>About this build</h2><p><strong>ZEKE v${esc(BUILD.version)}</strong> · build ${esc(BUILD.build)}</p><p>${esc(BUILD.label||'Repair release')}</p></section>`;
  }

  function navHTML() {
    const items=[['dashboard','⌂','Dashboard'],['health','♡','Health'],['fitness','⌁','Fitness'],['medications','✚','Medications'],['labs','⌬','Labs & Vitals'],['calendar','▣','Calendar'],['settings','⚙','Settings']];
    return `<aside class="sidebar"><div class="brand"><div class="brand-mark">Z</div><div><strong>ZEKE</strong><span>Your context engine</span></div></div><nav>${items.map(([id,icon,label])=>`<button class="nav-item ${state.route===id?'active':''}" data-route="${id}"><span>${icon}</span>${esc(label)}</button>`).join('')}</nav><div class="sidebar-spacer"></div><div class="privacy-note">Your records stay with your chosen storage provider.</div><div class="build-label">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></aside>`;
  }

  function topbarHTML() {
    const greeting=new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
    return `<header class="topbar"><div><h1>${greeting}</h1><p>${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p></div>${state.route==='dashboard'?`<div class="range-tabs">${[['week','Week'],['month','Month'],['quarter','Quarter'],['6months','6 months'],['year','Year'],['all','All']].map(([id,label])=>`<button class="range ${state.range===id?'active':''}" data-range="${id}">${label}</button>`).join('')}</div><button class="secondary customize" id="customizeBtn">☷ Customize</button><button class="secondary mobile-preview" id="mobilePreviewBtn">📱 Mobile preview</button>`:''}<span class="top-build" title="Build ${esc(BUILD.build)}">v${esc(BUILD.version)}</span><div class="top-actions"><button class="icon-btn" title="Help">?</button><button class="icon-btn" title="Notifications">♢</button></div></header>`;
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
    if(reconnect) return `<div class="connection-screen"><div class="connect-card"><div class="brand-mark big">Z</div><h1>Restore your workspace</h1><p>ZEKE remembers that this browser uses ${esc(storage.providerId==='google-drive'?'Google Drive':storage.providerId||'your storage provider')}. Your workspace setup is preserved; you do not need to repeat onboarding.</p><button class="primary large" id="reconnectNow">Reconnect Google</button><button class="text-action" id="changeStorage">Choose a different storage provider</button><small>${storage.lastError?`Last connection message: ${esc(storage.lastError)}`:''}</small><div class="build-label center">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></div></div>`;
    return `<div class="connection-screen"><div class="connect-card wide"><div class="brand-mark big">Z</div><h1>Choose where ZEKE keeps your data</h1><p>Connect a user-owned storage provider. Google Drive is available in this alpha; the architecture is ready for additional adapters.</p>${storageCardsHTML()}<button class="primary large" data-connect-storage="google-drive">Connect Google Drive</button><div class="build-label center">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></div></div>`;
  }

  function loadingHTML(message='Starting ZEKE…') { return `<div class="loading-screen"><div class="brand-mark big">Z</div><div class="spinner"></div><p>${esc(message)}</p><div class="build-label center">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></div>`; }

  function render() {
    const root=$('#root'); if(!root)return;
    const existingDraft=$('#talkInput')?.value; if(existingDraft!=null) state.draft=existingDraft;
    const storage=ZekeData.snapshot(); state.storage=storage; state.ai=ZekeAIRouter.status(); state.route=routeFromHash();
    if(['booting','connecting','reconnecting'].includes(storage.status)) root.innerHTML=loadingHTML(storage.status==='reconnecting'?'Reconnecting to your workspace…':'Starting ZEKE…');
    else if(storage.status!=='connected') root.innerHTML=setupHTML(storage);
    else root.innerHTML=connectedAppHTML();
    bind();
    requestAnimationFrame(()=>{const t=$('#conversationThread'); if(t)t.scrollTop=t.scrollHeight; const input=$('#talkInput'); if(input && state.draft && !input.value) input.value=state.draft;});
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
    const aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);
    if(escalation||question) {
      try {
        const r=await ZekeAIRouter.ask(text,{task:escalation?'analysis':'chat',history:state.conversation.slice(0,-1)});
        pushZeke(r.text,{source:`${r.provider}/${r.model}`});
      } catch(e) { pushZeke(`I couldn't reach a connected AI service just now. I preserved your message, but I won't pretend I understood more than I did. ${e.message}`); }
      state.busy=false; render(); return;
    }

    let parsed=null;
    if(aiAvailable) {
      try {
        const verifiedContext={active_context:state.context,open_question:state.pending?.question?.question||null,actions:(state.actions.catalog||[]).map(a=>({label:a.label,schedule:a.schedule})),recent_verified_events:state.events.filter(e=>!['raw_input','correction'].includes(e.category)).slice(-30).map(e=>({category:e.category,timestamp:e.timestamp,structured:e.structured}))};
        const ai=await ZekeAIRouter.interpret(text,{...verifiedContext,history:state.conversation.slice(0,-1)});
        if(ai.status==='clarify'||ai.clarificationQuestion){state.pending={type:'ai-clarify',rawId:raw.id,rawText:text,ai};pushZeke(ai.clarificationQuestion||'I need one more detail before I save this.',{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});state.busy=false;render();return;}
        parsed={confidence:ai.confidence||0.8,summary:ai.summary||'the information you described',events:ai.events||[],aiSource:`${ai.provider}/${ai.model}`};
      } catch(e) { parsed=null; }
    }
    parsed ||= ZekeParser.interpret(text,state.context);
    if(parsed.type==='ambiguity') {
      state.pending={type:'ambiguity',rawId:raw.id,rawText:text};
      pushZeke("I'm not completely sure what you meant. Were you logging a blood-pressure reading, or a bench-press set?",{choices:[
        {label:'Blood pressure',value:'ambig-bp'},{label:'Bench press',value:'ambig-bench'},{label:'Later',value:'ambig-later'},{label:'Ignore',value:'ambig-ignore'}
      ]});
      state.busy=false;render();return;
    }

    if(!aiAvailable && ((parsed.confidence||0)<0.75 || parsed.type==='unstructured' || parsed.needsClarification)) {
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
      pushUser(text); render();
      const q=state.pending.question; await ZekeData.resolveFactor(q.id,'resolved',text); const applied=await applyQuestionAnswer(q,text); pushZeke(applied.message);state.pending=null;await refreshData();render();return true;
    }
    if(state.pending?.type==='history-correction-awaiting') {
      pushUser(text); render();
      const p=state.pending; const history=historyContextFromText(text); state.pending={type:'history-confirm',rawId:p.rawId,rawText:p.rawText,history};
      pushZeke(`Thanks. I now understand that as ${history.relation} health history: ${history.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'history-save'},{label:'Not quite',value:'history-correct'}]}); render(); return true;
    }
    if(state.pending?.type==='correction-awaiting') {
      pushUser(text); render();
      const original=state.pending; const parsed=ZekeParser.interpret(text,state.context);
      if((parsed.events||[]).length){state.pending={type:'confirm',rawId:original.rawId,rawText:original.rawText,parsed};pushZeke(`Thanks. I now understand it as ${parsed.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'}]});render();return true;}
    }
    if(['needs-detail','ai-clarify'].includes(state.pending?.type)) {
      pushUser(text); render();
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
    pushUser(text); render();
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
    const get=(...keys)=>{for(const k of keys){const nk=String(k).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');if(normalized[nk]!==undefined&&normalized[nk]!=='')return normalized[nk]}return null};
    const asNum=v=>{const cleaned=String(v??'').trim().replace(/,/g,'').replace(/[^0-9.+-]/g,'');if(!cleaned)return null;const n=Number(cleaned);return Number.isFinite(n)?n:null};
    const rawDate=get('date','datetime','timestamp','recorded_at','event_date','measurement_date','session_date','start_date');
    let timestamp=new Date().toISOString();
    if(rawDate!==null && rawDate!==undefined && rawDate!=='') {
      let d; const serial=Number(rawDate);
      if (Number.isFinite(serial) && serial>20000 && serial<80000) d=new Date((serial-25569)*86400*1000);
      else d=new Date(rawDate);
      if(!Number.isNaN(d.getTime())) timestamp=d.toISOString();
    }
    const sheetName=String(get('sheet','__sheet')||'');
    const source={source:'import',file:fileName,sheet:sheetName||undefined};
    const out=[];
    const addMetric=(id,value,unit,category='measurement',extra={})=>{const n=asNum(value);if(n!=null)out.push({category,timestamp,raw_text:'',structured:{metric_id:id,value:n,unit,interpretation_status:'confirmed',...extra},provenance:source})};

    // Long-form Measurements tables: Date | Category | Measurement | Value | Units.
    const measurementName=get('measurement','measurement_name','metric','metric_name');
    const measurementValue=asNum(get('value','measurement_value','metric_value'));
    if(measurementName && measurementValue!=null) {
      const id=canonicalMetric(String(measurementName));
      const categoryText=String(get('category','measurement_category')||'').toLowerCase();
      const category=categoryText.includes('lab')?'lab':'measurement';
      out.push({category,timestamp,raw_text:'',structured:{metric_id:id,value:measurementValue,unit:String(get('units','unit')||''),measurement_name:String(measurementName),conditions:get('conditions'),notes:get('notes'),interpretation_status:'confirmed'},provenance:source});
      return out;
    }

    // Strength Training / Exercise Sets tables.
    const exercise=get('exercise','exercise_name','movement','activity');
    const reps=asNum(get('reps','repetitions'));
    const sets=asNum(get('sets','set_count'));
    const workoutWeight=asNum(get('workout_weight','load','weight_lbs','weight_lb','weight'));
    if(exercise && (reps!=null||sets!=null||workoutWeight!=null)) {
      out.push({category:'workout',timestamp,raw_text:'',structured:{
        exercise:String(exercise).trim().toLowerCase(),workout_id:get('workout_id','session_id'),set_number:asNum(get('set','set_number','set_no')),
        weight:workoutWeight,weight_unit:String(get('weight_unit','weight_units','units','unit')||(workoutWeight!=null?'lb':'')),reps,sets,
        rpe:asNum(get('rpe','rpe_1_10','effort')),pain:asNum(get('pain','pain_score','pain_0_10')),
        muscle_group:get('muscle_group'),equipment:get('equipment','machine_or_modality'),notes:get('notes'),
        duration_min:asNum(get('duration_min','minutes','duration')),distance_mi:asNum(get('distance_mi','miles','distance')),interpretation_status:'confirmed'
      },provenance:source});
      return out;
    }

    // Session-level workout/cardio rows such as Workout_Log and Cardio tabs.
    const duration=asNum(get('duration_min','cardio_min','cardio_minutes','minutes','duration'));
    const steps=asNum(get('cardio_steps','steps','step_count'));
    const distance=asNum(get('distance_mi','miles','distance'));
    const activity=get('activity','cardio_type','modality','machine_or_modality');
    const notes=String(get('subjective_notes','notes','other_notes')||'');
    const cardioLike=/cardio|workout_log|workout log/i.test(sheetName) || activity || duration!=null || steps!=null || distance!=null;
    if(cardioLike && (duration!=null||steps!=null||distance!=null)) {
      let name=String(activity||'cardio').toLowerCase();
      if(!activity && /stair|climb/i.test(notes)) name='stairclimber';
      else if(!activity && /walk/i.test(notes)) name='walking';
      else if(!activity && /bike|cycle/i.test(notes)) name='cycling';
      out.push({category:'workout',timestamp,raw_text:notes,structured:{exercise:name,workout_id:get('workout_id','session_id'),duration_min:duration,steps,distance_mi:distance,notes,shoulder_status:get('shoulder_status'),interpretation_status:'confirmed'},provenance:source});
    }

    // Wide daily/measurement tables.
    addMetric('weight',get('body_weight','bodyweight','weight_lbs','weight_lb','weight'),'lb');
    addMetric('body_fat_pct',get('body_fat','body_fat_pct','body_fat_percentage'),'%');
    addMetric('waist_circumference',get('waist','waist_in','waist_inches'),'in');
    addMetric('resting_hr',get('resting_hr','resting_heart_rate','rhr'),'bpm');
    addMetric('a1c',get('a1c','hba1c','hemoglobin_a1c'),'%','lab');
    addMetric('ldl',get('ldl','ldl_cholesterol','ldl_direct_measure'),'mg/dL','lab');
    addMetric('steps',get('steps','step_count'),'steps');
    addMetric('sleep_duration',get('sleep_duration','sleep_hours','hours_slept'),'hr');
    addMetric('energy',get('energy','energy_1_10'),'1-10');
    addMetric('appetite',get('appetite','appetite_1_10','hunger','hunger_1_10'),'1-10');
    addMetric('protein_g',get('protein','protein_g'),'g');
    addMetric('calories',get('calories','calorie_estimate'),'kcal');
    addMetric('water_oz',get('water','water_oz'),'oz');
    addMetric('bp_systolic',get('systolic','bp_systolic','systolic_bp','blood_pressure_systolic'),'mmHg');
    addMetric('bp_diastolic',get('diastolic','bp_diastolic','diastolic_bp','blood_pressure_diastolic'),'mmHg');

    // Common long-form Lab sheet: Date | Test | Result | Unit.
    const labName=get('test','test_name','lab_test','analyte','marker');
    const labResult=asNum(get('result','lab_result','test_result'));
    if(labName && labResult!=null) {
      const metric=canonicalMetric(String(labName));
      out.push({category:'lab',timestamp,raw_text:'',structured:{metric_id:metric,value:labResult,unit:String(get('unit','units')||''),test_name:String(labName),reference_range:get('reference_range','range'),notes:get('notes'),interpretation_status:'confirmed'},provenance:source});
    }

    // Medication administrations and medication history rows.
    const medication=get('medication','medication_name','drug','medicine','name');
    const dose=asNum(get('dose','dose_amount','dose_mg'));
    if(medication && (/medication/i.test(sheetName)||get('route')||dose!=null)) {
      const explicitStatus=get('status','taken_status');
      const administrationLike=/medication/i.test(sheetName) && rawDate && dose!=null;
      out.push({category:'medication',timestamp,raw_text:'',structured:{medication_name:String(medication),dose,unit:String(get('dose_unit','units','unit')||''),route:get('route'),site:get('site'),side_effects:get('side_effects'),next_dose_date:get('next_dose_date'),status:String(explicitStatus||(administrationLike?'taken':'recorded')).toLowerCase(),notes:get('notes'),interpretation_status:'confirmed'},provenance:source});
    }

    // Supplements tables.
    const supplement=get('supplement','supplement_name');
    if(supplement) out.push({category:'supplement',timestamp,raw_text:'',structured:{supplement_name:String(supplement),dose:asNum(get('dose','dose_amount')),unit:String(get('unit','units')||''),frequency:get('frequency'),reason:get('reason','reason_goal'),status:get('status','start_stop')||'recorded',side_effects:get('side_effects'),notes:get('notes'),interpretation_status:'confirmed'},provenance:source});

    // Injury / pain tables.
    const bodyArea=get('body_area','injury_pain_area','pain_area');
    const issue=get('injury_issue','diagnosis_event','issue','diagnosis');
    const injuryPain=asNum(get('pain_0_10','pain_score','pain'));
    if(bodyArea||issue||(/injur|pain/i.test(sheetName)&&injuryPain!=null)) out.push({category:'injury',timestamp,raw_text:'',structured:{body_area:bodyArea||'',issue:issue||'',pain:injuryPain,rom_function:get('rom_function','rom_limitation_0_10'),restrictions:get('restrictions'),pt_exercises:get('pt_exercises','treatment_pt'),status:get('status')||'recorded',impact_on_training:get('impact_on_training','activity_limitation'),notes:get('notes'),interpretation_status:'confirmed'},provenance:source});

    // Preserve meaningful daily notes and explicit positive symptom observations.
    const noteText=get('other_notes','notes');
    if(noteText && !out.some(x=>x.raw_text===String(noteText))) out.push({category:'note',timestamp,raw_text:String(noteText),structured:{note_type:'daily_note',text:String(noteText),interpretation_status:'confirmed'},provenance:source});
    const positive=v=>/^(y|yes|true|1|present)$/i.test(String(v||'').trim());
    for(const [field,label] of [['nausea','nausea'],['loose_stool','loose stool'],['dizziness','dizziness']]) if(positive(get(field))) out.push({category:'symptom',timestamp,raw_text:'',structured:{symptom:label,present:true,interpretation_status:'confirmed'},provenance:source});
    return out;
  }

  async function handleImport(file) {
    const status=$('#importStatus'); state.importStatus='Reading file…'; if(status)status.textContent=state.importStatus;
    try {
      const lowerName=file.name.toLowerCase(); let rows=[]; let historyPackage=null;
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
          const parsed=JSON.parse(text);
          if(!Array.isArray(parsed) && (parsed.events||parsed.factors||parsed.discoveries||parsed.actions||parsed.conversation)) historyPackage=parsed;
          rows=Array.isArray(parsed)?parsed:(parsed.events||[]);
        } else {
          const delimiter=lowerName.endsWith('.tsv')?'\t':','; const lines=text.split(/\r?\n/).filter(Boolean); const headers=parseDelimited(lines[0],delimiter);
          rows=lines.slice(1).map(line=>{const vals=parseDelimited(line,delimiter);return Object.fromEntries(headers.map((h,i)=>[h,vals[i]??'']))});
        }
      }

      if(historyPackage) await ZekeData.mergeHistoryPackage(historyPackage,{source:'json-history-package',file:file.name});

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

      if(!candidates.length && !historyPackage) throw new Error('No safely interpretable records were found. The file was not imported.');

      // Hold suspicious BP pairs for clarification rather than graphing them as verified.
      const suspiciousIds=new Set(); const bpByTime=new Map();
      candidates.forEach((c,i)=>{const mid=canonicalMetric(metricId(c));if(['bp_systolic','bp_diastolic'].includes(mid)){const key=String(c.timestamp||'').slice(0,16);if(!bpByTime.has(key))bpByTime.set(key,{});bpByTime.get(key)[mid]={c,i};}});
      let needsClarification=0;
      for(const pair of bpByTime.values()){
        const sys=pair.bp_systolic?.c?.structured?.value, dia=pair.bp_diastolic?.c?.structured?.value;
        if(Number.isFinite(Number(sys))&&Number.isFinite(Number(dia))&&Number(sys)<=Number(dia)){
          suspiciousIds.add(pair.bp_systolic.i); suspiciousIds.add(pair.bp_diastolic.i); needsClarification++;
          await ZekeData.saveFactor({type:'clarification_question',status:'open',priority:'high',question_key:`import_bp:${crypto.randomUUID()}`,question:`I found a blood-pressure pair that looks unusual: ${sys}/${dia}. Are those values in the correct order, or should I correct them?`,why_it_matters:'I do not want to graph a potentially reversed blood-pressure reading as verified data.',import_candidate:{systolic:sys,diastolic:dia,timestamp:pair.bp_systolic.c.timestamp,provenance:pair.bp_systolic.c.provenance}});
        }
      }

      let imported=0, duplicateReviews=0; const counts={};
      for(let i=0;i<candidates.length;i++) {
        if(suspiciousIds.has(i)) continue;
        const c=candidates[i]; const dupes=await ZekeData.findLikelyDuplicates(c);
        if(dupes.length){
          duplicateReviews++;
          await ZekeData.saveFactor({type:'clarification_question',status:'open',priority:'medium',question_key:`duplicate_import:${crypto.randomUUID()}`,question:`I found an imported entry that looks very similar to an existing record: ${humanEvent(c)}. Was this a separate real event, or an accidental duplicate?`,why_it_matters:'Keeping true repeated events matters, but accidental duplicates can distort trends.',candidate_event:c,existing_event_id:dupes[0].event.id});
          continue;
        }
        await ZekeData.addEvent({...c,provenance:{...(c.provenance||{}),source:'import',file:file.name}}); imported++; counts[c.category]=(counts[c.category]||0)+1;
      }
      const report={file:file.name,counts:{rows_read:rows.length,records_imported:imported,duplicate_reviews:duplicateReviews,needs_clarification:needsClarification,...counts},message:'Accepted records are now part of the ZEKE event repository and available to the dashboard, Health at a Glance, Coach’s Eye, and discoveries.'};
      await ZekeData.saveImportBatch({type:'file-import',...report});
      state.importReport=report; state.importStatus=`Imported ${imported} record${imported===1?'':'s'}; ${duplicateReviews} possible duplicate${duplicateReviews===1?'':'s'} held for review; ${needsClarification} item${needsClarification===1?'':'s'} need clarification.`;
      if(status)status.textContent=state.importStatus;
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
    $('#deeperCoachAI')?.addEventListener('click',runDeeperCoachAnalysis);
    $$('[data-theme]').forEach(el=>el.onclick=async()=>{state.theme=el.dataset.theme;document.documentElement.dataset.theme=state.theme;state.preferences={...state.preferences,theme:state.theme};await ZekeData.savePreferences(state.preferences);render()});
    $('#mobilePreviewBtn')?.addEventListener('click',()=>{document.body.classList.toggle('mobile-preview-mode');render()});
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

    $$('[data-save-ai]').forEach(el=>el.onclick=async()=>{const id=el.dataset.saveAi;const key=$(`[data-ai-key="${id}"]`)?.value.trim();const model=$(`[data-ai-model="${id}"]`)?.value;const endpoint=$(`[data-ai-endpoint="${id}"]`)?.value.trim();try{await ZekeAIRouter.configure({provider:id,key,model,endpoint,privacy:'minimum-necessary'});const r=await ZekeAIRouter.testProvider(id);state.ai=ZekeAIRouter.status();showToast(`Connection test passed: ${r.provider} · ${r.model}`);render()}catch(e){state.ai=ZekeAIRouter.status();showToast(`Connection failed: ${e.message}`,'error');render()}});
    $$('[data-test-ai]').forEach(el=>el.onclick=async()=>{const id=el.dataset.testAi;try{const key=$(`[data-ai-key="${id}"]`)?.value.trim();const model=$(`[data-ai-model="${id}"]`)?.value;const endpoint=$(`[data-ai-endpoint="${id}"]`)?.value.trim();if(key||endpoint||id==='ollama')await ZekeAIRouter.configure({provider:id,key,model,endpoint,privacy:'minimum-necessary'});const r=await ZekeAIRouter.testProvider(id);showToast(`Connection test passed: ${r.provider} · ${r.model}`);state.ai=ZekeAIRouter.status();render()}catch(e){showToast(`Test failed: ${e.message}`,'error')}});

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
