/**
 * Perfiles de personaje del diagnóstico.
 *
 * Cada bloque (base / debt / stability / investment) mapea el puntaje de la
 * sección a un nombre con personalidad. Sirve para gamificar la pantalla
 * final sin tocar la lógica de scoring: las palabras enganchan, los números
 * informan.
 *
 * El **perfil global** se calcula tomando el peor de los perfiles por
 * sección — la sección con menos puntaje define el cuello de botella, que
 * es lo que el usuario debería atacar primero. Si las cuatro secciones
 * superan un umbral cómodo, devuelve el perfil "Equilibrado".
 *
 * Filosofía: el quiz es one-shot, no de seguimiento. Los nombres son
 * etiquetas de estado, no roles permanentes.
 */

import type {DiagnosisCategoryId} from './diagnosis'

export type Profile = {
  id: string
  label: string
  /** Descripción breve (1-2 frases) que el usuario lee en la pantalla final. */
  description: string
}

export type ProfileBand = {
  /** Mínimo inclusivo (0-100). */
  min: number
  /** Máximo exclusivo (excepto la última banda, que es 100 inclusivo). */
  max: number
  profile: Profile
}

/**
 * Bandas de perfil por sección. Convención: 5 bandas (`[0,20)`, `[20,40)`,
 * `[40,60)`, `[60,80)`, `[80,100]`) — alineadas con las toneBands de las
 * pantallas intersticiales `__sectionScore__`.
 */
export const SECTION_PROFILES: Record<DiagnosisCategoryId, readonly ProfileBand[]> = {
  base: [
    {
      min: 0,
      max: 20,
      profile: {
        id: 'base-survival',
        label: 'En modo supervivencia',
        description:
          'El ingreso apenas alcanza para los gastos obligatorios — no hay margen para ahorrar ni invertir. La prioridad es destrabar ese piso antes que cualquier otra movida.',
      },
    },
    {
      min: 20,
      max: 40,
      profile: {
        id: 'base-tight',
        label: 'Apretado',
        description:
          'Llegas a fin de mes pero el aire es poco. Cualquier imprevisto se vuelve crisis. Reducir un rubro grande o sumar ingreso abre todo lo demás.',
      },
    },
    {
      min: 40,
      max: 60,
      profile: {
        id: 'base-balancer',
        label: 'Equilibrista',
        description:
          'Tu ingreso y tus gastos están en balance, pero sin colchón. Un pequeño cambio en cualquier dirección puede mover la situación rápido.',
      },
    },
    {
      min: 60,
      max: 80,
      profile: {
        id: 'base-margin',
        label: 'Con margen',
        description:
          'Tu base es sólida: hay diferencia entre ingreso y gasto, puedes destinar algo a ahorro o inversión sin sacrificar calidad de vida.',
      },
    },
    {
      min: 80,
      max: 100.01,
      profile: {
        id: 'base-comfortable',
        label: 'Cómodo',
        description:
          'Tus números base están en muy buena forma. Eso libera energía para optimizar lo siguiente — el sistema con el que distribuyes lo que sobra.',
      },
    },
  ],
  debt: [
    {
      min: 0,
      max: 20,
      profile: {
        id: 'debt-trapped',
        label: 'Atrapado en la deuda',
        description:
          'Tu deuda actual te empuja todos los meses. Antes de pensar en invertir o ahorrar fuerte, el plan tiene que ser eliminar la deuda más cara.',
      },
    },
    {
      min: 20,
      max: 40,
      profile: {
        id: 'debt-pressured',
        label: 'Bajo presión de deuda',
        description:
          'La deuda te ocupa una porción importante del ingreso. Una estrategia clara (avalancha o bola de nieve) puede sacarte de este estado en meses, no años.',
      },
    },
    {
      min: 40,
      max: 60,
      profile: {
        id: 'debt-managing',
        label: 'Manejando la deuda',
        description:
          'Tienes deuda pero está bajo control. El siguiente paso es revisar si todas son necesarias o si alguna se puede consolidar a mejor tasa.',
      },
    },
    {
      min: 60,
      max: 80,
      profile: {
        id: 'debt-light',
        label: 'Casi sin lastre',
        description:
          'Tu deuda activa es poca o productiva. El foco se mueve hacia construir fondo de emergencia e inversiones.',
      },
    },
    {
      min: 80,
      max: 100.01,
      profile: {
        id: 'debt-free',
        label: 'Sin lastre',
        description:
          'No tienes deuda mala o tu deuda es estructuralmente productiva. Cualquier excedente puede ir a fondo o inversión sin compromisos.',
      },
    },
  ],
  stability: [
    {
      min: 0,
      max: 20,
      profile: {
        id: 'stability-exposed',
        label: 'Sin red',
        description:
          'No tienes colchón ni amortiguadores. Cualquier imprevisto (despido, salud, daño grave) puede arruinar meses de progreso. Construir un fondo mínimo es prioridad.',
      },
    },
    {
      min: 20,
      max: 40,
      profile: {
        id: 'stability-building',
        label: 'Construyendo el colchón',
        description:
          'Algo de protección, pero no alcanza para un evento serio. La meta cercana: 1 mes de gastos obligatorios líquidos. Después escala a 3, después a 6.',
      },
    },
    {
      min: 40,
      max: 60,
      profile: {
        id: 'stability-partial',
        label: 'Resiliencia parcial',
        description:
          'Tu colchón cubre lo cotidiano pero no un evento prolongado. Llevarlo a 3-6 meses de gastos te libera de tomar decisiones financieras por miedo.',
      },
    },
    {
      min: 60,
      max: 80,
      profile: {
        id: 'stability-shielded',
        label: 'Bien protegido',
        description:
          'Tu base de seguridad está sólida. Tienes fondo, seguro de salud, y horizonte laboral cubierto. Puedes tomar más riesgo en inversiones sin perder sueño.',
      },
    },
    {
      min: 80,
      max: 100.01,
      profile: {
        id: 'stability-fortress',
        label: 'Fortaleza',
        description:
          'Tu seguridad financiera es notable: fondo amplio y líquido, cobertura completa, segunda fuente de ingreso. Tienes libertad real para elegir tu estrategia.',
      },
    },
  ],
  investment: [
    {
      min: 0,
      max: 20,
      profile: {
        id: 'investment-uninvested',
        label: 'Sin inversión',
        description:
          'Tu dinero no está trabajando. No es un mal estado si todavía estás cerrando la base, pero el costo de oportunidad crece con cada año que pasa.',
      },
    },
    {
      min: 20,
      max: 40,
      profile: {
        id: 'investment-curious',
        label: 'Curioso del mercado',
        description:
          'Ya inviertes algo o aprendiste lo básico, pero todavía es una porción chica de tu cuadro. Definir perfil de riesgo es el paso que más mueve la aguja.',
      },
    },
    {
      min: 40,
      max: 60,
      profile: {
        id: 'investment-learning',
        label: 'Inversor en formación',
        description:
          'Tienes inversiones activas pero el portafolio podría estar más diversificado o mejor calibrado a tu edad. La consistencia mensual gana a los timings.',
      },
    },
    {
      min: 60,
      max: 80,
      profile: {
        id: 'investment-active',
        label: 'Inversor activo',
        description:
          'Diversificas bien, conoces tu perfil y tus vehículos rinden. El refinamiento ahora viene de bajar costos (fees, fondos indexados) y dejar correr el tiempo.',
      },
    },
    {
      min: 80,
      max: 100.01,
      profile: {
        id: 'investment-mature',
        label: 'Inversor maduro',
        description:
          'Tu estrategia es sólida en horizonte, diversificación y costos. Revisa una vez al año el balance entre perfil de riesgo y etapa de vida — eso cambia con los años.',
      },
    },
  ],
}

/**
 * Resuelve el perfil correspondiente a un puntaje de sección. Devuelve
 * `null` si no hay banda definida (no debería pasar; defensivo ante scores
 * fuera de [0, 100]).
 */
export const getProfileForSection = (
  category: DiagnosisCategoryId,
  score: number,
): Profile | null => {
  const bands = SECTION_PROFILES[category]
  const band = bands.find(b => score >= b.min && score < b.max)
  return band?.profile ?? null
}

/**
 * Perfil global del usuario. Identifica el "cuello de botella" — la
 * sección con peor puntaje — y devuelve su perfil. Si todas las secciones
 * superan `wellRoundedThreshold` (por default 70), devuelve un perfil
 * "Equilibrado" sintético.
 *
 * Razón: el quiz busca decirle al usuario *qué hacer ahora*. Su sección
 * más débil es lo que más sube su situación total con el menor esfuerzo
 * marginal.
 */
export const getOverallProfile = (
  sectionScores: Partial<Record<DiagnosisCategoryId, number>>,
  wellRoundedThreshold = 70,
): {profile: Profile; reason: 'bottleneck' | 'well-rounded'; bottleneck?: DiagnosisCategoryId} => {
  const entries = (Object.entries(sectionScores) as Array<[DiagnosisCategoryId, number]>).filter(
    ([, s]) => typeof s === 'number',
  )
  if (entries.length === 0) {
    return {
      profile: {
        id: 'unknown',
        label: 'Sin datos',
        description: 'Completa al menos una sección del diagnóstico para ver tu perfil.',
      },
      reason: 'bottleneck',
    }
  }
  const allAbove = entries.every(([, s]) => s >= wellRoundedThreshold)
  if (allAbove) {
    return {
      profile: {
        id: 'overall-balanced',
        label: 'Equilibrado',
        description:
          'Las cuatro áreas — base, deuda, estabilidad e inversión — están en buen estado. No hay un único cuello de botella; el siguiente paso es elegir qué área quieres llevar de "muy bien" a "excelente".',
      },
      reason: 'well-rounded',
    }
  }
  // Pick the section with the lowest score.
  const [bottleneckCat, bottleneckScore] = entries.reduce((min, current) =>
    current[1] < min[1] ? current : min,
  )
  const profile = getProfileForSection(bottleneckCat, bottleneckScore)
  if (!profile) {
    return {
      profile: {
        id: 'unknown',
        label: 'Sin perfil',
        description: 'No pudimos resolver tu perfil. Eso es un bug del cuestionario.',
      },
      reason: 'bottleneck',
      bottleneck: bottleneckCat,
    }
  }
  return {profile, reason: 'bottleneck', bottleneck: bottleneckCat}
}
