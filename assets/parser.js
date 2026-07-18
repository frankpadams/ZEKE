(() => {
  'use strict';
  const norm=s=>String(s||'').trim(), lower=s=>norm(s).toLowerCase(), num=x=>Number(String(x).replace(/,/g,''));
  const nowDate=context=>context?.now ? new Date(context.now) : new Date();
  const now=context=>nowDate(context).toISOString();
  const MEDICATIONS={
    atorvastatin:{label:'atorvastatin',aliases:['atorvastatin','atorvastin','atorvostatin','lipitor','statin']},
    tirzepatide:{label:'Mounjaro',aliases:['mounjaro','monjaro','tirzepatide','zepbound']}
  };
  const MED_ALIASES=Object.fromEntries(Object.entries(MEDICATIONS).map(([id,v])=>[id,v.aliases]));
  const EXERCISE_ALIASES={
    'stair climber':['matrix stairclimber','stairclimber machine','stair climber','stairclimber','climbmill','stairs'],
    'lat pulldown':['lat pulldown','lat pull down','lat pull-down','pulldown'],
    'seated row':['seated row','row machine'], 'glute lift':['glute lift','glute machine'],
    'seated leg curl':['seated leg curl','leg curl'], 'leg extension':['leg extension'],
    'independent bicep curl':['independent bicep curls','independent bicep curl','bicep curls','bicep curl','biceps curl'],
    'abdominal':['abdominal','ab machine','ab crunch'], 'massage chair':['massage chair'],
    'bench press':['bench press','bench']
  };
  function findAlias(text,map){const l=lower(text);for(const [c,a] of Object.entries(map)){const matched=a.find(x=>l.includes(x));if(matched)return{canonical:c,matched};}return null;}
  function resolveDateToken(token,base=new Date()){
    const raw=String(token||'').trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){const d=new Date(`${raw}T12:00:00`);return Number.isNaN(d.getTime())?null:d.toISOString();}
    const m=raw.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?$/); if(!m)return null;
    let y=m[3]?Number(m[3]):base.getFullYear(); if(y<100)y+=2000;
    const d=new Date(y,Number(m[1])-1,Number(m[2]),12,0,0); if(Number.isNaN(d.getTime()))return null;
    if(!m[3] && d.getTime()>base.getTime()+45*864e5)d.setFullYear(y-1);
    return d.toISOString();
  }
  function dateSegments(text){
    const re=/(^|\s)(\d{1,2}\/\d{1,2}(?:\/(?:\d{4}|\d{2}))?)(?=\s|$)/g, hits=[]; let m;
    while((m=re.exec(text)))hits.push({start:m.index+m[1].length,end:re.lastIndex,token:m[2],date:resolveDateToken(m[2])});
    if(!hits.length)return [{date:new Date().toISOString(),text}];
    return hits.map((h,i)=>({date:h.date,text:text.slice(h.end,hits[i+1]?.start??text.length).trim(),rawDate:h.token}));
  }
  function isAmbiguousBP(text){return /^\s*bp\s+\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?){2,3}\s*$/i.test(text);}
  function parseBloodPressure(text,context={}){const m=lower(text).match(/(?:bp|blood pressure)\s*(\d{2,3})\s*[\/,-]\s*(\d{2,3})(?:\s+(?:hr|pulse)\s*(\d{2,3}))?/i);if(!m)return null;const s=num(m[1]),d=num(m[2]);if(!(s>=50&&s<=300&&d>=30&&d<=200))return null;const ts=now(context),events=[{category:'measurement',timestamp:ts,raw_text:text,structured:{metric_id:'bp_systolic',value:s,unit:'mmHg',interpretation_status:'confirmed'}},{category:'measurement',timestamp:ts,raw_text:text,structured:{metric_id:'bp_diastolic',value:d,unit:'mmHg',interpretation_status:'confirmed'}}];if(m[3])events.push({category:'measurement',timestamp:ts,raw_text:text,structured:{metric_id:'heart_rate',value:num(m[3]),unit:'bpm',interpretation_status:'confirmed'}});return{confidence:.99,summary:`blood pressure ${s}/${d} mmHg`,events};}
  function parseWeight(text,context={}){const m=lower(text).match(/(?:weight|weighed|weighing|i am|i'm)\s*(?:is|was|at)?\s*(\d{2,3}(?:\.\d+)?)\s*(lb|lbs|pounds|kg|kilograms)?\b/i);if(!m||(!/weight|weigh/i.test(text)&&!m[2]))return null;const unit=/^kg/.test(m[2]||'')?'kg':'lb';return{confidence:.97,summary:`weight ${m[1]} ${unit}`,events:[{category:'measurement',timestamp:now(context),raw_text:text,structured:{metric_id:'weight',value:num(m[1]),unit,interpretation_status:'confirmed'}}]};}
  function parseCadence(text){
    const l=lower(text), dayMap={sunday:0,sun:0,monday:1,mon:1,tuesday:2,tue:2,tues:2,wednesday:3,wed:3,thursday:4,thu:4,thur:4,thurs:4,friday:5,fri:5,saturday:6,sat:6};
    if(/\b(every day|daily|once a day|each day|1\s*x\s*\/?\s*day)\b/.test(l))return{type:'daily'};
    const days=[...new Set(Object.entries(dayMap).filter(([name])=>new RegExp(`\\b${name}(?:s)?\\b`,'i').test(l)).map(([,n])=>n))];
    if(/\b(weekly|once (?:a|per) week|every week|1\s*x\s*\/?\s*week|1 time (?:a|per) week)\b/.test(l)||days.length)return{type:'weekly',days};
    return null;
  }
  function parseMedicationRange(text,base){
    const l=lower(text), relative=l.match(/(?:past|last|previous)\s+(\d+)\s+days?/i);
    if(relative){const n=Math.max(1,Math.min(366,Number(relative[1]))),end=new Date(base),start=new Date(base);start.setDate(start.getDate()-(n-1));start.setHours(12,0,0,0);end.setHours(12,0,0,0);return{start,end,label:`past ${n} days`};}
    const token='(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\/\\d{1,2}(?:\\/(?:\\d{4}|\\d{2}))?)';
    let m=l.match(new RegExp(`(?:from|between)\\s+${token}\\s+(?:to|through|and)\\s+${token}`,'i'));
    if(m){const s=resolveDateToken(m[1],base),e=resolveDateToken(m[2],base);if(s&&e)return{start:new Date(s),end:new Date(e),label:`${m[1]} through ${m[2]}`};}
    m=l.match(new RegExp(`(?:since|starting|from)\\s+${token}`,'i'));
    if(m){const s=resolveDateToken(m[1],base);if(s){const end=new Date(base);end.setHours(12,0,0,0);return{start:new Date(s),end,label:`since ${m[1]}`};}}
    return null;
  }
  function scheduleDates(range,schedule){
    const out=[], start=new Date(range.start), end=new Date(range.end); if(start>end)return out;
    for(const d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
      if(schedule.type==='daily'||(schedule.type==='weekly'&&schedule.days?.includes(d.getDay()))){const x=new Date(d);x.setHours(12,0,0,0);out.push(x.toISOString());}
    }
    return out;
  }
  function parseMedication(text,context={}){
    const classOnly=/\bglp\s*[- ]?1(?:\s+(?:medication|medicine|drug|injection|shot))?\b/i.test(text);
    const found=findAlias(text,MED_ALIASES);
    if(classOnly&&!found&&!context.medication)return{type:'medication-identity-needed',confidence:.99,needsClarification:true,clarificationQuestion:'Which GLP-1 medication do you mean? For example, Mounjaro/tirzepatide, Zepbound/tirzepatide, Ozempic or Wegovy/semaglutide, or another medication.',summary:'GLP-1 medication identity needs clarification',events:[]};
    if(!found && !context.medication)return null;
    const contextFound=context.medication?findAlias(context.medication,MED_ALIASES):null;
    const canonical=found?.canonical||contextFound?.canonical||lower(context.medication).replace(/[^a-z0-9]+/g,'_');
    const matched=found?.matched||context.medication||canonical, label=MEDICATIONS[canonical]?.label||matched;
    const l=lower(text), notYet=/(?:\bnot\b[^.!?]{0,40}\btaken\b[^.!?]{0,40}\byet\b)|(?:\b(?:haven't|have not|didn't|did not)\b[^.!?]{0,40}\b(?:take|taken)\b[^.!?]{0,40}\byet\b)/.test(l);
    const missed=!notYet&&/\b(missed|forgot|forgotten|skipped|did not take|didn't take)\b/.test(l);
    const taken=/\b(took|taken|injected|administered|did my|have been taking|been taking)\b/.test(l)&&!notYet&&!missed;
    const dose=l.match(/\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml)\b/i), base=nowDate(context), range=parseMedicationRange(text,base);
    const explicitSchedule=parseCadence(text), knownSchedule=explicitSchedule||context.medicationSchedules?.[canonical]||context.schedule||null;
    let dates=[now(context)];
    if(range&&taken){
      if(!knownSchedule)return{type:'medication-schedule-needed',confidence:.98,needsClarification:true,clarificationQuestion:`I understand that ${label} was taken during ${range.label}, but I need its schedule before creating dates. Was it daily, weekly on a particular day, or something else?`,summary:`${label} backfill needs a confirmed schedule`,events:[]};
      dates=scheduleDates(range,knownSchedule);
      if(!dates.length)return{type:'medication-range-empty',confidence:.98,needsClarification:true,clarificationQuestion:`The schedule and date range did not produce any dose dates. Please confirm the day of the week and range.`,summary:`${label} backfill produced no dates`,events:[]};
    }
    const status=taken?'taken':notYet?'not_taken_yet':missed?'missed':'mentioned';
    const events=dates.map(timestamp=>({category:'medication',timestamp,raw_text:text,structured:{medication_name:label,original_medication_name:matched,canonical_medication_id:canonical,dose:dose?num(dose[1]):null,unit:dose?dose[2]:'',status,interpretation_status:'confirmed',backfilled:Boolean(range),schedule_used:range?knownSchedule:null}}));
    const dateList=range?dates.map(x=>x.slice(0,10)):[];
    return{confidence:status==='mentioned'?.78:.96,needsClarification:status==='mentioned',summary:range&&taken?`${label} taken on ${dates.length} scheduled date${dates.length===1?'':'s'}`:`${label} ${status.replaceAll('_',' ')}`,events,previewDates:dateList,medication:{canonical,label,matched},schedule:knownSchedule};
  }
  function parseExerciseChunk(exercise,chunk,timestamp,raw){
    const l=lower(chunk); let weight=null,reps=null,sets=null,duration=null,steps=null,distance=null;
    const durationM=l.match(/(\d+)\s*(?:min|mins|minutes)\b/), stepsM=l.match(/(\d[\d,]*)\s*steps?\b/), distanceM=l.match(/(\d+(?:\.\d+)?)\s*(?:mi|mile|miles)\b/);
    if(durationM)duration=num(durationM[1]);if(stepsM)steps=num(stepsM[1]);if(distanceM)distance=num(distanceM[1]);
    const trio=l.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs)?\s*[x× ]\s*(\d+)\s*[x×]\s*(\d+)/i)||l.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs)?\s+(\d+)\s*[x×]\s*(\d+)/i);
    if(trio){weight=num(trio[1]);reps=num(trio[2]);sets=num(trio[3]);}
    const variants=[...l.matchAll(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+)\s*[x×]\s*(\d+)/g)].map(m=>({weight:num(m[1]),reps:num(m[2]),sets:num(m[3])}));
    const structured={exercise,weight,weight_unit:weight!=null?'lb':'',reps,sets,duration_min:duration,steps,distance_mi:distance,interpretation_status:'confirmed'};
    if(variants.length>1)structured.set_variants=variants;
    return {category:'workout',timestamp,raw_text:raw,structured};
  }
  function parseWorkoutSegment(segment,raw){
    const l=lower(segment.text), occurrences=[];
    for(const [exercise,aliases] of Object.entries(EXERCISE_ALIASES))for(const alias of aliases){let from=0,idx;while((idx=l.indexOf(alias,from))>=0){occurrences.push({idx,exercise,alias});from=idx+alias.length;}}
    occurrences.sort((a,b)=>a.idx-b.idx||b.alias.length-a.alias.length); const dedup=[];for(const o of occurrences){const prev=dedup.at(-1);if(!prev||o.idx>=prev.idx+prev.alias.length)dedup.push(o);}
    return dedup.map((o,i)=>{let chunk=segment.text.slice(o.idx+o.alias.length,dedup[i+1]?.idx??segment.text.length);if(o.exercise==='stair climber'){const prefix=segment.text.slice(Math.max(0,o.idx-28),o.idx);const dm=prefix.match(/(\d+)\s*(?:min|mins|minutes)\s*$/i);if(dm)chunk=`${dm[0]} ${chunk}`;}return parseExerciseChunk(o.exercise,chunk,segment.date,raw);});
  }
  function stableHash(text){let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
  function parseWorkout(text,context={}){
    const segs=dateSegments(text), events=segs.flatMap(s=>parseWorkoutSegment(s,text));
    if(events.length){const hash=stableHash(lower(text));const counters={};events.forEach(e=>{const day=e.timestamp.slice(0,10);counters[day]=(counters[day]||0)+1;const id=`workout:${day}:${hash}`;e.structured={...e.structured,workout_id:id,session_id:id,activity_index:counters[day],modality:e.structured.exercise==='stair climber'?'cardio':e.structured.exercise==='massage chair'?'recovery':'strength'};e.provenance={source:'deterministic-workout-parser'};});return{confidence:.96,summary:`${new Set(events.map(e=>e.timestamp.slice(0,10))).size} workout session${new Set(events.map(e=>e.timestamp.slice(0,10))).size===1?'':'s'}, ${events.length} activities`,events};}
    const exercise=context.exercise||findAlias(text,EXERCISE_ALIASES)?.canonical;if(!exercise)return null;return{confidence:.75,needsClarification:true,summary:exercise,events:[parseExerciseChunk(exercise,text,now(context),text)]};
  }
  function parseSingle(text,context={}){if(isAmbiguousBP(text)&&!context.exercise&&!context.metric)return{type:'ambiguity',confidence:.45,choices:['blood pressure','bench press'],raw:text};if(context.metric==='weight'&&/^\s*\d{2,3}(?:\.\d+)?\s*$/.test(text))return{confidence:.98,summary:`weight ${norm(text)} lb`,events:[{category:'measurement',timestamp:now(context),raw_text:text,structured:{metric_id:'weight',value:num(text),unit:'lb',interpretation_status:'confirmed'}}]};return parseBloodPressure(text,context)||parseWeight(text,context)||parseMedication(text,context)||parseWorkout(text,context)||{type:'unstructured',confidence:.35,summary:'an observation that needs more interpretation',events:[]};}
  function interpret(text,context={}){return parseSingle(text,context);}
  window.ZekeParser={interpret,isAmbiguousBP,resolveDateToken,aliases:{medications:MED_ALIASES,exercises:EXERCISE_ALIASES},canonicalMedicationId:value=>findAlias(value,MED_ALIASES)?.canonical||lower(value).replace(/[^a-z0-9]+/g,'_')};
})();
