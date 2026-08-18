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
{id:'w0',category:'measurement',timestamp:iso(-90),structured:{metric_id:'weight',value:250.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'w1',category:'measurement',timestamp:iso(-30),structured:{metric_id:'weight',value:224.2,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'w2',category:'measurement',timestamp:iso(-1),structured:{metric_id:'weight',value:219.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'bf1',category:'measurement',timestamp:iso(-30),structured:{metric_id:'body_fat',value:38.2,unit:'%',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'bf2',category:'measurement',timestamp:iso(-1),structured:{metric_id:'body_fat',value:36.3,unit:'%',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'pf1',category:'workout',timestamp:iso(-28),structured:{exercise:'Lat Pulldown',exercise_family:'Lat Pulldown',variation_name:'Planet Fitness — Lat Pulldown Machine',equipment_type:'selectorized machine',load_basis:'displayed_machine_load',weight:60,reps:12,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'bf3',category:'workout',timestamp:iso(-24),structured:{exercise:'Lat Pulldown',exercise_family:'Lat Pulldown',variation_name:'Bowflex Lat Pulldown',equipment_type:'Bowflex',load_basis:'bowflex_resistance_setting',weight:90,reps:10,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'pf2',category:'workout',timestamp:iso(-14),structured:{exercise:'Lat Pulldown',exercise_family:'Lat Pulldown',variation_name:'Planet Fitness — Lat Pulldown Machine',equipment_type:'selectorized machine',load_basis:'displayed_machine_load',weight:70,reps:12,sets:4,set_rpe:[7,7.5,8,8],set_pain:[0,0,1,1],activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'bf4',category:'workout',timestamp:iso(-8),structured:{exercise:'Lat Pulldown',exercise_family:'Lat Pulldown',variation_name:'Bowflex Lat Pulldown',equipment_type:'Bowflex',load_basis:'bowflex_resistance_setting',weight:100,reps:10,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'missing',category:'workout',timestamp:iso(-3),structured:{exercise:'Lat Pulldown',exercise_family:'Lat Pulldown',variation_name:'Machine Lat Pulldown',equipment_type:'selectorized machine',load_basis:'displayed_machine_load',weight:null,reps:12,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'row1',category:'workout',timestamp:iso(-14),structured:{exercise:'Seated Row',exercise_family:'Seated Row',variation_name:'Seated Cable Row',equipment_type:'cable',load_basis:'displayed_machine_load',weight:45,reps:12,sets:3,set_rpe:[6,6.5,7],set_pain:[0,0,0],activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}}
],
'health/factors.json':[],'health/discoveries.json':[],'system/actions.json':{catalog:[],daily_states:{}},'system/conversation.json':[],'system/preferences.json':{},'imports/batches.json':[],'imports/sources.json':{sources:[]},'__calendar':[]};
</script>'''
shim=r'''<script>window.__ZEKE_LS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();window.__ZEKE_SS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();if(!crypto.randomUUID)crypto.randomUUID=()=>('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0'));</script>'''
def runtime(rel):
    text=(root/rel).read_text(); text=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',text); text=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',text)
    return f'<script>{text}</script>'
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+runtime('version.js')+runtime('assets/data-layer.js')+runtime('assets/parser.js')+runtime('assets/ai-router.js')+runtime('assets/workflow-engine.js')+runtime('assets/exercise-guides.js')+runtime('assets/knowledge-base.js')+runtime('assets/integrity-engine.js')+'</head><body><div id="root"></div>'+runtime('assets/app.js')+'</body></html>'

results={'widths':{},'fitness':{},'batch':{}}
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in (320,375,390,430,768):
        page=browser.new_page(viewport={'width':width,'height':844}); page.set_default_timeout(3500); errors=[]; page.on('pageerror',lambda e,errs=errors:errs.append(str(e))); page.evaluate("location.hash='#/dashboard'"); page.set_content(html,wait_until='load'); page.wait_for_timeout(1000)
        route_overflow={}
        for route in ('dashboard','health','fitness','calendar','insights','documents','questions','settings'):
            page.evaluate(f"location.hash='#/{route}'"); page.wait_for_timeout(160)
            route_overflow[route]=page.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth+1')
        page.evaluate("location.hash='#/dashboard'");page.wait_for_timeout(150)
        nav=page.locator('.mobile-bottom-nav')
        nav_boxes=[page.locator('.mobile-nav-item').nth(i).bounding_box() for i in range(page.locator('.mobile-nav-item').count())] if width<=760 else []
        global_talk_display=page.locator('.global-talk-button').evaluate("el=>getComputedStyle(el).display") if page.locator('.global-talk-button').count() else 'missing'
        results['widths'][width]={'route_overflow':route_overflow,'errors':errors,'bottom_nav_items':len(nav_boxes),'bottom_nav_y_spread':(max(b['y'] for b in nav_boxes)-min(b['y'] for b in nav_boxes)) if nav_boxes else 0,'global_talk_display':global_talk_display}
        if width==390:
            # Navigation drawer width and dashboard screenshot.
            page.locator('#mobileMoreButton').click();page.wait_for_timeout(100)
            drawer_box=page.locator('.sidebar').bounding_box(); results['widths'][width]['drawer_ratio']=drawer_box['width']/width
            page.evaluate("document.body.classList.remove('nav-open')")
            page.screenshot(path='/mnt/data/zeke0431_dashboard_390.png',full_page=True)
            # Fitness logging menu: all three mockup-authoritative entry paths must remain present and usable.
            page.evaluate("location.hash='#/fitness'");page.wait_for_timeout(400)
            page.locator('#fitnessLogBtn').click();page.wait_for_timeout(100)
            log_sheet=page.locator('#fitnessLogMenu .workout-log-sheet')
            results['fitness']['log_menu_labels']=[
              page.locator('#logSingleActivity strong').inner_text(),
              page.locator('#logFromRoutine strong').inner_text(),
              page.locator('#logRepeatLast strong').inner_text(),
            ]
            results['fitness']['log_menu_overflow']=log_sheet.evaluate('(el)=>el.scrollWidth>el.clientWidth+1')
            page.locator('#closeFitnessLog').click();page.wait_for_timeout(80)
            # Fitness canonical chart semantics and screenshot.
            page.locator('#activityLibrarySelect').select_option('all');page.locator('#activityLibrarySearch').fill('Lat Pulldown');page.wait_for_timeout(160)
            card=page.locator('[data-activity-name="Lat Pulldown"]').first
            results['fitness']['series']=card.locator('[data-variation-series]').count()
            results['fitness']['paths']=card.locator('[data-variation-series] path').count()
            results['fitness']['circles']=card.locator('[data-variation-series] circle').count()
            results['fitness']['series_names']=card.locator('[data-variation-series]').evaluate_all("els=>els.map(e=>e.getAttribute('data-variation-series'))")
            results['fitness']['missing_machine_series']='Machine Lat Pulldown' in results['fitness']['series_names']
            results['fitness']['period_inside_library']=page.locator('.fitness-library-panel .fitness-range-select-control').count()==1
            results['fitness']['summary_facts']=card.locator('.fitness-facts').inner_text()
            results['fitness']['duplicate_bowflex_tile']=page.locator('[data-activity-name="Bowflex Lat Pulldown"]').count()
            page.screenshot(path='/mnt/data/zeke0431_fitness_390.png',full_page=True)
            # Batch workout workflow: + Log > Workout > add Seated Cable Row.
            page.locator('#quickLogBtn').click();page.wait_for_timeout(80);page.locator('[data-quick-log="workout"]').click();page.wait_for_timeout(150)
            page.locator('#addExerciseBtn').click();page.wait_for_timeout(60)
            page.locator('[data-common-exercise="Seated Cable Row"]').first.click();page.wait_for_timeout(180)
            v=page.locator('#workoutExerciseVariation'); coach=page.locator('.professional-coach-card'); opt=page.locator('.zeke-optional-details'); datebar=page.locator('.zeke-workout-date')
            vb=v.bounding_box(); cb=coach.bounding_box(); db=datebar.bounding_box(); firstset=page.locator('.workout-set-row').first.bounding_box()
            results['batch']={
              'variation_before_coach':vb['y']<cb['y'],
              'variation_value':v.input_value(),
              'coach_exact_history':'LAST · SAME VARIATION' in coach.inner_text(),
              'optional_has_variation':'Equipment / variation' in opt.inner_text(),
              'per_set_rpe':page.locator('.set-rpe').count(),
              'per_set_pain':page.locator('.set-pain').count(),
              'sets':page.locator('.workout-set-row').count(),
              'progress_svg':page.locator('.professional-progress-card svg').count(),
              'progress_text':page.locator('.professional-progress-card').inner_text(),
              'date_overlaps_first_set':db['y']+db['height']>firstset['y'],
              'screen_overflow':page.locator('.zeke-workout-app').evaluate('(el)=>el.scrollWidth>el.clientWidth+1'),
            }
            page.screenshot(path='/mnt/data/zeke0431_workout_390.png',full_page=True)
        page.close()
    browser.close()

print(json.dumps(results,indent=2))
for width,row in results['widths'].items():
    assert not row['errors'],(width,row['errors'])
    assert not any(row['route_overflow'].values()),(width,row['route_overflow'])
    if width<=760:
        assert row['bottom_nav_items']==5,(width,row)
        assert row['bottom_nav_y_spread']<8,(width,row['bottom_nav_y_spread'])
        assert row['global_talk_display']=='none',(width,row['global_talk_display'])
assert results['widths'][390]['drawer_ratio']<=.82,results['widths'][390]
assert results['fitness']['log_menu_labels']==['Enter one exercise or activity','Start from routine','Repeat last workout'],results['fitness']
assert not results['fitness']['log_menu_overflow'],results['fitness']
assert results['fitness']['series']==2,results['fitness']
assert results['fitness']['paths']==2,results['fitness']
assert results['fitness']['circles']==4,results['fitness']
assert not results['fitness']['missing_machine_series'],results['fitness']
assert results['fitness']['period_inside_library'],results['fitness']
assert 'Latest loaded: 100 lb' in results['fitness']['summary_facts'] and 'Not recorded' not in results['fitness']['summary_facts'],results['fitness']
assert results['fitness']['duplicate_bowflex_tile']==0,results['fitness']
b=results['batch']
assert b['variation_before_coach'] and b['coach_exact_history'] and not b['optional_has_variation'],b
assert b['per_set_rpe']==b['sets']==b['per_set_pain'],b
assert b['progress_svg']==0 and '1 comparable session' in b['progress_text'],b
assert not b['date_overlaps_first_set'] and not b['screen_overflow'],b
