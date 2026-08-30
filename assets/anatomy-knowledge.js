/* ZEKE v0.46.0 — versioned anatomy/body-structure reference layer.
   General reference knowledge is separate from user-specific health records. */
(() => {
  'use strict';
  const PACK = Object.freeze({
    id: 'zeke-anatomy-core',
    version: '2026.08.24.2',
    reviewed_at: '2026-08-24',
    review_interval_days: 90,
    source: 'ZEKE curated exercise catalog + anatomy normalization layer',
    status: 'active'
  });
  const AREA_MAP = Object.freeze({
    'chest':{region:'Chest',joints:['shoulder','elbow'],bones:['scapula','humerus','sternum','ribs']},
    'upper chest':{region:'Chest',joints:['shoulder','elbow'],bones:['clavicle','scapula','humerus','sternum']},
    'back':{region:'Back',joints:['shoulder','scapulothoracic'],bones:['scapula','humerus','thoracic spine']},
    'upper back':{region:'Upper Back',joints:['shoulder','scapulothoracic'],bones:['scapula','thoracic spine','humerus']},
    'lats':{region:'Back',joints:['shoulder','scapulothoracic'],bones:['humerus','scapula','thoracic spine']},
    'biceps':{region:'Arms',joints:['elbow','shoulder'],bones:['humerus','radius','scapula']},
    'triceps':{region:'Arms',joints:['elbow','shoulder'],bones:['humerus','ulna','scapula']},
    'front shoulders':{region:'Shoulders',joints:['shoulder'],bones:['scapula','clavicle','humerus']},
    'shoulders':{region:'Shoulders',joints:['shoulder','scapulothoracic'],bones:['scapula','clavicle','humerus']},
    'scapular stabilizers':{region:'Shoulders',joints:['scapulothoracic','shoulder'],bones:['scapula','thoracic spine']},
    'rotator cuff':{region:'Shoulders',joints:['shoulder'],bones:['scapula','humerus'],soft_tissues:['supraspinatus tendon','infraspinatus tendon','subscapularis tendon','teres minor tendon']},
    'quadriceps':{region:'Thighs',joints:['knee','hip'],bones:['femur','patella','tibia']},
    'hamstrings':{region:'Thighs',joints:['hip','knee'],bones:['pelvis','femur','tibia','fibula']},
    'glutes':{region:'Hips / Glutes',joints:['hip'],bones:['pelvis','femur']},
    'hip flexors':{region:'Hips',joints:['hip'],bones:['pelvis','femur','lumbar spine']},
    'abdominals':{region:'Core',joints:['spine'],bones:['ribs','pelvis','lumbar spine']},
    'erector spinae':{region:'Back',joints:['spine','hip'],bones:['spine','pelvis']},
    'calves':{region:'Lower Legs',joints:['ankle','knee'],bones:['tibia','fibula','calcaneus']}
  });
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];
  function anatomyForExercise(exercise){
    const k=window.ZekeKnowledgeBase?.get?.(exercise); if(!k)return null;
    const build=(names,role)=>names.map(name=>{const m=AREA_MAP[String(name).toLowerCase()]||{};return {name,role,region:m.region||name,joints:m.joints||[],bones:m.bones||[],soft_tissues:m.soft_tissues||[]}});
    const structures=[...build(k.primary||[],'primary'),...build(k.secondary||[],'secondary')];
    return {exercise:k.name,structures,regions:uniq(structures.map(x=>x.region)),joints:uniq(structures.flatMap(x=>x.joints)),bones:uniq(structures.flatMap(x=>x.bones)),soft_tissues:uniq(structures.flatMap(x=>x.soft_tissues)),pack:PACK};
  }
  function packStatus(now=new Date()){
    const reviewed=new Date(`${PACK.reviewed_at}T12:00:00Z`),age=Math.floor((now-reviewed)/864e5),stale=age>PACK.review_interval_days;
    return {...PACK,age_days:age,stale,next_review_due:new Date(reviewed.getTime()+PACK.review_interval_days*864e5).toISOString().slice(0,10)};
  }
  function validatePack(candidate){
    const errors=[];if(!candidate||typeof candidate!=='object')errors.push('Pack must be an object.');
    for(const key of ['id','version','reviewed_at','source'])if(!String(candidate?.[key]||'').trim())errors.push(`Missing ${key}.`);
    if(candidate?.id&&candidate.id!==PACK.id)errors.push('Pack id does not match the active knowledge family.');
    if(candidate?.review_interval_days!=null&&(!Number.isFinite(Number(candidate.review_interval_days))||Number(candidate.review_interval_days)<1))errors.push('review_interval_days must be a positive number.');
    return {ok:errors.length===0,errors};
  }
  function diffPack(candidate){
    const keys=['version','reviewed_at','review_interval_days','source','status'],changes=[];for(const key of keys){const before=PACK[key]??null,after=candidate?.[key]??before;if(JSON.stringify(before)!==JSON.stringify(after))changes.push({field:key,before,after});}
    return {pack_id:PACK.id,from_version:PACK.version,to_version:candidate?.version||PACK.version,changes,requires_validation:true,personal_record_changes:0};
  }
  function activationPlan(candidate){const validation=validatePack(candidate),diff=diffPack(candidate);return {validation,diff,can_activate:validation.ok&&diff.changes.length>0,rollback:{pack_id:PACK.id,restore_version:PACK.version},rule:'Reference-pack activation never rewrites personal records.'};}
  window.ZekeKnowledgeRegistry=Object.freeze({pack:PACK,anatomyForExercise,packStatus,validatePack,diffPack,activationPlan,areaMap:AREA_MAP});
})();
