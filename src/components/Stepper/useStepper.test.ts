// @vitest-environment jsdom
import {act, renderHook} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import {useStepper} from './useStepper'
import type {Step} from './types'

/**
 * Tests del state machine del Stepper. Los Steps acá son mocks sintéticos
 * — no acoplados al diagnóstico. Sirven para verificar:
 *
 *   - aplicabilidad y skip dinámico,
 *   - navegación adelante/atrás,
 *   - auto-advance vía commit + debounce,
 *   - normalización cuando el paso actual deja de ser aplicable,
 *   - callbacks (onAnswersChange, onStepChange, onComplete),
 *   - reset.
 *
 * Si el Stepper genérico funciona acá, el adapter de diagnosis solo tiene
 * que producir Step<AnswerValue>[] válidos.
 */

type Answer = string | number | boolean

const makeStep = (id: string, overrides: Partial<Step<Answer>> = {}): Step<Answer> => ({
  id,
  header: {prompt: `Pregunta ${id}`},
  isApplicable: () => true,
  isComplete: a => a[id] !== undefined,
  render: () => null,
  ...overrides,
})

describe('useStepper · navegación básica', () => {
  it('arranca en el primer paso aplicable', () => {
    const steps = [makeStep('a'), makeStep('b'), makeStep('c')]
    const {result} = renderHook(() => useStepper({steps}))
    expect(result.current.state.currentStep?.id).toBe('a')
    expect(result.current.state.currentIndex).toBe(0)
    expect(result.current.state.isFirst).toBe(true)
    expect(result.current.state.isLast).toBe(false)
  })

  it('goNext avanza al siguiente paso', () => {
    const steps = [makeStep('a'), makeStep('b'), makeStep('c')]
    const {result} = renderHook(() => useStepper<Answer>({steps}))
    act(() => result.current.actions.setAnswer('a', 'foo'))
    act(() => result.current.actions.goNext())
    expect(result.current.state.currentStep?.id).toBe('b')
  })

  it('goBack vuelve al anterior', () => {
    const steps = [makeStep('a'), makeStep('b'), makeStep('c')]
    const {result} = renderHook(() => useStepper<Answer>({steps}))
    act(() => result.current.actions.setAnswer('a', 'foo'))
    act(() => result.current.actions.goNext())
    act(() => result.current.actions.goBack())
    expect(result.current.state.currentStep?.id).toBe('a')
  })

  it('goNext en el último paso marca done', () => {
    const steps = [makeStep('a'), makeStep('b')]
    const onComplete = vi.fn()
    const {result} = renderHook(() => useStepper<Answer>({steps, onComplete}))
    act(() => result.current.actions.setAnswer('a', 'foo'))
    act(() => result.current.actions.goNext())
    act(() => result.current.actions.setAnswer('b', 'bar'))
    act(() => result.current.actions.goNext())
    expect(result.current.state.done).toBe(true)
    expect(result.current.state.currentStep).toBe(null)
    expect(onComplete).toHaveBeenCalledOnce()
  })
})

describe('useStepper · aplicabilidad y skip', () => {
  it('omite pasos no aplicables del flujo visible', () => {
    const steps = [makeStep('a'), makeStep('b', {isApplicable: a => a.a === 'show'}), makeStep('c')]
    const {result} = renderHook(() => useStepper<Answer>({steps}))
    expect(result.current.state.visibleSteps.map(s => s.id)).toEqual(['a', 'c'])
    act(() => result.current.actions.setAnswer('a', 'show'))
    expect(result.current.state.visibleSteps.map(s => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('si el paso actual deja de ser aplicable, salta al siguiente posterior aplicable', () => {
    const steps = [makeStep('a'), makeStep('b', {isApplicable: a => a.a === 'show'}), makeStep('c')]
    const {result} = renderHook(() => useStepper<Answer>({steps}))
    act(() => result.current.actions.setAnswer('a', 'show'))
    act(() => result.current.actions.goNext())
    expect(result.current.state.currentStep?.id).toBe('b')
    // Ahora cambiamos 'a' y 'b' deja de ser aplicable.
    act(() => result.current.actions.setAnswer('a', 'hide'))
    expect(result.current.state.currentStep?.id).toBe('c')
  })

  it('progress cuenta pasos no aplicables como resueltos', () => {
    const steps = [makeStep('a'), makeStep('b', {isApplicable: a => a.a === 'show'}), makeStep('c')]
    const {result} = renderHook(() => useStepper<Answer>({steps}))
    expect(result.current.state.totalCount).toBe(3)
    // a sin responder, b no aplicable, c sin responder → 1 resuelto
    expect(result.current.state.resolvedCount).toBe(1)
    expect(result.current.state.progress).toBe(33)
  })
})

describe('useStepper · commit y auto-advance', () => {
  it('commit setea respuesta y avanza tras autoAdvanceMs', async () => {
    vi.useFakeTimers()
    const steps = [makeStep('a'), makeStep('b')]
    const {result} = renderHook(() => useStepper<Answer>({steps, autoAdvanceMs: 200}))
    act(() => result.current.actions.commit('foo'))
    expect(result.current.state.answers.a).toBe('foo')
    expect(result.current.state.currentStep?.id).toBe('a')
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.state.currentStep?.id).toBe('b')
    vi.useRealTimers()
  })

  it('commit sin completar no avanza', () => {
    vi.useFakeTimers()
    const steps = [makeStep('a', {isComplete: () => false}), makeStep('b')]
    const {result} = renderHook(() => useStepper<Answer>({steps, autoAdvanceMs: 200}))
    act(() => result.current.actions.commit('foo'))
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.state.currentStep?.id).toBe('a')
    vi.useRealTimers()
  })

  it('navegar manualmente cancela un auto-advance pendiente', () => {
    vi.useFakeTimers()
    const steps = [makeStep('a'), makeStep('b'), makeStep('c')]
    const {result} = renderHook(() => useStepper<Answer>({steps, autoAdvanceMs: 1000}))
    act(() => result.current.actions.commit('foo'))
    // Avance al siguiente paso manualmente antes del timer
    act(() => result.current.actions.goNext())
    expect(result.current.state.currentStep?.id).toBe('b')
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    // El timer debió cancelarse — seguimos en 'b'
    expect(result.current.state.currentStep?.id).toBe('b')
    vi.useRealTimers()
  })
})

describe('useStepper · callbacks', () => {
  it('emite onAnswersChange al setear', () => {
    const onAnswersChange = vi.fn()
    const steps = [makeStep('a')]
    const {result} = renderHook(() => useStepper<Answer>({steps, onAnswersChange}))
    act(() => result.current.actions.setAnswer('a', 'foo'))
    expect(onAnswersChange).toHaveBeenCalledWith({a: 'foo'})
  })

  it('emite onStepChange al avanzar', () => {
    const onStepChange = vi.fn()
    const steps = [makeStep('a'), makeStep('b')]
    const {result} = renderHook(() => useStepper<Answer>({steps, onStepChange}))
    act(() => result.current.actions.setAnswer('a', 'foo'))
    act(() => result.current.actions.goNext())
    expect(onStepChange).toHaveBeenCalledWith('b')
  })
})

describe('useStepper · reset', () => {
  it('reset vuelve al primer paso y borra respuestas', () => {
    const steps = [makeStep('a'), makeStep('b')]
    const {result} = renderHook(() => useStepper<Answer>({steps}))
    act(() => result.current.actions.setAnswer('a', 'foo'))
    act(() => result.current.actions.goNext())
    act(() => result.current.actions.reset())
    expect(result.current.state.currentStep?.id).toBe('a')
    expect(result.current.state.answers).toEqual({})
  })
})

describe('useStepper · pasos intersticiales', () => {
  it('isComplete = true permite avanzar inmediatamente', () => {
    const steps = [
      makeStep('a'),
      makeStep('interstitial', {kind: 'interstitial', isComplete: () => true}),
      makeStep('b'),
    ]
    const {result} = renderHook(() => useStepper<Answer>({steps}))
    act(() => result.current.actions.setAnswer('a', 'foo'))
    act(() => result.current.actions.goNext())
    expect(result.current.state.currentStep?.id).toBe('interstitial')
    // sin setAnswer, debería poder seguir
    act(() => result.current.actions.goNext())
    expect(result.current.state.currentStep?.id).toBe('b')
  })

  // Test inverso (useEffect intenta unsubscribe) — placeholder por ahora,
  // se cubre indirectamente arriba.
  it.skip('actualiza state cuando un paso intersticial entra/sale del flujo', () => {})
})
