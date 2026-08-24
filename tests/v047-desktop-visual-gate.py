#!/usr/bin/env python3
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
css=(root/'assets/styles.css').read_text()+"\n"+(root/'assets/mobile-native.css').read_text()+"\n"+(root/'assets/mobile-polish-v0441.css').read_text()+"\n"+(root/'assets/desktop-v047.css').read_text()
seed=r'''<script>
window.__ZEKE_TEST_MODE__=true;
const iso=(d,h=12)=>{const x=new Date();x.setDate(x.getDate()+d);x.setHours(h,0,0,0);return x.toISOString()};
window.__ZEKE_TEST_SEED__={
'health/events.json':[
{id:'w0',category:'measurement',timestamp:iso(-90),structured:{metric_id:'weight',value:250.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'w1',category:'measurement',timestamp:iso(-30),structured:{metric_id:'weight',value:224.2,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'w2',category:'measurement',timestamp:iso(-1),structured:{metric_id:'weight',value:219.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'a1',category:'lab',timestamp:iso(-90),structured:{metric_id:'a1c',value:5.7,unit:'%',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'a2',category:'lab',timestamp:iso(-5),structured:{metric_id:'a1c',value:5.6,unit:'%',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'hr1',category:'measurement',timestamp:iso(-14),structured:{metric_id:'resting_hr',value:84,unit:'bpm',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'hr2',category:'measurement',timestamp:iso(-1),structured:{metric_id:'resting_hr',value:81,unit:'bpm',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'sl1',category:'sleep',timestamp:iso(-14,8),structured:{metric_id:'sleep_duration',value:5.0,unit:'hr',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'sl2',category:'sleep',timestamp:iso(-1,8),structured:{metric_id:'sleep_duration',value:5.5,unit:'hr',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'med1',category:'medication',timestamp:iso(-3),structured:{medication_name:'Mounjaro',status:'recorded',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'pf1',category:'workout',timestamp:iso(-8),structured:{exercise:'Lat Pulldown',exercise_family:'Lat Pulldown',variation_name:'Planet Fitness Machine',weight:60,reps:12,sets:3,rpe:7,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'pf2',category:'workout',timestamp:iso(-2),structured:{exercise:'Seated Row',exercise_family:'Seated Row',variation_name:'Cable Row',weight:45,reps:12,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}}],
'health/factors.json':[
{id:'q1',type:'clarification_question',status:'open',question_key:'duplicate:test',question:'Are these the same event?',why_it_matters:'Avoid duplicate history'},
{id:'g1',type:'goal',status:'active',domain:'fitness',summary:'Build upper body strength',target:200,unit:'lb'}],
'health/discoveries.json':[{id:'disc1',title:'Strength is improving',summary:'Your recent pulling sessions show consistent load progression.',status:'open',timestamp:iso(-1)}],
'system/actions.json':{catalog:[],daily_states:{}},'system/conversation.json':[],'system/preferences.json':{user_profile:{preferred_name:'Frank'}},'imports/batches.json':[],'imports/sources.json':{sources:[]},
'__calendar':[
{id:'c1',title:'Allergy shot',start:iso(4,8),location:'Norwood'},
{id:'c2',title:'Dinner',start:iso(5,18),location:'Restaurant'},
{id:'c3',title:'Physical therapy follow-up',start:iso(7,15),location:'Norwood'}]};
</script>'''
shim=r'''<script>window.__ZEKE_LS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();window.__ZEKE_SS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();if(!crypto.randomUUID)crypto.randomUUID=()=>('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0'));</script>'''
def runtime(rel):
    text=(root/rel).read_text();text=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',text);text=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',text)
    return f'<script>{text}</script>'
scripts=['version.js','assets/data-layer.js','assets/parser.js','assets/ai-router.js','assets/workflow-engine.js','assets/exercise-guides.js','assets/knowledge-base.js','assets/anatomy-knowledge.js','assets/integrity-engine.js','assets/longitudinal-schema.js','assets/ingestion-engine.js','assets/document-intake.js','assets/calendar-privacy.js','assets/training-intelligence.js','assets/app.js','assets/mobile-native.js','assets/mobile-polish-v0441.js']
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+''.join(runtime(x) for x in scripts[:-3])+'</head><body><div id="root"></div>'+''.join(runtime(x) for x in scripts[-3:])+'</body></html>'
results={}
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(1024,820),(1280,900),(1440,900),(1600,1000),(390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height});errors=[];page.on('pageerror',lambda e,errs=errors:errs.append(str(e)));page.set_default_timeout(5000)
        page.evaluate("location.hash='#/dashboard'");page.set_content(html,wait_until='load');page.wait_for_timeout(1800)
        key=str(width); path=f'/mnt/data/v047-dashboard-{width}.png';page.screenshot(path=path,full_page=True)
        rec={'errors':errors,'overflow_x':page.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth+1'),'doc_height':page.evaluate('document.documentElement.scrollHeight'),'screenshot':path}
        if width>=1000:
            sel=['.v47-status','.v47-next','.v47-quick','.v47-recent','.v47-insights','.v47-health','.v47-timeline','.v47-goals']
            rec['boxes']={s:page.locator(s).bounding_box() for s in sel}
            rec['svg_max']=page.evaluate("Math.max(...[...document.querySelectorAll('.v47-icon-svg')].map(x=>Math.max(x.getBoundingClientRect().width,x.getBoundingClientRect().height)),0)")
            rec['first_view_bottom']=max(rec['boxes'][s]['y']+rec['boxes'][s]['height'] for s in ['.v47-status','.v47-next','.v47-quick','.v47-recent','.v47-insights','.v47-health'])
            # geometry contracts
            top=[rec['boxes'][s] for s in ['.v47-status','.v47-next','.v47-quick']]; main=[rec['boxes'][s] for s in ['.v47-recent','.v47-insights','.v47-health']]
            rec['top_y_spread']=max(b['y'] for b in top)-min(b['y'] for b in top);rec['main_y_spread']=max(b['y'] for b in main)-min(b['y'] for b in main)
            gaps=[top[1]['x']-(top[0]['x']+top[0]['width']),top[2]['x']-(top[1]['x']+top[1]['width']),main[1]['x']-(main[0]['x']+main[0]['width']),main[2]['x']-(main[1]['x']+main[1]['width'])]
            rec['gaps']=gaps;rec['gap_spread']=max(gaps)-min(gaps)
        results[key]=rec;page.close()
    browser.close()
print(json.dumps(results,indent=2))
for k,r in results.items():
    assert not r['errors'],(k,r['errors']); assert not r['overflow_x'],(k,'horizontal overflow')
    if int(k)>=1000:
        assert r['svg_max']<=50,(k,'oversized svg',r['svg_max'])
        if int(k)>=1200:
            assert r['top_y_spread']<2 and r['main_y_spread']<2,(k,'row misalignment')
            assert r['gap_spread']<2,(k,'irregular grid gaps',r['gaps'])
        assert r['doc_height']<1800,(k,'dashboard too tall',r['doc_height'])
