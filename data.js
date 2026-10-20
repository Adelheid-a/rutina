// Rutina basada en rutinagym.pdf ("Físico marcado"), reorganizada con máquinas del gimnasio.
// sets: número de series; reps: [mín, máx]; unit: 'reps' | 's' (segundos);
// load (en EXERCISES): 'asist' = kg de asistencia, 'none' = sin peso; por defecto kg.
// cue: técnica corta (en el ítem, la propia de ese día; si no hay, la del ejercicio).
// how: descripción en tres pasos [posición, movimiento, error que evitar].
// rest: texto de descanso; restSec: segundos que corre el temporizador.
// extra: true → suma 1 serie cuando "Volumen extra" está activo (semana 5+).

const EXERCISES = {
  // ---- pecho y tríceps
  press_inclinado: {
    name: 'Press inclinado con mancuernas', alt: 'o press en suelo', muscle: 'Pecho superior',
    cue: 'Si hay banco, inclinación de 20–35°. Baja con control.',
    how: [
      'Recuéstate en el banco inclinado con una mancuerna en cada mano a la altura del pecho, pies firmes en el suelo.',
      'Empuja las mancuernas hacia arriba hasta casi estirar los brazos y baja despacio hasta sentir el estiramiento en el pecho.',
      'Rebotar abajo o abrir los codos a 90°: mantenlos a unos 45° del torso.',
    ],
  },
  press_maquina: {
    name: 'Press de pecho en máquina', muscle: 'Pecho',
    cue: 'Sin rebotes; mantén los hombros estables.',
    how: [
      'Ajusta el asiento para que los agarres queden a la altura del pecho; espalda pegada al respaldo.',
      'Empuja hacia el frente sin bloquear los codos y regresa controlado hasta que las manos queden junto al pecho.',
      'Despegar los hombros del respaldo o encogerlos hacia las orejas.',
    ],
  },
  cruce_poleas: {
    name: 'Cruce de poleas', muscle: 'Pecho',
    cue: 'Codos fijos y algo flexionados; junta las manos frente al pecho.',
    how: [
      'Poleas arriba, un agarre en cada mano y un paso al frente con el torso un poco inclinado.',
      'Lleva las manos en arco hacia el centro hasta juntarlas frente al pecho; pausa y abre despacio.',
      'Doblar y estirar los codos: se vuelve un press. El ángulo del codo no cambia.',
    ],
  },
  fondos: {
    load: 'asist', name: 'Fondos asistidos', muscle: 'Tríceps · pecho',
    cue: 'Usa un rango cómodo; omite si molesta el hombro.',
    how: [
      'Arrodíllate en la plataforma de asistencia y toma las barras paralelas con los brazos estirados.',
      'Baja doblando los codos hasta que los brazos queden paralelos al suelo y empuja de vuelta arriba.',
      'Bajar de más si molesta el hombro. Más peso de asistencia = más fácil.',
    ],
  },
  ext_triceps: {
    name: 'Extensión de tríceps en polea', muscle: 'Tríceps',
    cue: 'Codos pegados al torso.',
    how: [
      'De frente a la polea alta con barra o cuerda, codos pegados a los costados.',
      'Empuja hacia abajo hasta estirar los brazos por completo y sube solo hasta que el antebrazo quede horizontal.',
      'Que los codos se muevan hacia adelante o inclinarte para usar el peso del cuerpo.',
    ],
  },
  ext_sobre_cabeza: {
    name: 'Extensión de tríceps sobre la cabeza', alt: 'en polea con cuerda', muscle: 'Tríceps',
    cue: 'Codos apuntando al frente y quietos; estira por completo.',
    how: [
      'De espaldas a la polea, cuerda detrás de la cabeza, un pie adelante y el torso algo inclinado.',
      'Estira los brazos hacia el frente y arriba; regresa doblando solo los codos hasta sentir el estiramiento.',
      'Abrir los codos hacia los lados o arquear la espalda baja.',
    ],
  },

  // ---- espalda y bíceps
  // dominadas asistidas y face pull no vienen en el PDF: son ajustes acordados
  dominadas: {
    load: 'asist', name: 'Dominadas asistidas', muscle: 'Dorsal ancho',
    cue: 'Lleva el pecho hacia la barra. Cuando hagas 10 limpias, quita asistencia.',
    how: [
      'Arrodíllate en la plataforma y toma la barra con agarre algo más ancho que los hombros, palmas al frente.',
      'Jala llevando los codos hacia abajo y atrás hasta que la barbilla pase la barra; baja hasta estirar los brazos.',
      'Columpiarte o subir a medias. Más peso de asistencia = más fácil.',
    ],
  },
  jalon: {
    name: 'Jalón al pecho', muscle: 'Dorsal ancho',
    cue: 'Lleva la barra al pecho; nunca detrás del cuello.',
    how: [
      'Siéntate con los muslos bajo los rodillos y toma la barra un poco más ancho que los hombros.',
      'Jala la barra hacia la parte alta del pecho llevando los codos hacia abajo; sube controlando.',
      'Echarte muy atrás o jalar con los brazos en lugar de con la espalda.',
    ],
  },
  remo_sentado: {
    name: 'Remo sentado en polea', alt: 'o máquina', muscle: 'Espalda media',
    cue: 'No balancees el torso; guía el movimiento con los codos.',
    how: [
      'Siéntate con los pies en la plataforma, rodillas un poco flexionadas y espalda recta.',
      'Jala el agarre hacia el abdomen llevando los codos atrás y juntando los omóplatos; regresa estirando los brazos.',
      'Mecer el torso hacia adelante y atrás para mover el peso.',
    ],
  },
  remo_mancuerna: {
    name: 'Remo a una mano con mancuerna', muscle: 'Dorsal ancho',
    cue: 'Mantén el tronco estable; apóyate si hay banco.',
    how: [
      'Apoya una rodilla y una mano en el banco, espalda plana y la mancuerna colgando del otro brazo.',
      'Lleva el codo hacia la cadera hasta que la mancuerna llegue al costado; baja estirando el brazo.',
      'Girar el torso para subir más peso.',
    ],
  },
  pullover_polea: {
    name: 'Pullover en polea', muscle: 'Dorsal ancho',
    cue: 'Brazos casi rectos; el movimiento sale del hombro.',
    how: [
      'De frente a la polea alta con barra o cuerda, un paso atrás y el torso algo inclinado.',
      'Con los brazos casi rectos, baja el agarre en arco hasta los muslos; sube despacio hasta la altura de la cabeza.',
      'Doblar los codos: se convierte en extensión de tríceps.',
    ],
  },
  curl: {
    name: 'Curl de bíceps con mancuernas', muscle: 'Bíceps',
    cue: 'Codos quietos; baja lentamente.',
    how: [
      'De pie, una mancuerna en cada mano con las palmas al frente y los codos pegados al cuerpo.',
      'Sube doblando solo el codo hasta que la mancuerna llegue al hombro; baja en 2–3 segundos.',
      'Balancear el cuerpo o adelantar los codos.',
    ],
  },
  curl_martillo: {
    name: 'Curl martillo', muscle: 'Bíceps · antebrazo',
    cue: 'Muñecas neutras y movimiento controlado.',
    how: [
      'De pie, mancuernas a los costados con las palmas mirando hacia el cuerpo.',
      'Sube sin girar la muñeca, como si martillaras, y baja despacio.',
      'Usar impulso o despegar los codos del cuerpo.',
    ],
  },
  curl_polea: {
    name: 'Curl en polea', muscle: 'Bíceps',
    cue: 'Codos quietos; aprieta arriba un segundo.',
    how: [
      'De frente a la polea baja con barra o cuerda, codos pegados a los costados.',
      'Sube doblando solo el codo hasta el pecho; baja controlado hasta estirar el brazo.',
      'Inclinarte hacia atrás para subir más peso.',
    ],
  },

  // ---- hombros
  elev_laterales: {
    name: 'Elevaciones laterales', alt: 'con mancuernas', muscle: 'Deltoide lateral',
    cue: 'Codos algo flexionados; evita balancearte.',
    how: [
      'De pie, mancuernas a los costados y los codos un poco flexionados.',
      'Sube los brazos hacia los lados hasta la altura de los hombros y baja despacio.',
      'Subir de más o con impulso; el trapecio no debe hacer el trabajo.',
    ],
  },
  lat_polea: {
    name: 'Elevaciones laterales en polea', muscle: 'Deltoide lateral',
    cue: 'Sube hasta la altura del hombro y baja lento.',
    how: [
      'De lado a la polea baja; toma el agarre con la mano lejana, cruzando frente al cuerpo.',
      'Sube el brazo hacia el costado hasta la altura del hombro, codo un poco flexionado; baja controlado.',
      'Subir con impulso del cuerpo o encoger el trapecio.',
    ],
  },
  press_hombro: {
    name: 'Press de hombro en máquina', alt: 'o con mancuernas', muscle: 'Deltoides',
    cue: 'Solo si no causa dolor; no fuerces el rango.',
    how: [
      'Ajusta el asiento para que los agarres queden a la altura de los hombros; espalda pegada al respaldo.',
      'Empuja hacia arriba sin bloquear los codos y baja hasta que las manos queden a la altura de las orejas.',
      'Arquear la espalda baja para empujar más peso.',
    ],
  },
  pec_deck_inv: {
    name: 'Pec deck inverso', alt: 'aperturas posteriores en máquina', muscle: 'Deltoide posterior',
    cue: 'Brazos casi rectos; abre sin encoger los hombros.',
    how: [
      'Siéntate de frente a la máquina con el pecho apoyado en el respaldo y los agarres al frente a la altura del hombro.',
      'Abre los brazos hacia atrás en arco hasta que queden en línea con los hombros; regresa despacio.',
      'Jalar con los codos doblados o encoger los hombros.',
    ],
  },
  face_pull: {
    name: 'Face pull en polea', muscle: 'Deltoide posterior',
    cue: 'Polea a la altura de la cara; pausa de un segundo.',
    how: [
      'Polea a la altura de la cara con cuerda; toma un extremo en cada mano y da un paso atrás.',
      'Jala la cuerda hacia la frente abriendo los codos hacia los lados y arriba; pausa y regresa.',
      'Jalar hacia el pecho o echarte hacia atrás.',
    ],
  },

  // ---- pierna (máquinas)
  prensa: {
    name: 'Prensa de pierna', muscle: 'Cuádriceps · glúteo',
    cue: 'Baja hasta 90° de rodilla sin despegar la cadera.',
    how: [
      'Espalda y cadera pegadas al respaldo, pies en la plataforma al ancho de los hombros.',
      'Quita los seguros, baja la plataforma doblando las rodillas hasta unos 90° y empuja con todo el pie.',
      'Bloquear las rodillas arriba o que la cadera se despegue del asiento abajo.',
    ],
  },
  ext_cuadriceps: {
    name: 'Extensión de cuádriceps', muscle: 'Cuádriceps',
    cue: 'Pausa arriba con la pierna estirada; baja lento.',
    how: [
      'Ajusta el respaldo para que la rodilla quede alineada con el eje de la máquina y el rodillo sobre el tobillo.',
      'Estira las piernas por completo, aprieta un segundo y baja en 2–3 segundos.',
      'Dejar caer el peso o despegar la cadera del asiento.',
    ],
  },
  curl_femoral: {
    name: 'Curl femoral', alt: 'acostado o sentado', muscle: 'Isquiotibiales',
    cue: 'Cadera pegada al banco; sube y baja controlado.',
    how: [
      'Acuéstate boca abajo con el rodillo justo arriba de los talones y las rodillas fuera del borde del banco.',
      'Lleva los talones hacia los glúteos y baja despacio hasta casi estirar.',
      'Levantar la cadera del banco para ayudarte.',
    ],
  },
  talones: {
    name: 'Elevación de talones en máquina', muscle: 'Pantorrilla',
    cue: 'Pausa arriba y baja despacio.',
    how: [
      'Hombros bajo las almohadillas y la punta de los pies en el borde de la plataforma.',
      'Sube sobre las puntas lo más alto que puedas, pausa y baja hasta estirar la pantorrilla.',
      'Rebotar abajo o doblar las rodillas.',
    ],
  },

  // ---- abdomen
  crunch_polea: {
    name: 'Crunch en polea', muscle: 'Abdomen',
    cue: 'Flexiona el tronco; no tires del cuello.',
    how: [
      'De rodillas frente a la polea alta, cuerda a los lados de la cabeza.',
      'Enrolla el tronco llevando los codos hacia los muslos; la cadera no se mueve. Sube despacio.',
      'Sentarte sobre los talones y jalar con los brazos.',
    ],
  },
  elev_piernas: {
    load: 'none', name: 'Elevación de rodillas colgado', alt: 'o en silla romana', muscle: 'Abdomen bajo',
    cue: 'Evita balancearte; elige la variante controlable.',
    how: [
      'Cuélgate de la barra (o apoya los antebrazos en la silla romana) con el cuerpo quieto.',
      'Sube las rodillas hacia el pecho enrollando la pelvis y baja despacio.',
      'Columpiarte para subir las piernas.',
    ],
  },

  bici: {
    name: 'Bicicleta', muscle: 'Cardio',
    cue: 'Debes poder hablar en frases cortas.',
    how: [],
  },
};

const DAYS = [
  {
    title: 'Pecho + tríceps', focus: 'Pecho superior · hombros · tríceps',
    items: [
      { ex: 'press_inclinado', sets: 3, reps: [6, 10], rest: '2–3 min', restSec: 150 },
      { ex: 'press_maquina', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'cruce_poleas', sets: 3, reps: [12, 15], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'elev_laterales', sets: 3, reps: [12, 20], rest: '60–90 s', restSec: 75, extra: true },
      { ex: 'fondos', sets: 2, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'ext_triceps', sets: 3, reps: [10, 15], rest: '60–90 s', restSec: 75 },
    ],
    bike: '20 min moderados al terminar',
  },
  {
    title: 'Espalda + bíceps', focus: 'Espalda en V · bíceps',
    items: [
      { ex: 'dominadas', sets: 3, reps: [6, 10], rest: '2 min', restSec: 120, extra: true, isNew: true },
      { ex: 'remo_sentado', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, extra: true },
      { ex: 'remo_mancuerna', sets: 2, reps: [10, 12], perSide: true, rest: '90 s', restSec: 90 },
      { ex: 'pullover_polea', sets: 2, reps: [12, 15], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'curl', sets: 3, reps: [8, 12], rest: '60–90 s', restSec: 75 },
      { ex: 'curl_martillo', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75 },
    ],
    bike: null,
  },
  {
    title: 'Pierna + abdomen', focus: 'Cuádriceps · femoral · pantorrilla · core',
    items: [
      { ex: 'prensa', sets: 3, reps: [10, 12], rest: '2 min', restSec: 120, isNew: true },
      { ex: 'ext_cuadriceps', sets: 3, reps: [12, 15], rest: '90 s', restSec: 90, isNew: true },
      { ex: 'curl_femoral', sets: 3, reps: [10, 15], rest: '90 s', restSec: 90, isNew: true },
      { ex: 'talones', sets: 3, reps: [12, 20], rest: '60–90 s', restSec: 75 },
      { ex: 'crunch_polea', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60, isNew: true },
      { ex: 'elev_piernas', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
    ],
    bike: 'Opcional: 10 min suaves si te sientes recuperado',
  },
  {
    title: 'Hombros + brazos', focus: 'Deltoides · bíceps · tríceps',
    items: [
      { ex: 'press_hombro', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'lat_polea', sets: 3, reps: [12, 15], perSide: true, rest: '60 s', restSec: 60, extra: true, isNew: true },
      { ex: 'pec_deck_inv', sets: 3, reps: [12, 20], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'curl_polea', sets: 3, reps: [10, 15], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'ext_sobre_cabeza', sets: 3, reps: [10, 15], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'curl_martillo', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75, cue: 'Codos estables; muñecas neutras.' },
    ],
    bike: '20–25 min moderados',
  },
  {
    title: 'Torso completo', focus: 'Pecho · espalda · deltoides',
    items: [
      { ex: 'press_inclinado', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, cue: 'Usa un peso controlable, sin rebotes.' },
      { ex: 'jalon', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, extra: true, cue: 'Controla la subida; evita tirones.' },
      { ex: 'remo_sentado', sets: 3, reps: [10, 12], rest: '2 min', restSec: 120, cue: 'Pausa breve con los codos atrás.' },
      { ex: 'elev_laterales', sets: 4, reps: [12, 20], rest: '60–90 s', restSec: 75, extra: true, cue: 'Controla la bajada y evita balancearte.' },
      { ex: 'face_pull', sets: 2, reps: [15, 15], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'ext_triceps', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75, cue: 'Mantén los codos estables.' },
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
