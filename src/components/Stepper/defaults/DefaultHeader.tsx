import {Box, Chip, Stack, Typography} from '@mui/material'
import type {StepperState} from '../types'

/**
 * Header default: tag de categoría (si la hay) + prompt grande + hint chico.
 * Solo se renderiza si el paso declara `header`.
 */
export function DefaultHeader({state}: {state: StepperState<unknown>}) {
  const step = state.currentStep
  if (!step?.header) return null

  return (
    <Stack
      spacing={1}
      sx={{width: '100%', maxWidth: 720, mx: 'auto', textAlign: 'center'}}>
      {step.tag && (
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Chip
            size='small'
            label={step.tag}
            color={step.tagColor ?? 'default'}
            variant='filled'
          />
        </Box>
      )}
      <Typography variant='h4' component='h1' sx={{fontWeight: 700, lineHeight: 1.2}}>
        {step.header.prompt}
      </Typography>
      {step.header.hint && (
        <Typography variant='body2' color='text.secondary' sx={{lineHeight: 1.5}}>
          {step.header.hint}
        </Typography>
      )}
    </Stack>
  )
}
