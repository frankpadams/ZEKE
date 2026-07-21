const fs=require('fs'),path=require('path'),vm=require('vm');const {webcrypto,randomUUID}=require('crypto');
const storage=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()}};
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,Promise,structuredClone,crypto:{...webcrypto,randomUUID},localStorage:storage(),sessionStorage:storage(),CustomEvent:class{},setTimeout,clearTimeout};context.window=context;context.addEventListener=()=>{};context.dispatchEvent=()=>{};context.__ZEKE_TEST_MODE__=true;context.__ZEKE_TEST_SEED__={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../assets/data-layer.js'),'utf8'),context);
(async()=>{
 await context.ZekeData.bootstrap();
 const raw=await context.ZekeData.addRawInput('I slept from 2am to 10:45am and slept well.','conversation');
 const event={category:'sleep',timestamp:'2026-07-19T10:45:00-04:00',raw_text:raw.text,structured:{metric_id:'sleep_duration',value:8.75,unit:'hr',start_time:'2026-07-19T02:00:00-04:00',end_time:'2026-07-19T10:45:00-04:00',sleep_quality:'good',interpretation_status:'confirmed'},provenance:{source:'test'}};
 const first=await context.ZekeData.confirmRawInput(raw.id,[event]);
 const second=await context.ZekeData.confirmRawInput(raw.id,[event]);
 if(first.length!==1)throw new Error('first sleep confirmation should create one event');
 if(second.length!==0)throw new Error('repeat confirmation must not create a second event');
 await context.ZekeData.undoEvents(first.map(x=>x.id));
 const events=await context.ZekeData.listEvents();const saved=events.find(x=>x.id===first[0].id);
 if(saved.structured.include_in_analysis!==false||saved.structured.interpretation_status!=='undone')throw new Error('undo did not preserve and deactivate the saved event');
 console.log(JSON.stringify({ok:true,created:first.length,repeat_created:second.length,undone:true},null,2));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
