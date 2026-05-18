import {Stack, Typography} from '@mui/material'
import type {StepperState} from '../types'

/**
 * Header default: prompt grande con jerarquía marcada y hint chico en
 * gris debajo. Solo se renderiza si el paso declara `header`.
 *
 * Notamente NO se renderiza el tag/categoría: el progreso superior ya
 * muestra en qué bloque se está, así que un chip de categoría dentro
 * de la tarjeta sería redundante. `tagColor` sigue usándose afuera
 * (Stepper.tsx) para teñir la barra de acento de la tarjeta.
 */
export function DefaultHeader({state}: {state: StepperState<unknown>}) {
  const step = state.currentStep
  if (!step?.header) return null

  return (
    <Stack spacing={1.5} sx={{width: '100%', textAlign: 'left'}}>
      <Typography
        variant='h4'
        component='h1'
        sx={{
          fontWeight: 700,
          lineHeight: 1.25,
          fontSize: {xs: '1.35rem', sm: '1.6rem', md: '2rem'},
        }}>
        {step.header.prompt}
      </Typography>
      {step.header.hint && (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            lineHeight: 1.6,
            fontSize: {xs: '0.875rem', md: '0.9375rem'},
          }}>
          {step.header.hint}
        </Typography>
      )}
    </Stack>
  )
}
