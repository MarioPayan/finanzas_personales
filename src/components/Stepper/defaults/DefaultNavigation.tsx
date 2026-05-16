import {Button, Stack} from '@mui/material'
import type {StepperActions, StepperState} from '../types'

/**
 * Footer default: Atrás / Siguiente. Para pasos intersticiales (sin
 * `isComplete` que dependa de respuesta), el CTA suele venir del propio
 * render del paso — en esos casos el adapter puede ocultar esta nav.
 */
export function DefaultNavigation({
  state,
  actions,
  hideOnInterstitial = true,
}: {
  state: StepperState<unknown>
  actions: StepperActions<unknown>
  hideOnInterstitial?: boolean
}) {
  const {currentStep, isFirst, isLast, done} = state
  if (done) return null
  if (hideOnInterstitial && currentStep?.kind === 'interstitial') return null

  const canAdvance = currentStep ? currentStep.isComplete(state.answers) : false

  return (
    <Stack
      direction='row'
      spacing={1.5}
      sx={{justifyContent: 'space-between', width: '100%', maxWidth: 720, mx: 'auto'}}>
      <Button
        variant='text'
        onClick={actions.goBack}
        disabled={isFirst}
        sx={{visibility: isFirst ? 'hidden' : 'visible'}}>
        Atrás
      </Button>
      <Button variant='contained' onClick={actions.goNext} disabled={!canAdvance}>
        {isLast ? 'Terminar' : 'Siguiente'}
      </Button>
    </Stack>
  )
}
