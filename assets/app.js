(() => {
  'use strict';

  const BUILD = window.ZEKE_BUILD || window.ZEKE_VERSION || { version: '0.45.1', build: '2026.08.23.4', label: 'Integrated Fitness + Adaptive Training' };
  const state = {
    route:'dashboard', range:localStorage.getItem('zeke-fitness-range')||'month', dashboardHealthRange:localStorage.getItem('zeke-dashboard-health-range')||'month', dashboardTrendRange:localStorage.getItem('zeke-dashboard-trend-range')||'quarter', selectedMetric:'weight',
    events:[], factors:[], discoveries:[], actions:{catalog:[],daily_states:{}}, calendar:[], calendarReview:[], calendarReviewLoaded:false,
    conversation:[], pending:null, context:{}, dialogue:{activeQuestion:null,topic:null}, storage:null, ai:null,
    coachExpanded:false, coachCardExpanded:false, coachFocus:'', coachAlertDismissed:{}, activityTab:'favorites', activitySearch:'', expandedActivity:'', expandedDashboardTrends:new Set(), expandedPrivateSummaries:new Set(), healthTab:localStorage.getItem('zeke.health.libraryTab.v1')||localStorage.getItem('zeke-health-tab')||'frequent', expandedHealthMetric:'', customizeOpen:false, metricMenuOpen:false, quickLogOpen:false, expandedReviewTasks:new Set(),
    hiddenWidgets:new Set(), busy:false, importStatus:'', importReport:null, importBatches:[],
    conversationLoaded:false, preferences:{}, syncSource:null, syncBusy:false, syncReport:null, syncPreflight:null, coachAI:null, coachAILoading:false, theme:'light', draft:'', auditQuery:'', auditCategory:'all', insightRefreshAt:null, deferredRender:false, activeDate:localStorage.getItem('zeke-active-date')||'', directExercise:null, integrityLastAction:'', activeReviewId:sessionStorage.getItem('zeke-active-review')||'', reviewOriginalOpen:false, insightsView:sessionStorage.getItem('zeke-insights-view')||'overview', memoryTab:sessionStorage.getItem('zeke-memory-tab')||'waiting', lastSave:null, workflowId:null, suspendedWorkflowId:null, fitnessReviewIncomplete:false, supportExportStatus:'', supportExportOptions:{mode:'full',from:'',to:'',clearAfter:false}
  };

  const RUNTIME_LOG_KEY='zeke-runtime-diagnostics-v1';
  function runtimeDiagnostics(){try{return JSON.parse(localStorage.getItem(RUNTIME_LOG_KEY)||'[]')}catch(_){return []}}
  function recordRuntimeIssue(kind,message,detail=''){
    try{const row={timestamp:new Date().toISOString(),version:BUILD.version,build:BUILD.build,kind:String(kind||'runtime'),message:String(message||'Unknown error').slice(0,500),detail:String(detail||'').slice(0,1200),route:state.route};const rows=runtimeDiagnostics();rows.push(row);localStorage.setItem(RUNTIME_LOG_KEY,JSON.stringify(rows.slice(-200)));window.ZekeWorkflowEngine?.technical(row)}catch(_){}
  }
  window.addEventListener('error',e=>recordRuntimeIssue('window-error',e.message,e.filename?`${e.filename}:${e.lineno||''}:${e.colno||''}`:''));
  window.addEventListener('unhandledrejection',e=>recordRuntimeIssue('unhandled-rejection',e.reason?.message||e.reason,String(e.reason?.stack||'')));

  const WORKFLOW_STATUS_COPY = {
    understanding:['Understanding','ZEKE is preserving and interpreting your message.'],
    ai_checking:['AI checking','ZEKE is consulting a connected AI before deciding what to ask or propose.'],
    waiting_clarification:['Question for you','Your answer will determine what ZEKE can safely do next.'],
    waiting_confirmation:['Ready for confirmation','Nothing has been saved yet.'],
    waiting_correction:['Waiting for correction','The original wording is preserved and no replacement has been saved.'],
    completed:['Completed','The interaction has reached a clear outcome.'],
    not_saved:['Not saved','No structured record was changed.'],
    duplicate:['Already recorded','ZEKE kept the existing record instead of creating a duplicate.'],
    dismissed:['Dismissed','The original information remains preserved; no structured change was made.'],
    superseded:['Paused','A newer, unrelated message replaced this unfinished interaction.'],
    failed:['Could not complete','ZEKE preserved what it could and did not claim a save.']
  };
  function workflowGoal(text=''){
    const t=String(text||'').toLowerCase();
    if(/medication|mounjaro|tirzepatide|atorvastatin|lipitor|dose|weekly|daily/.test(t))return 'Understand and update medication information';
    if(/workout|exercise|reps|sets|stair|row|curl|press/.test(t))return 'Understand and record fitness information';
    if(/sleep|bed|woke/.test(t))return 'Understand and record sleep information';
    if(/weight|blood pressure|a1c|glucose|lab|measurement/.test(t))return 'Understand and record a health measurement';
    if(/why|how|what|should|can|could|\?$/.test(t))return 'Answer the user’s question';
    return 'Understand the user’s goal and reach a clear outcome';
  }
  function persistWorkflowRecord(workflow){
    if(!workflow||window.ZekeData?.snapshot?.().status!=='connected')return;
    const terminal=window.ZekeWorkflowEngine?.constants?.TERMINAL?.includes(workflow.status);
    ZekeData.saveFactor({id:workflow.id,type:'workflow_state',status:terminal?'resolved':'open',summary:'ZEKE conversation workflow',workflow,updated_at:workflow.updated_at||new Date().toISOString(),provenance:{source:'workflow-engine',storage:'user-repository'}}).catch(error=>recordRuntimeIssue('workflow-persistence',error.message,error.stack||''));
  }
  function beginWorkflow(text='',extra={}){
    const engine=window.ZekeWorkflowEngine;if(!engine)return null;
    const existing=state.workflowId&&engine.get(state.workflowId);
    if(existing&&!engine.constants.TERMINAL.includes(existing.status))return existing;
    const workflow=engine.create({goal:extra.goal||workflowGoal(text),source_text:text,target:extra.target||state.context||null,known:extra.known||{},needed:extra.needed||[],status:'understanding'});
    state.workflowId=workflow.id;persistWorkflowRecord(workflow);return workflow;
  }
  function updateWorkflow(status,patch={},note=''){
    if(!state.workflowId||!window.ZekeWorkflowEngine)return null;
    const result=ZekeWorkflowEngine.update(state.workflowId,{status,...patch},note);persistWorkflowRecord(result);return result;
  }
  function closeWorkflow(status='completed',outcome='',patch={}){
    if(!state.workflowId||!window.ZekeWorkflowEngine)return null;
    const workflowId=state.workflowId,result=ZekeWorkflowEngine.close(workflowId,status,outcome,patch);persistWorkflowRecord(result);state.workflowId=state.suspendedWorkflowId||null;state.suspendedWorkflowId=null;return result;
  }
  function logUnresolved(reason,payload={}){
    const engine=window.ZekeWorkflowEngine,workflow=state.workflowId&&engine?.get(state.workflowId);
    const row=engine?.unresolved({workflow_id:state.workflowId,transaction_id:workflow?.transaction_id||null,route:state.route,reason:String(reason||'Unresolved interaction'),original_message:workflow?.source_text||payload.original_message||'',zeke_understanding:workflow?.proposed||workflow?.known||null,intended_destination:workflow?.target||null,ai_usage:workflow?.ai_status||'not_needed',clarification_attempts:(workflow?.history||[]).filter(h=>/clarif|correct|waiting/i.test(`${h.status} ${h.note}`)).length,pending_type:state.pending?.type||null,buttons_displayed:payload.buttons_displayed||workflow?.available_actions||[],save_status:payload.save_status||workflow?.save_status||'not_saved',retry_count:Math.max(0,(workflow?.history||[]).length-1),resolution:workflow?.outcome||'',...payload});
    if(row&&window.ZekeData?.snapshot?.().status==='connected')ZekeData.saveFactor({id:row.id,type:'workflow_log',status:'resolved',summary:'Unresolved interaction diagnostic',log_kind:'unresolved_interaction',log:row,provenance:{source:'workflow-engine',storage:'user-repository'}}).catch(()=>{});
  }
  function workflowStatusHTML(){
    const engine=window.ZekeWorkflowEngine;if(!engine)return '';
    const current=(state.workflowId&&engine.get(state.workflowId))||engine.current()||engine.list().at(-1);if(!current)return '';
    const copy=WORKFLOW_STATUS_COPY[current.status]||[String(current.status||'In progress').replaceAll('_',' '),current.outcome||''];
    const outcome=current.outcome?`<span>${esc(current.outcome)}</span>`:`<span>${esc(copy[1])}</span>`;
    const resumable=!engine.constants.TERMINAL.includes(current.status);
    return `<div class="workflow-status ${esc(current.status||'understanding')}" role="status"><i></i><div><strong>${esc(copy[0])}</strong>${outcome}</div>${current.save_status?`<small>${esc(String(current.save_status).replaceAll('_',' '))}</small>`:''}${resumable?'<button class="text-action compact" data-resume-workflow>Resume</button>':''}</div>`;
  }
  function restoreInteractionFromWorkflow(workflow){
    const engine=window.ZekeWorkflowEngine;if(!workflow||state.pending||!engine||engine.constants.TERMINAL.includes(workflow.status))return;
    const target=workflow.target||{},needed=workflow.needed||[];
    if(target.type==='health_history')state.context={...state.context,healthHistory:true};
    if(target.question_id){
      const q=state.factors.find(f=>f.id===target.question_id&&!['resolved','dismissed','unknown'].includes(f.status));
      if(q){state.pending={type:workflow.status==='waiting_correction'?'question-awaiting':'question',question:q,other:workflow.status==='waiting_correction',workflowId:workflow.id};return;}
    }
    if(target.factor_id){
      const factor=state.factors.find(f=>f.id===target.factor_id);
      if(factor&&workflow.status==='waiting_confirmation'&&workflow.proposed?.summary){state.pending={type:'memory-correction-confirm',factor,replacement:workflow.proposed.summary,workflowId:workflow.id};return;}
      if(factor){state.pending={type:'memory-correction',factor,workflowId:workflow.id};return;}
    }
    if(target.type==='health_history'&&workflow.status==='waiting_confirmation'&&workflow.proposed){state.pending={type:'history-confirm',rawId:workflow.raw_event_id||null,rawText:workflow.source_text||'',history:workflow.proposed,workflowId:workflow.id};return;}
    if(workflow.status==='waiting_confirmation'&&Array.isArray(workflow.proposed)&&workflow.proposed.length){state.pending={type:'confirm',rawId:workflow.raw_event_id||null,rawText:workflow.source_text||'',parsed:{summary:workflow.goal||'the proposed record',events:workflow.proposed},workflowId:workflow.id};return;}
    if(workflow.status==='waiting_correction'&&workflow.raw_event_id){state.pending={type:'correction-awaiting',rawId:workflow.raw_event_id,rawText:workflow.source_text||'',parsed:{summary:workflow.goal||'the earlier interpretation',events:Array.isArray(workflow.proposed)?workflow.proposed:[]},workflowId:workflow.id};return;}
    if(workflow.status==='waiting_clarification'&&workflow.raw_event_id){state.pending={type:'needs-detail',rawId:workflow.raw_event_id,rawText:workflow.source_text||'',workflowId:workflow.id,restoredNeeded:needed};}
  }
  function resumeCurrentWorkflow(){
    const engine=window.ZekeWorkflowEngine,current=(state.workflowId&&engine?.get(state.workflowId))||engine?.current();if(!current)return;
    state.workflowId=current.id;restoreInteractionFromWorkflow(current);
    const p=state.pending,target=current.target||{},needed=(current.needed||[]).filter(Boolean);
    if(p?.type==='question'){pushZeke(`${p.question.question||'This question is still waiting for you.'}${p.question.why_it_matters?` Why I’m asking: ${p.question.why_it_matters}`:''}`,{choices:pendingQuestionChoices(p.question)});}
    else if(p?.type==='question-awaiting'){pushZeke(`Continue with your answer to: ${p.question.question||'the open question'}. Nothing changes until ZEKE can apply your answer safely.`);}
    else if(p?.type==='confirm'){pushZeke(`I still have this proposed record ready for your decision: ${p.parsed.summary}.`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'},{label:'Later',value:'confirm-later'},{label:'Ignore',value:'confirm-ignore'}]});}
    else if(p?.type==='memory-correction-confirm'){pushZeke(`The remembered-context correction is still ready: “${p.replacement}”. Save it?`,{choices:[{label:'Save corrected memory',value:'memory-confirm'},{label:'Cancel without changing it',value:'memory-cancel'}]});}
    else if(p?.type==='memory-correction'){pushZeke(`Tell me how to correct this remembered context: “${p.factor.summary||p.factor.answer||p.factor.value||p.factor.type}”. Nothing changes until you confirm.`);}
    else if(p?.type==='history-confirm'){pushZeke(`I still understand this as ${p.history.relation} health history: ${p.history.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'history-save'},{label:'Not quite',value:'history-correct'},{label:'Later',value:'confirm-later'},{label:'Ignore',value:'confirm-ignore'}]});}
    else if(target.medication){openMedicationScheduleModal(target.medication);return;}
    else if(target.action_id){const action=(state.actions.catalog||[]).find(a=>a.id===target.action_id);if(action){if(action.kind==='medication')openMedicationScheduleModal(action.label||action.name||'');else openRecurringActionScheduleModal(action);return;}}
    else pushZeke(`Let’s continue: ${current.goal}.${needed.length?` I still need ${needed.join(', ')}.`:''} Nothing new has been saved yet.`);
    go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0);
  }

  const RANGE_DAYS = { week:7, month:31, quarter:92, '6months':183, year:366, all:null };
  const METRICS = {
    weight:{label:'Weight',unit:'lb', icon:'⚖️'}, blood_pressure:{label:'Blood pressure',unit:'mmHg', icon:'❤'},
    a1c:{label:'A1c',unit:'%', icon:'◈'}, resting_hr:{label:'Resting HR',unit:'bpm', icon:'♥'},
    sleep_duration:{label:'Sleep',unit:'hr', icon:'☾'}, steps:{label:'Steps',unit:'steps', icon:'◌'},
    ldl:{label:'LDL cholesterol',unit:'mg/dL', icon:'⬡'}, hdl:{label:'HDL cholesterol',unit:'mg/dL',icon:'⬢'},
    triglycerides:{label:'Triglycerides',unit:'mg/dL',icon:'◆'}, total_cholesterol:{label:'Total cholesterol',unit:'mg/dL',icon:'◇'},
    apob:{label:'ApoB',unit:'mg/dL',icon:'⬡'}, lpa:{label:'Lp(a)',unit:'mg/dL',icon:'◉'},
    glucose:{label:'Glucose',unit:'mg/dL',icon:'◫'}, average_glucose:{label:'Avg. glucose',unit:'mg/dL',icon:'▥'},
    body_fat_pct:{label:'Body fat',unit:'%',icon:'◐'}, waist_circumference:{label:'Waist',unit:'in',icon:'↔'}, chest_circumference:{label:'Chest',unit:'in',icon:'↔'}, hip_circumference:{label:'Hips',unit:'in',icon:'↔'}, neck_circumference:{label:'Neck',unit:'in',icon:'↔'}, arm_circumference_left:{label:'Left upper arm',unit:'in',icon:'↔'}, arm_circumference_right:{label:'Right upper arm',unit:'in',icon:'↔'}, thigh_circumference_left:{label:'Left thigh',unit:'in',icon:'↔'}, thigh_circumference_right:{label:'Right thigh',unit:'in',icon:'↔'}, calf_circumference_left:{label:'Left calf',unit:'in',icon:'↔'}, calf_circumference_right:{label:'Right calf',unit:'in',icon:'↔'}, fat_mass:{label:'Fat mass',unit:'lb',icon:'◐'}, lean_mass:{label:'Lean mass',unit:'lb',icon:'◑'}, visceral_fat_mass:{label:'Visceral fat (VAT)',unit:'lb',icon:'◎'}, appendicular_lean_mass_index:{label:'ALM index',unit:'kg/m²',icon:'◇'}, bone_mineral_content:{label:'Bone mineral content',unit:'g',icon:'⬡'}, bone_mineral_density:{label:'Bone mineral density',unit:'g/cm²',icon:'⬡'}, bone_t_score:{label:'Bone T-score',unit:'SD',icon:'⬡'}, bone_z_score:{label:'Bone Z-score',unit:'SD',icon:'⬡'}, right_arm_lean_mass:{label:'Right arm lean mass',unit:'lb',icon:'◑'}, left_arm_lean_mass:{label:'Left arm lean mass',unit:'lb',icon:'◑'}, right_leg_lean_mass:{label:'Right leg lean mass',unit:'lb',icon:'◑'}, left_leg_lean_mass:{label:'Left leg lean mass',unit:'lb',icon:'◑'},
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
    { id:'acsm-resistance-2026', title:'ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults', year:2026, pmid:'41843416', url:'https://pubmed.ncbi.nlm.nih.gov/41843416/', full_text:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/', topics:['strength','resistance','progression','individualization'], summary:'An overview of systematic reviews supporting progressive resistance training while emphasizing that program variables should be individualized to the person, goal, and response.' },
    { id:'acsm-progression-2009', title:'ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults', year:2009, pmid:'19204579', url:'https://pubmed.ncbi.nlm.nih.gov/19204579/', topics:['strength','resistance','progression','load'], summary:'A position stand describing progressive overload and a commonly cited 2–10% load increase when the current workload can be completed beyond the intended repetition target.' },
    { id:'sleep-performance-2022', title:'Effects of Acute Sleep Loss on Physical Performance: A Systematic and Meta-Analytical Review', year:2022, pmid:'35708888', url:'https://pubmed.ncbi.nlm.nih.gov/35708888/', full_text:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9584849/', topics:['sleep','recovery','performance'], summary:'A systematic review and meta-analysis finding that acute sleep loss was associated with worse physical performance overall, with meaningful variation across tasks and study conditions.' }
  ];

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escAttr = (v) => esc(v ?? '');
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
  const pushZeke = (text, meta={}) => {
    push('zeke', text, meta);
    const normalized=String(text||'').trim();
    if(meta.expectsAnswer || /\?\s*$/.test(normalized)) state.dialogue.activeQuestion={id:crypto.randomUUID(),text:normalized,at:new Date().toISOString(),topic:meta.topic||state.dialogue.topic||null};
    else if(meta.resolveQuestion) state.dialogue.activeQuestion=null;
  };
  const pushUser = (text, meta={}) => push('user', text, meta);

  function clearPending(reason='superseded'){
    if(!state.pending)return;
    recordRuntimeIssue('pending-flow-closed',`Pending ${state.pending.type||'unknown'} closed`,reason);
    logUnresolved('An unfinished interaction was superseded by a new message.',{resolution:reason,original_input:state.pending.rawText||state.pending.question?.question||'',buttons_displayed:state.conversation.at(-1)?.choices?.map(x=>x.label)||[]});
    closeWorkflow('superseded','Paused because a newer, unrelated message arrived.',{save_status:'not_saved'});
    state.pending=null;
  }
  function looksLikeIndependentNewEntry(text){
    const t=String(text||'').toLowerCase();
    return /\b(slept|sleep|woke|bed(?:time)?|weight|body fat|blood pressure|bp|a1c|glucose|took|medication|workout|exercise|pain|symptom)\b/.test(t) && /\b(last night|today|yesterday|this morning|\d{1,2}(?::\d{2})?\s*(?:am|pm)|\d+(?:\.\d+)?)\b/.test(t);
  }
  function affirmativeReply(text){return /^(?:yes|yeah|yep|sure|okay|ok|please do|go ahead|correct|right)[.! ]*$/i.test(String(text||'').trim())}
  function messageDay(at){const d=new Date(at||Date.now());return Number.isNaN(d.getTime())?'':d.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric',year:'numeric'})}
  function messageTime(at){const d=new Date(at||Date.now());return Number.isNaN(d.getTime())?'':d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}
  function conversationMessagesHTML(msgs){
    let lastDay='';
    return msgs.map(m=>{const day=messageDay(m.at);const divider=day&&day!==lastDay?`<div class=\"conversation-date-divider\"><span>${esc(day)}</span></div>`:'';lastDay=day||lastDay;return `${divider}<div class=\"bubble-row ${m.role}\"><div class=\"avatar\">${m.role==='zeke'?'Z':'You'}</div><div class=\"bubble\"><span class=\"bubble-name\">${m.role==='zeke'?'ZEKE':'You'}</span><p>${esc(m.text)}</p><time class=\"bubble-time\" datetime=\"${esc(m.at||'')}\">${esc(messageTime(m.at))}</time></div></div>`}).join('');
  }

  function routeFromHash() {
    const h = location.hash.replace(/^#\/?/,'').split('?')[0];
    if(h==='labs'||h==='health/labs'){state.healthTab='labs';localStorage.setItem('zeke.health.libraryTab.v1','labs');}
    if(h==='pattern-lab'){state.insightsView='pattern-lab';sessionStorage.setItem('zeke-insights-view','pattern-lab');}
    const map = {
      '':'dashboard','health/dashboard':'dashboard','dashboard':'dashboard',
      'health':'health','health/overview':'health','fitness':'fitness','health/workouts':'fitness',
      'medications':'medications','health/medications':'medications','labs':'health','health/labs':'health',
      'calendar':'calendar','questions':'questions','clarifications':'questions','life-events':'life-events','symptoms':'life-events','pattern-lab':'insights','insights':'insights','settings':'settings','data-integrity':'data-integrity','system/data-integrity':'data-integrity'
    };
    return map[h] || 'dashboard';
  }

  function go(route) {
    if(route==='pattern-lab'){state.insightsView='pattern-lab';sessionStorage.setItem('zeke-insights-view','pattern-lab');route='insights';}
    if(route==='labs'){state.healthTab='labs';localStorage.setItem('zeke.health.libraryTab.v1','labs');route='health';}
    const hashes = {dashboard:'health/dashboard',health:'health',fitness:'fitness',medications:'medications',calendar:'calendar',questions:'questions','life-events':'life-events',insights:'insights',settings:'settings','data-integrity':'data-integrity'};
    location.hash = `#/${hashes[route] || route}`;
  }

  function actionDateMatches(action,date){return actionScheduleMatches(action,date)}
  async function ensureAssumedMedicationDoses(){
    const actions=(state.actions.catalog||[]).filter(a=>a.active!==false&&a.kind==='medication'&&a.adherence_mode==='assume_scheduled'&&a.schedule);
    if(!actions.length)return 0;let added=0;
    for(const action of actions){
      const canonical=ZekeParser.canonicalMedicationId(action.label||action.name||''),related=state.events.filter(e=>recordIsActive(e)&&semanticCategory(e)==='medication'&&ZekeParser.canonicalMedicationId(e.structured?.canonical_medication_id||e.structured?.medication_name||e.structured?.name||'')===canonical),existingDays=new Set(related.map(e=>String(e.timestamp||e.recorded_at||'').slice(0,10)).filter(Boolean));
      const knownStarts=[action.history_start_date,action.start_date,action.assumption_effective_date].filter(Boolean).sort(),start=knownStarts[0]||activeDay(),cursor=new Date(`${start}T12:00:00`),today=new Date(`${activeDay()}T12:00:00`);
      for(let guard=0;cursor<=today&&guard<4000;guard++,cursor.setDate(cursor.getDate()+1)){
        if(!actionDateMatches(action,cursor))continue;const day=localDateISO(cursor);if(existingDays.has(day))continue;
        const created=await ZekeData.addEvent({category:'medication',timestamp:`${day}T12:00:00`,raw_text:'',structured:{medication_name:action.label||action.name,original_medication_name:action.label||action.name,canonical_medication_id:canonical,dose:action.dose??null,unit:action.unit||'',status:'taken',expected_date:day,action_id:action.id,interpretation_status:'assumed',confirmation_status:'assumed',adherence_evidence:'assumed_from_schedule',include_in_analysis:true},provenance:{source:'scheduled-adherence-assumption',assumption_rule:'user_opted_in_retroactive_schedule',action_id:action.id,schedule_start_date:start}});state.events.push(created);existingDays.add(day);added++;
      }
    }
    return added;
  }

  async function refreshData() {
    if (window.ZekeData?.snapshot().status !== 'connected') return;
    const [events,factors,discoveries,actions,conversation,importBatches,preferences] = await Promise.all([
      ZekeData.listEvents(), ZekeData.listFactors(), ZekeData.listDiscoveries(), ZekeData.getActions(),
      ZekeData.listConversation(), ZekeData.listImportBatches(), ZekeData.getPreferences()
    ]);
    state.events=events; state.factors=factors; state.discoveries=discoveries; state.actions=actions;
    const repositoryWorkflows=factors.filter(f=>f.type==='workflow_state'&&f.workflow).map(f=>f.workflow);window.ZekeWorkflowEngine?.hydrate(repositoryWorkflows);const restoredWorkflow=window.ZekeWorkflowEngine?.current();if(restoredWorkflow&&!state.workflowId)state.workflowId=restoredWorkflow.id;restoreInteractionFromWorkflow(restoredWorkflow);
    state.importBatches=importBatches; state.preferences=preferences||{}; state.importReport=state.importReport || importBatches?.at(-1) || null;
    try{
      const legacy=legacyLocalProfile();
      if(!state.preferences.user_profile&&Object.keys(legacy).length){state.preferences={...state.preferences,user_profile:legacy,profile_storage_version:1};await ZekeData.savePreferences(state.preferences);localStorage.removeItem('zeke-user-profile');}
    }catch(_){}
    if (!state.conversationLoaded || !state.conversation.length) { state.conversation=conversation||[]; state.conversationLoaded=true; }
    if(restoredWorkflow&&!window.ZekeWorkflowEngine.constants.TERMINAL.includes(restoredWorkflow.status)){
      const resumeKey=`zeke-workflow-resume-${restoredWorkflow.id}`;
      try{
        if(!sessionStorage.getItem(resumeKey)){
          state.conversation.push({id:`resume-${restoredWorkflow.id}`,role:'zeke',text:`Your earlier workflow is still open: ${restoredWorkflow.goal}. Nothing new has been saved unless the status below says otherwise. Continue here, or open Questions for You to review unfinished decisions.`,at:new Date().toISOString(),ephemeral:true});
          sessionStorage.setItem(resumeKey,'1');
        }
      }catch(_){}
    }
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
    await ensureAssumedMedicationDoses();
    await ensureUsefulQuestions();
  }

  async function ensureUsefulQuestions() {
    const terminal=new Set(['resolved','dismissed','unknown']);
    const canonical=v=>ZekeParser.canonicalMedicationId(v||'');
    const scheduledActions=(state.actions.catalog||[]).filter(a=>a.kind==='medication'&&a.schedule);
    const scheduledIds=new Set(scheduledActions.map(a=>canonical(a.label||a.name||a.id)).filter(Boolean));
    let changed=false;
    const seenOpenKeys=new Set();
    for(const factor of state.factors){
      if(factor.type!=='clarification_question'||terminal.has(String(factor.status||'').toLowerCase()))continue;
      const qk=String(factor.question_key||'');
      if(qk.startsWith('med_schedule:')){
        const med=canonical(qk.slice('med_schedule:'.length));
        if(med&&scheduledIds.has(med)){
          await ZekeData.resolveFactor(factor.id,'resolved',{resolution:'Already answered by confirmed medication schedule',resolved_by:'question-reconciliation'});changed=true;continue;
        }
      }
      if(seenOpenKeys.has(qk)&&qk){
        await ZekeData.resolveFactor(factor.id,'resolved',{resolution:'Duplicate question consolidated',resolved_by:'question-reconciliation'});changed=true;continue;
      }
      if(qk)seenOpenKeys.add(qk);
    }
    if(changed)state.factors=await ZekeData.listFactors();
    let open=state.factors.filter(f=>f.type==='clarification_question'&&!terminal.has(String(f.status||'').toLowerCase()));
    const meds=new Map();
    for(const e of state.events){
      if(e.category!=='medication'||!recordIsActive(e))continue;
      const st=e.structured||{},name=(st.medication_name||st.medication||st.name||'').trim();
      const key=st.canonical_medication_id||canonical(name);if(name&&key)meds.set(key,name);
    }
    for(const [key,name] of meds){
      const already=state.factors.some(f=>f.type==='clarification_question'&&f.question_key===`med_schedule:${key}`&&!terminal.has(String(f.status||'').toLowerCase()));
      if(!scheduledIds.has(key)&&!already&&open.length<4){
        await ZekeData.saveFactor({type:'clarification_question',status:'open',priority:'high',question_key:`med_schedule:${key}`,question:`I know ${name} is part of your history, but I don't want to guess its schedule. How often is it supposed to be taken?`,why_it_matters:`This helps ZEKE decide when, if ever, it belongs in Today's Actions.`},{idempotencyKey:`med_schedule:${key}`});
        open=openQuestions();
      }
    }
    const trackingKnown=state.factors.some(f=>f.question_key==='tracking_preferences'&&terminal.has(String(f.status||'').toLowerCase()));
    const trackingOpen=state.factors.some(f=>f.question_key==='tracking_preferences'&&!terminal.has(String(f.status||'').toLowerCase()));
    if(!trackingKnown&&!trackingOpen&&open.length<4){
      await ZekeData.saveFactor({type:'clarification_question',status:'open',priority:'low',question_key:'tracking_preferences',question:'Would it be helpful if I tracked any recurring things for you—prescribed medications, supplements, injections, protein shakes, creatine, or something else?',why_it_matters:'This lets ZEKE tailor Today’s Actions and tracking without assuming you want full nutrition or medication tracking.'},{idempotencyKey:'tracking_preferences'});
    }
    state.factors=await ZekeData.listFactors();
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
      if (!schedule) return {applied:false,open_editor:true,medication,message:`I understood that you are describing a schedule for ${medication.replace(/\b\w/g,c=>c.toUpperCase())}, but I still need the frequency or day in a form I can apply safely. I opened the medication schedule editor with the medication already selected.`};
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
      const scheduleLabel=schedule.type==='daily'?'daily':`weekly${schedule.days?.length?` on ${schedule.days.map(d=>['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'][d]).join(', ')}`:''}`;
      return {applied:true,message:`Saved. ${entry.label} is expected ${scheduleLabel} and will appear in Today’s Actions when it is due. ZEKE will still require confirmation before marking a dose complete.`};
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
    if(/potential_health_event|unresolved_observation|contextual_observation/.test(raw)) return 'potential_health_event';
    if(/workout|exercise|fitness|strength|resistance|cardio|training/.test(raw)) return 'workout';
    if(/lab|laboratory|bloodwork|blood test|panel|lipid/.test(raw)) return 'lab';
    if(/medication|medicine|drug|supplement|dose|injection/.test(raw)) return 'medication';
    if(/sleep/.test(raw) || canonicalMetric(metricId(e))==='sleep_duration') return 'sleep';
    if(/measurement|vital|weight|blood pressure|steps|heart rate/.test(raw)) return 'measurement';
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
      if(v==null||v==='') continue;
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

  function repairFingerprint(e){
    const st=e?.structured||{}, cat=semanticCategory(e), day=String(e?.timestamp||e?.recorded_at||'').slice(0,10);
    if(['measurement','lab','sleep'].includes(cat)) return [cat,canonicalMetric(metricId(e)),day,metricValue(e),String(st.unit||st.value_unit||'').toLowerCase(),String(e?.provenance?.source||'')].join('|');
    if(cat==='medication') return [cat,day,String(st.medication_name||st.name||'').toLowerCase(),st.dose??'',String(st.unit||'').toLowerCase(),String(st.status||'').toLowerCase(),String(e?.provenance?.source||'')].join('|');
    if(cat==='workout') { const w=workoutStructured(e); return [cat,day,activityKey(w.exercise),w.weight??'',w.reps??'',w.sets??'',w.duration_min??'',w.steps??'',w.distance_mi??''].join('|'); }
    return '';
  }
  function repairCandidates(){
    const dismissed=new Set(state.preferences?.integrity_dismissed||[]);
    const found=window.ZekeIntegrityEngine?.scan?.({events:state.events,factors:state.factors,actions:state.actions,discoveries:state.discoveries})||[];
    return found.filter(item=>!dismissed.has(item.key));
  }

  function recordIsActive(e){
    const st=e?.structured||{};
    const status=String(st.interpretation_status||st.data_quality_status||e?.status||'').toLowerCase();
    return st.include_in_analysis!==false && !['invalid','quarantined','undone','deleted','superseded'].includes(status) && !isSuppressedIntegrityArtifact(e);
  }

  function eventDisplayKey(e){
    const st=e?.structured||{}, category=semanticCategory(e), day=String(e?.timestamp||e?.recorded_at||'').slice(0,10);
    if(category==='measurement'||category==='lab') return [category,canonicalMetric(metricId(e)),day,metricValue(e),String(st.unit||st.value_unit||'').toLowerCase()].join('|');
    if(category==='medication') return [category,day,String(st.medication_name||st.name||'').toLowerCase(),st.dose,st.unit,st.status].join('|');
    if(category==='potential_health_event') return [category,day,String(e.raw_text||st.summary||'').trim().toLowerCase()].join('|');
    return e.id||[category,day,String(e.raw_text||'')].join('|');
  }

  function dedupeDisplayEvents(events){
    const seen=new Set();
    return events.filter(e=>{const key=eventDisplayKey(e);if(seen.has(key))return false;seen.add(key);return true;});
  }

  function potentialHealthEvents(){
    return state.events.filter(e=>semanticCategory(e)==='potential_health_event'&&recordIsActive(e)).sort((a,b)=>new Date(b.timestamp||0)-new Date(a.timestamp||0));
  }

  function durationLabel(hours){
    const mins=Math.round(Number(hours||0)*60);if(!Number.isFinite(mins)||mins<=0)return '—';
    const h=Math.floor(mins/60),m=mins%60;return `${h?h+' hr':''}${h&&m?' ':''}${m?m+' min':''}`;
  }

  function sleepSummary(e){
    const st=e?.structured||{}, value=metricValue(e), start=st.start_time||st.sleep_start, end=st.end_time||st.sleep_end;
    const timeRange=start&&end?`${fmtTime(start)}–${fmtTime(end)}`:'';
    const quality=st.sleep_quality||st.quality||'';
    return [value!=null?durationLabel(value):'Sleep',timeRange,quality?`${String(quality).charAt(0).toUpperCase()}${String(quality).slice(1)} quality`:''].filter(Boolean).join(' · ');
  }

  function allMetricSeries(id) {
    const rows=dedupeDisplayEvents(state.events.filter(e=>['measurement','lab','sleep'].includes(semanticCategory(e)) && recordIsActive(e) && !suspectedArtifact(e)));
    return rows.map(e=>{
      const cid=canonicalMetric(metricId(e)); const value=metricValue(e); const s=e.structured||{};
      return {id:e.id,metric:cid,value,unit:s.unit||s.value_unit||'',date:e.timestamp||e.recorded_at,source:e.provenance?.source||s.source||'ZEKE',event:e};
    }).filter(p=>p.metric===id && p.value!=null && Number.isFinite(new Date(p.date).getTime())).sort((a,b)=>new Date(a.date)-new Date(b.date));
  }

  function metricSeries(id, rangeId=state.dashboardHealthRange) {
    const days = RANGE_DAYS[rangeId]; const cutoff = days ? Date.now()-days*864e5 : 0;
    return allMetricSeries(id).filter(p=>new Date(p.date).getTime()>=cutoff);
  }

  function bloodPressureSeries(all=false, rangeId=state.dashboardHealthRange) {
    const series=id=>all?allMetricSeries(id):metricSeries(id,rangeId);
    const sys=series('bp_systolic'), dia=series('bp_diastolic');
    return {sys,dia};
  }

  function latestMetric(id) {
    if (id==='blood_pressure') {
      const {sys,dia}=bloodPressureSeries(true); return sys.length&&dia.length?{value:`${sys.at(-1).value}/${dia.at(-1).value}`,unit:'mmHg',date:sys.at(-1).date}:null;
    }
    const rows=allMetricSeries(id); return rows.at(-1)||null;
  }

  function metricDelta(id, rangeId=state.dashboardHealthRange) {
    const rows=id==='blood_pressure'?bloodPressureSeries(false,rangeId).sys:metricSeries(id,rangeId); if(rows.length<2) return null;
    return rows.at(-1).value-rows[0].value;
  }

  function availableMetrics() {
    const known=Object.keys(METRICS).filter(id=>id==='blood_pressure'?(bloodPressureSeries(true).sys.length&&bloodPressureSeries(true).dia.length):allMetricSeries(id).length);
    const discovered=[...new Set(state.events.filter(e=>recordIsActive(e)&&['measurement','lab','sleep'].includes(semanticCategory(e))).map(e=>canonicalMetric(metricId(e))).filter(Boolean))]
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
    overlay.innerHTML=`<section class="metric-detail" role="dialog" aria-modal="true" aria-label="${esc(meta.label)} details"><button class="metric-detail-close" aria-label="Close">×</button><h2>${esc(meta.label)}</h2><p class="metric-detail-current">Latest verified value: <strong>${esc(latest?.value??'—')} ${esc(latest?.unit||meta.unit||'')}</strong></p><p>${esc(metricNarrative(id,points))}</p><div class="metric-detail-chart">${trendChartSVG(id)}</div><h3>Underlying verified observations</h3><div class="metric-detail-table-wrap"><table><thead><tr><th>Date</th><th>Value</th><th>Source</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="3">No verified observations.</td></tr>'}</tbody></table></div></section>`;
    overlay.classList.add('show');
    overlay.querySelector('.metric-detail-close')?.addEventListener('click',()=>overlay.classList.remove('show'));
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('show')},{once:true});
    bindTooltips();
  }

  function metricCard(id,allowEmpty=false,rangeId=state.dashboardHealthRange) {
    const meta=METRICS[id], latest=latestMetric(id);
    if(!latest && !allowEmpty) return '';
    if(!latest) return `<article class="metric-card metric-${id} metric-empty" data-metric="${id}"><div class="metric-head"><span class="metric-icon">${meta.icon}</span><span>${esc(meta.label)}</span></div><div class="metric-number">No entries</div><div class="metric-change">Log the first observation to begin a dated trend.</div><div class="metric-foot"><span>Not tracked yet</span><button class="text-action" data-log-metric="${id}">+ Log</button></div></article>`;
    const delta=metricDelta(id,rangeId); let points=id==='blood_pressure'?bloodPressureSeries(false,rangeId).sys:metricSeries(id,rangeId); if(points.length<2) points=id==='blood_pressure'?bloodPressureSeries(true).sys:allMetricSeries(id); if(points.length>60){const keep=[points[0]];const step=(points.length-1)/58;for(let i=1;i<59;i++)keep.push(points[Math.round(i*step)]);keep.push(points.at(-1));points=keep;}
    let deltaText='Latest verified observation';
    if(delta!=null) deltaText=Math.abs(delta)<1e-9?'No change in selected period':`${delta>0?'↑':'↓'} ${Math.abs(delta).toFixed(Math.abs(delta)<1?1:0)} ${latest.unit||meta.unit} since first in period`;
    const number=id==='sleep_duration'?durationLabel(latest.value):esc(latest.value);
    const unit=id==='sleep_duration'?'':` <small>${esc(latest.unit||meta.unit)}</small>`;
    return `<article class="metric-card metric-${id}" data-metric="${id}">
      <div class="metric-head"><span class="metric-icon">${meta.icon}</span><span>${esc(meta.label)}</span><button type="button" class="icon-btn metric-more" data-open-metric-detail="${esc(id)}" aria-label="Open ${esc(meta.label)} details">⋮</button></div>
      <div class="metric-number">${number}${unit}</div>
      <div class="metric-change">${esc(deltaText)}</div><div class="metric-open-hint">Open analysis →</div>
      ${miniSpark(points,id)}
      <div class="metric-foot"><span>${esc(fmtDate(latest.date))}</span><button class="text-action" data-log-metric="${id}">+ Log</button></div>
    </article>`;
  }

  function storedStringArray(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.map(String):[]}catch(_){return []}}
  function dashboardMetricOrder(available=[]) {
    const saved=storedStringArray('zeke.dashboard.metricOrder.v1');
    const merged=[...saved.filter(id=>available.includes(id)),...available.filter(id=>!saved.includes(id))];
    if(JSON.stringify(saved)!==JSON.stringify(merged))localStorage.setItem('zeke.dashboard.metricOrder.v1',JSON.stringify(merged));
    return merged;
  }

  const DASHBOARD_RANGE_OPTIONS=[['week','Week'],['month','Month'],['quarter','3 months'],['6months','6 months'],['year','Year'],['all','All']];
  function dashboardRangeControl(kind='health'){
    const current=kind==='trend'?state.dashboardTrendRange:state.dashboardHealthRange;
    return `<div class="dashboard-local-range" aria-label="${kind==='trend'?'Trend':'Health'} time period">${DASHBOARD_RANGE_OPTIONS.map(([id,label])=>`<button type="button" class="range ${current===id?'active':''}" data-dashboard-range="${id}" data-dashboard-range-kind="${kind}" aria-pressed="${current===id}">${label}</button>`).join('')}</div>`;
  }
  function healthGlanceHTML(limit=8) {
    const available=availableMetrics().filter(id=>!state.hiddenWidgets.has(`metric:${id}`));
    const pinned=new Set(storedStringArray('zeke.health.metricFavorites.v1'));
    const usage=new Map();
    for(const event of state.events.filter(recordIsActive)){const id=canonicalMetric(metricId(event));if(id)usage.set(id,(usage.get(id)||0)+1)}
    const fallback=available.slice().sort((a,b)=>(usage.get(b)||0)-(usage.get(a)||0));
    const ordered=dashboardMetricOrder(pinned.size?available:fallback);
    const selected=(pinned.size?ordered.filter(id=>pinned.has(id)):ordered).slice(0,limit);
    const controls=dashboardRangeControl('health');
    if(!selected.length) return `<section class="panel health-glance dashboard-health-glance"><div class="section-head"><div><span class="tile-kicker">HOW AM I?</span><h2>Health at a Glance</h2><p>Your current state, using verified records only.</p></div><div class="section-head-actions">${controls}<button class="text-action" data-route="health">Choose metrics in Health</button></div></div><div class="empty-inline">No Dashboard metrics are available yet. Log a health value or pin a metric from Health.</div></section>`;
    const note=pinned.size?'Pinned from your Health library.':'Showing your most-used verified metrics until you pin your own choices in Health.';
    return `<section class="panel health-glance dashboard-health-glance"><div class="section-head"><div><span class="tile-kicker">HOW AM I?</span><h2>Health at a Glance</h2><p>${esc(note)}</p></div><div class="section-head-actions">${controls}<button class="text-action" data-route="health">Manage in Health</button></div></div><div class="metrics-row">${selected.map(id=>metricCard(id,false,state.dashboardHealthRange)).join('')}</div></section>`;
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

  const TREND_CHANGE_THRESHOLDS={weight:.5,body_fat_pct:.5,a1c:.2,resting_hr:2,average_glucose:5,bp_systolic:4,bp_diastolic:3,sleep_duration:.25};
  function recentWindowDays(rangeId=state.dashboardTrendRange){return ({week:3,month:14,quarter:28,'6months':42,year:60,all:60})[rangeId]||28}
  function metricRecentInsight(id){
    const meta=METRICS[id]||{label:id,unit:''},all=id==='blood_pressure'?bloodPressureSeries(true).sys:allMetricSeries(id);if(all.length<2)return null;
    const end=Date.now(),days=recentWindowDays(),recentStart=end-days*864e5,priorStart=end-days*2*864e5;
    let recent=all.filter(p=>{const t=new Date(p.date).getTime();return t>=recentStart&&t<=end}),prior=all.filter(p=>{const t=new Date(p.date).getTime();return t>=priorStart&&t<recentStart});
    if(recent.length<2){recent=all.slice(-Math.min(4,all.length));prior=all.slice(Math.max(0,all.length-recent.length*2),Math.max(0,all.length-recent.length));}
    const latest=all.at(-1),unit=latest.unit||meta.unit||'',diff=recent.length>=2?Number(recent.at(-1).value)-Number(recent[0].value):0,threshold=TREND_CHANGE_THRESHOLDS[id]??Math.max(Math.abs(Number(latest.value))*0.01,.1);
    const priorDiff=prior.length>=2?Number(prior.at(-1).value)-Number(prior[0].value):null;
    const recentDays=Math.max(1,Math.round((new Date(recent.at(-1)?.date||latest.date)-new Date(recent[0]?.date||latest.date))/864e5));
    let title,summary;
    if(Math.abs(diff)<=threshold){title=`${meta.label} has been fairly steady recently`;summary=`Current: ${latest.value} ${unit}. Across ${recent.length} recent observation${recent.length===1?'':'s'} over about ${recentDays} day${recentDays===1?'':'s'}, the recorded change was small (${Math.abs(diff).toFixed(Math.abs(diff)<1?1:0)} ${unit}).`;}
    else{
      const dir=diff<0?'down':'up',amount=Math.abs(diff).toFixed(Math.abs(diff)<1?1:0);title=`${meta.label} is trending ${dir} recently`;summary=`Current: ${latest.value} ${unit}. The recent recorded change is ${amount} ${unit} ${dir} across ${recent.length} observation${recent.length===1?'':'s'} over about ${recentDays} day${recentDays===1?'':'s'}.`;
      if(priorDiff!=null&&Math.sign(priorDiff)===Math.sign(diff)&&Math.abs(diff)>Math.abs(priorDiff)*1.5)summary+=` That is a faster change than the preceding comparable observations.`;
      else if(priorDiff!=null&&Math.sign(priorDiff)!==0&&Math.sign(priorDiff)!==Math.sign(diff))summary+=` The direction has reversed compared with the preceding comparable observations.`;
      else if(priorDiff!=null&&Math.abs(diff)<Math.abs(priorDiff)*.55)summary+=` The pace has slowed compared with the preceding comparable observations.`;
    }
    const lifetime=Number(latest.value)-Number(all[0].value);const context=all.length>=3&&Math.abs(lifetime)>threshold?`Longer-term context: ${Math.abs(lifetime).toFixed(Math.abs(lifetime)<1?1:0)} ${unit} ${lifetime>0?'above':'below'} the first verified value across ${all.length} observations.`:'';
    return {id,title,summary,context,points:recent,allCount:all.length};
  }
  function trendPanelHTML() {
    const metricItems=availableMetrics().map(metricRecentInsight).filter(Boolean).slice(0,4);
    const patternItems=patternCandidates().slice(0,1).map(p=>({id:`pattern-${p.a}-${p.b}`,title:`A relationship worth a closer look`,summary:`${prettyVar(p.a)} and ${prettyVar(p.b)} showed a ${Math.abs(p.r)>=.7?'strong':'moderate'} descriptive association across ${p.n} paired days. ZEKE screened out smaller or likely workout-program artifacts before showing this.`,context:'Association is not causation; timing, shared trends, and unmeasured variables can still explain it.',pattern:p}));
    const items=[...metricItems,...patternItems].slice(0,5);
    return `<section class="panel trends-analysis-panel"><div class="section-head"><div><span class="tile-kicker">WHAT HAS CHANGED?</span><h2>Trends & Analysis</h2><p>Current state and recent momentum first; longer-term history stays in context.</p></div><div class="section-head-actions">${dashboardRangeControl('trend')}<button class="text-action" data-route="insights">Explore in Discover</button></div></div>${items.length?`<div class="trend-analysis-list">${items.map(item=>`<details class="trend-analysis-item" data-dashboard-trend="${esc(item.id)}" ${state.expandedDashboardTrends.has(item.id)?'open':''}><summary><div><strong>${esc(item.title)}</strong><span>${esc(item.summary)}</span></div><b>View detail</b></summary><div class="trend-analysis-detail"><p>${esc(item.summary)}</p>${item.context?`<p class="trend-context">${esc(item.context)}</p>`:''}${item.points?miniSpark(item.points,item.id):''}<div class="analysis-notes"><span><strong>Confidence:</strong> ${item.points&&item.points.length>=4?'Moderate':'Preliminary'}</span><span><strong>Limitations:</strong> Measurement conditions, missing dates, and other variables can affect the pattern.</span></div></div></details>`).join('')}</div>`:'<div class="empty-inline">No meaningful recent change is supported by the current verified record. ZEKE will not create a trend merely to fill this space.</div>'}</section>`;
  }

  function isWorkoutEvent(e) {
    const category=String(e?.category||e?.type||'').toLowerCase().replace(/[\s-]+/g,'_');
    const st=e?.structured||{};
    const subtype=String(st.category||st.type||st.event_type||st.record_type||'').toLowerCase().replace(/[\s-]+/g,'_');
    const categoryMatch=['workout','workouts','exercise','exercise_set','exercise_sets','fitness','strength_training','resistance_training','cardio','training_session'].includes(category)
      || ['workout','exercise','exercise_set','exercise_sets','fitness','strength_training','resistance_training','cardio','training_session'].includes(subtype);
    const exerciseName=st.exercise||st.exercise_name||st.movement||st.activity||st.session_type||st.workout_type;
    const workoutFields=st.workout_id||st.session_id||st.set_number!=null||st.sets!=null||st.reps!=null||st.weight!=null||st.load!=null||st.duration_min!=null||st.steps!=null||st.stair_steps!=null||st.ambulatory_steps!=null||st.distance_mi!=null;
    const raw=String(e?.raw_text||e?.summary||'').toLowerCase();
    const rawMatch=/\b(workout|strength training|resistance training|stairclimber|stair climber|lat pulldown|seated row|leg curl|leg extension|bicep curl|abdominal|sets?\s*[x×]|reps?)\b/.test(raw);
    return categoryMatch || Boolean(exerciseName && workoutFields) || rawMatch;
  }

  function workoutStructured(e) {
    const st=e?.structured||{};
    const exercise=st.exercise||st.exercise_name||st.movement||st.activity||st.session_type||st.workout_type||'Workout';
    const stair=/stair|climbmill/i.test(String(exercise));
    return {
      ...st,
      exercise,
      weight: st.weight??st.load??st.weight_lbs??st.weight_lb??null,
      reps: st.reps??st.repetitions??null,
      sets: st.sets??st.set_count??null,
      duration_min: st.duration_min??st.duration_minutes??st.minutes??null,
      steps: st.steps??null,
      stair_steps: st.stair_steps??st.steps_climbed??(stair?st.steps:null),
      ambulatory_steps: st.ambulatory_steps??st.walking_steps??(!stair?st.steps:null),
      distance_mi: st.distance_mi??st.distance??null,
      average_hr: st.average_hr??st.avg_hr??null,
      pace: st.pace??null,
      level: st.level??st.intensity??null
    };
  }

  function hasMeaningfulWorkout(e){ const w=workoutStructured(e); return Boolean((w.exercise&&w.exercise!=='Workout')||w.weight!=null||w.reps!=null||w.sets!=null||w.duration_min!=null||w.steps!=null||w.stair_steps!=null||w.ambulatory_steps!=null||w.distance_mi!=null||w.average_hr!=null||String(w.notes||'').trim()); }
  function workoutMissingRelevantDetails(e){
    const w=workoutStructured(e),profile=activityProfile(w.exercise,w.activity_profile),stair=/stair|climbmill/i.test(w.exercise);
    if(profile==='strength')return w.weight==null||w.reps==null||w.sets==null;
    if(profile==='cardio')return w.duration_min==null||(stair?(w.stair_steps??w.steps)==null:(w.distance_mi==null&&(w.ambulatory_steps??w.steps)==null));
    if(profile==='rehab')return w.duration_min==null&&w.reps==null&&w.pain_before==null&&w.pain_after==null;
    return w.duration_min==null&&w.reps==null&&w.distance_mi==null;
  }

  function titleActivity(value=''){return String(value||'').trim().replace(/\b\w/g,c=>c.toUpperCase())}
  function normalizedActivityName(name='') {
    const raw=String(name||'').trim(),k=raw.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const aliases=[[/^(lat|wide grip lat|independent lat) pull ?down$/,'Lat Pulldown'],[/^(seated )?cable row$|^seated row$/,'Seated Row'],[/^(independent )?bicep curl$|^biceps? curl$/,'Bicep Curl'],[/^stair ?climber$|^climbmill$|^stairs?$/,'Stairclimber'],[/^seated leg curl$|^leg curl$/,'Seated Leg Curl'],[/^leg extension$/,'Leg Extension'],[/^glute (lift|extension)$|^hip extension$/,'Glute Lift'],[/^abdominal$|^ab crunch$|^abdominal crunch$/,'Abdominal']];
    for(const [re,label] of aliases)if(re.test(k))return label;return titleActivity(raw);
  }
  function activityLoadBasis(equipment='',name='',notes=''){
    const t=`${equipment} ${name} ${notes}`.toLowerCase();
    if(/dumbbell|dumbell/.test(t))return 'per_hand';if(/barbell|smith/.test(t))return 'total_system_load';if(/bowflex|power rod/.test(t))return 'bowflex_resistance_setting';if(/resistance band|\bband\b/.test(t))return 'band_resistance';if(/bodyweight|body weight|push.?up|plank/.test(t))return 'bodyweight';if(/machine|selector|cable|pulldown|seated row|leg curl|leg extension|abdominal|glute lift/.test(t))return 'displayed_machine_load';return 'unknown';
  }
  function activityIdentity(name='',structured={},notes=''){
    if(structured.exercise_family&&structured.variation_name)return {family:structured.exercise_family,variation:structured.variation_name,equipment:structured.equipment_type||structured.equipment||'unknown',load_basis:structured.load_basis||activityLoadBasis(structured.equipment_type||structured.equipment,name,notes),confidence:structured.identity_confidence||'confirmed'};
    const raw=String(name||'').trim(),text=`${raw} ${structured.equipment||''} ${notes||structured.notes||''}`.toLowerCase();
    let family=normalizedActivityName(raw),variation=normalizedActivityName(raw),equipment=String(structured.equipment||'').trim()||'unknown',confidence='low';
    const familyRules=[[/chest press|bench press/,'Chest Press'],[/lat.*pull.?down/,'Lat Pulldown'],[/chest[- ]supported.*\brow\b/,'Chest-Supported Row'],[/(?:\bseated\b.*\brow\b|\bcable\b.*\brow\b|\brow\b.*(?:\bseated\b|\bcable\b))/,'Seated Row'],[/(?:one[- ]?arm.*dumbbell.*\brow\b|dumbbell.*\brow\b)/,'Dumbbell Row'],[/bicep.*curl|biceps.*curl|dumbell curl|dumbbell curl/,'Bicep Curl'],[/shoulder press/,'Shoulder Press'],[/external rotation|\ber\b/,'Shoulder External Rotation'],[/internal rotation|\bir\b/,'Shoulder Internal Rotation'],[/scaption/,'Scaption'],[/wall (slide|wash)/,'Wall Slide / Wall Wash'],[/posterior capsule|post cap/,'Posterior Capsule Stretch'],[/d1|d2|pnf/,'PNF Shoulder Diagonal'],[/no monies/,'Shoulder External Rotation'],[/cheerleader/,'Cheerleaders']];
    for(const [re,label] of familyRules)if(re.test(text)){family=label;break}
    if(/^lat pulldown$/i.test(raw)&&!String(structured.equipment||'').trim()){equipment='selectorized machine';confidence='user-context';variation='Planet Fitness — Lat Pulldown Machine';}
    else if(/^independent bicep curl$/i.test(raw)){equipment='selectorized machine';confidence='user-context';variation='Planet Fitness — Independent-Arm Bicep Curl Machine';}
    else if(/bowflex/.test(text)){equipment='Bowflex';confidence='high';variation=/incline.*chest|chest.*incline/.test(text)?'Bowflex Incline Chest Press':`Bowflex ${family}`;}
    else if(/dumbbell|dumbell/.test(text)){equipment='dumbbell';confidence='high';variation=`Dumbbell ${family}`;}
    else if(/barbell/.test(text)){equipment='barbell';confidence='high';variation=`Barbell ${family}`;}
    else if(/resistance band|\bband\b/.test(text)){equipment='resistance band';confidence='high';variation=family==='Shoulder External Rotation'?'Band External Rotation':`${family} — Resistance Band`;}
    else if(/cable/.test(text)){equipment='cable';confidence='high';variation=family==='Seated Row'?'Seated Cable Row':`${family} — Cable`;}
    else if(/machine|selectorized/.test(text)){equipment='selectorized machine';confidence='high';variation=`Machine ${family}`;}
    else if(structured.equipment){confidence='moderate';variation=raw;}
    return {family,variation, equipment, load_basis:activityLoadBasis(equipment,raw,notes||structured.notes||''),confidence};
  }
  function inFitnessRange(date){const days=RANGE_DAYS[state.range];if(!days)return true;const d=new Date(date);if(Number.isNaN(d.getTime()))return false;const cutoff=new Date();cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-days+1);return d>=cutoff;}
  function workoutGroups({respectRange=true}={}) {
    const byExercise=new Map();
    for(const e of state.events.filter(isWorkoutEvent)){
      const st=workoutStructured(e),date=e.timestamp||e.recorded_at;if(respectRange&&!inFitnessRange(date))continue;const original=(st.exercise||'').trim();if(!original)continue;
      const identity=activityIdentity(original,st,e.raw_text||st.notes||''),name=identity.variation||normalizedActivityName(original),day=localDay(new Date(date||Date.now())),sessionKey=String(st.workout_id||st.session_id||`${day}:${name.toLowerCase()}`);
      if(!byExercise.has(name))byExercise.set(name,new Map());const sessions=byExercise.get(name),prev=sessions.get(sessionKey)||{event:e,date,weight:null,reps:null,sets:0,rpe:null,rir:null,pain:null,pain_before:null,pain_during:null,pain_after:null,duration_min:null,steps:null,stair_steps:null,ambulatory_steps:null,distance_mi:null,average_hr:null,pace:null,level:null,technique:null,injury_context:null,notes:null,workout_id:st.workout_id||'',variants:new Set(),family:identity.family,equipment:identity.equipment,load_basis:identity.load_basis};
      prev.variants.add(original);const num=v=>v==null||v===''?null:Number(v),max=(a,b)=>b==null?a:Math.max(a??b,b),weight=num(st.weight??st.load),reps=num(st.reps),sets=num(st.sets),setRows=Number(st.set_number||st.set_no||0)?1:0,setRpes=Array.isArray(st.set_rpe)?st.set_rpe.map(num).filter(Number.isFinite):[],setPains=Array.isArray(st.set_pain)?st.set_pain.map(num).filter(Number.isFinite):[],rowRpe=Number.isFinite(num(st.rpe))?num(st.rpe):(setRpes.length?Math.max(...setRpes):null),painVals=[st.pain,st.pain_before,st.pain_during,st.pain_after,...setPains].map(num).filter(Number.isFinite),pain=painVals.length?Math.max(...painVals):null;
      sessions.set(sessionKey,{...prev,event:e,date:date||prev.date,weight:max(prev.weight,weight),reps:max(prev.reps,reps),sets:prev.sets+(sets||setRows||1),rpe:max(prev.rpe,rowRpe),rir:max(prev.rir,num(st.rir)),pain:max(prev.pain,pain),pain_before:max(prev.pain_before,num(st.pain_before)),pain_during:max(prev.pain_during,num(st.pain_during)),pain_after:max(prev.pain_after,num(st.pain_after)),duration_min:max(prev.duration_min,num(st.duration_min)),steps:max(prev.steps,num(st.steps)),stair_steps:max(prev.stair_steps,num(st.stair_steps)),ambulatory_steps:max(prev.ambulatory_steps,num(st.ambulatory_steps)),distance_mi:max(prev.distance_mi,num(st.distance_mi)),average_hr:max(prev.average_hr,num(st.average_hr)),pace:st.pace??prev.pace,level:st.level??prev.level,technique:st.technique_notes??st.technique??prev.technique,injury_context:st.injury_context??prev.injury_context,notes:st.notes??prev.notes,family:st.exercise_family||identity.family,equipment:st.equipment_type||st.equipment||identity.equipment,load_basis:st.load_basis||identity.load_basis});
    }
    const map=new Map();for(const [name,sessions] of byExercise)map.set(name,[...sessions.values()].sort((a,b)=>new Date(a.date)-new Date(b.date)));return map;
  }

  function workoutFamilyGroups({respectRange=true}={}){
    const exact=workoutGroups({respectRange}),families=new Map();
    for(const [variation,sessions] of exact){for(const row of sessions){const family=row.family||activityIdentity(variation,row.event?.structured||{},row.notes||'').family||normalizedActivityName(variation);if(!families.has(family))families.set(family,[]);families.get(family).push({...row,variation_name:variation,family})}}
    for(const rows of families.values())rows.sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
    return families;
  }
  function familyVariationChart(sessions=[],category='strength',family=''){
    if(category!=='strength'){
      const chart=activityChartDescriptor(sessions,category,family);return chart.points.length>=2?`<div class="activity-chart-block"><span class="activity-chart-label">${esc(chart.label)}</span>${miniSpark(chart.points,chart.field)}</div>`:`<div class="activity-chart-status"><strong>${esc(chart.label)} trend unavailable</strong><span>${esc(chart.reason)}</span></div>`;
    }
    const grouped=new Map();
    for(const row of sessions){
      if(row?.weight==null||row.weight===''||!row.date)continue;
      const weight=Number(row.weight);if(!Number.isFinite(weight)||weight<=0)continue;
      const v=String(row.variation_name||family||'Unspecified variation').trim()||'Unspecified variation';
      if(!grouped.has(v))grouped.set(v,[]);grouped.get(v).push({...row,weight});
    }
    const series=[...grouped.entries()].map(([name,rows])=>[name,rows.sort((a,b)=>new Date(a.date)-new Date(b.date))]).filter(([,rows])=>rows.length);
    if(!series.length)return '<div class="activity-chart-status compact"><strong>Load trend unavailable</strong><span>No confirmed positive load values are recorded yet. Missing load stays unknown; it is never plotted as 0 lb.</span></div>';
    const all=series.flatMap(([,rows])=>rows),dates=all.map(r=>new Date(r.date).getTime()).filter(Number.isFinite),weights=all.map(r=>Number(r.weight));
    const minD=Math.min(...dates),maxD=Math.max(...dates),rawMin=Math.min(...weights),rawMax=Math.max(...weights),pad=Math.max(2.5,(rawMax-rawMin)*.12),minW=Math.max(0,rawMin-pad),maxW=rawMax+pad,w=360,h=138,pl=38,pr=12,pt=12,pb=32;
    const x=t=>pl+(w-pl-pr)*((t-minD)/(maxD-minD||1)),y=v=>pt+(h-pt-pb)*(1-((v-minW)/(maxW-minW||1)));
    const paths=series.map(([name,rows],si)=>{
      const pts=rows.map(r=>[x(new Date(r.date).getTime()),y(Number(r.weight)),r]);
      const d=pts.length>1?pts.map((pt,i)=>(i?'L':'M')+pt[0].toFixed(1)+' '+pt[1].toFixed(1)).join(' '):'';
      return `<g class="variation-series variation-series-${si%6}" data-variation-series="${escAttr(name)}">${d?`<path d="${d}"/>`:''}${pts.map(pt=>`<circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="4"><title>${esc(name)} · ${fmtDate(pt[2].date,{month:'short',day:'numeric'})}: ${pt[2].weight} lb</title></circle>`).join('')}</g>`;
    }).join('');
    const legend=series.map(([name,rows],si)=>`<span class="variation-legend-item variation-series-${si%6}"><i></i><b>${esc(name)}</b><small>${rows.length} ${rows.length===1?'point':'points'}</small></span>`).join('');
    const firstDate=fmtDate(new Date(minD),{month:'short',day:'numeric'}),lastDate=fmtDate(new Date(maxD),{month:'short',day:'numeric'});
    return `<div class="activity-chart-block family-variation-chart"><div class="activity-chart-heading"><span class="activity-chart-label">Load by variation</span><small>Separate lines · shared axes</small></div><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(family)} load history. Every variation is its own series; missing loads are omitted."><line class="family-grid" x1="${pl}" y1="${pt}" x2="${w-pr}" y2="${pt}"/><line class="family-grid" x1="${pl}" y1="${(pt+h-pb)/2}" x2="${w-pr}" y2="${(pt+h-pb)/2}"/><line class="family-axis" x1="${pl}" y1="${h-pb}" x2="${w-pr}" y2="${h-pb}"/><line class="family-axis" x1="${pl}" y1="${pt}" x2="${pl}" y2="${h-pb}"/><text class="axis-label" x="2" y="${pt+5}">${Math.round(maxW)} lb</text><text class="axis-label" x="2" y="${h-pb}">${Math.round(minW)} lb</text><text class="axis-label axis-date" x="${pl}" y="${h-8}">${esc(firstDate)}</text><text class="axis-label axis-date axis-date-end" x="${w-pr}" y="${h-8}">${esc(lastDate)}</text>${paths}</svg><div class="variation-legend" aria-label="Variation legend">${legend}</div></div>`;
  }

  function commonLoadIncrement(last){if(!last?.weight)return null;const eq=String(last.equipment||'').toLowerCase();if(/dumbbell/.test(eq))return 5;if(/bowflex/.test(eq))return 5;return 5}
  function activityRecommendation(name,sessions=[]){
    const recent=sessions.filter(x=>!x.placeholder).slice(-5),last=recent.at(-1),prev=recent.at(-2),category=canonicalActivityCategory(name,last?.activity_profile||activityProfile(name));
    if(!last)return {name,title:`${name}: build a baseline first.`,rationale:'No comparable session is available for this exact variation.',suggestion:'Log the exercise once before ZEKE suggests progression.',score:20,confidence:'low',recent,sessions,target:null,evidence_ids:[]};
    if(category!=='strength')return {name,title:`${name}: repeat a comparable session.`,rationale:'Automatic load progression is reserved for strength variations with comparable load/repetition data.',suggestion:'Use the activity-specific fields and compare the same metric next time.',score:35,confidence:'low',recent,sessions,last,target:null,evidence_ids:[]};
    const gap=prev?Math.round((new Date(last.date)-new Date(prev.date))/864e5):null,numOrNull=v=>v==null||v===''?null:Number(v),pain=numOrNull(last.pain),rpe=numOrNull(last.rpe),rir=numOrNull(last.rir),hasPain=Number.isFinite(pain),hasRpe=Number.isFinite(rpe),hasRir=Number.isFinite(rir),reps=numOrNull(last.reps),sets=numOrNull(last.sets)||3,load=numOrNull(last.weight),lower=8,upper=12;
    const base={name,recent,sessions,last,evidence_ids:['acsm-resistance-2026','acsm-progression-2009']};
    if(!last.equipment||String(last.equipment).toLowerCase()==='unknown'||!last.load_basis||last.load_basis==='unknown')return {...base,title:`${name}: identify the exact variation first.`,rationale:'The comparable history does not reliably identify the equipment/load basis for this variation.',suggestion:'Choose or review the machine, dumbbell, barbell, Bowflex, band, cable, or other exact variation before ZEKE recommends a load change.',score:82,confidence:'high',target:null};
    if(/rehab|pt|injur/i.test(`${last.injury_context||''} ${activityProfile(name)}`)||hasPain&&pain>=4)return {...base,title:`${name}: do not auto-progress yet.`,rationale:hasPain?`The latest recorded pain was ${pain}/10.`:'This exercise is being used in an injury/PT context.',suggestion:'Use the load, range, and progression your clinician/PT has cleared. ZEKE will keep recording performance but will not automatically increase resistance.',score:100,confidence:'high',target:{load:load||null,reps:`${lower}–${upper}`,sets},clinician_priority:true};
    if(gap!=null&&gap>21)return {...base,title:`${name}: re-establish the current load.`,rationale:`There was a ${gap}-day gap between the two most recent comparable sessions.`,suggestion:`Start by repeating ${load?`${load} lb`:'the last setup'} and record effort before resuming progression.`,score:90,confidence:'moderate',target:{load:load||null,reps:`${lower}–${upper}`,sets}};
    if(!load||!Number.isFinite(reps))return {...base,title:`${name}: more comparable data needed.`,rationale:'Load and repetitions are not both available for the latest exact variation.',suggestion:'Record load, reps, and preferably RPE or RIR next time.',score:45,confidence:'low',target:null};
    const highEffort=(hasRpe&&rpe>=9)||(hasRir&&rir<=1),comfortable=(hasRpe&&rpe<=8)||(hasRir&&rir>=2),topCount=recent.slice(-3).filter(x=>{const xr=numOrNull(x.rpe),xi=numOrNull(x.rir),xreps=numOrNull(x.reps);return Number.isFinite(xreps)&&xreps>=upper&&((Number.isFinite(xr)&&xr<=8)||(Number.isFinite(xi)&&xi>=2))}).length;
    if(reps<lower||highEffort)return {...base,title:`${name}: hold the load and rebuild reps.`,rationale:`Latest: ${load} lb × ${reps}${hasRpe?` at RPE ${rpe}`:hasRir?` with ${rir} RIR`:''}.`,suggestion:`Stay at ${load} lb and aim for ${lower}–${upper} controlled reps before increasing.`,score:78,confidence:hasRpe||hasRir?'moderate':'low',target:{load,reps:`${lower}–${upper}`,sets}};
    if(reps>=upper&&comfortable&&topCount>=2){const inc=commonLoadIncrement(last),next=load+inc;return {...base,title:`${name}: a small load increase is supported.`,rationale:`You reached at least ${upper} reps with moderate effort in ${topCount} recent comparable sessions.`,suggestion:`Try about ${next} lb next time and let reps return toward the lower end of the ${lower}–${upper} range.`,score:88,confidence:'moderate',target:{load:next,reps:`${lower}–${upper}`,sets}};}
    if(reps>=upper&&!comfortable)return {...base,title:`${name}: verify effort before adding weight.`,rationale:`You reached ${reps} reps at ${load} lb, but effort information is ${hasRpe||hasRir?'high':'incomplete'}.`,suggestion:`Repeat ${load} lb and record RPE or RIR. If ${upper}+ reps remain comfortable, ZEKE can support a small increase.`,score:66,confidence:'low',target:{load,reps:`${lower}–${upper}`,sets}};
    return {...base,title:`${name}: progress reps at the current load.`,rationale:`Latest: ${load} lb × ${reps}${hasRpe?` at RPE ${rpe}`:hasRir?` with ${rir} RIR`:''}.`,suggestion:`Keep ${load} lb and build toward ${upper} controlled reps. Increase load only after the upper end is repeatable with acceptable effort and joint response.`,score:62,confidence:recent.length>=2?'moderate':'low',target:{load,reps:`${lower}–${upper}`,sets}};
  }

  function activityChartDescriptor(sessions=[],category='',name=''){
    const stair=/stair|climbmill/i.test(name),walking=/walk|treadmill|run/i.test(name);
    const options=category==='strength'?[['weight','Load','lb'],['reps','Repetitions','reps'],['sets','Sets','sets']]:category==='cardio'?(stair?[['stair_steps','Stair steps','steps'],['duration_min','Duration','min'],['average_hr','Average heart rate','bpm'],['level','Level / intensity','']]:walking?[['distance_mi','Distance','mi'],['duration_min','Duration','min'],['ambulatory_steps','Walking steps','steps'],['average_hr','Average heart rate','bpm']]:[['duration_min','Duration','min'],['distance_mi','Distance','mi'],['steps','Activity steps','steps'],['average_hr','Average heart rate','bpm'],['level','Level / intensity','']]):[['duration_min','Duration','min'],['pain','Pain','/10'],['reps','Repetitions','reps']];
    for(const [field,label,unit] of options){const points=sessions.filter(x=>Number.isFinite(Number(x[field]))&&x[field]!=null&&x.date).map((x,i)=>({value:Number(x[field]),date:x.date,unit,id:`${field}-${i}`}));if(points.length>=2)return {field,label,unit,points};}
    const any=options.find(([field])=>sessions.some(x=>x[field]!=null));
    return {field:any?.[0]||options[0][0],label:any?.[1]||options[0][1],unit:any?.[2]||options[0][2],points:[],reason:sessions.length<2?'Only one comparable session is recorded.':'The sessions do not contain two comparable values with the same metric.'};
  }

  function coachInsight() {
    let best=null;
    for(const [name,sessions] of workoutGroups()){
      if(sessions.length<2)continue;const insight=activityRecommendation(name,sessions);
      if(!best||insight.score>best.score)best=insight;
    }
    return best;
  }

  function coachChart(insight) {
    const pts=insight.sessions.filter(x=>x.weight).slice(-8); if(pts.length<2) return '';
    const w=360,h=96,pl=30,pr=10,pt=8,pb=22; const vals=pts.map(x=>x.weight),min=Math.min(...vals)-5,max=Math.max(...vals)+5;
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
    if(!name)return coachInsight();const sessions=workoutGroups().get(name);return sessions?.length?activityRecommendation(name,sessions):null;
  }

  function coachHTML() {
    const recommendations=[];
    const timely=coachInsight();
    if(timely&&timely.score>=55&&activityPreference(timely.name)!=='exclude')recommendations.push({title:timely.title,text:timely.suggestion,meta:`${timely.confidence} confidence · ${timely.recent.length} recent session${timely.recent.length===1?'':'s'}`,action:`<div class="coach-action-links"><button class="text-action" data-coach-exercise="${esc(timely.name)}">Open activity</button><button class="text-action" data-coach-evidence="${esc(timely.name)}">Research & evidence</button></div>`});
    const workoutCount=state.events.filter(e=>recordIsActive(e)&&isWorkoutEvent(e)).length,sleepCount=allMetricSeries('sleep_duration').length;
    if(workoutCount>=2&&sleepCount<3)recommendations.push({title:'Track sleep before drawing recovery conclusions',text:`ZEKE has ${workoutCount} workout records but only ${sleepCount} confirmed sleep observation${sleepCount===1?'':'s'}. Log sleep for another week before using it to change training.`,meta:'Data-collection recommendation',action:'<div class="coach-action-links"><button class="text-action" data-log-metric="sleep_duration">Log sleep</button><button class="text-action" data-coach-evidence="sleep">Research & evidence</button></div>'});
    const shown=recommendations.slice(0,3);
    if(!shown.length)return `<section class="panel coach-panel coach-actionable"><div class="section-head"><div><span class="tile-kicker">WHAT SHOULD I DO?</span><h2>Coach's Eye</h2><p>Only recommendations that are supported and actionable appear here.</p></div></div><div class="coach-clear-state"><strong>Nothing needs your attention today.</strong><span>Continue your current plan and keep recording comparable sessions.</span></div></section>`;
    return `<section class="panel coach-panel coach-actionable"><div class="section-head"><div><span class="tile-kicker">WHAT SHOULD I DO?</span><h2>Coach's Eye</h2><p>Actionable guidance only. Descriptive patterns stay in Trends & Analysis.</p></div><span class="recommendation-count">${shown.length}</span></div><div class="coach-action-list">${shown.map((r,i)=>`<article><span class="coach-priority">${i+1}</span><div><strong>${esc(r.title)}</strong><p>${esc(r.text)}</p><small>${esc(r.meta)}</small>${r.action||''}</div></article>`).join('')}</div></section>`;
  }

  function openQuestions() {
    return state.factors
      .filter(f=>f.type==='clarification_question'&&!['resolved','dismissed','unknown'].includes(f.status))
      .sort((a,b)=>{
        const deferOrder=Number(Boolean(a.deferred_at))-Number(Boolean(b.deferred_at));
        return deferOrder||priorityWeight(b.priority)-priorityWeight(a.priority)||new Date(a.deferred_at||a.created_at||0)-new Date(b.deferred_at||b.created_at||0);
      });
  }
  async function deferQuestion(question,note='User chose Later'){
    if(!question)return null;
    return ZekeData.saveFactor({...question,status:'open',answer:question.answer||'',deferred_at:new Date().toISOString(),defer_count:Number(question.defer_count||0)+1,last_defer_note:note,resolved_at:null});
  }
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
      <div class="section-head conversation-head"><div><h2>Talk to ZEKE</h2><p>Conversation first, with structured choices when ZEKE needs a safe decision.</p></div><div class="conversation-head-actions"><button class="secondary compact" id="expandConversation" aria-expanded="${document.body.classList.contains('conversation-expanded')}">${document.body.classList.contains('conversation-expanded')?'Collapse':'Expand'}</button><button type="button" class="question-pill" data-open-reviews>${reviewTasks().length} Question${reviewTasks().length===1?'':'s'} for You</button></div></div>
      <div class="conversation-thread" id="conversationThread">${conversationMessagesHTML(msgs)}</div>
      ${workflowStatusHTML()}
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
  function medicationDoseToday(action){
    const today=localDay(),canonical=ZekeParser.canonicalMedicationId(action.label||action.name||action.id||'');
    return state.events.find(e=>recordIsActive(e)&&semanticCategory(e)==='medication'&&String(e.timestamp||e.recorded_at||'').slice(0,10)===today&&ZekeParser.canonicalMedicationId(e.structured?.medication_name||e.structured?.name||'')===canonical&&['taken','administered','completed'].includes(String(e.structured?.status||'').toLowerCase()))||null;
  }
  function actionDoneToday(action) {
    const today=localDay(); const label=String(action.label||action.name||'').toLowerCase();
    return state.events.some(e=>{const eventDate=new Date(e.timestamp||e.recorded_at);if(Number.isNaN(eventDate.getTime())||localDay(eventDate)!==today)return false;if(action.kind==='medication')return medicationEventCompletesAction(action,e)||Boolean(medicationDoseToday(action)===e);const st=e.structured||{},confirmed=/confirmed/i.test(String(st.interpretation_status||st.confirmation_status||''))||e.provenance?.source==='quick_action';if(!confirmed||e.category==='raw_input')return false;if(st.action_id===action.id)return true;const ex=String(st.exercise||'').toLowerCase();return (action.kind==='workout'&&isWorkoutEvent(e))||(label&&ex&&label.includes(ex));});
  }

  function medicationInventory(){
    const scheduled=(state.actions.catalog||[]).filter(a=>a.active!==false&&String(a.kind||a.type||'').toLowerCase()==='medication').map(a=>a.label||a.name).filter(Boolean);
    const recorded=state.events.filter(e=>recordIsActive(e)&&semanticCategory(e)==='medication').map(e=>e.structured?.medication_name||e.structured?.name).filter(Boolean);
    return [...new Map([...scheduled,...recorded].map(name=>[ZekeParser.canonicalMedicationId(name),String(name)])).values()];
  }
  function medicationCheckinKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`}
  function medicationCheckinDue(){return medicationInventory().length>0&&String(state.preferences.medication_checkin_last_completed||'')!==medicationCheckinKey()}
  function monthlyMedicationCheckinHTML(){
    const items=medicationInventory(),due=medicationCheckinDue();
    if(!items.length)return `<div class="empty-inline">No medications or supplements are currently available for a monthly review.</div>`;
    return `<div class="medication-checkin ${due?'is-due':'is-complete'}"><div><span class="tile-kicker">MONTHLY CHECK-IN</span><strong>${due?'Review medications and supplements':'Reviewed this month'}</strong><p>${due?`Confirm whether anything changed across ${items.length} recorded item${items.length===1?'':'s'}. This does not mark any dose complete.`:`Last completed ${esc(state.preferences.medication_checkin_last_completed)}. Individual doses still require their normal confirmation rules.`}</p></div>${due?`<div class="card-actions"><button class="secondary compact" data-medication-checkin="unchanged">No changes this month</button><button class="primary compact" data-medication-checkin="review">Review with ZEKE</button></div>`:'<span class="status-badge success">Complete</span>'}</div>`;
  }

  function medicationReconciliationGroups(){
    const groups=new Map();
    for(const action of (state.actions.catalog||[]).filter(a=>String(a.kind||'').toLowerCase()==='medication')){const id=ZekeParser.canonicalMedicationId(action.label||action.name||action.id||'');if(!id)continue;const g=groups.get(id)||{canonical:id,names:new Set(),actions:[],events:[]};g.names.add(action.label||action.name||id);g.actions.push(action);groups.set(id,g)}
    for(const event of state.events.filter(e=>recordIsActive(e)&&semanticCategory(e)==='medication')){const name=event.structured?.medication_name||event.structured?.name||'',id=ZekeParser.canonicalMedicationId(name);if(!id)continue;const g=groups.get(id)||{canonical:id,names:new Set(),actions:[],events:[]};if(name)g.names.add(name);g.events.push(event);groups.set(id,g)}
    return [...groups.values()].map(g=>({...g,names:[...g.names],primary:g.actions.find(a=>a.active!==false)||g.actions[0]||null,possible_alias_duplicate:g.names.length>1}));
  }
  function openMedicationReconciliationModal(){
    $('#medicationReconciliationModal')?.remove();const groups=medicationReconciliationGroups();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="medicationReconciliationModal"><section class="direct-entry-card medication-reconciliation-card"><div class="section-head"><div><span class="tile-kicker">MEDICATION RECONCILIATION</span><h2>Review medications & supplements</h2><p>Confirm what is active, schedules, and how adherence should be tracked. Similar brand/generic names are grouped, not silently merged.</p></div><button class="icon-btn" id="closeMedicationReconciliation">×</button></div><div class="med-reconcile-list">${groups.map((g,i)=>{const a=g.primary||{},sch=a.schedule||{},freq=sch.type==='weekly'?'weekly':sch.type==='daily'?'daily':'unscheduled';return `<article class="med-reconcile-row" data-med-group="${i}"><div><strong>${esc(g.names[0]||g.canonical)}</strong>${g.possible_alias_duplicate?`<small class="status-badge warning">Possible alias/duplicate: ${esc(g.names.slice(1).join(', '))}</small>`:''}<small>${g.events.length} recorded event${g.events.length===1?'':'s'}</small></div><label>Status<select data-med-status="${i}"><option value="active" ${a.active!==false?'selected':''}>Active</option><option value="stopped" ${a.active===false?'selected':''}>Stopped / discontinued</option></select></label><label>Schedule<select data-med-frequency="${i}"><option value="unscheduled" ${freq==='unscheduled'?'selected':''}>No schedule recorded</option><option value="daily" ${freq==='daily'?'selected':''}>Daily</option><option value="weekly" ${freq==='weekly'?'selected':''}>Weekly</option></select></label><label>Tracking<select data-med-adherence="${i}"><option value="confirm_each" ${a.adherence_mode==='confirm_each'||!a.adherence_mode?'selected':''}>Confirm each dose</option><option value="schedule_only" ${a.adherence_mode==='schedule_only'?'selected':''}>Schedule only</option><option value="assume_scheduled" ${a.adherence_mode==='assume_scheduled'?'selected':''}>Assume scheduled unless corrected</option></select></label><button type="button" class="text-action" data-edit-med-schedule="${i}">Edit dose/details</button></article>`}).join('')||'<div class="empty-inline">No medications or supplements are recorded yet.</div>'}</div><div class="direct-entry-actions"><button class="secondary" id="addMedicationFromReconcile">+ Add medication / supplement</button><button class="primary" id="saveMedicationReconciliation">Save review</button></div><p class="safety-copy">Stopping an item here stops ZEKE from using it as an active schedule; historical dose records remain preserved.</p></section></div>`);
    const close=()=>$('#medicationReconciliationModal')?.remove();$('#closeMedicationReconciliation').onclick=close;$('#medicationReconciliationModal').onclick=e=>{if(e.target.id==='medicationReconciliationModal')close()};
    $$('[data-edit-med-schedule]').forEach(b=>b.onclick=()=>{const g=groups[Number(b.dataset.editMedSchedule)];close();openMedicationScheduleModal(g?.names?.[0]||'')});
    $('#addMedicationFromReconcile').onclick=()=>{close();openMedicationScheduleModal('')};
    $('#saveMedicationReconciliation').onclick=async()=>{let catalog=[...(state.actions.catalog||[])];for(let i=0;i<groups.length;i++){const g=groups[i],a=g.primary;if(!a)continue;const active=$(`[data-med-status="${i}"]`).value==='active',freq=$(`[data-med-frequency="${i}"]`).value,adherence=$(`[data-med-adherence="${i}"]`).value;const schedule=freq==='daily'?{type:'daily'}:freq==='weekly'?{type:'weekly',days:Array.isArray(a.schedule?.days)&&a.schedule.days.length?a.schedule.days:[new Date().getDay()]}:null;catalog=catalog.map(x=>x.id===a.id?{...x,active,schedule,adherence_mode:adherence,reconciled_at:new Date().toISOString(),discontinued_at:active?null:(x.discontinued_at||new Date().toISOString())}:x);if(!active)await ZekeData.saveFactor({type:'medication_status',status:'active',priority:'normal',summary:`${g.names[0]} marked stopped/discontinued`,canonical_medication_id:g.canonical,effective_at:new Date().toISOString(),provenance:{source:'medication-reconciliation'}})}state.actions=await ZekeData.saveActions({...state.actions,catalog});state.preferences={...state.preferences,medication_checkin_last_completed:medicationCheckinKey(),medication_checkin_last_result:'reconciled'};await ZekeData.savePreferences(state.preferences);close();await refreshData();render();showToast('Medication reconciliation saved.');};
  }

  function todayActionsHTML() {
    const catalog=(state.actions.catalog||[]).filter(a=>a.active!==false&&actionScheduleMatches(a)&&!(a.kind==='medication'&&a.adherence_mode==='schedule_only')),medCheckin=medicationCheckinDue()?`<button class="action-tile monthly-checkin-action" data-medication-checkin="review"><span class="action-icon">↻</span><strong>Medication check-in</strong><small>Monthly review</small><span class="action-state">Review</span></button>`:'';
    if(!catalog.length&&!medCheckin)return '';
    return `<section class="panel today-panel"><div class="section-head"><div><span class="tile-kicker">TODAY</span><h2>Today</h2><p>Only things that are actually due or need action today.</p></div>${catalog.length+Boolean(medCheckin)>2?'<div class="scroll-controls"><button id="actionsLeft" aria-label="Scroll actions left">‹</button><button id="actionsRight" aria-label="Scroll actions right">›</button></div>':''}</div><div class="actions-strip" id="actionsStrip">${medCheckin}${catalog.map(a=>{const event=a.kind==='medication'?medicationDoseToday(a):null,done=actionDoneToday(a),assumed=event?.provenance?.source==='scheduled-adherence-assumption';return `<button class="action-tile ${done?'done':''} ${assumed?'assumed':''}" data-action-id="${esc(a.id)}"><span class="action-icon">${a.icon||'✓'}</span><strong>${esc(a.label||a.name)}</strong><small>${esc(a.subtitle||scheduleText(a.schedule))}</small><span class="action-state">${assumed?'Assumed from schedule · tap to correct':done?'✓ Confirmed today':'Log or confirm'}</span></button>`}).join('')}</div></section>`;
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
    return `<section class="dashboard-status"><span class="status-dot"></span><strong>Data current</strong><span>${latest?`Last evidence ${esc(fmtDate(latest,{month:'short',day:'numeric'}))}`:'No verified evidence yet'}</span>${issues?`<button type="button" class="text-action" data-open-reviews>💬 ${issues} Question${issues===1?'':'s'} for You</button>`:''}</section>`;
  }

  function recentHealthHTML() {
    const categories=['measurement','lab','sleep','medication','potential_health_event','symptom','life_event','cycle','nutrition_exposure','diagnosis','condition'];
    const rows=dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e)&&categories.includes(semanticCategory(e)))).sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at)).slice(0,7);
    if(!rows.length) return '';
    return `<section class="panel recent-evidence"><div class="section-head"><div><h2>Recent Health Record</h2><p>Confirmed sleep and other health records appear here immediately after save.</p></div><button class="text-action" data-route="health">View all</button></div><div class="evidence-list">${rows.map(e=>`<article><time>${esc(fmtDate(e.timestamp||e.recorded_at,{month:'short',day:'numeric'}))}</time><div><strong>${esc(humanEvent(e))}</strong><small>${esc(semanticCategory(e).replaceAll('_',' '))} · ${esc(e.provenance?.sheet||e.provenance?.file||e.provenance?.source||'ZEKE')}</small></div><div class="recent-record-actions"><button class="text-action" data-edit-recent-event="${esc(e.id)}">Edit</button><button class="text-action danger" data-remove-event="${esc(e.id)}">Remove</button></div></article>`).join('')}</div></section>`;
  }

  function dataVisibilityHTML() {
    const inv=repositoryInventory(); const cats=Object.entries(inv.counts).sort((a,b)=>b[1]-a[1]);
    const metrics=Object.entries(inv.metricCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);
    return `<section class="panel data-visibility"><div class="section-head"><div><h2>What ZEKE can currently see</h2><p>A read-only inventory of the connected repository. This does not alter your records.</p></div><button class="text-action" data-route="settings">Inspect imports</button></div><div class="inventory-grid"><div><h3>Record types</h3>${cats.map(([k,v])=>`<span><b>${esc(v)}</b>${esc(k.replaceAll('_',' '))}</span>`).join('')||'<p>No loaded records.</p>'}</div><div><h3>Recognized health metrics</h3>${metrics.map(([k,v])=>`<span><b>${esc(v)}</b>${esc(METRICS[k]?.label||k.replaceAll('_',' '))}</span>`).join('')||'<p>No chartable metrics recognized.</p>'}</div></div>${inv.unrecognized.length?`<p class="audit-note">${inv.unrecognized.length} health/lab record${inv.unrecognized.length===1?'':'s'} loaded but missing a usable metric name or numeric value. They remain untouched and can be reviewed in Health or Settings.</p>`:''}</section>`;
  }

  function insightKey(i){return String(i.evidenceKey||i.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
  function healthCalendarFollowups(){
    const now=Date.now(),windowStart=now-48*3600e3;
    return state.calendar.filter(e=>{const t=new Date(e.start).getTime(),title=String(e.title||'').toLowerCase();return t>=windowStart&&t<=now&&/\b(pt|physical therapy|therapy|doctor|medical|lab|blood draw|allergy|immunotherapy|shot|appointment)\b/.test(title);}).map(event=>{const title=String(event.title||'Health appointment');let target='health context';if(/pt|physical therapy/.test(title.toLowerCase()))target='attendance, shoulder symptoms, exercises, restrictions, or follow-up tasks';else if(/allergy|immunotherapy|shot/.test(title.toLowerCase()))target='whether the injection occurred and any reaction';else if(/lab|blood draw/.test(title.toLowerCase()))target='whether the draw occurred and whether results are available';return {event,title:`Your ${title} may have produced a useful health update`,text:`ZEKE can record ${target}. The calendar entry alone is not proof that the appointment occurred.`};});
  }

  function thinkingHTML() {
    const dismissed=new Set(state.preferences.dismissedInsights||[]),allText=state.events.map(e=>e.raw_text||'').join(' ').toLowerCase(),candidates=[];
    const friendlyDiscovery=d=>{const title=String(d.title||'').toLowerCase(),summary=d.summary||'';if(/parsing|extraction|structure/.test(title+summary))return {icon:'↗',title:'Some workout entries are missing details needed for progress tracking',text:'ZEKE found older workout information that may not include consistent load, repetitions, effort, or pain fields.',actionLabel:'Review workout history',action:'workout-review',evidenceKey:d.id||d.title};return {icon:'↗',title:d.title||'A recorded pattern may be worth reviewing',text:d.summary||'Open the supporting records, limitations, and possible next steps.',actionLabel:'Review evidence',action:'pattern',evidenceKey:d.id||d.title};};
    for(const d of state.discoveries.slice(0,4))candidates.push(friendlyDiscovery(d));
    const workoutCount=state.events.filter(e=>recordIsActive(e)&&isWorkoutEvent(e)).length,sleepCount=allMetricSeries('sleep_duration').length;
    if(workoutCount>=2&&sleepCount<3)candidates.unshift({icon:'☾',title:'Sleep is not yet available for meaningful recovery comparisons',text:`ZEKE has ${workoutCount} workout records but only ${sleepCount} confirmed sleep observation${sleepCount===1?'':'s'}. More sleep entries would make recovery comparisons possible.`,actionLabel:'Log sleep',action:'log-sleep',evidenceKey:'sleep-undertracked'});
    const calendarPrompt=healthCalendarFollowups()[0];if(calendarPrompt)candidates.unshift({icon:'▣',title:calendarPrompt.title,text:calendarPrompt.text,actionLabel:'Tell ZEKE how it went',action:'calendar-followup',calendarEvent:calendarPrompt.event,evidenceKey:`calendar-${calendarPrompt.event.id||calendarPrompt.event.start}`});
    if(/nurri|protein shake/.test(allText)&&!(state.actions.catalog||[]).some(a=>/nurri|protein shake/i.test(a.label||'')))candidates.push({icon:'🥤',title:'Protein-shake mentions are not yet connected to a tracking preference',text:'Confirming whether you want these logged automatically could reduce repeated entry.',actionLabel:'Set tracking preference',thinking:'track-shakes'});
    if(/creatine/.test(allText)&&!(state.actions.catalog||[]).some(a=>/creatine/i.test(a.label||'')))candidates.push({icon:'＋',title:'Creatine use may need a tracking preference',text:'ZEKE can ask once about schedule and whether it belongs in Today’s Actions or only in history.',actionLabel:'Set tracking preference',thinking:'track-creatine'});
    const deduped=[],seen=new Set();for(const i of candidates){const k=insightKey(i);if(!seen.has(k)&&!dismissed.has(k)){seen.add(k);deduped.push(i)}}
    if(!deduped.length)deduped.push({icon:'💡',title:'No new cross-domain action is supported right now',text:'ZEKE will refresh this area when meaningful new data, calendar context, or a resolved question creates a useful next step.'});
    const stamp=state.preferences.insightsRefreshedAt?fmtDate(state.preferences.insightsRefreshedAt,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'after meaningful new data';
    return `<section class="panel thinking-panel"><div class="section-head"><div><h2>Insights</h2><p>ZEKE surfaces a small changing set of useful observations when the evidence supports them. Updated ${esc(stamp)}.</p></div><button class="secondary compact" id="refreshInsights">Refresh insights</button></div><div class="insight-list">${deduped.slice(0,4).map(i=>`<article class="thought-row"><span class="thought-icon">${i.icon}</span><div><strong>${esc(i.title)}</strong><p>${esc(i.text)}</p><div class="thought-actions">${i.actionLabel&&i.action?`<button class="text-action" data-insight-action="${esc(i.action)}" data-insight-key="${esc(i.evidenceKey||i.title)}" ${i.calendarEvent?`data-calendar-event="${esc(JSON.stringify({id:i.calendarEvent.id||'',title:i.calendarEvent.title,start:i.calendarEvent.start,location:i.calendarEvent.location||''}))}"`:''}>${esc(i.actionLabel)}</button>`:''}${i.thinking?`<button class="text-action" data-thinking="${i.thinking}">${esc(i.actionLabel||'Set preference')}</button>`:''}<button class="text-action muted-action" data-dismiss-insight="${esc(insightKey(i))}">Dismiss</button></div></div></article>`).join('')}</div></section>`;
  }

  function upcomingHTML() {
    const rows=state.calendar.slice(0,4).map(e=>`<div class="calendar-row"><div class="calendar-date"><strong>${esc(fmtDate(e.start,{month:'short',day:'numeric'}))}</strong><span>${esc(fmtTime(e.start))}</span></div><div><strong>${esc(e.title)}</strong>${e.location?`<small>${esc(e.location)}</small>`:''}</div></div>`).join('');
    return `<section class="panel upcoming-panel"><div class="section-head"><div><span class="tile-kicker">WHAT'S COMING UP?</span><h2>Upcoming</h2><p>Dates and times are explicit; scheduling is not proof of completion.</p></div><button class="text-action" data-route="calendar">View calendar</button></div>${rows||'<div class="empty-inline">No connected upcoming events.</div>'}</section>`;
  }

  function dashboardPrivateSummaryHTML(){
    const medicationActions=(state.actions.catalog||[]).filter(a=>a.active!==false&&String(a.kind||a.type||'').toLowerCase()==='medication');
    const medicationEvents=dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e)&&semanticCategory(e)==='medication'));
    const meds=[...new Map([...medicationActions.map(a=>[String(a.label||a.name||'Medication').toLowerCase(),{name:a.label||a.name||'Medication',detail:a.subtitle||scheduleText(a.schedule)}]),...medicationEvents.map(e=>{const st=e.structured||{};const name=st.medication_name||st.name||humanEvent(e);return [String(name).toLowerCase(),{name,detail:[st.dose,st.unit,st.frequency].filter(Boolean).join(' ')}]})]).values()];
    const conditionFactors=state.factors.filter(f=>f.status!=='dismissed'&&/diagnos|condition|medical history|health history/i.test(String(f.type||'')+' '+String(f.summary||f.answer||f.value||'')));
    const conditionEvents=dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e)&&/diagnos|condition|medical_history|health_history/.test(semanticCategory(e))));
    const conditions=[...new Map([...conditionFactors.map(f=>[String(f.summary||f.answer||f.value||f.type).toLowerCase(),{name:f.summary||f.answer||f.value||f.type,detail:'Remembered context'}]),...conditionEvents.map(e=>{const name=e.structured?.diagnosis||e.structured?.condition||e.structured?.summary||humanEvent(e);return [String(name).toLowerCase(),{name,detail:fmtDate(e.timestamp||e.recorded_at,{month:'short',day:'numeric',year:'numeric'})}]})]).values()];
    const section=(id,label,items)=>`<details class="private-summary" data-private-summary="${id}" ${state.expandedPrivateSummaries.has(id)?'open':''}><summary><span>${label}</span><b>${items.length} ${items.length===1?'item':'items'}</b><small>Tap to reveal</small></summary><div class="private-summary-body">${items.length?items.slice(0,12).map(x=>`<div><strong>${esc(x.name)}</strong>${x.detail?`<span>${esc(x.detail)}</span>`:''}</div>`).join(''):`<p>No ${label.toLowerCase()} are currently available.</p>`}<button class="text-action" data-health-section="${id}">Review in Health</button></div></details>`;
    return `<section class="panel private-health-panel"><div class="section-head"><div><h2>Private health summary</h2><p>Medication and condition names remain collapsed until you reveal them.</p></div></div><div class="private-summary-grid">${section('medications','Medications',meds)}${section('conditions','Diagnoses & conditions',conditions)}</div></section>`;
  }

  function evidenceById(id){return EVIDENCE.find(item=>item.id===id)}
  function evidenceCardsHTML(items=[]){
    return `<div class="research-evidence-list">${items.filter(Boolean).map(item=>`<article class="research-evidence-card"><span>${esc(item.year)} · Research source</span><strong>${esc(item.title)}</strong><p>${esc(item.summary)}</p><div class="research-evidence-actions"><a class="secondary compact external-evidence-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Open PubMed</a>${item.full_text?`<a class="text-action external-evidence-link" href="${esc(item.full_text)}" target="_blank" rel="noopener noreferrer">Read full text</a>`:''}</div></article>`).join('')}</div>`;
  }
  function activityFeaturePrefix(name){return `activity_${String(normalizedActivityName(name)||name||'activity').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')}_`}
  function metricKeyFromLabel(key){
    const normalized=String(key||'').toLowerCase().trim();
    if(METRICS[normalized])return canonicalMetric(normalized);
    const entry=Object.entries(METRICS).find(([id,meta])=>normalized===String(meta.label||'').toLowerCase()||normalized.includes(String(meta.label||'').toLowerCase()));
    return entry?canonicalMetric(entry[0]):canonicalMetric(normalized.replace(/\s+/g,'_'));
  }
  function allPatternCandidates(){
    const data=pairedDailyData(),keys=[...new Set(data.flatMap(d=>Object.keys(d)))].filter(k=>k!=='day'),out=[];
    for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
      const c=correlation(data.map(d=>d[keys[i]]),data.map(d=>d[keys[j]]));
      if(c)out.push({a:keys[i],b:keys[j],...c});
    }
    return out.sort((a,b)=>Math.abs(b.r)-Math.abs(a.r));
  }
  function relationshipCandidatesForActivity(name){
    const prefix=activityFeaturePrefix(name);
    return allPatternCandidates().filter(p=>(p.a.startsWith(prefix)||p.b.startsWith(prefix))&&!(p.a.startsWith(prefix)&&p.b.startsWith(prefix)));
  }
  function relationshipResearch(keys=[]){
    const text=keys.join(' ').toLowerCase(),items=[];
    if(/sleep/.test(text))items.push(evidenceById('sleep-performance-2022'));
    if(/activity_.*_(load|reps|sessions)|strength|resistance/.test(text))items.push(evidenceById('acsm-resistance-2026'));
    return [...new Map(items.filter(Boolean).map(x=>[x.id,x])).values()];
  }
  function recommendationEvidence(name,rec){
    if(name==='sleep')return [evidenceById('sleep-performance-2022')];
    const sessions=workoutGroups({respectRange:false}).get(name)||[],category=canonicalActivityCategory(name,sessions.at(-1)?.activity_profile||activityProfile(name));
    if(category==='strength')return [evidenceById('acsm-resistance-2026'),evidenceById('acsm-progression-2009')];
    if(/sleep|recovery/i.test(`${rec?.title||''} ${rec?.suggestion||''}`))return [evidenceById('sleep-performance-2022')];
    return [evidenceById('acsm-resistance-2026')];
  }
  function openRecentEventEditModal(eventId){
    const event=state.events.find(e=>e.id===eventId);if(!event)return;$('#recentEventEditModal')?.remove();const st=event.structured||{},metric=canonicalMetric(metricId(event)),meta=METRICS[metric]||{label:humanEvent(event),unit:st.unit||''},date=String(event.timestamp||event.recorded_at||'').slice(0,10)||activeDay(),numeric=st.value!=null&&Number.isFinite(Number(st.value));
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="recentEventEditModal"><div class="direct-entry-card"><div class="section-head"><div><span class="tile-kicker">RECENT HEALTH RECORD</span><h2>Edit ${esc(meta.label)}</h2><p>The original record remains traceable through ZEKE’s correction history.</p></div><button class="icon-btn" id="closeRecentEdit">×</button></div><form id="recentEventEditForm" class="direct-entry-form"><label>Date<input id="recentEditDate" type="date" value="${esc(date)}" required></label>${numeric?`<label>Value (${esc(st.unit||meta.unit||'')})<input id="recentEditValue" type="number" step="0.01" value="${escAttr(st.value)}" required></label>`:''}<label class="wide">Notes<textarea id="recentEditNotes" rows="3">${esc(event.raw_text||st.notes||'')}</textarea></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelRecentEdit">Cancel</button><button type="submit" class="primary">Save correction</button></div></form></div></div>`);
    const close=()=>$('#recentEventEditModal')?.remove();$('#closeRecentEdit').onclick=close;$('#cancelRecentEdit').onclick=close;
    $('#recentEventEditForm').onsubmit=async e=>{e.preventDefault();const nextDate=$('#recentEditDate').value,notes=$('#recentEditNotes').value.trim(),patch={raw_text:notes,timestamp:`${nextDate}T12:00:00`};if(numeric)patch.structured={...st,value:Number($('#recentEditValue').value),notes};else patch.structured={...st,notes};await ZekeData.updateEvent(eventId,patch,{appendCorrection:true,correctionNote:'Edited from Recent Health Record'});close();await refreshData();render();showToast('Health record updated.')};
  }

  function openCoachEvidence(name){
    const isSleep=name==='sleep',sessions=isSleep?[]:(workoutGroups({respectRange:false}).get(name)||[]),rec=isSleep?null:activityRecommendation(name,sessions),articles=recommendationEvidence(name,rec);
    const title=isSleep?'Why sleep tracking may matter for training':`${name}: research & evidence`;
    const trigger=isSleep?`ZEKE found repeated workout records but too few confirmed sleep observations to evaluate recovery alongside training.`:(rec?.rationale||'ZEKE used the most recent comparable activity records.');
    const interpretation=isSleep?'The recommendation is to collect more sleep data before changing training—not to assume that sleep caused any performance change.':(rec?.suggestion||'No activity recommendation is available.');
    const productRule=rec?.last?.pain>=4?'ZEKE’s 4/10 pain flag is a conservative product rule, not a clinical diagnostic threshold. It is intended to slow automatic progression and prompt review of technique, recovery, and professional guidance.':rec?.last?.weight?'ZEKE treats this as a cautious progression consideration, not a prescription. Your recorded response, technique, effort, pain, recovery, and clinician/PT restrictions remain more important than a generic progression rule.':'This recommendation mainly asks for comparable records; it does not claim a physiological treatment effect.';
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="coachEvidenceModal"><div class="direct-entry-card evidence-review-card coach-evidence-card"><div class="section-head"><div><span class="tile-kicker">COACH CONSIDERATION</span><h2>${esc(title)}</h2><p>Personal data and published research are shown separately so the strength of each claim is clear.</p></div><button class="icon-btn" id="closeCoachEvidence" aria-label="Close evidence">×</button></div><section><h3>What in your data triggered this</h3><p>${esc(trigger)}</p></section><section><h3>How ZEKE interpreted it</h3><p>${esc(interpretation)}</p><p class="evidence-caution">${esc(productRule)}</p></section><section><h3>Research basis</h3>${evidenceCardsHTML(articles)}</section><section><h3>Limits</h3><p>These publications describe group-level evidence. They do not establish what caused a change in your record, provide medical clearance, or override pain, injury restrictions, or clinician/PT advice.</p></section><div class="direct-entry-actions"><button class="primary" id="closeCoachEvidenceBottom">Done</button></div></div></div>`);
    const close=()=>$('#coachEvidenceModal')?.remove();$('#closeCoachEvidence')?.addEventListener('click',close);$('#closeCoachEvidenceBottom')?.addEventListener('click',close);$('#coachEvidenceModal')?.addEventListener('click',e=>{if(e.target.id==='coachEvidenceModal')close()});
  }
  function openActivityRelationshipReview(name){
    const sessions=workoutGroups({respectRange:false}).get(name)||[],relationships=relationshipCandidatesForActivity(name).slice(0,5),prefix=activityFeaturePrefix(name),testedMetrics=[...new Set(relationships.flatMap(p=>[p.a,p.b]).filter(k=>!k.startsWith(prefix)))],recent=sessions.filter(x=>!x.placeholder).slice(-8).reverse(),articles=relationshipResearch(relationships.flatMap(p=>[p.a,p.b]));
    const summary=relationships.length?`ZEKE found ${relationships.length} tested relationship${relationships.length===1?'':'s'} with at least five paired dates. These are exploratory associations, not causes.`:`ZEKE does not yet have at least five comparable paired dates for a tested relationship involving ${name}.`;
    const rows=relationships.map(p=>{const activityKey=p.a.startsWith(prefix)?p.a:p.b,other=p.a.startsWith(prefix)?p.b:p.a;return `<article class="relationship-result"><strong>${esc(prettyVar(activityKey))} and ${esc(prettyVar(other))}</strong><span>${p.r>0?'Moved in the same direction':'Moved in opposite directions'} · r = ${p.r.toFixed(2)} · ${p.n} paired days</span><small>Exploratory screening only; no causal conclusion.</small></article>`}).join('');
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="activityRelationshipModal"><div class="direct-entry-card evidence-review-card activity-relationship-card"><div class="section-head"><div><span class="tile-kicker">ACTIVITY RELATIONSHIPS</span><h2>${esc(name)}</h2><p>${esc(summary)}</p></div><button class="icon-btn" id="closeActivityRelationship" aria-label="Close relationship review">×</button></div><section><h3>Relationships tested for this activity</h3>${rows||`<div class="specific-empty-state"><strong>No tested relationship yet for ${esc(name)}.</strong><p>Record this activity on at least five dates and include a consistent activity metric—such as load, duration, RPE, or pain—alongside sleep or another health measure. ZEKE will not substitute an unrelated generic pattern.</p></div>`}</section><section><h3>Recent ${esc(name)} records</h3>${recent.length?`<div class="evidence-review-list">${recent.map(x=>`<div><time>${esc(fmtDate(x.date,{month:'short',day:'numeric',year:'numeric'}))}</time><span>${esc([x.weight!=null?`${x.weight} lb`:null,x.duration_min!=null?`${x.duration_min} min`:null,x.reps!=null?`${x.reps} reps`:null,x.rpe!=null?`RPE ${x.rpe}`:null,x.pain!=null?`pain ${x.pain}/10`:null].filter(Boolean).join(' · ')||'Activity recorded')}</span><small>Comparable activity history</small></div>`).join('')}</div>`:'<p>No dated records are available for this activity.</p>'}</section>${testedMetrics.length?`<section><h3>Context included</h3><p>${esc(testedMetrics.map(prettyVar).join(', '))}</p></section>`:''}${articles.length?`<section><h3>Related research context</h3><p>Published evidence is background context and is not proof of your personal relationship.</p>${evidenceCardsHTML(articles)}</section>`:''}<section><h3>Limits</h3><p>Same-day pairing can miss delayed effects. Missing data, changing technique, medications, illness, and other variables can affect the result. Correlation does not establish causation.</p></section><div class="direct-entry-actions"><button class="secondary" id="closeActivityRelationshipBottom">Close</button><button class="primary" id="openActivityPatternLab">Open Pattern Lab</button></div></div></div>`);
    const close=()=>$('#activityRelationshipModal')?.remove();$('#closeActivityRelationship')?.addEventListener('click',close);$('#closeActivityRelationshipBottom')?.addEventListener('click',close);$('#activityRelationshipModal')?.addEventListener('click',e=>{if(e.target.id==='activityRelationshipModal')close()});$('#openActivityPatternLab')?.addEventListener('click',()=>{close();openPatternLab(name)});
  }
  function openEvidenceReview(key){
    const raw=String(key||'Evidence review'),normalized=raw.toLowerCase();
    const discovery=state.discoveries.find(d=>String(d.id||'')===raw||String(d.title||'').toLowerCase()===normalized);
    let patterns=[],title=discovery?.title||raw;
    if(raw.startsWith('pattern:')){
      const [,a,b]=raw.split(':');patterns=allPatternCandidates().filter(p=>(p.a===a&&p.b===b)||(p.a===b&&p.b===a)).slice(0,1);if(patterns[0])title=`${prettyVar(patterns[0].a)} and ${prettyVar(patterns[0].b)}`;
    }else{
      const metric=metricKeyFromLabel(raw);patterns=allPatternCandidates().filter(p=>p.a===metric||p.b===metric).slice(0,5);if(METRICS[metric])title=`${METRICS[metric].label} relationships`;
    }
    const primary=patterns[0],summary=discovery?.summary||(primary?`${prettyVar(primary.a)} and ${prettyVar(primary.b)} ${primary.r>0?'moved in the same direction':'moved in opposite directions'} across ${primary.n} paired dates.`:`ZEKE does not yet have a tested relationship specifically tied to ${title}.`),limitations=discovery?.limitations||'This is exploratory screening. Timing, missing records, measurement differences, and third variables may explain a pattern. It does not establish causation.';
    const exactTerms=[...new Set(patterns.flatMap(p=>[p.a,p.b]).map(prettyVar))],related=dedupeDisplayEvents(state.events.filter(recordIsActive)).filter(e=>{const text=(humanEvent(e)+' '+(e.raw_text||'')).toLowerCase();return exactTerms.some(term=>term.toLowerCase().split(/\W+/).filter(x=>x.length>3).some(x=>text.includes(x)));}).slice(0,8),articles=relationshipResearch(patterns.flatMap(p=>[p.a,p.b]));
    const results=patterns.map(p=>`<article class="relationship-result"><strong>${esc(prettyVar(p.a))} and ${esc(prettyVar(p.b))}</strong><span>${p.r>0?'Same direction':'Opposite directions'} · r = ${p.r.toFixed(2)} · ${p.n} paired days</span><small>Exploratory association, not causation</small></article>`).join('');
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="evidenceReviewModal"><div class="direct-entry-card evidence-review-card"><div class="section-head"><div><span class="tile-kicker">SPECIFIC EVIDENCE REVIEW</span><h2>${esc(title)}</h2><p>${esc(summary)}</p></div><button class="icon-btn" id="closeEvidenceReview" aria-label="Close evidence review">×</button></div><section><h3>Tested relationships</h3>${results||`<div class="specific-empty-state"><strong>No calculated relationship is attached to this item.</strong><p>ZEKE needs at least five paired dates with comparable values. It will not redirect this link to an unrelated generic result.</p></div>`}</section><section><h3>What ZEKE observed</h3><p>${esc(summary)}</p></section><section><h3>Limitations</h3><p>${esc(String(limitations))}</p></section><section><h3>Related dated records</h3>${related.length?`<div class="evidence-review-list">${related.map(e=>`<div><time>${esc(fmtDate(e.timestamp||e.recorded_at,{month:'short',day:'numeric',year:'numeric'}))}</time><span>${esc(humanEvent(e))}</span><small>${esc(e.provenance?.source||e.provenance?.sheet||'ZEKE record')}</small></div>`).join('')}</div>`:'<p>No directly matched dated records were found for this specific item.</p>'}</section>${articles.length?`<section><h3>Research context</h3><p>Published evidence is separate from your personal pattern.</p>${evidenceCardsHTML(articles)}</section>`:''}<div class="direct-entry-actions"><button class="secondary" id="closeEvidenceReviewBottom">Close</button><button class="primary" id="openFullPatternLab">Open Pattern Lab</button></div></div></div>`);
    const close=()=>$('#evidenceReviewModal')?.remove();$('#closeEvidenceReview')?.addEventListener('click',close);$('#closeEvidenceReviewBottom')?.addEventListener('click',close);$('#evidenceReviewModal')?.addEventListener('click',e=>{if(e.target.id==='evidenceReviewModal')close()});$('#openFullPatternLab')?.addEventListener('click',()=>{close();openPatternLab(title)});
  }

  function dayKey(value){const d=new Date(value);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function loggingStreak(){
    const days=new Set(state.events.filter(recordIsActive).map(e=>dayKey(e.timestamp||e.recorded_at)).filter(Boolean)),today=new Date();let streak=0;
    for(let i=0;i<3650;i++){const d=new Date(today);d.setDate(d.getDate()-i);if(days.has(dayKey(d)))streak++;else if(i===0)continue;else break;}
    return {streak,total:days.size};
  }
  function dashboardStoryCardsHTML(){
    const streak=loggingStreak(),workouts=dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e)&&isWorkoutEvent(e))).sort((a,b)=>new Date(b.timestamp||0)-new Date(a.timestamp||0)),recentWorkout=workouts[0],exercise=recentWorkout?workoutStructured(recentWorkout).exercise:'',knowledge=window.ZekeKnowledgeBase?.get?.(exercise),discovery=state.discoveries.find(d=>!['superseded','dismissed','resolved','stale'].includes(String(d.status||'').toLowerCase()));
    const niceTitle=streak.streak>=2?`${streak.streak}-day logging streak`:(workouts.length?`${workouts.length} workout${workouts.length===1?'':'s'} preserved`:'Your record is ready');
    const niceText=streak.streak>=2?'You have recorded at least one verified item on each of these consecutive days.':workouts.length?'Every workout remains linked to its date and source.':'Log one useful observation; ZEKE will not fill the dashboard with invented data.';
    const thinkTitle=discovery?.title||'No personal pattern is strong enough yet';
    const thinkText=discovery?.text||discovery?.summary||'ZEKE will show a personal observation here only when dated evidence supports it.';
    const learnTitle=knowledge?`A useful cue for ${knowledge.name}`:'Progress comes from repeatable training';
    const learnText=knowledge?.mindMuscle?.[0]||'ACSM’s current resistance-training position stand emphasizes that moving from no resistance training to consistent training produces the largest practical benefit; exact programming can then be individualized.';
    return `<section class="dashboard-insights-panel panel"><div class="section-head"><div><span class="tile-kicker">INSIGHTS</span><h2>${esc(discovery?thinkTitle:niceTitle)}</h2><p>${esc(discovery?thinkText:niceText)}</p></div><span class="story-icon">${discovery?'◎':'✦'}</span></div>${discovery?`<button class="text-action" data-insight-key="${esc(discovery.id||discovery.title)}" data-insight-action="pattern">Review evidence</button>`:knowledge?`<button class="text-action" data-form-guide="${esc(knowledge.name)}">${esc(learnTitle)}</button>`:'<span class="story-limit">ZEKE will surface a different useful observation as evidence develops.</span>'}</section>`;
  }
  function currentWeekKey(){const d=new Date(),day=(d.getDay()+6)%7,monday=new Date(d);monday.setDate(d.getDate()-day);return dayKey(monday)}
  function weeklyPlan(){const stored=state.preferences?.fitness?.weekly_plan||{};return stored.week_key===currentWeekKey()?stored:{week_key:currentWeekKey(),gym_remaining:null,home_remaining:null,duration:45,home_environment:'home-dumbbells',selected_routine_id:''}}
  function generatedWeeklyRoutine(plan=weeklyPlan()){const chosen=window.ZekeKnowledgeBase?.routines?.find(r=>r.id===plan.selected_routine_id);return chosen||window.ZekeKnowledgeBase?.routineFor?.({gym:Number(plan.gym_remaining)||0,home:Number(plan.home_remaining)||0,duration:Number(plan.duration)||45,environment:plan.home_environment})}
  function weeklyPlanHTML(){
    const plan=weeklyPlan(),routine=generatedWeeklyRoutine(plan),answered=plan.gym_remaining!=null||plan.home_remaining!=null;
    const choices=value=>[0,1,2,3,4].map(n=>`<button class="plan-choice ${Number(value)===n?'active':''}" data-plan-value="${n}">${n}</button>`).join('');
    const sessions=routine?.sessions?.slice(0,4).map(s=>`<span>${esc(s.name)}</span>`).join('')||'';
    return `<section class="panel weekly-plan-card"><div class="section-head"><div><span class="tile-kicker">THIS WEEK</span><h2>Lightweight workout planning</h2><p>Tell ZEKE what you realistically expect—empty calendar time is never treated as commitment.</p></div><button class="text-action" id="openWeeklyPlan">Edit details</button></div><div class="weekly-plan-questions"><div><strong>How many more gym workouts?</strong><div class="plan-choices" data-plan-kind="gym">${choices(plan.gym_remaining)}</div></div><div><strong>How many home dumbbell / Bowflex workouts?</strong><div class="plan-choices" data-plan-kind="home">${choices(plan.home_remaining)}</div></div></div>${answered&&routine?`<div class="weekly-plan-result"><div><small>Suggested structure</small><strong>${esc(routine.name)}</strong><p>${esc(routine.note||'')}</p></div><div class="routine-session-chips">${sessions}</div><button class="secondary compact" id="openRoutineLibrary">Review routines</button></div>`:'<div class="weekly-plan-empty">Two quick answers are enough. ZEKE will suggest a structure without assuming your remaining availability.</div>'}</section>`;
  }
  function truthfulRecentActivityHTML(){
    const rows=dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e)&&(isWorkoutEvent(e)||semanticCategory(e)==='sleep'||['measurement','lab'].includes(semanticCategory(e))))).sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at)).slice(0,6);
    return `<section class="panel truthful-recent"><div class="section-head"><div><span class="tile-kicker">RECENT ACTIVITY</span><h2>What was actually recorded</h2><p>No decorative routes or interpolated trends.</p></div><button class="text-action" data-route="health">Open history</button></div><div class="truthful-recent-list">${rows.map(e=>{const cat=semanticCategory(e),w=isWorkoutEvent(e)?workoutStructured(e):null,k=w?window.ZekeKnowledgeBase?.get?.(w.exercise):null,details=w?[w.weight!=null?`${w.weight} ${w.weight_unit||'lb'}`:'',w.reps!=null&&w.sets!=null?`${w.reps} × ${w.sets}`:'',w.duration_min!=null?`${w.duration_min} min`:'',w.distance_mi!=null?`${w.distance_mi} mi`:'',w.steps!=null?`${w.steps} steps`:''].filter(Boolean).join(' · '):humanEvent(e);return `<article><span class="recent-kind">${esc(cat.replaceAll('_',' '))}</span><div><strong>${esc(w?.exercise||humanEvent(e))}</strong><p>${esc(details||'Recorded without additional numeric details')}</p><small>${esc(fmtDate(e.timestamp||e.recorded_at,{month:'short',day:'numeric',year:'numeric'}))} · ${esc(e.provenance?.source||e.provenance?.file||'ZEKE')}</small></div>${k?`<button class="text-action" data-form-guide="${esc(k.name)}">Guide</button>`:''}</article>`}).join('')||'<div class="empty-inline">No recent verified records.</div>'}</div></section>`;
  }
  function reviewStatusHTML(repairs=repairCandidates()){
    return `<section class="panel review-status-card ${repairs.length?'needs-review':'clear'}"><div><span class="review-status-icon">${repairs.length?'!':'✓'}</span><div><small>DATA INTEGRITY</small><strong>${repairs.length?`${repairs.length} item${repairs.length===1?'':'s'} need review`:'Current scan is clear'}</strong><p>${repairs.length?'ZEKE has evidence and a recommended action for each item.':'No known duplicate, import-artifact, impossible-zero, or stale-question issue is currently active.'}</p></div></div><button class="${repairs.length?'primary':'secondary'} compact" data-route="data-integrity">${repairs.length?'Review now':'View audit'}</button></section>`;
  }
  function timelineSnapshotHTML(){
    const all=window.ZekeLongitudinal?.timeline?.(state.events,state.calendar)||[],today=new Date(),start=new Date(today);start.setDate(start.getDate()-10);const end=new Date(today);end.setDate(end.getDate()+3);
    const rows=all.filter(x=>{const d=new Date(x.start);return d>=start&&d<=end&&x.kind!=='medication'}),groups=[
      {key:'workout',label:'Workouts & activity',match:x=>['workout','exercise','activity','fitness'].includes(x.kind)},
      {key:'health',label:'Health context',match:x=>['illness','injury','symptom','observation','vaccination','immunotherapy','context'].includes(x.kind)},
      {key:'recovery',label:'Sleep & recovery',match:x=>['sleep','recovery'].includes(x.kind)},
      {key:'calendar',label:'Calendar',match:x=>x.kind==='calendar'}
    ].map(g=>({...g,items:rows.filter(g.match)})).filter(g=>g.items.length);
    const days=Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d}),dayKey=d=>window.ZekeLongitudinal?.day?.(d)||'';
    return `<section class="panel timeline-snapshot"><div class="section-head"><div><span class="tile-kicker">WHAT'S BEEN HAPPENING?</span><h2>Timeline Snapshot</h2><p>Recent and upcoming events shown together so timing is visible. Markers represent recorded data only.</p></div><button class="text-action" data-route="calendar">Open full timeline</button></div>${groups.length?`<div class="timeline-axis">${days.map((d,i)=>`<span class="${dayKey(d)===dayKey(today)?'today':''}">${i%2===0?d.toLocaleDateString(undefined,{month:'short',day:'numeric'}):''}</span>`).join('')}</div><div class="timeline-rows">${groups.map(g=>`<div class="timeline-row"><strong>${esc(g.label)}</strong><div class="timeline-track">${days.map(d=>{const items=g.items.filter(x=>x.day===dayKey(d));return `<span class="timeline-day ${dayKey(d)===dayKey(today)?'today':''}">${items.map(x=>`<i class="timeline-marker kind-${esc(x.kind)}" title="${esc(x.label)} · ${esc(fmtDate(x.start,{month:'short',day:'numeric'}))}"></i>`).join('')}</span>`}).join('')}</div></div>`).join('')}</div><div class="timeline-legend"><span><i class="timeline-marker kind-workout"></i> recorded event</span><span>Medication details are excluded from this dashboard view by default.</span></div>`:`<div class="timeline-empty"><strong>No timeline events in this window.</strong><span>ZEKE will not invent activity to fill the visualization.</span></div>`}</section>`;
  }
  function dashboardHTML() {
    const repairs=repairCandidates();
    return `${coverageHTML()}<div class="dashboard-v3">${dashboardStoryCardsHTML()}${healthGlanceHTML(8)}${timelineSnapshotHTML()}<div class="dashboard-main-grid"><div>${weeklyPlanHTML()}${coachHTML()}</div><div>${todayActionsHTML()}${upcomingHTML()}</div></div>${trendPanelHTML()}<div class="dashboard-lower-grid">${truthfulRecentActivityHTML()}${reviewStatusHTML(repairs)}</div></div>`;
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
    const rows=dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e))).filter(filterFn).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    if(!rows.length) return `<div class="empty-page">No records yet.</div>`;
    return `<div class="table-wrap"><table><thead><tr>${columns.map(c=>`<th>${esc(c.label)}</th>`).join('')}<th>Actions</th></tr></thead><tbody>${rows.map(e=>`<tr>${columns.map(c=>`<td>${esc(c.value(e))}</td>`).join('')}<td><div class="table-actions"><button class="text-action" data-edit-event="${esc(e.id)}">Review / edit</button><button class="text-action danger" data-remove-event="${esc(e.id)}">Remove</button></div></td></tr>`).join('')}</tbody></table></div>`;
  }

  function healthMetricCategory(id){
    if(id==='sleep_duration')return 'sleep';
    return ['a1c','ldl','hdl','triglycerides','total_cholesterol','apob','lpa','glucose','average_glucose'].includes(id)?'labs':'measurements';
  }
  function healthDomainRecordsHTML(tab){
    const categories={symptoms:['symptom','life_event','cycle','nutrition_exposure','potential_health_event'],medications:['medication'],nutrition:['nutrition','nutrition_exposure'],conditions:['diagnosis','condition','medical_history','health_history']};
    const labels={symptoms:['Symptoms & life context','Symptoms, exposures, stress, relationships, and other health context belong inside Health.'],medications:['Medications & supplements','Schedules, confirmed doses, injections, supplements, and corrections.'],nutrition:['Nutrition','Food and exposure records that the user chooses to track.'],conditions:['Diagnoses & conditions','Private health context remains collapsed on the Dashboard and managed here.']};
    const wanted=categories[tab]||[];
    const filter=e=>wanted.includes(semanticCategory(e)||e.category)||(tab==='nutrition'&&['protein','food','nutrition'].includes(e.structured?.intake_type));
    const button=tab==='medications'?'<button class="primary" data-context-medication="">+ Log medication or supplement</button>':tab==='symptoms'?'<button class="primary" data-health-log="symptom">+ Record symptom or event</button>':tab==='nutrition'?'<button class="primary" data-quick-log="intake">+ Log intake</button>':tab==='conditions'?'<button class="primary" id="addConditionBtn">+ Add condition</button>':'';
    return `${tab==='medications'?`<section class="panel medication-checkin-panel"><div class="section-head"><div><h2>Medication & supplement review</h2><p>A lightweight monthly check-in for changes, not a dose-completion shortcut.</p></div></div>${monthlyMedicationCheckinHTML()}</section>`:''}<section class="panel health-domain-panel"><div class="section-head"><div><h2>${labels[tab][0]}</h2><p>${labels[tab][1]}</p></div>${button}</div>${recordsTable(filter,[{label:'Date',value:e=>fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})},{label:'Type',value:e=>(semanticCategory(e)||e.category).replaceAll('_',' ')},{label:'Summary',value:e=>humanEvent(e)},{label:'Source',value:e=>e.provenance?.sheet||e.provenance?.file||e.provenance?.source||'ZEKE'}])}</section>`;
  }

  function healthPageHTML() {
    const metricIds=[...new Set([...availableMetrics(),'sleep_duration'])];
    const usage=new Map();for(const e of state.events.filter(recordIsActive)){const id=canonicalMetric(metricId(e));if(id)usage.set(id,(usage.get(id)||0)+1)}
    const frequent=[...metricIds].sort((a,b)=>(usage.get(b)||0)-(usage.get(a)||0)).slice(0,8),healthFavorites=new Set(storedStringArray('zeke.health.metricFavorites.v1'));
    const metricTab=['frequent','favorites','measurements','labs','sleep'].includes(state.healthTab);
    const shown=state.healthTab==='frequent'?frequent:state.healthTab==='favorites'?dashboardMetricOrder(metricIds).filter(id=>healthFavorites.has(id)):metricIds.filter(id=>healthMetricCategory(id)===state.healthTab);
    const cards=shown.map(id=>`<div class="health-library-item ${state.expandedHealthMetric===id?'is-expanded':''}" data-health-metric="${esc(id)}" tabindex="0" role="button" aria-expanded="${state.expandedHealthMetric===id}"><button class="favorite-button health-favorite ${healthFavorites.has(id)?'active':''}" data-favorite-health="${esc(id)}" aria-label="${healthFavorites.has(id)?'Remove from':'Pin to'} Dashboard" title="${healthFavorites.has(id)?'Remove from Dashboard':'Pin to Dashboard'}">★</button>${metricCard(id,true)}${state.expandedHealthMetric===id?`<div class="health-detail-extension"><p><strong>${id==='sleep_duration'?'Sleep history':'Detailed view'}</strong></p><p>${id==='sleep_duration'?'Sleep is stored atomically with start and end times, duration, quality, notes, provenance, and wake-up date.':'Review the dated trend, source, reference context, and related insights above.'}</p><div class="detail-actions"><button class="text-action" data-log-metric="${esc(id)}">+ Log ${id==='sleep_duration'?'sleep':'new value'}</button><button class="text-action" data-pattern-focus="${esc(METRICS[id]?.label||id)}">Review relationships</button></div></div>`:''}</div>`).join('');
    const tabs=[['frequent','Overview'],['favorites','Dashboard'],['measurements','Measurements'],['sleep','Sleep'],['labs','Labs'],['symptoms','Symptoms'],['medications','Medications'],['nutrition','Nutrition'],['conditions','Conditions']];
    const library=metricTab?`<section class="panel health-library-panel"><div class="section-head"><div><h2>${state.healthTab==='favorites'?'Dashboard metrics':'Health library'}</h2><p>${state.healthTab==='favorites'?'Pin metrics here and reorder them in Dashboard settings.':'Open compact summaries into dated trends, provenance, and context.'}</p></div></div><div class="health-library-grid">${cards||'<div class="empty-inline">No verified items in this view yet.</div>'}</div></section>`:healthDomainRecordsHTML(state.healthTab);
    return `<div class="page-head"><div><h1>Health</h1><p>Your umbrella for measurements, sleep, labs, symptoms, medications, nutrition, conditions, and health context.</p></div></div><div class="health-domain-tabs" role="tablist">${tabs.map(([id,label])=>`<button class="library-tab ${state.healthTab===id?'active':''}" data-health-tab="${id}" role="tab" aria-selected="${state.healthTab===id}">${label}</button>`).join('')}</div>${library}<section class="panel"><div class="section-head"><div><h2>Recent Health Record</h2><p>Sleep and other confirmed records appear here immediately after save. Remove creates a reversible audit correction rather than silently erasing history.</p></div></div>${recordsTable(e=>['measurement','lab','sleep','medication','potential_health_event','symptom','life_event','cycle','nutrition_exposure','diagnosis','condition'].includes(semanticCategory(e)),[{label:'Date',value:e=>fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'})},{label:'Type',value:e=>semanticCategory(e).replaceAll('_',' ')},{label:'Summary',value:e=>humanEvent(e)},{label:'Source',value:e=>e.provenance?.sheet||e.provenance?.file||e.provenance?.source||'ZEKE'}])}</section>`;
  }

  function rangeLabel() {
    const labels={week:'Last 7 days',month:'Last 31 days',quarter:'Last 3 months','6months':'Last 6 months',year:'Last year',all:'All recorded time'};
    if(state.range==='all') return labels.all;
    const days=RANGE_DAYS[state.range]||31;
    const end=new Date(); const start=new Date(end); start.setDate(end.getDate()-days+1);
    return `${labels[state.range]} · ${start.toLocaleDateString(undefined,{month:'short',day:'numeric'})}–${end.toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;
  }

  function fitnessRangeHTML({compact=false}={}) {
    const options=[['week','Week'],['month','Month'],['quarter','3 months'],['6months','6 months'],['year','Year'],['all','All']];
    if(compact)return `<label class="fitness-inline-period"><span>History period</span><select class="fitness-range-select-control" aria-label="Fitness history period">${options.map(([id,label])=>`<option value="${id}" ${state.range===id?'selected':''}>${label}</option>`).join('')}</select></label>`;
    return '';
  }

  const ACTIVITY_TAXONOMY=[
    {id:'strength',label:'Strength',profiles:['strength']},
    {id:'cardio',label:'Cardio',profiles:['cardio']},
    {id:'mobility',label:'Mobility & Stretching',profiles:['mobility']},
    {id:'rehab',label:'Rehabilitation/PT',profiles:['rehab']},
    {id:'recovery',label:'Recovery',profiles:['recovery']},
    {id:'sport',label:'Sport & Recreation',profiles:['sport']},
    {id:'functional',label:'Chores & Functional Activity',profiles:['functional']}
  ];
  function canonicalActivityCategory(name,profile){
    const n=String(name||'').toLowerCase(),p=String(profile||'').toLowerCase();
    if(p==='rehab'||/rehab|physical therapy|\bpt\b/.test(n))return 'rehab';
    if(p==='functional'||/yard work|housework|repair|moving|shovel|mow|chores?/.test(n))return 'functional';
    if(p==='sport'||/ski|basketball|tennis|sport|recreation|hike/.test(n))return 'sport';
    if(p==='cardio'||/walk|stair|climb|bike|cycle|tread|ellipt|rower|run|cardio/.test(n))return 'cardio';
    if(p==='mobility'||/stretch|mobility|range of motion|yoga/.test(n))return 'mobility';
    if(p==='recovery'||/massage|recovery|foam roll|sauna/.test(n))return 'recovery';
    return 'strength';
  }
  function activityCategoryLabel(id){return ACTIVITY_TAXONOMY.find(x=>x.id===id)?.label||id}
  function activitySummaryFacts(first,last,category,name=''){
    const value=(v,suffix='')=>v!=null&&v!==''?`${v}${suffix}`:'Not recorded',stair=/stair|climbmill/i.test(name);
    if(category==='cardio'){
      if(stair)return [`First duration: ${value(first.duration_min,' min')}`,`Latest stair steps: ${value(last.stair_steps??last.steps)}`,`Latest duration: ${value(last.duration_min,' min')}`];
      return [`First duration: ${value(first.duration_min,' min')}`,`Latest distance: ${value(last.distance_mi,' mi')}`,`Latest duration: ${value(last.duration_min,' min')}`];
    }
    if(category==='mobility'||category==='recovery')return [`First: ${value(first.duration_min,' min')}`,`Latest: ${value(last.duration_min,' min')}`,`Discomfort: ${value(last.pain_after??last.pain)}`];
    if(category==='rehab')return [`Latest duration: ${value(last.duration_min,' min')}`,`Pain before: ${value(last.pain_before)}`,`Pain after: ${value(last.pain_after)}`];
    if(category==='sport'||category==='functional')return [`Latest duration: ${value(last.duration_min,' min')}`,`Distance: ${value(last.distance_mi,' mi')}`,`RPE: ${value(last.rpe)}`];
    const loadChange=first.weight&&last.weight?last.weight-first.weight:null;
    return [`First: ${value(first.weight,' lb')}`,`Change: ${loadChange==null?'Not enough data':`${loadChange>0?'+':''}${loadChange} lb`}`,`Latest: ${value(last.reps,' reps')} × ${value(last.sets,' sets')}`];
  }

  function familySummaryFacts(arr=[],category='strength',name=''){
    const rows=arr.filter(x=>!x.placeholder),last=rows.at(-1);
    if(category!=='strength'||!last)return activitySummaryFacts(arr[0]||{},last||arr.at(-1)||{},category,name);
    const loaded=rows.filter(x=>x.weight!=null&&x.weight!==''&&Number.isFinite(Number(x.weight))&&Number(x.weight)>0),latestLoaded=loaded.at(-1),variation=latestLoaded?.variation_name||name,exact=loaded.filter(x=>activityKey(x.variation_name||name)===activityKey(variation)),firstExact=exact[0],lastExact=exact.at(-1),parts=[],totalVariations=new Set(rows.map(x=>x.variation_name||name)).size,loadedVariations=new Set(loaded.map(x=>x.variation_name||name)).size;
    if(lastExact){const short=String(variation||'').replace(String(name||''),'').replace(/[—–-]+/g,' ').replace(/\s+/g,' ').trim()||variation;parts.push(`Latest loaded: ${lastExact.weight} lb · ${short}`)}
    else parts.push('No confirmed load yet');
    parts.push(`Loaded variations: ${loadedVariations}${totalVariations!==loadedVariations?` of ${totalVariations}`:''}`);
    if(firstExact&&lastExact&&exact.length>=2){const change=Number(lastExact.weight)-Number(firstExact.weight);parts.push(`Same-variation change: ${change>=0?'+':''}${change} lb`)}
    else parts.push(exact.length===1?'1 comparable load session':'Comparable change: Not enough data');
    return parts;
  }

  function activityDetailColumns(category,name=''){
    const common=[['date','Date',x=>x.date?fmtDate(x.date,{month:'short',day:'numeric'}):'—']],stair=/stair|climbmill/i.test(name),walking=/walk|treadmill|run/i.test(name);
    const defs={
      strength:[...common,['load','Load',x=>x.weight!=null?`${x.weight} lb`:'—'],['reps','Reps × sets',x=>x.reps!=null||x.sets!=null?`${x.reps??'—'} × ${x.sets??'—'}`:'—'],['rpe','RPE',x=>x.rpe??'—'],['pain','Pain',x=>x.pain_after??x.pain_during??x.pain??'—'],['technique','Technique',x=>x.technique||'—']],
      cardio:[...common,['duration','Duration',x=>x.duration_min!=null?`${x.duration_min} min`:'—'],...(stair?[[ 'stairSteps','Stair steps',x=>x.stair_steps??x.steps??'—' ]]:walking?[[ 'walkingSteps','Walking steps',x=>x.ambulatory_steps??x.steps??'—' ]]:[[ 'steps','Activity steps',x=>x.steps??'—' ]]),['distance','Distance',x=>x.distance_mi!=null?`${x.distance_mi} mi`:'—'],['level','Level / intensity',x=>x.level??x.rpe??'—'],['heartRate','Average HR',x=>x.average_hr!=null?`${x.average_hr} bpm`:'—'],['pace','Pace',x=>x.pace??'—']],
      rehab:[...common,['duration','Duration',x=>x.duration_min!=null?`${x.duration_min} min`:'—'],['reps','Reps × sets',x=>x.reps!=null||x.sets!=null?`${x.reps??'—'} × ${x.sets??'—'}`:'—'],['painBefore','Pain before',x=>x.pain_before??'—'],['painAfter','Pain after',x=>x.pain_after??'—'],['context','PT / injury context',x=>x.injury_context||x.technique||'—']],
      mobility:[...common,['duration','Duration',x=>x.duration_min!=null?`${x.duration_min} min`:'—'],['area','Area / focus',x=>x.body_area||'—'],['pain','Pain',x=>x.pain_after??x.pain??'—']],
      recovery:[...common,['duration','Duration',x=>x.duration_min!=null?`${x.duration_min} min`:'—'],['area','Target area',x=>x.body_area||'—'],['notes','Notes',x=>x.notes||'—']],
      sport:[...common,['duration','Duration',x=>x.duration_min!=null?`${x.duration_min} min`:'—'],['distance','Distance',x=>x.distance_mi!=null?`${x.distance_mi} mi`:'—'],['rpe','RPE',x=>x.rpe??'—']],
      functional:[...common,['duration','Duration',x=>x.duration_min!=null?`${x.duration_min} min`:'—'],['rpe','RPE',x=>x.rpe??'—'],['notes','Notes',x=>x.notes||'—']]
    };
    return defs[category]||defs.strength;
  }

  function activityDetailTable(arr,category,name=''){
    const rows=arr.slice(-6).reverse();
    const columns=activityDetailColumns(category,name).filter((column,index)=>index===0||rows.some(x=>column[2](x)!=='—'));
    return `<div class="table-wrap"><table class="activity-specific-table"><thead><tr>${columns.map(c=>`<th>${esc(c[1])}</th>`).join('')}</tr></thead><tbody>${rows.map(x=>`<tr>${columns.map(c=>`<td>${esc(c[2](x))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function activeGoals(){return state.factors.filter(f=>f.type==='goal'&&!['dismissed','resolved','unknown'].includes(f.status)).sort((a,b)=>new Date(b.updated_at||b.created_at||0)-new Date(a.updated_at||a.created_at||0))}
  function fitnessGoalsHTML(){
    const goals=activeGoals();
    const rows=goals.map(g=>`<article class="goal-row"><div><span>${esc(String(g.domain||'fitness').replaceAll('_',' '))}</span><strong>${esc(g.summary||g.goal_statement||'Goal')}</strong><small>${esc([g.baseline?`Baseline: ${g.baseline}`:'',g.target?`Target: ${g.target}${g.unit?` ${g.unit}`:''}`:'',g.target_date?`By ${fmtDate(`${g.target_date}T12:00:00`,{month:'short',day:'numeric',year:'numeric'})}`:''].filter(Boolean).join(' · ')||'No numeric target or date required')}</small></div><div class="goal-actions"><button class="secondary compact" data-edit-goal="${esc(g.id)}">Edit</button><button class="text-action danger" data-remove-goal="${esc(g.id)}">Remove</button></div></article>`).join('');
    return `<section class="panel fitness-goals-panel"><div class="section-head"><div><span class="tile-kicker">GOALS</span><h2>Your goals</h2><p>ZEKE can help make a goal measurable and review it against verified context. AI review is advisory and never saves or changes a goal.</p></div><button class="secondary compact" id="addGoalBtn">${goals.length?'+ Add goal':'Set a goal'}</button></div><div class="goal-list">${rows||'<div class="empty-inline">No goals are saved yet. Start with the outcome you care about; a target number is optional.</div>'}</div></section>`;
  }

  function openGoalModal(goalId=''){
    $('#goalModal')?.remove();const existing=state.factors.find(f=>f.id===goalId&&f.type==='goal')||{},aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);let reviewText=existing.ai_review||'';
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="goalModal"><div class="direct-entry-card"><div class="section-head"><div><h2>${existing.id?'Edit goal':'Set a goal'}</h2><p>Describe the outcome first. Targets and dates are optional, and ZEKE should not invent them.</p></div><button class="icon-btn" id="closeGoalModal" aria-label="Close">×</button></div><form id="goalForm" class="direct-entry-form"><label>Domain<select id="goalDomain"><option value="fitness" ${existing.domain!=='health'?'selected':''}>Fitness</option><option value="health" ${existing.domain==='health'?'selected':''}>Health</option></select></label><label class="wide">What would you like to accomplish?<input id="goalStatement" value="${esc(existing.goal_statement||existing.summary||'')}" required placeholder="e.g., build strength safely while protecting my shoulder"></label><label>Current baseline (optional)<input id="goalBaseline" value="${esc(existing.baseline||'')}" placeholder="e.g., 45 lb seated row"></label><label>Target (optional)<input id="goalTarget" value="${esc(existing.target||'')}" placeholder="e.g., 60"></label><label>Unit (optional)<input id="goalUnit" value="${esc(existing.unit||'')}" placeholder="lb, sessions/week, minutes"></label><label>Target date (optional)<input id="goalDate" type="date" value="${esc(existing.target_date||'')}"></label><label class="wide">Constraints or context (optional)<textarea id="goalNotes" rows="2" placeholder="Pain limits, PT guidance, schedule, or why this matters">${esc(existing.notes||'')}</textarea></label><section class="goal-review wide" id="goalReview" aria-live="polite">${reviewText?`<strong>Prior advisory review</strong><p>${esc(reviewText)}</p>`:`<strong>Goal review</strong><p>${aiAvailable?'ZEKE can ask a connected AI to check clarity, measurability, and relevant caution while keeping final control with you.':'No AI is connected. ZEKE can still check whether the goal has a clear outcome, baseline, target, and timeline.'}</p>`}</section><div class="direct-entry-actions wide"><button type="button" class="secondary" id="reviewGoalBtn">${aiAvailable?'Review with ZEKE + AI':'Check goal structure'}</button><button type="button" class="secondary" id="cancelGoalModal">Cancel</button><button type="submit" class="primary">Save goal</button></div></form></div></div>`);
    const close=()=>$('#goalModal')?.remove(),read=()=>({domain:$('#goalDomain').value,statement:$('#goalStatement').value.trim(),baseline:$('#goalBaseline').value.trim(),target:$('#goalTarget').value.trim(),unit:$('#goalUnit').value.trim(),target_date:$('#goalDate').value||'',notes:$('#goalNotes').value.trim()});
    $('#closeGoalModal').onclick=close;$('#cancelGoalModal').onclick=close;
    $('#reviewGoalBtn').onclick=async()=>{
      const goal=read(),out=$('#goalReview'),button=$('#reviewGoalBtn');if(!goal.statement){out.innerHTML='<strong>Add the outcome first</strong><p>ZEKE needs a goal statement before it can review the structure.</p>';return;}
      const structural=[];if(!goal.baseline)structural.push('A baseline would make progress easier to interpret.');if(!goal.target)structural.push('A numeric target is optional; add one only when it is meaningful.');if(!goal.target_date)structural.push('A target date is optional; consider a review date instead of an arbitrary deadline.');
      if(!aiAvailable){reviewText=`${structural.join(' ')||'The goal has an outcome, baseline, target, and timeline.'} No connected AI reviewed clinical reasonableness.`;out.innerHTML=`<strong>Structural review</strong><p>${esc(reviewText)}</p>`;return;}
      button.disabled=true;button.textContent='Reviewing…';out.innerHTML='<strong>Advisory review in progress</strong><p>Nothing is being saved or changed.</p>';
      try{
        const context=state.factors.filter(f=>['injury_context','personal_history','goal'].includes(f.type)&&f.id!==existing.id&&!['dismissed','unknown'].includes(f.status)).slice(0,8).map(f=>({type:f.type,summary:f.summary||f.answer||''}));
        const evidence=availableMetrics().slice(0,8).map(id=>{const latest=latestMetric(id);return latest?{metric:METRICS[id]?.label||id,value:latest.value,unit:latest.unit,date:latest.date}:null}).filter(Boolean);
        const result=await ZekeAIRouter.consult({role:'goal_planning_consultant',userGoal:'Review a user-proposed health or fitness goal for clarity, measurability, feasibility, and safety. Do not diagnose, prescribe, or change the goal. State limitations and ask for clinical clearance when appropriate.',latestUserText:JSON.stringify(goal),activeQuestion:'What considerations would improve this goal without inventing a target?',history:[],evidence:[...context,...evidence],allowedOutcomes:['ANSWER_USER','ASK_CLARIFICATION','NO_ACTION']});
        reviewText=result.userResponse||result.clarificationQuestion||result.answer||'The AI did not identify a specific change.';out.innerHTML=`<strong>Advisory review · ${esc(result.provider||'connected AI')}</strong><p>${esc(reviewText)}</p><small>This review is not medical clearance and does not change the goal.</small>`;
      }catch(error){reviewText=`AI review was unavailable: ${error?.message||error}. ${structural.join(' ')}`;out.innerHTML=`<strong>AI review unavailable</strong><p>${esc(reviewText)}</p>`;}
      button.disabled=false;button.textContent='Review again';
    };
    $('#goalForm').onsubmit=async event=>{event.preventDefault();const goal=read();if(!goal.statement)return;await ZekeData.saveFactor({...existing,type:'goal',status:'active',domain:goal.domain,summary:goal.statement,goal_statement:goal.statement,baseline:goal.baseline,target:goal.target,unit:goal.unit,target_date:goal.target_date,notes:goal.notes,ai_review:reviewText||null,provenance:{...(existing.provenance||{}),source:'direct-goal-entry'}});close();await refreshData();render();showToast(existing.id?'Goal updated in your workspace.':'Goal saved in your workspace.');};
  }

  function activityPreferenceMap(){
    try{return JSON.parse(localStorage.getItem('zeke.fitness.activityPreferences.v1')||'{}')||{}}catch(_){return {}}
  }
  function activityPreference(name){return activityPreferenceMap()[normalizedActivityName(name).toLowerCase()]||'neutral'}
  function activityPreferenceLabel(value){return ({more:'Recommend more',less:'Recommend less',exclude:'Excluded',neutral:'Balanced'})[value]||'Balanced'}
  function activityPreferenceControls(name){
    const current=activityPreference(name),options=[['more','More'],['neutral','Balanced'],['less','Less'],['exclude','Exclude']];
    return `<div class="activity-preference-control" role="group" aria-label="Recommendation preference for ${esc(name)}"><span>Recommendation preference</span><div>${options.map(([value,label])=>`<button type="button" class="preference-chip ${current===value?'active':''}" data-activity-preference="${esc(name)}" data-preference-value="${value}" aria-pressed="${current===value}">${label}</button>`).join('')}</div><small>${current==='exclude'?'ZEKE will keep your history but will not suggest this activity.':current==='less'?'ZEKE will de-emphasize this activity unless it is specifically relevant.':current==='more'?'ZEKE may prioritize this activity when it fits your goals, equipment, and health context.':'ZEKE will treat this activity normally.'}</small></div>`;
  }

  function fitnessPageHTML() {
    const groups=workoutFamilyGroups();
    const rows=dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e)&&isWorkoutEvent(e)&&hasMeaningfulWorkout(e)&&inFitnessRange(e.timestamp||e.recorded_at))).sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at));
    const userCustomActivities=customActivityLibrary(),knowledgeActivities=(window.ZekeKnowledgeBase?.catalog||[]).map(a=>({name:a.name,profile:a.profile,equipment:a.equipment,movement:a.movement,knowledge:true})),customActivities=[...knowledgeActivities,...userCustomActivities],favorites=new Set(JSON.parse(localStorage.getItem('zeke.fitness.activityFavorites.v1')||localStorage.getItem('zeke-activity-favorites')||'[]')),canonicalCatalogIdentity=a=>{const raw=String(a?.name||'').trim(),category=canonicalActivityCategory(raw,a?.profile||activityProfile(raw));if(category==='strength'){const id=activityIdentity(raw,{equipment:a?.equipment||''});return {...id,family:id.family||normalizedActivityName(raw)}}return {family:normalizedActivityName(raw),variation:raw,equipment:a?.equipment||'unknown',load_basis:activityLoadBasis(a?.equipment||'',raw,'')}},customNames=new Set(userCustomActivities.map(a=>canonicalCatalogIdentity(a).family.toLowerCase())),preferences=activityPreferenceMap();
    for(const a of customActivities){const id=canonicalCatalogIdentity(a),canonical=id.family||normalizedActivityName(a.name);if(!groups.has(canonical))groups.set(canonical,[{weight:null,reps:null,sets:null,duration_min:null,date:null,activity_profile:a.profile,placeholder:true,equipment:id.equipment||a.equipment,movement_pattern:a.movement,variation_name:id.variation||a.name,family:canonical,load_basis:id.load_basis}]);}
    const recentSort=(a,b)=>{const ad=a.arr.at(-1)?.date?new Date(a.arr.at(-1).date).getTime():0,bd=b.arr.at(-1)?.date?new Date(b.arr.at(-1).date).getTime():0;return bd-ad||b.arr.length-a.arr.length||a.name.localeCompare(b.name)};
    let entries=[...groups.entries()].filter(([name,arr])=>name!=='Workout'||arr.some(x=>!x.placeholder&&(x.weight||x.reps||x.duration_min||x.steps))).map(([name,arr])=>({name,arr,profile:arr.at(-1).activity_profile||activityProfile(name),category:canonicalActivityCategory(name,arr.at(-1).activity_profile||activityProfile(name))})).sort(recentSort);
    if(state.activityTab==='favorites'){const favoriteEntries=entries.filter(x=>favorites.has(x.name));entries=(favoriteEntries.length?favoriteEntries:entries).slice(0,10);}
    else if(state.activityTab==='recent')entries=entries.slice(0,10);
    else if(state.activityTab==='strength'||state.activityTab==='cardio')entries=entries.filter(x=>x.category===state.activityTab);
    else if(state.activityTab==='mobility_pt')entries=entries.filter(x=>['mobility','rehab','recovery'].includes(x.category));
    else if(state.activityTab==='sports')entries=entries.filter(x=>x.category==='sport');
    else if(state.activityTab==='custom')entries=entries.filter(x=>customNames.has(normalizedActivityName(x.name).toLowerCase()));
    const query=String(state.activitySearch||'').trim().toLowerCase();if(query)entries=entries.filter(x=>x.name.toLowerCase().includes(query)||activityCategoryLabel(x.category).toLowerCase().includes(query));
    const cards=entries.map(({name,arr,profile,category})=>{const first=arr[0],last=arr.at(-1),latestComparable=category==='strength'?[...arr].reverse().find(x=>x.weight!=null&&x.weight!==''&&Number.isFinite(Number(x.weight))&&Number(x.weight)>0):last,latestVariation=latestComparable?.variation_name||last?.variation_name||name,exactSessions=workoutGroups().get(latestVariation)||arr,rec=activityRecommendation(latestVariation,exactSessions),spark=familyVariationChart(arr,category,name),facts=familySummaryFacts(arr,category,name),expanded=state.expandedActivity===name;
      return `<article class="fitness-progress-card ${expanded?'is-expanded':''}" tabindex="0" role="button" aria-expanded="${expanded}" data-activity-name="${esc(name)}" data-activity-search="${esc(`${name} ${activityCategoryLabel(category)}`.toLowerCase())}"><div class="fitness-card-head"><div><strong>${esc(name)}</strong><span>${last.placeholder?'Not logged yet':`${arr.length} session${arr.length===1?'':'s'}`} · ${esc(activityProfileLabel(profile))}${activityPreference(name)!=='neutral'?` · ${esc(activityPreferenceLabel(activityPreference(name)))}`:''}</span></div><div class="activity-card-tools"><button class="favorite-button ${favorites.has(name)?'active':''}" data-favorite-activity="${esc(name)}" aria-label="${favorites.has(name)?'Remove from':'Add to'} favorites">★</button><b class="fitness-latest-value">${last.weight!=null?`${last.weight} lb`:last.duration_min!=null?`${last.duration_min} min`:''}</b></div></div>${spark}<div class="fitness-facts">${facts.map(f=>`<span>${esc(f)}</span>`).join('')}</div>${expanded?'':`<p class="fitness-recommendation"><strong>Consider (${esc(rec.confidence)} confidence):</strong> ${esc(rec.suggestion)}</p>`}${expanded?`<div class="activity-expanded-detail"><div class="activity-detail-heading"><div><span class="activity-category-label">${esc(activityCategoryLabel(category))}</span><h3>Recent activity details</h3></div><button class="icon-btn" data-collapse-activity="${esc(name)}" aria-label="Collapse activity">×</button></div>${activityDetailTable(arr,category,name)}<div class="coach-rec"><strong>Coach consideration</strong><p>${esc(rec.suggestion)}</p><small>${esc(rec.rationale)}</small><button class="secondary compact coach-evidence-trigger" data-coach-evidence="${esc(name)}">Why this? Research & evidence</button></div>${activityPreferenceControls(name)}<div class="detail-actions"><button class="secondary compact" data-quick-exercise="${esc(name)}">+ Log activity</button><button class="secondary compact" data-form-guide="${esc(name)}">Form guide</button><button class="text-action" data-activity-pattern="${esc(name)}">Review relationships</button></div></div>`:`<div class="activity-open-hint">Click for details and coaching</div>`}</article>`}).join('');
    const views=[['favorites','Favorites'],['recent','Recent'],['strength','Strength'],['cardio','Cardio'],['mobility_pt','Mobility/PT'],['sports','Sports'],['custom','Custom'],['all','All']];
    const fitnessPatternVars=new Set(['workout_load','workout_volume','workout_duration','exercise','steps','stair_steps','distance_mi','rpe','pain','sleep_duration','resting_hr','heart_rate','weight']);
    const topPattern=patternCandidates().find(p=>fitnessPatternVars.has(String(p.a))||fitnessPatternVars.has(String(p.b)))||null;
    const workoutHistorySummary=e=>{const w=workoutStructured(e),p=activityProfile(w.exercise,w.activity_profile);if(p==='strength')return [w.weight!=null?`${w.weight} ${w.weight_unit||'lb'}`:'',w.reps!=null||w.sets!=null?`${w.reps??'—'} × ${w.sets??'—'}`:''].filter(Boolean).join(' · ')||'Strength details not recorded';if(p==='cardio'){const stair=/stair|climbmill/i.test(w.exercise);return [w.duration_min!=null?`${w.duration_min} min`:'',stair&&(w.stair_steps??w.steps)!=null?`${w.stair_steps??w.steps} stair steps`:'',!stair&&w.distance_mi!=null?`${w.distance_mi} mi`:'',w.average_hr!=null?`${w.average_hr} bpm avg`:''].filter(Boolean).join(' · ')||'Cardio details not recorded';}return [w.duration_min!=null?`${w.duration_min} min`:'',w.reps!=null?`${w.reps} reps`:'',w.pain_after!=null?`pain ${w.pain_after}/10`:''].filter(Boolean).join(' · ')||'Activity details not recorded';};const historyRows=state.fitnessReviewIncomplete?rows.filter(workoutMissingRelevantDetails):rows;const history=historyRows.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Activity</th><th>Relevant details</th><th>Source</th><th>Actions</th></tr></thead><tbody>${historyRows.map(e=>{const w=workoutStructured(e);return `<tr><td>${esc(fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${esc(w.exercise||'Workout')}</td><td>${esc(workoutHistorySummary(e))}</td><td>${esc(e.provenance?.sheet||e.provenance?.file||e.provenance?.source||'ZEKE')}</td><td><div class="table-actions"><button class="text-action" data-edit-workout="${esc(e.id)}">Edit</button><button class="text-action danger" data-remove-event="${esc(e.id)}">Remove</button></div></td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty-inline">No ${state.fitnessReviewIncomplete?'flagged incomplete':'workout'} records are available in this period.</div>`;
    const trainingIntel=window.ZekeTrainingIntelligence?.summaryHTML?.(state.factors,state.events)||'';
    return `<div class="page-head"><div><h1>Fitness</h1><p>Explore, plan, perform, and review training. Opening an exercise or workout never creates a record by itself.</p></div><div class="page-head-actions fitness-log-actions"><button class="primary" id="fitnessBuildBtn">✦ Plan a workout</button><button class="secondary" id="manageRoutinesBtn">Routines</button><button class="text-action" id="fitnessLogBtn">Log something already done</button><button class="text-action" id="addActivityBtn">Manage activity types</button><button class="text-action" id="reviewExerciseIdentitiesBtn">Review old exercise names</button></div></div>${fitnessRangeHTML()}<div class="fitness-workspace">${trainingIntel}<div class="fitness-primary">${coachHTML()}<section class="panel fitness-insight-card compact-empty"><div class="section-head"><div><span class="tile-kicker">FITNESS INSIGHTS</span><h2>${esc(topPattern?`${prettyVar(topPattern.a)} and ${prettyVar(topPattern.b)}`:'Recovery relationships need more data')}</h2><p>${topPattern?esc(`${topPattern.r>0?'They moved in the same direction':'They moved in opposite directions'} across ${topPattern.n} paired days. Open the dated evidence before changing training.`):'Record repeated activity plus sleep, effort, or pain before ZEKE can show a specific relationship.'}</p></div></div><button class="secondary compact" data-pattern-focus="${esc(topPattern?`pattern:${topPattern.a}:${topPattern.b}`:'Fitness overview')}">${topPattern?'Review this evidence':'Review data requirements'}</button></section></div>${fitnessGoalsHTML()}<section class="panel fitness-library-panel"><div class="section-head fitness-library-head"><div><span class="tile-kicker">MY TRAINING</span><h2>Activity & exercise library</h2><p>Each tile is one canonical exercise. Equipment variations keep separate histories and appear as separate lines.</p></div>${fitnessRangeHTML({compact:true})}</div><div class="activity-library-controls"><label class="activity-library-selector">View<select id="activityLibrarySelect" aria-label="Activity library view">${views.map(([id,label])=>`<option value="${id}" ${state.activityTab===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="activity-library-search">Search activities<input id="activityLibrarySearch" type="search" value="${esc(state.activitySearch)}" placeholder="Search by activity or type" autocomplete="off"></label></div>${state.activityTab==='favorites'&&!favorites.size?'<div class="favorites-fallback-note">No favorites have been selected yet, so ZEKE is showing your most recent activities. Tap ★ to build your Favorites view.</div>':''}<div class="fitness-progress-grid">${cards||'<div class="empty-inline" id="activityLibraryEmpty">No activities in this view yet.</div>'}</div><div class="empty-inline" id="activityLibraryNoMatches" hidden>No activities match this search.</div></section><section class="panel fitness-history-panel"><div class="section-head"><div><h2>${state.fitnessReviewIncomplete?'Incomplete workout entries':'Workout history'}</h2><p>${state.fitnessReviewIncomplete?'Only entries missing activity-relevant details are shown.':`Showing ${esc(rangeLabel().toLowerCase())}. Each row shows only fields relevant to that activity type.`}</p></div>${state.fitnessReviewIncomplete?'<button class="secondary compact" id="showAllWorkoutHistory">Show all history</button>':''}</div>${history}</section></div>`;
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

  function calendarPotentiallyRelevant(event={}){
    const text=`${event.title||''} ${event.location||''} ${event.description||''}`.toLowerCase();
    const strong=/allergy|immunotherapy|shot|vaccine|vaccination|physical therapy|\bpt\b|doctor|dr\.|medical|dental|dentist|dermat|cardio|orthop|mri|x-ray|xray|dexa|body composition|blood draw|lab|colonoscopy|procedure|surgery|therapy|massage|chiro|acupuncture|donat(?:e|ion)|workout|gym|training|sleep study|appointment/.test(text);
    return strong;
  }
  function calendarReviewDecision(id){return state.preferences.calendar_relevance_reviews?.[id]?.decision||''}
  function calendarHealthMatch(event={}){
    const day=String(event.start||'').slice(0,10),title=String(event.title||'').toLowerCase();
    return state.events.find(e=>recordIsActive(e)&&String(e.timestamp||e.recorded_at||'').slice(0,10)===day&&(()=>{const hay=`${e.raw_text||''} ${e.structured?.summary||''} ${e.structured?.event_type||''} ${e.structured?.medication_name||''} ${e.structured?.exercise||''}`.toLowerCase();const words=title.split(/[^a-z0-9]+/).filter(w=>w.length>3);return words.length&&words.some(w=>hay.includes(w));})())||null;
  }
  function calendarReviewCandidates(){
    return (state.calendarReview||[]).filter(calendarPotentiallyRelevant).sort((a,b)=>new Date(b.start)-new Date(a.start));
  }
  function calendarPageHTML() {
    const rows=state.calendar.map(e=>`<div class="calendar-full-row"><div class="calendar-date"><strong>${esc(fmtDate(e.start,{weekday:'short',month:'short',day:'numeric'}))}</strong><span>${esc(fmtTime(e.start))}</span></div><div><h3>${esc(e.title)}</h3>${e.location?`<p>${esc(e.location)}</p>`:''}</div></div>`).join('');
    const candidates=calendarReviewCandidates(),reviewed=candidates.filter(e=>calendarReviewDecision(e.id)),remaining=candidates.filter(e=>!calendarReviewDecision(e.id));
    const candidateRows=remaining.slice(0,120).map(e=>{const match=calendarHealthMatch(e);return `<article class="calendar-review-item" data-calendar-candidate="${esc(e.id)}"><div class="calendar-review-copy"><time>${esc(fmtDate(e.start,{month:'short',day:'numeric',year:'numeric'}))}</time><strong>${esc(e.title)}</strong>${e.location?`<small>${esc(e.location)}</small>`:''}${match?'<span class="status-badge success">Possible ZEKE match already exists</span>':''}</div><div class="calendar-review-actions"><button class="primary compact" data-calendar-relevance="relevant" data-calendar-id="${esc(e.id)}">Relevant</button><button class="secondary compact" data-calendar-relevance="not_relevant" data-calendar-id="${esc(e.id)}">Not relevant</button><button class="text-action" data-calendar-relevance="unsure" data-calendar-id="${esc(e.id)}">Unsure</button></div></article>`}).join('');
    return `<div class="page-head"><div><h1>Calendar</h1><p>Scheduled context is useful evidence, but an appointment on a calendar is never proof that it happened.</p></div></div><section class="panel"><div class="section-head"><div><h2>Upcoming</h2><p>Connected calendar items that may help ZEKE understand what is coming up.</p></div></div>${rows||'<div class="empty-inline">No connected upcoming events.</div>'}</section><section class="panel mobile-calendar-review"><div class="section-head"><div><span class="tile-kicker">MOBILE REVIEW</span><h2>Review the past year</h2><p>ZEKE can screen the last year of calendar items for potentially health-relevant events. First mark what is relevant; only then will ZEKE ask you to confirm whether selected events actually happened.</p></div><button class="secondary" id="loadCalendarReview">${state.calendarReviewLoaded?'Refresh past year':'Scan past year'}</button></div>${state.calendarReviewLoaded?`<div class="calendar-review-summary"><span><b>${candidates.length}</b> potential</span><span><b>${reviewed.length}</b> screened</span><span><b>${remaining.length}</b> left</span></div>${candidateRows||'<div class="empty-inline success-empty">You have screened every potentially relevant event in this calendar window.</div>'}`:'<div class="empty-inline">Nothing is added to your health record during this first-pass scan.</div>'}</section>`;
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
    return `<div class="provider-grid ai-grid">${Object.values(defs).filter(d=>d.id!=='relay').map(def=>{const st=statusMap.get(def.id);return `<article class="provider-card ai-card ${st?.connected?'connected':''}" data-provider="${def.id}"><div class="provider-card-head"><span class="provider-icon">AI</span><div><strong>${esc(def.label)}</strong><span class="provider-status">${st?.connected?'● Connected · available to ZEKE':st?.hasSessionKey?'Configured · not tested':'Not connected'}</span>${st?.syncedCredential?'<small>Credential saved in your connected ZEKE workspace · available across devices after Drive sign-in</small>':''}${st?.connected&&st?.lastTestedAt?`<small>Last successful test: ${esc(fmtDate(st.lastTestedAt,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))}</small>`:''}</div></div>${def.id==='ollama'?'':`<label>API key<input type="password" data-ai-key="${def.id}" placeholder="${st?.hasSessionKey?'Saved in connected Drive — paste only to replace':'Paste API key'}"></label><small class="credential-storage-note">Saved to <code>Project Zeke/system/ai-connections.json</code> in the connected storage so another signed-in device can use the same provider configuration. Keys are never included in reports or diagnostics.</small>`}${def.requiresEndpoint?`<label>Endpoint<input type="url" data-ai-endpoint="${def.id}" value="${esc(st?.endpoint||'')}" placeholder="Secure relay or compatible endpoint URL"></label>`:''}<label>Model<input type="text" data-ai-model="${def.id}" value="${esc(st?.model||def.suggestedModels?.[0]||'')}" list="models-${def.id}" placeholder="Model ID"><datalist id="models-${def.id}">${(def.suggestedModels||[]).map(m=>`<option value="${esc(m)}"></option>`).join('')}</datalist></label><div class="card-actions"><button class="secondary" data-save-ai="${def.id}">Connect & sync</button><button class="text-action" data-test-ai="${def.id}">Test</button></div><small>ZEKE’s router chooses among connected services automatically for each task.</small></article>`}).join('')}</div>`;
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
    const duplicateActivities=activityDuplicateGroups(); const duplicateWorkouts=exactDuplicateWorkoutGroups(); const repairs=repairCandidates();
    return `<div class="page-head"><div><h1>Data Integrity</h1><p>Find, preview, and safely repair duplicate or inconsistent records inside ZEKE.</p></div><div class="page-head-actions"><button class="secondary" id="exportDataAudit">Export audit</button>${ZekeData.hasIntegrityUndo?.()?'<button class="secondary" id="undoIntegrityChange">Undo last cleanup</button>':''}</div></div>
      <section class="integrity-banner repair-mode"><strong>Protected cleanup mode</strong><span>ZEKE creates a backup before each merge or deletion, preserves provenance, and supports session undo.</span></section>
      ${state.integrityLastAction?`<section class="integrity-success">${esc(state.integrityLastAction)}</section>`:''}
      <section class="panel cleanup-panel repair-center"><div class="section-head"><div><h2>Repair Center</h2><p>ZEKE asks about real-world facts, not database structure. Each suggestion explains what happened in real life, what ZEKE found, and what will change. High-confidence repairs can be applied together.</p></div><div class="repair-center-head-actions"><span class="badge">${repairs.length} item${repairs.length===1?'':'s'}</span>${repairs.some(r=>r.safe)?'<button class="primary compact" id="applySafeRepairs">Apply reviewed safe repairs</button>':''}</div></div>${repairs.length?`<div class="repair-list">${repairs.map((r,i)=>`<article class="repair-card"><div class="repair-card-main"><div class="repair-card-title"><strong>${esc(r.title)}</strong><span class="confidence-pill">${esc(r.confidence)} confidence</span></div><p class="repair-question">${esc(r.question)}</p><details><summary>Show evidence</summary><p>${esc(r.explanation)}</p>${r.items.map(x=>`<div class="repair-evidence-row"><b>${esc(fmtDate(x.timestamp||x.recorded_at,{month:'short',day:'numeric',year:'numeric'}))}</b><span>${esc(humanEvent(x))}</span><small>${esc(x.provenance?.file||x.provenance?.source||'ZEKE')}</small></div>`).join('')}</details><p class="repair-recommendation"><b>ZEKE recommends:</b> ${esc(r.recommendation)}</p></div><div class="repair-actions">${r.type==='exact-duplicate'?`<button class="primary compact" data-apply-repair="${i}">It happened once — keep one</button><button class="secondary compact" data-dismiss-repair="${i}">It happened more than once</button>`:r.type==='implausible-sleep'&&r.keep?`<button class="primary compact" data-apply-repair="${i}">Keep ${esc(metricValue(r.keep))} hr</button><button class="secondary compact" data-edit-event="${esc(r.items[0].id)}">Enter a different value</button>`:r.type==='import-artifact'?`<button class="primary compact" data-apply-repair="${i}">Remove from active health data</button><button class="secondary compact" data-dismiss-repair="${i}">Keep it</button>`:(r.type==='paddle-fields'||r.type==='zero-as-missing')?`<button class="primary compact" data-apply-repair="${i}">Mark as not recorded</button><button class="secondary compact" data-edit-event="${esc(r.items[0].id)}">Review the activity</button>`:r.type==='answered-question'?`<button class="primary compact" data-apply-repair="${i}">Close the answered question</button>`:(r.type==='duplicate-discovery'||r.type==='stale-discovery')?`<button class="primary compact" data-apply-repair="${i}">Clean up this insight</button><button class="secondary compact" data-dismiss-repair="${i}">Leave it for now</button>`:`<button class="secondary compact" data-edit-event="${esc(r.items[0].id)}">Review record</button>`}</div></article>`).join('')}</div>`:'<div class="empty-inline success-empty">No known repair items remain.</div>'}</section>
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

  function supportRedact(value,mode='full'){
    if(value==null)return value;
    if(typeof value==='string'){
      if(mode==='technical')return value?`[content omitted · ${value.length} characters]`:'';
      if(mode==='anonymized')return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig,'[email]').replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g,'[phone]').replace(/\b(?:Frank|Mounjaro|tirzepatide|atorvastatin|Lipitor)\b/gi,'[personal term]');
      return value;
    }
    if(Array.isArray(value))return value.map(v=>supportRedact(v,mode));
    if(typeof value==='object'){
      const out={};for(const [k,v] of Object.entries(value)){
        if(/api.?key|secret|token|authorization|credential|password/i.test(k))continue;
        if(mode!=='full'&&/raw_text|source_text|original_text|request_summary|response_summary|structured|before|after/i.test(k))out[k]=typeof v==='string'?supportRedact(v,mode):'[content omitted]';
        else out[k]=supportRedact(v,mode);
      }return out;
    }
    return value;
  }
  function supportFlatRow(row={}){
    const out={};for(const [k,v] of Object.entries(row||{}))out[k]=v==null?'':typeof v==='object'?JSON.stringify(v):v;return out;
  }
  function addSupportSheet(workbook,name,rows=[],fallback='No entries in the selected range.'){
    const safeRows=(rows.length?rows:[{status:fallback}]).map(supportFlatRow);
    const sheet=XLSX.utils.json_to_sheet(safeRows);
    const widths=Object.keys(safeRows[0]||{}).map(key=>({wch:Math.min(60,Math.max(14,key.length+2,...safeRows.slice(0,50).map(r=>String(r[key]??'').length+2)))}));
    sheet['!cols']=widths;XLSX.utils.book_append_sheet(workbook,sheet,name.slice(0,31));
  }
  function supportDeveloperNotes(snapshot,runtimeRows,aiRows){
    const m=snapshot.metrics||{},topUnresolved=(snapshot.logs?.unresolved_interactions||[]).slice(-8);
    const notes=[];
    notes.push({section:'Release context',note:`ZEKE v${BUILD.version} build ${BUILD.build}. This report was generated from the selected browser logs and connected ZEKE repository. It never includes API keys or saved credentials.`});
    notes.push({section:'Conversation reliability',note:`${m.workflows_started||0} workflows started; ${m.workflows_completed||0} completed; ${m.workflows_open||0} remain open; ${m.unresolved_interactions||0} unresolved interactions were logged.`});
    notes.push({section:'AI reliability',note:`${aiRows.length} AI consultation records are available in this export. Connected-provider failures should be compared with the exact user workflow rather than treated as isolated errors.`});
    notes.push({section:'Runtime reliability',note:`${runtimeRows.length} runtime diagnostic entries are in the selected range. Repeated error kinds should be prioritized before one-off messages.`});
    if(topUnresolved.length)notes.push({section:'Highest-value review area',note:`Recent unresolved reasons: ${[...new Set(topUnresolved.map(x=>x.reason).filter(Boolean))].slice(0,5).join(' | ')}`});
    notes.push({section:'Recommended developer review order',note:'1) unresolved interactions and their displayed actions; 2) user corrections; 3) repeated technical errors; 4) AI failures; 5) workflow states that never reached explicit closure.'});
    return notes;
  }
  async function downloadSupportWorkbook(options={}){
    if(!window.XLSX)throw new Error('Spreadsheet export library did not load. Refresh and try again.');
    const mode=options.mode||state.supportExportOptions.mode||$('#supportPrivacyMode')?.value||'full',from=options.from??state.supportExportOptions.from??($('#supportFromDate')?.value||''),to=options.to??state.supportExportOptions.to??($('#supportToDate')?.value||''),clearAfter=options.clearAfter??state.supportExportOptions.clearAfter??Boolean($('#clearAfterSupportExport')?.checked);
    const workflowSnapshot=window.ZekeWorkflowEngine?.exportSnapshot({privacy_mode:mode,from,to})||{metrics:{},workflows:[],logs:{}};
    const inRange=row=>{const ts=new Date(row.timestamp||row.created_at||row.recorded_at||row.updated_at||0).getTime();if(!Number.isFinite(ts))return true;if(from&&ts<new Date(`${from}T00:00:00`).getTime())return false;if(to&&ts>new Date(`${to}T23:59:59.999`).getTime())return false;return true};
    const runtimeRows=runtimeDiagnostics().filter(inRange).map(r=>supportRedact(r,mode));
    const cloudAI=(await ZekeData.listAIExchanges?.()||[]).filter(inRange).map(r=>supportRedact(r,mode));
    const localAI=workflowSnapshot.logs?.ai_consultations||[];const aiRows=[...cloudAI,...localAI];
    const corrections=state.events.filter(e=>e.category==='correction'&&inRange(e)).map(e=>supportRedact({timestamp:e.timestamp,reason:e.raw_text,target_event_id:e.structured?.target_event_id,operation:e.structured?.operation,source:e.provenance?.source},mode));
    const potential=potentialHealthEvents().filter(inRange).map(e=>supportRedact({timestamp:e.timestamp,summary:e.structured?.summary||e.raw_text,tentative_tags:e.structured?.tentative_tags,status:e.structured?.interpretation_status,source:e.provenance?.source},mode));
    const audits=[...(workflowSnapshot.logs?.audit_history||[]),...(state.importBatches||[]).filter(inRange).map(x=>supportRedact({timestamp:x.created_at,event:x.type,status:x.status,message:x.message,counts:x.counts,source:x.source||x.file},mode))];
    const wb=XLSX.utils.book_new();
    addSupportSheet(wb,'Executive Summary',[
      {item:'Report',value:'ZEKE Support & Improvement Report'},
      {item:'Version',value:`${BUILD.version} · ${BUILD.build}`},
      {item:'Generated',value:new Date().toISOString()},
      {item:'Privacy mode',value:mode},
      {item:'Date range',value:`${from||'All'} through ${to||'All'}`},
      ...Object.entries(workflowSnapshot.metrics||{}).map(([item,value])=>({item:item.replaceAll('_',' '),value:value??'Not available'})),
      {item:'Runtime errors',value:runtimeRows.length},{item:'Potential health events',value:potential.length},{item:'Canonical corrections',value:corrections.length}
    ]);
    addSupportSheet(wb,'Technical Errors',[...runtimeRows,...(workflowSnapshot.logs?.technical_errors||[])]);
    const repositoryUnresolved=state.factors.filter(f=>f.type==='workflow_log'&&f.log_kind==='unresolved_interaction'&&inRange(f.log||f)).map(f=>supportRedact(f.log||f,mode));
    const unresolvedRows=[...(workflowSnapshot.logs?.unresolved_interactions||[]),...repositoryUnresolved.filter(r=>!(workflowSnapshot.logs?.unresolved_interactions||[]).some(x=>x.id===r.id))];
    addSupportSheet(wb,'Unresolved Interactions',unresolvedRows);
    addSupportSheet(wb,'AI Consultation History',aiRows);
    addSupportSheet(wb,'User Corrections',[...(workflowSnapshot.logs?.user_corrections||[]),...corrections]);
    addSupportSheet(wb,'UX Feedback',workflowSnapshot.logs?.ux_feedback||[]);
    addSupportSheet(wb,'Potential Health Events',potential);
    addSupportSheet(wb,'Audit History',audits);
    addSupportSheet(wb,'Conversation Metrics',Object.entries(workflowSnapshot.metrics||{}).map(([metric,value])=>({metric:metric.replaceAll('_',' '),value:value??''})));
    addSupportSheet(wb,'Workflow History',workflowSnapshot.workflows||[]);
    addSupportSheet(wb,'Developer Notes',supportDeveloperNotes(workflowSnapshot,runtimeRows,aiRows));
    XLSX.writeFile(wb,`ZEKE-Support-and-Improvement-Report-${localDay()}.xlsx`,{compression:true});
    state.supportExportStatus='Report created. API keys and credentials were excluded.';
    if(clearAfter){localStorage.removeItem(RUNTIME_LOG_KEY);window.ZekeWorkflowEngine?.clearLogs({keep_workflows:true});state.supportExportStatus+=' Retained diagnostic logs were cleared after export.';}
    render();
  }

  function healthExportRows(filterFn){
    return state.events.filter(e=>recordIsActive(e)&&!['raw_input','correction'].includes(e.category)&&filterFn(e)).sort((a,b)=>new Date(a.timestamp||0)-new Date(b.timestamp||0)).map(e=>{const st=e.structured||{};return {date:String(e.timestamp||e.recorded_at||'').slice(0,10),timestamp:e.timestamp||'',category:semanticCategory(e)||e.category,item:st.metric_id||st.medication_name||st.exercise||st.event_type||st.symptom||st.summary||'',value:st.value??st.dose??st.duration_min??'',unit:st.unit||st.weight_unit||'',status:st.status||st.interpretation_status||'',confirmation:st.confirmation_status||st.adherence_evidence||'',method:st.measurement_method||st.method||'',source:e.provenance?.source||'',source_file:e.provenance?.file||e.provenance?.sheet||'',record_id:e.id,notes:st.notes||e.raw_text||''};});
  }
  async function downloadHealthRecordWorkbook(){
    if(!window.XLSX)throw new Error('Spreadsheet export library did not load. Refresh and try again.');
    const wb=XLSX.utils.book_new(),active=state.events.filter(e=>recordIsActive(e)&&!['raw_input','correction'].includes(e.category));
    addSupportSheet(wb,'Overview',[{item:'Report',value:'ZEKE Health Record Workbook'},{item:'Version',value:`${BUILD.version} · ${BUILD.build}`},{item:'Generated',value:new Date().toISOString()},{item:'Canonical source',value:'Project Zeke longitudinal JSON repository'},{item:'Active records',value:active.length},{item:'Important',value:'This workbook is a generated report, not a second database. Edit ZEKE or explicitly import reviewed corrections rather than expecting spreadsheet edits to sync automatically.'}]);
    addSupportSheet(wb,'Measurements',healthExportRows(e=>['measurement','sleep'].includes(semanticCategory(e))&&!['body_fat_pct','fat_mass','lean_mass','visceral_fat_mass','appendicular_lean_mass_index','bone_mineral_content','bone_mineral_density','bone_t_score','bone_z_score','right_arm_lean_mass','left_arm_lean_mass','right_leg_lean_mass','left_leg_lean_mass'].includes(canonicalMetric(metricId(e)))));
    addSupportSheet(wb,'Body Composition',healthExportRows(e=>['body_fat_pct','fat_mass','lean_mass','visceral_fat_mass','appendicular_lean_mass_index','bone_mineral_content','bone_mineral_density','bone_t_score','bone_z_score','right_arm_lean_mass','left_arm_lean_mass','right_leg_lean_mass','left_leg_lean_mass'].includes(canonicalMetric(metricId(e)))));
    addSupportSheet(wb,'Labs',healthExportRows(e=>semanticCategory(e)==='lab'));
    addSupportSheet(wb,'Medication Dose History',healthExportRows(e=>semanticCategory(e)==='medication'));
    addSupportSheet(wb,'Illness Injury Context',healthExportRows(e=>['injury','illness','symptom','life_event','diagnosis','condition','potential_health_event'].includes(semanticCategory(e))));
    addSupportSheet(wb,'Vaccines Immunotherapy',healthExportRows(e=>['vaccination','immunotherapy'].includes(semanticCategory(e))||/vaccine|vaccination|immunotherapy|allergy shot/i.test(`${e.structured?.event_type||''} ${e.raw_text||''}`)));
    addSupportSheet(wb,'Fitness',healthExportRows(e=>isWorkoutEvent(e)));
    addSupportSheet(wb,'Provenance',active.map(e=>({record_id:e.id,timestamp:e.timestamp||'',category:semanticCategory(e)||e.category,source:e.provenance?.source||'',file:e.provenance?.file||'',sheet:e.provenance?.sheet||'',source_row:e.provenance?.source_row??'',interpretation_status:e.structured?.interpretation_status||'',include_in_analysis:e.structured?.include_in_analysis!==false,updated_at:e.updated_at||e.recorded_at||''})));
    XLSX.writeFile(wb,`ZEKE-Health-Record-${localDay()}.xlsx`,{compression:true});
  }

  function settingsPageHTML() {
    return `<div class="page-head"><div><h1>Settings</h1><p>Connections and preferences. ZEKE's router and provider managers handle the technical choices.</p></div></div>
      <section class="panel settings-section"><div class="section-head"><div><h2>User profile</h2><p>Identity and clinically relevant information are separate. A legal name is not required, every field is optional, and the profile is stored with your portable ZEKE workspace rather than in the app code.</p></div></div><form id="profileForm" class="profile-form progressive-profile"><label>Preferred name<input id="preferredNameInput" value="${esc(preferredName())}" placeholder="Optional"></label><label>Pronouns<input id="pronounsInput" value="${esc(userProfile().pronouns||'')}" placeholder="Optional, e.g. he/him"></label><label>Gender identity<input id="genderIdentityInput" value="${esc(userProfile().gender_identity||'')}" placeholder="Self-described, optional"></label><details class="wide"><summary>Optional clinical context</summary><div class="profile-clinical-grid"><label>Sex assigned at birth<select id="sexAssignedInput"><option value="">Prefer not to say / not recorded</option><option value="female" ${userProfile().sex_assigned_at_birth==='female'?'selected':''}>Female</option><option value="male" ${userProfile().sex_assigned_at_birth==='male'?'selected':''}>Male</option><option value="intersex" ${userProfile().sex_assigned_at_birth==='intersex'?'selected':''}>Intersex / variation</option><option value="self-described" ${userProfile().sex_assigned_at_birth==='self-described'?'selected':''}>Self-described</option></select></label><label>Relevant anatomy / physiology<input id="clinicalContextInput" value="${esc(userProfile().clinical_context||'')}" placeholder="Only what is useful for care or screening"></label></div><p class="safety-copy">ZEKE should ask for this only when a lab range, screening rule, or validated clinical model genuinely requires it, and should explain why.</p></details><button class="primary compact" type="submit">Save profile</button></form><p class="safety-copy">Identity informs respectful language. Clinical context is used only when medically relevant and should never be silently inferred from gender identity.</p></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Storage</h2><p>Choose where ZEKE keeps your workspace. Normal launches should reconnect silently when the provider allows it.</p></div></div>${storageCardsHTML()}<div class="settings-actions"><button class="secondary" id="reconnectStorage">Reconnect storage</button><button class="text-action danger" id="forgetStorage">Disconnect & forget setup</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Private Vault</h2><p>Encrypt sensitive event details locally before they are written to your selected storage provider.</p></div><span class="badge">${vaultConfig()?(vaultUnlocked()?'Unlocked':'Locked'):'Not configured'}</span></div><div class="vault-actions">${vaultConfig()?`<button class="secondary" id="unlockVault">Unlock</button><button class="secondary" id="lockVault">Lock now</button><button class="text-action danger" id="resetVault">Reset vault setup</button>`:`<button class="primary" id="setupVault">Set PIN</button>`}</div><p class="safety-copy">The PIN is never stored. Losing it means encrypted private details cannot be recovered. Neutral metadata and explicitly approved analytical features may remain available while locked.</p></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>AI Connections</h2><p>Connect and test services. ZEKE's AI Router decides which available model to use based on task, privacy, availability, and free-first policy.</p></div><span class="badge">${(state.ai?.providers||[]).filter(x=>x.connected).map(x=>x.label||x.provider).join(', ')||'No AI connected'}</span></div>${aiConnectionCardsHTML()}<div class="manual-packet"><strong>Manual AI packet</strong><p>Export a structured packet for use with any external AI, then import the response back into ZEKE without treating it as raw fact.</p><div class="card-actions"><button class="secondary" id="exportAIPacket">Export packet</button><label class="secondary file-button">Import AI response<input type="file" id="importAIResponse" accept=".json,application/json" hidden></label></div><div id="aiImportStatus" class="status-line"></div></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Calendar connections & privacy</h2><p>Connecting Google and allowing ZEKE to create/sync calendar entries are separate choices. Calendar events remain context until confirmed.</p></div></div><div class="provider-grid"><article class="provider-card connected"><span class="provider-icon">▣</span><div><strong>Google Calendar</strong><p>${state.storage?.providerId==='google-drive'?'Google is connected. ZEKE calendar writing is still separately controlled below.':'Available after Google connection.'}</p><span class="provider-status">${state.storage?.providerId==='google-drive'?'Connected for access':'Available'}</span></div></article></div><div class="calendar-consent-controls"><label class="checkbox-line"><input type="checkbox" id="calendarCreateConsent" ${state.preferences?.calendar_privacy?.zeke_calendar_creation_allowed?'checked':''}> Allow ZEKE to create/use a dedicated ZEKE calendar</label><p class="safety-copy">This does not automatically put health events on the calendar.</p>${['workout','activity','illness','injury','vaccination','immunotherapy','medication','sensitive_context'].map(kind=>`<label>${kind.replaceAll('_',' ')}<select data-calendar-category="${kind}"><option value="ask" ${(state.preferences?.calendar_privacy?.categories?.[kind]||ZekeCalendarPrivacy.policy(kind))==='ask'?'selected':''}>Ask each time</option><option value="always" ${(state.preferences?.calendar_privacy?.categories?.[kind]||ZekeCalendarPrivacy.policy(kind))==='always'?'selected':''}>Always allow</option><option value="never" ${(state.preferences?.calendar_privacy?.categories?.[kind]||ZekeCalendarPrivacy.policy(kind))==='never'?'selected':''}>Never add</option></select></label>`).join('')}<button class="secondary" id="saveCalendarPrivacy">Save calendar privacy choices</button></div></section>
      <section class="panel settings-section health-report-section"><div class="section-head"><div><h2>Health Reports & Export</h2><p>Generate a current human-readable report from ZEKE’s canonical longitudinal record. Reports never become a competing source of truth.</p></div><span class="badge">Generated on demand</span></div><div class="card-actions"><button class="primary" id="downloadHealthWorkbook">Generate Health Record Workbook</button><button class="secondary" id="exportHealthJson">Export canonical health JSON</button></div><p class="safety-copy">The workbook includes Measurements, Body Composition, Labs, Medication Dose History, Illness/Injury Context, Vaccines/Immunotherapy, Fitness, and Provenance. AI credentials and access tokens are excluded.</p></section>
      <details class="panel settings-section legacy-workbook-section"><summary><strong>Legacy workbook migration / reconciliation</strong><span>${state.syncSource?'Legacy source connected':'No legacy source connected'}</span></summary><div class="legacy-workbook-body"><p>The old connected workbook is now treated as a migration/import source, not ZEKE’s continuously maintained database. Use this only to verify or import information that has not yet been migrated into the longitudinal record.</p>${state.syncSource?`<div class="sync-source-card"><strong>${esc(state.syncSource.name)}</strong><p>Last verified reconciliation: ${esc(state.syncSource.last_sync_at?fmtDate(state.syncSource.last_sync_at,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'Not yet')}</p><div class="card-actions"><button class="secondary" id="preflightWorkbookNow">Run read-only preflight</button><button class="secondary" id="syncWorkbookNow" ${state.syncPreflight?.ready?'':'disabled'}>Commit reviewed migration</button><label class="secondary file-button">Review replacement source<input type="file" id="importFile" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label></div>${state.syncPreflight?.ready?`<p class="status-line">Preflight reviewed in this session. Commit will rerun and compare it before writing.</p>`:''}</div>`:`<label class="secondary file-button">Review a legacy health workbook<input type="file" id="importFile" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label>`}<div id="importStatus" class="status-line">${esc(state.importStatus||'')}</div><p class="safety-copy">No spreadsheet edits are silently synchronized into ZEKE. Imports use read → normalize → compare → preview → commit → verify with backups and provenance.</p></div></details>
      ${dataVisibilityHTML()}
      <section class="panel settings-section diagnostics-export-section"><div class="section-head"><div><h2>Diagnostics & Exports</h2><p>Create one multi-tab workbook that connects technical failures to the user workflows in which they occurred.</p></div><span class="badge">${runtimeDiagnostics().length+(window.ZekeWorkflowEngine?.metrics()?.unresolved_interactions||0)} retained items</span></div><div class="support-export-grid"><label>Privacy level<select id="supportPrivacyMode"><option value="full" ${state.supportExportOptions.mode==='full'?'selected':''}>Full developer report</option><option value="technical" ${state.supportExportOptions.mode==='technical'?'selected':''}>Technical only</option><option value="anonymized" ${state.supportExportOptions.mode==='anonymized'?'selected':''}>Anonymized</option></select></label><label>From date<input id="supportFromDate" type="date" value="${esc(state.supportExportOptions.from||'')}"></label><label>Through date<input id="supportToDate" type="date" value="${esc(state.supportExportOptions.to||'')}"></label><label class="support-clear-option"><input id="clearAfterSupportExport" type="checkbox" ${state.supportExportOptions.clearAfter?'checked':''}> Clear retained diagnostic logs after a successful export</label></div><div class="card-actions"><button class="primary" id="downloadSupportReport">Download Support & Improvement Report</button><button class="secondary" id="exportRuntimeDiagnostics">Runtime JSON only</button><button class="text-action danger" id="clearRuntimeDiagnostics">Clear retained logs</button></div><p class="safety-copy">Workbook tabs include Executive Summary, Technical Errors, Unresolved Interactions, AI Consultation History, User Corrections, UX Feedback, Potential Health Events, Audit History, Conversation Metrics, Workflow History, and Developer Notes. API keys, access tokens, passwords, and saved credentials are never included.</p><div class="status-line">${esc(state.supportExportStatus||'')}</div></section>
      <section class="panel settings-section integrity-settings-card"><div class="section-head"><div><h2>Data Integrity</h2><p>Review suspicious imports, duplicate candidates, and source conflicts without cluttering the primary navigation.</p></div><button class="secondary" data-route="data-integrity">Open Data Integrity</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Dashboard layout</h2><p>Choose which metric cards appear on the dashboard. This opens a scrollable settings panel.</p></div><button class="secondary" id="customizeBtn">Customize dashboard</button></div></section>
      <section class="panel settings-section"><div class="section-head"><div><h2>Appearance</h2><p>Choose Dark, Light, or follow your system setting.</p></div></div><div class="theme-buttons"><button class="secondary ${state.theme==='dark'?'active':''}" data-theme="dark">Dark</button><button class="secondary ${state.theme==='light'?'active':''}" data-theme="light">Light</button><button class="secondary ${state.theme==='system'?'active':''}" data-theme="system">System</button></div></section>
      <section class="panel about"><h2>About this build</h2><p><strong>ZEKE v${esc(BUILD.version)}</strong> · build ${esc(BUILD.build)}</p><p>${esc(BUILD.label||'Repair release')}</p></section>`;
  }

  function reviewFriendlyTitle(q) {
    const candidate=q?.import_candidate||q?.candidate_event||q?.proposed_event||q?.target||{};
    const text=`${q?.question||''} ${q?.why_it_matters||''} ${q?.question_key||''} ${candidate?.category||''} ${candidate?.structured?.metric_id||''}`.toLowerCase();
    if(/sleep/.test(text)) return 'Confirm this sleep entry';
    if(text.includes('duplicate')) return 'Decide whether these are duplicate records';
    if(text.includes('blood pressure')) return 'Confirm this blood-pressure measurement';
    if(/medication|mounjaro|tirzepatide|atorvastatin|supplement/.test(text)) return 'Complete this medication detail';
    if(/workout|exercise|fitness/.test(text)) return 'Confirm this workout update';
    if(text.includes('clarification')||text.includes('raw evidence')||text.includes('combined')) return 'Separate information that may belong in different records';
    return 'Review this unfinished decision';
  }
  function reviewUnderstanding(q){
    const text=`${q?.question_key||''} ${q?.question||''}`.toLowerCase();
    if(text.includes('med_schedule:'))return 'ZEKE recognizes the medication, but the recurring schedule is still unknown. No schedule has been assumed.';
    if(text.includes('duplicate'))return 'ZEKE found two records similar enough that keeping both could distort a trend, but they may represent separate real events.';
    if(text.includes('blood pressure'))return 'ZEKE found a blood-pressure pair that may be reversed or invalid, so it is being kept out of verified charts for now.';
    const candidate=q?.import_candidate||q?.candidate_event||q?.proposed_event||q?.target;
    return candidate?'ZEKE has a tentative interpretation, but it has not been applied because your confirmation could change the record.':'ZEKE understands the general topic but needs one decision before it can safely finish the task.';
  }
  function reviewWillDo(q){
    const text=`${q?.question_key||''} ${q?.question||''}`.toLowerCase();
    if(text.includes('med_schedule:'))return 'Use the schedule to decide when this medication belongs in Today’s Actions. A scheduled day will never be treated as proof that a dose was taken.';
    if(text.includes('duplicate'))return 'Either keep one canonical record or preserve both as separate events, then rebuild affected trends.';
    if(text.includes('blood pressure'))return 'Correct, preserve, or quarantine the pair based on your answer before it can affect charts or insights.';
    return 'Apply only the decision you confirm, preserve the original source, and record the outcome in the audit history.';
  }
  function reviewPrimaryLabel(q){
    const candidate=q?.import_candidate||q?.candidate_event||q?.proposed_event||q?.target;
    if(candidate)return 'Confirm or correct';
    if(String(q?.question_key||'').startsWith('med_schedule:'))return 'Answer schedule question';
    return 'Answer this question';
  }
  function learnedMemories(){
    const rows=[];
    for(const action of state.actions.catalog||[]){
      if(!action.schedule||action.active===false)continue;
      const schedule=action.schedule.type==='daily'?'Daily':action.schedule.type==='weekly'?`Weekly${action.schedule.days?.length?` on ${action.schedule.days.map(d=>['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d]).join(', ')}`:''}`:scheduleText(action.schedule);
      rows.push({id:`action:${action.id}`,source:'action',title:action.label||action.name||'Recurring action',summary:schedule,why:'This determines when the item appears in Today’s Actions without assuming it was completed.',last_used:action.updated_at||action.created_at||''});
    }
    for(const factor of state.factors){
      if(['clarification_question','workflow_state','workflow_log'].includes(factor.type))continue;
      if(['dismissed','unknown','deferred'].includes(factor.status))continue;
      const summary=factor.summary||factor.answer||factor.value||'';if(!summary)continue;
      rows.push({id:`factor:${factor.id}`,source:'factor',title:String(factor.type||'Remembered context').replaceAll('_',' '),summary:String(summary),why:factor.why_it_matters||'ZEKE keeps this context so future questions and recommendations do not start from zero.',last_used:factor.last_used_at||factor.updated_at||factor.created_at||''});
    }
    return rows.sort((a,b)=>new Date(b.last_used||0)-new Date(a.last_used||0));
  }

  function reviewEventSummary(event={}){
    const st=event.structured||{},cat=semanticCategory(event)||event.category||'record',date=event.timestamp||event.recorded_at||'',source=event.provenance?.file||event.provenance?.sheet||event.provenance?.source||'ZEKE';let title=humanEvent(event),details=[];
    if(cat==='medication'){title=`${st.medication_name||st.name||'Medication'} · ${st.status||'recorded'}`;if(st.dose!=null)details.push(`${st.dose} ${st.unit||''}`.trim())}
    if(isWorkoutEvent(event)){const w=workoutStructured(event);title=w.exercise||'Workout';if(w.weight!=null)details.push(`${w.weight} lb`);if(w.reps!=null)details.push(`${w.reps} reps`);if(w.sets!=null)details.push(`${w.sets} sets`)}
    return {title,date,source,details:details.join(' · '),raw:event.raw_text||''};
  }
  function duplicateReviewHTML(q,tasks,index){
    const candidate=q.candidate_event||q.import_candidate||{},existing=state.events.find(e=>e.id===q.existing_event_id)||{},a=reviewEventSummary(existing),b=reviewEventSummary(candidate),sameDay=a.date&&b.date&&String(a.date).slice(0,10)===String(b.date).slice(0,10);
    const card=(label,x)=>`<article class="duplicate-record-card"><span class="tile-kicker">${label}</span><h3>${esc(x.title||'Record')}</h3><dl><div><dt>Date / time</dt><dd>${esc(x.date?fmtDate(x.date,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'Not available')}</dd></div><div><dt>Details</dt><dd>${esc(x.details||'No additional values recorded')}</dd></div><div><dt>Source</dt><dd>${esc(x.source)}</dd></div></dl>${x.raw?`<details><summary>Original wording</summary><p>${esc(x.raw)}</p></details>`:''}</article>`;
    return `<div class="review-workspace-shell"><div class="review-workspace-head"><button class="secondary" id="backToReviewQueue">← Back to Questions for You</button><span class="badge">Item ${index+1} of ${Math.max(tasks.length,1)}</span><button class="icon-btn" id="closeReviewWorkspace" aria-label="Close review">×</button></div><section class="panel review-workspace duplicate-review"><div class="review-intro"><span class="question-priority ${esc(q.priority||'optional')}">CHECK ONE THING</span><h1>Are these the same event?</h1><p>ZEKE found two records that look alike${sameDay?' on the same date':''}. Compare them below, then tell ZEKE whether they describe one real event or two.</p></div><div class="duplicate-record-grid">${card('Already in ZEKE',a)}${card('Imported / proposed',b)}</div><div class="review-decision"><h2>What happened?</h2><div class="review-decision-actions duplicate-actions"><button class="primary" data-direct-question-choice="question-duplicate-merge">Same event — keep one</button><button class="secondary" data-direct-question-choice="question-duplicate-keep">These are separate events</button><button class="secondary" id="editReviewUnderstanding">Edit details</button><button class="secondary" id="unknownReview">Not sure</button><button class="secondary" id="deferReview">Later</button></div><details class="technical-review-details"><summary>Why is ZEKE asking?</summary><p>Counting one event twice can distort history and trends. ZEKE will preserve the original source and audit trail either way.</p></details></div></section></div>`;
  }
  function activeReviewHTML(q,tasks) {
    if(!q){state.activeReviewId='';try{sessionStorage.removeItem('zeke-active-review')}catch(_){}return questionsPageHTML();}const task=tasks.find(t=>t.items.some(x=>x.id===q.id)),index=Math.max(0,tasks.indexOf(task));if(String(q.question_key||'').startsWith('duplicate_import:'))return duplicateReviewHTML(q,tasks,index);
    const candidate=q.import_candidate||q.candidate_event||q.proposed_event||q.target||{},source=q.original_text||q.source_text||candidate.raw_text||q.question||'Original source text is not available.',proposed=candidate.structured||candidate,proposalRows=Object.entries(proposed||{}).filter(([k,v])=>v!=null&&v!==''&&!['provenance','raw_text','interpretation_status'].includes(k)).slice(0,8),purpose=q.why_it_matters||'Your answer determines whether this information should be saved, corrected, or left unresolved.';
    return `<div class="review-workspace-shell"><div class="review-workspace-head"><button class="secondary" id="backToReviewQueue">← Back to Questions for You</button><span class="badge">Item ${index+1} of ${Math.max(tasks.length,1)}</span><button class="icon-btn" id="closeReviewWorkspace" aria-label="Close review">×</button></div><section class="panel review-workspace"><div class="review-intro"><span class="question-priority ${esc(q.priority||'optional')}">${esc(q.priority||'review')}</span><h1>${esc(reviewFriendlyTitle(q))}</h1><p>Nothing uncertain has been applied. ZEKE needs one decision from you.</p></div><div class="review-source"><h2>What ZEKE received</h2><blockquote>${esc(source)}</blockquote></div><div class="review-understanding"><h2>What ZEKE thinks it means</h2><p>${esc(reviewUnderstanding(q))}</p></div>${proposalRows.length?`<div class="review-proposal"><h2>Details ZEKE would use</h2><dl class="review-proposal-grid">${proposalRows.map(([k,v])=>`<div><dt>${esc(k.replaceAll('_',' '))}</dt><dd>${esc(typeof v==='object'?JSON.stringify(v):v)}</dd></div>`).join('')}</dl></div>`:''}<div class="review-impact-grid"><div><h2>Why ZEKE is asking</h2><p>${esc(purpose)}</p></div><div><h2>What happens after your answer</h2><p>${esc(reviewWillDo(q).replace('canonical record','record').replace('rebuild affected trends','update the affected history and trends'))}</p></div></div><div class="review-decision"><h2>Your decision</h2><div class="review-question-box">${esc(q.question||'What should ZEKE do with this information?')}</div><div class="review-decision-actions"><button class="primary" id="answerReviewNow">${esc(reviewPrimaryLabel(q).replace('Confirm or correct','Answer this'))}</button><button class="secondary" id="editReviewUnderstanding">Edit details</button><button class="secondary" id="deferReview">Later</button><button class="secondary" id="unknownReview">I don’t know</button></div></div></section></div>`;
  }

  function questionsPageHTML() {
    const tasks=reviewTasks(),memories=learnedMemories();
    if(state.activeReviewId) return activeReviewHTML(state.factors.find(f=>f.id===state.activeReviewId),tasks);
    const tabs=`<div class="memory-tabs" role="tablist"><button class="library-tab ${state.memoryTab==='waiting'?'active':''}" data-memory-tab="waiting">Pending <span>${tasks.length}</span></button><button class="library-tab ${state.memoryTab==='learned'?'active':''}" data-memory-tab="learned">Things I’ve Learned <span>${memories.length}</span></button></div>`;
    if(state.memoryTab==='learned'){
      const cards=memories.map(m=>`<article class="panel memory-card"><div><span class="tile-kicker">REMEMBERED CONTEXT</span><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><dl><div><dt>Why remembered</dt><dd>${esc(m.why)}</dd></div><div><dt>Last updated or used</dt><dd>${esc(m.last_used?fmtDate(m.last_used,{month:'short',day:'numeric',year:'numeric'}):'Not recorded')}</dd></div></dl></div><div class="question-actions"><button class="secondary" data-memory-edit="${esc(m.id)}">Edit memory</button><button class="text-action danger" data-memory-remove="${esc(m.id)}">Remove</button></div></article>`).join('');
      return `<div class="page-head"><div><h1>Questions for You</h1><p>Questions and remembered context are parts of the same conversation, not an administrative review queue.</p></div><span class="badge">${memories.length} remembered</span></div>${tabs}<section class="memory-list">${cards||'<section class="panel empty-page"><h2>No durable context yet</h2><p>Confirmed schedules, preferences, and relevant background will appear here with edit and remove controls.</p></section>'}</section>`;
    }
    const cards=tasks.map(task=>{const first=task.items[0],source=first.original_text||first.source_text||first.import_candidate?.raw_text||first.question||'Review the source and proposed use.';return `<section class="panel question-group"><article class="question-card review-task-card"><div><span class="question-priority ${esc(task.priority)}">${esc(task.priority||'optional')}</span><h3>${esc(reviewFriendlyTitle(first))}</h3><p>${esc(source)}</p><small>${esc(first.why_it_matters||'Your answer will determine what ZEKE can safely do next.')}</small></div><div class="question-actions"><button class="primary" data-review-question="${esc(first.id)}">${esc(reviewPrimaryLabel(first))}</button><button class="secondary" data-review-task-later="${esc(task.key)}">Later</button></div></article></section>`}).join('');
    return `<div class="page-head"><div><h1>Questions for You</h1><p>Answer one at a time, later, through Talk to ZEKE, or not at all. ZEKE explains why each answer matters.</p></div><span class="badge">${tasks.length} pending</span></div>${tabs}${cards||'<section class="panel empty-page"><h2>Nothing is waiting for you</h2><p>ZEKE currently has no unfinished decision that requires your attention.</p></section>'}`;
  }

  function globalTalkHTML(){ return `<button class="global-talk-button" id="globalTalkButton" aria-label="Talk to ZEKE"><img src="./assets/branding/zeke-mark-provisional.png" alt=""><span>Talk to ZEKE</span></button><div class="global-talk-overlay" id="globalTalkOverlay"><div class="global-talk-backdrop" id="globalTalkBackdrop"></div><div class="global-talk-panel">${conversationHTML()}</div></div>`;}


  function quickLogHTML(){
    if(!state.quickLogOpen)return '';
    const items=[['workout','Workout'],['activity','Single activity'],['intake','Intake'],['gluten','Gluten exposure'],['symptom','Symptom / ailment'],['life-event','Life event'],['cycle','Menstrual cycle'],['weight','Weight'],['blood_pressure','Blood pressure'],['sleep_duration','Sleep'],['waist_circumference','Body measurement'],['lab','Lab result'],['medication','Medication / supplement']];
    return `<div class="quick-log-overlay" id="quickLogOverlay"><div class="quick-log-backdrop" id="quickLogBackdrop"></div><section class="quick-log-sheet unified-input-sheet"><div class="section-head"><div><span class="tile-kicker">ONE INPUT · EVERYTHING CONNECTED</span><h2>Talk to ZEKE</h2><p>Tell ZEKE what happened, or choose a structured shortcut for <strong>${esc(activeDateLabel())}</strong>.</p></div><button class="icon-btn" id="closeQuickLog">×</button></div><button type="button" class="quick-talk-primary" id="quickTalkPrimary"><span class="quick-talk-mark">✦</span><span><strong>Type or attach something</strong><small>Workouts, symptoms, sleep, corrections, files, or anything else</small></span><b>›</b></button><div class="quick-log-divider"><span>Structured shortcuts</span></div><div class="quick-log-grid">${items.map(([id,label])=>`<button class="quick-log-option" data-quick-log="${id}">${label}</button>`).join('')}</div></section></div>`;
  }

  const ACTIVITY_FIELD_DEFINITIONS={
    weight:{label:'Weight / resistance',type:'number',step:'0.1',min:'0',key:'weight'},
    weight_unit:{label:'Resistance unit',type:'select',options:[['lb','lb'],['kg','kg'],['bowflex-unit','Bowflex setting'],['band','Band / qualitative']],key:'weight_unit'},
    reps:{label:'Reps',type:'number',step:'1',min:'1',key:'reps'},
    sets:{label:'Sets',type:'number',step:'1',min:'1',key:'sets'},
    band_resistance:{label:'Band resistance / color',type:'text',key:'band_resistance',placeholder:'e.g., yellow, green, blue, light, level 2'},
    hold_sec:{label:'Hold time (seconds)',type:'number',step:'1',min:'0',key:'hold_sec'},
    side:{label:'Side',type:'select',options:[['','Not recorded'],['right','Right'],['left','Left'],['both','Both / bilateral']],key:'side'},
    duration_min:{label:'Duration (min)',type:'number',step:'0.1',min:'0',key:'duration_min'},
    distance_mi:{label:'Distance (mi)',type:'number',step:'0.01',min:'0',key:'distance_mi'},
    steps:{label:'Steps',type:'number',step:'1',min:'0',key:'steps'},
    level:{label:'Level / program',type:'text',key:'level'},
    incline_pct:{label:'Incline %',type:'number',step:'0.1',min:'0',key:'incline_pct'},
    average_hr:{label:'Average HR',type:'number',step:'1',min:'1',key:'average_hr'},
    rpe:{label:'Effort / RPE (0–10)',type:'number',step:'0.1',min:'0',max:'10',key:'rpe'},
    rir:{label:'Reps in reserve (RIR)',type:'number',step:'1',min:'0',max:'10',key:'rir'},
    rest_sec:{label:'Rest seconds',type:'number',step:'1',min:'0',key:'rest_sec'},
    pain_before:{label:'Pain before (0–10)',type:'number',step:'0.1',min:'0',max:'10',key:'pain_before'},
    pain_during:{label:'Pain during (0–10)',type:'number',step:'0.1',min:'0',max:'10',key:'pain_during'},
    pain_after:{label:'Pain after (0–10)',type:'number',step:'0.1',min:'0',max:'10',key:'pain_after'},
    difficulty:{label:'Difficulty',type:'select',options:[['','Not recorded'],['easy','Easy'],['appropriate','Appropriate'],['hard','Hard'],['too-hard','Too hard']],key:'difficulty'},
    rom_change:{label:'Range of motion',type:'select',options:[['','Not recorded'],['better','Better'],['same','Same'],['worse','Worse']],key:'rom_change'},
    technique_notes:{label:'Technique / form',type:'text',key:'technique_notes'},
    injury_context:{label:'Injury or PT context',type:'text',key:'injury_context'},
    body_area:{label:'Body area / focus',type:'text',key:'body_area'},
    location:{label:'Location / waterway',type:'text',key:'location'},
    conditions:{label:'Conditions',type:'text',key:'conditions',placeholder:'weather, water, terrain'},
    heat:{label:'Heat',type:'select',options:[['','Not recorded'],['on','On'],['off','Off']],key:'heat'}
  };
  const PROFILE_FIELD_DEFAULTS={
    strength:{fields:['weight','weight_unit','reps','sets','rpe','rir','rest_sec','technique_notes','injury_context'],required:[]},
    cardio:{fields:['duration_min','distance_mi','steps','level','incline_pct','average_hr','rpe'],required:[]},
    mobility:{fields:['duration_min','body_area','pain_after','rom_change'],required:[]},
    rehab:{fields:['sets','reps','hold_sec','side','band_resistance','weight','weight_unit','pain_before','pain_during','pain_after','difficulty','rom_change','injury_context'],required:[]},
    recovery:{fields:['duration_min','level','heat','body_area','pain_after'],required:[]},
    sport:{fields:['duration_min','distance_mi','rpe','location','conditions'],required:[]},
    functional:{fields:['duration_min','rpe','body_area','pain_after'],required:[]}
  };
  function customActivityDefinition(name){return customActivityLibrary().find(x=>String(x.name||'').toLowerCase()===String(name||'').toLowerCase())||null}
  function activityProfile(name, explicit=''){
    if(explicit)return explicit;
    const custom=customActivityDefinition(name);if(custom?.profile)return custom.profile;
    const known=window.ZekeKnowledgeBase?.get?.(name);if(known?.profile)return known.profile;
    const n=String(name||'').toLowerCase();
    if(/cheerleaders?|cheer leader|band diagonal|alternating.*band/.test(n))return 'rehab';
    if(/massage|hydromassage|sauna|wellness|recovery|foam roll/.test(n))return 'recovery';
    if(/physical therapy|\bpt\b|rehab|rotator cuff/.test(n))return 'rehab';
    if(/stretch|mobility|yoga/.test(n))return 'mobility';
    if(/stair|treadmill|elliptical|bike|cycle|walk|run|swim|rower|cardio/.test(n))return 'cardio';
    if(/kayak|ski|basketball|tennis|hike|sport/.test(n))return 'sport';
    if(/yard work|housework|mow|shovel|chores?/.test(n))return 'functional';
    return 'strength';
  }
  const activityProfileLabel=p=>({strength:'Strength',cardio:'Cardio',mobility:'Mobility / stretch',rehab:'Rehabilitation / PT',recovery:'Recovery',sport:'Sport / recreation',functional:'Chores & functional activity'}[p]||'Activity');
  function activitySchema(name,profile){
    const custom=customActivityDefinition(name);
    if(custom?.fields?.length)return {fields:custom.fields,required:Array.isArray(custom.required_fields)?custom.required_fields:[],custom:true};
    const n=String(name||'').toLowerCase();
    if(/cheerleaders?|cheer leader/.test(n))return {fields:['sets','reps','hold_sec','side','band_resistance','weight','weight_unit','pain_before','pain_during','pain_after','difficulty','rom_change','injury_context'],required:[],custom:false};
    if(/massage chair|hydromassage/.test(n))return {fields:['duration_min','level','heat','body_area','pain_after'],required:[],custom:false};
    if(profile==='cardio'&&/stair|climbmill|step mill/.test(n))return {fields:['duration_min','steps','level','average_hr','rpe'],required:[],custom:false};
    if(profile==='cardio'&&/walk|treadmill/.test(n))return {fields:['duration_min','distance_mi','steps','incline_pct','average_hr','rpe'],required:[],custom:false};
    return PROFILE_FIELD_DEFAULTS[profile]||PROFILE_FIELD_DEFAULTS.functional;
  }
  function activityFieldHTML(id,latest={},required=false){
    const d=ACTIVITY_FIELD_DEFINITIONS[id];if(!d)return '';
    const req=required?' required':'';const optional=required?'':' (optional)';const value=latest?.[d.key]??'';
    if(d.type==='select')return `<label>${esc(d.label)}${optional}<select id="activityField_${escAttr(id)}" data-activity-field="${escAttr(id)}"${req}>${d.options.map(([v,l])=>`<option value="${escAttr(v)}" ${String(value)===String(v)?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
    return `<label class="${['technique_notes','injury_context','conditions'].includes(id)?'wide':''}">${esc(d.label)}${optional}<input id="activityField_${escAttr(id)}" data-activity-field="${escAttr(id)}" type="${d.type}" ${d.step?`step="${d.step}"`:''} ${d.min!=null?`min="${d.min}"`:''} ${d.max!=null?`max="${d.max}"`:''} value="${escAttr(value)}" placeholder="${escAttr(d.placeholder||'')}"${req}></label>`;
  }
  function profileFields(profile,latest={},name=''){
    const schema=activitySchema(name,profile),required=new Set(schema.required||[]);
    const fields=schema.fields.map(id=>activityFieldHTML(id,latest,required.has(id))).join('');
    const hint=profile==='rehab'?'<div class="direct-entry-hint wide">Use the exact movement and resistance your clinician or PT prescribed. Weight is never required unless you explicitly add it to this activity.</div>':'';
    return fields+hint;
  }
  function readActivityFields(){
    const out={};$$('[data-activity-field]').forEach(el=>{const id=el.dataset.activityField,d=ACTIVITY_FIELD_DEFINITIONS[id];if(!d)return;let v=el.value;if(d.type==='number')v=v===''?null:Number(v);else v=v.trim();out[d.key]=v===''?null:v});return out;
  }

  function progressionTargetHTML(name,profile){
    if(profile!=='strength')return '';const sessions=workoutGroups({respectRange:false}).get(name)||[],rec=activityRecommendation(name,sessions),last=rec.last;if(!last&&!rec.target)return `<section class="progression-target-card"><span class="tile-kicker">NEXT TIME</span><strong>Build a baseline</strong><p>Log this exact variation once before ZEKE recommends progression.</p></section>`;
    const target=rec.target,load=target?.load!=null?`${target.load} lb`:'same setup',sets=target?.sets?`${target.sets} sets`:'',reps=target?.reps?`${target.reps} reps`:'';
    return `<section class="progression-target-card ${rec.clinician_priority?'clinician-priority':''}"><div><span class="tile-kicker">ZEKE TARGET</span><strong>${esc(target?[load,reps,sets].filter(Boolean).join(' · '):'No automatic target yet')}</strong><p>${esc(rec.rationale)}</p></div><div class="progression-target-actions"><small>${last?`Last: ${last.weight??'—'} lb · ${last.reps??'—'} reps · ${last.sets??'—'} sets${Number.isFinite(last.rpe)?` · RPE ${last.rpe}`:Number.isFinite(last.rir)?` · ${last.rir} RIR`:''}`:'No prior exact-variation session'}</small><button type="button" class="text-action" data-coach-evidence="${esc(name)}">Why / evidence</button></div></section>`;
  }
  function knownVariationsForFamily(family, originalName=''){
    const canonical=normalizedActivityName(family||originalName), seen=new Map();
    const add=(variation,equipment='unknown',load_basis='unknown')=>{if(!variation)return;const key=activityKey(variation);if(!seen.has(key))seen.set(key,{variation,equipment,load_basis:load_basis||activityLoadBasis(equipment,variation,'')})};
    for(const sessions of workoutGroups({respectRange:false}).values())for(const row of sessions){const id=activityIdentity(row.event?.structured?.exercise||row.name||'',row.event?.structured||{},row.notes||'');if(activityKey(id.family)===activityKey(canonical))add(id.variation,id.equipment,id.load_basis)}
    if(canonical==='Bicep Curl'){
      add('Planet Fitness — Independent-Arm Bicep Curl Machine','selectorized machine','displayed_machine_load');
      add('Planet Fitness — Bilateral/Linked-Arm Bicep Curl Machine','selectorized machine','displayed_machine_load');
      add('Dumbbell Bicep Curl','dumbbell','per_hand');
      add('Bowflex Bicep Curl','Bowflex','bowflex_resistance_setting');
    }
    if(canonical==='Lat Pulldown'){
      add('Planet Fitness — Lat Pulldown Machine','selectorized machine','displayed_machine_load');
      add('Bowflex Lat Pulldown','Bowflex','bowflex_resistance_setting');
    }
    const inferred=activityIdentity(originalName||canonical,{},'');add(inferred.variation,inferred.equipment,inferred.load_basis);
    return [...seen.values()];
  }
  function variationEquipmentFromLabel(label,family=''){
    const t=String(label||'').toLowerCase();
    if(/bowflex|power rod/.test(t))return 'Bowflex';
    if(/dumbbell|dumbell/.test(t))return 'dumbbell';
    if(/barbell/.test(t))return 'barbell';
    if(/band/.test(t))return 'resistance band';
    if(/cable/.test(t))return 'cable';
    if(/planet fitness|machine|independent-arm|bilateral|linked-arm/.test(t))return 'selectorized machine';
    return activityIdentity(label||family,{},'').equipment||'unknown';
  }
  function openActivityEntryModal(name, profileOverride=''){
    $('#directExerciseModal')?.remove();
    const baseIdentity=activityIdentity(name,{},''), family=baseIdentity.family||normalizedActivityName(name), profile=activityProfile(family,profileOverride), variations=knownVariationsForFamily(family,name);
    let selected=variations.find(v=>activityKey(v.variation)===activityKey(baseIdentity.variation))||variations[0]||{variation:name,equipment:'unknown',load_basis:'unknown'};
    const recentFamilySession=(workoutFamilyGroups({respectRange:false}).get(family)||[]).at(-1), recentVariation=recentFamilySession?.variation_name;
    if(activityKey(name)===activityKey(family)&&recentVariation)selected=variations.find(v=>activityKey(v.variation)===activityKey(recentVariation))||selected;
    if(family==='Lat Pulldown'&&activityKey(name)==='lat pulldown'&&!recentVariation)selected=variations.find(v=>v.variation==='Planet Fitness — Lat Pulldown Machine')||selected;
    if(/independent.*bicep/i.test(name))selected=variations.find(v=>/Independent-Arm/.test(v.variation))||selected;
    const exactSessions=()=>workoutGroups({respectRange:false}).get(selected.variation)||[];
    const last=()=>exactSessions().at(-1)||{};
    const recommendation=()=>activityRecommendation(selected.variation,exactSessions());
    const initialSets=()=>{const l=last(), weights=Array.isArray(l.event?.structured?.set_weights)?l.event.structured.set_weights:[], reps=Array.isArray(l.event?.structured?.set_reps)?l.event.structured.set_reps:[];const count=Math.max(weights.length,reps.length,Number(l.sets)||0,3);return Array.from({length:Math.min(Math.max(count,1),8)},(_,i)=>({weight:weights[i]??(l.weight??''),reps:reps[i]??(l.reps??''),rpe:'',pain:'',notes:''}))};
    let sets=initialSets();
    const getGuide=()=>window.ZekeKnowledgeBase?.get?.(selected.variation)||window.ZekeKnowledgeBase?.get?.(name)||window.ZekeKnowledgeBase?.get?.(family)||window.ZekeExerciseGuides?.get?.(selected.variation)||window.ZekeExerciseGuides?.get?.(name)||window.ZekeExerciseGuides?.get?.(family);
    const schema=activitySchema(name,profile), extraFieldIds=(schema.fields||[]).filter(id=>!['sets','reps','weight','rpe','technique_notes'].includes(id));
    const extraFieldsMarkup=profile==='strength'?'':`<details class="mobile-exercise-details"><summary>More ${esc(activityProfileLabel(profile))} details <span>optional</span></summary><div class="direct-entry-form mobile-exercise-extra-fields">${extraFieldIds.map(id=>activityFieldHTML(id,last()?.event?.structured||{},false)).join('')}</div></details>`;
    const renderSetRows=()=>sets.map((set,i)=>`<div class="mobile-exercise-set-row" data-set-row="${i}"><span class="set-number">${i+1}</span><label><small>${profile==='strength'?'Weight':'Resistance'}</small><input class="mobile-set-weight" type="number" min="0" step="0.5" inputmode="decimal" value="${escAttr(set.weight)}"></label><label><small>Reps</small><input class="mobile-set-reps" type="number" min="0" step="1" inputmode="numeric" value="${escAttr(set.reps)}"></label><label class="optional-set-field"><small>Effort</small><input class="mobile-set-rpe" type="number" min="1" max="10" step="0.5" inputmode="decimal" value="${escAttr(set.rpe)}" placeholder="—"></label><label class="optional-set-field"><small>Pain</small><input class="mobile-set-pain" type="number" min="0" max="10" step="1" inputmode="numeric" value="${escAttr(set.pain)}" placeholder="—"></label><button type="button" class="set-remove" data-remove-mobile-set="${i}" aria-label="Remove set ${i+1}">×</button></div>`).join('');
    const coachMarkup=()=>{const r=recommendation(),l=last();const lastText=l?.date?`${fmtDate(l.date,{month:'short',day:'numeric'})}: ${l.weight??'—'} lb · ${l.reps??'—'} reps · ${l.sets??'—'} sets${Number.isFinite(l.rpe)?` · RPE ${l.rpe}`:''}`:'No prior confirmed workout for this exact variation.';return `<section class="mobile-exercise-coach"><div class="mobile-card-heading"><span class="mock-z-icon">Z</span><strong>ZEKE COACH</strong></div><div class="coach-last"><small>LAST WORKOUT · THIS VARIATION</small><p>${esc(lastText)}</p></div><div class="coach-suggestion"><small>TODAY'S SUGGESTION</small><strong>${esc(r?.suggestion||'Log a comparable session to build a reliable baseline.')}</strong><p>${esc(r?.rationale||'ZEKE keeps machine and equipment variations separate until your own history supports a relationship.')}</p></div><details class="coach-why"><summary>Why this recommendation?</summary><p>${esc(r?.rationale||'This recommendation is based on your confirmed history for this exact variation, not a generic conversion from another machine.')}</p><button type="button" class="text-action" data-coach-evidence="${escAttr(selected.variation)}">Research & evidence</button></details></section>`};
    const guideMarkup=()=>{const guide=getGuide();const image=guide?.media?.image||guide?.photo?.src||guide?.image||'';const setup=guide?.setup||[];const movement=guide?.movement||[];const tips=guide?.tips||guide?.mindMuscle||[];return `<details class="mobile-exercise-form" open><summary><span><strong>FORM GUIDE</strong><small>High-quality setup and movement cues</small></span><b>⌄</b></summary><div class="mobile-form-body">${image?`<figure><img src="${escAttr(image)}" alt="${escAttr(guide?.photo?.alt||`Form guide for ${family}`)}"><figcaption>${esc(guide?.media?.source||guide?.photo?.credit||'Exercise form reference')}</figcaption></figure>`:`<div class="mobile-form-placeholder"><strong>Verified visual guide</strong><span>${esc(family)}</span></div>`}<div class="mobile-form-cues">${setup.length?`<h4>Setup</h4><ul>${setup.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${movement.length?`<h4>Movement</h4><ul>${movement.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${tips.length?`<h4>Tips</h4><ul>${tips.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${!setup.length&&!movement.length&&!tips.length?'<p>Use controlled, repeatable form and stop for sharp or increasing pain. A verified visual guide is required before release for included PT exercises.</p>':''}</div></div></details>`};
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay mobile-exercise-overlay" id="directExerciseModal"><article class="direct-entry-card mobile-exercise-page" data-activity-profile="${escAttr(profile)}" role="dialog" aria-modal="true" aria-labelledby="mobileExerciseTitle"><header class="mobile-exercise-header"><button type="button" class="icon-btn" id="closeDirectExercise" aria-label="Close">‹</button><div><span class="tile-kicker">LOG EXERCISE</span><h2 id="mobileExerciseTitle">${esc(family)}</h2></div><span class="mobile-exercise-date">${esc(activeDateLabel())}</span></header><section class="mobile-exercise-variation"><label>Variation<select id="mobileExerciseVariation">${variations.map(v=>`<option value="${escAttr(v.variation)}" ${v.variation===selected.variation?'selected':''}>${esc(v.variation)}</option>`).join('')}<option value="__new__">＋ Create new variation…</option></select></label><small id="variationLoadBasis">${esc((selected.load_basis||'unknown').replaceAll('_',' '))}</small></section><div id="mobileCoachRegion">${coachMarkup()}</div><section class="mobile-exercise-entry"><div class="mobile-card-heading"><strong>SETS</strong><span>Effort and pain are optional per set</span></div><div class="mobile-set-columns"><span>Set</span><span>Weight</span><span>Reps</span><span>Effort</span><span>Pain</span><span></span></div><div id="mobileSetRows">${renderSetRows()}</div><button type="button" class="mock-add-set" id="addMobileSet">＋ Add set</button>${extraFieldsMarkup}<label class="mobile-exercise-notes">Exercise notes (optional)<textarea id="mobileExerciseNotes" rows="2" placeholder="Form, equipment setup, symptoms, anything worth remembering"></textarea></label><p class="form-error" id="directExerciseError" hidden></p></section><div id="mobileFormGuideRegion">${guideMarkup()}</div><div class="mobile-exercise-actions"><button type="button" class="secondary" id="cancelDirectExercise">Cancel</button><button type="button" class="primary" id="saveMobileExercise">Save exercise</button></div></article></div>`);
    const close=()=>$('#directExerciseModal')?.remove();
    const syncSets=()=>{sets=$$('.mobile-exercise-set-row',$('#directExerciseModal')).map(row=>({weight:$('.mobile-set-weight',row)?.value||'',reps:$('.mobile-set-reps',row)?.value||'',rpe:$('.mobile-set-rpe',row)?.value||'',pain:$('.mobile-set-pain',row)?.value||'',notes:''}))};
    const bindSetActions=()=>{$$('[data-remove-mobile-set]',$('#directExerciseModal')).forEach(btn=>btn.onclick=()=>{syncSets();sets.splice(Number(btn.dataset.removeMobileSet),1);if(!sets.length)sets.push({weight:'',reps:'',rpe:'',pain:'',notes:''});$('#mobileSetRows').innerHTML=renderSetRows();bindSetActions()})};bindSetActions();
    $('#addMobileSet').onclick=()=>{syncSets();const prev=sets.at(-1)||{};sets.push({weight:prev.weight||'',reps:'',rpe:'',pain:'',notes:''});$('#mobileSetRows').innerHTML=renderSetRows();bindSetActions()};
    $('#mobileExerciseVariation').onchange=e=>{if(e.target.value==='__new__'){const value=prompt(`Name the new ${family} variation (for example, equipment or machine type):`);if(!value){e.target.value=selected.variation;return}const clean=value.trim();const equipment=variationEquipmentFromLabel(clean,family);selected={variation:clean,equipment,load_basis:activityLoadBasis(equipment,clean,'')};const option=document.createElement('option');option.value=clean;option.textContent=clean;e.target.insertBefore(option,e.target.lastElementChild);e.target.value=clean}else{selected=variations.find(v=>v.variation===e.target.value)||{variation:e.target.value,equipment:variationEquipmentFromLabel(e.target.value,family),load_basis:activityLoadBasis(variationEquipmentFromLabel(e.target.value,family),e.target.value,'')}}sets=initialSets();$('#mobileSetRows').innerHTML=renderSetRows();bindSetActions();$('#variationLoadBasis').textContent=(selected.load_basis||'unknown').replaceAll('_',' ');$('#mobileCoachRegion').innerHTML=coachMarkup();$('#mobileFormGuideRegion').innerHTML=guideMarkup();$$('[data-coach-evidence]',$('#mobileCoachRegion')).forEach(el=>el.onclick=()=>openCoachEvidence(el.dataset.coachEvidence))};
    $('#closeDirectExercise').onclick=close;$('#cancelDirectExercise').onclick=close;$('#directExerciseModal').onclick=e=>{if(e.target.id==='directExerciseModal')close()};$$('[data-coach-evidence]',$('#mobileCoachRegion')).forEach(el=>el.onclick=()=>openCoachEvidence(el.dataset.coachEvidence));
    $('#saveMobileExercise').onclick=async()=>{
      syncSets();const err=$('#directExerciseError');err.hidden=true;
      const extra=readActivityFields(), valid=sets.filter(set=>set.weight!==''||set.reps!==''||set.rpe!==''||set.pain!=='');
      const hasExtra=Object.values(extra).some(v=>v!==null&&v!==''&&v!==false);
      if(!valid.length&&!hasExtra){err.hidden=false;err.textContent='Enter at least one set or an activity-specific detail.';return}
      if(profile==='strength'&&valid.some(set=>!(Number(set.weight)>0)||!(Number(set.reps)>0))){err.hidden=false;err.textContent='Each entered strength set needs a valid weight and reps. Effort and pain can be left blank.';return}
      if(profile!=='strength'&&valid.some(set=>(set.weight!==''&&!(Number(set.weight)>0))||(set.reps!==''&&!(Number(set.reps)>0)))){err.hidden=false;err.textContent='Entered resistance and reps must be positive numbers. Optional fields can be left blank.';return}
      const equipment=selected.equipment||variationEquipmentFromLabel(selected.variation,family),loadBasis=selected.load_basis||activityLoadBasis(equipment,selected.variation,''),notes=$('#mobileExerciseNotes').value.trim(),date=activeDay();
      const weights=valid.map(set=>set.weight===''?null:Number(set.weight)),reps=valid.map(set=>set.reps===''?null:Number(set.reps)),rpes=valid.map(set=>set.rpe===''?null:Number(set.rpe)),pains=valid.map(set=>set.pain===''?null:Number(set.pain));
      const numericWeights=weights.filter(Number.isFinite),numericReps=reps.filter(Number.isFinite);
      const numericRpes=rpes.filter(Number.isFinite),numericPains=pains.filter(Number.isFinite);const structured={...extra,exercise:family,exercise_family:family,variation_name:selected.variation,variation_id:activityKey(selected.variation).replace(/ /g,'_'),canonical_activity_id:activityKey(family).replace(/ /g,'_'),equipment_type:equipment,load_basis:loadBasis,identity_schema_version:2,identity_confidence:'user-confirmed',activity_profile:profile,workout_id:`workout-${date}`,sets:valid.length||Number(extra.sets)||null,set_weights:weights,set_reps:reps,set_rpe:rpes,set_pain:pains,weight:numericWeights.length&&numericWeights.length===weights.length&&numericWeights.every(v=>v===numericWeights[0])?numericWeights[0]:null,reps:numericReps.length&&numericReps.length===reps.length&&numericReps.every(v=>v===numericReps[0])?numericReps[0]:null,rpe:numericRpes.length?Math.max(...numericRpes):null,pain:numericPains.length?Math.max(...numericPains):null,notes,completed:true,interpretation_status:'confirmed',activity_schema_version:4,workout_order:draft.items.indexOf(item)+1,proposal_source:item.source==='adaptive-proposal'?'zeke-adaptive-training':null,proposal_reason:item.proposal_reason||null,progress_if:item.progress_if||null,regress_or_stop_if:item.regress_or_stop_if||null};
      await ZekeData.addEvent({category:'workout',timestamp:`${date}T12:00:00`,raw_text:notes,structured,provenance:{source:'mobile-log-exercise',entry_mode:'inline-set-table',identity_preserved:true,variation_aware:true,profile}});close();await refreshData();render();showToast(`${family} saved.`)
    };
  }

  function historicalIdentityCandidates(){
    return state.events.filter(e=>recordIsActive(e)&&isWorkoutEvent(e)&&!(e.structured||{}).identity_schema_version).map(e=>{
      const st=workoutStructured(e),identity=activityIdentity(st.exercise||'',st,e.raw_text||st.notes||''),explicit=/dumbbell|dumbell|bowflex|resistance band|\bband\b|barbell|cable|machine|selectorized/i.test(`${st.exercise||''} ${st.equipment||''} ${st.notes||''} ${e.raw_text||''}`);
      return {event:e,identity,confidence:(explicit||identity.confidence==='user-context')?'high':'unknown'};
    });
  }
  function identityOptionValue(family,equipment){
    const eq=String(equipment||'').toLowerCase();if(eq==='unknown')return JSON.stringify({family,variation:family,equipment:'unknown',load_basis:'unknown',confidence:'user-left-unspecified'});
    const variation=eq==='dumbbell'?`Dumbbell ${family}`:eq==='barbell'?`Barbell ${family}`:eq==='bowflex'?`Bowflex ${family}`:eq==='resistance band'?`${family} — Resistance Band`:eq==='cable'?`${family} — Cable`:eq==='selectorized machine'?`Machine ${family}`:family;
    return JSON.stringify({family,variation,equipment,load_basis:activityLoadBasis(equipment,variation,''),confidence:'user-confirmed'});
  }
  async function applyHistoricalIdentity(eventId,identity){
    const event=state.events.find(e=>e.id===eventId);if(!event||!identity||identity.equipment==='unknown')return false;const st=event.structured||{};
    await ZekeData.updateEvent(eventId,{structured:{...st,exercise_family:identity.family,variation_name:identity.variation,variation_id:activityKey(identity.variation).replace(/ /g,'_'),equipment_type:identity.equipment,load_basis:identity.load_basis,identity_schema_version:1,identity_confidence:identity.confidence||'user-confirmed'},correction_note:'Exercise identity metadata reviewed; original exercise wording preserved.'},{appendCorrection:true});return true;
  }
  function openExerciseIdentityReviewModal(){
    $('#identityReviewModal')?.remove();const rows=historicalIdentityCandidates(),high=rows.filter(x=>x.confidence==='high');
    const rowHTML=rows.slice(0,80).map(({event,identity,confidence})=>{const st=workoutStructured(event),family=identity.family||normalizedActivityName(st.exercise),suggested=confidence==='high'?identity:null;const options=[['unknown','Leave equipment / variation unspecified'],['selectorized machine','Machine'],['dumbbell','Dumbbell'],['barbell','Barbell'],['bowflex','Bowflex'],['resistance band','Resistance band'],['cable','Cable']];return `<article class="identity-review-row" data-identity-row="${esc(event.id)}"><div><strong>${esc(st.exercise||'Workout')}</strong><span>${esc(fmtDate(event.timestamp||event.recorded_at,{month:'short',day:'numeric',year:'numeric'}))}</span><small>${esc(event.raw_text||st.notes||'No equipment clue in the original record')}</small></div><label>Exercise family<input data-identity-family="${esc(event.id)}" value="${esc(family)}"></label><label>Variation / equipment<select data-identity-select="${esc(event.id)}">${options.map(([value,label])=>`<option value="${escAttr(identityOptionValue(family,value))}" ${(suggested&&String(suggested.equipment).toLowerCase().includes(value.replace('selectorized ','')))?'selected':''}>${esc(label)}${suggested&&value!=='unknown'&&String(suggested.equipment).toLowerCase().includes(value.replace('selectorized ',''))?' — suggested':''}</option>`).join('')}</select></label><span class="identity-confidence ${confidence}">${confidence==='high'?'Explicit clue found':'Needs your review'}</span></article>`}).join('');
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="identityReviewModal"><section class="direct-entry-card identity-review-card"><div class="section-head"><div><span class="tile-kicker">HISTORICAL WORKOUT REVIEW</span><h2>Clarify old exercise variations</h2><p>ZEKE will not change the exercise name you originally entered. This only adds reviewed family/equipment metadata so machine, dumbbell, Bowflex, band, and other variations stop sharing one progression history.</p></div><button class="icon-btn" id="closeIdentityReview">×</button></div><div class="identity-review-summary"><strong>${rows.length} old workout record${rows.length===1?'':'s'} lack the new identity metadata</strong><span>${high.length} contain an explicit equipment clue that ZEKE can suggest.</span></div><div class="identity-review-list">${rowHTML||'<div class="empty-inline">All active workout records already use the new identity model.</div>'}</div><div class="direct-entry-actions"><button type="button" class="secondary" id="closeIdentityReviewBottom">Close without changes</button>${rows.length?'<button type="button" class="primary" id="applyIdentityReview">Apply reviewed mappings</button>':''}</div></section></div>`);
    const close=()=>$('#identityReviewModal')?.remove();$('#closeIdentityReview').onclick=close;$('#closeIdentityReviewBottom').onclick=close;$('#identityReviewModal').onclick=e=>{if(e.target.id==='identityReviewModal')close()};
    $$('[data-identity-family]').forEach(input=>input.oninput=()=>{const id=input.dataset.identityFamily,select=$(`[data-identity-select="${id}"]`);if(!select)return;const family=input.value.trim()||'Exercise';const current=JSON.parse(select.value);select.querySelectorAll('option').forEach(opt=>{const parsed=JSON.parse(opt.value),replacement=JSON.parse(identityOptionValue(family,parsed.equipment));opt.value=JSON.stringify(replacement)});});
    $('#applyIdentityReview')?.addEventListener('click',async()=>{const btn=$('#applyIdentityReview');btn.disabled=true;btn.textContent='Applying…';let changed=0;for(const select of $$('[data-identity-select]')){const identity=JSON.parse(select.value);if(identity.equipment==='unknown')continue;const family=$(`[data-identity-family="${select.dataset.identitySelect}"]`)?.value.trim();if(family){identity.family=family;identity.variation=identity.equipment==='dumbbell'?`Dumbbell ${family}`:identity.equipment==='barbell'?`Barbell ${family}`:identity.equipment==='bowflex'?`Bowflex ${family}`:identity.equipment==='resistance band'?`${family} — Resistance Band`:identity.equipment==='cable'?`${family} — Cable`:identity.equipment==='selectorized machine'?`Machine ${family}`:family;}if(await applyHistoricalIdentity(select.dataset.identitySelect,identity))changed++;}close();await refreshData();render();showToast(changed?`${changed} historical workout record${changed===1?'':'s'} updated with reviewed identity metadata. Original wording was preserved.`:'No historical records were changed.');});
  }

  function customActivityLibrary(){
    const stored=state.preferences?.fitness?.custom_activities;
    if(Array.isArray(stored))return stored;
    try{return JSON.parse(localStorage.getItem('zeke-activity-library')||'[]')}catch(_){return[]}
  }
  async function saveCustomActivityLibrary(items){
    state.preferences={...(state.preferences||{}),fitness:{...(state.preferences?.fitness||{}),custom_activities:items}};
    await ZekeData.savePreferences(state.preferences);
    try{localStorage.removeItem('zeke-activity-library')}catch(_){}
  }
  const BUILT_IN_ROUTINES={
    'Full Body Starter':['Leg Press','Chest Press','Lat Pulldown','Seated Leg Curl','Seated Row'],
    'Upper Body':['Chest Press','Lat Pulldown','Seated Row','Bicep Curl','Tricep Press'],
    'Lower Body':['Leg Press','Leg Extension','Seated Leg Curl','Stair Climber'],
    'Shoulder-Friendly':['Seated Row','Lat Pulldown','Bicep Curl','Tricep Press']
  };
  function workoutRoutines(){return Array.isArray(state.preferences?.fitness?.workout_routines)?state.preferences.fitness.workout_routines:[]}
  async function saveWorkoutRoutines(items){state.preferences={...(state.preferences||{}),fitness:{...(state.preferences?.fitness||{}),workout_routines:items}};await ZekeData.savePreferences(state.preferences)}
  function openRoutineManager(){
    $('#routineManagerModal')?.remove();const routines=workoutRoutines();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="routineManagerModal"><section class="direct-entry-card routine-manager-card"><div class="section-head"><div><span class="tile-kicker">FITNESS</span><h2>Routines</h2><p>Routines are reusable starting templates. They do not become historical workout units.</p></div><button class="icon-btn" id="closeRoutineManager">×</button></div><div class="routine-manager-list">${Object.entries(BUILT_IN_ROUTINES).map(([name,items])=>`<article><div><strong>${esc(name)}</strong><small>Built in · ${items.length} exercises</small></div><span>${items.map(esc).join(' · ')}</span></article>`).join('')}${routines.map((r,i)=>`<article><div><strong>${esc(r.name)}</strong><small>Custom · ${r.exercises.length} exercises</small></div><span>${r.exercises.map(esc).join(' · ')}</span><button type="button" class="text-action danger" data-delete-routine="${i}">Delete</button></article>`).join('')}</div><form id="newRoutineForm" class="direct-entry-form"><label class="wide">Routine name<input id="newRoutineName" required placeholder="e.g., Chest Day"></label><label class="wide">Exercises, separated by commas<input id="newRoutineExercises" required placeholder="Chest Press, Pec Fly, Tricep Press"></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelRoutineManager">Close</button><button type="submit" class="primary">Save routine</button></div></form></section></div>`);
    const close=()=>$('#routineManagerModal')?.remove();$('#closeRoutineManager').onclick=close;$('#cancelRoutineManager').onclick=close;$('#routineManagerModal').onclick=e=>{if(e.target.id==='routineManagerModal')close()};
    $$('[data-delete-routine]').forEach(b=>b.onclick=async()=>{const next=workoutRoutines().filter((_,i)=>i!==Number(b.dataset.deleteRoutine));await saveWorkoutRoutines(next);openRoutineManager();showToast('Routine removed.')});
    $('#newRoutineForm').onsubmit=async e=>{e.preventDefault();const name=$('#newRoutineName').value.trim(),exercises=$('#newRoutineExercises').value.split(',').map(x=>x.trim()).filter(Boolean);if(!name||!exercises.length)return;const next=[...workoutRoutines().filter(r=>r.name.toLowerCase()!==name.toLowerCase()),{id:crypto.randomUUID(),name,exercises,created_at:new Date().toISOString()}];await saveWorkoutRoutines(next);openRoutineManager();showToast(`${name} saved as a routine template.`)};
  }

  function customFieldChooserHTML(profile='strength'){
    const suggested=new Set((PROFILE_FIELD_DEFAULTS[profile]||PROFILE_FIELD_DEFAULTS.functional).fields);
    return `<fieldset class="custom-activity-fields wide"><legend>Fields to show</legend><p class="direct-entry-hint">Choose only what is useful. Required fields are optional; ZEKE will not force weight unless you choose and require it.</p><div class="custom-field-grid">${Object.entries(ACTIVITY_FIELD_DEFINITIONS).map(([id,d])=>`<label class="custom-field-option"><span><input type="checkbox" data-custom-field="${escAttr(id)}" ${suggested.has(id)?'checked':''}> ${esc(d.label)}</span><span><input type="checkbox" data-custom-required="${escAttr(id)}" ${suggested.has(id)?'':'disabled'}> Required</span></label>`).join('')}</div></fieldset>`;
  }
  function openAddActivityModal(){
    $('#addActivityModal')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="addActivityModal"><div class="direct-entry-card custom-activity-card"><div class="section-head"><div><h2>Create custom activity</h2><p>Choose the category and exactly which fields ZEKE should show when you log it.</p></div><button class="icon-btn" id="closeAddActivity" aria-label="Close custom activity editor">×</button></div><form id="addActivityForm" class="direct-entry-form"><label class="wide">Activity name<input id="newActivityName" required placeholder="e.g., Cheerleaders"></label><label>Activity type<select id="newActivityProfile"><option value="strength">Strength</option><option value="cardio">Cardio</option><option value="mobility">Mobility / stretch</option><option value="rehab">Rehabilitation / PT</option><option value="recovery">Recovery</option><option value="sport">Sport / recreation</option><option value="functional">Chores / functional activity</option></select></label><label><input id="logNewActivityNow" type="checkbox" checked> Log it now</label><div id="customActivityFields" class="wide">${customFieldChooserHTML('strength')}</div><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelAddActivity">Cancel</button><button type="submit" class="primary">Save activity</button></div><p class="form-error wide" id="customActivityError" hidden></p></form></div></div>`);
    const close=()=>$('#addActivityModal')?.remove();$('#closeAddActivity').onclick=close;$('#cancelAddActivity').onclick=close;
    const wire=()=>{$$('[data-custom-field]').forEach(box=>box.onchange=()=>{const req=$(`[data-custom-required="${box.dataset.customField}"]`);req.disabled=!box.checked;if(!box.checked)req.checked=false})};wire();
    $('#newActivityProfile').onchange=e=>{$('#customActivityFields').innerHTML=customFieldChooserHTML(e.target.value);wire()};
    $('#addActivityForm').onsubmit=async e=>{e.preventDefault();const name=$('#newActivityName').value.trim(),profile=$('#newActivityProfile').value,fields=$$('[data-custom-field]:checked').map(x=>x.dataset.customField),required=$$('[data-custom-required]:checked').map(x=>x.dataset.customRequired);if(!name)return;if(!fields.length){const err=$('#customActivityError');err.hidden=false;err.textContent='Choose at least one field.';return;}const lib=customActivityLibrary().filter(x=>String(x.name||'').toLowerCase()!==name.toLowerCase());lib.push({name,profile,fields,required_fields:required,created_at:new Date().toISOString(),schema_version:2});await saveCustomActivityLibrary(lib);const logNow=$('#logNewActivityNow')?.checked!==false;close();render();if(logNow)openActivityEntryModal(name,profile);else showToast(`${name} added to your activity library.`)};
  }

  function clockSelects(prefix,label,defaults={hour:'11',minute:'00',ampm:'PM'}){
    const hours=Array.from({length:12},(_,i)=>String(i+1)),minutes=['00','05','10','15','20','25','30','35','40','45','50','55'];
    return `<fieldset class="time-select-group"><legend>${esc(label)}</legend><label>Hour<select id="${prefix}Hour">${hours.map(v=>`<option value="${v}" ${v===String(defaults.hour)?'selected':''}>${v}</option>`).join('')}</select></label><label>Minute<select id="${prefix}Minute">${minutes.map(v=>`<option value="${v}" ${v===String(defaults.minute)?'selected':''}>${v}</option>`).join('')}</select></label><label>AM / PM<select id="${prefix}AmPm"><option ${defaults.ampm==='AM'?'selected':''}>AM</option><option ${defaults.ampm==='PM'?'selected':''}>PM</option></select></label></fieldset>`;
  }
  function selectedClock(prefix){let hour=Number($(`#${prefix}Hour`).value)%12;if($(`#${prefix}AmPm`).value==='PM')hour+=12;return `${String(hour).padStart(2,'0')}:${$(`#${prefix}Minute`).value}`;}

  const BODY_MEASUREMENT_GROUPS={
    circumference:['waist_circumference','chest_circumference','hip_circumference','neck_circumference','arm_circumference_left','arm_circumference_right','thigh_circumference_left','thigh_circumference_right','calf_circumference_left','calf_circumference_right'],
    composition:['body_fat_pct','fat_mass','lean_mass','visceral_fat_mass','appendicular_lean_mass_index','right_arm_lean_mass','left_arm_lean_mass','right_leg_lean_mass','left_leg_lean_mass'],
    bone:['bone_mineral_content','bone_mineral_density','bone_t_score','bone_z_score']
  };
  function openBodyMeasurementModal(initial='waist_circumference'){
    $('#bodyMeasurementModal')?.remove();const ids=[...BODY_MEASUREMENT_GROUPS.circumference,...BODY_MEASUREMENT_GROUPS.composition,...BODY_MEASUREMENT_GROUPS.bone];
    const groupLabel=id=>BODY_MEASUREMENT_GROUPS.circumference.includes(id)?'Tape / circumference':BODY_MEASUREMENT_GROUPS.composition.includes(id)?'Body composition':'Bone composition';
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="bodyMeasurementModal"><div class="direct-entry-card body-measurement-card"><div class="section-head"><div><span class="tile-kicker">HEALTH · MEASUREMENTS</span><h2>Add body measurement</h2><p>Choose what you measured. DEXA is recorded as the source/method, not as a separate health category.</p></div><button class="icon-btn" id="closeBodyMeasurement">×</button></div><form id="bodyMeasurementForm" class="direct-entry-form"><label class="wide">Measurement<select id="bodyMeasurementType">${['circumference','composition','bone'].map(group=>`<optgroup label="${group==='circumference'?'Body measurements':group==='composition'?'Body composition':'Bone composition'}">${BODY_MEASUREMENT_GROUPS[group].map(id=>`<option value="${id}" ${id===initial?'selected':''}>${esc(METRICS[id].label)}</option>`).join('')}</optgroup>`).join('')}</select></label><label>Date<input id="bodyMeasurementDate" type="date" value="${esc(activeDay())}" required></label><label>Value <span id="bodyMeasurementUnit">${esc(METRICS[initial]?.unit||'')}</span><input id="bodyMeasurementValue" type="number" step="0.01" required></label><label>Source / method<select id="bodyMeasurementSource"><option value="manual">Manual / tape</option><option value="scale">Scale / smart scale</option><option value="dexa">DEXA</option><option value="clinical">Clinical measurement</option><option value="other">Other</option></select></label><label class="wide">Notes (optional)<textarea id="bodyMeasurementNotes" rows="2"></textarea></label><div class="measurement-source-note wide" id="bodyMeasurementSourceNote">Measurement method is preserved so ZEKE does not treat estimates from different methods as interchangeable.</div><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelBodyMeasurement">Cancel</button><button type="submit" class="primary">Save measurement</button></div></form></div></div>`);
    const close=()=>$('#bodyMeasurementModal')?.remove();$('#closeBodyMeasurement').onclick=close;$('#cancelBodyMeasurement').onclick=close;$('#bodyMeasurementModal').onclick=e=>{if(e.target.id==='bodyMeasurementModal')close()};
    $('#bodyMeasurementType').onchange=e=>{$('#bodyMeasurementUnit').textContent=METRICS[e.target.value]?.unit||'';const composition=BODY_MEASUREMENT_GROUPS.composition.includes(e.target.value)||BODY_MEASUREMENT_GROUPS.bone.includes(e.target.value);if(composition&&$('#bodyMeasurementSource').value==='manual')$('#bodyMeasurementSource').value='dexa'};
    $('#bodyMeasurementForm').onsubmit=async e=>{e.preventDefault();const id=$('#bodyMeasurementType').value,meta=METRICS[id],value=Number($('#bodyMeasurementValue').value),date=$('#bodyMeasurementDate').value,method=$('#bodyMeasurementSource').value,notes=$('#bodyMeasurementNotes').value.trim();if(!Number.isFinite(value))return;const created=await ZekeData.addEvent({category:'measurement',timestamp:`${date}T12:00:00`,raw_text:notes,structured:{metric_id:id,value,unit:meta.unit,measurement_group:groupLabel(id),measurement_method:method,interpretation_status:'confirmed'},provenance:{source:'direct-body-measurement',measurement_method:method}});state.lastSave={ids:[created.id],route:'health',metric:id,label:`${meta.label} entry`};close();await refreshData();render();showToast(`${meta.label} logged.`)};
  }

  function openMetricEntryModal(id){
    const meta=METRICS[id]||{label:id.replaceAll('_',' '),unit:''};$('#metricEntryModal')?.remove();
    if(id==='sleep_duration'){
      document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="metricEntryModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Log sleep</h2><p>Use the wake-up date. Pull-down times avoid mobile keyboard and zoom problems.</p></div><button class="icon-btn" id="closeMetricEntry">×</button></div><form id="metricEntryForm" class="direct-entry-form"><label>Wake-up date<input id="sleepWakeDate" type="date" value="${esc(activeDay())}" required></label><div class="wide sleep-time-grid">${clockSelects('sleepStart','Sleep started',{hour:'11',minute:'00',ampm:'PM'})}${clockSelects('sleepEnd','Woke up',{hour:'7',minute:'00',ampm:'AM'})}</div><label>Quality<select id="sleepQuality"><option value="">Not recorded</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option></select></label><label>Interruptions<select id="sleepInterruptions"><option value="">Not recorded</option>${Array.from({length:11},(_,i)=>`<option value="${i}">${i}</option>`).join('')}</select></label><label class="wide">Notes (optional)<textarea id="metricEntryNotes" placeholder="For example: slept well, woke once, shoulder discomfort"></textarea></label><p class="form-error wide" id="sleepEntryError" hidden></p><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelMetricEntry">Cancel</button><button type="submit" class="primary">Save sleep</button></div></form></div></div>`);
      const close=()=>$('#metricEntryModal')?.remove();$('#closeMetricEntry').onclick=close;$('#cancelMetricEntry').onclick=close;
      $('#metricEntryForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,saveBtn=form.querySelector('button[type=submit]'),errorBox=$('#sleepEntryError');saveBtn.disabled=true;saveBtn.textContent='Saving to storage…';errorBox.hidden=true;const wakeDate=$('#sleepWakeDate').value,startClock=selectedClock('sleepStart'),endClock=selectedClock('sleepEnd'),quality=$('#sleepQuality').value,interruptions=$('#sleepInterruptions').value===''?null:Number($('#sleepInterruptions').value),notes=$('#metricEntryNotes').value.trim();let end=new Date(`${wakeDate}T${endClock}:00`),start=new Date(`${wakeDate}T${startClock}:00`);if(start>=end)start.setDate(start.getDate()-1);const duration=(end-start)/36e5;if(!Number.isFinite(duration)||duration<=0||duration>24){$('#sleepEntryError').hidden=false;$('#sleepEntryError').textContent='Check the start and wake times. Sleep duration must be between 0 and 24 hours.';return;}const candidate={category:'sleep',timestamp:end.toISOString(),raw_text:notes||`Sleep from ${startClock} to ${endClock}`,structured:{metric_id:'sleep_duration',value:Number(duration.toFixed(2)),unit:'hr',start_time:start.toISOString(),end_time:end.toISOString(),wake_date:wakeDate,event_date:wakeDate,sleep_quality:quality||null,interruptions,notes,interpretation_status:'confirmed',include_in_analysis:true},provenance:{source:'direct-tile-entry',entry_mode:'structured-form',transaction_id:(globalThis.crypto?.randomUUID?.()||`sleep-${Date.now()}`)}};const dupes=await ZekeData.findLikelyDuplicates(candidate,0.94);if(dupes.length&&!confirm('A very similar sleep record already exists. Save another entry anyway?'))return;let created;try{created=await ZekeData.addEvent(candidate);}catch(err){saveBtn.disabled=false;saveBtn.textContent='Try Save Again';errorBox.hidden=false;errorBox.textContent=`Sleep was not saved: ${err?.message||'Storage connection unavailable'}`;openStorageReconnectDialog?.({onReconnect:()=>form.requestSubmit()});return;}saveBtn.textContent='Saved';state.lastSave={ids:[created.id],route:'health',metric:'sleep_duration',label:'sleep entry'};close();state.healthTab='sleep';localStorage.setItem('zeke.health.libraryTab.v1','sleep');await refreshData();render();showToast(`Sleep logged: ${durationLabel(duration)} ending ${fmtDate(end,{month:'short',day:'numeric'})}.`);};
      return;
    }
    let fields='';if(id==='blood_pressure')fields=`<label>Systolic<input id="metricSys" type="number" min="1" required></label><label>Diastolic<input id="metricDia" type="number" min="1" required></label><label>Pulse (optional)<input id="metricPulse" type="number" min="1"></label>`;else fields=`<label>${esc(meta.label)} (${esc(meta.unit||'value')})<input id="metricValueInput" type="number" step="0.1" required></label>`;document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="metricEntryModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Log ${esc(meta.label)}</h2><p>No prior value will be copied.</p></div><button class="icon-btn" id="closeMetricEntry">×</button></div><form id="metricEntryForm" class="direct-entry-form"><label>Date<input id="metricEntryDate" type="date" value="${esc(activeDay())}" required></label>${fields}<label class="wide">Notes (optional)<textarea id="metricEntryNotes"></textarea></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelMetricEntry">Cancel</button><button type="submit" class="primary">Save</button></div></form></div></div>`);const close=()=>$('#metricEntryModal')?.remove();$('#closeMetricEntry').onclick=close;$('#cancelMetricEntry').onclick=close;$('#metricEntryForm').onsubmit=async e=>{e.preventDefault();const date=$('#metricEntryDate').value,notes=$('#metricEntryNotes').value.trim(),created=[];if(id==='blood_pressure'){for(const [metric,el] of [['bp_systolic','#metricSys'],['bp_diastolic','#metricDia'],['resting_hr','#metricPulse']]){const v=Number($(el)?.value);if(Number.isFinite(v)&&v>0)created.push(await ZekeData.addEvent({category:'measurement',timestamp:`${date}T12:00:00`,raw_text:notes,structured:{metric_id:metric,value:v,unit:metric==='resting_hr'?'bpm':'mmHg',interpretation_status:'confirmed'},provenance:{source:'direct-tile-entry'}}))}}else{const v=Number($('#metricValueInput').value);if(!Number.isFinite(v))return;created.push(await ZekeData.addEvent({category:id==='a1c'?'lab':'measurement',timestamp:`${date}T12:00:00`,raw_text:notes,structured:{metric_id:id,value:v,unit:meta.unit,interpretation_status:'confirmed'},provenance:{source:'direct-tile-entry'}}))}state.lastSave={ids:created.map(x=>x.id),route:'health',metric:id,label:`${meta.label} entry`};close();await refreshData();render();showToast(`${meta.label} logged for ${fmtDate(date+'T12:00:00',{month:'short',day:'numeric'})}.`)};
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
    return `<section class="panel dashboard-insights-tile"><div class="section-head"><div><span class="tile-kicker">INSIGHTS</span><h2>${esc(headline)}</h2><p>${esc(detail)}</p></div><span class="insight-count">${q+discoveries+patterns}</span></div><div class="insight-tile-actions"><button class="primary compact" data-route="insights">Open Discover</button>${q?'<button class="secondary compact" data-route="questions">Review question</button>':''}</div></section>`;
  }

  function lifeEventsPageHTML(){
    const rows=lifeEventRows();
    return `<div class="page-head"><div><h1>Life & Symptoms</h1><p>Start typing what happened. ZEKE maps your wording to a structured concept and asks only for relevant details.</p></div><button class="primary" id="addLifeEvent">+ Record something</button></div><section class="privacy-banner"><strong>Search first. Structure behind the scenes.</strong><span>Original wording is preserved. Private records use neutral previews, and Pattern Lab receives only the variables you permit.</span></section><section class="panel concept-entry-launch"><div><h2>What would you like to record?</h2><p>Symptoms, food exposures, cycle events, relationships, stress, travel, and other life context use the same type-and-select flow.</p></div><button class="primary" id="startConceptEntry">Start typing</button></section><section class="panel"><div class="section-head"><div><h2>Recent events</h2><p>${rows.length} recorded event${rows.length===1?'':'s'}. Associations are not treated as causes.</p></div></div>${rows.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Subject</th><th>Type</th><th>Summary</th><th>Privacy</th></tr></thead><tbody>${rows.slice(0,80).map(e=>`<tr><td>${esc(fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'}))}</td><td>${esc(e.structured?.subject_label||e.structured?.subject_type||'Self')}</td><td>${esc((semanticCategory(e)||e.category).replaceAll('_',' '))}</td><td>${esc(humanEvent(e))}</td><td>${e.structured?.private?'Private':'Standard'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-inline">No life-context events yet. Start typing to create the first one.</div>'}</section>`;
  }

  function numericFeature(e,key){ const raw=e.structured?.[key]; if(raw==null||raw==='')return null; const v=Number(raw); return Number.isFinite(v)?v:null; }
  function pairedDailyData(){
    const days=new Map();
    const ensure=day=>{if(!days.has(day))days.set(day,{day});return days.get(day)};
    const put=(day,key,val)=>{const row=ensure(day);row[key]=(Number(row[key])||0)+Number(val||0)};
    const set=(day,key,val)=>{if(val!=null&&val!==''&&Number.isFinite(Number(val)))ensure(day)[key]=Number(val)};
    for(const e of state.events){const day=localDay(new Date(e.timestamp||e.recorded_at)),cat=semanticCategory(e)||e.category,st=e.structured||{};
      if(st.include_in_analysis===false)continue;
      if(['measurement','lab','sleep'].includes(cat)||canonicalMetric(metricId(e))==='sleep_duration'){const id=canonicalMetric(metricId(e)),v=Number(metricValue(e));if(Number.isFinite(v))set(day,id,v)}
      const concept=conceptById(st.concept_id);
      if(concept){for(const [key,w] of concept.analysis||[])put(day,key,(Number(st.severity??st.intensity)||1)*w);put(day,`concept_${concept.id.replace(/[^a-z0-9]+/g,'_')}`,Number(st.severity??st.intensity)||1);continue}
      if(cat==='symptom'){const name=String(st.name||st.symptom||'symptom').toLowerCase().replace(/[^a-z0-9]+/g,'_');put(day,`symptom_${name}`,Number(st.severity)||1)}
      if(cat==='nutrition_exposure' && /gluten/i.test(st.name||st.exposure||''))put(day,'gluten_exposure',(({none:0,trace:1,some:2,moderate:2,high:3}[String(st.exposure_level||'').toLowerCase()] ?? Number(st.amount)) || 1));
      if(cat==='life_event'){const name=String(st.name||st.event_type||'life_event').toLowerCase().replace(/[^a-z0-9]+/g,'_');put(day,`event_${name}`,Number(st.intensity)||1)}
      if(cat==='cycle')put(day,`cycle_${String(st.subject_type||'self')}`,1);
    }
    for(const [name,sessions] of workoutGroups({respectRange:false}))for(const session of sessions.filter(x=>!x.placeholder&&x.date)){
      const day=localDay(new Date(session.date)),prefix=activityFeaturePrefix(name);put(day,`${prefix}sessions`,1);
      set(day,`${prefix}load`,session.weight);set(day,`${prefix}reps`,session.reps);set(day,`${prefix}duration`,session.duration_min);set(day,`${prefix}rpe`,session.rpe);set(day,`${prefix}pain`,session.pain);
    }
    return [...days.values()].sort((a,b)=>a.day.localeCompare(b.day));
  }

  function correlation(x,y){const pairs=x.map((v,i)=>[v,y[i]]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));if(pairs.length<5)return null;const mx=pairs.reduce((a,p)=>a+p[0],0)/pairs.length,my=pairs.reduce((a,p)=>a+p[1],0)/pairs.length;let num=0,dx=0,dy=0;for(const [a,b] of pairs){num+=(a-mx)*(b-my);dx+=(a-mx)**2;dy+=(b-my)**2}return dx&&dy?{r:num/Math.sqrt(dx*dy),n:pairs.length}:null}
  function activityPatternMeta(key){const m=String(key||'').match(/^activity_(.+)_(sessions|load|reps|duration|rpe|pain)$/);return m?{activity:m[1],metric:m[2]}:null}
  function conceptualPair(a,b){const pair=[a,b].sort().join('|');return pair==='a1c|average_glucose'||pair==='body_fat_pct|weight'||pair==='bp_diastolic|bp_systolic'}
  function patternCandidates(){
    const raw=allPatternCandidates(),data=pairedDailyData();
    const days=data.map((_,i)=>i);
    return raw.filter(p=>{
      if(Math.abs(p.r)<.45)return false;
      const am=activityPatternMeta(p.a),bm=activityPatternMeta(p.b);
      if((am||bm)&&p.n<8)return false;if(am&&bm){if(am.activity!==bm.activity)return false;if(['load','reps','rpe'].includes(am.metric)&&['load','reps','rpe'].includes(bm.metric))return false;}
      if(!am&&!bm&&p.n<6&&!conceptualPair(p.a,p.b))return false;
      if(!conceptualPair(p.a,p.b)&&p.n<10)return false;
      const ca=correlation(data.map(r=>r[p.a]),days),cb=correlation(data.map(r=>r[p.b]),days);if(ca&&cb&&Math.abs(ca.r)>.72&&Math.abs(cb.r)>.72&&Math.sign(ca.r)===Math.sign(cb.r)&&!conceptualPair(p.a,p.b))return false;
      return true;
    }).slice(0,8);
  }
  function prettyVar(k){
    const key=String(k||'');
    const activity=key.match(/^activity_(.+)_(sessions|load|reps|duration|rpe|pain)$/);
    if(activity){const name=activity[1].replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase()),metric={sessions:'sessions',load:'load',reps:'repetitions',duration:'duration',rpe:'RPE',pain:'pain'}[activity[2]];return `${name} ${metric}`;}
    return key.replace(/^symptom_/,'').replace(/^event_/,'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
  }
  function openPatternLab(focus=''){
    state.patternFocus=focus||'';state.insightsView='pattern-lab';
    try{sessionStorage.setItem('zeke-insights-view','pattern-lab');if(focus)sessionStorage.setItem('zeke-pattern-focus',focus);else sessionStorage.removeItem('zeke-pattern-focus')}catch(_){}
    go('insights');
  }
  function patternLabPageHTML(){
    const data=pairedDailyData(),patterns=patternCandidates(),rawCount=allPatternCandidates().filter(p=>Math.abs(p.r)>=.25).length,potential=potentialHealthEvents().slice(0,8);
    return `<div class="page-head"><div><button class="text-action" data-insights-view="overview">← Back to Discover</button><h1>Explore all patterns</h1><p>Advanced deterministic screening. These are associations to inspect, not recommendations or causal conclusions.</p></div><button class="secondary" id="runPatternLab">Refresh analysis</button></div><section class="pattern-summary"><div><b>${data.length}</b><span>days with structured data</span></div><div><b>${patterns.length}</b><span>patterns passed relevance screening</span></div><div><b>${Math.max(0,rawCount-patterns.length)}</b><span>weak/trivial candidates hidden</span></div></section><section class="panel"><div class="section-head"><div><h2>Patterns worth inspecting</h2><p>ZEKE suppresses tiny samples, cross-exercise workout artifacts, and likely shared time trends from this user-facing list.</p></div></div>${patterns.length?`<div class="pattern-grid">${patterns.map(p=>`<article class="pattern-card"><span class="confidence ${Math.abs(p.r)>.7?'high':'moderate'}">${conceptualPair(p.a,p.b)?'Expected relationship to inspect':'Exploratory relationship'}</span><h3>${esc(prettyVar(p.a))} ↔ ${esc(prettyVar(p.b))}</h3><p>${p.r>0?'They moved in the same direction over paired dates.':'When one was higher, the other tended to be lower.'}</p><div class="pattern-stats"><b>r = ${p.r.toFixed(2)}</b><span>n = ${p.n} paired days</span></div><small>Association is not causation. Missing data and third variables may explain the pattern.</small></article>`).join('')}</div>`:'<div class="empty-inline">No relationship currently clears ZEKE’s relevance screen. Raw calculations are intentionally not promoted just because |r| is large.</div>'}</section>${potential.length?`<section class="panel potential-events-panel"><div class="section-head"><div><h2>Context that may matter later</h2><p>Preserved observations remain provisional until linked or confirmed.</p></div></div><div class="potential-events-list">${potential.map(e=>`<article><time>${esc(fmtDate(e.timestamp,{month:'short',day:'numeric',year:'numeric'}))}</time><div><strong>${esc(e.structured?.summary||e.raw_text)}</strong><small>${esc((e.structured?.tentative_tags||[]).join(', ')||'Unclassified context')}</small></div></article>`).join('')}</div></section>`:''}`;
  }
  function discoveryCards(){
    const cards=[];const trends=availableMetrics().map(metricRecentInsight).filter(Boolean).slice(0,3);for(const t of trends)cards.push({kind:'Recent trend',title:t.title,text:t.summary,context:t.context||'',action:'',evidence:[]});
    const patterns=patternCandidates().slice(0,2);for(const p of patterns)cards.push({kind:'Relationship to inspect',title:`${prettyVar(p.a)} ↔ ${prettyVar(p.b)}`,text:`A screened descriptive association appears across ${p.n} paired days (r = ${p.r.toFixed(2)}).`,context:'ZEKE filtered out smaller and likely same-session/time-trend artifacts; this still does not establish causation.',action:'pattern',key:`${p.a}:${p.b}`,evidence:relationshipResearch([p.a,p.b])});
    return cards;
  }
  function insightsPageHTML(){
    if(state.insightsView==='pattern-lab')return patternLabPageHTML();
    const cards=discoveryCards();
    const body=cards.length?cards.map(c=>{
      const context=c.context?`<p class="discovery-context">${esc(c.context)}</p>`:'';
      const evidence=(c.evidence||[]).length?`<div class="discovery-evidence">${c.evidence.map(item=>`<a class="text-action external-evidence-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a>`).join('')}</div>`:'';
      const action=c.action==='pattern'?'<button class="secondary compact" data-insights-view="pattern-lab">Inspect supporting pattern</button>':'';
      return `<article class="panel discovery-card"><span class="tile-kicker">${esc(c.kind)}</span><h2>${esc(c.title)}</h2><p>${esc(c.text)}</p>${context}${evidence}${action}</article>`;
    }).join(''):'<section class="panel"><div class="empty-inline">Nothing new clears ZEKE’s usefulness threshold yet. More repeated data will create better recent comparisons.</div></section>';
    return `<div class="page-head"><div><h1>Discover</h1><p>Things in your record that are interesting enough to show you — with context, limitations, and evidence where it helps.</p></div><button class="secondary compact" data-insights-view="pattern-lab">Explore all patterns</button></div>${cards.length?`<section class="discover-feed">${body}</section>`:body}${thinkingHTML()}`;
  }

  function openLifeEventModal(kind='symptom'){
    const preferred=conceptDomainForTemplate(kind); $('#lifeEventModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="lifeEventModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Record an event</h2><p>Type what happened, then select the closest concept. Your original wording remains attached.</p></div><button class="icon-btn" id="closeLifeEvent">×</button></div><form id="lifeEventForm" class="direct-entry-form"><label class="wide concept-search-label">What happened?<input id="lifeName" autocomplete="off" placeholder="Start typing: migraine, argument, spotting, travel…" required><div id="conceptMatches" class="concept-matches"></div></label><input id="lifeConceptId" type="hidden"><label>Start date<input id="lifeDate" type="date" value="${esc(activeDay())}" required></label><label>End date (optional)<input id="lifeEndDate" type="date"></label><label class="checkbox-line"><input id="lifeOngoing" type="checkbox"> Ongoing</label><label class="checkbox-line"><input id="lifeApproximate" type="checkbox"> Date/range is approximate</label><label>Subject<select id="lifeSubject"><option value="self">Me</option><option value="partner">Partner</option><option value="child">Child / family member</option><option value="other">Other</option></select></label><label>Severity / intensity (0–10)<input id="lifeSeverity" type="number" min="0" max="10" step="1"></label><label>Duration (optional)<input id="lifeDuration" placeholder="e.g., 2 hours"></label><label class="wide">Notes / context<textarea id="lifeNotes" placeholder="Optional details, triggers, interventions, or outcome"></textarea></label><label class="wide checkbox-line"><input id="lifePrivate" type="checkbox"> Store in the PIN-secured Private Vault with a neutral preview</label><label class="wide checkbox-line"><input id="lifeAnalyze" type="checkbox" checked> Allow approved structured variables in Pattern Lab</label><label class="wide checkbox-line"><input id="lifeAI" type="checkbox"> Allow this event to be sent to connected AI for interpretation</label><p class="wide form-error" id="lifeEventError" hidden></p><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelLifeEvent">Cancel</button><button type="submit" class="primary">Save event</button></div></form></div></div>`);
    const close=()=>$('#lifeEventModal')?.remove(); $('#closeLifeEvent').onclick=close; $('#cancelLifeEvent').onclick=close;
    const input=$('#lifeName'),matches=$('#conceptMatches'),hidden=$('#lifeConceptId');
    const draw=()=>{const found=conceptSearch(input.value,preferred);matches.innerHTML=found.map(c=>`<button type="button" class="concept-option" data-concept-id="${esc(c.id)}"><strong>${esc(c.label)}</strong><span>${esc(c.domain)}${c.parents.length?' · related to '+conceptById(c.parents[0])?.label:''}</span></button>`).join('')||`<div class="concept-empty">No confident local match. <button type="button" class="text-action" id="consultConceptAI">Ask ZEKE to interpret this</button></div>`;$$('[data-concept-id]',matches).forEach(b=>b.onclick=()=>{const c=conceptById(b.dataset.conceptId);hidden.value=c.id;input.value=c.label;matches.innerHTML=`<div class="concept-selected"><strong>${esc(c.label)}</strong><span>Selected structured concept</span></div>`})};
    input.addEventListener('input',()=>{hidden.value='';draw()}); input.addEventListener('focus',draw); draw();
    $('#lifeEventForm').onsubmit=async e=>{e.preventDefault();const original=input.value.trim(),date=$('#lifeDate').value,endDate=$('#lifeEndDate').value,ongoing=$('#lifeOngoing').checked,approximate=$('#lifeApproximate').checked;if(!original)return;if(endDate&&endDate<date){const err=$('#lifeEventError');err.hidden=false;err.textContent='End date cannot be before the start date.';return;}let concept=conceptById(hidden.value);if(!concept){concept={id:`custom.${preferred}.${original.toLowerCase().replace(/[^a-z0-9]+/g,'_')}`,label:original,domain:preferred,category:LIFE_TEMPLATES[kind]?.category||'life_event',parents:[],analysis:[[original.toLowerCase().replace(/[^a-z0-9]+/g,'_'),1]]}}
      const isPrivate=$('#lifePrivate').checked,notes=$('#lifeNotes').value.trim(),subject=$('#lifeSubject').value; const err=$('#lifeEventError');
      if(isPrivate&&!vaultConfig()){err.hidden=false;err.textContent='Set a Private Vault PIN in Settings before saving encrypted private data.';return}
      if(isPrivate&&!vaultUnlocked()){const pin=prompt('Enter your Private Vault PIN to encrypt this event.');if(!pin||!await unlockVault(pin)){err.hidden=false;err.textContent='The vault could not be unlocked.';return}}
      let privatePayload=null; if(isPrivate)privatePayload=await encryptPrivatePayload({original_wording:original,notes});
      const st={name:concept.label,original_wording:isPrivate?'Private event':original,concept_id:concept.id,concept_label:concept.label,concept_domain:concept.domain,concept_parents:concept.parents||[],analysis_weights:concept.analysis||[],event_type:kind,start_date:date,end_date:ongoing?null:(endDate||null),ongoing,approximate_date:approximate,severity:Number($('#lifeSeverity').value)||null,intensity:Number($('#lifeSeverity').value)||null,duration:$('#lifeDuration').value||'',subject_type:subject,subject_label:{self:'Me',partner:'Partner',child:'Child / family member',other:'Other'}[subject],private:isPrivate,private_payload:privatePayload,include_in_analysis:$('#lifeAnalyze').checked,allow_ai:$('#lifeAI').checked&&!isPrivate,interpretation_status:'confirmed'};
      await ZekeData.addEvent({category:concept.category,timestamp:`${date}T12:00:00`,raw_text:isPrivate?'':notes,structured:st,provenance:{source:'concept-search-entry',concept_version:1}});close();await refreshData();render();showToast(`${concept.label} logged.`)};
  }

  function legacyLocalProfile(){try{return JSON.parse(localStorage.getItem('zeke-user-profile')||'{}')||{}}catch(_){return {}}}
  function userProfile(){return state.preferences?.user_profile||legacyLocalProfile()||{}}
  function preferredName(){ return String(userProfile().preferred_name||'').trim(); }
  function greetingText(){
    const greeting=new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
    const name=preferredName(); return name?`${greeting}, ${name}`:greeting;
  }

  function navHTML() {
    const items=[['dashboard','⌂','Dashboard'],['health','♡','Health'],['fitness','⌁','Fitness'],['calendar','▣','Calendar'],['insights','◇','Discover'],['documents','▤','Documents']];
    const navItems=items.map(([id,icon,label])=>`<button class="nav-item ${state.route===id?'active':''}" data-route="${id}" title="${esc(label)}"><span>${icon}</span><b>${esc(label)}</b></button>`).join('');
    const questions=reviewTasks().length;
    return `<aside class="sidebar" id="sidebar"><div class="brand"><button class="brand-home" data-route="dashboard" title="Return to Dashboard"><img class="brand-logo" src="./assets/branding/zeke-mark-provisional.png" alt="Project ZEKE"></button><div><strong>PROJECT ZEKE</strong><span>One thread. Everything connected.</span></div><button class="sidebar-close" id="sidebarClose" aria-label="Close navigation">×</button></div><nav>${navItems}<button class="nav-item" id="globalLogNav" title="Log information"><span>＋</span><b>Log</b></button><button class="nav-item" id="openTalkNav" title="Talk to ZEKE"><span>✦</span><b>Talk to ZEKE</b></button></nav><button class="questions-for-you-card ${questions?'has-questions':''}" data-route="questions"><span>💬</span><div><strong>${questions} Question${questions===1?'':'s'} for You</strong><small>${questions?'To confirm recent entries and improve insights.':'Nothing is waiting right now.'}</small></div><b>View</b></button><div class="sidebar-spacer"></div><button class="nav-item settings-nav ${state.route==='settings'?'active':''}" data-route="settings" title="Settings"><span>⚙</span><b>Settings</b></button><div class="privacy-note">Private by design. Your records stay with your chosen storage provider.</div><div class="build-label">v${esc(BUILD.version)} · ${esc(BUILD.build)}</div></aside><div class="sidebar-scrim" id="sidebarScrim"></div><nav class="mobile-bottom-nav" aria-label="Primary navigation"><button class="mobile-nav-item ${state.route==='dashboard'?'active':''}" data-route="dashboard"><span>⌂</span><b>Home</b></button><button class="mobile-nav-item ${state.route==='health'?'active':''}" data-route="health"><span>♡</span><b>Health</b></button><button class="mobile-nav-item mobile-zeke-entry" id="mobileLogButton" aria-label="Log information"><span>＋</span><b>Log</b></button><button class="mobile-nav-item ${state.route==='fitness'?'active':''}" data-route="fitness"><span>⌁</span><b>Fitness</b></button><button class="mobile-nav-item" id="mobileMoreButton"><span>•••</span><b>More</b></button></nav>`;
  }

  function openGlobalSearchModal(){
    $('#globalSearchModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="globalSearchModal"><div class="direct-entry-card global-search-card"><div class="section-head"><div><h2>Search ZEKE</h2><p>Search verified records, conversation, discoveries, and questions.</p></div><button class="icon-btn" id="closeGlobalSearch" aria-label="Close search">×</button></div><label class="search-field">Search<input id="globalSearchInput" type="search" autocomplete="off" placeholder="Try sleep, chest press, Mounjaro, or lab"></label><div class="global-search-results" id="globalSearchResults"><div class="empty-inline">Start typing to search.</div></div></div></div>`);
    const close=()=>$('#globalSearchModal')?.remove();$('#closeGlobalSearch').onclick=close;$('#globalSearchModal').onclick=e=>{if(e.target.id==='globalSearchModal')close()};
    const input=$('#globalSearchInput'),out=$('#globalSearchResults');
    input.oninput=()=>{const q=input.value.trim().toLowerCase();if(q.length<2){out.innerHTML='<div class="empty-inline">Enter at least two characters.</div>';return;}const rows=[];
      for(const e of state.events.filter(recordIsActive)){const text=`${humanEvent(e)} ${e.raw_text||''} ${JSON.stringify(e.structured||{})}`.toLowerCase();if(text.includes(q))rows.push({kind:'Health / record',title:humanEvent(e),meta:`${fmtDate(e.timestamp||e.recorded_at,{month:'short',day:'numeric',year:'numeric'})} · ${semanticCategory(e).replaceAll('_',' ')}`,route:semanticCategory(e)==='workout'?'fitness':'health'});}
      for(const m of state.conversation){const text=String(m.text||m.content||'');if(text.toLowerCase().includes(q))rows.push({kind:'Conversation',title:text.slice(0,180),meta:fmtDate(m.timestamp||m.created_at,{month:'short',day:'numeric',year:'numeric'}),route:'dashboard',talk:true});}
      for(const d of state.discoveries){const text=`${d.title||''} ${d.summary||''}`;if(text.toLowerCase().includes(q))rows.push({kind:'Discover',title:d.title||'Observation',meta:d.summary||'',route:'insights'});}
      out.innerHTML=rows.length?rows.slice(0,30).map((r,i)=>`<button class="search-result" data-search-route="${esc(r.route)}" ${r.talk?'data-search-talk="1"':''}><span>${esc(r.kind)}</span><strong>${esc(r.title)}</strong><small>${esc(r.meta||'')}</small></button>`).join(''):'<div class="empty-inline">No matching ZEKE records were found.</div>';
      $$('[data-search-route]',out).forEach(el=>el.onclick=()=>{const route=el.dataset.searchRoute,talk=el.dataset.searchTalk;close();go(route);if(talk)setTimeout(()=>$('#globalTalkButton')?.click(),0)});
    };setTimeout(()=>input.focus(),0);
  }

  function topbarHTML() {
    return `<header class="topbar"><button class="topbar-brand brand-home" data-route="dashboard" title="Return to Dashboard"><img src="./assets/branding/zeke-mark-provisional.png" alt="ZEKE"><div><strong>ZEKE</strong><span>v${esc(BUILD.version)} · ${esc(BUILD.build)}</span></div></button><div class="topbar-greeting"><h1>${esc(greetingText())}</h1><p>${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p></div><div class="top-actions"><button class="primary compact quick-log-trigger" id="quickLogBtn">+ Log</button><button class="secondary compact labeled-top-action" id="topTalkBtn" title="Open the unified conversation">Talk</button><button class="secondary compact labeled-top-action" id="searchBtn" title="Search ZEKE">Search</button><button class="secondary compact labeled-top-action" id="statusBtn" title="ZEKE status">Status</button></div></header>`;
  }

  function documentsPageHTML(){
    const batches=(state.importBatches||[]).slice().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,20);
    return `<div class="page-head"><div><h1>Documents</h1><p>Source files, import history, and contextual handoffs. ZEKE does not become a generic app launcher.</p></div></div><section class="panel"><div class="section-head"><div><h2>Import a supported file</h2><p>XLSX, XLS, JSON, CSV, TSV, PDF, and common screenshots/images use review, duplicate, clarification, and provenance safeguards. PDFs use embedded text first; OCR is used only when needed.</p></div><label class="primary file-button">Choose file<input type="file" id="importFile" accept=".xlsx,.xls,.json,.csv,.tsv,.pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*" hidden></label></div></section><section class="panel"><div class="section-head"><div><h2>Recent document activity</h2><p>Imported records keep their source and batch identity.</p></div></div>${batches.length?`<div class="document-list">${batches.map(b=>`<article><strong>${esc(b.file||b.source||b.type||'Import')}</strong><span>${esc(fmtDate(b.created_at,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}))}</span><p>${esc(b.message||b.status||'Processed')}</p></article>`).join('')}</div>`:'<div class="empty-inline">No document imports are recorded yet.</div>'}</section>`;
  }

  function connectedAppHTML() {
    let content='';
    if(state.route==='dashboard') content=dashboardHTML();
    else if(state.route==='health') content=healthPageHTML();
    else if(state.route==='fitness') content=fitnessPageHTML();
    else if(state.route==='medications') content=medicationsPageHTML();
    else if(state.route==='calendar') content=calendarPageHTML();
    else if(state.route==='life-events') content=lifeEventsPageHTML();
    else if(state.route==='insights') content=insightsPageHTML();
    else if(state.route==='documents') content=documentsPageHTML();
    else if(state.route==='data-integrity') content=dataIntegrityHTML();
    else if(state.route==='questions') content=questionsPageHTML();
    else if(state.route==='settings') content=settingsPageHTML();
    return `<div class="app-shell">${navHTML()}<main class="main-shell">${topbarHTML()}<div class="content-shell">${content}</div></main>${globalTalkHTML()}${customizeDrawerHTML()}${quickLogHTML()}<div class="toast" id="toast"></div><input type="file" id="conversationFile" hidden></div>`;
  }

  function customizeDrawerHTML() {
    if(!state.customizeOpen) return '';
    const available=availableMetrics(),order=dashboardMetricOrder(available),pinned=new Set(storedStringArray('zeke.health.metricFavorites.v1'));
    const opts=order.map((id,index)=>`<div class="drawer-metric-row"><label><input type="checkbox" data-toggle-widget="metric:${id}" ${state.hiddenWidgets.has(`metric:${id}`)?'':'checked'}> ${esc(METRICS[id]?.label||id)}</label><span>${pinned.has(id)?'Pinned':'Automatic'}</span><div><button class="icon-btn" data-metric-move="up" data-metric-id="${esc(id)}" ${index===0?'disabled':''} aria-label="Move ${esc(METRICS[id]?.label||id)} up">↑</button><button class="icon-btn" data-metric-move="down" data-metric-id="${esc(id)}" ${index===order.length-1?'disabled':''} aria-label="Move ${esc(METRICS[id]?.label||id)} down">↓</button></div></div>`).join('');
    return `<div class="drawer-backdrop" id="drawerBackdrop"><aside class="drawer"><div class="drawer-head"><h2>Customize Dashboard</h2><button class="icon-btn" id="closeDrawer">×</button></div><p>Show, hide, and reorder Health at a Glance metrics. Pinning is managed from Health.</p><div class="drawer-list">${opts||'<p>No verified metrics are available yet.</p>'}</div></aside></div>`;
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
    document.querySelectorAll('#root input:not([type=file]):not([type=button]):not([type=submit]), #root textarea, #root select, #root [contenteditable=true]').forEach(el=>{
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
    if(canonicalMetric(metricId(e))==='sleep_duration') return `Sleep: ${sleepSummary(e)}`;
    if(semanticCategory(e)==='potential_health_event') return `Potential health event: ${s.summary||e.raw_text||'Preserved observation'}`;
    if(e.category==='measurement'||e.category==='lab'||['measurement','lab','sleep'].includes(semanticCategory(e))) return `${METRICS[canonicalMetric(metricId(e))]?.label||metricId(e)||e.category}: ${metricValue(e)??'—'} ${s.unit||''}`.trim();
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
    if(key.startsWith('calendar_confirm:')) return [
      {label:'Yes — it happened',value:'question-calendar-happened'},
      {label:"No — it didn't happen",value:'question-calendar-no'},
      {label:'Already recorded',value:'question-calendar-already'},
      {label:'Different date/details',value:'question-answer'},
      {label:'Later',value:'question-later'}
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

  function isMetaConversation(text=''){
    const t=String(text||'').toLowerCase();
    const systemSubject=/\b(zeke|app|system|workflow|interface|ui|record(?:ing|ed)?|data|save(?:d|ing)?|database|why (?:can'?t|cannot) you|you (?:aren'?t|are not|didn'?t|did not))\b/.test(t);
    const productConcern=/\b(concern|bug|wrong|not working|confus|why|how come|should have|failed|failure|issue|problem|appropriately|correctly)\b/.test(t);
    return systemSubject&&productConcern;
  }
  function isConversationInterruption(text=''){
    return isMetaConversation(text)||/\?$|^(what|why|how|when|where|who|should|can|could|tell me|explain|do you|are you|did you)/i.test(String(text||'').trim());
  }
  function medicationNameFromContext(text=''){
    const inventory=medicationInventory();const combined=[text,...state.conversation.slice(-12).reverse().map(m=>m.text||'')].join(' ').toLowerCase();
    for(const name of inventory){const canonical=ZekeParser.canonicalMedicationId(name);if(combined.includes(String(name).toLowerCase())||combined.includes(canonical))return name;}
    const aliases=[['Mounjaro','mounjaro'],['Mounjaro','tirzepatide'],['Atorvastatin','atorvastatin'],['Atorvastatin','lipitor']];for(const [name,alias] of aliases)if(combined.includes(alias))return name;
    const recent=state.events.filter(e=>recordIsActive(e)&&semanticCategory(e)==='medication').sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at))[0];
    return recent?.structured?.medication_name||recent?.structured?.name||'';
  }
  function medicationLastDoseAnswer(text=''){
    if(!/\b(?:when|what date|how long ago).*\b(?:last|most recent)\b.*\b(?:dose|took|take|injection|shot)\b|\bwhen did i last (?:have|take|get|use)\b/i.test(String(text||'')))return null;
    const name=medicationNameFromContext(text);if(!name)return {text:'I can answer that once I know which medication you mean.',needsMedication:true};
    const canonical=ZekeParser.canonicalMedicationId(name),all=state.events.filter(e=>recordIsActive(e)&&semanticCategory(e)==='medication'&&ZekeParser.canonicalMedicationId(e.structured?.canonical_medication_id||e.structured?.medication_name||e.structured?.name||'')===canonical).sort((a,b)=>new Date(b.timestamp||b.recorded_at)-new Date(a.timestamp||a.recorded_at));
    const taken=all.find(e=>['taken','administered','completed'].includes(String(e.structured?.status||'').toLowerCase()));
    if(!taken)return {text:`I don't have a recorded taken dose for ${name} yet. I can show the schedule and any missed/unknown occurrences instead.`,name};
    const assumed=taken.structured?.interpretation_status==='assumed'||taken.structured?.adherence_evidence==='assumed_from_schedule'||taken.provenance?.source==='scheduled-adherence-assumption';
    const day=fmtDate(taken.timestamp||taken.recorded_at,{weekday:'long',month:'long',day:'numeric',year:'numeric'}),dose=taken.structured?.dose!=null?` ${taken.structured.dose}${taken.structured?.unit?` ${taken.structured.unit}`:''}`:'';
    const laterExceptions=all.filter(e=>new Date(e.timestamp||e.recorded_at)>new Date(taken.timestamp||taken.recorded_at)&&['missed','delayed','partial','unknown','not_taken_yet'].includes(String(e.structured?.status||'').toLowerCase()));
    return {name,event:taken,text:`Your most recent ${name}${dose} dose recorded as taken is ${day}.${assumed?' That occurrence is marked as assumed from your established schedule rather than explicitly confirmed.':''}${laterExceptions.length?` I also see ${laterExceptions.length} later exception${laterExceptions.length===1?'':'s'} (for example ${String(laterExceptions[0].structured?.status||'').replaceAll('_',' ')} on ${fmtDate(laterExceptions[0].timestamp,{month:'short',day:'numeric'})}), so I did not treat the schedule alone as proof of a later dose.`:''}`};
  }

  async function sendConversation(text) {
    text=String(text||'').trim(); if(!text||state.busy)return;
    if(isConversationInterruption(text)&&state.workflowId&&window.ZekeWorkflowEngine){const existing=ZekeWorkflowEngine.get(state.workflowId);if(existing&&!ZekeWorkflowEngine.constants.TERMINAL.includes(existing.status)){state.suspendedWorkflowId=state.workflowId;state.workflowId=null;}}
    beginWorkflow(text,{target:state.context});
    state.busy=true; pushUser(text); render();
    let raw=null;
    try { raw=await ZekeData.addRawInput(text,state.context); state.events=await ZekeData.listEvents(); updateWorkflow('understanding',{save_status:'raw_preserved',raw_event_id:raw.id},'Original wording preserved before interpretation.'); }
    catch(e){ pushZeke(`I couldn't preserve that input in connected storage yet. I won't pretend it was saved. ${e.message}`);logUnresolved('The original message could not be preserved in connected storage.',{error:e.message,save_status:'failed'});closeWorkflow('failed','The message could not be saved to connected storage.',{save_status:'failed'}); state.busy=false; render(); return; }

    if(affirmativeReply(text) && state.dialogue.activeQuestion){
      const active={...state.dialogue.activeQuestion};state.dialogue.activeQuestion=null;
      const aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);
      if(aiAvailable){
        try{const r=await ZekeAIRouter.consult({role:'background_consultant',userGoal:'Continue the active conversation after an affirmative answer.',latestUserText:text,activeQuestion:active.text,history:state.conversation.slice(0,-1),allowedOutcomes:['ANSWER_USER','ASK_CLARIFICATION','NO_ACTION']});pushZeke(r.userResponse||r.answer||'Understood. I’ll continue with that.',{source:`${r.provider}/${r.model}`,resolveQuestion:true});}
        catch(e){pushZeke('Understood. I’ll continue with that rather than treating your reply as a new record.',{resolveQuestion:true});}
      }else pushZeke('Understood. I’ll continue with that rather than treating your reply as a new record.',{resolveQuestion:true});
      await ZekeData.updateEvent(raw.id,{structured:{interpretation_status:'confirmed',intent:'conversation_answer',active_question:active.text}},{appendCorrection:false});closeWorkflow('completed','Answered the active conversation question; no new health record was created.',{save_status:'conversation_only'});state.busy=false;render();return;
    }

    const lastDose=medicationLastDoseAnswer(text);
    if(lastDose){
      pushZeke(lastDose.text);await ZekeData.updateEvent(raw.id,{structured:{...(raw.structured||{}),interpretation_status:'confirmed',intent:'medication_history_query',medication_name:lastDose.name||null,answer_event_id:lastDose.event?.id||null}},{appendCorrection:false});closeWorkflow('completed','Answered from longitudinal medication occurrences; no new dose was created.',{save_status:'conversation_only'});state.busy=false;render();return;
    }
    if(isMetaConversation(text)){
      const aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);let response='You are asking about ZEKE or its data handling, not giving me a health fact. I will keep this out of the health record. The original message remains in the conversation/audit trail only.';
      if(aiAvailable){try{const r=await ZekeAIRouter.ask(text,{task:'chat',history:state.conversation.slice(0,-1)});response=r.text||response;}catch(_){}}
      pushZeke(response);await ZekeData.updateEvent(raw.id,{structured:{...(raw.structured||{}),interpretation_status:'confirmed',intent:'product_feedback_or_meta_conversation',include_in_analysis:false}},{appendCorrection:false});window.ZekeWorkflowEngine?.technical({kind:'user-product-feedback',message:text,route:state.route});closeWorkflow('completed','Handled as product/system feedback; no health record was created.',{save_status:'conversation_only'});state.busy=false;render();return;
    }

    const bmiRequest=/\b(?:calculate|figure out|what(?:'s| is))\s+(?:my\s+)?bmi\b|\bbmi\b/i.test(text);
    if(bmiRequest){
      const heightMatch=[...state.factors].reverse().find(f=>/height/i.test(`${f.question_key||''} ${f.summary||''} ${f.answer||''}`));
      const convHeight=[...state.conversation].reverse().map(m=>m.text).find(t=>/\b\d\s*(?:ft|feet|')\s*\d{1,2}\s*(?:in|inches|\")?/i.test(t)||/\b\d'\d{1,2}\"?/i.test(t));
      const hText=String(heightMatch?.answer||heightMatch?.summary||convHeight||'');
      const hm=hText.match(/(\d)\s*(?:ft|feet|')\s*(\d{1,2})|\b(\d)'(\d{1,2})/i);
      const inches=hm?(Number(hm[1]||hm[3])*12+Number(hm[2]||hm[4])):69;
      const weights=allMetricSeries('weight').filter(x=>Number.isFinite(Number(x.value))).sort((a,b)=>new Date(a.date)-new Date(b.date));
      const latest=weights.at(-1);
      if(latest){const bmi=Number(latest.value)*703/(inches*inches);pushZeke(`Using your recorded height of ${Math.floor(inches/12)}'${inches%12}\" and your latest verified weight of ${Number(latest.value).toFixed(1)} lb, your BMI is ${bmi.toFixed(1)}. BMI is a screening measure and does not distinguish fat from muscle.`);await ZekeData.updateEvent(raw.id,{structured:{interpretation_status:'confirmed',intent:'calculate_bmi',height_in:inches,weight_lb:Number(latest.value),result:Number(bmi.toFixed(1))}},{appendCorrection:false});closeWorkflow('completed','BMI calculated from the latest verified weight; no new measurement was saved.',{save_status:'conversation_only'});state.busy=false;render();return;}
      pushZeke('I can calculate that, but I do not have a verified weight available. What weight should I use?');state.context={task:'calculate_bmi',height_in:inches};updateWorkflow('waiting_clarification',{needed:['weight'],save_status:'not_saved'},'A verified weight is required to finish the calculation.');logUnresolved('BMI calculation is waiting for a weight.',{buttons_displayed:[]});state.busy=false;render();return;
    }

    const bodyFatContext=contextualBodyFatInterpretation(text,raw.id);
    if(bodyFatContext){
      state.pending={type:'confirm',rawId:raw.id,rawText:text,parsed:bodyFatContext,workflowId:state.workflowId};updateWorkflow('waiting_confirmation',{proposed:bodyFatContext.events,save_status:'not_saved',available_actions:['Save body fat','Edit','Not body fat']},'Body-fat interpretation is ready for confirmation.');
      pushZeke(`I interpreted that as ${bodyFatContext.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Edit',value:'confirm-correct'},{label:'Not body fat',value:'confirm-ignore'}]});
      state.busy=false; render(); return;
    }

    if (state.context.healthHistory) {
      const history=historyContextFromText(text);
      state.pending={type:'history-confirm',rawId:raw.id,rawText:text,history,workflowId:state.workflowId};updateWorkflow('waiting_confirmation',{proposed:history,save_status:'not_saved',available_actions:['Save history context','Correct','Later','Ignore']},'Health-history interpretation is ready for confirmation.');
      pushZeke(`I understood that as ${history.relation} health history: ${history.summary}. Is that right?`,{choices:[{label:'Yes, save it',value:'history-save'},{label:'Not quite',value:'history-correct'},{label:'Later',value:'confirm-later'},{label:'Ignore',value:'confirm-ignore'}]});
      state.busy=false; render(); return;
    }

    const escalation=/\b(look deeper|try harder|use ai|check again|that'?s not right|not right)\b/i.test(text);
    const question=/\?$|^(what|why|how|should|can|could|tell me|explain|do you)/i.test(text);
    const aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);
    if(escalation||question) {
      updateWorkflow('ai_checking',{ai_status:'checking',save_status:'raw_preserved'},'Using connected AI for a conversational response.');
      try {
        const r=await ZekeAIRouter.ask(text,{task:escalation?'analysis':'chat',history:state.conversation.slice(0,-1)});
        pushZeke(r.text,{source:`${r.provider}/${r.model}`});window.ZekeWorkflowEngine?.ai({workflow_id:state.workflowId,provider:r.provider,model:r.model,task:escalation?'analysis':'chat',status:'success'});closeWorkflow('completed','Answered the question; no structured record was changed.',{save_status:'conversation_only',ai_status:'completed'});
      } catch(e) { pushZeke(`I couldn't reach a connected AI service just now. I preserved your message, but I won't pretend I understood more than I did. ${e.message}`);window.ZekeWorkflowEngine?.ai({workflow_id:state.workflowId,task:escalation?'analysis':'chat',status:'failed',error:e.message});logUnresolved('Connected AI was unavailable for a direct question.',{error:e.message,save_status:'raw_preserved'});closeWorkflow('failed','The message was preserved, but the requested AI response was unavailable.',{save_status:'raw_preserved',ai_status:'failed'}); }
      state.busy=false; render(); return;
    }

    let parsed=null;
    const localParsed=ZekeParser.interpret(text,parserContext());
    if(aiAvailable && looksLikeWorkoutInput(text)) {
      try {
        const ai=await ZekeAIRouter.interpretWorkout(text,{today:activeDay(),localDraft:compactWorkoutDraft(localParsed),history:state.conversation.slice(0,-1)});
        if(ai.status==='clarify'||ai.clarificationQuestion){state.pending={type:'ai-clarify',rawId:raw.id,rawText:text,ai,workflowId:state.workflowId};updateWorkflow('waiting_clarification',{ai_status:'completed',needed:[ai.clarificationQuestion||'workout detail'],save_status:'raw_preserved'},'AI identified a material missing workout detail.');logUnresolved('Workout interpretation is waiting for a material detail.',{buttons_displayed:['Answer now','Later','Ignore']});pushZeke(`${ai.clarificationQuestion||'I need one more workout detail before I save this.'} I’m asking because the answer changes how the session is structured.`,{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});state.busy=false;render();return;}
        parsed={confidence:ai.confidence||0.88,summary:ai.summary||'the workout sessions you described',events:ai.events||[],aiSource:`${ai.provider}/${ai.model}`};
      } catch(e) {
        parsed=(localParsed.events||[]).length?localParsed:null;
      }
    } else if(aiAvailable) {
      try {
        const verifiedContext={active_context:{...state.context,active_date:activeDay()},open_question:state.pending?.question?.question||null,actions:(state.actions.catalog||[]).map(a=>({label:a.label,schedule:a.schedule})),recent_verified_events:state.events.filter(e=>recordIsActive(e)&&!['raw_input','correction'].includes(e.category)).slice(-30).map(e=>({category:e.category,timestamp:e.timestamp,structured:e.structured})),potential_health_events:potentialHealthEvents().slice(0,30).map(e=>({timestamp:e.timestamp,raw_text:e.raw_text,structured:e.structured,provenance:e.provenance}))};
        const ai=await ZekeAIRouter.interpret(text,{...verifiedContext,history:state.conversation.slice(0,-1)});
        if(ai.status==='clarify'||ai.clarificationQuestion){state.pending={type:'ai-clarify',rawId:raw.id,rawText:text,ai,workflowId:state.workflowId};updateWorkflow('waiting_clarification',{ai_status:'completed',needed:[ai.clarificationQuestion||'one more detail'],save_status:'raw_preserved'},'AI requested clarification before proposing a save.');logUnresolved('Interpretation is waiting for clarification.',{buttons_displayed:['Answer now','Later','Ignore']});pushZeke(ai.clarificationQuestion||'I need one more detail before I save this.',{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});state.busy=false;render();return;}
        parsed={confidence:ai.confidence||0.8,summary:ai.summary||'the information you described',events:ai.events||[],aiSource:`${ai.provider}/${ai.model}`};
      } catch(e) { parsed=null; }
    }
    parsed ||= localParsed;
    if(parsed.clarificationQuestion && !(parsed.events||[]).length){
      state.pending={type:'needs-detail',rawId:raw.id,rawText:text,workflowId:state.workflowId};updateWorkflow('waiting_clarification',{needed:[parsed.clarificationQuestion],save_status:'raw_preserved'},'Deterministic interpretation needs one more detail.');logUnresolved('Local interpretation is waiting for clarification.',{buttons_displayed:['Answer now','Later','Ignore']});
      pushZeke(parsed.clarificationQuestion,{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});
      state.busy=false;render();return;
    }
    parsed=await addMedicationPreview(parsed);
    if(parsed.type==='ambiguity') {
      state.pending={type:'ambiguity',rawId:raw.id,rawText:text,workflowId:state.workflowId};updateWorkflow('waiting_clarification',{needed:['Choose blood pressure or bench press'],save_status:'raw_preserved',available_actions:['Blood pressure','Bench press','Later','Ignore']},'Two plausible meanings require a user choice.');logUnresolved('Input has two plausible meanings.',{buttons_displayed:['Blood pressure','Bench press','Later','Ignore']});
      pushZeke("I'm not completely sure what you meant. Were you logging a blood-pressure reading, or a bench-press set?",{choices:[
        {label:'Blood pressure',value:'ambig-bp'},{label:'Bench press',value:'ambig-bench'},{label:'Later',value:'ambig-later'},{label:'Ignore',value:'ambig-ignore'}
      ]});
      state.busy=false;render();return;
    }

    if(!aiAvailable && ((parsed.confidence||0)<0.75 || parsed.type==='unstructured' || parsed.needsClarification)) {
      try {
        const ai=await ZekeAIRouter.interpret(text,{context:state.context,localSummary:parsed.summary});
        if(ai.status==='clarify' || ai.clarificationQuestion) {
          state.pending={type:'ai-clarify',rawId:raw.id,rawText:text,ai,workflowId:state.workflowId};updateWorkflow('waiting_clarification',{ai_status:'completed',needed:[ai.clarificationQuestion||'one more detail'],save_status:'raw_preserved'},'Fallback AI consultation requested clarification.');logUnresolved('Fallback interpretation is waiting for clarification.',{buttons_displayed:['Answer now','Later','Ignore']});
          pushZeke(ai.clarificationQuestion||'I need one more detail before I save this. What did you mean?',{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});
          state.busy=false;render();return;
        }
        parsed={confidence:ai.confidence||0.8,summary:ai.summary||'AI-assisted interpretation',events:ai.events||[],aiSource:`${ai.provider}/${ai.model}`};
      } catch(e) {
        if(!(parsed.events||[]).length) {
          state.pending={type:'needs-detail',rawId:raw.id,rawText:text,workflowId:state.workflowId};updateWorkflow('waiting_clarification',{needed:['clearer description'],save_status:'raw_preserved'},'No safe structured interpretation was available.');logUnresolved('No parser or connected AI produced a safe interpretation.',{buttons_displayed:['Answer now','Later','Ignore']});
          pushZeke(`I preserved what you said, but I don't understand it well enough to structure it without guessing. Could you say a little more about what you want me to record?`,{choices:[{label:'Answer now',value:'answer-pending'},{label:'Later',value:'pending-later'},{label:'Ignore',value:'pending-ignore'}]});
          state.busy=false;render();return;
        }
      }
    }

    if(!(parsed.events||[]).length) {
      const tentativeTags=String(text).toLowerCase().match(/\b(?:sleep|fatigue|tired|pain|shoulder|stress|heart rate|workout|pt|therapy|medication|appetite|nausea|dizzy|headache)\b/g)||[];
      await ZekeData.addEvent({category:'potential_health_event',timestamp:new Date().toISOString(),raw_text:text,structured:{summary:text,interpretation_status:'provisional',include_in_analysis:true,tentative_tags:[...new Set(tentativeTags)],unresolved_reason:'not_yet_mapped',source_raw_event_id:raw.id,related_calendar_event:state.context.calendar_followup||null},provenance:{source:'conversation-potential-event',raw_event_id:raw.id}});
      await ZekeData.updateEvent(raw.id,{structured:{...(raw.structured||{}),interpretation_status:'preserved_as_potential_health_event'}},{appendCorrection:false});
      await refreshData();pushZeke('I preserved this as a potential health event. It is not being treated as a confirmed diagnosis or structured measurement, but it will be available when ZEKE reviews relationships across health, labs, sleep, calendar context, and fitness data.');closeWorkflow('completed','Preserved as a provisional potential health event; no diagnosis or measurement was created.',{save_status:'saved_provisional'}); state.busy=false;render();return;
    }
    state.pending={type:'confirm',rawId:raw.id,rawText:text,parsed,workflowId:state.workflowId};updateWorkflow('waiting_confirmation',{proposed:parsed.events,save_status:'not_saved',ai_status:parsed.aiSource?'completed':'not_needed',available_actions:['Save interpretation','Correct interpretation','Later','Ignore']},'A proposed record is ready for user confirmation.');
    pushZeke(interpretationPrompt(parsed),{choices:[{label:'Yes, save it',value:'confirm-save'},{label:'Not quite',value:'confirm-correct'},{label:'Later',value:'confirm-later'},{label:'Ignore',value:'confirm-ignore'}]});
    state.busy=false; render();
  }

  async function handleChoice(value) {
    if(value==='postsave-view'){const last=state.lastSave;if(last?.healthTab){state.healthTab=last.healthTab;localStorage.setItem('zeke.health.libraryTab.v1',state.healthTab);}if(last?.metric){state.healthTab=last.metric==='sleep_duration'?'sleep':state.healthTab;localStorage.setItem('zeke.health.libraryTab.v1',state.healthTab);state.expandedHealthMetric=last.metric;}go(last?.route||'health');return;}
    if(value==='postsave-undo'){
      const last=state.lastSave;if(!last?.ids?.length){showToast('There is no recent save to undo.','error');return;}
      beginWorkflow('Undo the most recent ZEKE save',{goal:'Undo a recently saved record',target:{event_ids:last.ids}});
      await ZekeData.undoEvents(last.ids,'User selected Undo from Talk to ZEKE');
      window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'undo',event_ids:last.ids,reason:'User selected Undo after save'});
      state.lastSave=null;await refreshData();pushZeke('Undone. The record is excluded from analysis, and the original conversation remains preserved.');closeWorkflow('completed','The recent save was undone and excluded from analysis.',{save_status:'undone'});render();return;
    }
    const p=state.pending;
    if(p?.workflowId)state.workflowId=p.workflowId;
    if(p?.type==='medication-action-confirm' && ['med-action-taken','med-action-missed','med-action-not-yet'].includes(value)) {
      const action=p.action||{},name=action.label||action.name||'Medication',canonical=ZekeParser.canonicalMedicationId(name),date=activeDay();
      const existing=state.events.find(e=>recordIsActive(e)&&semanticCategory(e)==='medication'&&String(e.timestamp||e.recorded_at||'').slice(0,10)===date&&ZekeParser.canonicalMedicationId(e.structured?.medication_name||e.structured?.name||'')===canonical),assumed=existing?.provenance?.source==='scheduled-adherence-assumption';
      if(value==='med-action-not-yet'){
        if(assumed)await ZekeData.undoEvents([existing.id],'User corrected scheduled adherence assumption: dose not taken yet');
        pushZeke(`Okay. ${name} is still due today${assumed?', and I removed the schedule-based assumption':''}. Nothing was marked complete.`);state.pending=null;state.context={};await refreshData();closeWorkflow('not_saved',`${name} remains due today; no completed dose is active.`,{save_status:'not_saved'});render();return;
      }
      const status=value==='med-action-taken'?'taken':'missed';let created=null;
      if(assumed&&status==='taken'){
        await ZekeData.updateEvent(existing.id,{structured:{...(existing.structured||{}),status:'taken',interpretation_status:'confirmed',adherence_evidence:'explicitly_confirmed'},provenance:{...(existing.provenance||{}),source:'today-action-confirmation',previous_source:'scheduled-adherence-assumption'},correction_note:'User explicitly confirmed a dose that had previously been assumed from schedule.'},{appendCorrection:true});
      }else{
        if(assumed)await ZekeData.undoEvents([existing.id],`User corrected scheduled adherence assumption: ${status}`);
        const duplicate=state.events.find(e=>recordIsActive(e)&&e.id!==existing?.id&&semanticCategory(e)==='medication'&&String(e.timestamp||e.recorded_at||'').slice(0,10)===date&&ZekeParser.canonicalMedicationId(e.structured?.medication_name||e.structured?.name||'')===canonical&&String(e.structured?.status||'').toLowerCase()===status);
        if(!duplicate)created=await ZekeData.addEvent({category:'medication',timestamp:`${date}T12:00:00`,raw_text:`${name} ${status} through Today`,structured:{medication_name:name,original_medication_name:name,canonical_medication_id:canonical,dose:action.dose??null,unit:action.unit||'',status,action_id:action.id||null,interpretation_status:'confirmed'},provenance:{source:'today-action-confirmation'}});
      }
      if(created)state.lastSave={ids:[created.id],route:'health',healthTab:'medications',label:`${name} dose`};pushZeke(status==='taken'?`${name} is explicitly confirmed as taken today.`:`Recorded. ${name} is marked missed for today.`,created?{choices:[{label:'View medication history',value:'postsave-view'},{label:'Undo this save',value:'postsave-undo'}]}:{});state.pending=null;state.context={};await refreshData();closeWorkflow('completed',`${name} recorded as ${status} for today.`,{save_status:'saved',saved_event_ids:created?[created.id]:existing?[existing.id]:[]});render();return;
    }
    if(value==='ambig-bp') {
      state.context={metric:'blood_pressure'};
      updateWorkflow('waiting_clarification',{known:{interpretation:'blood pressure'},needed:['systolic and diastolic values'],available_actions:['Provide blood pressure','Later','Ignore']},'The user identified the message as blood pressure.');
      pushZeke('Thanks. For blood pressure I need the systolic and diastolic values explicitly, such as 120/82. What were the two numbers?');
      state.pending={...p,type:'needs-detail',workflowId:state.workflowId}; render(); return;
    }
    if(value==='history-save') {
      await ZekeData.saveFactor({type:p.history.history_type,status:'active',relation:p.history.relation,summary:p.history.summary,source_raw_event_id:p.rawId,provenance:{source:'conversation'}});
      await ZekeData.updateEvent(p.rawId,{structured:{interpretation_status:'confirmed',context_type:p.history.history_type,factor_relation:p.history.relation},correction_note:'Health history interpretation confirmed'},{appendCorrection:false});
      pushZeke('Saved. I’ll keep that as health-history context and use it only when relevant.'); state.pending=null; state.context={}; await refreshData();closeWorkflow('completed','Health-history context was saved.',{save_status:'saved'}); render(); return;
    }
    if(value==='history-correct') {
      window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'interpretation_correction',original_text:p?.rawText||'',reason:'User said the health-history interpretation was not right'});
      updateWorkflow('waiting_correction',{needed:['correct relationship or detail'],save_status:'not_saved'},'The user requested a correction.');
      pushZeke('Thanks for catching that. Tell me what relationship or detail I misunderstood.'); state.pending={...p,type:'history-correction-awaiting',workflowId:state.workflowId}; render(); return;
    }
    if(value==='ambig-bench') {
      state.context={exercise:'bench press'}; const parsed=ZekeParser.interpret(p.rawText.replace(/^bp\s*/i,''),parserContext());
      state.pending={type:'confirm',rawId:p.rawId,rawText:p.rawText,parsed,workflowId:state.workflowId};
      updateWorkflow('waiting_confirmation',{known:{interpretation:'bench press'},proposed:parsed.events,available_actions:['Save bench-press record','Correct interpretation']},'The user identified the message as bench press.');
      pushZeke(`I understood that as ${parsed.summary}. Is that right?`,{choices:[{label:'Save bench-press record',value:'confirm-save'},{label:'Correct interpretation',value:'confirm-correct'}]}); render(); return;
    }
    if(['ambig-later','pending-later','confirm-later'].includes(value)) {
      logUnresolved('The user deferred this interaction.',{buttons_displayed:['Resume later'],save_status:'not_saved'});
      pushZeke('Kept for later. The original input remains preserved, and no structured record was changed.'); state.pending=null; state.context={};closeWorkflow('not_saved','Deferred for later; nothing was saved.',{save_status:'not_saved'}); render(); return;
    }
    if(['ambig-ignore','pending-ignore','confirm-ignore'].includes(value)) {
      pushZeke('Dismissed. The original note remains preserved, but ZEKE will not turn it into structured data or keep asking about it.'); state.pending=null; state.context={};closeWorkflow('dismissed','The interpretation was dismissed; nothing was saved.',{save_status:'not_saved'}); render(); return;
    }
    if(value==='confirm-correct') {
      window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'interpretation_correction',original_text:p?.rawText||'',proposed:p?.parsed?.summary||'',reason:'User selected Not quite'});
      updateWorkflow('waiting_correction',{needed:['corrected interpretation'],save_status:'not_saved',available_actions:['Describe correction','Later','Ignore']},'The proposed interpretation was rejected.');
      pushZeke('Thanks for catching that. Tell me what I got wrong, and I’ll try again without overwriting the original note.'); state.pending={...p,type:'correction-awaiting',workflowId:state.workflowId}; render(); return;
    }
    if(value==='confirm-save') {
      const candidate=(p.parsed.events||[])[0]; const dupes=(p.parsed.events||[]).length===1?await ZekeData.findLikelyDuplicates(candidate):[];
      if(dupes.length) {
        state.pending={...p,type:'duplicate',dupe:dupes[0].event,workflowId:state.workflowId};
        updateWorkflow('waiting_confirmation',{duplicate_status:'detected',known:{similar_record:humanEvent(dupes[0].event)},needed:['whether this is separate or duplicate'],available_actions:['Keep separate event','Keep existing record','Cancel']},'A likely duplicate was found before save.');
        pushZeke(`This looks very similar to ${humanEvent(dupes[0].event)} already in your record. Was this a separate event, or an accidental duplicate?`,{choices:[{label:'Keep as separate event',value:'dupe-keep'},{label:'Keep existing record',value:'dupe-discard'},{label:'Cancel without saving',value:'dupe-cancel'}]}); render();return;
      }
      await savePendingConfirmed(p); return;
    }
    if(value==='dupe-keep') { await savePendingConfirmed(p); return; }
    if(value==='dupe-discard') { pushZeke('Already recorded. I kept the existing entry and did not create another structured data point.'); state.pending=null;state.context={};await refreshData();closeWorkflow('duplicate','The existing record was kept; no duplicate was created.',{save_status:'already_saved',duplicate_status:'confirmed'});render();return; }
    if(value==='dupe-cancel') { pushZeke('Canceled. I left the original note unresolved and made no structured change.'); state.pending=null;state.context={};closeWorkflow('not_saved','Canceled before saving.',{save_status:'not_saved'});render();return; }
    if(value==='memory-confirm'&&p?.type==='memory-correction-confirm') {await ZekeData.saveFactor({...p.factor,summary:p.replacement,answer:p.replacement,updated_at:new Date().toISOString(),status:'active'});pushZeke('Saved. ZEKE will use the corrected context going forward, and the correction remains in the audit history.');state.pending=null;await refreshData();closeWorkflow('completed','Remembered context was corrected.',{save_status:'corrected'});render();return;}
    if(value==='memory-cancel'&&p?.type==='memory-correction-confirm') {pushZeke('Canceled. The remembered context was not changed.');state.pending=null;closeWorkflow('not_saved','Memory correction canceled; nothing changed.',{save_status:'not_saved'});render();return;}
    if(value==='answer-pending') { updateWorkflow('waiting_clarification',{needed:['missing detail']},'The user chose to answer now.');pushZeke('Go ahead—tell me the missing detail in your own words.'); render(); return; }
  }

  async function savePendingConfirmed(p) {
    if(p?.workflowId)state.workflowId=p.workflowId;
    const created=await ZekeData.confirmRawInput(p.rawId,p.parsed.events);
    const ids=created.map(e=>e.id);const isSleep=created.some(e=>canonicalMetric(metricId(e))==='sleep_duration');
    state.lastSave={ids,route:isSleep?'health':created.some(isWorkoutEvent)?'fitness':'health',metric:isSleep?'sleep_duration':'',label:isSleep?'sleep entry':'record'};
    if(ids.length){
      pushZeke(`Saved. I recorded ${p.parsed.summary}.`,{choices:[{label:isSleep?'View sleep entry':'View saved record',value:'postsave-view'},{label:'Undo this save',value:'postsave-undo'}]});
      closeWorkflow('completed',`Saved ${p.parsed.summary}.`,{save_status:'saved',duplicate_status:'not_found',saved_event_ids:ids});
    } else {
      pushZeke('Already recorded. I found an identical confirmed record and kept the existing entry instead of creating a duplicate.');
      closeWorkflow('duplicate','An identical confirmed record already existed.',{save_status:'already_saved',duplicate_status:'confirmed'});
    }
    state.pending=null; state.context={}; await refreshData(); render();
  }

  async function openNextQuestion() {
    const q=openQuestions()[0]; if(!q){pushZeke("I don't have anything waiting for your answer right now.");render();return;}
    const wf=beginWorkflow(q.question||'Answer a ZEKE question',{goal:`Resolve: ${q.question||'open question'}`,target:{question_id:q.id,question_key:q.question_key},known:{why_it_matters:q.why_it_matters||''},needed:['user decision or answer']});
    updateWorkflow('waiting_clarification',{available_actions:pendingQuestionChoices(q).map(x=>x.label),save_status:'not_saved'},'ZEKE opened a question that needs the user’s decision.');
    state.pending={type:'question',question:q,workflowId:wf?.id||state.workflowId};
    pushZeke(`${q.question}${q.why_it_matters?` Why I’m asking: ${q.why_it_matters}`:''}`,{choices:pendingQuestionChoices(q)}); render();
  }

  function calendarConfirmedCategory(event={}){
    const t=`${event.title||''} ${event.description||''}`.toLowerCase();
    if(/allergy|immunotherapy/.test(t))return 'immunotherapy';
    if(/vaccine|vaccination|booster|flu shot|covid shot/.test(t))return 'vaccination';
    if(/workout|gym|training|exercise/.test(t))return 'workout_context';
    if(/blood donation|donate blood|red cross/.test(t))return 'life_event';
    return 'medical_appointment';
  }
  async function confirmCalendarCandidate(q){
    const c=q.candidate_event||{},category=calendarConfirmedCategory(c),day=String(c.start||'').slice(0,10),match=calendarHealthMatch(c);
    if(match)return {already:true,event:match};
    const structured={event_type:category==='immunotherapy'?'allergy_immunotherapy':category==='vaccination'?'vaccination':category==='workout_context'?'scheduled_workout_confirmed':'appointment_attended',title:c.title||'',location:c.location||'',calendar_event_id:c.id||'',calendar_start:c.start||'',calendar_end:c.end||'',confirmation_status:'confirmed',interpretation_status:'confirmed',include_in_analysis:true};
    if(category==='immunotherapy')Object.assign(structured,{clinical_exposure_type:'allergy_immunotherapy',administration_status:'received'});
    if(category==='vaccination')Object.assign(structured,{clinical_exposure_type:'vaccination',administration_status:'received'});
    const event=await ZekeData.addEvent({category,timestamp:c.start||`${day}T12:00:00`,raw_text:c.title||'',structured,provenance:{source:'calendar-confirmed-retrospective',calendar_event_id:c.id||'',calendar_review_question_id:q.id}});
    return {already:false,event};
  }

  async function handleQuestionChoice(value) {
    const q=state.pending?.question; if(!q)return;
    if(state.pending?.workflowId)state.workflowId=state.pending.workflowId;
    showToast('Working…');
    if(value==='question-answer'){updateWorkflow('waiting_clarification',{needed:['answer in the user’s own words']},'The user chose to answer the question.');pushZeke('Go ahead—answer in your own words. I’ll interpret it in the context of this question.'); state.pending={type:'question-awaiting',question:q,workflowId:state.workflowId}; render();return;}
    if(value==='question-other'){updateWorkflow('waiting_clarification',{needed:['user-described alternative']},'The predefined choices did not fit.');pushZeke("Tell me what you want to happen in your own words. I’ll keep this question attached to your reply.");state.pending={type:'question-awaiting',question:q,other:true,workflowId:state.workflowId};render();return;}
    if(value==='question-why'){pushZeke(q.why_it_matters||'I am asking because the answer changes whether this information is saved, excluded, merged, or corrected. Nothing changes until you decide.');render();return;}
    if(value==='question-later'){await deferQuestion(q);pushZeke('Kept in Questions for You and moved behind newer questions. No data was changed.');state.pending=null;await refreshData();closeWorkflow('not_saved','Deferred for later; no data changed.',{save_status:'not_saved'});render();return;}
    if(value==='question-unknown'){await ZekeData.resolveFactor(q.id,'unknown',"I don't know");pushZeke("Recorded as unknown. I will not guess, and unsafe information will stay out of analysis.");state.pending=null;await refreshData();closeWorkflow('completed','The answer was recorded as unknown without guessing.',{save_status:'saved_context'});render();return;}
    if(value==='question-ignore'){await ZekeData.resolveFactor(q.id,'dismissed','Ignored by user');pushZeke('Dismissed. No structured data was changed.');state.pending=null;await refreshData();closeWorkflow('dismissed','The question was dismissed; no structured data changed.',{save_status:'not_saved'});render();return;}
    if(value==='question-calendar-happened'){
      const result=await confirmCalendarCandidate(q);await ZekeData.resolveFactor(q.id,'resolved',result.already?'Confirmed; existing ZEKE record already covers this event':'Confirmed happened and added from calendar review');pushZeke(result.already?'Confirmed. ZEKE already has a matching health record for that date, so I did not duplicate it.':'Confirmed and added to your longitudinal health record with calendar-review provenance.');state.pending=null;await refreshData();closeWorkflow('completed','Calendar candidate reconciled with the health record.',{save_status:result.already?'already_saved':'saved'});render();return;
    }
    if(value==='question-calendar-no'){await ZekeData.resolveFactor(q.id,'resolved',"Calendar event did not happen");pushZeke('Got it. I kept the calendar item as scheduling context only and did not add it as a health event.');state.pending=null;await refreshData();closeWorkflow('completed','Calendar candidate marked as not having occurred.',{save_status:'not_saved'});render();return;}
    if(value==='question-calendar-already'){await ZekeData.resolveFactor(q.id,'resolved','User says this event is already represented in ZEKE');pushZeke('Marked as already represented. I will not create another health event from this calendar item.');state.pending=null;await refreshData();closeWorkflow('completed','Calendar candidate marked as already represented.',{save_status:'already_saved'});render();return;}
    if(value==='question-bp-invalid'){
      const n=await invalidateBloodPressureQuestion(q);
      pushZeke(`Done. I marked ${n||'the'} related blood-pressure record${n===1?'':'s'} invalid and excluded ${n===1?'it':'them'} from charts, coaching, and AI evidence. The original import evidence remains in the audit history.`);
      state.pending=null;await refreshData();closeWorkflow('completed','Invalid blood-pressure candidate excluded from analysis.',{save_status:'corrected'});render();return;
    }
    if(value==='question-bp-keep'){
      const c=q.import_candidate||{};
      if(Number.isFinite(Number(c.systolic))&&Number.isFinite(Number(c.diastolic))){
        await ZekeData.addEvent({category:'measurement',timestamp:c.timestamp||new Date().toISOString(),structured:{metric_id:'bp_systolic',value:Number(c.systolic),unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(c.provenance||{}),source:'user-confirmed-import'}});
        await ZekeData.addEvent({category:'measurement',timestamp:c.timestamp||new Date().toISOString(),structured:{metric_id:'bp_diastolic',value:Number(c.diastolic),unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(c.provenance||{}),source:'user-confirmed-import'}});
      }
      await ZekeData.resolveFactor(q.id,'resolved','Keep as entered');pushZeke('Kept as entered. I added the confirmed pair to the event record and preserved its source.');state.pending=null;await refreshData();closeWorkflow('completed','Blood pressure was confirmed as entered.',{save_status:'saved'});render();return;}
    if(value==='question-bp-reverse'){
      const c=q.import_candidate||{};
      await ZekeData.addEvent({category:'measurement',timestamp:c.timestamp||new Date().toISOString(),structured:{metric_id:'bp_systolic',value:Number(c.diastolic),unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(c.provenance||{}),source:'user-corrected-import'}});
      await ZekeData.addEvent({category:'measurement',timestamp:c.timestamp||new Date().toISOString(),structured:{metric_id:'bp_diastolic',value:Number(c.systolic),unit:'mmHg',interpretation_status:'confirmed'},provenance:{...(c.provenance||{}),source:'user-corrected-import'}});
      await ZekeData.resolveFactor(q.id,'resolved',`Reverse to ${c.diastolic}/${c.systolic}`);
      window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'blood_pressure_order',before:`${c.systolic}/${c.diastolic}`,after:`${c.diastolic}/${c.systolic}`});
      pushZeke(`Corrected and saved as ${c.diastolic}/${c.systolic}. The original candidate remains in the audit history.`);
      state.pending=null;await refreshData();closeWorkflow('completed',`Blood pressure corrected to ${c.diastolic}/${c.systolic}.`,{save_status:'corrected'});render();return;
    }
    if(value==='question-duplicate-merge'){
      await ZekeData.resolveFactor(q.id,'resolved','Treat as duplicate; keep one canonical record');
      pushZeke('Already recorded. The existing canonical record remains; the held candidate was not added, and its import evidence remains attached to this resolution.');state.pending=null;await refreshData();closeWorkflow('duplicate','The existing canonical record was kept.',{save_status:'already_saved',duplicate_status:'confirmed'});render();return;}
    if(value==='question-duplicate-keep'){
      if(q.candidate_event) await ZekeData.addEvent({...q.candidate_event,provenance:{...(q.candidate_event.provenance||{}),source:'import-confirmed-separate'}});
      await ZekeData.resolveFactor(q.id,'resolved','Keep as separate real events');pushZeke('Saved as a separate event. The original record remains unchanged.');state.pending=null;await refreshData();closeWorkflow('completed','The candidate was confirmed as a separate event.',{save_status:'saved',duplicate_status:'intentional'});render();return;}
  }

  async function handlePendingAnswer(text) {
    if(state.pending?.workflowId)state.workflowId=state.pending.workflowId;
    if(state.pending?.type==='confirm' && affirmativeReply(text)){pushUser(text);render();await handleChoice('confirm-save');return true;}
    if(state.pending?.type==='confirm' && /^(?:no|nope|not quite|wrong|edit|change it)[.! ]*$/i.test(String(text||'').trim())){pushUser(text);render();await handleChoice('confirm-correct');return true;}
    if(state.pending?.type==='question-awaiting') {
      pushUser(text); render();
      const q=state.pending.question;
      window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'question_answer',question_id:q.id,answer:text});
      const aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);
      if(aiAvailable){
        const aiStarted=new Date().toISOString();
        updateWorkflow('ai_checking',{ai_status:'running'},'AI is checking whether the answer maps to one of the safe actions.');
        try{
          const r=await ZekeAIRouter.resolveClarification(text,{question:q.question,why:q.why_it_matters,question_key:q.question_key,allowed_actions:pendingQuestionChoices(q).map(x=>({id:x.value,label:x.label})),target:q.import_candidate||q.candidate_event||null,history:state.conversation.slice(0,-1)});
          window.ZekeWorkflowEngine?.ai({workflow_id:state.workflowId,started_at:aiStarted,provider:r.provider||'',model:r.model||'',purpose:'resolve_clarification',status:'success',action_id:r.action_id||'',confidence:r.confidence||null});
          if(r.action_id && r.action_id!=='question-other'){ await handleQuestionChoice(r.action_id); return true; }
        }catch(error){window.ZekeWorkflowEngine?.ai({workflow_id:state.workflowId,started_at:aiStarted,purpose:'resolve_clarification',status:'failed',error:String(error?.message||error)});}
      }
      updateWorkflow('waiting_clarification',{ai_status:aiAvailable?'completed':'not_available'},'Applying the answer to the open question.');
      const applied=await applyQuestionAnswer(q,text);
      if(applied.applied){
        await ZekeData.resolveFactor(q.id,'resolved',text);
        pushZeke(applied.message);
        state.pending=null;
        closeWorkflow('completed','The open question was resolved and its effect was applied.',{save_status:'saved'});
      } else {
        await ZekeData.saveFactor({...q,status:'open',answer_attempt:text,last_attempt_at:new Date().toISOString()});
        pushZeke(`${applied.message} This question remains open, so ZEKE will not treat the underlying information as resolved.`);
        state.pending={type:'question-awaiting',question:{...q,status:'open',answer_attempt:text},workflowId:state.workflowId};
        updateWorkflow('waiting_clarification',{needed:['schedule details or explicit decision'],save_status:'not_saved'},'The answer did not safely resolve the question.');
        logUnresolved('An answer attempt did not safely resolve the open question.',{question_id:q.id,answer_attempt:text,save_status:'not_saved'});
        if(applied.open_editor)setTimeout(()=>openMedicationScheduleModal(applied.medication,q),0);
      }
      await refreshData();render();return true;
    }
    if(state.pending?.type==='memory-correction') {
      pushUser(text);render();
      const factor=state.pending.factor;
      window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'memory_correction',factor_id:factor.id,before:factor.summary||factor.answer||factor.value||'',after:text});
      state.pending={type:'memory-correction-confirm',factor,replacement:text,workflowId:state.workflowId};
      updateWorkflow('waiting_confirmation',{proposed:{factor_id:factor.id,summary:text},needed:[],save_status:'not_saved',available_actions:['Save corrected memory','Cancel']},'A corrected remembered-context value is ready for confirmation.');
      pushZeke(`I’ll replace the remembered wording with: “${text}”. Save this correction?`,{choices:[{label:'Save corrected memory',value:'memory-confirm'},{label:'Cancel without changing it',value:'memory-cancel'}]});render();return true;
    }
    if(state.pending?.type==='history-correction-awaiting') {
      pushUser(text); render();
      const p=state.pending; const history=historyContextFromText(text); state.pending={type:'history-confirm',rawId:p.rawId,rawText:p.rawText,history,workflowId:state.workflowId};
      updateWorkflow('waiting_confirmation',{proposed:history,needed:[],available_actions:['Save corrected history','Correct again']},'A corrected health-history interpretation is ready.');
      pushZeke(`Thanks. I now understand that as ${history.relation} health history: ${history.summary}. Is that right?`,{choices:[{label:'Save corrected history',value:'history-save'},{label:'Correct again',value:'history-correct'}]}); render(); return true;
    }
    if(state.pending?.type==='correction-awaiting') {
      pushUser(text); render();
      const original=state.pending; const parsed=ZekeParser.interpret(text,parserContext());
      window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'replacement_interpretation',original_text:original.rawText||'',correction_text:text,proposed:parsed.summary||''});
      if((parsed.events||[]).length){state.pending={type:'confirm',rawId:original.rawId,rawText:original.rawText,parsed,workflowId:state.workflowId};updateWorkflow('waiting_confirmation',{proposed:parsed.events,needed:[],available_actions:['Save corrected interpretation','Correct again']},'A corrected interpretation is ready for confirmation.');pushZeke(`Thanks. ${interpretationPrompt(parsed)}`,{choices:[{label:'Save corrected interpretation',value:'confirm-save'},{label:'Correct again',value:'confirm-correct'}]});render();return true;}
      updateWorkflow('waiting_correction',{needed:['clear corrected value or details']},'The correction still could not be interpreted safely.');logUnresolved('Correction text did not produce a safe structured interpretation.',{correction_text:text});pushZeke('I still could not interpret the correction safely. Please include the corrected value or details; nothing has been saved.');render();return true;
    }
    if(['needs-detail','ai-clarify'].includes(state.pending?.type)) {
      pushUser(text); render();
      const pendingContext={...state.context,original_input:state.pending.rawText,pending_question:state.pending.ai?.clarificationQuestion||null};
      let parsed=ZekeParser.interpret(text,parserContext(pendingContext));
      const aiAvailable=(state.ai?.providers||[]).some(p=>p.connected||p.hasSessionKey);
      if(aiAvailable && (!(parsed.events||[]).length || (parsed.confidence||0)<0.8)) {
        const aiStarted=new Date().toISOString();updateWorkflow('ai_checking',{ai_status:'running'},'AI is checking the clarification.');
        try { const ai=await ZekeAIRouter.interpret(text,{...pendingContext,history:state.conversation.slice(0,-1)}); parsed={confidence:ai.confidence||0.8,summary:ai.summary||'your clarification',events:ai.events||[],aiSource:`${ai.provider||'connected AI'}/${ai.model||'model'}`};window.ZekeWorkflowEngine?.ai({workflow_id:state.workflowId,started_at:aiStarted,provider:ai.provider||'',model:ai.model||'',purpose:'interpret_clarification',status:'success',confidence:ai.confidence||null}); } catch (error) {window.ZekeWorkflowEngine?.ai({workflow_id:state.workflowId,started_at:aiStarted,purpose:'interpret_clarification',status:'failed',error:String(error?.message||error)});}
      }
      if((parsed.events||[]).length){state.pending={type:'confirm',rawId:state.pending.rawId,rawText:state.pending.rawText,parsed,workflowId:state.workflowId};updateWorkflow('waiting_confirmation',{proposed:parsed.events,needed:[],ai_status:parsed.aiSource?'completed':'not_needed',available_actions:['Save interpretation','Correct interpretation']},'The clarification produced a proposed record.');pushZeke(`Thanks. I now understand that as ${parsed.summary}. Is that right?`,{choices:[{label:'Save interpretation',value:'confirm-save'},{label:'Correct interpretation',value:'confirm-correct'}]});render();return true;}
      updateWorkflow('waiting_clarification',{needed:['clearer values or details'],save_status:'not_saved'},'The clarification was still insufficient.');logUnresolved('Clarification still did not produce a safe record.',{answer_attempt:text});pushZeke('I still do not have enough detail to save that safely. Nothing has been saved. Please give the values in the clearest form you can.'); render(); return true;
    }
    return false;
  }

  async function handleAction(actionId) {
    const action=(state.actions.catalog||[]).find(a=>a.id===actionId); if(!action)return;
    const name=action.label||action.name;
    beginWorkflow(`Confirm ${name}`,{goal:`Confirm today’s ${name} action`,target:{action_id:action.id,kind:action.kind}});
    state.context={actionId:action.id,medication:action.kind==='medication'?name:null};
    if(action.kind==='medication'){
      const doseEvent=medicationDoseToday(action),assumed=doseEvent?.provenance?.source==='scheduled-adherence-assumption';
      if(doseEvent&&!assumed){pushZeke(`${name} is already explicitly confirmed as taken today. I did not create another dose record.`);closeWorkflow('completed',`${name} was already confirmed today.`,{save_status:'already_saved'});render();return;}
      state.pending={type:'medication-action-confirm',action,workflowId:state.workflowId};
      updateWorkflow('waiting_clarification',{known:{medication:name,schedule:scheduleText(action.schedule),current_status:assumed?'assumed taken from schedule':'not confirmed'},needed:['today’s dose status'],available_actions:['Taken today','Missed today','Not taken yet','Describe outcome']},'A medication action was opened for confirmation or correction.');
      pushZeke(assumed?`${name} is currently marked as assumed taken because you chose “assume as scheduled.” Was that correct?`:`Let’s confirm ${name}. What happened with today’s dose?`,{choices:[{label:assumed?'Yes — taken as scheduled':'Taken today',value:'med-action-taken'},{label:'Missed today',value:'med-action-missed'},{label:'Not taken yet',value:'med-action-not-yet'}]});render();$('#talkInput')?.focus();return;
    }
    updateWorkflow('waiting_clarification',{known:{action:name},needed:['what happened today'],available_actions:['Describe outcome']},'A Today’s Action was opened.');
    pushZeke(`Let's confirm ${name}. What happened today?`); render(); $('#talkInput')?.focus();
  }

  function openRecurringActionScheduleModal(action={}) {
    $('#recurringActionScheduleModal')?.remove();
    const existingSchedule=action.schedule||{};
    const selectedDay=Array.isArray(existingSchedule.days)&&existingSchedule.days.length?String(existingSchedule.days[0]):String(new Date().getDay());
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="recurringActionScheduleModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Recurring action schedule</h2><p>Choose when this belongs in Today’s Actions. A scheduled day is never treated as proof that the action was completed.</p></div><button class="icon-btn" id="closeRecurringActionSchedule" aria-label="Close">×</button></div><form id="recurringActionScheduleForm" class="direct-entry-form"><label class="wide">Action name<input id="recurringActionName" value="${esc(action.label||action.name||'')}" required></label><label>Frequency<select id="recurringActionFrequency"><option value="daily" ${existingSchedule.type==='daily'?'selected':''}>Daily</option><option value="weekly" ${existingSchedule.type!=='daily'?'selected':''}>Weekly</option></select></label><label id="recurringActionDayWrap">Expected weekday<select id="recurringActionWeekday">${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day,index)=>`<option value="${index}" ${String(index)===selectedDay?'selected':''}>${day}</option>`).join('')}</select></label><label class="wide">Notes<textarea id="recurringActionNotes" rows="2">${esc(action.notes||'')}</textarea></label><p class="form-note wide">ZEKE will ask for confirmation before marking this action complete.</p><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelRecurringActionSchedule">Cancel without saving</button><button type="submit" class="primary">Save recurring schedule</button></div></form></div></div>`);
    const remove=()=>$('#recurringActionScheduleModal')?.remove();
    const cancel=()=>{remove();state.pending=null;closeWorkflow('not_saved','Recurring-action schedule editor closed without saving.',{save_status:'not_saved'});render();showToast('Recurring schedule not saved.');};
    $('#closeRecurringActionSchedule').onclick=cancel;$('#cancelRecurringActionSchedule').onclick=cancel;
    const toggleDay=()=>{$('#recurringActionDayWrap').hidden=$('#recurringActionFrequency').value==='daily';};$('#recurringActionFrequency').onchange=toggleDay;toggleDay();
    $('#recurringActionScheduleForm').onsubmit=async event=>{
      event.preventDefault();
      const name=$('#recurringActionName').value.trim(),frequency=$('#recurringActionFrequency').value;if(!name)return;
      const schedule=frequency==='daily'?{type:'daily'}:{type:'weekly',days:[Number($('#recurringActionWeekday').value)],usual:true};
      const entry={...action,id:action.id||`action-${crypto.randomUUID()}`,label:name,name,active:true,schedule,notes:$('#recurringActionNotes').value.trim(),subtitle:frequency==='daily'?'Daily':`Weekly · ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][Number($('#recurringActionWeekday').value)]}`,updated_at:new Date().toISOString()};
      const catalog=[...(state.actions.catalog||[])],next=action.id?catalog.map(a=>a.id===action.id?entry:a):[...catalog,entry];
      state.actions=await ZekeData.saveActions({...state.actions,catalog:next});remove();
      const label=frequency==='daily'?'daily':`weekly on ${['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'][Number($('#recurringActionWeekday').value)]}`;
      pushZeke(`Saved. ${name} is expected ${label} and will appear in Today’s Actions when due. ZEKE will still require confirmation before marking it complete.`);
      closeWorkflow('completed',`${name} schedule saved as ${label}.`,{save_status:'saved',target:{action_id:entry.id,kind:'recurring_action_schedule'}});state.pending=null;await refreshData();render();showToast(`${name} schedule saved: ${label}.`);
    };
  }

  function openMedicationScheduleModal(value='',question=null) {
    $('#medicationScheduleModal')?.remove();const medication=String(value||'').trim().replace(/\b\w/g,c=>c.toUpperCase()),canonical=ZekeParser.canonicalMedicationId(medication),existing=(state.actions.catalog||[]).find(a=>a.kind==='medication'&&ZekeParser.canonicalMedicationId(a.label||a.name||a.id||'')===canonical),existingSchedule=existing?.schedule||{},selectedDay=Array.isArray(existingSchedule.days)&&existingSchedule.days.length?String(existingSchedule.days[0]):'5',mode=existing?.adherence_mode||'confirm_each';
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="medicationScheduleModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Medication schedule</h2><p>Set the confirmed schedule and choose how ZEKE should track individual doses.</p></div><button class="icon-btn" id="closeMedicationSchedule" aria-label="Close">×</button></div><form id="medicationScheduleForm" class="direct-entry-form"><label class="wide">Medication or supplement<input id="scheduleMedicationName" value="${esc(existing?.label||medication)}" required></label><label>Frequency<select id="scheduleFrequency"><option value="daily" ${existingSchedule.type==='daily'?'selected':''}>Daily</option><option value="weekly" ${existingSchedule.type!=='daily'?'selected':''}>Weekly</option></select></label><label id="scheduleDayWrap">Expected weekday<select id="scheduleWeekday">${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day,index)=>`<option value="${index}" ${String(index)===selectedDay?'selected':''}>${day}</option>`).join('')}</select></label><label>Dose<input id="scheduleDose" type="number" min="0" step="any" value="${existing?.dose??''}"></label><label>Unit<input id="scheduleUnit" value="${esc(existing?.unit||'')}" placeholder="mg, tablet, injection"></label><label>Start date<input id="scheduleStartDate" type="date" value="${esc(existing?.start_date||activeDay())}"></label><label class="wide">How should ZEKE track doses?<select id="scheduleAdherenceMode"><option value="confirm_each" ${mode==='confirm_each'?'selected':''}>Ask me to confirm each dose</option><option value="assume_scheduled" ${mode==='assume_scheduled'?'selected':''}>Assume I take it as scheduled unless I say otherwise</option><option value="schedule_only" ${mode==='schedule_only'?'selected':''}>Keep the schedule but don’t track individual doses</option></select></label><div class="adherence-mode-note wide" id="adherenceModeNote"></div><label class="wide">Notes<textarea id="scheduleNotes" rows="2">${esc(existing?.notes||'')}</textarea></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelMedicationSchedule">Cancel without saving</button><button type="submit" class="primary">Save medication schedule</button></div><p class="form-error wide" id="medScheduleError" hidden></p></form></div></div>`);
    const close=()=>$('#medicationScheduleModal')?.remove(),cancel=()=>{close();state.pending=null;closeWorkflow('not_saved','Medication schedule editor closed without saving.',{save_status:'not_saved'});render();showToast('Medication schedule not saved.');};$('#closeMedicationSchedule').onclick=cancel;$('#cancelMedicationSchedule').onclick=cancel;
    const toggleDay=()=>{$('#scheduleDayWrap').hidden=$('#scheduleFrequency').value==='daily';},drawMode=()=>{const m=$('#scheduleAdherenceMode').value,n=$('#adherenceModeNote');n.innerHTML=m==='assume_scheduled'?'<strong>Opt-in assumption:</strong> ZEKE will create clearly marked “assumed from schedule” dose occurrences from the confirmed schedule start date through today and for future due dates. Tell ZEKE about a missed, delayed, changed, or extra dose and it will correct the assumption.':m==='schedule_only'?'ZEKE will remember the schedule but will not create or ask about individual dose records.':'ZEKE will ask before marking each dose taken.';};$('#scheduleFrequency').onchange=toggleDay;$('#scheduleAdherenceMode').onchange=drawMode;toggleDay();drawMode();
    $('#medicationScheduleForm').onsubmit=async event=>{event.preventDefault();const name=$('#scheduleMedicationName').value.trim(),frequency=$('#scheduleFrequency').value,adherenceMode=$('#scheduleAdherenceMode').value,dose=$('#scheduleDose').value===''?null:Number($('#scheduleDose').value);if(!name)return;if(adherenceMode==='assume_scheduled'&&!Number.isFinite(dose)){const err=$('#medScheduleError');err.hidden=false;err.textContent='Enter the confirmed prescribed dose before ZEKE can assume scheduled doses.';return;}const schedule=frequency==='daily'?{type:'daily'}:{type:'weekly',days:[Number($('#scheduleWeekday').value)],usual:true},catalog=[...(state.actions.catalog||[])],id=existing?.id||`med-${ZekeParser.canonicalMedicationId(name).replace(/[^a-z0-9]+/g,'-')}`,entry={...existing,id,kind:'medication',label:name,icon:existing?.icon||'✚',active:true,schedule,dose,unit:$('#scheduleUnit').value.trim(),start_date:$('#scheduleStartDate').value||null,history_start_date:$('#scheduleStartDate').value||existing?.history_start_date||null,adherence_mode:adherenceMode,assumption_effective_date:adherenceMode==='assume_scheduled'?(existing?.adherence_mode==='assume_scheduled'&&existing?.assumption_effective_date||activeDay()):null,notes:$('#scheduleNotes').value.trim(),subtitle:frequency==='daily'?'Daily':`Weekly · ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][Number($('#scheduleWeekday').value)]}`};state.actions=await ZekeData.saveActions({...state.actions,catalog:existing?catalog.map(a=>a.id===existing.id?entry:a):[...catalog,entry]});if(question?.id)await ZekeData.resolveFactor(question.id,'resolved',frequency==='daily'?'Daily':`Weekly on ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][Number($('#scheduleWeekday').value)]}`);close();const scheduleLabel=frequency==='daily'?'daily':`weekly on ${['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'][Number($('#scheduleWeekday').value)]}`,tracking=adherenceMode==='assume_scheduled'?'ZEKE will assume scheduled doses unless you report otherwise.':adherenceMode==='schedule_only'?'ZEKE will keep the schedule without individual dose tracking.':'ZEKE will ask before marking each dose taken.';pushZeke(`Saved. ${name} is expected ${scheduleLabel}. ${tracking}`);closeWorkflow('completed',`${name} schedule saved as ${scheduleLabel}.`,{save_status:'saved',target:{action_id:id,kind:'medication_schedule'}});state.pending=null;await refreshData();render();showToast(`${name} schedule saved: ${scheduleLabel}.`);};
  }

  function localDateISO(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
  function medicationBackfillDates(start,end,frequency='daily',weekday=0){
    if(!start||!end||start>end)return [];
    const dates=[],cursor=new Date(`${start}T12:00:00`),last=new Date(`${end}T12:00:00`);
    for(let guard=0;cursor<=last&&guard<370;guard++,cursor.setDate(cursor.getDate()+1))if(frequency==='daily'||cursor.getDay()===Number(weekday))dates.push(localDateISO(cursor));
    return dates;
  }

  function openMedicationBackfillModal(value=''){
    $('#medicationBackfillModal')?.remove();
    const medication=String(value||'').trim(),canonical=ZekeParser.canonicalMedicationId(medication),existing=(state.actions.catalog||[]).find(a=>a.kind==='medication'&&ZekeParser.canonicalMedicationId(a.label||a.name||a.id||'')===canonical),schedule=existing?.schedule||{},selectedDay=Array.isArray(schedule.days)&&schedule.days.length?String(schedule.days[0]):String(new Date().getDay()),frequency=schedule.type==='weekly'?'weekly':'daily',today=activeDay();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="medicationBackfillModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Backfill past doses</h2><p>Create one reviewed batch from a date range. ZEKE previews every matching date and skips existing doses.</p></div><button class="icon-btn" id="closeMedicationBackfill" aria-label="Close">×</button></div><form id="medicationBackfillForm" class="direct-entry-form"><label class="wide">Medication or supplement<input id="backfillMedicationName" value="${esc(existing?.label||medication)}" required placeholder="e.g., Mounjaro"></label><label>From date<input id="backfillStartDate" type="date" max="${today}" value="${today}" required></label><label>Through date<input id="backfillEndDate" type="date" max="${today}" value="${today}" required></label><label>Schedule<select id="backfillFrequency"><option value="daily" ${frequency==='daily'?'selected':''}>Every day</option><option value="weekly" ${frequency==='weekly'?'selected':''}>Once each week</option></select></label><label id="backfillWeekdayWrap">Weekday<select id="backfillWeekday">${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day,index)=>`<option value="${index}" ${String(index)===selectedDay?'selected':''}>${day}</option>`).join('')}</select></label><label>Dose<input id="backfillDose" type="number" min="0" step="any" value="${existing?.dose??''}"></label><label>Unit<input id="backfillUnit" value="${esc(existing?.unit||'')}" placeholder="mg, tablet, injection"></label><label>Status<select id="backfillStatus"><option value="taken">Taken</option><option value="missed">Missed</option></select></label><label class="wide">Batch note (optional)<textarea id="backfillNotes" rows="2"></textarea></label><section class="backfill-preview wide" id="medicationBackfillPreview" aria-live="polite"></section><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelMedicationBackfill">Cancel without saving</button><button type="submit" class="primary" id="saveMedicationBackfill">Save past doses</button></div></form></div></div>`);
    const close=()=>$('#medicationBackfillModal')?.remove(),form=$('#medicationBackfillForm'),save=$('#saveMedicationBackfill');
    const existingDatesFor=name=>{const id=ZekeParser.canonicalMedicationId(name);return new Set(state.events.filter(e=>recordIsActive(e)&&semanticCategory(e)==='medication'&&ZekeParser.canonicalMedicationId(e.structured?.medication_name||e.structured?.name||'')===id).map(e=>String(e.timestamp||e.recorded_at||'').slice(0,10)).filter(Boolean))};
    const preview=()=>{
      const name=$('#backfillMedicationName').value.trim(),start=$('#backfillStartDate').value,end=$('#backfillEndDate').value,spanDays=start&&end?Math.floor((new Date(`${end}T12:00:00`)-new Date(`${start}T12:00:00`))/864e5)+1:0,tooLong=spanDays>369,all=tooLong?[]:medicationBackfillDates(start,end,$('#backfillFrequency').value,$('#backfillWeekday').value),existingDates=existingDatesFor(name),fresh=all.filter(date=>!existingDates.has(date)),skipped=all.filter(date=>existingDates.has(date));
      $('#backfillWeekdayWrap').hidden=$('#backfillFrequency').value!=='weekly';
      const shown=fresh.slice(0,18).map(date=>`<span>${esc(fmtDate(`${date}T12:00:00`,{month:'short',day:'numeric',year:'numeric'}))}</span>`).join('');
      $('#medicationBackfillPreview').innerHTML=tooLong?'<strong>Date range is too long</strong><p>Use a range of 369 days or fewer so the batch remains reviewable.</p>':all.length?`<strong>${fresh.length} dose${fresh.length===1?'':'s'} ready to save</strong><p>${skipped.length?`${skipped.length} matching existing dose${skipped.length===1?' will':'s will'} be skipped. `:''}${fresh.length>18?`Showing the first 18 of ${fresh.length} new dates.`:'Every new date is shown below.'}</p><div>${shown||'<em>No new dates remain after duplicate checks.</em>'}</div>`:'<strong>Choose a valid date range</strong><p>The range must begin on or before the through date.</p>';
      save.disabled=!name||!fresh.length||tooLong;save.textContent=fresh.length&&!tooLong?`Save ${fresh.length} past dose${fresh.length===1?'':'s'}`:'No new doses to save';
      return {name,all,fresh,skipped,tooLong};
    };
    ['input','change'].forEach(kind=>form.addEventListener(kind,preview));preview();
    $('#closeMedicationBackfill').onclick=close;$('#cancelMedicationBackfill').onclick=close;
    form.onsubmit=async event=>{
      event.preventDefault();const plan=preview();if(!plan.fresh.length||plan.tooLong)return;
      const status=$('#backfillStatus').value,dose=$('#backfillDose').value===''?null:Number($('#backfillDose').value),unit=$('#backfillUnit').value.trim(),notes=$('#backfillNotes').value.trim(),canonicalId=ZekeParser.canonicalMedicationId(plan.name),bulkId=`medication-backfill-${crypto.randomUUID()}`,created=[];
      save.disabled=true;save.textContent='Saving reviewed batch…';
      try{
        for(const date of plan.fresh)created.push(await ZekeData.addEvent({category:'medication',timestamp:`${date}T12:00:00`,raw_text:notes,structured:{medication_name:plan.name,original_medication_name:plan.name,canonical_medication_id:canonicalId,dose,unit,status,bulk_id:bulkId,interpretation_status:'confirmed'},provenance:{source:'bulk-medication-backfill',bulk_id:bulkId,range_start:$('#backfillStartDate').value,range_end:$('#backfillEndDate').value,schedule:$('#backfillFrequency').value}}));
      }catch(error){showToast(`${created.length} dose${created.length===1?' was':'s were'} saved before the batch stopped: ${error?.message||error}`,'error');if(created.length){state.lastSave={ids:created.map(x=>x.id),route:'health',healthTab:'medications',label:`${plan.name} backfill`};await refreshData();render();}return;}
      close();state.lastSave={ids:created.map(x=>x.id),route:'health',healthTab:'medications',label:`${plan.name} backfill`};await refreshData();pushZeke(`Saved ${created.length} past ${plan.name} dose${created.length===1?'':'s'} as one reviewed batch.${plan.skipped.length?` I skipped ${plan.skipped.length} existing date${plan.skipped.length===1?'':'s'}.`:''}`,{choices:[{label:'View medication history',value:'postsave-view'},{label:'Undo this backfill',value:'postsave-undo'}]});render();showToast(`${created.length} past dose${created.length===1?'':'s'} saved${plan.skipped.length?`; ${plan.skipped.length} duplicate date${plan.skipped.length===1?'':'s'} skipped`:''}.`);
    };
  }

  async function saveMedicationOccurrence(candidate,{preferUpdate=true}={}){
    const st=candidate.structured||{},day=String(candidate.timestamp||'').slice(0,10),canonical=ZekeParser.canonicalMedicationId(st.canonical_medication_id||st.medication_name||st.name||'');
    const sameDay=state.events.filter(e=>recordIsActive(e)&&semanticCategory(e)==='medication'&&String(e.timestamp||e.recorded_at||'').slice(0,10)===day&&ZekeParser.canonicalMedicationId(e.structured?.canonical_medication_id||e.structured?.medication_name||e.structured?.name||'')===canonical).sort((a,b)=>new Date(b.updated_at||b.recorded_at||b.timestamp)-new Date(a.updated_at||a.recorded_at||a.timestamp));
    const existing=sameDay[0];
    if(existing&&preferUpdate){
      const previousStatus=String(existing.structured?.status||'recorded'),next={...existing.structured,...st,interpretation_status:'confirmed',confirmation_status:'confirmed',adherence_evidence:'user_confirmed_or_corrected',include_in_analysis:true};
      return ZekeData.updateEvent(existing.id,{timestamp:candidate.timestamp,raw_text:candidate.raw_text||existing.raw_text||'',structured:next,provenance:{...(existing.provenance||{}),last_confirmation_source:candidate.provenance?.source||'direct-medication-entry',corrected_from_assumption:existing.structured?.interpretation_status==='assumed'||existing.provenance?.source==='scheduled-adherence-assumption'},correction_note:`Medication occurrence corrected from ${previousStatus} to ${st.status||previousStatus}`});
    }
    return ZekeData.addEvent(candidate);
  }

  function openMedicationOccurrenceEditModal(id){
    const event=state.events.find(e=>e.id===id);if(!event)return;const st=event.structured||{},date=String(event.timestamp||event.recorded_at||'').slice(0,10),assumed=st.interpretation_status==='assumed'||event.provenance?.source==='scheduled-adherence-assumption';
    $('#medicationOccurrenceEditModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="medicationOccurrenceEditModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Edit medication dose</h2><p>Correct this exact dated occurrence. ${assumed?'It was previously assumed from the schedule; your edit will replace that assumption.':'The previous value will remain in correction history.'}</p></div><button class="icon-btn" id="closeMedicationOccurrenceEdit" aria-label="Close">×</button></div><form id="medicationOccurrenceEditForm" class="direct-entry-form"><label class="wide">Medication<input id="editMedicationOccurrenceName" value="${esc(st.medication_name||st.name||'')}" required></label><label>Date<input id="editMedicationOccurrenceDate" type="date" value="${esc(date)}" required></label><label>Status<select id="editMedicationOccurrenceStatus">${['taken','missed','delayed','partial','unknown','not_taken_yet'].map(v=>`<option value="${v}" ${String(st.status||'').toLowerCase()===v?'selected':''}>${v.replaceAll('_',' ')}</option>`).join('')}</select></label><label>Dose<input id="editMedicationOccurrenceDose" type="number" min="0" step="any" value="${st.dose??''}"></label><label>Unit<input id="editMedicationOccurrenceUnit" value="${esc(st.unit||'')}"></label><label class="wide">Notes<textarea id="editMedicationOccurrenceNotes" rows="2">${esc(st.notes||event.raw_text||'')}</textarea></label><div class="record-provenance wide"><strong>Evidence before this edit</strong><span>${assumed?'Assumed from standing schedule':'Recorded / confirmed occurrence'}</span><small>${esc(event.provenance?.source||'ZEKE')} · ${esc(event.id)}</small></div><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelMedicationOccurrenceEdit">Cancel</button><button type="submit" class="primary">Save correction</button></div></form></div></div>`);
    const close=()=>$('#medicationOccurrenceEditModal')?.remove();$('#closeMedicationOccurrenceEdit').onclick=close;$('#cancelMedicationOccurrenceEdit').onclick=close;
    $('#medicationOccurrenceEditForm').onsubmit=async ev=>{ev.preventDefault();const name=$('#editMedicationOccurrenceName').value.trim(),nextDate=$('#editMedicationOccurrenceDate').value,status=$('#editMedicationOccurrenceStatus').value,dose=$('#editMedicationOccurrenceDose').value===''?null:Number($('#editMedicationOccurrenceDose').value),unit=$('#editMedicationOccurrenceUnit').value.trim(),notes=$('#editMedicationOccurrenceNotes').value.trim();await ZekeData.updateEvent(id,{timestamp:`${nextDate}T12:00:00`,raw_text:notes,structured:{...st,medication_name:name,canonical_medication_id:ZekeParser.canonicalMedicationId(name),dose,unit,status,notes,interpretation_status:'confirmed',confirmation_status:'confirmed',adherence_evidence:'user_corrected',include_in_analysis:status!=='unknown'},provenance:{...(event.provenance||{}),corrected_at:new Date().toISOString(),corrected_by:'user',corrected_from_assumption:assumed},correction_note:`Medication dose occurrence corrected by user (${st.status||'recorded'} → ${status})`});close();await refreshData();render();showToast('Medication occurrence corrected; the earlier value remains in audit history.');};
  }

  function openMedicationEntryModal(value='') {
    $('#medicationEntryModal')?.remove();
    const canonical=ZekeParser.canonicalMedicationId(value||''), savedPref=state.preferences.medication_confirmation_preferences?.[canonical]||'every';
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="medicationEntryModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Log medication or supplement</h2><p>Record one dose for ${esc(activeDateLabel())}, or open one reviewed batch for past dates.</p></div><button class="icon-btn" id="closeMedicationEntry" aria-label="Close">×</button></div><form id="medicationEntryForm" class="direct-entry-form"><label class="wide">Medication or supplement<input id="medicationName" value="${esc(value)}" required placeholder="e.g., Atorvastatin"></label><label>Dose<input id="medicationDose" type="number" min="0" step="any"></label><label>Unit<input id="medicationUnit" placeholder="mg, tablet, injection"></label><label>Date<input id="medicationDate" type="date" value="${esc(activeDay())}" required></label><label>Status<select id="medicationStatus"><option value="taken">Taken</option><option value="missed">Missed</option><option value="not_taken_yet">Not taken yet</option><option value="started">Started</option><option value="stopped">Stopped</option><option value="changed">Dose changed</option></select></label><label class="wide">Dose confirmation preference<select id="medicationConfirmPref"><option value="every">Confirm every dose</option><option value="exceptions">Prompt about missed or changed doses</option><option value="none">Do not prompt me</option></select></label><label class="wide">Notes<textarea id="medicationNotes" rows="2"></textarea></label><div class="direct-entry-actions wide"><button type="button" class="text-action" id="medicationSchedule">Manage recurring schedule</button><button type="button" class="text-action" id="medicationBackfill">Backfill past doses</button><button type="button" class="secondary" id="cancelMedicationEntry">Cancel</button><button type="submit" class="primary">Save dose</button></div></form></div></div>`);
    $('#medicationConfirmPref').value=savedPref;
    const close=()=>$('#medicationEntryModal')?.remove(); $('#closeMedicationEntry').onclick=close;$('#cancelMedicationEntry').onclick=close;
    $('#medicationSchedule').onclick=()=>{const name=$('#medicationName').value.trim();close();beginWorkflow(`Set ${name||'medication'} schedule`,{goal:'Set a recurring medication schedule',target:{medication:name||null}});updateWorkflow('waiting_clarification',{needed:['frequency and expected day'],save_status:'not_saved'},'Medication schedule editor opened.');openMedicationScheduleModal(name);};
    $('#medicationBackfill').onclick=()=>{const name=$('#medicationName').value.trim();close();openMedicationBackfillModal(name)};
    $('#medicationEntryForm').onsubmit=async e=>{e.preventDefault();const name=$('#medicationName').value.trim(),date=$('#medicationDate').value,pref=$('#medicationConfirmPref').value;if(!name||!date)return;const id=ZekeParser.canonicalMedicationId(name);state.preferences={...state.preferences,medication_confirmation_preferences:{...(state.preferences.medication_confirmation_preferences||{}),[id]:pref}};await ZekeData.savePreferences(state.preferences);const candidate={category:'medication',timestamp:`${date}T12:00:00`,raw_text:$('#medicationNotes').value||'',structured:{medication_name:name,original_medication_name:name,canonical_medication_id:id,dose:Number($('#medicationDose').value)||null,unit:$('#medicationUnit').value||'',status:$('#medicationStatus').value,confirmation_preference:pref,interpretation_status:'confirmed'},provenance:{source:'direct-medication-entry'}};await saveMedicationOccurrence(candidate,{preferUpdate:true});close();await refreshData();render();showToast(`${name} dose occurrence saved.`)};
  }

  function startContextLog(type,value='') {
    if(type==='metric') {
      const meta=METRICS[value]; state.context={metric:value==='blood_pressure'?'blood_pressure':value,active_date:activeDay()}; pushZeke(`Let's log ${meta?.label||value}. What is the value?`);
    } else if(type==='exercise') { state.context={exercise:value||null,active_date:activeDay()}; pushZeke(value?`Let's log ${value}. You can tell me weight, reps, sets, RPE, pain, or anything else that matters.`:'Tell me about the workout.'); }
    else if(type==='medication') { openMedicationEntryModal(value); return; }
    go('dashboard'); render(); setTimeout(()=>$('#talkInput')?.focus(),0);
  }

  function openWorkoutEditModal(id){
    const event=state.events.find(x=>x.id===id),w=event&&workoutStructured(event);if(!event||!w)return;
    $('#workoutEditModal')?.remove();const category=canonicalActivityCategory(w.exercise,w.activity_profile);
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="workoutEditModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Edit workout record</h2><p>This changes only this record. ZEKE preserves the previous version in correction history.</p></div><button class="icon-btn" id="closeWorkoutEdit" aria-label="Close">×</button></div><form id="workoutEditForm" class="direct-entry-form"><label class="wide">Activity<input id="editWorkoutName" value="${esc(w.exercise||'')}" required></label><label>Category<select id="editWorkoutProfile">${ACTIVITY_TAXONOMY.map(x=>`<option value="${x.id}" ${x.id===category?'selected':''}>${esc(x.label)}</option>`).join('')}</select></label><label>Date<input id="editWorkoutDate" type="date" value="${esc(String(event.timestamp||'').slice(0,10))}" required></label><label>Weight<input id="editWorkoutWeight" type="number" min="0" step="any" value="${w.weight??''}"></label><label>Reps<input id="editWorkoutReps" type="number" min="0" step="1" value="${w.reps??''}"></label><label>Sets<input id="editWorkoutSets" type="number" min="0" step="1" value="${w.sets??''}"></label><label>Duration (min)<input id="editWorkoutDuration" type="number" min="0" step="any" value="${w.duration_min??''}"></label><label>Steps<input id="editWorkoutSteps" type="number" min="0" step="1" value="${w.steps??''}"></label><label>Level<input id="editWorkoutLevel" value="${esc(w.level??'')}"></label><details class="advanced-fields wide" open><summary>Effort, pain, technique, and injury context</summary><div class="advanced-fields-grid"><label>RPE / effort (0–10)<input id="editWorkoutRpe" type="number" min="0" max="10" step="any" value="${w.rpe??''}"></label><label>Pain before (0–10)<input id="editWorkoutPainBefore" type="number" min="0" max="10" step="any" value="${w.pain_before??''}"></label><label>Pain during (0–10)<input id="editWorkoutPainDuring" type="number" min="0" max="10" step="any" value="${w.pain_during??''}"></label><label>Pain after (0–10)<input id="editWorkoutPainAfter" type="number" min="0" max="10" step="any" value="${w.pain_after??''}"></label><label class="wide">Technique / form<input id="editWorkoutTechnique" value="${esc(w.technique||w.form_notes||'')}"></label><label class="wide">Injury or PT context<input id="editWorkoutInjury" value="${esc(w.injury_context||w.restriction_context||'')}"></label></div></details><label class="wide">Notes<textarea id="editWorkoutNotes" rows="3">${esc(w.notes||event.raw_text||'')}</textarea></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelWorkoutEdit">Cancel</button><button type="submit" class="primary">Save correction</button></div></form></div></div>`);
    const close=()=>$('#workoutEditModal')?.remove();$('#closeWorkoutEdit').onclick=close;$('#cancelWorkoutEdit').onclick=close;
    $('#workoutEditForm').onsubmit=async e=>{e.preventDefault();const num=id=>{const raw=$(id).value.trim();return raw===''?null:Number(raw)};const date=$('#editWorkoutDate').value;const structured={...w,exercise:$('#editWorkoutName').value.trim(),canonical_activity_id:activityKey($('#editWorkoutName').value).replace(/ /g,'_'),activity_profile:$('#editWorkoutProfile').value,weight:num('#editWorkoutWeight'),reps:num('#editWorkoutReps'),sets:num('#editWorkoutSets'),duration_min:num('#editWorkoutDuration'),steps:num('#editWorkoutSteps'),level:$('#editWorkoutLevel').value.trim()||null,rpe:num('#editWorkoutRpe'),pain_before:num('#editWorkoutPainBefore'),pain_during:num('#editWorkoutPainDuring'),pain_after:num('#editWorkoutPainAfter'),technique:$('#editWorkoutTechnique').value.trim()||null,injury_context:$('#editWorkoutInjury').value.trim()||null,notes:$('#editWorkoutNotes').value.trim(),interpretation_status:'confirmed'};await ZekeData.updateEvent(id,{timestamp:`${date}T12:00:00`,raw_text:structured.notes,structured,correction_note:'Workout record corrected by user through structured editor'});close();await refreshData();render();showToast('Workout record corrected; prior values remain in the audit history.')};
  }

  function openHealthRecordEditModal(id){
    const event=state.events.find(x=>x.id===id);if(!event)return;
    const s=event.structured||{}, metric=canonicalMetric(metricId(event)), meta=METRICS[metric]||{};
    const value=metricValue(event), unit=s.unit||meta.unit||'', date=String(event.timestamp||event.recorded_at||'').slice(0,10);
    $('#healthRecordEditModal')?.remove();
    if(metric==='sleep_duration'){
      const clock=iso=>{if(!iso)return'';const d=new Date(iso);return Number.isNaN(d.getTime())?'':`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};
      const startClock=clock(s.start_time),endClock=clock(s.end_time||event.timestamp),quality=s.sleep_quality||'';
      document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="healthRecordEditModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Edit sleep record</h2><p>Update this sleep period. ZEKE preserves the prior version and provenance in correction history.</p></div><button class="icon-btn" id="closeHealthRecordEdit" aria-label="Close">×</button></div><form id="healthRecordEditForm" class="direct-entry-form"><label>Wake-up date<input id="editSleepDate" type="date" value="${esc(s.wake_date||date)}" required></label><label>Sleep started<input id="editSleepStart" type="time" value="${esc(startClock)}" required></label><label>Woke up<input id="editSleepEnd" type="time" value="${esc(endClock)}" required></label><label>Quality<select id="editSleepQuality"><option value="" ${!quality?'selected':''}>Not recorded</option><option value="good" ${quality==='good'?'selected':''}>Good</option><option value="fair" ${quality==='fair'?'selected':''}>Fair</option><option value="poor" ${quality==='poor'?'selected':''}>Poor</option></select></label><label>Interruptions<input id="editSleepInterruptions" type="number" min="0" step="1" value="${s.interruptions??''}"></label><label class="wide">Notes<textarea id="editHealthNotes" rows="3">${esc(s.notes||event.raw_text||'')}</textarea></label><p class="form-error wide" id="editSleepError" hidden></p><div class="record-provenance wide"><strong>Source</strong><span>${esc(event.provenance?.sheet||event.provenance?.file||event.provenance?.source||'ZEKE')}</span><small>Record ID ${esc(event.id)}</small></div><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelHealthRecordEdit">Cancel</button><button type="submit" class="primary">Save correction</button></div></form></div></div>`);
      const close=()=>$('#healthRecordEditModal')?.remove();$('#closeHealthRecordEdit').onclick=close;$('#cancelHealthRecordEdit').onclick=close;
      $('#healthRecordEditForm').onsubmit=async ev=>{ev.preventDefault();const wakeDate=$('#editSleepDate').value,startValue=$('#editSleepStart').value,endValue=$('#editSleepEnd').value;let end=new Date(`${wakeDate}T${endValue}:00`),start=new Date(`${wakeDate}T${startValue}:00`);if(start>=end)start.setDate(start.getDate()-1);const duration=(end-start)/36e5;if(!Number.isFinite(duration)||duration<=0||duration>24){$('#editSleepError').hidden=false;$('#editSleepError').textContent='Check the start and wake times. Sleep duration must be between 0 and 24 hours.';return;}const notes=$('#editHealthNotes').value.trim(),interruptions=$('#editSleepInterruptions').value===''?null:Number($('#editSleepInterruptions').value);const structured={...s,metric_id:'sleep_duration',value:Number(duration.toFixed(2)),unit:'hr',start_time:start.toISOString(),end_time:end.toISOString(),wake_date:wakeDate,sleep_quality:$('#editSleepQuality').value||null,interruptions,notes,interpretation_status:'confirmed',include_in_analysis:true};await ZekeData.updateEvent(id,{category:'sleep',timestamp:end.toISOString(),raw_text:notes,structured,correction_note:'Sleep record corrected by user through record-specific editor'});close();clearPending('sleep record edited in dedicated editor');await refreshData();render();showToast('Sleep record corrected; the prior version remains in audit history.');};
      return;
    }
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="healthRecordEditModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Review health record</h2><p>Edit this exact record. ZEKE preserves the original values and provenance in correction history.</p></div><button class="icon-btn" id="closeHealthRecordEdit" aria-label="Close">×</button></div><form id="healthRecordEditForm" class="direct-entry-form"><label class="wide">Record type<input value="${esc(meta.label||s.measurement_name||semanticCategory(event))}" disabled></label><label>Date<input id="editHealthDate" type="date" value="${esc(date)}" required></label><label>Value<input id="editHealthValue" type="number" step="any" value="${value??''}" ${value==null?'disabled':''}></label><label>Unit<input id="editHealthUnit" value="${esc(unit)}"></label><label class="wide">Notes<textarea id="editHealthNotes" rows="3">${esc(s.notes||event.raw_text||'')}</textarea></label><div class="record-provenance wide"><strong>Source</strong><span>${esc(event.provenance?.sheet||event.provenance?.file||event.provenance?.source||'ZEKE')}</span><small>Record ID ${esc(event.id)}</small></div><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelHealthRecordEdit">Cancel</button><button type="submit" class="primary">Save correction</button></div></form></div></div>`);
    const close=()=>$('#healthRecordEditModal')?.remove();$('#closeHealthRecordEdit').onclick=close;$('#cancelHealthRecordEdit').onclick=close;
    $('#healthRecordEditForm').onsubmit=async ev=>{ev.preventDefault();const nextDate=$('#editHealthDate').value,nextUnit=$('#editHealthUnit').value.trim(),notes=$('#editHealthNotes').value.trim();const nextValue=value==null?value:Number($('#editHealthValue').value);const structured={...s,unit:nextUnit,notes,interpretation_status:'confirmed'};if(value!=null)structured.value=nextValue;await ZekeData.updateEvent(id,{timestamp:`${nextDate}T12:00:00`,raw_text:notes,structured,correction_note:'Health record corrected by user through record-specific editor'});close();clearPending('record edited in dedicated editor');await refreshData();render();showToast('Health record corrected; the prior version remains in audit history.');};
  }

  async function editEvent(id) {
    const e=state.events.find(x=>x.id===id); if(!e)return;
    if(isWorkoutEvent(e)){openWorkoutEditModal(id);return;}
    if(semanticCategory(e)==='medication'){openMedicationOccurrenceEditModal(id);return;}
    openHealthRecordEditModal(id);
  }

  async function handleEditAnswer(text) {
    if(state.pending?.type!=='edit-event') return false;
    if(state.pending?.workflowId)state.workflowId=state.pending.workflowId;
    pushUser(text); render();
    const target=state.pending.event; const parsed=ZekeParser.interpret(text,{});
    if(!(parsed.events||[]).length){updateWorkflow('waiting_correction',{needed:['corrected value or details'],save_status:'not_saved'},'The correction could not be interpreted safely.');logUnresolved('Event correction could not be interpreted.',{event_id:target.id,correction_text:text});pushZeke('I could not interpret the correction safely. Please include the corrected value or details. Nothing has been changed.');render();return true;}
    const replacement=parsed.events[0];
    window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'event_correction_proposed',event_id:target.id,correction_text:text,proposed:replacement.structured});
    state.pending={type:'edit-confirm',event:target,replacement,workflowId:state.workflowId};
    updateWorkflow('waiting_confirmation',{proposed:replacement,needed:[],save_status:'not_saved',available_actions:['Save correction','Cancel']},'An event correction is ready for confirmation.');
    pushZeke(`I understand the correction as ${parsed.summary}. Replace the structured details for the selected record while keeping an audit trail?`,{choices:[{label:'Save correction',value:'edit-confirm'},{label:'Cancel without changing it',value:'edit-cancel'}]});render();return true;
  }

  async function handleEditChoice(value) {
    if(state.pending?.type!=='edit-confirm')return;
    if(state.pending?.workflowId)state.workflowId=state.pending.workflowId;
    if(value==='edit-cancel'){pushZeke('Canceled. I made no changes.');state.pending=null;closeWorkflow('not_saved','Correction canceled; no record changed.',{save_status:'not_saved'});render();return;}
    if(value==='edit-confirm'){
      await ZekeData.updateEvent(state.pending.event.id,{category:state.pending.replacement.category,structured:state.pending.replacement.structured,correction_note:'Corrected through Talk to ZEKE'});
      window.ZekeWorkflowEngine?.correction({workflow_id:state.workflowId,kind:'event_correction_saved',event_id:state.pending.event.id,after:state.pending.replacement.structured});
      pushZeke('Corrected. The previous version is preserved in the audit history.');state.pending=null;await refreshData();closeWorkflow('completed','The selected record was corrected and prior values were preserved.',{save_status:'corrected'});render();
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

  async function reviewDocumentFile(file){
    if(!window.ZekeDocumentIntake)throw new Error('Document intake is unavailable.');
    $('#documentReviewModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="documentReviewModal"><section class="direct-entry-card document-review-card"><div class="section-head"><div><span class="tile-kicker">DOCUMENT INTAKE</span><h2>Review ${esc(file.name)}</h2><p id="documentReviewProgress">Preparing source preview…</p></div><button class="icon-btn" id="closeDocumentReview">×</button></div><div id="documentReviewBody"><div class="empty-inline">ZEKE is reading the source. Nothing will be saved until you review and confirm it.</div></div></section></div>`);
    const close=()=>$('#documentReviewModal')?.remove();$('#closeDocumentReview').onclick=close;$('#documentReviewModal').onclick=e=>{if(e.target.id==='documentReviewModal')close()};
    const progress=msg=>{const el=$('#documentReviewProgress');if(el)el.textContent=msg};
    try{
      const extraction=await ZekeDocumentIntake.extractFile(file,progress);progress(`Detected ${String(extraction.classification?.document_type||'unknown').replaceAll('_',' ')} · ${extraction.classification?.confidence||'low'} confidence · ${extraction.method}`);
      let proposal=null,manualPrompt='';
      try{const out=await ZekeDocumentIntake.propose(extraction);proposal=out.manual?null:out.result;manualPrompt=out.manual?out.prompt:'';}catch(err){manualPrompt=ZekeDocumentIntake.extractionPrompt(extraction);}
      const proposalText=proposal?JSON.stringify(proposal,null,2):'';
      $('#documentReviewBody').innerHTML=`<div class="document-review-grid"><section><h3>Source preview</h3><div class="source-provenance-strip"><span>${esc(extraction.filename)}</span><span>${esc(extraction.method)}</span><span>${esc(extraction.classification?.confidence||'low')} classification confidence</span></div><textarea id="documentSourcePreview" rows="14" readonly>${esc(extraction.preview||'No readable text was extracted.')}</textarea><details><summary>Extraction provenance</summary><pre>${esc(JSON.stringify({document_type:extraction.classification?.document_type,signals:extraction.classification?.signals,pages:extraction.page_count,pages_read:extraction.pages_read,size:extraction.size,sha256:extraction.sha256,mime_type:extraction.mime_type,captured_at:extraction.captured_at},null,2))}</pre></details></section><section><h3>Proposed structured data</h3><p>${proposal?'Review and edit the proposed JSON. Source text remains separate and traceable.':'No connected AI produced a structured proposal. Paste the manual consultation JSON below, or save only the source document for later review.'}</p>${manualPrompt?`<details><summary>Manual AI consultation packet</summary><textarea rows="10" readonly>${esc(manualPrompt)}</textarea></details>`:''}<textarea id="documentProposalJSON" rows="16" placeholder="Paste or edit proposed JSON here">${esc(proposalText)}</textarea><label class="checkbox-line"><input type="checkbox" id="documentConfirmReview"> I reviewed this proposal against the source preview.</label><p class="form-error" id="documentReviewError" hidden></p><div class="direct-entry-actions"><button class="secondary" id="saveSourceOnly">Save source for later review</button><button class="primary" id="confirmDocumentImport" ${proposal?'':'disabled'}>Confirm & save structured data</button></div></section></div>`;
      const saveSource=async(status='review')=>ZekeData.saveFactor({type:'source_document',status,priority:'normal',summary:`${extraction.classification?.document_type||'Document'}: ${file.name}`,document:{filename:file.name,mime_type:file.type||'',size:file.size,sha256:extraction.sha256,classification:extraction.classification,extraction_method:extraction.method,page_count:extraction.page_count,source_preview:extraction.preview,extracted_text:extraction.text.slice(0,120000)},provenance:{source:'document-intake',captured_at:extraction.captured_at}});
      $('#saveSourceOnly').onclick=async()=>{await saveSource('review');await ZekeData.saveImportBatch({type:'document-intake',file:file.name,status:'source_saved_for_review',counts:{structured_events:0},message:'Source and extraction preview preserved; no structured health events were confirmed.'});close();await refreshData();render();showToast('Source saved for later review. No health data was confirmed.');};
      const proposalBox=$('#documentProposalJSON');proposalBox.addEventListener('input',()=>{$('#confirmDocumentImport').disabled=!proposalBox.value.trim()});
      $('#confirmDocumentImport').onclick=async()=>{const err=$('#documentReviewError');err.hidden=true;if(!$('#documentConfirmReview').checked){err.hidden=false;err.textContent='Confirm that you reviewed the proposed data against the source first.';return;}let parsed;try{parsed=ZekeDocumentIntake.jsonFromText(proposalBox.value)}catch(ex){err.hidden=false;err.textContent=ex.message;return;}const events=Array.isArray(parsed.events)?parsed.events:[];if(!events.length){err.hidden=false;err.textContent='The proposal contains no structured events to save.';return;}const sourceFactor=await saveSource('confirmed');let imported=0,duplicates=0;for(const candidate of events){const cat=String(candidate.category||'other');const ts=/^\d{4}-\d{2}-\d{2}/.test(String(candidate.timestamp||''))?String(candidate.timestamp).slice(0,10):activeDay();const event={category:cat==='other'?'health_context':cat,timestamp:`${ts}T12:00:00`,raw_text:candidate.raw_text||candidate.source_excerpt||'',structured:{...(candidate.structured||{}),document_type:parsed.document_type||extraction.classification?.document_type,extraction_confidence:parsed.confidence||extraction.classification?.confidence,interpretation_status:'user-confirmed-from-document-review'},provenance:{source:'document-intake',file:file.name,source_factor_id:sourceFactor?.id||null,extraction_method:extraction.method,classification:extraction.classification?.document_type,classification_confidence:extraction.classification?.confidence,source_excerpt:candidate.source_excerpt||''}};const dupes=await ZekeData.findLikelyDuplicates(event);if(dupes.length){duplicates++;await ZekeData.saveFactor({type:'clarification_question',status:'open',priority:'medium',question_key:`document_duplicate:${crypto.randomUUID()}`,question:`This reviewed document item looks similar to an existing ZEKE record: ${humanEvent(event)}. Is it the same event or a separate one?`,why_it_matters:'ZEKE preserves source evidence without double-counting the same health event.',candidate_event:event,existing_event_id:dupes[0].event.id});continue;}await ZekeData.addEvent(event);imported++;}await ZekeData.saveImportBatch({type:'document-intake',file:file.name,status:'confirmed',counts:{structured_events:imported,duplicate_reviews:duplicates},message:`Reviewed document import confirmed. ${imported} event(s) saved; ${duplicates} possible duplicate(s) held for review.`});close();await refreshData();render();showToast(`Document reviewed: ${imported} structured event${imported===1?'':'s'} saved.`);};
    }catch(ex){progress('Could not finish document extraction.');$('#documentReviewBody').innerHTML=`<p class="form-error">${esc(ex.message||'Document extraction failed.')}</p><p class="safety-copy">PDF/image extraction is local in the browser except for lazily loaded open-source PDF/OCR libraries. If OCR cannot load, ZEKE does not invent document contents.</p>`;}
  }

  async function handleImport(file) {
    const status=$('#importStatus'); state.importStatus='Reading file…'; if(status)status.textContent=state.importStatus;
    try {
      const lowerName=file.name.toLowerCase(); const docExt=lowerName.split('.').pop(); if(['pdf','png','jpg','jpeg','webp','bmp','gif'].includes(docExt)){await reviewDocumentFile(file);state.importStatus='Document opened for source review; nothing is committed without confirmation.';if(status)status.textContent=state.importStatus;return;} let rows=[]; let historyPackage=null;
      if(lowerName.endsWith('.xlsx')||lowerName.endsWith('.xls')) {
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


  /* v0.26 mobile-save regression contract retained conceptually in Workout logging:
     $('#saveDirectWorkout').onclick=e=>{e.preventDefault();saveWorkoutForm()}
     $('#directWorkoutForm').onsubmit=e=>{e.preventDefault();saveWorkoutForm()}
     saveBtn.textContent='Checking…'
     errorEl.textContent=`Workout was not saved:
     Labels retained: Stair steps; Walking steps. */
  function openStorageReconnectDialog({onReconnect}={}){
    if($('#storageReconnectDialog'))return;
    document.body.insertAdjacentHTML('beforeend',`<div class="quick-log-overlay" id="storageReconnectDialog"><div class="quick-log-backdrop"></div><section class="quick-log-sheet storage-reconnect-sheet" role="dialog" aria-modal="true"><div class="section-head"><div><span class="tile-kicker">STORAGE</span><h2>Storage connection lost</h2><p>ZEKE cannot confirm new saves until the connection is restored. Your current entry is still here.</p></div></div><div class="storage-reconnect-actions"><button class="primary" id="storageReconnectNow">Reconnect</button><button class="secondary" id="storageKeepEditing">Keep editing</button><button class="text-action" id="storageReconnectCancel">Cancel</button></div></section></div>`);
    const close=()=>$('#storageReconnectDialog')?.remove();
    $('#storageKeepEditing').onclick=close;$('#storageReconnectCancel').onclick=close;
    $('#storageReconnectNow').onclick=async()=>{const b=$('#storageReconnectNow');b.disabled=true;b.textContent='Reconnecting…';try{await ZekeData.connect(state.storage?.providerId||'google-drive');await refreshData();close();showToast('Storage reconnected.');onReconnect?.();}catch(err){b.disabled=false;b.textContent='Try reconnecting again';showToast(err?.message||'Could not reconnect storage.','error')}};
  }

  function openFitnessLogMenu(){
    $('#fitnessLogMenu')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="quick-log-overlay workout-log-overlay" id="fitnessLogMenu"><div class="quick-log-backdrop" id="fitnessLogBackdrop"></div><section class="quick-log-sheet workout-log-sheet"><div class="section-head"><div><span class="tile-kicker">FITNESS</span><h2>Log exercise or activity</h2><p>Choose the entry path that fits what you are recording.</p></div><button class="icon-btn" id="closeFitnessLog">×</button></div><div class="workout-log-options"><button type="button" class="workout-log-choice" id="logSingleActivity"><span class="choice-icon">＋</span><div><strong>Enter one exercise or activity</strong><small>Walking, kayaking, PT, strength, cardio, chores, or a custom activity.</small></div><b>›</b></button><button type="button" class="workout-log-choice" id="logFromRoutine"><span class="choice-icon">▦</span><div><strong>Start from routine</strong><small>Load a reusable template, then edit or remove anything you do not perform.</small></div><b>›</b></button><button type="button" class="workout-log-choice" id="logRepeatLast"><span class="choice-icon">↻</span><div><strong>Repeat last workout</strong><small>Load prior exercises and values as editable suggestions—not completed records.</small></div><b>›</b></button></div></section></div>`);
    const close=()=>$('#fitnessLogMenu')?.remove();
    $('#closeFitnessLog').onclick=close;$('#fitnessLogBackdrop').onclick=close;
    $('#logSingleActivity').onclick=()=>{close();openExercisePicker({single:true})};
    $('#logFromRoutine').onclick=()=>{close();openWorkoutEntryModal({startWithRoutine:true})};
    $('#logRepeatLast').onclick=()=>{close();openWorkoutEntryModal({repeatLast:true})};
  }

  function openExercisePicker({single=false}={}){
    $('#exercisePickerModal')?.remove();
    const common=['Walking','Stair Climber','Treadmill','Stationary Bike','Kayaking','Lat Pulldown','Seated Row','Chest Press','Leg Press','Leg Extension','Seated Leg Curl','Bicep Curl','Abdominal','Shoulder Press','Tricep Press','Shoulder PT','Hamstring Stretch'];
    const custom=customActivityLibrary();
    const all=[...new Map([...common,...custom.map(x=>x.name)].map(n=>[activityKey(n),activityDisplayName(n)])).values()];
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay exercise-picker-overlay" id="exercisePickerModal"><section class="direct-entry-card exercise-picker-card"><div class="section-head"><div><span class="tile-kicker">ADD ONE AT A TIME</span><h2>Choose an exercise or activity</h2><p>Common choices appear first. Search the full library or create a custom activity.</p></div><button class="icon-btn" id="closeExercisePicker">×</button></div><label class="exercise-picker-search">Search library<input id="exercisePickerSearch" type="search" placeholder="Search exercise or activity" autocomplete="off"></label><div class="exercise-common-grid" id="exercisePickerList">${all.map(n=>`<button type="button" data-pick-exercise="${escAttr(n)}"><span>${/walk|run|tread/i.test(n)?'🚶':/bike|cycle/i.test(n)?'🚲':/stair/i.test(n)?'▥':/kayak/i.test(n)?'🛶':/pt|stretch|mobility/i.test(n)?'↔':'🏋'}</span><strong>${esc(n)}</strong></button>`).join('')}</div><button type="button" class="secondary wide" id="createCustomFromPicker">＋ Create custom exercise or activity</button></section></div>`);
    const close=()=>$('#exercisePickerModal')?.remove();$('#closeExercisePicker').onclick=close;$('#exercisePickerModal').onclick=e=>{if(e.target.id==='exercisePickerModal')close()};
    const bindChoices=()=>{$$('[data-pick-exercise]').forEach(btn=>btn.onclick=()=>{const name=btn.dataset.pickExercise;close();if(single)openActivityEntryModal(name);else openWorkoutEntryModal({addExercise:name})})};bindChoices();
    $('#exercisePickerSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();$$('[data-pick-exercise]').forEach(btn=>btn.hidden=q&&!btn.dataset.pickExercise.toLowerCase().includes(q))};
    $('#createCustomFromPicker').onclick=()=>{close();openAddActivityModal()};
  }

  function openConditionModal(){
    $('#conditionEntryModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="conditionEntryModal"><section class="direct-entry-card condition-entry-card"><div class="section-head"><div><span class="tile-kicker">HEALTH · CONDITIONS</span><h2>Add condition</h2><p>Record a diagnosed, self-reported, resolved, or uncertain condition without asking ZEKE to infer a diagnosis.</p></div><button class="icon-btn" id="closeConditionEntry">×</button></div><form id="conditionEntryForm" class="direct-entry-form"><label class="wide">Condition or diagnosis name<input id="conditionName" required autocomplete="off"></label><label>Effective / onset date<input id="conditionDate" type="date" value="${esc(activeDay())}" required></label><label>Status<select id="conditionStatus"><option value="active">Active</option><option value="resolved">Resolved</option><option value="remission">In remission</option><option value="uncertain">Uncertain</option></select></label><label>Resolution date (optional)<input id="conditionEndDate" type="date"></label><label>Source<select id="conditionSource"><option value="self-reported">Self-reported</option><option value="clinician-diagnosed">Clinician-diagnosed</option><option value="imported-record">Imported record</option><option value="other">Other</option></select></label><label class="wide">Clinician or facility (optional)<input id="conditionClinician"></label><label class="wide">Notes (optional)<textarea id="conditionNotes" rows="3"></textarea></label><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelConditionEntry">Cancel</button><button type="submit" class="primary">Save condition</button></div><p class="form-error wide" id="conditionEntryError" hidden></p></form></section></div>`);
    const close=()=>$('#conditionEntryModal')?.remove();$('#closeConditionEntry').onclick=close;$('#cancelConditionEntry').onclick=close;$('#conditionEntryModal').onclick=e=>{if(e.target.id==='conditionEntryModal')close()};
    $('#conditionEntryForm').onsubmit=async e=>{e.preventDefault();const name=$('#conditionName').value.trim(),date=$('#conditionDate').value,status=$('#conditionStatus').value,end=$('#conditionEndDate').value,source=$('#conditionSource').value,clinician=$('#conditionClinician').value.trim(),notes=$('#conditionNotes').value.trim();if(!name||!date)return;try{await ZekeData.addEvent({category:'condition',timestamp:`${date}T12:00:00`,raw_text:notes,structured:{condition:name,diagnosis:name,status,onset_date:date,resolution_date:end||null,source_type:source,clinician:clinician||null,notes,interpretation_status:'confirmed'},provenance:{source:'structured-condition-entry',entry_mode:'structured-form'}});close();await refreshData();state.healthTab='conditions';render();showToast(`${name} saved.`)}catch(err){const box=$('#conditionEntryError');box.hidden=false;box.textContent=`Condition was not saved: ${err?.message||'Unknown error'}`}};
  }

  function openWorkoutEntryModal(options={}){
    $('#directWorkoutModal')?.remove();
    const common=['Stair Climber','Treadmill Walking','Stationary Bike','Lat Pulldown','Seated Cable Row','Seated Chest Press','Leg Press','Leg Extension','Seated Leg Curl','Machine Biceps Curl','Ab Crunch Machine','Machine Shoulder Press','Cable Triceps Pressdown','Massage Chair','Side-Lying External Rotation (S/L ER)','Shoulder Internal Rotation — Resistance Band (IR)','Scaption (scaption)','Wall Slide / Wall Wash','Posterior Capsule Stretch (post cap stretch)'];
    const recentNames=[...new Set(dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e)&&isWorkoutEvent(e))).map(e=>workoutStructured(e).exercise).filter(Boolean))];
    const libraryNames=(window.ZekeKnowledgeBase?.catalog||[]).map(e=>e.name).filter(Boolean);
    const exerciseNames=[...new Map([...recentNames,...common,...libraryNames].map(n=>[activityKey(n),activityDisplayName(n)])).values()];
    let date=activeDay();
    const draftKey=()=>`zeke.workout.draft.${date}`;
    const readDraft=()=>{try{return JSON.parse(localStorage.getItem(draftKey())||'null')}catch{return null}};
    let draft=readDraft()||{date,items:[]};
    const persist=()=>{try{localStorage.setItem(draftKey(),JSON.stringify(draft))}catch(_){}};
    const clearDraft=()=>{try{localStorage.removeItem(draftKey())}catch(_){}};
    const workoutEvents=()=>dedupeDisplayEvents(state.events.filter(e=>recordIsActive(e)&&isWorkoutEvent(e)));
    const historyFor=name=>{const key=activityKey(name);return workoutEvents().map(e=>{const st=workoutStructured(e),identity=activityIdentity(st.exercise||'',st,e.raw_text||st.notes||''),variation=st.variation_name||identity.variation||st.exercise||'',date=e.timestamp||e.recorded_at;return {...st,event:e,date,equipment:st.equipment_type||st.equipment||identity.equipment||'unknown',load_basis:st.load_basis||identity.load_basis||'unknown',variation_name:variation};}).filter(w=>activityKey(w.variation_name)===key).sort((a,b)=>new Date(a.date)-new Date(b.date));};
    const lastFor=name=>historyFor(name).at(-1)||null;
    const primaryFromLast=(name,profile)=>{const last=lastFor(name);if(!last)return profile==='strength'?{sets:[{weight:'',reps:'',rpe:'',pain:''},{weight:'',reps:'',rpe:'',pain:''},{weight:'',reps:'',rpe:'',pain:''}]}:{duration_min:'',steps:'',distance_mi:'',intensity_min:'',intensity_max:''};if(profile==='strength'){const reps=Array.isArray(last.set_reps)&&last.set_reps.length?last.set_reps:Array(Math.max(1,Number(last.sets)||3)).fill(last.reps??'');const weights=Array.isArray(last.set_weights)&&last.set_weights.length?last.set_weights:Array(reps.length).fill(last.weight??'');const rpes=Array.isArray(last.set_rpe)?last.set_rpe:[];const pains=Array.isArray(last.set_pain)?last.set_pain:[];return{sets:reps.map((r,i)=>({weight:weights[i]??last.weight??'',reps:r??'',rpe:rpes[i]??'',pain:pains[i]??''}))};}return{duration_min:last.duration_min??'',steps:last.steps??'',distance_mi:last.distance_mi??'',intensity_min:last.intensity_min??last.level??'',intensity_max:last.intensity_max??''};};
    const blankItem=name=>{const display=activityDisplayName(name),profile=activityProfile(display),baseIdentity=activityIdentity(display,{},''),family=baseIdentity.family||normalizedActivityName(display),familyRows=workoutFamilyGroups({respectRange:false}).get(family)||[],recentVariation=familyRows.at(-1)?.variation_name||'',specific=activityKey(display)!==activityKey(family),selectedVariation=specific?(baseIdentity.variation||display):(recentVariation||''),known=knownVariationsForFamily(family,display),knownSelection=known.find(v=>activityKey(v.variation)===activityKey(selectedVariation)),equipment=knownSelection?.equipment||(selectedVariation?variationEquipmentFromLabel(selectedVariation,family):'unknown'),loadBasis=knownSelection?.load_basis||(selectedVariation?activityLoadBasis(equipment,selectedVariation,''):'unknown');return{exercise:family,profile,status:'not-started',source:'manual',...primaryFromLast(selectedVariation||display,profile),exercise_family:family,variation_name:selectedVariation,equipment_type:equipment||'unknown',load_basis:loadBasis||'unknown',rpe:'',rir:'',pain:'',rest_sec:'',notes:'',event_id:null};};
    const proposedBlockItem=block=>{const item=blankItem(block?.variation||block?.exercise||'Exercise'),profile=String(block?.type||item.profile||'').toLowerCase();item.exercise=normalizedActivityName(block?.exercise||item.exercise);item.exercise_family=item.exercise;item.profile=/cardio/.test(profile)?'cardio':/rehab|mobility|pt/.test(profile)?'mobility_pt':'strength';item.status='suggested';item.source='adaptive-proposal';item.variation_name=block?.variation||item.variation_name||'';item.proposal_reason=block?.why||'';item.progress_if=block?.progress_if||'';item.regress_or_stop_if=block?.regress_or_stop_if||'';if(item.profile==='strength'){const sets=Math.max(1,Number(block?.sets)||3),repText=String(block?.reps||'').match(/\d+/)?.[0]||'',loadText=String(block?.load||'').match(/\d+(?:\.\d+)?/)?.[0]||'';item.sets=Array.from({length:sets},()=>({weight:loadText,reps:repText,rpe:'',pain:''}));}else{item.duration_min=block?.duration_min!=null?String(block.duration_min):'';item.intensity_min=block?.intensity||'';}return item;};
    if(options.addExercise){draft.items.push(blankItem(options.addExercise));persist();}
    if(Array.isArray(options.proposedBlocks)&&options.proposedBlocks.length){const incoming=options.proposedBlocks.map(proposedBlockItem);if(draft.items.length){const replace=confirm('You already have a workout draft for today. Replace it with the ZEKE-recommended workout? Choose Cancel to append the recommendation instead.');draft.items=replace?incoming:[...draft.items,...incoming];}else draft.items=incoming;draft.session_context=options.sessionContext||{};draft.proposal_meta=options.proposalMeta||{};persist();}
    const statusLabel=item=>item.status==='saved'?['✓','Saved']:item.status==='in-progress'?['●','In progress']:item.status==='suggested'?['✦','Suggested']:['○','Not started'];
    const escAttr=v=>esc(v??'');
    const guideLibrary={
      'chest press':{image:'https://commons.wikimedia.org/wiki/Special:FilePath/Girl%20doing%20chest%20press%20machine%20exercise.jpg?width=900',credit:'Tyler Read / PTPioneer · CC BY 2.0',setup:'Adjust the seat so the handles begin around mid-chest height. Keep feet flat and your back supported.',movement:'Press smoothly without locking the elbows hard. Return under control to a comfortable range.',mistakes:'Avoid shrugging, bouncing the stack, flaring the elbows near the ears, or continuing through sharp pain.',tips:'Keep the same seat setting for comparable sessions. A neutral grip may be more comfortable for some shoulders.'},
      'lat pulldown':{image:'https://commons.wikimedia.org/wiki/Special:FilePath/Girl%20doing%20lat%20pulldown%20exercise.jpg?width=900',credit:'Tyler Read / PTPioneer · CC BY 2.0',setup:'Set the thigh pad securely and use a comfortable grip. Sit tall with a small natural lean.',movement:'Drive the elbows down toward the rib cage and pull toward the upper chest. Return slowly.',mistakes:'Do not pull behind the neck, swing deeply backward, or let the stack slam.',tips:'Think “elbows to pockets.” A neutral-grip attachment may feel better on the shoulders.'},
      'seated row':{image:'https://commons.wikimedia.org/wiki/Special:FilePath/Woman%20using%20a%20seated%20cable%20row%20machine%20at%20the%20gym.jpg?width=900',credit:'Miguel Angel Omaña Rojas · CC0',setup:'Set the feet and seat so the knees stay softly bent and the torso remains tall.',movement:'Drive the elbows back, pause near the ribs, then reach forward under control.',mistakes:'Avoid turning the movement into a low-back swing or shrugging toward the ears.',tips:'A one-second pause reduces momentum. Record the handle used because it changes the movement.'},
      'leg press':{image:'https://commons.wikimedia.org/wiki/Special:FilePath/Marian-Leg-Press.jpg?width=900',credit:'Abooyeah / AthletixVisuals Dubai · CC BY 4.0',setup:'Place the whole foot on the platform and adjust the seat so the pelvis stays supported.',movement:'Press through the mid-foot and heel. Lower under control without the low back rounding.',mistakes:'Avoid knees collapsing inward, heels lifting, bouncing, or hard knee lockout.',tips:'Record seat and foot placement. Use a controlled, comfortable range before adding load.'},
      'leg extension':{image:'https://commons.wikimedia.org/wiki/Special:FilePath/LegExtensionMachineExercise.JPG?width=900',credit:'George Stepanek · CC BY-SA 3.0',setup:'Align the machine pivot with the knee and place the shin pad above the ankle.',movement:'Straighten smoothly, pause briefly, and lower under control.',mistakes:'Avoid kicking with momentum, lifting the hips, or forcing a painful range.',tips:'Keep the seat and pad settings in notes for consistent comparisons.'},
      'seated leg curl':{image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Muscle_Strengthening_at_the_Gym_-_Leg_Curl.webm/640px--Muscle_Strengthening_at_the_Gym_-_Leg_Curl.webm.jpg',credit:'Centers for Disease Control and Prevention · U.S. public domain',setup:'Align the knee with the machine pivot and secure the thigh pad comfortably.',movement:'Curl the lower legs down and back, pause, then return slowly.',mistakes:'Avoid lifting the hips, bouncing the stack, or placing the pad on the Achilles tendon.',tips:'Use controlled lowering and record unilateral differences rather than averaging them away.'},
      'shoulder press':{image:'https://commons.wikimedia.org/wiki/Special:FilePath/ShoulderPressMachineExercise.JPG?width=900',credit:'George Stepanek · CC BY-SA 3.0',setup:'Use overhead pressing only when compatible with current restrictions. Set handles near shoulder height.',movement:'Press upward without aggressive shrugging and lower to a comfortable range.',mistakes:'Avoid flaring the ribs, arching the low back, or forcing painful depth.',tips:'Start lighter than horizontal pressing and record the grip and seat setting.'}
    };
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay zeke-workout-shell" id="directWorkoutModal"><div class="zeke-workout-app" role="dialog" aria-modal="true" aria-label="ZEKE workout entry"><header class="zeke-workout-header"><button type="button" class="zeke-back-button" id="workoutBackBtn" aria-label="Back"><span aria-hidden="true">‹</span><span class="zeke-back-label">Workout</span></button><div class="zeke-workout-title"><span>Talk to ZEKE</span><h2 id="workoutScreenTitle">Workout</h2></div><button type="button" class="icon-btn zeke-workout-more" id="closeDirectWorkout" aria-label="Exit workout entry">×</button><label class="zeke-workout-date">Date <input id="gymWorkoutDate" type="date" value="${escAttr(date)}"></label></header><main id="workoutScreen" class="zeke-workout-screen"></main></div></div>`);
    const screen=$('#workoutScreen'),title=$('#workoutScreenTitle'),back=$('#workoutBackBtn');let currentIndex=null;
    const markChanged=item=>{if(item.status!=='saved')item.status='in-progress';else item.status='in-progress';persist();};
    const summaryText=item=>{if(item.profile==='strength'){const sets=item.sets||[];const filled=sets.filter(s=>s.weight!==''||s.reps!=='');if(!filled.length)return'Prefilled from last time · not yet entered';const sameW=filled.every(s=>String(s.weight)===String(filled[0].weight)),sameR=filled.every(s=>String(s.reps)===String(filled[0].reps));if(sameW&&sameR)return`${filled[0].weight||'—'} lb · ${filled.length} × ${filled[0].reps||'—'}`;if(sameW)return`${filled[0].weight||'—'} lb · ${filled.map(s=>s.reps||'—').join(' / ')} reps`;return filled.map((s,i)=>`S${i+1} ${s.weight||'—'}×${s.reps||'—'}`).join(' · ');}return[item.duration_min?`${item.duration_min} min`:'',item.steps?`${item.steps} steps`:''].filter(Boolean).join(' · ')||'Prefilled from last time · not yet entered';};
    const renderSummary=()=>{currentIndex=null;screen.className='zeke-workout-screen is-workout-summary';back.hidden=true;title.textContent='Workout';const cards=draft.items.map((item,i)=>{const [icon,label]=statusLabel(item);return`<article class="zeke-workout-item-wrap" draggable="true" data-drag-index="${i}"><button type="button" class="zeke-workout-item" data-edit-workout-item="${i}"><span class="zeke-item-check state-${item.status}">${icon}</span><span><strong>${esc(item.exercise)}</strong><small>${esc(summaryText(item))}</small>${item.proposal_reason?`<small class="zeke-proposal-why">${esc(item.proposal_reason)}</small>`:''}<em>${esc(label)}</em></span><span aria-hidden="true">›</span></button><div class="zeke-reorder-actions"><button type="button" data-move-up="${i}" aria-label="Move ${esc(item.exercise)} up">↑</button><button type="button" data-move-down="${i}" aria-label="Move ${esc(item.exercise)} down">↓</button><button type="button" data-remove-item="${i}" aria-label="Remove ${esc(item.exercise)}">×</button></div></article>`}).join('');screen.innerHTML=`<section class="zeke-today-card"><div class="zeke-today-heading"><div><span class="tile-kicker">WORKOUT ENTRY</span><h3>${draft.items.length?`${draft.items.length} exercise${draft.items.length===1?'':'s'}`:'Choose how to begin'}</h3></div></div>${cards?`<div class="zeke-workout-items">${cards}</div>`:`<div class="zeke-empty-actions"><button type="button" class="primary" id="startRoutineBtn">Start from Routine</button><button type="button" class="secondary" id="addExerciseBtn">Enter Exercises</button></div>`}${draft.items.length?`<div class="zeke-summary-actions"><button type="button" class="secondary" id="addExerciseBtn">+ Add Exercise</button>${draft.items.some(x=>x.status==='saved')&&draft.items.some(x=>x.status!=='saved')?'<button type="button" class="secondary" id="adaptRemainingWorkoutBtn">✦ Adapt remaining workout</button>':''}<button type="button" class="primary" id="endWorkoutBtn">End Workout</button></div>`:''}</section><section class="zeke-exercise-picker" id="exercisePicker" hidden><h3>Add an exercise</h3><div class="zeke-common-exercises">${exerciseNames.slice(0,8).map(n=>`<button type="button" data-common-exercise="${escAttr(n)}">${esc(n)}</button>`).join('')}</div><details><summary>Search exercise library</summary><input id="exerciseSearch" type="search" placeholder="Search exercises"><div id="exerciseSearchResults" class="zeke-search-results"></div></details><button type="button" class="secondary" id="customExerciseBtn">Create custom exercise</button><div class="zeke-picker-actions"><button type="button" class="secondary" id="cancelExercisePicker">Cancel</button></div></section>`;
      const openPicker=()=>{$('#exercisePicker').hidden=false;};$('#addExerciseBtn')?.addEventListener('click',openPicker);$('#startRoutineBtn')?.addEventListener('click',()=>{const custom=Object.fromEntries(workoutRoutines().map(r=>[r.name,r.exercises])),templates={...BUILT_IN_ROUTINES,...custom},choices=Object.keys(templates);document.body.insertAdjacentHTML('beforeend',`<div class="zeke-mini-dialog" id="routinePicker"><section><h3>Start from Routine</h3><p>Exercises load as editable suggestions. Delete anything you do not perform.</p>${choices.map(x=>`<button type="button" data-routine="${escAttr(x)}">${esc(x)}</button>`).join('')}<button type="button" class="secondary" id="manageRoutinesFromPicker">Manage routines</button><button type="button" id="cancelRoutine">Cancel</button></section></div>`);$$('[data-routine]').forEach(b=>b.onclick=()=>{for(const n of templates[b.dataset.routine]||[]){const x=blankItem(n);x.status='suggested';x.source='routine';draft.items.push(x)}persist();$('#routinePicker').remove();renderSummary()});$('#manageRoutinesFromPicker').onclick=()=>{$('#routinePicker').remove();openRoutineManager()};$('#cancelRoutine').onclick=()=>$('#routinePicker').remove();});
      $('#cancelExercisePicker')?.addEventListener('click',()=>{$('#exercisePicker').hidden=true});const addName=n=>{if(!n)return;draft.items.push(blankItem(n));persist();renderExercise(draft.items.length-1)};$$('[data-common-exercise]').forEach(b=>b.onclick=()=>addName(b.dataset.commonExercise));$('#exerciseSearch')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();$('#exerciseSearchResults').innerHTML=q?exerciseNames.filter(n=>n.toLowerCase().includes(q)).slice(0,12).map(n=>`<button type="button" data-search-exercise="${escAttr(n)}">${esc(n)}</button>`).join(''):'';$$('[data-search-exercise]').forEach(b=>b.onclick=()=>addName(b.dataset.searchExercise));});$('#customExerciseBtn')?.addEventListener('click',()=>{const n=prompt('Custom exercise name');if(n?.trim())addName(n.trim())});$$('[data-edit-workout-item]').forEach(b=>b.onclick=()=>renderExercise(Number(b.dataset.editWorkoutItem)));$$('[data-move-up]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.moveUp);if(i>0){[draft.items[i-1],draft.items[i]]=[draft.items[i],draft.items[i-1]];persist();renderSummary()}});$$('[data-move-down]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.moveDown);if(i<draft.items.length-1){[draft.items[i+1],draft.items[i]]=[draft.items[i],draft.items[i+1]];persist();renderSummary()}});$$('[data-remove-item]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.removeItem),item=draft.items[i];if(item.status==='saved'&&!confirm('Remove this saved exercise from active history? The correction trail will be preserved.'))return;draft.items.splice(i,1);persist();renderSummary()});$('#adaptRemainingWorkoutBtn')?.addEventListener('click',async()=>{const btn=$('#adaptRemainingWorkoutBtn');btn.disabled=true;btn.textContent='Adapting…';const completed=draft.items.filter(x=>x.status==='saved').map((x,i)=>({order:i+1,exercise:x.exercise,variation:x.variation_name,rpe:x.rpe||null,pain:x.pain||null,sets:x.sets||null,duration_min:x.duration_min||null})),remaining=draft.items.filter(x=>x.status!=='saved').map((x,i)=>({order:i+1,exercise:x.exercise,variation:x.variation_name,reason:x.proposal_reason||''}));try{const result=await window.ZekeTrainingIntelligence.proposeWorkout({events:state.events,factors:state.factors,goals:trainingGoals(),sessionContext:{...(draft.session_context||{}),mode:'adapt_remaining',completed,remaining,current_order:draft.items.map(x=>x.exercise),instruction:'Return only the remaining workout blocks. Preserve completed exercises and adapt to recorded pain/RPE and order/fatigue.'}});if(result.manual){trainingPacketTextarea(result.prompt,'Adapt remaining workout',{kind:'workout',sessionContext:draft.session_context||{},onResult:async parsed=>{const next=(parsed?.blocks||[]).map(proposedBlockItem);draft.items=[...draft.items.filter(x=>x.status==='saved'),...next];draft.proposal_meta={...(draft.proposal_meta||{}),adapted_at:new Date().toISOString(),adaptation_summary:parsed?.summary||'',source:'manual-ai-consultation'};persist();renderSummary();showToast('Remaining workout adapted from the pasted AI response.')}});btn.disabled=false;btn.textContent='✦ Adapt remaining workout';return;}const next=(result.result?.blocks||[]).map(proposedBlockItem);draft.items=[...draft.items.filter(x=>x.status==='saved'),...next];draft.proposal_meta={...(draft.proposal_meta||{}),adapted_at:new Date().toISOString(),adaptation_summary:result.result?.summary||''};persist();renderSummary();showToast('Remaining workout adapted from your actual response.');}catch(err){btn.disabled=false;btn.textContent='Try adapting again';showToast(err?.message||'Could not adapt the remaining workout.','error')}});$('#endWorkoutBtn')?.addEventListener('click',()=>{const unsaved=draft.items.some(x=>x.status==='in-progress');if(unsaved&&!confirm('One or more exercises have unsaved changes. End the workout and keep only saved exercises?'))return;clearDraft();$('#directWorkoutModal')?.remove();showToast('Workout ended. You can add more exercises later today.');});
    };
    const readinessFor=(item,arr)=>{
      if(!item.variation_name)return{category:'Choose variation',position:'unknown',text:'Select the exact equipment or variation above. ZEKE will then use only comparable history for coaching and progression.',apply:null,evidence_ids:[],recommendation:null};
      const rec=activityRecommendation(item.variation_name,arr),last=rec.last||arr.at(-1),target=rec.target||null,targetReps=target?Number(String(target.reps||'').match(/\d+/)?.[0]||last?.reps||10):null,targetLoad=target?.load!=null?Number(target.load):null,targetSets=target?.sets!=null?Number(target.sets):null,progress=targetLoad!=null&&Number(last?.weight)>0&&targetLoad>Number(last.weight);
      return{category:rec.title||(arr.length?'Maintain quality':'Build a baseline'),position:rec.clinician_priority?'maintain':progress?'progress':target?'maintain':'unknown',text:[rec.rationale,rec.suggestion].filter(Boolean).join(' ')||(arr.length?'Use this exact variation consistently so ZEKE can compare like with like.':'No confirmed session exists for this exact variation yet. Log today to establish a baseline.'),apply:target&&targetLoad>0?{weight:targetLoad,reps:Math.max(1,targetReps||10),sets:Math.max(1,targetSets||3)}:null,evidence_ids:rec.evidence_ids||[],recommendation:rec};
    };
    const renderHistory=(item,returnIndex)=>{screen.className='zeke-workout-screen is-history-view';back.hidden=false;const label=item.variation_name||item.exercise;title.textContent=`${item.exercise} History`;const arr=item.variation_name?historyFor(item.variation_name):[];screen.innerHTML=`<section class="zeke-history-panel"><div class="mock-section-head"><div><strong>PROGRESSION HISTORY</strong><small>${esc(label)}</small></div></div>${arr.length?`<div class="zeke-history-list">${arr.slice().reverse().map(x=>`<article><strong>${fmtDate(x.event?.timestamp||x.date,{month:'short',day:'numeric',year:'numeric'})}</strong><span>${esc(x.weight!=null?`${x.weight} lb · ${x.sets||'—'} × ${x.reps||'—'}${x.rpe!=null&&x.rpe!==''&&Number.isFinite(Number(x.rpe))?` · RPE ${x.rpe}`:''}`:[x.duration_min?`${x.duration_min} min`:'',x.steps?`${x.steps} steps`:''].filter(Boolean).join(' · ')||'No primary values')}</span></article>`).join('')}</div>`:`<div class="zeke-compact-empty"><strong>${item.variation_name?'No confirmed history for this variation yet.':'Choose a variation first.'}</strong><p>ZEKE keeps mechanically different equipment histories separate.</p></div>`}</section>`;back.onclick=()=>renderExercise(returnIndex);};
    const renderExercise=index=>{
      currentIndex=index;const item=draft.items[index],profile=item.profile||activityProfile(item.exercise),family=item.exercise_family||activityIdentity(item.exercise,{},'').family||item.exercise,arr=item.variation_name?historyFor(item.variation_name):[],last=arr.at(-1),ready=readinessFor(item,arr),variations=knownVariationsForFamily(family,item.exercise);
      screen.className='zeke-workout-screen is-exercise-view';back.hidden=false;back.onclick=renderSummary;title.textContent=item.exercise;
      const currentIsKnown=variations.some(v=>activityKey(v.variation)===activityKey(item.variation_name));
      const variationOptions=`<option value="" ${!item.variation_name?'selected':''}>Choose equipment / variation…</option>${variations.map(v=>`<option value="${escAttr(v.variation)}" ${activityKey(v.variation)===activityKey(item.variation_name)?'selected':''}>${esc(v.variation)}</option>`).join('')}${item.variation_name&&!currentIsKnown?`<option value="${escAttr(item.variation_name)}" selected>${esc(item.variation_name)}</option>`:''}<option value="__new__">＋ Create new variation…</option>`;
      const comparable=arr.filter(x=>profile==='strength'?Number(x.weight)>0:Number(x.duration_min)>0),chartVals=comparable.slice(-7).map(x=>Number(profile==='strength'?x.weight:x.duration_min)).filter(v=>Number.isFinite(v)&&v>0);
      let progressVisual='';
      if(chartVals.length>=2){const min=Math.min(...chartVals),max=Math.max(...chartVals),range=Math.max(1,max-min),points=chartVals.map((v,i)=>`${6+i*(88/Math.max(1,chartVals.length-1))},${46-((v-min)/range)*30}`).join(' ');progressVisual=`<svg viewBox="0 0 100 56" preserveAspectRatio="none" role="img" aria-label="Recent ${profile==='strength'?'load':'duration'} trend for ${escAttr(item.variation_name)}"><line x1="0" y1="48" x2="100" y2="48"/><polyline points="${points}"/></svg><p>${chartVals.length} comparable sessions · same variation</p>`}else if(chartVals.length===1)progressVisual='<div class="zeke-compact-empty"><strong>1 comparable session</strong><p>Another session is needed to establish a trend.</p></div>';else progressVisual=`<div class="zeke-compact-empty"><strong>${item.variation_name?'No comparable sessions yet':'Choose a variation first'}</strong><p>${item.variation_name?'Today can establish the baseline.':'Progression appears only after ZEKE knows which equipment history applies.'}</p></div>`;
      const lastSummary=last?(profile==='strength'?(()=>{const reps=Array.isArray(last.set_reps)&&last.set_reps.length?last.set_reps:Array(Number(last.sets)||1).fill(last.reps);const weights=Array.isArray(last.set_weights)&&last.set_weights.length?last.set_weights:Array(reps.length).fill(last.weight);const sameW=weights.every(w=>String(w)===String(weights[0])),sameR=reps.every(r=>String(r)===String(reps[0]));return sameW&&sameR?`${weights[0]??'—'} lb · ${reps.length} × ${reps[0]??'—'}`:`${weights.map((w,i)=>`${w??'—'}×${reps[i]??'—'}`).join(' · ')}`;})():[last.duration_min?`${last.duration_min} min`:'',last.steps?`${last.steps} steps`:''].filter(Boolean).join(' · ')):'No previous exact-variation entry';
      const strengthRows=(item.sets||[{weight:'',reps:'',rpe:'',pain:''},{weight:'',reps:'',rpe:'',pain:''},{weight:'',reps:'',rpe:'',pain:''}]).map((set,i)=>`<div class="zeke-set-row workout-set-row" data-set-row="${i}"><span class="set-number">${i+1}</span><label><small>Weight</small><input class="set-weight" type="number" min="0.1" step="0.1" inputmode="decimal" value="${escAttr(set.weight)}"></label><label><small>Reps</small><input class="set-reps" type="number" min="1" step="1" inputmode="numeric" value="${escAttr(set.reps)}"></label><label class="set-optional"><small>Effort</small><input class="set-rpe" type="number" min="1" max="10" step="0.5" inputmode="decimal" value="${escAttr(set.rpe)}" placeholder="—"></label><label class="set-optional"><small>Pain</small><input class="set-pain" type="number" min="0" max="10" step="1" inputmode="numeric" value="${escAttr(set.pain)}" placeholder="—"></label><button type="button" data-delete-set="${i}" aria-label="Delete set ${i+1}">×</button></div>`).join('');
      const entry=profile==='strength'?`<div class="workout-set-head"><span>Set</span><span>Weight</span><span>Reps</span><span>Effort</span><span>Pain</span><span></span></div><div id="strengthSets">${strengthRows}</div><button type="button" class="secondary mock-add-set" id="addSetBtn">＋ Add Set</button>`:`<div class="zeke-cardio-grid"><label>Duration (min)<input id="exerciseDuration" type="number" min="1" step="1" value="${escAttr(item.duration_min)}"></label><label>${/stair|climb/i.test(item.exercise)?'Steps':'Distance (mi)'}<input id="exercisePrimaryCardio" type="number" min="0" step="0.01" value="${escAttr(/stair|climb/i.test(item.exercise)?item.steps:item.distance_mi)}"></label><label>Intensity minimum (optional)<input id="exerciseIntensityMin" type="number" min="0" step="0.1" value="${escAttr(item.intensity_min)}"></label><label>Intensity maximum (optional)<input id="exerciseIntensityMax" type="number" min="0" step="0.1" value="${escAttr(item.intensity_max)}"></label></div>`;
      const guide=window.ZekeKnowledgeBase?.get?.(item.variation_name)||window.ZekeKnowledgeBase?.get?.(family)||window.ZekeExerciseGuides?.get?.(item.variation_name)||window.ZekeExerciseGuides?.get?.(family)||guideLibrary[activityKey(family)]||null,image=guide?.media?.image||guide?.photo?.src||guide?.image||'',setup=Array.isArray(guide?.setup)?guide.setup:guide?.setup?[guide.setup]:[],movement=Array.isArray(guide?.movement)?guide.movement:guide?.movement?[guide.movement]:[],tips=Array.isArray(guide?.tips)?guide.tips:Array.isArray(guide?.mindMuscle)?guide.mindMuscle:guide?.tips?[guide.tips]:[];
      const guideMarkup=`<details class="workout-inline-guide" open><summary><span><strong>FORM GUIDE</strong><small>Setup and movement cues stay on this page</small></span><b>⌄</b></summary><div class="workout-guide-body">${image?`<figure><img src="${escAttr(image)}" alt="${escAttr(guide?.photo?.alt||`Form guide for ${family}`)}"><figcaption>${esc(guide?.media?.source||guide?.photo?.credit||'Exercise form reference')}</figcaption></figure>`:`<div class="mobile-form-placeholder"><strong>Verified visual guide</strong><span>${esc(family)}</span></div>`}<div class="workout-guide-cues">${setup.length?`<h4>Setup</h4><ul>${setup.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${movement.length?`<h4>Movement</h4><ul>${movement.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${tips.length?`<h4>Tips</h4><ul>${tips.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${!setup.length&&!movement.length&&!tips.length?'<p>Use controlled, repeatable form and stop for sharp or increasing pain.</p>':''}<button type="button" class="text-action" id="formGuideBtn">Open full form guide ›</button></div></div></details>`;
      const coachLast=last?`${fmtDate(last.date||last.event?.timestamp,{month:'short',day:'numeric'})} · ${lastSummary}`:'No prior confirmed session for this exact variation.';
      screen.innerHTML=`<div class="mock-exercise-page professional-workout-page"><section class="workout-variation-card"><div class="mobile-card-heading"><span class="tile-kicker">EXERCISE SETUP</span><strong>Choose the exact variation first</strong></div><label>Equipment / variation<select id="workoutExerciseVariation">${variationOptions}</select></label><div class="variation-context"><span><small>Equipment</small><strong>${esc(item.equipment_type&&item.equipment_type!=='unknown'?item.equipment_type:'Not specified')}</strong></span><span><small>Load basis</small><strong>${esc(item.load_basis&&item.load_basis!=='unknown'?item.load_basis.replaceAll('_',' '):'Not specified')}</strong></span><span><small>Comparable history</small><strong>${arr.length} session${arr.length===1?'':'s'}</strong></span></div></section><section class="mock-coach-card professional-coach-card ${!item.variation_name?'is-locked':''}"><div class="mock-card-title"><span class="mock-z-icon">Z</span><strong>COACH’S EYE</strong><span class="coach-confidence">${item.variation_name?'Exact variation':'Waiting for variation'}</span></div><div class="professional-coach-grid"><div><small>LAST · SAME VARIATION</small><p>${esc(coachLast)}</p></div><div><small>TODAY</small><h3>${esc(ready.category)}</h3><p>${esc(ready.text)}</p>${ready.apply?'<button type="button" class="secondary" id="applyProgressionBtn">Apply ZEKE target</button>':''}${item.variation_name?'<button type="button" class="text-action" id="workoutEvidenceBtn">Why / evidence</button>':''}</div></div></section><button type="button" class="mock-progress-card zeke-progress-button professional-progress-card" id="viewHistoryBtn" ${item.variation_name?'':'disabled'}><div class="mock-section-head"><div><strong>PROGRESSION</strong><small>${esc(item.variation_name||'Variation not selected')}</small></div><span>${item.variation_name?'View History ›':''}</span></div>${progressVisual}</button><section class="mock-today-card professional-entry-card"><div class="mock-section-head"><div><strong>TODAY’S ENTRY</strong><small>${last?'Prefilled from the last same-variation session':'Enter today’s work'}</small></div></div>${entry}<details class="zeke-optional-details"><summary>More details <span>optional</span></summary><div><label>RIR<input id="exerciseRir" type="number" min="0" max="10" step="1" value="${escAttr(item.rir)}"></label><label>Rest (seconds)<input id="exerciseRest" type="number" min="0" step="5" value="${escAttr(item.rest_sec)}"></label><label class="wide">Notes<textarea id="exerciseNotes" rows="3">${esc(item.notes||'')}</textarea></label></div></details><p class="form-error" id="exerciseSaveError" hidden></p></section>${guideMarkup}<div class="mock-save-row professional-save-row"><button type="button" class="secondary" id="cancelExerciseBtn">Cancel</button><button type="button" class="mock-save-exercise" id="saveExerciseBtn">Save exercise</button><div id="exerciseSaveState" class="mock-save-status" aria-live="polite"></div></div></div>`;
      const syncFromForm=()=>{if(profile==='strength'){item.sets=$$('.zeke-set-row').map(row=>({weight:$('.set-weight',row)?.value||'',reps:$('.set-reps',row)?.value||'',rpe:$('.set-rpe',row)?.value||'',pain:$('.set-pain',row)?.value||''}));}else{item.duration_min=$('#exerciseDuration')?.value||'';if(/stair|climb/i.test(item.exercise))item.steps=$('#exercisePrimaryCardio')?.value||'';else item.distance_mi=$('#exercisePrimaryCardio')?.value||'';item.intensity_min=$('#exerciseIntensityMin')?.value||'';item.intensity_max=$('#exerciseIntensityMax')?.value||'';}item.rir=$('#exerciseRir')?.value||'';item.rest_sec=$('#exerciseRest')?.value||'';item.notes=$('#exerciseNotes')?.value||'';markChanged(item);};
      screen.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input',syncFromForm));
      $('#workoutExerciseVariation')?.addEventListener('change',e=>{syncFromForm();let value=e.target.value;if(value==='__new__'){const custom=prompt(`Name the new ${family} variation (equipment or machine type):`);if(!custom?.trim()){renderExercise(index);return}value=custom.trim()}if(!value){item.variation_name='';item.equipment_type='unknown';item.load_basis='unknown'}else{const known=variations.find(v=>activityKey(v.variation)===activityKey(value)),equipment=known?.equipment||variationEquipmentFromLabel(value,family);item.variation_name=value;item.equipment_type=equipment||'unknown';item.load_basis=known?.load_basis||activityLoadBasis(equipment,value,'')||'unknown'}markChanged(item);renderExercise(index)});
      $('#addSetBtn')?.addEventListener('click',()=>{syncFromForm();const base=item.sets.at(-1)||{weight:'',reps:'',rpe:'',pain:''};item.sets.push({weight:base.weight||'',reps:'',rpe:'',pain:''});markChanged(item);renderExercise(index)});
      $$('[data-delete-set]').forEach(b=>b.onclick=()=>{syncFromForm();item.sets.splice(Number(b.dataset.deleteSet),1);if(!item.sets.length)item.sets.push({weight:'',reps:'',rpe:'',pain:''});markChanged(item);renderExercise(index)});
      $('#applyProgressionBtn')?.addEventListener('click',()=>{if(!ready.apply)return;item.sets=Array.from({length:ready.apply.sets},()=>({weight:String(ready.apply.weight),reps:String(ready.apply.reps),rpe:'',pain:''}));markChanged(item);renderExercise(index)});
      $('#viewHistoryBtn')?.addEventListener('click',()=>{syncFromForm();if(item.variation_name)renderHistory(item,index)});
      $('#workoutEvidenceBtn')?.addEventListener('click',()=>openCoachEvidence(item.variation_name));
      $('#formGuideBtn')?.addEventListener('click',()=>openFormGuide(item.variation_name||family));
      $('#cancelExerciseBtn').onclick=()=>{if(item.status==='in-progress'&&!confirm('Discard unsaved changes to this exercise?'))return;renderSummary()};
      $('#saveExerciseBtn').onclick=async()=>{syncFromForm();const btn=$('#saveExerciseBtn'),status=$('#exerciseSaveState'),error=$('#exerciseSaveError');error.hidden=true;const effectiveDate=$('#gymWorkoutDate').value||date;if(profile==='strength'){const valid=item.sets.filter(set=>set.weight!==''||set.reps!==''||set.rpe!==''||set.pain!=='');if(!valid.length||valid.some(set=>!(Number(set.weight)>0)||!(Number(set.reps)>0))){error.hidden=false;error.textContent='Each entered set needs a valid weight and reps. Effort and pain can be left blank.';return;}item.sets=valid;}else if(!(Number(item.duration_min)>0)){error.hidden=false;error.textContent='Enter a valid duration.';return;}btn.disabled=true;btn.textContent='Saving to storage…';status.textContent='';try{const variation=item.variation_name||item.exercise,equipment=item.equipment_type||variationEquipmentFromLabel(variation,family)||'unknown',loadBasis=item.load_basis||activityLoadBasis(equipment,variation,'')||'unknown',setRpes=profile==='strength'?item.sets.map(set=>set.rpe===''?null:Number(set.rpe)):[],setPains=profile==='strength'?item.sets.map(set=>set.pain===''?null:Number(set.pain)):[],numericRpes=setRpes.filter(Number.isFinite),numericPains=setPains.filter(Number.isFinite);const structured={exercise:family,canonical_activity_id:activityKey(family).replace(/ /g,'_'),activity_profile:profile,exercise_family:family,variation_name:variation,variation_id:activityKey(variation).replace(/ /g,'_'),equipment_type:equipment,load_basis:loadBasis,identity_schema_version:2,identity_confidence:item.variation_name?'user-confirmed':'unspecified',workout_id:`workout-${effectiveDate}`,workout_day:effectiveDate,weight:null,reps:null,sets:null,set_reps:null,set_weights:null,set_rpe:null,set_pain:null,duration_min:null,steps:null,distance_mi:null,intensity_min:null,intensity_max:null,rpe:numericRpes.length?Math.max(...numericRpes):null,rir:item.rir===''?null:Number(item.rir),pain:numericPains.length?Math.max(...numericPains):null,rest_sec:item.rest_sec===''?null:Number(item.rest_sec),notes:item.notes||'',completed:true,interpretation_status:'confirmed',activity_schema_version:4};if(profile==='strength'){structured.sets=item.sets.length;structured.set_reps=item.sets.map(set=>Number(set.reps));structured.set_weights=item.sets.map(set=>Number(set.weight));structured.set_rpe=setRpes;structured.set_pain=setPains;structured.weight=item.sets.every(set=>Number(set.weight)===Number(item.sets[0].weight))?Number(item.sets[0].weight):null;structured.reps=item.sets.every(set=>Number(set.reps)===Number(item.sets[0].reps))?Number(item.sets[0].reps):null;}else{structured.duration_min=Number(item.duration_min);structured.steps=item.steps===''?null:Number(item.steps);structured.distance_mi=item.distance_mi===''?null:Number(item.distance_mi);structured.intensity_min=item.intensity_min===''?null:Number(item.intensity_min);structured.intensity_max=item.intensity_max===''?null:Number(item.intensity_max);}await ZekeData.addEvent({category:'workout',timestamp:`${effectiveDate}T12:00:00`,raw_text:item.notes||'',structured,provenance:{source:'mobile-workout-entry',entry_mode:'variation-first-inline-set-table',prefill_source:last?'same-variation-confirmed-entry':'blank',identity_preserved:true,variation_aware:true,storage_status:'confirmed'}});item.status='saved';persist();status.innerHTML='<strong>✓ Saved</strong>';await refreshData();setTimeout(renderSummary,650)}catch(err){btn.disabled=false;btn.textContent='Try Save Again';status.textContent='Save failed';error.hidden=false;error.textContent=`Exercise was not saved: ${err?.message||'Unknown error'}`}};
    };
    const openFormGuide=exercise=>{if(openKnowledgeGuide(exercise))return;const reviewed=window.ZekeExerciseGuides?.get?.(exercise);const g=window.ZekeExerciseGuides?.has?.(exercise)?reviewed:guideLibrary[activityKey(exercise)];document.body.classList.add('zeke-sheet-open');document.body.insertAdjacentHTML('beforeend',`<div class="zeke-sheet-scrim" id="formGuideSheet"><section class="zeke-form-sheet mock-form-sheet" role="dialog" aria-modal="true"><div class="zeke-sheet-handle"></div><header><h2>${esc(exercise)} – Form Guide</h2><button type="button" id="closeFormGuide" aria-label="Close">×</button></header><div class="zeke-guide-content">${(g?.photo?.src||g?.image)?`<button type="button" class="zeke-guide-image" id="expandGuideSequence"><img src="${g.photo?.src||g.image}" alt="${escAttr(g.photo?.alt||`Adult actively performing ${exercise}`)}"><span>Tap to expand movement sequence</span></button><div class="zeke-guide-attribution"><small>${esc(g.photo?.credit||g.credit||'')}</small>${g.photo?.source?`<a href="${g.photo.source}" target="_blank" rel="noopener">Source</a>`:''}${g.photo?.license?.name?`<span>${esc(g.photo.license.name)}</span>`:''}</div>`:`<div class="zeke-guide-unavailable"><strong>Verified movement photo still being curated</strong><p>The written guide remains available; ZEKE will not substitute an unrelated image.</p></div>`}<section class="zeke-guide-sections"><h3>Setup</h3>${Array.isArray(g?.setup)?`<ul>${g.setup.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p>${esc(g?.setup||'Use the equipment instructions and choose a stable, comfortable setup.')}</p>`}<h3>Movement</h3>${Array.isArray(g?.movement)?`<ul>${g.movement.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p>${esc(g?.movement||'Move through a controlled, comfortable range without momentum.')}</p>`}<h3>Common Mistakes</h3>${Array.isArray(g?.mistakes)?`<ul>${g.mistakes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p>${esc(g?.mistakes||'Avoid uncontrolled movement, poor alignment, and continuing through sharp or increasing pain.')}</p>`}<h3>Tips</h3>${Array.isArray(g?.tips)?`<ul>${g.tips.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p>${esc(g?.tips||'Use repeatable form and a load or intensity you can control.')}</p>`}</section></div><button type="button" class="mock-got-it" id="gotItGuide">Got it</button></section></div>`);const close=()=>{$('#formGuideSheet')?.remove();document.body.classList.remove('zeke-sheet-open')};$('#closeFormGuide').onclick=close;$('#gotItGuide').onclick=close;$('#formGuideSheet').onclick=e=>{if(e.target.id==='formGuideSheet')close()};$('#expandGuideSequence')?.addEventListener('click',()=>{const btn=$('#expandGuideSequence');btn.classList.toggle('expanded');btn.querySelector('span').textContent=btn.classList.contains('expanded')?'Movement sequence: start → controlled effort → return':'Tap to view movement sequence';});};
    $('#gymWorkoutDate').addEventListener('change',e=>{const next=e.target.value;if(!next||next===date)return;if(draft.items.some(x=>x.status==='in-progress')&&!confirm('Change the workout date? Unsaved entries will move to the selected date.')){e.target.value=date;return;}persist();date=next;draft=readDraft()||{date,items:[]};draft.date=date;persist();renderSummary();});back.onclick=renderSummary;$('#closeDirectWorkout').onclick=()=>{if(draft.items.some(x=>x.status==='in-progress')&&!confirm('Exit workout entry with unsaved changes? They will remain available on this device.'))return;persist();$('#directWorkoutModal')?.remove();};renderSummary();
    if(options.repeatLast&&draft.items.length===0){const days=[...new Set(workoutEvents().map(e=>String(e.timestamp||e.recorded_at).slice(0,10)).filter(d=>d&&d<date))].sort();const previous=days.at(-1);if(previous){for(const e of workoutEvents().filter(x=>String(x.timestamp||x.recorded_at).slice(0,10)===previous)){const w=workoutStructured(e),item=blankItem(w.exercise);item.status='suggested';item.source='previous-workout';draft.items.push(item)}persist();renderSummary();}}
    if(options.startWithRoutine)setTimeout(()=>$('#startRoutineBtn')?.click(),0);
  }

  function openWeeklyPlanModal(){
    $('#weeklyPlanModal')?.remove();const plan=weeklyPlan();
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="weeklyPlanModal"><div class="direct-entry-card weekly-plan-modal"><div class="section-head"><div><h2>Plan the rest of this week</h2><p>A lightweight commitment prompt—not a calendar inference.</p></div><button class="icon-btn" id="closeWeeklyPlan">×</button></div><form id="weeklyPlanForm" class="direct-entry-form"><label>More gym workouts<select id="weeklyGym">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${Number(plan.gym_remaining)===n?'selected':''}>${n}</option>`).join('')}</select></label><label>More home workouts<select id="weeklyHome">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${Number(plan.home_remaining)===n?'selected':''}>${n}</option>`).join('')}</select></label><label>Typical time per workout<select id="weeklyDuration">${[30,40,45,60,75,90].map(n=>`<option value="${n}" ${Number(plan.duration||45)===n?'selected':''}>${n} minutes</option>`).join('')}</select></label><label>Home environment<select id="weeklyHomeEnvironment"><option value="home-dumbbells" ${plan.home_environment!=='home-bowflex'?'selected':''}>Dumbbells / bodyweight</option><option value="home-bowflex" ${plan.home_environment==='home-bowflex'?'selected':''}>Bowflex</option></select></label><p class="form-note wide">ZEKE will suggest a split. It will not assign days unless you choose them.</p><div class="direct-entry-actions wide"><button type="button" class="secondary" id="cancelWeeklyPlan">Cancel</button><button type="submit" class="primary">Save weekly expectation</button></div></form></div></div>`);
    const close=()=>$('#weeklyPlanModal')?.remove();$('#closeWeeklyPlan').onclick=close;$('#cancelWeeklyPlan').onclick=close;$('#weeklyPlanForm').onsubmit=async e=>{e.preventDefault();const next={...plan,week_key:currentWeekKey(),gym_remaining:Number($('#weeklyGym').value),home_remaining:Number($('#weeklyHome').value),duration:Number($('#weeklyDuration').value),home_environment:$('#weeklyHomeEnvironment').value};state.preferences={...state.preferences,fitness:{...(state.preferences?.fitness||{}),weekly_plan:next}};await ZekeData.savePreferences(state.preferences);close();render();showToast('Weekly workout expectation updated.');};
  }

  function trainingGoals(){return (state.factors||[]).filter(f=>f.type==='goal'&&!['deleted','dismissed','resolved'].includes(String(f.status||'').toLowerCase()));}
  function trainingPacketTextarea(prompt,title='Manual AI consultation',options={}){
    const kind=options.kind||'clinical';
    $('#trainingPacketModal')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="trainingPacketModal"><div class="direct-entry-card training-packet-card"><div class="section-head"><div><h2>${esc(title)}</h2><p>Paste this into ChatGPT, Claude, Gemini, or another AI. Then paste its JSON response back into ZEKE.</p></div><button class="icon-btn" id="closeTrainingPacket">×</button></div><label class="wide">ZEKE consultation packet<textarea id="trainingPacketText" rows="12">${esc(prompt)}</textarea></label><label class="wide">AI JSON response<textarea id="trainingPacketResponse" rows="8" placeholder="Paste the AI's JSON response here"></textarea></label><p class="form-error" id="trainingPacketError" hidden></p><div class="direct-entry-actions"><button class="secondary" id="selectTrainingPacket">Select packet</button><button class="primary" id="importTrainingResponse">${kind==='workout'?'Review workout response':'Import clinical map'}</button></div></div></div>`);const close=()=>$('#trainingPacketModal')?.remove();$('#closeTrainingPacket').onclick=close;$('#trainingPacketModal').onclick=e=>{if(e.target.id==='trainingPacketModal')close()};$('#selectTrainingPacket').onclick=()=>{$('#trainingPacketText').focus();$('#trainingPacketText').select()};$('#importTrainingResponse').onclick=async()=>{const text=$('#trainingPacketResponse').value.trim(),err=$('#trainingPacketError');if(!text){err.hidden=false;err.textContent='Paste the AI JSON response first.';return;}try{if(kind==='workout'){const parsed=window.ZekeTrainingIntelligence.importManualWorkoutResponse(text);close();if(options.onResult)await options.onResult(parsed);else showWorkoutProposalReview(parsed,options.sessionContext||{});}else{await window.ZekeTrainingIntelligence.importManualClinicalResponse(text,'Manual AI consultation packet');close();await refreshData();render();showToast('Clinical training context imported.')}}catch(ex){err.hidden=false;err.textContent=ex.message||'Could not import the response.'}};
  }
  function showWorkoutProposalReview(result,sessionContext={}){
    $('#manualWorkoutProposalModal')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="manualWorkoutProposalModal"><section class="direct-entry-card adaptive-workout-builder"><div class="section-head"><div><span class="tile-kicker">WORKOUT PROPOSAL</span><h2>${esc(result?.session_title||'Proposed workout')}</h2><p>Review or close this without changing any data. Starting loads the blocks as editable suggestions.</p></div><button class="icon-btn" id="closeManualWorkoutProposal">×</button></div>${adaptiveWorkoutResultHTML(result)}<div class="direct-entry-actions"><button class="secondary" id="closeManualWorkoutProposal2">Keep browsing</button><button class="primary" id="startManualWorkoutProposal">Start this workout</button></div></section></div>`);const close=()=>$('#manualWorkoutProposalModal')?.remove();$('#closeManualWorkoutProposal').onclick=close;$('#closeManualWorkoutProposal2').onclick=close;$('#manualWorkoutProposalModal').onclick=e=>{if(e.target.id==='manualWorkoutProposalModal')close()};$('#startManualWorkoutProposal').onclick=()=>{const blocks=Array.isArray(result?.blocks)?result.blocks:[];close();openWorkoutEntryModal({proposedBlocks:blocks,sessionContext,proposalMeta:{session_title:result?.session_title||'',summary:result?.summary||'',created_at:new Date().toISOString(),source:'manual-ai-consultation'}});};
  }
  function openManualTrainingPacketModal(){const prompt=window.ZekeTrainingIntelligence?.manualPacket('clinical',{events:state.events,factors:state.factors,goals:trainingGoals()})||'Training intelligence is unavailable.';trainingPacketTextarea(prompt);}
  function openTrainingClinicalModal(){
    $('#trainingClinicalModal')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="trainingClinicalModal"><div class="direct-entry-card"><div class="section-head"><div><h2>Clinical context → training map</h2><p>Paste a diagnosis, imaging impression, PT instructions, clinician restriction, or your own symptom description. ZEKE preserves source text and keeps AI inference separate.</p></div><button class="icon-btn" id="closeTrainingClinical">×</button></div><label class="wide">Clinical / rehab information<textarea id="trainingClinicalText" rows="8" placeholder="Example: MRI impression, PT plan, or 'pain when raising the arm above shoulder height'…"></textarea></label><div class="privacy-banner"><strong>What AI is asked to extract</strong><span>affected structures · relationship to injury · movement/load implications · explicit restrictions · rehab emphasis · uncertainty</span></div><p class="form-error" id="trainingClinicalError" hidden></p><div class="direct-entry-actions"><button class="secondary" id="cancelTrainingClinical">Cancel</button><button class="primary" id="runTrainingClinical">Interpret with ZEKE + AI</button></div></div></div>`);const close=()=>$('#trainingClinicalModal')?.remove();$('#closeTrainingClinical').onclick=close;$('#cancelTrainingClinical').onclick=close;$('#runTrainingClinical').onclick=async()=>{const text=$('#trainingClinicalText').value.trim(),btn=$('#runTrainingClinical'),err=$('#trainingClinicalError');if(!text){err.hidden=false;err.textContent='Enter the clinical or rehab context first.';return;}btn.disabled=true;btn.textContent='Interpreting…';try{const result=await window.ZekeTrainingIntelligence.interpretClinical({clinicalText:text,events:state.events,factors:state.factors,goals:trainingGoals()});if(result.manual){close();trainingPacketTextarea(result.prompt);return;}close();await refreshData();render();showToast('Clinical training map saved with provenance.')}catch(ex){btn.disabled=false;btn.textContent='Try again';err.hidden=false;err.textContent=ex.message||'AI interpretation failed.'}};
  }
  function adaptiveWorkoutResultHTML(r){const blocks=Array.isArray(r?.blocks)?r.blocks:[];return `<div class="adaptive-workout-result"><div class="privacy-banner"><strong>${esc(r?.session_title||'Adaptive session')}</strong><span>${esc(r?.summary||'')}</span></div>${blocks.length?`<div class="adaptive-workout-blocks">${blocks.map((b,i)=>`<article><span>${esc((b.type||'training').toUpperCase())}</span><strong>${i+1}. ${esc(b.exercise||'Exercise')}${b.variation?` · ${esc(b.variation)}`:''}</strong><p>${esc([b.sets?`${b.sets} sets`:null,b.reps?`${b.reps} reps`:null,b.duration_min?`${b.duration_min} min`:null,b.load,b.intensity,b.rom].filter(Boolean).join(' · '))}</p><small>${esc(b.why||'')}</small>${b.progress_if?`<div><b>Progress if:</b> ${esc(b.progress_if)}</div>`:''}${b.regress_or_stop_if?`<div><b>Regress/stop if:</b> ${esc(b.regress_or_stop_if)}</div>`:''}</article>`).join('')}</div>`:'<div class="empty-inline">The AI did not return workout blocks.</div>'}</div>`}
  function trainingEquipmentProfiles(){
    const defaults={
      'planet-fitness':['selectorized strength machines','cable stations','Smith machine','dumbbells','benches','treadmill','stationary bike','elliptical','stair climber'],
      'home-bowflex':['Bowflex Power Rod','bodyweight','resistance bands','floor/mat'],
      'home':['bodyweight','resistance bands','floor/mat'],
      'other':[]
    };
    return {...defaults,...(state.preferences?.fitness?.equipment_profiles||{})};
  }
  function openAdaptiveWorkoutModal(){
    $('#adaptiveWorkoutModal')?.remove();
    const plan=weeklyPlan(), defaultLocation=plan.home_environment==='home-bowflex'?'home-bowflex':'planet-fitness', defaultDuration=Number(plan.duration||45),equipmentProfiles=trainingEquipmentProfiles(),defaultEquipment=(equipmentProfiles[defaultLocation]||[]).join(', ');
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="adaptiveWorkoutModal"><div class="direct-entry-card adaptive-workout-builder"><div class="section-head"><div><h2>Plan a workout</h2><p>ZEKE proposes a session you can inspect before doing anything. Nothing is logged until you explicitly start or record it.</p></div><button class="icon-btn" id="closeAdaptiveWorkout">×</button></div><div class="adaptive-context-grid"><label>Where?<select id="adaptiveLocation"><option value="planet-fitness" ${defaultLocation==='planet-fitness'?'selected':''}>Planet Fitness</option><option value="home-bowflex" ${defaultLocation==='home-bowflex'?'selected':''}>Home — Bowflex</option><option value="home" ${defaultLocation==='home'?'selected':''}>Home — bodyweight / other</option><option value="other">Other / custom</option></select></label><label>Time available<select id="adaptiveDuration">${[20,30,40,45,60,75,90].map(n=>`<option value="${n}" ${defaultDuration===n?'selected':''}>${n} minutes</option>`).join('')}</select></label><label>Emphasis<select id="adaptiveEmphasis"><option value="zeke-decides">ZEKE decides</option><option value="balanced">Balanced</option><option value="strength">Strength</option><option value="cardio">Cardio</option><option value="rehab">PT / rehab emphasis</option></select></label><label class="wide">Available equipment<input id="adaptiveEquipment" value="${escAttr(defaultEquipment)}" placeholder="Machines, Bowflex, dumbbells, bands…"></label><label class="wide checkbox-line"><input id="rememberAdaptiveEquipment" type="checkbox" checked> Remember this equipment for this location</label><label class="wide">Anything different today?<input id="adaptiveNotes" placeholder="Optional: shoulder more sore, low energy, equipment unavailable…"></label></div><div id="adaptiveWorkoutBody"><div class="empty-inline">Choose or accept these defaults, then build a proposed session. You can browse the result without starting it.</div></div><p class="form-error" id="adaptiveWorkoutError" hidden></p><div class="direct-entry-actions"><button class="secondary" id="cancelAdaptiveWorkout">Close</button><button class="primary" id="runAdaptiveWorkout">Build proposed workout</button></div></div></div>`);
    const close=()=>$('#adaptiveWorkoutModal')?.remove();$('#closeAdaptiveWorkout').onclick=close;$('#cancelAdaptiveWorkout').onclick=close;
    $('#adaptiveLocation').addEventListener('change',()=>{$('#adaptiveEquipment').value=(trainingEquipmentProfiles()[$('#adaptiveLocation').value]||[]).join(', ')});
    $('#runAdaptiveWorkout').onclick=async()=>{const btn=$('#runAdaptiveWorkout'),err=$('#adaptiveWorkoutError');btn.disabled=true;btn.textContent='Consulting AI…';const location=$('#adaptiveLocation').value,equipment=$('#adaptiveEquipment').value.split(',').map(x=>x.trim()).filter(Boolean);if($('#rememberAdaptiveEquipment').checked){state.preferences={...state.preferences,fitness:{...(state.preferences?.fitness||{}),equipment_profiles:{...(state.preferences?.fitness?.equipment_profiles||{}),[location]:equipment}}};await ZekeData.savePreferences(state.preferences);}const sessionContext={location,equipment_available:equipment,duration_min:Number($('#adaptiveDuration').value),emphasis:$('#adaptiveEmphasis').value,notes:$('#adaptiveNotes').value.trim()};try{const result=await window.ZekeTrainingIntelligence.proposeWorkout({events:state.events,factors:state.factors,goals:trainingGoals(),sessionContext});if(result.manual){close();const prompt=window.ZekeTrainingIntelligence.manualPacket('workout',{events:state.events,factors:state.factors,goals:trainingGoals(),sessionContext});trainingPacketTextarea(prompt,'Manual workout-planning consultation',{kind:'workout',sessionContext});return;}$('#adaptiveWorkoutBody').innerHTML=adaptiveWorkoutResultHTML(result.result)+`<div class="proposed-workout-actions"><button type="button" class="secondary" id="keepBrowsingWorkout">Keep browsing</button><button type="button" class="primary" id="startProposedWorkout">Start this workout</button></div>`;btn.remove();$('#keepBrowsingWorkout').onclick=()=>showToast('Nothing logged. The proposed workout remains open for review.');$('#startProposedWorkout').onclick=()=>{const blocks=Array.isArray(result.result?.blocks)?result.result.blocks:[];close();openWorkoutEntryModal({proposedBlocks:blocks,sessionContext,proposalMeta:{session_title:result.result?.session_title||'',summary:result.result?.summary||'',created_at:new Date().toISOString()}});showToast('Recommended exercises loaded as editable suggestions. Nothing is recorded until you save an exercise.')};}catch(ex){btn.disabled=false;btn.textContent='Try again';err.hidden=false;err.textContent=ex.message||'Could not build the session.'}};
  }

  function openRoutineLibraryModal(){
    $('#routineLibraryModal')?.remove();const plan=weeklyPlan(),selected=plan.selected_routine_id;
    document.body.insertAdjacentHTML('beforeend',`<div class="direct-entry-overlay" id="routineLibraryModal"><div class="direct-entry-card routine-library-modal"><div class="section-head"><div><h2>Built-in routines</h2><p>Start from an evidence-informed structure, then keep equipment variations and personal history separate.</p></div><button class="icon-btn" id="closeRoutineLibrary">×</button></div><div class="routine-library-list">${(window.ZekeKnowledgeBase?.routines||[]).map(r=>`<article class="routine-template ${selected===r.id?'selected':''}"><div><span>${esc(r.location.replaceAll('-',' '))} · ${r.duration} min</span><strong>${esc(r.name)}</strong><p>${esc(r.note)}</p><div class="routine-session-chips">${r.sessions.map(s=>`<span>${esc(s.name)}</span>`).join('')}</div></div><button class="${selected===r.id?'secondary':'primary'} compact" data-select-routine="${esc(r.id)}">${selected===r.id?'Selected':'Use this routine'}</button></article>`).join('')}</div><div class="direct-entry-actions"><button class="secondary" id="closeRoutineLibraryBottom">Done</button></div></div></div>`);
    const close=()=>$('#routineLibraryModal')?.remove();$('#closeRoutineLibrary').onclick=close;$('#closeRoutineLibraryBottom').onclick=close;$$('[data-select-routine]').forEach(btn=>btn.onclick=async()=>{const next={...weeklyPlan(),selected_routine_id:btn.dataset.selectRoutine};state.preferences={...state.preferences,fitness:{...(state.preferences?.fitness||{}),weekly_plan:next}};await ZekeData.savePreferences(state.preferences);close();render();showToast('Routine selected for this week.');});
  }
  function openKnowledgeGuide(exercise){
    const kb=window.ZekeKnowledgeBase?.get?.(exercise);if(!kb)return null;
    document.body.classList.add('zeke-sheet-open');document.body.insertAdjacentHTML('beforeend',`<div class="zeke-sheet-scrim" id="knowledgeGuideSheet"><section class="zeke-form-sheet knowledge-form-sheet" role="dialog" aria-modal="true"><div class="zeke-sheet-handle"></div><header><div><span class="tile-kicker">${esc(kb.equipment)}</span><h2>${esc(kb.name)}</h2><p>${esc(kb.movement)} · ${esc(kb.primary.join(', '))}</p></div><button type="button" id="closeKnowledgeGuide" aria-label="Close">×</button></header><div class="knowledge-guide-scroll">${kb.media?.image?`<figure class="knowledge-media"><div class="knowledge-media-frames"><div><span>Start / setup</span><img src="${escAttr(kb.media.image)}" alt="Start or setup frame for ${escAttr(kb.name)}" referrerpolicy="no-referrer"></div>${kb.media.image2?`<div><span>Movement / finish</span><img src="${escAttr(kb.media.image2)}" alt="Movement or finish frame for ${escAttr(kb.name)}" referrerpolicy="no-referrer"></div>`:''}</div><figcaption><span>${esc(kb.media.source)} · ${esc(kb.media.license)}</span>${kb.media.source_url?`<a href="${escAttr(kb.media.source_url)}" target="_blank" rel="noopener">Source</a>`:''}</figcaption></figure>`:`<figure class="knowledge-media"><div class="media-fallback"><strong>Verified movement image not yet available</strong><p>The written guide remains available. ZEKE will not substitute unrelated mock imagery.</p></div></figure>`}<div class="knowledge-guide-grid"><section><h3>Setup</h3><ul>${kb.setup.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><h3>Movement</h3><ul>${kb.movement.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><h3>Mind-muscle / targeting cues</h3><ul>${kb.mindMuscle.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><h3>Common mistakes</h3><ul>${kb.mistakes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><h3>Breathing</h3><p>${esc(kb.breathing)}</p></section><section><h3>Modifications & limits</h3><ul>${kb.modifications.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section class="wide evidence-grade"><h3>Evidence context</h3><p>${esc(kb.evidence)}</p><span>${esc(kb.review.evidence_level)} · reviewed ${esc(kb.review.reviewed_at)}</span></section></div></div><div class="guide-sticky-actions"><button class="text-action" data-quick-exercise="${esc(kb.name)}">Log this activity</button><button class="primary" id="closeKnowledgeGuideBottom">Done</button></div></section></div>`);
    const img=$('#knowledgeGuideSheet img');if(img)img.onerror=()=>{img.closest('figure').innerHTML='<div class="zeke-guide-unavailable"><strong>Verified movement image not yet available</strong><p>The source image could not be loaded. ZEKE will not substitute an unrelated picture.</p></div>'};const close=()=>{$('#knowledgeGuideSheet')?.remove();document.body.classList.remove('zeke-sheet-open')};$('#closeKnowledgeGuide').onclick=close;$('#closeKnowledgeGuideBottom').onclick=close;$('#knowledgeGuideSheet').onclick=e=>{if(e.target.id==='knowledgeGuideSheet')close()};return kb;
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
    $('#quickTalkPrimary')?.addEventListener('click',()=>{state.quickLogOpen=false;render();setTimeout(()=>{$('#globalTalkButton')?.click();setTimeout(()=>$('#talkInput')?.focus(),0)},0)});
    $('#quickLogBackdrop')?.addEventListener('click',()=>{state.quickLogOpen=false;render()});
    $('#openWeeklyPlan')?.addEventListener('click',openWeeklyPlanModal);
    $('#openRoutineLibrary')?.addEventListener('click',openRoutineLibraryModal);
    $('#manageRoutinesBtn')?.addEventListener('click',openRoutineLibraryModal);
    $$('.plan-choices').forEach(group=>group.querySelectorAll('[data-plan-value]').forEach(btn=>btn.onclick=async()=>{const kind=group.dataset.planKind,plan=weeklyPlan(),next={...plan,week_key:currentWeekKey(),[kind==='gym'?'gym_remaining':'home_remaining']:Number(btn.dataset.planValue)};state.preferences={...state.preferences,fitness:{...(state.preferences?.fitness||{}),weekly_plan:next}};await ZekeData.savePreferences(state.preferences);render();}));
    $$('[data-form-guide]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();openKnowledgeGuide(btn.dataset.formGuide)||showToast('This exact guide is not curated yet.','error')});
    $('#applySafeRepairs')?.addEventListener('click',async()=>{const safe=repairCandidates().filter(r=>r.safe);if(!safe.length)return;if(!confirm(`Apply ${safe.length} high-confidence repair${safe.length===1?'':'s'}? ZEKE will create a complete repository backup first.`))return;const button=$('#applySafeRepairs');button.disabled=true;button.textContent='Backing up and repairing…';try{await ZekeData.applyIntegrityRepairs(safe);await refreshData();render();showToast(`${safe.length} safe repair${safe.length===1?'':'s'} applied; audit history preserved.`);}catch(error){button.disabled=false;button.textContent='Try again';showToast(error.message||'Repair failed.','error')}});
    $$('[data-quick-log]').forEach(el=>el.onclick=()=>{const kind=el.dataset.quickLog;state.quickLogOpen=false;render();setTimeout(()=>{if(kind==='workout')openWorkoutEntryModal();else if(kind==='activity')openAddActivityModal();else if(kind==='intake')openIntakeModal();else if(kind==='blood_pressure')openMetricEntryModal('blood_pressure');else if(kind==='lab')openMetricEntryModal('a1c');else if(kind==='symptom')openLifeEventModal('symptom');else if(kind==='life-event')openLifeEventModal('life_event');else if(kind==='medication')openMedicationEntryModal();else if(kind==='cycle')openLifeEventModal('menstrual_cycle');else if(kind==='gluten')openLifeEventModal('gluten_exposure');else if(kind==='waist_circumference')openBodyMeasurementModal();else openMetricEntryModal(kind)},0)});
    $('#profileForm')?.addEventListener('submit',async e=>{e.preventDefault();const value=$('#preferredNameInput')?.value.trim()||'',existing=userProfile(),profile={...existing,preferred_name:value,pronouns:$('#pronounsInput')?.value.trim()||'',gender_identity:$('#genderIdentityInput')?.value.trim()||'',sex_assigned_at_birth:$('#sexAssignedInput')?.value||'',clinical_context:$('#clinicalContextInput')?.value.trim()||'',updated_at:new Date().toISOString()};state.preferences={...state.preferences,user_profile:profile,profile_storage_version:1};await ZekeData.savePreferences(state.preferences);try{localStorage.removeItem('zeke-user-profile')}catch(_){}showToast(value?'Profile saved to your connected workspace.':'Profile saved to your connected workspace with a neutral greeting.');render();});
    $('#addActivityBtn')?.addEventListener('click',openAddActivityModal);
    $('#reviewExerciseIdentitiesBtn')?.addEventListener('click',openExerciseIdentityReviewModal);
    $('#interpretClinicalTrainingBtn')?.addEventListener('click',()=>openTrainingClinicalModal());
    $('#buildAdaptiveWorkoutBtn')?.addEventListener('click',()=>openAdaptiveWorkoutModal());
    $('#fitnessBuildBtn')?.addEventListener('click',()=>openAdaptiveWorkoutModal());
    $('#manualAIPacketBtn')?.addEventListener('click',()=>openManualTrainingPacketModal());
    $('#fitnessLogBtn')?.addEventListener('click',openFitnessLogMenu);
    $('#mobileLogButton')?.addEventListener('click',()=>{state.quickLogOpen=true;render()});
    $('#globalLogNav')?.addEventListener('click',()=>{document.body.classList.remove('nav-open');state.quickLogOpen=true;render()});
    $('#addConditionBtn')?.addEventListener('click',openConditionModal);
    $('#addGoalBtn')?.addEventListener('click',()=>openGoalModal());
    $$('[data-edit-goal]').forEach(el=>el.onclick=()=>openGoalModal(el.dataset.editGoal));
    $$('[data-remove-goal]').forEach(el=>el.onclick=async()=>{const goal=state.factors.find(f=>f.id===el.dataset.removeGoal&&f.type==='goal');if(!goal||!confirm(`Remove this goal from active use?\n\n${goal.summary||goal.goal_statement||'Goal'}`))return;await ZekeData.resolveFactor(goal.id,'dismissed','Removed by user');await refreshData();render();showToast('Goal removed from active use; audit history remains.');});
    $('#repeatLastWorkoutBtn')?.addEventListener('click',()=>openWorkoutEntryModal({repeatLast:true}));
    $$('[data-toggle-review-task]').forEach(el=>el.onclick=()=>{const key=el.dataset.toggleReviewTask;state.expandedReviewTasks.has(key)?state.expandedReviewTasks.delete(key):state.expandedReviewTasks.add(key);render()});
    $('#helpBtn')?.addEventListener('click',()=>showToast(`Help for ${state.route}: click metric tiles for evidence and interpretation; use Talk to ZEKE to log, correct, or backfill data.`));
    $('#statusBtn')?.addEventListener('click',()=>{const ai=(state.ai?.providers||[]).filter(x=>x.connected).map(x=>x.label||x.provider).join(', ')||'none';showToast(`ZEKE status — storage: ${state.storage?.providerId||'not connected'}; AI: ${ai}; open reviews: ${openQuestions().length}.`);});
    $('#mobileMoreButton')?.addEventListener('click',()=>document.body.classList.add('nav-open'));
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
    $$('[data-apply-repair]').forEach(el=>el.onclick=async()=>{
      const repair=repairCandidates()[Number(el.dataset.applyRepair)];if(!repair)return;
      el.disabled=true;el.textContent='Applying…';
      try{await ZekeData.applyIntegrityRepairs([repair]);state.integrityLastAction=`Applied: ${repair.recommendation}`;await refreshData();render();showToast('Repair applied. Original evidence and a repository backup were preserved.');}catch(error){el.disabled=false;el.textContent='Try again';showToast(error.message||'Repair failed.','error')}
    });
    $$('[data-dismiss-repair]').forEach(el=>el.onclick=async()=>{const repair=repairCandidates()[Number(el.dataset.dismissRepair)];if(!repair)return;const dismissed=[...new Set([...(state.preferences?.integrity_dismissed||[]),repair.key])];state.preferences={...state.preferences,integrity_dismissed:dismissed};await ZekeData.savePreferences(state.preferences);render();showToast('ZEKE will keep these records as separate and stop asking about this item.');});
    $('#undoIntegrityChange')?.addEventListener('click',async()=>{if(!confirm('Undo the most recent cleanup action from this browser session?'))return;try{const result=await ZekeData.undoLastIntegrityChange();state.integrityLastAction=`Undid cleanup: ${result.reason}`;await refreshData();render();showToast(state.integrityLastAction);}catch(err){showToast(err.message);}});

    $$('[data-coach-exercise]').forEach(el=>el.onclick=()=>{state.coachFocus=el.dataset.coachExercise;state.expandedActivity=el.dataset.coachExercise;try{sessionStorage.setItem('zeke-focus-activity',state.expandedActivity)}catch(_){};document.body.classList.remove('nav-open');go('fitness');setTimeout(()=>document.querySelector(`[data-activity-name="${CSS.escape(state.expandedActivity)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),80);});
    $$('[data-coach-evidence]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();openCoachEvidence(el.dataset.coachEvidence)});
    $$('[data-route]').forEach(el=>el.onclick=()=>{document.body.classList.remove('nav-open');go(el.dataset.route)});
    $('#openTalkNav')?.addEventListener('click',()=>{document.body.classList.remove('nav-open');document.body.classList.add('global-talk-open');setTimeout(()=>$('#talkInput')?.focus(),0)});
    $('#topTalkBtn')?.addEventListener('click',()=>{$('#globalTalkButton')?.click();setTimeout(()=>$('#talkInput')?.focus(),0)});
    $('#searchBtn')?.addEventListener('click',openGlobalSearchModal);
    $$('[data-medication-checkin]').forEach(el=>el.onclick=async()=>{const mode=el.dataset.medicationCheckin;if(mode==='unchanged'){state.preferences={...state.preferences,medication_checkin_last_completed:medicationCheckinKey(),medication_checkin_last_result:'no_changes'};await ZekeData.savePreferences(state.preferences);render();showToast('Medication and supplement review marked complete for this month.');return;}openMedicationReconciliationModal()});
    $$('[data-health-section]').forEach(el=>el.onclick=()=>{state.healthTab=el.dataset.healthSection;localStorage.setItem('zeke.health.libraryTab.v1',state.healthTab);go('health')});
    $('#loadCalendarReview')?.addEventListener('click',async()=>{const btn=$('#loadCalendarReview');try{if(btn){btn.disabled=true;btn.textContent='Scanning…';}state.calendarReview=await ZekeData.listCalendarEvents({pastDays:365,futureDays:0,maxResults:1200});state.calendarReviewLoaded=true;render();showToast(`Found ${calendarReviewCandidates().length} potentially relevant calendar items to screen.`);}catch(error){showToast(`Calendar review could not load: ${error.message}`,'error');if(btn){btn.disabled=false;btn.textContent='Try again';}}});
    $$('[data-calendar-relevance]').forEach(el=>el.onclick=async()=>{const id=el.dataset.calendarId,decision=el.dataset.calendarRelevance,event=(state.calendarReview||[]).find(x=>x.id===id);if(!event)return;const existing={...(state.preferences.calendar_relevance_reviews||{})};existing[id]={decision,reviewed_at:new Date().toISOString(),title:event.title,start:event.start};state.preferences={...state.preferences,calendar_relevance_reviews:existing};await ZekeData.savePreferences(state.preferences);if(decision==='relevant'||decision==='unsure'){const match=calendarHealthMatch(event),key=`calendar_confirm:${event.id}:${String(event.start||'').slice(0,10)}`;await ZekeData.saveFactor({type:'clarification_question',status:'open',priority:decision==='relevant'?'high':'normal',question_key:key,question:match?`Your calendar shows “${event.title}” on ${fmtDate(event.start,{month:'short',day:'numeric',year:'numeric'})}, and ZEKE found a possible matching health record. Is the existing record enough, or should I add/correct anything from this event?`:`Your calendar shows “${event.title}” on ${fmtDate(event.start,{month:'short',day:'numeric',year:'numeric'})}. Did this event actually happen, and should it be added to your health record?`,why_it_matters:'Calendar entries are candidate evidence only. Confirmation prevents ZEKE from treating a scheduled appointment as something that actually occurred.',candidate_event:{...event,calendar_relevance:decision,possible_existing_health_event_id:match?.id||null},provenance:{source:'retrospective-calendar-screening',screening_decision:decision}},{idempotencyKey:key});state.factors=await ZekeData.listFactors();}render();showToast(decision==='not_relevant'?'Marked not relevant.':decision==='relevant'?'Added to Questions for You for confirmation.':'Saved as unsure for follow-up.');});
    $$('[data-health-log]').forEach(el=>el.onclick=()=>openLifeEventModal(el.dataset.healthLog||'symptom'));
    $('#showAllWorkoutHistory')?.addEventListener('click',()=>{state.fitnessReviewIncomplete=false;render()});
    $$('[data-edit-recent-event]').forEach(el=>el.onclick=()=>openRecentEventEditModal(el.dataset.editRecentEvent));
    $$('[data-remove-event]').forEach(el=>el.onclick=async()=>{const id=el.dataset.removeEvent;if(!confirm('Remove this record from active views? The original will remain in the audit history and can be restored through correction tools.'))return;await ZekeData.undoEvents([id],'User removed record from history');await refreshData();render();showToast('Record removed from active views; audit history preserved.')});
    $$('[data-insights-view]').forEach(el=>el.onclick=()=>{state.insightsView=el.dataset.insightsView;sessionStorage.setItem('zeke-insights-view',state.insightsView);if(state.route!=='insights')go('insights');else render();});
    $$('[data-insight-action]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();const action=el.dataset.insightAction;if(action==='log-sleep'){state.healthTab='sleep';localStorage.setItem('zeke.health.libraryTab.v1','sleep');openMetricEntryModal('sleep_duration');return;}if(action==='fitness'){go('fitness');return;}if(action==='workout-review'){state.fitnessReviewIncomplete=true;go('fitness');return;}if(action==='pattern'){openEvidenceReview(el.dataset.insightKey||'Insight evidence');return;}if(action==='calendar-followup'){let event={};try{event=JSON.parse(el.dataset.calendarEvent||'{}')}catch(_){}beginWorkflow(`Follow up on ${event.title||'calendar event'}`,{goal:'Record the supported outcome of a calendar event',target:{calendar_event:event}});state.context={...state.context,calendar_followup:event,health_followup_target:/pt|physical therapy/i.test(event.title||'')?'attendance, symptoms, exercises, restrictions, or follow-up':/allergy|shot|immunotherapy/i.test(event.title||'')?'attendance and any reaction':'appointment outcome and related record changes'};updateWorkflow('waiting_clarification',{known:{calendar_event:event.title||'appointment'},needed:['whether it occurred and any supported outcome'],save_status:'not_saved'},'Calendar context prompted a health follow-up; attendance is not assumed.');pushZeke(`How did ${event.title||'the appointment'} go? I can record whether it occurred and any supported health updates, such as symptoms, exercises, restrictions, results, reactions, or follow-up tasks. The calendar event itself is not proof that it happened.`);go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0);}});
    $$('[data-range]').forEach(el=>el.onclick=()=>{state.range=el.dataset.range;try{localStorage.setItem('zeke-fitness-range',state.range)}catch(_){}render()});
    $$('[data-dashboard-range]').forEach(el=>el.onclick=()=>{const kind=el.dataset.dashboardRangeKind||'health',value=el.dataset.dashboardRange;if(kind==='trend'){state.dashboardTrendRange=value;try{localStorage.setItem('zeke-dashboard-trend-range',value)}catch(_){}}else{state.dashboardHealthRange=value;try{localStorage.setItem('zeke-dashboard-health-range',value)}catch(_){}}render()});
    $$('.fitness-range-select-control').forEach(el=>el.addEventListener('change',e=>{state.range=e.target.value;try{localStorage.setItem('zeke-fitness-range',state.range)}catch(_){}render();}));
    $$('[data-select-metric]').forEach(el=>el.onclick=()=>{state.selectedMetric=el.dataset.selectMetric;render()});
    $$('.metric-card[data-metric]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('button'))return;e.preventDefault();e.stopPropagation();openMetricDetail(el.dataset.metric);}));
    $$('[data-log-metric]').forEach(el=>el.onclick=()=>el.dataset.logMetric==='waist_circumference'?openBodyMeasurementModal('waist_circumference'):openMetricEntryModal(el.dataset.logMetric));
    $('#logWorkoutBtn')?.addEventListener('click',openFitnessLogMenu);
    $$('[data-context-exercise]').forEach(el=>el.onclick=()=>startContextLog('exercise',el.dataset.contextExercise));
    $$('[data-context-medication]').forEach(el=>el.onclick=()=>startContextLog('medication',el.dataset.contextMedication));
    $$('[data-action-id]').forEach(el=>el.onclick=()=>handleAction(el.dataset.actionId));
    $$('[data-edit-event]').forEach(el=>el.onclick=()=>editEvent(el.dataset.editEvent));
    $$('[data-edit-workout]').forEach(el=>el.onclick=()=>openWorkoutEditModal(el.dataset.editWorkout));

    $('#sendBtn')?.addEventListener('click',async()=>{const input=$('#talkInput');const text=(input?.value||'').trim();if(input)input.value='';if(!text)return;if(state.pending&&looksLikeIndependentNewEntry(text)&&!['question-awaiting'].includes(state.pending.type)){clearPending('new unrelated entry detected');pushZeke('I paused the earlier unfinished correction so it would not capture this new message.',{resolveQuestion:true});}if(await handlePendingAnswer(text))return;if(await handleEditAnswer(text))return;sendConversation(text)});
    $('#talkInput')?.addEventListener('input',e=>{state.draft=e.target.value;});
    document.querySelectorAll('input:not([type=file]), textarea, select, [contenteditable=true]').forEach(el=>el.addEventListener('blur',()=>{if(!state.deferredRender)return;setTimeout(()=>{if(state.deferredRender&&!isEditableElement(document.activeElement)){state.deferredRender=false;render();}},0);}));
    $('#talkInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#sendBtn')?.click()}});
    $$('[data-open-reviews]').forEach(el=>el.addEventListener('click',()=>go('questions')));
    $$('[data-dashboard-trend]').forEach(el=>el.addEventListener('toggle',()=>{const id=el.dataset.dashboardTrend;if(!id)return;el.open?state.expandedDashboardTrends.add(id):state.expandedDashboardTrends.delete(id)}));
    $$('[data-private-summary]').forEach(el=>el.addEventListener('toggle',()=>{const id=el.dataset.privateSummary;if(!id)return;el.open?state.expandedPrivateSummaries.add(id):state.expandedPrivateSummaries.delete(id)}));
    $$('[data-open-metric-detail]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openMetricDetail(el.dataset.openMetricDetail);}));
    $$('[data-resume-workflow]').forEach(el=>el.addEventListener('click',resumeCurrentWorkflow));
    $('#activeDateInput')?.addEventListener('change',e=>setActiveDate(e.target.value));
    $('#clearActiveDate')?.addEventListener('click',()=>setActiveDate(''));
    $$('[data-quick-exercise]').forEach(el=>el.addEventListener('click',()=>openExerciseEntryModal(el.dataset.quickExercise)));
    $('#addHealthHistory')?.addEventListener('click',()=>{beginWorkflow('Add personal or family health history',{goal:'Save a confirmed health-history detail',target:{type:'health_history'}});state.context={healthHistory:true};updateWorkflow('waiting_clarification',{needed:['the history detail and relationship'],save_status:'not_saved'},'Health-history entry started.');pushZeke('Tell me the personal or family health-history detail you want ZEKE to remember. You can say it naturally, for example: “My sister had a heart attack at 45.”');go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0)});
    $$('[data-conversation-choice]').forEach(el=>el.onclick=async()=>{el.classList.add('selected');el.disabled=true;const original=el.textContent;el.textContent='Working…';const v=el.dataset.conversationChoice;try{if(v.startsWith('question-'))return await handleQuestionChoice(v);if(v.startsWith('edit-'))return await handleEditChoice(v);return await handleChoice(v);}finally{if(document.body.contains(el)){el.disabled=false;el.textContent=original;el.classList.remove('selected');}}});
    $('#expandConversation')?.addEventListener('click',()=>{const expanded=document.body.classList.toggle('conversation-expanded');const btn=$('#expandConversation');if(btn){btn.textContent=expanded?'Collapse':'Expand';btn.setAttribute('aria-expanded',String(expanded));}});
    $('#conversationThread')?.addEventListener('scroll',e=>{const el=e.currentTarget;el.dataset.userScrolled=(el.scrollHeight-el.scrollTop-el.clientHeight>80)?'true':'false';});
    $$('[data-review-question]').forEach(el=>el.onclick=()=>{state.activeReviewId=el.dataset.reviewQuestion;state.reviewOriginalOpen=false;try{sessionStorage.setItem('zeke-active-review',state.activeReviewId)}catch(_){}render();});
    $('#backToReviewQueue')?.addEventListener('click',()=>{state.activeReviewId='';state.reviewOriginalOpen=false;try{sessionStorage.removeItem('zeke-active-review')}catch(_){}render();});
    $('#closeReviewWorkspace')?.addEventListener('click',()=>{state.activeReviewId='';try{sessionStorage.removeItem('zeke-active-review')}catch(_){}go('questions');render();});
    $$('[data-memory-tab]').forEach(el=>el.onclick=()=>{state.memoryTab=el.dataset.memoryTab;sessionStorage.setItem('zeke-memory-tab',state.memoryTab);render()});
    $$('[data-memory-edit]').forEach(el=>el.onclick=()=>{const id=el.dataset.memoryEdit;if(id.startsWith('action:')){const action=(state.actions.catalog||[]).find(a=>a.id===id.slice(7));if(action){beginWorkflow(`Edit ${action.label||action.name} schedule`,{goal:'Edit a remembered recurring schedule',target:{action_id:action.id,kind:action.kind||'action'}});updateWorkflow('waiting_clarification',{known:{current_schedule:action.schedule},needed:['updated schedule'],save_status:'not_saved'},'A remembered recurring schedule is being edited.');if(action.kind==='medication')openMedicationScheduleModal(action.label||action.name||'');else openRecurringActionScheduleModal(action);}}else{const factor=state.factors.find(f=>f.id===id.slice(7));if(factor){beginWorkflow(`Edit remembered context: ${factor.summary||factor.type}`,{goal:'Correct remembered context',target:{factor_id:factor.id}});state.pending={type:'memory-correction',factor,workflowId:state.workflowId};updateWorkflow('waiting_correction',{known:{current_memory:factor.summary||factor.answer||factor.value||''},needed:['corrected wording'],save_status:'not_saved'},'The user opened a remembered item for correction.');pushZeke(`Tell me how to correct this remembered context: “${factor.summary||factor.answer||factor.value||factor.type}”. Nothing changes until you confirm the correction.`);go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0);}}});
    $$('[data-memory-remove]').forEach(el=>el.onclick=async()=>{const id=el.dataset.memoryRemove;if(!confirm('Remove this remembered context? The audit trail will remain, but ZEKE will stop using it going forward.'))return;if(id.startsWith('action:')){const actionId=id.slice(7);state.actions=await ZekeData.saveActions({...state.actions,catalog:(state.actions.catalog||[]).map(a=>a.id===actionId?{...a,active:false,removed_at:new Date().toISOString()}:a)});}else{await ZekeData.resolveFactor(id.slice(7),'dismissed','Removed from remembered context by user');}window.ZekeWorkflowEngine?.correction({kind:'memory_removed',memory_id:id});await refreshData();render();showToast('Remembered context removed from future use.');});
    $$('[data-direct-question-choice]').forEach(el=>el.onclick=async()=>{const q=state.factors.find(f=>f.id===state.activeReviewId);if(!q)return;const wf=beginWorkflow(q.question||'Resolve duplicate review',{goal:'Resolve possible duplicate record',target:{question_id:q.id,question_key:q.question_key}});state.pending={type:'question',question:q,workflowId:wf?.id||state.workflowId};await handleQuestionChoice(el.dataset.directQuestionChoice);});
    $('#answerReviewNow')?.addEventListener('click',()=>{const q=state.factors.find(f=>f.id===state.activeReviewId);if(!q)return;const wf=beginWorkflow(q.question||'Resolve review item',{goal:`Resolve: ${reviewFriendlyTitle(q)}`,target:{question_id:q.id,question_key:q.question_key}});updateWorkflow('waiting_clarification',{known:{why_it_matters:q.why_it_matters||''},needed:['user decision or answer'],available_actions:pendingQuestionChoices(q).map(x=>x.label),save_status:'not_saved'},'The review item was moved into Talk to ZEKE.');state.pending={type:'question',question:q,workflowId:wf?.id||state.workflowId};state.activeReviewId='';try{sessionStorage.removeItem('zeke-active-review')}catch(_){}pushZeke(q.question||'Tell me what ZEKE should do with this item.',{choices:pendingQuestionChoices(q)});go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0);});
    $('#editReviewUnderstanding')?.addEventListener('click',()=>{const q=state.factors.find(f=>f.id===state.activeReviewId);if(!q)return;const wf=beginWorkflow(q.question||'Correct ZEKE understanding',{goal:`Correct understanding: ${reviewFriendlyTitle(q)}`,target:{question_id:q.id,question_key:q.question_key}});updateWorkflow('waiting_correction',{known:{current_understanding:reviewUnderstanding(q)},needed:['what ZEKE misunderstood'],save_status:'not_saved'},'The user chose to edit ZEKE’s understanding.');state.pending={type:'question-awaiting',question:q,other:true,workflowId:wf?.id||state.workflowId};state.activeReviewId='';sessionStorage.removeItem('zeke-active-review');pushZeke(`Tell me what is wrong with this understanding: “${reviewUnderstanding(q)}” Nothing has been changed yet.`);go('dashboard');render();setTimeout(()=>$('#talkInput')?.focus(),0);});
    $('#deferReview')?.addEventListener('click',async()=>{const q=state.factors.find(f=>f.id===state.activeReviewId);if(!q)return;await deferQuestion(q);state.activeReviewId='';sessionStorage.removeItem('zeke-active-review');await refreshData();render();showToast('Kept in Questions for You and moved behind newer questions. No data changed.');});
    $('#unknownReview')?.addEventListener('click',async()=>{const q=state.factors.find(f=>f.id===state.activeReviewId);if(!q)return;await ZekeData.resolveFactor(q.id,'unknown','User does not know');state.activeReviewId='';sessionStorage.removeItem('zeke-active-review');await refreshData();render();showToast('Recorded as unknown. ZEKE will not guess.');});
    $('#dismissReview')?.addEventListener('click',async()=>{const q=state.factors.find(f=>f.id===state.activeReviewId);if(!q||!confirm('Discard this review? The original source will remain preserved, and no structured data will be changed.'))return;await ZekeData.resolveFactor(q.id,'dismissed','Dismissed by user');state.activeReviewId='';sessionStorage.removeItem('zeke-active-review');await refreshData();render();showToast('Review discarded. No structured data changed.');});
    $('#previousReview')?.addEventListener('click',()=>{const tasks=reviewTasks(),i=tasks.findIndex(t=>t.items.some(q=>q.id===state.activeReviewId));if(i>0){state.activeReviewId=tasks[i-1].items[0].id;sessionStorage.setItem('zeke-active-review',state.activeReviewId);render();}});
    $('#nextReview')?.addEventListener('click',()=>{const tasks=reviewTasks(),i=tasks.findIndex(t=>t.items.some(q=>q.id===state.activeReviewId));if(i>=0&&i<tasks.length-1){state.activeReviewId=tasks[i+1].items[0].id;sessionStorage.setItem('zeke-active-review',state.activeReviewId);render();}});
    $$('[data-question-action]').forEach(el=>el.onclick=async()=>{const id=el.dataset.questionId;const action=el.dataset.questionAction;const q=state.factors.find(f=>f.id===id);if(!q)return;if(action==='dismiss')await ZekeData.resolveFactor(id,'dismissed','Dismissed by user');else await deferQuestion(q);await refreshData();render();});
    $$('[data-review-task-later]').forEach(el=>el.onclick=async()=>{const key=el.dataset.reviewTaskLater;const task=reviewTasks().find(t=>t.key===key);for(const q of task?.items||[])await deferQuestion(q,'Review task moved behind newer questions');await refreshData();render();showToast('Kept in Questions for You and moved behind newer questions.');});
    $$('[data-insight-evidence]').forEach(el=>el.onclick=(ev)=>{ev.preventDefault();ev.stopPropagation();document.body.insertAdjacentHTML('beforeend',insightEvidenceHTML(el.dataset.insightEvidence));$('#closeEvidenceFocus')?.addEventListener('click',()=>$('#evidenceFocus')?.remove());});
    $('#coachFocus')?.addEventListener('change',e=>{state.coachFocus=e.target.value;state.coachAI=null;state.coachExpanded=false;render()});
    $$('[data-dismiss-coach-alert]').forEach(el=>el.onclick=()=>{state.coachAlertDismissed[el.dataset.dismissCoachAlert]=true;render()});
    $('#toggleCoachEvidence')?.addEventListener('click',()=>{state.coachExpanded=!state.coachExpanded;render()});
    $('#deeperCoachAI')?.addEventListener('click',runDeeperCoachAnalysis);
    $('#expandCoachCard')?.addEventListener('click',e=>{e.stopPropagation();state.coachCardExpanded=true;render()});
    $('#coachCard')?.addEventListener('click',e=>{if(!state.coachCardExpanded&&!e.target.closest('button,select')){state.coachCardExpanded=true;render()}});
    $('#coachCard')?.addEventListener('keydown',e=>{if(!state.coachCardExpanded&&(e.key==='Enter'||e.key===' ')){e.preventDefault();state.coachCardExpanded=true;render()}});
    $('#collapseCoachCard')?.addEventListener('click',()=>{state.coachCardExpanded=false;state.coachExpanded=false;render()});
    $('#openCoachPatternLab')?.addEventListener('click',()=>openPatternLab(coachInsightFor(state.coachFocus)?.name||'Coach’s Eye'));
    $('#askZekeCoach')?.addEventListener('click',()=>{const x=coachInsightFor(state.coachFocus);pushZeke(`Let's look more closely at ${x?.name||'this exercise'}. What part of the recommendation would you like to discuss?`);state.route='dashboard';location.hash='#/dashboard';render()});
    $('#activityLibrarySelect')?.addEventListener('change',e=>{state.activityTab=e.target.value||'favorites';state.activitySearch='';state.expandedActivity='';render()});
    $('#activityLibrarySearch')?.addEventListener('input',e=>{state.activitySearch=e.target.value;const q=state.activitySearch.trim().toLowerCase();let visible=0;$$('[data-activity-name]').forEach(card=>{const match=!q||String(card.dataset.activitySearch||'').includes(q);card.hidden=!match;if(match)visible++;});const note=$('#activityLibraryNoMatches');if(note)note.hidden=visible>0;});
    $$('[data-activity-name]').forEach(el=>{el.onclick=e=>{if(e.target.closest('button'))return;state.expandedActivity=state.expandedActivity===el.dataset.activityName?'':el.dataset.activityName;render()};el.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();state.expandedActivity=state.expandedActivity===el.dataset.activityName?'':el.dataset.activityName;render()}}});
    $$('[data-collapse-activity]').forEach(el=>el.onclick=e=>{e.stopPropagation();state.expandedActivity='';render()});
    $$('[data-favorite-activity]').forEach(el=>el.onclick=e=>{e.stopPropagation();const set=new Set(JSON.parse(localStorage.getItem('zeke.fitness.activityFavorites.v1')||localStorage.getItem('zeke-activity-favorites')||'[]'));const name=el.dataset.favoriteActivity;set.has(name)?set.delete(name):set.add(name);localStorage.setItem('zeke.fitness.activityFavorites.v1',JSON.stringify([...set]));render()});
    $$('[data-activity-preference]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();const name=el.dataset.activityPreference,value=el.dataset.preferenceValue,map=activityPreferenceMap(),key=normalizedActivityName(name).toLowerCase();if(value==='neutral')delete map[key];else map[key]=value;localStorage.setItem('zeke.fitness.activityPreferences.v1',JSON.stringify(map));showToast(`${name}: ${activityPreferenceLabel(value)}.`);render()});
    $$('[data-activity-pattern]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();openActivityRelationshipReview(el.dataset.activityPattern)});
    $$('[data-pattern-focus]').forEach(el=>el.onclick=e=>{e.stopPropagation();openEvidenceReview(el.dataset.patternFocus||'Evidence review')});
    $$('[data-favorite-health]').forEach(el=>el.onclick=e=>{e.stopPropagation();const set=new Set(storedStringArray('zeke.health.metricFavorites.v1'));const id=el.dataset.favoriteHealth;set.has(id)?set.delete(id):set.add(id);localStorage.setItem('zeke.health.metricFavorites.v1',JSON.stringify([...set]));render()});
    $$('[data-health-tab]').forEach(el=>el.onclick=()=>{state.healthTab=el.dataset.healthTab;state.expandedHealthMetric='';localStorage.setItem('zeke.health.libraryTab.v1',state.healthTab);render()});
    $$('[data-health-metric]').forEach(el=>{el.onclick=e=>{if(e.target.closest('button'))return;state.expandedHealthMetric=state.expandedHealthMetric===el.dataset.healthMetric?'':el.dataset.healthMetric;render()};el.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();state.expandedHealthMetric=state.expandedHealthMetric===el.dataset.healthMetric?'':el.dataset.healthMetric;render()}}});
    $$('[data-theme]').forEach(el=>el.onclick=async()=>{state.theme=el.dataset.theme;document.documentElement.dataset.theme=state.theme;state.preferences={...state.preferences,theme:state.theme};await ZekeData.savePreferences(state.preferences);render()});
    $('#actionsLeft')?.addEventListener('click',()=>$('#actionsStrip')?.scrollBy({left:-300,behavior:'smooth'}));
    $('#actionsRight')?.addEventListener('click',()=>$('#actionsStrip')?.scrollBy({left:300,behavior:'smooth'}));
    $('#customizeBtn')?.addEventListener('click',()=>{state.customizeOpen=true;render()});
    $('#closeDrawer')?.addEventListener('click',()=>{state.customizeOpen=false;render()});
    $('#drawerBackdrop')?.addEventListener('click',e=>{if(e.target.id==='drawerBackdrop'){state.customizeOpen=false;render()}});
    $$('[data-toggle-widget]').forEach(el=>el.onchange=()=>{el.checked?state.hiddenWidgets.delete(el.dataset.toggleWidget):state.hiddenWidgets.add(el.dataset.toggleWidget);render()});
    $$('[data-metric-move]').forEach(el=>el.onclick=()=>{const available=availableMetrics(),order=dashboardMetricOrder(available),id=el.dataset.metricId,index=order.indexOf(id),next=el.dataset.metricMove==='up'?index-1:index+1;if(index<0||next<0||next>=order.length)return;[order[index],order[next]]=[order[next],order[index]];localStorage.setItem('zeke.dashboard.metricOrder.v1',JSON.stringify(order));render()});

    $$('[data-dismiss-insight]').forEach(el=>el.onclick=async()=>{const set=new Set(state.preferences.dismissedInsights||[]);set.add(el.dataset.dismissInsight);state.preferences={...state.preferences,dismissedInsights:[...set]};await ZekeData.savePreferences(state.preferences);render()});
    $('#refreshInsights')?.addEventListener('click',async()=>{state.preferences={...state.preferences,insightsRefreshedAt:new Date().toISOString()};await ZekeData.savePreferences(state.preferences);showToast('Insights refreshed against the latest verified records.');render()});
    $$('[data-thinking]').forEach(el=>el.onclick=async()=>{const v=el.dataset.thinking;if(v==='track-shakes'||v==='track-creatine'){const label=v==='track-shakes'?'Protein shake':'Creatine';pushZeke(`Great. How often do you normally use ${label.toLowerCase()}, and do you want it in Today's Actions or only logged when you mention it?`);render();$('#talkInput')?.focus()}else if(v==='later'){pushZeke('No problem. I’ll leave that for later.');render()}else{pushZeke('Understood. I won’t keep suggesting that.');render()}});

    $('[data-connect-storage="google-drive"]')?.addEventListener('click',async()=>{try{await ZekeData.connect('google-drive');await refreshData();render()}catch(e){showToast(e.message,'error');render()}});
    $('#saveCalendarPrivacy')?.addEventListener('click',async()=>{const categories={};$$('[data-calendar-category]').forEach(el=>categories[el.dataset.calendarCategory]=el.value);state.preferences={...state.preferences,calendar_privacy:{zeke_calendar_creation_allowed:Boolean($('#calendarCreateConsent')?.checked),categories,updated_at:new Date().toISOString()}};await ZekeData.savePreferences(state.preferences);render();showToast('Calendar privacy choices saved.');});
    $('#reconnectNow')?.addEventListener('click',async()=>{try{await ZekeData.reconnect();await refreshData();render()}catch(e){showToast(e.message,'error');render()}});
    $('#reconnectStorage')?.addEventListener('click',async()=>{try{await ZekeData.reconnect();await refreshData();render();showToast('Storage reconnected.')}catch(e){showToast(e.message,'error')}});
    $('#forgetStorage')?.addEventListener('click',async()=>{if(confirm('Disconnect and forget this browser setup? Your Drive data will not be deleted.')){await ZekeData.disconnect({forgetSetup:true,revoke:false});render()}});
    $('#changeStorage')?.addEventListener('click',async()=>{await ZekeData.disconnect({forgetSetup:true});render()});

    $$('[data-save-ai]').forEach(el=>el.onclick=async()=>{const id=el.dataset.saveAi;const key=$(`[data-ai-key="${id}"]`)?.value.trim();const model=$(`[data-ai-model="${id}"]`)?.value;const endpoint=$(`[data-ai-endpoint="${id}"]`)?.value.trim();try{await ZekeAIRouter.configure({provider:id,key,model,endpoint,privacy:'minimum-necessary'});const r=await ZekeAIRouter.testProvider(id);state.ai=ZekeAIRouter.status();showToast(`Connection test passed: ${r.provider} · ${r.model}`);render()}catch(e){state.ai=ZekeAIRouter.status();showToast(`Connection failed: ${e.message}`,'error');render()}});
    $$('[data-test-ai]').forEach(el=>el.onclick=async()=>{const id=el.dataset.testAi;try{const key=$(`[data-ai-key="${id}"]`)?.value.trim();const model=$(`[data-ai-model="${id}"]`)?.value;const endpoint=$(`[data-ai-endpoint="${id}"]`)?.value.trim();if(key||endpoint||id==='ollama')await ZekeAIRouter.configure({provider:id,key,model,endpoint,privacy:'minimum-necessary'});const r=await ZekeAIRouter.testProvider(id);showToast(`Connection test passed: ${r.provider} · ${r.model}`);state.ai=ZekeAIRouter.status();render()}catch(e){showToast(`Test failed: ${e.message}`,'error')}});

    $('#downloadHealthWorkbook')?.addEventListener('click',async()=>{const b=$('#downloadHealthWorkbook');try{if(b){b.disabled=true;b.textContent='Building workbook…';}await downloadHealthRecordWorkbook();showToast('Health Record Workbook generated from the current ZEKE record.');}catch(error){showToast(`Health report failed: ${error.message}`,'error');}finally{const next=$('#downloadHealthWorkbook');if(next){next.disabled=false;next.textContent='Generate Health Record Workbook';}}});
    $('#exportHealthJson')?.addEventListener('click',()=>downloadJSON({export_type:'ZEKE Canonical Health Record',build:BUILD,generated_at:new Date().toISOString(),events:state.events.filter(e=>!['raw_input'].includes(e.category)),actions:state.actions,preferences:{medication_confirmation_preferences:state.preferences.medication_confirmation_preferences||{},calendar_relevance_reviews:state.preferences.calendar_relevance_reviews||{}}},`ZEKE-Canonical-Health-${localDay()}.json`));

    const syncSupportExportOptions=()=>{state.supportExportOptions={mode:$('#supportPrivacyMode')?.value||'full',from:$('#supportFromDate')?.value||'',to:$('#supportToDate')?.value||'',clearAfter:Boolean($('#clearAfterSupportExport')?.checked)};};
    $('#supportPrivacyMode')?.addEventListener('change',syncSupportExportOptions);$('#supportFromDate')?.addEventListener('input',syncSupportExportOptions);$('#supportToDate')?.addEventListener('input',syncSupportExportOptions);$('#clearAfterSupportExport')?.addEventListener('change',syncSupportExportOptions);
    $('#downloadSupportReport')?.addEventListener('click',async()=>{syncSupportExportOptions();const button=$('#downloadSupportReport'),options={...state.supportExportOptions};try{if(button){button.disabled=true;button.textContent='Building report…';}state.supportExportStatus='Building the workbook from retained diagnostics and workflow history…';const statusNode=button?.closest('.diagnostics-export-section')?.querySelector('.status-line');if(statusNode)statusNode.textContent=state.supportExportStatus;await downloadSupportWorkbook(options);state.supportExportStatus='Support & Improvement Report downloaded successfully.';render();showToast('Support & Improvement Report downloaded.');}catch(error){recordRuntimeIssue('support-report-export',error.message,error.stack||'');state.supportExportStatus=`Report export failed: ${error.message}`;render();showToast(state.supportExportStatus,'error');}finally{const next=$('#downloadSupportReport');if(next){next.disabled=false;next.textContent='Download Support & Improvement Report';}}});
    $('#exportRuntimeDiagnostics')?.addEventListener('click',()=>downloadJSON({export_type:'ZEKE Runtime Diagnostics',build:BUILD,exported_at:new Date().toISOString(),entries:runtimeDiagnostics()},`zeke-runtime-diagnostics-${localDay()}.json`));
    $('#clearRuntimeDiagnostics')?.addEventListener('click',()=>{if(confirm('Clear retained runtime, workflow, and interaction diagnostics on this device? Saved health records and settings will not be changed.')){localStorage.removeItem(RUNTIME_LOG_KEY);window.ZekeWorkflowEngine?.clearLogs({keep_workflows:false});state.workflowId=null;state.supportExportStatus='Retained diagnostic logs cleared.';render();showToast('Retained diagnostic logs cleared.')}});

    $('#exportAIPacket')?.addEventListener('click',()=>{const packet={packet_type:'ZEKE Manual AI Packet',build:BUILD,created_at:new Date().toISOString(),instructions:'Return analysis as observations, interpretations, evidence, limitations, and proposed actions. Do not treat inferred claims as raw facts.',context:{recent_events:state.events.filter(recordIsActive).slice(-50),potential_health_events:potentialHealthEvents().slice(0,50),open_questions:openQuestions(),discoveries:state.discoveries.slice(0,10)}};downloadJSON(packet,`zeke-ai-packet-${localDay()}.json`)});
    $('#importAIResponse')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;const status=$('#aiImportStatus');try{const response=JSON.parse(await file.text());await ZekeData.saveFactor({type:'external_ai_response',status:'review',summary:response.summary||response.analysis||response.title||'Imported AI analysis awaiting review',response,provenance:{source:'manual-ai-packet',file:file.name}});if(status)status.textContent='Imported for review. ZEKE will not treat the AI response as raw fact.';await refreshData()}catch(err){if(status)status.textContent=`Import failed: ${err.message}`}});
    $('#importFile')?.addEventListener('change',e=>{state.syncPreflight=null;const f=e.target.files?.[0];if(f)handleImport(f)});
    $('#preflightWorkbookNow')?.addEventListener('click',async()=>{try{state.syncPreflight=null;state.importStatus='Running read-only workbook preflight…';render();const r=await preflightConnectedWorkbook();state.syncPreflight=r;state.importReport={file:state.syncSource?.name||'Connected workbook',counts:{records_recognized:r.candidates,records_created:r.created,records_updated:r.updated,unchanged:r.unchanged,linked_existing:r.linked_existing,conflicts:r.conflicts,unsupported_updates:r.unsupported_updates,unmapped_rows:r.unmapped_rows},message:r.ready?'Read-only preflight complete. Review the counts, then use Commit reviewed sync. No repository, workbook, mirror, backup, or import-history file was changed.':'Preflight found blocking conflicts or unsupported updates. Commit remains disabled and nothing was changed.'};state.importStatus=`Preflight complete: ${r.candidates} recognized, ${r.unchanged} unchanged, ${r.created} new, ${r.updated} updates, ${r.conflicts} conflicts.`;render()}catch(e){state.syncPreflight=null;state.importStatus=`Preflight failed safely: ${e.message}`;render()}});
    $('#syncWorkbookNow')?.addEventListener('click',async()=>{try{const reviewed=state.syncPreflight;if(!reviewed?.ready)throw new Error('Run and review the read-only preflight first.');if(!confirm(`Commit the reviewed workbook sync? ${reviewed.candidates} recognized; ${reviewed.created} new; ${reviewed.updated} updates; ${reviewed.linked_existing} links; ${reviewed.unchanged} unchanged. ZEKE will rerun the preflight, back up events before changes, commit, and verify.`))return;state.importStatus='Rechecking the reviewed preflight before commit…';render();const r=await syncConnectedWorkbook({reviewToken:reviewed.review_token});state.importStatus=`Sync verified: ${r.created} created, ${r.updated} updated, ${r.unchanged} unchanged.`;await refreshData();render()}catch(e){state.importStatus=`Sync failed safely: ${e.message}`;render()}});
    $('#attachBtn')?.addEventListener('click',()=>$('#conversationFile')?.click());
    $('#conversationFile')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;const ext=f.name.split('.').pop().toLowerCase();beginWorkflow(`Import ${f.name}`,{goal:'Review and import an attached file',target:{file_name:f.name,file_type:ext}});pushUser(`Attached file: ${f.name}`);if(['xlsx','xls','json','csv','tsv','pdf','png','jpg','jpeg','webp','bmp','gif'].includes(ext)){updateWorkflow('understanding',{known:{file_name:f.name,file_type:ext},save_status:'not_saved'},'A supported data file was attached through Talk to ZEKE.');pushZeke(`I received ${f.name}. I’ll process it through the same preview, duplicate, and clarification safeguards used by Settings imports. Nothing is treated as confirmed until those checks finish.`);render();await handleImport(f);closeWorkflow('completed',`Finished processing ${f.name}. Review the import summary and any Questions for You items.`,{save_status:'import_processed'});render();}else{logUnresolved('Unsupported conversation attachment type.',{file_name:f.name,file_type:ext});updateWorkflow('waiting_clarification',{needed:['supported XLSX, XLS, JSON, CSV, TSV, PDF, or common image file'],save_status:'not_saved'},'The attached file type is not yet supported.');pushZeke(`I preserved the fact that you attached ${f.name}, but this file type is not supported for automatic interpretation yet. XLSX, XLS, JSON, CSV, TSV, PDF, and common image files can be processed now. Nothing was saved from this attachment.`);render();}e.target.value='';});
    bindTooltips();
  }

  function showToast(message,type='ok'){const t=$('#toast');if(!t)return;t.textContent=message;t.className=`toast show ${type}`;clearTimeout(window.__zekeToastTimer);window.__zekeToastTimer=setTimeout(()=>t.classList.remove('show'),7000)}
  function downloadJSON(value,name){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

  window.ZekeWorkbookTools={workbookRows,buildWorkbookCandidates,sourceIdentityEntity,eventSubkey};

  if(window.__ZEKE_TEST_MODE__)window.ZekeAppTestTools={actionDoneToday,medicationEventCompletesAction,workbookCommitSummary,activityRecommendation,activityChartDescriptor,durationLabel,eventDisplayKey,recordIsActive};

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
