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
seed="""<script>(()=>{const now=new Date(),iso=(d,h=8)=>{const x=new Date(now);x.setDate(x.getDate()+d);x.setHours(h,0,0,0);return x.toISOString()};const sleep=[];for(let i=1;i<=70;i++)sleep.push({id:'s'+i,category:'sleep',timestamp:iso(-i),structured:{metric_id:'sleep_duration',value:i<=30?6.75:i<=60?6.2:6.4,unit:'hr',interpretation_status:'confirmed'},provenance:{source:'test'}});window.__ZEKE_TEST_SEED__={'health/events.json':[...sleep,{id:'w1',category:'workout',timestamp:iso(-2,18),structured:{exercise:'Lat Pulldown',variation_name:'Planet Fitness Machine',weight:60,reps:12,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},{id:'i1',category:'injury',timestamp:iso(-20),raw_text:'Right shoulder pain',structured:{body_area:'Shoulder',status:'ongoing',interpretation_status:'confirmed'},provenance:{source:'test'}}],'health/factors.json':[],'health/discoveries.json':[],'system/actions.json':{catalog:[],daily_states:{}},'system/conversation.json':[],'system/preferences.json':{},'imports/batches.json':[],'imports/sources.json':{sources:[]},'__calendar':[]};})();</script>"""
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+''.join(runtime(x) for x in scripts[:-3])+'</head><body><div id="root"></div>'+''.join(runtime(x) for x in scripts[-3:])+'</body></html>'
res={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in [390,1280]:
        page=b.new_page(viewport={'width':width,'height':900});errs=[];page.on('pageerror',lambda e,errs=errs:errs.append(str(e)));page.set_content(html,wait_until='load');page.wait_for_timeout(500)
        page.locator('[data-route=\"calendar\"]').first.evaluate('e=>e.click()');page.wait_for_timeout(350)
        scales=page.locator('[data-timeline-scale]').all_text_contents();timeline_title='Timeline' if page.locator('h1',has_text='Timeline').count() else '';overflow=page.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth+1')
        page.locator('[data-timeline-scale="month"]').click();page.wait_for_timeout(100);month_active=page.locator('[data-timeline-scale="month"]').get_attribute('aria-pressed')
        page.locator('[data-route=\"health\"]').first.evaluate('e=>e.click()');page.wait_for_timeout(250)
        page.locator('[data-open-metric-detail=\"sleep_duration\"]').first.evaluate('e=>e.click()');page.wait_for_timeout(100)
        sleep_text=page.locator('#metricDetailOverlay').inner_text()
        res[str(width)]={'errors':errs,'overflow':overflow,'scales':scales,'timeline_title':timeline_title,'month_active':month_active,'sleep_period_language':('last 30 days' in sleep_text.lower() or 'this week' in sleep_text.lower())}
        page.close()
    b.close()
print(json.dumps(res,indent=2))
for w,r in res.items():
    assert not r['errors'],(w,r['errors']);assert not r['overflow'],(w,'overflow');assert r['scales']==['Day','Week','Month','Year'],(w,r['scales']);assert r['timeline_title']=='Timeline';assert r['month_active']=='true';assert r['sleep_period_language'],(w,'sleep period comparison not rendered')
