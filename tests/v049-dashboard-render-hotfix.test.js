const fs=require('fs');const assert=require('assert');
const app=fs.readFileSync('assets/app.js','utf8');
assert(app.includes("function dashboardRangeControl(kind='health')"));
assert(app.includes("${dashboardRangeControl('health')}"));
assert(!app.includes('dashboardRangeHTML('));
console.log('v0.49.0.1 dashboard render hotfix assertions passed');
