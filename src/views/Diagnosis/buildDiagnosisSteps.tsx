import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  isAnswerComplete,
  isQuestionApplicable,
  type AnswerValue,
  type Answers,
  type DiagnosisCategoryId,
  type DiagnosisQuestion,
} from '../../content/diagnosis'
import type {MinimumWageEntry} from '../../content/minimumWages'
import type {Step} from '../../components/Stepper'
import DiagnosisQuestionBody from './DiagnosisQuestionBody'
import SectionScore from './SectionScore'
import Summary from './Summary'

/**
 * Convierte el cuestionario + nodos de resultado en una lista plana de
 * `Step<AnswerValue>` que el Stepper genérico sabe orquestar.
 *
 * Reglas:
 *
 *   - Cada `DiagnosisQuestion` se vuelve un Step con `isApplicable` y
 *     `isComplete` delegados a las funciones existentes de diagnosis.ts.
 *   - Después de las preguntas de cada categoría se inserta un Step
 *     intersticial `__sectionScore__<cat>` con `kind: 'interstitial'`,
 *     `isApplicable: () => true`, `isComplete: () => true`.
 *   - Al final se inserta un Step intersticial `__summary__` con la
 *     pantalla de resumen.
 *
 * SMM y countryCode se cierran sobre el closure — si cambian, se
 * recompone llamando a `buildDiagnosisSteps` de nuevo (típicamente lo
 * hacemos en un useMemo).
 */
export function buildDiagnosisSteps(opts: {
  minimumWage: MinimumWageEntry | null
  countryCode: string | null
  onRestart: () => void
}): Step<AnswerValue>[] {
  const {minimumWage, countryCode, onRestart} = opts
  const steps: Step<AnswerValue>[] = []

  const questionsByCategory: Record<DiagnosisCategoryId, DiagnosisQuestion[]> = {
    base: [],
    debt: [],
    stability: [],
    investment: [],
  }
  for (const q of DIAGNOSIS_QUESTIONS) {
    questionsByCategory[q.category].push(q)
  }

  for (const cat of CATEGORY_ORDER) {
    for (const q of questionsByCategory[cat]) {
      steps.push(buildQuestionStep(q, minimumWage, countryCode))
    }
    const isFinalSection = cat === CATEGORY_ORDER[CATEGORY_ORDER.length - 1]
    steps.push(buildSectionScoreStep(cat, isFinalSection, minimumWage, countryCode))
  }

  steps.push(buildSummaryStep(minimumWage, countryCode, onRestart))

  return steps
}

function buildQuestionStep(
  q: DiagnosisQuestion,
  minimumWage: MinimumWageEntry | null,
  countryCode: string | null,
): Step<AnswerValue> {
  return {
    id: q.storageKey,
    title: q.title,
    tag: CATEGORIES[q.category].shortLabel,
    tagColor: CATEGORIES[q.category].color,
    header: {prompt: q.prompt, hint: q.hint},
    isApplicable: answers => isQuestionApplicable(q, answers as Answers),
    isComplete: answers => isAnswerComplete(q, answers as Answers),
    render: ctx => (
      <DiagnosisQuestionBody
        question={q}
        answers={ctx.answers as Answers}
        answer={ctx.answer}
        minimumWage={minimumWage}
        countryCode={countryCode}
        setAnswer={ctx.setAnswer}
        commit={ctx.commit}
      />
    ),
  }
}

function buildSectionScoreStep(
  category: DiagnosisCategoryId,
  isFinal: boolean,
  minimumWage: MinimumWageEntry | null,
  countryCode: string | null,
): Step<AnswerValue> {
  return {
    id: `__sectionScore__${category}`,
    kind: 'interstitial',
    tag: CATEGORIES[category].shortLabel,
    tagColor: CATEGORIES[category].color,
    isApplicable: () => true,
    isComplete: () => true,
    render: ctx => (
      <SectionScore
        category={category}
        answers={ctx.answers as Answers}
        smm={minimumWage?.amount ?? null}
        countryCode={countryCode}
        isFinal={isFinal}
        onContinue={() => ctx.commit()}
      />
    ),
  }
}

function buildSummaryStep(
  minimumWage: MinimumWageEntry | null,
  countryCode: string | null,
  onRestart: () => void,
): Step<AnswerValue> {
  return {
    id: '__summary__',
    kind: 'interstitial',
    isApplicable: () => true,
    isComplete: () => true,
    render: ctx => (
      <Summary
        answers={ctx.answers as Answers}
        smm={minimumWage?.amount ?? null}
        countryCode={countryCode}
        onRestart={onRestart}
      />
    ),
  }
}
