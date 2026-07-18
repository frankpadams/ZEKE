const fs=require('fs'),path=require('path'),vm=require('vm');const {webcrypto}=require('crypto');
const storage=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const oldBytes=new Uint8Array([1,2,3,4]),newBytes=new Uint8Array([9,8,7]);
const source={id:'source-1',kind:'health-workbook',name:'old.xlsx',path:'imports/originals/connected-health-history-source-1.xlsx',linked_at:'2026-07-01T00:00:00.000Z',updated_at:'2026-07-01T00:00:00.000Z',schema_version:1};
const seed={
  'health/events.json':[], 'health/factors.json':[], 'health/discoveries.json':[], 'health/injuries.json':[], 'health/investigations.json':[],
  'system/ai-exchanges.json':[], 'imports/batches.json':[], 'system/conversation.json':[], 'imports/sources.json':{sources:[source]},
  'system/preferences.json':{}, 'system/dashboard-layout.json':{widgets:[]}, 'system/actions.json':{catalog:[],daily_states:{}}, 'system/ai-connections.json':{connections:[]},
  [source.path]:oldBytes
};
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,Promise,structuredClone,crypto:webcrypto,localStorage:storage(),sessionStorage:storage(),CustomEvent:class{},setTimeout,clearTimeout};
context.window=context;context.addEventListener=()=>{};context.dispatchEvent=()=>{};context.__ZEKE_TEST_MODE__=true;context.__ZEKE_TEST_SEED__=seed;context.ZEKE_VERSION='0.20.3';
vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../assets/data-layer.js'),'utf8'),context);
(async()=>{
  await context.ZekeData.bootstrap();
  const replaced=await context.ZekeData.saveSyncSource('new.xlsx',newBytes,{source_id:'source-1'});
  if(!replaced.previous_source_backup_path||!replaced.previous_source_backup_path.startsWith('imports/backups/source-workbook-'))throw new Error('previous source backup path missing');
  if(replaced.path!==source.path)throw new Error('connected source path changed unexpectedly');
  const linked=await context.ZekeData.readSyncSourceWorkbook();
  if(linked.source.name!=='new.xlsx')throw new Error('replacement source metadata not saved');
  if(Array.from(linked.buffer).join(',')!==Array.from(newBytes).join(','))throw new Error('replacement bytes not saved');
  console.log(JSON.stringify({ok:true,source_path:replaced.path,previous_source_backup_path:replaced.previous_source_backup_path},null,2));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
