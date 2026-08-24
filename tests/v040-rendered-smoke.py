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
{id:'w1',category:'measurement',timestamp:iso(-14),structured:{metric_id:'weight',value:221,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'w2',category:'measurement',timestamp:iso(-1),structured:{metric_id:'weight',value:219,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'dup1',category:'measurement',timestamp:iso(-1),structured:{metric_id:'body_fat',value:36.3,unit:'%',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
{id:'dup2',category:'measurement',timestamp:iso(-1),structured:{metric_id:'body_fat',value:36.3,unit:'%',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
{id:'sleepbad',category:'sleep',timestamp:iso(-1,8),structured:{metric_id:'sleep_duration',value:20,unit:'hr',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
{id:'sleepgood',category:'sleep',timestamp:iso(-1,9),structured:{metric_id:'sleep_duration',value:8,unit:'hr',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
{id:'legend',category:'medication',timestamp:iso(-40),raw_text:'Intervention: tirzepatide: If row is colored blue, dose was administered that day.',structured:{medication_name:'mounjaro',status:'mentioned',interpretation_status:'confirmed'},provenance:{source:'import',file:'SJN1.xlsx'}},
{id:'k1',category:'workout',timestamp:iso(-2),structured:{exercise:'Kayaking',steps:7,average_hr:0,duration_min:120,activity_profile:'sport',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
{id:'r1',category:'workout',timestamp:iso(-9),structured:{exercise:'Seated Cable Row',weight:40,reps:12,sets:2,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'r2',category:'workout',timestamp:iso(-2),structured:{exercise:'Seated Cable Row',weight:45,reps:12,sets:2,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'lp1',category:'workout',timestamp:iso(-8),structured:{exercise:'Lat Pulldown',weight:60,reps:15,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'lp2',category:'workout',timestamp:iso(-1),structured:{exercise:'Lat Pulldown',weight:65,reps:15,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}}],
'health/factors.json':[{id:'q1',type:'clarification_question',status:'open',question_key:'med_schedule:mounjaro',question:'How often is Mounjaro taken?',why_it_matters:'Schedule'}],
'health/discoveries.json':[{id:'disc1',title:'Exercise data are insufficient',text:'Only two workout events are present.',status:'open',timestamp:iso(-30)}],
'system/actions.json':{catalog:[{id:'med-tirzepatide',kind:'medication',label:'Mounjaro',active:true,schedule:{type:'weekly',days:[5]},dose:15,unit:'mg'}],daily_states:{}},
'system/conversation.json':[],'system/preferences.json':{},'imports/batches.json':[],'imports/sources.json':{sources:[]},'__calendar':[]};
</script>'''
shim=r'''<script>window.__ZEKE_LS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();window.__ZEKE_SS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();if(!crypto.randomUUID)crypto.randomUUID=()=>('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0'));</script>'''
def runtime(rel):
    text=(root/rel).read_text()
    text=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',text);text=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',text)
    return f'<script>{text}</script>'
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+runtime('version.js')+runtime('assets/data-layer.js')+runtime('assets/parser.js')+runtime('assets/ai-router.js')+runtime('assets/workflow-engine.js')+runtime('assets/exercise-guides.js')+runtime('assets/knowledge-base.js')+runtime('assets/integrity-engine.js')+'</head><body><div id="root"></div>'+runtime('assets/app.js')+'</body></html>'
results={}
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for route,viewport in [('health/dashboard',{'width':1400,'height':1000}),('fitness',{'width':1400,'height':1000}),('data-integrity',{'width':1400,'height':1000}),('health/dashboard',{'width':390,'height':844})]:
        key=('mobile_' if viewport['width']<500 else '')+route.replace('/','_')
        page=browser.new_page(viewport=viewport);page.set_default_timeout(5000);errors=[];page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
        page.evaluate(f"location.hash='#/{route}'");page.set_content(html,wait_until='load');page.wait_for_timeout(2200)
        text=page.locator('#root').inner_text()
        rec={'errors':errors,'text_length':len(text),'horizontal_overflow':page.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth+1')}
        if route=='health/dashboard':
            rec.update({'dashboard_v3':page.locator('.dashboard-v47, .dashboard-v46, .dashboard-v3').count()==1,'story_cards':page.locator('.story-card').count(),'weekly_plan':page.locator('.weekly-plan-card').count()==1,'review_card':page.locator('.review-status-card').count()==1,'mobile_log_label':page.locator('#mobileLogButton').inner_text() if page.locator('#mobileLogButton').count() else ''})
        if route=='fitness':
            page.locator('#activityLibrarySelect').select_option('all');page.wait_for_timeout(180)
            rec.update({'catalog_cards':page.locator('[data-activity-name]').count(),'routines_button':page.locator('#manageRoutinesBtn').count()>=1})
            page.locator('#activityLibrarySearch').fill('Lat Pulldown');page.wait_for_timeout(180)
            page.locator('[data-activity-name="Lat Pulldown"]').first.click(timeout=5000);page.wait_for_timeout(180)
            guide=page.locator('[data-form-guide="Lat Pulldown"]').first
            if guide.count():
                guide.click(timeout=5000);page.wait_for_timeout(250);rec['guide_open']=page.locator('#knowledgeGuideSheet').count()==1;rec['guide_has_targeting']=rec['guide_open'] and ('Mind-muscle / targeting cues' in page.locator('#knowledgeGuideSheet').inner_text());page.locator('#closeKnowledgeGuide').click() if rec['guide_open'] else None;rec['errors_after_guide']=list(errors)
        if route=='data-integrity':
            rec.update({'repair_cards':page.locator('.repair-card').count(),'has_legend':'Spreadsheet legend imported as health data' in text,'has_sleep':'Sleep duration needs confirmation' in text,'has_real_question':'Did this real-world event happen once, or more than once?' in text})
        results[key]=rec;page.close()
    browser.close()
print(json.dumps(results,indent=2))
for key,row in results.items():
    assert not row['errors'],(key,row['errors'])
    assert row['text_length']>500,(key,row['text_length'])
    assert not row['horizontal_overflow'],(key,'horizontal overflow')
assert results['health_dashboard']['dashboard_v3'] and results['health_dashboard']['story_cards']==0 and results['health_dashboard']['weekly_plan']
assert results['mobile_health_dashboard']['mobile_log_label'].replace('\n',' ').strip().endswith('Log')
assert results['fitness']['catalog_cards']>=50 and results['fitness'].get('guide_open') and results['fitness'].get('guide_has_targeting')
assert results['data-integrity']['repair_cards']>=4 and results['data-integrity']['has_legend'] and results['data-integrity']['has_sleep'] and results['data-integrity']['has_real_question']
