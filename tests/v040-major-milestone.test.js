const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const must=(value,message)=>{if(!value)throw new Error(message)};
const index=read('index.html'),app=read('assets/app.js'),css=read('assets/styles.css'),data=read('assets/data-layer.js'),integrity=read('assets/integrity-engine.js'),knowledge=read('assets/knowledge-base.js'),version=read('version.js'),sw=read('sw.js');
must(/<title>ZEKE v0\./.test(index)&&/build 2026\./.test(index),'current version/build missing from index');
for(const file of ['knowledge-base.js','integrity-engine.js','data-layer.js','workflow-engine.js','app.js'])must(index.includes(file),`${file} missing from runtime chain`);
must(index.indexOf('knowledge-base.js')<index.indexOf('app.js')&&index.indexOf('integrity-engine.js')<index.indexOf('app.js'),'new modules load after app');
const vmVersion=(version.match(/version: '([^']+)'/)||[])[1],vmBuild=(version.match(/build: '([^']+)'/)||[])[1];must(vmVersion&&vmBuild&&sw.includes(`project-zeke-v${vmVersion}-${vmBuild}`),'version/cache mismatch');
must((app.includes('dashboard-mockup-shell')||app.includes('dashboard-v47')||app.includes('dashboard-v46')||app.includes('dashboard-v3'))&&app.includes('dashboard-insights-panel')&&app.includes('weeklyPlanHTML')&&app.includes('truthfulRecentActivityHTML'),'current dashboard structure missing');
must(app.includes('Not enough data')||app.includes('not enough'),'truthful insufficient-data language missing');
must(app.includes('Talk to ZEKE')&&!app.includes('<b>Gym</b>')&&app.includes('id="mobileLogButton"'),'mobile navigation must retain unified ZEKE input, no Gym mode, and explicit top-level Log');
must(app.includes('openKnowledgeGuide')&&app.includes('Mind-muscle / targeting cues')&&app.includes('Verified movement image not yet available'),'knowledge guide or truthful media fallback missing');
must(app.includes('More gym workouts')&&app.includes('More home workouts')&&app.includes('It will not assign days unless you choose them'),'lightweight weekly planning contract missing');
must(app.includes("distance_mi:{label:'Distance (mi)'")&&app.includes("steps:{label:'Steps'")&&app.includes("average_hr:{label:'Average HR'")&&app.includes('function activitySchema(name,profile)'),'adaptive activity-specific fields missing');
must(data.includes('eventWriteFingerprint')&&data.includes('applyIntegrityRepairs')&&data.includes('createIntegrityBackup'),'integrity persistence foundation missing');
must(integrity.includes('Spreadsheet legend imported as health data')&&integrity.includes('stale-discovery')&&integrity.includes('answered-question'),'integrity detector coverage missing');
must(css.includes('.knowledge-guide-grid')&&css.includes('@media(max-width:680px)'),'responsive knowledge-guide styling missing');
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set,RegExp};context.window=context;vm.createContext(context);vm.runInContext(knowledge,context);vm.runInContext(integrity,context);
must(context.ZekeKnowledgeBase.count>=100,'knowledge catalog is too small');
must(context.ZekeKnowledgeBase.routines.length>=10,'built-in routine catalog is too small');
const events=[
 {id:'d1',category:'measurement',timestamp:'2026-08-01T12:00:00Z',structured:{metric_id:'weight',value:219.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
 {id:'d2',category:'measurement',timestamp:'2026-08-01T12:00:00Z',structured:{metric_id:'weight',value:219.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
 {id:'a1',category:'medication',timestamp:'2026-07-01T12:00:00Z',raw_text:'Intervention: tirzepatide: If row is colored blue, dose was administered that day.',structured:{medication_name:'mounjaro',interpretation_status:'confirmed'},provenance:{source:'import',file:'SJN1.xlsx'}},
 {id:'s1',category:'sleep',timestamp:'2026-08-01T08:00:00Z',structured:{metric_id:'sleep_duration',value:20,unit:'hr',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
 {id:'s2',category:'sleep',timestamp:'2026-08-01T09:00:00Z',structured:{metric_id:'sleep_duration',value:8,unit:'hr',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
 {id:'k1',category:'workout',timestamp:'2026-08-01T14:00:00Z',structured:{exercise:'Kayaking',steps:7,average_hr:0,interpretation_status:'confirmed'},provenance:{source:'conversation'}}
];
const candidates=context.ZekeIntegrityEngine.scan({events,factors:[{id:'q1',type:'clarification_question',status:'open',question_key:'med_schedule:mounjaro'}],actions:{catalog:[{id:'med-tirzepatide',kind:'medication',label:'Mounjaro',schedule:{type:'weekly',days:[5]}}]},discoveries:[]});
for(const type of ['exact-duplicate','import-artifact','implausible-sleep','paddle-fields','answered-question'])must(candidates.some(x=>x.type===type),`integrity engine did not detect ${type}`);
console.log(JSON.stringify({ok:true,knowledge_objects:context.ZekeKnowledgeBase.count,routines:context.ZekeKnowledgeBase.routines.length,repair_candidates:candidates.map(x=>x.type)},null,2));
