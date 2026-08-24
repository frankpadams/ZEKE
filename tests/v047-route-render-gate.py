#!/usr/bin/env python3
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
css='\n'.join((root/p).read_text() for p in ['assets/styles.css','assets/mobile-native.css','assets/mobile-polish-v0441.css','assets/desktop-v047.css'])
seed=r'''<script>
window.__ZEKE_TEST_MODE__=true;
const iso=(d,h=12)=>{const x=new Date();x.setDate(x.getDate()+d);x.setHours(h,0,0,0);return x.toISOString()};
window.__ZEKE_TEST_SEED__={
'health/events.json':[
{id:'w0',category:'measurement',timestamp:iso(-60),structured:{metric_id:'weight',value:230.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'w1',category:'measurement',timestamp:iso(-1),structured:{metric_id:'weight',value:219.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'a1',category:'lab',timestamp:iso(-90),structured:{metric_id:'a1c',value:5.7,unit:'%',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'a2',category:'lab',timestamp:iso(-5),structured:{metric_id:'a1c',value:5.6,unit:'%',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'hr1',category:'measurement',timestamp:iso(-1),structured:{metric_id:'resting_hr',value:81,unit:'bpm',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'sl1',category:'sleep',timestamp:iso(-1,8),structured:{metric_id:'sleep_duration',value:5.5,unit:'hr',quality:'good',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'med1',category:'medication',timestamp:iso(-3),structured:{medication_name:'Mounjaro',status:'recorded',dose:15,unit:'mg',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'inj1',category:'injury',timestamp:iso(-100),structured:{label:'Right shoulder injury',body_area:'right shoulder',status:'ongoing',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'pf1',category:'workout',timestamp:iso(-8),structured:{exercise:'Lat Pulldown',exercise_family:'Lat Pulldown',variation_name:'Planet Fitness Machine',weight:60,reps:12,sets:3,rpe:7,pain:0,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'pf2',category:'workout',timestamp:iso(-2),structured:{exercise:'Lat Pulldown',exercise_family:'Lat Pulldown',variation_name:'Cable',weight:45,reps:12,sets:3,rpe:7,pain:1,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'row1',category:'workout',timestamp:iso(-2),structured:{exercise:'Seated Row',exercise_family:'Seated Row',variation_name:'Cable Row',weight:45,reps:12,sets:3,rpe:7,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}}],
'health/factors.json':[
{id:'q1',type:'clarification_question',status:'open',question_key:'duplicate:test',question:'Are these the same event?',why_it_matters:'Avoid duplicate history'},
{id:'g1',type:'goal',status:'active',domain:'fitness',summary:'Build upper body strength',target:200,unit:'lb'}],
'health/discoveries.json':[{id:'disc1',title:'Strength is improving',summary:'Recent pulling sessions show consistent load progression.',status:'open',timestamp:iso(-1)}],
'system/actions.json':{catalog:[{id:'m1',kind:'medication',label:'Mounjaro',active:true,schedule:{type:'weekly',days:[5]},dose:15,unit:'mg'}],daily_states:{}},
'system/conversation.json':[{id:'m1',role:'user',text:'My shoulder is improving with PT.',at:iso(-1)}],
'system/preferences.json':{user_profile:{preferred_name:'Frank'}},
'imports/batches.json':[],'imports/sources.json':{sources:[]},
'__calendar':[{id:'c1',title:'Allergy shot',start:iso(4,8),location:'Norwood'},{id:'c2',title:'Dinner',start:iso(5,18),location:'Restaurant'}]};
</script>'''
shim=r'''<script>window.__ZEKE_LS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();window.__ZEKE_SS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();if(!crypto.randomUUID)crypto.randomUUID=()=>('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0'));</script>'''
def runtime(rel):
    text=(root/rel).read_text(); text=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',text); text=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',text)
    return f'<script>{text}</script>'
scripts=['version.js','assets/data-layer.js','assets/parser.js','assets/ai-router.js','assets/workflow-engine.js','assets/exercise-guides.js','assets/knowledge-base.js','assets/anatomy-knowledge.js','assets/integrity-engine.js','assets/longitudinal-schema.js','assets/ingestion-engine.js','assets/document-intake.js','assets/calendar-privacy.js','assets/training-intelligence.js','assets/app.js','assets/mobile-native.js','assets/mobile-polish-v0441.js']
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+''.join(runtime(x) for x in scripts[:-3])+'</head><body><div id="root"></div>'+''.join(runtime(x) for x in scripts[-3:])+'</body></html>'
routes=['dashboard','health','fitness','calendar','insights','documents','questions','settings']
results={}
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(1440,900),(390,844)]:
        for route in routes:
            page=browser.new_page(viewport={'width':width,'height':height});errors=[];page.on('pageerror',lambda e,errs=errors:errs.append(str(e)));page.set_default_timeout(6000)
            page.evaluate(f"location.hash='#/{'health/dashboard' if route=='dashboard' else route}'")
            page.set_content(html,wait_until='load');page.wait_for_timeout(1500)
            key=f'{width}-{route}';root_text=page.locator('#root').inner_text();
            visible_bad_svg=page.evaluate('''()=>[...document.querySelectorAll('svg')].filter(s=>{const r=s.getBoundingClientRect(),cs=getComputedStyle(s);return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>innerWidth*.72&&r.height>innerHeight*.45}).length''')
            results[key]={
              'errors':errors,
              'overflow_x':page.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth+1'),
              'text_length':len(root_text),
              'bad_svg':visible_bad_svg,
              'body_class':page.evaluate('document.body.className'),
              'route':page.evaluate("location.hash"),
              'doc_height':page.evaluate('document.documentElement.scrollHeight')
            }
            # At mobile widths, inspect viewport state rather than full-page transformed offscreen sheets.
            page.screenshot(path=f'/mnt/data/v047-{route}-{width}.png',full_page=(width>=1000))
            page.close()
    browser.close()
print(json.dumps(results,indent=2))
for key,row in results.items():
    assert not row['errors'],(key,row['errors'])
    assert not row['overflow_x'],(key,'horizontal overflow')
    assert row['text_length']>120,(key,'unexpectedly empty',row['text_length'])
    assert row['bad_svg']==0,(key,'oversized visible SVG')
# Routing regression: Documents must stay Documents rather than falling back to Dashboard.
assert results['1440-documents']['route']=='#/documents',results['1440-documents']
