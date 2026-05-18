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
import {TreePanel} from './Sidebar'
import type {AnswerValue} from '../../content/diagnosis'

/**
 * Drawer derecho con el árbol de decisiones del cuestionario.
 *
 * Hasta antes de mayo 2026 el árbol vivía en el sidebar izquierdo
 * permanente. Como ocupa mucho vertical y es más una herramienta de
 * navegación / sense-of-where-am-I que algo que necesite estar
 * siempre visible, lo mudamos a un drawer right-anchored con un FAB
 * que lo abre on-demand.
 *
 * El botón flotante usa posicionamiento fixed top-right, con un icono
 * de árbol inline (SVG) y aria-label legible. Se oculta cuando el
 * drawer está abierto (el drawer trae su propia close affordance).
 */

const TreeGlyph = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    aria-hidden='true'
    xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M12 3v18M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M6 15v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
    />
    <circle cx='4' cy='9' r='1.5' fill='currentColor' />
    <circle cx='20' cy='9' r='1.5' fill='currentColor' />
    <circle cx='4' cy='15' r='1.5' fill='currentColor' />
    <circle cx='20' cy='15' r='1.5' fill='currentColor' />
    <circle cx='12' cy='3' r='1.5' fill='currentColor' />
  </svg>
)

const CloseGlyph = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
    <path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
  </svg>
)

type Props = {
  answers: Record<string, AnswerValue>
  currentStorageKey: string | null
}

export function DiagnosisTreeDrawer({answers, currentStorageKey}: Props) {
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      {!open && (
        <Tooltip title='Ver árbol del cuestionario' placement='left'>
          <IconButton
            onClick={() => setOpen(true)}
            aria-label='Abrir árbol de decisiones'
            sx={{
              position: 'fixed',
              top: {xs: 16, md: 24},
              right: {xs: 16, md: 24},
              zIndex: theme.zIndex.drawer - 1,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              '&:hover': {bgcolor: 'background.paper'},
            }}>
            <TreeGlyph />
          </IconButton>
        </Tooltip>
      )}
      <Drawer
        anchor='right'
        open={open}
        onClose={() => setOpen(false)}
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
          sx={{justifyContent: 'space-between', alignItems: 'center', mb: 1.5}}>
          <Typography variant='h6' sx={{fontWeight: 700}}>
            Árbol del cuestionario
          </Typography>
          <IconButton
            size='small'
            onClick={() => setOpen(false)}
            aria-label='Cerrar'
            sx={{color: 'text.secondary'}}>
            <CloseGlyph />
          </IconButton>
        </Stack>
        <Box sx={{flex: 1, overflowY: 'auto', pb: isMobile ? 2 : 0}}>
          <TreePanel answers={answers} currentStorageKey={currentStorageKey} />
        </Box>
      </Drawer>
    </>
  )
}
