const fs=require('fs'),path=require('path'),vm=require('vm');const {webcrypto}=require('crypto');
const storage=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,Promise,structuredClone,crypto:webcrypto,localStorage:storage(),sessionStorage:storage(),CustomEvent:class{},setTimeout,clearTimeout};context.window=context;context.addEventListener=()=>{};context.dispatchEvent=()=>{};context.__ZEKE_TEST_MODE__=true;context.__ZEKE_TEST_SEED__={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../assets/data-layer.js'),'utf8'),context);
(async()=>{
  await context.ZekeData.bootstrap();
  await Promise.all([
    context.ZekeData.saveFactor({type:'clarification_question',question_key:'tracking_preferences',question:'One'},{idempotencyKey:'tracking_preferences'}),
    context.ZekeData.saveFactor({type:'clarification_question',question_key:'tracking_preferences',question:'Two'},{idempotencyKey:'tracking_preferences'})
  ]);
  let factors=await context.ZekeData.listFactors();
  const matching=factors.filter(x=>x.question_key==='tracking_preferences');
  if(matching.length!==1)throw new Error('duplicate factor created');
  await context.ZekeData.resolveFactor(matching[0].id,'resolved','Completed');
  factors=await context.ZekeData.listFactors();
  const updated=factors.find(x=>x.id===matching[0].id);
  if(updated?.status!=='resolved'||updated?.answer!=='Completed')throw new Error('existing idempotent factor could not be updated');
  if(factors.filter(x=>x.question_key==='tracking_preferences').length!==1)throw new Error('factor update created a duplicate');
  console.log(JSON.stringify({ok:true,count:factors.length,status:updated.status},null,2));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
