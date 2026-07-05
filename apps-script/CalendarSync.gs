function syncCalendarNext14Days() {
  const cal = CalendarApp.getDefaultCalendar();
  const start = new Date();
  const end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const events = cal.getEvents(start, end);
  const headers = getSheetDefinitions_()[ZEKE.SHEETS.CALENDAR];
  let count = 0;
  events.forEach(ev => {
    const id = ev.getId();
    if (calendarEventExists_(id)) return;
    appendObject_(ZEKE.SHEETS.CALENDAR, {
      calendar_event_id: id,
      start: ev.getStartTime(),
      end: ev.getEndTime(),
      title: ev.getTitle(),
      location: ev.getLocation(),
      description: ev.getDescription(),
      source_calendar: 'default',
      imported_at: nowIso_()
    }, headers);
    appendObject_(ZEKE.SHEETS.EVENT_LEDGER, {
      record_id: uuid_('CAL'),
      event_date: Utilities.formatDate(ev.getStartTime(), ZEKE.TZ, 'yyyy-MM-dd'),
      event_time: Utilities.formatDate(ev.getStartTime(), ZEKE.TZ, 'HH:mm'),
      domain: inferCalendarDomain_(ev.getTitle()),
      category: 'calendar_event',
      subject_id: 'PERSON-001',
      display_title: ev.getTitle(),
      raw_note: ev.getTitle() + (ev.getLocation() ? ' @ ' + ev.getLocation() : ''),
      normalized_json: JSON.stringify({calendar_event_id:id, start:ev.getStartTime(), end:ev.getEndTime()}),
      source: 'google_calendar',
      confidence: 'confirmed',
      analysis_confidence: '',
      created_at: nowIso_(), updated_at: nowIso_(), status: 'active', references_json: '[]'
    }, getSheetDefinitions_()[ZEKE.SHEETS.EVENT_LEDGER]);
    count++;
  });
  return {ok:true, imported: count, scanned: events.length};
}

function calendarEventExists_(id) {
  const sh = getSpreadsheet_().getSheetByName(ZEKE.SHEETS.CALENDAR);
  if (!sh || sh.getLastRow() < 2) return false;
  const vals = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().flat();
  return vals.indexOf(id) !== -1;
}

function inferCalendarDomain_(title) {
  const t = String(title || '').toLowerCase();
  if (/doctor|dentist|pt|physical therapy|therapy|medical|shot|vaccine/.test(t)) return 'Health';
  if (/gym|workout|run|walk|fitness/.test(t)) return 'Fitness';
  if (/rosie|vet|dog/.test(t)) return 'Pets';
  if (/zeke|digital catharsis|project/.test(t)) return 'Projects';
  return 'Calendar';
}
