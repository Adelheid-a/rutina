// Copia en la nube (Supabase). La app sigue funcionando sin internet:
// todo se guarda primero en el teléfono y aquí solo se sube lo que cambió.
// Entrar (PKCE): la app pide un correo con link y guarda una clave secreta (verifier).
// El link abre Safari, que en iPhone no comparte datos con la app instalada; Safari recibe un
// código de un solo uso y lo muestra para copiarlo. La app lo canjea con su clave: el código
// sin la clave no sirve. Si la app corre en Safari mismo, entra sola.

const SB_URL = 'https://nrteskslkdqmkfoqkafe.supabase.co';
const SB_KEY = 'sb_publishable_9U83XAuvrGSSTxFuEljfew_d0eZFsRr'; // llave pública; los datos los protege RLS
const SYNC_KEY = 'rutina.sync';

// { session: { access, refresh, exp, uid, email }, pendingEmail, sent: { fecha: json }, sentAjustes, last }
const sync = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(SYNC_KEY) || 'null');
    if (s && typeof s === 'object') return { ...s, sent: s.sent || {} };
  } catch (e) { /* sin almacenamiento */ }
  return { sent: {} };
})();
function saveSync() {
  try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); } catch (e) { /* lleno o bloqueado */ }
}

let syncing = false, again = false, syncTimer = 0, syncMsg = '';

// ---------- red ----------
async function sbFetch(path, opts = {}, auth = true) {
  const headers = { apikey: SB_KEY, 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (auth) headers.Authorization = 'Bearer ' + (await accessToken());
  const res = await fetch(SB_URL + path, { ...opts, headers });
  if (!res.ok) {
    let msg = '';
    try { const j = await res.json(); msg = j.msg || j.message || j.error_description || j.error || ''; } catch (e) { /* sin cuerpo */ }
    const err = new Error(msg || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

// ---------- sesión ----------
function setSession(j) {
  const prev = sync.session || {};
  sync.session = {
    access: j.access_token,
    refresh: j.refresh_token,
    exp: Date.now() + (j.expires_in || 3600) * 1000,
    uid: (j.user && j.user.id) || prev.uid,
    email: (j.user && j.user.email) || prev.email,
  };
  saveSync();
}
let refreshing = null;
function accessToken() {
  const s = sync.session;
  if (!s) return Promise.reject(Object.assign(new Error('sin sesión'), { status: 401 }));
  if (Date.now() < s.exp - 60000) return Promise.resolve(s.access);
  if (!refreshing) {
    refreshing = sbFetch('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: s.refresh }) }, false)
      .then((j) => { setSession(j); return j.access_token; })
      .catch((e) => {
        // sin red se conserva la sesión; si el servidor la rechaza, hay que volver a entrar
        if (e.status === 400 || e.status === 401 || e.status === 403) { sync.session = null; saveSync(); }
        throw e;
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

// ---------- subir y bajar ----------
const upsert = (table, conflict, rows) => sbFetch(`/rest/v1/${table}?on_conflict=${conflict}`, {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(rows),
});

async function syncNow() {
  if (!sync.session) return;
  if (syncing) { again = true; return; }
  if (!navigator.onLine) { setSyncMsg('Sin internet: se sube cuando vuelva la conexión.'); return; }
  syncing = true;
  try {
    const uid = sync.session.uid;
    const now = new Date().toISOString();
    const changed = Object.keys(state.log)
      .filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))
      .map((k) => [k, JSON.stringify(state.log[k])])
      .filter(([k, j]) => sync.sent[k] !== j);
    for (let i = 0; i < changed.length; i += 50) {
      const chunk = changed.slice(i, i + 50);
      await upsert('dias', 'user_id,fecha', chunk.map(([k, j]) => ({ user_id: uid, fecha: k, log: JSON.parse(j), updated_at: now })));
      for (const [k, j] of chunk) sync.sent[k] = j;
      saveSync();
    }
    const aj = JSON.stringify({ start: state.start, deload: !!state.deload });
    if (sync.sentAjustes !== aj) {
      await upsert('ajustes', 'user_id', [{ user_id: uid, ...JSON.parse(aj), updated_at: now }]);
      sync.sentAjustes = aj;
    }
    sync.last = now;
    saveSync();
    setSyncMsg('');
  } catch (e) {
    setSyncMsg(!sync.session ? 'Tu sesión venció. Vuelve a entrar con tu correo.' : 'No se pudo sincronizar. Se intenta de nuevo solo.');
    if (!sync.session && location.hash.startsWith('#/plan')) renderPlan();
  } finally {
    syncing = false;
    if (again) { again = false; queueSync(); }
  }
  refreshSyncRow();
}
// la llama save() en app.js: agrupa los cambios seguidos en una sola subida
function queueSync() {
  if (!sync.session) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncNow, 1500);
}

// al entrar: trae los días que este teléfono no tiene (por ejemplo, en un celular nuevo)
async function pullMissing() {
  const rows = (await sbFetch('/rest/v1/dias?select=fecha,log')) || [];
  const empty = Object.keys(state.log).length === 0;
  let added = 0;
  for (const r of rows) {
    if (!state.log[r.fecha]) { state.log[r.fecha] = r.log; sync.sent[r.fecha] = JSON.stringify(r.log); added++; }
  }
  if (empty) {
    const aj = (await sbFetch('/rest/v1/ajustes?select=start,deload')) || [];
    if (aj[0]) { state.start = aj[0].start; state.deload = !!aj[0].deload; sync.sentAjustes = JSON.stringify({ start: state.start, deload: state.deload }); }
  }
  saveSync();
  if (added || empty) save();
  return added;
}

// ---------- interfaz (sección en Plan) ----------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function pendingDays() {
  return Object.keys(state.log).filter((k) => sync.sent[k] !== JSON.stringify(state.log[k])).length;
}
function lastText() {
  if (!sync.last) return 'Aún no se ha subido nada';
  const min = Math.round((Date.now() - new Date(sync.last)) / 60000);
  const when = min < 1 ? 'hace un momento' : min < 60 ? `hace ${min} min` : min < 1440 ? `hace ${Math.round(min / 60)} h` : fmtDate(dateKey(new Date(sync.last)));
  const p = pendingDays();
  return `Última vez ${when}${p ? ` · ${p} ${p === 1 ? 'día pendiente' : 'días pendientes'}` : ''}`;
}
function syncSection() {
  let body;
  if (sync.session) {
    body = `<div class="settings">
      <div class="setting" id="syncRow"><p>${esc(sync.session.email || 'Conectado')}<small>${lastText()}</small></p>
        <button type="button" class="btn btn--ghost btn--sm" id="syncNow">Sincronizar</button></div>
    </div>
    <button type="button" class="link-btn" id="syncOut">Cerrar sesión en este teléfono</button>`;
  } else if (handoffCode) {
    body = `<p class="fine">Ya casi. Abre la app <b>Rutina</b> desde tu pantalla de inicio y pega este código en <b>Plan → Copia en la nube</b>. Vence en unos minutos.</p>
    <div class="handoff"><code id="handoffCode">${esc(handoffCode)}</code><button type="button" class="btn" id="copyHandoff">Copiar</button></div>`;
  } else if (sync.pendingEmail) {
    body = `<p class="fine">Te mandamos un correo a <b>${esc(sync.pendingEmail)}</b> (puede tardar un minuto). Toca <b>Sign in</b>: se abre Safari con un código. Cópialo y pégalo aquí.</p>
    <form class="sync-form" id="syncCodeForm">
      <input id="syncCode" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Pega el código" aria-label="Código de Safari" required>
      <button type="submit" class="btn">Entrar</button>
    </form>
    <button type="button" class="link-btn" id="syncBack">Usar otro correo o reenviar</button>`;
  } else {
    body = `<p class="fine">Guarda tus registros también en tu cuenta para no perderlos y revisar tu progreso desde la computadora. Solo se hace una vez en este teléfono.</p>
    <form class="sync-form" id="syncEmailForm">
      <input id="syncEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="tu@correo.com" aria-label="Correo" required>
      <button type="submit" class="btn">Enviar link</button>
    </form>`;
  }
  return `<h2 class="section-h">Copia en la nube</h2>${body}<p class="toast-msg" id="syncMsg" role="status">${esc(syncMsg)}</p>`;
}
function setSyncMsg(t) {
  syncMsg = t;
  const el = document.getElementById('syncMsg');
  if (el) el.textContent = t;
}
function refreshSyncRow() {
  const small = document.querySelector('#syncRow small');
  if (small) small.textContent = lastText();
}

// ---------- PKCE ----------
let handoffCode = '';
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function newChallenge() {
  sync.pkce = b64url(crypto.getRandomValues(new Uint8Array(32)));
  saveSync();
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sync.pkce));
  return b64url(new Uint8Array(hash));
}
async function exchangeCode(code) {
  if (!sync.pkce) throw Object.assign(new Error('sin clave'), { status: 400 });
  setSession(await sbFetch('/auth/v1/token?grant_type=pkce', { method: 'POST', body: JSON.stringify({ auth_code: code, code_verifier: sync.pkce }) }, false));
  delete sync.pkce;
  saveSync();
}
// el código que muestra Safari (o el link completo de regreso, si lo pegan)
function parseCode(txt) {
  const m = txt.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return m ? m[0].toLowerCase() : null;
}

// del link del correo saca el token (aunque el correo lo haya envuelto en otro link)
function parseLink(txt) {
  let s = txt;
  for (let i = 0; i < 3; i++) { try { s = decodeURIComponent(s); } catch (e) { break; } }
  const t = s.match(/[?&#]token=([A-Za-z0-9_-]{8,})/);
  if (!t) return null;
  const ty = s.match(/[?&#]type=([a-z_]+)/);
  return { token: t[1], type: ty ? ty[1] : 'magiclink' };
}

async function afterLogin() {
  delete sync.pendingEmail;
  saveSync();
  setSyncMsg('Subiendo tus registros…');
  const added = await pullMissing();
  await syncNow();
  syncMsg = added ? `Listo. También se recuperaron ${added} días de tu cuenta.` : 'Listo. Tus registros ya están en tu cuenta.';
  if (location.hash !== '#/plan') location.hash = '#/plan'; else route();
}

// regreso del link del correo: ?code=… (PKCE) o #access_token=… (flujo viejo)
function readHashSession() {
  const q = new URLSearchParams(location.search);
  const h = location.hash;
  if (!q.get('code') && !q.get('error_description') && !/access_token=|error_description=/.test(h)) return;
  const p = new URLSearchParams(h.replace(/^#\/?/, ''));
  history.replaceState(null, '', location.pathname + '#/plan');
  if (q.get('code')) {
    const code = q.get('code');
    // misma app (Safari): entra sola; app instalada: Safari no tiene la clave, muestra el código
    exchangeCode(code)
      .then(afterLogin)
      .catch(() => { handoffCode = code; syncMsg = ''; route(); });
    return;
  }
  if (p.get('access_token')) {
    let user = {};
    try { user = JSON.parse(atob(p.get('access_token').split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { /* token raro */ }
    setSession({
      access_token: p.get('access_token'),
      refresh_token: p.get('refresh_token'),
      expires_in: Number(p.get('expires_in')) || 3600,
      user: { id: user.sub, email: user.email },
    });
    afterLogin().catch(() => { syncMsg = 'Entraste, pero no se pudo subir todavía. Se intenta de nuevo solo.'; route(); });
  } else {
    syncMsg = 'Ese enlace ya se usó o venció. Pide uno nuevo.';
    route();
  }
}

function busy(form, on) {
  form.querySelectorAll('button, input').forEach((el) => { el.disabled = on; });
}

screen.addEventListener('submit', async (e) => {
  const form = e.target;
  if (form.id === 'syncEmailForm') {
    e.preventDefault();
    const email = form.querySelector('#syncEmail').value.trim().toLowerCase();
    busy(form, true);
    setSyncMsg('Enviando…');
    try {
      // el link regresa a esta misma página con ?code=…; solo esta app tiene la clave para canjearlo
      const back = encodeURIComponent(location.origin + location.pathname);
      const challenge = await newChallenge();
      await sbFetch(`/auth/v1/otp?redirect_to=${back}`, {
        method: 'POST',
        body: JSON.stringify({ email, create_user: true, code_challenge: challenge, code_challenge_method: 's256' }),
      }, false);
      sync.pendingEmail = email;
      saveSync();
      syncMsg = '';
      renderPlan();
      document.getElementById('syncCode')?.focus();
    } catch (err) {
      busy(form, false);
      setSyncMsg(!navigator.onLine ? 'Necesitas internet para esto.' : err.status === 429 ? 'Pediste varios correos seguidos. Espera unos minutos y vuelve a intentar.' : 'No se pudo enviar el correo. Revísalo e intenta otra vez.');
    }
  }
  if (form.id === 'syncCodeForm') {
    e.preventDefault();
    const raw = form.querySelector('#syncCode').value.trim();
    const code = parseCode(raw);
    const link = code ? null : parseLink(raw);
    if (!code && !link) { setSyncMsg('Eso no parece el código. Cópialo completo con el botón “Copiar” de Safari.'); return; }
    busy(form, true);
    setSyncMsg('Revisando…');
    try {
      if (code) await exchangeCode(code);
      else setSession(await sbFetch('/auth/v1/verify', { method: 'POST', body: JSON.stringify({ type: link.type, token_hash: link.token }) }, false));
      await afterLogin();
    } catch (err) {
      busy(form, false);
      setSyncMsg(err.status >= 400 && err.status < 500 ? 'Ese código ya se usó, venció o es de otro correo. Pide uno nuevo con “Usar otro correo o reenviar”.' : 'No se pudo entrar. Intenta otra vez.');
    }
  }
});

screen.addEventListener('click', async (e) => {
  if (e.target.id === 'syncNow') {
    e.target.disabled = true;
    setSyncMsg('Sincronizando…');
    await syncNow();
    if (!syncMsg || syncMsg === 'Sincronizando…') setSyncMsg('Todo al día.');
    e.target.disabled = false;
  }
  if (e.target.id === 'copyHandoff') {
    try {
      await navigator.clipboard.writeText(handoffCode);
      e.target.textContent = 'Copiado';
      setSyncMsg('Ahora abre la app Rutina y pégalo.');
    } catch (err) {
      // sin permiso de portapapeles: deja el código seleccionado para copiarlo a mano
      const r = document.createRange();
      r.selectNodeContents(document.getElementById('handoffCode'));
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      setSyncMsg('Mantén presionado el código seleccionado y elige Copiar.');
    }
  }
  if (e.target.id === 'syncBack') {
    delete sync.pendingEmail;
    delete sync.pkce;
    saveSync();
    syncMsg = '';
    renderPlan();
  }
  if (e.target.id === 'syncOut') {
    try { await sbFetch('/auth/v1/logout', { method: 'POST' }); } catch (err) { /* igual se cierra aquí */ }
    sync.session = null;
    sync.sent = {};
    delete sync.sentAjustes;
    delete sync.last;
    saveSync();
    syncMsg = 'Sesión cerrada. Tus registros siguen en este teléfono.';
    renderPlan();
  }
});

window.addEventListener('online', () => syncNow());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
readHashSession();
// app.js ya pintó la pantalla antes de cargar este archivo: si es Plan, se vuelve a pintar con la sección
if (location.hash.startsWith('#/plan') && !document.getElementById('syncMsg')) route();
setTimeout(syncNow, 1200);
