#!/usr/bin/env python3
from pathlib import Path
import tempfile, shutil, subprocess, json
src=Path(__file__).resolve().parents[1]

def run_case(name, mutate):
    with tempfile.TemporaryDirectory() as td:
        dst=Path(td)/'pkg'; shutil.copytree(src,dst)
        mutate(dst)
        cp=subprocess.run(['python',str(dst/'tools/project_audit.py'),'--root',str(dst)],capture_output=True,text=True)
        if cp.returncode==0:
            raise SystemExit(f'negative control failed to detect {name}\n{cp.stdout}')
        print('PASS negative control:',name)

def stale_version(d):
    p=d/'DEVELOPMENT_MEMORY/RELEASE_GATE.md'; j=json.loads((d/'DEVELOPMENT_MEMORY/PROJECT_STATE.json').read_text()); p.write_text(p.read_text().replace(j['current_version'],'0.0.0'))
def scope_mismatch(d):
    p=d/'DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json'; j=json.loads(p.read_text()); j['current_iteration']['approved_scope'].append('Unauthorized adjacent redesign'); p.write_text(json.dumps(j,indent=2))
def constitution_conflict(d):
    p=d/'ZEKE_CONSTITUTION.md'; p.write_text(p.read_text()+'\n## 99. Ask and Tell are different\n')
def wrong_count(d):
    p=d/'DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json'; j=json.loads(p.read_text()); j['current_iteration']['unpacked_file_count']=1; p.write_text(json.dumps(j,indent=2))
def broken_link(d):
    p=d/'HANDOFF_BRIEF.md'; p.write_text(p.read_text()+'\n[broken](missing-file.md)\n')
def stale_registry_header(d):
    p=d/'DEVELOPMENT_SYSTEM/ARTIFACT_REGISTRY.json'; j=json.loads(p.read_text()); j['release']='0.20.5'; p.write_text(json.dumps(j,indent=2))
def stale_project_health(d):
    p=d/'DEVELOPMENT_SYSTEM/PROJECT_HEALTH.md'; p.write_text(p.read_text().replace('# Project Health — v0.22.1','# Project Health — v0.20.5'))
def contradictory_release_gate(d):
    p=d/'DEVELOPMENT_MEMORY/RELEASE_GATE.md'; p.write_text(p.read_text().replace('Package verification complete; environment verification outstanding','Pending final verification'))
def wrong_iteration_lifecycle(d):
    p=d/'DEVELOPMENT_SYSTEM/ARTIFACT_REGISTRY.json'; j=json.loads(p.read_text());
    for a in j['artifacts']:
        if a.get('path')=='DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.22.0.md': a['status']='authoritative'
    p.write_text(json.dumps(j,indent=2))
for n,m in [('stale version',stale_version),('scope mismatch',scope_mismatch),('constitutional conflict',constitution_conflict),('wrong file count',wrong_count),('broken link',broken_link),('stale registry header',stale_registry_header),('stale Project Health identity',stale_project_health),('contradictory release gate',contradictory_release_gate),('wrong current iteration lifecycle',wrong_iteration_lifecycle)]: run_case(n,m)
print('All governance negative controls passed.')
