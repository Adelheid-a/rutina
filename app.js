// Rutina — app sin conexión. Todo se guarda en este teléfono (localStorage).

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const STORE_KEY = 'rutina.v1';
const TIMER_KEY = 'rutina.timer';

const ICON = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  flat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h12M13 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="12" r="1.6" fill="currentColor"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  steps: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M4 30h32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="30" r="3" fill="currentColor"/><circle cx="17" cy="30" r="3" fill="currentColor"/><circle cx="26" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="35" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 22l9-8 9 8 9-8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 4" stroke-linecap="round"/></svg>',
};

// ---------- almacenamiento ----------
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s === 'object' && s.log) return s;
    }
  } catch (e) { /* sin almacenamiento: seguimos en memoria */ }
  return { start: dateKey(new Date()), deload: false, log: {} };
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* lleno o bloqueado */ }
}
const state = load();
save();

// ---------- fechas ----------
function dateKey(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function parseKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
const todayIdx = () => (new Date().getDay() + 6) % 7;
const todayKey = () => dateKey(new Date());
function weekNum() {
  const days = Math.floor((parseKey(todayKey()) - parseKey(state.start)) / 86400000);
  return Math.max(1, Math.floor(days / 7) + 1);
}
const fmtDate = (k) => parseKey(k).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');

// ---------- datos de sesión ----------
// semana de descarga: la mitad de las series con el mismo peso
const setsFor = (item) => (state.deload ? Math.max(1, Math.ceil(item.sets / 2)) : item.sets);
const totalSets = (day) => day.items.reduce((n, it) => n + setsFor(it), 0);
// minutos aproximados: calentamiento + ~40 s por serie (el doble si es por lado) + descansos
const estMinutes = (day) => Math.round((300 + day.items.reduce((n, it) => n + setsFor(it) * (40 * (it.perSide ? 2 : 1) + it.restSec), 0)) / 300) * 5;
const isPairB = (day, i) => i > 0 && day.items[i - 1].pair;
const repsText = (item) => (item.reps[0] === item.reps[1] ? `${item.reps[0]}` : `${item.reps[0]}–${item.reps[1]}`);
const unitWord = (item) => (item.unit === 's' ? 'seg' : 'reps');
const loadOf = (item) => EXERCISES[item.ex].load || 'kg';
const illOf = (exId) => EXERCISES[exId].ill || exId;

function todayLog() { return state.log[todayKey()] || (state.log[todayKey()] = {}); }
function todaySets(item) {
  const day = state.log[todayKey()];
  return (day && day[item.ex]) || [];
}
const doneCount = (item) => todaySets(item).filter((s) => s && s.done).length;

// sesiones anteriores (más reciente primero) con al menos una serie hecha
function pastSessions(exId) {
  const today = todayKey();
  return Object.keys(state.log)
    .filter((k) => k < today && Array.isArray(state.log[k][exId]) && state.log[k][exId].some((s) => s && s.done))
    .sort()
    .reverse()
    .map((k) => ({ date: k, sets: state.log[k][exId].filter((s) => s && s.done) }));
}

function num(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
}
function fmtSets(sets, item) {
  const load = loadOf(item);
  const reps = sets.map((s) => (s.r == null ? '–' : s.r)).join(' · ');
  const u = item.unit === 's' ? ' s' : '';
  if (load === 'none') return `${reps}${u}`;
  const ws = [...new Set(sets.map((s) => s.w))];
  if (ws.length === 1) {
    const w = ws[0] == null ? '' : load === 'lastre' && !ws[0] ? 'Peso corporal × ' : `${load === 'lastre' ? '+' : ''}${ws[0]} kg${load === 'asist' ? ' asist.' : ''} × `;
    return `${w}${reps}${u}`;
  }
  return sets.map((s) => `${s.w == null ? '–' : s.w}×${s.r == null ? '–' : s.r}`).join(' · ');
}

// mejor serie de una sesión: con peso, estimación de fuerza; sin peso, repeticiones
function bestOf(sets) {
  return Math.max(...sets.map((s) => (s.w ? s.w * (1 + (s.r || 0) / 30) : s.r || 0)));
}
// estancado: ninguna sesión de las últimas 2 semanas superó a la de hace 2 semanas
function stalled(past) {
  if (past.length < 3) return false;
  const newest = parseKey(past[0].date);
  const ref = past.find((p) => (newest - parseKey(p.date)) / 86400000 >= 14);
  if (!ref) return false;
  const since = past.filter((p) => p.date > ref.date);
  return since.length >= 2 && since.every((p) => bestOf(p.sets) <= bestOf(ref.sets));
}

// doble progresión: todas las series en el tope del rango
function progressionCue(item, last) {
  if (!last || last.sets.length < item.sets) return null;
  const top = item.reps[1];
  if (!last.sets.every((s) => s.r != null && s.r >= top)) return null;
  const load = loadOf(item);
  const ex = EXERCISES[item.ex];
  if (item.unit === 's') return { title: `Ya sostienes ${top} s en todas`, text: 'Agrega 5–10 s por serie o pasa a una variante más difícil.' };
  if (load === 'asist') return { title: 'Quita asistencia', text: `Hiciste ${top} en todas las series. Baja la asistencia lo mínimo y vuelve a ${item.reps[0]}.` };
  if (load === 'none') return { title: `Llegaste a ${top} en todas`, text: 'Hazlo más lento o con una variante más difícil.' };
  if (load === 'lastre') return { title: 'Agrega peso', text: `Hiciste ${top} en todas las series. Cuelga 2.5–5 kg y vuelve a ${item.reps[0]}.`, add: 2.5 };
  const w = Math.max(...last.sets.map((s) => s.w || 0));
  if (ex.kind === 'c' && w) return { title: `Sube a ${w + 2.5} kg`, text: `Hiciste ${top} en todas las series. Vuelve a ${item.reps[0]} repeticiones con el peso nuevo.`, add: 2.5 };
  return { title: 'Sube peso', text: `Hiciste ${top} en todas las series. Pasa al siguiente disco o mancuerna y vuelve a ${item.reps[0]}.` };
}

// mejor peso por sesión, de la más vieja a la más reciente
function weightTrend(past) {
  return past.slice(0, 8).reverse()
    .map((p) => ({ date: p.date, w: Math.max(...p.sets.map((s) => s.w || 0)) }))
    .filter((p) => p.w > 0);
}
function trendChart(points) {
  if (points.length < 2) return '';
  const W = 320, H = 64, px = 6, py = 10;
  const ws = points.map((p) => p.w);
  const lo = Math.min(...ws), hi = Math.max(...ws), span = hi - lo || 1;
  const xy = points.map((p, k) => [px + (k * (W - 2 * px)) / (points.length - 1), hi === lo ? H / 2 : py + ((hi - p.w) * (H - 2 * py)) / span]);
  const d = xy.map((q, k) => `${k ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');
  const dots = xy.map((q, k) => `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${k === xy.length - 1 ? 4 : 2.6}" class="${k === xy.length - 1 ? 'is-last' : ''}"/>`).join('');
  const first = points[0].w, last = points[points.length - 1].w;
  return `<figure class="trend">
      <svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M0 ${H - 0.5}H${W}" class="trend__base"/><path d="${d}" class="trend__line"/>${dots}</svg>
      <figcaption><span>${fmtDate(points[0].date)} · ${first} kg</span><span>${last > first ? `+${Math.round((last - first) * 10) / 10} kg` : `${last} kg`}</span></figcaption>
    </figure>`;
}

// ---------- vistas ----------
const screen = document.getElementById('screen');
let selDay = todayIdx();
let listScroll = 0;

// fecha de cada día de esta semana (lunes = 0)
function weekDate(i) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIdx() + i);
}

function daysStrip(active) {
  const t = todayIdx();
  return `<nav class="days" aria-label="Día de la semana">${DAY_SHORT.map((l, i) =>
    `<button type="button" class="day${i === t ? ' is-today' : ''}${i >= 5 ? ' is-rest' : ''}" data-day="${i}" aria-current="${i === active}" aria-label="${DAY_NAMES[i]}${i === t ? ', hoy' : ''}">
      <span class="day__l">${l}</span><span class="day__n">${weekDate(i).getDate()}</span></button>`
  ).join('')}</nav>`;
}

function pips(total, done, nextIdx) {
  let out = '';
  for (let k = 0; k < total; k++) out += `<i class="pip${k < done ? ' is-done' : ''}${k === nextIdx ? ' is-next' : ''}"></i>`;
  return `<span class="rail" aria-hidden="true"><span class="rail__dots">${out}</span></span>`;
}

// la sesión completa como una línea de puntos: un grupo por ejercicio, un punto por serie
function sessionRail(day) {
  let all = 0, done = 0, cur = false;
  const groups = day.items.map((it) => {
    const total = setsFor(it), d = Math.min(doneCount(it), total);
    all += total; done += d;
    let g = '';
    for (let k = 0; k < total; k++) {
      const next = !cur && k === d && d < total;
      if (next) cur = true;
      g += `<i class="pip${k < d ? ' is-done' : ''}${next ? ' is-next' : ''}"></i>`;
    }
    return `<span class="srail__g">${g}</span>`;
  }).join('');
  return `<div class="srail" role="img" aria-label="${done} de ${all} series hechas"><span class="srail__dots">${groups}</span><span class="srail__n"><b>${done}</b>/${all}</span></div>`;
}

function renderToday(d) {
  const moved = d !== selDay || !screen.querySelector('.days');
  selDay = d;
  const date = weekDate(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace(/\./g, '');
  let html = daysStrip(d);
  if (d >= 5) {
    html += `<header class="head"><p class="head__date">${DAY_NAMES[d]} ${date}</p><h1>Descanso</h1><p class="focus">Paseo o movilidad</p></header>
      <div class="rest-day">
        ${weekDots()}
        <p>Recuperación. Procura dormir 7–9 horas y beber agua regularmente.</p>
      </div>
      <ul class="list">${extraRow()}</ul>
      <div class="next"><a class="btn btn--ghost btn--block" href="#/hoy/0"><span>Ver la rutina del lunes</span>${ICON.next}</a></div>`;
    paint(html, moved ? 'view' : '');
    return;
  }
  const day = DAYS[d];
  const wk = weekNum();
  html += `<header class="head">
      <p class="head__date">${DAY_NAMES[d]} ${date}</p>
      <h1>${day.title}</h1>
      <p class="focus">${day.focus}</p>
      <p class="head__spec"><span>Semana ${wk}${state.deload ? ' · descarga' : ''}</span><span>${day.items.length} ejercicios</span><span>≈ ${estMinutes(day)} min</span></p>
      ${sessionRail(day)}
    </header>`;
  html += `<details class="note">
      <summary>Antes de empezar ${ICON.chevron}</summary>
      <div class="note__body">
        <p><strong>Calentamiento.</strong> ${RULES.warmup}</p>
        <p><strong>Ejecución.</strong> ${RULES.execution}</p>
        ${wk <= 2 ? `<p><strong>Semana ${wk}.</strong> ${RULES.firstWeeks}</p>` : ''}
        ${state.deload ? `<p><strong>Descarga.</strong> ${RULES.deload}</p>` : ''}
      </div>
    </details>`;
  html += '<ol class="list">';
  day.items.forEach((it, i) => {
    const ex = EXERCISES[it.ex];
    const total = setsFor(it);
    const done = doneCount(it);
    const b = isPairB(day, i);
    if (it.pair) html += `<li class="ss-h" style="--i:${i}"><span>Superserie</span><small>sin descanso entre los dos</small></li>`;
    const tags = it.isNew ? '<span class="tag">Nuevo</span>' : '';
    const drop = it.drop && wk >= 3 && !state.deload ? ' · <b>drop set</b>' : '';
    html += `<li class="${it.pair ? 'is-pa' : b ? 'is-pb' : ''}" style="--i:${i + (b ? 1 : 0)}"><a class="row${done >= total ? ' is-complete' : ''}" href="#/ej/${d}/${i}">
        <span class="thumb">${illustration(illOf(it.ex), null, true)}</span>
        <span class="row__main">
          <span class="row__name">${ex.name}${tags}</span>
          <span class="row__rx"><b>${total} × ${repsText(it)}${it.unit === 's' ? ' s' : ''}</b>${it.perSide ? ' por lado' : ''} · ${it.pair ? 'pasa al siguiente' : it.rest}${drop}</span>
          <span class="row__rail">${pips(total, done, done < total ? done : -1)}</span>
        </span>
      </a></li>`;
  });
  const n = day.items.length + 1;
  if (day.cardio) html += checkRow('_cardio', `<span class="thumb">${illustration(day.cardio.ex, null, true)}</span>`, EXERCISES[day.cardio.ex].name, day.cardio.text, n);
  html += extraRow(n + 1) + '</ol>';
  paint(html, moved ? 'view' : '');
  if (moved) screen.querySelector('.list').classList.add('is-entering');
  fitThumbs();
  requestAnimationFrame(() => window.scrollTo(0, listScroll));
}

// recorta cada figura al tamaño real de su dibujo (ver fitFigures en illus.js)
const fitThumbs = () => fitFigures(screen);

// fin de semana: un punto por día de entrenamiento de esta semana, lleno si entrenaste
function weekDots() {
  let trained = 0, dots = '';
  for (let k = 0; k < 5; k++) {
    const key = dateKey(weekDate(k));
    const day = state.log[key] || {};
    const did = Object.keys(day).some((ex) => Array.isArray(day[ex]) && day[ex].some((st) => st && st.done));
    if (did) trained++;
    dots += `<span class="wd${did ? ' is-done' : ''}"><i></i>${DAY_SHORT[k]}</span>`;
  }
  return `<div class="weekdots" role="img" aria-label="Entrenaste ${trained} de 5 días esta semana">${dots}</div><p class="weekdots__sum"><b>${trained} de 5</b> días entrenados esta semana</p>`;
}

function checkRow(key, thumb, name, rx, i) {
  const on = !!(state.log[todayKey()] || {})[key];
  return `<li style="--i:${i}"><div class="row row--check">${thumb}
      <span class="row__main"><span class="row__name">${name}</span><span class="row__rx">${rx}</span></span>
      <button type="button" class="check" data-toggle="${key}" aria-pressed="${on}" aria-label="Marcar ${name.toLowerCase()} como hecha">${ICON.check}</button>
    </div></li>`;
}
// cardio extra en casa (cuerda o HIIT) en lugar de una meta de pasos
const extraRow = (i = 0) => checkRow('_extra', `<span class="thumb thumb--plain">${ICON.steps}</span>`, 'Cardio extra', '10–15 min de cuerda o HIIT en casa', i);

// barra de ejercicios del detalle: hechos llenos, el actual con anillo
function exRail(day, i) {
  return `<span class="exrail" aria-hidden="true">${day.items.map((it, k) =>
    `<i class="pip${doneCount(it) >= setsFor(it) ? ' is-done' : ''}${k === i ? ' is-next' : ''}"></i>`).join('')}</span>`;
}

function renderExercise(d, i) {
  selDay = d;
  const day = DAYS[d];
  const it = day.items[i];
  if (!it) { location.hash = '#/hoy'; return; }
  const ex = EXERCISES[it.ex];
  const load = loadOf(it);
  const total = setsFor(it);
  const past = pastSessions(it.ex);
  const last = past[0];
  const cue = progressionCue(it, last);
  const stall = !cue && stalled(past);
  const today = todaySets(it);
  const unit = it.unit === 's' ? 'Segundos' : 'Reps';
  const wk = weekNum();
  const pairIdx = it.pair ? i + 1 : isPairB(day, i) ? i - 1 : -1;

  let html = `<div class="topbar">
      <a class="back" href="#/hoy/${d}">${ICON.back}${day.title}</a>
      <span class="counter">${exRail(day, i)}${i + 1} de ${day.items.length}</span>
    </div>
    <div class="hero">${illustrationDuo(illOf(it.ex), ex.name)}</div>
    <h1 class="ex-title">${ex.name}</h1>
    <p class="ex-alt">${ex.muscle}${ex.alt ? ` · ${ex.alt}` : ''}</p>`;
  if (pairIdx >= 0) {
    const a = Math.min(i, pairIdx), b = a + 1;
    html += `<nav class="pairnav" aria-label="Superserie">
        ${[a, b].map((k, n) => { const e = EXERCISES[day.items[k].ex]; return `<a href="#/ej/${d}/${k}" class="${k === i ? 'is-on' : ''}" aria-current="${k === i ? 'page' : 'false'}">${n ? 'B' : 'A'} · ${e.short || e.name}</a>`; }).join('')}
      </nav>
      <p class="cue-note">Superserie: sin descanso hasta terminar las dos.</p>`;
  }
  html += `<dl class="rx">
      <div><dt>Series</dt><dd>${total}</dd></div>
      <div><dt>${unit}${it.perSide ? ' por lado' : ''}</dt><dd>${repsText(it)}</dd></div>
      <div><dt>Descanso</dt><dd>${it.pair ? 'Pasa a B' : it.rest}</dd></div>
    </dl>
    <p class="cue">${it.cue || ex.cue}</p>
    ${it.drop ? `<p class="cue-note">${wk >= 3 && !state.deload ? '<b>Drop set en la última serie.</b> ' : 'Desde la semana 3: drop set en la última serie. '}Al terminarla baja el peso un 25–30 % y sigue sin descansar.</p>` : ''}
    ${state.deload ? '<p class="cue-note">Semana de descarga: la mitad de las series, con el mismo peso.</p>' : ''}
    ${techBlock(ex)}`;

  if (last) {
    const trend = weightTrend(past);
    html += `<section class="last"><h2>La vez pasada · ${fmtDate(last.date)}</h2>
      <p class="last__vals">${fmtSets(last.sets, it)}</p>
      ${trendChart(trend)}
      ${cue ? `<div class="progress">${ICON.up}<p><strong>${cue.title}</strong><span>${cue.text}</span></p></div>` : ''}
      ${stall ? `<div class="progress progress--stall">${ICON.flat}<p><strong>Sin avance en 2 semanas</strong><span>${RULES.stall}</span></p></div>` : ''}</section>`;
  } else {
    html += `<section class="last"><h2>Primera vez</h2>
      <p class="cue-note">Elige un peso que muevas con técnica limpia y deja 2–3 repeticiones en reserva. Aquí verás tus números la próxima vez.</p></section>`;
  }

  const doneToday = today.filter((s) => s && s.done).length;
  const firstOpen = (() => { for (let k = 0; k < total; k++) if (!(today[k] && today[k].done)) return k; return -1; })();
  const wLabel = load === 'asist' ? 'Asistencia kg' : load === 'lastre' ? 'Extra kg' : 'Peso kg';
  html += `<h2 class="sets-h"><span>Series de hoy</span>${pips(total, doneToday, firstOpen)}</h2>
    <div class="set set--head${load === 'none' ? ' set--noload' : ''}" aria-hidden="true"><span></span>${load === 'none' ? '' : `<span>${wLabel}</span>`}<span>${it.unit === 's' ? 'Segundos' : 'Reps'}</span><span></span></div>
    <ol class="sets">`;
  for (let k = 0; k < total; k++) {
    const cur = today[k] || {};
    const ref = (last && (last.sets[k] || last.sets[last.sets.length - 1])) || {};
    // si toca subir, la serie ya trae el peso nuevo
    const sug = cue && cue.add && ref.w != null ? Math.round((ref.w + cue.add) * 10) / 10 : ref.w;
    const w = cur.w ?? sug ?? (load === 'lastre' ? 0 : '');
    const r = cur.r ?? (cue ? '' : ref.r) ?? '';
    const done = !!cur.done;
    html += `<li class="set${load === 'none' ? ' set--noload' : ''}${done ? ' is-done' : ''}${k === firstOpen ? ' is-next' : ''}" data-k="${k}">
        <span class="set__n">${k + 1}</span>
        ${load === 'none' ? '' : field('w', w, 'kg', 'decimal', k)}
        ${field('r', r, `${repsText(it)}`, 'numeric', k)}
        <button type="button" class="check" data-set="${k}" aria-pressed="${done}" aria-label="Serie ${k + 1} hecha">${ICON.check}</button>
      </li>`;
  }
  html += '</ol>';

  const nextIt = day.items[i + 1];
  if (nextIt) {
    html += `<div class="next"><a class="btn btn--block" href="#/ej/${d}/${i + 1}"><span><small>${it.pair ? 'Sin descanso, sigue con' : 'Siguiente'}</small>${EXERCISES[nextIt.ex].name}</span>${ICON.next}</a></div>`;
  } else {
    html += `<div class="next"><a class="btn btn--block" href="#/hoy/${d}"><span><small>Último ejercicio</small>${day.cardio ? `Ir a ${EXERCISES[day.cardio.ex].name.toLowerCase()}` : 'Terminar el día'}</span>${ICON.next}</a></div>`;
  }

  if (past.length) {
    html += `<section class="history"><h2>Historial</h2><ol>${past.slice(0, 6).map((p) =>
      `<li><span>${fmtDate(p.date)}</span><span>${fmtSets(p.sets, it)}</span></li>`).join('')}</ol></section>`;
  }
  paint(html, 'view view--push');
  fitThumbs();
  screen.dataset.d = d;
  screen.dataset.i = i;
  window.scrollTo(0, 0);
  if (doneToday > 0) requestAnimationFrame(() => revealNextSet('auto'));
}

// técnica completa; abierta por defecto, recuerda si la cierras
const TECH_KEY = 'rutina.tech';
function techBlock(ex) {
  const h = ex.how;
  if (!h || !h.move) return '';
  let open = true;
  try { open = localStorage.getItem(TECH_KEY) !== 'closed'; } catch (e) { /* sin storage */ }
  const steps = (title, list) => `<section class="how"><h3>${title}</h3><ol>${list.map((t) => `<li>${t}</li>`).join('')}</ol></section>`;
  return `<details class="note tech"${open ? ' open' : ''}>
      <summary>Técnica paso a paso ${ICON.chevron}</summary>
      <div class="tech__body">
        <dl class="tech__spec">
          <div><dt>Ritmo</dt><dd>${h.tempo}</dd></div>
          <div><dt>Respiración</dt><dd>${h.breath || BREATH}</dd></div>
          <div><dt>Dónde lo sientes</dt><dd>${h.feel}</dd></div>
        </dl>
        ${steps('Preparación', h.setup)}
        ${steps('Movimiento', h.move)}
        <section class="faults"><h3>Errores comunes</h3><ul>${h.errors.map(([e, f]) => `<li><b>${e}</b>${f}</li>`).join('')}</ul></section>
      </div>
    </details>`;
}
document.addEventListener('toggle', (e) => {
  if (!e.target.classList || !e.target.classList.contains('tech')) return;
  try { localStorage.setItem(TECH_KEY, e.target.open ? 'open' : 'closed'); } catch (err) { /* sin storage */ }
}, true);

function field(name, value, placeholder, mode, k) {
  const label = name === 'w' ? 'Peso' : 'Repeticiones';
  return `<div class="field">
      <button type="button" data-step="${name}" data-dir="-1" aria-label="Menos ${label.toLowerCase()} serie ${k + 1}">${ICON.minus}</button>
      <label><input name="${name}" type="text" inputmode="${mode}" autocomplete="off" value="${value}" placeholder="${placeholder}" aria-label="${label} serie ${k + 1}"></label>
      <button type="button" data-step="${name}" data-dir="1" aria-label="Más ${label.toLowerCase()} serie ${k + 1}">${ICON.plus}</button>
    </div>`;
}

function renderPlan() {
  const t = todayIdx();
  const wk = weekNum();
  let html = `<div class="plan view">
    <header class="head"><h1>Plan</h1><p class="focus">Prioridad torso · semana ${wk}${state.deload ? ' · descarga' : ''}</p></header>
    <h2 class="section-h">Tu semana</h2>
    <ul class="week">${DAYS.map((day, i) => `<li class="${i === t ? 'is-today' : ''}"><a href="#/hoy/${i}">
        <span class="d">${DAY_SHORT[i]}</span>
        <span class="t">${day.title}<small>${day.focus}</small></span>
        <span class="b">${totalSets(day)} series<small>≈ ${estMinutes(day)} min</small></span>
      </a></li>`).join('')}
      <li class="${t >= 5 ? 'is-today' : ''}"><a href="#/hoy/5"><span class="d">S·D</span><span class="t">Descanso<small>Paseo o movilidad</small></span><span class="b">—</span></a></li>
    </ul>

    <h2 class="section-h">Series por semana</h2>
    ${volumeChart()}

    <h2 class="section-h">Reglas</h2>
    <dl class="rules">
      <div><dt>Calentamiento</dt><dd>${RULES.warmup}</dd></div>
      <div><dt>Ejecución</dt><dd>${RULES.execution}</dd></div>
      <div><dt>Semanas 1–2</dt><dd>${RULES.firstWeeks}</dd></div>
      <div><dt>Progresión</dt><dd>${RULES.progression}</dd></div>
      <div><dt>Drop set</dt><dd>${RULES.drop}</dd></div>
      <div><dt>Superserie</dt><dd>${RULES.superset}</dd></div>
      <div><dt>Estancamiento</dt><dd>${RULES.stall}</dd></div>
      <div><dt>Descarga</dt><dd>${RULES.deload}</dd></div>
      <div><dt>Cardio</dt><dd>${RULES.cardio}</dd></div>
      <div><dt>Cardio extra</dt><dd>${RULES.extra}</dd></div>
      <div><dt>Cómo medir</dt><dd>${RULES.measure}</dd></div>
    </dl>

    <h2 class="section-h">Ajustes</h2>
    <div class="settings">
      <label class="setting"><p>Empecé el<small>Con esto se cuentan las semanas</small></p><input type="date" id="startDate" value="${state.start}" max="${todayKey()}"></label>
      <div class="setting"><p>Semana de descarga<small>${state.deload ? 'Activa: la mitad de las series. Apágala al terminar la semana.' : wk >= 7 ? `Vas en la semana ${wk}: toca una pronto.` : 'Cada 6–8 semanas, o si estás muy cansado.'}</small></p>
        <button type="button" class="switch" role="switch" id="deload" aria-checked="${!!state.deload}" aria-label="Semana de descarga"></button></div>
    </div>

    <h2 class="section-h">Respaldo</h2>
    <p class="fine">Tus registros viven solo en este teléfono. Guarda un respaldo de vez en cuando por si cambias de celular o borras datos de Safari.</p>
    <div class="backup">
      <button type="button" class="btn btn--ghost" id="export">Exportar</button>
      <button type="button" class="btn btn--ghost" id="import">Importar</button>
    </div>
    <input type="file" id="importFile" accept="application/json,.json" hidden>
    <p class="toast-msg" id="backupMsg" role="status"></p>
  </div>`;
  paint(html, '');
  window.scrollTo(0, 0);
}

// series efectivas por semana de cada grupo, contra el rango recomendado
function volumeChart() {
  const vol = {};
  for (const day of DAYS) for (const it of day.items) for (const g of EXERCISES[it.ex].g || []) vol[g] = (vol[g] || 0) + setsFor(it);
  const max = 24, pct = (n) => `${(Math.min(n, max) / max) * 100}%`;
  const [lo, hi] = VOLUME_RANGE;
  return `<ul class="vol" style="--lo:${pct(lo)};--hi:${pct(hi)}">${GROUPS.map(([k, label]) =>
    `<li><span>${label}</span><span class="vol__bar${(vol[k] || 0) < lo || (vol[k] || 0) > hi ? ' is-out' : ''}"><i style="--v:${pct(vol[k] || 0)}"></i></span><b>${vol[k] || 0}</b></li>`).join('')}</ul>
    <p class="fine">La banda marca ${lo}–${hi} series a la semana, el rango que se recomienda para hacer crecer un músculo. El hombro posterior también trabaja en todos los remos, y la pierna va abajo a propósito: es solo para mantener.</p>`;
}

function paint(html, cls) {
  screen.innerHTML = cls ? `<div class="${cls}">${html}</div>` : html;
}

// ---------- rutas ----------
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const tab = parts[0] === 'plan' ? 'plan' : 'hoy';
  document.querySelectorAll('.tab').forEach((a) => a.setAttribute('aria-current', a.dataset.tab === tab ? 'page' : 'false'));
  if (parts[0] === 'plan') return renderPlan();
  if (parts[0] === 'ej') return renderExercise(clampDay(parts[1]), Math.max(0, parseInt(parts[2], 10) || 0));
  const d = parts[1] != null && parts[1] !== '' ? clampDay(parts[1]) : selDay;
  renderToday(d);
}
const clampDay = (v) => Math.min(6, Math.max(0, parseInt(v, 10) || 0));
window.addEventListener('hashchange', route);

// ---------- interacción ----------
screen.addEventListener('click', (e) => {
  const dayBtn = e.target.closest('[data-day]');
  if (dayBtn) {
    listScroll = 0;
    location.hash = `#/hoy/${dayBtn.dataset.day}`;
    return;
  }
  const row = e.target.closest('a.row');
  if (row) listScroll = window.scrollY;

  const tog = e.target.closest('[data-toggle]');
  if (tog) {
    const log = todayLog();
    log[tog.dataset.toggle] = !log[tog.dataset.toggle];
    save();
    tog.setAttribute('aria-pressed', String(!!log[tog.dataset.toggle]));
    return;
  }

  const step = e.target.closest('[data-step]');
  if (step) {
    const li = step.closest('.set');
    const input = li.querySelector(`input[name="${step.dataset.step}"]`);
    const base = num(input.value) ?? num(input.placeholder.split('–')[0]) ?? 0;
    const next = Math.max(0, base + Number(step.dataset.dir));
    input.value = String(next);
    storeSet(li, false);
    return;
  }

  const chk = e.target.closest('[data-set]');
  if (chk) {
    unlockAudio();
    const li = chk.closest('.set');
    const nowDone = chk.getAttribute('aria-pressed') !== 'true';
    // al marcar sin reps, usa el mínimo del rango como referencia
    const rIn = li.querySelector('input[name="r"]');
    if (nowDone && rIn.value === '') rIn.value = rIn.placeholder.split('–')[0];
    storeSet(li, true, nowDone);
    chk.setAttribute('aria-pressed', String(nowDone));
    li.classList.toggle('is-done', nowDone);
    updateSetState();
    if (nowDone) {
      const d = Number(screen.dataset.d), i = Number(screen.dataset.i);
      const it = DAYS[d].items[i];
      const k = Number(li.dataset.k);
      const lastOfDay = i === DAYS[d].items.length - 1 && k === setsFor(it) - 1;
      if (!lastOfDay && it.restSec) startTimer(it.restSec);
      requestAnimationFrame(() => revealNextSet());
    }
  }
});

screen.addEventListener('change', (e) => {
  if (e.target.matches('.set input')) storeSet(e.target.closest('.set'), false);
  if (e.target.id === 'startDate' && e.target.value) {
    state.start = e.target.value > todayKey() ? todayKey() : e.target.value;
    save();
    renderPlan();
  }
  if (e.target.id === 'importFile') importBackup(e.target.files[0]);
});
screen.addEventListener('focusin', (e) => {
  if (e.target.matches('.set input')) e.target.select();
});

screen.addEventListener('click', (e) => {
  if (e.target.id === 'deload') {
    state.deload = !state.deload;
    save();
    renderPlan();
  }
  if (e.target.id === 'export') exportBackup();
  if (e.target.id === 'import') document.getElementById('importFile').click();
});

function storeSet(li, setDone, value) {
  const d = Number(screen.dataset.d), i = Number(screen.dataset.i);
  const it = DAYS[d].items[i];
  const k = Number(li.dataset.k);
  const log = todayLog();
  const arr = log[it.ex] || (log[it.ex] = []);
  const cur = arr[k] || {};
  const wIn = li.querySelector('input[name="w"]');
  const rIn = li.querySelector('input[name="r"]');
  cur.w = wIn ? num(wIn.value) : null;
  cur.r = num(rIn.value);
  if (setDone) cur.done = value;
  arr[k] = cur;
  for (let j = 0; j < arr.length; j++) if (!arr[j]) arr[j] = {};
  save();
}

// mueve el anillo a la primera serie pendiente y actualiza el riel
function updateSetState() {
  const rows = [...screen.querySelectorAll('.sets .set')];
  const open = rows.findIndex((r) => !r.classList.contains('is-done'));
  rows.forEach((r, k) => r.classList.toggle('is-next', k === open));
  const rail = screen.querySelector('.sets-h .rail');
  if (rail) rail.outerHTML = pips(rows.length, rows.filter((r) => r.classList.contains('is-done')).length, open);
}

// deja visible la serie que toca, por encima del temporizador y la barra
function revealNextSet(behavior) {
  const next = screen.querySelector('.set.is-next') || screen.querySelector('.next');
  if (!next) return;
  // el temporizador puede venir entrando (16px abajo de su lugar final)
  const bar = timerEl.hidden ? document.querySelector('.tabbar') : timerEl;
  const limit = bar.getBoundingClientRect().top - (timerEl.classList.contains('is-entering') ? 28 : 12);
  const delta = next.getBoundingClientRect().bottom - limit;
  if (delta > 0) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollBy({ top: delta, behavior: behavior || (reduce ? 'auto' : 'smooth') });
  }
}

// ---------- respaldo ----------
function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
  const name = `rutina-respaldo-${todayKey()}.json`;
  const file = new File([blob], name, { type: 'application/json' });
  const msg = document.getElementById('backupMsg');
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: 'Respaldo de Rutina' })
      .then(() => { msg.textContent = 'Respaldo listo.'; })
      .catch(() => {});
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  msg.textContent = 'Respaldo descargado.';
}
function importBackup(file) {
  const msg = document.getElementById('backupMsg');
  if (!file) return;
  file.text().then((txt) => {
    const data = JSON.parse(txt);
    if (!data || typeof data.log !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(data.start)) throw new Error('formato');
    state.start = data.start;
    state.deload = !!data.deload;
    state.log = data.log;
    save();
    renderPlan();
    document.getElementById('backupMsg').textContent = `Respaldo importado: ${Object.keys(data.log).length} días de registros.`;
  }).catch(() => {
    msg.textContent = 'Ese archivo no es un respaldo de Rutina. Elige el .json que exportaste.';
  });
}

// ---------- temporizador de descanso ----------
const timerEl = document.getElementById('timer');
const timerTime = document.getElementById('timerTime');
const timerLabel = timerEl.querySelector('.timer__label');
const appEl = document.querySelector('.app');
let timer = null; // { end, total }
let tickId = 0, hideId = 0, wakeLock = null;

function startTimer(sec) {
  clearTimeout(hideId);
  timer = { end: Date.now() + sec * 1000, total: sec * 1000 };
  try { localStorage.setItem(TIMER_KEY, JSON.stringify(timer)); } catch (e) {}
  showTimer();
}
function showTimer() {
  timerEl.classList.remove('is-done');
  timerLabel.textContent = 'Descanso';
  document.getElementById('timerAdd').hidden = false;
  document.getElementById('timerSkip').textContent = 'Saltar';
  if (timerEl.hidden) {
    timerEl.hidden = false;
    timerEl.classList.add('is-entering');
    requestAnimationFrame(() => requestAnimationFrame(() => timerEl.classList.remove('is-entering')));
  }
  appEl.classList.add('has-timer');
  keepAwake(true);
  clearInterval(tickId);
  tick();
  tickId = setInterval(tick, 250);
}
function tick() {
  if (!timer) return;
  const left = Math.max(0, timer.end - Date.now());
  const s = Math.ceil(left / 1000);
  timerTime.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  timerEl.style.setProperty('--p', (left / timer.total).toFixed(4));
  if (left <= 0) finishTimer();
}
function finishTimer() {
  clearInterval(tickId);
  timer = null;
  try { localStorage.removeItem(TIMER_KEY); } catch (e) {}
  timerEl.classList.add('is-done');
  timerEl.style.setProperty('--p', 0);
  timerLabel.textContent = 'Listo';
  timerTime.textContent = 'Siguiente serie';
  document.getElementById('timerAdd').hidden = true;
  document.getElementById('timerSkip').textContent = 'Cerrar';
  beep();
  const fl = document.getElementById('flash');
  fl.classList.remove('is-on');
  void fl.offsetWidth;
  fl.classList.add('is-on');
  hideId = setTimeout(hideTimer, 6000);
}
function hideTimer() {
  clearInterval(tickId);
  clearTimeout(hideId);
  timer = null;
  try { localStorage.removeItem(TIMER_KEY); } catch (e) {}
  timerEl.hidden = true;
  appEl.classList.remove('has-timer');
  keepAwake(false);
}
document.getElementById('timerAdd').addEventListener('click', () => {
  if (!timer) return;
  timer.end += 15000;
  timer.total += 15000;
  try { localStorage.setItem(TIMER_KEY, JSON.stringify(timer)); } catch (e) {}
  tick();
});
document.getElementById('timerSkip').addEventListener('click', hideTimer);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (timer) tick();
    if (timer && !wakeLock) keepAwake(true);
  }
});

async function keepAwake(on) {
  try {
    if (on && !wakeLock && 'wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (e) { wakeLock = null; }
}

// sonido: iOS no deja vibrar desde la web, así que avisamos con tonos.
// 'ambient' mezcla los tonos con tu música en vez de pausarla ('playback' la detenía).
try { if (navigator.audioSession) navigator.audioSession.type = 'ambient'; } catch (e) {}
let audioCtx = null;
function unlockAudio() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'ambient';
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { audioCtx = null; }
}
function beep() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t0 = audioCtx.currentTime + 0.02;
  [0, 0.22, 0.44].forEach((off, n) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = n === 2 ? 1320 : 880;
    g.gain.setValueAtTime(0.0001, t0 + off);
    g.gain.exponentialRampToValueAtTime(0.5, t0 + off + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + off + 0.18);
    o.connect(g).connect(audioCtx.destination);
    o.start(t0 + off);
    o.stop(t0 + off + 0.2);
  });
}

// retoma un descanso que seguía corriendo al cerrar la app
try {
  const saved = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null');
  if (saved && saved.end > Date.now()) { timer = saved; showTimer(); }
  else localStorage.removeItem(TIMER_KEY);
} catch (e) {}

route();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
