const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/styles.css'),'utf8');
const design=fs.readFileSync(path.join(root,'DESIGN_AUTHORITY.md'),'utf8');
const must=(x,m)=>{if(!x)throw new Error(m)};

// Canonical history must remain multi-series rather than joining unlike equipment.
must(app.includes('data-variation-series='),'variation-series groups missing');
must(app.includes("if(row?.weight==null||row.weight===''||!row.date)continue;"),'missing-load guard absent');
must(app.includes('if(!Number.isFinite(weight)||weight<=0)continue;'),'missing/non-positive load is not excluded');
must(app.includes("const d=pts.length>1?"), 'singleton-series line guard missing');
must(app.includes("String(row.variation_name||family||'Unspecified variation')"),'exact variation identity missing from chart series');

// Batch workout entry must resolve identity before variation-dependent coaching.
const variationPos=app.indexOf('id="workoutExerciseVariation"');
const coachPos=app.indexOf('COACH’S EYE',variationPos);
must(variationPos>=0&&coachPos>variationPos,'variation chooser must precede Coach’s Eye');
must(app.includes('set_rpe:')&&app.includes('set_pain:'),'per-set effort/pain persistence missing');
must(app.includes('class="set-rpe"')&&app.includes('class="set-pain"'),'per-set effort/pain controls missing');
must(app.includes('Another session is needed to establish a trend.'),'single-session compact progression state missing');

// The mobile logging menu from the approved mockup remains a complete three-path workflow.
must(app.includes('id="logSingleActivity"')&&app.includes('Enter one exercise or activity'),'single-activity logging path missing');
must(app.includes('id="logFromRoutine"')&&app.includes('Start from routine'),'routine logging path missing');
must(app.includes('id="logRepeatLast"')&&app.includes('Repeat last workout'),'repeat-last logging path missing');

// Mobile visual language / navigation regression contract.
must(css.includes('v0.43.1 — Mobile Professional Polish'),'authoritative professional polish CSS layer missing');
must(css.includes('.global-talk-button{display:none!important}'),'duplicate floating ZEKE control not suppressed on mobile');
must(css.includes('.mobile-bottom-nav .mobile-zeke-entry span'),'compact central ZEKE nav treatment missing');
must(css.includes('.sidebar{width:min(82vw,300px)!important}')||css.includes('.sidebar{width:min(78vw,310px)!important}'),'drawer width cap missing');
must(css.includes('.zeke-workout-title>span{display:none!important}'),'legacy stacked workout title label not suppressed');
must(design.includes('dark navy ZEKE header')&&design.includes('compact rounded white cards')&&design.includes('Do not reintroduce “Gym Mode.”'),'mobile design authority contract missing');

console.log(JSON.stringify({ok:true,contract:'mobile professional polish'},null,2));
