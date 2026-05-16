import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {AnswersMap, Step, StepperActions, StepperState} from './types'

/**
 * State machine pura del Stepper.
 *
 * - Mantiene `answers` y `currentId`.
 * - Computa `visibleSteps` (aplicables) on the fly.
 * - Si una respuesta vuelve no-aplicable al paso actual, lo mueve al
 *   siguiente aplicable del flujo.
 * - `commit(value?)` setea (opcional) y auto-avanza tras
 *   `autoAdvanceMs`; cancelable si el usuario navega antes.
 *
 * Devuelve `{state, actions}`. Pensado para consumirse desde
 * `<Stepper>` o desde tests directos.
 */
export function useStepper<TAnswer>(opts: {
  steps: readonly Step<TAnswer>[]
  initialAnswers?: AnswersMap<TAnswer>
  initialStepId?: string
  autoAdvanceMs?: number
  onAnswersChange?: (answers: AnswersMap<TAnswer>) => void
  onStepChange?: (stepId: string | null) => void
  onComplete?: (answers: AnswersMap<TAnswer>) => void
}): {state: StepperState<TAnswer>; actions: StepperActions<TAnswer>} {
  const {steps, initialAnswers, initialStepId, autoAdvanceMs = 250} = opts
  const onAnswersChange = opts.onAnswersChange
  const onStepChange = opts.onStepChange
  const onComplete = opts.onComplete

  const [answers, setAnswers] = useState<AnswersMap<TAnswer>>(initialAnswers ?? {})
  const [currentId, setCurrentId] = useState<string | null>(() => {
    if (initialStepId) return initialStepId
    const firstApplicable = steps.find(s => s.isApplicable(initialAnswers ?? {}))
    return firstApplicable?.id ?? null
  })
  const [done, setDone] = useState(false)

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current)
      autoAdvanceTimer.current = null
    }
  }, [])

  // Cleanup on unmount.
  useEffect(() => cancelAutoAdvance, [cancelAutoAdvance])

  const visibleSteps = useMemo(
    () => steps.filter(s => s.isApplicable(answers)),
    [steps, answers],
  )

  // Si el paso actual dejó de ser aplicable, saltar al siguiente que
  // sí lo sea (avanzando por el orden original — no retroceder).
  const normalizedCurrentId = useMemo(() => {
    if (done) return null
    if (currentId === null) return visibleSteps[0]?.id ?? null
    if (visibleSteps.some(s => s.id === currentId)) return currentId
    // No aplicable: avanzar al siguiente aplicable posterior al actual
    // en el orden ORIGINAL de `steps`.
    const originalIdx = steps.findIndex(s => s.id === currentId)
    for (let i = originalIdx + 1; i < steps.length; i++) {
      if (visibleSteps.some(v => v.id === steps[i].id)) return steps[i].id
    }
    // Si no hay posteriores aplicables, ir al último aplicable.
    return visibleSteps[visibleSteps.length - 1]?.id ?? null
  }, [currentId, done, steps, visibleSteps])

  useEffect(() => {
    if (normalizedCurrentId !== currentId) {
      setCurrentId(normalizedCurrentId)
    }
  }, [normalizedCurrentId, currentId])

  const currentIndex = visibleSteps.findIndex(s => s.id === normalizedCurrentId)
  const currentStep = currentIndex === -1 ? null : visibleSteps[currentIndex]

  const totalCount = steps.length
  const resolvedCount = useMemo(() => {
    let n = 0
    for (const s of steps) {
      if (!s.isApplicable(answers)) n++
      else if (s.isComplete(answers)) n++
    }
    return n
  }, [steps, answers])
  const progress = totalCount === 0 ? 100 : Math.round((resolvedCount / totalCount) * 100)

  const isFirst = currentIndex <= 0
  const isLast = currentIndex >= visibleSteps.length - 1

  // ---------------- Actions ----------------

  const setAnswerById = useCallback(
    (id: string, value: TAnswer) => {
      setAnswers(prev => {
        const next = {...prev, [id]: value}
        onAnswersChange?.(next)
        return next
      })
    },
    [onAnswersChange],
  )

  const emitStepChange = useCallback(
    (id: string | null) => {
      onStepChange?.(id)
    },
    [onStepChange],
  )

  const goNext = useCallback(() => {
    cancelAutoAdvance()
    if (!currentStep) return
    // Re-evaluar visibleSteps con respuestas vigentes (asíncronamente
    // las respuestas pueden no haber updated todavía, pero el state
    // siempre refleja la última versión a este punto).
    const idx = visibleSteps.findIndex(s => s.id === currentStep.id)
    const nextStep = visibleSteps[idx + 1]
    if (nextStep) {
      setCurrentId(nextStep.id)
      emitStepChange(nextStep.id)
      return
    }
    // Último paso del flujo aplicable: marcamos done.
    setDone(true)
    setCurrentId(null)
    emitStepChange(null)
    onComplete?.(answers)
  }, [cancelAutoAdvance, currentStep, visibleSteps, emitStepChange, onComplete, answers])

  const goBack = useCallback(() => {
    cancelAutoAdvance()
    if (done) {
      // Volver al último paso visible
      const last = visibleSteps[visibleSteps.length - 1]
      if (last) {
        setDone(false)
        setCurrentId(last.id)
        emitStepChange(last.id)
      }
      return
    }
    if (currentIndex > 0) {
      const prev = visibleSteps[currentIndex - 1]
      setCurrentId(prev.id)
      emitStepChange(prev.id)
    }
  }, [cancelAutoAdvance, currentIndex, done, visibleSteps, emitStepChange])

  const goTo = useCallback(
    (id: string) => {
      cancelAutoAdvance()
      const target = visibleSteps.find(s => s.id === id)
      if (!target) return
      setDone(false)
      setCurrentId(target.id)
      emitStepChange(target.id)
    },
    [cancelAutoAdvance, visibleSteps, emitStepChange],
  )

  const reset = useCallback(() => {
    cancelAutoAdvance()
    setAnswers(initialAnswers ?? {})
    const first = steps.find(s => s.isApplicable(initialAnswers ?? {}))?.id ?? null
    setDone(false)
    setCurrentId(first)
    emitStepChange(first)
    onAnswersChange?.(initialAnswers ?? {})
  }, [cancelAutoAdvance, initialAnswers, steps, emitStepChange, onAnswersChange])

  const commit = useCallback(
    (value?: TAnswer) => {
      cancelAutoAdvance()
      if (!currentStep) return
      // Si se pasó un value, setearlo. Calcular el state que tendríamos
      // después de aplicarlo, para decidir si avanzar.
      const projected: AnswersMap<TAnswer> =
        value === undefined ? answers : {...answers, [currentStep.id]: value}
      if (value !== undefined) {
        setAnswerById(currentStep.id, value)
      }
      if (!currentStep.isComplete(projected)) return
      // Recalcular visibleSteps con el state proyectado para encontrar
      // el siguiente aplicable.
      const projectedVisible = steps.filter(s => s.isApplicable(projected))
      const idx = projectedVisible.findIndex(s => s.id === currentStep.id)
      const nextStep = projectedVisible[idx + 1]
      autoAdvanceTimer.current = setTimeout(() => {
        if (nextStep) {
          setCurrentId(nextStep.id)
          emitStepChange(nextStep.id)
        } else {
          setDone(true)
          setCurrentId(null)
          emitStepChange(null)
          onComplete?.(projected)
        }
      }, autoAdvanceMs)
    },
    [
      cancelAutoAdvance,
      currentStep,
      answers,
      setAnswerById,
      steps,
      autoAdvanceMs,
      emitStepChange,
      onComplete,
    ],
  )

  const state: StepperState<TAnswer> = {
    allSteps: steps,
    visibleSteps,
    currentIndex,
    currentStep,
    answers,
    totalCount,
    resolvedCount,
    progress,
    isFirst,
    isLast,
    done,
  }

  const actions: StepperActions<TAnswer> = {
    setAnswer: setAnswerById,
    goNext,
    goBack,
    goTo,
    reset,
    commit,
  }

  return {state, actions}
}
