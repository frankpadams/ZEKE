/* ZEKE v0.40.0 canonical JSON integrity scanner. */
(() => {
  'use strict';
  const text=v=>String(v??'').trim();
  const norm=v=>text(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const active=e=>!['undone','superseded','invalid','quarantined','deleted'].includes(norm(e?.structured?.interpretation_status||e?.structured?.data_quality_status))&&e?.structured?.include_in_analysis!==false;
  const stable=value=>{
    if(Array.isArray(value))return value.map(stable);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!['id','recorded_at','updated_at','created_at','source_fingerprint','source_key'].includes(k)).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,stable(v)]));
    return value;
  };
  const fingerprint=e=>JSON.stringify(stable({timestamp:e.timestamp||e.recorded_at||'',category:e.category||'',raw_text:e.raw_text||'',structured:e.structured||{},source:e.provenance?.source||'',file:e.provenance?.file||'',sheet:e.provenance?.sheet||'',source_row:e.provenance?.source_row??'',source_cell:e.provenance?.source_cell??''}));
  const sleepHours=e=>{const s=e.structured||{};if(s.metric_id==='sleep_duration'||e.category==='sleep')return Number(s.value??s.duration??s.hours_slept);return NaN};
  function scan({events=[],factors=[],actions={catalog:[]},discoveries=[]}={}){
    const candidates=[],seen=new Map(),rows=events.filter(active);
    for(const e of rows){
      const fp=fingerprint(e);if(!fp)continue;if(!seen.has(fp))seen.set(fp,[]);seen.get(fp).push(e);
    }
    for(const group of seen.values())if(group.length>1)candidates.push({key:`exact:${group.map(x=>x.id).sort().join(':')}`,type:'exact-duplicate',confidence:'very high',safe:true,title:'Same record saved more than once',question:'Did this real-world event happen once, or more than once?',explanation:'The records have the same date, values, source details, and structured content.',recommendation:'Keep one active record and preserve the removed copies in the integrity audit.',items:group,keep:group[0]});
    for(const e of rows){
      const raw=norm(e.raw_text),p=e.provenance||{},st=e.structured||{};
      if(/if row is colored blue|row is coloured blue|blue row.*(?:dose|administered)|intervention tirzepatide if row/.test(raw))candidates.push({key:`artifact:${e.id}`,type:'import-artifact',confidence:'very high',safe:true,title:'Spreadsheet legend imported as health data',question:'This was an instruction at the top of the old spreadsheet, not something that happened to you. Remove it from active health data?',explanation:`Source: ${p.file||'historical workbook'}${p.sheet?` · ${p.sheet}`:''}. ZEKE will preserve the source and audit history.`,recommendation:'Quarantine this record and close duplicate questions created from it.',items:[e]});
      const hrs=sleepHours(e);if(Number.isFinite(hrs)&&(hrs>14||hrs<=0)){
        const same=rows.filter(x=>x.id!==e.id&&Number.isFinite(sleepHours(x))&&Math.abs(new Date(x.timestamp||0)-new Date(e.timestamp||0))<36*36e5&&sleepHours(x)>0&&sleepHours(x)<=14).sort((a,b)=>Math.abs(sleepHours(a)-8)-Math.abs(sleepHours(b)-8));
        candidates.push({key:`sleep:${e.id}`,type:'implausible-sleep',confidence:same.length?'high':'moderate',safe:false,title:'Sleep duration needs confirmation',question:`How long did you actually sleep for the night ending ${new Date(e.timestamp||e.recorded_at).toLocaleDateString()}?`,explanation:`ZEKE has ${hrs} hours recorded${same[0]?` and another nearby record of ${sleepHours(same[0])} hours`:''}. Nothing will be changed without your answer.`,recommendation:same[0]?`Keep ${sleepHours(same[0])} hours and supersede the ${hrs}-hour record.`:'Enter the correct duration or exclude this record from analysis.',items:[e,...same.slice(0,1)],keep:same[0]||null});
      }
      const name=norm(st.exercise||st.activity||st.exercise_name||'');
      if(/kayak|canoe|paddl/.test(name)){
        const invalid=[];if(Number.isFinite(Number(st.steps)))invalid.push(`steps ${st.steps}`);if(Number.isFinite(Number(st.ambulatory_steps)))invalid.push(`ambulatory steps ${st.ambulatory_steps}`);if(Number(st.average_hr)===0||Number(st.avg_hr)===0)invalid.push('heart rate 0');if(invalid.length)candidates.push({key:`paddle:${e.id}`,type:'paddle-fields',confidence:'high',safe:true,title:'Paddling record contains fields that do not describe the activity',question:'Were the step and zero-heart-rate values actually measured, or should ZEKE remove them as form artifacts?',explanation:`Current questionable fields: ${invalid.join(', ')}. Distance will remain blank unless you provide it.`,recommendation:'Remove step artifacts and convert zero heart rate to not recorded.',items:[e]});
      }
      if((Number(st.average_hr)===0||Number(st.avg_hr)===0)&&!/kayak|canoe|paddl/.test(name))candidates.push({key:`zerohr:${e.id}`,type:'zero-as-missing',confidence:'very high',safe:true,title:'Heart rate is stored as zero',question:'Was heart rate actually measured as 0 bpm?',explanation:'A living person’s average workout heart rate of zero almost always means the field was not recorded.',recommendation:'Remove the zero value and leave heart rate blank.',items:[e]});
    }
    const scheduled=new Map((actions.catalog||[]).filter(a=>a.kind==='medication'&&a.schedule).map(a=>[norm(a.label||a.name||a.id),a]));
    for(const f of factors.filter(x=>x.type==='clarification_question'&&!['resolved','dismissed','unknown'].includes(norm(x.status)))){
      const key=norm(f.question_key);if(key.startsWith('med schedule')){
        const med=key.replace(/^med schedule\s*/,'');const action=[...scheduled.entries()].find(([k])=>k.includes(med)||med.includes(k));if(action)candidates.push({key:`question:${f.id}`,type:'answered-question',confidence:'very high',safe:true,title:'Medication question is already answered',question:`ZEKE already has ${action[1].label||action[1].name} scheduled. Close this old question?`,explanation:`Stored schedule: ${action[1].schedule?.type||'scheduled'}${action[1].schedule?.days?.length?` on weekday ${action[1].schedule.days.join(', ')}`:''}.`,recommendation:'Resolve the stale question without changing the medication schedule.',items:[f]});
      }
    }

    const activeWorkoutCount=rows.filter(e=>e.category==='workout').length;
    for(const d of discoveries.filter(x=>!['superseded','dismissed','resolved','stale'].includes(norm(x.status)))){
      const claim=norm(`${d.title||''} ${d.text||''}`);
      if(activeWorkoutCount>=5&&/(exercise|workout|resistance).*?(sparse|insufficient|only two|baseline missing|under recorded)/.test(claim)){
        candidates.push({key:`stale:${d.id}`,type:'stale-discovery',confidence:'high',safe:true,title:'Insight is based on older, incomplete workout data',question:'ZEKE now has more workout history than when this insight was created. Retire the old insight?',explanation:`Current active workout records: ${activeWorkoutCount}. The saved insight says exercise data were sparse or insufficient.`,recommendation:'Mark the old insight stale and regenerate coaching from current data.',items:[d]});
      }
    }
    const currentDiscoveries=discoveries.filter(d=>!['superseded','dismissed','resolved','stale'].includes(norm(d.status)));
    const groups=new Map();for(const d of currentDiscoveries){const k=norm(d.title).replace(/possible |may be |appears to /g,'');if(!k)continue;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(d)}
    for(const [k,g] of groups)if(g.length>1)candidates.push({key:`discovery:${k}`,type:'duplicate-discovery',confidence:'high',safe:true,title:'Overlapping insight cards',question:'These insight cards describe the same finding. Keep the newest one?',explanation:g.map(x=>x.title).join(' · '),recommendation:'Mark older equivalents superseded so they stop competing on the dashboard.',items:g.sort((a,b)=>new Date(b.timestamp||b.updated_at||0)-new Date(a.timestamp||a.updated_at||0)),keep:g.sort((a,b)=>new Date(b.timestamp||b.updated_at||0)-new Date(a.timestamp||a.updated_at||0))[0]});
    return candidates;
  }
  window.ZekeIntegrityEngine=Object.freeze({scan,fingerprint,active});
})();
