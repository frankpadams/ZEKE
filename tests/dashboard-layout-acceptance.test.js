const fs=require('fs');
const app=fs.readFileSync('assets/app.js','utf8');
const css=fs.readFileSync('assets/styles.css','utf8');
function must(x,msg){if(!x)throw new Error(msg)}
const dashboardFn=app.slice(app.indexOf('function dashboardHTML()'),app.indexOf('function isSuppressedIntegrityArtifact'));
must(dashboardFn.includes('dashboard-v2'),'daily briefing wrapper missing');
must(dashboardFn.includes('dashboard-briefing-row'),'three-card briefing row missing');
must(dashboardFn.indexOf('healthGlanceHTML')<dashboardFn.indexOf('dashboard-briefing-row'),'Health at a Glance must precede the briefing row');
must(dashboardFn.includes('${todayActionsHTML()}${coachHTML()}${upcomingHTML()}'),'Today, Coach, and Upcoming order changed');
must(dashboardFn.indexOf('trendPanelHTML')>dashboardFn.indexOf('dashboard-briefing-row'),'Trends must have its own row beneath the briefing row');
must(!dashboardFn.includes('dashboard-masonry'),'superseded masonry wrapper returned');
must(css.includes('.dashboard-briefing-row{display:grid'),'briefing-row CSS missing');
must(css.includes('grid-template-columns:minmax(0,1.05fr) minmax(0,1fr) minmax(0,.9fr)'),'desktop three-card proportions missing');
must(css.includes('.trends-analysis-panel{width:100%'),'full-width Trends rule missing');
must(css.includes('--card-radius:20px'),'approved rounded card rule missing');
console.log('dashboard daily-briefing acceptance checks passed');
