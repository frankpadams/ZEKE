function setupZekeAlpha() {
  let id = getScriptProp_('ZEKE_SHEET_ID');
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('ZEKE Alpha Database');
    id = ss.getId();
    setScriptProp_('ZEKE_SHEET_ID', id);
  }

  const defs = getSheetDefinitions_();
  Object.keys(defs).forEach(name => getOrCreateSheet_(ss, name, defs[name]));
  seedDefaults_();
  Object.values(ZEKE.FOLDERS).forEach(getOrCreateFolder_);

  return {
    ok: true,
    sheetId: id,
    sheetUrl: ss.getUrl(),
    version: ZEKE.VERSION,
    message: 'ZEKE Alpha setup complete.'
  };
}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('ZEKE Alpha')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheetDefinitions_() {
  return {
    [ZEKE.SHEETS.SETTINGS]: ['key','value','notes'],
    [ZEKE.SHEETS.EVENT_LEDGER]: ['record_id','event_date','event_time','domain','category','subject_id','display_title','raw_note','normalized_json','source','confidence','analysis_confidence','created_at','updated_at','status','references_json'],
    [ZEKE.SHEETS.RAW_CAPTURE]: ['capture_id','created_at','raw_text','source','ai_used','interpretation_json','status'],
    [ZEKE.SHEETS.CALENDAR]: ['calendar_event_id','start','end','title','location','description','source_calendar','imported_at'],
    [ZEKE.SHEETS.HEALTH_METRICS]: ['metric_id','date','time','metric','value','unit','source','notes','raw_json'],
    [ZEKE.SHEETS.MEDS]: ['med_id','date','time','subject_id','name','dose','unit','status','source','notes'],
    [ZEKE.SHEETS.ROUTINES]: ['routine_id','domain','subject_id','name','schedule_hint','active','quick_action_label','notes'],
    [ZEKE.SHEETS.EXERCISES]: ['exercise_id','name','domain','muscle_group','equipment','default_sets','rep_min','rep_max','increment_lb','caution_tags','active'],
    [ZEKE.SHEETS.WORKOUTS]: ['workout_id','date','start_time','location','notes','overall_pain','rpe','created_at'],
    [ZEKE.SHEETS.STRENGTH]: ['set_id','workout_id','date','exercise_id','exercise_name','set_number','weight_lb','reps','rpe','pain','notes','volume'],
    [ZEKE.SHEETS.DISCOVERIES]: ['discovery_id','created_at','domain','title','summary','evidence_json','counter_evidence_json','confidence_in_analysis','status','next_step_label'],
    [ZEKE.SHEETS.IMPORT_AUDIT]: ['audit_id','created_at','source','file_name','rows_imported','rows_unknown','status','notes'],
    [ZEKE.SHEETS.QUESTIONS]: ['question_id','created_at','domain','question','why_asking','expected_value','effort','status']
  };
}

function seedDefaults_() {
  const ss = getSpreadsheet_();
  seedRowsIfEmpty_(ss.getSheetByName(ZEKE.SHEETS.SETTINGS), [
    ['project_name','ZEKE','Zero-friction Evidence & Knowledge Engine'],
    ['version',ZEKE.VERSION,'Private alpha'],
    ['dashboard_mode','domain','Default is separated by domain; user may choose combined later.'],
    ['language_rule','decision_support','Avoid advice wording; use considerations, insights, discoveries, and decision support.']
  ]);
  seedRowsIfEmpty_(ss.getSheetByName(ZEKE.SHEETS.ROUTINES), [
    ['ROUT-MED-ATORVASTATIN','Health','PERSON-001','Atorvastatin','daily','TRUE','Taken','Dose optional; user can customize.'],
    ['ROUT-MED-MOUNJARO','Health','PERSON-001','Mounjaro','weekly Friday','TRUE','Dose logged','Tirzepatide/Mounjaro weekly injection.'],
    ['ROUT-PET-WALK-ROSIE','Pets','PET-ROSIE','Walk Rosie','daily/as possible','TRUE','Walked','Pet module starter routine.']
  ]);
  seedRowsIfEmpty_(ss.getSheetByName(ZEKE.SHEETS.EXERCISES), [
    ['EX-LATPULL','Lat Pulldown','Fitness','Back','Machine',3,10,15,5,'shoulder_caution','TRUE'],
    ['EX-SEATEDROW','Seated Row','Fitness','Back','Machine',2,10,15,5,'shoulder_caution','TRUE'],
    ['EX-LEGCURL','Seated Leg Curl','Fitness','Hamstrings','Machine',2,10,15,5,'','TRUE'],
    ['EX-GLUTELIFT','Glute Lift','Fitness','Glutes','Machine',2,8,12,10,'','TRUE'],
    ['EX-BICEPCURL','Independent Biceps Curl','Fitness','Biceps','Machine',3,10,15,5,'shoulder_caution','TRUE'],
    ['EX-ABDOMINAL','Abdominal Machine','Fitness','Core','Machine',2,10,15,5,'','TRUE'],
    ['EX-LEGEXT','Leg Extension','Fitness','Quads','Machine',2,8,12,5,'','TRUE']
  ]);
}

function seedRowsIfEmpty_(sh, rows) {
  if (!sh || sh.getLastRow() > 1) return;
  rows.forEach(r => sh.appendRow(r));
}
