/**
 * Punto de entrada del cuestionario.
 *
 * El **contenido** vive en JSON bajo `src/content/data/diagnosis/<cat>.json`
 * (un archivo por categoría). El **shape** vive en `src/content/schemas/` y
 * se valida con zod en dev y en CI (`pnpm validate:content`).
 *
 * Este archivo solo concatena los JSONs en `DIAGNOSIS_QUESTIONS`, mantiene
 * en TS las constantes que son tabla de verdad (`CATEGORIES`,
 * `CATEGORY_ORDER`, `FOUNDATION_CATEGORIES`, `SECTION_SCORE_NODES`), carga
 * el `SUMMARY_NODE` desde JSON, y expone los helpers de aplicabilidad,
 * skips, formateo y resolución de nodos de resultado.
 *
 * Tipos de pregunta (`type`):
 *   - `chips`        — selección única entre opciones (con o sin valor exacto)
 *   - `slider`       — barra continua con marcas
 *   - `toggle`       — Sí / No
 *   - `number`       — entrada numérica directa
 *   - `multiChips`   — selección múltiple
 *   - `grid`         — repite una celda por fila; las filas vienen de un nodo previo
 */

import debtData from './data/diagnosis/debt.json'
import expensesData from './data/diagnosis/expenses.json'
import habitsData from './data/diagnosis/habits.json'
import incomeData from './data/diagnosis/income.json'
import investmentData from './data/diagnosis/investment.json'
import profileData from './data/diagnosis/profile.json'
import protectionData from './data/diagnosis/protection.json'
import stabilityData from './data/diagnosis/stability.json'
import summaryNodeData from './data/summaryNode.json'
import toneBandsData from './data/toneBands.json'
import {parseContent} from './_loader'
import {
  DiagnosisQuestionsSchema,
  SummaryNodeSchema,
  ToneBandsSchema,
} from './schemas/diagnosis'

// ---------- Tipos re-exportados desde schemas ----------

export type {
  AnswerValue,
  Answers,
  ChipOption,
  DependencyClause,
  Derivation,
  DerivationKind,
  ExactInput,
  GridCell,
  GridRowSource,
  InsightSeverity,
  OptionBracket,
  ScalarAnswer,
  ScoreBand,
  SidebarWidgetId,
  ValueScoring,
} from './schemas/common'
export type {InsightCondition} from './schemas/insightConditions'
export type {
  ChipsQuestion,
  DiagnosisQuestion,
  GridQuestion,
  Insight,
  MultiChipsQuestion,
  NumberQuestion,
  SeverityLabel,
  SliderQuestion,
  SummaryComponent,
  SummaryNode,
  ToggleQuestion,
  ToneBand,
} from './schemas/diagnosis'

import type {AnswerValue, Answers, ChipOption, DependencyClause} from './schemas/common'
import type {
  DiagnosisQuestion,
  GridQuestion,
  SummaryNode,
  ToneBand,
} from './schemas/diagnosis'

// ---------- Categorías (tabla de verdad, en TS) ----------

export type DiagnosisCategoryId =
  | 'profile'
  | 'income'
  | 'expenses'
  | 'habits'
  | 'debt'
  | 'stability'
  | 'protection'
  | 'investment'

export type DiagnosisCategory = {
  id: DiagnosisCategoryId
  label: string
  shortLabel: string
  color: 'primary' | 'warning' | 'info' | 'success' | 'secondary'
  /**
   * Modo del intersticial de fin de sección:
   *   - `score` (default): círculo 0-100 + perfil narrativo (el comportamiento clásico).
   *   - `narrative`: pantalla de transición sin score numérico ni perfil, sólo
   *     un saludo que enmarca lo que el usuario acaba de responder. Lo usa
   *     `profile`, cuyas preguntas son demográficas y no aportan puntaje.
   */
  interstitial: 'score' | 'narrative'
}

export const CATEGORIES: Record<DiagnosisCategoryId, DiagnosisCategory> = {
  profile: {
    id: 'profile',
    label: 'Perfil',
    shortLabel: 'Perfil',
    color: 'primary',
    interstitial: 'narrative',
  },
  income: {
    id: 'income',
    label: 'Ingresos',
    shortLabel: 'Ingresos',
    color: 'success',
    interstitial: 'score',
  },
  expenses: {
    id: 'expenses',
    label: 'Egresos',
    shortLabel: 'Egresos',
    color: 'warning',
    interstitial: 'score',
  },
  habits: {
    id: 'habits',
    label: 'Hábitos',
    shortLabel: 'Hábitos',
    color: 'info',
    interstitial: 'score',
  },
  debt: {
    id: 'debt',
    label: 'Deudas y crédito',
    shortLabel: 'Deudas',
    color: 'warning',
    interstitial: 'score',
  },
  stability: {
    id: 'stability',
    label: 'Estabilidad',
    shortLabel: 'Estabilidad',
    color: 'info',
    interstitial: 'score',
  },
  protection: {
    id: 'protection',
    label: 'Protección',
    shortLabel: 'Protección',
    color: 'secondary',
    interstitial: 'score',
  },
  investment: {
    id: 'investment',
    label: 'Inversiones',
    shortLabel: 'Inversiones',
    color: 'success',
    interstitial: 'score',
  },
}

export const CATEGORY_ORDER: DiagnosisCategoryId[] = [
  'profile',
  'income',
  'expenses',
  'habits',
  'debt',
  'stability',
  'protection',
  'investment',
]

/**
 * Categorías "fundacionales" que conforman la foto base del usuario.
 * Se agrupan en el resumen final para mostrar un perfil combinado
 * usando `FOUNDATION_PROFILES` (los perfiles que históricamente vivían
 * bajo `base`). No es una categoría real — es una vista derivada.
 */
export const FOUNDATION_CATEGORIES: readonly DiagnosisCategoryId[] = [
  'profile',
  'income',
  'expenses',
  'habits',
]

// ---------- Evaluación de dependencias (interpretador) ----------

const matchesClause = (clause: DependencyClause, value: AnswerValue | undefined): boolean => {
  if (value === undefined) return false
  if (clause.nonEmpty) {
    if (!Array.isArray(value)) return false
    const ignored = clause.nonEmptyExcept
    return value.some(v => {
      if (v === null || v === undefined) return false
      if (ignored && ignored.includes(v as string | number)) return false
      return true
    })
  }
  if (clause.greaterThan !== undefined)
    return typeof value === 'number' && value > clause.greaterThan
  if (clause.equals !== undefined) return value === clause.equals
  if (clause.in) return typeof value !== 'object' && clause.in.includes(value as string | number)
  return false
}

// ---------- Datos (cargados desde JSON, en orden de CATEGORY_ORDER) ----------

const rawQuestions = [
  ...profileData,
  ...incomeData,
  ...expensesData,
  ...habitsData,
  ...debtData,
  ...stabilityData,
  ...protectionData,
  ...investmentData,
]

export const DIAGNOSIS_QUESTIONS: readonly DiagnosisQuestion[] = parseContent(
  DiagnosisQuestionsSchema,
  rawQuestions,
)

// ---------- Grid: filas dinámicas ----------

export type GridRow = {label: string}

export const getGridRows = (q: GridQuestion, answers: Answers): readonly GridRow[] => {
  if (q.rowSource.kind === 'count') {
    const count = answers[q.rowSource.storageKey]
    if (typeof count !== 'number' || count <= 0) return []
    return Array.from({length: count}, (_, i) => ({
      label:
        q.rowSource.kind === 'count' ? q.rowSource.labelTemplate.replace('{n}', String(i + 1)) : '',
    }))
  }
  const selected = answers[q.rowSource.storageKey]
  if (!Array.isArray(selected) || selected.length === 0) return []
  const sourceQuestion = DIAGNOSIS_QUESTIONS.find(qq => qq.storageKey === q.rowSource.storageKey)
  if (!sourceQuestion || sourceQuestion.type !== 'multiChips') return []
  return selected.flatMap(value => {
    if (value === null || typeof value === 'boolean') return []
    const opt = sourceQuestion.options.find(o => o.value === value)
    return [{label: opt?.label ?? String(value)}]
  })
}

// ---------- Aplicabilidad / progreso ----------

const isGridEmpty = (q: GridQuestion, answers: Answers): boolean =>
  getGridRows(q, answers).length === 0

export const isQuestionApplicable = (q: DiagnosisQuestion, answers: Answers): boolean => {
  if (q.dependsOn && !q.dependsOn.every(c => matchesClause(c, answers[c.storageKey]))) return false
  if (q.type === 'grid' && isGridEmpty(q, answers)) return false
  return true
}

export const filterApplicableQuestions = (
  questions: readonly DiagnosisQuestion[],
  answers: Answers,
): DiagnosisQuestion[] => questions.filter(q => isQuestionApplicable(q, answers))

/**
 * Una pregunta está "saltada" cuando alguna cláusula padre se respondió con
 * un valor que no la cumple, o cuando un grid se quedó sin filas porque la
 * fuente está vacía. La barra de progreso la cuenta como resuelta.
 */
export const isQuestionSkipped = (q: DiagnosisQuestion, answers: Answers): boolean => {
  if (q.dependsOn) {
    const blocked = q.dependsOn.some(
      c => answers[c.storageKey] !== undefined && !matchesClause(c, answers[c.storageKey]),
    )
    if (blocked) return true
  }
  if (q.type === 'grid') {
    const sourceAnswered = answers[q.rowSource.storageKey] !== undefined
    if (sourceAnswered && isGridEmpty(q, answers)) return true
  }
  return false
}

/** Borra respuestas de preguntas que dejaron de aplicar. */
export const cleanOrphanAnswers = (answers: Answers): Answers => {
  const next: Answers = {...answers}
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (!isQuestionApplicable(q, next) && next[q.storageKey] !== undefined) {
      delete next[q.storageKey]
    }
  }
  return next
}

// ---------- Si la respuesta del nodo está completa ----------

export const isAnswerComplete = (q: DiagnosisQuestion, answers: Answers): boolean => {
  const value = answers[q.storageKey]
  // Inputs con `defaultValue` arrancan con un valor visible y mostrado
  // al usuario (slider, number): cuentan como respondidos aunque el
  // usuario no haya tocado el control. Las interacciones del usuario
  // setean `value` y caen en las ramas posteriores. `DefaultValuePersist`
  // (DiagnosisQuestionBody) además persiste el `defaultValue` en
  // `answers` al montar el paso para que dependsOn/insights lo vean.
  if (
    (q.type === 'slider' || q.type === 'number') &&
    value === undefined &&
    q.defaultValue !== undefined
  ) {
    return true
  }
  if (value === undefined) return false
  if (q.type === 'multiChips') return Array.isArray(value) && value.length > 0
  if (q.type === 'grid') {
    const rows = getGridRows(q, answers)
    if (rows.length === 0) return false
    if (!Array.isArray(value)) return false
    return rows.every((_, i) => value[i] !== null && value[i] !== undefined)
  }
  return true
}

// ---------- Formato para mostrar respuestas ----------

const formatChipAnswer = (
  options: readonly ChipOption[],
  value: string | number,
  unit?: string,
): string => {
  if (typeof value === 'number') return `${value}${unit ? ` ${unit}` : ''}`
  return options.find(o => o.value === value)?.label ?? String(value)
}

export const formatAnswer = (q: DiagnosisQuestion, value: AnswerValue): string => {
  if (q.type === 'chips') {
    if (typeof value === 'string' || typeof value === 'number') {
      return formatChipAnswer(q.options, value, q.exactInput?.unit)
    }
  }
  if (q.type === 'slider' && typeof value === 'number') return `${value}${q.unit ?? ''}`
  if (q.type === 'toggle') {
    if (value === true) return q.trueLabel ?? 'Sí'
    if (value === false) return q.falseLabel ?? 'No'
  }
  if (q.type === 'number' && typeof value === 'number')
    return `${value}${q.unit ? ` ${q.unit}` : ''}`
  if (q.type === 'multiChips' && Array.isArray(value)) {
    return `${value.length} seleccionado${value.length === 1 ? '' : 's'}`
  }
  if (q.type === 'grid' && Array.isArray(value)) {
    const filled = value.filter(v => v !== null && v !== undefined).length
    return `${filled} respuesta${filled === 1 ? '' : 's'}`
  }
  return String(value)
}

// ---------- Nodos de resultado ----------

const DEFAULT_TONE_BANDS: readonly ToneBand[] = parseContent(ToneBandsSchema, toneBandsData)

const sectionScoreStorageKey = (cat: DiagnosisCategoryId): string => `__sectionScore__${cat}`

/**
 * Nodo de "puntaje de sección": pantalla intersticial que ve el usuario
 * al terminar las preguntas aplicables de una categoría. Es un nodo del
 * cuestionario aunque no sea una pregunta — vive en el flujo entre
 * categorías y aporta información autocontenida sobre cómo se calcula
 * y presenta su resultado.
 *
 * No está en `DIAGNOSIS_QUESTIONS` (no es pregunta); vive en
 * `SECTION_SCORE_NODES`. Su `storageKey` sigue el patrón
 * `__sectionScore__{cat}`.
 */
export type SectionScoreNode = {
  storageKey: string
  kind: 'sectionScore'
  /** Categoría que resume. */
  category: DiagnosisCategoryId
  /** Etiqueta corta del paso, para el grafo. */
  title: string
  /** Texto largo: qué muestra, cuándo aparece, qué representa. */
  description: string
  /** Fórmula declarativa, legible. La implementación vive en `computeSectionScore`. */
  formula: string
  /** Reglas de inclusión que decide qué preguntas aportan, en lenguaje natural. */
  inclusionRules: readonly string[]
  /** Bandas que mapean score → color y mensaje. La UI las consume vía `resolveToneBand`. */
  toneBands: readonly ToneBand[]
}

export const SECTION_SCORE_NODES: readonly SectionScoreNode[] = CATEGORY_ORDER.map(cat => ({
  storageKey: sectionScoreStorageKey(cat),
  kind: 'sectionScore' as const,
  category: cat,
  title: `Puntaje · ${CATEGORIES[cat].label}`,
  description:
    `Pantalla intersticial que se muestra al terminar las preguntas aplicables de la categoría "${CATEGORIES[cat].label}". ` +
    'Calcula un puntaje 0–100 a partir de las respuestas y elige un mensaje de feedback según el rango.',
  formula: 'score = round(Σ earned / Σ max × 100)',
  inclusionRules: [
    'Solo entran al cálculo las preguntas aplicables (cuyas dependsOn se cumplen).',
    'Solo entran las preguntas completas (con respuesta).',
    'Las preguntas con max == 0 (sin scoring) no se cuentan — no penalizan el promedio.',
  ],
  toneBands: DEFAULT_TONE_BANDS,
}))

export const findSectionScoreNode = (cat: DiagnosisCategoryId): SectionScoreNode | undefined =>
  SECTION_SCORE_NODES.find(n => n.category === cat)

/**
 * Nodo de "diagnóstico final": pantalla que cierra el cuestionario.
 * No calcula score global; agrega insights aplicables y lista
 * respuestas. Vive en `SUMMARY_NODE`. Su `storageKey` es `__summary__`.
 *
 * El contenido se carga desde `data/summaryNode.json`.
 */
export const SUMMARY_NODE: SummaryNode = parseContent(SummaryNodeSchema, summaryNodeData)

/** Devuelve el nodo de resultado correspondiente a una `storageKey`, si lo hay. */
export const findResultNode = (key: string): SectionScoreNode | SummaryNode | undefined => {
  if (key === SUMMARY_NODE.storageKey) return SUMMARY_NODE
  return SECTION_SCORE_NODES.find(n => n.storageKey === key)
}

export const formatAnswerVerbose = (
  q: DiagnosisQuestion,
  value: AnswerValue,
  answers: Answers,
): string => {
  if (q.type === 'chips' && (typeof value === 'string' || typeof value === 'number')) {
    if (typeof value === 'number') return formatChipAnswer(q.options, value, q.exactInput?.unit)
    const opt = q.options.find(o => o.value === value)
    if (opt) return opt.sublabel ? `${opt.label} (${opt.sublabel})` : opt.label
  }
  if (q.type === 'multiChips' && Array.isArray(value)) {
    return value.map(v => q.options.find(o => o.value === v)?.label ?? String(v)).join(', ')
  }
  if (q.type === 'grid' && Array.isArray(value)) {
    const rows = getGridRows(q, answers)
    return rows
      .map((row, i) => {
        const cellValue = value[i]
        if (cellValue === null || cellValue === undefined) return `${row.label}: —`
        if (q.cell.kind === 'chips') {
          return `${row.label}: ${formatChipAnswer(q.cell.options, cellValue, q.cell.exactInput?.unit)}`
        }
        return `${row.label}: ${cellValue}${q.cell.exactInput.unit ? ` ${q.cell.exactInput.unit}` : ''}`
      })
      .join(' · ')
  }
  return formatAnswer(q, value)
}

