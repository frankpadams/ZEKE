const fs=require('fs'),path=require('path'),vm=require('vm');const {webcrypto,randomUUID}=require('crypto');
const storage=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)} };
const seed={
 'system/actions.json':{catalog:[{id:'med-tirzepatide',label:'Mounjaro',schedule:{type:'weekly',days:[5]},dose:15,unit:'mg'}],daily_states:{}},
 'health/factors.json':[
  {id:'q1',status:'open',type:'clarification_question',question_key:'med_schedule:mounjaro',question:'How often?'},
  {id:'q2',status:'open',type:'clarification_question',question_key:'med_schedule:mounjaro',question:'Duplicate question'}
 ]
};
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,Promise,structuredClone,crypto:{...webcrypto,randomUUID},localStorage:storage(),sessionStorage:storage(),CustomEvent:class{},setTimeout,clearTimeout};context.window=context;context.addEventListener=()=>{};context.dispatchEvent=()=>{};context.__ZEKE_TEST_MODE__=true;context.__ZEKE_TEST_SEED__=seed;vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../assets/data-layer.js'),'utf8'),context);
(async()=>{
 await context.ZekeData.bootstrap();
 const factors=await context.ZekeData.listFactors();
 const schedule=factors.filter(f=>f.question_key==='med_schedule:mounjaro');
 if(!schedule.every(f=>['resolved','superseded'].includes(f.status))) throw new Error('known medication schedule questions were not reconciled');
 if(!schedule.some(f=>/Weekly on Friday/.test(f.answer||''))) throw new Error('confirmed schedule was not attached to resolved question');
 const e={category:'measurement',timestamp:'2026-08-02T12:00:00Z',structured:{metric_id:'weight',value:219.6,unit:'lb',interpretation_status:'confirmed'}};
 const [a,b]=await Promise.all([context.ZekeData.addEvent(e),context.ZekeData.addEvent(e)]);
 const events=(await context.ZekeData.listEvents()).filter(x=>x.category==='measurement');
 if(events.length!==1||a.id!==b.id) throw new Error('concurrent exact duplicate write was not prevented');
 const hr=await context.ZekeData.addEvent({category:'workout',timestamp:'2026-08-02T13:00:00Z',structured:{exercise:'Kayaking',activity_profile:'sport',duration_min:60,distance_mi:7,average_hr:0}});
 if('average_hr' in hr.structured) throw new Error('zero heart rate was not normalized to missing');
 const replacement=await context.ZekeData.supersedeEvent(hr.id,{category:'workout',timestamp:hr.timestamp,structured:{exercise:'Kayaking',activity_profile:'sport',duration_min:60,distance_mi:7,interpretation_status:'confirmed'}},'Repair kayaking record');
 const all=await context.ZekeData.listEvents(),original=all.find(x=>x.id===hr.id);
 if(original.structured.include_in_analysis!==false||original.structured.interpretation_status!=='superseded') throw new Error('original record remained active after supersession');
 if(replacement.provenance.supersedes_event_id!==hr.id) throw new Error('replacement provenance is incomplete');
 console.log(JSON.stringify({ok:true,reconciled:schedule.length,duplicate_prevented:true,missing_zero_normalized:true,supersession:true},null,2));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
