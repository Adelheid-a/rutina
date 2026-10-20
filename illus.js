// Ilustraciones de ejercicios dibujadas en código.
// Cada pose es un esqueleto (ángulos en grados, 0 = derecha, 90 = abajo) con las
// mismas proporciones para todas; las extremidades del lado lejano van más oscuras.

const C = {
  skin: '#b9b5af', skinFar: '#7f7b76',
  shirt: '#ecebe8', shorts: '#3b3d42', shortsFar: '#2c2e32',
  shoe: '#ecebe8', shoeFar: '#8f8e8b',
  hair: '#050506', metal: '#6c6f75', metalDark: '#45474c',
  frame: '#2a2c30', ink: '#f4f4f2', mute: '#8a8d93', bg: '#0d0e10',
};
const LEN = { torso: 64, neck: 24, ua: 36, fa: 32, th: 46, sh: 46, ft: 15 };
const FLOOR = 266;

const rad = (a) => (a * Math.PI) / 180;
const at = (p, a, l) => [p[0] + l * Math.cos(rad(a)), p[1] + l * Math.sin(rad(a))];
const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
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

// primitivas
const seg = (p, q, w, c, extra = '') => `<path d="M${pt(p)}L${pt(q)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;
const poly = (ps, w, c, extra = '') => `<path d="M${ps.map(pt).join('L')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const dot = (p, r, c) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="${c}"/>`;
const rect = (x, y, w, h, r, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
const floor = () => seg([36, FLOOR], [364, FLOOR], 2, C.frame);

// mancuernas y agarres
const dbEnd = (p) => dot(p, 10, C.metal) + dot(p, 3.5, C.metalDark);
function dbSide(p, a, far) {
  const c = far ? C.metalDark : C.metal;
  const e1 = at(p, a, 13), e2 = at(p, a + 180, 13);
  return seg(e1, e2, 4, c) + seg(at(e1, a + 90, 8), at(e1, a - 90, 8), 8, c) + seg(at(e2, a + 90, 8), at(e2, a - 90, 8), 8, c);
}
const grip = (p) => dot(p, 5, C.metal);

// cabello: sector circular que rota con la cabeza
function hair(c, r, a1, a2) {
  const p1 = at(c, a1, r), p2 = at(c, a2, r);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `<path d="M${pt(p1)}A${r} ${r} 0 ${large} 1 ${pt(p2)}Z" fill="${C.hair}"/>`;
}

function limb(start, spec, l1, l2) {
  if (spec.to) {
    const mid = ik(start, spec.to, l1, l2, spec.bend || 1);
    return [start, mid, spec.to];
  }
  const mid = at(start, spec.a, l1);
  return [start, mid, at(mid, spec.b, l2)];
}

// figura de perfil
function side(p) {
  const shift = p.farShift || [-5, -3];
  const hip = p.hip;
  const sh = at(hip, p.torso, LEN.torso);
  const headA = p.headA ?? p.torso;
  const head = at(sh, headA, LEN.neck);
  const hipF = [hip[0] + shift[0], hip[1] + shift[1]];
  const shF = [sh[0] + shift[0], sh[1] + shift[1]];

  const arm = limb(sh, p.arm, LEN.ua, LEN.fa);
  const armF = limb(shF, p.farArm || p.arm, LEN.ua, LEN.fa);
  const leg = limb(hip, p.leg, LEN.th, LEN.sh);
  const legF = limb(hipF, p.farLeg || p.leg, LEN.th, LEN.sh);
  const toe = at(leg[2], p.leg.ft ?? (p.facing === -1 ? 180 : 0), LEN.ft);
  const farLegSpec = p.farLeg || p.leg;
  const toeF = at(legF[2], farLegSpec.ft ?? (p.facing === -1 ? 180 : 0), LEN.ft);

  const J = { hip, sh, head, arm, armF, leg, legF };
  const out = [];
  out.push(p.back ? p.back(J) : '');
  // lado lejano
  out.push(poly(armF, 11, C.skinFar), dot(armF[2], 5.5, C.skinFar));
  if (p.farItem) out.push(p.farItem(armF[2], J));
  out.push(seg(legF[0], legF[1], 19, C.skinFar), seg(legF[1], legF[2], 15, C.skinFar), seg(legF[2], toeF, 11, C.shoeFar));
  out.push(seg(legF[0], lerp(legF[0], legF[1], 0.45), 26, C.shortsFar));
  // torso
  out.push(seg(sh, at(sh, headA, 13), 12, C.skin));
  out.push(seg(at(hip, p.torso, 8), at(sh, p.torso + 180, 10), 38, C.shirt));
  // pierna cercana
  out.push(seg(leg[0], leg[1], 19, C.skin), seg(leg[1], leg[2], 15, C.skin), seg(leg[2], toe, 11, C.shoe));
  out.push(seg(leg[0], lerp(leg[0], leg[1], 0.45), 27, C.shorts));
  if (p.mid) out.push(p.mid(J));
  // cabeza
  const rot = headA + 90;
  const [a1, a2] = p.facing === -1 ? [222 + rot, 392 + rot] : [148 + rot, 318 + rot];
  out.push(dot(head, 16.5, C.skin), hair(head, 17.5, a1, a2));
  // brazo cercano
  out.push(poly(arm, 12, C.skin), dot(arm[2], 6, C.skin), seg(arm[0], lerp(arm[0], arm[1], 0.42), 17, C.shirt));
  if (p.item) out.push(p.item(arm[2], J));
  if (p.front) out.push(p.front(J));
  return { svg: out.join(''), J };
}

// figura de frente (simétrica)
function front(p) {
  const cx = p.cx || 200, shY = p.shY, hipY = p.hipY;
  const mirrorA = (a) => 180 - a;
  const out = [];
  const shL = [cx - 23, shY + 3], shR = [cx + 23, shY + 3];
  const hipL = [cx - 11, hipY + 26], hipR = [cx + 11, hipY + 26];
  const armL = limb(shL, p.arm, p.uaLen || LEN.ua, LEN.fa);
  const armR = limb(shR, p.armR || { a: mirrorA(p.arm.a), b: mirrorA(p.arm.b) }, p.uaLen || LEN.ua, LEN.fa);
  const thLen = p.thLen || LEN.th;
  const legL = limb(hipL, p.leg, thLen, LEN.sh);
  const legR = limb(hipR, { a: mirrorA(p.leg.a), b: mirrorA(p.leg.b) }, thLen, LEN.sh);
  const head = [cx, shY - 22 + (p.headDy || 0)];
  const J = { cx, shY, hipY, armL, armR, legL, legR, head };
  if (p.back) out.push(p.back(J));
  // piernas
  for (const leg of [legL, legR]) {
    out.push(seg(leg[0], leg[1], 17, C.skin), seg(leg[1], leg[2], 15, C.skin));
    out.push(`<ellipse cx="${f(leg[2][0])}" cy="${f(leg[2][1] + 3)}" rx="12.5" ry="6" fill="${C.shoe}"/>`);
  }
  // short
  out.push(`<path d="M${cx - 24} ${hipY - 2}L${cx + 24} ${hipY - 2}L${cx + 28} ${hipY + 36}L${cx + 4} ${hipY + 36}L${cx} ${hipY + 20}L${cx - 4} ${hipY + 36}L${cx - 28} ${hipY + 36}Z" fill="${C.shorts}"/>`);
  if (p.mid) out.push(p.mid(J));
  // cuello y torso
  if (!p.headFront) out.push(seg([cx, shY - 12], [cx, shY], 13, C.skin));
  out.push(`<path d="M${cx - 31} ${shY + 2}Q${cx} ${shY - 9} ${cx + 31} ${shY + 2}L${cx + 26} ${shY + 18}L${cx + 24} ${hipY}L${cx - 24} ${hipY}L${cx - 26} ${shY + 18}Z" fill="${C.shirt}"/>`);
  if (p.headFront) { out.push(seg([cx, shY - 6 + (p.headDy || 0)], [cx, shY + 6], 13, C.skin)); }
  // brazos
  for (const arm of [armL, armR]) {
    out.push(poly(arm, 12, C.skin), dot(arm[2], 6, C.skin), seg(arm[0], lerp(arm[0], arm[1], 0.42), 17, C.shirt));
  }
  if (p.item) out.push(p.item(armL[2], J) + p.item(armR[2], J));
  // cabeza
  out.push(dot(head, 17, C.skin), hair(head, 18, 192, 348));
  if (p.front) out.push(p.front(J));
  return { svg: out.join(''), J };
}

// anotaciones: punto de músculo + línea guía + etiqueta
function mark(p) {
  return `<g class="ann"><circle cx="${f(p[0])}" cy="${f(p[1])}" r="9" fill="none" stroke="${C.ink}" stroke-opacity=".35"/>` +
    `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="4.5" fill="${C.bg}" stroke="${C.ink}" stroke-width="2"/></g>`;
}
function label(text, from, via, dir = 1) {
  const w = text.length * 7.4 + 8;
  const end = [via[0] + dir * w, via[1]];
  const tx = dir === 1 ? via[0] + 4 : end[0];
  return '<g class="ann">' + poly([from, via, end], 1, C.ink, ' stroke-opacity=".5"') +
    `<text x="${f(tx)}" y="${f(via[1] - 8)}" class="ill-lbl">${text}</text></g>`;
}
function head(p, a) {
  return poly([at(p, a + 150, 9), p, at(p, a - 150, 9)], 1.5, C.mute);
}
const dash = ' stroke-dasharray="3 6"';
function moveLine(p, q, both) {
  const a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
  return seg(p, q, 1.5, C.mute, dash) + head(q, a) + (both ? head(p, a + 180) : '');
}
function moveArc(c, r, a1, a2) {
  const p = at(c, a1, r), q = at(c, a2, r);
  const sweep = a2 > a1 ? 1 : 0;
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  const tan = a2 + (sweep ? 90 : -90);
  return `<path d="M${pt(p)}A${r} ${r} 0 ${large} ${sweep} ${pt(q)}" fill="none" stroke="${C.mute}" stroke-width="1.5" stroke-linecap="round"${dash}/>` + head(q, tan);
}

// equipo
const bar = (p, q) => seg(p, q, 8, C.frame);
const pad = (p, q) => seg(p, q, 11, C.metal);
const cable = (p, q) => seg(p, q, 1.5, C.metal);
const pulley = (p) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="7" fill="${C.bg}" stroke="${C.metal}" stroke-width="3"/>`;

const POSES = {
  elev_laterales() {
    const { svg, J } = front({
      shY: 100, hipY: 164,
      arm: { a: 172, b: 182 }, leg: { a: 92, b: 90 },
      item: (h) => rect(f(h[0] - 11), f(h[1] - 8), 22, 16, 5, C.metal),
    });
    const s = J.armL[0], s2 = J.armR[0];
    return floor() + moveArc(s, 86, 112, 168) + moveArc(s2, 86, 68, 12) + svg +
      mark([s[0] - 6, s[1] - 1]) + mark([s2[0] + 6, s2[1] - 1]) + label('Deltoide lateral', [s2[0] + 12, s2[1] - 6], [262, 58]);
  },

  pajaros() {
    // de perfil: cadera flexionada; la mano sube en vertical hasta la altura del hombro
    const { svg, J } = side({
      hip: [168, 170], torso: -35, headA: -28,
      arm: { a: 88, b: 92 },
      leg: { a: 100, b: 82 },
      item: (h) => dbSide(h, 0), farItem: (h) => dbSide(h, 0, true),
    });
    const h = J.arm[2];
    return floor() + moveLine([h[0] + 46, h[1] - 2], [h[0] + 46, J.sh[1] + 18]) + svg +
      mark([J.sh[0] - 6, J.sh[1] - 8]) + label('Deltoide posterior', [J.sh[0] - 12, J.sh[1] - 12], [150, 78], -1);
  },

  dominadas() {
    const { svg, J } = front({
      shY: 112, hipY: 176,
      arm: { to: [134, 58], bend: 1 }, armR: { to: [266, 58], bend: -1 }, leg: { a: 94, b: 92 }, thLen: 40,
      back: () => bar([96, 266], [96, 52]) + bar([304, 266], [304, 52]) + seg([92, 56], [308, 56], 7, C.metal) +
        bar([200, 266], [200, 236]) + pad([166, 236], [234, 236]),
    });
    return floor() + svg + moveLine([340, 176], [340, 118]) +
      mark([182, 140]) + mark([218, 140]) + label('Dorsal ancho', [176, 146], [128, 186], -1);
  },

  press_hombro() {
    const { svg, J } = front({
      shY: 138, hipY: 196, thLen: 16,
      arm: { a: 170, b: -90 }, leg: { a: 100, b: 90 },
      back: () => rect(172, 96, 56, 120, 10, C.frame) + bar([200, 266], [200, 230]) + pad([150, 228], [250, 228]),
      item: (h) => dbSide(h, 0),
    });
    const s = J.armL[0], s2 = J.armR[0];
    return floor() + svg + moveLine([J.armL[2][0], 92], [J.armL[2][0], 52]) + moveLine([J.armR[2][0], 92], [J.armR[2][0], 52]) +
      mark([s[0] - 4, s[1] - 2]) + mark([s2[0] + 4, s2[1] - 2]) + label('Deltoides', [s2[0] + 10, s2[1] + 4], [276, 168]);
  },

  curl() { return curlPose('end'); },
  curl_martillo() { return curlPose('side'); },

  curl_inclinado() {
    const hip = [184, 208];
    const { svg, J } = side({
      hip, torso: -120, headA: -112,
      arm: { a: 92, b: -40 }, farShift: [-3, -2],
      leg: { a: 15, b: 95 },
      back: () => bench(hip, -120, 30),
      item: (h) => dbEnd(h), farItem: (h) => dbEnd(h),
    });
    const el = J.arm[1];
    return floor() + svg + moveArc(el, 48, 84, -30) + mark(lerp(J.arm[0], J.arm[1], 0.55).map((v, i) => v + (i ? 0 : 7))) +
      label('Bíceps', [J.arm[0][0] + 14, J.arm[0][1] + 18], [250, 120]);
  },

  press_inclinado() {
    const hip = [176, 206];
    const { svg, J } = side({
      hip, torso: -150, headA: -160,
      arm: { a: -68, b: -74 }, farArm: { a: -68, b: -74 },
      leg: { a: 15, b: 95 },
      back: () => bench(hip, -150, 22),
      item: (h) => dbEnd(h), farItem: (h) => dbEnd(h),
    });
    const chest = at(at(J.sh, 30, 14), -60, 13);
    return floor() + svg + moveLine([176, 152], [192, 106]) + mark(chest) + label('Pecho superior', chest, [214, 150]);
  },

  press_maquina() {
    const { svg, J } = side({
      hip: [180, 214], torso: -96,
      arm: { a: 2, b: -2 },
      leg: { a: 0, b: 90 },
      back: () => bar([300, 266], [300, 40]) + seg([256, 146], [292, 60], 6, C.metal) + seg([292, 60], [300, 60], 6, C.metal) +
        rect(140, 120, 16, 96, 8, C.metal) + bar([180, 266], [180, 232]) + pad([142, 230], [214, 230]),
      item: (h) => rect(f(h[0] - 4), f(h[1] - 14), 9, 28, 4, C.metal),
    });
    const chest = [J.sh[0] + 16, J.sh[1] + 12];
    return floor() + svg + moveLine([206, 112], [262, 112]) + mark(chest) + label('Pecho', chest, [228, 196]);
  },

  fondos() {
    const { svg, J } = side({
      hip: [200, 180], torso: -80,
      arm: { a: 112, b: 78 },
      leg: { a: 96, b: 170, ft: 172 },
      back: () => bar([258, 266], [258, 178]) + seg([158, 184], [262, 184], 7, C.metal) +
        bar([176, 266], [176, 244]) + pad([128, 240], [214, 240]),
    });
    const tri = lerp(J.arm[0], J.arm[1], 0.5);
    return floor() + svg + moveLine([296, 92], [296, 148], true) + mark([tri[0] - 6, tri[1]]) + label('Tríceps · pecho', [tri[0] - 12, tri[1] - 4], [140, 92], -1);
  },

  ext_triceps() {
    const { svg, J } = side({
      hip: [186, 172], torso: -88,
      arm: { a: 96, b: 74 },
      leg: { a: 91, b: 90 },
      back: () => bar([300, 266], [300, 36]) + bar([300, 36], [262, 36]),
      item: (h) => grip(h),
    });
    const el = J.arm[1];
    return floor() + `<g>${cable(J.arm[2], [262, 44])}</g>` + pulley([262, 40]) + svg + moveArc(el, 50, -6, 70) +
      mark([J.arm[0][0] - 7, J.arm[0][1] + 20]) + label('Tríceps', [J.arm[0][0] - 13, J.arm[0][1] + 16], [128, 96], -1);
  },

  jalon() {
    const { svg, J } = side({
      hip: [186, 214], torso: -100, headA: -96,
      arm: { to: [200, 150], bend: -1 },
      leg: { a: 0, b: 90 },
      back: () => bar([300, 266], [300, 26]) + bar([300, 26], [196, 26]) + bar([186, 266], [186, 232]) + pad([150, 230], [220, 230]),
      front: (J) => pad([214, 196], [250, 196]),
      item: (h) => dot(h, 7, C.metal),
    });
    return floor() + cable(J.arm[2], [196, 32]) + pulley([196, 28]) + svg + moveLine([232, 60], [232, 114]) +
      mark([J.sh[0] - 12, J.sh[1] + 22]) + label('Dorsal ancho', [J.sh[0] - 18, J.sh[1] + 18], [118, 98], -1);
  },

  remo_sentado() {
    const { svg, J } = side({
      hip: [150, 214], torso: -92,
      arm: { a: 158, b: 18 },
      leg: { a: -8, b: 8, ft: -80 },
      back: () => bar([340, 266], [340, 196]) + bar([150, 266], [150, 232]) + pad([112, 230], [190, 230]) + seg([252, 186], [252, 236], 7, C.metal),
      item: (h) => grip(h),
    });
    return floor() + cable(J.arm[2], [334, 204]) + pulley([336, 204]) + svg + moveLine([282, 158], [224, 158]) +
      mark([J.sh[0] - 13, J.sh[1] + 20]) + label('Espalda media', [J.sh[0] - 19, J.sh[1] + 16], [110, 96], -1);
  },

  remo_mancuerna() {
    const { svg, J } = side({
      hip: [150, 172], torso: -3, headA: -12,
      arm: { a: -150, b: 90 }, farArm: { a: 60, b: 95 },
      leg: { a: 105, b: 90 }, farLeg: { a: 90, b: 180, ft: 180 }, farShift: [2, 0],
      back: () => bar([128, 266], [128, 236]) + bar([236, 266], [236, 236]) + pad([104, 234], [262, 234]),
      item: (h) => dbSide(h, 0),
    });
    return floor() + svg + moveLine([156, 238], [156, 198]) +
      mark([186, 160]) + label('Dorsal ancho', [190, 154], [252, 100]);
  },

  face_pull() {
    const { svg, J } = side({
      hip: [176, 172], torso: -92,
      arm: { a: 190, b: -28 },
      leg: { a: 94, b: 88 },
      back: () => bar([330, 266], [330, 60]),
      item: (h) => dot(h, 5, C.metal),
    });
    return floor() + cable(J.arm[2], [322, J.arm[2][1]]) + pulley([324, J.arm[2][1]]) + svg + moveLine([288, 60], [232, 60]) +
      mark([J.sh[0] - 8, J.sh[1] + 2]) + label('Deltoide posterior', [J.sh[0] - 4, J.sh[1] + 8], [226, 176]);
  },

  goblet() {
    const { svg, J } = side({
      hip: [172, 214], torso: -70, headA: -66,
      arm: { to: [216, 174], bend: -1 },
      leg: { a: 5, b: 105 },
      item: (h) => dbSide([h[0] + 3, h[1] - 6], 90),
    });
    return floor() + moveLine([114, 130], [114, 214]) + svg +
      mark([206, 214]) + mark([158, 222]) + label('Cuádriceps · glúteo', [212, 220], [250, 240]);
  },

  rdl() {
    const { svg, J } = side({
      hip: [170, 171], torso: -25, headA: -18,
      arm: { a: 90, b: 90 },
      leg: { a: 100, b: 85 },
      item: (h) => dbEnd(h), farItem: (h) => dbEnd(h),
    });
    return floor() + moveArc(J.hip, 96, -30, -78) + svg +
      mark([160, 196]) + mark([158, 172]) + label('Isquios · glúteo', [156, 190], [150, 112], -1);
  },

  zancadas() {
    const { svg, J } = side({
      hip: [190, 216], torso: -90,
      arm: { a: 92, b: 90 },
      leg: { a: 0, b: 90 }, farLeg: { a: 105, b: 190, ft: 120 }, farShift: [-2, -2],
      item: (h) => dbEnd(h), farItem: (h) => dbEnd(h),
    });
    return floor() + svg + moveLine([290, 176], [290, 230]) +
      mark([222, 210]) + mark([176, 226]) + label('Cuádriceps · glúteo', [228, 204], [252, 132]);
  },

  talones() {
    const { svg, J } = side({
      hip: [200, 154], torso: -90,
      arm: { a: 92, b: 90 },
      leg: { a: 90, b: 90, ft: 32 },
      back: () => rect(206, 254, 76, 12, 3, C.metal),
      item: (h) => dbEnd(h), farItem: (h) => dbEnd(h),
    });
    return floor() + svg + moveLine([168, 252], [168, 222]) +
      mark([193, 226]) + label('Pantorrilla', [187, 222], [100, 196], -1);
  },

  crunch() {
    const { svg, J } = side({
      hip: [214, 247], torso: -160, headA: -140,
      arm: { a: -104, b: 150 },
      leg: { a: -50, b: 76, ft: 0 },
    });
    return floor() + moveArc(J.hip, 92, -168, -136) + svg +
      mark([188, 222]) + label('Abdomen', [192, 216], [236, 150]);
  },

  plancha() {
    const { svg, J } = side({
      hip: [190, 236], torso: -8, headA: -4,
      arm: { a: 90, b: 0 },
      leg: { a: 172, b: 172, ft: 100 },
    });
    return floor() + seg([92, 216], [290, 188], 1.5, C.mute, dash) + svg +
      mark([214, 250]) + label('Core', [220, 246], [252, 140]);
  },

  elev_rodillas() {
    const { svg, J } = side({
      hip: [188, 176], torso: -90,
      arm: { a: 90, b: 0 },
      leg: { a: -4, b: 88, ft: 10 },
      back: () => bar([156, 266], [156, 56]) + rect(150, 84, 14, 98, 7, C.metal) + seg([168, 154], [244, 154], 9, C.metal),
    });
    return floor() + moveArc(J.hip, 62, 82, 6) + svg +
      mark([206, 164]) + label('Abdomen bajo', [210, 160], [268, 110]);
  },

  bici() {
    const crank = [206, 226];
    const pedal = at(crank, 35, 17), pedalF = at(crank, 215, 17);
    const { svg, J } = side({
      hip: [176, 150], torso: -52, headA: -40,
      arm: { to: [266, 122], bend: 1 },
      leg: { to: pedal, bend: -1, ft: 8 }, farLeg: { to: pedalF, bend: -1, ft: 0 }, farShift: [0, 0],
      back: () => seg([150, 262], [300, 262], 8, C.frame) + seg([186, 166], crank, 8, C.frame) + seg(crank, [260, 236], 8, C.frame) +
        seg([256, 156], [266, 120], 7, C.frame) + seg([246, 236], [256, 156], 8, C.frame) + seg([170, 164], [194, 164], 9, C.metal) +
        `<circle cx="262" cy="232" r="22" fill="none" stroke="${C.metal}" stroke-width="4"/>` + seg(crank, pedalF, 5, C.metalDark),
      mid: () => seg(crank, pedal, 5, C.metal) + dot(crank, 6, C.metal),
    });
    return floor() + svg + mark([206, 172]) + label('Cardio', [200, 168], [128, 100], -1);
  },
};

function curlPose(kind) {
  const { svg, J } = side({
    hip: [200, 172], torso: -90,
    arm: { a: 92, b: -60 }, farArm: { a: 92, b: 88 },
    leg: { a: 91, b: 90 },
    item: (h) => (kind === 'end' ? dbEnd(h) : dbSide(h, 90)),
    farItem: (h) => (kind === 'end' ? dbEnd(h) : dbSide(h, 90, true)),
  });
  const el = J.arm[1];
  const bi = lerp(J.arm[0], J.arm[1], 0.55);
  return floor() + moveArc(el, 48, 84, -54) + svg + mark([bi[0] + 6, bi[1]]) +
    label(kind === 'end' ? 'Bíceps' : 'Bíceps · antebrazo', [bi[0] + 12, bi[1] - 4], [252, 172]);
}

// banco inclinado que sigue al torso
function bench(hip, torsoA, extra) {
  const off = at([0, 0], torsoA - 90, 25);
  const top = at(at(hip, torsoA, LEN.torso + extra), 0, 0);
  const a = [hip[0] + off[0], hip[1] + off[1]], b = [top[0] + off[0], top[1] + off[1]];
  return seg(a, b, 11, C.metal) + seg([a[0] - 10, hip[1] + 22], [hip[0] + 30, hip[1] + 22], 11, C.metal) +
    bar([hip[0], hip[1] + 26], [hip[0], FLOOR]) + bar([b[0] + 14, b[1] + 12], [b[0] + 14, FLOOR]);
}

const cache = {};
function illustration(id, title, thumb) {
  const draw = POSES[id];
  const body = cache[id] || (cache[id] = draw ? draw() : '');
  const box = thumb ? '40 24 320 252' : '0 0 400 300';
  const aria = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"';
  return `<svg class="ill${thumb ? ' ill--thumb' : ''}" data-id="${id}" viewBox="${box}" ${aria}>${body}</svg>`;
}
