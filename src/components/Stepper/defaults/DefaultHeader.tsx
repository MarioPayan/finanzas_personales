import {Box, Chip, Stack, Typography} from '@mui/material'
import type {StepperState} from '../types'

/**
 * Header default: tag de categoría arriba (pequeño y discreto), prompt
 * grande con jerarquía marcada, hint chico en gris debajo. Solo se
 * renderiza si el paso declara `header`.
 *
 * El tag se renderiza como Chip outlined para no competir con el prompt.
 */
export function DefaultHeader({state}: {state: StepperState<unknown>}) {
  const step = state.currentStep
  if (!step?.header) return null

  return (
    <Stack spacing={1.5} sx={{width: '100%', textAlign: 'left'}}>
      {step.tag && (
        <Box>
          <Chip
            size='small'
            label={step.tag}
            color={step.tagColor ?? 'default'}
            variant='outlined'
            sx={{fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase'}}
          />
        </Box>
      )}
      <Typography
        variant='h4'
        component='h1'
        sx={{
          fontWeight: 700,
          lineHeight: 1.2,
          fontSize: {xs: '1.6rem', md: '2rem'},
        }}>
        {step.header.prompt}
      </Typography>
      {step.header.hint && (
        <Typography variant='body2' color='text.secondary' sx={{lineHeight: 1.6}}>
          {step.header.hint}
        </Typography>
      )}
    </Stack>
  )
}
