function getExercisePlanForToday() {
  const catalog = readObjects_(ZEKE.SHEETS.EXERCISES);
  const active = catalog.filter(e => String(e.active).toUpperCase() === 'TRUE');
  return active.slice(0, 6).map(ex => buildExerciseSuggestion_(ex));
}

function buildExerciseSuggestion_(ex) {
  const lastSets = getLastSetsForExercise_(ex.exercise_id);
  const repMin = Number(ex.rep_min || 8), repMax = Number(ex.rep_max || 12), inc = Number(ex.increment_lb || 5);
  const sets = Number(ex.default_sets || 2);
  let suggestedWeight = starterWeight_(ex.exercise_id, ex.name);
  let reason = 'Starter alpha estimate. Adjust down if form, pain, or confidence is poor.';
  let confidence = 'low';
  if (lastSets.length) {
    const weights = lastSets.map(s => Number(s.weight_lb || 0)).filter(Boolean);
    const reps = lastSets.map(s => Number(s.reps || 0)).filter(Boolean);
    const pains = lastSets.map(s => Number(s.pain || 0)).filter(x => !isNaN(x));
    const maxWeight = Math.max.apply(null, weights);
    const minReps = Math.min.apply(null, reps);
    const maxPain = pains.length ? Math.max.apply(null, pains) : 0;
    suggestedWeight = maxWeight;
    confidence = 'moderate';
    if (maxPain >= 4) { suggestedWeight = Math.max(0, maxWeight - inc); reason = 'Prior pain was elevated; reduce load and prioritize form.'; }
    else if (minReps >= repMax) { suggestedWeight = maxWeight + inc; reason = 'Last logged sets reached the top of the rep range without high pain.'; }
    else if (minReps < repMin) { suggestedWeight = Math.max(0, maxWeight - inc); reason = 'Last logged reps were below target range; reduce slightly or repeat easier.'; }
    else { reason = 'Repeat current load until all sets reach the top of the range comfortably.'; }
  }
  return {
    exercise_id: ex.exercise_id,
    name: ex.name,
    sets,
    reps: repMin + '-' + repMax,
    suggested_weight_lb: suggestedWeight,
    caution: ex.caution_tags || '',
    reason,
    confidence_in_analysis: confidence
  };
}

function starterWeight_(id, name) {
  const defaults = { 'EX-LATPULL': 60, 'EX-SEATEDROW': 40, 'EX-LEGCURL': 70, 'EX-GLUTELIFT': 140, 'EX-BICEPCURL': 40, 'EX-ABDOMINAL': 80, 'EX-LEGEXT': 100 };
  return defaults[id] || 20;
}

function getLastSetsForExercise_(exerciseId) {
  const rows = readObjects_(ZEKE.SHEETS.STRENGTH).filter(r => r.exercise_id === exerciseId);
  if (!rows.length) return [];
  rows.sort((a,b) => String(b.date).localeCompare(String(a.date)) || String(b.workout_id).localeCompare(String(a.workout_id)));
  const latestDate = rows[0].date;
  return rows.filter(r => r.date === latestDate).slice(0, 10);
}

function logStrengthSet(payload) {
  const workoutId = payload.workout_id || ('W-' + todayIso_());
  const volume = Number(payload.weight_lb || 0) * Number(payload.reps || 0);
  appendObject_(ZEKE.SHEETS.STRENGTH, {
    set_id: uuid_('SET'), workout_id: workoutId, date: payload.date || todayIso_(), exercise_id: payload.exercise_id,
    exercise_name: payload.exercise_name, set_number: payload.set_number || '', weight_lb: payload.weight_lb, reps: payload.reps,
    rpe: payload.rpe || '', pain: payload.pain || '', notes: payload.notes || '', volume
  }, getSheetDefinitions_()[ZEKE.SHEETS.STRENGTH]);
  return {ok:true, workout_id: workoutId};
}

function readObjects_(sheetName) {
  const sh = getSpreadsheet_().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1).map(r => {
    const o = {};
    headers.forEach((h,i)=>o[h]=r[i]);
    return o;
  });
}
