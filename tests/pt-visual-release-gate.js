const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const kb=fs.readFileSync(path.join(root,'assets/knowledge-base.js'),'utf8');
const ids=['pt-band-internal-rotation','pt-doorway-chest-stretch','pt-pnf-d1','pt-pnf-d2','pt-no-monies','pt-cheerleaders'];
for(const id of ids){
  const re=new RegExp(`\\{"id":"${id}"[\\s\\S]*?"media":\\{([^}]+)\\}`); const m=kb.match(re); assert(m,`${id}: catalog entry missing`); const media=m[1];
  const paths=[...media.matchAll(/"image2?":"\.\/assets\/exercise-guides\/([^"]+)"/g)].map(x=>x[1]);
  assert.strictEqual(paths.length,2,`${id}: two movement frames are required`);
  assert(media.includes('"verified_movement":true'),`${id}: guide must be movement-verified`);
  assert(media.includes(`guide_signature":"${id}:movement-specific:`),`${id}: movement-specific verification signature missing`);
  for(const f of paths){const full=path.join(root,'assets/exercise-guides',f);assert(fs.existsSync(full),`${id}: missing ${f}`);const txt=fs.readFileSync(full,'utf8');assert(/<title/.test(txt)&&/<desc/.test(txt),`${id}: accessible title/description required`);}
}
const rehabCount=(kb.match(/"profile":"rehab"/g)||[]).length; assert(rehabCount>=14,'Expected at least 14 rehab guides.');
console.log(`PT visual release gate passed: ${rehabCount} rehab entries; ${ids.length} local movement-specific guide pairs verified.`);
