
const KEY="zeke_hosted_ai_alpha_02";
const GEMINI_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{
  view:"home",
  response:null,
  log:[],
  settings:{geminiKey:"", aiEnabled:false, redact:true},
  memory:[
    ["Medication synonyms","Atorvastatin, Lipitor, and statin can refer to the same medication when appropriate."],
    ["Allergy immunotherapy","Dust mites, dog dander, cat dander, and ragweed; shots roughly monthly but scheduled independently."],
    ["Nurri routine","1–2 chocolate Nurri shakes daily, 30g protein each; food first, protein-support tag second."]
  ],
  productGaps:[]
};
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function setView(v){state.view=v;state.response=null;save();render()}
function render(){
 document.getElementById("app").innerHTML=`<div class=app>
 <div class=top><div class=brand>ZEKE</div><small>Hosted AI Alpha 0.2</small></div>
 <div class=shell>
 <nav class=rail>
 ${nav("home","🏠","Home")}${nav("timeline","📖","Timeline")}${nav("health","❤️","Health")}${nav("ai","🤖","AI")}${nav("evidence","📚","Evidence")}${nav("memory","🧠","Memory")}${nav("gaps","🛠️","Gaps")}${nav("settings","⚙️","Settings")}
 </nav>
 <main class=main>${main()}</main>
 <aside class=side>${widgets()}</aside>
 </div></div>`;
}
function nav(v,i,t){return `<button class="${state.view===v?'on':''}" onclick="setView('${v}')" title="${t}">${i}</button>`}
function main(){
 if(state.view==="home")return home();
 if(state.view==="timeline")return page("Timeline", timeline());
 if(state.view==="health")return page("Health", health());
 if(state.view==="ai")return page("AI Setup", aiPage());
 if(state.view==="evidence")return page("Evidence", evidence());
 if(state.view==="memory")return page("Memory Inspector", memory());
 if(state.view==="gaps")return page("Product Gaps", gaps());
 if(state.view==="settings")return page("Settings", settings());
}
function home(){
 if(state.response)return `<section class=head><h1>ZEKE response</h1></section><section class=ask>${askbar()}</section><section class=content>${answer()}</section>`;
 return `<section class=head><h1>Good morning, Frank.</h1><div class=chips><span class=chip>${state.settings.aiEnabled?'Gemini enabled':'AI not connected'}</span><span class=chip>Atorvastatin not confirmed</span><span class=chip>Protein tracking ready</span></div></section>
 <section class=ask>${askbar()}</section>
 <section class=content>
 <div class=grid>
 <div class=card><h2>✅ Today</h2><ul><li>Log meds/supplements</li><li>Log Nurri shakes</li><li>Log workout or rest day</li></ul></div>
 <div class=card><h2>📅 Upcoming</h2><ul><li>Calendar connection comes next</li><li>No scheduled item is assumed completed</li></ul></div>
 <div class=card><h2>🧭 Suggestions</h2><p>Use this build to test whether live AI makes ZEKE feel meaningfully smarter.</p></div>
 <div class=card><h2>🔍 Try this</h2><ul><li>Show my Lipitor compliance graph</li><li>I had two Nurri shakes</li><li>I have not taken atorvastatin yet</li><li>What should ZEKE remember from this?</li></ul></div>
 </div></section>`;
}
function askbar(){return `<div class=askline><input id=q placeholder="Tell ZEKE…" onkeydown="if(event.key==='Enter')ask()"><button class=send onclick=ask()>Send</button></div>`}
async function ask(){
 const q=document.getElementById("q")?.value.trim(); if(!q)return;
 state.response={q,title:"Thinking…",body:"ZEKE is processing your request.",type:"Pending",ai:false,canSave:false}; save(); render();
 let local=interpretLocal(q);
 if(state.settings.aiEnabled && state.settings.geminiKey){
   try{
     let ai=await askGemini(q, local);
     state.response={q,title:ai.title||local.title,body:ai.body||local.body,type:ai.type||local.type,ai:true,canSave:!!ai.canSave,missingCapability:ai.missingCapability||local.missingCapability||false,devNote:ai.devNote||local.devNote||""};
   }catch(e){
     state.response={q,title:local.title,body:local.body+"\\n\\nAI fallback: Gemini call failed. "+e.message,type:local.type,ai:false,canSave:true,missingCapability:local.missingCapability,devNote:local.devNote};
   }
 }else{
   state.response=local;
 }
 if(state.response.missingCapability) recordGap(q,state.response);
 save(); render();
}
function interpretLocal(q){
 let l=q.toLowerCase();
 if(l.includes("compliance")||l.includes("adherence")||l.includes("graph")){
   if(l.includes("lipitor")||l.includes("atorvastatin")||l.includes("statin")){
     return {q,title:"Medication compliance graph not built yet",body:"I understand the request: you want a graph showing atorvastatin/Lipitor adherence over time. I do not yet have that visualization, so I am recording it as a product gap.",type:"Product gap",ai:false,canSave:false,missingCapability:true,devNote:"Medication adherence visualization: daily taken/not taken, weekly %, monthly %, streaks, missed doses."};
   }
 }
 if((l.includes("not")||l.includes("haven"))&&(l.includes("atorvastatin")||l.includes("lipitor")||l.includes("statin")||l.includes("creatine"))){
   return {q,title:"Not-yet-taken status",body:"I understood this as NOT yet taken as of now, not as a missed dose. This is time-bound.",type:"Observation",ai:false,canSave:true};
 }
 if(l.includes("atorvastatin")||l.includes("lipitor")||l.includes("statin")){
   return {q,title:"Atorvastatin / Lipitor entry",body:"I understand atorvastatin, Lipitor, and statin as referring to the same medication when appropriate. If multiple statins existed, ZEKE should ask.",type:"Medication",ai:false,canSave:true};
 }
 if(l.includes("nurri")||l.includes("protein shake")){
   return {q,title:"Nurri protein shake entry",body:"I would count Nurri as food first, with a protein-support tag. It contributes to daily protein.",type:"Food",ai:false,canSave:true};
 }
 if(l.includes("allergy")||l.includes("immunotherapy")||l.includes("ragweed")||l.includes("dust")){
   return {q,title:"Allergy immunotherapy entry",body:"I understand allergy shots as roughly monthly but scheduled independently. ZEKE should not assume a fixed recurrence.",type:"Health",ai:false,canSave:true};
 }
 return {q,title:"ZEKE answer",body:"I can respond locally or, if Gemini is connected, use AI for a smarter interpretation. If this was not what you wanted, mark it as a product gap.",type:"Observation",ai:false,canSave:true};
}
async function askGemini(q, local){
 const payload={
   contents:[{role:"user",parts:[{text:`You are ZEKE, a privacy-conscious personal intelligence assistant in early alpha.

Rules:
- Do not give medical/legal/mechanical/financial advice.
- Answer as decision-support only.
- Distinguish facts, observations, recommendations, and missing capabilities.
- If the user asks for a capability the app cannot do, label it missingCapability=true.
- Keep response concise.
- Return JSON only with keys: title, body, type, canSave, missingCapability, devNote.

User memories:
- Atorvastatin, Lipitor, and statin may refer to the same medication when appropriate.
- Allergy immunotherapy for dust mites, dog dander, cat dander, ragweed; appointments scheduled independently.
- Nurri chocolate shakes: 30g protein each, food first/protein-support tag.

Local interpretation:
${JSON.stringify(local)}

User request:
${redact(q)}`}] }]
 };
 const res=await fetch(GEMINI_URL+encodeURIComponent(state.settings.geminiKey),{
   method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
 });
 if(!res.ok)throw new Error("HTTP "+res.status);
 const data=await res.json();
 const text=data?.candidates?.[0]?.content?.parts?.[0]?.text||"";
 const cleaned=text.replace(/```json|```/g,"").trim();
 try{return JSON.parse(cleaned)}catch(e){return {title:"Gemini response",body:text,type:"AI",canSave:false,missingCapability:false,devNote:"Gemini returned non-JSON."}}
}
function redact(s){
 if(!state.settings.redact)return s;
 return s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/ig,"[email]")
         .replace(/\\b\\d{3}-\\d{2}-\\d{4}\\b/g,"[ssn]")
         .replace(/\\b\\d{10,}\\b/g,"[number]");
}
function recordGap(q,r){
 const key=(r.devNote||r.title||q).toLowerCase().slice(0,80);
 const existing=state.productGaps.find(g=>g.key===key);
 if(existing){existing.count++; existing.last=new Date().toLocaleString(); existing.examples.unshift(q);}
 else state.productGaps.unshift({key,title:r.title,devNote:r.devNote||"",count:1,first:new Date().toLocaleString(),last:new Date().toLocaleString(),examples:[q]});
}
function answer(){
 let r=state.response;
 return `<div class=answer><button class=back onclick="state.response=null;save();render()">← Back to Home</button>
 <div class="card ${r.missingCapability?'warn':''}"><h2>${esc(r.title)}</h2><p>${esc(r.body).replace(/\\n/g,"<br>")}</p><p class=small>Source: ${r.ai?'Gemini + local context':'Local rules'} • Type: ${esc(r.type)}</p>
 ${r.devNote?`<div class=card><h3>Developer signal</h3><p>${esc(r.devNote)}</p></div>`:""}
 <div class=actions>${r.canSave?'<button class=primary onclick=saveResp()>Save to Timeline</button>':''}<button class=secondary onclick=markGap()>Not what I wanted</button><button class=secondary onclick="state.response=null;save();render()">Done</button></div></div></div>`;
}
function saveResp(){
 state.log.unshift({date:new Date().toLocaleString(),title:state.response.title,text:state.response.q,body:state.response.body,type:state.response.type,source:state.response.ai?"Gemini":"Local"});
 state.response=null; save(); render();
}
function markGap(){
 let note=prompt("What were you expecting ZEKE to do?");
 if(!note)return;
 recordGap(state.response?.q||"Unknown request",{title:"User-marked gap",devNote:note});
 save(); setView("gaps");
}
function page(title,body){return `<section class=head><h1>${title}</h1></section><section class=ask>${askbar()}</section><section class=content>${body}</section>`}
function timeline(){return `<div class=card><h2>Recent entries</h2>${state.log.length?state.log.map(x=>`<div class=logitem><b>${esc(x.title)}</b><div class=small>${esc(x.date)} • ${esc(x.type)} • ${esc(x.source||"Local")}</div><p>${esc(x.text)}</p></div>`).join(""):"<p>No entries yet.</p>"}</div>`}
function health(){return `<div class=grid><div class=card><h2>Medications</h2><p>Atorvastatin/Lipitor/statin normalization is active. Compliance graph is intentionally logged as a product gap if requested.</p></div><div class=card><h2>Nutrition</h2><p>Nurri shakes count as food/protein intake.</p></div><div class=card><h2>Allergies</h2><p>Dust mites, dog/cat dander, ragweed. Immunotherapy appointments are not assumed recurring.</p></div><div class=card><h2>Body composition</h2><p>Weight, fat %, lean mass, BMI, waist, and confidence/source should live together.</p></div></div>`}
function aiPage(){return `<div class=card><h2>Gemini API key</h2><p class=small>Personal Alpha only: browser API keys can be visible. Use your own key, restrict it if possible, and do not use this approach for public beta.</p><input class=full id=key value="${esc(state.settings.geminiKey)}" placeholder="Paste Gemini API key"><div class=actions><button class=primary onclick=saveKey()>Save key</button><button class=secondary onclick=testAI()>Test AI</button></div></div><div class="card ${state.settings.aiEnabled?'ok':'warn'}"><h2>Status</h2><p>${state.settings.aiEnabled?'Gemini is enabled.':'Gemini is not enabled yet.'}</p><label><input type=checkbox ${state.settings.redact?'checked':''} onchange="state.settings.redact=this.checked;save();render()"> Redact obvious identifiers before sending to AI</label></div>`}
function saveKey(){state.settings.geminiKey=document.getElementById("key").value.trim();state.settings.aiEnabled=!!state.settings.geminiKey;save();render()}
async function testAI(){document.getElementById("key")&&(state.settings.geminiKey=document.getElementById("key").value.trim());state.settings.aiEnabled=!!state.settings.geminiKey;save();state.response={q:"AI test",title:"Testing Gemini…",body:"Sending a short test prompt.",type:"Pending",ai:false};render();try{let ai=await askGemini("Say ZEKE Gemini connection works in one sentence.",{title:"Test",body:"Test"});state.response={q:"AI test",title:"Gemini test result",body:ai.body||JSON.stringify(ai),type:"AI",ai:true,canSave:false};}catch(e){state.response={q:"AI test",title:"Gemini test failed",body:e.message,type:"Error",ai:false,canSave:false};}save();render()}
function evidence(){return `<div class=grid><div class=card><h2>Evidence cards</h2><p>Future evidence cards will cache research summaries, DOI/PubMed links, strength of evidence, and last-checked date.</p></div><div class=card><h2>AI use</h2><p>AI should summarize/update evidence only when requested or scheduled, not every dashboard load.</p></div><div class=card><h2>Personal vs published</h2><p>ZEKE distinguishes your data from peer-reviewed studies and AI interpretation.</p></div></div>`}
function memory(){return `<div class=grid>${state.memory.map(m=>`<div class=card><h2>${esc(m[0])}</h2><p>${esc(m[1])}</p></div>`).join("")}</div>`}
function gaps(){return `<div class=card><h2>Product gaps</h2><p>These are local-only development signals. They do not change ZEKE automatically.</p>${state.productGaps.length?state.productGaps.map(g=>`<div class=logitem><b>${esc(g.title)}</b><div class=small>Count: ${g.count} • Last: ${esc(g.last)}</div><p>${esc(g.devNote)}</p><p class=small>Example: ${esc(g.examples[0])}</p></div>`).join(""):"<p>No gaps recorded yet. Try asking: Show my Lipitor compliance graph.</p>"}</div>`}
function settings(){return `<div class=card><h2>Hosted Alpha</h2><p>Deploy this folder to GitHub Pages. Data is still local browser storage until Google Drive is connected.</p><button class=secondary onclick="localStorage.removeItem(KEY);location.reload()">Reset local data</button></div>`}
function widgets(){
 return `<div class=widget onclick="setView('ai')"><div class=wtop><span>🤖 Gemini</span><span>↗</span></div><div class=wval>${state.settings.aiEnabled?'On':'Off'}</div><div class=small>Free-tier test</div></div>
 <div class=widget onclick="setView('timeline')"><div class=wtop><span>📖 Timeline</span><span>↗</span></div><div class=wval>${state.log.length}</div><div class=small>Saved entries</div></div>
 <div class=widget onclick="setView('gaps')"><div class=wtop><span>🛠️ Gaps</span><span>↗</span></div><div class=wval>${state.productGaps.length}</div><div class=small>Unmet requests</div></div>
 <div class=widget onclick="setView('memory')"><div class=wtop><span>🧠 Memory</span><span>↗</span></div><div class=wval>${state.memory.length}</div><div class=small>Known rules</div></div>`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
render();
