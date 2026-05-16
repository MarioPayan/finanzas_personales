import {useMemo} from 'react'
import {Alert, Box, Chip, Stack, Typography} from '@mui/material'
import {validateDiagnosis, type ValidationIssue} from '../../utils/validator'

/**
 * Pestaña "Validador" en `/debug`. Ejecuta el validador declarativo y muestra
 * los problemas detectados agrupados por severidad. Es informativa — no
 * bloquea ni edita; sirve para detectar referencias rotas, ordenamientos
 * imposibles y huecos de scoring sin recorrer el quiz entero.
 */

const SEVERITY_META = {
  error: {label: 'Error', color: 'error' as const, order: 0},
  warning: {label: 'Advertencia', color: 'warning' as const, order: 1},
  info: {label: 'Info', color: 'info' as const, order: 2},
}

const CATEGORY_LABEL: Record<ValidationIssue['category'], string> = {
  reference: 'Referencias',
  flow: 'Flujo',
  scoring: 'Scoring',
  insights: 'Insights',
  glossary: 'Glosario',
}

export default function DebugValidator() {
  const report = useMemo(() => validateDiagnosis(), [])

  const sorted = useMemo(() => {
    return [...report.issues].sort((a, b) => {
      const da = SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order
      if (da !== 0) return da
      return a.category.localeCompare(b.category)
    })
  }, [report])

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant='overline' color='text.secondary'>
          Validador del cuestionario
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Análisis declarativo de <code>diagnosis.ts</code> + <code>glossary.ts</code>.
          Sin ejecutar el quiz: detecta referencias rotas, dependencias mal
          ordenadas, brechas de scoring y huecos de cobertura de insights.
        </Typography>
      </Stack>

      <Stack direction='row' spacing={2} sx={{flexWrap: 'wrap'}}>
        <Stat label='Nodos' value={report.totals.nodes} />
        <Stat label='Insights' value={report.totals.insights} />
        <Stat label='Errores' value={report.totals.errors} color='error.main' />
        <Stat label='Advertencias' value={report.totals.warnings} color='warning.main' />
        <Stat label='Infos' value={report.totals.infos} color='info.main' />
      </Stack>

      {report.totals.errors === 0 && report.totals.warnings === 0 && (
        <Alert severity='success'>
          Sin errores ni advertencias estructurales. Los <em>infos</em> abajo (si
          los hay) son sugerencias, no problemas.
        </Alert>
      )}

      {sorted.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          El cuestionario pasa todos los checks.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {sorted.map((issue, i) => (
            <IssueRow key={i} issue={issue} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

function Stat({label, value, color}: {label: string; value: number; color?: string}) {
  return (
    <Stack spacing={0.25} sx={{minWidth: 88}}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='h5' sx={{color}}>
        {value}
      </Typography>
    </Stack>
  )
}

function IssueRow({issue}: {issue: ValidationIssue}) {
  const meta = SEVERITY_META[issue.severity]
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Chip
        size='small'
        label={meta.label}
        color={meta.color}
        variant='filled'
        sx={{minWidth: 92}}
      />
      <Stack spacing={0.5} sx={{flex: 1, minWidth: 0}}>
        <Stack direction='row' spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap'}}>
          <Chip
            size='small'
            label={CATEGORY_LABEL[issue.category]}
            variant='outlined'
          />
          {issue.nodeKey && (
            <Typography
              variant='caption'
              sx={{fontFamily: 'monospace', color: 'text.secondary'}}
            >
              {issue.nodeKey}
              {issue.insightId ? ` · ${issue.insightId}` : ''}
            </Typography>
          )}
        </Stack>
        <Typography variant='body2'>{issue.message}</Typography>
      </Stack>
    </Box>
  )
}
