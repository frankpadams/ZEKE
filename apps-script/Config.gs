const ZEKE = {
  VERSION: '0.1.0-alpha',
  TZ: 'America/New_York',
  SHEETS: {
    SETTINGS: 'Settings',
    EVENT_LEDGER: 'EventLedger',
    RAW_CAPTURE: 'RawCapture',
    CALENDAR: 'CalendarEvents',
    HEALTH_METRICS: 'HealthMetrics',
    MEDS: 'Medications',
    ROUTINES: 'Routines',
    EXERCISES: 'ExerciseCatalog',
    WORKOUTS: 'WorkoutSessions',
    STRENGTH: 'StrengthSets',
    DISCOVERIES: 'Discoveries',
    IMPORT_AUDIT: 'ImportAudit',
    QUESTIONS: 'QuestionQueue'
  },
  FOLDERS: {
    HEALTH_INBOX: 'ZEKE_Health_Import_Inbox',
    HEALTH_PROCESSED: 'ZEKE_Health_Import_Processed',
    HEALTH_ERRORS: 'ZEKE_Health_Import_Errors'
  }
};

function getScriptProp_(key, fallback) {
  const v = PropertiesService.getScriptProperties().getProperty(key);
  return v || fallback || '';
}

function setScriptProp_(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

function getSpreadsheet_() {
  const id = getScriptProp_('ZEKE_SHEET_ID');
  if (!id) throw new Error('ZEKE_SHEET_ID is not set. Run setupZekeAlpha().');
  return SpreadsheetApp.openById(id);
}

function getOrCreateSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (headers && sh.getLastRow() === 0) sh.appendRow(headers);
  if (headers && sh.getLastRow() >= 1 && sh.getLastColumn() < headers.length) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sh.setFrozenRows(1);
  return sh;
}

function appendObject_(sheetName, obj, headers) {
  const ss = getSpreadsheet_();
  const sh = getOrCreateSheet_(ss, sheetName, headers);
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  sh.appendRow(row);
  return row;
}

function nowIso_() {
  return Utilities.formatDate(new Date(), ZEKE.TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function todayIso_() {
  return Utilities.formatDate(new Date(), ZEKE.TZ, 'yyyy-MM-dd');
}

function uuid_(prefix) {
  return (prefix || 'REC') + '-' + Utilities.getUuid().slice(0, 8) + '-' + Date.now();
}

function getOrCreateFolder_(name) {
  const it = DriveApp.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(name);
}
