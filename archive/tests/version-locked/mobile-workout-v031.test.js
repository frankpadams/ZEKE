const fs=require('fs');const assert=require('assert');
const app=fs.readFileSync(require('path').join(__dirname,'../assets/app.js'),'utf8');
const css=fs.readFileSync(require('path').join(__dirname,'../assets/styles.css'),'utf8');
const index=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
for(const token of ['Storage connection lost','Saving to storage…','Try Save Again','ZekeExerciseGuides','Apply Recommended Progression','Start from Routine','Enter Exercises']) assert(app.includes(token),`missing ${token}`);
for(const token of ['v0.31.0','exercise-guides.js']) assert(index.includes(token),`index missing ${token}`);
for(const token of ['v0.31.0 — mobile workout visual fidelity','mobile-gym-entry','mock-form-sheet','zeke-guide-attribution']) assert(css.toLowerCase().includes(token.toLowerCase()),`css missing ${token}`);
console.log('v0.31.0 mobile workout contract passed');
