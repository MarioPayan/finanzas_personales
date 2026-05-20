import {useEffect, useRef, useState} from 'react'
import {
  Box,
  Button,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import {X as CloseIcon} from '@phosphor-icons/react'
import {
  MINIMUM_WAGES,
  formatMinimumWage,
  type MinimumWageEntry,
} from '../../content/minimumWages'
import {ResetConfirmDialog} from './ResetConfirmDialog'

/**
 * Drawer right-anchored con la configuración global del diagnóstico.
 *
 * Hoy contiene:
 *  - Override de país (cambia el SMM al default del país elegido).
 *  - Editor del monto de SMM (por si el usuario quiere afinarlo).
 *  - Reiniciar diagnóstico (vuelve al primer paso, descarta respuestas).
 *
 * Es global, no contextual al paso: por eso vive detrás del ícono de
 * engranaje del toolbar y no del ícono de ayuda inline. Las sugerencias
 * y tips del paso viven aparte en `DiagnosisHelpPopover`.
 */

type Props = {
  open: boolean
  onClose: () => void
  minimumWage: MinimumWageEntry | null
  countryCode: string | null
  onSetCountry: (code: string) => void
  onSetMinimumWageAmount: (amount: number) => void
  onRestart: () => void
}

const COUNTRY_OPTIONS = Object.entries(MINIMUM_WAGES)
  .map(([code, entry]) => ({code, name: entry.countryName}))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))

export function DiagnosisConfigDrawer({
  open,
  onClose,
  minimumWage,
  countryCode,
  onSetCountry,
  onSetMinimumWageAmount,
  onRestart,
}: Props) {
  const theme = useTheme()
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const [amountDraft, setAmountDraft] = useState<string>(
    minimumWage ? String(minimumWage.amount) : '',
  )
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Sincroniza el draft cuando el SMM cambia desde afuera (ej. cambio
  // de país por el select). Si el usuario está editando el input en
  // ese momento, respetamos su input.
  useEffect(() => {
    if (!minimumWage) return
    if (document.activeElement === amountInputRef.current) return
    if (Number(amountDraft) === minimumWage.amount) return
    setAmountDraft(String(minimumWage.amount))
  }, [minimumWage, amountDraft])

  const commitAmount = () => {
    const parsed = Number(amountDraft)
    if (Number.isFinite(parsed) && parsed > 0) {
      onSetMinimumWageAmount(parsed)
    } else if (minimumWage) {
      setAmountDraft(String(minimumWage.amount))
    }
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: {xs: '70%', sm: 380, md: 420},
            maxWidth: '90vw',
            p: {xs: 2, md: 3},
          },
        },
      }}>
      <Stack
        direction='row'
        sx={{justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
        <Typography variant='h6' sx={{fontWeight: 700}}>
          Configuración
        </Typography>
        <IconButton
          size='small'
          onClick={onClose}
          aria-label='Cerrar'
          sx={{color: 'text.secondary'}}>
          <CloseIcon size={18} weight='bold' />
        </IconButton>
      </Stack>
      <Stack spacing={3} sx={{flex: 1, overflowY: 'auto'}}>
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{display: 'block', mb: 1}}>
            País y salario mínimo
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{mb: 2}}>
            Lo detectamos del navegador. Cambia el país si vives en otro o ajusta el monto si la
            cifra default está desactualizada.
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              label='País'
              value={countryCode ?? ''}
              onChange={e => onSetCountry(e.target.value)}
              fullWidth
              size='small'>
              {COUNTRY_OPTIONS.map(c => (
                <MenuItem key={c.code} value={c.code}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name='smm-amount'
              label={`Salario mínimo${minimumWage ? ` (${minimumWage.currency})` : ''}`}
              type='number'
              value={amountDraft}
              onChange={e => setAmountDraft(e.target.value)}
              onBlur={commitAmount}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              inputRef={amountInputRef}
              helperText={
                minimumWage
                  ? `Default ${minimumWage.year}: ${formatMinimumWage(minimumWage)}`
                  : 'No detectamos tu país. Elegí uno arriba.'
              }
              disabled={!minimumWage}
              fullWidth
              size='small'
              slotProps={{htmlInput: {min: 0, step: 1}}}
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant='overline' color='text.secondary' sx={{display: 'block', mb: 1}}>
            Datos guardados
          </Typography>
          <Button
            variant='outlined'
            color='error'
            fullWidth
            onClick={() => setResetDialogOpen(true)}
            sx={{textTransform: 'none', borderRadius: 2}}>
            Borrar todos mis datos
          </Button>
          <Typography variant='caption' color='text.secondary' sx={{display: 'block', mt: 1}}>
            Borra respuestas, progreso y nombre asignado del navegador. Vuelve a la
            pantalla de bienvenida. No se puede deshacer.
          </Typography>
        </Box>
      </Stack>
      <Box sx={{height: theme.spacing(2), flexShrink: 0}} />
      <ResetConfirmDialog
        open={resetDialogOpen}
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={() => {
          setResetDialogOpen(false)
          onRestart()
          onClose()
        }}
      />
    </Drawer>
  )
}
