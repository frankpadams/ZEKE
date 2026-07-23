const fs=require('fs');
const app=fs.readFileSync('assets/app.js','utf8');
const css=fs.readFileSync('assets/styles.css','utf8');
const version=fs.readFileSync('version.js','utf8');
const must=(x,m)=>{if(!x)throw new Error(m)};

const current=(version.match(/version:\s*'([0-9.]+)'/)||[])[1]||'0.0.0';
const parts=current.split('.').map(Number);
must(parts[0]>0||(parts[0]===0&&(parts[1]>26||(parts[1]===26&&parts[2]>=1))),'release predates the v0.26.1 regression baseline');
must(app.includes("activityTab:'favorites'"),'Activity Library must start at Favorites');
must(!app.includes("localStorage.setItem('zeke.fitness.activityTab.v1'"),'Activity Library view must not persist over the Favorites default');
must(app.includes('id="activityLibrarySelect"'),'responsive Activity Library selector missing');
must(app.includes('id="activityLibrarySearch"'),'Activity Library search missing');
must(!app.includes('<div class="library-tabs" role="tablist">'),'overflowing Activity Library chip row returned');
for(const pair of ["['favorites','Favorites']","['recent','Recent']","['strength','Strength']","['cardio','Cardio']","['mobility_pt','Mobility/PT']","['sports','Sports']","['custom','Custom']","['all','All']"])must(app.includes(pair),`Activity Library view missing: ${pair}`);
must(css.includes('.activity-library-controls')&&css.includes('grid-template-columns:minmax(180px,.55fr) minmax(220px,1fr)'),'responsive Activity Library CSS missing');

must(app.includes('expandedDashboardTrends:new Set()'),'Dashboard trend expansion state missing');
must(app.includes('data-dashboard-trend=')&&app.includes('state.expandedDashboardTrends.has(item.id)'),'Dashboard trends do not restore open state');
must(app.includes("el.open?state.expandedDashboardTrends.add(id):state.expandedDashboardTrends.delete(id)"),'Dashboard trend toggle state binding missing');
must(app.includes('expandedPrivateSummaries:new Set()')&&app.includes('state.expandedPrivateSummaries.has(id)'),'private Dashboard disclosures do not persist');

must(app.includes('openActivityRelationshipReview'),'activity-specific relationship review missing');
must(app.includes('No tested relationship yet for'),'specific insufficient-data relationship state missing');
must(!app.includes("||patterns[0]"),'evidence review must not fall back to an unrelated generic pattern');
must(app.includes('It will not redirect this link to an unrelated generic result.'),'generic relationship fallback warning missing');
must(app.includes("`${prefix}sessions`")&&app.includes("`${prefix}load`")&&app.includes("`${prefix}duration`"),'activity features are not included in relationship screening');
must(app.includes("canonicalMetric(metricId(e))==='sleep_duration'"),'sleep is not included in paired relationship data');

must(app.includes('data-coach-evidence'),'Coach evidence entry point missing');
must(app.includes('openCoachEvidence'),'Coach evidence modal missing');
for(const url of ['https://pubmed.ncbi.nlm.nih.gov/41843416/','https://pubmed.ncbi.nlm.nih.gov/19204579/','https://pubmed.ncbi.nlm.nih.gov/35708888/'])must(app.includes(url),`specific research source missing: ${url}`);
must(app.includes('Why this? Research & evidence'),'expanded activity evidence action missing');
must(app.includes('Personal data and published research are shown separately'),'evidence provenance distinction missing');

// Preserve the resolved mobile workout save path.
must(app.includes("$('#saveDirectWorkout').onclick=e=>{e.preventDefault();saveWorkoutForm()}"),'mobile Save Workout handler regressed');
must(app.includes("$('#directWorkoutForm').onsubmit=e=>{e.preventDefault();saveWorkoutForm()}"),'mobile workout form submit fallback regressed');
console.log(JSON.stringify({ok:true,checks:34},null,2));
