import {Box, Slider, Stack, Tooltip, Typography} from '@mui/material'

type RangeSliderProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit?: string
  marks?: readonly {value: number; label: string}[]
  ariaLabel?: string
  /** Texto adicional bajo el valor principal (p. ej. monto derivado en vivo). */
  derivedHint?: string
  /** Si está presente, aparece un ícono ⓘ junto al hint con este tooltip. */
  derivedHintInfo?: string
}

export default function RangeSlider({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  marks,
  ariaLabel,
  derivedHint,
  derivedHintInfo,
}: RangeSliderProps) {
  return (
    <Box sx={{width: '100%', maxWidth: 420, mx: 'auto', px: 2}}>
      <Typography variant='h4' sx={{textAlign: 'center'}}>
        {value}
        {unit ?? ''}
      </Typography>
      {derivedHint && (
        <Stack
          direction='row'
          spacing={0.5}
          sx={{alignItems: 'center', justifyContent: 'center', mb: 1}}>
          <Typography variant='body2' color='text.secondary'>
            {derivedHint}
          </Typography>
          {derivedHintInfo && (
            <Tooltip title={derivedHintInfo} arrow>
              <Typography
                component='span'
                variant='caption'
                sx={{
                  cursor: 'help',
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  lineHeight: 1,
                }}
                aria-label='Origen del cálculo'>
                ⓘ
              </Typography>
            </Tooltip>
          )}
        </Stack>
      )}
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        marks={marks}
        onChange={(_, next) => onChange(Array.isArray(next) ? next[0] : next)}
        aria-label={ariaLabel ?? 'rango'}
      />
    </Box>
  )
}
