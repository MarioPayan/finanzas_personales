import {Stack, Chip, Typography, Box} from '@mui/material'
import type {ChipOption, ExactInput} from '../../content/diagnosis'
import NumberInput from './NumberInput'

/**
 * `derivedSublabels` permite sobreescribir el `sublabel` estático con un valor
 * calculado (p. ej. el monto derivado de respuestas previas). Si una opción no
 * tiene entrada en el mapa, conserva su `sublabel` original.
 *
 * El `onChange` emite `{commit: true}` cuando el usuario hace click en un chip
 * (decisión única y decisiva → auto-avance) y sin opts cuando tipea un valor
 * exacto (no hay un "fin" claro de la interacción → requiere Siguiente).
 */
type ChipGroupProps = {
  options: readonly ChipOption[]
  value: string | number | null
  onChange: (value: string | number, opts?: {commit?: boolean}) => void
  ariaLabel?: string
  derivedSublabels?: Record<string, string>
  exactInput?: ExactInput
}

export default function ChipGroup({
  options,
  value,
  onChange,
  ariaLabel,
  derivedSublabels,
  exactInput,
}: ChipGroupProps) {
  const exactValue = typeof value === 'number' ? value : null
  const chipValue = typeof value === 'string' ? value : null

  return (
    <Stack spacing={2} sx={{width: '100%', alignItems: 'center'}}>
      <Stack
        direction='row'
        spacing={1.5}
        sx={{flexWrap: 'wrap', justifyContent: 'center', rowGap: 1.5}}
        role='radiogroup'
        aria-label={ariaLabel}>
        {options.map(option => {
          const selected = chipValue === option.value
          const sublabel = derivedSublabels?.[option.value] ?? option.sublabel
          const inner = (
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', px: 0.5}}>
              <Typography variant='body1' sx={{fontWeight: selected ? 600 : 500}}>
                {option.label}
              </Typography>
              {sublabel && (
                <Typography variant='caption' color='text.secondary' component='span'>
                  {sublabel}
                </Typography>
              )}
              {option.examples && option.examples.length > 0 && (
                <Typography
                  variant='caption'
                  color='text.disabled'
                  component='span'
                  sx={{mt: 0.25}}>
                  {option.examples.join(' · ')}
                </Typography>
              )}
            </Box>
          )
          return (
            <Chip
              key={option.value}
              label={inner}
              clickable
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              onClick={() => onChange(option.value, {commit: true})}
              role='radio'
              aria-checked={selected}
              sx={{height: 'auto', py: 1, px: 1.5, '& .MuiChip-label': {py: 0.5}}}
            />
          )
        })}
      </Stack>

      {exactInput && (
        <Stack direction='row' spacing={1} sx={{alignItems: 'center'}}>
          <Typography variant='caption' color='text.secondary'>
            o exacto:
          </Typography>
          <NumberInput
            value={exactValue}
            onChange={v => {
              if (v !== null) onChange(v)
            }}
            min={exactInput.min}
            max={exactInput.max}
            step={exactInput.step}
            unit={exactInput.unit}
            placeholder={exactInput.placeholder}
            ariaLabel={`${ariaLabel ?? ''} (valor exacto)`}
          />
        </Stack>
      )}
    </Stack>
  )
}
