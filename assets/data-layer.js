(() => {
  'use strict';

  const SETUP_KEY = 'ZEKE_SETUP_META_V1';
  const ROOT_NAME = 'Project Zeke';
  const FOLDER_MIME = 'application/vnd.google-apps.folder';
  const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
  const CAL_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
  const LEGACY_AI_CONNECTIONS_PATH = 'system/ai-connection.json';
  const SCOPES = `${DRIVE_SCOPE} ${CAL_SCOPE}`;

  const FOLDERS = [
    'system', 'health', 'health/documents', 'imports', 'imports/originals',
    'imports/reports', 'pets', 'vehicles', 'house', 'finances', 'projects'
  ];

  const PATHS = {
    manifest: 'system/manifest.json',
    preferences: 'system/preferences.json',
    dashboardLayout: 'system/dashboard-layout.json',
    actions: 'system/actions.json',
    aiConnections: 'system/ai-connections.json',
    events: 'health/events.json',
    discoveries: 'health/discoveries.json',
    injuries: 'health/injuries.json',
    factors: 'health/factors.json',
    investigations: 'health/investigations.json',
    aiExchanges: 'system/ai-exchanges.json',
    importBatches: 'imports/batches.json'
  };

  const state = {
    provider: null,
    providerId: null,
    status: 'booting',
    reconnectRequired: false,
    repository: null,
    events: [],
    discoveries: [],
    injuries: [],
    factors: [],
    investigations: [],
    aiExchanges: [],
    importBatches: [],
    preferences: {},
    dashboardLayout: { widgets: [] },
    actions: { catalog: [], daily_states: {} },
    aiConnections: { connections: [] },
    lastError: ''
  };

  const clone = (v) => structuredClone(v);
  const emit = (name = 'zeke:data-changed') => window.dispatchEvent(new CustomEvent(name, { detail: snapshot() }));
  const nowIso = () => new Date().toISOString();

  function safeSetupMeta() {
    try { return JSON.parse(localStorage.getItem(SETUP_KEY) || 'null'); }
    catch { return null; }
  }

  function saveSetupMeta(meta) {
    const safe = {
      provider: meta.provider,
      configured: Boolean(meta.configured),
      lastConnectedAt: meta.lastConnectedAt || nowIso(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    };
    localStorage.setItem(SETUP_KEY, JSON.stringify(safe));
  }

  function clearSetupMeta() { localStorage.removeItem(SETUP_KEY); }

  function defaultsFor(path) {
    if (path === PATHS.manifest) return {};
    if (path === PATHS.preferences) return { first_run_ack: null, active_modules: ['health'], research_mode: true };
    if (path === PATHS.dashboardLayout) return { widgets: [] };
    if (path === PATHS.actions) return { catalog: [], daily_states: {} };
    if (path === PATHS.aiConnections) return { connections: [] };
    return [];
  }

  class StorageProvider {
    constructor(id, label) { this.id = id; this.label = label; }
    async connect() { throw new Error('connect() not implemented'); }
    async reconnectSilently() { throw new Error('silent reconnect not implemented'); }
    async disconnect() {}
    async initializeRepository() { throw new Error('initializeRepository() not implemented'); }
    async readJson() { throw new Error('readJson() not implemented'); }
    async writeJson() { throw new Error('writeJson() not implemented'); }
    async listCalendarEvents() { return []; }
    async describeConnection() { return { id: this.id, label: this.label }; }
  }

  class GoogleDriveProvider extends StorageProvider {
    constructor(config = {}) {
      super('google-drive', 'Google Drive');
      this.clientId = config.clientId || window.ZEKE_CONFIG?.googleClientId || '';
      this.token = '';
      this.rootId = '';
      this.folderIds = new Map();
      this.tokenClient = null;
    }

    async waitForGIS(timeout = 12000) {
      const started = Date.now();
      while (!window.google?.accounts?.oauth2) {
        if (Date.now() - started > timeout) throw new Error('Google Identity Services did not load. Check the network or a content blocker.');
        await new Promise(r => setTimeout(r, 100));
      }
    }

    async requestToken(prompt) {
      if (!this.clientId) throw new Error('Google connection is not configured for this ZEKE installation.');
      await this.waitForGIS();
      return new Promise((resolve, reject) => {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: SCOPES,
          callback: (result) => {
            if (result?.error) {
              const err = new Error(result.error_description || result.error);
              err.code = result.error;
              reject(err);
              return;
            }
            this.token = result.access_token;
            resolve({ connected: true, expiresIn: result.expires_in || null, scope: result.scope || SCOPES });
          },
          error_callback: (result) => {
            const err = new Error(result?.message || 'Google authorization was not completed.');
            err.code = result?.type || 'oauth_error';
            reject(err);
          }
        });
        this.tokenClient.requestAccessToken({ prompt });
      });
    }

    async connect() { return this.requestToken('consent'); }
    async reconnectSilently() { return this.requestToken(''); }
    async isConnected() { return Boolean(this.token); }

    async disconnect({ revoke = false } = {}) {
      const token = this.token;
      this.token = '';
      this.rootId = '';
      this.folderIds.clear();
      if (revoke && token && window.google?.accounts?.oauth2?.revoke) {
        await new Promise(resolve => window.google.accounts.oauth2.revoke(token, () => resolve()));
      }
    }

    async api(url, options = {}) {
      if (!this.token) throw new Error('Google Drive is not connected.');
      const response = await fetch(url, {
        ...options,
        headers: { Authorization: `Bearer ${this.token}`, ...(options.headers || {}) }
      });
      if (response.status === 401) {
        this.token = '';
        const err = new Error('Google authorization expired. Reconnect storage.');
        err.code = 'reauth_required';
        throw err;
      }
      if (!response.ok) throw new Error(`Google API error ${response.status}: ${await response.text()}`);
      if (response.status === 204) return null;
      return (response.headers.get('content-type') || '').includes('application/json') ? response.json() : response.text();
    }

    async listFiles(query) {
      const params = new URLSearchParams({
        q: query,
        fields: 'files(id,name,mimeType,parents,modifiedTime,appProperties)',
        pageSize: '100',
        spaces: 'drive'
      });
      return this.api(`https://www.googleapis.com/drive/v3/files?${params}`);
    }

    async createMetadata(metadata) {
      return this.api('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,parents,appProperties', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(metadata)
      });
    }

    async findOrCreateRoot() {
      const tagged = await this.listFiles(`trashed = false and mimeType = '${FOLDER_MIME}' and appProperties has { key='zeke_root' and value='true' }`);
      if (tagged.files?.length) return tagged.files[0].id;
      const byName = await this.listFiles(`trashed = false and mimeType = '${FOLDER_MIME}' and name = '${ROOT_NAME}'`);
      if (byName.files?.length) return byName.files[0].id;
      const created = await this.createMetadata({
        name: ROOT_NAME,
        mimeType: FOLDER_MIME,
        appProperties: { zeke_root: 'true', zeke_schema: '2' }
      });
      return created.id;
    }

    async ensureFolderPath(path) {
      this.rootId ||= await this.findOrCreateRoot();
      let parentId = this.rootId;
      let cumulative = '';
      for (const segment of path.split('/').filter(Boolean)) {
        cumulative = cumulative ? `${cumulative}/${segment}` : segment;
        if (this.folderIds.has(cumulative)) {
          parentId = this.folderIds.get(cumulative);
          continue;
        }
        const query = `trashed = false and mimeType = '${FOLDER_MIME}' and name = '${segment.replaceAll("'", "\\'")}' and '${parentId}' in parents`;
        let id = (await this.listFiles(query)).files?.[0]?.id;
        if (!id) {
          id = (await this.createMetadata({
            name: segment, mimeType: FOLDER_MIME, parents: [parentId], appProperties: { zeke_path: cumulative }
          })).id;
        }
        this.folderIds.set(cumulative, id);
        parentId = id;
      }
      return parentId;
    }

    async findFileByPath(path) {
      const parts = path.split('/').filter(Boolean);
      const name = parts.pop();
      const parentId = parts.length ? await this.ensureFolderPath(parts.join('/')) : this.rootId;
      const safeName = name.replaceAll("'", "\\'");
      const result = await this.listFiles(`trashed = false and name = '${safeName}' and '${parentId}' in parents`);
      return result.files?.[0] || null;
    }

    async readJson(path, fallback = null) {
      const file = await this.findFileByPath(path);
      if (!file) return clone(fallback);
      const raw = await this.api(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`);
      try { return JSON.parse(raw); } catch { return clone(fallback); }
    }

    async writeJson(path, value) {
      const parts = path.split('/').filter(Boolean);
      const name = parts.pop();
      const parentId = parts.length ? await this.ensureFolderPath(parts.join('/')) : this.rootId;
      const existing = await this.findFileByPath(path);
      const body = JSON.stringify(value, null, 2);
      if (existing) {
        return this.api(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existing.id)}?uploadType=media`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body
        });
      }
      const boundary = `zeke_${crypto.randomUUID()}`;
      const multipart = [
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [parentId], mimeType: 'application/json', appProperties: { zeke_path: path } })}\r\n`,
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`
      ].join('');
      return this.api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
        method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart
      });
    }

    async initializeRepository() {
      if (!this.token) throw new Error('Connect Google Drive first.');
      this.rootId = await this.findOrCreateRoot();
      for (const folder of FOLDERS) await this.ensureFolderPath(folder);
      for (const path of Object.values(PATHS)) {
        if (!await this.findFileByPath(path)) await this.writeJson(path, defaultsFor(path));
      }
      const currentManifest = await this.readJson(PATHS.manifest, {});
      const manifest = {
        product: 'Project Zeke', repository_schema_version: 2,
        created_at: currentManifest.created_at || nowIso(), updated_at: nowIso(),
        storage_provider: 'google-drive', root_folder_id: this.rootId,
        modules: { health: true, pets: false, vehicles: false, house: false, finances: false, projects: false },
        alpha_user_mode: true
      };
      await this.writeJson(PATHS.manifest, manifest);
      return { rootId: this.rootId, rootName: ROOT_NAME, manifest };
    }

    async listCalendarEvents(days = 14) {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + days * 864e5).toISOString();
      const params = new URLSearchParams({
        timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '50'
      });
      const result = await this.api(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`);
      return (result.items || []).map(event => ({
        id: event.id,
        title: event.summary || '(Untitled event)',
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location || ''
      }));
    }

    async describeConnection() {
      return { id: this.id, label: this.label, rootId: this.rootId, connected: Boolean(this.token) };
    }
  }

  class TestMemoryProvider extends StorageProvider {
    constructor(seed = {}) { super('test-memory', 'Test Memory'); this.store = new Map(Object.entries(seed)); }
    async connect() { return { connected: true }; }
    async reconnectSilently() { return { connected: true }; }
    async initializeRepository() { return { rootName: 'Test Workspace', rootId: 'test' }; }
    async readJson(path, fallback = null) { return clone(this.store.has(path) ? this.store.get(path) : fallback); }
    async writeJson(path, value) { this.store.set(path, clone(value)); return { path }; }
    async listCalendarEvents() { return clone(this.store.get('__calendar') || []); }
  }

  function providerFor(id, options = {}) {
    if (id === 'google-drive') return new GoogleDriveProvider(options);
    if (id === 'test-memory' && window.__ZEKE_TEST_MODE__) return new TestMemoryProvider(window.__ZEKE_TEST_SEED__ || {});
    throw new Error(`Storage provider ${id} is not available in this build.`);
  }

  async function loadRepositoryData() {
    if (!state.provider) throw new Error('No storage provider is connected.');
    const entries = await Promise.all(Object.entries(PATHS).map(async ([key, path]) => [key, await state.provider.readJson(path, defaultsFor(path))]));
    const loaded = Object.fromEntries(entries);
    state.events = loaded.events || [];
    state.discoveries = loaded.discoveries || [];
    state.injuries = loaded.injuries || [];
    state.factors = loaded.factors || [];
    state.investigations = loaded.investigations || [];
    state.aiExchanges = loaded.aiExchanges || [];
    state.importBatches = loaded.importBatches || [];
    state.preferences = loaded.preferences || {};
    state.dashboardLayout = loaded.dashboardLayout || { widgets: [] };
    state.actions = loaded.actions || { catalog: [], daily_states: {} };
    state.aiConnections = loaded.aiConnections || { connections: [] };
    // Backward compatibility: older ZEKE builds stored AI metadata under ai-connection.json.
    if (!(state.aiConnections.connections || []).length) {
      try {
        const legacy = await state.provider.readJson(LEGACY_AI_CONNECTIONS_PATH, { connections: [] });
        if ((legacy?.connections || []).length) {
          state.aiConnections = legacy;
          await state.provider.writeJson(PATHS.aiConnections, state.aiConnections);
        }
      } catch { /* Keep the new empty connection registry. */ }
    }
    emit();
  }

  async function connect(providerId, { silent = false } = {}) {
    state.status = silent ? 'reconnecting' : 'connecting';
    state.reconnectRequired = false;
    state.lastError = '';
    emit('zeke:storage-state');
    try {
      const provider = providerFor(providerId);
      state.provider = provider;
      state.providerId = providerId;
      if (silent) await provider.reconnectSilently(); else await provider.connect();
      state.repository = await provider.initializeRepository();
      await loadRepositoryData();
      state.status = 'connected';
      state.reconnectRequired = false;
      if (providerId !== 'test-memory') saveSetupMeta({ provider: providerId, configured: true, lastConnectedAt: nowIso() });
      emit('zeke:storage-connected');
      return snapshot();
    } catch (error) {
      state.provider = null;
      state.providerId = providerId;
      state.repository = null;
      state.status = silent ? 'reconnect-required' : 'error';
      state.reconnectRequired = silent;
      state.lastError = error.message || String(error);
      emit('zeke:storage-state');
      throw error;
    }
  }

  async function bootstrap() {
    if (window.__ZEKE_TEST_MODE__) {
      await connect('test-memory');
      return snapshot();
    }
    const meta = safeSetupMeta();
    if (!meta?.configured || !meta.provider) {
      state.status = 'needs-setup';
      emit('zeke:storage-state');
      return snapshot();
    }
    try { return await connect(meta.provider, { silent: true }); }
    catch { return snapshot(); }
  }

  async function reconnect() {
    const meta = safeSetupMeta();
    if (!meta?.provider) return connect('google-drive');
    return connect(meta.provider);
  }

  async function disconnect({ forgetSetup = false, revoke = false } = {}) {
    if (state.provider) await state.provider.disconnect({ revoke });
    state.provider = null;
    state.repository = null;
    state.status = forgetSetup ? 'needs-setup' : 'reconnect-required';
    state.reconnectRequired = !forgetSetup;
    state.events = [];
    state.factors = [];
    state.discoveries = [];
    if (forgetSetup) clearSetupMeta();
    emit('zeke:storage-disconnected');
  }

  function snapshot() {
    return clone({
      status: state.status,
      providerId: state.providerId,
      reconnectRequired: state.reconnectRequired,
      repository: state.repository,
      lastError: state.lastError,
      counts: {
        events: state.events.length,
        factors: state.factors.length,
        discoveries: state.discoveries.length,
        investigations: state.investigations.length
      }
    });
  }

  async function persist(key) {
    if (!state.provider) throw new Error('Connect storage before saving personal data.');
    await state.provider.writeJson(PATHS[key], state[key]);
  }

  const byTimeAsc = (a, b) => new Date(a.timestamp || a.recorded_at || 0) - new Date(b.timestamp || b.recorded_at || 0);
  const byTimeDesc = (a, b) => -byTimeAsc(a, b);

  async function listEvents() { return clone([...state.events].sort(byTimeAsc)); }
  async function listFactors() { return clone([...state.factors].sort((a,b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))); }
  async function listDiscoveries() { return clone([...state.discoveries].sort(byTimeDesc)); }
  async function getActions() { return clone(state.actions); }
  async function getPreferences() { return clone(state.preferences); }
  async function getAIConnections() { return clone(state.aiConnections); }

  async function addEvent(event) {
    if (!state.provider) throw new Error('Connect storage before saving personal data.');
    const normalized = {
      schema_version: 2,
      id: event.id || crypto.randomUUID(),
      recorded_at: event.recorded_at || nowIso(),
      timestamp: event.timestamp || nowIso(),
      provenance: { source: 'manual', ...(event.provenance || {}) },
      ...event
    };
    state.events = [...state.events, normalized];
    try { await persist('events'); }
    catch (error) { state.events = state.events.filter(e => e.id !== normalized.id); throw error; }
    emit();
    return clone(normalized);
  }

  async function updateEvent(id, patch, { appendCorrection = true } = {}) {
    const index = state.events.findIndex(e => e.id === id);
    if (index < 0) throw new Error('Record not found.');
    const previous = state.events[index];
    const updated = { ...previous, ...patch, id, updated_at: nowIso() };
    state.events = state.events.map(e => e.id === id ? updated : e);
    if (appendCorrection) {
      state.events.push({
        schema_version: 2,
        id: crypto.randomUUID(),
        category: 'correction',
        timestamp: nowIso(),
        recorded_at: nowIso(),
        raw_text: patch.correction_note || 'Record corrected by user',
        structured: { target_event_id: id, before: previous, after: updated },
        provenance: { source: 'user-correction' }
      });
    }
    await persist('events');
    emit();
    return clone(updated);
  }

  async function addRawInput(rawText, context = {}) {
    return addEvent({
      category: 'raw_input',
      raw_text: rawText,
      structured: { interpretation_status: 'pending', context },
      provenance: { source: 'conversation' }
    });
  }

  async function confirmRawInput(rawId, structuredEvents) {
    const raw = state.events.find(e => e.id === rawId);
    if (!raw) throw new Error('Original input record not found.');
    const created = [];
    for (const candidate of structuredEvents) {
      created.push(await addEvent({
        ...candidate,
        provenance: { ...(candidate.provenance || {}), source: candidate.provenance?.source || 'interpreted', raw_event_id: rawId }
      }));
    }
    await updateEvent(rawId, {
      structured: { ...(raw.structured || {}), interpretation_status: 'confirmed', structured_event_ids: created.map(e => e.id) },
      correction_note: 'Interpretation confirmed'
    }, { appendCorrection: false });
    return created;
  }

  function duplicateScore(candidate, existing) {
    if (candidate.category !== existing.category) return 0;
    const a = candidate.structured || {}, b = existing.structured || {};
    const keys = ['metric_id','value','exercise','weight','reps','sets','medication_name','dose','duration_min','distance_mi'];
    const comparable = keys.filter(k => a[k] != null && b[k] != null);
    if (!comparable.length) return 0;
    const matched = comparable.filter(k => String(a[k]).toLowerCase() === String(b[k]).toLowerCase()).length;
    const timeDelta = Math.abs(new Date(candidate.timestamp || nowIso()) - new Date(existing.timestamp || 0));
    let score = matched / comparable.length;
    if (timeDelta < 10 * 60e3) score += 0.25;
    else if (timeDelta < 6 * 3600e3) score += 0.10;
    return Math.min(1, score);
  }

  async function findLikelyDuplicates(candidate, threshold = 0.75) {
    return clone(state.events
      .filter(e => !['raw_input','correction'].includes(e.category))
      .map(e => ({ event: e, score: duplicateScore(candidate, e) }))
      .filter(x => x.score >= threshold)
      .sort((a,b) => b.score - a.score)
      .slice(0, 5));
  }

  async function saveFactor(factor) {
    const normalized = {
      id: factor.id || crypto.randomUUID(),
      created_at: factor.created_at || nowIso(),
      status: factor.status || 'open',
      type: factor.type || 'other',
      ...factor,
      updated_at: nowIso()
    };
    state.factors = [...state.factors.filter(f => f.id !== normalized.id), normalized];
    await persist('factors');
    emit();
    return clone(normalized);
  }

  async function resolveFactor(id, status, answer = '') {
    const current = state.factors.find(f => f.id === id);
    if (!current) throw new Error('Question not found.');
    return saveFactor({ ...current, status, answer, resolved_at: ['resolved','dismissed','unknown'].includes(status) ? nowIso() : current.resolved_at });
  }

  async function saveActions(actions) { state.actions = clone(actions); await persist('actions'); emit(); return clone(state.actions); }
  async function savePreferences(preferences) { state.preferences = clone(preferences); await persist('preferences'); emit(); return clone(state.preferences); }
  async function saveAIConnections(connections) { state.aiConnections = clone(connections); await persist('aiConnections'); emit('zeke:ai-connection-changed'); return clone(state.aiConnections); }
  async function addAIExchange(exchange) { state.aiExchanges = [...state.aiExchanges, { id: crypto.randomUUID(), timestamp: nowIso(), ...exchange }]; await persist('aiExchanges'); emit('zeke:ai-exchange-changed'); }
  async function listCalendarEvents(days = 14) { return state.provider ? state.provider.listCalendarEvents(days) : []; }

  window.ZekeData = {
    bootstrap, connect, reconnect, disconnect, snapshot, safeSetupMeta,
    listEvents, addEvent, updateEvent, addRawInput, confirmRawInput, findLikelyDuplicates,
    listFactors, saveFactor, resolveFactor, listDiscoveries,
    getActions, saveActions, getPreferences, savePreferences,
    getAIConnections, saveAIConnections, addAIExchange,
    listCalendarEvents,
    constants: { PATHS, SETUP_KEY }
  };
})();
