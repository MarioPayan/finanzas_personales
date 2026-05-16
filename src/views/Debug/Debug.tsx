import {useMemo, useState} from 'react'
import {Box, Drawer, IconButton, Link, Stack, Typography} from '@mui/material'
import {DIAGNOSIS_QUESTIONS, findResultNode} from '../../content/diagnosis'
import DebugGraph from './DebugGraph'
import DebugDetail from './DebugDetail'
import DebugDetailSection from './DebugDetailSection'
import DebugDetailSummary from './DebugDetailSummary'

/**
 * Vista interna en `/debug`. El cuestionario renderizado como flujo
 * vertical sobre GoJS; cada nodo es compacto (título + chips) y al
 * clickearlo se abre un Drawer derecho con su ficha:
 *
 *   - Pregunta normal (`question` / `gate`) → ficha del nodo.
 *   - Nodo `__sectionScore__{cat}` → cómo se calcula el puntaje de la
 *     sección.
 *   - Nodo `__summary__` → cómo se compone la pantalla final.
 *
 * Pensada para uso interno — la licencia comercial de GoJS la hace
 * inadecuada para producción pública.
 */
export default function Debug() {
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
            Cuestionario · flujo de nodos
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Click en cualquier nodo para abrir su ficha en el panel derecho.
            Los nodos de resultado (puntaje de sección y diagnóstico final)
            explican cómo se calculan. <Link href='/'>Volver al diagnóstico</Link>.
          </Typography>
        </Stack>

        <DebugGraph
          questions={DIAGNOSIS_QUESTIONS}
          selectedKey={selectedKey}
          onNodeClick={setSelectedKey}
          height={1300}
        />
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
