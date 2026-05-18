import {describe, expect, it} from 'vitest'
import {CANONICAL_PROFILES} from '../content/canonicalProfiles'
import {CATEGORY_ORDER, type DiagnosisCategoryId} from '../content/diagnosis'
import {MINIMUM_WAGES} from '../content/minimumWages'
import {getProfileForSection, getOverallProfile} from '../content/profiles'
import {computeSectionScore} from './scoring'
import {collectInsights} from './insights'

/**
 * Tests de regresión sobre los perfiles canónicos.
 *
 * Cada perfil produce una "huella" determinista (score por sección, lista
 * ordenada de insightIds disparados, perfil de cada sección, perfil global).
 * Snapshot lock-in: si alguien cambia un peso o un insight, este test rompe
 * y muestra qué perfiles canónicos cambiaron, para que sea decisión
 * consciente actualizar (o revertir).
 *
 * SMM: usamos un valor fijo por perfil resolviendo `detectCountry(code)`
 * para que los tests no dependan de Intl runtime ni cambien al actualizar
 * el SMM oficial. La validación de "qué SMM es correcto para el país" vive
 * en `minimumWages.ts`, no acá.
 */

type Snapshot = {
  perfil: string
  pais: string
  sectionScores: Record<DiagnosisCategoryId, number>
  sectionProfiles: Record<DiagnosisCategoryId, string | null>
  overallProfile: {label: string; reason: string; bottleneck?: DiagnosisCategoryId}
  insightIds: string[]
}

const buildSnapshot = (profileId: string): Snapshot => {
  const profile = CANONICAL_PROFILES.find(p => p.id === profileId)!
  const smm = MINIMUM_WAGES[profile.countryCode]?.amount ?? null

  const sectionScores = {} as Record<DiagnosisCategoryId, number>
  const sectionProfiles = {} as Record<DiagnosisCategoryId, string | null>

  for (const cat of CATEGORY_ORDER) {
    const result = computeSectionScore(cat, profile.answers, smm)
    sectionScores[cat] = result.score
    sectionProfiles[cat] = getProfileForSection(cat, result.score)?.label ?? null
  }

  const overall = getOverallProfile(sectionScores)
  const insights = collectInsights(profile.answers, smm)

  return {
    perfil: profile.label,
    pais: profile.countryCode,
    sectionScores,
    sectionProfiles,
    overallProfile: {
      label: overall.profile.label,
      reason: overall.reason,
      bottleneck: overall.bottleneck,
    },
    insightIds: insights.map(i => i.insight.id).sort(),
  }
}

describe('Perfiles canónicos · snapshot', () => {
  for (const profile of CANONICAL_PROFILES) {
    it(`${profile.label} (${profile.id})`, () => {
      expect(buildSnapshot(profile.id)).toMatchSnapshot()
    })
  }
})

describe('Perfiles canónicos · invariantes', () => {
  it('todos los perfiles tienen al menos un score de sección > 0', () => {
    for (const profile of CANONICAL_PROFILES) {
      const smm = MINIMUM_WAGES[profile.countryCode]?.amount ?? null
      const scores = CATEGORY_ORDER.map(cat => computeSectionScore(cat, profile.answers, smm).score)
      expect(scores.some(s => s > 0)).toBe(true)
    }
  })

  it('los ids de insights disparados son únicos por perfil', () => {
    for (const profile of CANONICAL_PROFILES) {
      const smm = MINIMUM_WAGES[profile.countryCode]?.amount ?? null
      const ids = collectInsights(profile.answers, smm).map(i => i.insight.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})
