const fs=require('fs');const assert=require('assert');
const app=fs.readFileSync('assets/app.js','utf8');const css=fs.readFileSync('assets/styles.css','utf8');
assert(app.includes('mobile-bottom-nav'));assert(app.includes('mobileMoreButton'));assert(css.includes('--nav-rail-width'));
assert(app.includes('NEXT SESSION'));assert(app.includes('PATTERNS'));assert(app.includes('Full evidence')||app.includes('full evidence'));
assert(app.includes("zeke-user-profile"));assert(!app.includes('Good evening, Frank'));assert(!app.includes('Good morning, Frank'));
assert(app.includes("state.patternFocus=el.dataset.activityPattern"));
console.log('PASS navigation, coaching, profile, and context structure');
