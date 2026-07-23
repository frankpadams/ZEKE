const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'assets/exercise-guides.js'),'utf8');
const context={window:{},console};context.window=context;vm.createContext(context);vm.runInContext(source,context);
const must=(value,message)=>{if(!value)throw new Error(message)};
const expected=['Chest Press','Lat Pulldown','Seated Row','Bicep Curl','Leg Press','Leg Extension','Seated Leg Curl','Shoulder Press','Tricep Press','Pec Fly','Abdominal Machine','Back Extension','Hip Abduction','Calf Raise','Stair Climber','Treadmill','Stationary Bike'];
must(context.ZekeExerciseGuides.count===expected.length,'reviewed guide count mismatch');
for(const name of expected){
  const guide=context.ZekeExerciseGuides.get(name);
  for(const section of ['setup','movement','mistakes','tips'])must(Array.isArray(guide[section])&&guide[section].length>=4,`${name}: incomplete ${section}`);
  must(guide.photo&&guide.photo.src&&guide.photo.source&&guide.photo.credit,`${name}: photo attribution missing`);
  must(guide.photo.license&&guide.photo.license.name&&guide.photo.license.url,`${name}: photo license missing`);
}
const fallback=context.ZekeExerciseGuides.get('Unsupported custom exercise');
must(fallback.photo===null,'fallback must not invent a photo');
must(fallback.targets.some(x=>/not yet reviewed/i.test(x)),'fallback must disclose that exact guide is not reviewed');
console.log(JSON.stringify({ok:true,guides:expected.length,sections:['setup','movement','mistakes','tips']},null,2));
