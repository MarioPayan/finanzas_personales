import type {ReactNode} from 'react'
import {Button, Stack, Typography} from '@mui/material'
import ChipGroup from '../../components/inputs/ChipGroup'
import Toggle from '../../components/inputs/Toggle'
import RangeSlider from '../../components/inputs/RangeSlider'
import NumberInput from '../../components/inputs/NumberInput'
import MultiChips from '../../components/inputs/MultiChips'
import Grid from '../../components/inputs/Grid'
import {
  DIAGNOSIS_QUESTIONS,
  getGridRows,
  isAnswerComplete,
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
 * Render unificado de un nodo del diagnóstico.
 *
 * Recibe el nodo y se encarga de toda su representación: prompt, hint, body
 * (delegando al input correspondiente) y la zona de avance. La estructura
 * visual y la lógica de "respuesta completa" son las mismas para todos los
 * tipos — así se cumple el principio de "una sola representación visual"
 * (ver [[01 - Vision y filosofia]]).
 *
 * El botón Siguiente/Terminar siempre está visible, deshabilitado hasta que
 * la respuesta esté completa. El auto-avance se dispara solo cuando el input
 * emite `{commit: true}` (chip click o toggle); todo lo demás requiere que el
 * usuario presione el botón.
 */

type AnswerOpts = {commit?: boolean}

type QuestionStepProps = {
  question: DiagnosisQuestion
  answers: Answers
  minimumWage: MinimumWageEntry | null
  countryCode: string | null
  isLast: boolean
  onAnswer: (key: string, value: AnswerValue, opts?: AnswerOpts) => void
  onAdvance: () => void
}

/**
 * `true` cuando toda interacción posible del nodo commitea (auto-avanza).
 * En esos casos el botón Siguiente sería redundante y se oculta. Para nodos
 * con al menos una vía no-commit (p. ej. tipear un valor exacto, mover un
 * slider, marcar varios chips) el botón se mantiene visible.
 */
const everyInteractionCommits = (q: DiagnosisQuestion): boolean => {
  if (q.type === 'toggle') return true
  if (q.type === 'chips' && !q.exactInput) return true
  return false
}

/**
 * Resuelve cómo se renderizan los chips de un nodo según su `derivation`:
 *
 *   - `multiplyMinimumWage` con SMM disponible: **intercambia** label y
 *     sublabel — el rango en moneda local pasa a ser el texto principal,
 *     y "1 a 2 SMM" pasa a ser la referencia secundaria abajo. Más
 *     legible para el usuario que piensa en su moneda, no en múltiplos
 *     del SMM.
 *   - `creditScoreBands` con país conocido: deja la label de la opción
 *     ("Bueno", "Excelente") y suma el rango numérico del buró como
 *     sublabel.
 *   - Otros casos (sin derivation, o derivation sin datos disponibles):
 *     options sin cambios.
 *
 * Devuelve `{options, derivedSublabels}` para que la caller los pase tal
 * cual a `ChipGroup` / `Grid` sin tener que saber qué tipo de derivation
 * había.
 */
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

  // multiplyMinimumWage (incomeBand, debtAmounts, investmentAmounts):
  // el rango formateado en moneda local toma el lugar de la label, y la
  // banda en SMM original baja a sublabel como referencia.
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

  // Otras derivations monetarias (multiplyMonthlyIncome, etc.): mantienen
  // label original y agregan rango como sublabel.
  const derivedSublabels: Record<string, string> = {}
  for (const opt of options) {
    if (opt.bracket) {
      derivedSublabels[opt.value] = formatBracket(opt.bracket, base, minimumWage.currency)
    }
  }
  return {options, derivedSublabels}
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

const prepareGridCellForRender = (
  q: GridQuestion,
  answers: Answers,
  minimumWage: MinimumWageEntry | null,
  countryCode: string | null,
): {options: readonly ChipOption[]; derivedSublabels?: Record<string, string>} | null => {
  if (q.cell.kind !== 'chips') return null
  return prepareChipsForRender(
    q.cell.options,
    q.derivation,
    answers,
    minimumWage,
    countryCode,
  )
}

const buildGridRowChange =
  (
    q: GridQuestion,
    answers: Answers,
    onAnswer: (key: string, value: AnswerValue, opts?: AnswerOpts) => void,
  ) =>
  (rowIndex: number, cellValue: string | number) => {
    const rows = getGridRows(q, answers)
    const existing = answers[q.storageKey]
    const base: (string | number | null)[] = Array.isArray(existing)
      ? existing.map(v => (typeof v === 'boolean' ? null : v))
      : []
    const next: (string | number | null)[] = rows.map((_, i) =>
      i === rowIndex ? cellValue : (base[i] ?? null),
    )
    onAnswer(q.storageKey, next)
  }

const renderBody = (
  question: DiagnosisQuestion,
  answers: Answers,
  minimumWage: MinimumWageEntry | null,
  countryCode: string | null,
  onAnswer: (key: string, value: AnswerValue, opts?: AnswerOpts) => void,
): ReactNode => {
  const value = answers[question.storageKey]

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
        onChange={(v, opts) => onAnswer(question.storageKey, v, opts)}
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
        onChange={(v, opts) => onAnswer(question.storageKey, v, opts)}
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
        onChange={v => onAnswer(question.storageKey, v)}
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
        onChange={v => onAnswer(question.storageKey, v ?? question.defaultValue ?? 0)}
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
        onChange={v => onAnswer(question.storageKey, v)}
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
    // Si hubo transformación de options (multiplyMinimumWage), pasamos un
    // question clonado con la cell que lleva las options ya intercambiadas.
    const renderQuestion: GridQuestion =
      prepared && question.cell.kind === 'chips'
        ? {...question, cell: {...question.cell, options: prepared.options}}
        : question
    return (
      <Grid
        question={renderQuestion}
        rows={rows}
        value={gridValue}
        onChange={buildGridRowChange(question, answers, onAnswer)}
        derivedSublabels={prepared?.derivedSublabels}
      />
    )
  }

  return null
}

export default function QuestionStep({
  question,
  answers,
  minimumWage,
  countryCode,
  isLast,
  onAnswer,
  onAdvance,
}: QuestionStepProps) {
  const canAdvance = isAnswerComplete(question, answers)
  const showAdvanceButton = !everyInteractionCommits(question)

  return (
    <Stack spacing={4} sx={{alignItems: 'center', maxWidth: 720, mx: 'auto', width: '100%'}}>
      <Typography variant='h4' component='h1' sx={{textAlign: 'center'}}>
        {question.prompt}
      </Typography>
      {question.hint && (
        <Typography variant='body2' color='text.secondary' sx={{textAlign: 'center'}}>
          {question.hint}
        </Typography>
      )}
      {renderBody(question, answers, minimumWage, countryCode, onAnswer)}
      {showAdvanceButton && (
        <Button variant='contained' size='large' onClick={onAdvance} disabled={!canAdvance}>
          {isLast ? 'Terminar' : 'Siguiente'}
        </Button>
      )}
    </Stack>
  )
}
