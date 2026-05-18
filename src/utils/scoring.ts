/**
 * Cálculo de puntaje por sección del diagnóstico.
 *
 * Cada sección (`base`, `debt`, `stability`, `investment`) recibe un
 * puntaje de 0 a 100 que se compone de las preguntas aplicables y
 * respondidas en esa categoría.
 *
 * Reglas:
 * - Cada pregunta declara cuántos puntos puede aportar (su `max`) y cuántos
 *   puntos efectivamente otorga la respuesta del usuario (su `earned`).
 * - Preguntas omitidas por dependencia (p. ej. todo el bloque de deuda
 *   cuando `hasDebt = false`) no se cuentan. La pregunta gate (la que
 *   cierra la rama) sí se cuenta y aporta el puntaje del lado elegido —
 *   por eso "no tengo deudas" da 100 en Deudas: la única aplicable es
 *   `hasDebt = false → 100`.
 * - Preguntas incompletas tampoco se cuentan. Como el interstitial de
 *   sección se muestra solo después de terminar la última pregunta de la
 *   categoría, todas las aplicables están completas en ese momento.
 *
 * Donde una pregunta o celda no declara scoring, su `max` es 0 y se
 * descarta del total de la sección (no penaliza).
 */

import {
  DIAGNOSIS_QUESTIONS,
  getGridRows,
  isAnswerComplete,
  isQuestionApplicable,
  type AnswerValue,
  type Answers,
  type ChipOption,
  type ChipsQuestion,
  type DiagnosisCategoryId,
  type DiagnosisQuestion,
  type GridQuestion,
  type MultiChipsQuestion,
  type NumberQuestion,
  type SliderQuestion,
  type ToggleQuestion,
  type ToneBand,
  type ValueScoring,
} from '../content/diagnosis'
import {getDerivationBase} from './calculations'

type QuestionScore = {earned: number; max: number}

const ZERO: QuestionScore = {earned: 0, max: 0}

const scoreFromBands = (bands: ValueScoring, value: number): number => {
  for (const band of bands) {
    const minOk = band.min === undefined || value >= band.min
    const maxOk = band.max === undefined || value < band.max
    if (minOk && maxOk) return band.score
  }
  return 0
}

const maxBandScore = (bands: ValueScoring): number =>
  bands.reduce((m, b) => Math.max(m, b.score), 0)

const optionScore = (options: readonly ChipOption[], value: string): number =>
  options.find(o => o.value === value)?.score ?? 0

const maxOptionScore = (options: readonly ChipOption[]): number =>
  options.reduce((m, o) => Math.max(m, o.score ?? 0), 0)

const sumOptionScores = (options: readonly ChipOption[]): number =>
  options.reduce((s, o) => s + (o.score ?? 0), 0)

/**
 * Para chips con valor exacto sin `exactScore` explícito: ubica el valor
 * en el `bracket` de alguna opción usando la `derivation` del nodo y
 * devuelve el `score` de esa opción. Devuelve `null` si no se puede
 * computar (sin derivación, sin SMM, o ningún bracket lo contiene).
 */
const scoreExactByBracket = (
  options: readonly ChipOption[],
  derivation: ChipsQuestion['derivation'],
  exactValue: number,
  answers: Answers,
  smm: number | null,
): number | null => {
  if (!derivation) return null
  if (smm === null) return null
  const base = getDerivationBase(derivation.kind, answers, smm)
  if (base === null || base <= 0) return null
  const relative = exactValue / base
  for (const opt of options) {
    if (!opt.bracket) continue
    const minOk = opt.bracket.min === undefined || relative >= opt.bracket.min
    const maxOk = opt.bracket.max === undefined || relative < opt.bracket.max
    if (minOk && maxOk) return opt.score ?? 0
  }
  return null
}

const scoreChips = (
  q: ChipsQuestion,
  value: AnswerValue,
  answers: Answers,
  smm: number | null,
): QuestionScore => {
  const optMax = maxOptionScore(q.options)
  const exactMax = q.exactScore ? maxBandScore(q.exactScore) : optMax
  const max = Math.max(optMax, exactMax)
  if (typeof value === 'string') {
    return {earned: optionScore(q.options, value), max}
  }
  if (typeof value === 'number') {
    if (q.exactScore) return {earned: scoreFromBands(q.exactScore, value), max}
    const fromBracket = scoreExactByBracket(q.options, q.derivation, value, answers, smm)
    return {earned: fromBracket ?? 0, max}
  }
  return {earned: 0, max}
}

const scoreSlider = (q: SliderQuestion, value: AnswerValue): QuestionScore => {
  if (!q.score) return ZERO
  const max = maxBandScore(q.score)
  if (typeof value !== 'number') return {earned: 0, max}
  return {earned: scoreFromBands(q.score, value), max}
}

const scoreNumber = (q: NumberQuestion, value: AnswerValue): QuestionScore => {
  if (!q.score) return ZERO
  const max = maxBandScore(q.score)
  if (typeof value !== 'number') return {earned: 0, max}
  return {earned: scoreFromBands(q.score, value), max}
}

const scoreToggle = (q: ToggleQuestion, value: AnswerValue): QuestionScore => {
  if (!q.score) return ZERO
  const max = Math.max(q.score.whenTrue, q.score.whenFalse)
  if (value === true) return {earned: q.score.whenTrue, max}
  if (value === false) return {earned: q.score.whenFalse, max}
  return {earned: 0, max}
}

const scoreMultiChips = (q: MultiChipsQuestion, value: AnswerValue): QuestionScore => {
  const max = sumOptionScores(q.options)
  if (!Array.isArray(value)) return {earned: 0, max}
  let earned = 0
  for (const v of value) {
    if (typeof v === 'string') earned += optionScore(q.options, v)
  }
  return {earned, max}
}

const scoreGrid = (
  q: GridQuestion,
  value: AnswerValue,
  answers: Answers,
  smm: number | null,
): QuestionScore => {
  const rows = getGridRows(q, answers)
  if (rows.length === 0) return ZERO

  if (q.cell.kind === 'chips') {
    const optMax = maxOptionScore(q.cell.options)
    const exactMax = q.cell.exactScore ? maxBandScore(q.cell.exactScore) : optMax
    const perRowMax = Math.max(optMax, exactMax)
    const max = perRowMax * rows.length
    if (!Array.isArray(value)) return {earned: 0, max}
    let earned = 0
    for (let i = 0; i < rows.length; i++) {
      const v = value[i] ?? null
      if (typeof v === 'string') {
        earned += optionScore(q.cell.options, v)
      } else if (typeof v === 'number') {
        if (q.cell.exactScore) {
          earned += scoreFromBands(q.cell.exactScore, v)
        } else {
          const fromBracket = scoreExactByBracket(q.cell.options, q.derivation, v, answers, smm)
          if (fromBracket !== null) earned += fromBracket
        }
      }
    }
    return {earned, max}
  }

  if (!q.cell.score) return ZERO
  const perRowMax = maxBandScore(q.cell.score)
  const max = perRowMax * rows.length
  if (!Array.isArray(value)) return {earned: 0, max}
  let earned = 0
  for (let i = 0; i < rows.length; i++) {
    const v = value[i]
    if (typeof v === 'number') earned += scoreFromBands(q.cell.score, v)
  }
  return {earned, max}
}

export const computeQuestionScore = (
  q: DiagnosisQuestion,
  answers: Answers,
  smm: number | null,
): QuestionScore => {
  const value = answers[q.storageKey]
  if (value === undefined) return ZERO

  switch (q.type) {
    case 'chips':
      return scoreChips(q, value, answers, smm)
    case 'slider':
      return scoreSlider(q, value)
    case 'number':
      return scoreNumber(q, value)
    case 'toggle':
      return scoreToggle(q, value)
    case 'multiChips':
      return scoreMultiChips(q, value)
    case 'grid':
      return scoreGrid(q, value, answers, smm)
  }
}

export type SectionScoreResult = {
  score: number
  earned: number
  max: number
  /** Preguntas que efectivamente entraron al cálculo (aplicables, completas y con max > 0). */
  countedQuestions: readonly string[]
}

export const computeSectionScore = (
  category: DiagnosisCategoryId,
  answers: Answers,
  smm: number | null,
): SectionScoreResult => {
  let totalEarned = 0
  let totalMax = 0
  const counted: string[] = []
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (q.category !== category) continue
    if (!isQuestionApplicable(q, answers)) continue
    if (!isAnswerComplete(q, answers)) continue
    const {earned, max} = computeQuestionScore(q, answers, smm)
    if (max <= 0) continue
    totalEarned += earned
    totalMax += max
    counted.push(q.storageKey)
  }
  if (totalMax === 0) return {score: 0, earned: 0, max: 0, countedQuestions: []}
  return {
    score: Math.round((totalEarned / totalMax) * 100),
    earned: totalEarned,
    max: totalMax,
    countedQuestions: counted,
  }
}

/**
 * Resuelve un puntaje 0–100 a la primera `ToneBand` cuyo intervalo
 * `[min, max)` lo incluya. `min` ausente ⇒ "hasta `max`"; `max` ausente
 * ⇒ "desde `min` en adelante" (inclusive de 100). Devuelve `null` si
 * ninguna banda matchea — el caller decide el fallback.
 */
export const resolveToneBand = (bands: readonly ToneBand[], score: number): ToneBand | null => {
  for (const band of bands) {
    const minOk = band.min === undefined || score >= band.min
    const maxOk = band.max === undefined || score < band.max
    if (minOk && maxOk) return band
  }
  return null
}

/**
 * Máximo teórico de puntos que una pregunta puede aportar al puntaje
 * de su sección, sin necesidad de respuesta del usuario.
 *
 *   - `kind: 'fixed'` con `max`: el techo es un número conocido.
 *   - `kind: 'perRow'` con `perRow`: el techo es `perRow × N` donde
 *     `N` es la cantidad de filas del grid (depende del usuario).
 *
 * Útil para el debug, donde necesitamos describir qué puede aportar
 * cada pregunta sin estar evaluando con respuestas reales.
 */
export type QuestionMaxResult = {kind: 'fixed'; max: number} | {kind: 'perRow'; perRow: number}

export const computeQuestionMax = (q: DiagnosisQuestion): QuestionMaxResult => {
  switch (q.type) {
    case 'chips': {
      const chipMax = Math.max(0, ...q.options.map(o => o.score ?? 0))
      const exactMax = q.exactScore ? maxBandScore(q.exactScore) : 0
      return {kind: 'fixed', max: Math.max(chipMax, exactMax)}
    }
    case 'multiChips':
      return {kind: 'fixed', max: sumOptionScores(q.options)}
    case 'slider':
    case 'number':
      return {kind: 'fixed', max: q.score ? maxBandScore(q.score) : 0}
    case 'toggle':
      return {
        kind: 'fixed',
        max: q.score ? Math.max(q.score.whenTrue, q.score.whenFalse) : 0,
      }
    case 'grid': {
      if (q.cell.kind === 'chips') {
        const chipMax = Math.max(0, ...q.cell.options.map(o => o.score ?? 0))
        const exactMax = q.cell.exactScore ? maxBandScore(q.cell.exactScore) : 0
        return {kind: 'perRow', perRow: Math.max(chipMax, exactMax)}
      }
      return {kind: 'perRow', perRow: q.cell.score ? maxBandScore(q.cell.score) : 0}
    }
  }
}
