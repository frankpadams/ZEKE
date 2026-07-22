const fs=require('fs');
const app=fs.readFileSync('assets/app.js','utf8');
const parser=fs.readFileSync('assets/parser.js','utf8');
const css=fs.readFileSync('assets/styles.css','utf8');
const must=(x,m)=>{if(!x)throw new Error(m)};
// Protect the resolved v0.25.2 mobile save path.
must(app.includes("$('#saveDirectWorkout').onclick=e=>{e.preventDefault();saveWorkoutForm()}"),'direct mobile Save Workout handler regressed');
must(app.includes("$('#directWorkoutForm').onsubmit=e=>{e.preventDefault();saveWorkoutForm()}"),'workout form submit fallback regressed');
must(app.includes("saveBtn.textContent='Checking…'"),'visible checking state missing');
must(app.includes("errorEl.textContent=`Workout was not saved:"),'visible workout error missing');
must(app.includes('globalThis.crypto?.randomUUID?.()'),'transaction ID compatibility fallback missing');
// Activity-relevant data contract.
for(const token of ['stair_steps','ambulatory_steps','distance_mi','average_hr','workoutMissingRelevantDetails'])must(app.includes(token),`${token} missing`);
must(app.includes("Stair steps")&&app.includes('Walking steps'),'distinct step labels missing');
must(app.includes("columns=activityDetailColumns(category,name).filter"),'empty irrelevant detail columns are not suppressed');
must(app.includes('data-remove-event'),'reversible removal controls missing');
must(app.includes("ZekeData.undoEvents([id]"),'removal must preserve audit history');
// Domain and briefing contract.
for(const token of ['Health at a Glance',"WHAT DO I NEED TO DO?","WHAT SHOULD I DO?","WHAT HAS CHANGED?","WHAT'S COMING UP?",'Questions for You'])must(app.includes(token),`${token} missing`);
must(app.includes('monthlyMedicationCheckinHTML'),'monthly medication/supplement review missing');
must(app.includes('medication_checkin_last_completed'),'monthly check-in persistence missing');
must(app.includes('dashboardMetricOrder'),'Dashboard reorder contract missing');
must(app.includes('new Set(storedStringArray(\'zeke.health.metricFavorites.v1\'))'),'safe Health-pinning storage missing');
must(parser.includes('wake_date:wakeDate'),'deterministic sleep wake date missing');
must(css.includes('.dashboard-v2')&&css.includes('.dashboard-briefing-row'),'daily briefing CSS missing');
// July 21–22 regression and workflow checklist.
must(app.includes("activityTab:'favorites'"),'Fitness must default to Favorites');
must(!app.includes("activityTab:localStorage.getItem('zeke.fitness.activityTab.v1')"),'stale Activity Library view must not override Favorites');
must(app.includes('Click for details and coaching')&&app.includes("$$('[data-activity-name]').forEach"),'activity details click path missing');
must(app.includes('+ Create activity type'),'ambiguous add-activity wording returned');
must(app.includes('openEvidenceReview')&&app.includes('Related dated records')&&app.includes('Limitations'),'evidence review must open concrete supporting detail');
must(!app.includes('Provider View'),'duplicated Provider View returned');
must(app.includes('openMedicationBackfillModal')&&app.includes('bulk-medication-backfill')&&app.includes('skips existing doses'),'reviewed past-dose batch backfill missing');
must(app.includes('medication-action-confirm')&&app.includes('Taken today')&&app.includes('today-action-confirmation'),'direct taken-dose confirmation missing');
must(app.includes('schedule saved: ${label}.'),'recurring schedule success feedback variable is not stable');
must(app.includes('fitnessGoalsHTML')&&app.includes('goal_planning_consultant')&&app.includes('AI review is advisory'),'goal setting and bounded AI review missing');
must(app.includes('user_profile:profile')&&app.includes('ZekeData.savePreferences(state.preferences)'),'profile is not persisted with the portable workspace');
must(!app.includes("localStorage.setItem('zeke-user-profile'"),'profile must not remain app-local only');
must(app.includes('Back to Questions for You')&&!app.includes('Kept in Waiting for You'),'approved Questions for You language regressed');
console.log(JSON.stringify({ok:true,checks:37},null,2));
