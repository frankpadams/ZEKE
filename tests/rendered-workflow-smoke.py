#!/usr/bin/env python3
"""Isolated Chromium smoke test for ZEKE UI composition and key entry/review affordances."""
from pathlib import Path
import json, re, sys
try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f"SKIP rendered workflow smoke: Playwright unavailable ({exc})")
    raise SystemExit(0)
root=Path(__file__).resolve().parents[1]
css=(root/'assets/styles.css').read_text()
seed=r"""<script>
window.__ZEKE_TEST_MODE__=true;
const now=new Date();const iso=(days,h=12)=>{const d=new Date(now);d.setDate(d.getDate()+days);d.setHours(h,0,0,0);return d.toISOString()};
window.__ZEKE_TEST_SEED__={
'health/events.json':[
{id:'w1',category:'measurement',timestamp:iso(-30),structured:{metric_id:'weight',value:220,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'w2',category:'measurement',timestamp:iso(-1),structured:{metric_id:'weight',value:218.6,unit:'lb',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'s1',category:'sleep',timestamp:iso(-3,8),raw_text:'slept well',structured:{metric_id:'sleep_duration',value:7.5,unit:'hr',start_time:iso(-4,0),end_time:iso(-3,8),sleep_quality:'good',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
{id:'s2',category:'sleep',timestamp:iso(-1,9),raw_text:'sleep',structured:{metric_id:'sleep_duration',value:8.25,unit:'hr',start_time:iso(-2,1),end_time:iso(-1,9),sleep_quality:'fair',interpretation_status:'confirmed'},provenance:{source:'conversation'}},
{id:'r1',category:'workout',timestamp:iso(-7),structured:{exercise:'Seated Row',weight:40,reps:12,sets:3,rpe:7,pain_after:1,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'r2',category:'workout',timestamp:iso(-1),structured:{exercise:'Seated Row',weight:45,reps:12,sets:3,activity_profile:'strength',interpretation_status:'confirmed'},provenance:{source:'test'}},
{id:'p1',category:'potential_health_event',timestamp:iso(-2),raw_text:'I felt unusually tired after PT',structured:{summary:'I felt unusually tired after PT',tentative_tags:['fatigue','pt'],interpretation_status:'provisional',include_in_analysis:true},provenance:{source:'conversation-potential-event'}}],
'health/discoveries.json':[{id:'d1',title:'Exercise parsing opportunity',summary:'A saved discovery is ready to explore.'}],
'health/factors.json':[
{id:'q1',type:'clarification_question',status:'open',priority:'high',question_key:'sleep-review',question:'Should ZEKE save this as a sleep record?',why_it_matters:'This changes the sleep history.',original_text:'I slept from 2am to 10:45am and slept well.',proposed_event:{category:'sleep',structured:{start_time:'2:00 AM',end_time:'10:45 AM',duration:'8 hr 45 min',sleep_quality:'good'}}},
{id:'wf-open',type:'workflow_state',status:'open',summary:'ZEKE conversation workflow',workflow:{id:'wf-open',transaction_id:'tx-open',created_at:'2026-07-20T10:00:00Z',updated_at:'2026-07-20T10:05:00Z',status:'waiting_clarification',goal:'Resolve the sleep review',source_text:'I slept from 2am to 10:45am and slept well.',target:{question_id:'q1',question_key:'sleep-review'},known:{why_it_matters:'This changes the sleep history.'},needed:['user decision or answer'],proposed:null,save_status:'not_saved',duplicate_status:'not_checked',ai_status:'not_needed',available_actions:['Confirm or correct','Later'],history:[{timestamp:'2026-07-20T10:00:00Z',status:'waiting_clarification',note:'Waiting for user'}]}}
],
'system/actions.json':{catalog:[{id:'walk-rosie',kind:'routine',label:'Walk Rosie',active:true,schedule:{type:'weekly',days:[1]},subtitle:'Weekly'}],daily_states:{}},'system/conversation.json':[],'system/preferences.json':{},'imports/batches.json':[],'imports/sources.json':{sources:[]},
'__calendar':[{id:'cal1',title:'PT appointment',start:iso(-1,18),end:iso(-1,19),location:'Physical therapy'}]};
</script>"""
shim=r"""<script>window.__ZEKE_LS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();window.__ZEKE_SS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();const __zekeAdd=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(type,handler,options){if(this instanceof Element){const current=(this.dataset.zekeBoundEvents||'').split(',').filter(Boolean);if(!current.includes(type))current.push(type);this.dataset.zekeBoundEvents=current.join(',');}return __zekeAdd.call(this,type,handler,options)};if(!crypto.randomUUID)crypto.randomUUID=()=>('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0'));</script>"""
def runtime(rel):
    text=(root/rel).read_text()
    text=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',text)
    text=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',text)
    return f'<script>{text}</script>'
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+runtime('version.js')+runtime('assets/data-layer.js')+runtime('assets/parser.js')+runtime('assets/ai-router.js')+runtime('assets/workflow-engine.js')+'</head><body><div id="root"></div>'+runtime('assets/app.js')+'</body></html>'
results={'routes':{},'interactions':{}}
interaction_audit_js=r"""() => {
  const visible=el=>{const style=getComputedStyle(el),rect=el.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0};
  const nodes=[...document.querySelectorAll('button, a[href], [role="button"], label.file-button')].filter(visible);
  const name=el=>(el.getAttribute('aria-label')||el.getAttribute('title')||el.getAttribute('data-tooltip')||el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
  const formBound=el=>{const form=el.closest('form');return Boolean(form&&(typeof form.onsubmit==='function'||(form.dataset.zekeBoundEvents||'').split(',').includes('submit')))};
  const bound=el=>el.matches('a[href]')||el.matches('label.file-button')||typeof el.onclick==='function'||(el.dataset.zekeBoundEvents||'').split(',').includes('click')||(el.matches('button[type="submit"],input[type="submit"]')&&formBound(el));
  const missing_name=nodes.filter(el=>!name(el)||(/^[×+⋯…]$/.test(name(el))&&!el.getAttribute('aria-label')&&!el.getAttribute('title'))).map(el=>({tag:el.tagName,id:el.id||'',class:el.className||'',text:name(el)}));
  const unbound=nodes.filter(el=>!el.disabled&&!bound(el)).map(el=>({tag:el.tagName,id:el.id||'',class:el.className||'',text:name(el),events:el.dataset.zekeBoundEvents||''}));
  return {visible_controls:nodes.length,missing_name,unbound};
}"""
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    for route in ['health/dashboard','fitness','health','questions','insights']:
        page=browser.new_page(viewport={'width':1440,'height':1000});errors=[]
        page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
        page.evaluate(f"location.hash='#/{route}'");page.set_content(html,wait_until='load');page.wait_for_timeout(1800)
        results['routes'][route]={'text':len(page.locator('#root').inner_text()),'errors':errors}
        if route=='health/dashboard':
            results['interactions']['workflow_resume']={'button':page.locator('[data-resume-workflow]').count()>=1}
            page.evaluate("document.querySelector('[data-resume-workflow]').click()");page.wait_for_timeout(120)
            results['interactions']['workflow_resume']['choices']=page.locator('[data-conversation-choice]').count()
        if route=='health':
            page.locator('[data-log-metric="sleep_duration"]').first.click()
            results['interactions']['sleep_log']={x:page.locator('#'+x).count()==1 for x in ['sleepWakeDate','sleepStartTime','sleepEndTime','sleepQuality','sleepInterruptions','metricEntryNotes']}
            page.locator('#closeMetricEntry').click()
            sleep_row=page.locator('tr').filter(has_text='Sleep:').first
            sleep_row.locator('[data-edit-event]').click()
            results['interactions']['sleep_edit']={x:page.locator('#'+x).count()==1 for x in ['editSleepDate','editSleepStart','editSleepEnd','editSleepQuality','editSleepInterruptions']}
        if route=='fitness':
            page.locator('#logWorkoutBtn').click()
            results['interactions']['workout_create']={x:page.locator('.'+x).count()>=1 for x in ['workout-rpe','workout-pain-before','workout-pain-during','workout-pain-after','workout-technique','workout-injury-context']}
        if route=='questions':
            page.locator('[data-review-question]').first.click()
            results['interactions']['review']={'title':page.locator('.review-intro h1').inner_text(),'source':page.locator('.review-source blockquote').inner_text(),'proposal_fields':page.locator('.review-proposal-grid>div').count(),'actions':page.locator('.review-decision-actions button').all_inner_texts()}
            page.locator('#deferReview').click();page.wait_for_timeout(250)
            results['interactions']['review']['preserved_after_later_count']=page.locator('[data-review-question]').count()
            page.locator('[data-memory-tab="learned"]').click();page.wait_for_timeout(150)
            page.locator('[data-memory-edit="action:walk-rosie"]').click();page.wait_for_timeout(100)
            results['interactions']['recurring_action_editor']={'present':page.locator('#recurringActionScheduleModal').count()==1,'save_label':page.locator('#recurringActionScheduleForm button[type="submit"]').inner_text()}
            page.locator('#cancelRecurringActionSchedule').click()
        results['routes'][route]['interaction_audit']=page.evaluate(interaction_audit_js)
        page.close()
    page=browser.new_page(viewport={'width':420,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.evaluate("location.hash='#/health/dashboard'");page.set_content(html,wait_until='load');page.wait_for_timeout(1500);results['routes']['mobile_dashboard']={'text':len(page.locator('#root').inner_text()),'errors':errors,'interaction_audit':page.evaluate(interaction_audit_js)};page.close();browser.close()
print(json.dumps(results,indent=2))
assert all(not x['errors'] and x['text']>500 for x in results['routes'].values())
assert all(not x.get('interaction_audit',{}).get('missing_name') and not x.get('interaction_audit',{}).get('unbound') for key,x in results['routes'].items()), results['routes']
assert results['interactions']['workflow_resume']['button'] and results['interactions']['workflow_resume']['choices']>=1
assert all(results['interactions']['sleep_log'].values())
assert all(results['interactions']['workout_create'].values())
assert all(results['interactions']['sleep_edit'].values())
review=results['interactions']['review'];assert review['title']=='Confirm this sleep entry' and review['source'] and review['proposal_fields']>=1 and review['preserved_after_later_count']>=1 and any(x in review['actions'] for x in ['Answer now','Confirm or correct','Answer this question'])
assert results['interactions']['recurring_action_editor']['present'] and results['interactions']['recurring_action_editor']['save_label']=='Save recurring schedule'
