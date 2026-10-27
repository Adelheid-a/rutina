// Rutina basada en rutinagym.pdf ("Físico marcado"), adaptada al equipo del gimnasio:
// multiestación de poleas (jalón, remo bajo, polea ajustable), barras, bancos inclinados y máquinas de pierna.
// sets: número de series; reps: [mín, máx]; unit: 'reps' | 's' (segundos);
// load (en EXERCISES): 'none' = sin peso; por defecto kg.
// ill (en EXERCISES): reutiliza la ilustración de otro ejercicio.
// cue: técnica corta (en el ítem, la propia de ese día; si no hay, la del ejercicio).
// how: técnica completa
//   setup: preparación paso a paso; move: el movimiento paso a paso;
//   tempo: ritmo de la repetición; breath: respiración (si falta, se usa BREATH);
//   feel: dónde se debe sentir; errors: [error, corrección].
// rest: texto de descanso; restSec: segundos que corre el temporizador.
// kind: 'c' = ejercicio pesado (sube ~2.5 kg); g: grupos para el volumen semanal.
// load 'lastre' = peso corporal más peso extra opcional.
// pair: true → superserie con el ejercicio siguiente (sin descanso entre los dos).
// drop: true → drop set en la última serie desde la semana 3.

const BREATH = 'Suelta el aire en el esfuerzo y toma aire al regresar.';

const EXERCISES = {
  // ---- pecho
  press_inclinado_barra: {
    kind: 'c', g: ['pecho'],
    name: 'Press inclinado con barra', alt: 'banco a 30°, o en multipower', muscle: 'Pecho superior',
    cue: 'Baja la barra a la parte alta del pecho, con control.',
    how: {
      setup: [
        'Banco a unos 30°. Más inclinado trabaja más el hombro que el pecho.',
        'Acuéstate con los ojos justo debajo de la barra y los pies firmes en el suelo.',
        'Agarre un poco más ancho que los hombros, con las muñecas rectas sobre los antebrazos.',
        'Junta y baja los omóplatos antes de sacar la barra; mantenlos así toda la serie.',
      ],
      move: [
        'Saca la barra y colócala sobre la parte alta del pecho con los brazos estirados.',
        'Bájala hasta rozar el pecho justo debajo de la clavícula, con los codos en diagonal (unos 45–60° del torso).',
        'Empuja hacia arriba hasta casi estirar los brazos, sin despegar los omóplatos del banco.',
      ],
      tempo: '2–3 s bajando · empuje firme',
      breath: 'Toma aire arriba, aguántalo al bajar y suéltalo al pasar la parte difícil del empuje.',
      feel: 'Parte alta del pecho y frente del hombro. Si lo sientes sobre todo en el hombro, baja la inclinación.',
      errors: [
        ['Rebotar la barra en el pecho', 'Baja controlado y toca suave.'],
        ['Despegar la cadera del banco', 'Glúteos apoyados toda la serie.'],
        ['Abrir los codos a 90°', 'Codos en diagonal, un poco hacia el cuerpo.'],
        ['Entrenar sin seguros', 'Pon los seguros del rack a la altura del pecho o usa el multipower.'],
      ],
    },
  },
  press_inclinado: {
    kind: 'c', g: ['pecho'],
    name: 'Press inclinado con mancuernas', muscle: 'Pecho superior',
    cue: 'Si hay banco, inclinación de 20–35°. Baja con control.',
    how: {
      setup: [
        'Banco a 20–35°. Siéntate con las mancuernas apoyadas sobre los muslos.',
        'Recuéstate y súbelas con ayuda de las rodillas hasta la altura del pecho.',
        'Omóplatos juntos y abajo, pies firmes, palmas hacia los pies o un poco giradas hacia adentro.',
      ],
      move: [
        'Empuja las mancuernas hacia arriba y un poco hacia el centro hasta casi estirar los brazos.',
        'Baja despacio hasta que queden a los lados del pecho y sientas el estiramiento.',
        'Al terminar, lleva las mancuernas al pecho y siéntate subiendo las rodillas; no las sueltes de lado.',
      ],
      tempo: '2–3 s bajando · empuje firme',
      feel: 'Parte alta del pecho; el estiramiento abajo es parte del trabajo.',
      errors: [
        ['Chocar las mancuernas arriba', 'Detente cuando estén a un palmo de distancia.'],
        ['Codos a 90° del torso', 'Llévalos a unos 45°.'],
        ['Recortar la bajada', 'Baja hasta la altura del pecho en cada repetición.'],
      ],
    },
  },
  press_plano: {
    kind: 'c', g: ['pecho'],
    name: 'Press plano con mancuernas', muscle: 'Pecho',
    cue: 'Baja con control hasta sentir el estiramiento del pecho.',
    how: {
      setup: [
        'Banco plano. Siéntate en la punta con las mancuernas apoyadas sobre los muslos.',
        'Recuéstate y súbelas con ayuda de las rodillas hasta la altura del pecho.',
        'Omóplatos juntos y abajo, pies firmes en el suelo.',
      ],
      move: [
        'Empuja las mancuernas hacia arriba hasta casi estirar los brazos, sobre la mitad del pecho.',
        'Baja despacio hasta que queden a los lados del pecho, con los codos a unos 45° del torso.',
        'Al terminar, lleva las mancuernas al pecho y siéntate subiendo las rodillas; no las sueltes de lado.',
      ],
      tempo: '2–3 s bajando · empuje firme',
      feel: 'Pecho y tríceps; el estiramiento abajo es parte del trabajo.',
      errors: [
        ['Chocar las mancuernas arriba', 'Detente cuando estén a un palmo de distancia.'],
        ['Abrir los codos a 90°', 'Llévalos a unos 45°.'],
        ['Despegar la cadera o los omóplatos', 'Glúteos y espalda alta apoyados en el banco.'],
      ],
    },
  },
  apertura_baja: {
    name: 'Apertura en polea baja', alt: 'cruce de poleas, de abajo hacia arriba', muscle: 'Pecho superior', g: ['pecho'],
    cue: 'Sube en arco hasta juntar las manos a la altura del pecho; codos fijos.',
    how: {
      setup: [
        'Las dos poleas del cruce en la posición más baja, con agarre de mano.',
        'Toma un agarre en cada mano y da un paso al frente, al centro, con un pie adelante para quedar firme.',
        'Pecho arriba, hombros abajo y codos un poco flexionados.',
      ],
      move: [
        'Empieza con las manos abajo y a los lados, un poco detrás de la cadera, palmas al frente.',
        'Sube las dos manos en arco hacia el centro hasta juntarlas a la altura de la clavícula.',
        'Aprieta el pecho un segundo con las manos juntas.',
        'Regresa por el mismo arco hasta sentir el estiramiento.',
      ],
      tempo: '1 s subiendo · 1 s arriba · 2 s bajando',
      feel: 'Parte alta del pecho, cerca de la clavícula.',
      errors: [
        ['Doblar y estirar los codos', 'El ángulo del codo no cambia; si cambia, se vuelve un press.'],
        ['Subir por encima de la cara', 'Detente a la altura de la clavícula.'],
        ['Echar el cuerpo hacia atrás', 'Torso quieto; solo se mueven los brazos.'],
      ],
    },
  },
  cruce_poleas: {
    g: ['pecho'],
    name: 'Apertura en polea media', alt: 'un brazo a la vez', muscle: 'Pecho',
    cue: 'Codo fijo y algo flexionado; lleva la mano al centro del pecho.',
    how: {
      setup: [
        'Polea a la altura del pecho, con agarre de mano.',
        'Párate de lado a la polea, toma el agarre con la mano más cercana y da un paso hacia afuera con un pie adelante.',
        'Codo ligeramente flexionado y fijo; la otra mano en la cintura.',
      ],
      move: [
        'Empieza con el brazo abierto hacia la polea, a la altura del hombro, sintiendo el estiramiento del pecho.',
        'Lleva la mano en arco hasta quedar frente al centro del pecho.',
        'Aprieta un segundo y abre despacio hasta volver al estiramiento.',
        'Termina todas las repeticiones y cambia de lado.',
      ],
      tempo: '1 s cerrando · 1 s pausa · 2 s abriendo',
      feel: 'Centro y parte media del pecho.',
      errors: [
        ['Doblar y estirar el codo', 'El brazo es un arco fijo.'],
        ['Girar el torso para ayudarte', 'Pecho al frente; solo se mueve el brazo.'],
        ['Abrir de golpe', 'La vuelta dura el doble que la ida.'],
      ],
    },
  },
  fondos: {
    load: 'lastre', kind: 'c', g: ['pecho', 'triceps'],
    name: 'Fondos en paralelas', alt: 'con peso extra cuando pases de 12', muscle: 'Pecho · tríceps',
    cue: 'Inclínate un poco al frente y baja hasta que el brazo quede paralelo al suelo.',
    how: {
      setup: [
        'Toma las paralelas con las palmas enfrentadas y súbete con los brazos estirados.',
        'Hombros abajo, lejos de las orejas; dobla las rodillas y cruza los pies.',
        'Inclina el torso un poco al frente: así trabaja más el pecho.',
      ],
      move: [
        'Baja doblando los codos, que van hacia atrás y un poco abiertos.',
        'Detente cuando el brazo quede paralelo al suelo o sientas el estiramiento en el pecho.',
        'Empuja hasta estirar los brazos sin trabar los codos.',
      ],
      tempo: '2 s bajando · empuje firme',
      feel: 'Parte baja del pecho y parte de atrás del brazo.',
      errors: [
        ['Bajar de más', 'Si te molesta el hombro, recorta el rango hasta donde sea cómodo.'],
        ['Encoger los hombros', 'Empuja las paralelas hacia abajo y mantén el cuello largo.'],
        ['Columpiar las piernas', 'Cuerpo quieto; la fuerza sale de los brazos.'],
      ],
    },
  },

  // ---- espalda
  jalon: {
    kind: 'c', g: ['espalda'],
    name: 'Jalón al pecho', alt: 'barra larga, agarre ancho', muscle: 'Dorsal ancho',
    cue: 'Lleva la barra al pecho; nunca detrás del cuello.',
    how: {
      setup: [
        'Ajusta el rodillo para que los muslos queden firmes debajo.',
        'Toma la barra larga un poco más ancho que los hombros, palmas al frente.',
        'Siéntate con el pecho arriba y el torso apenas inclinado hacia atrás.',
      ],
      move: [
        'Empieza con los brazos estirados y deja que los hombros suban para estirar la espalda.',
        'Baja primero los hombros y luego jala llevando los codos hacia abajo y hacia los costados.',
        'Lleva la barra a la parte alta del pecho y sube despacio hasta estirar los brazos por completo.',
      ],
      tempo: '1 s jalando · 2–3 s subiendo',
      feel: 'Costados de la espalda, debajo de las axilas. Si lo sientes sobre todo en los brazos, piensa en jalar con los codos.',
      errors: [
        ['Echarte muy atrás para jalar', 'Torso casi quieto, solo una leve inclinación.'],
        ['Llevar la barra detrás del cuello', 'Siempre al frente, hacia el pecho.'],
        ['Subir a medias', 'Estira los brazos arriba en cada repetición.'],
      ],
    },
  },
  jalon_cerrado: {
    kind: 'c', g: ['espalda'],
    ill: 'jalon',
    name: 'Jalón agarre cerrado', alt: 'agarre en V o palmas enfrentadas', muscle: 'Dorsal ancho',
    cue: 'Codos pegados al cuerpo; estira arriba por completo.',
    how: {
      setup: [
        'En la estación de jalón cambia la barra por el agarre en V (o toma la barra con las manos juntas).',
        'Muslos bajo el rodillo, pecho arriba y torso un poco inclinado hacia atrás.',
      ],
      move: [
        'Empieza con los brazos estirados y los hombros arriba para estirar la espalda.',
        'Jala llevando los codos pegados hacia las costillas hasta que el agarre llegue a la parte alta del pecho.',
        'Sube despacio hasta estirar por completo.',
      ],
      tempo: '1 s jalando · 2–3 s subiendo',
      feel: 'Parte baja y lateral de la espalda.',
      errors: [
        ['Subir a medias', 'El estiramiento de arriba es parte del ejercicio.'],
        ['Abrir los codos', 'Pegados al cuerpo, apuntando al suelo.'],
        ['Columpiar el torso', 'Si necesitas balancearte, baja el peso.'],
      ],
    },
  },
  remo_barra: {
    kind: 'c', g: ['espalda'],
    name: 'Remo con barra', muscle: 'Espalda media · dorsal',
    cue: 'Torso inclinado y quieto; lleva la barra al ombligo.',
    how: {
      setup: [
        'Toma la barra un poco más ancho que los hombros, palmas hacia ti.',
        'De pie, pies al ancho de la cadera y rodillas algo flexionadas.',
        'Lleva la cadera hacia atrás hasta dejar el torso a unos 45°, espalda recta y abdomen firme.',
      ],
      move: [
        'Deja la barra colgando con los brazos estirados, debajo de los hombros.',
        'Jálala hacia el ombligo llevando los codos atrás, cerca del cuerpo, y junta los omóplatos.',
        'Baja despacio hasta estirar los brazos sin cambiar la inclinación del torso.',
      ],
      tempo: '1 s jalando · 2 s bajando',
      breath: 'Abdomen firme toda la serie; suelta el aire al jalar.',
      feel: 'Parte media de la espalda y dorsales. La espalda baja trabaja para sostenerte, pero no debe doler.',
      errors: [
        ['Enderezarte para subir el peso', 'El torso se queda en el mismo ángulo.'],
        ['Redondear la espalda', 'Pecho arriba; si no puedes, baja el peso.'],
        ['Jalar hacia el pecho', 'La barra va al ombligo.'],
      ],
    },
  },
  remo_sentado: {
    kind: 'c', g: ['espalda'],
    name: 'Remo sentado en polea baja', alt: 'agarre en V', muscle: 'Espalda media',
    cue: 'No balancees el torso; guía el movimiento con los codos.',
    how: {
      setup: [
        'En la estación de remo bajo, pon el agarre en V.',
        'Siéntate con los pies en el apoyo y las rodillas un poco flexionadas.',
        'Toma el agarre y siéntate derecho: espalda recta y pecho arriba.',
      ],
      move: [
        'Empieza con los brazos estirados y deja que los hombros se vayan un poco al frente.',
        'Jala el agarre hacia el abdomen llevando los codos atrás y juntando los omóplatos.',
        'Regresa estirando los brazos despacio, sin que el torso se vaya hacia adelante.',
      ],
      tempo: '1 s jalando · 1 s pausa · 2 s regresando',
      feel: 'Centro de la espalda, entre los omóplatos.',
      errors: [
        ['Mecer el torso', 'El torso se queda vertical; se mueven brazos y omóplatos.'],
        ['Encoger los hombros', 'Hombros abajo al jalar.'],
        ['Soltar el peso al regresar', 'Controla la vuelta.'],
      ],
    },
  },
  remo_polea_una: {
    kind: 'c', g: ['espalda'],
    ill: 'remo_sentado',
    name: 'Remo a una mano en polea baja', muscle: 'Dorsal ancho',
    cue: 'Lleva el codo hacia la cadera; estira por completo al regresar.',
    how: {
      setup: [
        'En la estación de remo bajo, pon el agarre de una mano.',
        'Siéntate derecho con los pies en el apoyo; el brazo libre descansa sobre el muslo.',
      ],
      move: [
        'Empieza con el brazo estirado y deja que el hombro se vaya al frente para estirar la espalda.',
        'Jala llevando el codo pegado al cuerpo hacia la cadera, no hacia el techo.',
        'Regresa despacio hasta estirar el brazo por completo.',
        'Haz todas las repeticiones de un lado y luego cambia.',
      ],
      tempo: '1 s jalando · 2 s regresando',
      feel: 'Costado de la espalda del lado que jala, de la axila a la cintura.',
      errors: [
        ['Girar el torso para mover más', 'Pecho al frente; solo se mueve el brazo.'],
        ['Jalar hacia el pecho', 'El codo va hacia la cadera.'],
        ['Recortar la vuelta', 'Estira brazo y hombro en cada repetición.'],
      ],
    },
  },
  pullover_polea: {
    g: ['espalda'],
    name: 'Pullover en polea alta', alt: 'brazos rectos, barra o cuerda', muscle: 'Dorsal ancho',
    cue: 'Brazos casi rectos; el movimiento sale del hombro.',
    how: {
      setup: [
        'Polea alta (estación de jalón o polea ajustable arriba) con barra recta o cuerda.',
        'Da uno o dos pasos atrás, pies al ancho de la cadera y rodillas suaves.',
        'Inclina el torso al frente unos 30° con la espalda recta y los brazos casi rectos.',
      ],
      move: [
        'Empieza con los brazos arriba, a la altura de la cabeza, sintiendo el estiramiento en los costados.',
        'Baja el agarre en arco hasta los muslos sin doblar los codos.',
        'Aprieta un segundo y sube despacio por el mismo arco.',
      ],
      tempo: '1 s bajando · 1 s pausa · 2 s subiendo',
      feel: 'Costados de la espalda.',
      errors: [
        ['Doblar los codos', 'Si se doblan, trabaja el tríceps en lugar de la espalda.'],
        ['Mover el torso para ayudarte', 'El torso se queda quieto.'],
        ['Subir solo hasta la mitad', 'Sube hasta la altura de la cabeza.'],
      ],
    },
  },
  face_pull: {
    g: ['posterior'],
    name: 'Face pull en polea media', alt: 'con cuerda', muscle: 'Deltoide posterior',
    cue: 'Polea a la altura de la cara; pausa de un segundo.',
    how: {
      setup: [
        'Polea ajustable a la altura de la cara, con cuerda.',
        'Toma un extremo en cada mano y da un paso atrás.',
        'Pies al ancho de la cadera o uno adelante, torso derecho.',
      ],
      move: [
        'Jala la cuerda hacia la frente separando las manos.',
        'Lleva los codos hacia los lados y arriba, a la altura de los hombros.',
        'Pausa un segundo y regresa despacio.',
      ],
      tempo: '1 s jalando · 1 s pausa · 2 s regresando',
      feel: 'Parte de atrás del hombro y entre los omóplatos.',
      errors: [
        ['Jalar hacia el pecho', 'La cuerda va hacia la frente.'],
        ['Echarte hacia atrás', 'Usa un peso que muevas sin balancearte.'],
        ['Bajar los codos', 'Codos a la altura de los hombros.'],
      ],
    },
  },

  // ---- hombros
  press_hombro: {
    kind: 'c', g: ['frontal'],
    name: 'Press de hombro sentado', alt: 'en máquina o con mancuernas', muscle: 'Deltoides',
    cue: 'Solo si no causa dolor; no fuerces el rango.',
    how: {
      setup: [
        'En máquina, ajusta el asiento para que los agarres queden a la altura de los hombros. Con mancuernas, banco casi vertical.',
        'Espalda apoyada y pies firmes en el suelo.',
        'Antebrazos verticales, codos un poco al frente del cuerpo.',
      ],
      move: [
        'Empuja hacia arriba hasta casi estirar los brazos, sin bloquear los codos.',
        'Baja despacio hasta que las manos queden a la altura de las orejas o un poco más abajo.',
      ],
      tempo: 'Empuje firme · 2 s bajando',
      feel: 'Frente y lado del hombro.',
      errors: [
        ['Arquear la espalda baja', 'Glúteos y espalda pegados al respaldo.'],
        ['Forzar el rango', 'Baja solo hasta donde no duela.'],
        ['Bloquear los codos arriba', 'Deja una pequeña flexión.'],
      ],
    },
  },
  elev_laterales: {
    g: ['lateral'],
    name: 'Elevaciones laterales', alt: 'con mancuernas', muscle: 'Deltoide lateral',
    cue: 'Codos algo flexionados; evita balancearte.',
    how: {
      setup: [
        'De pie, pies al ancho de la cadera, una mancuerna en cada mano a los costados.',
        'Codos un poco flexionados y torso ligeramente inclinado al frente.',
      ],
      move: [
        'Sube los brazos hacia los lados guiando con los codos, hasta la altura de los hombros.',
        'Las manos no suben más que los codos.',
        'Baja despacio hasta casi tocar los muslos.',
      ],
      tempo: '1 s subiendo · 2–3 s bajando',
      feel: 'Parte lateral del hombro. Si se cansa más el cuello, baja el peso.',
      errors: [
        ['Balancearte para subir', 'Peso más ligero y cuerpo quieto.'],
        ['Subir por encima de los hombros', 'Detente a la altura del hombro.'],
        ['Encoger el cuello', 'Hombros abajo, lejos de las orejas.'],
      ],
    },
  },
  lat_polea: {
    g: ['lateral'],
    name: 'Elevación lateral en polea baja', alt: 'un brazo a la vez', muscle: 'Deltoide lateral',
    cue: 'Empieza con la mano cruzada frente a la cadera; sube hasta el hombro.',
    how: {
      setup: [
        'Polea ajustable en la posición más baja, con agarre de mano.',
        'Párate de lado a la polea y toma el agarre con la mano más lejana; el cable cruza frente a tu cadera.',
        'Con la otra mano sostente de la torre para que el torso no se mueva.',
      ],
      move: [
        'Empieza con la mano frente a la cadera contraria.',
        'Sube el brazo hacia el costado, codo un poco flexionado, hasta la altura del hombro.',
        'Baja despacio hasta volver a cruzar frente al cuerpo.',
        'Termina todas las repeticiones y cambia de lado.',
      ],
      tempo: '1 s subiendo · 2–3 s bajando',
      feel: 'Parte lateral del hombro, también al inicio del recorrido.',
      errors: [
        ['Inclinarte para ayudarte', 'Sostente de la torre y quédate vertical.'],
        ['Encoger el trapecio', 'Hombro abajo.'],
        ['Usar mucho peso', 'Funciona con poco peso y control.'],
      ],
    },
  },
  pajaro_polea: {
    g: ['posterior'],
    name: 'Pájaro en polea media', alt: 'un brazo a la vez', muscle: 'Deltoide posterior',
    cue: 'Brazo casi recto; abre hacia atrás sin encoger el hombro.',
    how: {
      setup: [
        'Polea a la altura del hombro, con agarre de mano o tomando solo el cable.',
        'Párate de lado a la polea y toma el agarre con la mano más lejana; el cable cruza frente a tu pecho.',
        'Brazo al frente a la altura del hombro, codo un poco flexionado; la otra mano en la cintura.',
      ],
      move: [
        'Abre el brazo hacia el costado y atrás hasta que quede en línea con los hombros.',
        'Pausa un segundo.',
        'Regresa despacio hasta que la mano cruce frente al pecho.',
        'Termina todas las repeticiones y cambia de lado.',
      ],
      tempo: '1 s abriendo · 1 s pausa · 2 s cerrando',
      feel: 'Parte de atrás del hombro.',
      errors: [
        ['Jalar doblando el codo', 'Brazo casi recto todo el tiempo.'],
        ['Girar el torso', 'Pecho al frente; solo se mueve el brazo.'],
        ['Encoger los hombros', 'Hombros abajo, cuello largo.'],
      ],
    },
  },

  // ---- brazos
  ext_triceps: {
    g: ['triceps'],
    name: 'Tríceps con cuerda en polea alta', muscle: 'Tríceps',
    cue: 'Codos pegados al torso.',
    how: {
      setup: [
        'Polea alta con cuerda.',
        'De frente a la polea, pies al ancho de la cadera y el torso un poco inclinado al frente.',
        'Codos pegados a los costados.',
      ],
      move: [
        'Empieza con los antebrazos horizontales.',
        'Empuja hacia abajo hasta estirar los brazos y separa los extremos de la cuerda al final.',
        'Aprieta un segundo y sube despacio sin mover los codos.',
      ],
      tempo: '1 s empujando · 1 s pausa · 2 s subiendo',
      feel: 'Parte de atrás del brazo.',
      errors: [
        ['Que los codos se muevan', 'Codos fijos a los costados.'],
        ['Usar el peso del cuerpo', 'Si te recargas sobre la cuerda, baja el peso.'],
        ['Subir las manos hasta la cara', 'Para cuando el antebrazo quede horizontal.'],
      ],
    },
  },
  ext_sobre_cabeza: {
    short: 'Tríceps sobre cabeza',
    g: ['triceps'],
    name: 'Extensión de tríceps sobre la cabeza', alt: 'en polea con cuerda', muscle: 'Tríceps',
    cue: 'Codos apuntando al frente y quietos; estira por completo.',
    how: {
      setup: [
        'Polea a la altura de la cadera o un poco más abajo, con cuerda.',
        'Toma la cuerda, gira de espaldas a la polea y llévala detrás de la cabeza.',
        'Da un paso al frente con un pie adelante y el torso un poco inclinado; codos al frente, junto a la cabeza.',
      ],
      move: [
        'Empieza con los codos doblados y las manos detrás de la cabeza, sintiendo el estiramiento.',
        'Estira los brazos hacia el frente y arriba sin mover los codos.',
        'Regresa despacio doblando solo los codos hasta el estiramiento completo.',
      ],
      tempo: '1 s estirando · 2–3 s regresando',
      feel: 'Parte de atrás del brazo, sobre todo cerca del hombro.',
      errors: [
        ['Abrir los codos hacia los lados', 'Codos al frente, al ancho de los hombros.'],
        ['Arquear la espalda baja', 'Abdomen firme y un pie adelante.'],
        ['Recortar el regreso', 'El estiramiento atrás es lo que hace funcionar este ejercicio.'],
      ],
    },
  },
  press_frances: {
    g: ['triceps'],
    name: 'Press francés con barra', alt: 'barra Z si hay', muscle: 'Tríceps',
    cue: 'Solo se mueven los codos; baja la barra detrás de la frente.',
    how: {
      setup: [
        'Acostado en banco plano con la barra (barra Z si hay), agarre al ancho de los hombros.',
        'Brazos estirados sobre el pecho y luego un poco inclinados hacia la cabeza.',
        'Pies firmes en el suelo.',
      ],
      move: [
        'Dobla solo los codos y baja la barra hacia atrás de la frente.',
        'Cuando sientas el estiramiento en la parte de atrás del brazo, estira de vuelta.',
        'Los brazos no cambian de ángulo; solo se mueven los antebrazos.',
      ],
      tempo: '2–3 s bajando · 1 s subiendo',
      feel: 'Parte de atrás del brazo.',
      errors: [
        ['Abrir los codos', 'Codos al ancho de los hombros, apuntando atrás.'],
        ['Bajar la barra hacia la cara', 'Hacia atrás de la frente.'],
        ['Dolor en los codos', 'Baja el peso y quédate en la parte alta del rango de repeticiones.'],
      ],
    },
  },
  curl_barra: {
    g: ['biceps'],
    name: 'Curl con barra', muscle: 'Bíceps',
    cue: 'Codos quietos; baja lentamente.',
    how: {
      setup: [
        'De pie, pies al ancho de la cadera.',
        'Barra con agarre al ancho de los hombros, palmas al frente.',
        'Codos pegados a los costados y hombros atrás.',
      ],
      move: [
        'Sube la barra doblando solo los codos hasta la altura del pecho.',
        'Aprieta un segundo arriba.',
        'Baja en 2–3 segundos hasta estirar los brazos por completo.',
      ],
      tempo: '1 s subiendo · 2–3 s bajando',
      feel: 'Frente del brazo.',
      errors: [
        ['Balancear la cadera', 'Rodillas suaves y abdomen firme; si te balanceas, baja el peso.'],
        ['Adelantar los codos', 'Se quedan a los costados.'],
        ['No estirar abajo', 'Estira por completo en cada repetición.'],
      ],
    },
  },
  curl_cuerda: {
    g: ['biceps'],
    ill: 'curl_polea',
    name: 'Curl martillo con cuerda', alt: 'polea baja', muscle: 'Bíceps · antebrazo',
    cue: 'Muñecas neutras y movimiento controlado.',
    how: {
      setup: [
        'Polea baja con cuerda.',
        'De frente a la polea, un paso atrás, palmas enfrentadas.',
        'Codos pegados a los costados.',
      ],
      move: [
        'Sube la cuerda doblando solo los codos hasta la altura del pecho, sin girar las muñecas.',
        'Pausa un segundo arriba.',
        'Baja despacio hasta estirar.',
      ],
      tempo: '1 s subiendo · 1 s pausa · 2 s bajando',
      feel: 'Frente del brazo y parte de arriba del antebrazo.',
      errors: [
        ['Usar impulso', 'Cuerpo quieto.'],
        ['Despegar los codos', 'Codos a los costados.'],
        ['Doblar las muñecas', 'Muñecas rectas, en línea con el antebrazo.'],
      ],
    },
  },
  curl_polea: {
    short: 'Curl en polea',
    g: ['biceps'],
    name: 'Curl en polea baja', alt: 'barra recta', muscle: 'Bíceps',
    cue: 'Codos quietos; aprieta arriba un segundo.',
    how: {
      setup: [
        'Polea baja (estación de remo o polea ajustable abajo) con barra corta.',
        'De frente a la polea, un paso atrás para que el cable tenga tensión abajo.',
        'Agarre al ancho de los hombros, palmas arriba y codos pegados.',
      ],
      move: [
        'Sube doblando solo los codos hasta la altura del pecho.',
        'Aprieta un segundo arriba.',
        'Baja controlado hasta estirar los brazos.',
      ],
      tempo: '1 s subiendo · 1 s pausa · 2–3 s bajando',
      feel: 'Frente del brazo.',
      errors: [
        ['Inclinarte hacia atrás', 'Torso quieto; si no puedes, baja el peso.'],
        ['Adelantar los codos', 'Fijos a los costados.'],
        ['Soltar la bajada', 'Bájala en 2–3 segundos.'],
      ],
    },
  },
  curl_inclinado: {
    short: 'Curl inclinado',
    g: ['biceps'],
    name: 'Curl inclinado con mancuernas', muscle: 'Bíceps',
    cue: 'Baja lentamente para controlar la repetición.',
    how: {
      setup: [
        'Banco a unos 45°.',
        'Siéntate con la espalda y la cabeza apoyadas y una mancuerna en cada mano.',
        'Deja colgar los brazos estirados por detrás de la línea del cuerpo, palmas al frente.',
      ],
      move: [
        'Sube las mancuernas doblando solo los codos, sin adelantarlos.',
        'Aprieta un segundo arriba.',
        'Baja despacio hasta estirar el brazo por completo.',
      ],
      tempo: '1 s subiendo · 3 s bajando',
      feel: 'Frente del brazo, con un estiramiento fuerte abajo.',
      errors: [
        ['Despegar la espalda del banco', 'Espalda y hombros apoyados.'],
        ['Adelantar los codos al subir', 'Los codos apuntan al suelo.'],
        ['Recortar la bajada', 'Estira por completo.'],
      ],
    },
  },
  curl_predicador: {
    g: ['biceps'],
    name: 'Curl predicador', alt: 'barra Z o recta, en banco predicador', muscle: 'Bíceps',
    cue: 'Brazo pegado al cojín; baja hasta casi estirar, sin rebotar.',
    how: {
      setup: [
        'Ajusta el asiento para que la axila quede justo en el borde de arriba del cojín.',
        'Apoya la parte de atrás de los brazos en el cojín y toma la barra con las palmas hacia arriba, al ancho de los hombros.',
        'Pecho pegado al banco y pies firmes.',
      ],
      move: [
        'Sube la barra doblando solo los codos hasta que los antebrazos queden casi verticales.',
        'Aprieta un segundo arriba.',
        'Baja despacio hasta casi estirar el brazo; frena antes del final para no golpear el codo.',
      ],
      tempo: '1 s subiendo · 1 s arriba · 3 s bajando',
      feel: 'Frente del brazo, sobre todo la parte cercana al codo.',
      errors: [
        ['Despegar los brazos del cojín', 'Los codos se quedan apoyados toda la serie.'],
        ['Soltar la barra abajo', 'Controla el último tramo; ahí es donde el codo se lastima.'],
        ['Levantar la cadera del asiento', 'Baja el peso si necesitas impulso.'],
      ],
    },
  },

  // ---- pierna
  prensa: {
    kind: 'c', g: ['pierna'],
    name: 'Prensa de pierna', muscle: 'Cuádriceps · glúteo',
    cue: 'Baja hasta 90° de rodilla sin despegar la cadera.',
    how: {
      setup: [
        'Espalda y cadera pegadas al respaldo.',
        'Pies en el centro de la plataforma, al ancho de los hombros, puntas un poco hacia afuera.',
        'Empuja la plataforma y quita los seguros.',
      ],
      move: [
        'Baja la plataforma doblando las rodillas hasta unos 90°, con las rodillas en la dirección de las puntas.',
        'Empuja con todo el pie, sobre todo talón y media planta, hasta casi estirar las piernas.',
        'Al terminar, pon los seguros antes de soltar.',
      ],
      tempo: '2–3 s bajando · empuje firme',
      feel: 'Frente del muslo y glúteos.',
      errors: [
        ['Bloquear las rodillas arriba', 'Deja una pequeña flexión.'],
        ['Que la cadera se despegue abajo', 'Baja solo hasta donde la cadera siga pegada.'],
        ['Rodillas hacia adentro', 'Siguen la línea de las puntas.'],
      ],
    },
  },
  rdl_barra: {
    kind: 'c', g: ['pierna'],
    name: 'Peso muerto rumano con barra', muscle: 'Isquios · glúteo',
    cue: 'Lleva la cadera atrás y mantén la espalda neutra.',
    how: {
      setup: [
        'Barra en el rack a media altura del muslo; tómala al ancho de los hombros, palmas hacia ti.',
        'De pie, pies al ancho de la cadera y rodillas un poco flexionadas.',
        'Pecho arriba, omóplatos atrás y abdomen firme.',
      ],
      move: [
        'Lleva la cadera hacia atrás, como si cerraras una puerta con los glúteos, con la barra pegada a los muslos.',
        'Baja hasta sentir el estiramiento atrás de las piernas, normalmente entre las rodillas y media espinilla.',
        'Sube empujando la cadera al frente y apretando los glúteos.',
      ],
      tempo: '2–3 s bajando · 1 s subiendo',
      breath: 'Toma aire y aprieta el abdomen antes de bajar; suéltalo arriba.',
      feel: 'Parte de atrás del muslo y glúteos. Si lo sientes en la espalda baja, bajaste demasiado o se redondeó.',
      errors: [
        ['Redondear la espalda', 'Detente donde la espalda siga recta.'],
        ['Bajar doblando las rodillas', 'Las rodillas casi no cambian; se mueve la cadera.'],
        ['Separar la barra de las piernas', 'Pegada a los muslos todo el recorrido.'],
      ],
    },
  },
  ext_cuadriceps: {
    g: ['pierna'],
    name: 'Extensión de cuádriceps', muscle: 'Cuádriceps',
    cue: 'Pausa arriba con la pierna estirada; baja lento.',
    how: {
      setup: [
        'Ajusta el respaldo para que la rodilla quede alineada con el eje de la máquina.',
        'Rodillo sobre la parte baja de la espinilla, arriba del tobillo.',
        'Agárrate de las manijas del asiento.',
      ],
      move: [
        'Estira las piernas por completo.',
        'Aprieta un segundo arriba.',
        'Baja en 2–3 segundos hasta que las rodillas queden un poco más dobladas que 90°.',
      ],
      tempo: '1 s subiendo · 1 s arriba · 2–3 s bajando',
      feel: 'Frente del muslo.',
      errors: [
        ['Dejar caer el peso', 'Controla la bajada.'],
        ['Despegar la cadera', 'Sostente de las manijas.'],
        ['Patear con impulso', 'Sube con control.'],
      ],
    },
  },
  curl_femoral: {
    g: ['pierna'],
    name: 'Curl femoral', alt: 'acostado o sentado', muscle: 'Isquiotibiales',
    cue: 'Cadera pegada al banco; sube y baja controlado.',
    how: {
      setup: [
        'Acostado: boca abajo con las rodillas justo fuera del borde del banco. Sentado: alinea la rodilla con el eje de la máquina.',
        'Rodillo justo arriba de los talones.',
        'Agárrate de las manijas.',
      ],
      move: [
        'Lleva los talones hacia los glúteos.',
        'Aprieta un segundo.',
        'Baja despacio hasta casi estirar las piernas.',
      ],
      tempo: '1 s subiendo · 1 s pausa · 2–3 s bajando',
      feel: 'Parte de atrás del muslo.',
      errors: [
        ['Levantar la cadera del banco', 'Cadera pegada; si se levanta, baja el peso.'],
        ['Soltar la bajada', 'La bajada dura el doble.'],
        ['Mover con impulso', 'Movimiento controlado.'],
      ],
    },
  },
  talones: {
    g: ['pierna'],
    name: 'Elevación de talones en máquina', muscle: 'Pantorrilla',
    cue: 'Pausa arriba y baja despacio.',
    how: {
      setup: [
        'Hombros debajo de las almohadillas.',
        'Punta de los pies en el borde de la plataforma, talones al aire.',
        'Rodillas estiradas sin bloquear.',
      ],
      move: [
        'Baja los talones hasta sentir el estiramiento en la pantorrilla y espera 1–2 s.',
        'Sube sobre las puntas lo más alto que puedas.',
        'Pausa arriba y vuelve a bajar despacio.',
      ],
      tempo: '1 s subiendo · 1 s arriba · 2 s bajando · 1–2 s abajo',
      feel: 'Pantorrilla.',
      errors: [
        ['Rebotar abajo', 'Pausa en el estiramiento.'],
        ['Doblar las rodillas para ayudarte', 'Rodillas quietas.'],
        ['Recortar el recorrido', 'Sube y baja por completo.'],
      ],
    },
  },

  // ---- abdomen
  crunch_polea: {
    g: ['abdomen'],
    name: 'Crunch en polea alta', alt: 'con cuerda', muscle: 'Abdomen',
    cue: 'Flexiona el tronco; no tires del cuello.',
    how: {
      setup: [
        'Polea alta con cuerda.',
        'Arrodíllate frente a la polea, toma la cuerda y lleva los extremos a los lados de la cabeza.',
        'Cadera alta, sin sentarte en los talones.',
      ],
      move: [
        'Enrolla el tronco llevando los codos hacia los muslos, como si quisieras juntar costillas y cadera.',
        'La cadera no se mueve; solo se dobla la columna.',
        'Sube despacio hasta estirar el abdomen.',
      ],
      tempo: '1 s bajando · 1 s pausa · 2 s subiendo',
      breath: 'Suelta todo el aire al enrollarte.',
      feel: 'Abdomen.',
      errors: [
        ['Sentarte sobre los talones', 'Cadera alta y quieta.'],
        ['Jalar con los brazos', 'Los brazos solo sostienen la cuerda junto a la cabeza.'],
        ['Doblar desde la cadera', 'Enrolla la columna; no inclines el torso entero.'],
      ],
    },
  },
  elev_piernas: {
    g: ['abdomen'],
    load: 'none', name: 'Elevación de rodillas', alt: 'colgado o en paralelas', muscle: 'Abdomen bajo',
    cue: 'Evita balancearte; elige la variante controlable.',
    how: {
      setup: [
        'En paralelas: apóyate con los brazos estirados y los hombros abajo. Colgado: agarre al ancho de los hombros.',
        'Cuerpo quieto y piernas colgando.',
      ],
      move: [
        'Sube las rodillas hacia el pecho.',
        'Al final enrolla la pelvis hacia arriba, como si llevaras las rodillas a la cara.',
        'Baja despacio hasta estirar las piernas, sin columpiarte.',
      ],
      tempo: '1 s subiendo · 2 s bajando',
      feel: 'Abdomen bajo.',
      errors: [
        ['Columpiarte', 'Detente un momento abajo antes de subir.'],
        ['Subir las piernas sin enrollar la pelvis', 'El trabajo está en el último tramo.'],
        ['Hundir los hombros', 'Empuja hacia abajo para quedar firme.'],
      ],
    },
  },
  plancha: {
    load: 'none', g: ['abdomen'],
    name: 'Plancha', alt: 'sobre antebrazos', muscle: 'Abdomen · core',
    cue: 'Cuerpo en línea recta de la cabeza a los talones; aprieta glúteos y abdomen.',
    how: {
      setup: [
        'Antebrazos en el suelo, codos justo debajo de los hombros.',
        'Empieza de rodillas para acomodarte y luego estira las piernas, con las puntas de los pies apoyadas.',
        'Pies al ancho de la cadera; mirada al suelo, un poco adelante de las manos.',
      ],
      move: [
        'Aprieta glúteos y abdomen como si fueran a darte un golpe en el estómago.',
        'Lleva el ombligo hacia la columna y mete un poco la pelvis.',
        'Sostén la posición respirando corto, sin soltar el abdomen.',
      ],
      tempo: 'Sostener el tiempo indicado',
      breath: 'Respira corto y constante; no aguantes el aire.',
      feel: 'Todo el abdomen y la parte de abajo de la espalda trabajando juntas, sin dolor de espalda.',
      errors: [
        ['Hundir la cadera', 'Si se te cae, aprieta glúteos o corta la serie.'],
        ['Subir la cadera', 'Una línea recta, no una montaña.'],
        ['Contar segundos con mala forma', 'Cuando ya no puedas mantener la línea, termina la serie.'],
      ],
    },
  },

  // ---- cardio
  eliptica: {
    name: 'Elíptica', muscle: 'Cardio',
    cue: 'Ritmo moderado: debes poder hablar en frases cortas. Empuja con las piernas, no con los brazos.',
    how: {
      setup: [
        'Súbete con la máquina detenida, un pie en cada pedal, y toma las manijas móviles.',
        'Elige una resistencia con la que puedas hablar en frases cortas.',
      ],
      move: [
        'Pedalea hacia adelante con todo el pie apoyado en el pedal.',
        'Cuerpo derecho y abdomen firme; los brazos acompañan y las piernas hacen el trabajo.',
        'Mantén el ritmo constante; si te cuesta hablar, baja la resistencia.',
      ],
      tempo: 'Ritmo constante',
      breath: 'Respiración acelerada pero controlada.',
      feel: 'Piernas y glúteos; el pulso sube.',
      errors: [
        ['Pararte de puntas', 'Todo el pie en el pedal, talón incluido.'],
        ['Recargarte en las manijas', 'Cuerpo derecho; las manos solo acompañan.'],
        ['Ir tan rápido que no puedas hablar', 'Debe ser moderado.'],
      ],
    },
  },
  bici: {
    name: 'Bicicleta', muscle: 'Cardio',
    cue: 'Debes poder hablar en frases cortas.',
    how: {
      setup: [
        'Ajusta el asiento: con el pedal abajo, la rodilla queda casi estirada.',
        'Manubrio a una altura cómoda, espalda neutra.',
      ],
      move: [
        'Pedalea a ritmo constante con resistencia moderada.',
        'Termina con 1–2 minutos suaves.',
      ],
      tempo: 'Ritmo constante',
      breath: 'Respiración acelerada pero controlada.',
      feel: 'Piernas; el pulso sube.',
      errors: [
        ['Asiento muy bajo', 'Molesta las rodillas; súbelo.'],
        ['Tanta resistencia que el cuerpo rebota', 'Baja la resistencia.'],
      ],
    },
  },
};

// Plan de 5 días con prioridad en torso (2026-10-27): cada músculo de arriba 2 veces por semana,
// pierna un día corto para mantener.
const DAYS = [
  {
    title: 'Pecho + espalda', focus: 'Pesado · pecho superior · dorsal',
    items: [
      { ex: 'press_inclinado_barra', sets: 4, reps: [6, 8], rest: '2–3 min', restSec: 150 },
      { ex: 'remo_barra', sets: 4, reps: [6, 10], rest: '2–3 min', restSec: 150 },
      { ex: 'press_plano', sets: 3, reps: [8, 10], rest: '2 min', restSec: 120 },
      { ex: 'jalon', sets: 4, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'fondos', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120, isNew: true },
      { ex: 'pullover_polea', sets: 2, reps: [12, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'elev_laterales', sets: 3, reps: [12, 20], rest: '60 s', restSec: 60, drop: true },
    ],
    cardio: { ex: 'eliptica', text: '30–35 min moderados al terminar', short: 'Elíptica 30–35' },
  },
  {
    title: 'Hombros + brazos', focus: 'Deltoides · bíceps · tríceps',
    items: [
      { ex: 'press_hombro', sets: 4, reps: [6, 10], rest: '2–3 min', restSec: 150 },
      { ex: 'lat_polea', sets: 4, reps: [12, 15], perSide: true, rest: '60 s', restSec: 60, drop: true },
      { ex: 'pajaro_polea', sets: 3, reps: [15, 20], perSide: true, rest: '60 s', restSec: 60 },
      { ex: 'curl_barra', sets: 3, reps: [6, 10], rest: '2 min', restSec: 120 },
      { ex: 'press_frances', sets: 3, reps: [8, 12], rest: '90 s', restSec: 90 },
      { ex: 'curl_inclinado', sets: 3, reps: [10, 12], rest: 'Sin descanso', restSec: 0, pair: true },
      { ex: 'ext_sobre_cabeza', sets: 3, reps: [10, 12], rest: '90 s', restSec: 90 },
      { ex: 'curl_cuerda', sets: 2, reps: [10, 15], rest: '60 s', restSec: 60, drop: true },
    ],
    cardio: { ex: 'eliptica', text: '30–35 min moderados al terminar', short: 'Elíptica 30–35' },
  },
  {
    title: 'Pierna + abdomen', focus: 'Pierna para mantener · core',
    items: [
      { ex: 'prensa', sets: 3, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'rdl_barra', sets: 3, reps: [8, 10], rest: '2 min', restSec: 120 },
      { ex: 'curl_femoral', sets: 2, reps: [10, 15], rest: '90 s', restSec: 90 },
      { ex: 'talones', sets: 2, reps: [12, 20], rest: '60 s', restSec: 60 },
      { ex: 'crunch_polea', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
      { ex: 'elev_piernas', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
      { ex: 'plancha', sets: 3, reps: [40, 60], unit: 's', rest: '60 s', restSec: 60, isNew: true },
    ],
    cardio: { ex: 'bici', text: 'Opcional: 10–15 min suaves', short: 'Bici opcional' },
  },
  {
    title: 'Pecho + espalda', focus: 'Volumen · pecho · espalda en V',
    items: [
      { ex: 'press_inclinado', sets: 4, reps: [8, 12], rest: '2 min', restSec: 120, cue: 'Usa un peso controlable, sin rebotes.' },
      { ex: 'jalon_cerrado', sets: 4, reps: [8, 12], rest: '2 min', restSec: 120 },
      { ex: 'remo_sentado', sets: 3, reps: [10, 12], rest: '90 s', restSec: 90 },
      { ex: 'apertura_baja', sets: 3, reps: [12, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'remo_polea_una', sets: 3, reps: [10, 12], perSide: true, rest: '90 s', restSec: 90 },
      { ex: 'face_pull', sets: 3, reps: [15, 20], rest: '60 s', restSec: 60 },
      { ex: 'elev_laterales', sets: 3, reps: [12, 20], rest: '60 s', restSec: 60, drop: true },
    ],
    cardio: { ex: 'eliptica', text: '30–35 min moderados al terminar', short: 'Elíptica 30–35' },
  },
  {
    title: 'Brazos + hombro', focus: 'Bíceps · tríceps · deltoide lateral · abdomen',
    items: [
      { ex: 'elev_laterales', sets: 4, reps: [12, 20], rest: '60 s', restSec: 60, drop: true, cue: 'Controla la bajada y evita balancearte.' },
      { ex: 'curl_predicador', sets: 3, reps: [8, 12], rest: '90 s', restSec: 90, isNew: true },
      { ex: 'ext_triceps', sets: 3, reps: [10, 15], rest: '60–90 s', restSec: 75 },
      { ex: 'curl_polea', sets: 3, reps: [10, 15], rest: 'Sin descanso', restSec: 0, pair: true, drop: true },
      { ex: 'ext_sobre_cabeza', sets: 3, reps: [10, 15], rest: '90 s', restSec: 90 },
      { ex: 'crunch_polea', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
      { ex: 'elev_piernas', sets: 3, reps: [10, 15], rest: '60 s', restSec: 60 },
    ],
    cardio: { ex: 'eliptica', text: '30–35 min moderados al terminar', short: 'Elíptica 30–35' },
  },
];

// grupos para el volumen semanal (g en EXERCISES)
const GROUPS = [
  ['pecho', 'Pecho'], ['espalda', 'Espalda'], ['lateral', 'Hombro lateral'], ['posterior', 'Hombro posterior'],
  ['biceps', 'Bíceps'], ['triceps', 'Tríceps'], ['abdomen', 'Abdomen'], ['pierna', 'Pierna'],
];
const VOLUME_RANGE = [10, 20];

// meta de pasos: sube cuando empiece la dieta (2026-11-16)
const STEPS_GOAL = (dayKey) => (dayKey < '2026-11-16' ? '5 000' : '8 000');

const RULES = {
  warmup: '5 min de cardio suave y 1–2 series ligeras del primer ejercicio. No cuentan como series efectivas.',
  execution: 'Ejercicios pesados: 1–2 repeticiones en reserva. Aislados: la última serie casi al fallo. Detén cualquier movimiento que cause dolor agudo.',
  firstWeeks: 'Prioriza la técnica y deja 2–3 repeticiones posibles al final de cada serie.',
  progression: 'Doble progresión: suma repeticiones con el mismo peso. Cuando completes el máximo del rango en todas las series con técnica limpia, sube el peso (unos 2.5 kg en los pesados, el siguiente disco en los aislados) y vuelve al rango bajo.',
  drop: 'Desde la semana 3, en la última serie de laterales y curls: al terminar baja el peso un 25–30 % y sigue sin descansar hasta casi el fallo.',
  superset: 'Haz una serie de cada ejercicio seguidas, sin descanso entre ellas, y descansa al terminar las dos.',
  stall: 'Si un ejercicio no mejora peso ni repeticiones en 2–3 semanas, revisa sueño y comida antes de cambiarlo. Si se estancan varios a la vez, quita 1 serie a cada aislado.',
  deload: 'Cada 6–8 semanas, o si estás cansado todo el tiempo: una semana con la mitad de las series y el mismo peso.',
  cardio: 'Elíptica 30–35 min los días de torso (cubre parte de los pasos que faltan); bici opcional el día de pierna. En la elíptica empuja con las piernas, no con los brazos.',
  steps: '5 000 pasos al día hasta el 15 de noviembre; desde el 16, 8 000. Caminar 15 min después de comer y de cenar suma unos 3 000.',
  measure: 'Pésate 3–4 mañanas por semana y compara el promedio. Cintura cada 2 semanas, fotos cada mes con la misma luz.',
};
