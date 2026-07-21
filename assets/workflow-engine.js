(() => {
  'use strict';

  const STORE_KEY = 'ZEKE_WORKFLOW_ENGINE_V1';
  const MAX_WORKFLOWS = 120;
  const MAX_LOG_ROWS = 600;
  const TERMINAL = new Set(['completed','not_saved','dismissed','superseded','duplicate','failed']);
  let memoryStore = null;
  const now = () => new Date().toISOString();
  const id = () => crypto?.randomUUID?.() || `wf-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const clone = value => structuredClone(value);

  function emptyStore(){
    return {
      schema_version: 1,
      current_workflow_id: null,
      workflows: [],
      logs: {
        technical_errors: [],
        unresolved_interactions: [],
        ai_consultations: [],
        user_corrections: [],
        ux_feedback: [],
        audit_history: []
      }
    };
  }

  function load(){
    if (memoryStore) return clone(memoryStore);
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (!parsed || typeof parsed !== 'object') return emptyStore();
      const base = emptyStore();
      memoryStore = {
        ...base,
        ...parsed,
        workflows: Array.isArray(parsed.workflows) ? parsed.workflows : [],
        logs: Object.fromEntries(Object.keys(base.logs).map(key => [key, Array.isArray(parsed.logs?.[key]) ? parsed.logs[key] : []]))
      };
      return clone(memoryStore);
    } catch { return emptyStore(); }
  }

  function localSafeStore(store){
    const safe=clone(store);
    safe.workflows=(safe.workflows||[]).map(w=>({
      id:w.id,transaction_id:w.transaction_id,created_at:w.created_at,updated_at:w.updated_at,closed_at:w.closed_at||null,
      status:w.status,save_status:w.save_status,duplicate_status:w.duplicate_status,ai_status:w.ai_status,
      goal:'Workflow details stored in the user repository',source_text:'',target:null,known:{},needed:[],proposed:null,
      available_actions:[],outcome:w.outcome?'Outcome details stored in the user repository':'',history:(w.history||[]).map(h=>({timestamp:h.timestamp,status:h.status,note:''}))
    }));
    for(const [kind,rows] of Object.entries(safe.logs||{}))safe.logs[kind]=(rows||[]).map(row=>{
      const out={id:row.id,timestamp:row.timestamp,workflow_id:row.workflow_id||null,status:row.status||'',kind:row.kind||kind,save_status:row.save_status||''};
      if(row.error)out.error='Details stored in the user repository';
      if(row.reason)out.reason='Details stored in the user repository';
      return out;
    });
    return safe;
  }

  function save(store){
    const trimmed = clone(store);
    trimmed.workflows = (trimmed.workflows || []).slice(-MAX_WORKFLOWS);
    for (const key of Object.keys(trimmed.logs || {})) trimmed.logs[key] = (trimmed.logs[key] || []).slice(-MAX_LOG_ROWS);
    memoryStore=clone(trimmed);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(localSafeStore(trimmed))); } catch {}
    return clone(trimmed);
  }

  function hydrate(repositoryWorkflows=[]){
    const store=load(),byId=new Map((store.workflows||[]).map(w=>[w.id,w]));
    for(const workflow of repositoryWorkflows||[]){if(workflow?.id)byId.set(workflow.id,clone(workflow));}
    store.workflows=[...byId.values()].sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0)).slice(-MAX_WORKFLOWS);
    const open=store.workflows.filter(w=>!TERMINAL.has(w.status)).sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0))[0];
    store.current_workflow_id=open?.id||null;save(store);return clone(store);
  }

  function repositoryRecord(workflowId){return get(workflowId);}

  function redactText(text, mode='full'){
    const raw = String(text || '');
    if (mode === 'full') return raw;
    if (mode === 'technical') return raw ? `[content omitted · ${raw.length} characters]` : '';
    return raw
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[email]')
      .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g, '[phone]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[identifier]')
      .replace(/\b(?:Frank|Mounjaro|tirzepatide|atorvastatin|Lipitor)\b/gi, '[personal term]');
  }

  function sanitizeValue(value, mode='full', key=''){
    if (value == null) return value;
    if (typeof value === 'string') {
      if (/key|secret|token|authorization|credential|password/i.test(key)) return '[excluded]';
      return redactText(value, mode);
    }
    if (Array.isArray(value)) return value.map(v => sanitizeValue(v, mode, key));
    if (typeof value === 'object') {
      const out = {};
      for (const [k,v] of Object.entries(value)) {
        if (/api.?key|secret|token|authorization|credential|password/i.test(k)) continue;
        if (mode !== 'full' && /raw_text|source_text|original_text|latest_user_text|prompt|response_text|health_data|structured/i.test(k)) {
          out[k] = typeof v === 'string' ? redactText(v, mode) : '[content omitted]';
        } else out[k] = sanitizeValue(v, mode, k);
      }
      return out;
    }
    return value;
  }

  function pushLog(kind, payload={}){
    const store = load();
    const row = { id:id(), timestamp:now(), ...payload };
    if (!store.logs[kind]) store.logs[kind] = [];
    store.logs[kind].push(row);
    save(store);
    return clone(row);
  }

  function create(input={}){
    const store = load();
    const workflow = {
      id: input.id || id(),
      transaction_id: input.transaction_id || id(),
      created_at: now(),
      updated_at: now(),
      status: input.status || 'understanding',
      goal: String(input.goal || 'Understand and respond to the latest message'),
      source_text: String(input.source_text || ''),
      target: input.target || null,
      known: input.known || {},
      needed: Array.isArray(input.needed) ? input.needed : [],
      proposed: input.proposed || null,
      save_status: input.save_status || 'not_saved',
      duplicate_status: input.duplicate_status || 'not_checked',
      ai_status: input.ai_status || 'not_needed',
      available_actions: input.available_actions || [],
      history: [{ timestamp:now(), status:input.status || 'understanding', note:'Workflow started' }]
    };
    store.workflows.push(workflow);
    store.current_workflow_id = workflow.id;
    store.logs.audit_history.push({ id:id(), timestamp:now(), workflow_id:workflow.id, event:'workflow_started', status:workflow.status, goal:workflow.goal });
    save(store);
    return clone(workflow);
  }

  function find(store, workflowId){ return (store.workflows || []).find(w => w.id === workflowId); }

  function update(workflowId, patch={}, note=''){
    if (!workflowId) return null;
    const store = load();
    const workflow = find(store, workflowId);
    if (!workflow) return null;
    const nextStatus = patch.status || workflow.status;
    Object.assign(workflow, patch, { updated_at:now(), status:nextStatus });
    workflow.history = Array.isArray(workflow.history) ? workflow.history : [];
    workflow.history.push({ timestamp:now(), status:nextStatus, note:String(note || patch.note || '').slice(0,500) });
    if (TERMINAL.has(nextStatus)) store.current_workflow_id = store.current_workflow_id === workflowId ? null : store.current_workflow_id;
    else store.current_workflow_id = workflowId;
    store.logs.audit_history.push({ id:id(), timestamp:now(), workflow_id:workflowId, event:'workflow_updated', status:nextStatus, note:String(note || '').slice(0,500), save_status:workflow.save_status });
    save(store);
    return clone(workflow);
  }

  function close(workflowId, status='completed', outcome='', patch={}){
    const normalized = TERMINAL.has(status) ? status : 'completed';
    return update(workflowId, { ...patch, status:normalized, outcome:String(outcome || ''), closed_at:now() }, outcome || `Workflow ${normalized}`);
  }

  function current(){
    const store = load();
    return clone(find(store, store.current_workflow_id) || null);
  }

  function get(workflowId){ return clone(find(load(), workflowId) || null); }
  function list(){ return clone(load().workflows || []); }

  function unresolved(payload={}){ return pushLog('unresolved_interactions', payload); }
  function technical(payload={}){ return pushLog('technical_errors', payload); }
  function ai(payload={}){ return pushLog('ai_consultations', payload); }
  function correction(payload={}){ return pushLog('user_corrections', payload); }
  function feedback(payload={}){ return pushLog('ux_feedback', payload); }
  function audit(payload={}){ return pushLog('audit_history', payload); }

  function metrics(snapshot=load()){
    const workflows = snapshot.workflows || [];
    const terminal = workflows.filter(w => TERMINAL.has(w.status));
    const completed = workflows.filter(w => w.status === 'completed').length;
    const unresolvedCount = (snapshot.logs?.unresolved_interactions || []).length;
    const aiRows = snapshot.logs?.ai_consultations || [];
    const aiSuccess = aiRows.filter(x => x.status === 'success').length;
    return {
      workflows_started: workflows.length,
      workflows_closed: terminal.length,
      workflows_completed: completed,
      workflows_open: workflows.length - terminal.length,
      unresolved_interactions: unresolvedCount,
      user_corrections: (snapshot.logs?.user_corrections || []).length,
      ai_consultations: aiRows.length,
      ai_success_rate: aiRows.length ? Math.round((aiSuccess / aiRows.length) * 1000) / 10 : null
    };
  }

  function inRange(row, from='', to=''){
    const ts = new Date(row.timestamp || row.updated_at || row.created_at || 0).getTime();
    if (!Number.isFinite(ts)) return true;
    if (from && ts < new Date(`${from}T00:00:00`).getTime()) return false;
    if (to && ts > new Date(`${to}T23:59:59.999`).getTime()) return false;
    return true;
  }

  function exportSnapshot({privacy_mode='full',from='',to=''}={}){
    const snapshot = load();
    const filtered = {
      ...snapshot,
      workflows: snapshot.workflows.filter(row => inRange(row,from,to)),
      logs: Object.fromEntries(Object.entries(snapshot.logs).map(([key,rows]) => [key, rows.filter(row => inRange(row,from,to))]))
    };
    return sanitizeValue({
      schema_version: 1,
      generated_at: now(),
      privacy_mode,
      range: { from:from || null, to:to || null },
      metrics: metrics(filtered),
      ...filtered
    }, privacy_mode);
  }

  function clearLogs({keep_workflows=true}={}){
    const store = load();
    for (const key of Object.keys(store.logs)) store.logs[key] = [];
    if (!keep_workflows) { store.workflows=[]; store.current_workflow_id=null; }
    save(store);
  }

  window.ZekeWorkflowEngine = {
    create, update, close, current, get, list,
    unresolved, technical, ai, correction, feedback, audit,
    metrics, exportSnapshot, clearLogs, hydrate, repositoryRecord,
    constants: { STORE_KEY, TERMINAL:[...TERMINAL] }
  };
})();
