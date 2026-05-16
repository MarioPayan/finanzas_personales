import {useEffect, useMemo, useState} from 'react'
import {Box, Button, LinearProgress, Link, Typography} from '@mui/material'
import {
  DIAGNOSIS_QUESTIONS,
  cleanOrphanAnswers,
  filterApplicableQuestions,
  isAnswerComplete,
  isQuestionSkipped,
  type AnswerValue,
  type Answers,
  type DiagnosisCategoryId,
} from '../../content/diagnosis'
import {detectCountryCode, detectMinimumWage} from '../../utils/detectCountry'
import {type MinimumWageEntry} from '../../content/minimumWages'
import Summary from './Summary'
import Sidebar from './Sidebar'
import QuestionStep from './QuestionStep'
import SectionScore from './SectionScore'

const FIRST_KEY = DIAGNOSIS_QUESTIONS.find(q => !q.dependsOn)?.storageKey ?? null
const AUTO_ADVANCE_MS = 250

const computeProgress = (answers: Answers): number => {
  let resolved = 0
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (isAnswerComplete(q, answers) || isQuestionSkipped(q, answers)) resolved += 1
  }
  return Math.min(100, (resolved / DIAGNOSIS_QUESTIONS.length) * 100)
}

const categoryOf = (storageKey: string): DiagnosisCategoryId | null =>
  DIAGNOSIS_QUESTIONS.find(q => q.storageKey === storageKey)?.category ?? null

export default function Diagnosis() {
  const [answers, setAnswers] = useState<Answers>({})
  const [currentKey, setCurrentKey] = useState<string | null>(FIRST_KEY)
  const [done, setDone] = useState(false)
  const [minimumWage, setMinimumWage] = useState<MinimumWageEntry | null>(null)
  const [countryCode, setCountryCode] = useState<string | null>(null)
  /**
   * Cuando el usuario termina la última pregunta de una sección, se setea
   * a esa categoría para mostrar la pantalla de puntaje. El avance real
   * (a la siguiente sección o al diagnóstico final) ocurre cuando el
   * usuario presiona "Continuar".
   */
  const [interstitial, setInterstitial] = useState<{
    category: DiagnosisCategoryId
    isFinal: boolean
  } | null>(null)

  useEffect(() => {
    setMinimumWage(detectMinimumWage())
    setCountryCode(detectCountryCode())
  }, [])

  const visible = useMemo(() => filterApplicableQuestions(DIAGNOSIS_QUESTIONS, answers), [answers])
  const current = visible.find(q => q.storageKey === currentKey) ?? visible[0]
  const currentIdx = current ? visible.indexOf(current) : -1
  const isFirst = currentIdx <= 0
  const isLast = currentIdx === visible.length - 1
  const progress = computeProgress(answers)

  const updateAnswer = (key: string, value: AnswerValue): Answers => {
    const next = cleanOrphanAnswers({...answers, [key]: value})
    setAnswers(next)
    return next
  }

  const goNext = (afterAnswers: Answers, fromKey: string) => {
    const next = filterApplicableQuestions(DIAGNOSIS_QUESTIONS, afterAnswers)
    const idx = next.findIndex(q => q.storageKey === fromKey)
    const fromCategory = categoryOf(fromKey)
    const isLastApplicable = idx === -1 || idx === next.length - 1
    const nextQ = isLastApplicable ? null : next[idx + 1]
    const crossesSection = nextQ ? nextQ.category !== fromCategory : false

    if (fromCategory && (isLastApplicable || crossesSection)) {
      setInterstitial({category: fromCategory, isFinal: isLastApplicable})
      return
    }

    if (nextQ) setCurrentKey(nextQ.storageKey)
  }

  const handleAnswer = (key: string, value: AnswerValue, opts?: {commit?: boolean}) => {
    const next = updateAnswer(key, value)
    if (opts?.commit) {
      setTimeout(() => goNext(next, key), AUTO_ADVANCE_MS)
    }
  }

  const handleConfirm = () => {
    if (current) goNext(answers, current.storageKey)
  }

  const handleBack = () => {
    if (currentIdx > 0) setCurrentKey(visible[currentIdx - 1].storageKey)
  }

  const handleRestart = () => {
    setAnswers({})
    setCurrentKey(FIRST_KEY)
    setDone(false)
    setInterstitial(null)
  }

  const dismissInterstitial = () => {
    if (!interstitial) return
    if (interstitial.isFinal) {
      setDone(true)
      setInterstitial(null)
      return
    }
    if (current) {
      const next = filterApplicableQuestions(DIAGNOSIS_QUESTIONS, answers)
      const idx = next.findIndex(q => q.storageKey === current.storageKey)
      const nextQ = idx >= 0 ? next[idx + 1] : null
      if (nextQ) {
        setCurrentKey(nextQ.storageKey)
      } else {
        setDone(true)
      }
    }
    setInterstitial(null)
  }

  const mainContent = done ? (
    <Summary
      answers={answers}
      smm={minimumWage?.amount ?? null}
      countryCode={countryCode}
      onRestart={handleRestart}
    />
  ) : interstitial ? (
    <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', px: 3}}>
      <SectionScore
        category={interstitial.category}
        answers={answers}
        smm={minimumWage?.amount ?? null}
        countryCode={countryCode}
        isFinal={interstitial.isFinal}
        onContinue={dismissInterstitial}
      />
    </Box>
  ) : !current ? (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
      <Typography>Cargando…</Typography>
    </Box>
  ) : (
    <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Box sx={{px: 3, pt: 3}}>
        <LinearProgress variant='determinate' value={progress} sx={{height: 6, borderRadius: 3}} />
        <Typography variant='caption' color='text.secondary' sx={{mt: 1, display: 'block'}}>
          {Math.round(progress)}% del diagnóstico
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 3,
          py: 4,
        }}>
        <QuestionStep
          question={current}
          answers={answers}
          minimumWage={minimumWage}
          countryCode={countryCode}
          isLast={isLast}
          onAnswer={handleAnswer}
          onAdvance={handleConfirm}
        />
      </Box>

      <Box sx={{px: 3, pb: 3}}>
        <Button onClick={handleBack} disabled={isFirst}>
          Atrás
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, minHeight: '100vh'}}>
      <Link
        href='/debug'
        sx={{
          position: 'fixed',
          top: 8,
          right: 12,
          fontSize: 11,
          fontFamily: 'monospace',
          color: 'text.disabled',
          textDecoration: 'none',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          px: 1,
          py: 0.5,
          zIndex: 1200,
          '&:hover': {color: 'text.secondary'},
        }}
      >
        debug
      </Link>
      <Box sx={{flex: 1, minWidth: 0}}>{mainContent}</Box>
      <Box
        component='aside'
        sx={{
          width: {xs: '100%', md: 380},
          flexShrink: 0,
          borderLeft: {md: '1px solid'},
          borderTop: {xs: '1px solid', md: 'none'},
          borderColor: 'divider',
          bgcolor: 'background.default',
          p: 2,
          display: {xs: 'none', md: 'block'},
        }}>
        <Sidebar
          answers={answers}
          currentStorageKey={done || interstitial ? null : (current?.storageKey ?? null)}
          minimumWage={minimumWage}
          countryCode={countryCode}
          onAnswer={(key, value) => updateAnswer(key, value)}
        />
      </Box>
    </Box>
  )
}
