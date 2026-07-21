const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../assets/workflow-engine.js'),'utf8');
const store=new Map();
const context={
  window:{},crypto:{randomUUID:()=>crypto.randomUUID()},structuredClone:v=>JSON.parse(JSON.stringify(v)),
  localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
  Date,Set,Math,JSON,String,Array,Object,Number,RegExp
};
vm.createContext(context);vm.runInContext(source,context);
const engine=context.window.ZekeWorkflowEngine;
const assert=(v,m)=>{if(!v)throw new Error(m)};
const wf=engine.create({goal:'Set Mounjaro schedule',source_text:'I take it weekly on Fridays',target:{medication:'Mounjaro'}});
assert(wf.status==='understanding','workflow did not start');
engine.update(wf.id,{status:'waiting_confirmation',proposed:{type:'weekly',days:[5]},save_status:'not_saved'},'Schedule ready');
engine.unresolved({workflow_id:wf.id,reason:'Test unresolved row',original_message:wf.source_text});
engine.ai({workflow_id:wf.id,status:'success',provider:'test',model:'test-model',api_key:'must-not-export'});
engine.close(wf.id,'completed','Schedule saved',{save_status:'saved'});
assert(engine.get(wf.id).status==='completed','workflow did not close');
assert(engine.current()===null,'terminal workflow remained current');
const full=engine.exportSnapshot({privacy_mode:'full'});
assert(full.metrics.workflows_completed===1,'completion metric wrong');
assert(full.logs.unresolved_interactions.length===1,'unresolved log missing');
const anon=engine.exportSnapshot({privacy_mode:'anonymized'});
const serialized=JSON.stringify(anon);
assert(!serialized.includes('must-not-export'),'credential-like field exported');
assert(!serialized.includes('Mounjaro'),'anonymized personal term remains');
engine.clearLogs({keep_workflows:false});
assert(engine.list().length===0,'clear did not remove workflows');
console.log(JSON.stringify({ok:true,checks:9},null,2));
