(() => {
  'use strict';

  const BUILD = window.ZEKE_BUILD || { version:'0.7.0', build:'unknown' };
  const state = {
    route:'dashboard', range:'month', selectedMetric:'weight',
    events:[], factors:[], discoveries:[], actions:{catalog:[],daily_states:{}}, calendar:[],
    conversation:[], pending:null, context:{}, storage:null, ai:null,
    coachExpanded:false, coachFocus:'', coachAlertDismissed:{}, customizeOpen:false, metricMenuOpen:false,
    hiddenWidgets:new Set(), busy:false, importStatus:'', importReport:null, importBatches:[],
    conversationLoaded:false, preferences:{}, syncSource:null, syncBusy:false, syncReport:null, coachAI:null, coachAILoading:false, theme:'light', draft:'', auditQuery:'', auditCategory:'all', insightRefreshAt:null, deferredRender:false, activeDate:localStorage.getItem('zeke-active-date')||'', directExercise:null
  };

  const RANGE_DAYS = { week:7, month:31, quarter:92, '6months':183, year:366, all:null };
  const METRICS = {
    weight:{label:'Weight',unit:'lb', icon:'⚖️'}, blood_pressure:{label:'Blood pressure',unit:'mmHg', icon:'❤'},
    a1c:{label:'A1c',unit:'%', icon:'◈'}, resting_hr:{label:'Resting HR',unit:'bpm', icon:'♥'},
    sleep_duration:{label:'Sleep',unit:'hr', icon:'☾'}, steps:{label:'Steps',unit:'steps', icon:'◌'},
    ldl:{label:'LDL cholesterol',unit:'mg/dL', icon:'⬡'}, hdl:{label:'HDL cholesterol',unit:'mg/dL',icon:'⬢'},
    triglycerides:{label:'Triglycerides',unit:'mg/dL',icon:'◆'}, total_cholesterol:{label:'Total cholesterol',unit:'mg/dL',icon:'◇'},
    apob:{label:'ApoB',unit:'mg/dL',icon:'⬡'}, lpa:{label:'Lp(a)',unit:'mg/dL',icon:'◉'},
    glucose:{label:'Glucose',unit:'mg/dL',icon:'◫'}, average_glucose:{label:'Avg. glucose',unit:'mg/dL',icon:'▥'},
    body_fat_pct:{label:'Body fat',unit:'%',icon:'◐'}, waist_circumference:{label:'Waist',unit:'in',icon:'↔'},
    protein_g:{label:'Protein',unit:'g',icon:'P'}, cardio_minutes:{label:'Cardio',unit:'min',icon:'◴'}, pain_score:{label:'Pain',unit:'/10',icon:'!'}
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
  const activeDay = () => state.activeDate || localDay();
  const activeDateLabel = () => state.activeDate ? new Date(`${state.activeDate}T12:00:00`).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}) : 'Today';
  function setActiveDate(value=''){ state.activeDate=value||''; try{ value?localStorage.setItem('zeke-active-date',value):localStorage.removeItem('zeke-active-date'); }catch(_){} state.context={...state.context,active_date:activeDay()}; render(); }

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
      'calendar':'calendar','questions':'questions','clarifications':'questions','settings':'settings','data-integrity':'data-integrity','system/data-integrity':'data-integrity'
    };
    return map[h] || 'dashboard';
  }

  function go(route) {
    const hashes = {dashboard:'health/dashboard',health:'health',fitness:'fitness',medications:'medications',labs:'labs',calendar:'calendar',questions:'questions',settings:'settings','data-integrity':'data-integrity'};
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
    state.syncSource=await ZekeData.getSyncSource();
    state.theme=state.preferences.theme || state.theme || 'light';
    try {
      if (!localStorage.getItem('zeke-v0160-light-migration')) {
        state.theme='light';
        state.preferences={...state.preferences,theme:'light'};
        localStorage.setItem('zeke-v0160-light-migration','1');
        ZekeData.savePreferences(state.preferences);
      }
    } catch (_) {}
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

  function semanticCategory(e) {
    const st=e?.structured||{};
    const raw=[e?.category,e?.type,st.category,st.type,st.event_type,st.record_type,st.domain].filter(Boolean).join(' ').toLowerCase();
    if(/workout|exercise|fitness|strength|resistance|cardio|training/.test(raw)) return 'workout';
    if(/lab|laboratory|bloodwork|blood test|panel|lipid/.test(raw)) return 'lab';
    if(/medication|medicine|drug|supplement|dose|injection/.test(raw)) return 'medication';
    if(/measurement|vital|weight|blood pressure|sleep|steps|heart rate/.test(raw)) return 'measurement';
    return String(e?.category||e?.type||'uncategorized').toLowerCase().replace(/[^a-z0-9]+/g,'_');
  }

  function metricId(e) {
    const st=e?.structured||{};
    const candidate=st.metric_id||st.metricId||st.metric||st.test_id||st.test_name||st.analyte||st.lab_name||st.measurement||st.name||st.label||st.title||e?.metric_id||e?.name||'';
    return String(candidate).toLowerCase().trim().replace(/\s+/g,'_');
  }

  function metricValue(e) {
    const st=e?.structured||{};
    const candidates=[st.value,st.result,st.measurement_value,st.numeric_value,st.result_value,st.amount,e?.value,e?.result];
    for(const v of candidates){
      if(Number.isFinite(Number(v))) return Number(v);
      if(typeof v==='string'){ const m=v.replace(/,/g,'').match(/-?\d+(?:\.\d+)?/); if(m) return Number(m[0]); }
    }
    return null;
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

  function suspectedArtifact(e) {
    const raw=String(e?.raw_text||'').toLowerCase();
    const file=String(e?.provenance?.file||'').toLowerCase();
    const metric=canonicalMetric(metricId(e));
    if ((metric==='bp_systolic'||metric==='bp_diastolic') && /normal\s*80\s*[-–]\s*100/.test(raw) && /sjn1\.xlsx/.test(file)) return {code:'reference-range-as-bp',reason:'Reference-range text was imported as blood pressure.'};
    if (/i see a blood pressure reading of 80\/100[. ]*clarification:/i.test(String(e?.raw_text||'')) && semanticCategory(e)==='workout') return {code:'clarification-context-leak',reason:'Clarification text leaked into workout raw evidence.'};
    return null;
  }

  function integrityIssues() {
    return state.events.map(e=>({event:e,issue:suspectedArtifact(e)})).filter(x=>x.issue);
  }

  function allMetricSeries(id) {
    return state.events.filter(e=>['measurement','lab'].includes(semanticCategory(e)) && !suspectedArtifact(e)).map(e=>{
      const cid=canonicalMetric(metricId(e)); const value=metricValue(e); const s=e.structured||{};
      return {id:e.id,metric:cid,value,unit:s.unit||s.value_unit||'',date:e.timestamp||e.recorded_at,source:e.provenance?.source||s.source||'ZEKE'};
    }).filter(p=>p.metric===id && p.value!=null && Number.isFinite(new Date(p.date).getTime())).sort((a,b)=>new Date(a.date)-new Date(b.date)).filter((p,i,a)=>i===0 || !(p.id===a[i-1].id && p.value===a[i-1].value && p.date===a[i-1].date));
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
    const known=Object.keys(METRICS).filter(id=>id==='blood_pressure'?(bloodPressureSeries(true).sys.length&&bloodPressureSeries(true).dia.length):allMetricSeries(id).length);
    const discovered=[...new Set(state.events.filter(e=>['measurement','lab'].includes(semanticCategory(e))).map(e=>canonicalMetric(metricId(e))).filter(Boolean))]
      .filter(id=>METRICS[id] && !known.includes(id));
    return [...known,...discovered];
  }

  function miniSpark(points, id) {
    if(points.length<2) return '';
    const clean=points.filter(p=>Number.isFinite(Number(p.value))&&Number.isFinite(new Date(p.date).getTime()));
    if(clean.length<2) return '';
    const w=160,h=48,p=4, vals=clean.map(x=>Number(x.value)), min=Math.min(...vals),max=Math.max(...vals),span=max-min||1;
    const times=clean.map(x=>new Date(x.date).getTime()), t0=Math.min(...times), t1=Math.max(...times), tspan=t1-t0||1;
    const xy=clean.map((x,i)=>[p+(w-2*p)*(times[i]-t0)/tspan,h-p-(h-2*p)*(Number(x.value)-min)/span]);
    const d=xy.map((q,i)=>(i?'L':'M')+q.join(' ')).join(' ');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(METRICS[id]?.label||id)} verified trend"><path d="${d}"/>${xy.map((q,i)=>`<circle tabindex="0" cx="${q[0]}" cy="${q[1]}" r="3.2" data-tip="${esc(fmtDate(clean[i].date,{month:'short',day:'numeric',year:'numeric'}))}: ${esc(clean[i].value)} ${esc(clean[i].unit||METRICS[id]?.unit||'')}"/>`).join('')}</svg>`;
  }

  function metricNarrative(id, points) {
    const meta=METRICS[id]||{label:id};
    if(!points.length) return `ZEKE has no verified ${meta.label.toLowerCase()} observations to interpret.`;
    if(points.length===1) return `ZEKE has one verified ${meta.label.toLowerCase()} observation. That is enough to report the value, but not enough to infer a trend.`;
    const first=points[0], last=points.at(-1), diff=Number(last.value)-Number(first.value);
    const days=Math.max(1,Math.round((new Date(last.date)-new Date(first.date))/864e5));
    const direction=Math.abs(diff)<1e-9?'stable':diff>0?'higher':'lower';
    return `${meta.label} is ${direction} by ${Math.abs(diff).toFixed(Math.abs(diff)<1?1:0)} ${last.unit||meta.unit||''} across ${points.length} verified observations over ${days} day${days===1?'':'s'}. This is a descriptive summary of your recorded data, not a clinical conclusion.`;
  }

  function openMetricDetail(id) {
    const points=id==='blood_pressure'?bloodPressureSeries(true).sys:allMetricSeries(id);
    const latest=latestMetric(id), meta=METRICS[id]||{label:id,unit:''};
    let overlay=$('#metricDetailOverlay');
    if(!overlay){overlay=document.createElement('div');overlay.id='metricDetailOverlay';overlay.className='metric-detail-overlay';document.body.appendChild(overlay);}
    const rows=points.slice().reverse().slice(0,20).map(p=>`<tr><td>${esc(fmtDate(p.date,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${esc(p.value)} ${esc(p.unit||meta.unit||'')}</td><td>${esc(p.source||'ZEKE')}</td></tr>`).join('');
    overlay.innerHTML=`<section class="metric-detail" role="dialog" aria-modal="true" aria-label="${esc(meta.label)} details"><button class="metric-detail-close" aria-label="Close">×</button><h2>${esc(meta.label)}</h2><p class="metric-detail-current">Latest verified value: <strong>${esc(latest?.value??'—')} ${esc(latest?.unit||meta.unit||'')}</strong></p><p>${esc(metricNarrative(id,points))}</p><div class="metric-detail-chart">${trendChartSVG(id)}</div><h3>Underlying verified observations</h3><div class="metric-detail-table-wrap"><table><thead><tr><th>Date</th><th>Value</th><th>Source</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No verified observations.</td></tr>'}</tbody></table></div></section>`;
    overlay.classList.add('show');
    overlay.querySelector('.metric-detail-close')?.addEventListener('click',()=>overlay.classList.remove('show'));
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('show')},{once:true});
    bindTooltips();
  }

  function metricCard(id) {
    const meta=METRICS[id], latest=latestMetric(id); if(!latest) return '';
    const delta=metricDelta(id); let points=id==='blood_pressure'?bloodPressureSeries().sys:metricSeries(id); if(points.length<2) points=id==='blood_pressure'?bloodPressureSeries(true).sys:allMetricSeries(id); if(points.length>60){const keep=[points[0]];const step=(points.length-1)/58;for(let i=1;i<59;i++)keep.push(points[Math.round(i*step)]);keep.push(points.at(-1));points=keep;}
    let deltaText='Latest verified observation';
    if(delta!=null) deltaText=`${delta>0?'↑':'↓'} ${Math.abs(delta).toFixed(Math.abs(delta)<1?1:0)} ${latest.unit||meta.unit} over range`;
    return `<article class="metric-card metric-${id}" data-metric="${id}">
      <div class="metric-head"><span class="metric-icon">${meta.icon}</span><span>${esc(meta.label)}</span><button class="icon-btn metric-more" aria-label="More options">⋮</button></div>
      <div class="metric-number">${esc(latest.value)} <small>${esc(latest.unit||meta.unit)}</small></div>
      <div class="metric-change">${esc(deltaText)}</div><div class="metric-open-hint">Open analysis →</div>
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

  function isWorkoutEvent(e) {
    const category=String(e?.category||e?.type||'').toLowerCase().replace(/[\s-]+/g,'_');
    const st=e?.structured||{};
    const subtype=String(st.category||st.type||st.event_type||st.record_type||'').toLowerCase().replace(/[\s-]+/g,'_');
    const categoryMatch=['workout','workouts','exercise','exercise_set','exercise_sets','fitness','strength_training','resistance_training','cardio','training_session'].includes(category)
      || ['workout','exercise','exercise_set','exercise_sets','fitness','strength_training','resistance_training','cardio','training_session'].includes(subtype);
    const exerciseName=st.exercise||st.exercise_name||st.movement||st.activity||st.session_type||st.workout_type;
    const workoutFields=st.workout_id||st.session_id||st.set_number!=null||st.sets!=null||st.reps!=null||st.weight!=null||st.load!=null||st.duration_min!=null||st.steps!=null||st.distance_mi!=null;
    const raw=String(e?.raw_text||e?.summary||'').toLowerCase();
    const rawMatch=/\b(workout|strength training|resistance training|stairclimber|stair climber|lat pulldown|seated row|leg curl|leg extension|bicep curl|abdominal|sets?\s*[x×]|reps?)\b/.test(raw);
    return categoryMatch || Boolean(exerciseName && workoutFields) || rawMatch;
  }

  function workoutStructured(e) {
    const st=e?.structured||{};
    return {
      ...st,
      exercise: st.exercise||st.exercise_name||st.movement||st.activity||st.session_type||st.workout_type||'Workout',
      weight: st.weight??st.load??st.weight_lbs??st.weight_lb??null,
      reps: st.reps??st.repetitions??null,
      sets: st.sets??st.set_count??null,
      duration_min: st.duration_min??st.duration_minutes??st.minutes??null,
      steps: st.steps??null,
      distance_mi: st.distance_mi??st.distance??null
    };
  }

  function hasMeaningfulWorkout(e){ const w=workoutStructured(e); return Boolean((w.exercise&&w.exercise!=='Workout')||w.weight!=null||w.reps!=null||w.sets!=null||w.duration_min!=null||w.steps!=null||w.distance_mi!=null||String(w.notes||'').trim()); }

  function workoutGroups() {
    // Normalize summarized rows and one-row-per-set imports into exercise sessions.
    const byExercise=new Map();
    for(const e of state.events.filter(isWorkoutEvent)) {
      const s=workoutStructured(e);
      const name=(s.exercise||s.session_type||s.exercise_name||'').trim();
      if(!name) continue;
      const day=localDay(new Date(e.timestamp||e.recorded_at||Date.now()));
      const sessionKey=String(s.workout_id||s.session_id||`${day}:${name.toLowerCase()}`);
      if(!byExercise.has(name)) byExercise.set(name,new Map());
      const sessions=byExercise.get(name);
      const prev=sessions.get(sessionKey)||{event:e,date:e.timestamp,weight:0,reps:0,sets:0,rpe:0,pain:0,duration_min:0,steps:0,workout_id:s.workout_id||''};
      const weight=Number(s.weight||s.load||0), reps=Number(s.reps||0), sets=Number(s.sets||0);
      const setRows=Number(s.set_number||s.set_no||0)?1:0;
      sessions.set(sessionKey,{...prev,event:e,date:e.timestamp||prev.date,weight:Math.max(prev.weight,weight),reps:Math.max(prev.reps,reps),sets:prev.sets+(sets||setRows||1),rpe:Math.max(prev.rpe,Number(s.rpe||0)),pain:Math.max(prev.pain,Number(s.pain||0)),duration_min:Math.max(prev.duration_min,Number(s.duration_min||0)),steps:Math.max(prev.steps,Number(s.steps||0))});
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

  function coachOptions() {
    const names=[...workoutGroups().keys()].sort((a,b)=>a.localeCompare(b));
    const parts=new Map();
    for(const name of names){
      const n=name.toLowerCase(); let part='Other';
      if(/curl|bicep/.test(n))part='Arms'; else if(/row|pull|lat/.test(n))part='Back'; else if(/leg|glute|squat/.test(n))part='Legs'; else if(/chest|bench|press/.test(n))part='Chest'; else if(/shoulder|raise/.test(n))part='Shoulders'; else if(/ab|core/.test(n))part='Core'; else if(/stair|walk|bike|cardio/.test(n))part='Cardio';
      if(!parts.has(part))parts.set(part,[]);parts.get(part).push(name);
    }
    return {names,parts};
  }

  function coachInsightFor(name='') {
    if(!name) return coachInsight();
    const groups=workoutGroups(); const sessions=groups.get(name); if(!sessions?.length)return null;
    const recent=sessions.slice(-4),last=recent.at(-1),prev=recent.at(-2)||last;
    let title=`${name}: review your recent pattern.`,rationale='ZEKE is using only the sessions recorded for this exercise.',suggestion='Repeat the current setup and use reps, effort, pain, and technique to guide the next change.',score=40;
    if(last.pain>=4){title=`${name}: pain deserves attention before progression.`;rationale='The latest recorded pain is elevated.';suggestion='Hold progression and review technique, recovery, and clinician/PT guidance.';score=100}
    else if(last.weight&&prev.weight&&last.weight>prev.weight*1.10){title=`${name}: repeat the current load before another increase.`;rationale=`The most recent load increase was more than 10% (${prev.weight} → ${last.weight} lb).`;suggestion='Repeat the load and confirm that reps, effort, pain, and technique remain stable.';score=85}
    else if(recent.length>=3&&recent.slice(-3).every(x=>x.reps>=12&&(!x.rpe||x.rpe<=8)&&(!x.pain||x.pain<=2))){title=`${name} may be ready for a small increase.`;rationale='Recent sessions show repeated high-rep performance without high recorded RPE or pain.';suggestion='Consider a small increase while preserving technique and joint comfort.';score=80}
    return {name,sessions,recent,last,score,title,rationale,suggestion};
  }

  function coachHTML() {
    const opts=coachOptions();
    if(!state.coachFocus && opts.names.length) state.coachFocus=opts.names.at(-1);
    const selected=coachInsightFor(state.coachFocus);
    const timely=coachInsight();
    const alertKey=timely?`${timely.name}|${timely.title}`:'';
    const showAlert=timely && !state.coachAlertDismissed[alertKey] && (!selected || timely.name!==selected.name || timely.score>=85);
    const chooser=`<div class="coach-chooser"><label>Focus on <select id="coachFocus"><option value="">Choose an exercise</option>${[...opts.parts.entries()].map(([part,names])=>`<optgroup label="${esc(part)}">${names.map(n=>`<option value="${esc(n)}" ${n===state.coachFocus?'selected':''}>${esc(n)}</option>`).join('')}</optgroup>`).join('')}</select></label></div>`;
    if(!selected) return `<section class="panel coach-panel"><div class="section-head"><div><div class="coach-badge">🏋 Coach's Eye</div><h2>Choose what you want coaching on</h2><p>Review an exercise or body area instead of keeping one movement permanently pinned.</p></div></div>${chooser}<div class="empty-inline">More repeated workout history will unlock specific guidance.</div></section>`;
    return `<section class="panel coach-panel">${showAlert?`<div class="timely-coach-alert"><div><span>Timely before your next workout</span><strong>${esc(timely.title)}</strong><p>${esc(timely.suggestion)}</p></div><button class="icon-btn" data-dismiss-coach-alert="${esc(alertKey)}" aria-label="Dismiss coaching alert">×</button></div>`:''}<div class="section-head"><div><div class="coach-badge">🏋 Coach's Eye</div><h2>On-demand training feedback</h2><p>Select the exercise you want ZEKE to analyze.</p></div>${chooser}</div>
      <div class="coach-top"><div><h2>${esc(selected.title)}</h2><p>${esc(selected.rationale)}</p></div><span class="insight-tag">${esc(selected.name)}</span></div>
      <div class="coach-grid"><div class="coach-stats"><div><strong>${selected.last.weight||'—'}${selected.last.weight?' lb':''}</strong><span>Latest load</span></div><div><strong>${selected.last.rpe||'Not logged'}</strong><span>Latest RPE</span></div><div><strong>${selected.last.pain||0}/10</strong><span>Recorded pain</span></div></div><div>${coachChart(selected)}</div></div>
      <div class="coach-rec"><strong>ZEKE's observation</strong><p>${esc(state.coachAI?.recommendation || selected.suggestion)}</p></div>
      <div class="coach-actions"><button class="text-action" id="toggleCoachEvidence">${state.coachExpanded?'Hide evidence':'View reasoning & evidence'}</button><button class="secondary" id="deeperCoachAI" ${state.coachAILoading?'disabled':''}>${state.coachAILoading?'Thinking…':'Analyze deeper'}</button></div>
      ${state.coachExpanded?`<div class="evidence-box"><p><strong>How this was generated:</strong> only the recorded sessions for ${esc(selected.name)} were used. Coach’s Eye is for training decisions; broader hypotheses belong in “I’ve been thinking…”.</p></div>`:''}
    </section>`;
  }

  function openQuestions() { return state.factors.filter(f=>f.type==='clarification_question'&&!['resolved','dismissed','unknown','deferred'].includes(f.status)).sort((a,b)=>priorityWeight(b.priority)-priorityWeight(a.priority)); }
  function priorityWeight(p){return ({critical:4,high:3,medium:2,low:1}[p]||1)}
  function reviewTaskKey(q){
    const text=`${q.question_key||''} ${q.question||''} ${q.why_it_matters||''}`.toLowerCase();
    if(/workout|exercise|fitness|training|cardio/.test(text)) return 'workout-review';
    if(/sleep/.test(text)) return 'sleep-review';
    if(/medication|mounjaro|tirzepatide|atorvastatin|supplement/.test(text)) return 'medication-review';
    if(/duplicate|conflict|integrity|import|record/.test(text)) return 'data-integrity-review';
    if(/blood pressure|weight|measurement|lab|a1c|glucose|cholesterol/.test(text)) return 'measurement-review';
    return String(q.transaction_id||q.task_id||q.question_key||q.id||'general-review').replace(/[:#].*$/,'');
  }
  function reviewTasks(){
    const map=new Map();
    openQuestions().forEach(q=>{const key=reviewTaskKey(q);const task=map.get(key)||{key,items:[],priority:q.priority||'low'};task.items.push(q);if(priorityWeight(q.priority)>priorityWeight(task.priority))task.priority=q.priority;map.set(key,task)});
    return [...map.values()].sort((a,b)=>priorityWeight(b.priority)-priorityWeight(a.priority));
  }

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
      <div class="section-head conversation-head"><div><h2>Talk to ZEKE</h2><p>Conversation first, with structured choices when ZEKE needs a safe decision.</p></div><div class="conversation-head-actions"><button class="secondary compact" id="expandConversation" aria-expanded="${document.body.classList.contains('conversation-expanded')}">${document.body.classList.contains('conversation-expanded')?'Collapse':'Expand'}</button><button class="question-pill" id="questionPill">${reviewTasks().length} review task${reviewTasks().length===1?'':'s'}</button></div></div>
      <div class="conversation-thread" id="conversationThread">${msgs.map(m=>`<div class="bubble-row ${m.role}"><div class="avatar">${m.role==='zeke'?'Z':'You'}</div><div class="bubble"><span class="bubble-name">${m.role==='zeke'?'ZEKE':'You'}</span><p>${esc(m.text)}</p></div></div>`).join('')}</div>
      ${choices.length?`<div class="choice-row">${choices.map(c=>`<button class="choice" data-conversation-choice="${esc(c.value)}" aria-live="polite">${esc(c.label)}</button>`).join('')}</div>`:''}
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
      return s.action_id===action.id || (label&&med&&label.includes(med)) || (action.kind==='workout'&&isWorkoutEvent(e)) || (label&&ex&&label.includes(ex));
    });
  }

  function todayActionsHTML() {
    const catalog=(state.actions.catalog||[]).filter(a=>a.active!==false && actionScheduleMatches(a));
    if(!catalog.length) return `<section class="panel today-panel"><div class="section-head"><div><h2>Today's Actions</h2><p>No confirmed recurring schedules are due today.</p></div></div><div class="empty-inline">ZEKE will add actions here only after schedules are known or confirmed. It will not infer completion from past days.</div></section>`;
    return `<section class="panel today-panel"><div class="section-head"><div><h2>Today's Actions</h2><p>Current-day status only. Past completion does not carry forward.</p></div><div class="scroll-controls"><button id="actionsLeft">‹</button><button id="actionsRight">›</button></div></div><div class="actions-strip" id="actionsStrip">${catalog.map(a=>{const done=actionDoneToday(a);return `<button class="action-tile ${done?'done':''}" data-action-id="${esc(a.id)}"><span class="action-icon">${a.icon||'✓'}</span><strong>${esc(a.label||a.name)}</strong><small>${esc(a.subtitle||scheduleText(a.schedule))}</small><span class="action-state">${done?'✓ Confirmed today':'Confirm or log'}</span></button>`}).join('')}</div></section>`;
  }

  function scheduleText(s={}) { if(s.type==='daily')return'Daily'; if(s.type==='weekly')return'Weekly'; if(s.type==='date')return fmtDate(s.date,{month:'short',day:'numeric'}); return'Schedule unknown'; }

  function repositoryInventory() {
    const counts={}; const metricCounts={}; const sources={}; const unrecognized=[];
    for(const e of state.events){
      const cat=semanticCategory(e)||'uncategorized'; counts[cat]=(counts[cat]||0)+1;
      const src=e?.provenance?.sheet||e?.provenance?.file||e?.provenance?.source||'ZEKE'; sources[src]=(sources[src]||0)+1;
      if(['measurement','lab'].includes(cat)){
        const rawId=metricId(e), cid=canonicalMetric(rawId); if(cid) metricCounts[cid]=(metricCounts[cid]||0)+1;
        if(!rawId || metricValue(e)==null) unrecognized.push(e);
      }
    }
    return {counts,metricCounts,sources,unrecognized};
  }

  function coverageHTML() {
    const latest=state.events.map(e=>e.timestamp||e.recorded_at).filter(Boolean).sort().at(-1);
    const issues=reviewTasks().length;
    return `<section class="dashboard-status"><span class="status-dot"></span><strong>Data current</strong><span>${latest?`Last evidence ${esc(fmtDate(latest,{month:'short',day:'numeric'}))}`:'No verified evidence yet'}</span>${issues?`<button class="text-action" id="questionPill">${issues} review task${issues===1?'':'s'}</button>`:''}</section>`;
  }

  function recentHealthHTML() {
    const rows=state.events.filter(e=>['measurement','lab','medication'].includes(semanticCategory(e))).sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at)).slice(0,7);
    if(!rows.length) return '';
    return `<section class="panel recent-evidence"><div class="section-head"><div><h2>Recent health evidence</h2><p>Latest loaded records, including items that do not yet form a chart.</p></div><button class="text-action" data-route="health">View all</button></div><div class="evidence-list">${rows.map(e=>`<article><time>${esc(fmtDate(e.timestamp||e.recorded_at,{month:'short',day:'numeric'}))}</time><div><strong>${esc(humanEvent(e))}</strong><small>${esc(semanticCategory(e))} · ${esc(e.provenance?.sheet||e.provenance?.file||e.provenance?.source||'ZEKE')}</small></div></article>`).join('')}</div></section>`;
  }

  function dataVisibilityHTML() {
    const inv=repositoryInventory(); const cats=Object.entries(inv.counts).sort((a,b)=>b[1]-a[1]);
    const metrics=Object.entries(inv.metricCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);
    return `<section class="panel data-visibility"><div class="section-head"><div><h2>What ZEKE can currently see</h2><p>A read-only inventory of the connected repository. This does not alter your records.</p></div><button class="text-action" data-route="settings">Inspect imports</button></div><div class="inventory-grid"><div><h3>Record types</h3>${cats.map(([k,v])=>`<span><b>${esc(v)}</b>${esc(k.replaceAll('_',' '))}</span>`).join('')||'<p>No loaded records.</p>'}</div><div><h3>Recognized health metrics</h3>${metrics.map(([k,v])=>`<span><b>${esc(v)}</b>${esc(METRICS[k]?.label||k.replaceAll('_',' '))}</span>`).join('')||'<p>No chartable metrics recognized.</p>'}</div></div>${inv.unrecognized.length?`<p class="audit-note">${inv.unrecognized.length} health/lab record${inv.unrecognized.length===1?'':'s'} loaded but missing a usable metric name or numeric value. They remain untouched and can be reviewed in Health or Settings.</p>`:''}</section>`;
  }

  function insightKey(i){return String(i.evidenceKey||i.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
  function thinkingHTML() {
    const dismissed=new Set(state.preferences.dismissedInsights||[]); const allText=state.events.map(e=>e.raw_text||'').join(' ').toLowerCase(); const candidates=[];
    for(const d of state.discoveries.slice(0,4)) candidates.push({icon:'↗',title:d.title||'Pattern worth reviewing',text:d.summary||'A saved discovery is ready to explore.',action:'health',evidenceKey:d.id||d.title});
    const workoutCount=state.events.filter(isWorkoutEvent).length; const sleepCount=allMetricSeries('sleep_duration').length;
    if(workoutCount>=2 && sleepCount<3) candidates.unshift({icon:'☾',title:'Sleep may be an undertracked recovery variable',text:`ZEKE found ${workoutCount} workout records but only ${sleepCount} confirmed sleep observation${sleepCount===1?'':'s'}. This is a data-gap hypothesis, not a training recommendation.`,action:'health',evidenceKey:'sleep-undertracked'});
    if(/nurri|protein shake/.test(allText)&&!(state.actions.catalog||[]).some(a=>/nurri|protein shake/i.test(a.label||'')))candidates.push({icon:'🥤',title:'Repeated protein-shake mentions',text:'Would automatic recognition reduce logging friction?',thinking:'track-shakes'});
    if(/creatine/.test(allText)&&!(state.actions.catalog||[]).some(a=>/creatine/i.test(a.label||'')))candidates.push({icon:'＋',title:'Creatine appears repeatedly',text:'ZEKE can treat it as a recurring supplement after you confirm the schedule.',thinking:'track-creatine'});
    const deduped=[];const seen=new Set();for(const i of candidates){const k=insightKey(i);if(!seen.has(k)&&!dismissed.has(k)){seen.add(k);deduped.push(i)}}
    if(!deduped.length)deduped.push({icon:'💡',title:'No new cross-domain ideas right now',text:'This area refreshes when meaningful new data arrives, a question is answered, or you request a refresh.'});
    const stamp=state.preferences.insightsRefreshedAt?fmtDate(state.preferences.insightsRefreshedAt,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'after meaningful new data';
    return `<section class="panel thinking-panel"><div class="section-head"><div><h2>I've been thinking…</h2><p>Broader hypotheses and useful curiosities—not duplicate workout coaching. Updated ${esc(stamp)}.</p></div><button class="secondary compact" id="refreshInsights">Refresh insights</button></div><div class="insight-list">${deduped.slice(0,4).map(i=>`<article class="thought-row"><span class="thought-icon">${i.icon}</span><div><strong>${esc(i.title)}</strong><p>${esc(i.text)}</p><div class="thought-actions">${i.action?`<button class="text-action" data-insight-evidence="${esc(i.evidenceKey||i.title)}">Explore evidence</button>`:''}${i.thinking?`<button class="text-action" data-thinking="${i.thinking}">Track it</button>`:''}<button class="text-action muted-action" data-dismiss-insight="${esc(insightKey(i))}">Dismiss</button></div></div></article>`).join('')}</div></section>`;
  }

  function upcomingHTML() {
    if(!state.calendar.length)return''; const rows=state.calendar.slice(0,4).map(e=>`<div class="calendar-row"><div class="calendar-date"><strong>${esc(fmtDate(e.start,{month:'short',day:'numeric'}))}</strong><span>${esc(fmtTime(e.start))}</span></div><div><strong>${esc(e.title)}</strong>${e.location?`<small>${esc(e.location)}</small>`:''}</div></div>`).join('');
    return `<section class="panel upcoming-panel"><div class="section-head"><div><h2>Upcoming</h2><p>Scheduled context, not proof of completion.</p></div><button class="text-action" data-route="calendar">View all</button></div>${rows}</section>`;
  }

  function dashboardHTML() {
    const trend=trendPanelHTML();
    return `${coverageHTML()}<div class="dashboard-grid"><div class="dashboard-conversation-top">${conversationHTML()}</div>${healthGlanceHTML(9)}${coachHTML()}${todayActionsHTML()}${thinkingHTML()}${trend||''}${recentHealthHTML()}${upcomingHTML()}</div>`;
  }

  function isSuppressedIntegrityArtifact(e){
    const st=e.structured||{}, p=e.provenance||{}, metric=canonicalMetric(metricId(e)), value=Number(metricValue(e));
    if(['invalid','quarantined'].includes(String(st.interpretation_status||st.data_quality_status||'').toLowerCase()))return true;
    if(p.source==='import' && /normal\s*80\s*[-–]\s*100/i.test(String(e.raw_text||'')) && ((metric==='bp_systolic'&&value===80)||(metric==='bp_diastolic'&&value===100)))return true;
    if(p.source==='connected-workbook' && Number(p.source_row)===421 && metric==='weight' && value===219.4 && /^2026-07-(11|12|13|16)/.test(String(e.timestamp||'')))return true;
    if(p.source==='connected-workbook' && Number(p.source_row)===420 && ((metric==='a1c'&&value===5.4)||(metric==='average_glucose'&&value===108)) && /^2026-07-(11|12|13|16)/.test(String(e.timestamp||'')))return true;
    return false;
  }

  function recordsTable(filterFn, columns) {
    const rows=state.events.filter(e=>!isSuppressedIntegrityArtifact(e)).filter(filterFn).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    if(!rows.length) return `<div class="empty-page">No records yet.</div>`;
    return `<div class="table-wrap"><table><thead><tr>${columns.map(c=>`<th>${esc(c.label)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(e=>`<tr>${columns.map(c=>`<td>${esc(c.value(e))}</td>`).join('')}<td><button class="text-action" data-edit-event="${e.id}">Review / edit</button></td></tr>`).join('')}</tbody></table></div>`;
  }

  function healthPageHTML() {
    const cards=availableMetrics().map(metricCard).join('');
    const history=state.factors.filter(f=>['family_history','personal_history'].includes(f.type));
    const historyRows=history.length?history.map(h=>`<div class="history-row"><div><strong>${esc(h.relation||h.type.replace('_',' '))}</strong><p>${esc(h.summary||h.answer||'')}</p></div><span class="provider-status">${h.type==='personal_history'?'Personal history':'Family history'}</span></div>`).join(''):`<div class="empty-inline">No personal or family health context has been added yet.</div>`;
    return `<div class="page-head"><div><h1>Health</h1><p>Your health overview, including sleep, measurements, labs, medications, history, and context.</p></div><button class="primary" data-log-metric="weight">+ Log health data</button></div>
      <section class="panel"><div class="section-head"><div><h2>Health overview</h2><p>Sleep belongs here as part of health, not as a separate top-level domain.</p></div></div><form class="quick-entry-row" id="quickWeightForm"><label><strong>Add weight</strong><input id="quickWeightValue" type="number" step="0.1" min="1" placeholder="lb" required></label><button class="primary compact" type="submit">Save for ${esc(activeDateLabel())}</button><span>Prior values are never carried forward.</span></form><div class="metrics-row">${cards||'<div class="empty-inline">No verified health metrics yet.</div>'}</div></section><section class="panel"><div class="section-head"><div><h2>Body measurements</h2><p>Waist, chest, hips, neck, arms, thighs, body-fat percentage, and other dated measurements.</p></div><button class="secondary" data-log-metric="waist_circumference">+ Add measurement</button></div><div class="body-measure-grid">${['waist_circumference','body_fat_pct'].map(id=>metricCard(id)).join('')}</div></section>
      <section class="panel"><div class="section-head"><div><h2>Personal & family health history</h2><p>Optional context that can improve discoveries. It stays off the main dashboard and surfaces only when relevant.</p></div><button class="secondary" id="addHealthHistory">+ Add context</button></div><div class="history-list">${historyRows}</div></section>
      <section class="panel"><div class="section-head"><div><h2>Recent health record</h2><p>Review and correct entries while preserving provenance.</p></div></div>${recordsTable(e=>['measurement','lab','medication'].includes(semanticCategory(e)),[
        {label:'Date',value:e=>fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})},
        {label:'Type',value:e=>semanticCategory(e)},
        {label:'Summary',value:e=>humanEvent(e)},
        {label:'Source',value:e=>e.provenance?.source||'ZEKE'}
      ])}</section>`;
  }

  function fitnessPageHTML() {
    const groups=workoutGroups();
    const rows=state.events.filter(e=>isWorkoutEvent(e)&&hasMeaningfulWorkout(e)).sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at));
    const cards=[...groups.entries()].map(([name,arr])=>{const first=arr[0],last=arr.at(-1);const loadChange=first.weight&&last.weight?last.weight-first.weight:null;let recommendation='More repeated sessions are needed before recommending a change.';let confidence='low';if(arr.length>=2&&last.pain>=4){recommendation='Hold load progression and review pain, technique, and clinician/PT guidance.';confidence='high';}else if(arr.length>=2&&last.weight&&last.reps>=12&&last.sets>=2){recommendation=`Consider ${last.weight+5} lb next session for 8–12 controlled reps, provided form and pain remain stable.`;confidence=arr.length>=3?'moderate':'low';}else if(arr.length>=2&&last.weight){recommendation=`Repeat ${last.weight} lb and aim to add 1–2 controlled reps before increasing load.`;confidence='moderate';}
      const pts=arr.filter(x=>x.weight);const spark=pts.length>1?miniSpark(pts.map((x,i)=>({value:x.weight,date:x.date,unit:'lb',id:`${name}-${i}`})),'weight'):'';
      return `<article class="fitness-progress-card"><div class="fitness-card-head"><div><strong>${esc(name)}</strong><span>${arr.length} session${arr.length===1?'':'s'}</span></div><b>${last.weight?`${last.weight} lb`:last.duration_min?`${last.duration_min} min`:'—'}</b></div>${spark}<div class="fitness-facts"><span>First: ${first.weight?`${first.weight} lb`:'—'}</span><span>Change: ${loadChange==null?'—':`${loadChange>0?'+':''}${loadChange} lb`}</span><span>Latest: ${last.reps||'—'} reps × ${last.sets||'—'}</span></div><p class="fitness-recommendation"><strong>Next step (${confidence} confidence):</strong> ${esc(recommendation)}</p><button class="secondary compact" data-quick-exercise="${esc(name)}">+ Add to ${esc(activeDateLabel())}'s workout</button></article>`}).join('');
    const cardio=rows.map(e=>({event:e,...workoutStructured(e),date:e.timestamp||e.recorded_at})).filter(w=>/stair|climb/i.test(w.exercise||'')&&(w.duration_min!=null||w.steps!=null)).sort((a,b)=>new Date(a.date)-new Date(b.date));
    const firstCardio=cardio[0], latestCardio=cardio.at(-1); const cardioStepDelta=cardio.length>1&&firstCardio?.steps!=null&&latestCardio?.steps!=null?latestCardio.steps-firstCardio.steps:null;
    const cardioSummary=cardio.length?`<section class="panel"><div class="section-head"><div><h2>Stairclimber progress</h2><p>Each duration and step count stays paired with its dated session.</p></div></div><div class="fitness-facts large"><span><b>${cardio.length}</b> sessions</span><span><b>${latestCardio?.duration_min??'—'}</b> latest minutes</span><span><b>${latestCardio?.steps??'—'}</b> latest steps</span><span><b>${cardioStepDelta==null?'—':`${cardioStepDelta>0?'+':''}${cardioStepDelta}`}</b> ${cardioStepDelta==null?'step change':`steps · ${fmtDate(firstCardio.date)} to ${fmtDate(latestCardio.date)}`}</span></div></section>`:'';
    const history=rows.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Exercise</th><th>Load</th><th>Reps × sets</th><th>Duration</th><th>Steps</th><th>Source</th></tr></thead><tbody>${rows.map(e=>{const w=workoutStructured(e);return `<tr><td>${esc(fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${esc(w.exercise||'Workout')}</td><td>${esc(w.weight!=null?`${w.weight} ${w.weight_unit||'lb'}`:'—')}</td><td>${esc(w.reps!=null||w.sets!=null?`${w.reps??'—'} × ${w.sets??'—'}`:'—')}</td><td>${esc(w.duration_min!=null?`${w.duration_min} min`:'—')}</td><td>${esc(w.steps!=null?`${w.steps}`:'—')}</td><td>${esc(e.provenance?.sheet||e.provenance?.file||e.provenance?.source||'ZEKE')}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty-inline">No workout records are available yet.</div>';
    return `<div class="page-head"><div><h1>Fitness</h1><p>Progress, exercise-specific trends, cardio performance, and evidence-linked next-session guidance.</p></div><button class="primary" data-context-exercise="">+ Log workout</button></div>${coachHTML()}${cardioSummary}<section class="panel"><div class="section-head"><div><h2>Exercise progression</h2><p>Recommendations use your recorded load, reps, sets, pain, and consistency. ZEKE explains when evidence is insufficient.</p></div></div><div class="fitness-progress-grid">${cards||'<div class="empty-inline">Repeated exercise entries will appear here.</div>'}</div></section><section class="panel"><div class="section-head"><div><h2>Workout history</h2><p>Entries are grouped into one workout per calendar day by default. Empty draft shells are excluded.</p></div></div>${history}</section>`;
  }

  function medicationsPageHTML() {
    return `<div class="page-head"><div><h1>Medications & supplements</h1><p>Schedules, confirmed doses, supplements, injections, and corrections.</p></div><button class="primary" data-context-medication="">+ Log medication or supplement</button></div>
      <section class="panel"><div class="section-head"><div><h2>Recorded entries</h2><p>ZEKE does not infer today’s completion from prior days.</p></div></div>${recordsTable(e=>semanticCategory(e)==='medication',[
        {label:'Date',value:e=>fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})},
        {label:'Medication / item',value:e=>e.structured?.medication_name||e.structured?.name||'Medication'},
        {label:'Dose',value:e=>e.structured?.dose?`${e.structured.dose}${e.structured.unit||''}`:'Not recorded'},
        {label:'Status',value:e=>e.structured?.status||'recorded'}
      ])}</section>`;
  }

  function labsPageHTML() {
    return `<div class="page-head"><div><h1>Labs & vitals</h1><p>Verified results, reference context when available, and longitudinal trends.</p></div><button class="primary" data-log-metric="a1c">+ Log result</button></div>
      <section class="panel"><div class="section-head"><div><h2>Lab results</h2><p>ZEKE shows source reference information when it exists; it does not imply one universal normal range.</p></div></div>${recordsTable(e=>semanticCategory(e)==='lab',[
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
    return `<div class="provider-grid ai-grid">${Object.values(defs).filter(d=>d.id!=='relay').map(def=>{const st=statusMap.get(def.id);return `<article class="provider-card ai-card ${st?.connected?'connected':''}" data-provider="${def.id}"><div class="provider-card-head"><span class="provider-icon">AI</span><div><strong>${esc(def.label)}</strong><span class="provider-status">${st?.connected?'● Connected · available to ZEKE':st?.hasSessionKey?'Configured · not tested':'Not connected'}</span>${st?.connected&&st?.lastTestedAt?`<small>Last successful test: ${esc(fmtDate(st.lastTestedAt,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))}</small>`:''}</div></div>${def.id==='ollama'?'':`<label>API key<input type="password" data-ai-key="${def.id}" placeholder="${st?.hasSessionKey?'Key saved on this device':'Paste API key'}"></label><label class="remember-control"><input type="checkbox" data-ai-remember="${def.id}" ${st?.rememberOnDevice?'checked':''}> Remember on this device</label>`}${def.requiresEndpoint?`<label>Endpoint<input type="url" data-ai-endpoint="${def.id}" value="${esc(st?.endpoint||'')}" placeholder="Secure relay or compatible endpoint URL"></label>`:''}<label>Model<input type="text" data-ai-model="${def.id}" value="${esc(st?.model||def.suggestedModels?.[0]||'')}" list="models-${def.id}" placeholder="Model ID"><datalist id="models-${def.id}">${(def.suggestedModels||[]).map(m=>`<option value="${esc(m)}"></option>`).join('')}</datalist></label><div class="card-actions"><button class="secondary" data-save-ai="${def.id}">Connect & test</button><button class="text-action" data-test-ai="${def.id}">Test</button></div><small>ZEKE’s router chooses among connected services automatically for each task.</small></article>`}).join('')}</div>`;
  }


  function eventDate(e) { return e?.timestamp || e?.recorded_at || e?.created_at || ''; }

  function provenanceLabel(e) {
    const p=e?.provenance||{}, st=e?.structured||{};
    return p.sheet || p.file || p.source || st.source || e?.source || 'ZEKE';
  }

  function dataCensus() {
    const categoryCounts={}, sourceCounts={}, metricCounts={}, fieldCounts={};
    let recognizedWorkouts=0, possibleWorkouts=0, chartable=0, missingDate=0, missingProvenance=0, uncertain=0;
    let earliest='', latest='';
    const rows=state.events.map((e,index)=>{
      const category=semanticCategory(e)||'uncategorized';
      categoryCounts[category]=(categoryCounts[category]||0)+1;
      const source=provenanceLabel(e); sourceCounts[source]=(sourceCounts[source]||0)+1;
      const date=eventDate(e);
      if(date){ if(!earliest||new Date(date)<new Date(earliest)) earliest=date; if(!latest||new Date(date)>new Date(latest)) latest=date; } else missingDate++;
      if(source==='ZEKE' && !e?.provenance) missingProvenance++;
      const status=String(e?.structured?.interpretation_status||e?.status||'').toLowerCase();
      if(['pending','uncertain','needs_review','unconfirmed'].includes(status)) uncertain++;
      if(['measurement','lab'].includes(category)){
        const metric=canonicalMetric(metricId(e)); const value=metricValue(e);
        if(metric) metricCounts[metric]=(metricCounts[metric]||0)+1;
        if(metric && value!=null) chartable++;
      }
      const workout=isWorkoutEvent(e);
      if(workout) recognizedWorkouts++;
      else if(/workout|exercise|fitness|strength|cardio|stair|pulldown|curl|row|reps?|sets?/i.test([e.category,e.type,e.raw_text,e.summary,JSON.stringify(e.structured||{})].join(' '))) possibleWorkouts++;
      Object.keys(e?.structured||{}).forEach(k=>fieldCounts[k]=(fieldCounts[k]||0)+1);
      return {index,event:e,category,source,date,workout,metric:canonicalMetric(metricId(e)),value:metricValue(e)};
    });
    return {rows,categoryCounts,sourceCounts,metricCounts,fieldCounts,recognizedWorkouts,possibleWorkouts,chartable,missingDate,missingProvenance,uncertain,earliest,latest};
  }

  function auditRecordSummary(r) {
    const e=r.event, st=e.structured||{};
    if(r.workout){ const w=workoutStructured(e); return [w.exercise,w.weight!=null?`${w.weight} lb`:'',w.reps!=null?`${w.reps} reps`:'',w.sets!=null?`${w.sets} sets`:'',w.duration_min!=null?`${w.duration_min} min`:''].filter(Boolean).join(' · '); }
    if(r.metric && r.value!=null) return `${METRICS[r.metric]?.label||r.metric.replaceAll('_',' ')}: ${r.value}${st.unit||st.value_unit?` ${st.unit||st.value_unit}`:''}`;
    return humanEvent(e);
  }

  function dataIntegrityHTML() {
    const a=dataCensus();
    const cats=Object.entries(a.categoryCounts).sort((x,y)=>y[1]-x[1]);
    const sources=Object.entries(a.sourceCounts).sort((x,y)=>y[1]-x[1]);
    const metrics=Object.entries(a.metricCounts).sort((x,y)=>y[1]-x[1]);
    const imports=[...(state.importBatches||[])].reverse();
    const q=String(state.auditQuery||'').toLowerCase();
    const filtered=a.rows.filter(r=>(state.auditCategory==='all'||r.category===state.auditCategory) && (!q||[r.category,r.source,auditRecordSummary(r),r.event.raw_text,JSON.stringify(r.event.structured||{})].join(' ').toLowerCase().includes(q))).sort((x,y)=>new Date(y.date||0)-new Date(x.date||0)).slice(0,150);
    const fileRows=Object.entries(ZekeData.constants?.PATHS||{}).map(([key,path])=>`<tr><td>${esc(path)}</td><td>${esc(key)}</td><td>Canonical JSON</td><td>Read-only inspection</td></tr>`).join('');
    return `<div class="page-head"><div><h1>Data Integrity</h1><p>A read-only census of what ZEKE loaded, recognized, and could not confidently classify. Nothing on this page changes your data.</p></div><button class="secondary" id="exportDataAudit">Export audit</button></div>
      <section class="integrity-banner"><strong>Safety mode: read only</strong><span>No migration, deletion, merge, or source-file rewrite occurs here.</span></section>
      ${integrityIssues().length?`<section class="panel integrity-alerts"><div class="section-head"><div><h2>Needs your clarification</h2><p>ZEKE found records that do not look trustworthy. They are excluded from charts while awaiting review.</p></div><span class="badge">${integrityIssues().length} item${integrityIssues().length===1?'':'s'}</span></div>${integrityIssues().map(({event,issue})=>`<article class="integrity-issue"><div><strong>${esc(issue.reason)}</strong><p><b>Why:</b> ${esc(event.raw_text||'The source and classification conflict.')}</p><small>${esc(event.provenance?.file||event.provenance?.source||'ZEKE')} · ${esc(event.id)}</small></div><button class="secondary" data-edit-event="${esc(event.id)}">Review</button></article>`).join('')}</section>`:''}
      <div class="census-grid">
        <article><b>${a.rows.length}</b><span>loaded events</span></article><article><b>${a.chartable}</b><span>chartable health values</span></article><article><b>${a.recognizedWorkouts}</b><span>recognized workouts</span></article><article><b>${a.possibleWorkouts}</b><span>possible workouts</span></article><article><b>${a.uncertain}</b><span>need review</span></article><article><b>${sources.length}</b><span>data sources</span></article>
      </div>
      <div class="integrity-columns">
        <section class="panel"><div class="section-head"><div><h2>Repository census</h2><p>Loaded record types and their date coverage.</p></div></div><div class="integrity-facts"><span><b>${esc(a.earliest?fmtDate(a.earliest,{month:'short',day:'numeric',year:'numeric'}):'—')}</b>earliest evidence</span><span><b>${esc(a.latest?fmtDate(a.latest,{month:'short',day:'numeric',year:'numeric'}):'—')}</b>latest evidence</span><span><b>${a.missingDate}</b>missing dates</span><span><b>${a.missingProvenance}</b>missing provenance</span></div><div class="audit-bars">${cats.map(([k,v])=>`<div><span>${esc(k.replaceAll('_',' '))}</span><meter min="0" max="${Math.max(...cats.map(x=>x[1]),1)}" value="${v}"></meter><b>${v}</b></div>`).join('')||'<p>No records loaded.</p>'}</div></section>
        <section class="panel"><div class="section-head"><div><h2>Sources ZEKE can see</h2><p>Derived from preserved provenance on loaded records.</p></div></div><div class="source-audit">${sources.map(([k,v])=>`<span><b>${v}</b>${esc(k)}</span>`).join('')||'<p>No provenance was found.</p>'}</div></section>
      </div>
      <section class="panel"><div class="section-head"><div><h2>Metric registry</h2><p>Names ZEKE mapped for display. Unmapped records remain untouched.</p></div></div><div class="metric-registry">${metrics.map(([k,v])=>`<span><b>${v}</b>${esc(METRICS[k]?.label||k.replaceAll('_',' '))}<small>${esc(k)}</small></span>`).join('')||'<div class="empty-inline">No health metrics were mapped.</div>'}</div></section>
      <section class="panel"><div class="section-head"><div><h2>Import diagnostics</h2><p>Previous import batches and reported outcomes.</p></div></div>${imports.length?`<div class="audit-table-wrap"><table class="audit-table"><thead><tr><th>Date</th><th>File/source</th><th>Type</th><th>Counts</th><th>Message</th></tr></thead><tbody>${imports.slice(0,25).map(b=>`<tr><td>${esc(fmtDate(b.created_at||b.timestamp,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${esc(b.file||b.source||'—')}</td><td>${esc(b.type||'import')}</td><td>${esc(Object.entries(b.counts||{}).map(([k,v])=>`${k}: ${v}`).join(' · ')||'—')}</td><td>${esc(b.message||'—')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-inline">No saved import reports are available. This does not prove that source spreadsheets contain no additional data.</div>'}</section>
      <section class="panel"><div class="section-head"><div><h2>Canonical repository map</h2><p>Files ZEKE expects inside Project Zeke. This list describes the application contract, not a destructive scan.</p></div></div><div class="audit-table-wrap"><table class="audit-table"><thead><tr><th>Path</th><th>Purpose</th><th>Format</th><th>Mode</th></tr></thead><tbody>${fileRows}</tbody></table></div></section>
      <section class="panel record-browser"><div class="section-head"><div><h2>Repository browser</h2><p>Search loaded records and inspect how ZEKE classified them.</p></div><span class="badge">${filtered.length}${a.rows.length>150?' shown':''}</span></div><div class="audit-controls"><input id="auditSearch" type="search" placeholder="Search records, exercises, metrics, or sources" value="${esc(state.auditQuery)}"><select id="auditCategory"><option value="all">All categories</option>${cats.map(([k])=>`<option value="${esc(k)}" ${state.auditCategory===k?'selected':''}>${esc(k.replaceAll('_',' '))}</option>`).join('')}</select></div><div class="audit-table-wrap"><table class="audit-table"><thead><tr><th>Date</th><th>Classification</th><th>Summary</th><th>Source</th><th>Status</th></tr></thead><tbody>${filtered.map(r=>`<tr><td>${esc(r.date?fmtDate(r.date,{month:'short',day:'numeric',year:'numeric'}):'No date')}</td><td><span class="category-pill">${esc(r.category)}</span>${r.workout?'<small>workout recognized</small>':''}</td><td>${esc(auditRecordSummary(r))}</td><td>${esc(r.source)}</td><td>${esc(r.event.structured?.interpretation_status||r.event.status||'loaded')}</td></tr>`).join('')||'<tr><td colspan="5">No records match this filter.</td></tr>'}</tbody></table></div></section>`;
  }

  function settingsPageHTML() {
    return `<div class="page-head"><div><h1>Settings</h1><p>Connections and preferences. ZEKE's router and provider managers handle the technical choices.</p></div></div>
      <section class="panel settings-section"><div class="section-head"><div><h2>Storage</h2><p>Choose where ZEKE keeps your workspace. Normal launches should reconnect silently when the provider allows it.</p></div></div>${storageCardsHTML()}<div class="settings-actions"><button class="secondary" id="reconnectStorage">Reconnect storage</button><button class="text-action danger" id="forgetStorage">Disconnect & forget setup</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>AI Connections</h2><p>Connect and test services. ZEKE's AI Router decides which available model to use based on task, privacy, availability, and free-first policy.</p></div><span class="badge">${(state.ai?.providers||[]).filter(x=>x.connected).map(x=>x.label||x.provider).join(', ')||'No AI connected'}</span></div>${aiConnectionCardsHTML()}<div class="manual-packet"><strong>Manual AI packet</strong><p>Export a structured packet for use with any external AI, then import the response back into ZEKE without treating it as raw fact.</p><div class="card-actions"><button class="secondary" id="exportAIPacket">Export packet</button><label class="secondary file-button">Import AI response<input type="file" id="importAIResponse" accept=".json,application/json" hidden></label></div><div id="aiImportStatus" class="status-line"></div></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Calendar connections</h2><p>Calendar providers are context sources. An event on a calendar does not prove that it happened.</p></div></div><div class="provider-grid"><article class="provider-card connected"><span class="provider-icon">▣</span><div><strong>Google Calendar</strong><p>Available with the current Google connection.</p><span class="provider-status">${state.storage?.providerId==='google-drive'?'Connected':'Available'}</span></div></article><article class="provider-card planned"><span class="provider-icon">◫</span><div><strong>Apple Calendar / iCloud</strong><p>CalDAV/ICS-compatible connector planned.</p><span class="provider-status">Planned</span></div></article><article class="provider-card planned"><span class="provider-icon">▤</span><div><strong>Outlook / Exchange</strong><p>Microsoft calendar connector planned.</p><span class="provider-status">Planned</span></div></article><article class="provider-card"><span class="provider-icon">ICS</span><div><strong>ICS import</strong><p>Import an exported calendar file as contextual history.</p><span class="provider-status">Coming next</span></div></article></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Connected health workbook</h2><p>Link the workbook once. ZEKE stores a managed copy in your Project Zeke Drive folder, reloads it after releases, and synchronizes it idempotently with events.json.</p></div><span class="badge">${state.syncSource?'Connected':'Not connected'}</span></div>${state.syncSource?`<div class="sync-source-card"><strong>${esc(state.syncSource.name)}</strong><p>Last synchronized: ${esc(state.syncSource.last_sync_at?fmtDate(state.syncSource.last_sync_at,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'Not yet')}</p><div class="card-actions"><button class="secondary" id="syncWorkbookNow">Sync now</button><label class="secondary file-button">Replace connected source<input type="file" id="importFile" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label></div></div>`:`<label class="secondary file-button">Connect health workbook<input type="file" id="importFile" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label>`}<div id="importStatus" class="status-line">${esc(state.importStatus||'')}</div>${state.importReport?`<div class="import-report"><strong>Latest synchronization report</strong><div class="import-stats">${Object.entries(state.importReport.counts||{}).map(([k,v])=>`<span><b>${esc(v)}</b>${esc(k.replaceAll('_',' '))}</span>`).join('')}</div><p>${esc(state.importReport.message||'Synchronization completed.')}</p></div>`:''}<p class="safety-copy">Safety: a timestamped JSON backup is created before each sync. Blank spreadsheet cells do not delete JSON events. Conflicts are preserved for review, and repeated syncs do not append duplicates.</p></section>
      ${dataVisibilityHTML()}
      <section class="panel settings-section integrity-settings-card"><div class="section-head"><div><h2>Data Integrity</h2><p>Review suspicious imports, duplicate candidates, and source conflicts without cluttering the primary navigation.</p></div><button class="secondary" data-route="data-integrity">Open Data Integrity</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Appearance</h2><p>Choose Dark, Light, or follow your system setting.</p></div></div><div class="theme-buttons"><button class="secondary ${state.theme==='dark'?'active':''}" data-theme="dark">Dark</button><button class="secondary ${state.theme==='light'?'active':''}" data-theme="light">Light</button><button class="secondary ${state.theme==='system'?'active':''}" data-theme="system">System</button></div></section>
      <section class="panel about"><h2>About this build</h2><p><strong>ZEKE v${esc(BUILD.version)}</strong> · build ${esc(BUILD.build)}</p><p>${esc(BUILD.label||'Repair release')}</p></section>`;
  }

  function questionsPageHTML() {
    const all=state.factors.filter(f=>f.type==='clarification_question').sort((a,b)=>priorityWeight(b.priority)-priorityWeight(a.priority));
    const tasks=reviewTasks();
    const titleFor=key=>({
      'workout-review':'Review workout information',
      'sleep-review':'Review sleep information',
      'medication-review':'Review medication information',
      'data-integrity-review':'Resolve data-integrity items',
      'measurement-review':'Review measurements and labs'
    }[key]||'Review related information');
    const cards=tasks.map(task=>{const first=task.items[0];return `<section class="panel question-group"><article class="question-card review-task-card"><div><span class="question-priority ${esc(task.priority)}">${esc(task.priority||'optional')}</span><h3>${esc(titleFor(task.key))}</h3><p>${task.items.length} related question${task.items.length===1?'':'s'} grouped into one task. Review the details without leaving this workspace.</p><details><summary>Show granular questions</summary>${task.items.map(q=>`<div class="review-subquestion"><strong>${esc(q.question||'Clarification needed')}</strong><p>${esc(q.why_it_matters||'ZEKE found uncertainty it should not resolve by guessing.')}</p></div>`).join('')}</details></div><div class="question-actions"><button class="primary" data-review-question="${esc(first.id)}">Review task</button><button class="secondary" data-review-task-later="${esc(task.key)}">Later</button></div></article></section>`}).join('');
    return `<div class="page-head"><div><h1>Review Queue</h1><p>Related questions are grouped into task-level decisions. Expand any task for granular detail.</p></div><span class="badge">${tasks.length} review task${tasks.length===1?'':'s'}</span></div>${cards||'<section class="panel empty-page">No unresolved review tasks right now.</section>'}<section class="panel resolved-questions"><div class="section-head"><div><h2>Resolved or dismissed</h2><p>${all.length-openQuestions().length} question${all.length-openQuestions().length===1?'':'s'} in history</p></div></div></section>`;
  }

  function globalTalkHTML(){ if(state.route==='dashboard') return ''; return `<button class="global-talk-button" id="globalTalkButton" aria-label="Talk to ZEKE"><img src="./assets/branding/zeke-mark-provisional.png" alt=""><span>Talk to ZEKE</span></button><div class="global-talk-overlay" id="globalTalkOverlay"><div class="global-talk-backdrop" id="globalTalkBackdrop"></div><div class="global-talk-panel">${conversationHTML()}</div></div>`;}

  function insightEvidenceHTML(key){
    const sleep=key==='sleep-undertracked';
    const workouts=state.events.filter(isWorkoutEvent); const sleepPoints=allMetricSeries('sleep_duration');
    const title=sleep?'Sleep may be an undertracked recovery variable':'Evidence behind this insight';
    const rationale=sleep?`ZEKE found ${workouts.length} workout records and ${sleepPoints.length} confirmed sleep observation${sleepPoints.length===1?'':'s'}. The insight identifies a missing-data limitation; it does not claim that poor sleep caused any outcome.`:'This view should show only the evidence used for the selected insight.';
    return `<div class="evidence-focus" id="evidenceFocus"><section class="panel"><div class="section-head"><div><h2>${esc(title)}</h2><p>Focused evidence and limitations</p></div><button class="icon-btn" id="closeEvidenceFocus" aria-label="Close evidence">×</button></div><p>${esc(rationale)}</p><div class="evidence-summary-grid"><div><b>${workouts.length}</b><span>workouts reviewed</span></div><div><b>${sleepPoints.length}</b><span>sleep records</span></div><div><b>${sleep?'Moderate':'Contextual'}</b><span>confidence</span></div></div><p class="audit-note"><strong>What tracking could unlock:</strong> enough paired sleep and workout/recovery observations to test whether sleep duration coincides with changes in energy, performance, soreness, or recovery. ZEKE should not infer that relationship before the evidence exists.</p></section></div>`;
  }

  function navHTML() {
    const items=[['dashboard','⌂','Dashboard'],['health','♡','Health'],['fitness','⌁','Fitness'],['medications','✚','Medications'],['labs','⌬','Labs'],['calendar','▣','Calendar'],['questions','?','Questions'],['settings','⚙','Settings']];
    return `<aside class="sidebar" id="sidebar"><div class="brand"><img class="brand-logo" src="./assets/branding/zeke-mark-provisional.png" alt="Project ZEKE"><div><strong>PROJECT ZEKE</strong><span>One thread. Everything connected.</span></div><button class="sidebar-close" id="sidebarClose" aria-label="Close navigation">×</button></div><nav>${items.map(([id,icon,label])=>`<button class="nav-item ${state.route===id?'active':''}" data-route="${id}"><span>${icon}</span>${esc(label)}</button>`).join('')}</nav><div class="sidebar-spacer"></div><div class="privacy-note">Private by design. Your records stay with your chosen storage provider.</div><div class="build-label">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></aside><div class="sidebar-scrim" id="sidebarScrim"></div>`;
  }

  function topbarHTML() {
    const greeting=new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
    return `<header class="topbar"><button class="menu-button" id="menuButton" aria-label="Open navigation">☰</button><div class="topbar-brand"><img src="./assets/branding/zeke-mark-provisional.png" alt="ZEKE"><div><strong>ZEKE</strong><span>v${esc(BUILD.version)} · ${esc(BUILD.build)}</span></div></div><div class="topbar-greeting"><h1>${greeting}, Frank</h1><p>${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p></div>${state.route==='dashboard'?`<div class="range-tabs">${[['week','Week'],['month','Month'],['quarter','Quarter'],['6months','6 months'],['year','Year'],['all','All']].map(([id,label])=>`<button class="range ${state.range===id?'active':''}" data-range="${id}">${label}</button>`).join('')}</div><button class="secondary customize" id="customizeBtn">☷ Customize</button><button class="secondary mobile-preview" id="mobilePreviewBtn">📱 Mobile preview</button>`:''}<div class="top-actions"><button class="icon-btn" id="helpBtn" title="Help" aria-label="Page help">?</button><button class="icon-btn" id="statusBtn" title="ZEKE status" aria-label="ZEKE status">◆</button></div></header>`;
  }

  function connectedAppHTML() {
    let content='';
    if(state.route==='dashboard') content=dashboardHTML();
    else if(state.route==='health') content=healthPageHTML();
    else if(state.route==='fitness') content=fitnessPageHTML();
    else if(state.route==='medications') content=medicationsPageHTML();
    else if(state.route==='labs') content=labsPageHTML();
    else if(state.route==='calendar') content=calendarPageHTML();
    else if(state.route==='data-integrity') content=dataIntegrityHTML();
    else if(state.route==='questions') content=questionsPageHTML();
    else if(state.route==='settings') content=settingsPageHTML();
    return `<div class="app-shell">${navHTML()}<main class="main-shell">${topbarHTML()}<div class="content-shell">${content}</div></main>${globalTalkHTML()}${customizeDrawerHTML()}<div class="toast" id="toast"></div><input type="file" id="conversationFile" hidden></div>`;
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

  function editableKey(el) {
    if(!el || !(el instanceof HTMLElement)) return null;
    if(el.id) return `#${el.id}`;
    for(const attr of ['data-ai-key','data-ai-model','data-ai-endpoint','name']) {
      const value=el.getAttribute?.(attr);
      if(value) return `[${attr}="${CSS.escape(value)}"]`;
    }
    return null;
  }

  function isEditableElement(el=document.activeElement) {
    if(!el || !(el instanceof HTMLElement)) return false;
    if(el.matches?.('input:not([type=file]):not([type=button]):not([type=submit]), textarea, select, [contenteditable=true]')) return true;
    return false;
  }

  function captureEditableState() {
    const values=[];
    document.querySelectorAll('input:not([type=file]):not([type=button]):not([type=submit]), textarea, select, [contenteditable=true]').forEach(el=>{
      const key=editableKey(el); if(!key) return;
      values.push({key,value:el.matches('[contenteditable=true]')?el.innerHTML:el.value,checked:'checked' in el?el.checked:undefined});
    });
    const active=document.activeElement;
    const activeKey=isEditableElement(active)?editableKey(active):null;
    const selection=activeKey && typeof active.selectionStart==='number' ? {start:active.selectionStart,end:active.selectionEnd,direction:active.selectionDirection,scrollTop:active.scrollTop,scrollLeft:active.scrollLeft} : null;
    return {values,activeKey,selection};
  }

  function restoreEditableState(snapshot) {
    if(!snapshot) return;
    for(const item of snapshot.values||[]) {
      const el=document.querySelector(item.key); if(!el) continue;
      if(el.matches?.('[contenteditable=true]')) el.innerHTML=item.value;
      else if(el.type==='checkbox'||el.type==='radio') el.checked=Boolean(item.checked);
      else el.value=item.value;
    }
    if(snapshot.activeKey) {
      const active=document.querySelector(snapshot.activeKey);
      if(active) {
        active.focus({preventScroll:true});
        if(snapshot.selection && typeof active.setSelectionRange==='function') {
          try { active.setSelectionRange(snapshot.selection.start,snapshot.selection.end,snapshot.selection.direction); active.scrollTop=snapshot.selection.scrollTop; active.scrollLeft=snapshot.selection.scrollLeft; } catch {}
        }
      }
    }
  }

  function render() {
    const root=$('#root'); if(!root)return;
    const editableSnapshot=captureEditableState();
    const existingDraft=$('#talkInput')?.value;
    if(existingDraft!=null) state.draft=existingDraft;
    try {
      const storage=ZekeData.snapshot(); state.storage=storage; state.ai=ZekeAIRouter.status(); state.route=routeFromHash();
      if(['booting','connecting','reconnecting'].includes(storage.status)) root.innerHTML=loadingHTML(storage.status==='reconnecting'?'Reconnecting to your workspace…':'Starting ZEKE…');
      else if(storage.status!=='connected') root.innerHTML=setupHTML(storage);
      else root.innerHTML=connectedAppHTML();
      bind();
      requestAnimationFrame(()=>{
        const t=$('#conversationThread'); if(t && t.dataset.userScrolled!=='true')t.scrollTop=t.scrollHeight;
        const input=$('#talkInput');
        if(input && state.draft && !input.value) input.value=state.draft;
        restoreEditableState(editableSnapshot);
      });
    } catch (error) {
      console.error('ZEKE render failure', error);
      root.innerHTML=`<div class="connection-screen"><div class="connect-card wide"><div class="brand-mark big">Z</div><h1>ZEKE could not draw this screen</h1><p>Your stored data has not been changed. This is a display failure, not an empty-data result.</p><pre class="render-error">${esc(error?.message||String(error))}</pre><button class="primary large" id="retryRender">Retry dashboard</button><button class="secondary" id="openIntegrityFromError">Open Data Integrity</button><div class="build-label center">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></div></div>`;
      $('#retryRender')?.addEventListener('click',()=>location.reload());
      $('#openIntegrityFromError')?.addEventListener('click',()=>go('data-integrity'));
    }
  }

  function humanEvent(e) {
    const s=e.structured||{};
    if(e.category==='measurement'||e.category==='lab') return `${METRICS[canonicalMetric(metricId(e))]?.label||metricId(e)||e.category}: ${metricValue(e)??'—'} ${s.unit||''}`.trim();
    if(isWorkoutEvent(e)) { const ws=workoutStructured(e); return `${ws.exercise||'Workout'}${s.weight?` · ${s.weight} ${s.weight_unit||'lb'}`:''}${s.reps?` · ${s.reps} reps`:''}${ws.sets?` · ${ws.sets} sets`:''}${ws.duration_min?` · ${ws.duration_min} min`:''}`; }
    if(e.category==='medication') return `${s.medication_name||s.name||'Medication'}${s.dose?` ${s.dose}${s.unit||''}`:''} · ${s.status||'recorded'}`;
    return e.raw_text||e.category||'Record';
  }


  function looksLikeWorkoutInput(text){
    const t=String(text||'').toLowerCase();
    const hasExercise=/\b(workout|exercise|stair\s*climber|climbmill|lat\s*pull|seated\s*row|glute|leg\s*curl|leg\s*extension|bicep|abdominal|bench\s*press|massage\s*chair|steps?)\b/.test(t);
    const hasTrainingNumbers=/\b\d+(?:\.\d+)?\s*(?:lb|lbs)?\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?\b|\b\d+\s*(?:min|mins|minutes|steps)\b/.test(t);
    return hasExercise && hasTrainingNumbers;
  }

  function compactWorkoutDraft(parsed){
    return {summary:parsed?.summary||'',events:(parsed?.events||[]).map(e=>({timestamp:e.timestamp,structured:e.structured}))};
  }


  function recentMeasurementSession(metric='weight', minutes=20) {
    const cutoff=Date.now()-minutes*60*1000;
    return [...state.events].reverse().find(e=>{
      const ts=new Date(e.recorded_at||e.timestamp||0).getTime();
      return (e.category==='measurement'||e.category==='lab') && canonicalMetric(metricId(e))===metric && ts>=cutoff;
    }) || null;
  }

  function contextualBodyFatInterpretation(text, rawId) {
    const m=String(text||'').trim().match(/^(?:body\s*)?(\d{1,2}(?:\.\d+)?)\s*%?\s*(?:body\s*)?fat(?:\s*%|\s*percent)?$/i)
      || String(text||'').trim().match(/^(\d{1,2}(?:\.\d+)?)\s*%\s*fat$/i);
    if(!m) return null;
    const value=Number(m[1]); if(!Number.isFinite(value)||value<1||value>80) return null;
    const related=recentMeasurementSession('weight',30);
    const sessionId=related?.structured?.measurement_session_id || related?.id || `measurement:${localDay()}`;
    return {confidence:0.98,summary:`body fat ${value}%${related?' linked to the recent weight measurement':''}`,events:[{
      category:'measurement',timestamp:related?.timestamp||new Date().toISOString(),raw_text:text,
      structured:{metric_id:'body_fat_pct',value,unit:'%',measurement_session_id:sessionId,interpretation_status:'confirmed'},
      provenance:{source:'conversation',context_link:related?.id||null}
    }]};
  }

  function pendingQuestionChoices(q){
    const key=String(q?.question_key||'');
    if(key.startsWith('import_bp:')) return [
      {label:'Mark as invalid',value:'question-bp-invalid'},
      {label:'Reverse values',value:'question-bp-reverse'},
      {label:'Keep as entered',value:'question-bp-keep'},
      {label:'Why are you asking?',value:'question-why'},
      {label:'None of these fit',value:'question-other'}
    ];
    if(key.startsWith('duplicate_import:')) return [
      {label:'Same event — keep one',value:'question-duplicate-merge'},
      {label:'Separate events',value:'question-duplicate-keep'},
      {label:'Show differences',value:'question-why'},
      {label:'None of these fit',value:'question-other'}
    ];
    return [
      {label:'Answer',value:'question-answer'},
      {label:'Later',value:'question-later'},
      {label:"I don't know",value:'question-unknown'},
      {label:'Why are you asking?',value:'question-why'},
      {label:'None of these fit',value:'question-other'}
    ];
  }

  async function invalidateBloodPressureQuestion(q){
    const c=q.import_candidate||{}; const sys=Number(c.systolic), dia=Number(c.diastolic);
    const affected=state.events.filter(e=>{
      const id=canonicalMetric(metricId(e)); const v=Number(metricValue(e));
      return ((id==='bp_systolic'&&v===sys)||(id==='bp_diastolic'&&v===dia)) && !['invalid','quarantined'].includes(String(e.structured?.interpretation_status||''));
    });
    for(const e of affected) await ZekeData.updateEvent(e.id,{structured:{...e.structured,interpretation_status:'invalid',data_quality_status:'quarantined'},correction_note:'User confirmed this was not a valid blood-pressure datapoint.'});
    await ZekeData.resolveFactor(q.id,'resolved','Marked invalid by user');
    return affected.length;
  }

  async function sendConversation(text) {
    text=String(text||'').trim(); if(!text||state.busy)return;
    state.busy=true; pushUser(text); render();
    let raw=null;
    try { raw=await ZekeData.addRawInput(text,state.context); state.events=await ZekeData.listEvents(); }
    catch(e){ pushZeke(`I couldn't preserve that input in connected storage yet. I won't pretend it was saved. ${e.message}`); state.busy=false; render(); return; }

    const bmiRequest=/\b(?:calculate|figure out|what(?:'s| is))\s+(?:my\s+)?bmi\b|\bbmi\b/i.test(text);
    if(bmiRequest){
      const heightMatch=[...state.factors].reverse().find(f=>/height/i.test(`${f.question_key||''} ${f.summary||''} ${f.answer||''}`));
      const convHeight=[...state.conversation].reverse().map(m=>m.text).find(t=>/\b\d\s*(?:ft|feet|')\s*\d{1,2}\s*(?:in|inches|\")?/i.test(t)||/\b\d'\d{1,2}\"?/i.test(t));
      const hText=String(heightMatch?.answer||heightMatch?.summary||convHeight||'');
      const hm=hText.match(/(\d)\s*(?:ft|feet|')\s*(\d{1,2})|\b(\d)'(\d{1,2})/i);
      const inches=hm?(Number(hm[1]||hm[3])*12+Number(hm[2]||hm[4])):69;
      const weights=allMetricSeries('weight').filter(x=>Number.isFinite(Number(x.value))).sort((a,b)=>new Date(a.date)-new Date(b.date));
      const latest=weights.at(-1);
      if(latest){const bmi=Number(latest.value)*703/(inches*inches);pushZeke(`Using your recorded height of ${Math.floor(inches/12)}'${inches%12}\" and your latest verified weight of ${Number(latest.value).toFixed(1)} lb, your BMI is ${bmi.toFixed(1)}. BMI is a screening measure and does not distinguish fat from muscle.`);await ZekeData.updateEvent(raw.id,{structured:{interpretation_status:'confirmed',intent:'calculate_bmi',height_in:inches,weight_lb:Number(latest.value),result:Number(bmi.toFixed(1))}},{appendCorrection:false});state.busy=false;render();return;}
      pushZeke('I can calculate that, but I do not have a verified weight available. What weight should I use?');state.context={task:'calculate_bmi',height_in:inches};state.busy=false;render();return;
    }

    const bodyFatContext=contextualBodyFatInterpretation(text,raw.id);
    if(bodyFatContext){
      state.pending={type:'confirm',rawId:raw.id,rawText:text,parsed:bodyFatContext};
      pushZeke(`I interpreted that as ${bodyFatContext.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Edit',value:'confirm-correct'},{label:'Not body fat',value:'confirm-ignore'}]});
      state.busy=false; render(); return;
    }

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
    const localParsed=ZekeParser.interpret(text,state.context);
    if(aiAvailable && looksLikeWorkoutInput(text)) {
      try {
        const ai=await ZekeAIRouter.interpretWorkout(text,{today:activeDay(),localDraft:compactWorkoutDraft(localParsed),history:state.conversation.slice(0,-1)});
        if(ai.status==='clarify'||ai.clarificationQuestion){state.pending={type:'ai-clarify',rawId:raw.id,rawText:text,ai};pushZeke(`${ai.clarificationQuestion||'I need one more workout detail before I save this.'} I’m asking because the answer changes how the session is structured.`,{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});state.busy=false;render();return;}
        parsed={confidence:ai.confidence||0.88,summary:ai.summary||'the workout sessions you described',events:ai.events||[],aiSource:`${ai.provider}/${ai.model}`};
      } catch(e) {
        parsed=(localParsed.events||[]).length?localParsed:null;
      }
    } else if(aiAvailable) {
      try {
        const verifiedContext={active_context:{...state.context,active_date:activeDay()},open_question:state.pending?.question?.question||null,actions:(state.actions.catalog||[]).map(a=>({label:a.label,schedule:a.schedule})),recent_verified_events:state.events.filter(e=>!['raw_input','correction'].includes(e.category)).slice(-30).map(e=>({category:e.category,timestamp:e.timestamp,structured:e.structured}))};
        const ai=await ZekeAIRouter.interpret(text,{...verifiedContext,history:state.conversation.slice(0,-1)});
        if(ai.status==='clarify'||ai.clarificationQuestion){state.pending={type:'ai-clarify',rawId:raw.id,rawText:text,ai};pushZeke(ai.clarificationQuestion||'I need one more detail before I save this.',{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});state.busy=false;render();return;}
        parsed={confidence:ai.confidence||0.8,summary:ai.summary||'the information you described',events:ai.events||[],aiSource:`${ai.provider}/${ai.model}`};
      } catch(e) { parsed=null; }
    }
    parsed ||= localParsed;
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
    if(state.syncSource) syncConnectedWorkbook({quiet:true}).catch(()=>{});
    pushZeke(`Saved. I recorded ${p.parsed.summary}.`);
    state.pending=null; state.context={}; await refreshData(); render();
  }

  async function openNextQuestion() {
    const q=openQuestions()[0]; if(!q){pushZeke("I don't have any unresolved questions for you right now.");render();return;}
    state.pending={type:'question',question:q};
    pushZeke(`${q.question}${q.why_it_matters?` Why I’m asking: ${q.why_it_matters}`:''}`,{choices:pendingQuestionChoices(q)}); render();
  }

  async function handleQuestionChoice(value) {
    const q=state.pending?.question; if(!q)return;
    showToast('Working…');
    if(value==='question-answer'){pushZeke('Go ahead—answer in your own words. I’ll interpret it in the context of this question.'); state.pending={type:'question-awaiting',question:q}; render();return;}
    if(value==='question-other'){pushZeke("My choices did not fit. Tell me what you want to happen in your own words, and I’ll keep this question attached to your reply.");state.pending={type:'question-awaiting',question:q,other:true};render();return;}
    if(value==='question-why'){pushZeke(q.why_it_matters||'I am asking because the answer changes whether this record is saved, excluded, merged, or corrected.');render();return;}
    if(value==='question-later'){await ZekeData.resolveFactor(q.id,'deferred','');pushZeke('Moved to Data Integrity for later review. No data was changed.');state.pending=null;await refreshData();render();return;}
    if(value==='question-unknown'){await ZekeData.resolveFactor(q.id,'unknown',"I don't know");pushZeke("Recorded as unknown. I will not guess, and the item will stay out of analysis if it is unsafe.");state.pending=null;await refreshData();render();return;}
    if(value==='question-ignore'){await ZekeData.resolveFactor(q.id,'dismissed','Ignored by user');pushZeke('Dismissed. No structured data was changed.');state.pending=null;await refreshData();render();return;}
    if(value==='question-bp-invalid'){
      const n=await invalidateBloodPressureQuestion(q);
      pushZeke(`Done. I marked ${n||'the'} related blood-pressure record${n===1?'':'s'} invalid and excluded ${n===1?'it':'them'} from charts, coaching, and AI evidence. The original import evidence remains in the audit history.`);
      state.pending=null;await refreshData();render();return;
    }
    if(value==='question-bp-keep'){
      const c=q.import_candidate||{};
      if(Number.isFinite(Number(c.systolic))&&Number.isFinite(Number(c.diastolic))){
        await ZekeData.addEvent({category:'measurement',timestamp:c.timestamp||new Date().toISOString(),structured:{metric_id:'bp_systolic',value:Number(c.systolic),unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(c.provenance||{}),source:'user-confirmed-import'}});
        await ZekeData.addEvent({category:'measurement',timestamp:c.timestamp||new Date().toISOString(),structured:{metric_id:'bp_diastolic',value:Number(c.diastolic),unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(c.provenance||{}),source:'user-confirmed-import'}});
      }
      await ZekeData.resolveFactor(q.id,'resolved','Keep as entered');pushZeke('Kept as entered. I added the confirmed pair to the event record and preserved its source.');state.pending=null;await refreshData();render();return;}
    if(value==='question-bp-reverse'){
      const c=q.import_candidate||{};
      await ZekeData.addEvent({category:'measurement',timestamp:c.timestamp||new Date().toISOString(),structured:{metric_id:'bp_systolic',value:Number(c.diastolic),unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(c.provenance||{}),source:'user-corrected-import'}});
      await ZekeData.addEvent({category:'measurement',timestamp:c.timestamp||new Date().toISOString(),structured:{metric_id:'bp_diastolic',value:Number(c.systolic),unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(c.provenance||{}),source:'user-corrected-import'}});
      await ZekeData.resolveFactor(q.id,'resolved',`Reverse to ${c.diastolic}/${c.systolic}`);
      pushZeke(`Corrected and saved as ${c.diastolic}/${c.systolic}. The original candidate remains in the audit history.`);
      state.pending=null;await refreshData();render();return;
    }
    if(value==='question-duplicate-merge'){
      await ZekeData.resolveFactor(q.id,'resolved','Treat as duplicate; keep one canonical record');
      pushZeke('Resolved as one event. The existing canonical record remains; the held candidate was not added, and its import evidence remains attached to this resolution.');state.pending=null;await refreshData();render();return;}
    if(value==='question-duplicate-keep'){
      if(q.candidate_event) await ZekeData.addEvent({...q.candidate_event,provenance:{...(q.candidate_event.provenance||{}),source:'import-confirmed-separate'}});
      await ZekeData.resolveFactor(q.id,'resolved','Keep as separate real events');pushZeke('Kept as separate events. I added the held candidate as a confirmed separate observation.');state.pending=null;await refreshData();render();return;}
  }

  async function handlePendingAnswer(text) {
    if(state.pending?.type==='question-awaiting') {
      pushUser(text); render();
      const q=state.pending.question;
      const aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);
      if(aiAvailable){
        try{
          const r=await ZekeAIRouter.resolveClarification(text,{question:q.question,why:q.why_it_matters,question_key:q.question_key,allowed_actions:pendingQuestionChoices(q).map(x=>({id:x.value,label:x.label})),target:q.import_candidate||q.candidate_event||null,history:state.conversation.slice(0,-1)});
          if(r.action_id && r.action_id!=='question-other'){ await handleQuestionChoice(r.action_id); return true; }
        }catch{}
      }
      const applied=await applyQuestionAnswer(q,text);
      if(applied.applied){
        await ZekeData.resolveFactor(q.id,'resolved',text);
        pushZeke(applied.message);
        state.pending=null;
      } else {
        await ZekeData.saveFactor({...q,status:'open',answer_attempt:text,last_attempt_at:new Date().toISOString()});
        pushZeke(`${applied.message} This question is still open so the underlying data is not treated as resolved.`);
        state.pending={type:'question-awaiting',question:{...q,status:'open',answer_attempt:text}};
      }
      await refreshData();render();return true;
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
      const pendingContext={...state.context,original_input:state.pending.rawText,pending_question:state.pending.ai?.clarificationQuestion||null};
      let parsed=ZekeParser.interpret(text,pendingContext);
      const aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);
      if(aiAvailable && (!(parsed.events||[]).length || (parsed.confidence||0)<0.8)) {
        try { const ai=await ZekeAIRouter.interpret(text,{...pendingContext,history:state.conversation.slice(0,-1)}); parsed={confidence:ai.confidence||0.8,summary:ai.summary||'your clarification',events:ai.events||[]}; } catch {}
      }
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
      const meta=METRICS[value]; state.context={metric:value==='blood_pressure'?'blood_pressure':value,active_date:activeDay()}; pushZeke(`Let's log ${meta?.label||value}. What is the value?`);
    } else if(type==='exercise') { state.context={exercise:value||null,active_date:activeDay()}; pushZeke(value?`Let's log ${value}. You can tell me weight, reps, sets, RPE, pain, or anything else that matters.`:'Tell me about the workout.'); }
    else if(type==='medication') { state.context={medication:value||null,active_date:activeDay()}; pushZeke(value?`Let's log ${value}. What happened?`:'Tell me the medication, supplement, or injection and what happened.'); }
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
      await ZekeData.updateEvent(state.pending.event.id,{category:state.pending.replacement.category,structured:state.pending.replacement.structured,correction_note:'Corrected through Talk to ZEKE'});if(state.syncSource) syncConnectedWorkbook({quiet:true}).catch(()=>{});pushZeke('Corrected. The previous version is preserved in the audit history.');state.pending=null;await refreshData();render();
    }
  }

  function bindTooltips() {
    const tooltip=$('#chartTooltip');
    $$('[data-tip]').forEach(el=>{
      el.addEventListener('mouseenter',e=>{const t=tooltip||ensureGlobalTooltip(); t.textContent=el.dataset.tip; t.classList.add('show'); positionTooltip(t,e)});
      el.addEventListener('mousemove',e=>positionTooltip(tooltip||ensureGlobalTooltip(),e));
      el.addEventListener('mouseleave',()=>{(tooltip||$('#globalTooltip'))?.classList.remove('show')});
      el.addEventListener('focus',e=>{const t=tooltip||ensureGlobalTooltip();t.textContent=el.dataset.tip;t.classList.add('show');const r=el.getBoundingClientRect();positionTooltip(t,{clientX:r.left+r.width/2,clientY:r.top});});
      el.addEventListener('blur',()=>{(tooltip||$('#globalTooltip'))?.classList.remove('show')});
      el.addEventListener('click',e=>{const t=tooltip||ensureGlobalTooltip();t.textContent=el.dataset.tip;t.classList.add('show');positionTooltip(t,e);e.stopPropagation();});
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
    // Connected-workbook evidence must have an explicit, parseable source date.
    // Never substitute the sync time: that previously turned historical values into false current observations.
    if(rawDate===null || rawDate===undefined || rawDate==='') return [];
    let d; const serial=Number(rawDate);
    if (Number.isFinite(serial) && serial>20000 && serial<80000) d=new Date((serial-25569)*86400*1000);
    else if(rawDate instanceof Date) d=new Date(rawDate.getTime());
    else d=new Date(rawDate);
    if(!d || Number.isNaN(d.getTime())) return [];
    const timestamp=d.toISOString();
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
    const duration=asNum(get('duration_min','cardio_min','cardio_minutes','minutes','duration','exercise_duration'));
    const steps=asNum(get('cardio_steps','steps','step_count'));
    const distance=asNum(get('distance_mi','miles','distance'));
    const activity=get('activity','cardio_type','modality','machine_or_modality','exercise_desc','exercise_description','exercise');
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
    addMetric('resting_hr',get('resting_hr','resting_heart_rate','resting_heartbeat','rhr'),'bpm');
    addMetric('a1c',get('a1c','hba1c','hemoglobin_a1c'),'%','lab');
    addMetric('ldl',get('ldl','ldl_cholesterol','ldl_direct_measure'),'mg/dL','lab');
    addMetric('average_glucose',get('average_glucose','estimated_average_glucose'),'mg/dL','lab');
    addMetric('total_cholesterol',get('cholesterol','total_cholesterol'),'mg/dL','lab');
    addMetric('hdl',get('highdensity_chol','high_density_chol','hdl','hdl_cholesterol'),'mg/dL','lab');
    addMetric('triglycerides',get('triglicerides','triglycerides'),'mg/dL','lab');
    addMetric('apob',get('apolipoprotein_b','apob'),'mg/dL','lab');
    addMetric('lpa',get('lipoprotein_a','lpa','lp_a'),'mg/dL','lab');
    addMetric('wbc',get('wbc'),'10^3/uL','lab');
    addMetric('hgb',get('hgb','hemoglobin'),'g/dL','lab');
    addMetric('hct',get('hct','hematocrit'),'%','lab');
    addMetric('mcv',get('mcv'),'fL','lab');
    addMetric('platelets',get('platelets'),'10^3/uL','lab');
    addMetric('alt',get('alt_sgpt','alt'),'U/L','lab');
    addMetric('vitamin_b12',get('vitamin_b12','b12'),'pg/mL','lab');
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

    // Daily intervention-dose columns in the longitudinal health workbook.
    const givenDose=asNum(get('given_dose','tirzepatide_dose','mounjaro_dose','zepbound_dose'));
    if(givenDose!=null) out.push({category:'medication',timestamp,raw_text:'',structured:{medication_name:'tirzepatide',dose:givenDose,unit:'mg',status:'taken',interpretation_status:'confirmed'},provenance:source});

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


  const normHeader=v=>String(v??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  async function sha256Text(value){const data=new TextEncoder().encode(String(value));const digest=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');}
  async function sha256Buffer(buffer){const digest=await crypto.subtle.digest('SHA-256',buffer);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');}
  function detectHeaderRow(matrix){
    const anchors=['date','weight_lbs','given_dose','exercise_desc','exercise_duration','hemoglobin_a1c','ldl_direct_measure'];
    let best={index:0,score:-1};
    for(let i=0;i<Math.min(matrix.length,30);i++){
      const headers=(matrix[i]||[]).map(normHeader); const nonempty=headers.filter(Boolean).length;
      const score=anchors.filter(a=>headers.includes(a)).length*10 + Math.min(nonempty,20);
      if(score>best.score)best={index:i,score};
    }
    return best.index;
  }
  function workbookRows(workbook){
    const rows=[]; const diagnostics=[];
    for(const sheetName of workbook.SheetNames){
      const sheet=workbook.Sheets[sheetName];
      const matrix=window.XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true,blankrows:true});
      if(!matrix.length)continue;
      const headerIndex=detectHeaderRow(matrix); const headers=(matrix[headerIndex]||[]).map((h,i)=>String(h||`Column ${i+1}`).trim());
      let accepted=0;
      for(let r=headerIndex+1;r<matrix.length;r++){
        const values=matrix[r]||[]; if(!values.some(v=>String(v??'').trim()!==''))continue;
        const row={__sheet:sheetName,__source_row:r+1,__header_row:headerIndex+1,__source_cells:{}};
        headers.forEach((h,i)=>{
          row[h]=values[i]??'';
          if(values[i]!==undefined && values[i]!==null && String(values[i]).trim()!=='') row.__source_cells[normHeader(h)]=window.XLSX.utils.encode_cell({r,c:i});
        });
        rows.push(row); accepted++;
      }
      diagnostics.push({sheet:sheetName,header_row:headerIndex+1,rows_read:accepted,columns:headers.filter(Boolean).length});
    }
    return {rows,diagnostics};
  }
  function eventSubkey(c){const st=c.structured||{};return [c.category,st.metric_id||'',st.exercise||'',st.medication_name||'',st.symptom||'',st.note_type||''].join(':').toLowerCase();}
  function candidateSourceCell(c,row){
    const st=c.structured||{}, cells=row.__source_cells||{};
    const aliases={weight:['weight_lbs','weight_lb','weight','body_weight','bodyweight'],body_fat_pct:['fat','fat_pct','body_fat','body_fat_pct','body_fat_percentage'],energy:['energy_1_10','energy'],appetite:['appetite_1_10','appetite','hunger','hunger_1_10'],resting_hr:['resting_heartbeat','resting_hr','resting_heart_rate','rhr'],a1c:['hemoglobin_a1c','a1c','hba1c'],average_glucose:['average_glucose','estimated_average_glucose'],ldl:['ldl_direct_measure','ldl','ldl_cholesterol'],total_cholesterol:['cholesterol','total_cholesterol'],hdl:['highdensity_chol','high_density_chol','hdl','hdl_cholesterol'],triglycerides:['triglicerides','triglycerides'],apob:['apolipoprotein_b','apob'],lpa:['lipoprotein_a','lpa','lp_a']};
    const wanted=aliases[st.metric_id]||[];
    if(c.category==='medication') wanted.push('given_dose','tirzepatide_dose','mounjaro_dose','zepbound_dose');
    if(c.category==='workout') wanted.push('exercise_desc','exercise_description','exercise','exercise_duration','duration');
    for(const key of wanted)if(cells[key])return cells[key];
    return null;
  }
  async function enrichSourceIdentity(c,row,source){
    const sourceCell=candidateSourceCell(c,row);
    if(!sourceCell) return null;
    const logical=[source.id,normHeader(row.__sheet),sourceCell,eventSubkey(c)].join('|');
    const payload=JSON.stringify({category:c.category,timestamp:c.timestamp,structured:c.structured,raw_text:c.raw_text||''});
    c.provenance={...(c.provenance||{}),source:'connected-workbook',file:source.name,sheet:row.__sheet,source_row:row.__source_row,source_cell:sourceCell,header_row:row.__header_row,source_id:source.id,evidence_mode:'literal-cell-only',source_key:await sha256Text(logical),source_fingerprint:await sha256Text(payload)};
    return c;
  }
  async function buildWorkbookCandidates(workbook,source){
    const parsed=workbookRows(workbook); const candidates=[]; let unmapped=0;
    for(const row of parsed.rows){
      const mapped=rowCandidates(row,source.name);
      if(!mapped.length){unmapped++;continue;}
      for(const c of mapped){const enriched=await enrichSourceIdentity(c,row,source);if(enriched)candidates.push(enriched);}
    }
    return {candidates,rows:parsed.rows,diagnostics:parsed.diagnostics,unmapped};
  }
  async function mirrorEventsIntoWorkbook(workbook){
    const events=await ZekeData.listEvents();
    const rows=[['ZEKE Event ID','Timestamp','Category','Metric / Exercise / Medication','Value','Unit','Details','Source','Updated At']];
    for(const e of events.filter(x=>!['raw_input','correction'].includes(x.category))){const st=e.structured||{};rows.push([e.id,e.timestamp||'',e.category,st.metric_id||st.exercise||st.medication_name||st.symptom||st.note_type||'',st.value??st.dose??st.duration_min??'',st.unit||st.weight_unit||'',JSON.stringify(st),e.provenance?.source||'',e.updated_at||e.recorded_at||'']);}
    const name='ZEKE Events'; if(workbook.Sheets[name])delete workbook.Sheets[name]; workbook.Sheets[name]=window.XLSX.utils.aoa_to_sheet(rows);
    if(!workbook.SheetNames.includes(name))workbook.SheetNames.push(name);
    workbook.Sheets[name]['!cols']=[{wch:38},{wch:24},{wch:16},{wch:28},{wch:12},{wch:12},{wch:60},{wch:22},{wch:24}];
    return workbook;
  }
  async function synchronizeWorkbookBuffer(buffer,fileName,{link=false,quiet=false}={}){
    if(!window.XLSX)throw new Error('Spreadsheet reader did not load. Refresh and try again.');
    let source=await ZekeData.getSyncSource();
    if(link||!source){source=await ZekeData.saveSyncSource(fileName,buffer,{})}
    const workbook=window.XLSX.read(buffer,{type:'array',cellDates:true});
    const built=await buildWorkbookCandidates(workbook,source);
    if(!built.candidates.length)throw new Error('No safely interpretable health records were found. Nothing was changed.');
    const report=await ZekeData.reconcileSourceEvents(built.candidates,{source:source.id,file:source.name});
    // Build a separate human-readable mirror workbook. The connected source is kept byte-for-byte intact.
    const mirror=window.XLSX.utils.book_new(); await mirrorEventsIntoWorkbook(mirror);
    const output=window.XLSX.write(mirror,{type:'array',bookType:'xlsx',compression:true});
    await ZekeData.updateSyncSourceWorkbook(output,{...report,diagnostics:built.diagnostics,rows_read:built.rows.length,unmapped_rows:built.unmapped});
    state.syncReport={...report,diagnostics:built.diagnostics,rows_read:built.rows.length,unmapped_rows:built.unmapped}; state.syncSource=await ZekeData.getSyncSource();
    if(!quiet)showToast(`Sync complete: ${report.created} created, ${report.updated} updated, ${report.unchanged} unchanged.`);
    return state.syncReport;
  }
  async function syncConnectedWorkbook({quiet=false}={}){
    if(state.syncBusy)return; state.syncBusy=true;
    try{const linked=await ZekeData.readSyncSourceWorkbook();if(!linked?.buffer)return null;return await synchronizeWorkbookBuffer(linked.buffer,linked.source.name,{link:false,quiet});}
    finally{state.syncBusy=false;}
  }

  async function handleImport(file) {
    const status=$('#importStatus'); state.importStatus='Reading file…'; if(status)status.textContent=state.importStatus;
    try {
      const lowerName=file.name.toLowerCase(); let rows=[]; let historyPackage=null;
      if(lowerName.endsWith('.xlsx')) {
        const buffer=await file.arrayBuffer();
        const report=await synchronizeWorkbookBuffer(buffer,file.name,{link:true,quiet:true});
        state.importReport={file:file.name,counts:{rows_read:report.rows_read,records_created:report.created,records_updated:report.updated,unchanged:report.unchanged,linked_existing:report.linked_existing,conflicts:report.conflicts,unmapped_rows:report.unmapped_rows},message:'The workbook is now connected in your Project Zeke Drive folder. Future releases reload it automatically; repeated syncs are idempotent.'};
        state.importStatus=`Connected and synchronized ${file.name}: ${report.created} created, ${report.updated} updated, ${report.unchanged} unchanged.`;
        await refreshData(); render(); return;
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

  function openExerciseEntryModal(name){
    $('#directExerciseModal')?.remove();
    const latest=(workoutGroups().get(name)||[]).at(-1)||{};
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="directExerciseModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Add ${esc(name)}</h2><p>This will be added to the workout for the selected date. Prior values are suggestions only.</p></div><button class="icon-btn" id="closeDirectExercise" aria-label="Close">×</button></div><form id="directExerciseForm" class="direct-entry-form"><label>Date<input id="directExerciseDate" type="date" value="${esc(activeDay())}" required></label><label>Weight (lb)<input id="directExerciseWeight" type="number" step="0.1" min="0" placeholder="${latest.weight??''}"></label><label>Reps<input id="directExerciseReps" type="number" step="1" min="1" placeholder="${latest.reps??''}"></label><label>Sets<input id="directExerciseSets" type="number" step="1" min="1" placeholder="${latest.sets??''}"></label><label class="wide">Notes (optional)<textarea id="directExerciseNotes" rows="2" placeholder="Pain, RPE, form, or other details"></textarea></label><div class="direct-entry-hint wide">${latest.weight!=null||latest.reps!=null||latest.sets!=null?`Last verified: ${latest.weight!=null?`${latest.weight} lb`:''}${latest.reps!=null?` · ${latest.reps} reps`:''}${latest.sets!=null?` · ${latest.sets} sets`:''}. Nothing is copied unless you enter it.`:'No prior verified values available.'}</div><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelDirectExercise">Cancel</button><button type="submit" class="primary">Save exercise</button></div><p class="form-error wide" id="directExerciseError" hidden></p></form></div></div>`);
    const close=()=>$('#directExerciseModal')?.remove();
    $('#closeDirectExercise')?.addEventListener('click',close);$('#cancelDirectExercise')?.addEventListener('click',close);
    $('#directExerciseModal')?.addEventListener('click',e=>{if(e.target.id==='directExerciseModal')close()});
    $('#directExerciseForm')?.addEventListener('submit',async e=>{e.preventDefault();const date=$('#directExerciseDate').value;const weight=Number($('#directExerciseWeight').value);const reps=Number($('#directExerciseReps').value);const sets=Number($('#directExerciseSets').value);const notes=$('#directExerciseNotes').value.trim();const w=Number.isFinite(weight)&&weight>0?weight:null;const r=Number.isFinite(reps)&&reps>0?reps:null;const st=Number.isFinite(sets)&&sets>0?sets:null;const err=$('#directExerciseError');if(w==null&&r==null&&st==null&&!notes){err.hidden=false;err.textContent='Enter at least one workout detail before saving.';return;}try{await ZekeData.addEvent({category:'workout',timestamp:`${date}T12:00:00`,raw_text:notes,structured:{exercise:name,workout_id:`workout-${date}`,weight:w,weight_unit:w!=null?'lb':'',reps:r,sets:st,notes,interpretation_status:'confirmed'},provenance:{source:'direct-exercise-entry',entry_mode:'structured-form'}});close();await refreshData();render();showToast(`${name} added to the ${fmtDate(date+'T12:00:00',{month:'short',day:'numeric'})} workout.`)}catch(ex){err.hidden=false;err.textContent=ex.message||'The exercise could not be saved.'}});
  }

  function bind() {
    $('#helpBtn')?.addEventListener('click',()=>showToast(`Help for ${state.route}: click metric tiles for evidence and interpretation; use Talk to ZEKE to log, correct, or backfill data.`));
    $('#statusBtn')?.addEventListener('click',()=>{const ai=(state.ai?.providers||[]).filter(x=>x.connected).map(x=>x.label||x.provider).join(', ')||'none';showToast(`ZEKE status — storage: ${state.storage?.providerId||'not connected'}; AI: ${ai}; open reviews: ${openQuestions().length}.`);});
    $('#menuButton')?.addEventListener('click',()=>document.body.classList.add('nav-open'));
    $('#sidebarClose')?.addEventListener('click',()=>document.body.classList.remove('nav-open'));
    $('#sidebarScrim')?.addEventListener('click',()=>document.body.classList.remove('nav-open'));
    $('#globalTalkButton')?.addEventListener('click',()=>document.body.classList.add('global-talk-open'));
    $('#globalTalkBackdrop')?.addEventListener('click',()=>document.body.classList.remove('global-talk-open'));
    $('#auditSearch')?.addEventListener('input',debounce((ev)=>{state.auditQuery=ev.target.value;render();},180));
    $('#auditCategory')?.addEventListener('change',(ev)=>{state.auditCategory=ev.target.value;render();});
    $('#exportDataAudit')?.addEventListener('click',()=>{
      const a=dataCensus();
      const payload={generated_at:new Date().toISOString(),build:BUILD,read_only:true,summary:{loaded_events:a.rows.length,chartable_health_values:a.chartable,recognized_workouts:a.recognizedWorkouts,possible_workouts:a.possibleWorkouts,needs_review:a.uncertain,earliest:a.earliest,latest:a.latest},categories:a.categoryCounts,sources:a.sourceCounts,metrics:a.metricCounts,import_batches:state.importBatches,records:a.rows.map(r=>({id:r.event.id,date:r.date,classification:r.category,source:r.source,recognized_workout:r.workout,metric:r.metric,summary:auditRecordSummary(r),status:r.event.structured?.interpretation_status||r.event.status||'loaded'}))};
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const aEl=document.createElement('a'); aEl.href=url; aEl.download=`ZEKE_Data_Audit_${localDay()}.json`; aEl.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    $$('[data-route]').forEach(el=>el.onclick=()=>{document.body.classList.remove('nav-open');go(el.dataset.route)});
    $$('[data-range]').forEach(el=>el.onclick=()=>{state.range=el.dataset.range;render()});
    $$('[data-select-metric]').forEach(el=>el.onclick=()=>{state.selectedMetric=el.dataset.selectMetric;render()});
    $$('.metric-card[data-metric]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('button'))return;e.preventDefault();e.stopPropagation();openMetricDetail(el.dataset.metric);}));
    $$('[data-log-metric]').forEach(el=>el.onclick=()=>startContextLog('metric',el.dataset.logMetric));
    $$('[data-context-exercise]').forEach(el=>el.onclick=()=>startContextLog('exercise',el.dataset.contextExercise));
    $$('[data-context-medication]').forEach(el=>el.onclick=()=>startContextLog('medication',el.dataset.contextMedication));
    $$('[data-action-id]').forEach(el=>el.onclick=()=>handleAction(el.dataset.actionId));
    $$('[data-edit-event]').forEach(el=>el.onclick=()=>editEvent(el.dataset.editEvent));

    $('#sendBtn')?.addEventListener('click',async()=>{const input=$('#talkInput');const text=input?.value||'';if(input)input.value='';if(await handlePendingAnswer(text))return;if(await handleEditAnswer(text))return;sendConversation(text)});
    $('#talkInput')?.addEventListener('input',e=>{state.draft=e.target.value;});
    document.querySelectorAll('input:not([type=file]), textarea, select, [contenteditable=true]').forEach(el=>el.addEventListener('blur',()=>{if(state.deferredRender && !isEditableElement(document.activeElement)){state.deferredRender=false;render();}}));
    $('#talkInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#sendBtn')?.click()}});
    $('#questionPill')?.addEventListener('click',()=>go('questions'));
    $('#activeDateInput')?.addEventListener('change',e=>setActiveDate(e.target.value));
    $('#clearActiveDate')?.addEventListener('click',()=>setActiveDate(''));
    $('#quickWeightForm')?.addEventListener('submit',async e=>{e.preventDefault();const v=Number($('#quickWeightValue')?.value);if(!Number.isFinite(v)||v<=0)return;const ts=`${activeDay()}T12:00:00`;await ZekeData.addEvent({category:'measurement',timestamp:ts,structured:{metric_id:'weight',value:v,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'direct-tile-entry'}});pushZeke(`Saved ${v} lb for ${activeDateLabel()}.`,{undo_event_id:null});await refreshData();render();});
    $$('[data-quick-exercise]').forEach(el=>el.addEventListener('click',()=>openExerciseEntryModal(el.dataset.quickExercise)));
    $('#addHealthHistory')?.addEventListener('click',()=>{state.context={healthHistory:true};pushZeke('Tell me the personal or family health-history detail you want ZEKE to remember. You can say it naturally, for example: “My sister had a heart attack at 45.”');go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0)});
    $$('[data-conversation-choice]').forEach(el=>el.onclick=async()=>{el.classList.add('selected');el.disabled=true;const original=el.textContent;el.textContent='Working…';const v=el.dataset.conversationChoice;try{if(v.startsWith('question-'))return await handleQuestionChoice(v);if(v.startsWith('edit-'))return await handleEditChoice(v);return await handleChoice(v);}finally{if(document.body.contains(el)){el.disabled=false;el.textContent=original;el.classList.remove('selected');}}});
    $('#expandConversation')?.addEventListener('click',()=>{const expanded=document.body.classList.toggle('conversation-expanded');const btn=$('#expandConversation');if(btn){btn.textContent=expanded?'Collapse':'Expand';btn.setAttribute('aria-expanded',String(expanded));}});
    $('#conversationThread')?.addEventListener('scroll',e=>{const el=e.currentTarget;el.dataset.userScrolled=(el.scrollHeight-el.scrollTop-el.clientHeight>80)?'true':'false';});
    $$('[data-review-question]').forEach(el=>el.onclick=()=>{const q=state.factors.find(f=>f.id===el.dataset.reviewQuestion);if(q){state.pending={type:'question',question:q};const card=el.closest('.question-card');card?.classList.add('review-active');if(card&&!card.querySelector('.scoped-review'))card.insertAdjacentHTML('beforeend',`<div class="scoped-review"><p><strong>${esc(q.question||'Please clarify this item.')}</strong></p><p>${esc(q.why_it_matters||'Your answer will be applied only to this review item.')}</p><textarea id="scopedReviewInput" rows="3" placeholder="Answer in the context of this item…"></textarea><div><button class="primary" id="submitScopedReview">Apply answer</button></div></div>`);$('#submitScopedReview')?.addEventListener('click',()=>handlePendingAnswer($('#scopedReviewInput')?.value||''));}});
    $$('[data-question-action]').forEach(el=>el.onclick=async()=>{const id=el.dataset.questionId;const action=el.dataset.questionAction;await ZekeData.resolveFactor(id,action==='dismiss'?'dismissed':'deferred','');await refreshData();render();});
    $$('[data-review-task-later]').forEach(el=>el.onclick=async()=>{const key=el.dataset.reviewTaskLater;const task=reviewTasks().find(t=>t.key===key);for(const q of task?.items||[])await ZekeData.resolveFactor(q.id,'deferred','');await refreshData();render();});
    $$('[data-insight-evidence]').forEach(el=>el.onclick=(ev)=>{ev.preventDefault();ev.stopPropagation();document.body.insertAdjacentHTML('beforeend',insightEvidenceHTML(el.dataset.insightEvidence));$('#closeEvidenceFocus')?.addEventListener('click',()=>$('#evidenceFocus')?.remove());});
    $('#coachFocus')?.addEventListener('change',e=>{state.coachFocus=e.target.value;state.coachAI=null;state.coachExpanded=false;render()});
    $$('[data-dismiss-coach-alert]').forEach(el=>el.onclick=()=>{state.coachAlertDismissed[el.dataset.dismissCoachAlert]=true;render()});
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

    $$('[data-dismiss-insight]').forEach(el=>el.onclick=async()=>{const set=new Set(state.preferences.dismissedInsights||[]);set.add(el.dataset.dismissInsight);state.preferences={...state.preferences,dismissedInsights:[...set]};await ZekeData.savePreferences(state.preferences);render()});
    $('#refreshInsights')?.addEventListener('click',async()=>{state.preferences={...state.preferences,insightsRefreshedAt:new Date().toISOString()};await ZekeData.savePreferences(state.preferences);showToast('Insights refreshed against the latest verified records.');render()});
    $$('[data-thinking]').forEach(el=>el.onclick=async()=>{const v=el.dataset.thinking;if(v==='track-shakes'||v==='track-creatine'){const label=v==='track-shakes'?'Protein shake':'Creatine';pushZeke(`Great. How often do you normally use ${label.toLowerCase()}, and do you want it in Today's Actions or only logged when you mention it?`);render();$('#talkInput')?.focus()}else if(v==='later'){pushZeke('No problem. I’ll leave that for later.');render()}else{pushZeke('Understood. I won’t keep suggesting that.');render()}});

    $('[data-connect-storage="google-drive"]')?.addEventListener('click',async()=>{try{await ZekeData.connect('google-drive');await refreshData();render()}catch(e){showToast(e.message,'error');render()}});
    $('#reconnectNow')?.addEventListener('click',async()=>{try{await ZekeData.reconnect();await refreshData();render()}catch(e){showToast(e.message,'error');render()}});
    $('#reconnectStorage')?.addEventListener('click',async()=>{try{await ZekeData.reconnect();await refreshData();render();showToast('Storage reconnected.')}catch(e){showToast(e.message,'error')}});
    $('#forgetStorage')?.addEventListener('click',async()=>{if(confirm('Disconnect and forget this browser setup? Your Drive data will not be deleted.')){await ZekeData.disconnect({forgetSetup:true,revoke:false});render()}});
    $('#changeStorage')?.addEventListener('click',async()=>{await ZekeData.disconnect({forgetSetup:true});render()});

    $$('[data-save-ai]').forEach(el=>el.onclick=async()=>{const id=el.dataset.saveAi;const key=$(`[data-ai-key="${id}"]`)?.value.trim();const model=$(`[data-ai-model="${id}"]`)?.value;const endpoint=$(`[data-ai-endpoint="${id}"]`)?.value.trim();const rememberOnDevice=Boolean($(`[data-ai-remember="${id}"]`)?.checked);try{await ZekeAIRouter.configure({provider:id,key,model,endpoint,privacy:'minimum-necessary',rememberOnDevice});const r=await ZekeAIRouter.testProvider(id);state.ai=ZekeAIRouter.status();showToast(`Connection test passed: ${r.provider} · ${r.model}`);render()}catch(e){state.ai=ZekeAIRouter.status();showToast(`Connection failed: ${e.message}`,'error');render()}});
    $$('[data-test-ai]').forEach(el=>el.onclick=async()=>{const id=el.dataset.testAi;try{const key=$(`[data-ai-key="${id}"]`)?.value.trim();const model=$(`[data-ai-model="${id}"]`)?.value;const endpoint=$(`[data-ai-endpoint="${id}"]`)?.value.trim();if(key||endpoint||id==='ollama')await ZekeAIRouter.configure({provider:id,key,model,endpoint,privacy:'minimum-necessary',rememberOnDevice:Boolean($(`[data-ai-remember="${id}"]`)?.checked)});const r=await ZekeAIRouter.testProvider(id);showToast(`Connection test passed: ${r.provider} · ${r.model}`);state.ai=ZekeAIRouter.status();render()}catch(e){showToast(`Test failed: ${e.message}`,'error')}});

    $('#exportAIPacket')?.addEventListener('click',()=>{const packet={packet_type:'ZEKE Manual AI Packet',build:BUILD,created_at:new Date().toISOString(),instructions:'Return analysis as observations, interpretations, evidence, limitations, and proposed actions. Do not treat inferred claims as raw facts.',context:{recent_events:state.events.slice(-50),open_questions:openQuestions(),discoveries:state.discoveries.slice(0,10)}};downloadJSON(packet,`zeke-ai-packet-${localDay()}.json`)});
    $('#importAIResponse')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;const status=$('#aiImportStatus');try{const response=JSON.parse(await file.text());await ZekeData.saveFactor({type:'external_ai_response',status:'review',summary:response.summary||response.analysis||response.title||'Imported AI analysis awaiting review',response,provenance:{source:'manual-ai-packet',file:file.name}});if(status)status.textContent='Imported for review. ZEKE will not treat the AI response as raw fact.';await refreshData()}catch(err){if(status)status.textContent=`Import failed: ${err.message}`}});
    $('#importFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)handleImport(f)});
    $('#syncWorkbookNow')?.addEventListener('click',async()=>{try{state.importStatus='Synchronizing connected workbook…';render();const r=await syncConnectedWorkbook();state.importStatus=`Sync complete: ${r.created} created, ${r.updated} updated, ${r.unchanged} unchanged.`;await refreshData();render()}catch(e){state.importStatus=`Sync failed safely: ${e.message}`;render()}});
    $('#attachBtn')?.addEventListener('click',()=>$('#conversationFile')?.click());
    $('#conversationFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f){pushZeke(`I received ${f.name}. File interpretation through the conversation is not complete in this repair build yet; use Settings → Import existing history for XLSX, JSON, CSV, or TSV data.`);render()}});
    bindTooltips();
  }

  function showToast(message,type='ok'){const t=$('#toast');if(!t)return;t.textContent=message;t.className=`toast show ${type}`;setTimeout(()=>t.classList.remove('show'),5000)}
  function downloadJSON(value,name){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

  async function init() {
    window.addEventListener('hashchange',()=>{state.route=routeFromHash();render()});
    window.addEventListener('zeke:data-changed',debounce(async()=>{await refreshData();if(isEditableElement()){state.deferredRender=true;return;}render()},100));
    window.addEventListener('zeke:storage-state',()=>{if(isEditableElement()){state.deferredRender=true;return;}render();});
    await ZekeAIRouter.hydrateMetadata();
    render();
    await ZekeData.bootstrap();
    if(ZekeData.snapshot().status==='connected'){ await refreshData(); state.syncSource=await ZekeData.getSyncSource(); if(state.syncSource){state.importStatus='Connected workbook ready. Automatic sync is paused in this integrity repair release; use Settings → Sync now after reviewing the source.';} }
    render();
  }

  document.addEventListener('DOMContentLoaded',init);
})();
