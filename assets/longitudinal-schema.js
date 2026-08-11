(() => {
  'use strict';
  const day=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const active=e=>!['deleted','superseded','quarantined'].includes(String(e?.status||e?.structured?.status||'').toLowerCase());
  const category=e=>String(e?.category||e?.structured?.category||'observation').toLowerCase();
  const sourceLevel=e=>e?.provenance?.user_confirmed?'user_confirmed':e?.provenance?.source?'source_fact':'recorded_fact';
  function normalizeEvent(e){
    const s=e?.structured||{}, start=e?.start_time||s.start_time||e?.timestamp||e?.recorded_at, end=e?.end_time||s.end_time||start;
    return {id:e?.id||'',kind:category(e),start,end,day:day(start),label:s.label||s.name||s.exercise||s.medication_name||s.metric_id||e?.raw_text||category(e),body_area:s.body_area||s.anatomical_area||null,status:s.status||null,evidence_level:sourceLevel(e),confidence:s.confidence??e?.confidence??null,source:e?.provenance?.source||null,raw:e};
  }
  function timeline(events=[],calendar=[]){
    const rows=events.filter(active).map(normalizeEvent);
    calendar.forEach(c=>rows.push({id:c.id||'',kind:'calendar',start:c.start||c.timestamp,end:c.end||c.start||c.timestamp,day:day(c.start||c.timestamp),label:c.summary||c.title||'Calendar event',evidence_level:'source_fact',source:'calendar',raw:c}));
    return rows.filter(x=>x.day).sort((a,b)=>new Date(a.start)-new Date(b.start));
  }
  function relations(events=[]){
    const t=timeline(events), out=[];
    for(let i=0;i<t.length;i++) for(let j=i+1;j<t.length&&j<i+12;j++){
      const hours=(new Date(t[j].start)-new Date(t[i].end||t[i].start))/36e5;if(hours>168)break;
      if(hours>=0 && (t[i].body_area&&t[i].body_area===t[j].body_area || ['workout','activity','vaccination','immunotherapy','context','illness','injury'].includes(t[i].kind)&&['symptom','observation','measurement','sleep'].includes(t[j].kind)))
        out.push({type:'temporal_proximity',from:t[i].id,to:t[j].id,hours_apart:Math.round(hours*10)/10,claim:'association_only',confidence:'unassessed'});
    }
    return out;
  }
  function provenanceFact(value,{source='user',confirmed=false,observed_at=null,recorded_at=new Date().toISOString()}={}){return {value,observed_at,recorded_at,provenance:{source,user_confirmed:!!confirmed},truth_class:confirmed?'user_confirmed_fact':'source_fact'};}
  window.ZekeLongitudinal=Object.freeze({day,normalizeEvent,timeline,relations,provenanceFact,schemaVersion:3});
})();
