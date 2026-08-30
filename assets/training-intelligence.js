/* ZEKE v0.45.1 adaptive training intelligence.
   Clinical-context interpretation and workout planning are decision-support features,
   not diagnosis, medical clearance, or a replacement for a treating clinician/PT. */
(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const active=r=>!['deleted','superseded','quarantined','dismissed'].includes(String(r?.status||'').toLowerCase());
  const jsonFromText=text=>{const raw=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/```$/,'').trim();const a=raw.indexOf('{'),b=raw.lastIndexOf('}');if(a<0||b<a)throw new Error('AI response did not contain a JSON object.');return JSON.parse(raw.slice(a,b+1));};
  const state={lastPacket:'',lastProposal:null};

  const CLINICAL_SCHEMA={
    affected_structures:['bone','joint','muscle','tendon','ligament','bursa','nerve','other'],
    relationship:['injured','healing','symptomatic','mentioned','uncertain'],
    training_action:['protect','emphasize_rehab','monitor','neutral'],
    movement_implication:['movement','load_direction','rom','confidence','basis'],
    explicit_restrictions:['source_text','restriction','expires_or_review'],
    uncertainty:['question','why_it_matters']
  };

  function contextPacket({clinicalText='',events=[],factors=[],goals=[],sessionContext={}}={}){
    const recent=events.filter(active).slice(-120).map(e=>({date:e.timestamp||e.recorded_at,category:e.category,raw_text:e.raw_text||'',structured:e.structured||{},source:e.provenance?.source||''}));
    const known=factors.filter(active).filter(f=>['training_clinical_map','goal','clinical_restriction','injury','rehab_plan'].includes(f.type)).slice(-40);
    return {clinical_text:clinicalText,session_context:sessionContext||{},existing_training_context:known,recent_training_and_symptom_evidence:recent,goals:goals.slice(-20)};
  }

  function clinicalPrompt(packet){
    return `You are a clinical-context interpreter for ZEKE, a personal health and training system. You are NOT diagnosing, giving medical clearance, or replacing a clinician. Convert ONLY the supplied clinical material into a structured training-context map.\n\nRules:\n- Preserve explicit clinician restrictions exactly and distinguish them from AI inference.\n- Identify anatomy only when supported by the supplied text. Do not invent an affected structure.\n- For every inferred movement/load implication, include basis and confidence.\n- "mentioned on imaging" is not automatically "injured" or a contraindication.\n- Do not label an exercise prohibited unless the source explicitly says so; instead describe the movement/load implication and uncertainty.\n- If information is insufficient, return uncertainty questions.\n- Output JSON only.\n\nRequired shape:\n{\n  "summary":"brief",\n  "affected_structures":[{"name":"","type":"bone|joint|muscle|tendon|ligament|bursa|nerve|other","side":"left|right|bilateral|unknown","relationship":"injured|healing|symptomatic|mentioned|uncertain","confidence":0.0,"source_basis":""}],\n  "movement_implications":[{"movement":"","load_direction":"","rom":"","training_action":"protect|emphasize_rehab|monitor|neutral","confidence":0.0,"basis":"explicit|inferred","source_basis":""}],\n  "explicit_restrictions":[{"restriction":"","source_text":"","expires_or_review":""}],\n  "rehab_emphasis":[{"target":"","reason":"","basis":"explicit|inferred","confidence":0.0}],\n  "uncertainty":[{"question":"","why_it_matters":""}]\n}\n\nInput packet:\n${JSON.stringify(packet)}`;
  }

  function workoutPrompt(packet,clinicalMaps){
    return `You are ZEKE's workout-planning consultant. Build a conservative, adaptable session using the supplied goals, recent exercise history, symptom response, and structured clinical maps. You are decision support, not medical clearance.\n\nRules:\n- Explicit clinician/PT restrictions outrank all other advice.\n- Never infer that blank pain means pain-free.\n- Prefer exercises with demonstrated tolerance when clinical uncertainty is material.\n- Treat each equipment variation as a distinct loading history.\n- PT/rehab, strength, and cardio can coexist in one session.\n- Respect workout order: consider muscles/joints already loaded by completed earlier work and avoid redundant fatigue that undermines later clinically important work.\n- If session_context.mode is "adapt_remaining", preserve all completed work exactly and return only revised remaining blocks; use completed exercise order, set performance, pain/RPE, and current fatigue as evidence.\n- Give a progression criterion and a regression/stop criterion for every clinically relevant movement.\n- Do not auto-progress an exercise after meaningful worsening during, later that day, or next day.\n- If the available evidence cannot support a safe recommendation, say what is missing.\n- Output JSON only.\n\nRequired shape:\n{\n "session_title":"", "session_status":"proceed|modify|insufficient_context", "summary":"",\n "blocks":[{"type":"rehab|strength|cardio|mobility","exercise":"","variation":"","sets":null,"reps":"","duration_min":null,"intensity":"","load":"","rom":"","why":"","progress_if":"","regress_or_stop_if":""}],\n "avoid_or_defer":[{"movement":"","reason":"","basis":"explicit_restriction|symptom_history|uncertainty"}],\n "questions":[{"question":"","why_it_matters":""}]\n}\n\nClinical maps:\n${JSON.stringify(clinicalMaps)}\n\nCurrent packet:\n${JSON.stringify(packet)}`;
  }

  async function saveMap(result,sourceText,provenance={}){
    if(!window.ZekeData?.saveFactor) return null;
    return ZekeData.saveFactor({type:'training_clinical_map',status:'active',priority:'high',summary:result.summary||'Clinical training context',clinical_map:result,source_text:sourceText,created_at:new Date().toISOString(),provenance:{source:'ai-clinical-context-interpreter',...provenance}});
  }

  function currentMaps(factors=[]){return factors.filter(active).filter(f=>f.type==='training_clinical_map'&&f.clinical_map).map(f=>f.clinical_map);}

  function capabilityMap(events=[]){
    const rows=new Map();
    for(const e of events.filter(active)){
      if(String(e.category||'').toLowerCase()!=='workout')continue;
      const s=e.structured||{},family=s.exercise_family||s.exercise||s.activity;if(!family)continue;
      const key=String(family),pain=[s.pain_before,s.pain_during,s.pain_after,s.pain,...(Array.isArray(s.set_pain)?s.set_pain:[])].map(Number).filter(Number.isFinite);
      const cur=rows.get(key)||{exercise:key,exposures:0,pain_observations:0,max_pain:null,last_date:null,last_load:null,last_variation:null,tolerance:'unknown'};
      cur.exposures++;cur.last_date=e.timestamp||e.recorded_at||cur.last_date;cur.last_load=s.weight??cur.last_load;cur.last_variation=s.variation_name||cur.last_variation;
      if(pain.length){cur.pain_observations++;cur.max_pain=Math.max(cur.max_pain??-Infinity,...pain);cur.tolerance=cur.max_pain>=4?'provocative':cur.max_pain>=2?'caution':'tolerated_observed';}
      rows.set(key,cur);
    }
    return [...rows.values()].sort((a,b)=>new Date(b.last_date||0)-new Date(a.last_date||0));
  }

  function manualPacket(kind,{clinicalText='',events=[],factors=[],goals=[],sessionContext={}}={}){
    const packet=contextPacket({clinicalText,events,factors,goals,sessionContext});
    const prompt=kind==='workout'?workoutPrompt(packet,currentMaps(factors)):clinicalPrompt(packet);
    state.lastPacket=prompt;return prompt;
  }

  async function interpretClinical({clinicalText,events=[],factors=[],goals=[]}){
    const packet=contextPacket({clinicalText,events,factors,goals}),prompt=clinicalPrompt(packet);
    if(!window.ZekeAIRouter?.status?.().connected?.length){state.lastPacket=prompt;return {manual:true,prompt};}
    const result=await ZekeAIRouter.ask(prompt,{task:'analysis',temperature:0,maxTokens:2200});
    const parsed=jsonFromText(result.text);await saveMap(parsed,clinicalText,{provider:result.provider,model:result.model});return {manual:false,result:parsed,provider:result.provider,model:result.model};
  }

  async function proposeWorkout({events=[],factors=[],goals=[],sessionContext={}}){
    const packet=contextPacket({events,factors,goals,sessionContext}),maps=currentMaps(factors),prompt=workoutPrompt(packet,maps);
    if(!window.ZekeAIRouter?.status?.().connected?.length){state.lastPacket=prompt;return {manual:true,prompt};}
    const result=await ZekeAIRouter.ask(prompt,{task:'analysis',temperature:0,maxTokens:2600});const parsed=jsonFromText(result.text);state.lastProposal=parsed;return {manual:false,result:parsed,provider:result.provider,model:result.model};
  }

  async function importManualClinicalResponse(text,sourceText='Manual AI consultation'){
    const parsed=jsonFromText(text);await saveMap(parsed,sourceText,{source:'manual-ai-consultation',user_pasted:true});return parsed;
  }
  function importManualWorkoutResponse(text){const parsed=jsonFromText(text);state.lastProposal=parsed;return parsed;}

  function summaryHTML(factors=[],events=[]){
    const maps=currentMaps(factors),caps=capabilityMap(events),restrictions=maps.flatMap(m=>m.explicit_restrictions||[]);
    const tolerant=caps.filter(x=>x.tolerance==='tolerated_observed'),caution=caps.filter(x=>['caution','provocative'].includes(x.tolerance));
    const why=[];if(tolerant.length)why.push(`${tolerant.length} exercise${tolerant.length===1?' has':'s have'} observed tolerance history`);if(caution.length)why.push(`${caution.length} recent caution signal${caution.length===1?'':'s'} will be considered`);if(restrictions.length)why.push(`${restrictions.length} explicit clinician/PT restriction${restrictions.length===1?' is':'s are'} preserved`);if(!why.length)why.push('ZEKE will start from your recent training, goals, and available equipment');
    return `<section class="panel training-intelligence-panel training-planner-intro"><div class="section-head"><div><span class="tile-kicker">PLAN TODAY</span><h2>Build a workout that fits today</h2><p>ZEKE can propose a session from your recent training, equipment, goals, and any relevant PT/injury context. Nothing is logged until you accept and start it.</p></div></div><div class="workout-why-compact"><span>WHY THIS CAN HELP</span><p>${esc(why.slice(0,2).join(' · '))}.</p><details><summary>See the context ZEKE will use</summary><div class="training-context-details"><span><b>${tolerant.length}</b> observed tolerance signals</span><span><b>${caution.length}</b> caution/provocative signals</span><span><b>${restrictions.length}</b> explicit restrictions</span></div><p class="safety-copy">AI inferences remain separate from clinician/PT instructions and observed workout response. Anatomy overlap is context, not automatic prohibition or medical clearance.</p></details></div><div class="card-actions"><button class="primary compact" id="buildAdaptiveWorkoutBtn">Build today’s session</button><button class="secondary compact" id="interpretClinicalTrainingBtn">Review injury & PT context</button><button class="text-action" id="manualAIPacketBtn">Manual AI packet</button></div></section>`;
  }

  window.ZekeTrainingIntelligence={schema:CLINICAL_SCHEMA,clinicalPrompt,workoutPrompt,contextPacket,currentMaps,capabilityMap,manualPacket,interpretClinical,proposeWorkout,importManualClinicalResponse,importManualWorkoutResponse,summaryHTML,state};
})();
