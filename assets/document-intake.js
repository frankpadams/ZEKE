(() => {
  'use strict';
  const PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.mjs';
  const PDFWORKER='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';
  const TESS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/+esm';
  const extOf=f=>String(f?.name||'').split('.').pop().toLowerCase();
  const imageExt=new Set(['png','jpg','jpeg','webp','bmp','gif']);
  const safeProgress=(fn,msg)=>{try{fn?.(msg)}catch{}};
  async function ocrCanvas(canvas,onProgress,label='image'){
    safeProgress(onProgress,`Reading text from ${label}…`);
    const mod=await import(TESS); const recognize=mod.recognize||mod.default?.recognize;
    if(!recognize) throw new Error('OCR library could not initialize.');
    const result=await recognize(canvas,'eng',{logger:m=>{if(m.status&&m.progress!=null)safeProgress(onProgress,`${m.status} · ${Math.round(m.progress*100)}%`)}});
    return String(result?.data?.text||'').trim();
  }
  async function imageToCanvas(file){
    const url=URL.createObjectURL(file); try{
      const img=new Image(); await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(new Error('The image could not be decoded.'));img.src=url});
      const max=2200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
      const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));
      c.getContext('2d',{willReadFrequently:true}).drawImage(img,0,0,c.width,c.height);return c;
    } finally {URL.revokeObjectURL(url)}
  }
  async function extractPDF(file,onProgress){
    safeProgress(onProgress,'Reading embedded PDF text…'); const pdfjs=await import(PDFJS);pdfjs.GlobalWorkerOptions.workerSrc=PDFWORKER;
    const bytes=new Uint8Array(await file.arrayBuffer());const pdf=await pdfjs.getDocument({data:bytes}).promise;const pages=[],limit=Math.min(pdf.numPages,40);
    for(let i=1;i<=limit;i++){safeProgress(onProgress,`Reading PDF page ${i} of ${limit}…`);const page=await pdf.getPage(i),content=await page.getTextContent();pages.push(content.items.map(x=>x.str||'').join(' '));}
    let text=pages.join('\n\n').trim();let method='pdf-embedded-text';
    if(text.replace(/\s/g,'').length<120){
      method='pdf-rendered-ocr';const ocr=[];const ocrLimit=Math.min(pdf.numPages,6);
      for(let i=1;i<=ocrLimit;i++){const page=await pdf.getPage(i),viewport=page.getViewport({scale:1.8}),canvas=document.createElement('canvas');canvas.width=Math.round(viewport.width);canvas.height=Math.round(viewport.height);await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;ocr.push(await ocrCanvas(canvas,onProgress,`PDF page ${i}`));}
      text=ocr.join('\n\n').trim();
    }
    return {text,method,page_count:pdf.numPages,pages_read:method==='pdf-embedded-text'?limit:Math.min(pdf.numPages,6)};
  }
  async function extractFile(file,onProgress){
    const ext=extOf(file),mime=String(file.type||''),hashBytes=await file.arrayBuffer(),hash=await crypto.subtle.digest('SHA-256',hashBytes),sha256=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');let out;
    if(ext==='pdf'||mime==='application/pdf')out=await extractPDF(file,onProgress);
    else if(imageExt.has(ext)||mime.startsWith('image/')){const canvas=await imageToCanvas(file);out={text:await ocrCanvas(canvas,onProgress,'screenshot/image'),method:'image-ocr',page_count:1,pages_read:1};}
    else out={text:await file.text(),method:'embedded-text',page_count:1,pages_read:1};
    const classification=window.ZekeIngestion?.classify?.({filename:file.name,text:out.text})||{document_type:'unknown',confidence:'low'};
    return {...out,classification,filename:file.name,mime_type:file.type||'',size:file.size,sha256,captured_at:new Date().toISOString(),preview:out.text.slice(0,6000)};
  }
  function extractionPrompt(x){
    return `You are ZEKE's document extraction consultant. Convert the supplied source text into proposed structured health events. Do not diagnose. Do not invent values. Use null for absent values. Preserve source wording and units. Output JSON only.\n\nDocument classification: ${JSON.stringify(x.classification)}\nFilename: ${x.filename}\nExtraction method: ${x.method}\n\nFor DEXA/DXA, when present capture: scan_date, facility, weight, body_fat_pct, fat_mass, lean_mass, bone_mineral_content, total_body_bmd, VAT mass/volume/area, android/gynoid values and ratio, regional body composition, site-specific BMD/T-score/Z-score, source flags/reference interpretation. Keep each reported metric source-traceable.\nFor imaging, capture report date, body area, modality, findings, impression and explicit clinician/radiologist statements without turning them into new diagnoses.\nFor labs, preserve result, unit, source reference range, flags and specimen/result date.\nFor medication lists, preserve medication/product, dose, unit, route, frequency and status when stated.\nFor vaccination/immunotherapy, preserve product/antigen, dose/session, date, site/side, location and reactions when stated.\n\nRequired shape:\n{\n  "document_type":"", "confidence":"high|moderate|low", "summary":"",\n  "events":[{"category":"measurement|lab|imaging|medication|vaccination|immunotherapy|condition|other","timestamp":"YYYY-MM-DD or null","raw_text":"short source-grounded description","structured":{},"source_excerpt":""}],\n  "uncertainties":[""], "questions":[{"question":"","why_it_matters":""}]\n}\n\nSource text:\n${x.text.slice(0,60000)}`;
  }
  function jsonFromText(text){const raw=String(text||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();try{return JSON.parse(raw)}catch{const a=raw.indexOf('{'),b=raw.lastIndexOf('}');if(a>=0&&b>a)return JSON.parse(raw.slice(a,b+1));throw new Error('The extraction response was not valid JSON.')}}
  async function propose(extraction){
    const prompt=extractionPrompt(extraction);const connected=window.ZekeAIRouter?.status?.().providers?.some(p=>p.connected);
    if(!connected)return {manual:true,prompt};
    const result=await ZekeAIRouter.ask(prompt,{task:'interpretation',temperature:0,maxTokens:3600});return {manual:false,result:jsonFromText(result.text),provider:result.provider,model:result.model,prompt};
  }
  window.ZekeDocumentIntake=Object.freeze({extractFile,extractionPrompt,propose,jsonFromText,schemaVersion:1});
})();
