#!/usr/bin/env python3
from pathlib import Path
import re,json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
css='\n'.join((root/p).read_text() for p in ['assets/styles.css','assets/mobile-native.css','assets/mobile-polish-v0441.css','assets/desktop-v047.css'])
shim="""<script>window.__ZEKE_TEST_MODE__=true;const M=new Map(),S=new Map();window.__ZEKE_LS={getItem:k=>M.get(String(k))??null,setItem:(k,v)=>M.set(String(k),String(v)),removeItem:k=>M.delete(String(k))};window.__ZEKE_SS={getItem:k=>S.get(String(k))??null,setItem:(k,v)=>S.set(String(k),String(v)),removeItem:k=>S.delete(String(k))};if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(16).slice(2).padEnd(32,'0');</script>"""
def runtime(rel):
 t=(root/rel).read_text();t=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',t);t=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',t);return '<script>'+t+'</script>'
scripts=['version.js','assets/data-layer.js','assets/parser.js','assets/ai-router.js','assets/workflow-engine.js','assets/exercise-guides.js','assets/knowledge-base.js','assets/anatomy-knowledge.js','assets/integrity-engine.js','assets/longitudinal-schema.js','assets/ingestion-engine.js','assets/document-intake.js','assets/calendar-privacy.js','assets/training-intelligence.js','assets/app.js','assets/mobile-native.js','assets/mobile-polish-v0441.js']
seed="""<script>(()=>{const now=new Date(),iso=(d,h=8)=>{const x=new Date(now);x.setDate(x.getDate()+d);x.setHours(h,0,0,0);return x.toISOString()};window.__ZEKE_TEST_SEED__={'health/events.json':[{id:'inj1',category:'injury',timestamp:iso(-10),raw_text:'Right shoulder pain',structured:{name:'Right shoulder pain',body_area:'Shoulder',start_date:iso(-10).slice(0,10),end_date:null,ongoing:true,approximate_date:true,interpretation_status:'confirmed'},provenance:{source:'test'}}],'health/factors.json':[],'health/discoveries.json':[],'system/actions.json':{catalog:[{id:'med1',kind:'medication',label:'Test med',active:true,schedule:{type:'daily'},dose:5,unit:'mg'}],daily_states:{}},'system/conversation.json':[],'system/preferences.json':{},'imports/batches.json':[],'imports/sources.json':{sources:[]},'__calendar':[]};})();</script>"""
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+''.join(runtime(x) for x in scripts[:-3])+'</head><body><div id="root"></div>'+''.join(runtime(x) for x in scripts[-3:])+'</body></html>'
res={}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':390,'height':844});errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.set_content(html,wait_until='load');page.wait_for_timeout(500)
 # Talk compact -> expanded -> close
 page.locator('#globalTalkButton').evaluate('e=>e.click()');page.wait_for_timeout(100)
 compact=page.evaluate("document.body.classList.contains('global-talk-open')&&!document.body.classList.contains('global-talk-expanded')")
 page.locator('#expandConversation').click();expanded=page.evaluate("document.body.classList.contains('global-talk-expanded')")
 page.locator('#globalTalkClose').click();closed=page.evaluate("!document.body.classList.contains('global-talk-open')&&!document.body.classList.contains('global-talk-expanded')")
 # Timeline clickable period editor
 page.locator('[data-route="calendar"]').first.evaluate('e=>e.click()');page.wait_for_timeout(200)
 page.locator('[data-timeline-event="inj1"]').click();page.wait_for_timeout(100)
 period=page.locator('#periodRecordEditModal').count()==1
 ongoing=page.locator('#periodEditOngoing').is_checked() if period else False
 end_disabled=page.locator('#periodEditEnd').is_disabled() if period else False
 if period:
  page.locator('#cancelPeriodRecordEdit').click()
 # Workout proposal -> active -> save -> adapt remaining
 page.locator('[data-route="fitness"]').first.evaluate('e=>e.click()');page.wait_for_timeout(200)
 page.evaluate("""() => { window.ZekeTrainingIntelligence.proposeWorkout=async({sessionContext}={})=>({manual:false,result:sessionContext?.mode==='adapt_remaining'?{session_title:'Adapted',summary:'Adjusted from response',blocks:[{type:'strength',exercise:'Leg Press',variation:'Leg Press Machine',sets:2,reps:'10',load:'90 lb',why:'Reduced remaining volume after the first exercise.'}]}:{session_title:'Test session',summary:'Two exercises',blocks:[{type:'strength',exercise:'Lat Pulldown',variation:'Planet Fitness Machine',sets:2,reps:'10',load:'50 lb',why:'Conservative pull.'},{type:'strength',exercise:'Leg Press',variation:'Leg Press Machine',sets:2,reps:'10',load:'100 lb',why:'Lower-body work.'}]}}); }""")
 page.locator('#fitnessBuildBtn').click();page.locator('#runAdaptiveWorkout').click();page.wait_for_timeout(120)
 proposal=page.locator('#startProposedWorkout').count()==1
 page.locator('#startProposedWorkout').click();page.wait_for_timeout(100)
 active=page.locator('#directWorkoutModal').count()==1 and page.locator('.zeke-workout-item').count()==2
 page.locator('.zeke-workout-item').first.click();page.wait_for_timeout(80)
 # proposed sets should already contain weight/reps
 page.locator('#saveExerciseBtn').click();page.wait_for_timeout(850)
 adapt_visible=page.locator('#adaptRemainingWorkoutBtn').count()==1
 if adapt_visible:
  page.locator('#adaptRemainingWorkoutBtn').click();page.wait_for_timeout(180)
  adapted='90' in page.locator('.zeke-workout-items').inner_text() or 'Reduced remaining volume' in page.locator('.zeke-workout-items').inner_text()
 else:
  adapted=False
 overflow=page.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth+1')
 res={'errors':errs,'talk_compact':compact,'talk_expanded':expanded,'talk_closed':closed,'period_editor':period,'period_ongoing':ongoing,'period_end_disabled':end_disabled,'proposal':proposal,'active_workout':active,'adapt_visible':adapt_visible,'adapted_remaining':adapted,'overflow':overflow}
 b.close()
print(json.dumps(res,indent=2))
assert not res['errors'],res['errors']
assert res['talk_compact'] and res['talk_expanded'] and res['talk_closed']
assert res['period_editor'] and res['period_ongoing'] and res['period_end_disabled']
assert res['proposal'] and res['active_workout'] and res['adapt_visible'] and res['adapted_remaining']
assert not res['overflow']
