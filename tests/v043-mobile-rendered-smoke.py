#!/usr/bin/env python3
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
css=(root/'assets/styles.css').read_text()
seed=r'''<script>
window.__ZEKE_TEST_MODE__=true;
const iso=(d,h=12)=>{const x=new Date();x.setDate(x.getDate()+d);x.setHours(h,0,0,0);return x.toISOString()};
window.__ZEKE_TEST_SEED__={
'health/events.json':[
{id:'bc1',category:'workout',timestamp:iso(-8),structured:{exercise:'Independent Bicep Curl',weight:40,reps:12,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'bc2',category:'workout',timestamp:iso(-1),structured:{exercise:'Dumbell Bicep Curl',weight:20,reps:10,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}}],
'health/factors.json':[],'health/discoveries.json':[],'system/actions.json':{catalog:[],daily_states:{}},'system/conversation.json':[],'system/preferences.json':{},'imports/batches.json':[],'imports/sources.json':{sources:[]},'__calendar':[]};
</script>'''
shim=r'''<script>window.__ZEKE_LS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();window.__ZEKE_SS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();if(!crypto.randomUUID)crypto.randomUUID=()=>('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0'));</script>'''
def runtime(rel):
    text=(root/rel).read_text(); text=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',text); text=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',text)
    return f'<script>{text}</script>'
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+runtime('version.js')+runtime('assets/data-layer.js')+runtime('assets/parser.js')+runtime('assets/ai-router.js')+runtime('assets/workflow-engine.js')+runtime('assets/exercise-guides.js')+runtime('assets/knowledge-base.js')+runtime('assets/integrity-engine.js')+'</head><body><div id="root"></div>'+runtime('assets/app.js')+'</body></html>'
results={}
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844}); page.set_default_timeout(5000); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate("location.hash='#/health/dashboard'"); page.set_content(html,wait_until='load'); page.wait_for_timeout(1400)
    page.locator('#mobileMoreButton').click(); page.wait_for_timeout(100)
    items=page.locator('.sidebar nav .nav-item:visible')
    boxes=[items.nth(i).bounding_box() for i in range(items.count())]
    vertical=all(boxes[i+1]['y']>boxes[i]['y']+boxes[i]['height']*.45 for i in range(len(boxes)-1)) if len(boxes)>1 else False
    xspread=max((b['x'] for b in boxes),default=0)-min((b['x'] for b in boxes),default=0)
    results['navigation']={'visible_items':items.count(),'vertical':vertical,'x_spread':xspread,'page_overflow':page.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth+1')}
    # Close drawer and open Fitness activity detail.
    page.evaluate("document.body.classList.remove('nav-open')"); page.evaluate("location.hash='#/fitness'"); page.wait_for_timeout(900)
    page.locator('#activityLibrarySelect').select_option('all'); page.locator('#activityLibrarySearch').fill('Bicep Curl'); page.wait_for_timeout(120)
    card=page.locator('[data-activity-name="Bicep Curl"]').first; card.click(); page.wait_for_timeout(120)
    page.locator('[data-quick-exercise="Bicep Curl"]').click(); page.wait_for_timeout(180)
    results['exercise_page']={
      'profile':page.locator('.mobile-exercise-page').get_attribute('data-activity-profile'),
      'variation_selector':page.locator('#mobileExerciseVariation').count()==1,
      'create_variation':'+ Create new variation' in page.locator('#mobileExerciseVariation').inner_text().replace('＋','+'),
      'sets':page.locator('.mobile-exercise-set-row').count(),
      'weight_inputs':page.locator('.mobile-set-weight').count(),
      'rep_inputs':page.locator('.mobile-set-reps').count(),
      'effort_inputs':page.locator('.mobile-set-rpe').count(),
      'pain_inputs':page.locator('.mobile-set-pain').count(),
      'coach':page.locator('.mobile-exercise-coach').count()==1,
      'coach_last': 'LAST WORKOUT' in page.locator('.mobile-exercise-coach').inner_text(),
      'coach_why': 'Why this recommendation?' in page.locator('.mobile-exercise-coach').inner_text(),
      'form_guide':page.locator('.mobile-exercise-form').count()==1,
      'dialog_overflow':page.locator('.mobile-exercise-page').evaluate('(el)=>el.scrollWidth>el.clientWidth+1'),
      'errors':errors,
    }
    browser.close()
print(json.dumps(results,indent=2))
assert not errors,errors
assert results['navigation']['visible_items']>=5 and results['navigation']['vertical'] and results['navigation']['x_spread']<8 and not results['navigation']['page_overflow'],results['navigation']
e=results['exercise_page']
assert e['profile']=='strength' and e['variation_selector'] and e['create_variation'] and e['sets']>=1
assert e['weight_inputs']==e['sets']==e['rep_inputs']==e['effort_inputs']==e['pain_inputs']
assert e['coach'] and e['coach_last'] and e['coach_why'] and e['form_guide'] and not e['dialog_overflow'],e
