import {Button, Stack} from '@mui/material'
import type {StepperActions, StepperState} from '../types'

/**
 * Footer default: Atrás (ghost) / Siguiente (filled). Para pasos
 * intersticiales (sin `isComplete` que dependa de respuesta), el CTA
 * típicamente vive en el render del paso, así que ocultamos esta nav.
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
      sx={{justifyContent: 'space-between', width: '100%', maxWidth: 760, mx: 'auto'}}>
      <Button
        variant='text'
        size='large'
        onClick={actions.goBack}
        disabled={isFirst}
        sx={{visibility: isFirst ? 'hidden' : 'visible', minWidth: 100}}>
        ← Atrás
      </Button>
      <Button
        variant='contained'
        size='large'
        onClick={actions.goNext}
        disabled={!canAdvance}
        sx={{minWidth: 140}}>
        {isLast ? 'Ver resultado' : 'Siguiente →'}
      </Button>
    </Stack>
  )
}
