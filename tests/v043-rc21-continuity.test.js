const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const must=['00_AI_START_HERE.md','RELEASE_NOTES.md','PROJECT_STATE.md','ARCHITECTURE.md','DESIGN_AUTHORITY.md','CURRENT_RELEASE_SCOPE.md','DECISION_LOG.md','CHANGELOG.md','DEVELOPMENT_MEMORY/RELEASE_GATE.md'];
for(const f of must){if(!fs.existsSync(path.join(root,f)))throw new Error('missing authority: '+f);}
const active=must.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
if(/separate Gym Mode/i.test(active)&&!/supersed/i.test(active))throw new Error('active authority can be read as reviving Gym Mode');
for(const phrase of ['dose occurrence','mobile','connected','self-describ']){if(!active.toLowerCase().includes(phrase.toLowerCase()))throw new Error('missing current concept '+phrase);}
console.log('v0.43 RC2.1 continuity/self-description contract passed');
