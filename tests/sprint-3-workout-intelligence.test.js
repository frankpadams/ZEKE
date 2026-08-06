const fs=require('fs');
const app=fs.readFileSync('assets/app.js','utf8');
const css=fs.readFileSync('assets/styles.css','utf8');
const checks=[
  ['preference storage key',app.includes('zeke.fitness.activityPreferences.v1')],
  ['four preference values',['more','neutral','less','exclude'].every(v=>app.includes(`[\'${v}\'`)||app.includes(`['${v}'`))],
  ['coach exclusion guard',app.includes("activityPreference(timely.name)!=='exclude'")],
  ['preference event handler',app.includes("[data-activity-preference]")],
  ['preference styling',css.includes('.activity-preference-control')&&css.includes('.preference-chip.active')],
  ['specific relationship review remains',app.includes('ACTIVITY RELATIONSHIPS')&&app.includes('Relationships tested for this activity')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
process.exitCode=failed?1:0;
