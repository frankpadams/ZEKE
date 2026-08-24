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
    return `You are ZEKE's workout-planning consultant. Build a conservative, adaptable session using the supplied goals, recent exercise history, symptom response, and structured clinical maps. You are decision support, not medical clearance.\n\nRules:\n- Explicit clinician/PT restrictions outrank all other advice.\n- Never infer that blank pain means pain-free.\n- Prefer exercises with demonstrated tolerance when clinical uncertainty is material.\n- Treat each equipment variation as a distinct loading history.\n- PT/rehab, strength, and cardio can coexist in one session.\n- Respect workout order: consider muscles/joints already loaded by completed earlier work and avoid redundant fatigue that undermines later clinically important work.\n- If session_context.mode is "adapt_remaining", preserve all completed work exactly and return only revised remaining blocks; use completed exercise order, set performance, pain/RPE, and current fatigue as evidence.\n- Give a progression criterion and a regression/stop criterion for every clinically relevant movement.\n- Do not auto-progress an exercise after meaningful worsening during, later that day, or next day.\n- If the available evidence cannot support a safe recommendation, say what is missing.\n- Output JSON only.\n\nRequired shape:\n{\n "session_title":"", "readiness":"proceed|modify|insufficient_context", "summary":"",\n "blocks":[{"type":"rehab|strength|cardio|mobility","exercise":"","variation":"","sets":null,"reps":"","duration_min":null,"intensity":"","load":"","rom":"","why":"","progress_if":"","regress_or_stop_if":""}],\n "avoid_or_defer":[{"movement":"","reason":"","basis":"explicit_restriction|symptom_history|uncertainty"}],\n "questions":[{"question":"","why_it_matters":""}]\n}\n\nClinical maps:\n${JSON.stringify(clinicalMaps)}\n\nCurrent packet:\n${JSON.stringify(packet)}`;
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
    const maps=currentMaps(factors),caps=capabilityMap(events),structures=maps.flatMap(m=>m.affected_structures||[]),restrictions=maps.flatMap(m=>m.explicit_restrictions||[]);
    const tolerant=caps.filter(x=>x.tolerance==='tolerated_observed').slice(0,3),caution=caps.filter(x=>['caution','provocative'].includes(x.tolerance)).slice(0,3);
    return `<section class="panel training-intelligence-panel"><div class="section-head"><div><span class="tile-kicker">ADAPTIVE TRAINING</span><h2>PT + strength + cardio, one progression</h2><p>ZEKE can translate clinical context into a source-traceable anatomy/load map, combine it with your actual response history, and ask connected AI to propose the next session.</p></div><span class="badge">${maps.length?'Context active':'Needs context'}</span></div><div class="training-intel-grid"><div><small>CLINICAL MAP</small><strong>${structures.length} structure${structures.length===1?'':'s'}</strong><span>${restrictions.length} explicit restriction${restrictions.length===1?'':'s'}</span></div><div><small>OBSERVED TOLERANCE</small><strong>${tolerant.length} tolerated signal${tolerant.length===1?'':'s'}</strong><span>${caution.length} caution/provocative</span></div><div><small>PROGRESSION MODEL</small><strong>Response-aware</strong><span>during · later · next day</span></div></div>${caution.length?`<div class="training-signal-row">${caution.map(x=>`<span><b>${esc(x.exercise)}</b> ${esc(x.tolerance)}</span>`).join('')}</div>`:''}<div class="card-actions"><button class="primary compact" id="interpretClinicalTrainingBtn">Add / interpret clinical context</button><button class="secondary compact" id="buildAdaptiveWorkoutBtn">Build today’s session</button><button class="text-action" id="manualAIPacketBtn">Manual AI packet</button></div><p class="safety-copy">AI inferences stay distinct from clinician restrictions and observed workout response. ZEKE does not convert an imaging mention into a prohibition or medical clearance.</p></section>`;
  }

  window.ZekeTrainingIntelligence={schema:CLINICAL_SCHEMA,clinicalPrompt,workoutPrompt,contextPacket,currentMaps,capabilityMap,manualPacket,interpretClinical,proposeWorkout,importManualClinicalResponse,importManualWorkoutResponse,summaryHTML,state};
})();
