const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const must=(x,m)=>{if(!x)throw new Error(m)};
const app=read('assets/app.js'),css=read('assets/styles.css'),index=read('index.html');
must(index.includes('ZEKE v0.27.3'),'v0.27 metadata missing');
must(app.includes("Today's Workout"),'today workout workspace missing');
must(app.includes('Exercise Workspace'),'exercise workspace missing');
must(app.includes('Copy Set 1 to all'),'copy-set interaction missing');
must(app.includes('set_reps'),'set-by-set storage missing');
must(app.includes('Saved to today’s workout'),'explicit save confirmation missing');
must(app.includes('zeke-form-sheet'),'form guide bottom sheet missing');
must(css.includes('100dvh'),'dynamic viewport support missing');
must(css.includes('safe-area-inset-bottom'),'iOS safe area support missing');
must(css.includes('font-size:16px'),'iOS input zoom protection missing');
console.log('v0.27 mobile workout checks passed');

must(app.includes('guideModelForm'),'Guide Model settings missing');
must(app.includes('CC BY-SA 4.0'),'Creative Commons attribution metadata missing');
