import {Box, Stack, Typography} from '@mui/material'
import {DefaultHeader} from './defaults/DefaultHeader'
import {DefaultNavigation} from './defaults/DefaultNavigation'
import {DefaultProgress} from './defaults/DefaultProgress'
import {StepperProvider} from './StepperContext'
import {useStepper} from './useStepper'
import type {Step, StepperProps, StepperState, StepperActions} from './types'

/**
 * Componente top-level del Stepper.
 *
 * Recibe `steps: Step<TAnswer>[]` y los orquesta. No conoce el dominio
 * de cada paso — solo decide cuál mostrar, cuándo avanzar, y delega el
 * render al `step.render` con su contexto.
 *
 * Layout default (todos overridables):
 *
 *   ┌──────────────────────────────────────┐
 *   │  Progress (top)                       │
 *   │  Header (prompt + hint)               │
 *   │  Body — step.render(ctx)              │
 *   │  Navigation (Atrás / Siguiente)       │
 *   └──────────────────────────────────────┘
 *
 *   con Sidebar opcional al costado en breakpoints md+.
 */
export function Stepper<TAnswer>(props: StepperProps<TAnswer>) {
  const {state, actions} = useStepper<TAnswer>({
    steps: props.steps,
    initialAnswers: props.initialAnswers,
    initialStepId: props.initialStepId,
    autoAdvanceMs: props.autoAdvanceMs,
    onAnswersChange: props.onAnswersChange,
    onStepChange: props.onStepChange,
    onComplete: props.onComplete,
  })

  return (
    <StepperProvider
      state={state as StepperState<unknown>}
      actions={actions as StepperActions<unknown>}>
      <StepperLayout
        state={state}
        actions={actions}
        renderHeader={props.renderHeader}
        renderProgress={props.renderProgress}
        renderNavigation={props.renderNavigation}
        renderSidebar={props.renderSidebar}
        renderDone={props.renderDone}
      />
    </StepperProvider>
  )
}

function StepperLayout<TAnswer>({
  state,
  actions,
  renderHeader,
  renderProgress,
  renderNavigation,
  renderSidebar,
  renderDone,
}: {
  state: StepperState<TAnswer>
  actions: StepperActions<TAnswer>
} & Pick<
  StepperProps<TAnswer>,
  'renderHeader' | 'renderProgress' | 'renderNavigation' | 'renderSidebar' | 'renderDone'
>) {
  const sidebar = renderSidebar?.(state)
  const progress = renderProgress
    ? renderProgress(state)
    : <DefaultProgress state={state as StepperState<unknown>} />
  const header = renderHeader
    ? renderHeader(state)
    : <DefaultHeader state={state as StepperState<unknown>} />
  const navigation = renderNavigation
    ? renderNavigation(state, actions)
    : (
      <DefaultNavigation
        state={state as StepperState<unknown>}
        actions={actions as StepperActions<unknown>}
      />
    )

  return (
    <Box sx={{display: 'flex', minHeight: '100vh', bgcolor: 'background.default'}}>
      {sidebar && (
        <Box
          sx={{
            display: {xs: 'none', md: 'block'},
            width: 380,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
          }}>
          {sidebar}
        </Box>
      )}
      <Box sx={{flex: 1, p: {xs: 2, md: 4}}}>
        <Stack spacing={4} sx={{maxWidth: 960, mx: 'auto'}}>
          {progress}
          {state.done
            ? renderDone
              ? renderDone(state, actions)
              : <DefaultDone />
            : (
              <>
                {header}
                <StepBody state={state} actions={actions} />
                {navigation}
              </>
            )}
        </Stack>
      </Box>
    </Box>
  )
}

function StepBody<TAnswer>({
  state,
  actions,
}: {
  state: StepperState<TAnswer>
  actions: StepperActions<TAnswer>
}) {
  const step: Step<TAnswer> | null = state.currentStep
  if (!step) return null
  return (
    <Box sx={{width: '100%'}}>
      {step.render({
        answer: state.answers[step.id],
        answers: state.answers,
        setAnswer: (v: TAnswer) => actions.setAnswer(step.id, v),
        commit: (v?: TAnswer) => actions.commit(v),
      })}
    </Box>
  )
}

function DefaultDone() {
  return (
    <Box sx={{textAlign: 'center', py: 8}}>
      <Typography variant='h5'>Listo.</Typography>
      <Typography variant='body2' color='text.secondary'>
        Completaste el flujo.
      </Typography>
    </Box>
  )
}
