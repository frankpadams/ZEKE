(() => {
  'use strict';

  const BUILD = window.ZEKE_BUILD || window.ZEKE_VERSION || { version: '0.21.0', build: '2026.07.18.2' };
  const state = {
    route:'dashboard', range:localStorage.getItem('zeke-fitness-range')||'month', selectedMetric:'weight',
    events:[], factors:[], discoveries:[], actions:{catalog:[],daily_states:{}}, calendar:[],
    conversation:[], pending:null, context:{}, storage:null, ai:null,
    coachExpanded:false, coachCardExpanded:false, coachFocus:'', coachAlertDismissed:{}, activityTab:localStorage.getItem('zeke-activity-tab')||'frequent', expandedActivity:'', healthTab:localStorage.getItem('zeke-health-tab')||'frequent', expandedHealthMetric:'', customizeOpen:false, metricMenuOpen:false, quickLogOpen:false, expandedReviewTasks:new Set(),
    hiddenWidgets:new Set(), busy:false, importStatus:'', importReport:null, importBatches:[],
    conversationLoaded:false, preferences:{}, syncSource:null, syncBusy:false, syncReport:null, syncPreflight:null, coachAI:null, coachAILoading:false, theme:'light', draft:'', auditQuery:'', auditCategory:'all', insightRefreshAt:null, deferredRender:false, activeDate:localStorage.getItem('zeke-active-date')||'', directExercise:null, integrityLastAction:'', activeReviewId:sessionStorage.getItem('zeke-active-review')||'', reviewOriginalOpen:false
  };

  const RUNTIME_LOG_KEY='zeke-runtime-diagnostics-v1';
  function runtimeDiagnostics(){try{return JSON.parse(localStorage.getItem(RUNTIME_LOG_KEY)||'[]')}catch(_){return []}}
  function recordRuntimeIssue(kind,message,detail=''){
    try{const rows=runtimeDiagnostics();rows.push({timestamp:new Date().toISOString(),version:BUILD.version,build:BUILD.build,kind:String(kind||'runtime'),message:String(message||'Unknown error').slice(0,500),detail:String(detail||'').slice(0,1200),route:state.route});localStorage.setItem(RUNTIME_LOG_KEY,JSON.stringify(rows.slice(-200)))}catch(_){}
  }
  window.addEventListener('error',e=>recordRuntimeIssue('window-error',e.message,e.filename?`${e.filename}:${e.lineno||''}:${e.colno||''}`:''));
  window.addEventListener('unhandledrejection',e=>recordRuntimeIssue('unhandled-rejection',e.reason?.message||e.reason,String(e.reason?.stack||'')));

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



  const CONCEPTS = [
    {id:'symptom.headache',label:'Headache',domain:'symptom',category:'symptom',aliases:['head pain'],parents:[],analysis:[['headache_family',1]]},
    {id:'symptom.migraine',label:'Migraine',domain:'symptom',category:'symptom',aliases:['migraine headache'],parents:['symptom.headache'],analysis:[['headache_family',1],['migraine',1]]},
    {id:'symptom.migraine_aura',label:'Migraine with aura',domain:'symptom',category:'symptom',aliases:['aura migraine'],parents:['symptom.migraine'],analysis:[['headache_family',1],['migraine',1],['aura',1]]},
    {id:'symptom.tension_headache',label:'Tension headache',domain:'symptom',category:'symptom',aliases:['stress headache'],parents:['symptom.headache'],analysis:[['headache_family',1],['tension_headache',1]]},
    {id:'symptom.cluster_headache',label:'Cluster headache',domain:'symptom',category:'symptom',aliases:[],parents:['symptom.headache'],analysis:[['headache_family',1],['cluster_headache',1]]},
    {id:'symptom.tinnitus',label:'Tinnitus',domain:'symptom',category:'symptom',aliases:['ringing ears','ringing in ears'],parents:[],analysis:[['tinnitus',1]]},
    {id:'symptom.fatigue',label:'Fatigue',domain:'symptom',category:'symptom',aliases:['tiredness','low energy'],parents:[],analysis:[['fatigue',1]]},
    {id:'symptom.nausea',label:'Nausea',domain:'symptom',category:'symptom',aliases:['queasy'],parents:[],analysis:[['nausea',1],['migraine_associated',.3]]},
    {id:'symptom.dizziness',label:'Dizziness',domain:'symptom',category:'symptom',aliases:['lightheaded'],parents:[],analysis:[['dizziness',1]]},
    {id:'symptom.heartburn',label:'Heartburn / acid reflux',domain:'symptom',category:'symptom',aliases:['heartburn','acid reflux','gerd'],parents:[],analysis:[['reflux',1]]},
    {id:'symptom.chest_pain',label:'Chest pain',domain:'symptom',category:'symptom',aliases:['chest pains','pain in chest','chest hurts','chest discomfort'],parents:[],analysis:[['chest_pain',1]]},
    {id:'symptom.chest_tightness',label:'Chest tightness',domain:'symptom',category:'symptom',aliases:['tight chest','pressure in chest','chest pressure'],parents:['symptom.chest_pain'],analysis:[['chest_pain',.7],['chest_tightness',1]]},
    {id:'symptom.shortness_of_breath',label:'Shortness of breath',domain:'symptom',category:'symptom',aliases:['breathless','difficulty breathing','cant catch my breath'],parents:[],analysis:[['shortness_of_breath',1]]},
    {id:'symptom.palpitations',label:'Heart palpitations',domain:'symptom',category:'symptom',aliases:['racing heart','heart flutter','heart pounding'],parents:[],analysis:[['palpitations',1]]},
    {id:'symptom.abdominal_pain',label:'Abdominal pain',domain:'symptom',category:'symptom',aliases:['stomach pain','belly pain','abdominal discomfort'],parents:[],analysis:[['abdominal_pain',1]]},
    {id:'symptom.back_pain',label:'Back pain',domain:'symptom',category:'symptom',aliases:['backache','lower back pain','upper back pain'],parents:[],analysis:[['back_pain',1]]},
    {id:'symptom.neck_pain',label:'Neck pain',domain:'symptom',category:'symptom',aliases:['stiff neck','neck ache'],parents:[],analysis:[['neck_pain',1]]},
    {id:'symptom.shoulder_pain',label:'Shoulder pain',domain:'symptom',category:'symptom',aliases:['shoulder ache','painful shoulder'],parents:[],analysis:[['shoulder_pain',1]]},
    {id:'symptom.cough',label:'Cough',domain:'symptom',category:'symptom',aliases:['coughing'],parents:[],analysis:[['cough',1]]},
    {id:'symptom.wheezing',label:'Wheezing',domain:'symptom',category:'symptom',aliases:['wheeze'],parents:[],analysis:[['wheezing',1]]},
    {id:'symptom.fever',label:'Fever',domain:'symptom',category:'symptom',aliases:['high temperature','temperature'],parents:[],analysis:[['fever',1]]},
    {id:'symptom.rash',label:'Rash',domain:'symptom',category:'symptom',aliases:['skin rash','hives'],parents:[],analysis:[['rash',1]]},
    {id:'symptom.numbness',label:'Numbness',domain:'symptom',category:'symptom',aliases:['loss of feeling'],parents:[],analysis:[['numbness',1]]},
    {id:'symptom.tingling',label:'Tingling',domain:'symptom',category:'symptom',aliases:['pins and needles'],parents:[],analysis:[['tingling',1]]},
    {id:'symptom.weakness',label:'Weakness',domain:'symptom',category:'symptom',aliases:['feeling weak','muscle weakness'],parents:[],analysis:[['weakness',1]]},
    {id:'symptom.insomnia',label:'Difficulty sleeping',domain:'symptom',category:'symptom',aliases:['insomnia','cant sleep','trouble sleeping'],parents:[],analysis:[['sleep_difficulty',1]]},
    {id:'exposure.gluten',label:'Gluten exposure',domain:'exposure',category:'nutrition_exposure',aliases:['gluten','cross contact'],parents:[],analysis:[['gluten_exposure',1]]},
    {id:'cycle.period_start',label:'Period start',domain:'cycle',category:'cycle',aliases:['menstrual period start','cycle start'],parents:[],analysis:[['cycle_event',1],['period_start',1]]},
    {id:'cycle.period_end',label:'Period end',domain:'cycle',category:'cycle',aliases:['menstrual period end','cycle end'],parents:[],analysis:[['cycle_event',1],['period_end',1]]},
    {id:'cycle.spotting',label:'Spotting',domain:'cycle',category:'cycle',aliases:[],parents:[],analysis:[['cycle_event',1],['spotting',1]]},
    {id:'life.argument_partner',label:'Argument with partner',domain:'life',category:'life_event',aliases:['partner conflict','fight with partner'],parents:[],analysis:[['relationship_conflict',1],['stress_event',.7]]},
    {id:'life.argument_child',label:'Argument with child',domain:'life',category:'life_event',aliases:['conflict with child'],parents:[],analysis:[['family_conflict',1],['stress_event',.7]]},
    {id:'life.intimacy',label:'Intimacy',domain:'life',category:'life_event',aliases:['sexual activity','sex'],parents:[],analysis:[['intimacy_event',1]]},
    {id:'life.stress',label:'High-stress event',domain:'life',category:'life_event',aliases:['stressful day','acute stress'],parents:[],analysis:[['stress_event',1]]},
    {id:'life.travel',label:'Travel',domain:'life',category:'life_event',aliases:['trip'],parents:[],analysis:[['travel',1]]},
    {id:'life.vacation_start',label:'Vacation begins',domain:'life',category:'life_event',aliases:['vacation start'],parents:[],analysis:[['vacation',1]]},
    {id:'life.vacation_end',label:'Vacation ends',domain:'life',category:'life_event',aliases:['vacation end'],parents:[],analysis:[['vacation',1]]}
  ];
  const conceptById=id=>CONCEPTS.find(c=>c.id===id);
  function conceptSearch(query, preferred=''){
    const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const singular=v=>norm(v).replace(/\b(pains|aches|symptoms)\b/g,m=>m.slice(0,-1));
    const q=singular(query), toks=q.split(/\s+/).filter(Boolean);
    const scored=CONCEPTS.map(c=>{
      const labels=[c.label,...(c.aliases||[])].map(singular), hay=[...labels,c.domain].join(' ');
      let score=0;
      if(!q) score=preferred&&c.domain===preferred?20:1;
      else {
        for(const label of labels){
          if(label===q) score=Math.max(score,140);
          else if(label.startsWith(q)||q.startsWith(label)) score=Math.max(score,110);
          else if(label.includes(q)||q.includes(label)) score=Math.max(score,85);
        }
        const matched=toks.filter(t=>hay.includes(t)).length;
        score=Math.max(score, matched*18 - Math.max(0,toks.length-matched)*10);
      }
      if(preferred&&c.domain===preferred)score+=20;
      return {c,score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.c.label.localeCompare(b.c.label));
    return scored.slice(0,8).map(x=>x.c);
  }
  function conceptDomainForTemplate(kind){return kind==='menstrual_cycle'?'cycle':kind==='gluten_exposure'?'exposure':kind==='life_event'?'life':'symptom'}
  function vaultConfig(){try{return JSON.parse(localStorage.getItem('zeke-private-vault')||'null')}catch{return null}}
  function b64(bytes){return btoa(String.fromCharCode(...bytes))}
  function unb64(text){return Uint8Array.from(atob(text),c=>c.charCodeAt(0))}
  async function deriveVaultKey(pin,salt){return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveKey']),{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
  async function createVault(pin){const salt=crypto.getRandomValues(new Uint8Array(16)),key=await deriveVaultKey(pin,salt),iv=crypto.getRandomValues(new Uint8Array(12)),check=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode('ZEKE_PRIVATE_VAULT'));localStorage.setItem('zeke-private-vault',JSON.stringify({version:1,salt:b64(salt),iv:b64(iv),check:b64(new Uint8Array(check)),created_at:new Date().toISOString()}));sessionStorage.setItem('zeke-vault-pin',pin)}
  async function unlockVault(pin){const cfg=vaultConfig();if(!cfg)return false;try{const key=await deriveVaultKey(pin,unb64(cfg.salt));const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(cfg.iv)},key,unb64(cfg.check));if(new TextDecoder().decode(plain)!=='ZEKE_PRIVATE_VAULT')return false;sessionStorage.setItem('zeke-vault-pin',pin);return true}catch{return false}}
  function vaultUnlocked(){return Boolean(sessionStorage.getItem('zeke-vault-pin'))}
  async function encryptPrivatePayload(value){const cfg=vaultConfig(),pin=sessionStorage.getItem('zeke-vault-pin');if(!cfg||!pin)throw new Error('Private Vault is locked or not configured.');const key=await deriveVaultKey(pin,unb64(cfg.salt)),iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(value)));return {v:1,iv:b64(iv),ciphertext:b64(new Uint8Array(ct))}}

  const EVIDENCE = [
    { title:'ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults', year:2026, pmid:'41843416' },
    { title:'ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults', year:2009, pmid:'19204579' }
  ];

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate = (d, opts={month:'short',day:'numeric'}) => { if(!d)return 'Date not specified'; const value=new Date(d); return Number.isNaN(value.getTime())?'Date not specified':value.toLocaleDateString(undefined, opts); };
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
      'calendar':'calendar','questions':'questions','clarifications':'questions','life-events':'life-events','symptoms':'life-events','pattern-lab':'pattern-lab','insights':'insights','settings':'settings','data-integrity':'data-integrity','system/data-integrity':'data-integrity'
    };
    return map[h] || 'dashboard';
  }

  function go(route) {
    const hashes = {dashboard:'health/dashboard',health:'health',fitness:'fitness',medications:'medications',labs:'labs',calendar:'calendar',questions:'questions','life-events':'life-events','pattern-lab':'pattern-lab',insights:'insights',settings:'settings','data-integrity':'data-integrity'};
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
      const key=st.canonical_medication_id||ZekeParser.canonicalMedicationId(name);
      if (name&&key) meds.set(key, name);
    }
    const scheduledIds = new Set((state.actions.catalog||[]).filter(a=>a.kind==='medication'&&a.schedule).map(a=>ZekeParser.canonicalMedicationId(a.label||a.name||a.id||'')));
    for (const [key,name] of meds) {
      const already = state.factors.some(f=>f.type==='clarification_question' && f.question_key===`med_schedule:${key}` && !['dismissed','resolved','unknown'].includes(f.status));
      if (!scheduledIds.has(key) && !already && open.length < 4) {
        await ZekeData.saveFactor({
          type:'clarification_question', status:'open', priority:'high', question_key:`med_schedule:${key}`,
          question:`I know ${name} is part of your history, but I don't want to guess its schedule. How often is it supposed to be taken?`,
          why_it_matters:`This helps ZEKE decide when, if ever, it belongs in Today's Actions.`
        },{idempotencyKey:`med_schedule:${key}`});
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
      },{idempotencyKey:'tracking_preferences'});
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

  function medicationScheduleContext() {
    const schedules={};
    for(const action of state.actions.catalog||[]){
      if(action.kind!=='medication'||!action.schedule)continue;
      const id=ZekeParser.canonicalMedicationId(action.label||action.name||action.id||'');
      if(id)schedules[id]=action.schedule;
    }
    return schedules;
  }

  function parserContext(extra={}) {
    return {...state.context,active_date:activeDay(),medicationSchedules:medicationScheduleContext(),...extra};
  }

  async function addMedicationPreview(parsed) {
    if(!(parsed?.events||[]).length||!parsed.events.every(e=>e.category==='medication'))return parsed;
    const duplicateDates=[];
    for(const event of parsed.events){if((await ZekeData.findLikelyDuplicates(event,0.94)).length)duplicateDates.push(String(event.timestamp||'').slice(0,10));}
    return {...parsed,duplicateDates};
  }

  function interpretationPrompt(parsed) {
    if(parsed.previewDates?.length){
      const dates=parsed.previewDates.join(', '), duplicates=parsed.duplicateDates?.length?` Existing matching records on ${parsed.duplicateDates.join(', ')} will be skipped.`:'';
      return `I understood that as ${parsed.summary}. Proposed dates: ${dates}.${duplicates} Is that right?`;
    }
    return `I understood that as ${parsed.summary}. Is that right?`;
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

  function normalizedActivityName(name='') {
    const raw=String(name||'').trim(); const k=raw.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const aliases=[
      [/^(lat|wide grip lat|independent lat) pull ?down$/, 'Lat Pulldown'],
      [/^(seated )?cable row$|^seated row$/, 'Seated Row'],
      [/^(independent )?bicep curl$|^biceps? curl$/, 'Bicep Curl'],
      [/^stair ?climber$|^climbmill$|^stairs?$/, 'Stairclimber'],
      [/^seated leg curl$|^leg curl$/, 'Seated Leg Curl'],
      [/^leg extension$/, 'Leg Extension'],
      [/^glute (lift|extension)$|^hip extension$/, 'Glute Lift'],
      [/^abdominal$|^ab crunch$|^abdominal crunch$/, 'Abdominal']
    ];
    for(const [re,label] of aliases) if(re.test(k)) return label;
    return raw.replace(/\b\w/g,c=>c.toUpperCase());
  }
  function inFitnessRange(date){const days=RANGE_DAYS[state.range];if(!days)return true;const d=new Date(date);if(Number.isNaN(d.getTime()))return false;const cutoff=new Date();cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-days+1);return d>=cutoff;}
  function workoutGroups({respectRange=true}={}) {
    const byExercise=new Map();
    for(const e of state.events.filter(isWorkoutEvent)) {
      const s=workoutStructured(e), date=e.timestamp||e.recorded_at;
      if(respectRange&&!inFitnessRange(date)) continue;
      const original=(s.exercise||s.session_type||s.exercise_name||'').trim(); if(!original) continue;
      const name=normalizedActivityName(original), day=localDay(new Date(date||Date.now()));
      const sessionKey=String(s.workout_id||s.session_id||`${day}:${name.toLowerCase()}`);
      if(!byExercise.has(name)) byExercise.set(name,new Map());
      const sessions=byExercise.get(name);
      const prev=sessions.get(sessionKey)||{event:e,date,weight:0,reps:0,sets:0,rpe:0,pain:0,duration_min:0,steps:0,workout_id:s.workout_id||'',variants:new Set()};
      prev.variants.add(original);
      const weight=Number(s.weight||s.load||0), reps=Number(s.reps||0), sets=Number(s.sets||0), setRows=Number(s.set_number||s.set_no||0)?1:0;
      sessions.set(sessionKey,{...prev,event:e,date:date||prev.date,weight:Math.max(prev.weight,weight),reps:Math.max(prev.reps,reps),sets:prev.sets+(sets||setRows||1),rpe:Math.max(prev.rpe,Number(s.rpe||0)),pain:Math.max(prev.pain,Number(s.pain||0)),duration_min:Math.max(prev.duration_min,Number(s.duration_min||0)),steps:Math.max(prev.steps,Number(s.steps||0))});
    }
    const map=new Map(); for(const [name,sessions] of byExercise) map.set(name,[...sessions.values()].sort((a,b)=>new Date(a.date)-new Date(b.date))); return map;
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
    if(!selected) return `<section class="panel coach-panel coach-card-collapsed"><div class="section-head"><div><div class="coach-badge">🏋 Coach's Eye</div><h2>Choose what you want coaching on</h2><p>Exercise-specific guidance based on your recorded sessions.</p></div></div>${chooser}<div class="empty-inline">More repeated workout history will unlock specific guidance.</div></section>`;
    if(!state.coachCardExpanded){
      return `<section class="panel coach-panel coach-card-collapsed" id="coachCard" tabindex="0" role="button" aria-expanded="false">
        ${showAlert?`<div class="timely-coach-alert"><div><span>Timely before your next workout</span><strong>${esc(timely.title)}</strong><p>${esc(timely.suggestion)}</p></div><button class="icon-btn" data-dismiss-coach-alert="${esc(alertKey)}" aria-label="Dismiss coaching alert">×</button></div>`:''}
        <div class="coach-compact-head"><div><div class="coach-badge">🏋 Coach's Eye</div><h2>${esc(selected.title)}</h2><p>${esc(selected.suggestion)}</p></div><button class="secondary compact" id="expandCoachCard">View full analysis</button></div>
        <div class="coach-compact-meta"><span>${esc(selected.name)}</span><span>${selected.recent.length} recent session${selected.recent.length===1?'':'s'}</span><span>${selected.last.pain||0}/10 recorded pain</span></div>
      </section>`;
    }
    const recentRows=selected.recent.slice().reverse().map(x=>`<tr><td>${esc(fmtDate(x.date,{month:'short',day:'numeric'}))}</td><td>${x.weight?`${x.weight} lb`:'—'}</td><td>${x.reps||'—'} × ${x.sets||'—'}</td><td>${x.rpe||'Not logged'}</td><td>${x.pain||0}/10</td></tr>`).join('');
    return `<section class="panel coach-panel coach-card-expanded" id="coachCard" aria-expanded="true">${showAlert?`<div class="timely-coach-alert"><div><span>Timely before your next workout</span><strong>${esc(timely.title)}</strong><p>${esc(timely.suggestion)}</p></div><button class="icon-btn" data-dismiss-coach-alert="${esc(alertKey)}" aria-label="Dismiss coaching alert">×</button></div>`:''}<div class="section-head"><div><div class="coach-badge">🏋 Coach's Eye</div><h2>Exercise-specific coaching</h2><p>Next-session guidance grounded in your recent records.</p></div><div class="coach-expanded-actions"><button class="text-action" id="openCoachPatternLab">Open in Pattern Lab</button><button class="icon-btn" id="collapseCoachCard" aria-label="Collapse Coach's Eye">×</button></div></div>
      ${chooser}<div class="coach-top"><div><h2>${esc(selected.title)}</h2><p>${esc(selected.rationale)}</p></div><span class="insight-tag">${esc(selected.name)}</span></div>
      <div class="coach-grid"><div class="coach-stats"><div><strong>${selected.last.weight||'—'}${selected.last.weight?' lb':''}</strong><span>Latest load</span></div><div><strong>${selected.last.rpe||'Not logged'}</strong><span>Latest RPE</span></div><div><strong>${selected.last.pain||0}/10</strong><span>Recorded pain</span></div></div><div>${coachChart(selected)}</div></div>
      <div class="coach-rec"><strong>ZEKE's recommendation</strong><p>${esc(state.coachAI?.recommendation || selected.suggestion)}</p></div>
      <div class="coach-actions"><button class="text-action" id="toggleCoachEvidence">${state.coachExpanded?'Hide supporting evidence':'Why ZEKE suggested this'}</button><button class="secondary" id="askZekeCoach">Ask ZEKE about this</button></div>
      ${state.coachExpanded?`<div class="evidence-box"><p><strong>Why ZEKE suggested this:</strong> ZEKE used only the recorded ${esc(selected.name)} sessions shown below. The recommendation considers load, repetitions, sets, recorded effort, and pain. Confidence is limited when effort, recovery, or technique data are missing.</p><div class="table-wrap"><table><thead><tr><th>Date</th><th>Load</th><th>Reps × sets</th><th>RPE</th><th>Pain</th></tr></thead><tbody>${recentRows}</tbody></table></div><p class="evidence-note">Broader cross-activity patterns and longer-term hypotheses belong in Pattern Lab.</p></div>`:''}
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

  function medicationEventCompletesAction(action,event){
    if(action.kind!=='medication'||semanticCategory(event)!=='medication')return false;
    const s=event.structured||{}; const confirmed=/confirmed/i.test(String(s.interpretation_status||s.confirmation_status||'')) || event.provenance?.source==='quick_action';
    if(!confirmed||!['taken','administered','completed'].includes(String(s.status||'').toLowerCase()))return false;
    const actionMedicationId=ZekeParser.canonicalMedicationId(action.label||action.name||action.id||'');
    const eventMedicationId=ZekeParser.canonicalMedicationId(s.canonical_medication_id||s.medication_name||s.medication||s.name||'');
    return s.action_id===action.id || Boolean(actionMedicationId&&eventMedicationId===actionMedicationId);
  }
  function actionDoneToday(action) {
    const today=localDay(); const label=String(action.label||action.name||'').toLowerCase();
    return state.events.some(e=>{
      const eventDate=new Date(e.timestamp||e.recorded_at); if(Number.isNaN(eventDate.getTime())||localDay(eventDate)!==today) return false;
      if(action.kind==='medication')return medicationEventCompletesAction(action,e);
      const s=e.structured||{}; const confirmed=/confirmed/i.test(String(s.interpretation_status||s.confirmation_status||'')) || e.provenance?.source==='quick_action';
      if(!confirmed || e.category==='raw_input') return false;
      if(s.action_id===action.id)return true;
      const ex=String(s.exercise||'').toLowerCase();
      return (action.kind==='workout'&&isWorkoutEvent(e)) || (label&&ex&&label.includes(ex));
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
    const recent=recentHealthHTML();
    const upcoming=upcomingHTML();
    const lower=[trend,recent,upcoming].filter(Boolean).join('');
    return `${coverageHTML()}<div class="dashboard-layout">
      <div class="dashboard-priority-row">${dashboardInsightsHTML()}${todayActionsHTML()}</div>
      ${healthGlanceHTML(9)}
      <div class="dashboard-guidance-row">${coachHTML()}${thinkingHTML()}</div>
      ${lower?`<div class="dashboard-support-row">${lower}</div>`:''}
    </div>`;
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

  function healthMetricCategory(id){
    return ['a1c','ldl','hdl','triglycerides','total_cholesterol','apob','lpa','glucose','average_glucose'].includes(id)?'labs':'measurements';
  }
  function healthPageHTML() {
    const metricIds=availableMetrics();
    const usage=new Map();
    for(const e of state.events){const id=canonicalMetric(metricId(e));if(id)usage.set(id,(usage.get(id)||0)+1)}
    const frequent=[...metricIds].sort((a,b)=>(usage.get(b)||0)-(usage.get(a)||0)).slice(0,8);
    const shown=state.healthTab==='frequent'?frequent:metricIds.filter(id=>healthMetricCategory(id)===state.healthTab);
    const cards=shown.map(id=>`<div class="health-library-item ${state.expandedHealthMetric===id?'is-expanded':''}" data-health-metric="${esc(id)}" tabindex="0" role="button" aria-expanded="${state.expandedHealthMetric===id}">${metricCard(id)}${state.expandedHealthMetric===id?`<div class="health-detail-extension"><p><strong>Detailed view</strong></p><p>Review the dated trend, source, reference context, and related insights above. ZEKE never treats an old result as current without showing its date.</p><div class="detail-actions"><button class="text-action" data-log-metric="${esc(id)}">+ Log new value</button><button class="text-action" data-route="pattern-lab">Explore in Pattern Lab</button></div></div>`:''}</div>`).join('');
    const tabs=[['frequent','Frequent'],['measurements','Measurements'],['labs','Labs']];
    const healthInsights=thinkingHTML().replace('I\'ve been thinking…','Health insights').replace('Broader hypotheses and useful curiosities—not duplicate workout coaching.','Progress, possible relationships, and useful recommendations about what to track next.');
    return `<div class="page-head"><div><h1>Health</h1><p>Measurements, labs, and proactive insights—with deeper analysis available in Pattern Lab.</p></div></div>
      <div class="health-page-grid"><section class="panel health-insights-panel">${healthInsights.replace(/^<section class="panel thinking-panel">|<\/section>$/g,'')}</section>
      <section class="panel health-library-panel"><div class="section-head"><div><h2>Health library</h2><p>Compact summaries open into dated trends, provenance, and context.</p></div></div><div class="library-tabs" role="tablist">${tabs.map(([id,label])=>`<button class="library-tab ${state.healthTab===id?'active':''}" data-health-tab="${id}" role="tab" aria-selected="${state.healthTab===id}">${label}</button>`).join('')}</div><div class="health-library-grid">${cards||'<div class="empty-inline">No verified items in this view yet.</div>'}</div></section></div>
      <section class="panel"><div class="section-head"><div><h2>Recent health record</h2><p>Review and correct entries while preserving provenance.</p></div></div>${recordsTable(e=>['measurement','lab','medication'].includes(semanticCategory(e)),[
        {label:'Date',value:e=>fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})},
        {label:'Type',value:e=>semanticCategory(e)},
        {label:'Summary',value:e=>humanEvent(e)},
        {label:'Source',value:e=>e.provenance?.sheet||e.provenance?.file||e.provenance?.source||'ZEKE'}
      ])}</section>`;
  }

  function rangeLabel() {
    const labels={week:'Last 7 days',month:'Last 31 days',quarter:'Last 3 months','6months':'Last 6 months',year:'Last year',all:'All recorded time'};
    if(state.range==='all') return labels.all;
    const days=RANGE_DAYS[state.range]||31;
    const end=new Date(); const start=new Date(end); start.setDate(end.getDate()-days+1);
    return `${labels[state.range]} · ${start.toLocaleDateString(undefined,{month:'short',day:'numeric'})}–${end.toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;
  }

  function fitnessRangeHTML() {
    return `<section class="fitness-range-bar" aria-label="Fitness chart time period"><div><strong>Chart period</strong><span>${esc(rangeLabel())}</span></div><div class="range-tabs fitness-range-tabs">${[['week','Week'],['month','Month'],['quarter','Quarter'],['6months','6 months'],['year','Year'],['all','All']].map(([id,label])=>`<button class="range ${state.range===id?'active':''}" data-range="${id}" aria-pressed="${state.range===id}">${label}</button>`).join('')}</div><label class="fitness-range-select">Period<select id="fitnessRangeSelect">${[['week','Week'],['month','Month'],['quarter','Quarter'],['6months','6 months'],['year','Year'],['all','All']].map(([id,label])=>`<option value="${id}" ${state.range===id?'selected':''}>${label}</option>`).join('')}</select></label></section>`;
  }

  function activityCategory(name,profile){
    const n=String(name||'').toLowerCase(),p=String(profile||'').toLowerCase();
    if(/walk|stair|climb|bike|cycle|tread|ellipt|rower|run|cardio/.test(n+' '+p))return 'cardio';
    if(/stretch|mobility|range of motion|yoga/.test(n+' '+p))return 'mobility';
    if(/massage|recovery|foam roll|sauna/.test(n+' '+p))return 'recovery';
    return 'strength';
  }
  function fitnessPageHTML() {
    const groups=workoutGroups();
    const rows=state.events.filter(e=>isWorkoutEvent(e)&&hasMeaningfulWorkout(e)&&inFitnessRange(e.timestamp||e.recorded_at)).sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at));
    const customActivities=JSON.parse(localStorage.getItem('zeke-activity-library')||'[]');
    const favorites=new Set(JSON.parse(localStorage.getItem('zeke-activity-favorites')||'[]'));
    for(const a of customActivities){if(!groups.has(a.name))groups.set(a.name,[{weight:null,reps:null,sets:null,duration_min:null,date:null,activity_profile:a.profile,placeholder:true}]);}
    let entries=[...groups.entries()].map(([name,arr])=>({name,arr,profile:arr.at(-1).activity_profile||activityProfile(name),category:activityCategory(name,arr.at(-1).activity_profile||activityProfile(name))}));
    if(state.activityTab==='favorites')entries=entries.filter(x=>favorites.has(x.name));
    else if(['strength','cardio','mobility','recovery'].includes(state.activityTab))entries=entries.filter(x=>x.category===state.activityTab);
    else entries.sort((a,b)=>{const ad=a.arr.at(-1)?.date?new Date(a.arr.at(-1).date).getTime():0,bd=b.arr.at(-1)?.date?new Date(b.arr.at(-1).date).getTime():0;return (b.arr.length*3+bd/1e12)-(a.arr.length*3+ad/1e12)}).splice(10);
    const cards=entries.map(({name,arr,profile,category})=>{const first=arr[0],last=arr.at(-1);const loadChange=first.weight&&last.weight?last.weight-first.weight:null;let recommendation='More repeated sessions are needed before recommending a change.';let confidence='low';if(arr.length>=2&&last.pain>=4){recommendation='Hold progression and review pain, technique, recovery, and clinician/PT guidance.';confidence='high';}else if(arr.length>=2&&last.weight&&last.reps>=12&&last.sets>=2){recommendation=`Consider ${last.weight+5} lb next session for 8–12 controlled reps, provided form and pain remain stable.`;confidence=arr.length>=3?'moderate':'low';}else if(arr.length>=2&&last.weight){recommendation=`Repeat ${last.weight} lb and aim to add 1–2 controlled reps before increasing load.`;confidence='moderate';}
      const pts=arr.filter(x=>x.weight);const spark=pts.length>1?miniSpark(pts.map((x,i)=>({value:x.weight,date:x.date,unit:'lb',id:`${name}-${i}`})),'weight'):'';
      const expanded=state.expandedActivity===name;
      const recent=arr.slice(-6).reverse().map(x=>`<tr><td>${x.date?esc(fmtDate(x.date,{month:'short',day:'numeric'})):'—'}</td><td>${x.weight?`${x.weight} lb`:'—'}</td><td>${x.reps||'—'} × ${x.sets||'—'}</td><td>${x.duration_min?`${x.duration_min} min`:'—'}</td><td>${x.steps||'—'}</td></tr>`).join('');
      return `<article class="fitness-progress-card ${expanded?'is-expanded':''}" tabindex="0" role="button" aria-expanded="${expanded}" data-activity-name="${esc(name)}"><div class="fitness-card-head"><div><strong>${esc(name)}</strong><span>${last.placeholder?'Not logged yet':`${arr.length} session${arr.length===1?'':'s'}`} · ${esc(activityProfileLabel(profile))}</span></div><div class="activity-card-tools"><button class="favorite-button ${favorites.has(name)?'active':''}" data-favorite-activity="${esc(name)}" aria-label="${favorites.has(name)?'Remove from':'Add to'} favorites">★</button><b>${last.weight?`${last.weight} lb`:last.duration_min?`${last.duration_min} min`:'—'}</b></div></div>${spark}<div class="fitness-facts"><span>First: ${first.weight?`${first.weight} lb`:first.duration_min?`${first.duration_min} min`:'—'}</span><span>Change: ${loadChange==null?'—':`${loadChange>0?'+':''}${loadChange} lb`}</span><span>Latest: ${last.reps||'—'} reps × ${last.sets||'—'}</span></div><p class="fitness-recommendation"><strong>Next step (${confidence} confidence):</strong> ${esc(recommendation)}</p>${expanded?`<div class="activity-expanded-detail"><div class="activity-detail-heading"><div><span class="activity-category-label">${esc(category)}</span><h3>Recent activity details</h3></div><button class="icon-btn" data-collapse-activity="${esc(name)}" aria-label="Collapse activity">×</button></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Load</th><th>Reps × sets</th><th>Duration</th><th>Steps</th></tr></thead><tbody>${recent}</tbody></table></div><div class="coach-rec"><strong>Coach recommendation</strong><p>${esc(recommendation)}</p></div><div class="detail-actions"><button class="secondary compact" data-quick-exercise="${esc(name)}">+ Log activity</button><button class="text-action" data-activity-pattern="${esc(name)}">Open in Pattern Lab</button></div></div>`:`<div class="activity-open-hint">Click for details and coaching</div>`}</article>`}).join('');
    const tabs=[['frequent','Frequent'],['favorites','Favorites'],['strength','Strength'],['cardio','Cardio'],['mobility','Mobility'],['recovery','Recovery']];
    const history=rows.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Exercise</th><th>Load</th><th>Reps × sets</th><th>Duration</th><th>Steps</th><th>Source</th></tr></thead><tbody>${rows.map(e=>{const w=workoutStructured(e);return `<tr><td>${esc(fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${esc(w.exercise||'Workout')}</td><td>${esc(w.weight!=null?`${w.weight} ${w.weight_unit||'lb'}`:'—')}</td><td>${esc(w.reps!=null||w.sets!=null?`${w.reps??'—'} × ${w.sets??'—'}`:'—')}</td><td>${esc(w.duration_min!=null?`${w.duration_min} min`:'—')}</td><td>${esc(w.steps!=null?`${w.steps}`:'—')}</td><td>${esc(e.provenance?.sheet||e.provenance?.file||e.provenance?.source||'ZEKE')}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty-inline">No workout records are available yet.</div>';
    return `<div class="page-head"><div><h1>Fitness</h1><p>Frequent activities, exercise-specific coaching, and evidence-linked next-session guidance.</p></div><div class="page-head-actions"><button class="secondary" id="addActivityBtn">+ Add activity</button><button class="primary" id="logWorkoutBtn">+ Log workout</button></div></div>${fitnessRangeHTML()}<div class="fitness-workspace"><div class="fitness-primary">${coachHTML()}<section class="panel fitness-insight-card"><div class="section-head"><div><span class="tile-kicker">FITNESS INSIGHTS</span><h2>Patterns beyond one exercise</h2><p>Cross-activity progress, recovery questions, and longer-term hypotheses live in Pattern Lab.</p></div></div><button class="secondary compact" data-route="pattern-lab">Open Pattern Lab</button></section></div><section class="panel fitness-library-panel"><div class="section-head"><div><h2>Activity library</h2><p>Frequently used activities appear first. Choose a category or favorite, then open a tile for granular detail.</p></div></div><div class="library-tabs" role="tablist">${tabs.map(([id,label])=>`<button class="library-tab ${state.activityTab===id?'active':''}" data-activity-tab="${id}" role="tab" aria-selected="${state.activityTab===id}">${label}</button>`).join('')}</div><div class="fitness-progress-grid">${cards||'<div class="empty-inline">No activities in this view yet.</div>'}</div></section><section class="panel fitness-history-panel"><div class="section-head"><div><h2>Workout history</h2><p>Entries are grouped into one workout per calendar day by default. Empty draft shells are excluded.</p></div></div>${history}</section></div>`;
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


  function activityKey(value='') {
    const compact=String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
    const aliases={'stairclimber':'stair climber','stair climber machine':'stair climber','climbmill':'stair climber','lat pull down':'lat pulldown','lat pull-down':'lat pulldown'};
    return aliases[compact]||compact;
  }
  function activityDisplayName(value='') {
    const key=activityKey(value);
    const preferred={'stair climber':'Stair Climber','lat pulldown':'Lat Pulldown','seated row':'Seated Row','leg extension':'Leg Extension','leg curl':'Leg Curl','seated leg curl':'Seated Leg Curl','bicep curl':'Bicep Curl','independent bicep curl':'Independent Bicep Curl','abdominal':'Abdominal','massage chair':'Massage Chair','hydromassage':'HydroMassage','shoulder pt':'Shoulder PT'};
    return preferred[key]||key.replace(/\b\w/g,c=>c.toUpperCase());
  }
  function activityDuplicateGroups() {
    const byKey=new Map();
    const add=(name,source='history')=>{name=String(name||'').trim();if(!name)return;const key=activityKey(name);if(!key||key==='workout')return;if(!byKey.has(key))byKey.set(key,{key,names:new Map(),records:0});const g=byKey.get(key);g.names.set(name,(g.names.get(name)||0)+1);if(source==='history')g.records++;};
    state.events.filter(isWorkoutEvent).forEach(e=>add(workoutStructured(e).exercise,'history'));
    try{(JSON.parse(localStorage.getItem('zeke-activity-library')||'[]')||[]).forEach(a=>add(a.name,'library'));}catch(_){}
    return [...byKey.values()].filter(g=>g.names.size>1).map(g=>({...g,canonical:activityDisplayName(g.key),aliases:[...g.names.keys()]})).sort((a,b)=>b.records-a.records);
  }
  function exactDuplicateWorkoutGroups() {
    const map=new Map();
    const fingerprint=e=>{const w=workoutStructured(e);return [String(e.timestamp||'').slice(0,10),activityKey(w.exercise),w.weight??'',w.reps??'',w.sets??'',w.duration_min??'',w.steps??'',w.distance_mi??'',String(w.notes||'').trim().toLowerCase()].join('|')};
    state.events.filter(e=>isWorkoutEvent(e)&&hasMeaningfulWorkout(e)).forEach(e=>{const fp=fingerprint(e);if(!map.has(fp))map.set(fp,[]);map.get(fp).push(e)});
    return [...map.entries()].filter(([,items])=>items.length>1).map(([fingerprint,items])=>({fingerprint,items,keep:items.slice().sort((a,b)=>new Date(a.recorded_at||a.timestamp)-new Date(b.recorded_at||b.timestamp))[0]})).sort((a,b)=>b.items.length-a.items.length);
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
    const duplicateActivities=activityDuplicateGroups(); const duplicateWorkouts=exactDuplicateWorkoutGroups();
    return `<div class="page-head"><div><h1>Data Integrity</h1><p>Find, preview, and safely repair duplicate or inconsistent records inside ZEKE.</p></div><div class="page-head-actions"><button class="secondary" id="exportDataAudit">Export audit</button>${ZekeData.hasIntegrityUndo?.()?'<button class="secondary" id="undoIntegrityChange">Undo last cleanup</button>':''}</div></div>
      <section class="integrity-banner repair-mode"><strong>Protected cleanup mode</strong><span>ZEKE creates a backup before each merge or deletion, preserves provenance, and supports session undo.</span></section>
      ${state.integrityLastAction?`<section class="integrity-success">${esc(state.integrityLastAction)}</section>`:''}
      <section class="panel cleanup-panel"><div class="section-head"><div><h2>Activity cleanup</h2><p>Case, spacing, punctuation, and known aliases are folded into one canonical activity while all workout history is preserved.</p></div><span class="badge">${duplicateActivities.length} group${duplicateActivities.length===1?'':'s'}</span></div>${duplicateActivities.length?`<div class="cleanup-list">${duplicateActivities.map((g,i)=>`<article class="cleanup-card"><div><strong>${esc(g.canonical)}</strong><p>${g.aliases.map(n=>`<code>${esc(n)}</code>`).join(' + ')}</p><small>${g.records} workout record${g.records===1?'':'s'} affected · old names retained as aliases</small></div><button class="primary compact" data-merge-activity="${i}">Preview & merge</button></article>`).join('')}</div>`:'<div class="empty-inline success-empty">No duplicate activity names were detected.</div>'}</section>
      <section class="panel cleanup-panel"><div class="section-head"><div><h2>Exact duplicate workouts</h2><p>These records match on date, activity, and recorded values. ZEKE keeps the earliest record unless you choose otherwise.</p></div><span class="badge">${duplicateWorkouts.length} group${duplicateWorkouts.length===1?'':'s'}</span></div>${duplicateWorkouts.length?`<div class="cleanup-list">${duplicateWorkouts.map((g,i)=>{const w=workoutStructured(g.keep);return `<article class="cleanup-card"><div><strong>${esc(activityDisplayName(w.exercise))} · ${esc(fmtDate(g.keep.timestamp,{month:'short',day:'numeric',year:'numeric'}))}</strong><p>${g.items.length} identical records</p><small>${esc([w.weight!=null?`${w.weight} lb`:'',w.reps!=null?`${w.reps} reps`:'',w.sets!=null?`${w.sets} sets`:'',w.duration_min!=null?`${w.duration_min} min`:'',w.steps!=null?`${w.steps} steps`:''].filter(Boolean).join(' · ')||'Same activity and date')}</small></div><button class="secondary compact" data-remove-duplicate-workouts="${i}">Review & keep one</button></article>`}).join('')}</div>`:'<div class="empty-inline success-empty">No exact duplicate workout records were detected.</div>'}</section>
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
      <section class="panel settings-section"><div class="section-head"><div><h2>Private Vault</h2><p>Encrypt sensitive event details locally before they are written to your selected storage provider.</p></div><span class="badge">${vaultConfig()?(vaultUnlocked()?'Unlocked':'Locked'):'Not configured'}</span></div><div class="vault-actions">${vaultConfig()?`<button class="secondary" id="unlockVault">Unlock</button><button class="secondary" id="lockVault">Lock now</button><button class="text-action danger" id="resetVault">Reset vault setup</button>`:`<button class="primary" id="setupVault">Set PIN</button>`}</div><p class="safety-copy">The PIN is never stored. Losing it means encrypted private details cannot be recovered. Neutral metadata and explicitly approved analytical features may remain available while locked.</p></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>AI Connections</h2><p>Connect and test services. ZEKE's AI Router decides which available model to use based on task, privacy, availability, and free-first policy.</p></div><span class="badge">${(state.ai?.providers||[]).filter(x=>x.connected).map(x=>x.label||x.provider).join(', ')||'No AI connected'}</span></div>${aiConnectionCardsHTML()}<div class="manual-packet"><strong>Manual AI packet</strong><p>Export a structured packet for use with any external AI, then import the response back into ZEKE without treating it as raw fact.</p><div class="card-actions"><button class="secondary" id="exportAIPacket">Export packet</button><label class="secondary file-button">Import AI response<input type="file" id="importAIResponse" accept=".json,application/json" hidden></label></div><div id="aiImportStatus" class="status-line"></div></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Calendar connections</h2><p>Calendar providers are context sources. An event on a calendar does not prove that it happened.</p></div></div><div class="provider-grid"><article class="provider-card connected"><span class="provider-icon">▣</span><div><strong>Google Calendar</strong><p>Available with the current Google connection.</p><span class="provider-status">${state.storage?.providerId==='google-drive'?'Connected':'Available'}</span></div></article><article class="provider-card planned"><span class="provider-icon">◫</span><div><strong>Apple Calendar / iCloud</strong><p>CalDAV/ICS-compatible connector planned.</p><span class="provider-status">Planned</span></div></article><article class="provider-card planned"><span class="provider-icon">▤</span><div><strong>Outlook / Exchange</strong><p>Microsoft calendar connector planned.</p><span class="provider-status">Planned</span></div></article><article class="provider-card"><span class="provider-icon">ICS</span><div><strong>ICS import</strong><p>Import an exported calendar file as contextual history.</p><span class="provider-status">Coming next</span></div></article></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Connected health workbook</h2><p>Link the workbook once. ZEKE stores a managed copy in your Project Zeke Drive folder and uses a reviewed, idempotent transaction before changing events.json.</p></div><span class="badge">${state.syncSource?'Connected':'Not connected'}</span></div>${state.syncSource?`<div class="sync-source-card"><strong>${esc(state.syncSource.name)}</strong><p>Last verified synchronization: ${esc(state.syncSource.last_sync_at?fmtDate(state.syncSource.last_sync_at,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'Not yet')}</p><div class="card-actions"><button class="secondary" id="preflightWorkbookNow">Run read-only preflight</button><button class="secondary" id="syncWorkbookNow" ${state.syncPreflight?.ready?'':'disabled'}>Commit reviewed sync</button><label class="secondary file-button">Review replacement source<input type="file" id="importFile" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label></div>${state.syncPreflight?.ready?`<p class="status-line">Preflight reviewed in this session at ${esc(fmtDate(state.syncPreflight.reviewed_at,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))}. Commit will rerun and compare the preflight before writing.</p>`:''}</div>`:`<label class="secondary file-button">Review and connect health workbook<input type="file" id="importFile" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label>`}<div id="importStatus" class="status-line">${esc(state.importStatus||'')}</div>${state.importReport?`<div class="import-report"><strong>Latest workbook review</strong><div class="import-stats">${Object.entries(state.importReport.counts||{}).map(([k,v])=>`<span><b>${esc(v)}</b>${esc(k.replaceAll('_',' '))}</span>`).join('')}</div><p>${esc(state.importReport.message||'Workbook review completed.')}</p></div>`:''}<p class="safety-copy">Safety: synchronization follows read → normalize → compare → preview → commit → verify. A timestamped JSON backup is created before event changes. Blank spreadsheet cells do not delete JSON events. Conflicts stop the transaction, and repeated syncs do not append duplicates.</p></section>
      ${dataVisibilityHTML()}
      <section class="panel settings-section"><div class="section-head"><div><h2>Runtime diagnostics</h2><p>Local operational errors are stored on this device without API keys or full health records. Export them when troubleshooting.</p></div><span class="badge">${runtimeDiagnostics().length} entries</span></div><div class="card-actions"><button class="secondary" id="exportRuntimeDiagnostics">Export diagnostics</button><button class="text-action danger" id="clearRuntimeDiagnostics">Clear local log</button></div><p class="safety-copy">Includes timestamp, build, route, error type, and a shortened technical message. It does not intentionally include credentials or canonical record contents.</p></section>
      <section class="panel settings-section integrity-settings-card"><div class="section-head"><div><h2>Data Integrity</h2><p>Review suspicious imports, duplicate candidates, and source conflicts without cluttering the primary navigation.</p></div><button class="secondary" data-route="data-integrity">Open Data Integrity</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Dashboard layout</h2><p>Choose which metric cards appear on the dashboard. This opens a scrollable settings panel.</p></div><button class="secondary" id="customizeBtn">Customize dashboard</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Appearance</h2><p>Choose Dark, Light, or follow your system setting.</p></div></div><div class="theme-buttons"><button class="secondary ${state.theme==='dark'?'active':''}" data-theme="dark">Dark</button><button class="secondary ${state.theme==='light'?'active':''}" data-theme="light">Light</button><button class="secondary ${state.theme==='system'?'active':''}" data-theme="system">System</button></div></section>
      <section class="panel about"><h2>About this build</h2><p><strong>ZEKE v${esc(BUILD.version)}</strong> · build ${esc(BUILD.build)}</p><p>${esc(BUILD.label||'Repair release')}</p></section>`;
  }

  function reviewFriendlyTitle(q) {
    const text=String(q?.question||q?.why_it_matters||'').toLowerCase();
    if(text.includes('clarification')||text.includes('raw evidence')||text.includes('combined')) return 'I may have mixed together information that belongs in different records.';
    if(text.includes('duplicate')) return 'I found records that may be accidental duplicates.';
    if(text.includes('blood pressure')) return 'I am not fully certain how to interpret this measurement.';
    if(text.includes('medication')) return 'I need to confirm a medication detail before changing your record.';
    return 'I found something I could not resolve safely on my own.';
  }

  function activeReviewHTML(q,tasks) {
    if(!q) { state.activeReviewId=''; try{sessionStorage.removeItem('zeke-active-review')}catch(_){} return questionsPageHTML(); }
    const task=tasks.find(t=>t.items.some(x=>x.id===q.id));
    const index=Math.max(0,tasks.indexOf(task));
    const original=esc(q.question||q.why_it_matters||'No additional source text is available.');
    return `<div class="review-workspace-shell"><div class="review-workspace-head"><button class="secondary" id="backToReviewQueue">← Back to questions</button><span class="badge">Issue ${index+1} of ${Math.max(tasks.length,1)}</span><button class="icon-btn" id="closeReviewWorkspace" aria-label="Close review">×</button></div><section class="panel review-workspace"><div class="review-intro"><span class="question-priority ${esc(q.priority||'optional')}">${esc(q.priority||'review')}</span><h1>${esc(reviewFriendlyTitle(q))}</h1><p>I did not make a potentially ambiguous correction automatically. Here is the safest interpretation I can propose from the available evidence.</p></div><div class="review-proposal"><h2>What I think should happen</h2><p>${esc(q.why_it_matters||'Keep the original evidence, update only the structured record that can be supported, and leave anything uncertain unchanged.')}</p><ul><li>Preserve the original source text.</li><li>Apply only the parts supported with very high confidence.</li><li>Leave uncertain details unchanged for now.</li></ul></div><div class="review-decision"><h2>Does that look right?</h2><div class="review-decision-actions"><button class="primary" id="acceptReviewProposal">Yes, that looks right</button><button class="secondary" id="adjustReviewProposal">Not quite</button><button class="text-action" id="showReviewOriginal">Show original information</button></div><div id="reviewAdjustment" class="review-adjustment" hidden><label>Tell ZEKE what is wrong<textarea id="reviewAdjustmentText" rows="4" placeholder="For example: those were two separate workouts, or that was not a blood-pressure reading."></textarea></label><div class="card-actions"><button class="primary" id="submitReviewAdjustment">Use my correction</button><button class="secondary" id="cancelReviewAdjustment">Cancel</button></div></div><div id="reviewOriginal" class="review-original" ${state.reviewOriginalOpen?'':'hidden'}><h3>Original review information</h3><p>${original}</p><small>${esc(q.question_key||'Source details unavailable')}</small></div></div><div class="review-workspace-nav"><button class="secondary" id="previousReview" ${index<=0?'disabled':''}>← Previous</button><span>${tasks.length-index-1} remaining after this item</span><button class="secondary" id="nextReview" ${index>=tasks.length-1?'disabled':''}>Next →</button></div></section></div>`;
  }

  function questionsPageHTML() {
    const all=state.factors.filter(f=>f.type==='clarification_question').sort((a,b)=>priorityWeight(b.priority)-priorityWeight(a.priority));
    const tasks=reviewTasks();
    if(state.activeReviewId) return activeReviewHTML(state.factors.find(f=>f.id===state.activeReviewId),tasks);
    const titleFor=key=>({'workout-review':'I may have misunderstood workout information','sleep-review':'I need help confirming sleep information','medication-review':'I need help confirming medication information','data-integrity-review':'I found records that may need repair','measurement-review':'I need help confirming a measurement'}[key]||'I need your help with related information');
    const cards=tasks.map(task=>{const first=task.items[0];return `<section class="panel question-group"><article class="question-card review-task-card"><div><span class="question-priority ${esc(task.priority)}">${esc(task.priority||'optional')}</span><h3>${esc(titleFor(task.key))}</h3><p>${task.items.length===1?'I have one proposed interpretation for you to confirm.':`I grouped ${task.items.length} related findings so you can resolve them together.`}</p></div><div class="question-actions"><button class="primary" data-review-question="${esc(first.id)}">Review</button><button class="secondary" data-review-task-later="${esc(task.key)}">Later</button></div></article></section>`}).join('');
    return `<div class="page-head"><div><h1>ZEKE Needs Your Help</h1><p>I handle only near-certain repairs automatically. These items need a quick confirmation from you.</p></div><span class="badge">${tasks.length} item${tasks.length===1?'':'s'}</span></div>${cards||'<section class="panel empty-page"><h2>Nothing needs your attention</h2><p>I do not currently need any clarification from you.</p></section>'}<section class="panel resolved-questions"><div class="section-head"><div><h2>Past decisions</h2><p>${all.length-openQuestions().length} resolved, dismissed, or deferred item${all.length-openQuestions().length===1?'':'s'}</p></div></div></section>`;
  }

  function globalTalkHTML(){ return `<button class="global-talk-button" id="globalTalkButton" aria-label="Talk to ZEKE"><img src="./assets/branding/zeke-mark-provisional.png" alt=""><span>Talk to ZEKE</span></button><div class="global-talk-overlay" id="globalTalkOverlay"><div class="global-talk-backdrop" id="globalTalkBackdrop"></div><div class="global-talk-panel">${conversationHTML()}</div></div>`;}


  function quickLogHTML(){
    if(!state.quickLogOpen)return '';
    const items=[['workout','Workout'],['activity','Single activity'],['intake','Intake'],['gluten','Gluten exposure'],['symptom','Symptom / ailment'],['life-event','Life event'],['cycle','Menstrual cycle'],['weight','Weight'],['blood_pressure','Blood pressure'],['sleep_duration','Sleep'],['waist_circumference','Body measurement'],['lab','Lab result'],['medication','Medication / supplement']];
    return `<div class="quick-log-overlay" id="quickLogOverlay"><div class="quick-log-backdrop" id="quickLogBackdrop"></div><section class="quick-log-sheet"><div class="section-head"><div><h2>+ Log</h2><p>Entering data for <strong>${esc(activeDateLabel())}</strong></p></div><button class="icon-btn" id="closeQuickLog">×</button></div><div class="quick-log-grid">${items.map(([id,label])=>`<button class="quick-log-option" data-quick-log="${id}">${label}</button>`).join('')}</div></section></div>`;
  }

  function activityProfile(name, explicit=''){
    if(explicit)return explicit;
    const n=String(name||'').toLowerCase();
    if(/massage|hydromassage|sauna|wellness|recovery|foam roll/.test(n))return 'recovery';
    if(/stretch|mobility|yoga/.test(n))return 'mobility';
    if(/physical therapy|\bpt\b|rehab|rotator cuff/.test(n))return 'rehab';
    if(/stair|treadmill|elliptical|bike|cycle|walk|run|swim|rower|cardio/.test(n))return 'cardio';
    return 'strength';
  }
  const activityProfileLabel=p=>({strength:'Strength',cardio:'Cardio',mobility:'Mobility / stretch',rehab:'Rehabilitation',recovery:'Recovery',sport:'Sport / recreation'}[p]||'Activity');
  function profileFields(profile, latest={}){
    if(profile==='strength')return `<label>Weight (lb)<input id="activityWeight" type="number" step="0.1" min="0" placeholder="${latest.weight??''}"></label><label>Reps<input id="activityReps" type="number" min="1" placeholder="${latest.reps??''}"></label><label>Sets<input id="activitySets" type="number" min="1" placeholder="${latest.sets??''}"></label><label>RPE (optional)<input id="activityRpe" type="number" min="1" max="10"></label>`;
    if(profile==='cardio')return `<label>Duration (min)<input id="activityDuration" type="number" min="1"></label><label>Steps / distance<input id="activitySteps" type="number" min="0"></label><label>Level / incline<input id="activityLevel" type="number" min="0" step="0.1"></label><label>Average HR<input id="activityHr" type="number" min="1"></label>`;
    if(profile==='rehab')return `<label>Duration (min, optional)<input id="activityDuration" type="number" min="1"></label><label>Pain before (0–10)<input id="activityPainBefore" type="number" min="0" max="10"></label><label>Pain after (0–10)<input id="activityPainAfter" type="number" min="0" max="10"></label><div class="direct-entry-hint">Specific PT activities can be added later; this session can be logged simply as completed.</div>`;
    if(profile==='recovery')return `<label>Duration (min)<input id="activityDuration" type="number" min="1"></label><label>Target area (optional)<input id="activityArea" type="text"></label><label>Intensity / program (optional)<input id="activityLevel" type="text"></label>`;
    return `<label>Duration (min)<input id="activityDuration" type="number" min="1"></label><label>Body area (optional)<input id="activityArea" type="text"></label><label>Pain before (0–10)<input id="activityPainBefore" type="number" min="0" max="10"></label><label>Pain after (0–10)<input id="activityPainAfter" type="number" min="0" max="10"></label>`;
  }

  function openActivityEntryModal(name, profileOverride=''){
    $('#directExerciseModal')?.remove();
    const latest=(workoutGroups().get(name)||[]).at(-1)||{}, profile=activityProfile(name,profileOverride);
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="directExerciseModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Log ${esc(name)}</h2><p>${esc(activityProfileLabel(profile))} · ${esc(activeDateLabel())}</p></div><button class="icon-btn" id="closeDirectExercise">×</button></div><form id="directExerciseForm" class="direct-entry-form"><label>Date<input id="directExerciseDate" type="date" value="${esc(activeDay())}" required></label><label>Activity type<select id="directActivityProfile"><option value="strength" ${profile==='strength'?'selected':''}>Strength</option><option value="cardio" ${profile==='cardio'?'selected':''}>Cardio</option><option value="mobility" ${profile==='mobility'?'selected':''}>Mobility / stretch</option><option value="rehab" ${profile==='rehab'?'selected':''}>Rehabilitation / PT</option><option value="recovery" ${profile==='recovery'?'selected':''}>Recovery</option><option value="sport" ${profile==='sport'?'selected':''}>Sport / recreation</option></select></label><div id="activityProfileFields" class="profile-fields wide">${profileFields(profile,latest)}</div><label class="wide">Notes (optional)<textarea id="directExerciseNotes" rows="2"></textarea></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelDirectExercise">Cancel</button><button type="submit" class="primary">Save</button></div><p class="form-error wide" id="directExerciseError" hidden></p></form></div></div>`);
    const close=()=>$('#directExerciseModal')?.remove();
    $('#closeDirectExercise')?.addEventListener('click',close);$('#cancelDirectExercise')?.addEventListener('click',close);$('#directExerciseModal')?.addEventListener('click',e=>{if(e.target.id==='directExerciseModal')close()});
    $('#directActivityProfile')?.addEventListener('change',e=>{$('#activityProfileFields').innerHTML=profileFields(e.target.value,latest)});
    $('#directExerciseForm')?.addEventListener('submit',async e=>{e.preventDefault();const date=$('#directExerciseDate').value,profile=$('#directActivityProfile').value,notes=$('#directExerciseNotes').value.trim();const num=id=>{const el=$(id);if(!el)return null;const v=Number(el.value);return Number.isFinite(v)&&v>=0?v:null};const structured={exercise:name,activity_profile:profile,workout_id:`workout-${date}`,weight:num('#activityWeight'),weight_unit:$('#activityWeight')?'lb':'',reps:num('#activityReps'),sets:num('#activitySets'),rpe:num('#activityRpe'),duration_min:num('#activityDuration'),steps:num('#activitySteps'),level:$('#activityLevel')?.value||null,average_hr:num('#activityHr'),body_area:$('#activityArea')?.value||null,pain_before:num('#activityPainBefore'),pain_after:num('#activityPainAfter'),completed:true,notes,interpretation_status:'confirmed'};const meaningful=Object.entries(structured).some(([k,v])=>!['exercise','activity_profile','workout_id','completed','interpretation_status','notes','weight_unit'].includes(k)&&v!=null&&v!=='')||notes||['rehab'].includes(profile);if(!meaningful){const err=$('#directExerciseError');err.hidden=false;err.textContent='Enter at least one relevant detail.';return;}await ZekeData.addEvent({category:'workout',timestamp:`${date}T12:00:00`,raw_text:notes,structured,provenance:{source:'direct-activity-entry',entry_mode:'structured-form'}});close();await refreshData();render();showToast(`${name} logged for ${fmtDate(date+'T12:00:00',{month:'short',day:'numeric'})}.`)});
  }

  function openAddActivityModal(){
    $('#addActivityModal')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="addActivityModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Add activity</h2><p>Create an activity once, then use + Log from its card.</p></div><button class="icon-btn" id="closeAddActivity">×</button></div><form id="addActivityForm" class="direct-entry-form"><label class="wide">Activity name<input id="newActivityName" required placeholder="e.g., Hamstring stretch"></label><label>Activity type<select id="newActivityProfile"><option value="strength">Strength</option><option value="cardio">Cardio</option><option value="mobility">Mobility / stretch</option><option value="rehab">Rehabilitation / PT</option><option value="recovery">Recovery</option><option value="sport">Sport / recreation</option></select></label><label><input id="logNewActivityNow" type="checkbox" checked> Log it now</label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelAddActivity">Cancel</button><button type="submit" class="primary">Continue</button></div></form></div></div>`);const close=()=>$('#addActivityModal')?.remove();$('#closeAddActivity').onclick=close;$('#cancelAddActivity').onclick=close;$('#addActivityForm').onsubmit=e=>{e.preventDefault();const name=$('#newActivityName').value.trim(),profile=$('#newActivityProfile').value;if(!name)return;const lib=JSON.parse(localStorage.getItem('zeke-activity-library')||'[]');if(!lib.some(x=>x.name.toLowerCase()===name.toLowerCase())){lib.push({name,profile});localStorage.setItem('zeke-activity-library',JSON.stringify(lib))}close();render();if($('#logNewActivityNow')?.checked!==false)openActivityEntryModal(name,profile)};
  }

  function openMetricEntryModal(id){
    const meta=METRICS[id]||{label:id.replaceAll('_',' '),unit:''};$('#metricEntryModal')?.remove();let fields='';if(id==='blood_pressure')fields=`<label>Systolic<input id="metricSys" type="number" min="1" required></label><label>Diastolic<input id="metricDia" type="number" min="1" required></label><label>Pulse (optional)<input id="metricPulse" type="number" min="1"></label>`;else fields=`<label>${esc(meta.label)} (${esc(meta.unit||'value')})<input id="metricValueInput" type="number" step="0.1" required></label>`;document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="metricEntryModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Log ${esc(meta.label)}</h2><p>No prior value will be copied.</p></div><button class="icon-btn" id="closeMetricEntry">×</button></div><form id="metricEntryForm" class="direct-entry-form"><label>Date<input id="metricEntryDate" type="date" value="${esc(activeDay())}" required></label>${fields}<label class="wide">Notes (optional)<textarea id="metricEntryNotes"></textarea></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelMetricEntry">Cancel</button><button type="submit" class="primary">Save</button></div></form></div></div>`);const close=()=>$('#metricEntryModal')?.remove();$('#closeMetricEntry').onclick=close;$('#cancelMetricEntry').onclick=close;$('#metricEntryForm').onsubmit=async e=>{e.preventDefault();const date=$('#metricEntryDate').value,notes=$('#metricEntryNotes').value.trim();if(id==='blood_pressure'){for(const [metric,el] of [['bp_systolic','#metricSys'],['bp_diastolic','#metricDia'],['resting_hr','#metricPulse']]){const v=Number($(el)?.value);if(Number.isFinite(v)&&v>0)await ZekeData.addEvent({category:'measurement',timestamp:`${date}T12:00:00`,raw_text:notes,structured:{metric_id:metric,value:v,unit:metric==='resting_hr'?'bpm':'mmHg',interpretation_status:'confirmed'},provenance:{source:'direct-tile-entry'}})}}else{const v=Number($('#metricValueInput').value);if(!Number.isFinite(v))return;await ZekeData.addEvent({category:id==='a1c'?'lab':'measurement',timestamp:`${date}T12:00:00`,raw_text:notes,structured:{metric_id:id,value:v,unit:meta.unit,interpretation_status:'confirmed'},provenance:{source:'direct-tile-entry'}})}close();await refreshData();render();showToast(`${meta.label} logged for ${fmtDate(date+'T12:00:00',{month:'short',day:'numeric'})}.`)};
  }

  function openIntakeModal(){
    $('#intakeModal')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="intakeModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Log intake</h2><p>Medication, supplement, vitamin, protein shake, or creatine.</p></div><button class="icon-btn" id="closeIntake">×</button></div><form id="intakeForm" class="direct-entry-form"><label>Date<input id="intakeDate" type="date" value="${esc(activeDay())}" required></label><label>Item type<select id="intakeType"><option value="medication">Medication</option><option value="supplement">Supplement</option><option value="vitamin">Vitamin</option><option value="protein">Protein shake</option><option value="creatine">Creatine</option></select></label><label class="wide">Name<input id="intakeName" placeholder="e.g., Kirkland Multivitamin"></label><div id="proteinOptions" class="wide" hidden><label>Protein per shake<select id="proteinGrams"><option>20</option><option selected>30</option><option>40</option></select></label><label>Quantity<input id="proteinQty" type="number" min="1" value="1"></label></div><label>Dose / amount (optional)<input id="intakeDose" type="number" step="0.1"></label><label>Unit (optional)<input id="intakeUnit" placeholder="mg, g, tablet"></label><label class="wide">Notes<input id="intakeNotes"></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelIntake">Cancel</button><button type="submit" class="primary">Save intake</button></div></form></div></div>`);const close=()=>$('#intakeModal')?.remove();$('#closeIntake').onclick=close;$('#cancelIntake').onclick=close;const sync=()=>{$('#proteinOptions').hidden=$('#intakeType').value!=='protein';$('#intakeName').closest('label').hidden=$('#intakeType').value==='protein'};$('#intakeType').onchange=sync;sync();$('#intakeForm').onsubmit=async e=>{e.preventDefault();const type=$('#intakeType').value,date=$('#intakeDate').value;let name=$('#intakeName').value.trim();let dose=Number($('#intakeDose').value)||null,unit=$('#intakeUnit').value.trim();const structured={intake_type:type,name,dose,unit,status:'taken',interpretation_status:'confirmed'};if(type==='protein'){const grams=Number($('#proteinGrams').value),qty=Number($('#proteinQty').value)||1;name='Protein shake';Object.assign(structured,{protein_g_per_shake:grams,quantity:qty,total_protein_g:grams*qty,dose:grams*qty,unit:'g protein'})}if(!name)return;await ZekeData.addEvent({category:'medication',timestamp:`${date}T12:00:00`,raw_text:$('#intakeNotes').value.trim(),structured,provenance:{source:'direct-intake-entry'}});close();await refreshData();render();showToast(`${name} logged for ${fmtDate(date+'T12:00:00',{month:'short',day:'numeric'})}.`)};
  }

  function insightEvidenceHTML(key){
    const sleep=key==='sleep-undertracked';
    const workouts=state.events.filter(isWorkoutEvent); const sleepPoints=allMetricSeries('sleep_duration');
    const title=sleep?'Sleep may be an undertracked recovery variable':'Evidence behind this insight';
    const rationale=sleep?`ZEKE found ${workouts.length} workout records and ${sleepPoints.length} confirmed sleep observation${sleepPoints.length===1?'':'s'}. The insight identifies a missing-data limitation; it does not claim that poor sleep caused any outcome.`:'This view should show only the evidence used for the selected insight.';
    return `<div class="evidence-focus" id="evidenceFocus"><section class="panel"><div class="section-head"><div><h2>${esc(title)}</h2><p>Focused evidence and limitations</p></div><button class="icon-btn" id="closeEvidenceFocus" aria-label="Close evidence">×</button></div><p>${esc(rationale)}</p><div class="evidence-summary-grid"><div><b>${workouts.length}</b><span>workouts reviewed</span></div><div><b>${sleepPoints.length}</b><span>sleep records</span></div><div><b>${sleep?'Moderate':'Contextual'}</b><span>confidence</span></div></div><p class="audit-note"><strong>What tracking could unlock:</strong> enough paired sleep and workout/recovery observations to test whether sleep duration coincides with changes in energy, performance, soreness, or recovery. ZEKE should not infer that relationship before the evidence exists.</p></section></div>`;
  }


  const LIFE_TEMPLATES = {
    symptom:{label:'Symptom or ailment',category:'symptom',fields:['severity','duration','location','possible_trigger','intervention','response'],examples:'headache, tinnitus, fatigue, nausea, dizziness, illness'},
    life_event:{label:'Life event',category:'life_event',fields:['intensity','duration','context','resolution'],examples:'argument, intimacy, sexual activity, stress, travel, family event'},
    menstrual_cycle:{label:'Menstrual cycle',category:'cycle',fields:['event','flow','cramps','spotting','mood','notes'],examples:'period start, period end, spotting, cramps'},
    gluten_exposure:{label:'Gluten exposure',category:'nutrition_exposure',fields:['exposure_level','certainty','meal','symptoms_after'],examples:'none, trace, some, high'}
  };

  function lifeEventRows(){ return state.events.filter(e=>['symptom','life_event','cycle','nutrition_exposure'].includes(semanticCategory(e)||e.category)).sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at)); }
  function dashboardInsightsHTML(){
    const q=reviewTasks().length, patterns=patternCandidates().length;
    const discoveries=(state.discoveries||[]).length;
    const headline=q?`${q} item${q===1?'':'s'} need your input`:discoveries?`${discoveries} insight${discoveries===1?'':'s'} available`:'Nothing urgent right now';
    const detail=q?'ZEKE is waiting for a decision only you can make.':patterns?`${patterns} exploratory pattern${patterns===1?' is':'s are'} ready to review.`:'New discoveries and recommendations will appear here when the evidence supports them.';
    return `<section class="panel dashboard-insights-tile"><div class="section-head"><div><span class="tile-kicker">INSIGHTS</span><h2>${esc(headline)}</h2><p>${esc(detail)}</p></div><span class="insight-count">${q+discoveries+patterns}</span></div><div class="insight-tile-actions"><button class="primary compact" data-route="insights">Open Insights</button>${q?'<button class="secondary compact" data-route="questions">Review question</button>':''}</div></section>`;
  }

  function lifeEventsPageHTML(){
    const rows=lifeEventRows();
    return `<div class="page-head"><div><h1>Life & Symptoms</h1><p>Start typing what happened. ZEKE maps your wording to a structured concept and asks only for relevant details.</p></div><button class="primary" id="addLifeEvent">+ Record something</button></div><section class="privacy-banner"><strong>Search first. Structure behind the scenes.</strong><span>Original wording is preserved. Private records use neutral previews, and Pattern Lab receives only the variables you permit.</span></section><section class="panel concept-entry-launch"><div><h2>What would you like to record?</h2><p>Symptoms, food exposures, cycle events, relationships, stress, travel, and other life context use the same type-and-select flow.</p></div><button class="primary" id="startConceptEntry">Start typing</button></section><section class="panel"><div class="section-head"><div><h2>Recent events</h2><p>${rows.length} recorded event${rows.length===1?'':'s'}. Associations are not treated as causes.</p></div></div>${rows.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Subject</th><th>Type</th><th>Summary</th><th>Privacy</th></tr></thead><tbody>${rows.slice(0,80).map(e=>`<tr><td>${esc(fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${esc(e.structured?.subject_label||e.structured?.subject_type||'Self')}</td><td>${esc((semanticCategory(e)||e.category).replaceAll('_',' '))}</td><td>${esc(humanEvent(e))}</td><td>${e.structured?.private?'Private':'Standard'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-inline">No life-context events yet. Start typing to create the first one.</div>'}</section>`;
  }

  function numericFeature(e,key){ const v=Number(e.structured?.[key]); return Number.isFinite(v)?v:null; }
  function pairedDailyData(){
    const days=new Map();
    const put=(day,key,val)=>{if(!days.has(day))days.set(day,{day});const row=days.get(day);row[key]=(Number(row[key])||0)+Number(val||0)};
    for(const e of state.events){const day=localDay(new Date(e.timestamp||e.recorded_at));const cat=semanticCategory(e)||e.category, st=e.structured||{};
      if(st.include_in_analysis===false)continue;
      if(['measurement','lab'].includes(cat)){const id=canonicalMetric(metricId(e)),v=Number(metricValue(e));if(Number.isFinite(v)){if(!days.has(day))days.set(day,{day});days.get(day)[id]=v}}
      const concept=conceptById(st.concept_id);
      if(concept){for(const [key,w] of concept.analysis||[])put(day,key,(Number(st.severity??st.intensity)||1)*w);put(day,`concept_${concept.id.replace(/[^a-z0-9]+/g,'_')}`,Number(st.severity??st.intensity)||1);continue}
      if(cat==='symptom'){const name=String(st.name||st.symptom||'symptom').toLowerCase().replace(/[^a-z0-9]+/g,'_');put(day,`symptom_${name}`,Number(st.severity)||1)}
      if(cat==='nutrition_exposure' && /gluten/i.test(st.name||st.exposure||''))put(day,'gluten_exposure',(({none:0,trace:1,some:2,moderate:2,high:3}[String(st.exposure_level||'').toLowerCase()] ?? Number(st.amount)) || 1));
      if(cat==='life_event'){const name=String(st.name||st.event_type||'life_event').toLowerCase().replace(/[^a-z0-9]+/g,'_');put(day,`event_${name}`,Number(st.intensity)||1)}
      if(cat==='cycle')put(day,`cycle_${String(st.subject_type||'self')}`,1);
    } return [...days.values()].sort((a,b)=>a.day.localeCompare(b.day));
  }

  function correlation(x,y){const pairs=x.map((v,i)=>[v,y[i]]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));if(pairs.length<5)return null;const mx=pairs.reduce((a,p)=>a+p[0],0)/pairs.length,my=pairs.reduce((a,p)=>a+p[1],0)/pairs.length;let num=0,dx=0,dy=0;for(const [a,b] of pairs){num+=(a-mx)*(b-my);dx+=(a-mx)**2;dy+=(b-my)**2}return dx&&dy?{r:num/Math.sqrt(dx*dy),n:pairs.length}:null}
  function patternCandidates(){const data=pairedDailyData(), keys=[...new Set(data.flatMap(d=>Object.keys(d)))].filter(k=>k!=='day');const out=[];for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const c=correlation(data.map(d=>d[keys[i]]),data.map(d=>d[keys[j]]));if(c&&Math.abs(c.r)>=.25)out.push({a:keys[i],b:keys[j],...c})}return out.sort((a,b)=>Math.abs(b.r)-Math.abs(a.r)).slice(0,12)}
  function prettyVar(k){return k.replace(/^symptom_/,'').replace(/^event_/,'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())}
  function patternLabPageHTML(){const data=pairedDailyData(), patterns=patternCandidates();return `<div class="page-head"><div><h1>Pattern Lab</h1><p>Deterministic statistical analysis of your longitudinal records. AI may explain results, but it does not calculate them.</p></div><button class="secondary" id="runPatternLab">Run analysis</button></div><section class="pattern-summary"><div><b>${data.length}</b><span>days with structured data</span></div><div><b>${patterns.length}</b><span>exploratory associations</span></div><div><b>Guarded</b><span>minimum-data gate active</span></div></section><section class="panel"><div class="section-head"><div><h2>Exploratory associations</h2><p>These are screening results, not causal conclusions. Multiple-regression models unlock after enough overlapping observations exist.</p></div></div>${patterns.length?`<div class="pattern-grid">${patterns.map(p=>`<article class="pattern-card"><span class="confidence ${Math.abs(p.r)>.6?'high':'moderate'}">${Math.abs(p.r)>.6?'Stronger':'Possible'} association</span><h3>${esc(prettyVar(p.a))} ↔ ${esc(prettyVar(p.b))}</h3><p>${p.r>0?'They tended to rise together.':'When one was higher, the other tended to be lower.'}</p><div class="pattern-stats"><b>r = ${p.r.toFixed(2)}</b><span>n = ${p.n} paired days</span></div><small>Exploratory only; timing, missing data, and third variables may explain this pattern.</small></article>`).join('')}</div>`:'<div class="empty-inline">Not enough overlapping structured observations yet. Track repeated symptoms, exposures, sleep, and context to unlock analysis.</div>'}</section><section class="panel"><h2>Regression readiness</h2><p>ZEKE will use linear, logistic, count, lagged, and regularized models only when sample size, variation, and missingness checks pass. It will show included variables, exclusions, confidence intervals, sensitivity checks, and model limitations.</p></section>`}
  function insightsPageHTML(){const candidates=patternCandidates();return `<div class="page-head"><div><h1>Insight Center</h1><p>Observations, research context, suggestions, and questions—separated by purpose and evidence.</p></div></div><div class="insight-center-grid"><section class="panel"><h2>Needs attention</h2><p>${reviewTasks().length?`${reviewTasks().length} item${reviewTasks().length===1?'':'s'} need confirmation.`:'Nothing currently requires your input.'}</p><button class="text-action" data-route="questions">Review questions</button></section><section class="panel"><h2>Trends & patterns</h2><p>${candidates.length?`${candidates.length} exploratory association${candidates.length===1?'':'s'} are available in Pattern Lab.`:'More repeated data are needed before ZEKE can test patterns.'}</p><button class="text-action" data-route="pattern-lab">Open Pattern Lab</button></section><section class="panel"><h2>Research connections</h2><p>Published evidence is shown separately from your personal observations, with source, evidence strength, relevance, and last-reviewed date.</p></section><section class="panel"><h2>Suggestions</h2><p>Suggestions must state why they are being shown now, what evidence supports them, and what uncertainty remains.</p></section></div>${thinkingHTML()}`;}

  function openLifeEventModal(kind='symptom'){
    const preferred=conceptDomainForTemplate(kind); $('#lifeEventModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="lifeEventModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Record an event</h2><p>Type what happened, then select the closest concept. Your original wording remains attached.</p></div><button class="icon-btn" id="closeLifeEvent">×</button></div><form id="lifeEventForm" class="direct-entry-form"><label class="wide concept-search-label">What happened?<input id="lifeName" autocomplete="off" placeholder="Start typing: migraine, argument, spotting, travel…" required><div id="conceptMatches" class="concept-matches"></div></label><input id="lifeConceptId" type="hidden"><label>Date<input id="lifeDate" type="date" value="${esc(activeDay())}" required></label><label>Subject<select id="lifeSubject"><option value="self">Me</option><option value="partner">Partner</option><option value="child">Child / family member</option><option value="other">Other</option></select></label><label>Severity / intensity (0–10)<input id="lifeSeverity" type="number" min="0" max="10" step="1"></label><label>Duration (optional)<input id="lifeDuration" placeholder="e.g., 2 hours"></label><label class="wide">Notes / context<textarea id="lifeNotes" placeholder="Optional details, triggers, interventions, or outcome"></textarea></label><label class="wide checkbox-line"><input id="lifePrivate" type="checkbox"> Store in the PIN-secured Private Vault with a neutral preview</label><label class="wide checkbox-line"><input id="lifeAnalyze" type="checkbox" checked> Allow approved structured variables in Pattern Lab</label><label class="wide checkbox-line"><input id="lifeAI" type="checkbox"> Allow this event to be sent to connected AI for interpretation</label><p class="wide form-error" id="lifeEventError" hidden></p><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelLifeEvent">Cancel</button><button type="submit" class="primary">Save event</button></div></form></div></div>`);
    const close=()=>$('#lifeEventModal')?.remove(); $('#closeLifeEvent').onclick=close; $('#cancelLifeEvent').onclick=close;
    const input=$('#lifeName'),matches=$('#conceptMatches'),hidden=$('#lifeConceptId');
    const draw=()=>{const found=conceptSearch(input.value,preferred);matches.innerHTML=found.map(c=>`<button type="button" class="concept-option" data-concept-id="${esc(c.id)}"><strong>${esc(c.label)}</strong><span>${esc(c.domain)}${c.parents.length?' · related to '+conceptById(c.parents[0])?.label:''}</span></button>`).join('')||`<div class="concept-empty">No confident local match. <button type="button" class="text-action" id="consultConceptAI">Ask ZEKE to interpret this</button></div>`;$$('[data-concept-id]',matches).forEach(b=>b.onclick=()=>{const c=conceptById(b.dataset.conceptId);hidden.value=c.id;input.value=c.label;matches.innerHTML=`<div class="concept-selected"><strong>${esc(c.label)}</strong><span>Selected structured concept</span></div>`})};
    input.addEventListener('input',()=>{hidden.value='';draw()}); input.addEventListener('focus',draw); draw();
    $('#lifeEventForm').onsubmit=async e=>{e.preventDefault();const original=input.value.trim(),date=$('#lifeDate').value;if(!original)return;let concept=conceptById(hidden.value);if(!concept){concept={id:`custom.${preferred}.${original.toLowerCase().replace(/[^a-z0-9]+/g,'_')}`,label:original,domain:preferred,category:LIFE_TEMPLATES[kind]?.category||'life_event',parents:[],analysis:[[original.toLowerCase().replace(/[^a-z0-9]+/g,'_'),1]]}}
      const isPrivate=$('#lifePrivate').checked,notes=$('#lifeNotes').value.trim(),subject=$('#lifeSubject').value; const err=$('#lifeEventError');
      if(isPrivate&&!vaultConfig()){err.hidden=false;err.textContent='Set a Private Vault PIN in Settings before saving encrypted private data.';return}
      if(isPrivate&&!vaultUnlocked()){const pin=prompt('Enter your Private Vault PIN to encrypt this event.');if(!pin||!await unlockVault(pin)){err.hidden=false;err.textContent='The vault could not be unlocked.';return}}
      let privatePayload=null; if(isPrivate)privatePayload=await encryptPrivatePayload({original_wording:original,notes});
      const st={name:concept.label,original_wording:isPrivate?'Private event':original,concept_id:concept.id,concept_label:concept.label,concept_domain:concept.domain,concept_parents:concept.parents||[],analysis_weights:concept.analysis||[],event_type:kind,severity:Number($('#lifeSeverity').value)||null,intensity:Number($('#lifeSeverity').value)||null,duration:$('#lifeDuration').value||'',subject_type:subject,subject_label:{self:'Me',partner:'Partner',child:'Child / family member',other:'Other'}[subject],private:isPrivate,private_payload:privatePayload,include_in_analysis:$('#lifeAnalyze').checked,allow_ai:$('#lifeAI').checked&&!isPrivate,interpretation_status:'confirmed'};
      await ZekeData.addEvent({category:concept.category,timestamp:`${date}T12:00:00`,raw_text:isPrivate?'':notes,structured:st,provenance:{source:'concept-search-entry',concept_version:1}});close();await refreshData();render();showToast(`${concept.label} logged.`)};
  }

  function navHTML() {
    const items=[['dashboard','⌂','Dashboard'],['health','♡','Health'],['fitness','⌁','Fitness'],['life-events','◎','Life & Symptoms'],['pattern-lab','▥','Pattern Lab'],['insights','💡','Insights'],['medications','✚','Medications'],['labs','⌬','Labs'],['calendar','▣','Calendar'],['questions','💬','Questions'],['settings','⚙','Settings']];
    return `<aside class="sidebar" id="sidebar"><div class="brand"><button class="brand-home" data-route="dashboard" title="Return to Dashboard"><img class="brand-logo" src="./assets/branding/zeke-mark-provisional.png" alt="Project ZEKE"></button><div><strong>PROJECT ZEKE</strong><span>One thread. Everything connected.</span></div><button class="sidebar-close" id="sidebarClose" aria-label="Close navigation">×</button></div><nav>${items.map(([id,icon,label])=>`<button class="nav-item ${state.route===id?'active':''}" data-route="${id}"><span>${icon}</span>${esc(label)}</button>`).join('')}</nav><div class="sidebar-spacer"></div><div class="privacy-note">Private by design. Your records stay with your chosen storage provider.</div><div class="build-label">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></aside><div class="sidebar-scrim" id="sidebarScrim"></div>`;
  }

  function topbarHTML() {
    const greeting=new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
    return `<header class="topbar"><button class="menu-button" id="menuButton" aria-label="Open navigation">☰</button><button class="topbar-brand brand-home" data-route="dashboard" title="Return to Dashboard"><img src="./assets/branding/zeke-mark-provisional.png" alt="ZEKE"><div><strong>ZEKE</strong><span>v${esc(BUILD.version)} · ${esc(BUILD.build)}</span></div></button><div class="topbar-greeting"><h1>${greeting}, Frank</h1><p>${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p></div>${state.route==='dashboard'?`<div class="range-tabs">${[['week','Week'],['month','Month'],['quarter','Quarter'],['6months','6 months'],['year','Year'],['all','All']].map(([id,label])=>`<button class="range ${state.range===id?'active':''}" data-range="${id}">${label}</button>`).join('')}</div>`:''}<div class="top-actions"><button class="primary compact quick-log-trigger" id="quickLogBtn">+ Log</button><button class="secondary compact labeled-top-action" id="helpBtn" title="Help">Help</button><button class="secondary compact labeled-top-action" id="statusBtn" title="ZEKE status">Status</button></div></header>`;
  }

  function connectedAppHTML() {
    let content='';
    if(state.route==='dashboard') content=dashboardHTML();
    else if(state.route==='health') content=healthPageHTML();
    else if(state.route==='fitness') content=fitnessPageHTML();
    else if(state.route==='medications') content=medicationsPageHTML();
    else if(state.route==='labs') content=labsPageHTML();
    else if(state.route==='calendar') content=calendarPageHTML();
    else if(state.route==='life-events') content=lifeEventsPageHTML();
    else if(state.route==='pattern-lab') content=patternLabPageHTML();
    else if(state.route==='insights') content=insightsPageHTML();
    else if(state.route==='data-integrity') content=dataIntegrityHTML();
    else if(state.route==='questions') content=questionsPageHTML();
    else if(state.route==='settings') content=settingsPageHTML();
    return `<div class="app-shell">${navHTML()}<main class="main-shell">${topbarHTML()}<div class="content-shell">${content}</div></main>${globalTalkHTML()}${customizeDrawerHTML()}${quickLogHTML()}<div class="toast" id="toast"></div><input type="file" id="conversationFile" hidden></div>`;
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
    if(['symptom','life_event','cycle','nutrition_exposure'].includes(e.category)){ const n=s.private?'Private event':(s.name||s.symptom||s.event_type||e.category); const detail=s.exposure_level?` · ${s.exposure_level}`:s.severity!=null?` · ${s.severity}/10`:''; return `${n}${detail}`; }
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
    const localParsed=ZekeParser.interpret(text,parserContext());
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
    if(parsed.clarificationQuestion && !(parsed.events||[]).length){
      state.pending={type:'needs-detail',rawId:raw.id,rawText:text};
      pushZeke(parsed.clarificationQuestion,{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});
      state.busy=false;render();return;
    }
    parsed=await addMedicationPreview(parsed);
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
    pushZeke(interpretationPrompt(parsed),{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'},{label:'Later',value:'confirm-later'},{label:'Ignore',value:'confirm-ignore'}]});
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
      state.context={exercise:'bench press'}; const parsed=ZekeParser.interpret(p.rawText.replace(/^bp\s*/i,''),parserContext());
      state.pending={type:'confirm',rawId:p.rawId,rawText:p.rawText,parsed}; pushZeke(`I understood that as ${parsed.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'}]}); render(); return;
    }
    if(['ambig-later','pending-later','confirm-later'].includes(value)) { pushZeke('No problem. I’ll keep the original input unresolved and we can come back to it later.'); state.pending=null; state.context={}; render(); return; }
    if(['ambig-ignore','pending-ignore','confirm-ignore'].includes(value)) { pushZeke('Okay. I won’t keep asking about that interpretation. The original note remains preserved, but I won’t turn it into structured data.'); state.pending=null; state.context={}; render(); return; }
    if(value==='confirm-correct') { pushZeke('Thanks for catching that. Tell me what I got wrong, and I’ll try again without overwriting the original note.'); state.pending={...p,type:'correction-awaiting'}; render(); return; }
    if(value==='confirm-save') {
      const candidate=(p.parsed.events||[])[0]; const dupes=(p.parsed.events||[]).length===1?await ZekeData.findLikelyDuplicates(candidate):[];
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
      const original=state.pending; const parsed=ZekeParser.interpret(text,parserContext());
      if((parsed.events||[]).length){state.pending={type:'confirm',rawId:original.rawId,rawText:original.rawText,parsed};pushZeke(`Thanks. ${interpretationPrompt(parsed)}`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'}]});render();return true;}
    }
    if(['needs-detail','ai-clarify'].includes(state.pending?.type)) {
      pushUser(text); render();
      const pendingContext={...state.context,original_input:state.pending.rawText,pending_question:state.pending.ai?.clarificationQuestion||null};
      let parsed=ZekeParser.interpret(text,parserContext(pendingContext));
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

  function openMedicationEntryModal(value='') {
    $('#medicationEntryModal')?.remove();
    const canonical=ZekeParser.canonicalMedicationId(value||''), savedPref=state.preferences.medication_confirmation_preferences?.[canonical]||'every';
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="medicationEntryModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Log medication or supplement</h2><p>Record one dose for ${esc(activeDateLabel())}. Use Talk to ZEKE for backfilling a recurring schedule.</p></div><button class="icon-btn" id="closeMedicationEntry" aria-label="Close">×</button></div><form id="medicationEntryForm" class="direct-entry-form"><label class="wide">Medication or supplement<input id="medicationName" value="${esc(value)}" required placeholder="e.g., Atorvastatin"></label><label>Dose<input id="medicationDose" type="number" min="0" step="any"></label><label>Unit<input id="medicationUnit" placeholder="mg, tablet, injection"></label><label>Date<input id="medicationDate" type="date" value="${esc(activeDay())}" required></label><label>Status<select id="medicationStatus"><option value="taken">Taken</option><option value="missed">Missed</option><option value="not_taken_yet">Not taken yet</option><option value="started">Started</option><option value="stopped">Stopped</option><option value="changed">Dose changed</option></select></label><label class="wide">Dose confirmation preference<select id="medicationConfirmPref"><option value="every">Confirm every dose</option><option value="exceptions">Prompt about missed or changed doses</option><option value="none">Do not prompt me</option></select></label><label class="wide">Notes<textarea id="medicationNotes" rows="2"></textarea></label><div class="direct-entry-actions wide"><button type="button" class="text-action" id="medicationBackfill">Backfill through Talk to ZEKE</button><button type="button" class="secondary" id="cancelMedicationEntry">Cancel</button><button type="submit" class="primary">Save dose</button></div></form></div></div>`);
    $('#medicationConfirmPref').value=savedPref;
    const close=()=>$('#medicationEntryModal')?.remove(); $('#closeMedicationEntry').onclick=close;$('#cancelMedicationEntry').onclick=close;
    $('#medicationBackfill').onclick=()=>{const name=$('#medicationName').value.trim();close();state.context={medication:name||null,bulk_operation:'medication_backfill',active_date:activeDay()};pushZeke(name?`Tell me the schedule and date range to backfill for ${name}. I’ll preview every date, skip duplicates, and ask before saving.`:`Tell me which medication or supplement to backfill, its schedule, and the date range. I’ll preview every date and ask before saving.`);render();setTimeout(()=>{$('#globalTalkButton')?.click();$('#talkInput')?.focus()},0)};
    $('#medicationEntryForm').onsubmit=async e=>{e.preventDefault();const name=$('#medicationName').value.trim(),date=$('#medicationDate').value,pref=$('#medicationConfirmPref').value;if(!name||!date)return;const id=ZekeParser.canonicalMedicationId(name);state.preferences={...state.preferences,medication_confirmation_preferences:{...(state.preferences.medication_confirmation_preferences||{}),[id]:pref}};await ZekeData.savePreferences(state.preferences);const candidate={category:'medication',timestamp:`${date}T12:00:00`,raw_text:$('#medicationNotes').value||'',structured:{medication_name:name,original_medication_name:name,canonical_medication_id:id,dose:Number($('#medicationDose').value)||null,unit:$('#medicationUnit').value||'',status:$('#medicationStatus').value,confirmation_preference:pref,interpretation_status:'confirmed'},provenance:{source:'direct-medication-entry'}};if((await ZekeData.findLikelyDuplicates(candidate,0.94)).length&&!confirm(`A matching ${name} entry already exists for ${date}. Save a separate event anyway?`))return;await ZekeData.addEvent(candidate);close();await refreshData();render();showToast(`${name} dose logged.`)};
  }

  function startContextLog(type,value='') {
    if(type==='metric') {
      const meta=METRICS[value]; state.context={metric:value==='blood_pressure'?'blood_pressure':value,active_date:activeDay()}; pushZeke(`Let's log ${meta?.label||value}. What is the value?`);
    } else if(type==='exercise') { state.context={exercise:value||null,active_date:activeDay()}; pushZeke(value?`Let's log ${value}. You can tell me weight, reps, sets, RPE, pain, or anything else that matters.`:'Tell me about the workout.'); }
    else if(type==='medication') { openMedicationEntryModal(value); return; }
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
    addMetric('body_fat_pct',get('fat','fat_pct','body_fat','body_fat_pct','body_fat_percentage'),'%');
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
  function sourceIdentityEntity(c){const st=c.structured||{};return String(st.metric_id||st.exercise||st.medication_name||st.symptom||st.note_type||'').trim().toLowerCase();}
  function candidateSourceCell(c,row){
    const st=c.structured||{}, cells=row.__source_cells||{};
    const aliases={weight:['weight_lbs','weight_lb','weight','body_weight','bodyweight'],body_fat_pct:['fat','fat_pct','body_fat','body_fat_pct','body_fat_percentage'],energy:['energy_1_10','energy'],appetite:['appetite_1_10','appetite','hunger','hunger_1_10'],resting_hr:['resting_heartbeat','resting_hr','resting_heart_rate','rhr'],a1c:['hemoglobin_a1c','a1c','hba1c'],average_glucose:['average_glucose','estimated_average_glucose'],ldl:['ldl_direct_measure','ldl','ldl_cholesterol'],total_cholesterol:['cholesterol','total_cholesterol'],hdl:['highdensity_chol','high_density_chol','hdl','hdl_cholesterol'],triglycerides:['triglicerides','triglycerides'],apob:['apolipoprotein_b','apob'],lpa:['lipoprotein_a','lpa','lp_a'],wbc:['wbc'],hgb:['hgb','hemoglobin'],hct:['hct','hematocrit'],mcv:['mcv'],platelets:['platelets'],alt:['alt_sgpt','alt'],vitamin_b12:['vitamin_b12','b12']};
    const wanted=[...(aliases[st.metric_id]||[])];
    if(c.category==='medication') wanted.push('given_dose','tirzepatide_dose','mounjaro_dose','zepbound_dose');
    if(c.category==='workout'){
      const workoutCells=['exercise_desc','exercise_description','exercise','activity','exercise_duration','duration_min','duration'].map(key=>cells[key]).filter(Boolean);
      return workoutCells.length?[...new Set(workoutCells)].join(','):null;
    }
    for(const key of wanted)if(cells[key])return cells[key];
    return null;
  }
  async function enrichSourceIdentity(c,row,source){
    const sourceCell=candidateSourceCell(c,row);
    if(!sourceCell) return null;
    const exactLogical=[source.id,row.__sheet,sourceCell,c.category,sourceIdentityEntity(c)].join('|');
    const normalizedLogical=[source.id,normHeader(row.__sheet),sourceCell,eventSubkey(c)].join('|');
    const exactKey=await sha256Text(exactLogical), normalizedKey=await sha256Text(normalizedLogical);
    const payload=JSON.stringify({category:c.category,timestamp:c.timestamp,structured:c.structured,raw_text:c.raw_text||''});
    c.provenance={...(c.provenance||{}),source:'connected-workbook',file:source.name,sheet:row.__sheet,source_row:row.__source_row,source_cell:sourceCell,header_row:row.__header_row,source_id:source.id,evidence_mode:'literal-cell-only',source_key:exactKey,source_key_version:'exact-cell-v1',source_key_aliases:normalizedKey===exactKey?[]:[normalizedKey],source_fingerprint:await sha256Text(payload)};
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
  async function repositoryReviewFingerprint(){
    const events=await ZekeData.listEvents();
    const rows=events.map(e=>[e.id,e.updated_at||e.recorded_at||'',e.category||'',e.timestamp||'',e.provenance?.source_key||'',...(e.provenance?.source_key_aliases||[]),JSON.stringify(e.structured||{})].join('|')).sort();
    return sha256Text(rows.join('\n'));
  }
  async function inspectWorkbookBuffer(buffer,source){
    if(!window.XLSX)throw new Error('Spreadsheet reader did not load. Refresh and try again.');
    const workbook=window.XLSX.read(buffer,{type:'array',cellDates:true});
    const built=await buildWorkbookCandidates(workbook,source);
    if(!built.candidates.length)throw new Error('No safely interpretable health records were found. Nothing was changed.');
    const report=await ZekeData.preflightSourceEvents(built.candidates);
    const candidateFingerprint=await sha256Text(built.candidates.map(c=>`${c.provenance?.source_key||''}|${c.provenance?.source_fingerprint||''}`).sort().join('\n'));
    const repositoryFingerprint=await repositoryReviewFingerprint();
    const reviewToken=await sha256Text(JSON.stringify({source_id:source.id,candidate_fingerprint:candidateFingerprint,repository_fingerprint:repositoryFingerprint,report}));
    return {buffer,source,workbook,built,report,candidateFingerprint,repositoryFingerprint,reviewToken};
  }
  function workbookCounts(report,built){return {records_recognized:built.candidates.length,records_created:report.created,records_updated:report.updated,unchanged:report.unchanged,linked_existing:report.linked_existing,conflicts:report.conflicts,unsupported_updates:report.unsupported_updates,unmapped_rows:built.unmapped};}
  function workbookCommitSummary(report,built){return `${built.candidates.length} recognized; ${report.created} new; ${report.updated} updates; ${report.linked_existing} links; ${report.unchanged} unchanged; ${report.conflicts} conflicts; ${report.unsupported_updates} unsupported updates.`;}
  async function commitWorkbookInspection(inspection,{link=false,quiet=false}={}){
    const {buffer,built,report,reviewToken}=inspection;
    if(report.conflicts||report.unsupported_updates)throw new Error(`Preflight stopped the sync: ${report.conflicts} conflict(s), ${report.unsupported_updates} unsupported update(s). No files were changed.`);
    let source=inspection.source, committed=null, journalStarted=false;
    const transactionId=crypto.randomUUID();
    const startedAt=new Date().toISOString();
    try{
      await ZekeData.saveImportBatch({type:'workbook-sync-transaction',transaction_id:transactionId,status:'commit_started',source:source.id,file:source.name,review_token:reviewToken,counts:workbookCounts(report,built),message:'User approved the reviewed workbook preflight. Commit started.',stages:[{stage:'preflight_reviewed',at:startedAt},{stage:'commit_started',at:new Date().toISOString()}]});
      journalStarted=true;
      if(link){source=await ZekeData.saveSyncSource(source.name,buffer,{source_id:source.id});}
      committed=await ZekeData.reconcileSourceEvents(built.candidates,{source:source.id,file:source.name,preflight:report,transaction_id:transactionId,review_token:reviewToken});
      const verification=await ZekeData.verifySourceEvents(built.candidates);
      const verified=verification.unchanged===built.candidates.length&&!verification.created&&!verification.updated&&!verification.linked_existing&&!verification.conflicts&&!verification.unsupported_updates;
      if(!verified){const error=new Error(`Repository verification failed after commit: ${verification.unchanged} unchanged, ${verification.created} new, ${verification.updated} updates, ${verification.conflicts} conflicts.`);error.repositoryCommitted=true;error.verification=verification;throw error;}
      const mirror=window.XLSX.utils.book_new(); await mirrorEventsIntoWorkbook(mirror);
      const output=window.XLSX.write(mirror,{type:'array',bookType:'xlsx',compression:true});
      await ZekeData.updateSyncSourceWorkbook(output,{...committed,verification,transaction_id:transactionId,diagnostics:built.diagnostics,rows_read:built.rows.length,unmapped_rows:built.unmapped});
      await ZekeData.saveImportBatch({type:'workbook-sync-transaction',transaction_id:transactionId,status:'verified_complete',source:source.id,file:source.name,review_token:reviewToken,counts:workbookCounts(report,built),verification,backup_path:committed.backup_path||null,previous_source_backup_path:source.previous_source_backup_path||null,message:'Workbook transaction committed and verified against the persisted event repository. The separate event mirror was regenerated.',stages:[{stage:'preflight_reviewed',at:startedAt},{stage:'commit_started',at:startedAt},{stage:'repository_committed',at:new Date().toISOString()},{stage:'repository_verified',at:new Date().toISOString()},{stage:'mirror_regenerated',at:new Date().toISOString()}]});
      state.syncReport={...committed,verification,transaction_id:transactionId,diagnostics:built.diagnostics,rows_read:built.rows.length,unmapped_rows:built.unmapped}; state.syncSource=await ZekeData.getSyncSource(); state.syncPreflight=null;
      if(!quiet)showToast(`Sync verified: ${committed.created} created, ${committed.updated} updated, ${committed.unchanged} unchanged.`);
      return state.syncReport;
    }catch(error){
      if(journalStarted)try{await ZekeData.saveImportBatch({type:'workbook-sync-transaction',transaction_id:transactionId,status:'failed',source:source.id,file:source.name,review_token:reviewToken,counts:workbookCounts(report,built),backup_path:committed?.backup_path||null,previous_source_backup_path:source.previous_source_backup_path||null,source_may_have_changed:Boolean(link),repository_may_have_changed:Boolean(committed||error.repositoryCommitted),verification:error.verification||null,message:`Workbook transaction failed: ${error.message}`});}catch(_){ }
      throw error;
    }
  }
  async function preflightConnectedWorkbook(){
    if(state.syncBusy)throw new Error('A workbook operation is already running.');
    state.syncBusy=true;
    try{
      const linked=await ZekeData.readSyncSourceWorkbook();
      if(!linked?.buffer)throw new Error('No connected workbook is available.');
      const inspection=await inspectWorkbookBuffer(linked.buffer,linked.source);
      return {...inspection.report,candidates:inspection.built.candidates.length,diagnostics:inspection.built.diagnostics,rows_read:inspection.built.rows.length,unmapped_rows:inspection.built.unmapped,review_token:inspection.reviewToken,reviewed_at:new Date().toISOString(),ready:!inspection.report.conflicts&&!inspection.report.unsupported_updates};
    } finally { state.syncBusy=false; }
  }

  async function syncConnectedWorkbook({quiet=false,reviewToken=''}={}){
    if(state.syncBusy)throw new Error('A workbook operation is already running.');
    if(!reviewToken)throw new Error('Run and review the read-only preflight before committing a sync.');
    state.syncBusy=true;
    try{
      const linked=await ZekeData.readSyncSourceWorkbook();if(!linked?.buffer)throw new Error('No connected workbook is available.');
      const inspection=await inspectWorkbookBuffer(linked.buffer,linked.source);
      if(inspection.reviewToken!==reviewToken)throw new Error('The workbook or repository changed after the reviewed preflight. Run preflight again before committing.');
      return await commitWorkbookInspection(inspection,{link:false,quiet});
    }finally{state.syncBusy=false;}
  }

  async function handleImport(file) {
    const status=$('#importStatus'); state.importStatus='Reading file…'; if(status)status.textContent=state.importStatus;
    try {
      const lowerName=file.name.toLowerCase(); let rows=[]; let historyPackage=null;
      if(lowerName.endsWith('.xlsx')) {
        const buffer=await file.arrayBuffer();
        const current=await ZekeData.getSyncSource();
        const provisional={...(current||{}),id:current?.id||crypto.randomUUID(),kind:'health-workbook',name:file.name,path:current?.path||'',linked_at:current?.linked_at||null,updated_at:new Date().toISOString()};
        const inspection=await inspectWorkbookBuffer(buffer,provisional);
        state.importReport={file:file.name,counts:workbookCounts(inspection.report,inspection.built),message:'Read-only file review complete. The workbook, repository, mirror, backups, and import history have not been changed.'};
        state.importStatus=`Workbook review: ${workbookCommitSummary(inspection.report,inspection.built)}`;render();
        if(inspection.report.conflicts||inspection.report.unsupported_updates)throw new Error(`The workbook cannot be committed safely: ${inspection.report.conflicts} conflict(s), ${inspection.report.unsupported_updates} unsupported update(s).`);
        if(!confirm(`Review complete. ${workbookCommitSummary(inspection.report,inspection.built)} Commit this workbook transaction now?`)){state.importStatus='Workbook review completed; commit canceled. Nothing was changed.';render();return;}
        state.syncBusy=true;
        let report;
        try{report=await commitWorkbookInspection(inspection,{link:true,quiet:true});}finally{state.syncBusy=false;}
        state.importStatus=`Workbook connected and verified: ${report.created} created, ${report.updated} updated, ${report.unchanged} unchanged.`;
        state.importReport={file:file.name,counts:{records_created:report.created,records_updated:report.updated,unchanged:report.unchanged,linked_existing:report.linked_existing,conflicts:report.conflicts,unmapped_rows:report.unmapped_rows},message:'Uploaded workbook preserved; any previously connected workbook was archived before replacement; event repository verified; ZEKE Event Mirror regenerated separately.'};
        await refreshData();render();return;
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

  function openExerciseEntryModal(name){ openActivityEntryModal(name); }


  function openWorkoutEntryModal(){
    $('#directWorkoutModal')?.remove();
    const saved=JSON.parse(localStorage.getItem('zeke-activity-library')||'[]');
    const common=[...new Map([...workoutGroups().keys(),...saved.map(x=>x.name),'Stair Climber','Treadmill','Stationary Bike','Lat Pulldown','Seated Row','Chest Press','Leg Press','Leg Extension','Seated Leg Curl','Bicep Curl','Abdominal','Massage Chair','HydroMassage','Shoulder PT','Hamstring Stretch','Shoulder Mobility'].map(n=>[activityKey(n),activityDisplayName(n)])).values()].sort((a,b)=>a.localeCompare(b));
    const options=common.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
    const row=()=>`<div class="workout-entry-row adaptive-row" data-workout-row><label>Activity<select class="workout-exercise"><option value="">Choose activity</option>${options}<option value="__custom">Other / custom</option></select></label><label class="custom-exercise-wrap" hidden>Custom name<input class="workout-custom-exercise"></label><label>Type<select class="workout-profile"><option value="strength">Strength</option><option value="cardio">Cardio</option><option value="mobility">Mobility / stretch</option><option value="rehab">Rehabilitation / PT</option><option value="recovery">Recovery</option><option value="sport">Sport / recreation</option></select></label><div class="workout-profile-fields"></div><label class="workout-notes-label">Notes<input class="workout-notes"></label><button type="button" class="icon-btn remove-workout-row">×</button></div>`;
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="directWorkoutModal"><div class="direct-entry-card workout-entry-card"><div class="section-head"><div><h2>Log workout</h2><p>Add training, cardio, stretching, PT, or recovery activities. Fields adapt to each activity.</p></div><button class="icon-btn" id="closeDirectWorkout">×</button></div><form id="directWorkoutForm"><div class="workout-session-fields"><label>Workout date<input id="directWorkoutDate" type="date" value="${esc(activeDay())}" required></label><label>Session notes<input id="directWorkoutSessionNotes"></label></div><div id="workoutEntryRows">${row()}</div><button type="button" class="secondary compact" id="addWorkoutRow">+ Add activity</button><p class="form-error" id="directWorkoutError" hidden></p><div class="direct-entry-actions"><button type="button" class="secondary" id="cancelDirectWorkout">Cancel</button><button type="submit" class="primary">Save workout</button></div></form></div></div>`);
    const compactFields=p=>p==='strength'?`<label>Weight<input class="workout-weight" type="number" step="0.1"></label><label>Reps<input class="workout-reps" type="number"></label><label>Sets<input class="workout-sets" type="number"></label>`:p==='cardio'?`<label>Minutes<input class="workout-duration" type="number"></label><label>Steps / distance<input class="workout-steps" type="number"></label><label>Level<input class="workout-level"></label>`:p==='rehab'?`<label>Minutes<input class="workout-duration" type="number"></label><label>Pain before<input class="workout-pain-before" type="number" min="0" max="10"></label><label>Pain after<input class="workout-pain-after" type="number" min="0" max="10"></label>`:`<label>Minutes<input class="workout-duration" type="number"></label><label>Area<input class="workout-area"></label>`;
    const bindRow=el=>{const select=el.querySelector('.workout-exercise'),profile=el.querySelector('.workout-profile'),fields=el.querySelector('.workout-profile-fields');const sync=()=>{const name=select.value==='__custom'?el.querySelector('.workout-custom-exercise').value:select.value;const savedProfile=saved.find(x=>x.name===name)?.profile;profile.value=savedProfile||activityProfile(name,profile.value);fields.innerHTML=compactFields(profile.value);el.querySelector('.custom-exercise-wrap').hidden=select.value!=='__custom'};select.onchange=sync;profile.onchange=()=>fields.innerHTML=compactFields(profile.value);sync();el.querySelector('.remove-workout-row').onclick=()=>{$$('[data-workout-row]').length>1?el.remove():null}};
    $$('[data-workout-row]').forEach(bindRow);$('#addWorkoutRow').onclick=()=>{const h=$('#workoutEntryRows');h.insertAdjacentHTML('beforeend',row());bindRow(h.lastElementChild)};const close=()=>$('#directWorkoutModal')?.remove();$('#closeDirectWorkout').onclick=close;$('#cancelDirectWorkout').onclick=close;
    $('#directWorkoutForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,saveBtn=form.querySelector('button[type=submit]');if(form.dataset.saving==='true')return;const date=$('#directWorkoutDate').value,sessionNotes=$('#directWorkoutSessionNotes').value.trim(),num=(el,sel)=>{const v=Number(el.querySelector(sel)?.value);return Number.isFinite(v)&&v>=0?v:null};const entries=$$('[data-workout-row]').map(el=>{const sel=el.querySelector('.workout-exercise').value,exercise=activityDisplayName(sel==='__custom'?el.querySelector('.workout-custom-exercise').value.trim():sel),profile=el.querySelector('.workout-profile').value;return {exercise,profile,weight:num(el,'.workout-weight'),reps:num(el,'.workout-reps'),sets:num(el,'.workout-sets'),duration_min:num(el,'.workout-duration'),steps:num(el,'.workout-steps'),level:el.querySelector('.workout-level')?.value||null,body_area:el.querySelector('.workout-area')?.value||null,pain_before:num(el,'.workout-pain-before'),pain_after:num(el,'.workout-pain-after'),notes:el.querySelector('.workout-notes').value.trim()}}).filter(x=>x.exercise);if(!entries.length){$('#directWorkoutError').hidden=false;$('#directWorkoutError').textContent='Choose at least one activity.';return;}const candidates=entries.map(item=>({category:'workout',timestamp:`${date}T12:00:00`,structured:{exercise:item.exercise,weight:item.weight,reps:item.reps,sets:item.sets,duration_min:item.duration_min,steps:item.steps,distance_mi:item.distance_mi}}));let duplicateCount=0;for(const c of candidates){if((await ZekeData.findLikelyDuplicates(c,0.94)).length)duplicateCount++;}if(duplicateCount&&!confirm(`${duplicateCount} activit${duplicateCount===1?'y looks':'ies look'} identical to an existing entry for ${fmtDate(date+'T12:00:00',{month:'short',day:'numeric'})}. Save anyway?`))return;form.dataset.saving='true';saveBtn.disabled=true;saveBtn.textContent='Saving…';const transactionId=crypto.randomUUID();try{for(const item of entries)await ZekeData.addEvent({category:'workout',timestamp:`${date}T12:00:00`,raw_text:item.notes||sessionNotes,structured:{exercise:item.exercise,canonical_activity_id:activityKey(item.exercise).replace(/ /g,'_'),activity_profile:item.profile,workout_id:`workout-${date}-${transactionId}`,...item,notes:item.notes||sessionNotes,completed:true,interpretation_status:'confirmed'},provenance:{source:'direct-workout-entry',entry_mode:'structured-form',transaction_id:transactionId}});close();await refreshData();render();showToast(`${entries.length} activities logged for ${fmtDate(date+'T12:00:00',{month:'short',day:'numeric'})}.`);}catch(err){form.dataset.saving='false';saveBtn.disabled=false;saveBtn.textContent='Save workout';$('#directWorkoutError').hidden=false;$('#directWorkoutError').textContent=err.message;}};
  }


  function bind() {
    $('#addLifeEvent')?.addEventListener('click',()=>openLifeEventModal('symptom'));
    $('#startConceptEntry')?.addEventListener('click',()=>openLifeEventModal('symptom'));
    $('#setupVault')?.addEventListener('click',async()=>{const a=prompt('Choose a Private Vault PIN (at least 4 digits or characters).');if(!a||a.length<4)return showToast('PIN must be at least 4 characters.','error');const b=prompt('Confirm the PIN.');if(a!==b)return showToast('PINs did not match.','error');await createVault(a);showToast('Private Vault configured and unlocked.');render()});
    $('#unlockVault')?.addEventListener('click',async()=>{const pin=prompt('Enter your Private Vault PIN.');if(await unlockVault(pin||'')){showToast('Private Vault unlocked.');render()}else showToast('Incorrect PIN.','error')});
    $('#lockVault')?.addEventListener('click',()=>{sessionStorage.removeItem('zeke-vault-pin');showToast('Private Vault locked.');render()});
    $('#resetVault')?.addEventListener('click',()=>{if(confirm('Reset the vault configuration? Existing encrypted private details will become unrecoverable unless you restore the same vault metadata.')){localStorage.removeItem('zeke-private-vault');sessionStorage.removeItem('zeke-vault-pin');render()}});
    $$('[data-life-template]').forEach(el=>el.onclick=()=>openLifeEventModal(el.dataset.lifeTemplate));
    $('#runPatternLab')?.addEventListener('click',()=>{showToast('Pattern Lab analysis refreshed from current structured records.');render()});
    $('#quickLogBtn')?.addEventListener('click',()=>{state.quickLogOpen=true;render()});
    $('#closeQuickLog')?.addEventListener('click',()=>{state.quickLogOpen=false;render()});
    $('#quickLogBackdrop')?.addEventListener('click',()=>{state.quickLogOpen=false;render()});
    $$('[data-quick-log]').forEach(el=>el.onclick=()=>{const kind=el.dataset.quickLog;state.quickLogOpen=false;render();setTimeout(()=>{if(kind==='workout')openWorkoutEntryModal();else if(kind==='activity')openAddActivityModal();else if(kind==='intake')openIntakeModal();else if(kind==='blood_pressure')openMetricEntryModal('blood_pressure');else if(kind==='lab')openMetricEntryModal('a1c');else if(kind==='symptom')openLifeEventModal('symptom');else if(kind==='life-event')openLifeEventModal('life_event');else if(kind==='medication')openMedicationEntryModal();else if(kind==='cycle')openLifeEventModal('menstrual_cycle');else if(kind==='gluten')openLifeEventModal('gluten_exposure');else openMetricEntryModal(kind)},0)});
    $('#addActivityBtn')?.addEventListener('click',openAddActivityModal);
    $$('[data-toggle-review-task]').forEach(el=>el.onclick=()=>{const key=el.dataset.toggleReviewTask;state.expandedReviewTasks.has(key)?state.expandedReviewTasks.delete(key):state.expandedReviewTasks.add(key);render()});
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

    $$('[data-merge-activity]').forEach(el=>el.onclick=async()=>{
      const group=activityDuplicateGroups()[Number(el.dataset.mergeActivity)]; if(!group)return;
      const preview=`Merge ${group.aliases.join(' + ')} into ${group.canonical}?\n\n${group.records} workout record(s) will be updated. Original names will be retained as aliases. A backup will be created first.`;
      if(!confirm(preview))return; el.disabled=true; el.textContent='Merging…';
      try{const result=await ZekeData.mergeActivityEntities({canonicalName:group.canonical,aliases:group.aliases});
        try{const lib=JSON.parse(localStorage.getItem('zeke-activity-library')||'[]')||[];const matching=lib.filter(a=>group.aliases.some(n=>activityKey(n)===activityKey(a.name)));const profile=matching.find(a=>a.profile)?.profile||'strength';const cleaned=lib.filter(a=>!group.aliases.some(n=>activityKey(n)===activityKey(a.name)));cleaned.push({name:group.canonical,profile});localStorage.setItem('zeke-activity-library',JSON.stringify(cleaned));}catch(_){}
        state.integrityLastAction=`Merged ${group.aliases.join(', ')} into ${group.canonical}. ${result.changed} historical record(s) updated.`;await refreshData();render();showToast(state.integrityLastAction);
      }catch(err){showToast(`Cleanup failed: ${err.message}`);render();}
    });
    $$('[data-remove-duplicate-workouts]').forEach(el=>el.onclick=async()=>{
      const group=exactDuplicateWorkoutGroups()[Number(el.dataset.removeDuplicateWorkouts)];if(!group)return;const remove=group.items.filter(x=>x.id!==group.keep.id);
      if(!confirm(`Keep the earliest record and remove ${remove.length} exact duplicate${remove.length===1?'':'s'}?\n\nA backup will be created first.`))return;el.disabled=true;el.textContent='Cleaning…';
      try{const result=await ZekeData.removeExactDuplicateEvents(remove.map(x=>x.id));state.integrityLastAction=`Removed ${result.removed} exact duplicate workout record(s).`;await refreshData();render();showToast(state.integrityLastAction);}catch(err){showToast(`Cleanup failed: ${err.message}`);render();}
    });
    $('#undoIntegrityChange')?.addEventListener('click',async()=>{if(!confirm('Undo the most recent cleanup action from this browser session?'))return;try{const result=await ZekeData.undoLastIntegrityChange();state.integrityLastAction=`Undid cleanup: ${result.reason}`;await refreshData();render();showToast(state.integrityLastAction);}catch(err){showToast(err.message);}});

    $$('[data-route]').forEach(el=>el.onclick=()=>{document.body.classList.remove('nav-open');go(el.dataset.route)});
    $$('[data-range]').forEach(el=>el.onclick=()=>{state.range=el.dataset.range;try{localStorage.setItem('zeke-fitness-range',state.range)}catch(_){}render()});
    $('#fitnessRangeSelect')?.addEventListener('change',e=>{state.range=e.target.value;try{localStorage.setItem('zeke-fitness-range',state.range)}catch(_){}render();});
    $$('[data-select-metric]').forEach(el=>el.onclick=()=>{state.selectedMetric=el.dataset.selectMetric;render()});
    $$('.metric-card[data-metric]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('button'))return;e.preventDefault();e.stopPropagation();openMetricDetail(el.dataset.metric);}));
    $$('[data-log-metric]').forEach(el=>el.onclick=()=>openMetricEntryModal(el.dataset.logMetric));
    $('#logWorkoutBtn')?.addEventListener('click',openWorkoutEntryModal);
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
    $$('[data-quick-exercise]').forEach(el=>el.addEventListener('click',()=>openExerciseEntryModal(el.dataset.quickExercise)));
    $('#addHealthHistory')?.addEventListener('click',()=>{state.context={healthHistory:true};pushZeke('Tell me the personal or family health-history detail you want ZEKE to remember. You can say it naturally, for example: “My sister had a heart attack at 45.”');go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0)});
    $$('[data-conversation-choice]').forEach(el=>el.onclick=async()=>{el.classList.add('selected');el.disabled=true;const original=el.textContent;el.textContent='Working…';const v=el.dataset.conversationChoice;try{if(v.startsWith('question-'))return await handleQuestionChoice(v);if(v.startsWith('edit-'))return await handleEditChoice(v);return await handleChoice(v);}finally{if(document.body.contains(el)){el.disabled=false;el.textContent=original;el.classList.remove('selected');}}});
    $('#expandConversation')?.addEventListener('click',()=>{const expanded=document.body.classList.toggle('conversation-expanded');const btn=$('#expandConversation');if(btn){btn.textContent=expanded?'Collapse':'Expand';btn.setAttribute('aria-expanded',String(expanded));}});
    $('#conversationThread')?.addEventListener('scroll',e=>{const el=e.currentTarget;el.dataset.userScrolled=(el.scrollHeight-el.scrollTop-el.clientHeight>80)?'true':'false';});
    $$('[data-review-question]').forEach(el=>el.onclick=()=>{state.activeReviewId=el.dataset.reviewQuestion;state.reviewOriginalOpen=false;try{sessionStorage.setItem('zeke-active-review',state.activeReviewId)}catch(_){}render();});
    $('#backToReviewQueue')?.addEventListener('click',()=>{state.activeReviewId='';state.reviewOriginalOpen=false;try{sessionStorage.removeItem('zeke-active-review')}catch(_){}render();});
    $('#closeReviewWorkspace')?.addEventListener('click',()=>{state.activeReviewId='';try{sessionStorage.removeItem('zeke-active-review')}catch(_){}go('questions');render();});
    $('#showReviewOriginal')?.addEventListener('click',()=>{state.reviewOriginalOpen=!state.reviewOriginalOpen;render();});
    $('#adjustReviewProposal')?.addEventListener('click',()=>{$('#reviewAdjustment').hidden=false;$('#reviewAdjustmentText')?.focus();});
    $('#cancelReviewAdjustment')?.addEventListener('click',()=>{$('#reviewAdjustment').hidden=true;});
    $('#acceptReviewProposal')?.addEventListener('click',async()=>{const q=state.factors.find(f=>f.id===state.activeReviewId);if(!q)return;await ZekeData.resolveFactor(q.id,'resolved','Accepted ZEKE proposed interpretation');state.activeReviewId='';try{sessionStorage.removeItem('zeke-active-review')}catch(_){}await refreshData();render();showToast('Thanks. I recorded your confirmation and preserved the original evidence.');});
    $('#submitReviewAdjustment')?.addEventListener('click',async()=>{const q=state.factors.find(f=>f.id===state.activeReviewId),text=$('#reviewAdjustmentText')?.value.trim();if(!q||!text)return;await ZekeData.resolveFactor(q.id,'resolved',text);state.activeReviewId='';try{sessionStorage.removeItem('zeke-active-review')}catch(_){}await refreshData();render();showToast('Your correction was recorded.');});
    $('#previousReview')?.addEventListener('click',()=>{const tasks=reviewTasks(),i=tasks.findIndex(t=>t.items.some(q=>q.id===state.activeReviewId));if(i>0){state.activeReviewId=tasks[i-1].items[0].id;sessionStorage.setItem('zeke-active-review',state.activeReviewId);render();}});
    $('#nextReview')?.addEventListener('click',()=>{const tasks=reviewTasks(),i=tasks.findIndex(t=>t.items.some(q=>q.id===state.activeReviewId));if(i>=0&&i<tasks.length-1){state.activeReviewId=tasks[i+1].items[0].id;sessionStorage.setItem('zeke-active-review',state.activeReviewId);render();}});
    $$('[data-question-action]').forEach(el=>el.onclick=async()=>{const id=el.dataset.questionId;const action=el.dataset.questionAction;await ZekeData.resolveFactor(id,action==='dismiss'?'dismissed':'deferred','');await refreshData();render();});
    $$('[data-review-task-later]').forEach(el=>el.onclick=async()=>{const key=el.dataset.reviewTaskLater;const task=reviewTasks().find(t=>t.key===key);for(const q of task?.items||[])await ZekeData.resolveFactor(q.id,'deferred','');await refreshData();render();});
    $$('[data-insight-evidence]').forEach(el=>el.onclick=(ev)=>{ev.preventDefault();ev.stopPropagation();document.body.insertAdjacentHTML('beforeend',insightEvidenceHTML(el.dataset.insightEvidence));$('#closeEvidenceFocus')?.addEventListener('click',()=>$('#evidenceFocus')?.remove());});
    $('#coachFocus')?.addEventListener('change',e=>{state.coachFocus=e.target.value;state.coachAI=null;state.coachExpanded=false;render()});
    $$('[data-dismiss-coach-alert]').forEach(el=>el.onclick=()=>{state.coachAlertDismissed[el.dataset.dismissCoachAlert]=true;render()});
    $('#toggleCoachEvidence')?.addEventListener('click',()=>{state.coachExpanded=!state.coachExpanded;render()});
    $('#deeperCoachAI')?.addEventListener('click',runDeeperCoachAnalysis);
    $('#expandCoachCard')?.addEventListener('click',e=>{e.stopPropagation();state.coachCardExpanded=true;render()});
    $('#coachCard')?.addEventListener('click',e=>{if(!state.coachCardExpanded&&!e.target.closest('button,select')){state.coachCardExpanded=true;render()}});
    $('#coachCard')?.addEventListener('keydown',e=>{if(!state.coachCardExpanded&&(e.key==='Enter'||e.key===' ')){e.preventDefault();state.coachCardExpanded=true;render()}});
    $('#collapseCoachCard')?.addEventListener('click',()=>{state.coachCardExpanded=false;state.coachExpanded=false;render()});
    $('#openCoachPatternLab')?.addEventListener('click',()=>{state.route='pattern-lab';location.hash='#/pattern-lab';render()});
    $('#askZekeCoach')?.addEventListener('click',()=>{const x=coachInsightFor(state.coachFocus);pushZeke(`Let's look more closely at ${x?.name||'this exercise'}. What part of the recommendation would you like to discuss?`);state.route='dashboard';location.hash='#/dashboard';render()});
    $$('[data-activity-tab]').forEach(el=>el.onclick=()=>{state.activityTab=el.dataset.activityTab;state.expandedActivity='';localStorage.setItem('zeke-activity-tab',state.activityTab);render()});
    $$('[data-activity-name]').forEach(el=>{el.onclick=e=>{if(e.target.closest('button'))return;state.expandedActivity=state.expandedActivity===el.dataset.activityName?'':el.dataset.activityName;render()};el.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();state.expandedActivity=state.expandedActivity===el.dataset.activityName?'':el.dataset.activityName;render()}}});
    $$('[data-collapse-activity]').forEach(el=>el.onclick=e=>{e.stopPropagation();state.expandedActivity='';render()});
    $$('[data-favorite-activity]').forEach(el=>el.onclick=e=>{e.stopPropagation();const set=new Set(JSON.parse(localStorage.getItem('zeke-activity-favorites')||'[]'));const name=el.dataset.favoriteActivity;set.has(name)?set.delete(name):set.add(name);localStorage.setItem('zeke-activity-favorites',JSON.stringify([...set]));render()});
    $$('[data-activity-pattern]').forEach(el=>el.onclick=e=>{e.stopPropagation();state.route='pattern-lab';location.hash='#/pattern-lab';render()});
    $$('[data-health-tab]').forEach(el=>el.onclick=()=>{state.healthTab=el.dataset.healthTab;state.expandedHealthMetric='';localStorage.setItem('zeke-health-tab',state.healthTab);render()});
    $$('[data-health-metric]').forEach(el=>{el.onclick=e=>{if(e.target.closest('button'))return;state.expandedHealthMetric=state.expandedHealthMetric===el.dataset.healthMetric?'':el.dataset.healthMetric;render()};el.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();state.expandedHealthMetric=state.expandedHealthMetric===el.dataset.healthMetric?'':el.dataset.healthMetric;render()}}});
    $$('[data-theme]').forEach(el=>el.onclick=async()=>{state.theme=el.dataset.theme;document.documentElement.dataset.theme=state.theme;state.preferences={...state.preferences,theme:state.theme};await ZekeData.savePreferences(state.preferences);render()});
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

    $('#exportRuntimeDiagnostics')?.addEventListener('click',()=>downloadJSON({export_type:'ZEKE Runtime Diagnostics',build:BUILD,exported_at:new Date().toISOString(),entries:runtimeDiagnostics()},`zeke-runtime-diagnostics-${localDay()}.json`));
    $('#clearRuntimeDiagnostics')?.addEventListener('click',()=>{if(confirm('Clear the local runtime diagnostic log on this device?')){localStorage.removeItem(RUNTIME_LOG_KEY);render();showToast('Runtime diagnostics cleared.')}});

    $('#exportAIPacket')?.addEventListener('click',()=>{const packet={packet_type:'ZEKE Manual AI Packet',build:BUILD,created_at:new Date().toISOString(),instructions:'Return analysis as observations, interpretations, evidence, limitations, and proposed actions. Do not treat inferred claims as raw facts.',context:{recent_events:state.events.slice(-50),open_questions:openQuestions(),discoveries:state.discoveries.slice(0,10)}};downloadJSON(packet,`zeke-ai-packet-${localDay()}.json`)});
    $('#importAIResponse')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;const status=$('#aiImportStatus');try{const response=JSON.parse(await file.text());await ZekeData.saveFactor({type:'external_ai_response',status:'review',summary:response.summary||response.analysis||response.title||'Imported AI analysis awaiting review',response,provenance:{source:'manual-ai-packet',file:file.name}});if(status)status.textContent='Imported for review. ZEKE will not treat the AI response as raw fact.';await refreshData()}catch(err){if(status)status.textContent=`Import failed: ${err.message}`}});
    $('#importFile')?.addEventListener('change',e=>{state.syncPreflight=null;const f=e.target.files?.[0];if(f)handleImport(f)});
    $('#preflightWorkbookNow')?.addEventListener('click',async()=>{try{state.syncPreflight=null;state.importStatus='Running read-only workbook preflight…';render();const r=await preflightConnectedWorkbook();state.syncPreflight=r;state.importReport={file:state.syncSource?.name||'Connected workbook',counts:{records_recognized:r.candidates,records_created:r.created,records_updated:r.updated,unchanged:r.unchanged,linked_existing:r.linked_existing,conflicts:r.conflicts,unsupported_updates:r.unsupported_updates,unmapped_rows:r.unmapped_rows},message:r.ready?'Read-only preflight complete. Review the counts, then use Commit reviewed sync. No repository, workbook, mirror, backup, or import-history file was changed.':'Preflight found blocking conflicts or unsupported updates. Commit remains disabled and nothing was changed.'};state.importStatus=`Preflight complete: ${r.candidates} recognized, ${r.unchanged} unchanged, ${r.created} new, ${r.updated} updates, ${r.conflicts} conflicts.`;render()}catch(e){state.syncPreflight=null;state.importStatus=`Preflight failed safely: ${e.message}`;render()}});
    $('#syncWorkbookNow')?.addEventListener('click',async()=>{try{const reviewed=state.syncPreflight;if(!reviewed?.ready)throw new Error('Run and review the read-only preflight first.');if(!confirm(`Commit the reviewed workbook sync? ${reviewed.candidates} recognized; ${reviewed.created} new; ${reviewed.updated} updates; ${reviewed.linked_existing} links; ${reviewed.unchanged} unchanged. ZEKE will rerun the preflight, back up events before changes, commit, and verify.`))return;state.importStatus='Rechecking the reviewed preflight before commit…';render();const r=await syncConnectedWorkbook({reviewToken:reviewed.review_token});state.importStatus=`Sync verified: ${r.created} created, ${r.updated} updated, ${r.unchanged} unchanged.`;await refreshData();render()}catch(e){state.importStatus=`Sync failed safely: ${e.message}`;render()}});
    $('#attachBtn')?.addEventListener('click',()=>$('#conversationFile')?.click());
    $('#conversationFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f){pushZeke(`I received ${f.name}. File interpretation through the conversation is not complete in this repair build yet; use Settings → Import existing history for XLSX, JSON, CSV, or TSV data.`);render()}});
    bindTooltips();
  }

  function showToast(message,type='ok'){const t=$('#toast');if(!t)return;t.textContent=message;t.className=`toast show ${type}`;clearTimeout(window.__zekeToastTimer);window.__zekeToastTimer=setTimeout(()=>t.classList.remove('show'),7000)}
  function downloadJSON(value,name){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

  window.ZekeWorkbookTools={workbookRows,buildWorkbookCandidates,sourceIdentityEntity,eventSubkey};

  if(window.__ZEKE_TEST_MODE__)window.ZekeAppTestTools={actionDoneToday,medicationEventCompletesAction,workbookCommitSummary};

  async function init() {
    window.addEventListener('hashchange',()=>{state.route=routeFromHash();render()});
    window.addEventListener('zeke:data-changed',debounce(async()=>{if(!state.syncBusy)state.syncPreflight=null;await refreshData();if(isEditableElement()){state.deferredRender=true;return;}render()},100));
    window.addEventListener('zeke:storage-state',()=>{if(isEditableElement()){state.deferredRender=true;return;}render();});
    await ZekeAIRouter.hydrateMetadata();
    render();
    await ZekeData.bootstrap();
    if(ZekeData.snapshot().status==='connected'){ await refreshData(); state.syncSource=await ZekeData.getSyncSource(); if(state.syncSource){state.importStatus='Connected workbook ready. Automatic sync is paused; use Settings → Run read-only preflight, review the counts, then commit the reviewed sync.';} }
    render();
  }

  document.addEventListener('DOMContentLoaded',init);
})();
