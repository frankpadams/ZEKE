(() => {
  'use strict';
  const defaults=Object.freeze({workout:'ask',activity:'ask',illness:'ask',injury:'ask',vaccination:'ask',immunotherapy:'ask',medication:'never',sexual_activity:'never',sensitive_context:'never'});
  function policy(kind,prefs={}){return prefs[kind]||defaults[kind]||'ask'}
  function preview(event,kind,prefs={}){const mode=policy(kind,prefs);return {mode,allowed_without_prompt:mode==='always',blocked:mode==='never',title:event?.calendar_title||event?.title||'ZEKE event',details:event?.calendar_details||'',privacy_notice:mode==='ask'?'Review the exact title/details before anything is written to Google Calendar.':null};}
  window.ZekeCalendarPrivacy=Object.freeze({defaults,policy,preview,consentStages:['before_google_connection','before_zeke_calendar_creation'],schemaVersion:1});
})();
