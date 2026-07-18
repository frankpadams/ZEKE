const fs=require('fs'),path=require('path'),vm=require('vm');const {webcrypto}=require('crypto');
const storage=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const seed={
  'health/events.json':[], 'health/factors.json':[], 'health/discoveries.json':[], 'health/injuries.json':[], 'health/investigations.json':[],
  'system/ai-exchanges.json':[], 'imports/batches.json':[], 'system/conversation.json':[], 'imports/sources.json':{sources:[]},
  'system/preferences.json':{}, 'system/dashboard-layout.json':{widgets:[]}, 'system/actions.json':{catalog:[],daily_states:{}}, 'system/ai-connections.json':{connections:[]}
};
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,Promise,structuredClone,crypto:webcrypto,localStorage:storage(),sessionStorage:storage(),CustomEvent:class{},setTimeout,clearTimeout};
context.window=context;context.addEventListener=()=>{};context.dispatchEvent=()=>{};context.__ZEKE_TEST_MODE__=true;context.__ZEKE_TEST_SEED__=seed;context.ZEKE_VERSION='0.20.3';
vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../assets/data-layer.js'),'utf8'),context);
(async()=>{
  await context.ZekeData.bootstrap();
  const candidate={schema_version:3,id:'candidate-id',category:'measurement',timestamp:'2026-07-17T12:00:00.000Z',recorded_at:'2026-07-18T00:00:00.000Z',raw_text:'',structured:{metric_id:'weight',value:220.8,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'connected-workbook',source_cell:'B7',source_key:'source-key-1',source_key_aliases:['source-key-new'],source_fingerprint:'fingerprint-1'}};
  const p1=await context.ZekeData.preflightSourceEvents([candidate]);
  if(p1.created!==1||p1.unchanged!==0)throw new Error(`unexpected initial preflight ${JSON.stringify(p1)}`);
  const commit=await context.ZekeData.reconcileSourceEvents([candidate],{source:'source-1',file:'health.xlsx',transaction_id:'tx-1',review_token:'review-1'});
  if(commit.created!==1||!commit.backup_path)throw new Error(`commit failed ${JSON.stringify(commit)}`);
  const verify=await context.ZekeData.verifySourceEvents([candidate]);
  if(verify.unchanged!==1||verify.created||verify.updated||verify.conflicts)throw new Error(`verify failed ${JSON.stringify(verify)}`);
  const second=await context.ZekeData.reconcileSourceEvents([candidate],{source:'source-1',file:'health.xlsx',transaction_id:'tx-2',review_token:'review-2'});
  if(!second.no_change||second.unchanged!==1)throw new Error(`second sync not idempotent ${JSON.stringify(second)}`);
  const events=await context.ZekeData.listEvents();
  if(events.filter(e=>e.category==='measurement').length!==1)throw new Error('duplicate measurement created');
  const batches=await context.ZekeData.listImportBatches();
  if(!batches.some(b=>b.transaction_id==='tx-1'&&b.status==='repository_committed'))throw new Error('transaction metadata missing');
  console.log(JSON.stringify({ok:true,initial:p1,commit,verify,second,event_count:events.length,batch_count:batches.length},null,2));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
