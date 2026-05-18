import {Box, Drawer, IconButton, Stack, Typography} from '@mui/material'
import {X as CloseIcon} from '@phosphor-icons/react'
import {TreePanel} from './Sidebar'
import type {AnswerValue} from '../../content/diagnosis'

/**
 * Drawer right-anchored con el árbol de decisiones del cuestionario.
 *
 * Hasta antes de mayo 2026 el árbol vivía en el sidebar izquierdo
 * permanente. Como ocupa mucho vertical y es más una herramienta de
 * navegación / sense-of-where-am-I que algo que necesite estar siempre
 * visible, lo mudamos a un drawer on-demand. La apertura la maneja
 * `DiagnosisToolbar` (los íconos top-right están agrupados).
 */

type Props = {
  open: boolean
  onClose: () => void
  answers: Record<string, AnswerValue>
  currentStorageKey: string | null
}

export function DiagnosisTreeDrawer({open, onClose, answers, currentStorageKey}: Props) {
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
        sx={{justifyContent: 'space-between', alignItems: 'center', mb: 1.5}}>
        <Typography variant='h6' sx={{fontWeight: 700}}>
          Árbol del cuestionario
        </Typography>
        <IconButton
          size='small'
          onClick={onClose}
          aria-label='Cerrar'
          sx={{color: 'text.secondary'}}>
          <CloseIcon size={18} weight='bold' />
        </IconButton>
      </Stack>
      <Box sx={{flex: 1, overflowY: 'auto'}}>
        <TreePanel answers={answers} currentStorageKey={currentStorageKey} />
      </Box>
    </Drawer>
  )
}
