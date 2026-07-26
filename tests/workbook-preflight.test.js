const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');

const releaseRoot = path.resolve(__dirname, '..');
const dataRoot = process.env.ZEKE_TEST_DATA_ROOT;
if (!dataRoot) throw new Error('Set ZEKE_TEST_DATA_ROOT to the extracted Project Zeke directory.');

const storage = () => {
  const map = new Map();
  return { getItem:k=>map.has(k)?map.get(k):null, setItem:(k,v)=>map.set(k,String(v)), removeItem:k=>map.delete(k) };
};
const context = {
  console, Date, Intl, JSON, Math, Number, String, Object, Array, Map, Set, Promise,
  TextEncoder, TextDecoder, structuredClone, crypto:webcrypto, setTimeout, clearTimeout,
  localStorage:storage(), sessionStorage:storage(), location:{hash:''}, navigator:{},
  Blob:global.Blob, URL:global.URL, confirm:()=>false,
  document:{addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},documentElement:{dataset:{}},body:{classList:{toggle(){return false}},contains(){return false}}},
  CustomEvent:class CustomEvent{constructor(type,detail={}){this.type=type;this.detail=detail}},
};
context.window = context;
context.window.addEventListener = () => {};
context.window.dispatchEvent = () => {};
context.window.ZEKE_BUILD = {version:'0.20.3',build:'2026.07.17.12'};
context.window.ZekeAIRouter = {status:()=>({providers:[]}),hydrateMetadata:async()=>{}};
vm.createContext(context);
for (const file of ['xlsx-bundle.js','assets/app.js','assets/data-layer.js']) {
  vm.runInContext(fs.readFileSync(path.join(releaseRoot,file),'utf8'), context, {filename:file});
}

(async()=>{
  const sources = JSON.parse(fs.readFileSync(path.join(dataRoot,'imports/sources.json'),'utf8'));
  const source = sources.sources.find(x=>x.kind==='health-workbook');
  const workbookPath = path.join(dataRoot, source.path);
  const workbook = context.XLSX.read(fs.readFileSync(workbookPath),{type:'array',cellDates:true});
  const rowsParsed=context.ZekeWorkbookTools.workbookRows(workbook);
  if(process.env.ZEKE_ROWS==='1'){console.log(JSON.stringify(rowsParsed.rows.filter(r=>[12,13,16,17].includes(r.__source_row)),null,2));return;}
  const built = await context.ZekeWorkbookTools.buildWorkbookCandidates(workbook,source);
  const events = JSON.parse(fs.readFileSync(path.join(dataRoot,'health/events.json'),'utf8'));
  const report = await context.ZekeData.preflightSourceEvents(built.candidates,events);
  if(process.env.ZEKE_DEBUG==='1'){fs.writeFileSync('/tmp/zeke-candidates.json',JSON.stringify(built.candidates,null,2));console.log(JSON.stringify({candidateCount:built.candidates.length,diagnostics:built.diagnostics,unmapped:built.unmapped,report},null,2));return;}
  const expected = {candidates:188,created:0,updated:0,unchanged:188,linked_existing:0,conflicts:0,unsupported_updates:0};
  const actual = {candidates:built.candidates.length,...report};
  for (const [key,value] of Object.entries(expected)) {
    if (actual[key] !== value) throw new Error(`${key}: expected ${value}, received ${actual[key]}`);
  }
  console.log(JSON.stringify({ok:true,diagnostics:built.diagnostics,unmapped:built.unmapped,report:actual},null,2));
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
