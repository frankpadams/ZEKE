(() => {
  'use strict';
  const norm=s=>String(s||'').trim(), lower=s=>norm(s).toLowerCase(), num=x=>Number(String(x).replace(/,/g,''));
  const now=()=>new Date().toISOString();
  const MED_ALIASES={atorvastatin:['atorvastatin','atorvastin','atorvostatin','lipitor','statin'],mounjaro:['mounjaro','monjaro','tirzepatide','glp-1','glp1','glp 1']};
  const EXERCISE_ALIASES={
    'stair climber':['matrix stairclimber','stairclimber machine','stair climber','stairclimber','climbmill','stairs'],
    'lat pulldown':['lat pulldown','lat pull down','lat pull-down','pulldown'],
    'seated row':['seated row','row machine'], 'glute lift':['glute lift','glute machine'],
    'seated leg curl':['seated leg curl','leg curl'], 'leg extension':['leg extension'],
    'independent bicep curl':['independent bicep curls','independent bicep curl','bicep curls','bicep curl','biceps curl'],
    'abdominal':['abdominal','ab machine','ab crunch'], 'massage chair':['massage chair'],
    'bench press':['bench press','bench']
  };
  function findAlias(text,map){const l=lower(text);for(const [c,a] of Object.entries(map))if(a.some(x=>l.includes(x)))return c;return null;}
  function resolveDateToken(token,base=new Date()){
    const m=String(token).match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?$/); if(!m)return null;
    let y=m[3]?Number(m[3]):base.getFullYear(); if(y<100)y+=2000;
    const d=new Date(y,Number(m[1])-1,Number(m[2]),12,0,0); if(Number.isNaN(d.getTime()))return null;
    // A yearless date is normally the most recent occurrence, but allow a near-future date in the current year.
    if(!m[3] && d.getTime()>base.getTime()+45*864e5)d.setFullYear(y-1);
    return d.toISOString();
  }
  function dateSegments(text){
    const re=/(^|\s)(\d{1,2}\/\d{1,2}(?:\/(?:\d{2}|\d{4}))?)(?=\s|$)/g, hits=[]; let m;
    while((m=re.exec(text)))hits.push({start:m.index+m[1].length,end:re.lastIndex,token:m[2],date:resolveDateToken(m[2])});
    if(!hits.length)return [{date:now(),text}];
    return hits.map((h,i)=>({date:h.date,text:text.slice(h.end,hits[i+1]?.start??text.length).trim(),rawDate:h.token}));
  }
  function isAmbiguousBP(text){return /^\s*bp\s+\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?){2,3}\s*$/i.test(text);}
  function parseBloodPressure(text){const m=lower(text).match(/(?:bp|blood pressure)\s*(\d{2,3})\s*[\/,-]\s*(\d{2,3})(?:\s+(?:hr|pulse)\s*(\d{2,3}))?/i);if(!m)return null;const s=num(m[1]),d=num(m[2]);if(!(s>=50&&s<=300&&d>=30&&d<=200))return null;const ts=now(),events=[{category:'measurement',timestamp:ts,raw_text:text,structured:{metric_id:'bp_systolic',value:s,unit:'mmHg',interpretation_status:'confirmed'}},{category:'measurement',timestamp:ts,raw_text:text,structured:{metric_id:'bp_diastolic',value:d,unit:'mmHg',interpretation_status:'confirmed'}}];if(m[3])events.push({category:'measurement',timestamp:ts,raw_text:text,structured:{metric_id:'heart_rate',value:num(m[3]),unit:'bpm',interpretation_status:'confirmed'}});return{confidence:.99,summary:`blood pressure ${s}/${d} mmHg`,events};}
  function parseWeight(text){const m=lower(text).match(/(?:weight|weighed|weighing|i am|i'm)\s*(?:is|was|at)?\s*(\d{2,3}(?:\.\d+)?)\s*(lb|lbs|pounds|kg|kilograms)?\b/i);if(!m||(!/weight|weigh/i.test(text)&&!m[2]))return null;const unit=/^kg/.test(m[2]||'')?'kg':'lb';return{confidence:.97,summary:`weight ${m[1]} ${unit}`,events:[{category:'measurement',timestamp:now(),raw_text:text,structured:{metric_id:'weight',value:num(m[1]),unit,interpretation_status:'confirmed'}}]};}
  function parseMedication(text){const med=findAlias(text,MED_ALIASES);if(!med)return null;const l=lower(text),neg=/\b(did not|didn't|not taken|forgot|missed)\b/.test(l),taken=/\b(took|taken|injected|administered|did my)\b/.test(l)&&!neg;const dose=l.match(/\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml)\b/i);const range=l.match(/(?:past|last|previous)\s+(\d+)\s+days?/i);let dates=[now()];if(range&&taken){const n=Math.min(60,Number(range[1]));const base=new Date();dates=Array.from({length:n},(_,i)=>{const d=new Date(base);d.setDate(base.getDate()-(n-1-i));d.setHours(12,0,0,0);return d.toISOString();});}
    const status=taken?'taken':neg?'not_taken_yet':'mentioned';return{confidence:taken||neg?.96:.78,needsClarification:status==='mentioned',summary:range&&taken?`${med} taken on ${dates.length} dates`:`${med} ${status}`,events:dates.map(timestamp=>({category:'medication',timestamp,raw_text:text,structured:{medication_name:med,dose:dose?num(dose[1]):null,unit:dose?dose[2]:'',status,interpretation_status:'confirmed',backfilled:Boolean(range)}}))};}
  function parseExerciseChunk(exercise,chunk,timestamp,raw){
    const l=lower(chunk); let weight=null,reps=null,sets=null,duration=null,steps=null,distance=null;
    const durationM=l.match(/(\d+)\s*(?:min|mins|minutes)\b/), stepsM=l.match(/(\d[\d,]*)\s*steps?\b/), distanceM=l.match(/(\d+(?:\.\d+)?)\s*(?:mi|mile|miles)\b/);
    if(durationM)duration=num(durationM[1]);if(stepsM)steps=num(stepsM[1]);if(distanceM)distance=num(distanceM[1]);
    // Accept 60lbs 15x3, 140x10x2, and 85 12x2.
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
  function parseWorkout(text,context={}){
    const segs=dateSegments(text), events=segs.flatMap(s=>parseWorkoutSegment(s,text));
    if(events.length)return{confidence:.96,summary:`${new Set(events.map(e=>e.timestamp.slice(0,10))).size} workout session${new Set(events.map(e=>e.timestamp.slice(0,10))).size===1?'':'s'}, ${events.length} activities`,events};
    const exercise=context.exercise||findAlias(text,EXERCISE_ALIASES);if(!exercise)return null;return{confidence:.75,needsClarification:true,summary:exercise,events:[parseExerciseChunk(exercise,text,now(),text)]};
  }
  function parseSingle(text,context={}){if(isAmbiguousBP(text)&&!context.exercise&&!context.metric)return{type:'ambiguity',confidence:.45,choices:['blood pressure','bench press'],raw:text};if(context.metric==='weight'&&/^\s*\d{2,3}(?:\.\d+)?\s*$/.test(text))return{confidence:.98,summary:`weight ${norm(text)} lb`,events:[{category:'measurement',timestamp:now(),raw_text:text,structured:{metric_id:'weight',value:num(text),unit:'lb',interpretation_status:'confirmed'}}]};return parseBloodPressure(text)||parseWeight(text)||parseMedication(text)||parseWorkout(text,context)||{type:'unstructured',confidence:.35,summary:'an observation that needs more interpretation',events:[]};}
  function interpret(text,context={}){return parseSingle(text,context);}
  window.ZekeParser={interpret,isAmbiguousBP,resolveDateToken,aliases:{medications:MED_ALIASES,exercises:EXERCISE_ALIASES}};
})();
