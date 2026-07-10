(() => {
  'use strict';

  const memoryConnections = new Map();

  const PROVIDERS = {
    groq: {
      id:'groq', label:'Groq Free / Developer', freeFirst:true,
      endpoint:'https://api.groq.com/openai/v1/chat/completions',
      models:[
        {id:'llama-3.1-8b-instant', label:'Llama 3.1 8B Instant', tasks:['chat','interpretation','summary']},
        {id:'llama-3.3-70b-versatile', label:'Llama 3.3 70B Versatile', tasks:['chat','interpretation','analysis','summary']},
        {id:'openai/gpt-oss-20b', label:'GPT OSS 20B', tasks:['chat','interpretation','analysis']},
        {id:'openai/gpt-oss-120b', label:'GPT OSS 120B', tasks:['analysis','discovery','chat']},
        {id:'qwen/qwen3-32b', label:'Qwen3 32B', tasks:['analysis','interpretation','chat']},
        {id:'meta-llama/llama-4-scout-17b-16e-instruct', label:'Llama 4 Scout', tasks:['chat','analysis','interpretation']}
      ]
    },
    gemini: {
      id:'gemini', label:'Gemini', freeFirst:true,
      endpoint:'https://generativelanguage.googleapis.com/v1beta/models',
      models:[
        {id:'gemini-2.5-flash', label:'Gemini 2.5 Flash', tasks:['chat','interpretation','analysis','summary','discovery']},
        {id:'gemini-2.5-flash-lite', label:'Gemini 2.5 Flash-Lite', tasks:['chat','interpretation','summary']},
        {id:'gemini-3-flash-preview', label:'Gemini 3 Flash Preview', tasks:['chat','analysis','interpretation']}
      ]
    },
    openrouter: {
      id:'openrouter', label:'OpenRouter', freeFirst:true,
      endpoint:'https://openrouter.ai/api/v1/chat/completions',
      models:[
        {id:'openrouter/free', label:'Free Models Router', tasks:['chat','interpretation','analysis','summary','discovery']},
        {id:'meta-llama/llama-3.2-3b-instruct:free', label:'Llama 3.2 3B Free Variant', tasks:['chat','interpretation','summary']}
      ]
    },
    relay: {
      id:'relay', label:'Secure relay', freeFirst:false, endpoint:'',
      models:[{id:'router', label:'Relay-managed model', tasks:['chat','interpretation','analysis','summary','discovery']}]
    }
  };

  const BASE_SYSTEM = `You are ZEKE, a calm, competent personal context assistant. Be concise, curious, and transparent. Do not invent personal facts. Distinguish facts from interpretations and recommendations. When input is ambiguous, ask a natural-language clarification question instead of guessing. Never expose parser codes or internal schemas to the user. For health and fitness topics, provide decision support rather than medical clearance or diagnosis.`;

  function redactMinimum(text) {
    return String(text || '')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[email]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]')
      .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g, '[phone]');
  }

  function providerDefinition(id) { return PROVIDERS[id] || null; }
  function listProviderDefinitions() { return structuredClone(PROVIDERS); }

  async function loadMetadata() {
    if (!window.ZekeData) return { connections: [] };
    try { return await window.ZekeData.getAIConnections(); }
    catch { return { connections: [] }; }
  }

  async function saveMetadata() {
    if (!window.ZekeData) return;
    const connections = [...memoryConnections.values()].map(c => ({
      provider:c.provider, enabled:c.enabled !== false, model:c.model || '',
      relayEndpoint:c.relayEndpoint || '', privacy:c.privacy || 'minimum-necessary',
      lastTestedAt:c.lastTestedAt || null, lastTestOk:Boolean(c.lastTestOk)
    }));
    try { await window.ZekeData.saveAIConnections({ connections }); } catch {}
  }

  async function hydrateMetadata() {
    const meta = await loadMetadata();
    for (const c of meta.connections || []) {
      memoryConnections.set(c.provider, { ...c, key:'', connected:false });
    }
    return status();
  }

  function status() {
    return {
      providers:[...memoryConnections.values()].map(c => ({
        provider:c.provider, enabled:c.enabled !== false, model:c.model || '',
        connected:Boolean(c.connected && c.key || c.provider === 'relay' && c.relayEndpoint),
        hasSessionKey:Boolean(c.key), lastTestedAt:c.lastTestedAt || null,
        lastTestOk:Boolean(c.lastTestOk), privacy:c.privacy || 'minimum-necessary'
      }))
    };
  }

  async function configure({ provider, key = '', model = '', relayEndpoint = '', privacy = 'minimum-necessary', enabled = true }) {
    const def = providerDefinition(provider);
    if (!def) throw new Error(`Unknown AI provider: ${provider}`);
    const existing = memoryConnections.get(provider) || {};
    const chosenModel = model || existing.model || def.models[0]?.id || '';
    memoryConnections.set(provider, {
      ...existing, provider, key: key || existing.key || '', model: chosenModel,
      relayEndpoint: relayEndpoint || existing.relayEndpoint || '', privacy, enabled,
      connected: provider === 'relay'
        ? Boolean(relayEndpoint || existing.relayEndpoint)
        : Boolean(existing.connected && !key && existing.key)
    });
    await saveMetadata();
    window.dispatchEvent(new CustomEvent('zeke:ai-router-changed', { detail:status() }));
    return status();
  }

  async function remove(provider) {
    memoryConnections.delete(provider);
    await saveMetadata();
    window.dispatchEvent(new CustomEvent('zeke:ai-router-changed', { detail:status() }));
  }

  function selectModel(connection, task) {
    const def = providerDefinition(connection.provider);
    if (!def) return connection.model;
    const configured = def.models.find(m => m.id === connection.model && m.tasks.includes(task));
    if (configured) return configured.id;
    const compatible = def.models.find(m => m.tasks.includes(task));
    return compatible?.id || def.models[0]?.id || connection.model;
  }

  function rankedConnections(task) {
    return [...memoryConnections.values()]
      .filter(c => c.enabled !== false && (c.key || (c.provider === 'relay' && c.relayEndpoint)))
      .map(c => ({ ...c, selectedModel:selectModel(c, task), freeFirst:Boolean(PROVIDERS[c.provider]?.freeFirst) }))
      .sort((a,b) => Number(b.freeFirst) - Number(a.freeFirst));
  }

  async function callOpenAICompatible(connection, messages, { temperature = 0.2, maxTokens = 700 } = {}) {
    const def = providerDefinition(connection.provider);
    const endpoint = connection.provider === 'relay' ? connection.relayEndpoint : def.endpoint;
    const headers = { 'Content-Type':'application/json' };
    if (connection.key) headers.Authorization = `Bearer ${connection.key}`;
    if (connection.provider === 'openrouter') {
      headers['HTTP-Referer'] = location.origin;
      headers['X-Title'] = 'Project ZEKE';
    }
    const response = await fetch(endpoint, {
      method:'POST', headers,
      body:JSON.stringify({ model:connection.selectedModel || connection.model, messages, temperature, max_tokens:maxTokens })
    });
    if (!response.ok) throw new Error(`${def?.label || 'AI'} returned HTTP ${response.status}: ${await response.text()}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || data.output_text || data.text;
    if (!text) throw new Error(`${def?.label || 'AI'} returned no readable text.`);
    return { text, provider:connection.provider, model:data.model || connection.selectedModel || connection.model, raw:data };
  }

  async function callGemini(connection, messages, { temperature = 0.2, maxTokens = 700 } = {}) {
    const model = connection.selectedModel || connection.model || 'gemini-2.5-flash';
    const response = await fetch(`${PROVIDERS.gemini.endpoint}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(connection.key)}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        systemInstruction:{ parts:[{ text:BASE_SYSTEM }] },
        contents:messages.filter(m => m.role !== 'system').map(m => ({
          role:m.role === 'assistant' ? 'model' : 'user', parts:[{ text:String(m.content) }]
        })),
        generationConfig:{ temperature, maxOutputTokens:maxTokens }
      })
    });
    if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}: ${await response.text()}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    if (!text) throw new Error('Gemini returned no readable text.');
    return { text, provider:'gemini', model, raw:data };
  }

  async function callConnection(connection, prompt, options = {}) {
    const privacy = connection.privacy || 'minimum-necessary';
    const safePrompt = privacy === 'full-context' ? String(prompt) : redactMinimum(prompt);
    const messages = [
      { role:'system', content:BASE_SYSTEM },
      ...(options.history || []).slice(-10).map(m => ({ role:m.role === 'zeke' ? 'assistant' : 'user', content:redactMinimum(m.text) })),
      { role:'user', content:safePrompt }
    ];
    if (connection.provider === 'gemini') return callGemini(connection, messages, options);
    return callOpenAICompatible(connection, messages, options);
  }

  async function ask(prompt, { task = 'chat', history = [], temperature = 0.2, maxTokens = 700 } = {}) {
    const candidates = rankedConnections(task);
    if (!candidates.length) throw new Error('No AI service is connected. Open Settings → AI Connections to connect one.');
    const errors = [];
    for (const connection of candidates) {
      try {
        const result = await callConnection(connection, prompt, { history, temperature, maxTokens });
        if (window.ZekeData) {
          window.ZekeData.addAIExchange({
            provider:result.provider, model:result.model, task,
            request_summary:redactMinimum(String(prompt).slice(0, 240)),
            response_summary:String(result.text).slice(0, 500), status:'success'
          }).catch(() => {});
        }
        return result;
      } catch (error) {
        errors.push(`${connection.provider}: ${error.message}`);
        if (window.ZekeData) window.ZekeData.addAIExchange({ provider:connection.provider, model:connection.selectedModel, task, status:'failed', error:error.message }).catch(() => {});
      }
    }
    throw new Error(`All connected AI services failed. ${errors.join(' | ')}`);
  }

  async function interpret(rawText, context = {}) {
    const prompt = `Interpret the user's input for a personal context system. Preserve uncertainty. Do not invent values. If ambiguous, ask one concise natural-language clarification question. Return ONLY JSON with keys: status ("candidate" or "clarify"), summary, clarificationQuestion, confidence (0-1), events (array). Each event may include category, timestamp, raw_text, and structured fields. User input: ${JSON.stringify(rawText)}. Context: ${JSON.stringify(context)}`;
    const result = await ask(prompt, { task:'interpretation', maxTokens:900 });
    const cleaned = result.text.replace(/```json|```/gi,'').trim();
    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch { throw new Error('The AI response could not be parsed safely. ZEKE will not save it automatically.'); }
    return { ...parsed, provider:result.provider, model:result.model };
  }

  async function testProvider(provider) {
    const connection = memoryConnections.get(provider);
    if (!connection || (!connection.key && !(provider === 'relay' && connection.relayEndpoint))) throw new Error('Enter connection details first.');
    const candidate = { ...connection, selectedModel:selectModel(connection, 'chat') };
    const result = await callConnection(candidate, 'Reply with exactly ZEKE_OK', { maxTokens:20, temperature:0 });
    const ok = /ZEKE_OK/i.test(result.text);
    connection.lastTestedAt = new Date().toISOString();
    connection.lastTestOk = ok;
    connection.connected = ok;
    memoryConnections.set(provider, connection);
    await saveMetadata();
    if (!ok) throw new Error(`Connection responded, but the validation response was unexpected: ${result.text.slice(0,120)}`);
    return { ok:true, provider:result.provider, model:result.model };
  }

  window.ZekeAIRouter = {
    hydrateMetadata, configure, remove, status, ask, interpret, testProvider,
    listProviderDefinitions, providerDefinition
  };
})();
