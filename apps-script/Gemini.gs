function interpretCapture_(rawText) {
  const apiKey = getScriptProp_('GOOGLE_AI_API_KEY');
  if (!apiKey) return localInterpret_(rawText);

  const model = getScriptProp_('GEMINI_MODEL', 'gemini-2.5-flash');
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(apiKey);
  const prompt = buildInterpretPrompt_(rawText);
  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
  };
  try {
    const res = UrlFetchApp.fetch(endpoint, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const code = res.getResponseCode();
    const text = res.getContentText();
    if (code < 200 || code >= 300) throw new Error('Gemini HTTP ' + code + ': ' + text.slice(0, 500));
    const json = JSON.parse(text);
    const outText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return { ai_used: true, result: JSON.parse(outText), error: '' };
  } catch (err) {
    const fallback = localInterpret_(rawText);
    fallback.error = String(err);
    return fallback;
  }
}

function buildInterpretPrompt_(rawText) {
  return `You are ZEKE's interpretation layer. Convert the user note into JSON only. Preserve uncertainty. Do not give medical, legal, financial, or clinical advice. Use decision-support language only.

Return this JSON shape:
{
  "events": [
    {"domain":"Health|Fitness|Pets|Projects|Home|Other", "category":"medication|measurement|workout|symptom|routine|note|other", "subject_id":"PERSON-001", "display_title":"", "event_date":"YYYY-MM-DD or blank", "event_time":"HH:mm or blank", "raw_note":"", "structured":{}, "confidence":"confirmed|inferred|needs_review"}
  ],
  "questions": [],
  "considerations": []
}

Today is ${todayIso_()} in ${ZEKE.TZ}.
User note:
${rawText}`;
}

function localInterpret_(rawText) {
  const t = String(rawText || '').trim();
  const lower = t.toLowerCase();
  const events = [];
  const today = todayIso_();
  function add(domain, category, title, structured, confidence) {
    events.push({domain, category, subject_id:'PERSON-001', display_title:title, event_date:today, event_time:'', raw_note:t, structured: structured || {}, confidence: confidence || 'inferred'});
  }
  const weight = lower.match(/(weigh(ed)?|weight)\s*(is|:)?\s*(\d{2,3}(\.\d+)?)\s*(lb|lbs|pounds)?/);
  if (weight) add('Health','measurement','Weight ' + weight[4] + ' lb',{metric:'weight', value:Number(weight[4]), unit:'lb'},'inferred');
  if (/(atorvastatin|lipitor|statin)/i.test(t) && /(took|taken|did|yes|confirm)/i.test(t)) add('Health','medication','Atorvastatin taken',{name:'atorvastatin', status:'taken'},'inferred');
  if (/(mounjaro|tirzepatide)/i.test(t)) add('Health','medication','Mounjaro logged',{name:'Mounjaro/tirzepatide', status:/(took|taken|dose|injection)/i.test(t)?'taken':'mentioned'},'inferred');
  if (/(walk(ed)? rosie|rosie walk)/i.test(t)) {
    const mins = lower.match(/(\d+)\s*(min|mins|minutes)/);
    events.push({domain:'Pets', category:'routine', subject_id:'PET-ROSIE', display_title:'Rosie walk', event_date:today, event_time:'', raw_note:t, structured:{activity:'walk', duration_min: mins?Number(mins[1]):''}, confidence:'inferred'});
  }
  if (/(workout|lat pulldown|seated row|leg curl|bicep|abdominal|stair|climber|bike)/i.test(t)) add('Fitness','workout','Workout note',{note:t},'needs_review');
  if (!events.length) add('Other','note','General note',{note:t},'confirmed');
  return { ai_used:false, result:{events, questions:[], considerations:[]}, error:'' };
}

function submitQuickCapture(rawText) {
  const captureId = uuid_('CAP');
  const interp = interpretCapture_(rawText);
  appendObject_(ZEKE.SHEETS.RAW_CAPTURE, {
    capture_id: captureId,
    created_at: nowIso_(),
    raw_text: rawText,
    source: 'web_app',
    ai_used: interp.ai_used,
    interpretation_json: JSON.stringify(interp.result),
    status: interp.error ? 'interpreted_with_fallback' : 'interpreted'
  }, getSheetDefinitions_()[ZEKE.SHEETS.RAW_CAPTURE]);

  const events = interp.result.events || [];
  events.forEach(e => writeInterpretedEvent_(e, captureId));
  return {ok:true, captureId, aiUsed: interp.ai_used, error: interp.error || '', events};
}

function writeInterpretedEvent_(e, sourceId) {
  const headers = getSheetDefinitions_()[ZEKE.SHEETS.EVENT_LEDGER];
  appendObject_(ZEKE.SHEETS.EVENT_LEDGER, {
    record_id: uuid_('EVT'),
    event_date: e.event_date || todayIso_(),
    event_time: e.event_time || '',
    domain: e.domain || 'Other',
    category: e.category || 'note',
    subject_id: e.subject_id || 'PERSON-001',
    display_title: e.display_title || 'Captured note',
    raw_note: e.raw_note || '',
    normalized_json: JSON.stringify(e.structured || {}),
    source: sourceId || 'quick_capture',
    confidence: e.confidence || 'needs_review',
    analysis_confidence: '',
    created_at: nowIso_(),
    updated_at: nowIso_(),
    status: 'active',
    references_json: '[]'
  }, headers);
}
