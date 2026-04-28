import {Box, Slider, Typography} from '@mui/material'

type RangeSliderProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit?: string
  marks?: {value: number; label: string}[]
  ariaLabel?: string
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
}: RangeSliderProps) {
  return (
    <Box sx={{width: '100%', maxWidth: 420, mx: 'auto', px: 2}}>
      <Typography variant="h4" gutterBottom sx={{textAlign: 'center'}}>
        {value}
        {unit ?? ''}
      </Typography>
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
