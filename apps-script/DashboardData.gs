function getDashboardData() {
  return {
    version: ZEKE.VERSION,
    today: todayIso_(),
    aiEnabled: Boolean(getScriptProp_('GOOGLE_AI_API_KEY')),
    dashboardMode: getSetting_('dashboard_mode', 'domain'),
    domains: {
      Health: buildHealthCard_(),
      Fitness: buildFitnessCard_(),
      Pets: buildPetsCard_(),
      Projects: buildProjectsCard_()
    },
    discoveries: readObjects_(ZEKE.SHEETS.DISCOVERIES).slice(-5).reverse(),
    recentActivity: readObjects_(ZEKE.SHEETS.EVENT_LEDGER).slice(-10).reverse()
  };
}

function getSetting_(key, fallback) {
  const rows = readObjects_(ZEKE.SHEETS.SETTINGS);
  const row = rows.find(r => r.key === key);
  return row ? row.value : fallback;
}

function buildHealthCard_() {
  const routines = readObjects_(ZEKE.SHEETS.ROUTINES).filter(r => r.domain === 'Health' && String(r.active).toUpperCase() === 'TRUE');
  return { title:'Health', routines: routines.map(r => ({id:r.routine_id, name:r.name, action:r.quick_action_label, doneToday: routineDoneToday_(r.name, r.subject_id)})) };
}

function buildFitnessCard_() {
  return { title:'Fitness', exercisePlan: getExercisePlanForToday() };
}

function buildPetsCard_() {
  const routines = readObjects_(ZEKE.SHEETS.ROUTINES).filter(r => r.domain === 'Pets' && String(r.active).toUpperCase() === 'TRUE');
  return { title:'Pets', routines: routines.map(r => ({id:r.routine_id, name:r.name, action:r.quick_action_label, doneToday: routineDoneToday_(r.name, r.subject_id)})) };
}

function buildProjectsCard_() {
  return { title:'Projects', notes:[{title:'ZEKE private alpha', status:'Active build/test'}] };
}

function routineDoneToday_(name, subjectId) {
  const events = readObjects_(ZEKE.SHEETS.EVENT_LEDGER);
  return events.some(e => e.event_date === todayIso_() && e.subject_id === subjectId && String(e.display_title).toLowerCase().indexOf(String(name).toLowerCase().split(' ')[0]) >= 0);
}

function markRoutineDone(routineId) {
  const r = readObjects_(ZEKE.SHEETS.ROUTINES).find(x => x.routine_id === routineId);
  if (!r) throw new Error('Routine not found: ' + routineId);
  const event = {domain:r.domain, category:'routine', subject_id:r.subject_id, display_title:r.name + ' — ' + r.quick_action_label, event_date:todayIso_(), event_time:Utilities.formatDate(new Date(), ZEKE.TZ, 'HH:mm'), raw_note:r.name + ' marked ' + r.quick_action_label, structured:{routine_id:r.routine_id, action:r.quick_action_label}, confidence:'confirmed'};
  writeInterpretedEvent_(event, 'quick_action');
  if (r.domain === 'Health' && /atorvastatin|mounjaro|med/i.test(r.name)) {
    appendObject_(ZEKE.SHEETS.MEDS, {med_id:uuid_('MED'), date:todayIso_(), time:event.event_time, subject_id:r.subject_id, name:r.name, dose:'', unit:'', status:'taken', source:'quick_action', notes:''}, getSheetDefinitions_()[ZEKE.SHEETS.MEDS]);
  }
  return {ok:true};
}

function runNightlyDiscoveryScan() {
  // Minimal alpha placeholder: create only useful, low-noise findings.
  const healthRows = readObjects_(ZEKE.SHEETS.HEALTH_METRICS);
  if (healthRows.length >= 10 && !recentDiscoveryExists_('Apple Health import active')) {
    appendObject_(ZEKE.SHEETS.DISCOVERIES, {
      discovery_id: uuid_('DISC'), created_at: nowIso_(), domain:'Health', title:'Apple Health import active',
      summary:'ZEKE has enough imported health rows to begin showing trend summaries. This is an observation, not medical advice.',
      evidence_json: JSON.stringify([{source:'HealthMetrics', count: healthRows.length}]), counter_evidence_json:'[]', confidence_in_analysis:'high', status:'new', next_step_label:'Review imported metrics'
    }, getSheetDefinitions_()[ZEKE.SHEETS.DISCOVERIES]);
  }
  return {ok:true};
}

function recentDiscoveryExists_(title) {
  return readObjects_(ZEKE.SHEETS.DISCOVERIES).some(d => d.title === title);
}
