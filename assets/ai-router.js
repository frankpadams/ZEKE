(() => {
  'use strict';

  const memoryConnections = new Map();

  const PROVIDERS = {
    groq:{id:'groq',label:'Groq',freeFirst:true,kind:'openai',endpoint:'https://api.groq.com/openai/v1/chat/completions',suggestedModels:['llama-3.3-70b-versatile','llama-3.1-8b-instant']},
    gemini:{id:'gemini',label:'Google Gemini',freeFirst:true,kind:'gemini',endpoint:'https://generativelanguage.googleapis.com/v1beta/models',suggestedModels:['gemini-2.5-flash','gemini-2.5-flash-lite']},
    openrouter:{id:'openrouter',label:'OpenRouter',freeFirst:true,kind:'openai',endpoint:'https://openrouter.ai/api/v1/chat/completions',suggestedModels:['openrouter/free']},
    openai:{id:'openai',label:'OpenAI',freeFirst:false,kind:'openai',endpoint:'https://api.openai.com/v1/chat/completions',suggestedModels:['gpt-5-mini','gpt-4.1-mini']},
    anthropic:{id:'anthropic',label:'Anthropic Claude',freeFirst:false,kind:'anthropic',endpoint:'https://api.anthropic.com/v1/messages',suggestedModels:['claude-sonnet-4-5','claude-haiku-4-5']},
    mistral:{id:'mistral',label:'Mistral AI',freeFirst:false,kind:'openai',endpoint:'https://api.mistral.ai/v1/chat/completions',suggestedModels:['mistral-small-latest','mistral-medium-latest']},
    together:{id:'together',label:'Together AI',freeFirst:false,kind:'openai',endpoint:'https://api.together.xyz/v1/chat/completions',suggestedModels:['meta-llama/Llama-3.3-70B-Instruct-Turbo']},
    perplexity:{id:'perplexity',label:'Perplexity Sonar',freeFirst:false,kind:'openai',endpoint:'https://api.perplexity.ai/v1/sonar',suggestedModels:['sonar','sonar-pro']},
    cerebras:{id:'cerebras',label:'Cerebras',freeFirst:true,kind:'openai',endpoint:'https://api.cerebras.ai/v1/chat/completions',suggestedModels:['llama3.1-8b']},
    deepseek:{id:'deepseek',label:'DeepSeek',freeFirst:false,kind:'openai',endpoint:'https://api.deepseek.com/chat/completions',suggestedModels:['deepseek-chat','deepseek-reasoner']},
    fireworks:{id:'fireworks',label:'Fireworks AI',freeFirst:false,kind:'openai',endpoint:'https://api.fireworks.ai/inference/v1/chat/completions',suggestedModels:['accounts/fireworks/models/llama-v3p3-70b-instruct']},
    xai:{id:'xai',label:'xAI Grok',freeFirst:false,kind:'openai',endpoint:'https://api.x.ai/v1/chat/completions',suggestedModels:['grok-3-mini','grok-3']},
    ollama:{id:'ollama',label:'Ollama (desktop local)',freeFirst:true,kind:'ollama',endpoint:'http://localhost:11434/api/chat',suggestedModels:['llama3.2','qwen3']},
    azure:{id:'azure',label:'Microsoft Azure AI / Azure OpenAI',freeFirst:false,kind:'relay',requiresEndpoint:true,suggestedModels:['router']},
    bedrock:{id:'bedrock',label:'Amazon Bedrock',freeFirst:false,kind:'relay',requiresEndpoint:true,suggestedModels:['router']},
    custom:{id:'custom',label:'OpenAI-compatible endpoint',freeFirst:false,kind:'openai-custom',requiresEndpoint:true,suggestedModels:['']}
  };

  const BASE_SYSTEM = `You are ZEKE, a calm, competent personal context assistant. Be concise, curious, transparent, and nonjudgmental. Use conversation context. Do not invent personal facts. Distinguish observations from interpretations and recommendations. When input is ambiguous, ask one concise natural-language clarification question instead of guessing. Never expose parser codes or internal schemas. For health and fitness topics, provide decision support rather than diagnosis or medical clearance.`;

  function redactMinimum(text) {
    return String(text || '')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[email]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]')
      .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g, '[phone]');
  }

  const clone = v => structuredClone(v);
  function providerDefinition(id){return PROVIDERS[id] || null;}
  function listProviderDefinitions(){return clone(PROVIDERS);}

  async function loadMetadata(){
    if(!window.ZekeData) return {connections:[]};
    try{return await ZekeData.getAIConnections();}catch{return {connections:[]};}
  }

  async function saveMetadata(){
    if(!window.ZekeData) return;
    const connections=[...memoryConnections.values()].map(c=>({
      provider:c.provider,enabled:c.enabled!==false,model:c.model||'',endpoint:c.endpoint||'',privacy:c.privacy||'minimum-necessary',lastTestedAt:c.lastTestedAt||null,lastTestOk:Boolean(c.lastTestOk)
    }));
    try{await ZekeData.saveAIConnections({connections});}catch{}
  }

  async function hydrateMetadata(){
    const meta=await loadMetadata();
    for(const c of meta.connections||[]) memoryConnections.set(c.provider,{...c,key:'',connected:false});
    return status();
  }

  function status(){
    return {providers:[...memoryConnections.values()].map(c=>({
      provider:c.provider,enabled:c.enabled!==false,model:c.model||'',endpoint:c.endpoint||'',connected:Boolean(c.connected),hasSessionKey:Boolean(c.key),lastTestedAt:c.lastTestedAt||null,lastTestOk:Boolean(c.lastTestOk),privacy:c.privacy||'minimum-necessary'
    }))};
  }

  async function configure({provider,key='',model='',endpoint='',privacy='minimum-necessary',enabled=true}){
    const def=providerDefinition(provider); if(!def) throw new Error(`Unknown AI provider: ${provider}`);
    const existing=memoryConnections.get(provider)||{};
    memoryConnections.set(provider,{...existing,provider,key:key||existing.key||'',model:model||existing.model||def.suggestedModels?.[0]||'',endpoint:endpoint||existing.endpoint||def.endpoint||'',privacy,enabled,connected:false});
    await saveMetadata();
    window.dispatchEvent(new CustomEvent('zeke:ai-router-changed',{detail:status()}));
    return status();
  }

  async function remove(provider){memoryConnections.delete(provider);await saveMetadata();window.dispatchEvent(new CustomEvent('zeke:ai-router-changed',{detail:status()}));}

  function taskWeight(task,c){
    let n=c.freeFirst?100:0;
    if(task==='research' && c.provider==='perplexity') n+=60;
    if(task==='interpretation' && ['groq','gemini','anthropic','openai'].includes(c.provider)) n+=30;
    if(task==='analysis' && ['anthropic','openai','gemini','groq'].includes(c.provider)) n+=25;
    if(c.lastTestOk) n+=20;
    return n;
  }

  function rankedConnections(task){
    return [...memoryConnections.values()]
      .filter(c=>c.enabled!==false && (PROVIDERS[c.provider]?.kind==='ollama' || c.key || (PROVIDERS[c.provider]?.requiresEndpoint && c.endpoint)))
      .map(c=>({...c,freeFirst:Boolean(PROVIDERS[c.provider]?.freeFirst)}))
      .sort((a,b)=>taskWeight(task,b)-taskWeight(task,a));
  }

  function buildMessages(prompt,history=[],privacy='minimum-necessary'){
    const clean=t=>privacy==='full-context'?String(t||''):redactMinimum(t);
    return [
      {role:'system',content:BASE_SYSTEM},
      ...history.slice(-16).map(m=>({role:m.role==='zeke'?'assistant':'user',content:clean(m.text)})),
      {role:'user',content:clean(prompt)}
    ];
  }

  async function callOpenAI(connection,messages,{temperature=.2,maxTokens=900}={}){
    const def=PROVIDERS[connection.provider]; const endpoint=connection.endpoint||def.endpoint;
    if(!endpoint) throw new Error('This connection requires an endpoint URL.');
    const headers={'Content-Type':'application/json'}; if(connection.key) headers.Authorization=`Bearer ${connection.key}`;
    if(connection.provider==='openrouter'){headers['HTTP-Referer']=location.origin;headers['X-Title']='Project ZEKE';}
    const response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({model:connection.model,messages,temperature,max_tokens:maxTokens})});
    if(!response.ok) throw new Error(`${def.label} returned HTTP ${response.status}: ${await response.text()}`);
    const data=await response.json(); const text=data.choices?.[0]?.message?.content||data.output_text||data.text;
    if(!text) throw new Error(`${def.label} returned no readable text.`);
    return {text,provider:connection.provider,model:data.model||connection.model,raw:data};
  }

  async function callGemini(connection,messages,{temperature=.2,maxTokens=900}={}){
    const model=connection.model||'gemini-2.5-flash';
    const response=await fetch(`${PROVIDERS.gemini.endpoint}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(connection.key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:BASE_SYSTEM}]},contents:messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:String(m.content)}]})),generationConfig:{temperature,maxOutputTokens:maxTokens}})});
    if(!response.ok) throw new Error(`Gemini returned HTTP ${response.status}: ${await response.text()}`);
    const data=await response.json(); const text=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    if(!text) throw new Error('Gemini returned no readable text.');
    return {text,provider:'gemini',model,raw:data};
  }

  async function callAnthropic(connection,messages,{temperature=.2,maxTokens=900}={}){
    const system=messages.find(m=>m.role==='system')?.content||BASE_SYSTEM;
    const response=await fetch(PROVIDERS.anthropic.endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-api-key':connection.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:connection.model,max_tokens:maxTokens,temperature,system,messages:messages.filter(m=>m.role!=='system').map(m=>({role:m.role,content:m.content}))})});
    if(!response.ok) throw new Error(`Anthropic returned HTTP ${response.status}: ${await response.text()}`);
    const data=await response.json(); const text=(data.content||[]).map(x=>x.text||'').join('');
    if(!text) throw new Error('Anthropic returned no readable text.');
    return {text,provider:'anthropic',model:data.model||connection.model,raw:data};
  }

  async function callOllama(connection,messages,{temperature=.2}={}){
    const endpoint=connection.endpoint||PROVIDERS.ollama.endpoint;
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:connection.model||'llama3.2',messages,stream:false,options:{temperature}})});
    if(!response.ok) throw new Error(`Ollama returned HTTP ${response.status}: ${await response.text()}`);
    const data=await response.json(); const text=data.message?.content||data.response;
    if(!text) throw new Error('Ollama returned no readable text.');
    return {text,provider:'ollama',model:data.model||connection.model,raw:data};
  }

  async function callConnection(connection,prompt,options={}){
    const messages=buildMessages(prompt,options.history||[],connection.privacy||'minimum-necessary');
    const kind=PROVIDERS[connection.provider]?.kind;
    if(kind==='gemini') return callGemini(connection,messages,options);
    if(kind==='anthropic') return callAnthropic(connection,messages,options);
    if(kind==='ollama') return callOllama(connection,messages,options);
    return callOpenAI(connection,messages,options);
  }

  async function ask(prompt,{task='chat',history=[],temperature=.2,maxTokens=900}={}){
    const candidates=rankedConnections(task); if(!candidates.length) throw new Error('No AI service is connected. Open Settings → AI Connections to connect one.');
    const errors=[];
    for(const c of candidates){
      try{
        const result=await callConnection(c,prompt,{history,temperature,maxTokens});
        if(window.ZekeData) ZekeData.addAIExchange({provider:result.provider,model:result.model,task,request_summary:redactMinimum(String(prompt).slice(0,240)),response_summary:String(result.text).slice(0,500),status:'success'}).catch(()=>{});
        return result;
      }catch(error){errors.push(`${c.provider}: ${error.message}`);if(window.ZekeData) ZekeData.addAIExchange({provider:c.provider,model:c.model,task,status:'failed',error:error.message}).catch(()=>{});}
    }
    throw new Error(`All connected AI services failed. ${errors.join(' | ')}`);
  }

  async function interpret(rawText,context={}){
    const history=context.history||[];
    const compactContext={...context}; delete compactContext.history;
    const prompt=`Interpret the user's latest turn for a personal context system. Use the preceding conversation and verified context. Preserve uncertainty; do not invent values. If ambiguous, ask one concise natural-language clarification question. Return ONLY JSON with keys: status (\"candidate\" or \"clarify\"), summary, clarificationQuestion, confidence (0-1), events (array). Each event may include category, timestamp, raw_text, and structured fields. Latest user input: ${JSON.stringify(rawText)}. Verified context: ${JSON.stringify(compactContext)}`;
    const result=await ask(prompt,{task:'interpretation',history,maxTokens:1100});
    const cleaned=result.text.replace(/```json|```/gi,'').trim(); let parsed;
    try{parsed=JSON.parse(cleaned);}catch{throw new Error('The AI response could not be parsed safely. ZEKE will not save it automatically.');}
    return {...parsed,provider:result.provider,model:result.model};
  }

  async function analyzeCoach(context){
    const prompt=`Analyze the following verified workout history and relevant context. Give one concise coaching observation, one recommendation, confidence (low/moderate/high), limitations, and the evidence rationale. Do not invent data or provide medical clearance. Return ONLY JSON with keys observation, recommendation, confidence, limitations, rationale. Context: ${JSON.stringify(context)}`;
    const result=await ask(prompt,{task:'analysis',maxTokens:1100});
    const cleaned=result.text.replace(/```json|```/gi,'').trim(); let parsed;
    try{parsed=JSON.parse(cleaned);}catch{throw new Error('AI coaching response could not be parsed safely.');}
    return {...parsed,provider:result.provider,model:result.model};
  }

  async function testProvider(provider){
    const c=memoryConnections.get(provider); const def=PROVIDERS[provider];
    if(!c) throw new Error('Enter connection details first.');
    if(def.kind!=='ollama' && !c.key && !def.requiresEndpoint) throw new Error('Enter an API key first.');
    if(def.requiresEndpoint && !c.endpoint) throw new Error('Enter the secure relay or service endpoint first.');
    const result=await callConnection(c,'Reply with exactly ZEKE_OK',{maxTokens:20,temperature:0});
    const ok=/ZEKE_OK/i.test(result.text); c.lastTestedAt=new Date().toISOString(); c.lastTestOk=ok; c.connected=ok; memoryConnections.set(provider,c); await saveMetadata();
    if(!ok) throw new Error(`Connection responded, but validation was unexpected: ${result.text.slice(0,120)}`);
    return {ok:true,provider:result.provider,model:result.model};
  }

  window.ZekeAIRouter={hydrateMetadata,configure,remove,status,ask,interpret,analyzeCoach,testProvider,listProviderDefinitions,providerDefinition};
})();
