function importAppleHealthFromDrive() {
  const inbox = getOrCreateFolder_(ZEKE.FOLDERS.HEALTH_INBOX);
  const processed = getOrCreateFolder_(ZEKE.FOLDERS.HEALTH_PROCESSED);
  const errors = getOrCreateFolder_(ZEKE.FOLDERS.HEALTH_ERRORS);
  const files = inbox.getFiles();
  let totalFiles = 0, totalRows = 0, totalUnknown = 0;
  while (files.hasNext()) {
    const file = files.next();
    totalFiles++;
    try {
      const name = file.getName();
      const content = file.getBlob().getDataAsString();
      let rows = [];
      if (/\.json$/i.test(name)) rows = flattenHealthJson_(JSON.parse(content));
      else rows = parseCsv_(content);
      const result = importHealthRows_(rows, name);
      totalRows += result.imported;
      totalUnknown += result.unknown;
      file.moveTo(processed);
      auditImport_('apple_health_drive', name, result.imported, result.unknown, 'processed', '');
    } catch (err) {
      auditImport_('apple_health_drive', file.getName(), 0, 0, 'error', String(err));
      file.moveTo(errors);
    }
  }
  return {ok:true, files: totalFiles, importedRows: totalRows, unknownRows: totalUnknown};
}

function flattenHealthJson_(obj) {
  if (Array.isArray(obj)) return obj;
  if (obj.data && Array.isArray(obj.data)) return obj.data;
  if (obj.metrics && Array.isArray(obj.metrics)) return obj.metrics;
  const rows = [];
  Object.keys(obj).forEach(k => {
    if (Array.isArray(obj[k])) obj[k].forEach(x => rows.push(Object.assign({type:k}, x)));
  });
  return rows;
}

function parseCsv_(text) {
  return Utilities.parseCsv(text).slice(1).map((row, idx) => {
    const headers = Utilities.parseCsv(text)[0];
    const o = {_row: idx + 2};
    headers.forEach((h, i) => o[String(h).trim()] = row[i]);
    return o;
  });
}

function importHealthRows_(rows, fileName) {
  let imported = 0, unknown = 0;
  rows.forEach(r => {
    const mapped = mapHealthRow_(r);
    if (!mapped.known) unknown++;
    appendHealthMetric_(mapped, r, fileName);
    imported++;
  });
  return {imported, unknown};
}

function mapHealthRow_(r) {
  const keys = Object.keys(r).reduce((acc,k)=>{acc[k.toLowerCase().replace(/\s+/g,'_')] = r[k]; return acc;}, {});
  const rawType = String(keys.type || keys.metric || keys.name || keys.quantity_type || keys.identifier || '').toLowerCase();
  const value = keys.value || keys.qty || keys.count || keys.duration || keys.total || '';
  const unit = keys.unit || keys.units || '';
  const date = normalizeDate_(keys.date || keys.startdate || keys.start_date || keys.timestamp || keys.creationdate || keys.enddate || keys.end_date);
  let metric = rawType || 'unknown_health_metric';
  let known = true;
  if (/step/.test(rawType)) metric = 'steps';
  else if (/sleep/.test(rawType)) metric = 'sleep';
  else if (/heart.*rate|heartrate/.test(rawType)) metric = 'heart_rate';
  else if (/body.*mass|weight/.test(rawType)) metric = 'weight';
  else if (/active.*energy|calorie/.test(rawType)) metric = 'active_energy';
  else if (/workout/.test(rawType)) metric = 'workout';
  else known = false;
  return {known, date: date || todayIso_(), metric, value, unit, rawType};
}

function appendHealthMetric_(m, raw, fileName) {
  appendObject_(ZEKE.SHEETS.HEALTH_METRICS, {
    metric_id: uuid_('HM'), date: m.date, time: '', metric: m.metric, value: m.value, unit: m.unit,
    source: 'apple_health_drive:' + fileName, notes: m.known ? '' : 'Unknown metric preserved', raw_json: JSON.stringify(raw)
  }, getSheetDefinitions_()[ZEKE.SHEETS.HEALTH_METRICS]);
  appendObject_(ZEKE.SHEETS.EVENT_LEDGER, {
    record_id: uuid_('AHLTH'), event_date: m.date, event_time: '', domain: 'Health', category: 'measurement', subject_id: 'PERSON-001',
    display_title: 'Apple Health: ' + m.metric, raw_note: JSON.stringify(raw), normalized_json: JSON.stringify(m), source: 'apple_health_drive', confidence: 'confirmed',
    analysis_confidence: '', created_at: nowIso_(), updated_at: nowIso_(), status: 'active', references_json: '[]'
  }, getSheetDefinitions_()[ZEKE.SHEETS.EVENT_LEDGER]);
}

function normalizeDate_(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v).slice(0,10);
  return Utilities.formatDate(d, ZEKE.TZ, 'yyyy-MM-dd');
}

function auditImport_(source, fileName, rows, unknown, status, notes) {
  appendObject_(ZEKE.SHEETS.IMPORT_AUDIT, {
    audit_id: uuid_('AUD'), created_at: nowIso_(), source, file_name: fileName, rows_imported: rows, rows_unknown: unknown, status, notes
  }, getSheetDefinitions_()[ZEKE.SHEETS.IMPORT_AUDIT]);
}
