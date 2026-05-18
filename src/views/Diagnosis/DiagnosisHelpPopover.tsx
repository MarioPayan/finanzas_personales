import {
  Box,
  Chip,
  Drawer,
  IconButton,
  Popover,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {X as CloseIcon} from '@phosphor-icons/react'
import type {ReactNode} from 'react'
import {
  DIAGNOSIS_QUESTIONS,
  type Answers,
  type SidebarWidgetId,
} from '../../content/diagnosis'
import {findCreditScoreBands} from '../../content/creditScoreBands'

/**
 * Componente responsivo para mostrar ayudas y referencias del paso
 * actual:
 *
 *  - **Desktop (md+)**: `Popover` anclado al ícono "?" del header.
 *    Compacto, dismissable on outside click.
 *  - **Mobile (xs/sm)**: `Drawer anchor='bottom'` (bottom sheet).
 *    Patrón típico mobile para info contextual.
 *
 * Contenido: tips declarados en `node.tips` y widgets de referencia
 * (hoy solo `creditScoreScale`). Si el paso no aporta nada, el
 * componente no se renderiza — el icono "?" del header tampoco
 * aparece, así que esto es defensa en profundidad.
 */

type Props = {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  currentStorageKey: string | null
  countryCode: string | null
  answers: Answers
}

const WIDGETS_WITH_RENDERER: ReadonlyArray<SidebarWidgetId> = [
  'creditScoreScale',
  'usuryRate',
  'ageBasedRiskAllocation',
]

export const hasHelpContent = (currentStorageKey: string | null): boolean => {
  if (!currentStorageKey) return false
  const q = DIAGNOSIS_QUESTIONS.find(q => q.storageKey === currentStorageKey)
  if (!q) return false
  if (q.tips && q.tips.length > 0) return true
  if (q.sidebarWidgets?.some(w => WIDGETS_WITH_RENDERER.includes(w))) return true
  return false
}

const TipsList = ({tips}: {tips: readonly string[]}) => (
  <Stack spacing={1}>
    {tips.map((tip, i) => (
      <Stack key={i} direction='row' spacing={1} sx={{alignItems: 'flex-start'}}>
        <Typography
          component='span'
          sx={{color: 'warning.main', flexShrink: 0, mt: 0.25, fontSize: 14}}
          aria-hidden>
          ●
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {tip}
        </Typography>
      </Stack>
    ))}
  </Stack>
)

const SCORE_BAND_LABEL: Record<'bad' | 'regular' | 'good' | 'excellent', string> = {
  bad: 'Malo',
  regular: 'Regular',
  good: 'Bueno',
  excellent: 'Excelente',
}

const SCORE_BAND_COLOR: Record<'bad' | 'regular' | 'good' | 'excellent', string> = {
  bad: 'error.main',
  regular: 'warning.main',
  good: 'info.main',
  excellent: 'success.main',
}

const CreditScoreScale = ({countryCode}: {countryCode: string | null}) => {
  const bands = countryCode ? findCreditScoreBands(countryCode) : null
  if (!bands) {
    return (
      <Typography variant='caption' color='text.secondary'>
        No hay tabla de referencia para tu país. Las bandas son auto-reportadas (malo / regular /
        bueno / excelente).
      </Typography>
    )
  }
  return (
    <Stack spacing={1}>
      <Typography variant='caption' color='text.secondary'>
        Escala {bands.scoreMin}–{bands.scoreMax} ({bands.bureau}
        {bands.verified ? '' : ' · referencia aproximada'})
      </Typography>
      <Stack spacing={0.5}>
        {(['bad', 'regular', 'good', 'excellent'] as const).map(band => {
          const r = bands.ranges[band]
          return (
            <Stack key={band} direction='row' spacing={1} sx={{alignItems: 'center'}}>
              <Box
                sx={{
                  width: 4,
                  height: 16,
                  bgcolor: SCORE_BAND_COLOR[band],
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
              <Typography variant='body2' sx={{flex: 1, minWidth: 0}}>
                {SCORE_BAND_LABEL[band]}
              </Typography>
              <Typography
                variant='body2'
                sx={{fontFamily: 'monospace', color: 'text.secondary'}}>
                {r.min}–{r.max}
              </Typography>
            </Stack>
          )
        })}
      </Stack>
    </Stack>
  )
}

const UsuryRateWidget = () => (
  <Stack spacing={0.75}>
    <Typography variant='body2' color='text.secondary'>
      Tope legal de interés en Colombia (mayo 2026) para crédito de consumo:
    </Typography>
    <Chip
      label='28,17% EA'
      color='error'
      variant='outlined'
      size='small'
      sx={{alignSelf: 'flex-start', fontFamily: 'monospace'}}
    />
    <Typography variant='caption' color='text.secondary'>
      Cualquier tasa cerca de ese tope vale la pena renegociar o consolidar. Banco
      Agrario ofrece compra de cartera desde 10,30% EA.
    </Typography>
  </Stack>
)

const AgeBasedRiskAllocationWidget = ({age}: {age: number | null}) => {
  if (age === null || age <= 0) {
    return (
      <Typography variant='caption' color='text.secondary'>
        Ingresa tu edad para ver el rango sugerido de renta variable.
      </Typography>
    )
  }
  const conservative = Math.max(0, 100 - age)
  const moderate = Math.max(0, 110 - age)
  const aggressive = Math.max(0, 120 - age)
  return (
    <Stack spacing={0.75}>
      <Typography variant='body2' color='text.secondary'>
        Heurística "100 / 110 / 120 menos tu edad" para % en renta variable.
      </Typography>
      <Stack direction='row' spacing={1} sx={{flexWrap: 'wrap', gap: 1}}>
        <Chip label={`Conservador ~${conservative}%`} size='small' variant='outlined' />
        <Chip label={`Moderado ~${moderate}%`} size='small' color='primary' variant='outlined' />
        <Chip label={`Agresivo ~${aggressive}%`} size='small' variant='outlined' />
      </Stack>
      <Typography variant='caption' color='text.secondary'>
        El resto va a renta fija o liquidez. La versión moderna usa 110/120 por mayor
        esperanza de vida.
      </Typography>
    </Stack>
  )
}

const HelpContent = ({
  currentStorageKey,
  countryCode,
  answers,
}: {
  currentStorageKey: string | null
  countryCode: string | null
  answers: Answers
}) => {
  if (!currentStorageKey) return null
  const q = DIAGNOSIS_QUESTIONS.find(q => q.storageKey === currentStorageKey)
  if (!q) return null
  const tips = q.tips ?? []
  const widgets = new Set(q.sidebarWidgets ?? [])

  const sections: ReactNode[] = []
  if (tips.length > 0) {
    sections.push(
      <Box key='tips'>
        <Typography variant='overline' color='text.secondary' sx={{display: 'block', mb: 1}}>
          Sugerencias
        </Typography>
        <TipsList tips={tips} />
      </Box>,
    )
  }
  if (widgets.has('usuryRate')) {
    sections.push(
      <Box key='usury-rate'>
        <Typography variant='overline' color='text.secondary' sx={{display: 'block', mb: 1}}>
          Tasa de usura
        </Typography>
        <UsuryRateWidget />
      </Box>,
    )
  }
  if (widgets.has('ageBasedRiskAllocation')) {
    const age = typeof answers.age === 'number' ? answers.age : null
    sections.push(
      <Box key='age-allocation'>
        <Typography variant='overline' color='text.secondary' sx={{display: 'block', mb: 1}}>
          Renta variable según tu edad
        </Typography>
        <AgeBasedRiskAllocationWidget age={age} />
      </Box>,
    )
  }
  if (widgets.has('creditScoreScale')) {
    sections.push(
      <Box key='credit-scale'>
        <Typography variant='overline' color='text.secondary' sx={{display: 'block', mb: 1}}>
          Rangos del score crediticio
        </Typography>
        <CreditScoreScale countryCode={countryCode} />
      </Box>,
    )
  }
  if (sections.length === 0) return null
  return <Stack spacing={2.5}>{sections}</Stack>
}

export function DiagnosisHelpPopover({
  open,
  anchorEl,
  onClose,
  currentStorageKey,
  countryCode,
  answers,
}: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (!hasHelpContent(currentStorageKey)) return null

  if (isMobile) {
    return (
      <Drawer
        anchor='bottom'
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              p: 2,
              maxHeight: '70vh',
            },
          },
        }}>
        <Stack direction='row' sx={{justifyContent: 'space-between', alignItems: 'center', mb: 1.5}}>
          <Typography variant='h6' sx={{fontWeight: 700}}>
            Ayuda del paso
          </Typography>
          <IconButton size='small' onClick={onClose} aria-label='Cerrar'>
            <CloseIcon size={18} weight='bold' />
          </IconButton>
        </Stack>
        <Box sx={{overflowY: 'auto'}}>
          <HelpContent
          currentStorageKey={currentStorageKey}
          countryCode={countryCode}
          answers={answers}
        />
        </Box>
      </Drawer>
    )
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin={{vertical: 'top', horizontal: 'right'}}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            p: 2.5,
            width: 360,
            maxWidth: '90vw',
            border: 1,
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.10)',
          },
        },
      }}>
      <HelpContent
        currentStorageKey={currentStorageKey}
        countryCode={countryCode}
        answers={answers}
      />
    </Popover>
  )
}
