const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const ti=fs.readFileSync(path.join(root,'assets/training-intelligence.js'),'utf8');
const checks=[
 ['top-level mobile Log',/id="mobileLogButton"[^>]*>[\s\S]*?<b>Log<\/b>/.test(app)],
 ['desktop Log action',/id="globalLogNav"/.test(app)],
 ['Fitness plan action',/id="fitnessBuildBtn"/.test(app)],
 ['Fitness exploration copy',/Opening an exercise or workout never creates a record by itself/.test(app)],
 ['pre-workout location context',/id="adaptiveLocation"/.test(app)],
 ['pre-workout duration context',/id="adaptiveDuration"/.test(app)],
 ['pre-workout emphasis context',/id="adaptiveEmphasis"/.test(app)],
 ['same-day notes context',/id="adaptiveNotes"/.test(app)],
 ['workout planner receives sessionContext',/sessionContext/.test(ti)],
 ['explicit start after proposal',/id="startProposedWorkout"/.test(app)],
 ['two-frame guide renderer',/knowledge-media-frames/.test(app) && /kb\.media\.image2/.test(app)]
];
const bad=checks.filter(x=>!x[1]); console.log(checks.map(x=>`${x[1]?'PASS':'FAIL'} ${x[0]}`).join('\n')); if(bad.length) process.exit(2);
