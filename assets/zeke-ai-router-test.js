(function(){
  const STORAGE_KEY = 'ZEKE_AI_ROUTER_TEST_CONFIG_V052';
  const CHAT_KEY = 'ZEKE_AI_ROUTER_TEST_CHAT_V052';
  const DEFAULTS = {
    preferred: 'gemini',
    privacy: 'minimal',
    gemini: { enabled: false, apiKey: '', model: 'gemini-2.5-flash' },
    openrouter: { enabled: false, apiKey: '', model: 'google/gemini-2.0-flash-exp:free' },
    groq: { enabled: false, apiKey: '', model: 'llama-3.1-8b-instant' },
    relay: { enabled: false, url: '' }
  };
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function loadConfig(){
    try { return merge(clone(DEFAULTS), JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')); }
    catch { return clone(DEFAULTS); }
  }
  function saveConfig(cfg){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); }
  function merge(a,b){ for(const k in b){ if(b[k] && typeof b[k]==='object' && !Array.isArray(b[k])) a[k]=merge(a[k]||{}, b[k]); else a[k]=b[k]; } return a; }
  function loadChat(){ try { return JSON.parse(sessionStorage.getItem(CHAT_KEY)||'[]'); } catch { return []; } }
  function saveChat(items){ sessionStorage.setItem(CHAT_KEY, JSON.stringify(items.slice(-20))); }
  function sanitizeForMinimal(text){
    return String(text||'')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email]')
      .replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,'[ssn-like]')
      .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,'[phone]')
      .slice(0,12000);
  }
  function systemPrompt(task){
    return `You are ZEKE, a calm evidence-based personal context assistant. Task: ${task||'chat'}. Distinguish observation, interpretation, recommendation, uncertainty, and evidence. For data entry interpretation, do not claim the interpretation is saved; ask for user confirmation. Be concise and practical.`;
  }
  async function callGemini(cfg, messages, task){
    const key = cfg.gemini.apiKey.trim();
    const model = cfg.gemini.model.trim() || 'gemini-2.5-flash';
    if(!key) throw new Error('Gemini key missing.');
    const text = [systemPrompt(task), ...messages.map(m => `${m.role.toUpperCase()}: ${m.content}`)].join('\n\n');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text }] }], generationConfig: { temperature: 0.2 } })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
    return data?.candidates?.[0]?.content?.parts?.map(p=>p.text).filter(Boolean).join('\n') || 'Gemini returned no text.';
  }
  async function callOpenRouter(cfg, messages, task){
    const key = cfg.openrouter.apiKey.trim();
    if(!key) throw new Error('OpenRouter key missing.');
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`,'HTTP-Referer':location.origin,'X-Title':'Project ZEKE Alpha'},
      body: JSON.stringify({ model: cfg.openrouter.model.trim(), temperature: 0.2, messages: [{role:'system', content: systemPrompt(task)}, ...messages] })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data?.error?.message || `OpenRouter HTTP ${res.status}`);
    return data?.choices?.[0]?.message?.content || 'OpenRouter returned no text.';
  }
  async function callGroq(cfg, messages, task){
    const key = cfg.groq.apiKey.trim();
    if(!key) throw new Error('Groq key missing.');
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body: JSON.stringify({ model: cfg.groq.model.trim(), temperature:0.2, messages:[{role:'system', content: systemPrompt(task)}, ...messages] })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data?.error?.message || `Groq HTTP ${res.status}`);
    return data?.choices?.[0]?.message?.content || 'Groq returned no text.';
  }
  async function callRelay(cfg, messages, task){
    const url = cfg.relay.url.trim();
    if(!url) throw new Error('Relay URL missing.');
    const res = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({task, privacy:cfg.privacy, messages})});
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data?.error || data?.message || `Relay HTTP ${res.status}`);
    return data.text || data.response || data.answer || JSON.stringify(data, null, 2);
  }
  function enabledProviders(cfg){
    const order = [cfg.preferred, 'gemini','openrouter','groq','relay'].filter((v,i,a)=>v&&a.indexOf(v)===i);
    return order.filter(p => cfg[p]?.enabled);
  }
  async function askAI(prompt, opts={}){
    const cfg = loadConfig();
    const text = cfg.privacy === 'minimal' ? sanitizeForMinimal(prompt) : String(prompt||'');
    const messages = opts.messages || [{role:'user', content:text}];
    const providers = enabledProviders(cfg);
    if(!providers.length) throw new Error('No AI providers are enabled. Open AI Router setup and enable Gemini, OpenRouter, Groq, or a relay.');
    let lastErr;
    for(const p of providers){
      try{
        const out = p==='gemini' ? await callGemini(cfg, messages, opts.task) : p==='openrouter' ? await callOpenRouter(cfg, messages, opts.task) : p==='groq' ? await callGroq(cfg, messages, opts.task) : await callRelay(cfg, messages, opts.task);
        return {provider:p, text:out};
      }catch(err){ lastErr = err; console.warn('[ZEKE AI Router]', p, err); }
    }
    throw lastErr || new Error('AI providers failed.');
  }
  async function testProvider(name){
    const result = await askAI('Reply with exactly: ZEKE AI connected.', {task:'connection-test', messages:[{role:'user', content:'Reply with exactly: ZEKE AI connected.'}]});
    return result;
  }
  function createPanel(){
    if($('#zeke-ai-router-root')) return;
    const root = document.createElement('div');
    root.id = 'zeke-ai-router-root';
    root.innerHTML = `
      <button class="zair-fab" title="AI Router">AI</button>
      <section class="zair-panel" hidden>
        <div class="zair-head"><div><strong>ZEKE AI Router</strong><span>v0.5.2 test build</span></div><button class="zair-close">×</button></div>
        <div class="zair-tabs"><button data-tab="chat" class="active">Chat</button><button data-tab="setup">Setup</button><button data-tab="notes">Notes</button></div>
        <div class="zair-body">
          <div class="zair-tab" data-pane="chat">
            <div class="zair-chatlog"></div>
            <textarea class="zair-prompt" placeholder="Ask ZEKE using the AI router…\nExample: Look at this workout note and suggest a safer progression."></textarea>
            <div class="zair-actions"><button class="zair-ask">Ask via router</button><button class="zair-interpret">Interpret entry</button><button class="zair-clear-chat">Clear</button></div>
            <div class="zair-status"></div>
          </div>
          <div class="zair-tab" data-pane="setup" hidden>
            <label>Preferred provider <select class="zair-preferred"><option value="gemini">Gemini</option><option value="openrouter">OpenRouter</option><option value="groq">Groq</option><option value="relay">Relay</option></select></label>
            <label>Privacy level <select class="zair-privacy"><option value="minimal">Minimal sharing</option><option value="balanced">Balanced</option></select></label>
            ${providerBlock('gemini','Gemini free-tier candidate','https://aistudio.google.com/app/apikey','gemini-2.5-flash')}
            ${providerBlock('openrouter','OpenRouter free-model router','https://openrouter.ai/settings/keys','google/gemini-2.0-flash-exp:free')}
            ${providerBlock('groq','Groq free/developer tier candidate','https://console.groq.com/keys','llama-3.1-8b-instant')}
            <div class="zair-provider"><label><input type="checkbox" data-enabled="relay"> Secure relay for OpenAI / Claude / paid providers</label><input data-key="relay.url" placeholder="https://your-relay.example.com/zeke-ai"><small>Use this for providers that should not expose API keys in browser code.</small></div>
            <div class="zair-actions"><button class="zair-save">Save AI setup</button><button class="zair-test">Test enabled providers</button><button class="zair-reset">Forget keys</button></div>
            <div class="zair-setup-status"></div>
          </div>
          <div class="zair-tab" data-pane="notes" hidden>
            <p><strong>This is a static-site test release.</strong> Gemini/OpenRouter/Groq are attempted directly from the browser so you can try free AI quickly. Browser/CORS/provider policies can still block a provider.</p>
            <p>For OpenAI and Claude, the safer production pattern is a tiny secure relay. ZEKE will still route requests through the same AI Router.</p>
            <p>Early-release rule: AI suggestions are advisory. Structured facts should still be reviewed before permanent save.</p>
          </div>
        </div>
      </section>`;
    document.body.appendChild(root);
    bindPanel(root);
    hydrate(root);
    renderChat(root);
  }
  function providerBlock(id,title,keyUrl,model){
    return `<div class="zair-provider"><label><input type="checkbox" data-enabled="${id}"> ${title}</label><a href="${keyUrl}" target="_blank" rel="noopener">Get key</a><input data-key="${id}.apiKey" type="password" placeholder="Paste API key"><input data-key="${id}.model" placeholder="Model" value="${model}"></div>`;
  }
  function bindPanel(root){
    $('.zair-fab',root).onclick=()=>$('.zair-panel',root).hidden=false;
    $('.zair-close',root).onclick=()=>$('.zair-panel',root).hidden=true;
    $$('.zair-tabs button',root).forEach(btn=>btn.onclick=()=>{ $$('.zair-tabs button',root).forEach(b=>b.classList.toggle('active',b===btn)); $$('.zair-tab',root).forEach(p=>p.hidden=p.dataset.pane!==btn.dataset.tab); });
    $('.zair-save',root).onclick=()=>{ saveFromForm(root); setText(root,'.zair-setup-status','Saved in this browser for testing.'); };
    $('.zair-reset',root).onclick=()=>{ localStorage.removeItem(STORAGE_KEY); hydrate(root); setText(root,'.zair-setup-status','Forgot AI keys and setup.'); };
    $('.zair-test',root).onclick=async()=>{ saveFromForm(root); await runAsk(root,'Reply with exactly: ZEKE AI connected.','connection-test', true); };
    $('.zair-ask',root).onclick=async()=>{ await runAsk(root, $('.zair-prompt',root).value, 'chat'); };
    $('.zair-interpret',root).onclick=async()=>{ const val=$('.zair-prompt',root).value; await runAsk(root, `Interpret this user entry into likely ZEKE structured record(s). Return: what you understood, confidence, fields, and questions if needed. Entry:\n${val}`, 'interpretation'); };
    $('.zair-clear-chat',root).onclick=()=>{ saveChat([]); renderChat(root); };
    $('.zair-prompt',root).addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key==='Enter') $('.zair-ask',root).click(); });
  }
  function hydrate(root){
    const cfg=loadConfig();
    $('.zair-preferred',root).value=cfg.preferred; $('.zair-privacy',root).value=cfg.privacy;
    ['gemini','openrouter','groq','relay'].forEach(p=>{ const cb=$(`[data-enabled="${p}"]`,root); if(cb) cb.checked=!!cfg[p].enabled; });
    $$('[data-key]',root).forEach(inp=>{ const [a,b]=inp.dataset.key.split('.'); inp.value=cfg[a]?.[b]||''; });
  }
  function saveFromForm(root){
    const cfg=loadConfig(); cfg.preferred=$('.zair-preferred',root).value; cfg.privacy=$('.zair-privacy',root).value;
    ['gemini','openrouter','groq','relay'].forEach(p=>{ const cb=$(`[data-enabled="${p}"]`,root); if(cb) cfg[p].enabled=cb.checked; });
    $$('[data-key]',root).forEach(inp=>{ const [a,b]=inp.dataset.key.split('.'); cfg[a] = cfg[a]||{}; cfg[a][b]=inp.value.trim(); });
    saveConfig(cfg);
  }
  function setText(root, sel, text){ const el=$(sel,root); if(el) el.textContent=text; }
  async function runAsk(root, prompt, task, setupStatus){
    if(!prompt.trim()) return;
    saveFromForm(root);
    const statusSel = setupStatus ? '.zair-setup-status' : '.zair-status';
    setText(root,statusSel,'Thinking through AI router…');
    const chat = loadChat();
    if(!setupStatus) chat.push({role:'user', content:prompt, at:new Date().toISOString()});
    try{
      const res = await askAI(prompt,{task});
      const msg = {role:'assistant', provider:res.provider, content:res.text, at:new Date().toISOString()};
      if(setupStatus) setText(root,statusSel,`Connected through ${res.provider}: ${res.text.slice(0,160)}`); else { chat.push(msg); saveChat(chat); renderChat(root); setText(root,statusSel,`Answered through ${res.provider}.`); $('.zair-prompt',root).value=''; }
    }catch(err){ setText(root,statusSel,`AI router failed: ${err.message}`); if(!setupStatus){ chat.push({role:'assistant', provider:'router', content:`AI router failed: ${err.message}`, at:new Date().toISOString()}); saveChat(chat); renderChat(root); } }
  }
  function renderChat(root){
    const log=$('.zair-chatlog',root); if(!log) return;
    const chat=loadChat();
    log.innerHTML = chat.length ? chat.map(m=>`<div class="zair-msg ${m.role}"><b>${m.role==='user'?'You':`ZEKE${m.provider?' · '+escapeHtml(m.provider):''}`}</b><div>${escapeHtml(m.content).replace(/\n/g,'<br>')}</div></div>`).join('') : '<div class="zair-empty">Ask ZEKE something using your configured free AI provider.</div>';
    log.scrollTop=log.scrollHeight;
  }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
  function addNaturalEscalationHint(){
    const style = document.createElement('div');
    style.className='zair-inline-hint';
    style.textContent='AI Router ready: say “try harder,” “use AI,” or open the AI bubble to test free AI.';
    setTimeout(()=>{ if(!document.querySelector('.zair-inline-hint')) document.body.appendChild(style); setTimeout(()=>style.remove(),9000); },2000);
  }
  window.ZekeAIRouter = { ask: askAI, config: loadConfig, open: ()=>{ const root=$('#zeke-ai-router-root'); if(root) $('.zair-panel',root).hidden=false; } };
  document.addEventListener('DOMContentLoaded',()=>{ createPanel(); addNaturalEscalationHint(); });
  if(document.readyState!=='loading'){ createPanel(); addNaturalEscalationHint(); }
})();
