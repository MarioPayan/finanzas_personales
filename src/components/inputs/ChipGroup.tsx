import {Box, Card, CardActionArea, Stack, Typography, alpha, useMediaQuery} from '@mui/material'
import {motion} from 'framer-motion'
import type {ChipOption, ExactInput} from '../../content/diagnosis'
import NumberInput from './NumberInput'

const CheckGlyph = () => (
  <Box
    component='svg'
    viewBox='0 0 24 24'
    sx={{
      width: 20,
      height: 20,
      flexShrink: 0,
      color: 'primary.main',
    }}
    aria-hidden='true'>
    <path
      d='M5 12.5l4.5 4.5L19 7.5'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
  </Box>
)

/**
 * Selector de opción única — tarjetas verticales apiladas.
 *
 * Cada opción se ve como una "tarjeta de quiz": ancho completo, borde
 * sutil, label en negrita + sublabel/ejemplos debajo, y un check a la
 * derecha cuando está seleccionada. Hover oscurece el borde; el click
 * dispara `commit: true` para que el Stepper auto-avance al siguiente
 * paso.
 *
 * Si la pregunta tiene `exactInput`, debajo de las tarjetas aparece un
 * `NumberInput` para que el usuario pueda escribir un valor exacto en
 * vez de elegir una banda.
 */
/**
 * Tiempo (ms) que el ChipGroup espera tras un cambio de `exactInput`
 * antes de auto-avanzar. Es deliberadamente largo: el usuario tipea
 * varios dígitos seguidos, no queremos que se vaya en medio de un
 * número. Cualquier nuevo keystroke (o click de chip) cancela el
 * timer previo via `cancelAutoAdvance` en `useStepper.commit`.
 */
const EXACT_INPUT_COMMIT_DELAY_MS = 1500

type ChipGroupProps = {
  options: readonly ChipOption[]
  value: string | number | null
  onChange: (
    value: string | number,
    opts?: {commit?: boolean; delayMs?: number},
  ) => void
  ariaLabel?: string
  derivedSublabels?: Record<string, string>
  exactInput?: ExactInput
  /** Currency a usar cuando `exactInput.isMoney`. Lo resuelve afuera contra
   *  el país detectado (`minimumWage.currency`). */
  exactInputCurrency?: string
}

export default function ChipGroup({
  options,
  value,
  onChange,
  ariaLabel,
  derivedSublabels,
  exactInput,
  exactInputCurrency,
}: ChipGroupProps) {
  const exactValue = typeof value === 'number' ? value : null
  const chipValue = typeof value === 'string' ? value : null
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  return (
    <Stack spacing={2.5} sx={{width: '100%', maxWidth: 560, mx: 'auto'}}>
      <Stack spacing={1.25} role='radiogroup' aria-label={ariaLabel}>
        {options.map(option => {
          const selected = chipValue === option.value
          const sublabel = derivedSublabels?.[option.value] ?? option.sublabel
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
                  onClick={() => onChange(option.value, {commit: true})}
                  role='radio'
                  aria-checked={selected}
                  sx={{px: 2, py: 1.5}}>
                  <Stack direction='row' spacing={2} sx={{alignItems: 'center'}}>
                    <Box sx={{flex: 1, minWidth: 0}}>
                      <Typography
                        variant='body1'
                        sx={{fontWeight: selected ? 700 : 600, lineHeight: 1.3}}>
                        {option.label}
                      </Typography>
                      {sublabel && (
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{mt: 0.25, lineHeight: 1.3}}>
                          {sublabel}
                        </Typography>
                      )}
                      {option.examples && option.examples.length > 0 && (
                        <Typography
                          variant='caption'
                          color='text.disabled'
                          sx={{display: 'block', mt: 0.25, lineHeight: 1.3}}>
                          {option.examples.join(' · ')}
                        </Typography>
                      )}
                    </Box>
                    {selected && <CheckGlyph />}
                  </Stack>
                </CardActionArea>
              </Card>
            </motion.div>
          )
        })}
      </Stack>

      {exactInput && (
        <Stack
          direction='row'
          spacing={1}
          sx={{alignItems: 'center', justifyContent: 'center'}}>
          <Typography variant='caption' color='text.secondary'>
            o exacto:
          </Typography>
          <NumberInput
            value={exactValue}
            onChange={v => {
              // Tipear en `exactInput` también dispara auto-advance,
              // pero con un delay largo: el usuario sigue escribiendo
              // dígitos y no queremos que se vaya en medio. Cada
              // keystroke reinicia el timer.
              if (v !== null)
                onChange(v, {commit: true, delayMs: EXACT_INPUT_COMMIT_DELAY_MS})
            }}
            min={exactInput.min}
            max={exactInput.max}
            step={exactInput.step}
            unit={exactInput.unit}
            placeholder={exactInput.placeholder}
            ariaLabel={`${ariaLabel ?? ''} (valor exacto)`}
            currency={exactInput.isMoney ? exactInputCurrency : undefined}
          />
        </Stack>
      )}
    </Stack>
  )
}
