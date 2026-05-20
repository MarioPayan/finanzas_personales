/**
 * Perfiles de personaje del diagnóstico.
 *
 * Cada categoría con `interstitial: 'score'` mapea el puntaje de su
 * sección a un nombre con personalidad. Sirve para gamificar la
 * pantalla final y los intersticiales sin tocar la lógica de scoring:
 * las palabras enganchan, los números informan.
 *
 * Las categorías con `interstitial: 'narrative'` (hoy: `profile`) no
 * tienen entrada en `SECTION_PROFILES` — su intersticial no muestra
 * score 0-100.
 *
 * Además existe `FOUNDATION_PROFILES`: una vista derivada que combina
 * `profile + income + expenses + habits` en un único perfil "Base"
 * (Supervivencia / Apretado / Equilibrista / Con margen / Cómodo) para
 * mostrar en el resumen final, conservando los perfiles narrativos
 * históricos del bloque base.
 *
 * El **perfil global** se calcula tomando el peor de los perfiles por
 * sección — la sección con menos puntaje define el cuello de botella,
 * que es lo que el usuario debería atacar primero. Si todas las
 * secciones con score superan un umbral cómodo, devuelve el perfil
 * "Equilibrado".
 *
 * El contenido (bandas y descripciones) vive en
 * `src/content/data/foundationProfiles.json` y `data/sectionProfiles.json`.
 *
 * Filosofía: el quiz es one-shot, no de seguimiento. Los nombres son
 * etiquetas de estado, no roles permanentes.
 */

import foundationProfilesData from './data/foundationProfiles.json'
import sectionProfilesData from './data/sectionProfiles.json'
import {parseContent} from './_loader'
import {ProfileBandsSchema, SectionProfilesSchema} from './schemas/profiles'

import {FOUNDATION_CATEGORIES, type DiagnosisCategoryId} from './diagnosis'

export type {Profile, ProfileBand} from './schemas/profiles'

import type {Profile, ProfileBand} from './schemas/profiles'

/**
 * Bandas de perfil para el agregado **Base** del resumen final.
 * Combina las 4 categorías fundacionales (`profile + income + expenses
 * + habits`) en un único perfil narrativo. NO se muestra como
 * intersticial — sólo en el resumen final, debajo de los scores
 * individuales.
 */
export const FOUNDATION_PROFILES: readonly ProfileBand[] = parseContent(
  ProfileBandsSchema,
  foundationProfilesData,
)

/**
 * Bandas de perfil por sección con scoring. Convención: 5 bandas
 * (`[0,20)`, `[20,40)`, `[40,60)`, `[60,80)`, `[80,100]`) — alineadas
 * con las toneBands de las pantallas intersticiales
 * `__sectionScore__`. `profile` no aparece porque su intersticial es
 * narrativo (sin score).
 */
export const SECTION_PROFILES: Partial<Record<DiagnosisCategoryId, readonly ProfileBand[]>> =
  parseContent(SectionProfilesSchema, sectionProfilesData)

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
  if (!bands) return null
  const band = bands.find(b => score >= b.min && score < b.max)
  return band?.profile ?? null
}

/**
 * Resuelve el perfil "Base" agregado del usuario combinando las 4
 * categorías fundacionales (`profile + income + expenses + habits`).
 * Promedia los scores disponibles (omite los que no aplican o no se
 * pueden calcular) y mapea a `FOUNDATION_PROFILES`. Sirve para el
 * hero del resumen final.
 */
export const getFoundationProfile = (
  sectionScores: Partial<Record<DiagnosisCategoryId, number>>,
): {profile: Profile; score: number} | null => {
  const scores = FOUNDATION_CATEGORIES.map(c => sectionScores[c]).filter(
    (s): s is number => typeof s === 'number',
  )
  if (scores.length === 0) return null
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const band = FOUNDATION_PROFILES.find(b => avg >= b.min && avg < b.max)
  if (!band) return null
  return {profile: band.profile, score: avg}
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
  // Considerar sólo categorías con score real (excluye `profile`, que es
  // narrativa, y cualquier otra con interstitial != 'score').
  const entries = (Object.entries(sectionScores) as Array<[DiagnosisCategoryId, number]>).filter(
    ([cat, s]) => typeof s === 'number' && SECTION_PROFILES[cat] !== undefined,
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
          'Todas las áreas con score (ingresos, egresos, hábitos, deudas, estabilidad, protección, inversiones) están en buen estado. No hay un único cuello de botella; el siguiente paso es elegir qué área quieres llevar de "muy bien" a "excelente".',
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
