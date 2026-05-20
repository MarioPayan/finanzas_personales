import {Box, Card, CardActionArea, Stack, Typography, alpha, useMediaQuery} from '@mui/material'
import {motion} from 'framer-motion'
import type {ChipOption} from '../../content/diagnosis'

type MultiChipsProps = {
  options: readonly ChipOption[]
  value: readonly string[]
  onChange: (next: readonly string[]) => void
  ariaLabel?: string
}

/**
 * Selección múltiple — tarjetas verticales apiladas con checkbox.
 *
 * Mismo lenguaje visual que `ChipGroup` (tarjetas full-width tipo
 * quiz), pero un checkbox a la derecha indica que se pueden marcar
 * varias opciones a la vez. No hay auto-advance: el usuario decide
 * cuándo terminar de marcar y avanza con el botón "Siguiente".
 */
function CheckboxIndicator({selected}: {selected: boolean}) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 24,
        height: 24,
        borderRadius: '4px',
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'text.secondary',
        bgcolor: selected ? 'primary.main' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s ease',
      }}>
      {selected && (
        <Box
          component='svg'
          viewBox='0 0 16 16'
          sx={{width: 18, height: 18, color: 'primary.contrastText'}}
          aria-hidden>
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
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Valores de opciones marcadas como `clearOthers` (típicamente "Ninguno"):
  // son mutuamente exclusivas con el resto.
  const exclusiveValues = options
    .filter(o => o.clearOthers)
    .map(o => o.value)

  const toggle = (option: ChipOption) => {
    const isExclusive = !!option.clearOthers
    const alreadySelected = value.includes(option.value)

    if (isExclusive) {
      // Click en "Ninguno": si ya estaba marcado, lo quita (deja vacío);
      // si no, lo deja como única selección.
      onChange(alreadySelected ? [] : [option.value])
      return
    }

    // Click en una opción normal: quita las exclusivas y agrega/quita esta.
    const withoutExclusives = value.filter(v => !exclusiveValues.includes(v))
    if (alreadySelected) {
      onChange(withoutExclusives.filter(v => v !== option.value))
    } else {
      onChange([...withoutExclusives, option.value])
    }
  }

  return (
    <Stack
      spacing={1.25}
      sx={{width: '100%', maxWidth: 560, mx: 'auto'}}
      role='group'
      aria-label={ariaLabel}>
      {options.map(option => {
        const selected = value.includes(option.value)
        return (
          <motion.div
            key={option.value}
            whileTap={reducedMotion ? undefined : {scale: 0.98}}
            transition={{duration: 0.15, ease: 'easeOut'}}>
            <Card
              variant='outlined'
              sx={{
                borderWidth: 2,
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected
                  ? theme => alpha(theme.palette.primary.main, 0.08)
                  : 'background.paper',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': {
                  borderColor: selected ? 'primary.main' : 'text.secondary',
                },
              }}>
              <CardActionArea
                onClick={() => toggle(option)}
                role='checkbox'
                aria-checked={selected}
                sx={{px: 2, py: 1.5}}>
                <Stack direction='row' spacing={2} sx={{alignItems: 'center'}}>
                  <Box sx={{flex: 1, minWidth: 0}}>
                    <Typography
                      variant='body1'
                      sx={{fontWeight: selected ? 700 : 600, lineHeight: 1.3}}>
                      {option.label}
                    </Typography>
                    {option.sublabel && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{mt: 0.25, lineHeight: 1.3}}>
                        {option.sublabel}
                      </Typography>
                    )}
                  </Box>
                  <CheckboxIndicator selected={selected} />
                </Stack>
              </CardActionArea>
            </Card>
          </motion.div>
        )
      })}
    </Stack>
  )
}
