const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');const ctx={window:{}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'assets/knowledge-base.js'),'utf8'),ctx);
const rehab=ctx.ZekeKnowledgeBase.catalog.filter(x=>x.profile==='rehab');
const missing=rehab.filter(x=>!(x.media&&x.media.image&&x.media.image2));
console.log(JSON.stringify({ok:missing.length===0,rehab_entries:rehab.length,verified_two_frame_guides:rehab.length-missing.length,missing:missing.map(x=>x.name)},null,2));
if(missing.length)process.exit(2);
