import {useEffect, useMemo, useState} from 'react'
import {Box, Button, Chip, LinearProgress, Paper, Stack, Typography} from '@mui/material'
import ChipGroup from '../../components/inputs/ChipGroup'
import RangeSlider from '../../components/inputs/RangeSlider'
import Toggle from '../../components/inputs/Toggle'
import {
  CATEGORIES,
  DIAGNOSIS_QUESTIONS,
  filterApplicableQuestions,
  isQuestionSkipped,
  type DiagnosisQuestion,
} from '../../content/diagnosis'
import {detectMinimumWage} from '../../utils/detectCountry'
import {formatMinimumWage, type MinimumWageEntry} from '../../content/minimumWages'
import Summary from './Summary'
import DecisionTree from './DecisionTree'

type AnswerValue = string | number | boolean
type Answers = Record<string, AnswerValue>

const cleanOrphanAnswers = (answers: Answers): Answers => {
  const next: Answers = {...answers}
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (q.dependsOn && next[q.dependsOn.storageKey] !== q.dependsOn.equals) {
      delete next[q.storageKey]
    }
  }
  return next
}

const computeProgress = (answers: Answers): number => {
  let resolved = 0
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (answers[q.storageKey] !== undefined) resolved += 1
    else if (isQuestionSkipped(q, answers)) resolved += 1
  }
  return Math.min(100, (resolved / DIAGNOSIS_QUESTIONS.length) * 100)
}

const AUTO_ADVANCE_MS = 250

export default function Diagnosis() {
  const [answers, setAnswers] = useState<Answers>({})
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [minimumWage, setMinimumWage] = useState<MinimumWageEntry | null>(null)

  useEffect(() => {
    setMinimumWage(detectMinimumWage())
  }, [])

  const visible = useMemo(() => filterApplicableQuestions(DIAGNOSIS_QUESTIONS, answers), [answers])
  const safeIndex = Math.min(index, Math.max(visible.length - 1, 0))
  const current: DiagnosisQuestion | undefined = visible[safeIndex]
  const isLast = safeIndex === visible.length - 1
  const progress = computeProgress(answers)
  const currentCategory = current ? CATEGORIES[current.category] : null

  const updateAnswer = (key: string, value: AnswerValue): Answers => {
    const next = cleanOrphanAnswers({...answers, [key]: value})
    setAnswers(next)
    return next
  }

  const goNext = (afterAnswers: Answers) => {
    const nextVisible = filterApplicableQuestions(DIAGNOSIS_QUESTIONS, afterAnswers)
    if (safeIndex >= nextVisible.length - 1) {
      setDone(true)
    } else {
      setIndex(safeIndex + 1)
    }
  }

  const handleChips = (key: string, value: string) => {
    const next = updateAnswer(key, value)
    setTimeout(() => goNext(next), AUTO_ADVANCE_MS)
  }

  const handleToggle = (key: string, value: boolean) => {
    const next = updateAnswer(key, value)
    setTimeout(() => goNext(next), AUTO_ADVANCE_MS)
  }

  const handleSliderChange = (key: string, value: number) => {
    updateAnswer(key, value)
  }

  const handleBack = () => {
    if (safeIndex > 0) setIndex(safeIndex - 1)
  }

  const handleSliderConfirm = () => {
    goNext(answers)
  }

  const handleRestart = () => {
    setAnswers({})
    setIndex(0)
    setDone(false)
  }

  const mainContent = done ? (
    <Summary answers={answers} onRestart={handleRestart} />
  ) : !current ? (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
      <Typography>Cargando…</Typography>
    </Box>
  ) : (
    <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Box sx={{px: 3, pt: 3}}>
        {minimumWage && (
          <Paper
            variant="outlined"
            sx={{
              p: 1.25,
              mb: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              bgcolor: 'background.default',
            }}
            aria-label="Referencia de salario mínimo"
          >
            <Typography variant="caption" color="text.secondary">
              SMM en {minimumWage.countryName} ({minimumWage.year})
            </Typography>
            <Chip
              label={formatMinimumWage(minimumWage)}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Typography variant="caption" color="text.disabled" sx={{ml: 'auto'}}>
              referencia para tus cálculos
            </Typography>
          </Paper>
        )}

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{height: 6, borderRadius: 3}}
        />
        <Box sx={{mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}% del diagnóstico
          </Typography>
          {currentCategory && (
            <Chip
              label={currentCategory.label}
              size="small"
              color={currentCategory.color}
              variant="outlined"
              sx={{height: 22}}
            />
          )}
        </Box>
      </Box>

      <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 3, py: 4}}>
        <Stack spacing={4} sx={{alignItems: 'center', maxWidth: 640, mx: 'auto', width: '100%'}}>
          <Typography variant="h4" component="h1" sx={{textAlign: 'center'}}>
            {current.prompt}
          </Typography>
          {current.hint && (
            <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center'}}>
              {current.hint}
            </Typography>
          )}

          {current.examples && current.examples.length > 0 && (
            <Box
              sx={{
                width: '100%',
                maxWidth: 560,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                bgcolor: 'background.default',
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{display: 'block', mb: 1, lineHeight: 1}}
              >
                Ejemplos
              </Typography>
              <Box component="ul" sx={{m: 0, pl: 2.5}}>
                {current.examples.map((ex, i) => (
                  <Typography
                    key={i}
                    component="li"
                    variant="caption"
                    color="text.secondary"
                    sx={{lineHeight: 1.5}}
                  >
                    {ex}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {current.type === 'chips' && (
            <ChipGroup
              options={current.options}
              value={(answers[current.storageKey] as string | undefined) ?? null}
              onChange={value => handleChips(current.storageKey, value)}
              ariaLabel={current.prompt}
            />
          )}

          {current.type === 'toggle' && (
            <Toggle
              value={(answers[current.storageKey] as boolean | undefined) ?? null}
              onChange={value => handleToggle(current.storageKey, value)}
              trueLabel={current.trueLabel}
              falseLabel={current.falseLabel}
              ariaLabel={current.prompt}
            />
          )}

          {current.type === 'slider' && (
            <Stack spacing={3} sx={{alignItems: 'center', width: '100%'}}>
              <RangeSlider
                value={(answers[current.storageKey] as number | undefined) ?? current.defaultValue}
                onChange={value => handleSliderChange(current.storageKey, value)}
                min={current.min}
                max={current.max}
                step={current.step}
                unit={current.unit}
                marks={current.marks}
                ariaLabel={current.prompt}
              />
              <Button variant="contained" size="large" onClick={handleSliderConfirm}>
                {isLast ? 'Terminar' : 'Siguiente'}
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      <Box sx={{display: 'flex', justifyContent: 'space-between', px: 3, pb: 3}}>
        <Button onClick={handleBack} disabled={safeIndex === 0}>
          Atrás
        </Button>
        <Box />
      </Box>
    </Box>
  )

  return (
    <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, minHeight: '100vh'}}>
      <Box sx={{flex: 1, minWidth: 0}}>{mainContent}</Box>
      <Box
        component="aside"
        sx={{
          width: {xs: '100%', md: 380},
          flexShrink: 0,
          borderLeft: {md: '1px solid'},
          borderTop: {xs: '1px solid', md: 'none'},
          borderColor: {xs: 'divider', md: 'divider'},
          bgcolor: 'background.default',
          p: 2,
          display: {xs: 'none', md: 'block'},
        }}
      >
        <DecisionTree
          answers={answers}
          currentStorageKey={done ? null : (current?.storageKey ?? null)}
        />
      </Box>
    </Box>
  )
}
