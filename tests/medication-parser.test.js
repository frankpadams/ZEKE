const fs=require('fs'),path=require('path'),vm=require('vm');
const context={window:{},console,Date,Intl,JSON,Math,Number,String,Object,Array,Map,Set};context.window=context;
vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../assets/parser.js'),'utf8'),context);
const now='2026-07-18T12:00:00.000Z';
function parse(text,extra={}){return context.ZekeParser.interpret(text,{now,...extra});}
function assert(value,message){if(!value)throw new Error(message)}
let r=parse("I missed my Mounjaro dose");assert(r.events[0].structured.status==='missed','missed status');assert(r.events[0].structured.canonical_medication_id==='tirzepatide','canonical tirzepatide');
r=parse("I have not taken my Mounjaro yet");assert(r.events[0].structured.status==='not_taken_yet','not taken yet status');
r=parse("I took Mounjaro for the past 7 days");assert(r.events.length===0&&r.needsClarification&&r.clarificationQuestion,'range without schedule must clarify');
r=parse("I took Mounjaro for the past 7 days",{medicationSchedules:{tirzepatide:{type:'weekly',days:[5]}}});assert(r.events.length===1&&r.previewDates[0]==='2026-07-17','weekly range should create Friday only');
r=parse("I have been taking Mounjaro every Friday from 7/3/2026 to 7/17/2026");assert(r.events.length===3,'explicit weekly backfill count');assert(r.previewDates.join(',')==='2026-07-03,2026-07-10,2026-07-17','explicit weekly dates');
r=parse("I took Lipitor 20 mg");assert(r.events[0].structured.canonical_medication_id==='atorvastatin','Lipitor canonical identity');assert(r.events[0].structured.original_medication_name==='lipitor','original alias retained');
console.log(JSON.stringify({ok:true,tests:6},null,2));
r=parse("I took my GLP-1 today");assert(r.needsClarification&&r.events.length===0&&r.type==='medication-identity-needed','GLP-1 class phrase must clarify rather than map to tirzepatide');
