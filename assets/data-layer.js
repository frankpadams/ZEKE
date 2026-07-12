(() => {
  'use strict';

  const SETUP_KEY = 'ZEKE_SETUP_META_V1';
  const SESSION_TOKEN_KEY = 'ZEKE_GOOGLE_SESSION_TOKEN_V1';
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
    importBatches: 'imports/batches.json',
    conversation: 'system/conversation.json',
    syncSources: 'imports/sources.json'
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
    conversation: [],
    syncSources: { sources: [] },
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
    async readBinary() { throw new Error('readBinary() not implemented'); }
    async writeBinary() { throw new Error('writeBinary() not implemented'); }
    async listCalendarEvents() { return []; }
    async describeConnection() { return { id: this.id, label: this.label }; }
  }

  class GoogleDriveProvider extends StorageProvider {
    constructor(config = {}) {
      super('google-drive', 'Google Drive');
      this.clientId = config.clientId || window.ZEKE_CONFIG?.googleClientId || '';
      this.token = '';
      this.tokenExpiresAt = 0;
      try {
        const saved = JSON.parse(sessionStorage.getItem(SESSION_TOKEN_KEY) || 'null');
        if (saved?.accessToken && Number(saved.expiresAt) > Date.now() + 60_000) {
          this.token = saved.accessToken;
          this.tokenExpiresAt = Number(saved.expiresAt);
        } else if (saved) {
          sessionStorage.removeItem(SESSION_TOKEN_KEY);
        }
      } catch { try { sessionStorage.removeItem(SESSION_TOKEN_KEY); } catch {} }
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
            this.tokenExpiresAt = Date.now() + Number(result.expires_in || 3600) * 1000;
            try { sessionStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify({ accessToken:this.token, expiresAt:this.tokenExpiresAt })); } catch {}
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
    async reconnectSilently() {
      if (this.token && this.tokenExpiresAt > Date.now() + 60_000) return { connected:true, restoredFromSession:true };
      return this.requestToken('');
    }
    async isConnected() { return Boolean(this.token); }

    async disconnect({ revoke = false } = {}) {
      const token = this.token;
      this.token = '';
      this.tokenExpiresAt = 0;
      try { sessionStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
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
        this.tokenExpiresAt = 0;
        try { sessionStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
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
      if (raw && typeof raw === 'object') return clone(raw);
      try { return JSON.parse(raw); } catch { return clone(fallback); }
    }

    async readBinary(path) {
      const file = await this.findFileByPath(path);
      if (!file) return null;
      if (!this.token) throw new Error('Google Drive is not connected.');
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`, { headers:{Authorization:`Bearer ${this.token}`} });
      if (!response.ok) throw new Error(`Google API error ${response.status}: ${await response.text()}`);
      return response.arrayBuffer();
    }

    async writeBinary(path, arrayBuffer, mimeType='application/octet-stream') {
      const parts=path.split('/').filter(Boolean); const name=parts.pop();
      const parentId=parts.length?await this.ensureFolderPath(parts.join('/')):this.rootId;
      const existing=await this.findFileByPath(path); const blob=new Blob([arrayBuffer],{type:mimeType});
      if(existing){
        const response=await fetch(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existing.id)}?uploadType=media`,{method:'PATCH',headers:{Authorization:`Bearer ${this.token}`,'Content-Type':mimeType},body:blob});
        if(!response.ok) throw new Error(`Google API error ${response.status}: ${await response.text()}`);
        return response.json().catch(()=>({id:existing.id,name}));
      }
      const boundary=`zeke_${crypto.randomUUID()}`;
      const meta=JSON.stringify({name,parents:[parentId],mimeType,appProperties:{zeke_path:path,zeke_managed_source:'true'}});
      const body=new Blob([`--${boundary}
Content-Type: application/json; charset=UTF-8

${meta}
--${boundary}
Content-Type: ${mimeType}

`,blob,`
--${boundary}--`]);
      const response=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime',{method:'POST',headers:{Authorization:`Bearer ${this.token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body});
      if(!response.ok) throw new Error(`Google API error ${response.status}: ${await response.text()}`);
      return response.json();
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
        product: 'Project Zeke', repository_schema_version: 3,
        workspace_id: currentManifest.workspace_id || crypto.randomUUID(),
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
    async readBinary(path) { return this.store.get(path) || null; }
    async writeBinary(path, value) { this.store.set(path, value); return { path }; }
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
    state.conversation = loaded.conversation || [];
    state.syncSources = loaded.syncSources || { sources: [] };
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
        investigations: state.investigations.length,
        conversation: state.conversation.length
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
    const created = [], skippedDuplicates = [];
    for (const candidate of structuredEvents) {
      const matches = await findLikelyDuplicates(candidate, 0.94);
      if (matches.length) { skippedDuplicates.push(matches[0].event.id); continue; }
      created.push(await addEvent({
        ...candidate,
        provenance: { ...(candidate.provenance || {}), source: candidate.provenance?.source || 'interpreted', raw_event_id: rawId }
      }));
    }
    await updateEvent(rawId, {
      structured: { ...(raw.structured || {}), interpretation_status: 'confirmed', structured_event_ids: created.map(e => e.id), skipped_duplicate_event_ids: skippedDuplicates },
      correction_note: 'Interpretation confirmed'
    }, { appendCorrection: false });
    return created;
  }

  function duplicateScore(candidate, existing) {
    if (candidate.category !== existing.category) return 0;
    const a = candidate.structured || {}, b = existing.structured || {};
    if (candidate.category === 'workout' && a.workout_id && b.workout_id && String(a.workout_id) === String(b.workout_id) && a.set_number != null && b.set_number != null && Number(a.set_number) !== Number(b.set_number)) return 0;
    const timeDelta = Math.abs(new Date(candidate.timestamp || nowIso()) - new Date(existing.timestamp || 0));
    // Equal values on different days are legitimate history, not duplicates.
    const maxWindow = candidate.category === 'workout' ? 8 * 3600e3 : 24 * 3600e3;
    if (!Number.isFinite(timeDelta) || timeDelta > maxWindow) return 0;
    const keys = ['metric_id','value','exercise','weight','reps','sets','medication_name','dose','duration_min','steps','distance_mi','workout_id'];
    const comparable = keys.filter(k => a[k] != null && b[k] != null);
    if (!comparable.length) return 0;
    const matched = comparable.filter(k => String(a[k]).toLowerCase() === String(b[k]).toLowerCase()).length;
    let score = matched / comparable.length;
    if (timeDelta < 10 * 60e3) score += 0.30;
    else if (timeDelta < 2 * 3600e3) score += 0.15;
    else score -= 0.10;
    return Math.max(0, Math.min(1, score));
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

  async function listConversation() { return clone([...state.conversation]); }
  async function appendConversation(message) {
    const normalized = { id:message.id || crypto.randomUUID(), at:message.at || nowIso(), role:message.role || 'zeke', text:String(message.text || ''), ...(message.meta || {}) };
    state.conversation = [...state.conversation, normalized].slice(-300);
    await persist('conversation');
    emit('zeke:conversation-changed');
    return clone(normalized);
  }
  async function saveConversation(messages) {
    state.conversation = clone((messages || []).slice(-300));
    await persist('conversation');
    emit('zeke:conversation-changed');
    return clone(state.conversation);
  }
  async function listImportBatches() { return clone([...state.importBatches]); }
  async function saveImportBatch(batch) {
    const normalized = { id:batch.id || crypto.randomUUID(), created_at:batch.created_at || nowIso(), ...batch };
    state.importBatches = [...state.importBatches, normalized].slice(-100);
    await persist('importBatches');
    emit('zeke:import-batch-changed');
    return clone(normalized);
  }


  async function mergeHistoryPackage(pkg = {}, meta = {}) {
    const mergeById = (existing, incoming) => {
      const map = new Map((existing || []).map(x => [x.id || crypto.randomUUID(), x]));
      for (const item of incoming || []) {
        const id = item.id || crypto.randomUUID();
        if (!map.has(id)) map.set(id, { ...item, id });
      }
      return [...map.values()];
    };
    state.events = mergeById(state.events, pkg.events);
    state.factors = mergeById(state.factors, pkg.factors);
    state.discoveries = mergeById(state.discoveries, pkg.discoveries);
    state.investigations = mergeById(state.investigations, pkg.investigations);
    state.conversation = mergeById(state.conversation, pkg.conversation).slice(-300);
    if (pkg.actions?.catalog) {
      const catalog = mergeById(state.actions.catalog || [], pkg.actions.catalog);
      state.actions = { ...state.actions, ...pkg.actions, catalog };
    }
    if (pkg.preferences && typeof pkg.preferences === 'object') state.preferences = { ...state.preferences, ...pkg.preferences };
    await Promise.all(['events','factors','discoveries','investigations','conversation','actions','preferences'].map(k => persist(k)));
    const report = await saveImportBatch({ type:'history-package', source:meta.source || 'json', file:meta.file || '', counts:{ events:(pkg.events||[]).length, factors:(pkg.factors||[]).length, discoveries:(pkg.discoveries||[]).length, conversation:(pkg.conversation||[]).length } });
    emit();
    return report;
  }


  const cleanFileName = name => String(name || 'health-history.xlsx').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-120);
  async function saveSyncSource(fileName, arrayBuffer, meta = {}) {
    if (!state.provider) throw new Error('Connect storage before linking a spreadsheet.');
    const current=(state.syncSources.sources||[]).find(x=>x.kind==='health-workbook');
    const sourceId=current?.id || crypto.randomUUID();
    const path=current?.path || `imports/originals/connected-health-history-${sourceId}.xlsx`;
    await state.provider.writeBinary(path,arrayBuffer,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const source={id:sourceId,kind:'health-workbook',name:cleanFileName(fileName),path,linked_at:current?.linked_at||nowIso(),updated_at:nowIso(),last_sync_at:meta.last_sync_at||current?.last_sync_at||null,last_report:meta.last_report||current?.last_report||null,schema_version:1};
    state.syncSources={sources:[...(state.syncSources.sources||[]).filter(x=>x.id!==sourceId&&x.kind!=='health-workbook'),source]};
    await persist('syncSources'); emit('zeke:sync-source-changed'); return clone(source);
  }
  async function getSyncSource() { return clone((state.syncSources.sources||[]).find(x=>x.kind==='health-workbook')||null); }
  async function readSyncSourceWorkbook() { const source=await getSyncSource(); if(!source)return null; return {source,buffer:await state.provider.readBinary(source.path)}; }
  async function updateSyncSourceWorkbook(arrayBuffer, report = null) {
    const source=await getSyncSource(); if(!source) throw new Error('No connected health workbook.');
    // Never rewrite the source workbook during synchronization. Spreadsheet libraries can drop charts or formatting.
    if(arrayBuffer) await state.provider.writeBinary('imports/ZEKE-Event-Mirror.xlsx',arrayBuffer,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    source.updated_at=nowIso(); source.last_sync_at=nowIso(); if(report)source.last_report=report; source.mirror_path='imports/ZEKE-Event-Mirror.xlsx';
    state.syncSources={sources:[...(state.syncSources.sources||[]).filter(x=>x.id!==source.id),source]}; await persist('syncSources'); emit('zeke:sync-source-changed'); return clone(source);
  }
  async function reconcileSourceEvents(candidates=[], meta={}) {
    if(!state.provider) throw new Error('Connect storage before synchronizing.');
    const backupPath=`imports/backups/events-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    await state.provider.writeJson(backupPath,{created_at:nowIso(),reason:'pre-sync-backup',source:meta.source||'',events:state.events});
    const existingByKey=new Map();
    state.events.forEach((e,i)=>{const k=e.provenance?.source_key;if(k)existingByKey.set(k,{e,i});});
    const report={created:0,updated:0,unchanged:0,linked_existing:0,conflicts:0,skipped:0,backup_path:backupPath};
    const semanticKey=e=>{const s=e.structured||{};return [e.category,String(e.timestamp||'').slice(0,10),s.metric_id||'',s.exercise||'',s.medication_name||'',s.value??'',s.dose??'',s.duration_min??''].map(x=>String(x).trim().toLowerCase()).join('|')};
    const semantic=new Map(state.events.filter(e=>!['raw_input','correction'].includes(e.category)).map(e=>[semanticKey(e),e]));
    for(const c0 of candidates){
      const c=clone(c0); const key=c.provenance?.source_key; const fp=c.provenance?.source_fingerprint;
      if(!key){report.skipped++;continue;}
      const match=existingByKey.get(key);
      if(match){
        if(match.e.provenance?.source_fingerprint===fp){report.unchanged++;continue;}
        const before=match.e; const updated={...before,...c,id:before.id,recorded_at:before.recorded_at||nowIso(),updated_at:nowIso(),provenance:{...(before.provenance||{}),...(c.provenance||{}),sync_updated_at:nowIso()}};
        state.events[match.i]=updated; existingByKey.set(key,{e:updated,i:match.i}); report.updated++; continue;
      }
      const sem=semantic.get(semanticKey(c));
      if(sem){
        if(!sem.provenance?.source_key){sem.provenance={...(sem.provenance||{}),...(c.provenance||{}),linked_at:nowIso()}; report.linked_existing++; existingByKey.set(key,{e:sem,i:state.events.indexOf(sem)});}
        else report.conflicts++;
        continue;
      }
      const normalized={schema_version:2,id:c.id||crypto.randomUUID(),recorded_at:c.recorded_at||nowIso(),timestamp:c.timestamp||nowIso(),...c};
      state.events.push(normalized); existingByKey.set(key,{e:normalized,i:state.events.length-1}); semantic.set(semanticKey(normalized),normalized); report.created++;
    }
    await persist('events');
    const batch=await saveImportBatch({type:'idempotent-workbook-sync',source:meta.source||'connected-health-workbook',file:meta.file||'',counts:report,message:`Workbook sync completed: ${report.created} created, ${report.updated} updated, ${report.unchanged} unchanged, ${report.linked_existing} linked to existing records, ${report.conflicts} conflicts.`});
    emit(); return {...report,batch_id:batch.id};
  }

  async function listCalendarEvents(days = 14) { return state.provider ? state.provider.listCalendarEvents(days) : []; }

  window.ZekeData = {
    bootstrap, connect, reconnect, disconnect, snapshot, safeSetupMeta,
    listEvents, addEvent, updateEvent, addRawInput, confirmRawInput, findLikelyDuplicates,
    listFactors, saveFactor, resolveFactor, listDiscoveries,
    getActions, saveActions, getPreferences, savePreferences,
    getAIConnections, saveAIConnections, addAIExchange,
    listConversation, appendConversation, saveConversation,
    listImportBatches, saveImportBatch, mergeHistoryPackage,
    saveSyncSource, getSyncSource, readSyncSourceWorkbook, updateSyncSourceWorkbook, reconcileSourceEvents,
    listCalendarEvents,
    constants: { PATHS, SETUP_KEY }
  };
})();
