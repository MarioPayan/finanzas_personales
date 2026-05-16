import {Box, LinearProgress, Typography} from '@mui/material'
import type {StepperState} from '../types'

/**
 * Progress default: barra lineal con porcentaje. El adapter de
 * diagnóstico va a usar uno propio segmentado por sección.
 */
export function DefaultProgress({state}: {state: StepperState<unknown>}) {
  return (
    <Box sx={{width: '100%', maxWidth: 720, mx: 'auto'}}>
      <LinearProgress
        variant='determinate'
        value={state.progress}
        sx={{height: 6, borderRadius: 3}}
      />
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{display: 'block', mt: 0.5, textAlign: 'right'}}>
        {state.progress}% completado · {state.resolvedCount}/{state.totalCount}
      </Typography>
    </Box>
  )
}
