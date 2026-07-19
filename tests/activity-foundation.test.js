const fs=require('fs');
const app=fs.readFileSync('assets/app.js','utf8');
const css=fs.readFileSync('assets/styles.css','utf8');
function must(x,msg){if(!x)throw new Error(msg)}
must(app.includes("id:'functional',label:'Chores & Functional Activity'"),'functional category missing');
must(app.includes('ACTIVITY_TAXONOMY.map'),'taxonomy not shared with UI');
must(app.includes('activitySummaryFacts'),'modality-aware summary missing');
must(app.includes('zeke.health.metricFavorites.v1'),'health favorites namespace missing');
must(app.includes('zeke.fitness.activityFavorites.v1'),'fitness favorites namespace missing');
must(app.includes('openWorkoutEditModal'),'workout editor missing');
must(app.includes("correction_note:'Workout record corrected by user through structured editor'"),'correction history note missing');
must(app.includes('openPatternLab'),'focused Pattern Lab helper missing');
must(css.includes('v0.22.2 stabilization and activity foundation'),'authoritative layout layer missing');
console.log('activity foundation structural checks passed');
