import {Box, Button, Stack, useMediaQuery, useTheme} from '@mui/material'
import type {StepperActions, StepperState} from '../types'

/**
 * Footer default: Atrás (ghost) / Siguiente (filled).
 *
 * En desktop (md+) sigue el flujo natural debajo de la card del paso.
 * En mobile (< md) se vuelve **sticky bottom**: una barra fija en la
 * parte baja de la viewport con bg paper y sombra superior, para que
 * el usuario no tenga que scrollear para encontrar Siguiente. El Stepper
 * agrega padding-bottom en mobile para evitar que esta barra tape el
 * final del body.
 *
 * Para pasos intersticiales (CTA propio del render), se oculta.
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const {currentStep, isFirst, isLast, done} = state
  if (done) return null
  if (hideOnInterstitial && currentStep?.kind === 'interstitial') return null

  const canAdvance = currentStep ? currentStep.isComplete(state.answers) : false
  // Pasos cuyo input ya dispara `commit()` por sí solo (chips de
  // selección única, toggle) ocultan el botón "Siguiente": el click en
  // la opción avanza, mostrar el CTA sería ruido. Sólo dejamos "Atrás"
  // para que el usuario pueda revisar la pregunta anterior si la
  // contestó por accidente.
  const hideAdvance = !!currentStep?.hideAdvance
  // Si no hay primer paso ni botón "Siguiente", el footer queda vacío;
  // mejor no renderizarlo.
  if (hideAdvance && isFirst) return null

  if (isMobile) {
    return (
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: '0 -6px 20px rgba(15, 23, 42, 0.06)',
          px: 2,
          py: 1.25,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
        }}>
        <Stack
          direction='row'
          spacing={1.5}
          sx={{justifyContent: 'space-between', alignItems: 'center'}}>
          <Button
            variant='text'
            size='large'
            onClick={actions.goBack}
            disabled={isFirst}
            sx={{
              visibility: isFirst ? 'hidden' : 'visible',
              minWidth: 80,
              minHeight: 44,
            }}>
            ← Atrás
          </Button>
          {!hideAdvance && (
            <Button
              variant='contained'
              size='large'
              onClick={actions.goNext}
              disabled={!canAdvance}
              sx={{flex: 1, maxWidth: 220, minHeight: 48, fontWeight: 700}}>
              {isLast ? 'Ver resultado' : 'Siguiente →'}
            </Button>
          )}
        </Stack>
      </Box>
    )
  }

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
      {!hideAdvance && (
        <Button
          variant='contained'
          size='large'
          onClick={actions.goNext}
          disabled={!canAdvance}
          sx={{minWidth: 140}}>
          {isLast ? 'Ver resultado' : 'Siguiente →'}
        </Button>
      )}
    </Stack>
  )
}
