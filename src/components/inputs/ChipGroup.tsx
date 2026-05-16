import {useEffect, useRef, useState} from 'react'
import {Stack, Chip, Typography, Box, useMediaQuery} from '@mui/material'
import {AnimatePresence, motion} from 'framer-motion'
import type {ChipOption, ExactInput} from '../../content/diagnosis'
import NumberInput from './NumberInput'

const CheckGlyph = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
    <path
      d='M5 12.5l4.5 4.5L19 7.5'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

/**
 * Selector de chips con micro-interacciones.
 *
 * - Al seleccionar: chip hace un pequeño "bounce" (scale spring),
 *   aparece un check icon a la izquierda del label, y un badge flotante
 *   "+X pts" sale hacia arriba si la opción declara `score`.
 * - Respeta `prefers-reduced-motion`: las animaciones se vuelven cortes
 *   discretos.
 * - El `onChange` emite `{commit: true}` cuando se hace click en un
 *   chip (auto-advance); sin opts cuando se tipea valor exacto.
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
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  /** Última opción clickeada — dispara el floating "+X pts" sobre el chip. */
  const [poppedKey, setPoppedKey] = useState<string | null>(null)
  const poppedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (poppedTimer.current) clearTimeout(poppedTimer.current)
  }, [])

  const handleClick = (opt: ChipOption) => {
    if (poppedTimer.current) clearTimeout(poppedTimer.current)
    if (!reducedMotion && typeof opt.score === 'number' && opt.score > 0) {
      setPoppedKey(opt.value)
      poppedTimer.current = setTimeout(() => setPoppedKey(null), 900)
    }
    onChange(opt.value, {commit: true})
  }

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
          const showPlus = poppedKey === option.value
          const inner = (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0.5,
                px: 0.5,
              }}>
              <AnimatePresence>
                {selected && (
                  <motion.span
                    key='check'
                    initial={reducedMotion ? {opacity: 1, width: 18} : {opacity: 0, width: 0}}
                    animate={{opacity: 1, width: 18}}
                    exit={{opacity: 0, width: 0}}
                    transition={{duration: 0.18}}
                    style={{display: 'inline-flex', alignItems: 'center', overflow: 'hidden'}}>
                    <CheckGlyph />
                  </motion.span>
                )}
              </AnimatePresence>
              <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
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
            </Box>
          )
          return (
            <Box key={option.value} sx={{position: 'relative'}}>
              <AnimatePresence>
                {showPlus && typeof option.score === 'number' && (
                  <motion.div
                    key='plus'
                    initial={{opacity: 0, y: 0, scale: 0.8}}
                    animate={{opacity: 1, y: -28, scale: 1}}
                    exit={{opacity: 0, y: -44, scale: 0.8}}
                    transition={{duration: 0.8, ease: 'easeOut'}}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}>
                    <Box
                      sx={{
                        bgcolor: 'success.main',
                        color: 'success.contrastText',
                        px: 1,
                        py: 0.25,
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}>
                      +{option.score} pts
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                whileTap={reducedMotion ? undefined : {scale: 0.96}}
                animate={selected && !reducedMotion ? {scale: [1, 1.06, 1]} : {scale: 1}}
                transition={{duration: 0.28, ease: 'easeOut'}}>
                <Chip
                  label={inner}
                  clickable
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => handleClick(option)}
                  role='radio'
                  aria-checked={selected}
                  sx={{
                    height: 'auto',
                    py: 1,
                    px: 1.5,
                    '& .MuiChip-label': {py: 0.5},
                    transition: 'border-color 0.2s, background-color 0.2s',
                  }}
                />
              </motion.div>
            </Box>
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

