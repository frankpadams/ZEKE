const fs=require('fs'),path=require('path'),vm=require('vm');
const {webcrypto,randomUUID}=require('crypto');
const root=path.resolve(__dirname,'..');
const live=process.env.ZEKE_TEST_DATA_ROOT;
if(!live){console.log('SKIP: ZEKE_TEST_DATA_ROOT not provided; live repair transaction test requires external Project Zeke fixture.');process.exit(0);}
const readJson=rel=>JSON.parse(fs.readFileSync(path.join(live,rel),'utf8'));
const seed={
  'health/events.json':readJson('health/events.json'),
  'health/factors.json':readJson('health/factors.json'),
  'health/discoveries.json':readJson('health/discoveries.json'),
  'system/actions.json':readJson('system/actions.json'),
  'imports/batches.json':readJson('imports/batches.json')
};
const storage=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()}};
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,RegExp,Promise,structuredClone,crypto:{...webcrypto,randomUUID},localStorage:storage(),sessionStorage:storage(),CustomEvent:class{},setTimeout,clearTimeout};
context.window=context;context.addEventListener=()=>{};context.dispatchEvent=()=>{};context.__ZEKE_TEST_MODE__=true;context.__ZEKE_TEST_SEED__=seed;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/integrity-engine.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/data-layer.js'),'utf8'),context);
const must=(v,m)=>{if(!v)throw new Error(m)};
const active=e=>!['undone','superseded','invalid','quarantined','deleted'].includes(String(e?.structured?.interpretation_status||e?.structured?.data_quality_status||'').toLowerCase())&&e?.structured?.include_in_analysis!==false;
(async()=>{
  await context.ZekeData.bootstrap();
  const beforeEvents=await context.ZekeData.listEvents(),beforeFactors=await context.ZekeData.listFactors(),beforeDiscoveries=await context.ZekeData.listDiscoveries();
  const candidates=context.ZekeIntegrityEngine.scan({events:beforeEvents,factors:beforeFactors,actions:await context.ZekeData.getActions(),discoveries:beforeDiscoveries});
  const types=new Set(candidates.map(c=>c.type));
  for(const type of ['exact-duplicate','import-artifact','zero-as-missing','paddle-fields','implausible-sleep','answered-question','stale-discovery'])must(types.has(type),`live fixture missing ${type}`);
  const result=await context.ZekeData.applyIntegrityRepairs(candidates);
  must(result.applied>0,'no repairs were applied');
  must(result.backup_path.startsWith('imports/backups/integrity-'),'integrity backup path missing');
  const afterEvents=await context.ZekeData.listEvents(),afterFactors=await context.ZekeData.listFactors(),afterDiscoveries=await context.ZekeData.listDiscoveries();
  for(const c of candidates.filter(c=>c.type==='exact-duplicate')){
    const keep=c.keep?.id||c.items[0].id;
    must(afterEvents.find(e=>e.id===keep),'kept duplicate missing');
    for(const item of c.items.filter(x=>x.id!==keep)){
      const e=afterEvents.find(x=>x.id===item.id);must(e?.structured?.interpretation_status==='superseded'&&e.structured.include_in_analysis===false,'duplicate not superseded');
    }
  }
  for(const c of candidates.filter(c=>c.type==='import-artifact'))for(const item of c.items){const e=afterEvents.find(x=>x.id===item.id);must(e?.structured?.interpretation_status==='quarantined'&&e.structured.include_in_analysis===false,'import artifact not quarantined')}
  for(const c of candidates.filter(c=>c.type==='implausible-sleep'&&c.keep)){const bad=afterEvents.find(x=>x.id===c.items[0].id);must(bad?.structured?.interpretation_status==='superseded'&&bad.structured.superseded_by===c.keep.id,'implausible sleep not superseded')}
  for(const c of candidates.filter(c=>c.type==='paddle-fields'))for(const item of c.items){const e=afterEvents.find(x=>x.id===item.id),s=e?.structured||{};must(s.steps==null&&s.ambulatory_steps==null&&s.average_hr==null&&s.avg_hr==null,'paddling artifacts remain');must(s.activity_profile==='sport','paddling profile not repaired')}
  for(const c of candidates.filter(c=>c.type==='zero-as-missing'))for(const item of c.items){const s=afterEvents.find(x=>x.id===item.id)?.structured||{};must(s.average_hr==null&&s.avg_hr==null,'zero HR remains')}
  for(const c of candidates.filter(c=>c.type==='answered-question'))for(const item of c.items){must(afterFactors.find(x=>x.id===item.id)?.status==='resolved','answered question not resolved')}
  for(const c of candidates.filter(c=>c.type==='stale-discovery'))for(const item of c.items){must(afterDiscoveries.find(x=>x.id===item.id)?.status==='stale','stale discovery not retired')}
  must(afterEvents.some(e=>e.category==='correction'&&e.structured?.operation==='integrity_batch'),'integrity correction audit event missing');
  must(afterEvents.filter(active).length<beforeEvents.filter(active).length,'active record count did not decrease');
  await context.ZekeData.undoLastIntegrityChange();
  const undoneEvents=await context.ZekeData.listEvents(),undoneFactors=await context.ZekeData.listFactors(),undoneDiscoveries=await context.ZekeData.listDiscoveries();
  must(JSON.stringify(undoneEvents)===JSON.stringify(beforeEvents),'event undo did not restore original state');
  must(JSON.stringify(undoneFactors)===JSON.stringify(beforeFactors),'factor undo did not restore original state');
  must(JSON.stringify(undoneDiscoveries)===JSON.stringify(beforeDiscoveries),'discovery undo did not restore original state');
  console.log(JSON.stringify({ok:true,candidates:candidates.length,types:[...types].sort(),applied:result.applied,backup_path:result.backup_path,undo:true},null,2));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
