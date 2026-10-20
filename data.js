// Rutina "Físico marcado" (rutinagym.pdf) + ajustes acordados.
// sets: número de series; reps: [mín, máx]; unit: 'reps' | 's' (segundos);
// cue (en el ítem): técnica propia de ese día según el PDF; si no hay, se usa la del ejercicio.
// rest: texto de descanso; restSec: segundos que corre el temporizador.
// load (en EXERCISES): 'asist' = kg de asistencia, 'none' = sin peso; por defecto kg.
// extra: true → suma 1 serie cuando "Volumen extra" está activo (semana 5+).

const EXERCISES = {
  press_inclinado: { name: 'Press inclinado con mancuernas', alt: 'o press en suelo', muscle: 'Pecho superior', cue: 'Si hay banco, inclinación de 20–35°. Baja con control.' },
  press_maquina: { name: 'Press de pecho en máquina', alt: 'o con mancuernas', muscle: 'Pecho', cue: 'Sin rebotes; mantén los hombros estables.' },
  elev_laterales: { name: 'Elevaciones laterales', muscle: 'Deltoide lateral', cue: 'Codos algo flexionados; evita balancearte.' },
  fondos: { load: 'asist', name: 'Fondos asistidos', muscle: 'Tríceps · pecho', cue: 'Usa un rango cómodo; omite si molesta el hombro.' },
  ext_triceps: { name: 'Extensión de tríceps en polea', muscle: 'Tríceps', cue: 'Codos pegados al torso.' },
  // dominadas y face pull no vienen en el PDF: son los ajustes acordados
  dominadas: { load: 'asist', name: 'Dominadas asistidas', muscle: 'Dorsal ancho', cue: 'Agarre algo más ancho que los hombros. Lleva el pecho hacia la barra y baja hasta estirar los brazos. Cuando hagas 10 limpias, quita asistencia.' },
  jalon: { name: 'Jalón al pecho', muscle: 'Dorsal ancho', cue: 'Lleva la barra al pecho; nunca detrás del cuello.' },
  remo_sentado: { name: 'Remo sentado en polea', alt: 'o máquina', muscle: 'Espalda media', cue: 'No balancees el torso; guía el movimiento con los codos.' },
  remo_mancuerna: { name: 'Remo a una mano con mancuerna', muscle: 'Dorsal ancho', cue: 'Mantén el tronco estable; apóyate si hay banco.' },
  pajaros: { name: 'Pájaros con mancuernas', muscle: 'Deltoide posterior', cue: 'Trabaja deltoide posterior sin encoger hombros.' },
  face_pull: { name: 'Face pull en polea', muscle: 'Deltoide posterior', cue: 'Polea a la altura de la cara. Jala la cuerda hacia la frente abriendo los codos; pausa de un segundo.' },
  curl: { name: 'Curl de bíceps con mancuernas', muscle: 'Bíceps', cue: 'Codos quietos; baja lentamente.' },
  curl_inclinado: { name: 'Curl alterno o inclinado', muscle: 'Bíceps', cue: 'Baja lentamente para controlar la repetición.' },
  curl_martillo: { name: 'Curl martillo', muscle: 'Bíceps · antebrazo', cue: 'Muñecas neutras y movimiento controlado.' },
  press_hombro: { name: 'Press de hombro sentado con mancuernas', muscle: 'Deltoides', cue: 'Solo si no causa dolor; no fuerces el rango.' },
  goblet: { name: 'Sentadilla goblet', muscle: 'Cuádriceps · glúteo', cue: 'Sujeta una mancuerna frente al pecho; controla la bajada.' },
  rdl: { name: 'Peso muerto rumano con mancuernas', muscle: 'Isquios · glúteo', cue: 'Lleva la cadera atrás y mantén la espalda neutra.' },
  zancadas: { name: 'Zancadas', alt: 'o sentadilla dividida', muscle: 'Cuádriceps · glúteo', cue: 'Empieza sin peso si necesitas practicar el equilibrio.' },
  talones: { name: 'Elevación de talones', muscle: 'Pantorrilla', cue: 'Pausa arriba y baja despacio.' },
  crunch: { name: 'Crunch', alt: 'en suelo o polea', muscle: 'Abdomen', cue: 'Flexiona el tronco; no tires del cuello.' },
  plancha: { load: 'none', name: 'Plancha', muscle: 'Core', cue: 'Detente antes de perder la postura.' },
  elev_rodillas: { load: 'none', name: 'Elevación de rodillas', alt: 'o crunch', muscle: 'Abdomen bajo', cue: 'Evita balancearte; elige la variante controlable.' },
  bici: { name: 'Bicicleta', muscle: 'Cardio', cue: 'Debes poder hablar en frases cortas.' },
};

const DAYS = [
  {
    title: 'Empuje', focus: 'Pecho superior · hombros · tríceps',
    items: [
      { ex: 'press_inclinado', sets: 3, reps: [6, 10], rest: '2–3 min', restSec: 150 },
      { ex: 'press_maquina', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'elev_laterales', sets: 3, reps: [12, 20], rest: '60–90 s', restSec: 75, extra: true },
      { ex: 'fondos', sets: 2, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'ext_triceps', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75 },
    ],
    bike: '20 min moderados al terminar',
  },
  {
    title: 'Jalón', focus: 'Espalda en V · bíceps',
    items: [
      { ex: 'dominadas', sets: 3, reps: [6, 10], rest: '2 min', restSec: 120, extra: true, isNew: true },
      { ex: 'remo_sentado', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, extra: true },
      { ex: 'remo_mancuerna', sets: 2, reps: [10, 12], perSide: true, rest: '90 s', restSec: 90 },
      { ex: 'pajaros', sets: 2, reps: [12, 20], rest: '60–90 s', restSec: 75 },
      { ex: 'curl', sets: 3, reps: [8, 12], rest: '60–90 s', restSec: 75 },
      { ex: 'curl_martillo', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75 },
    ],
    bike: null,
  },
  {
    title: 'Pierna + core', focus: 'Piernas · abdomen',
    items: [
      { ex: 'goblet', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'rdl', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'zancadas', sets: 2, reps: [8, 10], perSide: true, rest: '90–120 s', restSec: 105 },
      { ex: 'talones', sets: 3, reps: [12, 20], rest: '60–90 s', restSec: 75 },
      { ex: 'crunch', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
      { ex: 'plancha', sets: 3, reps: [20, 45], unit: 's', rest: '60 s', restSec: 60 },
    ],
    bike: 'Opcional: 10 min suaves si te sientes recuperado',
  },
  {
    title: 'Torso completo', focus: 'Pecho · espalda · deltoides',
    items: [
      { ex: 'press_inclinado', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, cue: 'Usa un peso controlable, sin rebotes.' },
      { ex: 'jalon', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, extra: true, cue: 'Controla la subida; evita tirones.' },
      { ex: 'remo_sentado', sets: 3, reps: [10, 12], rest: '2 min', restSec: 120, cue: 'Pausa breve con los codos atrás.' },
      { ex: 'elev_laterales', sets: 3, reps: [12, 20], rest: '60–90 s', restSec: 75, extra: true, cue: 'Prioriza técnica sobre peso.' },
      { ex: 'face_pull', sets: 2, reps: [15, 15], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'curl', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75, cue: 'Evita el impulso del torso.' },
      { ex: 'ext_triceps', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75, cue: 'Mantén los codos estables.' },
    ],
    bike: '20–25 min moderados',
  },
  {
    title: 'Hombros + brazos', focus: 'Deltoides · brazos · abdomen',
    items: [
      { ex: 'press_hombro', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, note: '2–3 series; si llegas cansado del jueves, haz 2.' },
      { ex: 'elev_laterales', sets: 4, reps: [12, 20], rest: '60–90 s', restSec: 75, extra: true, isNew: true, cue: 'Controla la bajada y evita balancearte.' },
      { ex: 'curl_inclinado', sets: 3, reps: [10, 12], rest: '60–90 s', restSec: 75 },
      { ex: 'curl_martillo', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75, cue: 'Codos estables; muñecas neutras.' },
      { ex: 'ext_triceps', sets: 3, reps: [10, 15], rest: '60–90 s', restSec: 75, cue: 'Controla ambas fases.' },
      { ex: 'elev_rodillas', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
    ],
    bike: '20–30 min moderados',
  },
];

const RULES = {
  warmup: '5 min de bicicleta suave y 1–2 series ligeras del primer ejercicio. No cuentan como series efectivas.',
  execution: 'Usa un peso que puedas controlar y deja 1–3 repeticiones en reserva. Detén cualquier movimiento que cause dolor agudo.',
  firstWeeks: 'Prioriza la técnica y deja 2–3 repeticiones posibles al final de cada serie.',
  progression: 'Doble progresión: suma repeticiones con el mismo peso. Cuando completes el máximo del rango en todas las series con técnica limpia, sube el peso lo mínimo y vuelve al rango bajo.',
  steps: '8 000–10 000 pasos al día.',
  extra: 'Desde la semana 5, si te recuperas bien: +1 serie en espalda y elevaciones laterales.',
  measure: 'Pésate 3–4 mañanas por semana y compara el promedio. Cintura cada 2 semanas, fotos cada mes con la misma luz.',
};
