/**
 * Evaluación y recolección de insights del diagnóstico.
 *
 * Cada nodo de `DIAGNOSIS_QUESTIONS` puede declarar `insights`: una lista
 * de diagnósticos + tips condicionales. Cada insight tiene un árbol
 * declarativo `when` que se evalúa contra todas las respuestas del
 * usuario. Si la condición se cumple, el insight aparece en la pantalla
 * final del diagnóstico.
 *
 * Las condiciones son JSON-puras (sin funciones), así un sistema externo
 * puede analizar qué se va a recomendar sin ejecutar el código de la app.
 */

import {
  DIAGNOSIS_QUESTIONS,
  SUMMARY_NODE,
  isAnswerComplete,
  isQuestionApplicable,
  type AnswerValue,
  type Answers,
  type DiagnosisCategoryId,
  type Insight,
  type InsightCondition,
  type InsightSeverity,
  type ScalarAnswer,
} from '../content/diagnosis'
import {findIncomeBenchmark} from '../content/incomeBenchmarks'
import {MINIMUM_WAGES} from '../content/minimumWages'
import {getMonthlyIncome} from './calculations'

type EvalContext = {
  answers: Answers
  smm: number | null
  /** ISO 3166-1 alpha-2 (`CO`, `AR`…). Necesario para resolver
   * comparaciones contra el promedio nacional (WID). */
  countryCode: string | null
}

/**
 * Resuelve el ingreso medio mensual del país en moneda local. Devuelve
 * `null` si el país no tiene benchmark o si la moneda del benchmark no
 * coincide con la del SMM (caso Venezuela: SMM en VES, benchmark en VEF).
 * En esos casos, las comparaciones contra el promedio simplemente no se
 * disparan.
 */
const getCountryMeanMonthlyIncome = (countryCode: string | null): number | null => {
  if (!countryCode) return null
  const bench = findIncomeBenchmark(countryCode)
  if (!bench) return null
  const smmEntry = MINIMUM_WAGES[countryCode]
  if (!smmEntry || smmEntry.currency !== bench.currency) return null
  return bench.meanMonthlyIncome
}

/** Monto que el usuario destina a gastos obligatorios mes a mes. */
const getObligatoryAmount = (ctx: EvalContext): number | null => {
  const pct = ctx.answers['obligatoryPct']
  if (typeof pct !== 'number') return null
  const income = getMonthlyIncome(ctx.answers, ctx.smm)
  if (income === null) return null
  return (income * pct) / 100
}

const asNumber = (v: AnswerValue | undefined): number | null =>
  typeof v === 'number' ? v : null

const asArray = (v: AnswerValue | undefined): readonly (string | number | null)[] | null =>
  Array.isArray(v) ? v : null

const evaluate = (cond: InsightCondition, ctx: EvalContext): boolean => {
  const a = ctx.answers
  switch (cond.kind) {
    case 'all':
      return cond.of.every(c => evaluate(c, ctx))
    case 'any':
      return cond.of.some(c => evaluate(c, ctx))
    case 'not':
      return !evaluate(cond.of, ctx)
    case 'equals':
      return a[cond.key] === cond.value
    case 'in': {
      const v = a[cond.key]
      if (typeof v === 'object') return false
      return cond.values.includes(v as ScalarAnswer)
    }
    case 'numberAbove': {
      const n = asNumber(a[cond.key])
      return n !== null && n > cond.threshold
    }
    case 'numberBelow': {
      const n = asNumber(a[cond.key])
      return n !== null && n < cond.threshold
    }
    case 'numberAtLeast': {
      const n = asNumber(a[cond.key])
      return n !== null && n >= cond.threshold
    }
    case 'numberAtMost': {
      const n = asNumber(a[cond.key])
      return n !== null && n <= cond.threshold
    }
    case 'multiHas': {
      const arr = asArray(a[cond.key])
      return arr !== null && arr.includes(cond.value)
    }
    case 'multiCountAtLeast': {
      const arr = asArray(a[cond.key])
      if (arr === null) return false
      return arr.filter(v => typeof v === 'string').length >= cond.count
    }
    case 'multiCountAtMost': {
      const arr = asArray(a[cond.key])
      if (arr === null) return false
      return arr.filter(v => typeof v === 'string').length <= cond.count
    }
    case 'gridAnyIn': {
      const arr = asArray(a[cond.key])
      return arr !== null && arr.some(v => typeof v === 'string' && cond.values.includes(v))
    }
    case 'gridEveryIn': {
      const arr = asArray(a[cond.key])
      if (arr === null || arr.length === 0) return false
      return arr.every(v => typeof v === 'string' && cond.values.includes(v))
    }
    case 'gridCountInAtLeast': {
      const arr = asArray(a[cond.key])
      if (arr === null) return false
      const count = arr.filter(v => typeof v === 'string' && cond.values.includes(v)).length
      return count >= cond.count
    }
    case 'gridAnyNumberAbove': {
      const arr = asArray(a[cond.key])
      return arr !== null && arr.some(v => typeof v === 'number' && v > cond.threshold)
    }
    case 'gridAnyNumberBelow': {
      const arr = asArray(a[cond.key])
      return arr !== null && arr.some(v => typeof v === 'number' && v < cond.threshold)
    }
    case 'gridEveryNumberBelow': {
      const arr = asArray(a[cond.key])
      if (arr === null || arr.length === 0) return false
      return arr.every(v => typeof v === 'number' && v < cond.threshold)
    }
    case 'incomeBelowSmmTimes': {
      const income = getMonthlyIncome(ctx.answers, ctx.smm)
      return income !== null && ctx.smm !== null && income < cond.multiplier * ctx.smm
    }
    case 'incomeAboveSmmTimes': {
      const income = getMonthlyIncome(ctx.answers, ctx.smm)
      return income !== null && ctx.smm !== null && income > cond.multiplier * ctx.smm
    }
    case 'incomeBelowCountryAverageTimes': {
      const income = getMonthlyIncome(ctx.answers, ctx.smm)
      const avg = getCountryMeanMonthlyIncome(ctx.countryCode)
      return income !== null && avg !== null && income < cond.multiplier * avg
    }
    case 'incomeAboveCountryAverageTimes': {
      const income = getMonthlyIncome(ctx.answers, ctx.smm)
      const avg = getCountryMeanMonthlyIncome(ctx.countryCode)
      return income !== null && avg !== null && income > cond.multiplier * avg
    }
    case 'obligatoryAbsoluteBelowSmmTimes': {
      const amount = getObligatoryAmount(ctx)
      return amount !== null && ctx.smm !== null && amount < cond.multiplier * ctx.smm
    }
    case 'obligatoryAbsoluteAboveSmmTimes': {
      const amount = getObligatoryAmount(ctx)
      return amount !== null && ctx.smm !== null && amount > cond.multiplier * ctx.smm
    }
  }
}

export type CollectedInsight = {
  /** Identificador del nodo donde está declarado el insight. */
  nodeKey: string
  insight: Insight
  /** Categoría del nodo dueño, para agrupar/colorear en el render. */
  category: DiagnosisCategoryId
}

/**
 * Rank de severidad para ordenar el listado final de insights. La fuente
 * de verdad es `SUMMARY_NODE.severityOrder` — si una severidad no está
 * en ese orden, se desplaza al final.
 */
const severityRank = (s: InsightSeverity | undefined): number => {
  const idx = SUMMARY_NODE.severityOrder.indexOf(s ?? 'info')
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
}

/**
 * Recorre los nodos aplicables y completos, evalúa sus insights, y
 * devuelve los que cumplieron condición, ordenados por severidad
 * (crítico → positivo).
 */
/**
 * Recorre el árbol de una condición y devuelve todos los `storageKey`
 * referenciados — incluyendo referencias implícitas (`incomeBelowSmmTimes`
 * y `incomeAboveSmmTimes` consumen `incomeBand`).
 *
 * Útil para visualizar "qué respuestas alimentan este insight" sin tener
 * que ejecutar la condición.
 */
export const extractReferencedKeys = (cond: InsightCondition): readonly string[] => {
  const keys = new Set<string>()
  const walk = (c: InsightCondition): void => {
    switch (c.kind) {
      case 'all':
      case 'any':
        c.of.forEach(walk)
        return
      case 'not':
        walk(c.of)
        return
      case 'incomeBelowSmmTimes':
      case 'incomeAboveSmmTimes':
      case 'incomeBelowCountryAverageTimes':
      case 'incomeAboveCountryAverageTimes':
        keys.add('incomeBand')
        return
      case 'obligatoryAbsoluteBelowSmmTimes':
      case 'obligatoryAbsoluteAboveSmmTimes':
        keys.add('incomeBand')
        keys.add('obligatoryPct')
        return
      case 'equals':
      case 'in':
      case 'numberAbove':
      case 'numberBelow':
      case 'numberAtLeast':
      case 'numberAtMost':
      case 'multiHas':
      case 'multiCountAtLeast':
      case 'multiCountAtMost':
      case 'gridAnyIn':
      case 'gridEveryIn':
      case 'gridCountInAtLeast':
      case 'gridAnyNumberAbove':
      case 'gridAnyNumberBelow':
      case 'gridEveryNumberBelow':
        keys.add(c.key)
        return
    }
  }
  walk(cond)
  return [...keys]
}

export const collectInsights = (
  answers: Answers,
  smm: number | null,
  countryCode: string | null = null,
): readonly CollectedInsight[] => {
  const ctx: EvalContext = {answers, smm, countryCode}
  const result: CollectedInsight[] = []
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (!q.insights || q.insights.length === 0) continue
    if (!isQuestionApplicable(q, answers)) continue
    if (!isAnswerComplete(q, answers)) continue
    for (const ins of q.insights) {
      if (evaluate(ins.when, ctx)) {
        result.push({nodeKey: q.storageKey, insight: ins, category: q.category})
      }
    }
  }
  return result.sort(
    (a, b) => severityRank(a.insight.severity) - severityRank(b.insight.severity),
  )
}
