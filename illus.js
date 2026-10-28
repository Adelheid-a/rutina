// Ilustraciones de ejercicios dibujadas en código.
// Cada pose es un esqueleto (ángulos en grados, 0 = derecha, 90 = abajo) con las
// mismas proporciones para todas, dibujado en dos fases: 0 = inicio (estirado), 1 = final (contraído).
// El cuerpo se arma con cápsulas con volumen: degradado cilíndrico con luz arriba a la izquierda;
// las extremidades del lado lejano van más oscuras.

const TONE = {
  skin: ['#4c4946', '#928d87', '#d6d1ca'],
  skinFar: ['#2b2a28', '#524e4b', '#79756f'],
  shirt: ['#6c6b68', '#c2c0bc', '#f2f1ee'],
  shorts: ['#111214', '#2a2c30', '#494c51'],
  shortsFar: ['#0d0e10', '#1c1e21', '#2c2e32'],
  shoe: ['#7a7977', '#c7c6c3', '#f2f2f0'],
  shoeFar: ['#383836', '#585755', '#7a7977'],
  metal: ['#25272a', '#5b5e64', '#aeb1b7'],
  metalFar: ['#1a1b1e', '#3a3c41', '#5f6268'],
  frame: ['#0f1012', '#212327', '#3c3e43'],
  pad: ['#0c0d0f', '#1d1f22', '#3a3c41'],
};
const C = { hair: '#050506', ink: '#f4f4f2', mute: '#8a8d93', bg: '#0d0e10', line: '#2a2c30', cable: '#9a9da3', hole: '#0b0c0e' };
const LIGHT = [-0.55, -0.83];
const LEN = { torso: 64, neck: 24, ua: 36, fa: 32, th: 46, sh: 46, ft: 15 };
const FLOOR = 266;

const rad = (a) => (a * Math.PI) / 180;
const at = (p, a, l) => [p[0] + l * Math.cos(rad(a)), p[1] + l * Math.sin(rad(a))];
const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
const unit = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
const f = (n) => Math.round(n * 10) / 10;
const pt = (p) => `${f(p[0])} ${f(p[1])}`;

function ik(a, b, l1, l2, bend) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const base = Math.atan2(dy, dx);
  const alpha = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const ang = base + bend * alpha;
  return [a[0] + l1 * Math.cos(ang), a[1] + l1 * Math.sin(ang)];
}
function limb(start, spec, l1, l2) {
  if (spec.to) {
    const mid = ik(start, spec.to, l1, l2, spec.bend || 1);
    return [start, mid, at(mid, Math.atan2(spec.to[1] - mid[1], spec.to[0] - mid[0]) * 180 / Math.PI, l2)];
  }
  const mid = at(start, spec.a, l1);
  return [start, mid, at(mid, spec.b, l2)];
}

// ---------- sombreado: cada figura junta sus degradados en <defs>
let DEFS = [];
let gid = 0;
function cyl(m, n, r, tone) {
  const s = n[0] * LIGHT[0] + n[1] * LIGHT[1] >= 0 ? 1 : -1;
  const a = add(m, n, r * s), b = add(m, n, -r * s);
  const id = 'q' + (++gid).toString(36);
  DEFS.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}">` +
    `<stop offset="0" stop-color="${tone[1]}"/><stop offset=".26" stop-color="${tone[2]}"/><stop offset=".62" stop-color="${tone[1]}"/><stop offset="1" stop-color="${tone[0]}"/></linearGradient>`);
  return `url(#${id})`;
}
function sph(c, r, tone) {
  const id = 'q' + (++gid).toString(36);
  const h = add(c, LIGHT, r * 0.45);
  DEFS.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * 1.08)}" fx="${f(h[0])}" fy="${f(h[1])}">` +
    `<stop offset="0" stop-color="${tone[2]}"/><stop offset=".55" stop-color="${tone[1]}"/><stop offset="1" stop-color="${tone[0]}"/></radialGradient>`);
  return `url(#${id})`;
}

// ---------- primitivas
const seg = (p, q, w, c, extra = '') => `<path d="M${pt(p)}L${pt(q)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;
const poly = (ps, w, c, extra = '') => `<path d="M${ps.map(pt).join('L')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const dot = (p, r, c) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="${c}"/>`;
const ball = (p, r, tone) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r)}" fill="${sph(p, r, tone)}"/>`;

// cápsula con volumen; bf/bb abultan el frente (-n) o la espalda (+n) a media pieza
function capsule(p, q, r1, r2, tone, bf = 0, bb = 0) {
  const d = unit(p, q), n = [-d[1], d[0]];
  const m = lerp(p, q, 0.5), rm = (r1 + r2) / 2;
  const P = (o, k) => add(o, n, k);
  const path = `M${pt(P(p, r1))}Q${pt(P(m, rm + bb * 2))} ${pt(P(q, r2))}A${f(r2)} ${f(r2)} 0 0 0 ${pt(P(q, -r2))}` +
    `Q${pt(P(m, -(rm + bf * 2)))} ${pt(P(p, -r1))}A${f(r1)} ${f(r1)} 0 0 0 ${pt(P(p, r1))}Z`;
  return `<path d="${path}" fill="${cyl(m, n, Math.max(r1, r2) + Math.max(bf, bb), tone)}"/>`;
}
const beam = (p, q, w, tone = TONE.frame) => capsule(p, q, w / 2, w / 2, tone);

// contorno suave cerrado (Catmull-Rom)
function smooth(ps) {
  const n = ps.length;
  let d = `M${pt(ps[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = ps[(i - 1 + n) % n], p1 = ps[i], p2 = ps[(i + 1) % n], p3 = ps[(i + 2) % n];
    d += `C${pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${pt(p2)}`;
  }
  return d + 'Z';
}

// ---------- cuerpo
function hair(c, r, a1, a2) {
  const p1 = at(c, a1, r), p2 = at(c, a2, r);
  return `<path d="M${pt(p1)}A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${pt(p2)}Z" fill="${C.hair}"/>`;
}
function headSide(c, headA) {
  return ball(c, 15, TONE.skin) + hair(c, 15.6, headA + 252, headA + 392);
}
function arm3(J3, tone) {
  const [s, e, w] = J3;
  const hand = at(w, Math.atan2(w[1] - e[1], w[0] - e[0]) * 180 / Math.PI, 4);
  return capsule(s, e, 10, 6.2, tone, 2.4, 1.6) + capsule(e, w, 6.4, 4.4, tone, 1.4, 0.6) + ball(hand, 5, tone);
}
function leg3(J3, toe, tone, shoe) {
  const [h, k, a] = J3;
  return capsule(h, k, 13, 8, tone, 2.4, 1) + capsule(k, a, 8, 4.8, tone, 0.4, 2.6) + capsule(a, toe, 5.6, 4.6, shoe);
}

// figura de perfil (el frente del cuerpo queda a +90° del eje cadera→hombro)
function side(p) {
  const shift = p.farShift || [-5, -3];
  const hip = p.hip;
  const sh = at(hip, p.torso, LEN.torso);
  const headA = p.headA ?? p.torso;
  const head = at(sh, headA, LEN.neck);
  const hipF = add(hip, shift), shF = add(sh, shift);
  const base = { hip, sh, head };
  const armSpec = typeof p.arm === 'function' ? p.arm(base) : p.arm;
  const farArmSpec = p.farArm ? (typeof p.farArm === 'function' ? p.farArm(base) : p.farArm) : armSpec;

  const arm = limb(sh, armSpec, LEN.ua, LEN.fa);
  const armF = limb(shF, farArmSpec.to ? { ...farArmSpec, to: add(farArmSpec.to, shift) } : farArmSpec, LEN.ua, LEN.fa);
  const leg = limb(hip, p.leg, LEN.th, LEN.sh);
  const farLegSpec = p.farLeg || p.leg;
  const legF = limb(hipF, farLegSpec.to && !p.farLeg ? { ...farLegSpec, to: add(farLegSpec.to, shift) } : farLegSpec, LEN.th, LEN.sh);
  const toe = at(leg[2], p.leg.ft ?? (p.facing === -1 ? 180 : 0), LEN.ft);
  const toeF = at(legF[2], farLegSpec.ft ?? (p.facing === -1 ? 180 : 0), LEN.ft);

  const J = { hip, sh, head, arm, armF, leg, legF };
  const d = unit(hip, sh), n = [-d[1], d[0]];
  const L = (s, k) => add(add(hip, d, LEN.torso * s), n, k);
  const out = [];
  out.push(p.back ? p.back(J) : '');
  // lado lejano
  out.push(arm3(armF, TONE.skinFar));
  if (p.farItem) out.push(p.farItem(armF[2], J));
  out.push(leg3(legF, toeF, TONE.skinFar, TONE.shoeFar), capsule(legF[0], lerp(legF[0], legF[1], 0.5), 14.5, 12.5, TONE.shortsFar));
  // cuello y torso (playera sin mangas)
  out.push(capsule(sh, at(sh, headA, 16), 7, 6.5, TONE.skin));
  const prof = [[-0.04, 15, 16], [0.3, 13, 13], [0.62, 17, 16.5], [0.84, 19.5, 15.5], [1.04, 12, 12]];
  const torso = [add(hip, d, -LEN.torso * 0.12), ...prof.map(([s, , b]) => L(s, -b)), add(sh, d, 9), ...prof.slice().reverse().map(([s, fr]) => L(s, fr))];
  out.push(`<path d="${smooth(torso)}" fill="${cyl(lerp(hip, sh, 0.5), n, 20, TONE.shirt)}"/>`);
  // pierna cercana y short
  out.push(leg3(leg, toe, TONE.skin, TONE.shoe));
  const band = [L(0.16, -14), L(-0.04, -16.5), add(hip, d, -LEN.torso * 0.13), L(-0.04, 15.5), L(0.16, 13.5)];
  out.push(`<path d="${smooth(band)}" fill="${cyl(hip, n, 17, TONE.shorts)}"/>`, capsule(leg[0], lerp(leg[0], leg[1], 0.52), 15, 13, TONE.shorts));
  if (p.mid) out.push(p.mid(J));
  out.push(headSide(head, headA));
  // brazo cercano
  out.push(arm3(arm, TONE.skin));
  if (p.item) out.push(p.item(arm[2], J));
  if (p.front) out.push(p.front(J));
  return { svg: out.join(''), J };
}

// figura de frente (simétrica salvo armR)
function front(p) {
  const cx = p.cx || 200, shY = p.shY, hipY = p.hipY;
  const mirrorA = (a) => 180 - a;
  const out = [];
  const shL = [cx - 25, shY + 4], shR = [cx + 25, shY + 4];
  const hipL = [cx - 11, hipY + 24], hipR = [cx + 11, hipY + 24];
  const armL = limb(shL, p.arm, p.uaLen || LEN.ua, LEN.fa);
  const armR = limb(shR, p.armR || (p.arm.to ? { to: [2 * cx - p.arm.to[0], p.arm.to[1]], bend: -(p.arm.bend || 1) } : { a: mirrorA(p.arm.a), b: mirrorA(p.arm.b) }), p.uaLen || LEN.ua, LEN.fa);
  const thLen = p.thLen || LEN.th;
  const legL = limb(hipL, p.leg, thLen, LEN.sh);
  const legR = limb(hipR, { a: mirrorA(p.leg.a), b: mirrorA(p.leg.b) }, thLen, LEN.sh);
  const head = [cx, shY - 24 + (p.headDy || 0)];
  const J = { cx, shY, hipY, armL, armR, legL, legR, head };
  if (p.back) out.push(p.back(J));
  // piernas
  for (const leg of [legL, legR]) {
    out.push(capsule(leg[0], leg[1], 12.5, 8, TONE.skin, 1.6, 1.6), capsule(leg[1], leg[2], 8, 4.8, TONE.skin, 1.6, 1.6));
    const sc = [leg[2][0], leg[2][1] + 4];
    out.push(`<ellipse cx="${f(sc[0])}" cy="${f(sc[1])}" rx="11" ry="6" fill="${sph(sc, 11, TONE.shoe)}"/>`);
  }
  // short
  const sp = [[cx - 25, hipY - 4], [cx + 25, hipY - 4], [cx + 29, hipY + 36], [cx + 3, hipY + 38], [cx, hipY + 22], [cx - 3, hipY + 38], [cx - 29, hipY + 36]];
  out.push(`<path d="M${sp.map(pt).join('L')}Z" fill="${cyl([cx, hipY + 16], [1, 0], 30, TONE.shorts)}" stroke-linejoin="round"/>`);
  if (p.mid) out.push(p.mid(J));
  // cuello, trapecio y torso en V
  out.push(capsule([cx, shY - 16], [cx, shY + 4], 7, 7.5, TONE.skin));
  out.push(`<path d="${smooth([[cx - 9, shY - 9], [cx - 24, shY + 1], [cx + 24, shY + 1], [cx + 9, shY - 9]])}" fill="${cyl([cx, shY], [1, 0], 26, TONE.skin)}"/>`);
  const tp = [[cx - 13, shY - 3], [cx - 26, shY + 4], [cx - 29, shY + 24], [cx - 21, hipY - 8], [cx - 24, hipY + 2], [cx + 24, hipY + 2], [cx + 21, hipY - 8], [cx + 29, shY + 24], [cx + 26, shY + 4], [cx + 13, shY - 3], [cx, shY + 7]];
  out.push(`<path d="${smooth(tp)}" fill="${cyl([cx, (shY + hipY) / 2], [1, 0], 30, TONE.shirt)}"/>`);
  // brazos
  for (const arm of [armL, armR]) out.push(arm3(arm, TONE.skin));
  if (p.item) out.push(p.item(armL[2], J) + p.item(armR[2], J));
  // cabeza
  out.push(`<ellipse cx="${cx}" cy="${f(head[1])}" rx="14" ry="16" fill="${sph(head, 16, TONE.skin)}"/>`, hair(head, 16.2, 204, 336));
  if (p.front) out.push(p.front(J));
  return { svg: out.join(''), J };
}

// ---------- anotaciones (solo en el panel final)
function mark(p) {
  return `<g class="ann"><circle cx="${f(p[0])}" cy="${f(p[1])}" r="9" fill="none" stroke="${C.ink}" stroke-opacity=".45"/>` +
    `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="4.5" fill="${C.bg}" stroke="${C.ink}" stroke-width="2"/></g>`;
}
function arrowHead(p, a) {
  return poly([at(p, a + 150, 9), p, at(p, a - 150, 9)], 1.5, C.ink, ' stroke-opacity=".8"');
}
const dash = ' stroke-dasharray="3 6" stroke-opacity=".8"';
function moveLine(p, q, both) {
  const a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
  return `<g class="ann">${seg(p, q, 1.5, C.ink, dash)}${arrowHead(q, a)}${both ? arrowHead(p, a + 180) : ''}</g>`;
}
function moveArc(c, r, a1, a2) {
  const p = at(c, a1, r), q = at(c, a2, r);
  const sweep = a2 > a1 ? 1 : 0;
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  const tan = a2 + (sweep ? 90 : -90);
  return `<g class="ann"><path d="M${pt(p)}A${r} ${r} 0 ${large} ${sweep} ${pt(q)}" fill="none" stroke="${C.ink}" stroke-width="1.5" stroke-linecap="round"${dash}/>${arrowHead(q, tan)}</g>`;
}

// ---------- equipo
const post = (p, q, tone = TONE.frame) => {
  const d = unit(p, q), l = Math.hypot(q[0] - p[0], q[1] - p[1]);
  let holes = '';
  for (let s = 18; s < l - 10; s += 16) holes += dot(add(p, d, s), 1.4, C.hole);
  return beam(p, q, 10, tone) + holes;
};
const bar = (p, q) => beam(p, q, 8);
const pad = (p, q) => beam(p, q, 13, TONE.pad);
const cable = (p, q) => seg(p, q, 1.2, C.cable, ' stroke-opacity=".75"');
const pulley = (p) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="8" fill="${sph(p, 8, TONE.frame)}" stroke="${TONE.metal[1]}" stroke-width="2.5"/>` + dot(p, 2.2, TONE.metal[2]);
const grip = (p) => ball(p, 5.5, TONE.metal);
// torre de poleas: poste con pila de placas detrás
function tower(x, top, stackSide = 1) {
  const sx = x + stackSide * 20;
  let plates = '';
  for (let y = FLOOR - 64; y < FLOOR - 4; y += 6) plates += seg([sx - 11, y], [sx + 11, y], 1, C.hole);
  return `<rect x="${sx - 12}" y="${FLOOR - 66}" width="24" height="64" rx="3" fill="${cyl([sx, FLOOR - 34], [1, 0], 12, TONE.frame)}"/>` + plates +
    beam([sx, top], [sx, FLOOR - 66], 3, TONE.metalFar) + post([x, FLOOR], [x, top]);
}
// barra vista de punta: disco con aro y casquillo
const bbEnd = (p) => ball(p, 20, TONE.metal) + `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="14" fill="none" stroke="${TONE.metal[0]}" stroke-width="1.5" stroke-opacity=".7"/>` + ball(p, 5, TONE.metal);
const dbEnd = (p, far) => ball(p, 10.5, far ? TONE.metalFar : TONE.metal) + dot(p, 3, C.hole);
function dbSide(p, a, far) {
  const t = far ? TONE.metalFar : TONE.metal;
  const e1 = at(p, a, 12), e2 = at(p, a + 180, 12);
  return beam(e1, e2, 4, t) + beam(at(e1, a + 90, 8), at(e1, a - 90, 8), 8, t) + beam(at(e2, a + 90, 8), at(e2, a - 90, 8), 8, t);
}
// banco que sigue al torso: respaldo acolchado, asiento y patas
function bench(hip, torsoA, extra) {
  const off = at([0, 0], torsoA - 90, 25);
  const top = at(hip, torsoA, LEN.torso + extra);
  const a = add(hip, off), b = add(top, off);
  return bar([hip[0], hip[1] + 26], [hip[0], FLOOR - 4]) + bar([b[0] + 14, b[1] + 12], [b[0] + 14, FLOOR - 4]) +
    beam([hip[0] - 22, FLOOR - 3], [hip[0] + 22, FLOOR - 3], 6) +
    pad(a, b) + pad([a[0] - 10, hip[1] + 22], [hip[0] + 30, hip[1] + 22]);
}
function flatBench(x1, x2, y) {
  return bar([x1 + 22, y + 6], [x1 + 22, FLOOR - 4]) + bar([x2 - 22, y + 6], [x2 - 22, FLOOR - 4]) +
    beam([x1 + 8, FLOOR - 3], [x1 + 36, FLOOR - 3], 6) + beam([x2 - 36, FLOOR - 3], [x2 - 8, FLOOR - 3], 6) + pad([x1, y], [x2, y]);
}

// ---------- poses: (ph) → svg; v(inicio, final)
const POSES = {
  elev_laterales(ph, v) {
    const { svg, J } = front({
      shY: 100, hipY: 164,
      arm: { a: v(97, 170), b: v(95, 178) }, leg: { a: 92, b: 90 },
      item: (h) => `<rect x="${f(h[0] - 11)}" y="${f(h[1] - 7)}" width="22" height="14" rx="4" fill="${cyl(h, [0, 1], 7, TONE.metal)}"/>`,
    });
    const s = J.armL[0], s2 = J.armR[0];
    return svg + (ph ? moveArc(s, 88, 112, 166) + moveArc(s2, 88, 68, 14) + mark([s[0] - 7, s[1] - 1]) + mark([s2[0] + 7, s2[1] - 1]) : '');
  },

  press_inclinado(ph, v) {
    const hip = [176, 206];
    const a = v({ a: 118, b: -72 }, { a: -68, b: -74 });
    const { svg, J } = side({
      hip, torso: -150, headA: -160, arm: a, farArm: a,
      leg: { a: 15, b: 95 },
      back: () => bench(hip, -150, 22),
      item: (h) => dbEnd(h), farItem: (h) => dbEnd(h, true),
    });
    const chest = at(at(J.sh, 30, 14), -60, 13);
    return svg + (ph ? moveLine([182, 158], [196, 112]) + mark(chest) : '');
  },

  press_plano(ph, v) {
    const a = v({ a: 100, b: -80 }, { a: -90, b: -90 });
    const { svg, J } = side({
      hip: [236, 212], torso: 180, headA: 180, facing: -1,
      arm: a, farArm: a, farShift: [4, -3],
      leg: { a: 0, b: 90, ft: 0 },
      back: () => flatBench(116, 266, 234),
      item: (h) => dbEnd(h), farItem: (h) => dbEnd(h, true),
    });
    const chest = [J.sh[0] + 20, J.sh[1] - 12];
    return svg + (ph ? moveLine([126, 190], [126, 146]) + mark(chest) : '');
  },

  press_inclinado_barra(ph, v) {
    const hip = [176, 206];
    const { svg, J } = side({
      hip, torso: -150, headA: -160,
      arm: v({ a: 118, b: -72 }, { a: -68, b: -74 }),
      leg: { a: 15, b: 95 },
      back: () => post([70, FLOOR], [70, 36], TONE.frame) + bar([70, 110], [92, 110]) + bench(hip, -150, 22),
      item: (h) => bbEnd(h),
    });
    const chest = at(at(J.sh, 30, 14), -60, 13);
    return svg + (ph ? moveLine([204, 166], [216, 126]) + mark(chest) : '');
  },

  apertura_baja(ph, v) {
    // cruce de poleas: una polea baja a cada lado, las dos manos a la vez
    const { svg, J } = front({
      shY: 104, hipY: 168,
      arm: { to: v([146, 174], [190, 130]), bend: 1 }, leg: { a: 94, b: 90 },
      back: () => tower(78, 36, -1) + tower(322, 36, 1),
    });
    const h = J.armL[2], h2 = J.armR[2];
    return pulley([90, 250]) + pulley([310, 250]) + cable(h, [92, 246]) + cable(h2, [308, 246]) + svg + grip(h) + grip(h2) +
      (ph ? moveLine([118, 220], [156, 172]) + moveLine([282, 220], [244, 172]) + mark([184, 116]) + mark([216, 116]) : '');
  },

  fondos(ph, v) {
    const hand = [214, 162];
    // abajo: hombros por delante de las manos y codos hacia atrás; arriba: brazos estirados
    const hip = v([216, 184], [186, 152]);
    const { svg, J } = side({
      hip, torso: v(-62, -76), headA: v(-58, -70),
      arm: v({ a: 170, b: 80 }, { to: hand, bend: 1 }),
      leg: { a: 104, b: 172, ft: 130 }, farLeg: { a: 98, b: 178, ft: 134 },
      back: () => post([150, FLOOR], [150, 150]) + post([262, FLOOR], [262, 150]) + beam([138, 166], [274, 166], 9, TONE.metal),
    });
    const chest = at(at(J.sh, 14, 12), 104, 10);
    return svg + (ph ? moveLine([300, 150], [300, 106]) + mark(chest) : '');
  },

  curl_predicador(ph, v) {
    const ua = 46;
    const { svg, J } = side({
      hip: [176, 214], torso: -80, headA: -64,
      arm: { a: ua, b: v(40, -74) }, farArm: { a: ua, b: v(40, -74) }, farShift: [-3, -2],
      leg: { a: -4, b: 92 },
      back: () => bar([176, FLOOR - 4], [176, 232]) + beam([146, FLOOR - 3], [206, FLOOR - 3], 6) + pad([140, 230], [204, 230]),
      mid: (J) => {
        // cojín inclinado bajo el brazo, con su poste
        const o = at([0, 0], ua + 90, 13);
        const a = add(at(J.sh, ua, 12), o), b = add(at(J.sh, ua, 48), o);
        return bar(lerp(a, b, 0.6), [lerp(a, b, 0.6)[0], FLOOR - 4]) + beam([lerp(a, b, 0.6)[0] - 22, FLOOR - 3], [lerp(a, b, 0.6)[0] + 22, FLOOR - 3], 6) + pad(a, b);
      },
      item: (h) => bbEnd(h),
    });
    const el = J.arm[1];
    const bi = lerp(J.arm[0], J.arm[1], 0.55);
    return svg + (ph ? moveArc(el, 52, 36, -70) + mark(add(bi, at([0, 0], ua - 90, 8))) : '');
  },

  plancha(ph, v) {
    // inicio: de rodillas para acomodarte; final: cuerpo en línea recta
    const sh = [236, 220];
    const t = v(-2, -12); // cadera → hombro
    const hip = at(sh, t + 180, LEN.torso);
    const { svg, J } = side({
      hip, torso: t, headA: t + 6,
      arm: { a: 92, b: -2 }, farShift: [5, -3],
      leg: v({ a: 112, b: 180, ft: 180 }, { a: 168, b: 168, ft: 78 }),
    });
    const ab = add(lerp(J.hip, J.sh, 0.4), at([0, 0], t + 90, 12));
    const up = at([0, 0], t - 90, 30);
    const line = `<g class="ann">${seg(add(J.leg[2], up), add(J.head, up), 1.5, C.ink, dash)}</g>`;
    return svg + (ph ? line + mark(ab) : '');
  },

  cruce_poleas(ph, v) {
    // cruce de poleas a la altura del pecho: las dos manos se juntan al frente
    const { svg, J } = front({
      shY: 104, hipY: 168,
      arm: { to: v([104, 122], [192, 138]), bend: 1 }, leg: { a: 94, b: 90 },
      back: () => tower(78, 36, -1) + tower(322, 36, 1),
    });
    const h = J.armL[2], h2 = J.armR[2];
    return pulley([90, 112]) + pulley([310, 112]) + cable(h, [94, 112]) + cable(h2, [306, 112]) + svg + grip(h) + grip(h2) +
      (ph ? moveArc([200, 60], 96, 152, 112) + moveArc([200, 60], 96, 28, 68) + mark([184, 120]) + mark([216, 120]) : '');
  },

  jalon(ph, v) {
    const { svg, J } = side({
      hip: [186, 214], torso: -100, headA: v(-92, -96),
      arm: { to: v([194, 90], [204, 148]), bend: -1 },
      leg: { a: 0, b: 90 },
      back: () => post([300, FLOOR], [300, 22]) + bar([300, 24], [190, 24]) + bar([186, FLOOR - 4], [186, 232]) + pad([150, 230], [220, 230]),
      front: () => pad([214, 194], [252, 194]),
      item: (h) => beam([h[0] - 3, h[1]], [h[0] + 3, h[1]], 9, TONE.metal),
    });
    return cable(J.arm[2], [196, 30]) + pulley([196, 28]) + svg +
      (ph ? moveLine([236, 62], [236, 116]) + mark([J.sh[0] - 12, J.sh[1] + 22]) : '');
  },

  remo_sentado(ph, v) {
    const { svg, J } = side({
      hip: [150, 214], torso: v(-80, -94),
      arm: v({ a: 6, b: 2 }, { a: 158, b: 18 }),
      leg: { a: -8, b: 8, ft: -80 },
      back: () => post([344, FLOOR], [344, 150]) + bar([150, FLOOR - 4], [150, 232]) + pad([112, 230], [190, 230]) + beam([252, 186], [252, 238], 8, TONE.metal),
      item: (h) => grip(h),
    });
    return cable(J.arm[2], [334, 204]) + pulley([336, 204]) + svg +
      (ph ? moveLine([286, 156], [228, 156]) + mark([J.sh[0] - 13, J.sh[1] + 20]) : '');
  },

  remo_barra(ph, v) {
    const { svg, J } = side({
      hip: [170, 171], torso: -25, headA: -18,
      arm: v({ a: 94, b: 91 }, { to: [204, 186], bend: 1 }),
      leg: { a: 100, b: 85 },
      item: (h) => bbEnd(h),
    });
    return svg + (ph ? moveLine([270, 230], [270, 184]) + mark([J.sh[0] - 26, J.sh[1] - 2]) : '');
  },

  pullover_polea(ph, v) {
    const { svg, J } = side({
      hip: [176, 170], torso: -78, headA: -76,
      arm: v({ a: -34, b: -36 }, { a: 70, b: 68 }),
      leg: { a: 95, b: 88 },
      back: () => post([314, FLOOR], [314, 30]),
      item: (h) => beam([h[0] - 3, h[1]], [h[0] + 3, h[1]], 9, TONE.metal),
    });
    return pulley([300, 40]) + cable(J.arm[2], [298, 44]) + svg +
      (ph ? moveArc(J.sh, 86, -24, 58) + mark([J.sh[0] - 14, J.sh[1] + 20]) : '');
  },

  face_pull(ph, v) {
    const { svg, J } = side({
      hip: [176, 172], torso: -92,
      arm: v({ a: -4, b: -6 }, { a: 190, b: -28 }),
      leg: { a: 94, b: 88 },
      back: () => post([334, FLOOR], [334, 40]),
      item: (h) => grip(h),
    });
    return cable(J.arm[2], [322, 92]) + pulley([324, 92]) + svg +
      (ph ? moveLine([290, 52], [234, 52]) + mark([J.sh[0] - 8, J.sh[1] + 2]) : '');
  },

  press_hombro(ph, v) {
    const { svg, J } = front({
      shY: 138, hipY: 196, thLen: 16,
      arm: v({ a: 168, b: -90 }, { a: -108, b: -94 }), leg: { a: 100, b: 90 },
      back: () => `<rect x="170" y="98" width="60" height="124" rx="12" fill="${cyl([200, 160], [1, 0], 30, TONE.pad)}"/>` +
        bar([200, FLOOR - 4], [200, 228]) + beam([170, FLOOR - 3], [230, FLOOR - 3], 6) + pad([146, 228], [254, 228]),
      item: (h) => dbSide(h, 0),
    });
    const s = J.armL[0], s2 = J.armR[0];
    return svg + (ph ? moveLine([82, 126], [82, 78]) + moveLine([318, 126], [318, 78]) + mark([s[0] - 4, s[1] - 2]) + mark([s2[0] + 4, s2[1] - 2]) : '');
  },

  lat_polea(ph, v) {
    const { svg, J } = front({
      shY: 100, hipY: 164,
      arm: v({ to: [216, 196], bend: -1 }, { a: 170, b: 180 }), armR: { a: 92, b: 94 }, leg: { a: 92, b: 90 },
      back: () => tower(320, 220, 1),
    });
    const h = J.armL[2], s = J.armL[0];
    return pulley([306, 254]) + svg + cable(h, [302, 252]) + grip(h) +
      (ph ? moveArc(s, 88, 112, 166) + mark([s[0] - 7, s[1] - 1]) : '');
  },

  pajaro_polea(ph, v) {
    const { svg, J } = front({
      shY: 104, hipY: 168,
      arm: { a: 94, b: 92 }, armR: v({ to: [172, 116], bend: -1 }, { a: 0, b: -2 }), leg: { a: 94, b: 90 },
      back: () => tower(70, 36, -1),
    });
    const h = J.armR[2];
    return pulley([82, 112]) + svg + cable(h, [86, 112]) + grip(h) +
      (ph ? moveLine([254, 70], [304, 70]) + mark([J.armR[0][0] + 4, J.armR[0][1] - 2]) : '');
  },

  ext_triceps(ph, v) {
    const { svg, J } = side({
      hip: [186, 172], torso: -86,
      arm: { a: 96, b: v(-8, 76) },
      leg: { a: 91, b: 90 },
      back: () => post([304, FLOOR], [304, 30]) + bar([304, 34], [262, 34]),
      item: (h) => grip(h),
    });
    const el = J.arm[1];
    return cable(J.arm[2], [262, 42]) + pulley([262, 40]) + svg +
      (ph ? moveArc(el, 52, -8, 70) + mark([J.arm[0][0] - 7, J.arm[0][1] + 20]) : '');
  },

  ext_sobre_cabeza(ph, v) {
    const { svg, J } = side({
      hip: [196, 176], torso: -78, headA: -78,
      arm: { a: -75, b: v(150, -20) },
      leg: { a: 78, b: 96 }, farLeg: { a: 106, b: 86 },
      back: () => post([74, FLOOR], [74, 36]),
      item: (h) => grip(h),
    });
    const el = J.arm[1];
    const tri = lerp(J.arm[0], J.arm[1], 0.5);
    return pulley([88, 104]) + cable(J.arm[2], [92, 104]) + svg +
      (ph ? moveArc(el, 48, 205, 330) + mark([tri[0] - 7, tri[1] + 2]) : '');
  },

  press_frances(ph, v) {
    const { svg, J } = side({
      hip: [230, 212], torso: 180, headA: 180, facing: -1,
      arm: { a: -100, b: v(160, -96) },
      leg: { a: 0, b: 90, ft: 0 },
      back: () => flatBench(116, 266, 234),
      item: (h) => bbEnd(h),
    });
    const el = J.arm[1];
    const tri = lerp(J.arm[0], J.arm[1], 0.5);
    return svg + (ph ? moveArc(el, 50, 172, 250) + mark([tri[0] + 7, tri[1]]) : '');
  },

  curl_barra(ph, v) { return curlPose(ph, v); },

  curl_polea(ph, v) {
    const { svg, J } = side({
      hip: [190, 172], torso: -90,
      arm: { a: 92, b: v(86, -60) },
      leg: { a: 91, b: 90 },
      back: () => tower(322, 230, 1),
      item: (h) => beam([h[0] - 3, h[1]], [h[0] + 3, h[1]], 9, TONE.metal),
    });
    const el = J.arm[1];
    const bi = lerp(J.arm[0], J.arm[1], 0.55);
    return pulley([306, 254]) + cable(J.arm[2], [302, 252]) + svg +
      (ph ? moveArc(el, 50, 84, -54) + mark([bi[0] + 6, bi[1]]) : '');
  },

  curl_inclinado(ph, v) {
    const hip = [184, 208];
    const a = { a: v(100, 92), b: v(98, -40) };
    const { svg, J } = side({
      hip, torso: -120, headA: -112,
      arm: a, farArm: a, farShift: [-3, -2],
      leg: { a: 15, b: 95 },
      back: () => bench(hip, -120, 30),
      item: (h) => dbEnd(h), farItem: (h) => dbEnd(h, true),
    });
    const el = J.arm[1];
    const bi = lerp(J.arm[0], J.arm[1], 0.55);
    return svg + (ph ? moveArc(el, 50, 84, -30) + mark([bi[0] + 7, bi[1]]) : '');
  },

  prensa(ph, v) {
    const hip = [160, 226];
    const foot = at(hip, -38, v(50, 89));
    const plate = at(foot, -40, 10);
    const { svg, J } = side({
      hip, torso: -150, headA: -156,
      arm: { a: 62, b: 18 },
      leg: { to: foot, bend: -1, ft: -70 },
      back: () => beam([204, 256], [292, 182], 10, TONE.frame) + bar([270, FLOOR - 4], [270, 200]) + bench(hip, -150, 14) +
        beam(at(plate, 50, 32), at(plate, 230, 32), 10, TONE.metal),
    });
    const quad = lerp(J.leg[0], J.leg[1], 0.55);
    return svg + (ph ? moveLine([276, 214], [318, 178]) + mark([quad[0] + 2, quad[1] - 8]) : '');
  },

  rdl_barra(ph, v) {
    const { svg, J } = side({
      hip: v([170, 171], [180, 168]), torso: v(-25, -86), headA: v(-18, -86),
      arm: { a: 91, b: 90 },
      leg: v({ a: 100, b: 85 }, { a: 93, b: 89 }),
      item: (h) => bbEnd(h),
    });
    return svg + (ph ? moveArc(J.hip, 96, -30, -80) + mark([J.hip[0] - 14, J.hip[1] + 4]) + mark([J.leg[0][0] - 12, J.leg[0][1] + 28]) : '');
  },

  ext_cuadriceps(ph, v) {
    const { svg, J } = side({
      hip: [176, 206], torso: -96, headA: -94,
      arm: { a: 95, b: 80 },
      leg: { a: 0, b: v(98, -10), ft: v(4, -80) },
      back: () => `<rect x="136" y="126" width="16" height="88" rx="8" fill="${cyl([144, 170], [1, 0], 8, TONE.pad)}"/>` + bar([180, FLOOR - 4], [180, 228]) + beam([150, FLOOR - 3], [210, FLOOR - 3], 6) + pad([144, 226], [222, 226]),
      front: (J) => ball(add(J.leg[2], unit(J.leg[1], J.leg[2]), -4), 8, TONE.pad),
    });
    return svg + (ph ? moveArc(J.leg[1], 62, 86, -8) + mark([204, 198]) : '');
  },

  curl_femoral(ph, v) {
    const { svg, J } = side({
      hip: [168, 202], torso: -2, headA: 2,
      arm: { a: 120, b: 30 },
      leg: { a: 180, b: v(176, -60), ft: v(96, -150) }, farShift: [0, -3],
      back: () => flatBench(92, 272, 226),
      front: (J) => ball(at(J.leg[2], v(-90, 30), 8), 8, TONE.pad),
    });
    return svg + (ph ? moveArc(J.leg[1], 58, 182, 286) + mark([146, 192]) : '');
  },

  talones(ph, v) {
    const hip = [200, v(160, 148)];
    const { svg, J } = side({
      hip, torso: -90,
      arm: { to: [210, hip[1] - 76], bend: 1 },
      leg: { a: 90, b: 90, ft: v(-6, 38) },
      back: () => post([164, FLOOR], [164, 50]) + bar([164, hip[1] - 84], [214, hip[1] - 84]) +
        `<rect x="204" y="252" width="80" height="14" rx="3" fill="${cyl([244, 259], [0, 1], 7, TONE.frame)}"/>`,
      front: (J) => pad([J.sh[0] - 22, J.sh[1] - 7], [J.sh[0] + 22, J.sh[1] - 7]),
    });
    return svg + (ph ? moveLine([140, 254], [140, 222]) + mark([193, J.leg[1][1] + 14]) : '');
  },

  crunch_polea(ph, v) {
    const headA = v(-70, 40);
    const { svg, J } = side({
      hip: [180, 214], torso: v(-76, -28), headA,
      arm: ({ head }) => ({ to: at(head, headA + 110, 14), bend: -1 }),
      leg: { a: 92, b: 180, ft: 180 },
      back: () => post([318, FLOOR], [318, 30]),
      item: (h) => grip(h),
    });
    return pulley([302, 40]) + cable(J.arm[2], [300, 44]) + svg +
      (ph ? moveArc(J.hip, 100, -76, -30) + mark([212, 206]) : '');
  },

  elev_piernas(ph, v) {
    const { svg, J } = side({
      hip: [196, 178], torso: -90, headA: -90,
      arm: { to: [200, 50], bend: 1 },
      leg: v({ a: 94, b: 88, ft: 20 }, { a: -8, b: 88, ft: 10 }),
      back: () => post([130, FLOOR], [130, 40]) + post([278, FLOOR], [278, 40]) + beam([126, 46], [282, 46], 8, TONE.metal),
    });
    return svg + (ph ? moveArc(J.hip, 72, 84, 4) + mark([214, 160]) : '');
  },

  eliptica(ph, v) {
    // pedales y manijas alternan: en cada fase un pie va adelante y la mano contraria también
    const fw = [276, 226], pivot = [264, 176];
    const front = [214, 232], rear = [160, 240];
    const near = v(front, rear), far = v(rear, front);
    const handN = v([228, 128], [246, 120]), handF = v([246, 120], [228, 128]);
    const pedal = (a, t) => beam([a[0] - 8, a[1] + 8], [a[0] + 20, a[1] + 8], 6, t) + beam([a[0] + 6, a[1] + 10], fw, 6, t);
    const handle = (h, t) => beam(add(h, [3, -12]), pivot, 6, t);
    const { svg } = side({
      hip: [186, 148], torso: -86, headA: -86,
      arm: { to: handN, bend: 1 }, farArm: { to: handF, bend: 1 }, farShift: [0, 0],
      leg: { to: near, bend: -1, ft: 0 }, farLeg: { to: far, bend: -1, ft: 0 },
      back: () => beam([112, FLOOR - 4], [304, FLOOR - 4], 8) + beam(fw, [262, 92], 10) +
        `<rect x="246" y="78" width="30" height="18" rx="5" fill="${cyl([261, 87], [0, 1], 9, TONE.frame)}"/>` +
        `<circle cx="${fw[0]}" cy="${fw[1]}" r="28" fill="${sph(fw, 28, TONE.frame)}"/>` + ball(fw, 6, TONE.metal) +
        pedal(far, TONE.metalFar) + handle(handF, TONE.metalFar) + handle(handN, TONE.metal),
      mid: () => pedal(near, TONE.metal),
    });
    return svg + (ph ? moveArc([120, 236], 20, 100, 350) + mark([172, 156]) : '');
  },

  bici(ph, v) {
    const crank = [206, 226];
    const pa = v(215, 35);
    const pedal = at(crank, pa, 17), pedalF = at(crank, pa + 180, 17);
    const { svg } = side({
      hip: [176, 150], torso: -52, headA: -40,
      arm: { to: [266, 122], bend: 1 },
      leg: { to: pedal, bend: -1, ft: 8 }, farLeg: { to: pedalF, bend: -1, ft: 0 }, farShift: [0, 0],
      back: () => beam([146, 262], [304, 262], 8) + beam([186, 166], crank, 9) + beam(crank, [260, 236], 9) +
        beam([256, 156], [266, 120], 8) + beam([246, 236], [256, 156], 9) + pad([166, 164], [198, 164]) +
        `<circle cx="262" cy="232" r="22" fill="none" stroke="${TONE.metal[1]}" stroke-width="5"/>` + beam(crank, pedalF, 5, TONE.metalFar),
      mid: () => beam(crank, pedal, 5, TONE.metal) + ball(crank, 7, TONE.metal),
    });
    return svg + (ph ? mark([206, 172]) : '');
  },
};

function curlPose(ph, v) {
  const a = { a: 92, b: v(86, -60) };
  const { svg, J } = side({
    hip: [200, 172], torso: -90,
    arm: a, farArm: a,
    leg: { a: 91, b: 90 },
    item: (h) => bbEnd(h),
  });
  const el = J.arm[1];
  const bi = lerp(J.arm[0], J.arm[1], 0.55);
  return svg + (ph ? moveArc(el, 50, 84, -54) + mark([bi[0] + 6, bi[1]]) : '');
}

// ---------- salida
const cache = {};
function figure(id, ph) {
  const key = id + ':' + ph;
  if (cache[key]) return cache[key];
  const draw = POSES[id];
  if (!draw) return '';
  DEFS = [];
  const body = draw(ph, (a, b) => (ph ? b : a));
  return (cache[key] = `<defs>${DEFS.join('')}</defs>` +
    `<path class="floor" d="M-400 ${FLOOR}H800" stroke="${C.line}" stroke-width="2"/><g class="fig">${body}</g>`);
}
// miniatura: posición final, sin anotaciones
function illustration(id, title, thumb) {
  const aria = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"';
  return `<svg class="ill${thumb ? ' ill--thumb' : ''}" data-id="${id}" viewBox="0 0 400 300" ${aria}>${figure(id, 1)}</svg>`;
}
// detalle: dos paneles con el mismo encuadre
function illustrationDuo(id, title) {
  const panel = (ph, cap) => `<figure><svg class="ill" data-id="${id}" data-ph="${ph}" viewBox="0 0 400 300" aria-hidden="true">${figure(id, ph)}</svg><figcaption>${cap}</figcaption></figure>`;
  return `<div class="duo" role="img" aria-label="${title}: posición inicial y final">${panel(0, 'Inicio')}${panel(1, 'Final')}</div>`;
}

// encuadra cada figura a su tamaño real (miniaturas 88:70, paneles 3:4)
const boxes = {};
function frameBox(b, ratio, pad, below = pad) {
  let x0 = b.x - pad, x1 = b.x + b.width + pad, y0 = b.y - pad, y1 = Math.max(b.y + b.height + pad, FLOOR + below);
  let w = x1 - x0, h = y1 - y0;
  if (w / h > ratio) { const nh = w / ratio; y0 -= nh - h; h = nh; } else { const nw = h * ratio; x0 -= (nw - w) / 2; w = nw; }
  return `${f(x0)} ${f(y0)} ${f(w)} ${f(h)}`;
}
function figBox(svg) {
  const g = svg.querySelector('g.fig');
  try { const b = g.getBBox(); return b.width ? b : null; } catch (e) { return null; }
}
function fitFigures(root) {
  root.querySelectorAll('svg.ill--thumb').forEach((svg) => {
    const key = 't:' + svg.dataset.id;
    if (!boxes[key]) { const b = figBox(svg); if (!b) return; boxes[key] = frameBox(b, 88 / 70, 12); }
    svg.setAttribute('viewBox', boxes[key]);
  });
  root.querySelectorAll('.duo').forEach((duo) => {
    const svgs = duo.querySelectorAll('svg');
    const key = 'd:' + svgs[0].dataset.id;
    if (!boxes[key]) {
      const bs = [...svgs].map(figBox);
      if (bs.some((b) => !b)) return;
      const x = Math.min(...bs.map((b) => b.x)), y = Math.min(...bs.map((b) => b.y));
      const r = Math.max(...bs.map((b) => b.x + b.width)), btm = Math.max(...bs.map((b) => b.y + b.height));
      // figuras acostadas (plancha): paneles anchos en vez de verticales
      const wide = (r - x) / (btm - y) > 2.2;
      boxes[key] = { vb: frameBox({ x, y, width: r - x, height: btm - y }, wide ? 3 / 2 : 3 / 4, 14, wide ? 52 : 34), wide };
    }
    duo.classList.toggle('duo--wide', boxes[key].wide);
    svgs.forEach((s) => s.setAttribute('viewBox', boxes[key].vb));
  });
}
