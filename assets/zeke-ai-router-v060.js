(function(){
  'use strict';
  const STORAGE_KEY = 'ZEKE_AI_ROUTER_CONFIG_V060';
  const CHAT_KEY = 'ZEKE_AI_ROUTER_CHAT_V060';

  const PROVIDERS = {
    gemini: {
      label:'Gemini', tier:'Free tier available', kind:'gemini', priority:10,
      keyUrl:'https://aistudio.google.com/app/apikey',
      models:['gemini-2.5-flash','gemini-2.5-flash-lite'],
      defaultModel:'gemini-2.5-flash', capabilities:['chat','interpretation','analysis','vision']
    },
    groq: {
      label:'Groq', tier:'Free tier / rate limited', kind:'openai', priority:9,
      keyUrl:'https://console.groq.com/keys', baseUrl:'https://api.groq.com/openai/v1',
      models:['llama-3.3-70b-versatile','llama-3.1-8b-instant'],
      defaultModel:'llama-3.3-70b-versatile', capabilities:['chat','interpretation','analysis']
    },
    openrouter: {
      label:'OpenRouter', tier:'Free model router', kind:'openai', priority:8,
      keyUrl:'https://openrouter.ai/settings/keys', baseUrl:'https://openrouter.ai/api/v1',
      models:['openrouter/free','meta-llama/llama-3.3-70b-instruct:free'],
      defaultModel:'openrouter/free', capabilities:['chat','interpretation','analysis','fallback']
    },
    mistral: {
      label:'Mistral', tier:'Free mode / rate limited', kind:'openai', priority:7,
      keyUrl:'https://console.mistral.ai/api-keys', baseUrl:'https://api.mistral.ai/v1',
      models:['mistral-small-latest','mistral-medium-latest'],
      defaultModel:'mistral-small-latest', capabilities:['chat','interpretation','analysis']
    },
    cerebras: {
      label:'Cerebras', tier:'Free tier', kind:'openai', priority:7,
      keyUrl:'https://cloud.cerebras.ai/', baseUrl:'https://api.cerebras.ai/v1',
      models:['gpt-oss-120b','zai-glm-4.7'], defaultModel:'gpt-oss-120b',
      capabilities:['chat','interpretation','analysis']
    },
    nvidia: {
      label:'NVIDIA NIM', tier:'Free developer prototyping', kind:'openai', priority:6,
      keyUrl:'https://build.nvidia.com/', baseUrl:'https://integrate.api.nvidia.com/v1',
      models:['meta/llama-3.3-70b-instruct','nvidia/llama-3.1-nemotron-ultra-253b-v1'],
      defaultModel:'meta/llama-3.3-70b-instruct', capabilities:['chat','interpretation','analysis']
    },
    github: {
      label:'GitHub Models', tier:'Free prototyping / rate limited', kind:'github', priority:6,
      keyUrl:'https://github.com/settings/tokens', baseUrl:'https://models.github.ai/inference',
      models:['openai/gpt-4.1-mini','meta/Llama-3.3-70B-Instruct'], defaultModel:'openai/gpt-4.1-mini',
      capabilities:['chat','interpretation','analysis']
    },
    cloudflare: {
      label:'Cloudflare Workers AI', tier:'Daily free allocation', kind:'cloudflare', priority:6,
      keyUrl:'https://dash.cloudflare.com/',
      models:['@cf/meta/llama-3.1-8b-instruct','@cf/openai/gpt-oss-120b'],
      defaultModel:'@cf/meta/llama-3.1-8b-instruct', capabilities:['chat','interpretation','analysis']
    },
    huggingface: {
      label:'Hugging Face Inference', tier:'Small monthly free credits', kind:'openai', priority:5,
      keyUrl:'https://huggingface.co/settings/tokens', baseUrl:'https://router.huggingface.co/v1',
      models:['openai/gpt-oss-120b:fastest','deepseek-ai/DeepSeek-R1:fastest'],
      defaultModel:'openai/gpt-oss-120b:fastest', capabilities:['chat','interpretation','analysis','routing']
    },
    openai: {
      label:'OpenAI API', tier:'Paid API account', kind:'openai', priority:3,
      keyUrl:'https://platform.openai.com/api-keys', baseUrl:'https://api.openai.com/v1',
      models:['gpt-5-mini','gpt-4.1-mini'], defaultModel:'gpt-5-mini', capabilities:['chat','interpretation','analysis']
    },
    claudeRelay: {
      label:'Claude via secure relay', tier:'Paid provider / relay recommended', kind:'relay', priority:3,
      keyUrl:'https://console.anthropic.com/', models:['claude-sonnet','claude-haiku'], defaultModel:'claude-sonnet',
      capabilities:['chat','interpretation','analysis','long-context']
    },
    customRelay: {
      label:'Custom secure relay', tier:'Provider-neutral', kind:'relay', priority:2,
      keyUrl:'', models:['router-default'], defaultModel:'router-default', capabilities:['chat','interpretation','analysis']
    }
  };

  const DEFAULTS = {
    preferred:'auto', privacy:'minimal', freeFirst:true,
    providers:Object.fromEntries(Object.entries(PROVIDERS).map(([id,p])=>[id,{enabled:false,apiKey:'',model:p.defaultModel,accountId:'',relayUrl:''}]))
  };

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const clone=x=>JSON.parse(JSON.stringify(x));
  function merge(a,b){ for(const k in (b||{})){ if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])) a[k]=merge(a[k]||{},b[k]); else a[k]=b[k]; } return a; }
  function loadConfig(){ try{return merge(clone(DEFAULTS),JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'));}catch{return clone(DEFAULTS);} }
  function saveConfig(cfg){ localStorage.setItem(STORAGE_KEY,JSON.stringify(cfg)); window.dispatchEvent(new CustomEvent('zeke:ai-router-config')); }
  function loadChat(){try{return JSON.parse(sessionStorage.getItem(CHAT_KEY)||'[]');}catch{return[];}}
  function saveChat(x){sessionStorage.setItem(CHAT_KEY,JSON.stringify(x.slice(-30)));}
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function sanitize(text,privacy){
    let s=String(text||'');
    if(privacy==='minimal') s=s
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email]')
      .replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,'[identifier]')
      .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,'[phone]');
    return s.slice(0,24000);
  }
  function systemPrompt(task){
    return `You are ZEKE, a calm, evidence-based personal context assistant. Task: ${task||'chat'}. Distinguish observation, interpretation, evidence, recommendation, and uncertainty. Do not diagnose or claim causation from correlation. For data-entry interpretation, propose a structured interpretation but never claim it is saved; the user must confirm first. Be conversational, specific, and concise.`;
  }
  function isFreeLike(id){ return !['openai','claudeRelay','customRelay'].includes(id); }
  function enabledOrder(cfg,task){
    let ids=Object.keys(PROVIDERS).filter(id=>cfg.providers[id]?.enabled);
    ids.sort((a,b)=>{
      if(cfg.preferred!=='auto'){ if(a===cfg.preferred)return -1; if(b===cfg.preferred)return 1; }
      if(cfg.freeFirst && isFreeLike(a)!==isFreeLike(b)) return isFreeLike(a)?-1:1;
      const fastTask=['interpretation','connection-test'].includes(task);
      const boost=id=>fastTask && ['groq','gemini','cerebras'].includes(id)?3:0;
      return (PROVIDERS[b].priority+boost(b))-(PROVIDERS[a].priority+boost(a));
    });
    return ids;
  }
  async function fetchJson(url,options){
    const res=await fetch(url,options); const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data?.error?.message||data?.message||data?.error||`HTTP ${res.status}`);
    return data;
  }
  async function callOpenAICompatible(id,cfg,messages,task){
    const meta=PROVIDERS[id], pcfg=cfg.providers[id], key=pcfg.apiKey.trim();
    if(!key) throw new Error(`${meta.label} key missing.`);
    const headers={'Content-Type':'application/json','Authorization':`Bearer ${key}`};
    if(id==='openrouter'){headers['HTTP-Referer']=location.origin; headers['X-Title']='Project ZEKE Alpha';}
    const data=await fetchJson(`${meta.baseUrl}/chat/completions`,{
      method:'POST',headers,
      body:JSON.stringify({model:pcfg.model||meta.defaultModel,temperature:0.2,messages:[{role:'system',content:systemPrompt(task)},...messages]})
    });
    return data?.choices?.[0]?.message?.content||'Provider returned no text.';
  }
  async function callGemini(cfg,messages,task){
    const pcfg=cfg.providers.gemini,key=pcfg.apiKey.trim(); if(!key)throw new Error('Gemini key missing.');
    const text=[systemPrompt(task),...messages.map(m=>`${m.role.toUpperCase()}: ${m.content}`)].join('\n\n');
    const data=await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(pcfg.model||PROVIDERS.gemini.defaultModel)}:generateContent?key=${encodeURIComponent(key)}`,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text}]}],generationConfig:{temperature:0.2}})
    });
    return data?.candidates?.[0]?.content?.parts?.map(p=>p.text).filter(Boolean).join('\n')||'Gemini returned no text.';
  }
  async function callGitHub(cfg,messages,task){
    const pcfg=cfg.providers.github,key=pcfg.apiKey.trim();if(!key)throw new Error('GitHub token missing.');
    const data=await fetchJson('https://models.github.ai/inference/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json','Accept':'application/vnd.github+json','Authorization':`Bearer ${key}`,'X-GitHub-Api-Version':'2026-03-10'},
      body:JSON.stringify({model:pcfg.model||PROVIDERS.github.defaultModel,temperature:0.2,messages:[{role:'system',content:systemPrompt(task)},...messages]})
    });
    return data?.choices?.[0]?.message?.content||'GitHub Models returned no text.';
  }
  async function callCloudflare(cfg,messages,task){
    const pcfg=cfg.providers.cloudflare,key=pcfg.apiKey.trim(),account=pcfg.accountId.trim();
    if(!key||!account)throw new Error('Cloudflare API token and Account ID are required.');
    const data=await fetchJson(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/v1/chat/completions`,{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body:JSON.stringify({model:pcfg.model||PROVIDERS.cloudflare.defaultModel,temperature:0.2,messages:[{role:'system',content:systemPrompt(task)},...messages]})
    });
    return data?.choices?.[0]?.message?.content||data?.result?.response||'Cloudflare returned no text.';
  }
  async function callRelay(id,cfg,messages,task){
    const pcfg=cfg.providers[id],url=pcfg.relayUrl.trim();if(!url)throw new Error(`${PROVIDERS[id].label} relay URL missing.`);
    const data=await fetchJson(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider:id==='claudeRelay'?'anthropic':'auto',model:pcfg.model,task,privacy:cfg.privacy,messages})});
    return data.text||data.response||data.answer||JSON.stringify(data,null,2);
  }
  async function callProvider(id,cfg,messages,task){
    if(id==='gemini')return callGemini(cfg,messages,task);
    if(id==='github')return callGitHub(cfg,messages,task);
    if(id==='cloudflare')return callCloudflare(cfg,messages,task);
    if(PROVIDERS[id].kind==='relay')return callRelay(id,cfg,messages,task);
    return callOpenAICompatible(id,cfg,messages,task);
  }
  async function askAI(prompt,opts={}){
    const cfg=loadConfig(); const text=sanitize(prompt,cfg.privacy);
    const messages=(opts.messages||[{role:'user',content:text}]).map(m=>({...m,content:sanitize(m.content,cfg.privacy)}));
    const order=enabledOrder(cfg,opts.task||'chat'); if(!order.length)throw new Error('No AI providers are enabled. Open AI Router setup and connect at least one provider.');
    let lastErr=null,attempts=[];
    for(const id of order){
      try{ const out=await callProvider(id,cfg,messages,opts.task||'chat'); return {provider:id,providerLabel:PROVIDERS[id].label,model:cfg.providers[id].model,text:out,attempts}; }
      catch(err){lastErr=err;attempts.push({provider:id,error:err.message});console.warn('[ZEKE AI Router]',id,err);}
    }
    const e=lastErr||new Error('All configured AI providers failed.'); e.attempts=attempts; throw e;
  }
  function shouldEscalate(text){return /\b(try harder|look deeper|use ai|ask ai|that'?s not right|not quite|check again|double[- ]check|better answer)\b/i.test(String(text||''));}

  function providerRow(id){
    const p=PROVIDERS[id]; const modelOptions=p.models.map(m=>`<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    const extra=id==='cloudflare'?'<input data-field="accountId" placeholder="Cloudflare Account ID">':'';
    const secret=p.kind==='relay'?`<input data-field="relayUrl" placeholder="https://your-secure-relay.example.com/zeke-ai">`:`<input data-field="apiKey" type="password" autocomplete="off" placeholder="Paste API key or token">`;
    return `<div class="zair-provider-v6" data-provider="${id}">
      <div class="zair-provider-title"><label><input type="checkbox" data-field="enabled"> <strong>${escapeHtml(p.label)}</strong></label><span>${escapeHtml(p.tier)}</span></div>
      <div class="zair-provider-grid"><select data-field="model">${modelOptions}</select>${secret}${extra}${p.keyUrl?`<a href="${p.keyUrl}" target="_blank" rel="noopener">Get access ↗</a>`:''}<button class="zair-test-one" type="button">Test</button></div>
      <div class="zair-provider-result"></div>
    </div>`;
  }
  function createPanel(){
    if(document.getElementById('zeke-ai-router-root'))return;
    const root=document.createElement('div');root.id='zeke-ai-router-root';
    root.innerHTML=`<button class="zair-fab" title="AI Router status">AI</button>
      <section class="zair-panel zair-panel-v6" hidden>
        <div class="zair-head"><div><strong>ZEKE AI Router</strong><span>v0.6.0 · free-first routing</span></div><button class="zair-close" aria-label="Close">×</button></div>
        <div class="zair-tabs"><button data-tab="status" class="active">Status</button><button data-tab="setup">Providers</button><button data-tab="chat">Test chat</button></div>
        <div class="zair-body">
          <div class="zair-tab" data-pane="status"><div class="zair-router-summary"></div><p class="zair-note">ZEKE features ask the router for a capability. The router selects a configured provider based on preference, task fit, availability, and free-first rules.</p></div>
          <div class="zair-tab" data-pane="setup" hidden>
            <div class="zair-global-grid"><label>Preferred <select class="zair-preferred"><option value="auto">Auto route</option>${Object.entries(PROVIDERS).map(([id,p])=>`<option value="${id}">${escapeHtml(p.label)}</option>`).join('')}</select></label><label>Privacy <select class="zair-privacy"><option value="minimal">Minimal sharing</option><option value="balanced">Balanced context</option></select></label><label><input type="checkbox" class="zair-free-first"> Prefer free / rate-limited free providers</label></div>
            <details class="zair-key-warning"><summary>About keys in this test build</summary><p>This static alpha stores API keys only in this browser for testing. A production release should use a secure relay or provider-safe token flow. Personal ZEKE records are not stored here.</p></details>
            ${Object.keys(PROVIDERS).map(providerRow).join('')}
            <div class="zair-actions"><button class="zair-save" type="button">Save setup</button><button class="zair-test-all" type="button">Test routing</button><button class="zair-reset" type="button">Forget AI setup</button></div><div class="zair-setup-status"></div>
          </div>
          <div class="zair-tab" data-pane="chat" hidden><div class="zair-chatlog"></div><textarea class="zair-prompt" placeholder="Ask something to test the router…"></textarea><div class="zair-actions"><button class="zair-ask" type="button">Send</button><button class="zair-clear-chat" type="button">Clear</button></div><div class="zair-status"></div></div>
        </div>
      </section>`;
    document.body.appendChild(root); bind(root); hydrate(root); renderSummary(root); renderChat(root);
  }
  function hydrate(root){
    const cfg=loadConfig(); $('.zair-preferred',root).value=cfg.preferred; $('.zair-privacy',root).value=cfg.privacy; $('.zair-free-first',root).checked=cfg.freeFirst;
    $$('.zair-provider-v6',root).forEach(row=>{const id=row.dataset.provider,p=cfg.providers[id]; $$('[data-field]',row).forEach(el=>{const f=el.dataset.field;if(el.type==='checkbox')el.checked=!!p[f];else el.value=p[f]||'';});});
  }
  function saveFromForm(root){
    const cfg=loadConfig();cfg.preferred=$('.zair-preferred',root).value;cfg.privacy=$('.zair-privacy',root).value;cfg.freeFirst=$('.zair-free-first',root).checked;
    $$('.zair-provider-v6',root).forEach(row=>{const id=row.dataset.provider,p=cfg.providers[id];$$('[data-field]',row).forEach(el=>{p[el.dataset.field]=el.type==='checkbox'?el.checked:el.value.trim();});});saveConfig(cfg);renderSummary(root);return cfg;
  }
  function renderSummary(root){
    const cfg=loadConfig(),enabled=Object.keys(PROVIDERS).filter(id=>cfg.providers[id].enabled);
    const el=$('.zair-router-summary',root); if(!el)return;
    el.innerHTML=`<div class="zair-status-hero"><strong>${enabled.length}</strong><span>AI provider${enabled.length===1?'':'s'} connected in router</span></div><div class="zair-model-pills">${enabled.length?enabled.map(id=>`<span>${escapeHtml(PROVIDERS[id].label)} · ${escapeHtml(cfg.providers[id].model)}</span>`).join(''):'<span>Local ZEKE remains available. Add a provider for real-time AI chat and reinterpretation.</span>'}</div><div class="zair-route-line">Route: ${cfg.preferred==='auto'?'Automatic':escapeHtml(PROVIDERS[cfg.preferred]?.label||cfg.preferred)} · ${cfg.freeFirst?'free-first':'preference-first'} · ${escapeHtml(cfg.privacy)} context</div>`;
    const fab=$('.zair-fab',root);fab.classList.toggle('connected',enabled.length>0);fab.title=enabled.length?`${enabled.length} AI providers configured`:'Set up AI providers';
  }
  function bind(root){
    $('.zair-fab',root).onclick=()=>$('.zair-panel',root).hidden=false; $('.zair-close',root).onclick=()=>$('.zair-panel',root).hidden=true;
    $$('.zair-tabs button',root).forEach(btn=>btn.onclick=()=>{$$('.zair-tabs button',root).forEach(b=>b.classList.toggle('active',b===btn));$$('.zair-tab',root).forEach(p=>p.hidden=p.dataset.pane!==btn.dataset.tab);});
    $('.zair-save',root).onclick=()=>{saveFromForm(root);$('.zair-setup-status',root).textContent='AI Router setup saved in this browser.';};
    $('.zair-reset',root).onclick=()=>{localStorage.removeItem(STORAGE_KEY);hydrate(root);renderSummary(root);$('.zair-setup-status',root).textContent='AI setup removed from this browser.';};
    $('.zair-test-all',root).onclick=async()=>{saveFromForm(root);const out=$('.zair-setup-status',root);out.textContent='Testing router…';try{const r=await askAI('Reply with exactly: ZEKE AI connected.',{task:'connection-test'});out.textContent=`Connected through ${r.providerLabel} · ${r.model}`;}catch(e){out.textContent=`Router test failed: ${e.message}`;}};
    $$('.zair-test-one',root).forEach(btn=>btn.onclick=async()=>{const row=btn.closest('.zair-provider-v6'),id=row.dataset.provider,res=$('.zair-provider-result',row);saveFromForm(root);res.textContent='Testing…';try{const cfg=loadConfig(),text=await callProvider(id,cfg,[{role:'user',content:'Reply with exactly: ZEKE AI connected.'}],'connection-test');res.textContent=`✓ ${String(text).slice(0,120)}`;}catch(e){res.textContent=`✕ ${e.message}`;}});
    $('.zair-ask',root).onclick=()=>runChat(root);$('.zair-clear-chat',root).onclick=()=>{saveChat([]);renderChat(root);};
    $('.zair-prompt',root).addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')runChat(root);});
  }
  async function runChat(root){
    const input=$('.zair-prompt',root),prompt=input.value.trim();if(!prompt)return;saveFromForm(root);const chat=loadChat();chat.push({role:'user',content:prompt});saveChat(chat);renderChat(root);$('.zair-status',root).textContent='Routing…';input.value='';
    try{const r=await askAI(prompt,{task:'chat',messages:chat.map(x=>({role:x.role,content:x.content}))});chat.push({role:'assistant',content:r.text,provider:r.providerLabel,model:r.model});saveChat(chat);renderChat(root);$('.zair-status',root).textContent=`Answered through ${r.providerLabel} · ${r.model}`;}catch(e){$('.zair-status',root).textContent=`AI router failed: ${e.message}`;}
  }
  function renderChat(root){const log=$('.zair-chatlog',root);if(!log)return;const chat=loadChat();log.innerHTML=chat.length?chat.map(m=>`<div class="zair-msg ${m.role}"><b>${m.role==='user'?'You':`ZEKE${m.provider?' · '+escapeHtml(m.provider):''}`}</b><div>${escapeHtml(m.content).replace(/\n/g,'<br>')}</div></div>`).join(''):'<div class="zair-empty">Use this only to test the router. The main dashboard conversation panel uses the same router.</div>';log.scrollTop=log.scrollHeight;}

  window.ZekeAIRouter={ask:askAI,config:loadConfig,providers:PROVIDERS,shouldEscalate,open:()=>{const r=$('#zeke-ai-router-root');if(r)$('.zair-panel',r).hidden=false;}};
  document.addEventListener('DOMContentLoaded',createPanel);if(document.readyState!=='loading')createPanel();
})();
