import {useState} from 'react'
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type {ReactNode} from 'react'

/**
 * Drawer izquierdo con el "panel de información" del cuestionario
 * (glosario, tips, widgets, editor del SMM). Solo visible en xs/sm; en
 * md+ el sidebar permanente del Stepper ya muestra ese contenido.
 *
 * Complementa `DiagnosisTreeDrawer` (right): mismo patrón, lado opuesto.
 */

const InfoGlyph = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
    <circle cx='12' cy='12' r='9' stroke='currentColor' strokeWidth='1.8' />
    <path
      d='M12 8h.01M11 12h1v5h1'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

const CloseGlyph = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
    <path
      d='M6 6l12 12M18 6L6 18'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
)

export function DiagnosisInfoDrawer({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  // En md+ el sidebar permanent del Stepper ya muestra estos paneles,
  // así que no renderizamos ni FAB ni drawer.
  if (isDesktop) return null

  return (
    <>
      {!open && (
        <Tooltip title='Ver glosario y ayudas' placement='right'>
          <IconButton
            onClick={() => setOpen(true)}
            aria-label='Abrir información'
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: theme.zIndex.drawer - 1,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              '&:hover': {bgcolor: 'background.paper'},
            }}>
            <InfoGlyph />
          </IconButton>
        </Tooltip>
      )}
      <Drawer
        anchor='left'
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: {xs: '100%', sm: 380},
              p: 2,
            },
          },
        }}>
        <Stack
          direction='row'
          sx={{justifyContent: 'space-between', alignItems: 'center', mb: 1.5}}>
          <Typography variant='h6' sx={{fontWeight: 700}}>
            Ayudas y referencias
          </Typography>
          <IconButton
            size='small'
            onClick={() => setOpen(false)}
            aria-label='Cerrar'
            sx={{color: 'text.secondary'}}>
            <CloseGlyph />
          </IconButton>
        </Stack>
        <Box sx={{flex: 1, overflowY: 'auto'}}>{children}</Box>
      </Drawer>
    </>
  )
}
