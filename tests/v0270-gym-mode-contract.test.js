const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/styles.css'),'utf8');
function must(v,m){if(!v)throw new Error(m)}
must(app.includes("version: '0.27.0'")&&app.includes("build: '2026.07.22.3'"),'version metadata missing');
must(app.includes("modal.className='gym-mode'")&&app.includes('Copy Set 1 to all'),'Gym Mode structure missing');
must(app.includes('Guide image under review')&&app.includes('diverse adult backgrounds'),'guide-media policy missing');
must(css.includes('.gym-main{overflow-y:auto;overflow-x:hidden'),'Gym main overflow contract missing');
must(css.includes('@media(max-width:370px)'),'narrow-phone contract missing');
console.log('v0.27.0 Gym Mode contract passed');
