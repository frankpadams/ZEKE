/** ZEKE Live Alpha Apps Script backend
 * Deploy as Web App. Execute as: Me. Access: Only myself / Google account as preferred.
 * The static GitHub frontend talks to this via JSONP GET.
 */

const ZEKE_VERSION = '0.1.0-live-alpha';
const SHEETS = {
  settings: 'Settings',
  eventLedger: 'Event_Ledger',
  measurements: 'Measurements',
  labs: 'Labs',
  medications: 'Medications',
  workoutSessions: 'Workout_Sessions',
  exerciseSets: 'Exercise_Sets',
  modules: 'Modules',
  records: 'Records',
  calendarEvents: 'Calendar_Events',
  appleHealth: 'Apple_Health_Imports',
  discoveries: 'Discoveries',
  importAudit: 'Import_Audit'
};

const HEADERS = {
  [SHEETS.settings]: ['key', 'value', 'notes', 'updated_at'],
  [SHEETS.eventLedger]: ['record_id', 'created_at', 'event_date', 'event_time', 'domain', 'category', 'title', 'raw_note', 'normalized_json', 'source', 'confidence', 'linked_entity_id', 'linked_module_id', 'status'],
  [SHEETS.measurements]: ['measurement_id', 'event_date', 'metric_id', 'display_name', 'value', 'unit', 'source', 'notes', 'event_id'],
  [SHEETS.labs]: ['lab_id', 'collection_date', 'lab_name', 'value', 'unit', 'reference_range', 'source', 'notes', 'event_id'],
  [SHEETS.medications]: ['med_id', 'event_date', 'event_time', 'medication_name', 'dose', 'unit', 'action', 'source', 'notes', 'event_id'],
  [SHEETS.workoutSessions]: ['workout_id', 'event_date', 'workout_type', 'duration_min', 'notes', 'source', 'event_id'],
  [SHEETS.exerciseSets]: ['set_id', 'workout_id', 'event_date', 'exercise', 'set_number', 'weight_lb', 'reps', 'rpe', 'pain', 'notes', 'event_id'],
  [SHEETS.modules]: ['module_id', 'created_at', 'type', 'name', 'status', 'notes', 'settings_json'],
  [SHEETS.records]: ['record_id', 'created_at', 'repository_provider', 'document_type', 'title', 'note', 'file_url', 'linked_domain', 'linked_entity_id', 'review_status', 'extracted_json'],
  [SHEETS.calendarEvents]: ['calendar_event_id', 'start_time', 'end_time', 'title', 'domain_guess', 'prompt_status', 'notes'],
  [SHEETS.appleHealth]: ['import_id', 'imported_at', 'source_file', 'metric_id', 'display_name', 'event_date', 'value', 'unit', 'raw_json', 'event_id'],
  [SHEETS.discoveries]: ['discovery_id', 'created_at', 'updated_at', 'title', 'type', 'status', 'confidence', 'summary', 'evidence_json', 'next_action'],
  [SHEETS.importAudit]: ['audit_id', 'created_at', 'source', 'action', 'rows_seen', 'rows_imported', 'errors', 'notes']
};

function doGet(e) {
  const callback = e.parameter.callback;
  const action = e.parameter.action || 'getSummary';
  const payload = decodePayload_(e.parameter.payload);
  const result = route_(action, payload);
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(result)})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(result);
}

function doPost(e) {
  const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  return json_(route_(body.action || 'getSummary', body.payload || {}));
}

function route_(action, payload) {
  try {
    if (action === 'setup') return setupZekeWorkbook();
    if (action === 'getSummary') return getSummary(payload || {});
    if (action === 'saveQuickEntry') return saveQuickEntry(payload || {});
    if (action === 'routineAction') return routineAction(payload || {});
    if (action === 'addModule') return addModule(payload || {});
    if (action === 'indexRecord') return indexRecord(payload || {});
    if (action === 'syncCalendar') return syncCalendar(payload || {});
    if (action === 'importAppleHealthFolder') return importAppleHealthFolder(payload || {});
    if (action === 'importExistingSheet') return importExistingSheet(payload || {});
    return { ok: false, error: `Unknown action: ${action}` };
  } catch (err) {
    return { ok: false, error: String(err && err.stack ? err.stack : err) };
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function decodePayload_(b64) {
  if (!b64) return {};
  try {
    return JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(b64)).getDataAsString());
  } catch (err) {
    try { return JSON.parse(Utilities.newBlob(Utilities.base64Decode(b64)).getDataAsString()); } catch (e) { return {}; }
  }
}

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function nowIso_() { return new Date().toISOString(); }
function id_(prefix) { return `${prefix}-${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`; }

function setupZekeWorkbook() {
  const ss = ss_();
  Object.keys(HEADERS).forEach(name => ensureSheet_(ss, name, HEADERS[name]));
  upsertSetting_('zeke_version', ZEKE_VERSION, 'ZEKE backend version');
  upsertSetting_('repository_provider', getSetting_('repository_provider') || 'Google Drive', 'Selected user-owned repository');
  upsertSetting_('privacy_notice', 'Not HIPAA-compliant storage. User-owned repository privacy applies.', 'Shown during upload/import flows');
  seedDefaults_();
  return { ok: true, version: ZEKE_VERSION };
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const existing = sh.getRange(1, 1, 1, Math.max(headers.length, 1)).getValues()[0];
  if (existing.filter(Boolean).length === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function seedDefaults_() {
  const mods = readRows_(SHEETS.modules);
  if (mods.length === 0) {
    appendRow_(SHEETS.modules, [id_('MOD-HEALTH'), nowIso_(), 'health', 'Health', 'active', 'Default flagship module', '{}']);
    appendRow_(SHEETS.modules, [id_('MOD-FITNESS'), nowIso_(), 'fitness', 'Fitness', 'active', 'Default fitness module', '{}']);
  }
}

function upsertSetting_(key, value, notes) {
  const sh = ensureSheet_(ss_(), SHEETS.settings, HEADERS[SHEETS.settings]);
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sh.getRange(i + 1, 2, 1, 3).setValues([[value, notes || data[i][2], nowIso_()]]);
      return;
    }
  }
  sh.appendRow([key, value, notes || '', nowIso_()]);
}

function getSetting_(key) {
  const rows = readRows_(SHEETS.settings);
  const row = rows.find(r => r.key === key);
  return row ? row.value : '';
}

function appendRow_(sheetName, values) {
  const sh = ensureSheet_(ss_(), sheetName, HEADERS[sheetName]);
  sh.appendRow(values);
}

function appendObject_(sheetName, obj) {
  const headers = HEADERS[sheetName];
  appendRow_(sheetName, headers.map(h => obj[h] === undefined ? '' : obj[h]));
}

function readRows_(sheetName) {
  const sh = ensureSheet_(ss_(), sheetName, HEADERS[sheetName]);
  const vals = sh.getDataRange().getValues();
  if (vals.length <= 1) return [];
  const headers = vals[0];
  return vals.slice(1).filter(row => row.some(v => v !== '')).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function saveQuickEntry(payload) {
  setupZekeWorkbook();
  const text = String(payload.text || '').trim();
  if (!text) return { ok: false, error: 'No text provided.' };
  const category = payload.category === 'auto' ? inferCategory_(text) : payload.category;
  const eventId = id_('EVT');
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const normalized = parseQuick_(text, category, eventId, today);
  appendObject_(SHEETS.eventLedger, {
    record_id: eventId,
    created_at: nowIso_(),
    event_date: today,
    event_time: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm'),
    domain: domainForCategory_(category),
    category: category,
    title: normalized.title || text.slice(0, 80),
    raw_note: text,
    normalized_json: JSON.stringify(normalized),
    source: 'quick_capture',
    confidence: normalized.confidence || 'inferred',
    linked_entity_id: '',
    linked_module_id: '',
    status: 'active'
  });
  writeStructured_(normalized, eventId, today);
  updateAdaptiveDiscoveries_(text, category);
  return { ok: true, saved: true, event_id: eventId, normalized };
}

function inferCategory_(text) {
  const t = text.toLowerCase();
  if (/lipitor|atorvastatin|mounjaro|tirzepatide|medication|took|dose|pill|injection/.test(t)) return 'medication';
  if (/workout|pulldown|row|curl|leg|stair|bike|treadmill|reps|sets|\d+\s*x\s*\d+/.test(t)) return 'workout';
  if (/weight|blood pressure|bp|heart rate|hrv|sleep|steps|body fat|lean mass/.test(t)) return 'measurement';
  if (/a1c|ldl|apob|cholesterol|triglyceride|lab/.test(t)) return 'lab';
  if (/rosie|dog|cat|vet|rabies|itch|itchy|vomit/.test(t)) return 'pet';
  if (/honda|car|oil|inspection|tire|vehicle/.test(t)) return 'vehicle';
  if (/hvac|filter|furnace|appliance|home|house/.test(t)) return 'home';
  return 'note';
}

function domainForCategory_(category) {
  const map = { medication: 'Health', measurement: 'Health', lab: 'Health', workout: 'Fitness', pet: 'Pets', vehicle: 'Vehicles', home: 'Home', note: 'General' };
  return map[category] || 'General';
}

function parseQuick_(text, category, eventId, today) {
  const t = text.toLowerCase();
  const out = { title: text.slice(0, 80), category, confidence: 'inferred', extracted: [] };
  if (category === 'medication') {
    const med = /lipitor|atorvastatin/.test(t) ? 'Atorvastatin / Lipitor' : /mounjaro|tirzepatide/.test(t) ? 'Mounjaro / Tirzepatide' : (text.match(/(?:took|take|dose of)\s+([a-zA-Z0-9\- ]+)/i)?.[1] || 'Medication').trim();
    out.title = `${med} logged`;
    out.medication = { name: med, action: /skip|missed|did not/.test(t) ? 'skipped' : 'taken' };
  }
  if (category === 'measurement') {
    const m = [];
    const weight = text.match(/(?:weight|weighed)?\s*(\d{2,3}(?:\.\d+)?)\s*(?:lb|lbs|pounds)/i);
    if (weight) m.push({ metric_id: 'weight', display_name: 'Weight', value: Number(weight[1]), unit: 'lb' });
    const bf = text.match(/(?:body fat)\s*(\d{1,2}(?:\.\d+)?)\s*%/i);
    if (bf) m.push({ metric_id: 'body_fat', display_name: 'Body fat', value: Number(bf[1]), unit: '%' });
    const sleep = text.match(/(?:sleep|slept)\s*(\d+(?:\.\d+)?)\s*(?:hr|hrs|hours)/i);
    if (sleep) m.push({ metric_id: 'sleep_hours', display_name: 'Sleep', value: Number(sleep[1]), unit: 'hr' });
    out.measurements = m;
    if (m.length) out.title = `${m.map(x => x.display_name).join(', ')} logged`;
  }
  if (category === 'lab') {
    const labs = [];
    [['a1c','A1C','%'],['ldl','LDL','mg/dL'],['apob','ApoB','mg/dL']].forEach(([key, name, unit]) => {
      const re = new RegExp(`${key}[^0-9]*(\\d+(?:\\.\\d+)?)`, 'i');
      const hit = text.match(re);
      if (hit) labs.push({ lab_name: name, value: Number(hit[1]), unit });
    });
    out.labs = labs;
    if (labs.length) out.title = `${labs.map(x => x.lab_name).join(', ')} logged`;
  }
  if (category === 'workout') {
    out.title = 'Workout logged';
    out.workout = { workout_id: id_('W'), notes: text, sets: parseExerciseSets_(text) };
  }
  return out;
}

function parseExerciseSets_(text) {
  const sets = [];
  const chunks = text.split(/[;\n]/).map(s => s.trim()).filter(Boolean);
  chunks.forEach(chunk => {
    const m = chunk.match(/([A-Za-z ]+?)\s+(\d{1,3})\s*(?:lb|lbs|#)?\s*,?\s*(\d{1,2})\s*(?:x|×)\s*(\d{1,2})/i) || chunk.match(/([A-Za-z ]+?)\s+(\d{1,3})\s*(?:lb|lbs|#)?\s+(\d{1,2})\s*reps?\s*(?:x|for)?\s*(\d{1,2})/i);
    if (m) {
      const exercise = m[1].replace(/workout:?/i,'').trim();
      const weight = Number(m[2]);
      const reps = Number(m[3]);
      const setCount = Number(m[4]);
      for (let i = 1; i <= setCount; i++) sets.push({ exercise, set_number: i, weight_lb: weight, reps });
    }
  });
  return sets;
}

function writeStructured_(normalized, eventId, today) {
  if (normalized.medication) {
    appendObject_(SHEETS.medications, { med_id: id_('MED'), event_date: today, event_time: '', medication_name: normalized.medication.name, dose: '', unit: '', action: normalized.medication.action, source: 'quick_capture', notes: '', event_id: eventId });
  }
  (normalized.measurements || []).forEach(m => appendObject_(SHEETS.measurements, { measurement_id: id_('MEAS'), event_date: today, metric_id: m.metric_id, display_name: m.display_name, value: m.value, unit: m.unit, source: 'quick_capture', notes: '', event_id: eventId }));
  (normalized.labs || []).forEach(l => appendObject_(SHEETS.labs, { lab_id: id_('LAB'), collection_date: today, lab_name: l.lab_name, value: l.value, unit: l.unit, reference_range: '', source: 'quick_capture', notes: '', event_id: eventId }));
  if (normalized.workout) {
    appendObject_(SHEETS.workoutSessions, { workout_id: normalized.workout.workout_id, event_date: today, workout_type: 'strength/cardio', duration_min: '', notes: normalized.workout.notes, source: 'quick_capture', event_id: eventId });
    (normalized.workout.sets || []).forEach(s => appendObject_(SHEETS.exerciseSets, { set_id: id_('SET'), workout_id: normalized.workout.workout_id, event_date: today, exercise: s.exercise, set_number: s.set_number, weight_lb: s.weight_lb, reps: s.reps, rpe: '', pain: '', notes: '', event_id: eventId }));
  }
}

function routineAction(payload) {
  const text = `${payload.title || 'Routine'}: ${payload.action || 'done'}`;
  return saveQuickEntry({ text, category: payload.title && /lipitor|atorvastatin/i.test(payload.title) ? 'medication' : 'note' });
}

function addModule(payload) {
  setupZekeWorkbook();
  if (!payload.name) return { ok: false, error: 'Module name required.' };
  const mid = id_('MOD');
  appendObject_(SHEETS.modules, { module_id: mid, created_at: nowIso_(), type: payload.type || 'custom', name: payload.name, status: 'active', notes: payload.notes || '', settings_json: '{}' });
  return { ok: true, module_id: mid };
}

function indexRecord(payload) {
  setupZekeWorkbook();
  const rid = id_('REC');
  appendObject_(SHEETS.records, { record_id: rid, created_at: nowIso_(), repository_provider: getSetting_('repository_provider') || 'Google Drive', document_type: payload.type || 'Record', title: payload.note || payload.type || 'Record', note: payload.note || '', file_url: payload.file_url || '', linked_domain: '', linked_entity_id: '', review_status: 'indexed_note_only', extracted_json: '{}' });
  return { ok: true, record_id: rid };
}

function getSummary(payload) {
  setupZekeWorkbook();
  return {
    ok: true,
    version: ZEKE_VERSION,
    repository: getSetting_('repository_provider') || 'Google Drive',
    modules: readRows_(SHEETS.modules).map(r => ({ id: r.module_id, type: r.type, name: r.name, status: r.status })),
    attention: buildAttention_(),
    recent: buildRecent_(),
    metrics: buildMetrics_(),
    exercisePlan: buildExercisePlan_(),
    discoveries: readRows_(SHEETS.discoveries).slice(-10).map(r => ({ id: r.discovery_id, title: r.title, status: r.status, confidence: r.confidence, text: r.summary }))
  };
}

function buildRecent_() {
  return readRows_(SHEETS.eventLedger).slice(-12).reverse().map(r => ({ date: r.event_date || String(r.created_at).slice(0,10), category: r.category, title: r.title || r.raw_note }));
}

function buildMetrics_() {
  const out = {};
  readRows_(SHEETS.measurements).forEach(r => {
    const key = metricKey_(r.metric_id || r.display_name);
    if (!key || r.value === '') return;
    (out[key] ||= []).push({ date: formatDateLabel_(r.event_date), value: Number(r.value) });
  });
  readRows_(SHEETS.labs).forEach(r => {
    const key = metricKey_(r.lab_name);
    if (!key || r.value === '') return;
    (out[key] ||= []).push({ date: formatDateLabel_(r.collection_date), value: Number(r.value) });
  });
  readRows_(SHEETS.exerciseSets).forEach(r => {
    const vol = Number(r.weight_lb) * Number(r.reps);
    if (!vol) return;
    (out.exercise_volume ||= []).push({ date: formatDateLabel_(r.event_date), value: vol });
  });
  Object.keys(out).forEach(k => out[k].sort((a,b) => new Date(a.date) - new Date(b.date)));
  return out;
}

function metricKey_(name) {
  const n = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  if (/weight|body_weight/.test(n)) return 'weight';
  if (/body_fat/.test(n)) return 'body_fat';
  if (/lean/.test(n)) return 'lean_mass';
  if (/sleep/.test(n)) return 'sleep_hours';
  if (/steps/.test(n)) return 'steps';
  if (/a1c|hba1c/.test(n)) return 'a1c';
  if (/ldl/.test(n)) return 'ldl';
  if (/apob|apo_b/.test(n)) return 'apob';
  if (/blood_pressure|systolic/.test(n)) return 'systolic_bp';
  return n || '';
}

function formatDateLabel_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v).slice(0, 10);
}

function buildAttention_() {
  const att = [];
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const medsToday = readRows_(SHEETS.medications).filter(r => String(r.event_date).slice(0,10) === today && /atorvastatin|lipitor/i.test(r.medication_name));
  if (medsToday.length === 0) att.push({ id: 'lipitor-today', kind: 'action', domain: 'Health', icon: '💊', title: 'Lipitor', text: 'Did you take atorvastatin/Lipitor today?', actions: ['Taken', 'Skip', 'Snooze'] });
  const workoutToday = readRows_(SHEETS.workoutSessions).some(r => String(r.event_date).slice(0,10) === today);
  if (!workoutToday) att.push({ id: 'workout-today', kind: 'action', domain: 'Fitness', icon: '🏋️', title: 'Workout', text: 'No workout logged today. View suggested progressions or enter your session.', actions: ['Log workout', 'View plan'] });
  readRows_(SHEETS.calendarEvents).slice(-5).forEach(ev => {
    if (/pt|physical therapy|doctor|annual|lab|dentist|vet/i.test(ev.title) && ev.prompt_status !== 'dismissed') {
      att.push({ id: `cal-${ev.calendar_event_id}`, kind: 'followup', domain: ev.domain_guess || 'Health', icon: /vet/i.test(ev.title) ? '🐾' : '📅', title: ev.title, text: 'Calendar item may be relevant to ZEKE. Add notes or dismiss if not relevant.', actions: ['Add notes', 'Dismiss'] });
    }
  });
  const discoveries = readRows_(SHEETS.discoveries).filter(d => /emerging|strengthening|collecting/i.test(d.status)).slice(-2);
  discoveries.forEach(d => att.push({ id: d.discovery_id, kind: 'discovery', domain: 'Discoveries', icon: '💡', title: d.title, text: d.summary, actions: ['Review evidence', 'Not now'] }));
  return att;
}

function buildExercisePlan_() {
  const rows = readRows_(SHEETS.exerciseSets);
  const latestByExercise = {};
  rows.forEach(r => { if (r.exercise) latestByExercise[String(r.exercise).toLowerCase()] = r; });
  const defaults = [
    ['Lat pulldown', 60, 12], ['Seated row', 40, 12], ['Seated leg curl', 70, 12], ['Abdominal machine', 80, 12]
  ];
  return defaults.map(([exercise, defaultWeight, defaultReps]) => {
    const last = latestByExercise[exercise.toLowerCase()];
    const w = Number(last && last.weight_lb) || defaultWeight;
    const reps = Number(last && last.reps) || defaultReps;
    const nextWeight = reps >= 12 ? w + 5 : w;
    return { exercise, target: `${nextWeight} lb · 3 × ${reps >= 12 ? 10 : Math.min(reps + 1, 12)}`, rationale: reps >= 12 ? 'Prior reps suggest a small increase may be reasonable if form and pain are acceptable.' : 'Add reps before increasing weight.' };
  });
}

function updateAdaptiveDiscoveries_(text, category) {
  const t = String(text).toLowerCase();
  if (/rosie|dog/.test(t) && /itch|scratch/.test(t)) {
    const recent = readRows_(SHEETS.eventLedger).filter(r => /rosie|dog/i.test(r.raw_note) && /itch|scratch/i.test(r.raw_note));
    if (recent.length >= 2 && !readRows_(SHEETS.discoveries).some(d => /Rosie itching/i.test(d.title))) {
      appendObject_(SHEETS.discoveries, { discovery_id: id_('DISC'), created_at: nowIso_(), updated_at: nowIso_(), title: 'Rosie itching', type: 'adaptive_tracking', status: 'Emerging', confidence: 'Low', summary: 'Rosie itching has appeared repeatedly. Consider structured tracking if it continues.', evidence_json: JSON.stringify({ mentions: recent.length + 1 }), next_action: 'Offer itch severity tracking' });
    }
  }
}

function syncCalendar(payload) {
  setupZekeWorkbook();
  const daysForward = Number(payload.daysForward || 14);
  const cal = CalendarApp.getDefaultCalendar();
  const start = new Date();
  const end = new Date(Date.now() + daysForward * 24 * 60 * 60 * 1000);
  const events = cal.getEvents(start, end);
  let imported = 0;
  events.forEach(ev => {
    const title = ev.getTitle();
    if (!/pt|physical therapy|doctor|annual|lab|dentist|vet|veterinary|orthopedic/i.test(title)) return;
    appendObject_(SHEETS.calendarEvents, { calendar_event_id: id_('CAL'), start_time: ev.getStartTime().toISOString(), end_time: ev.getEndTime().toISOString(), title, domain_guess: /vet|veterinary/i.test(title) ? 'Pets' : 'Health', prompt_status: 'new', notes: '' });
    imported++;
  });
  appendObject_(SHEETS.importAudit, { audit_id: id_('AUD'), created_at: nowIso_(), source: 'Google Calendar', action: 'syncCalendar', rows_seen: events.length, rows_imported: imported, errors: '', notes: '' });
  return { ok: true, imported };
}

function importAppleHealthFolder(payload) {
  setupZekeWorkbook();
  const folderId = payload.folderId || getSetting_('apple_health_folder_id');
  if (!folderId) return { ok: false, error: 'No Apple Health export folder ID configured.' };
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  let seen = 0, imported = 0, errors = [];
  while (files.hasNext()) {
    const file = files.next(); seen++;
    if (!/\.csv$/i.test(file.getName())) continue;
    try {
      const csv = Utilities.parseCsv(file.getBlob().getDataAsString());
      if (csv.length < 2) continue;
      const headers = csv[0].map(h => String(h).trim().toLowerCase());
      csv.slice(1).forEach(row => {
        const obj = Object.fromEntries(headers.map((h,i)=>[h,row[i]]));
        const metric = metricKey_(obj.metric || obj.type || obj.name || obj.identifier);
        const value = Number(obj.value);
        const date = obj.date || obj.startdate || obj.start_date || obj.creationdate;
        if (!metric || !isFinite(value) || !date) return;
        const eventId = id_('EVT');
        appendObject_(SHEETS.eventLedger, { record_id: eventId, created_at: nowIso_(), event_date: String(date).slice(0,10), event_time: '', domain: 'Health', category: 'measurement', title: `Apple Health ${metric}`, raw_note: JSON.stringify(obj), normalized_json: JSON.stringify({ metric_id: metric, value, unit: obj.unit || '' }), source: 'apple_health_import', confidence: 'imported', linked_entity_id: '', linked_module_id: '', status: 'active' });
        appendObject_(SHEETS.measurements, { measurement_id: id_('MEAS'), event_date: String(date).slice(0,10), metric_id: metric, display_name: metric, value, unit: obj.unit || '', source: 'apple_health_import', notes: file.getName(), event_id: eventId });
        appendObject_(SHEETS.appleHealth, { import_id: id_('AH'), imported_at: nowIso_(), source_file: file.getName(), metric_id: metric, display_name: metric, event_date: String(date).slice(0,10), value, unit: obj.unit || '', raw_json: JSON.stringify(obj), event_id: eventId });
        imported++;
      });
    } catch (err) { errors.push(`${file.getName()}: ${err}`); }
  }
  appendObject_(SHEETS.importAudit, { audit_id: id_('AUD'), created_at: nowIso_(), source: 'Apple Health folder', action: 'importAppleHealthFolder', rows_seen: seen, rows_imported: imported, errors: errors.join('\n'), notes: folderId });
  return { ok: true, imported, errors };
}

function importExistingSheet(payload) {
  setupZekeWorkbook();
  const sourceId = payload.spreadsheetId;
  if (!sourceId) return { ok: false, error: 'Existing spreadsheet ID is required.' };
  const src = SpreadsheetApp.openById(sourceId);
  let imported = 0, seen = 0, errors = [];
  const mappings = [
    { sourceNames: ['Measurements', 'Body Composition', 'Health Metrics'], target: SHEETS.measurements, handler: importMeasurementRow_ },
    { sourceNames: ['Labs', 'Laboratory Results', 'Lab Results'], target: SHEETS.labs, handler: importLabRow_ },
    { sourceNames: ['Medications', 'Medication'], target: SHEETS.medications, handler: importMedicationRow_ },
    { sourceNames: ['Exercise_Sets', 'Exercise Sets', 'Strength Training'], target: SHEETS.exerciseSets, handler: importExerciseSetRow_ },
    { sourceNames: ['Workout_Sessions', 'Workouts', 'Workout Session'], target: SHEETS.workoutSessions, handler: importWorkoutRow_ },
    { sourceNames: ['Event_Ledger', 'Events'], target: SHEETS.eventLedger, handler: importEventRow_ }
  ];
  mappings.forEach(map => {
    const sh = map.sourceNames.map(n => src.getSheetByName(n)).find(Boolean);
    if (!sh) return;
    const vals = sh.getDataRange().getValues();
    if (vals.length < 2) return;
    const headers = vals[0].map(h => String(h).trim());
    vals.slice(1).filter(r => r.some(v => v !== '')).forEach(row => {
      seen++;
      try {
        const obj = Object.fromEntries(headers.map((h,i)=>[h,row[i]]));
        const n = map.handler(obj);
        imported += n || 0;
      } catch (err) { errors.push(`${sh.getName()} row ${seen}: ${err}`); }
    });
  });
  appendObject_(SHEETS.importAudit, { audit_id: id_('AUD'), created_at: nowIso_(), source: `Existing spreadsheet ${sourceId}`, action: 'importExistingSheet', rows_seen: seen, rows_imported: imported, errors: errors.join('\n'), notes: 'Best-effort import; review canonical sheets.' });
  return { ok: true, imported, seen, errors };
}

function importMeasurementRow_(o) {
  const date = o.Date || o.event_date || o['Event Date'] || o.Timestamp || new Date();
  const metric = o.Metric || o.metric_id || o.display_name || o['Metric ID'] || o.Category || '';
  const value = o.Value || o.value;
  if (value === '' || value == null) return 0;
  const eventId = id_('EVT');
  appendObject_(SHEETS.eventLedger, { record_id: eventId, created_at: nowIso_(), event_date: formatDateLabel_(date), event_time: '', domain: 'Health', category: 'measurement', title: `${metric} imported`, raw_note: JSON.stringify(o), normalized_json: JSON.stringify(o), source: 'existing_spreadsheet_import', confidence: 'imported', linked_entity_id: '', linked_module_id: '', status: 'active' });
  appendObject_(SHEETS.measurements, { measurement_id: id_('MEAS'), event_date: formatDateLabel_(date), metric_id: metricKey_(metric), display_name: metric, value, unit: o.Unit || o.unit || o.Units || '', source: 'existing_spreadsheet_import', notes: o.Notes || '', event_id: eventId });
  return 1;
}
function importLabRow_(o) {
  const date = o.Date || o.collection_date || o['Collection Date'] || o.Timestamp || new Date();
  const name = o.Lab || o['Lab Name'] || o.lab_name || o.Metric || '';
  const value = o.Value || o.value;
  if (!name || value === '' || value == null) return 0;
  const eventId = id_('EVT');
  appendObject_(SHEETS.eventLedger, { record_id: eventId, created_at: nowIso_(), event_date: formatDateLabel_(date), event_time: '', domain: 'Health', category: 'lab', title: `${name} imported`, raw_note: JSON.stringify(o), normalized_json: JSON.stringify(o), source: 'existing_spreadsheet_import', confidence: 'imported', linked_entity_id: '', linked_module_id: '', status: 'active' });
  appendObject_(SHEETS.labs, { lab_id: id_('LAB'), collection_date: formatDateLabel_(date), lab_name: name, value, unit: o.Unit || o.unit || '', reference_range: o.Reference || o['Reference Range'] || '', source: 'existing_spreadsheet_import', notes: o.Notes || '', event_id: eventId });
  return 1;
}
function importMedicationRow_(o) {
  const date = o.Date || o.event_date || o['Event Date'] || o.Timestamp || new Date();
  const med = o.Medication || o.medication_name || o.Name || '';
  if (!med) return 0;
  const eventId = id_('EVT');
  appendObject_(SHEETS.eventLedger, { record_id: eventId, created_at: nowIso_(), event_date: formatDateLabel_(date), event_time: '', domain: 'Health', category: 'medication', title: `${med} imported`, raw_note: JSON.stringify(o), normalized_json: JSON.stringify(o), source: 'existing_spreadsheet_import', confidence: 'imported', linked_entity_id: '', linked_module_id: '', status: 'active' });
  appendObject_(SHEETS.medications, { med_id: id_('MED'), event_date: formatDateLabel_(date), event_time: o.Time || '', medication_name: med, dose: o.Dose || '', unit: o.Unit || '', action: o.Action || o.Status || 'taken', source: 'existing_spreadsheet_import', notes: o.Notes || '', event_id: eventId });
  return 1;
}
function importExerciseSetRow_(o) {
  const date = o.Date || o.event_date || new Date();
  const exercise = o.Exercise || o.exercise || '';
  if (!exercise) return 0;
  const eventId = id_('EVT');
  const wid = o['Workout ID'] || o.workout_id || id_('W');
  appendObject_(SHEETS.eventLedger, { record_id: eventId, created_at: nowIso_(), event_date: formatDateLabel_(date), event_time: '', domain: 'Fitness', category: 'workout', title: `${exercise} imported`, raw_note: JSON.stringify(o), normalized_json: JSON.stringify(o), source: 'existing_spreadsheet_import', confidence: 'imported', linked_entity_id: '', linked_module_id: '', status: 'active' });
  appendObject_(SHEETS.exerciseSets, { set_id: id_('SET'), workout_id: wid, event_date: formatDateLabel_(date), exercise, set_number: o['Set #'] || o.set_number || '', weight_lb: o['Weight lb'] || o.weight_lb || '', reps: o.Reps || o.reps || '', rpe: o.RPE || '', pain: o.Pain || '', notes: o.Notes || '', event_id: eventId });
  return 1;
}
function importWorkoutRow_(o) { return importEventRow_({ ...o, Category: 'workout', Domain: 'Fitness' }); }
function importEventRow_(o) {
  const eventId = o.record_id || o['Event ID'] || id_('EVT');
  appendObject_(SHEETS.eventLedger, { record_id: eventId, created_at: nowIso_(), event_date: formatDateLabel_(o.Date || o.event_date || new Date()), event_time: o.Time || o.event_time || '', domain: o.Domain || o.domain || domainForCategory_(o.Category || o.category || 'note'), category: o.Category || o.category || 'note', title: o.Title || o.title || o.Event || o.raw_note || 'Imported event', raw_note: o.Notes || o.raw_note || JSON.stringify(o), normalized_json: JSON.stringify(o), source: 'existing_spreadsheet_import', confidence: 'imported', linked_entity_id: '', linked_module_id: '', status: 'active' });
  return 1;
}
