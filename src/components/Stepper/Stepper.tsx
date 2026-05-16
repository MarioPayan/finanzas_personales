import type {ReactNode} from 'react'
import {Box, Card, CardContent, Stack, Typography, useMediaQuery, useTheme} from '@mui/material'
import type {Theme} from '@mui/material/styles'
import {AnimatePresence, motion} from 'framer-motion'
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
        renderOverlay={props.renderOverlay}
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
  renderOverlay,
  renderDone,
}: {
  state: StepperState<TAnswer>
  actions: StepperActions<TAnswer>
} & Pick<
  StepperProps<TAnswer>,
  | 'renderHeader'
  | 'renderProgress'
  | 'renderNavigation'
  | 'renderSidebar'
  | 'renderOverlay'
  | 'renderDone'
>) {
  const theme = useTheme()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
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
            width: 360,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}>
          {sidebar}
        </Box>
      )}
      {renderOverlay?.(state, actions)}
      <Box
        sx={{
          flex: 1,
          // top: dejar espacio para los FABs en mobile (alto del FAB + padding)
          pt: {xs: 8, md: 6},
          // bottom: dejar espacio para la sticky bottom nav en mobile
          pb: {xs: state.done || state.currentStep?.kind === 'interstitial' ? 4 : 14, md: 6},
          px: {xs: 2, md: 4},
        }}>
        <Stack spacing={{xs: 3, md: 4}} sx={{maxWidth: 760, mx: 'auto'}}>
          {progress}
          {state.done ? (
            renderDone ? renderDone(state, actions) : <DefaultDone />
          ) : (
            <>
              <StepShell
                state={state}
                actions={actions}
                header={header}
                navigation={navigation}
                accentColor={state.currentStep?.tagColor ?? 'primary'}
                reducedMotion={prefersReducedMotion}
                theme={theme}
              />
            </>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

function StepShell<TAnswer>({
  state,
  actions,
  header,
  navigation,
  accentColor,
  reducedMotion,
  theme,
}: {
  state: StepperState<TAnswer>
  actions: StepperActions<TAnswer>
  header: ReactNode
  navigation: ReactNode
  accentColor: 'primary' | 'secondary' | 'warning' | 'info' | 'success' | 'error' | 'default'
  reducedMotion: boolean
  theme: Theme
}) {
  const step = state.currentStep
  if (!step) return null
  const isInterstitial = step.kind === 'interstitial'
  const accent =
    accentColor === 'default' ? theme.palette.primary.main : theme.palette[accentColor].main

  return (
    <Stack spacing={3}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={step.id}
          initial={reducedMotion ? {opacity: 1, x: 0} : {opacity: 0, x: 24}}
          animate={{opacity: 1, x: 0}}
          exit={reducedMotion ? {opacity: 1, x: 0} : {opacity: 0, x: -24}}
          transition={{duration: reducedMotion ? 0 : 0.22, ease: 'easeOut'}}>
          {isInterstitial ? (
            <Box sx={{width: '100%'}}>{renderStepBody(step, state, actions)}</Box>
          ) : (
            <Card
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
              }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: accent,
                }}
              />
              <CardContent sx={{p: {xs: 2.5, md: 5}, '&:last-child': {pb: {xs: 2.5, md: 5}}}}>
                <Stack spacing={{xs: 3, md: 4}}>
                  {header}
                  <Box>{renderStepBody(step, state, actions)}</Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
      {!isInterstitial && navigation}
    </Stack>
  )
}

function renderStepBody<TAnswer>(
  step: Step<TAnswer>,
  state: StepperState<TAnswer>,
  actions: StepperActions<TAnswer>,
): ReactNode {
  return step.render({
    answer: state.answers[step.id],
    answers: state.answers,
    setAnswer: (v: TAnswer) => actions.setAnswer(step.id, v),
    commit: (v?: TAnswer) => actions.commit(v),
  })
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
