import {Box, Chip, Stack, Typography} from '@mui/material'
import type {ChipOption} from '../../content/diagnosis'

type MultiChipsProps = {
  options: readonly ChipOption[]
  value: readonly string[]
  onChange: (next: readonly string[]) => void
  ariaLabel?: string
}

/**
 * Selección múltiple. Visualmente se distingue de `ChipGroup` (selección
 * única) con un checkbox al lado del label — una pista clara de que
 * varias opciones se pueden activar a la vez.
 */
function CheckboxIndicator({selected}: {selected: boolean}) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 16,
        height: 16,
        borderRadius: 0.5,
        border: '1.5px solid',
        borderColor: selected ? 'primary.contrastText' : 'text.secondary',
        bgcolor: selected ? 'primary.contrastText' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s ease',
      }}
    >
      {selected && (
        <Box
          component='svg'
          viewBox='0 0 16 16'
          sx={{width: 12, height: 12, color: 'primary.main'}}
          aria-hidden
        >
          <path
            d='M3 8.5 L6.5 12 L13 4.5'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.4'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </Box>
      )}
    </Box>
  )
}

export default function MultiChips({options, value, onChange, ariaLabel}: MultiChipsProps) {
  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <Stack
      direction='row'
      spacing={1.5}
      sx={{flexWrap: 'wrap', justifyContent: 'center', rowGap: 1.5}}
      role='group'
      aria-label={ariaLabel}>
      {options.map(option => {
        const selected = value.includes(option.value)
        const inner = (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pl: 0.25,
              pr: 0.5,
            }}
          >
            <CheckboxIndicator selected={selected} />
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
              <Typography variant='body1' sx={{fontWeight: selected ? 600 : 500, lineHeight: 1.2}}>
                {option.label}
              </Typography>
              {option.sublabel && (
                <Typography variant='caption' color='text.secondary' component='span'>
                  {option.sublabel}
                </Typography>
              )}
            </Box>
          </Box>
        )
        return (
          <Chip
            key={option.value}
            label={inner}
            clickable
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            onClick={() => toggle(option.value)}
            role='checkbox'
            aria-checked={selected}
            sx={{height: 'auto', py: 1, px: 1.5, '& .MuiChip-label': {py: 0.5}}}
          />
        )
      })}
    </Stack>
  )
}
