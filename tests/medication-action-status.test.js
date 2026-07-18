const fs=require('fs'),path=require('path'),vm=require('vm');
const storage=()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const context={
  window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,Promise,
  TextEncoder,TextDecoder,structuredClone,crypto:require('crypto').webcrypto,setTimeout,clearTimeout,
  localStorage:storage(),sessionStorage:storage(),location:{hash:''},navigator:{},Blob:global.Blob,URL:global.URL,confirm:()=>false,
  document:{addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},documentElement:{dataset:{}},body:{classList:{contains(){return false},toggle(){}},contains(){return false},insertAdjacentHTML(){}}},
  CustomEvent:class CustomEvent{constructor(type,detail={}){this.type=type;this.detail=detail}}
};
context.window=context;context.__ZEKE_TEST_MODE__=true;context.addEventListener=()=>{};context.dispatchEvent=()=>{};
context.ZEKE_BUILD={version:'0.20.3',build:'2026.07.17.12'};context.ZekeAIRouter={status:()=>({providers:[]}),hydrateMetadata:async()=>{}};
vm.createContext(context);
for(const file of ['assets/parser.js','assets/app.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),context,{filename:file});
const match=context.ZekeAppTestTools.medicationEventCompletesAction;
const action={id:'med-mounjaro',kind:'medication',label:'Mounjaro'};
const event=status=>({category:'medication',timestamp:'2026-07-17T12:00:00',structured:{medication_name:'tirzepatide',status,interpretation_status:'confirmed'},provenance:{source:'conversation'}});
function assert(v,m){if(!v)throw new Error(m)}
assert(match(action,event('taken')),'taken should complete action');
assert(match(action,event('administered')),'administered should complete action');
assert(!match(action,event('missed')),'missed must not complete action');
assert(!match(action,event('not_taken_yet')),'not taken yet must not complete action');
assert(!match(action,event('pending')),'pending must not complete action');
assert(!match(action,event('uncertain')),'uncertain must not complete action');
assert(!match(action,{...event('taken'),structured:{...event('taken').structured,interpretation_status:'pending'}}),'unconfirmed dose must not complete action');
assert(match({id:'med-lipitor',kind:'medication',label:'Lipitor'},{...event('taken'),structured:{...event('taken').structured,medication_name:'atorvastatin'}}),'brand/generic alias should match');
console.log(JSON.stringify({ok:true,tests:8},null,2));
