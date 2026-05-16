import {useMemo} from 'react'
import {Box, Stack, Typography, useTheme} from '@mui/material'
import {motion} from 'framer-motion'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  isAnswerComplete,
  isQuestionApplicable,
  type AnswerValue,
  type Answers,
  type DiagnosisCategoryId,
} from '../../content/diagnosis'
import type {StepperState} from '../../components/Stepper'

/**
 * Barra de progreso del diagnóstico — un segmento por sección
 * (`base/debt/stability/investment`), con el color asignado a cada una
 * en `CATEGORIES`. Cada segmento se rellena animado según
 * (preguntas resueltas) / (preguntas aplicables) de su sección.
 *
 * Por encima de los segmentos, los nombres cortos de cada sección. La
 * sección activa se resalta (texto en color, peso 700).
 */

type SectionProgress = {
  id: DiagnosisCategoryId
  label: string
  color: 'primary' | 'warning' | 'info' | 'success'
  pct: number
  isActive: boolean
}

const computeSectionStats = (
  category: DiagnosisCategoryId,
  answers: Answers,
): {applicable: number; resolved: number} => {
  let applicable = 0
  let resolved = 0
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (q.category !== category) continue
    if (!isQuestionApplicable(q, answers)) continue
    applicable++
    if (isAnswerComplete(q, answers)) resolved++
  }
  return {applicable, resolved}
}

export function DiagnosisProgress({state}: {state: StepperState<AnswerValue>}) {
  const theme = useTheme()
  const answers = state.answers as Answers
  const activeCategory: DiagnosisCategoryId | null = useMemo(() => {
    const id = state.currentStep?.id
    if (!id) return null
    // Intersticiales tienen id `__sectionScore__<cat>`
    if (id.startsWith('__sectionScore__')) {
      return id.replace('__sectionScore__', '') as DiagnosisCategoryId
    }
    const q = DIAGNOSIS_QUESTIONS.find(qq => qq.storageKey === id)
    return q?.category ?? null
  }, [state.currentStep])

  const sections: SectionProgress[] = useMemo(
    () =>
      CATEGORY_ORDER.map(cat => {
        const {applicable, resolved} = computeSectionStats(cat, answers)
        const pct = applicable === 0 ? 0 : Math.round((resolved / applicable) * 100)
        return {
          id: cat,
          label: CATEGORIES[cat].shortLabel,
          color: CATEGORIES[cat].color,
          pct,
          isActive: cat === activeCategory,
        }
      }),
    [answers, activeCategory],
  )

  return (
    <Stack spacing={{xs: 0.75, md: 1}} sx={{width: '100%', maxWidth: 720, mx: 'auto'}}>
      <Stack direction='row' spacing={{xs: 0.5, md: 1}} sx={{px: 0.25}}>
        {sections.map(s => (
          <Box key={s.id} sx={{flex: 1, textAlign: 'center', minWidth: 0}}>
            <Typography
              sx={{
                fontWeight: s.isActive ? 700 : 500,
                color: s.isActive ? theme.palette[s.color].main : 'text.secondary',
                letterSpacing: {xs: '0.02em', md: '0.04em'},
                textTransform: 'uppercase',
                fontSize: {xs: '0.625rem', md: '0.75rem'},
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Stack direction='row' spacing={{xs: 0.5, md: 1}}>
        {sections.map(s => (
          <Box
            key={s.id}
            sx={{
              flex: 1,
              height: {xs: 6, md: 8},
              borderRadius: 4,
              bgcolor: 'divider',
              overflow: 'hidden',
              position: 'relative',
            }}>
            <motion.div
              initial={{width: 0}}
              animate={{width: `${s.pct}%`}}
              transition={{type: 'spring', stiffness: 110, damping: 22}}
              style={{
                height: '100%',
                background: theme.palette[s.color].main,
                borderRadius: 4,
              }}
            />
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
