#!/usr/bin/env python3
from pathlib import Path
import argparse, json, re, sys

parser=argparse.ArgumentParser()
parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
args=parser.parse_args(); root=args.root.resolve()
errors=[]; warnings=[]

def loadj(rel):
    p=root/rel
    if not p.exists(): errors.append(f'missing required JSON: {rel}'); return {}
    try: return json.loads(p.read_text())
    except Exception as e: errors.append(f'invalid JSON {rel}: {e}'); return {}

def text(rel):
    p=root/rel
    if not p.exists(): errors.append(f'missing required file: {rel}'); return ''
    return p.read_text(errors='ignore')

state=loadj('DEVELOPMENT_MEMORY/PROJECT_STATE.json')
gate=loadj('DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json')
registry=loadj('DEVELOPMENT_SYSTEM/ARTIFACT_REGISTRY.json')
rules=loadj('DEVELOPMENT_SYSTEM/GOVERNANCE_RULES.json')
ver=str(state.get('current_version','')); build=str(state.get('current_build',''))
if not ver or not build: errors.append('project state lacks current version/build')

# Identity agreement in current authorities/supporting release docs
identity_files=['VERSION.txt','version.js','README.md','DEVELOPMENT_MEMORY/PROJECT_STATE.json','DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json','DEVELOPMENT_MEMORY/RELEASE_GATE.md',state.get('current_iteration_record',''),f'RELEASE_NOTES_v{ver}.md',f'TEST_REPORT_v{ver}.md']
for rel in [x for x in identity_files if x]:
    t=text(rel)
    if ver not in t: errors.append(f'current version {ver} absent from {rel}')
    if build not in t: errors.append(f'current build {build} absent from {rel}')

# State/gate/rules/registry agreement
for name,obj in [('development gate',gate),('governance rules',rules),('artifact registry',registry)]:
    rv=str(obj.get('current_version',obj.get('release',''))); rb=str(obj.get('current_build',obj.get('build','')))
    if rv!=ver: errors.append(f'{name} version {rv!r} disagrees with {ver}')
    if rb!=build: errors.append(f'{name} build {rb!r} disagrees with {build}')

# Active runtime file coverage
runtime_files=registry.get('runtime_files',[])
required_runtime=['index.html','version.js','assets/app.js','assets/data-layer.js','assets/parser.js','assets/ai-router.js','assets/styles.css']
for rel in required_runtime:
    if rel not in runtime_files: errors.append(f'active runtime file absent from registry: {rel}')
for rel in runtime_files:
    if not (root/rel).is_file(): errors.append(f'missing registered runtime file: {rel}')

# Current iteration and approved scope agreement
iteration=state.get('current_iteration_record','')
itxt=text(iteration)
if f'v{ver}' not in itxt: errors.append('current iteration record identity disagrees with project state')
approved=gate.get('current_iteration',{}).get('approved_scope',[])
if not approved: errors.append('current gate has no approved scope')
for item in approved:
    if item not in itxt: errors.append(f'approved scope item missing from current iteration record: {item}')
if gate.get('current_iteration',{}).get('user_approved_scope') is not True: errors.append('current iteration is not explicitly user-approved')

# Authority registry agreement and lifecycle
registered={a.get('path'):a for a in registry.get('artifacts',[]) if a.get('path')}
state_auth=set(state.get('authoritative_documents',[]))
reg_auth={p for p,a in registered.items() if a.get('status')=='authoritative'}
if state_auth!=reg_auth:
    errors.append(f'authoritative registry mismatch: state-only={sorted(state_auth-reg_auth)}, registry-only={sorted(reg_auth-state_auth)}')
for rel,a in registered.items():
    if not (root/rel).exists(): errors.append(f'missing registered artifact: {rel}')
    if a.get('status') not in {'authoritative','supporting','historical','superseded','rejected','generated'}: errors.append(f'invalid lifecycle status for {rel}')
for rel in registry.get('superseded_entry_files',[]):
    t=text(rel).lower()
    if 'superseded' not in t or '00_ai_start_here.md' not in t: errors.append(f'superseded entry is not a clear redirect: {rel}')


# Current continuity metadata must be internally current, not merely present
project_health=text('DEVELOPMENT_SYSTEM/PROJECT_HEALTH.md')
if f'# Project Health — v{ver}' not in project_health:
    errors.append('Project Health identity is stale or missing current version')
release_gate=text('DEVELOPMENT_MEMORY/RELEASE_GATE.md')
if 'package verification complete' not in release_gate.lower():
    errors.append('release gate does not state package verification completion')
if 'environment verification outstanding' not in release_gate.lower():
    errors.append('release gate does not preserve environment-verification boundary')
if 'pending final verification' in release_gate.lower():
    errors.append('release gate uses ambiguous contradictory pending-final-verification status')
if str(registry.get('release','')) != ver or str(registry.get('current_version','')) != ver:
    errors.append('artifact registry release/current_version fields disagree')
if str(registry.get('build','')) != build or str(registry.get('current_build','')) != build:
    errors.append('artifact registry build/current_build fields disagree')
current_iterations=[p for p,a in registered.items() if p.startswith('DEVELOPMENT_MEMORY/ITERATION_RECORD_v') and a.get('status')=='authoritative']
if current_iterations != [iteration]:
    errors.append(f'current iteration lifecycle mismatch: authoritative iteration records={current_iterations!r}, expected={[iteration]!r}')
for pth,a in registered.items():
    if pth.startswith('DEVELOPMENT_MEMORY/ITERATION_RECORD_v') and pth != iteration and a.get('status')!='historical':
        errors.append(f'prior iteration record is not historical: {pth}')

# Known constitutional supersession
constitution=text('ZEKE_CONSTITUTION.md').lower()
rejected=text('DEVELOPMENT_SYSTEM/REJECTED_AND_SUPERSEDED_PATHS.md').lower()
if 'ask and tell are different' in constitution: errors.append('obsolete separate Ask/Tell constitutional rule remains')
if 'unified **talk to zeke**' not in constitution and 'unified talk to zeke' not in constitution: errors.append('unified Talk to ZEKE rule absent from Constitution')
if 'separate ask and tell inputs' not in rejected or 'superseded' not in rejected: errors.append('Ask/Tell supersession missing from rejected-path record')

# Actual file count (manifest itself excluded from checksum count, but actual package count includes all files)
actual=sum(1 for p in root.rglob('*') if p.is_file())
recorded=gate.get('current_iteration',{}).get('unpacked_file_count')
if recorded!=actual: errors.append(f'gate file count {recorded} disagrees with actual {actual}')

# Markdown links
link_re=re.compile(r'\[[^\]]+\]\((?!https?://|mailto:|#)([^)]+)\)')
for p in root.rglob('*.md'):
    for target in link_re.findall(p.read_text(errors='ignore')):
        target=target.split('#',1)[0]
        if target and not (p.parent/target).resolve().exists(): errors.append(f'broken link: {p.relative_to(root)} -> {target}')

# Unsafe medication alias patterns
for p in root.rglob('*'):
    if p.is_file() and p.suffix.lower() in {'.js','.json','.md','.txt','.html'}:
        low=p.read_text(errors='ignore').lower()
        if "'glp-1','glp1','glp 1'" in low or '`glp-1`,`glp1`,`glp 1`' in low:
            errors.append(f'unsafe GLP-1 medication alias remains: {p.relative_to(root)}')

# Stale current-authority identities and self-authority outside registry
for p in root.rglob('*.md'):
    rel=str(p.relative_to(root)); low=p.read_text(errors='ignore').lower()
    is_historical_iteration = rel.startswith('DEVELOPMENT_MEMORY/ITERATION_RECORD_v') and rel != iteration
    if '**status:** authoritative' in low and rel not in reg_auth and not is_historical_iteration:
        errors.append(f'self-labeled authoritative file absent from registry: {rel}')

# Backlog prerequisite clarity
backlog=text('DEVELOPMENT_MEMORY/BACKLOG.md')
if 'UI-021' in backlog and 'deployed-origin' not in backlog:
    errors.append('UI-021 prerequisite does not define deployed-origin versus isolated evidence')

print(f'ZEKE project audit: version {ver}, build {build}, files {actual}')
for x in warnings: print('WARNING:',x)
for x in errors: print('ERROR:',x)
print(f'Result: {len(errors)} error(s), {len(warnings)} warning(s)')
sys.exit(1 if errors else 0)
