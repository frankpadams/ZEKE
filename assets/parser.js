(() => {
  'use strict';

  const norm = (s) => String(s || '').trim();
  const lower = (s) => norm(s).toLowerCase();
  const num = (x) => Number(String(x).replace(/,/g, ''));
  const now = () => new Date().toISOString();

  const MED_ALIASES = {
    atorvastatin: ['atorvastatin', 'lipitor', 'statin'],
    mounjaro: ['mounjaro', 'tirzepatide', 'glp-1', 'glp1', 'glp 1']
  };

  const EXERCISE_ALIASES = {
    'bench press': ['bench press', 'bench', 'bp'],
    'lat pulldown': ['lat pulldown', 'lat pull down', 'pulldown', 'lat pull-down'],
    'seated row': ['seated row', 'row machine'],
    'leg curl': ['seated leg curl', 'leg curl'],
    'leg extension': ['leg extension'],
    'bicep curl': ['bicep curl', 'biceps curl', 'curl machine'],
    'abdominal': ['abdominal', 'ab machine', 'ab crunch'],
    'stair climber': ['stair climber', 'stairclimber', 'climbmill', 'stairs']
  };

  function findAlias(text, map) {
    const l = lower(text);
    for (const [canonical, aliases] of Object.entries(map)) {
      if (aliases.some(a => l.includes(a))) return canonical;
    }
    return null;
  }

  function isAmbiguousBP(text) {
    return /^\s*bp\s+\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?){2,3}\s*$/i.test(text);
  }

  function parseBloodPressure(text) {
    const l = lower(text);
    const m = l.match(/(?:bp|blood pressure)?\s*(\d{2,3})\s*[\/,-]\s*(\d{2,3})(?:\s+(?:hr|pulse)\s*(\d{2,3}))?/i);
    if (!m) return null;
    const systolic = num(m[1]), diastolic = num(m[2]);
    if (!(systolic >= 50 && systolic <= 300 && diastolic >= 30 && diastolic <= 200)) return null;
    const ts = now();
    const events = [
      { category:'measurement', timestamp:ts, raw_text:text, structured:{ metric_id:'bp_systolic', value:systolic, unit:'mmHg', interpretation_status:'confirmed' } },
      { category:'measurement', timestamp:ts, raw_text:text, structured:{ metric_id:'bp_diastolic', value:diastolic, unit:'mmHg', interpretation_status:'confirmed' } }
    ];
    if (m[3]) events.push({ category:'measurement', timestamp:ts, raw_text:text, structured:{ metric_id:'heart_rate', value:num(m[3]), unit:'bpm', interpretation_status:'confirmed' } });
    return { confidence:0.99, summary:`blood pressure ${systolic}/${diastolic} mmHg`, events };
  }

  function parseWeight(text) {
    const l = lower(text);
    const m = l.match(/(?:weight|weighed|weighing|i am|i'm)\s*(?:is|was|at)?\s*(\d{2,3}(?:\.\d+)?)\s*(lb|lbs|pounds|kg|kilograms)?\b/i);
    if (!m || (!/weight|weigh/i.test(l) && !m[2])) return null;
    const unit = /^kg|kilogram/.test(m[2] || '') ? 'kg' : 'lb';
    return { confidence:0.97, summary:`weight ${m[1]} ${unit}`, events:[{ category:'measurement', timestamp:now(), raw_text:text, structured:{ metric_id:'weight', value:num(m[1]), unit, interpretation_status:'confirmed' } }] };
  }

  function parseRestingHR(text) {
    const m = lower(text).match(/(?:resting\s*(?:heart rate|hr)|rhr)\s*(?:is|was|of)?\s*(\d{2,3})/i);
    if (!m) return null;
    return { confidence:0.97, summary:`resting heart rate ${m[1]} bpm`, events:[{ category:'measurement', timestamp:now(), raw_text:text, structured:{ metric_id:'resting_hr', value:num(m[1]), unit:'bpm', interpretation_status:'confirmed' } }] };
  }

  function parseA1c(text) {
    const m = lower(text).match(/(?:a1c|hba1c)\s*(?:is|was|of)?\s*(\d(?:\.\d+)?)\s*%?/i);
    if (!m) return null;
    return { confidence:0.98, summary:`A1c ${m[1]}%`, events:[{ category:'lab', timestamp:now(), raw_text:text, structured:{ metric_id:'a1c', value:num(m[1]), unit:'%', interpretation_status:'confirmed' } }] };
  }

  function parseMedication(text) {
    const l = lower(text);
    const medication = findAlias(l, MED_ALIASES);
    if (!medication) return null;
    const negated = /\b(did not|didn't|haven't|have not|not taken|forgot|missed)\b/i.test(l);
    const taken = /\b(took|taken|injected|did my|administered)\b/i.test(l) && !negated;
    const doseMatch = l.match(/\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml)\b/i);
    const status = taken ? 'taken' : negated ? 'not_taken_yet' : 'mentioned';
    const dose = doseMatch ? num(doseMatch[1]) : null;
    const unit = doseMatch ? doseMatch[2] : '';
    const summary = `${medication}${dose ? ` ${dose}${unit}` : ''}${status === 'taken' ? ' taken' : status === 'not_taken_yet' ? ' not taken yet' : ''}`;
    return {
      confidence: taken || negated ? 0.96 : 0.78,
      needsClarification: status === 'mentioned',
      summary,
      events:[{ category:'medication', timestamp:now(), raw_text:text, structured:{ medication_name:medication, dose, unit, status, interpretation_status:'confirmed' } }]
    };
  }

  function parseWorkout(text, context = {}) {
    const l = lower(text);
    let exercise = context.exercise || findAlias(l, EXERCISE_ALIASES);
    if (!exercise) return null;
    if (exercise === 'bench press' && isAmbiguousBP(text)) return null;

    let weight, reps, sets, duration, distance, rpe, pain;
    const weightM = l.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds)\b/i);
    const repsM = l.match(/(\d+)\s*(?:reps?|x)\b/i);
    const setsM = l.match(/(\d+)\s*sets?\b/i);
    const durationM = l.match(/(\d+)\s*(?:min|mins|minutes)\b/i);
    const distanceM = l.match(/(\d+(?:\.\d+)?)\s*(?:mile|miles|mi)\b/i);
    const rpeM = l.match(/rpe\s*(\d+(?:\.\d+)?)/i);
    const painM = l.match(/pain\s*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i);

    if (weightM) weight = num(weightM[1]);
    if (repsM) reps = num(repsM[1]);
    if (setsM) sets = num(setsM[1]);
    if (durationM) duration = num(durationM[1]);
    if (distanceM) distance = num(distanceM[1]);
    if (rpeM) rpe = num(rpeM[1]);
    if (painM) pain = num(painM[1]);

    const compact = l.match(/^\s*(?:bp\s+)?(\d+(?:\.\d+)?)\s+(\d+)\s+(\d+)\s*$/i);
    if (compact && context.exercise) {
      weight = num(compact[1]); reps = num(compact[2]); sets = num(compact[3]);
    }

    const parts = [exercise];
    if (weight != null) parts.push(`${weight} lb`);
    if (reps != null) parts.push(`${reps} reps`);
    if (sets != null) parts.push(`${sets} sets`);
    if (duration != null) parts.push(`${duration} min`);
    if (distance != null) parts.push(`${distance} mi`);

    const hasDetail = [weight,reps,sets,duration,distance].some(v => v != null);
    return {
      confidence: hasDetail ? 0.95 : 0.77,
      needsClarification: !hasDetail,
      summary: parts.join(', '),
      events:[{
        category:'workout', timestamp:now(), raw_text:text,
        structured:{ exercise, weight, weight_unit:weight != null ? 'lb' : '', reps, sets, duration_min:duration, distance_mi:distance, rpe, pain, interpretation_status:'confirmed' }
      }]
    };
  }

  function parseRunWalk(text) {
    const l = lower(text);
    if (!/\b(run|ran|running|walk|walked|walking)\b/i.test(l)) return null;
    const activity = /run|ran|running/.test(l) ? 'run' : 'walk';
    const durationM = l.match(/(\d+)\s*(?:min|mins|minutes)\b/i);
    const distanceM = l.match(/(\d+(?:\.\d+)?)\s*(?:mile|miles|mi)\b/i);
    if (!durationM && !distanceM) return null;
    const duration = durationM ? num(durationM[1]) : null;
    const distance = distanceM ? num(distanceM[1]) : null;
    return {
      confidence:0.95,
      summary:`${activity}${distance != null ? ` ${distance} mi` : ''}${duration != null ? `, ${duration} min` : ''}`,
      events:[{ category:'workout', timestamp:now(), raw_text:text, structured:{ exercise:activity, duration_min:duration, distance_mi:distance, interpretation_status:'confirmed' } }]
    };
  }

  function parseSingle(text, context = {}) {
    if (isAmbiguousBP(text) && !context.exercise && !context.metric) {
      return { type:'ambiguity', confidence:0.45, choices:['blood pressure','bench press'], raw:text };
    }
    const metricContext = context.metric;
    if (metricContext === 'weight' && /^\s*\d{2,3}(?:\.\d+)?\s*$/.test(text)) {
      return { confidence:0.98, summary:`weight ${norm(text)} lb`, events:[{ category:'measurement', timestamp:now(), raw_text:text, structured:{ metric_id:'weight', value:num(text), unit:'lb', interpretation_status:'confirmed' } }] };
    }
    if (metricContext === 'blood_pressure') {
      const m = text.match(/(\d{2,3})\D+(\d{2,3})/);
      if (m) return parseBloodPressure(`BP ${m[1]}/${m[2]}`);
    }
    return parseBloodPressure(text) || parseWeight(text) || parseRestingHR(text) || parseA1c(text) || parseMedication(text) || parseWorkout(text, context) || parseRunWalk(text) || {
      type:'unstructured', confidence:0.35, summary:'an observation that needs more interpretation', events:[]
    };
  }

  function splitMultiIntent(text) {
    // Deliberately conservative: only split clear sentence/semicolon boundaries.
    return norm(text).split(/\s*;\s*|\n+/).map(s => s.trim()).filter(Boolean);
  }

  function interpret(text, context = {}) {
    const pieces = splitMultiIntent(text);
    if (pieces.length === 1) return parseSingle(text, context);
    const interpretations = pieces.map(p => parseSingle(p, context));
    if (interpretations.some(i => i.type === 'ambiguity')) return { type:'multi', confidence:Math.min(...interpretations.map(i => i.confidence || 0)), interpretations };
    return {
      type:'multi', confidence:Math.min(...interpretations.map(i => i.confidence || 0)),
      summary: interpretations.map(i => i.summary).join('; '),
      events: interpretations.flatMap(i => i.events || []), interpretations
    };
  }

  window.ZekeParser = { interpret, isAmbiguousBP, aliases:{ medications:MED_ALIASES, exercises:EXERCISE_ALIASES } };
})();
