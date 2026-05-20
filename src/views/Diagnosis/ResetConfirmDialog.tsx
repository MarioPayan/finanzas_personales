import {useEffect, useRef, useState} from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

/**
 * Diálogo de confirmación para el borrado total de datos guardados.
 *
 * Comportamiento por dispositivo:
 *   - **Desktop / pointer fino:** botón "Borrar todo" con un tap normal.
 *   - **Mobile / touch:** el botón "Borrar todo" requiere mantenerse
 *     presionado por `HOLD_DURATION_MS` antes de disparar. Durante el
 *     hold se llena una barra de progreso interna; soltar antes del
 *     100% lo cancela.
 *
 * La doble confirmación en mobile evita tocazos accidentales que
 * borrarían el progreso sin posibilidad de deshacer.
 */

const HOLD_DURATION_MS = 1500
const HOLD_TICK_MS = 30

type Props = {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ResetConfirmDialog({open, onCancel, onConfirm}: Props) {
  const theme = useTheme()
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)')

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth='xs'
      fullWidth
      aria-labelledby='reset-confirm-title'>
      <DialogTitle id='reset-confirm-title' sx={{fontWeight: 700, pr: 4}}>
        ¿Borrar todos tus datos?
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant='body2' color='text.secondary' sx={{lineHeight: 1.6}}>
            Vas a perder tus respuestas, tu progreso y el nombre que te asignamos. La
            acción no se puede deshacer.
          </Typography>
          {isTouchDevice && (
            <Typography
              variant='caption'
              sx={{
                color: 'warning.main',
                fontWeight: 600,
                bgcolor: theme.palette.warning.main + '14',
                borderRadius: 1,
                px: 1,
                py: 0.5,
              }}>
              En mobile: mantené presionado "Borrar todo" durante 1,5 s para confirmar.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2.5, gap: 1}}>
        <Button onClick={onCancel} variant='outlined' color='inherit'>
          Cancelar
        </Button>
        {isTouchDevice ? (
          <HoldToConfirmButton onConfirm={onConfirm} />
        ) : (
          <Button onClick={onConfirm} variant='contained' color='error'>
            Borrar todo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

/**
 * Botón que requiere press & hold de `HOLD_DURATION_MS` para disparar.
 * Diseñado para mobile: el delay accidental-resistente reemplaza la
 * confirmación con click habitual. La barra interna se llena al ritmo
 * del hold; soltar antes del 100% cancela.
 */
function HoldToConfirmButton({onConfirm}: {onConfirm: () => void}) {
  const [progress, setProgress] = useState(0)
  const startedAt = useRef<number | null>(null)
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const firedRef = useRef(false)

  const stopTimer = () => {
    if (tickTimer.current) {
      clearInterval(tickTimer.current)
      tickTimer.current = null
    }
  }

  useEffect(() => stopTimer, [])

  const start = () => {
    if (firedRef.current) return
    startedAt.current = performance.now()
    setProgress(0)
    stopTimer()
    tickTimer.current = setInterval(() => {
      if (startedAt.current === null) return
      const elapsed = performance.now() - startedAt.current
      const pct = Math.min(1, elapsed / HOLD_DURATION_MS)
      setProgress(pct)
      if (pct >= 1 && !firedRef.current) {
        firedRef.current = true
        stopTimer()
        onConfirm()
      }
    }, HOLD_TICK_MS)
  }

  const cancel = () => {
    if (firedRef.current) return
    startedAt.current = null
    stopTimer()
    setProgress(0)
  }

  return (
    <Button
      variant='contained'
      color='error'
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      // Evita arrastres accidentales que ensucian el gesto.
      onContextMenu={e => e.preventDefault()}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
      }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'common.white',
          opacity: 0.25,
          transformOrigin: 'left center',
          transform: `scaleX(${progress})`,
          transition: 'transform 30ms linear',
        }}
      />
      <Box component='span' sx={{position: 'relative', fontWeight: 700}}>
        {progress === 0 ? 'Mantén para borrar' : `Borrando… ${Math.round(progress * 100)}%`}
      </Box>
    </Button>
  )
}
