/**
 * Perfiles canónicos del diagnóstico.
 *
 * Set fijo de respuestas pre-cargadas que representan situaciones
 * arquetípicas. Cumplen dos funciones:
 *
 *   1. **Tests de regresión** (`src/utils/scoring.test.ts`): el score y los
 *      insights de cada perfil están congelados en snapshots. Si alguien
 *      cambia un nodo o un peso, el test rompe y deja claro qué perfiles se
 *      afectaron.
 *   2. **Simulador en `/debug`** (eje B2 del roadmap): el picker carga el
 *      perfil para ver respuestas, scoring e insights en vivo.
 *
 * El contenido vive en `src/content/data/canonicalProfiles.json`. Para
 * agregar un perfil nuevo, editar ese JSON y correr `pnpm validate:content`.
 *
 * Los perfiles NO pretenden cubrir todo el espacio de respuestas — son
 * ejemplos representativos. Si un nodo nuevo no queda cubierto, sumar un
 * perfil que lo ejercite.
 */

import canonicalProfilesData from './data/canonicalProfiles.json'
import {parseContent} from './_loader'
import {CanonicalProfilesSchema} from './schemas/canonicalProfiles'

export type {CanonicalProfile} from './schemas/canonicalProfiles'

import type {CanonicalProfile} from './schemas/canonicalProfiles'

export const CANONICAL_PROFILES: readonly CanonicalProfile[] = parseContent(
  CanonicalProfilesSchema,
  canonicalProfilesData,
)

export const getCanonicalProfile = (id: string): CanonicalProfile | undefined =>
  CANONICAL_PROFILES.find(p => p.id === id)
