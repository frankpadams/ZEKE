const fs=require('fs');
const app=fs.readFileSync('assets/app.js','utf8');
const css=fs.readFileSync('assets/styles.css','utf8');
function must(x,msg){if(!x)throw new Error(msg)}
const dashboardFn=app.slice(app.indexOf('function dashboardHTML()'),app.indexOf('function isSuppressedIntegrityArtifact'));
must(dashboardFn.includes('dashboard-masonry'),'independent dashboard masonry wrapper missing');
must(dashboardFn.includes('dashboard-stack-primary'),'primary stack missing');
must(dashboardFn.includes('dashboard-stack-context'),'context stack missing');
must(dashboardFn.includes('dashboard-stack-health'),'health stack missing');
must(css.includes('.dashboard-masonry{'),'masonry layout rule missing');
must(css.includes('.dashboard-stack{display:flex;flex-direction:column'),'independent vertical-stack rule missing');
must(css.includes('align-items:start!important'),'dashboard stacks must align from their own content');
must(css.includes('.dashboard-stack-primary .coach-lane'),'narrow dashboard coaching readability repair missing');
console.log('dashboard independent-stack acceptance checks passed');
