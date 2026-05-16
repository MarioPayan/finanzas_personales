import {InputAdornment, TextField} from '@mui/material'

type NumberInputProps = {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  placeholder?: string
  ariaLabel?: string
  size?: 'small' | 'medium'
  fullWidth?: boolean
}

export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  placeholder,
  ariaLabel,
  size = 'small',
  fullWidth,
}: NumberInputProps) {
  return (
    <TextField
      type='number'
      value={value ?? ''}
      placeholder={placeholder}
      size={size}
      fullWidth={fullWidth}
      onChange={e => {
        const raw = e.target.value
        if (raw === '') {
          onChange(null)
          return
        }
        const parsed = Number(raw)
        if (Number.isFinite(parsed)) onChange(parsed)
      }}
      slotProps={{
        htmlInput: {min, max, step, 'aria-label': ariaLabel},
        input: unit
          ? {endAdornment: <InputAdornment position='end'>{unit}</InputAdornment>}
          : undefined,
      }}
    />
  )
}
