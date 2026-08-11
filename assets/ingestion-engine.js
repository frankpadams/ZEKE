(() => {
  'use strict';
  const signatures=[
    {type:'dexa',terms:['dxa','dexa','bone mineral density','t-score','z-score','lean mass','fat mass','android','gynoid']},
    {type:'lab_results',terms:['reference range','result','mg/dl','mmol/l','hemoglobin','glucose','cholesterol']},
    {type:'medication_list',terms:['medications','dose','tablet','capsule','mg','take daily']},
    {type:'imaging_report',terms:['impression','findings','radiology','mri','ct scan','x-ray']},
    {type:'vaccination_record',terms:['vaccine','vaccination','immunization','lot number','administered']},
    {type:'immunotherapy_record',terms:['allergy shot','immunotherapy','allergen','maintenance dose']}
  ];
  function classify({filename='',text='',context=''}={}){
    const hay=`${filename} ${text} ${context}`.toLowerCase();
    const scored=signatures.map(s=>({...s,signals:s.terms.filter(t=>hay.includes(t))})).map(s=>({...s,score:s.signals.length/s.terms.length})).sort((a,b)=>b.score-a.score);
    const best=scored[0];
    return {document_type:best?.score?best.type:'unknown',confidence:best?.score>=.45?'high':best?.score>=.2?'moderate':'low',score:best?.score||0,signals:best?.signals||[],needs_user_confirmation:!best||best.score<.45,recommended_workflow:best?.score?`review_${best.type}`:'ask_document_type'};
  }
  function sourceRange({low=null,high=null,unit='',flag='',label='',source=''}){return {low,high,unit,flag,label,source,kind:'source_reported_reference',universal:false};}
  function reviewPacket(input,extracted={}){return {classification:classify(input),extracted,source:{filename:input.filename||'',captured_at:new Date().toISOString()},commit_status:'needs_review',rule:'AI proposes; ZEKE validates; user confirms; source remains traceable'};}
  window.ZekeIngestion=Object.freeze({classify,sourceRange,reviewPacket,schemaVersion:1});
})();
