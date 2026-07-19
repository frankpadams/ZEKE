const fs=require('fs');
const app=fs.readFileSync('assets/app.js','utf8');
const css=fs.readFileSync('assets/styles.css','utf8');
function must(x,msg){if(!x)throw new Error(msg)}
must(app.includes('dashboard-independent-layout'),'independent dashboard composition missing');
must(app.includes('dashboard-main-stream'),'main stream wrapper missing');
must(app.includes('dashboard-health-rail'),'health rail wrapper missing');
const dashboardFn=app.slice(app.indexOf('function dashboardHTML()'),app.indexOf('function isSuppressedIntegrityArtifact'));
must(dashboardFn.indexOf('dashboard-main-stream') < dashboardFn.indexOf('dashboard-health-rail'),'main stream must precede independent rail');
must(css.includes('dashboard-only acceptance repair'),'dashboard-only repair marker missing');
must(css.includes('.dashboard-main-stream{'),'main stream layout rule missing');
must(css.includes('.dashboard-health-rail{'),'health rail layout rule missing');
must(css.includes('grid-row:auto!important'),'legacy row-span neutralization missing');
console.log('dashboard independent-flow acceptance checks passed');
