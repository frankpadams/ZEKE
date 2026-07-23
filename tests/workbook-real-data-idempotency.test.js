const fs=require('fs'),path=require('path'),vm=require('vm');const {webcrypto}=require('crypto');
const releaseRoot=path.resolve(__dirname,'..');const dataRoot=process.env.ZEKE_TEST_DATA_ROOT;if(!dataRoot){console.log(JSON.stringify({ok:true,skipped:true,reason:'ZEKE_TEST_DATA_ROOT not set'}));process.exit(0);}
const readJson=(rel,fallback)=>{const p=path.join(dataRoot,rel);return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):fallback};
const seed={
  'health/events.json':readJson('health/events.json',[]),'health/factors.json':readJson('health/factors.json',[]),'health/discoveries.json':readJson('health/discoveries.json',[]),'health/injuries.json':readJson('health/injuries.json',[]),'health/investigations.json':readJson('health/investigations.json',[]),
  'system/ai-exchanges.json':readJson('system/ai-exchanges.json',[]),'imports/batches.json':readJson('imports/batches.json',[]),'system/conversation.json':readJson('system/conversation.json',[]),'imports/sources.json':readJson('imports/sources.json',{sources:[]}),
  'system/preferences.json':readJson('system/preferences.json',{}),'system/dashboard-layout.json':readJson('system/dashboard-layout.json',{widgets:[]}),'system/actions.json':readJson('system/actions.json',{catalog:[],daily_states:{}}),'system/ai-connections.json':readJson('system/ai-connections.json',{connections:[]})
};
const storage=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,Promise,TextEncoder,TextDecoder,structuredClone,crypto:webcrypto,setTimeout,clearTimeout,localStorage:storage(),sessionStorage:storage(),location:{hash:''},navigator:{},Blob:global.Blob,URL:global.URL,confirm:()=>false,document:{addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},documentElement:{dataset:{}},body:{classList:{contains(){return false},toggle(){}},contains(){return false},insertAdjacentHTML(){}}},CustomEvent:class{}};
context.window=context;context.addEventListener=()=>{};context.dispatchEvent=()=>{};context.__ZEKE_TEST_MODE__=true;context.__ZEKE_TEST_SEED__=seed;context.ZEKE_BUILD={version:'0.20.3',build:'2026.07.17.12'};context.ZEKE_VERSION='0.20.3';context.ZekeAIRouter={status:()=>({providers:[]}),hydrateMetadata:async()=>{}};
vm.createContext(context);for(const file of ['xlsx-bundle.js','assets/parser.js','assets/app.js','assets/data-layer.js'])vm.runInContext(fs.readFileSync(path.join(releaseRoot,file),'utf8'),context,{filename:file});
(async()=>{
  await context.ZekeData.bootstrap();
  const sources=seed['imports/sources.json'];const source=sources.sources.find(x=>x.kind==='health-workbook');if(!source)throw new Error('health workbook source missing');
  const workbookPath=path.join(dataRoot,source.path);const workbook=context.XLSX.read(fs.readFileSync(workbookPath),{type:'array',cellDates:true});
  const built=await context.ZekeWorkbookTools.buildWorkbookCandidates(workbook,source);const before=(await context.ZekeData.listEvents()).length;
  const pre=await context.ZekeData.preflightSourceEvents(built.candidates);if(built.candidates.length!==188||pre.unchanged!==188||pre.created||pre.updated||pre.conflicts)throw new Error(`preflight mismatch ${JSON.stringify({count:built.candidates.length,pre})}`);
  const commit=await context.ZekeData.reconcileSourceEvents(built.candidates,{source:source.id,file:source.name,transaction_id:'real-data-test',review_token:'test-token'});
  const verify=await context.ZekeData.verifySourceEvents(built.candidates);const after=(await context.ZekeData.listEvents()).length;
  if(!commit.no_change||commit.backup_path!==null||after!==before)throw new Error(`no-change commit altered events ${JSON.stringify({before,after,commit})}`);
  if(verify.unchanged!==188||verify.created||verify.updated||verify.conflicts)throw new Error(`verification mismatch ${JSON.stringify(verify)}`);
  console.log(JSON.stringify({ok:true,candidates:built.candidates.length,before,after,preflight:pre,commit,verify},null,2));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
