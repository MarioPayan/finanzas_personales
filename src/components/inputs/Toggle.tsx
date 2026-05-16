import {Stack, useMediaQuery} from '@mui/material'
import {motion} from 'framer-motion'
import {Button} from '@mui/material'

type ToggleProps = {
  value: boolean | null
  onChange: (value: boolean, opts?: {commit?: boolean}) => void
  trueLabel?: string
  falseLabel?: string
  ariaLabel?: string
}

/**
 * Toggle Sí/No con un highlight animado que se desliza entre las dos
 * opciones cuando el usuario cambia (layoutId compartido en
 * Framer Motion).
 */
export default function Toggle({
  value,
  onChange,
  trueLabel = 'Sí',
  falseLabel = 'No',
  ariaLabel,
}: ToggleProps) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  return (
    <Stack
      direction='row'
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1.5,
        position: 'relative',
      }}>
      <Option
        label={trueLabel}
        selected={value === true}
        onClick={() => onChange(true, {commit: true})}
        ariaLabel={`${ariaLabel ?? ''} — ${trueLabel}`}
        reducedMotion={reducedMotion}
      />
      <Option
        label={falseLabel}
        selected={value === false}
        onClick={() => onChange(false, {commit: true})}
        ariaLabel={`${ariaLabel ?? ''} — ${falseLabel}`}
        reducedMotion={reducedMotion}
      />
    </Stack>
  )
}

function Option({
  label,
  selected,
  onClick,
  ariaLabel,
  reducedMotion,
}: {
  label: string
  selected: boolean
  onClick: () => void
  ariaLabel: string
  reducedMotion: boolean
}) {
  return (
    <motion.div
      whileTap={reducedMotion ? undefined : {scale: 0.95}}
      animate={selected && !reducedMotion ? {scale: [1, 1.06, 1]} : {scale: 1}}
      transition={{duration: 0.28, ease: 'easeOut'}}>
      <Button
        variant={selected ? 'contained' : 'outlined'}
        size='large'
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={selected}
        sx={{
          minWidth: 120,
          py: 1.5,
          fontWeight: 600,
        }}>
        {label}
      </Button>
    </motion.div>
  )
}
