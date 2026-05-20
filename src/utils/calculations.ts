/**
 * Fórmulas que derivan información a partir de respuestas previas.
 *
 * Las preguntas pueden declarar `derivation` para que sus opciones (o el valor
 * en vivo de un slider) se contextualicen con el dinero real del usuario. Las
 * funciones de aquí son los únicos sitios donde se materializa ese cálculo.
 *
 * Si agregás un nuevo `DerivationKind`, también extendé `getDerivationBase`.
 */

import {
  DIAGNOSIS_QUESTIONS,
  type Answers,
  type ChipsQuestion,
  type DerivationKind,
  type OptionBracket,
} from '../content/diagnosis'

export const formatMoney = (amount: number, currency: string): string =>
  new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)

/**
 * Familias de "pasos lindos" ordenadas de más redonda a menos. Cada
 * número de la lista de entrada se aproxima a `step × 10^k` para algún
 * `step` de la familia y algún entero `k`. Si la familia más redonda
 * deja colisiones (dos entradas redondeadas al mismo valor), pasamos a
 * la siguiente, que admite más resoluciones intermedias.
 */
const NICE_STEP_TIERS: readonly (readonly number[])[] = [
  [1, 2, 5],
  [1, 2, 2.5, 5],
  [1, 1.5, 2, 2.5, 3, 5, 7],
  [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8],
]

const roundToNiceStep = (n: number, steps: readonly number[]): number => {
  if (n === 0) return 0
  const sign = Math.sign(n)
  const absN = Math.abs(n)
  const magnitude = Math.pow(10, Math.floor(Math.log10(absN)))
  const normalized = absN / magnitude
  let best = steps[0]
  for (const s of steps) {
    if (Math.abs(normalized - s) < Math.abs(normalized - best)) best = s
  }
  return sign * best * magnitude
}

/**
 * Redondea una lista de números a valores "lindos" (1, 2, 5 × 10^k de
 * preferencia, escalando a familias más detalladas si dos valores
 * colapsan). Sirve para sugerencias derivadas como `multiplier × SMM`:
 * 711.750 → 500.000, 1.423.500 → 1.000.000, 2.847.000 → 2.000.000,
 * 7.117.500 → 5.000.000, 14.235.000 → 10.000.000.
 */
export const niceRoundList = (numbers: readonly number[]): number[] => {
  if (numbers.length === 0) return []
  for (const steps of NICE_STEP_TIERS) {
    const rounded = numbers.map(n => roundToNiceStep(n, steps))
    if (new Set(rounded).size === rounded.length) return rounded
  }
  return numbers.map(n => Math.round(n))
}

/**
 * Multiplicador representativo del ingreso mensual a partir de la banda
 * elegida. Se calcula desde los `bracket` de las opciones de la pregunta de
 * ingreso para no duplicar conocimiento.
 */
const getIncomeMultiplier = (bandValue: string): number | null => {
  const incomeQuestion = DIAGNOSIS_QUESTIONS.find(q => q.storageKey === 'incomeBand') as
    | ChipsQuestion
    | undefined
  const opt = incomeQuestion?.options.find(o => o.value === bandValue)
  if (!opt?.bracket) return null
  const {min, max} = opt.bracket
  if (min !== undefined && max !== undefined) return (min + max) / 2
  if (max !== undefined) return max / 2
  if (min !== undefined) return min * 1.5
  return null
}

export const getMonthlyIncome = (answers: Answers, smm: number | null): number | null => {
  const v = answers.incomeBand
  if (typeof v === 'number') return v // valor exacto ingresado por el usuario
  if (typeof v !== 'string') return null
  if (smm === null) return null
  const multiplier = getIncomeMultiplier(v)
  return multiplier === null ? null : smm * multiplier
}

export const getMonthlyExpenses = (answers: Answers, smm: number | null): number | null => {
  const income = getMonthlyIncome(answers, smm)
  const pct = answers.obligatoryPct
  if (income === null || typeof pct !== 'number') return null
  return income * (pct / 100)
}

export const getDerivationBase = (
  kind: DerivationKind,
  answers: Answers,
  smm: number | null,
): number | null => {
  switch (kind) {
    case 'multiplyMinimumWage':
      return smm
    case 'multiplyMonthlyIncome':
    case 'shareOfMonthlyIncome':
      return getMonthlyIncome(answers, smm)
    case 'multiplyMonthlyExpenses':
      return getMonthlyExpenses(answers, smm)
    case 'creditScoreBands':
      // Lookup por país: no tiene base numérica multiplicable. La
      // resolución a string vive directamente en el render
      // (`computeChipsDerivedSublabels`).
      return null
  }
}

export const formatBracket = (bracket: OptionBracket, base: number, currency: string): string => {
  const fmt = (n: number) => formatMoney(n, currency)
  if (bracket.min !== undefined && bracket.max !== undefined) {
    return `${fmt(bracket.min * base)} – ${fmt(bracket.max * base)}`
  }
  if (bracket.max !== undefined) return `Menos de ${fmt(bracket.max * base)}`
  if (bracket.min !== undefined) return `Más de ${fmt(bracket.min * base)}`
  return ''
}

/** Para sliders con `shareOfMonthlyIncome`: valor% × base = monto en vivo. */
export const formatShare = (value: number, base: number, currency: string): string =>
  `~${formatMoney((value / 100) * base, currency)}`
