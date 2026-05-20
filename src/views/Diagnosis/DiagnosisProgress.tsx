import {useMemo} from 'react'
import {Box, Stack, Typography, useTheme} from '@mui/material'
import {motion} from 'framer-motion'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  isQuestionApplicable,
  isQuestionSkipped,
  type AnswerValue,
  type Answers,
  type DiagnosisCategoryId,
  type DiagnosisQuestion,
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
  color: 'primary' | 'warning' | 'info' | 'success' | 'secondary'
  pct: number
  isActive: boolean
}

/**
 * Versión "estricta" de complitud para la barra: a diferencia de
 * `isAnswerComplete`, NO cuenta como respondida una pregunta tipo
 * slider/number que sólo tiene su `defaultValue` (sin que el usuario
 * la haya tocado). El defaultValue se persiste en `answers` cuando el
 * usuario LLEGA al paso (via `DefaultValuePersist`), así que basta con
 * mirar la presencia de la clave en `answers`.
 *
 * Esto evita inflar la barra al primer render con preguntas que el
 * usuario todavía no vio.
 */
const isAnswerTouched = (q: DiagnosisQuestion, answers: Answers): boolean => {
  const value = answers[q.storageKey]
  if (value === undefined) return false
  if (q.type === 'multiChips') return Array.isArray(value) && value.length > 0
  if (q.type === 'grid') {
    if (!Array.isArray(value)) return false
    return value.some(v => v !== null && v !== undefined)
  }
  return true
}

/**
 * Cuenta el progreso de una sección con denominador fijo (total real de
 * preguntas de la categoría). Una pregunta cuenta como "resuelta" si:
 *   - el usuario la respondió (presente en `answers` con valor útil), o
 *   - quedó saltada porque una rama anterior la bloqueó
 *     (`isQuestionSkipped`).
 *
 * Una pregunta pendiente cuya cláusula padre todavía no fue respondida
 * no cuenta como resuelta ni como saltada — sigue contando en el
 * denominador hasta que se resuelva.
 *
 * Esto evita dos bugs:
 *   - secciones con todas sus preguntas saltadas mostraban 0% en lugar
 *     de 100%.
 *   - al primer render, preguntas slider/number con `defaultValue` se
 *     contaban como respondidas y la barra arrancaba con progreso > 0.
 */
const computeSectionStats = (
  category: DiagnosisCategoryId,
  answers: Answers,
): {total: number; resolved: number} => {
  let total = 0
  let resolved = 0
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (q.category !== category) continue
    total++
    if (isQuestionSkipped(q, answers)) {
      resolved++
      continue
    }
    if (isQuestionApplicable(q, answers) && isAnswerTouched(q, answers)) {
      resolved++
    }
  }
  return {total, resolved}
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

  /**
   * Conjunto de categorías ya "alcanzadas" por el usuario. Una sección
   * está alcanzada si:
   *   - es la categoría activa (`currentStep` o `__sectionScore__<cat>`),
   *   - tiene al menos una pregunta tocada en `answers` (el usuario
   *     pasó por una de sus preguntas raíz),
   *   - el flujo ya terminó (`state.done`).
   *
   * Las categorías NO alcanzadas se muestran en 0% aunque alguna de sus
   * preguntas haya quedado `skipped` por respuestas en secciones
   * anteriores. Sin esto, contestar p.ej. `formalEmployment` en base
   * bloquea `hasARL` en protección y el segmento de protección se mueve
   * solo aunque el usuario aún esté respondiendo base.
   *
   * Asume el invariante de que toda categoría tiene al menos una
   * pregunta sin `dependsOn` (raíz): así, llegar a una sección implica
   * tocar al menos una de sus respuestas, y queda marcada como
   * alcanzada de forma natural.
   */
  const reachedCategories = useMemo(() => {
    const reached = new Set<DiagnosisCategoryId>()
    if (state.done) {
      for (const c of CATEGORY_ORDER) reached.add(c)
      return reached
    }
    if (activeCategory) reached.add(activeCategory)
    for (const q of DIAGNOSIS_QUESTIONS) {
      if (q.storageKey in answers) reached.add(q.category)
    }
    return reached
  }, [state.done, activeCategory, answers])

  const sections: SectionProgress[] = useMemo(
    () =>
      CATEGORY_ORDER.map(cat => {
        if (!reachedCategories.has(cat)) {
          return {
            id: cat,
            label: CATEGORIES[cat].shortLabel,
            color: CATEGORIES[cat].color,
            pct: 0,
            isActive: cat === activeCategory,
          }
        }
        const {total, resolved} = computeSectionStats(cat, answers)
        const pct = total === 0 ? 0 : Math.round((resolved / total) * 100)
        return {
          id: cat,
          label: CATEGORIES[cat].shortLabel,
          color: CATEGORIES[cat].color,
          pct,
          isActive: cat === activeCategory,
        }
      }),
    [answers, activeCategory, reachedCategories],
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
