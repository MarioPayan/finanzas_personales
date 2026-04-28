import {Stack, Chip, Typography, Box} from '@mui/material'
import type {ChipOption} from '../../content/diagnosis'

type ChipGroupProps = {
  options: readonly ChipOption[]
  value: string | null
  onChange: (value: string) => void
  ariaLabel?: string
}

export default function ChipGroup({options, value, onChange, ariaLabel}: ChipGroupProps) {
  const optionsWithExamples = options.filter(o => o.examples && o.examples.length > 0)

  return (
    <Stack spacing={2.5} sx={{width: '100%', alignItems: 'center'}}>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{flexWrap: 'wrap', justifyContent: 'center', rowGap: 1.5}}
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {options.map(option => {
          const selected = value === option.value
          const inner = (
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', px: 0.5}}>
              <Typography variant="body1" sx={{fontWeight: selected ? 600 : 500}}>
                {option.label}
              </Typography>
              {option.sublabel && (
                <Typography variant="caption" color="text.secondary" component="span">
                  {option.sublabel}
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
              onClick={() => onChange(option.value)}
              role="radio"
              aria-checked={selected}
              sx={{height: 'auto', py: 1, px: 1.5, '& .MuiChip-label': {py: 0.5}}}
            />
          )
        })}
      </Stack>

      {optionsWithExamples.length > 0 && (
        <Box
          sx={{
            width: '100%',
            maxWidth: 560,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{display: 'block', mb: 1, lineHeight: 1}}
          >
            Ejemplos
          </Typography>
          <Stack spacing={1.25}>
            {optionsWithExamples.map(option => (
              <Box key={option.value}>
                <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                  {option.label}
                </Typography>
                <Box component="ul" sx={{m: 0, pl: 2.5}}>
                  {option.examples!.map((ex, i) => (
                    <Typography
                      key={i}
                      component="li"
                      variant="caption"
                      color="text.secondary"
                      sx={{lineHeight: 1.5}}
                    >
                      {ex}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}
