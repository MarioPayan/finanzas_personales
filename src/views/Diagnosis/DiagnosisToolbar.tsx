import {useState} from 'react'
import {IconButton, Paper, Tooltip, useTheme} from '@mui/material'
import {GearSix, TreeStructure} from '@phosphor-icons/react'
import {type AnswerValue} from '../../content/diagnosis'
import {DiagnosisConfigDrawer} from './DiagnosisConfigDrawer'
import {DiagnosisTreeDrawer} from './DiagnosisTreeDrawer'
import type {MinimumWageEntry} from '../../content/minimumWages'

/**
 * Barra de íconos top-right. Dos accesos globales (no contextuales al
 * paso, esos viven en el header del paso vía `DiagnosisHelpPopover`):
 *
 *  - **Engranaje** → drawer de configuración (override de país, SMM,
 *    reiniciar diagnóstico).
 *  - **Árbol** → drawer con el árbol de decisiones del cuestionario.
 *
 * Los drawers son mutuamente excluyentes (sólo uno abierto a la vez).
 */

type Props = {
  currentStorageKey: string | null
  answers: Record<string, AnswerValue>
  minimumWage: MinimumWageEntry | null
  countryCode: string | null
  onSetCountry: (code: string) => void
  onSetMinimumWageAmount: (amount: number) => void
  onRestart: () => void
}

type OpenPanel = 'config' | 'tree' | null

export function DiagnosisToolbar({
  currentStorageKey,
  answers,
  minimumWage,
  countryCode,
  onSetCountry,
  onSetMinimumWageAmount,
  onRestart,
}: Props) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const theme = useTheme()

  const open = (panel: OpenPanel) => setOpenPanel(panel)
  const close = () => setOpenPanel(null)

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          top: {xs: 16, md: 24},
          right: {xs: 16, md: 24},
          zIndex: theme.zIndex.drawer - 1,
          borderRadius: 999,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          p: 0.5,
        }}>
        <Tooltip title='Configuración' placement='bottom'>
          <IconButton
            onClick={() => open('config')}
            aria-label='Abrir configuración'
            size='small'>
            <GearSix size={20} weight='regular' />
          </IconButton>
        </Tooltip>
        <Tooltip title='Árbol de decisiones' placement='bottom'>
          <IconButton onClick={() => open('tree')} aria-label='Abrir árbol de decisiones' size='small'>
            <TreeStructure size={20} weight='regular' />
          </IconButton>
        </Tooltip>
      </Paper>

      <DiagnosisConfigDrawer
        open={openPanel === 'config'}
        onClose={close}
        minimumWage={minimumWage}
        countryCode={countryCode}
        onSetCountry={onSetCountry}
        onSetMinimumWageAmount={onSetMinimumWageAmount}
        onRestart={() => {
          onRestart()
          close()
        }}
      />
      <DiagnosisTreeDrawer
        open={openPanel === 'tree'}
        onClose={close}
        answers={answers}
        currentStorageKey={currentStorageKey}
      />
    </>
  )
}
