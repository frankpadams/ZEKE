#!/usr/bin/env python3
"""Isolated Chromium smoke test for Settings > Support & Improvement Report download."""
from pathlib import Path
import json, re, tempfile, zipfile
from xml.etree import ElementTree as ET
try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f"SKIP support report browser smoke: Playwright unavailable ({exc})")
    raise SystemExit(0)

root=Path(__file__).resolve().parents[1]
css=(root/'assets/styles.css').read_text()
seed=r"""<script>
window.__ZEKE_TEST_MODE__=true;
window.__ZEKE_TEST_SEED__={
'health/events.json':[
{id:'p1',category:'potential_health_event',timestamp:'2026-07-20T12:00:00Z',raw_text:'Possible fatigue after PT',structured:{summary:'Possible fatigue after PT',tentative_tags:['fatigue'],interpretation_status:'provisional'},provenance:{source:'test'}},
{id:'c1',category:'correction',timestamp:'2026-07-20T13:00:00Z',raw_text:'Corrected test record',structured:{target_event_id:'p1',operation:'test'},provenance:{source:'test'}}],
'health/factors.json':[],'health/discoveries.json':[],'system/actions.json':{catalog:[],daily_states:{}},'system/conversation.json':[],'system/preferences.json':{},'system/ai-exchanges.json':[],'imports/batches.json':[],'imports/sources.json':{sources:[]},'__calendar':[]};
window.__ZEKE_LS.setItem('zeke-runtime-diagnostics-v1',JSON.stringify([{timestamp:'2026-07-20T14:00:00Z',kind:'test-error',message:'Rendered export check',route:'settings'}]));
</script>"""
shim=r"""<script>window.__ZEKE_LS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();window.__ZEKE_SS=(()=>{const m=new Map();return{getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}})();if(!crypto.randomUUID)crypto.randomUUID=()=>('00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0'));</script>"""
def runtime(rel, storage_shim=True):
    text=(root/rel).read_text()
    if storage_shim:
        text=re.sub(r'\blocalStorage\b','window.__ZEKE_LS',text)
        text=re.sub(r'\bsessionStorage\b','window.__ZEKE_SS',text)
    return f'<script>{text}</script>'
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+shim+f'<style>{css}</style>'+seed+runtime('xlsx-bundle.js',False)+runtime('version.js')+runtime('assets/data-layer.js')+runtime('assets/parser.js')+runtime('assets/ai-router.js')+runtime('assets/workflow-engine.js')+'</head><body><div id="root"></div>'+runtime('assets/app.js')+'</body></html>'

with tempfile.TemporaryDirectory() as td, sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    page=browser.new_page(accept_downloads=True,viewport={'width':1440,'height':1000})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate("location.hash='#/settings'")
    page.set_content(html,wait_until='load',timeout=30000)
    page.wait_for_selector('#downloadSupportReport',timeout=15000)
    page.evaluate("""() => { const w=ZekeWorkflowEngine.create({goal:'Rendered report test',source_text:'test message'}); ZekeWorkflowEngine.unresolved({workflow_id:w.id,reason:'Test unresolved interaction',save_status:'not_saved'}); ZekeWorkflowEngine.close(w.id,'not_saved','Test completed without save'); }""")
    page.select_option('#supportPrivacyMode','anonymized')
    page.fill('#supportFromDate','2026-07-01');page.fill('#supportToDate','2026-07-31')
    page.check('#clearAfterSupportExport')
    with page.expect_download(timeout=20000) as info:
        page.click('#downloadSupportReport')
    download=info.value
    out=Path(td)/download.suggested_filename
    download.save_as(str(out));page.wait_for_timeout(500)
    cleared=page.evaluate("""() => ({runtime:window.__ZEKE_LS.getItem('zeke-runtime-diagnostics-v1'),unresolved:ZekeWorkflowEngine.metrics().unresolved_interactions})""")
    browser.close()
    if errors: raise AssertionError(f'page errors: {errors}')
    if cleared['runtime'] is not None or cleared['unresolved']!=0: raise AssertionError(f'clear-after-export did not clear retained logs: {cleared}')
    if not out.exists() or out.stat().st_size<5000: raise AssertionError('support workbook missing or unexpectedly small')
    with zipfile.ZipFile(out) as zf:
        workbook=ET.fromstring(zf.read('xl/workbook.xml'))
        ns={'x':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        names=[x.attrib['name'] for x in workbook.findall('.//x:sheet',ns)]
        expected=['Executive Summary','Technical Errors','Unresolved Interactions','AI Consultation History','User Corrections','UX Feedback','Potential Health Events','Audit History','Conversation Metrics','Workflow History','Developer Notes']
        missing=[name for name in expected if name not in names]
        if missing: raise AssertionError(f'missing workbook tabs: {missing}')
        corpus=' '.join(zf.read(name).decode('utf-8','ignore') for name in zf.namelist() if name.endswith('.xml')).lower()
        if 'anonymized' not in corpus: raise AssertionError('selected privacy mode was not preserved into the workbook')
        for forbidden in ['api_key','access_token','password_value','secret_value']:
            if forbidden in corpus: raise AssertionError(f'credential-like test value leaked: {forbidden}')
    print(json.dumps({'ok':True,'filename':out.name,'bytes':out.stat().st_size,'privacy':'anonymized','logs_cleared':True,'tabs':names},indent=2))
