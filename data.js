// Rutina basada en rutinagym.pdf ("Físico marcado"), adaptada al equipo del gimnasio:
// multiestación de poleas (jalón, remo bajo, polea ajustable), barras, bancos inclinados y máquinas de pierna.
// sets: número de series; reps: [mín, máx]; unit: 'reps' | 's' (segundos);
// load (en EXERCISES): 'none' = sin peso; por defecto kg.
// ill (en EXERCISES): reutiliza la ilustración de otro ejercicio.
// cue: técnica corta (en el ítem, la propia de ese día; si no hay, la del ejercicio).
// how: descripción en tres pasos [posición, movimiento, error que evitar].
// rest: texto de descanso; restSec: segundos que corre el temporizador.
// extra: true → suma 1 serie cuando "Volumen extra" está activo (semana 5+).

const EXERCISES = {
  // ---- pecho
  press_inclinado_barra: {
    name: 'Press inclinado con barra', alt: 'banco a 30°, o en multipower', muscle: 'Pecho superior',
    cue: 'Baja la barra a la parte alta del pecho, con control.',
    how: [
      'Banco a unos 30°, ojos bajo la barra, agarre un poco más ancho que los hombros y omóplatos juntos.',
      'Baja la barra hasta rozar la parte alta del pecho y empuja hacia arriba hasta casi estirar los brazos.',
      'Rebotar la barra en el pecho o despegar la cadera del banco. Usa los seguros del rack.',
    ],
  },
  press_inclinado: {
    name: 'Press inclinado con mancuernas', muscle: 'Pecho superior',
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
  apertura_baja: {
    name: 'Apertura en polea baja', alt: 'de abajo hacia arriba', muscle: 'Pecho superior',
    cue: 'Sube en arco hasta la altura del pecho; codos fijos.',
    how: [
      'Polea en la posición más baja con agarre de mano. Con dos poleas, una en cada mano; con una, un brazo a la vez.',
      'Con el codo un poco flexionado, sube la mano en arco hacia el centro hasta la altura de la clavícula; baja despacio.',
      'Doblar y estirar el codo: se vuelve un press y deja de trabajar el pecho.',
    ],
  },
  cruce_poleas: {
    name: 'Apertura en polea media', alt: 'cruce de poleas', muscle: 'Pecho',
    cue: 'Codos fijos y algo flexionados; junta las manos frente al pecho.',
    how: [
      'Polea a la altura del pecho con agarre de mano. Con dos poleas, una en cada mano; con una, un brazo a la vez.',
      'Lleva la mano en arco hacia el centro hasta quedar frente al pecho; pausa y abre despacio hasta sentir el estiramiento.',
      'Doblar y estirar los codos: el ángulo del codo no cambia.',
    ],
  },

  // ---- espalda
  jalon: {
    name: 'Jalón al pecho', alt: 'barra larga, agarre ancho', muscle: 'Dorsal ancho',
    cue: 'Lleva la barra al pecho; nunca detrás del cuello.',
    how: [
      'Siéntate en la estación de jalón con los muslos bajo los rodillos; toma la barra larga un poco más ancho que los hombros.',
      'Jala la barra hacia la parte alta del pecho llevando los codos hacia abajo; sube controlando hasta estirar los brazos.',
      'Echarte muy atrás o jalar con los brazos en lugar de con la espalda.',
    ],
  },
  jalon_cerrado: {
    ill: 'jalon',
    name: 'Jalón agarre cerrado', alt: 'agarre en V o palmas enfrentadas', muscle: 'Dorsal ancho',
    cue: 'Codos pegados al cuerpo; estira arriba por completo.',
    how: [
      'En la estación de jalón cambia la barra por el agarre en V (o toma la barra con las manos juntas).',
      'Jala hacia el pecho llevando los codos hacia las costillas; sube despacio hasta sentir el estiramiento del dorsal.',
      'Subir a medias: el estiramiento de arriba es parte del ejercicio.',
    ],
  },
  remo_barra: {
    name: 'Remo con barra', muscle: 'Espalda media · dorsal',
    cue: 'Torso inclinado y quieto; lleva la barra al ombligo.',
    how: [
      'De pie con la barra, rodillas algo flexionadas y la cadera atrás hasta dejar el torso a unos 45°, espalda recta.',
      'Jala la barra hacia el ombligo llevando los codos atrás; baja hasta estirar los brazos sin mover el torso.',
      'Enderezarte para subir el peso o redondear la espalda.',
    ],
  },
  remo_sentado: {
    name: 'Remo sentado en polea baja', alt: 'agarre en V', muscle: 'Espalda media',
    cue: 'No balancees el torso; guía el movimiento con los codos.',
    how: [
      'En la estación de remo bajo, pies en el apoyo, rodillas un poco flexionadas y espalda recta.',
      'Jala el agarre hacia el abdomen llevando los codos atrás y juntando los omóplatos; regresa estirando los brazos.',
      'Mecer el torso hacia adelante y atrás para mover el peso.',
    ],
  },
  remo_polea_una: {
    ill: 'remo_sentado',
    name: 'Remo a una mano en polea baja', muscle: 'Dorsal ancho',
    cue: 'Lleva el codo hacia la cadera; estira por completo al regresar.',
    how: [
      'En la estación de remo bajo con agarre de una mano; siéntate derecho con el otro brazo apoyado en el muslo.',
      'Jala llevando el codo hacia la cadera y regresa dejando que el hombro se estire hacia el frente.',
      'Girar el torso para mover más peso.',
    ],
  },
  pullover_polea: {
    name: 'Pullover en polea alta', alt: 'brazos rectos, barra o cuerda', muscle: 'Dorsal ancho',
    cue: 'Brazos casi rectos; el movimiento sale del hombro.',
    how: [
      'De frente a la polea alta (estación de jalón o polea ajustable arriba), un paso atrás y el torso algo inclinado.',
      'Con los brazos casi rectos, baja el agarre en arco hasta los muslos; sube despacio hasta la altura de la cabeza.',
      'Doblar los codos: se convierte en extensión de tríceps.',
    ],
  },
  face_pull: {
    name: 'Face pull en polea media', alt: 'con cuerda', muscle: 'Deltoide posterior',
    cue: 'Polea a la altura de la cara; pausa de un segundo.',
    how: [
      'Polea ajustable a la altura de la cara con cuerda; toma un extremo en cada mano y da un paso atrás.',
      'Jala la cuerda hacia la frente abriendo los codos hacia los lados y arriba; pausa y regresa.',
      'Jalar hacia el pecho o echarte hacia atrás.',
    ],
  },

  // ---- hombros
  press_hombro: {
    name: 'Press de hombro sentado', alt: 'en máquina o con mancuernas', muscle: 'Deltoides',
    cue: 'Solo si no causa dolor; no fuerces el rango.',
    how: [
      'Sentado con la espalda apoyada; agarres o mancuernas a la altura de los hombros.',
      'Empuja hacia arriba sin bloquear los codos y baja hasta que las manos queden a la altura de las orejas.',
      'Arquear la espalda baja para empujar más peso.',
    ],
  },
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
    name: 'Elevación lateral en polea baja', alt: 'un brazo a la vez', muscle: 'Deltoide lateral',
    cue: 'Empieza con la mano cruzada frente a la cadera; sube hasta el hombro.',
    how: [
      'Polea ajustable abajo, agarre de mano. Párate de lado y toma el agarre con la mano lejana, cruzando frente al cuerpo.',
      'Sube el brazo hacia el costado hasta la altura del hombro, codo un poco flexionado; baja controlado hasta cruzar otra vez.',
      'Subir con impulso del cuerpo o encoger el trapecio.',
    ],
  },
  pajaro_polea: {
    name: 'Pájaro en polea media', alt: 'cruzado, o un brazo a la vez', muscle: 'Deltoide posterior',
    cue: 'Brazos casi rectos; abre hacia atrás sin encoger los hombros.',
    how: [
      'Polea a la altura del hombro con agarre de mano (o solo el cable). Con dos poleas, toma cada cable con la mano contraria.',
      'Abre los brazos hacia los lados y atrás hasta quedar en línea con los hombros; regresa despacio cruzando frente al pecho.',
      'Jalar con los codos doblados o echar el torso hacia atrás.',
    ],
  },

  // ---- brazos
  ext_triceps: {
    name: 'Tríceps con cuerda en polea alta', muscle: 'Tríceps',
    cue: 'Codos pegados al torso.',
    how: [
      'De frente a la polea alta con cuerda, codos pegados a los costados.',
      'Empuja hacia abajo hasta estirar los brazos y separa un poco la cuerda al final; sube hasta que el antebrazo quede horizontal.',
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
  press_frances: {
    name: 'Press francés con barra', alt: 'barra Z si hay', muscle: 'Tríceps',
    cue: 'Solo se mueven los codos; baja la barra detrás de la frente.',
    how: [
      'Acostado en banco plano, barra arriba con los brazos estirados y un poco inclinados hacia la cabeza.',
      'Dobla los codos y baja la barra hacia atrás de la frente; estira de vuelta sin mover los hombros.',
      'Abrir los codos hacia los lados o bajar la barra a la cara.',
    ],
  },
  curl_barra: {
    name: 'Curl con barra', muscle: 'Bíceps',
    cue: 'Codos quietos; baja lentamente.',
    how: [
      'De pie, barra con agarre al ancho de los hombros y palmas al frente, codos pegados al cuerpo.',
      'Sube doblando solo los codos hasta la altura del pecho; baja en 2–3 segundos hasta estirar.',
      'Balancear la cadera o adelantar los codos.',
    ],
  },
  curl_cuerda: {
    ill: 'curl_polea',
    name: 'Curl martillo con cuerda', alt: 'polea baja', muscle: 'Bíceps · antebrazo',
    cue: 'Muñecas neutras y movimiento controlado.',
    how: [
      'De frente a la polea baja con cuerda, palmas enfrentadas y codos pegados.',
      'Sube sin girar las muñecas hasta el pecho y baja despacio.',
      'Usar impulso o despegar los codos del cuerpo.',
    ],
  },
  curl_polea: {
    name: 'Curl en polea baja', alt: 'barra recta', muscle: 'Bíceps',
    cue: 'Codos quietos; aprieta arriba un segundo.',
    how: [
      'De frente a la polea baja (estación de remo o polea ajustable abajo) con barra corta, codos pegados.',
      'Sube doblando solo el codo hasta el pecho; baja controlado hasta estirar el brazo.',
      'Inclinarte hacia atrás para subir más peso.',
    ],
  },
  curl_inclinado: {
    name: 'Curl inclinado con mancuernas', muscle: 'Bíceps',
    cue: 'Baja lentamente para controlar la repetición.',
    how: [
      'Banco a unos 45°, espalda apoyada y los brazos colgando detrás de la línea del cuerpo.',
      'Sube las mancuernas sin adelantar los codos y baja hasta estirar por completo.',
      'Despegar la espalda del banco o recortar la bajada.',
    ],
  },

  // ---- pierna
  prensa: {
    name: 'Prensa de pierna', muscle: 'Cuádriceps · glúteo',
    cue: 'Baja hasta 90° de rodilla sin despegar la cadera.',
    how: [
      'Espalda y cadera pegadas al respaldo, pies en la plataforma al ancho de los hombros.',
      'Quita los seguros, baja la plataforma doblando las rodillas hasta unos 90° y empuja con todo el pie.',
      'Bloquear las rodillas arriba o que la cadera se despegue del asiento abajo.',
    ],
  },
  rdl_barra: {
    name: 'Peso muerto rumano con barra', muscle: 'Isquios · glúteo',
    cue: 'Lleva la cadera atrás y mantén la espalda neutra.',
    how: [
      'De pie con la barra frente a los muslos, pies al ancho de la cadera y rodillas un poco flexionadas.',
      'Lleva la cadera hacia atrás bajando la barra pegada a las piernas hasta media espinilla; sube apretando el glúteo.',
      'Redondear la espalda o bajar doblando las rodillas como sentadilla.',
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
    name: 'Crunch en polea alta', alt: 'con cuerda', muscle: 'Abdomen',
    cue: 'Flexiona el tronco; no tires del cuello.',
    how: [
      'De rodillas frente a la polea alta, cuerda a los lados de la cabeza.',
      'Enrolla el tronco llevando los codos hacia los muslos; la cadera no se mueve. Sube despacio.',
      'Sentarte sobre los talones y jalar con los brazos.',
    ],
  },
  elev_piernas: {
    load: 'none', name: 'Elevación de rodillas', alt: 'colgado o en paralelas', muscle: 'Abdomen bajo',
    cue: 'Evita balancearte; elige la variante controlable.',
    how: [
      'Cuélgate de una barra o apóyate en las paralelas con los brazos estirados, cuerpo quieto.',
      'Sube las rodillas hacia el pecho enrollando la pelvis y baja despacio.',
      'Columpiarte para subir las piernas.',
    ],
  },

  // ---- cardio
  escaladora: {
    name: 'Escaladora', muscle: 'Cardio',
    cue: 'Ritmo moderado: debes poder hablar en frases cortas. Sin colgarte de los barandales.',
    how: [],
  },
  bici: {
    name: 'Bicicleta', muscle: 'Cardio',
    cue: 'Debes poder hablar en frases cortas.',
    how: [],
  },
};

const DAYS = [
  {
    title: 'Empuje', focus: 'Pecho superior · hombro lateral · tríceps',
    items: [
      { ex: 'press_inclinado_barra', sets: 3, reps: [6, 10], rest: '2–3 min', restSec: 150, isNew: true },
      { ex: 'press_maquina', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'apertura_baja', sets: 3, reps: [12, 15], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'lat_polea', sets: 3, reps: [12, 15], perSide: true, rest: '60 s', restSec: 60, extra: true },
      { ex: 'ext_triceps', sets: 3, reps: [10, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'ext_sobre_cabeza', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75 },
    ],
    cardio: { ex: 'escaladora', text: '15–20 min moderados al terminar', short: 'Escaladora 15–20' },
  },
  {
    title: 'Jalón', focus: 'Espalda en V · bíceps',
    items: [
      { ex: 'jalon', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, extra: true },
      { ex: 'remo_barra', sets: 3, reps: [6, 10], rest: '2–3 min', restSec: 150, isNew: true },
      { ex: 'remo_sentado', sets: 3, reps: [10, 12], rest: '2 min', restSec: 120, extra: true },
      { ex: 'pullover_polea', sets: 2, reps: [12, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'face_pull', sets: 2, reps: [15, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'curl_barra', sets: 3, reps: [8, 12], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'curl_cuerda', sets: 2, reps: [10, 15], rest: '60–90 s', restSec: 75, isNew: true },
    ],
    cardio: { ex: 'escaladora', text: '15–20 min moderados al terminar', short: 'Escaladora 15–20' },
  },
  {
    title: 'Pierna + abdomen', focus: 'Cuádriceps · femoral · pantorrilla · core',
    items: [
      { ex: 'prensa', sets: 3, reps: [10, 12], rest: '2 min', restSec: 120 },
      { ex: 'rdl_barra', sets: 3, reps: [8, 10], rest: '2 min', restSec: 120, isNew: true },
      { ex: 'curl_femoral', sets: 3, reps: [10, 15], rest: '90 s', restSec: 90 },
      { ex: 'ext_cuadriceps', sets: 2, reps: [12, 15], rest: '90 s', restSec: 90 },
      { ex: 'talones', sets: 3, reps: [12, 20], rest: '60–90 s', restSec: 75 },
      { ex: 'crunch_polea', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
      { ex: 'elev_piernas', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
    ],
    cardio: { ex: 'bici', text: 'Opcional: 10–15 min suaves', short: 'Bici opcional' },
  },
  {
    title: 'Hombros + brazos', focus: 'Deltoides · bíceps · tríceps',
    items: [
      { ex: 'press_hombro', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'elev_laterales', sets: 4, reps: [12, 20], rest: '60–90 s', restSec: 75, extra: true, cue: 'Controla la bajada y evita balancearte.' },
      { ex: 'pajaro_polea', sets: 3, reps: [12, 20], rest: '60–90 s', restSec: 75, isNew: true },
      { ex: 'curl_polea', sets: 3, reps: [10, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'press_frances', sets: 3, reps: [10, 12], rest: '90 s', restSec: 90, isNew: true },
      { ex: 'curl_inclinado', sets: 2, reps: [10, 12], rest: '60–90 s', restSec: 75 },
    ],
    cardio: { ex: 'escaladora', text: '15–20 min moderados al terminar', short: 'Escaladora 15–20' },
  },
  {
    title: 'Torso en V', focus: 'Pecho · espalda · deltoides · abdomen',
    items: [
      { ex: 'press_inclinado', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, cue: 'Usa un peso controlable, sin rebotes.' },
      { ex: 'jalon_cerrado', sets: 3, reps: [10, 12], rest: '2 min', restSec: 120, extra: true, isNew: true },
      { ex: 'remo_polea_una', sets: 3, reps: [10, 12], perSide: true, rest: '90 s', restSec: 90, isNew: true },
      { ex: 'cruce_poleas', sets: 2, reps: [12, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'lat_polea', sets: 3, reps: [12, 15], perSide: true, rest: '60 s', restSec: 60, extra: true },
      { ex: 'face_pull', sets: 2, reps: [15, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'crunch_polea', sets: 2, reps: [12, 15], rest: '60 s', restSec: 60 },
    ],
    cardio: { ex: 'escaladora', text: '20 min moderados al terminar', short: 'Escaladora 20' },
  },
];

const RULES = {
  warmup: '5 min de cardio suave y 1–2 series ligeras del primer ejercicio. No cuentan como series efectivas.',
  execution: 'Usa un peso que puedas controlar y deja 1–3 repeticiones en reserva. Detén cualquier movimiento que cause dolor agudo.',
  firstWeeks: 'Prioriza la técnica y deja 2–3 repeticiones posibles al final de cada serie.',
  progression: 'Doble progresión: suma repeticiones con el mismo peso. Cuando completes el máximo del rango en todas las series con técnica limpia, sube el peso lo mínimo y vuelve al rango bajo.',
  cardio: 'Escaladora los días de torso; bici el día de pierna. En la escaladora no te cuelgues de los barandales.',
  steps: '8 000–10 000 pasos al día.',
  extra: 'Desde la semana 5, si te recuperas bien: +1 serie en espalda y elevaciones laterales.',
  measure: 'Pésate 3–4 mañanas por semana y compara el promedio. Cintura cada 2 semanas, fotos cada mes con la misma luz.',
};
