#!/usr/bin/env python3
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
css='\n'.join((root/p).read_text() for p in ['assets/styles.css','assets/mobile-native.css','assets/mobile-polish-v0441.css','assets/desktop-v047.css'])
shim=r'''<script>window.__ZEKE_LS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();window.__ZEKE_SS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();if(!crypto.randomUUID)crypto.randomUUID=()=>('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0'));</script>'''
def runtime(rel):
    text=(root/rel).read_text();text=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',text);text=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',text);return f'<script>{text}</script>'
scripts=['version.js','assets/data-layer.js','assets/parser.js','assets/ai-router.js','assets/workflow-engine.js','assets/exercise-guides.js','assets/knowledge-base.js','assets/anatomy-knowledge.js','assets/integrity-engine.js','assets/longitudinal-schema.js','assets/ingestion-engine.js','assets/document-intake.js','assets/calendar-privacy.js','assets/training-intelligence.js','assets/app.js','assets/mobile-native.js','assets/mobile-polish-v0441.js']
def seed(variant):
    return f'''<script>window.__ZEKE_TEST_MODE__=true;const iso=(d,h=12)=>{{const x=new Date();x.setDate(x.getDate()+d);x.setHours(h,0,0,0);return x.toISOString()}};let ev=[
{{id:'w1',category:'measurement',timestamp:iso(-1),structured:{{metric_id:'weight',value:219.6,unit:'lb',interpretation_status:'confirmed'}},provenance:{{source:'test'}}}},
{{id:'hr1',category:'measurement',timestamp:iso(-1),structured:{{metric_id:'resting_hr',value:81,unit:'bpm',interpretation_status:'confirmed'}},provenance:{{source:'test'}}}},
{{id:'sl1',category:'sleep',timestamp:iso(-1,8),structured:{{metric_id:'sleep_duration',value:5.5,unit:'hr',interpretation_status:'confirmed'}},provenance:{{source:'test'}}}},
{{id:'a1',category:'lab',timestamp:iso(-3),structured:{{metric_id:'a1c',value:5.6,unit:'%',interpretation_status:'confirmed'}},provenance:{{source:'test'}}}},
{{id:'x1',category:'workout',timestamp:iso(-2),structured:{{exercise:'Lat Pulldown',variation_name:'Planet Fitness Machine',weight:60,reps:12,sets:3,activity_profile:'strength',interpretation_status:'confirmed'}},provenance:{{source:'test'}}}}];
let factors=[{{id:'g1',type:'goal',status:'active',summary:'Build upper body strength',target:200,unit:'lb'}}],disc=[{{id:'d1',title:'Strength is improving',summary:'Recent pulling sessions show consistent load progression.',status:'open'}}],cal=[{{id:'c1',title:'Allergy shot',start:iso(4,8)}},{{id:'c2',title:'Dinner',start:iso(5,18)}}];
const variant={json.dumps(variant)};
if(variant==='sparse'){{ev=[ev[1]];factors=[];disc=[];cal=[];}}
if(variant==='dense'){{for(let i=0;i<40;i++)ev.push({{id:'dense'+i,category:i%3===0?'workout':'measurement',timestamp:iso(-i%18),structured:i%3===0?{{exercise:'Exercise '+i,variation_name:'Machine '+i,weight:40+i,reps:10,sets:3,activity_profile:'strength',interpretation_status:'confirmed'}}:{{metric_id:i%2?'weight':'resting_hr',value:i%2?220+i/10:70+i%15,unit:i%2?'lb':'bpm',interpretation_status:'confirmed'}},provenance:{{source:'test'}}}});for(let i=0;i<12;i++)cal.push({{id:'dc'+i,title:'Calendar item '+i,start:iso(i+1,8+i%10)}});for(let i=0;i<6;i++)factors.push({{id:'q'+i,type:'clarification_question',status:'open',question_key:'q'+i,question:'Question '+i}});for(let i=0;i<5;i++)factors.push({{id:'gg'+i,type:'goal',status:'active',summary:'Goal '+i,target:100+i,unit:'units'}});for(let i=0;i<8;i++)disc.push({{id:'dd'+i,title:'Insight '+i,summary:'Evidence-supported insight '+i,status:'open'}});}}
if(variant==='long'){{cal=[{{id:'lc1',title:'Extremely long calendar title about a multi-part specialist appointment with additional context that must never widen the dashboard',start:iso(2,8)}},{{id:'lc2',title:'Another unusually verbose upcoming event name with location and preparation details that should truncate cleanly',start:iso(3,14)}}];ev.push({{id:'longwork',category:'workout',timestamp:iso(0),structured:{{exercise:'Single Arm Neutral Grip Cable Lat Pulldown With Deliberately Very Long Variation Description',variation_name:'Planet Fitness Norwood Machine Station With Long Equipment Context',weight:60,reps:12,sets:3,activity_profile:'strength',interpretation_status:'confirmed'}},provenance:{{source:'test'}}}});disc=[{{id:'ld',title:'This is a deliberately long ZEKE insight headline that should remain contained inside its card without altering the page grid',summary:'This deliberately verbose explanation tests that evidence and rationale stay readable and contained without stretching the shared spatial system or creating accidental whitespace.',status:'open'}}];}}
window.__ZEKE_TEST_SEED__={{'health/events.json':ev,'health/factors.json':factors,'health/discoveries.json':disc,'system/actions.json':{{catalog:[],daily_states:{{}}}},'system/conversation.json':[],'system/preferences.json':{{user_profile:{{preferred_name:'Frank'}}}},'imports/batches.json':[],'imports/sources.json':{{sources:[]}},'__calendar':cal}};</script>'''
def html(variant): return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed(variant)+''.join(runtime(x) for x in scripts[:-3])+'</head><body><div id="root"></div>'+''.join(runtime(x) for x in scripts[-3:])+'</body></html>'
results={}
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for variant in ['sparse','normal','dense','long']:
      for width,height in [(1440,900),(1024,820)]:
        page=browser.new_page(viewport={'width':width,'height':height});errors=[];page.on('pageerror',lambda e,errs=errors:errs.append(str(e)));page.evaluate("location.hash='#/health/dashboard'");page.set_content(html(variant),wait_until='load');page.wait_for_timeout(1300)
        boxes={s:page.locator(s).bounding_box() for s in ['.v47-status','.v47-next','.v47-quick','.v47-recent','.v47-insights','.v47-health','.v47-timeline','.v47-goals']}
        rec={'errors':errors,'overflow':page.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth+1'),'height':page.evaluate('document.documentElement.scrollHeight'),'boxes':boxes,'svg_max':page.evaluate("Math.max(...[...document.querySelectorAll('.v47-icon-svg')].map(x=>Math.max(x.getBoundingClientRect().width,x.getBoundingClientRect().height)),0)"),'next_count':page.locator('.v47-next-list>button').count(),'recent_count':page.locator('.v47-recent-row').count(),'insight_count':page.locator('.v47-insight-row').count(),'goal_count':page.locator('.v47-goal-list>button').count()}
        path=f'/mnt/data/v047-adversarial-{variant}-{width}.png';page.screenshot(path=path,full_page=True);rec['screenshot']=path;results[f'{variant}-{width}']=rec;page.close()
    browser.close()
print(json.dumps(results,indent=2))
for key,r in results.items():
    assert not r['errors'],(key,r['errors']);assert not r['overflow'],(key,'overflow');assert r['svg_max']<=24.1,(key,r['svg_max'])
    assert r['recent_count']<=5 and r['insight_count']<=3 and r['goal_count']<=3,(key,'unbounded dashboard content')
    assert r['next_count']<=3,(key,'unbounded upcoming')
    if key.endswith('-1440'):
      assert r['height']<1300,(key,'excessive dashboard height',r['height'])
      top=[r['boxes'][x] for x in ['.v47-status','.v47-next','.v47-quick']];mid=[r['boxes'][x] for x in ['.v47-recent','.v47-insights','.v47-health']]
      assert max(b['y'] for b in top)-min(b['y'] for b in top)<2,(key,'top alignment')
      assert max(b['y'] for b in mid)-min(b['y'] for b in mid)<2,(key,'middle alignment')
      assert max(b['y']+b['height'] for b in mid)<820,(key,'core briefing not visible in first screen')
