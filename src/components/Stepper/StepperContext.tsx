import {createContext, useContext, type ReactNode} from 'react'
import type {StepperActions, StepperState} from './types'

/**
 * Context para que partes internas del Stepper (header, navegación,
 * progreso, sidebar) accedan al state y a las acciones sin prop
 * drilling. El render del paso recibe la info via `StepRenderCtx`
 * para mantener su contrato simple.
 */

type StepperContextValue = {
  state: StepperState<unknown>
  actions: StepperActions<unknown>
}

const StepperCtx = createContext<StepperContextValue | null>(null)

export function StepperProvider({
  state,
  actions,
  children,
}: {
  state: StepperState<unknown>
  actions: StepperActions<unknown>
  children: ReactNode
}) {
  return <StepperCtx.Provider value={{state, actions}}>{children}</StepperCtx.Provider>
}

export function useStepperState<TAnswer = unknown>(): StepperState<TAnswer> {
  const ctx = useContext(StepperCtx)
  if (!ctx) throw new Error('useStepperState must be used inside <Stepper>')
  return ctx.state as StepperState<TAnswer>
}

export function useStepperActions<TAnswer = unknown>(): StepperActions<TAnswer> {
  const ctx = useContext(StepperCtx)
  if (!ctx) throw new Error('useStepperActions must be used inside <Stepper>')
  return ctx.actions as StepperActions<TAnswer>
}
