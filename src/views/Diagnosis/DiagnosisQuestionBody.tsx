import type {ReactNode} from 'react'
import ChipGroup from '../../components/inputs/ChipGroup'
import Toggle from '../../components/inputs/Toggle'
import RangeSlider from '../../components/inputs/RangeSlider'
import NumberInput from '../../components/inputs/NumberInput'
import MultiChips from '../../components/inputs/MultiChips'
import Grid from '../../components/inputs/Grid'
import {
  DIAGNOSIS_QUESTIONS,
  getGridRows,
  type AnswerValue,
  type Answers,
  type ChipOption,
  type ChipsQuestion,
  type DiagnosisQuestion,
  type GridQuestion,
  type SliderQuestion,
} from '../../content/diagnosis'
import type {MinimumWageEntry} from '../../content/minimumWages'
import {findCreditScoreBands} from '../../content/creditScoreBands'
import {formatBracket, formatShare, getDerivationBase} from '../../utils/calculations'

/**
 * Renderiza SOLO el cuerpo (input) de una pregunta del diagnóstico.
 *
 * El header (prompt + hint) y la navegación (botones Atrás/Siguiente) los
 * maneja el Stepper. Este componente es agnóstico al chrome — recibe la
 * respuesta actual y dos callbacks (`setAnswer` para cambios sin avance,
 * `commit` para cambios con auto-advance).
 *
 * La lógica de "qué input renderizar según `question.type`" vive acá —
 * es el registry implícito del diagnóstico.
 */

type Props = {
  question: DiagnosisQuestion
  answers: Answers
  answer: AnswerValue | undefined
  minimumWage: MinimumWageEntry | null
  countryCode: string | null
  /** Cambio sin commit (slider, number, multiChips: el usuario sigue ajustando). */
  setAnswer: (value: AnswerValue) => void
  /** Cambio con auto-advance (chip único, toggle: interacción decisiva). */
  commit: (value: AnswerValue) => void
}

const prepareChipsForRender = (
  options: ChipsQuestion['options'],
  derivation: ChipsQuestion['derivation'],
  answers: Answers,
  minimumWage: MinimumWageEntry | null,
  countryCode: string | null,
): {options: readonly ChipOption[]; derivedSublabels?: Record<string, string>} => {
  if (!derivation) return {options}

  if (derivation.kind === 'creditScoreBands') {
    if (!countryCode) return {options}
    const bands = findCreditScoreBands(countryCode)
    if (!bands) return {options}
    const derivedSublabels: Record<string, string> = {}
    for (const opt of options) {
      const r = bands.ranges[opt.value as keyof typeof bands.ranges]
      if (r) derivedSublabels[opt.value] = `${r.min}–${r.max}`
    }
    return {options, derivedSublabels}
  }

  if (!minimumWage) return {options}
  const base = getDerivationBase(derivation.kind, answers, minimumWage.amount)
  if (base === null) return {options}

  if (derivation.kind === 'multiplyMinimumWage') {
    const transformed = options.map(opt => {
      if (!opt.bracket) return opt
      return {
        ...opt,
        label: formatBracket(opt.bracket, base, minimumWage.currency),
        sublabel: opt.label,
      }
    })
    return {options: transformed}
  }

  const derivedSublabels: Record<string, string> = {}
  for (const opt of options) {
    if (opt.bracket) {
      derivedSublabels[opt.value] = formatBracket(opt.bracket, base, minimumWage.currency)
    }
  }
  return {options, derivedSublabels}
}

const prepareGridCellForRender = (
  q: GridQuestion,
  answers: Answers,
  minimumWage: MinimumWageEntry | null,
  countryCode: string | null,
): {options: readonly ChipOption[]; derivedSublabels?: Record<string, string>} | null => {
  if (q.cell.kind !== 'chips') return null
  return prepareChipsForRender(q.cell.options, q.derivation, answers, minimumWage, countryCode)
}

const computeSliderHint = (
  question: SliderQuestion,
  value: number,
  answers: Answers,
  minimumWage: MinimumWageEntry | null,
): string | undefined => {
  if (!question.derivation || !minimumWage) return undefined
  const base = getDerivationBase(question.derivation.kind, answers, minimumWage.amount)
  if (base === null) return undefined
  if (question.derivation.kind === 'shareOfMonthlyIncome') {
    return formatShare(value, base, minimumWage.currency)
  }
  return undefined
}

const computeDerivationInfo = (q: DiagnosisQuestion): string | undefined => {
  if (!q.derivation || q.derivation.inputs.length === 0) return undefined
  const titles = q.derivation.inputs
    .map(k => DIAGNOSIS_QUESTIONS.find(qq => qq.storageKey === k)?.title ?? k)
    .join(', ')
  return `Calculado a partir de tu respuesta en: ${titles}.`
}

const buildGridRowChange =
  (q: GridQuestion, answers: Answers, setAnswer: (v: AnswerValue) => void) =>
  (rowIndex: number, cellValue: string | number) => {
    const rows = getGridRows(q, answers)
    const existing = answers[q.storageKey]
    const base: (string | number | null)[] = Array.isArray(existing)
      ? existing.map(v => (typeof v === 'boolean' ? null : v))
      : []
    const next: (string | number | null)[] = rows.map((_, i) =>
      i === rowIndex ? cellValue : (base[i] ?? null),
    )
    setAnswer(next as AnswerValue)
  }

export default function DiagnosisQuestionBody({
  question,
  answers,
  answer,
  minimumWage,
  countryCode,
  setAnswer,
  commit,
}: Props): ReactNode {
  const value = answer

  if (question.type === 'chips') {
    const {options, derivedSublabels} = prepareChipsForRender(
      question.options,
      question.derivation,
      answers,
      minimumWage,
      countryCode,
    )
    return (
      <ChipGroup
        options={options}
        value={typeof value === 'string' || typeof value === 'number' ? value : null}
        onChange={(v, opts) => (opts?.commit ? commit(v) : setAnswer(v))}
        ariaLabel={question.prompt}
        derivedSublabels={derivedSublabels}
        exactInput={question.exactInput}
      />
    )
  }

  if (question.type === 'toggle') {
    return (
      <Toggle
        value={typeof value === 'boolean' ? value : null}
        onChange={(v, opts) => (opts?.commit ? commit(v) : setAnswer(v))}
        trueLabel={question.trueLabel}
        falseLabel={question.falseLabel}
        ariaLabel={question.prompt}
      />
    )
  }

  if (question.type === 'slider') {
    const sliderValue = typeof value === 'number' ? value : question.defaultValue
    return (
      <RangeSlider
        value={sliderValue}
        onChange={v => setAnswer(v)}
        min={question.min}
        max={question.max}
        step={question.step}
        unit={question.unit}
        marks={question.marks}
        ariaLabel={question.prompt}
        derivedHint={computeSliderHint(question, sliderValue, answers, minimumWage)}
        derivedHintInfo={computeDerivationInfo(question)}
      />
    )
  }

  if (question.type === 'number') {
    const numValue = typeof value === 'number' ? value : (question.defaultValue ?? null)
    return (
      <NumberInput
        value={numValue}
        onChange={v => setAnswer(v ?? question.defaultValue ?? 0)}
        min={question.min}
        max={question.max}
        step={question.step}
        unit={question.unit}
        placeholder={question.placeholder}
        ariaLabel={question.prompt}
        size='medium'
      />
    )
  }

  if (question.type === 'multiChips') {
    const arrValue = Array.isArray(value)
      ? value.filter((v): v is string => typeof v === 'string')
      : []
    return (
      <MultiChips
        options={question.options}
        value={arrValue}
        onChange={v => setAnswer(v)}
        ariaLabel={question.prompt}
      />
    )
  }

  if (question.type === 'grid') {
    const rows = getGridRows(question, answers)
    const gridValue: readonly (string | number | null)[] = Array.isArray(value)
      ? value.map(v => (typeof v === 'boolean' ? null : v))
      : []
    const prepared = prepareGridCellForRender(question, answers, minimumWage, countryCode)
    const renderQuestion: GridQuestion =
      prepared && question.cell.kind === 'chips'
        ? {...question, cell: {...question.cell, options: prepared.options}}
        : question
    return (
      <Grid
        question={renderQuestion}
        rows={rows}
        value={gridValue}
        onChange={buildGridRowChange(question, answers, setAnswer)}
        derivedSublabels={prepared?.derivedSublabels}
      />
    )
  }

  return null
}
