import {useMemo, useState} from 'react'
import {Box, Drawer, IconButton, Link, Stack, Tab, Tabs, Typography} from '@mui/material'
import {DIAGNOSIS_QUESTIONS, findResultNode} from '../../content/diagnosis'
import DebugGraph from './DebugGraph'
import DebugDetail from './DebugDetail'
import DebugDetailSection from './DebugDetailSection'
import DebugDetailSummary from './DebugDetailSummary'
import DebugValidator from './DebugValidator'
import DebugSimulator from './DebugSimulator'

/**
 * Vista interna en `/debug`. Dos pestañas:
 *
 *   - **Flujo de nodos** — el cuestionario renderizado sobre GoJS. Click
 *     en cualquier nodo abre un Drawer con su ficha.
 *   - **Validador** — análisis declarativo de `diagnosis.ts` que reporta
 *     inconsistencias estructurales (referencias rotas, gates mal
 *     ordenados, scoring incompleto).
 *
 * Pensada para uso interno — la licencia comercial de GoJS la hace
 * inadecuada para producción pública.
 */
export default function Debug() {
  const [tab, setTab] = useState<'flow' | 'validator' | 'simulator'>('flow')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const drawerContent = useMemo(() => {
    if (!selectedKey) return null
    const result = findResultNode(selectedKey)
    if (result) {
      if (result.kind === 'summary') return <DebugDetailSummary node={result} />
      return <DebugDetailSection node={result} />
    }
    const q = DIAGNOSIS_QUESTIONS.find(x => x.storageKey === selectedKey)
    return q ? <DebugDetail question={q} /> : null
  }, [selectedKey])

  return (
    <Box sx={{minHeight: '100vh', bgcolor: 'background.default', py: 4, px: 3}}>
      <Stack spacing={3} sx={{maxWidth: 1400, mx: 'auto'}}>
        <Stack spacing={1}>
          <Typography variant='overline' color='text.secondary'>
            Debug
          </Typography>
          <Typography variant='h4' component='h1'>
            Herramientas internas del cuestionario
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Inspección estructural y validación. <Link href='/'>Volver al diagnóstico</Link>.
          </Typography>
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{borderBottom: 1, borderColor: 'divider'}}
        >
          <Tab value='flow' label='Flujo de nodos' />
          <Tab value='validator' label='Validador' />
          <Tab value='simulator' label='Simulador' />
        </Tabs>

        {tab === 'flow' && (
          <DebugGraph
            questions={DIAGNOSIS_QUESTIONS}
            selectedKey={selectedKey}
            onNodeClick={setSelectedKey}
            height={1300}
          />
        )}

        {tab === 'validator' && <DebugValidator />}
        {tab === 'simulator' && <DebugSimulator />}
      </Stack>

      <Drawer
        anchor='right'
        open={!!drawerContent}
        onClose={() => setSelectedKey(null)}
        slotProps={{
          paper: {sx: {width: {xs: '100%', sm: 520}, p: 3}},
        }}
      >
        <Stack direction='row' sx={{justifyContent: 'flex-end', mb: 1}}>
          <IconButton
            size='small'
            aria-label='Cerrar'
            onClick={() => setSelectedKey(null)}
          >
            <Box
              component='span'
              sx={{
                fontFamily: 'monospace',
                fontSize: 16,
                lineHeight: 1,
                color: 'text.secondary',
              }}
            >
              ×
            </Box>
          </IconButton>
        </Stack>
        {drawerContent}
      </Drawer>
    </Box>
  )
}
