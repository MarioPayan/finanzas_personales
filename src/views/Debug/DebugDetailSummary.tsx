import type {ReactNode} from 'react'
import {Box, Chip, Divider, Stack, Typography} from '@mui/material'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  type DiagnosisCategoryId,
  type InsightSeverity,
  type SummaryNode,
} from '../../content/diagnosis'

/**
 * Drawer derecho cuando se selecciona el nodo `summary`. Toda la
 * información declarativa (descripción, componentes, severidades)
 * viene del `SummaryNode`. Lo derivable (inventario de insights por
 * categoría/severidad) se calcula sobre `DIAGNOSIS_QUESTIONS`. Función
 * pura — no usa `answers`.
 */
export default function DebugDetailSummary({node}: {node: SummaryNode}) {
  const inventory = buildInsightInventory()

  return (
    <Stack spacing={2}>
      <Stack direction='row' spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap', gap: 0.5}}>
        <Chip label={node.kind} size='small' sx={{fontFamily: 'monospace', fontWeight: 600}} />
      </Stack>

      <Typography variant='h6' component='h2'>
        {node.title}
      </Typography>

      <Typography variant='body2' color='text.secondary' sx={{fontStyle: 'italic'}}>
        {node.description}
      </Typography>

      <Divider />

      {node.components.map((component, i) => (
        <Section key={component.id} title={`${i + 1} · ${component.title}`}>
          {component.userHeading && (
            <Typography variant='caption' color='text.secondary' sx={{display: 'block', mb: 0.5}}>
              Encabezado al usuario: <Mono>"{component.userHeading}"</Mono>
            </Typography>
          )}
          <Typography variant='body2'>{component.description}</Typography>
        </Section>
      ))}

      <Section title='Orden y agrupación'>
        <Stack spacing={0.75}>
          <Typography variant='body2'>
            <strong>Orden global por severidad</strong> (declarado en <Mono>severityOrder</Mono>):
          </Typography>
          <Stack direction='row' spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap'}}>
            {node.severityOrder.map((sev, i, arr) => (
              <Stack key={sev} direction='row' spacing={1} sx={{alignItems: 'center'}}>
                <SeverityPill severity={sev} node={node} />
                {i < arr.length - 1 && (
                  <Typography variant='body2' color='text.secondary'>
                    →
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
          <Typography variant='body2' sx={{mt: 1}}>
            <strong>Render:</strong> después del orden global, los insights se agrupan por categoría
            siguiendo <Mono>CATEGORY_ORDER</Mono>: <em>{CATEGORY_ORDER.join(' → ')}</em>.
          </Typography>
        </Stack>
      </Section>

      <Section title='Inventario de insights por categoría / severidad'>
        <Typography variant='body2' color='text.secondary' sx={{mb: 1}}>
          Cuántos insights existen declarados en <Mono>DIAGNOSIS_QUESTIONS</Mono>. Un insight cuenta
          acá si está declarado, independientemente de si su <Mono>when</Mono> se cumple para algún
          usuario.
        </Typography>
        <InsightInventoryTable inventory={inventory} severities={[...node.severityOrder]} />
      </Section>
    </Stack>
  )
}

const Mono = ({children}: {children: ReactNode}) => (
  <Typography component='span' sx={{fontFamily: 'monospace', fontSize: 13}}>
    {children}
  </Typography>
)

function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <Box>
      <Typography
        variant='overline'
        color='text.secondary'
        sx={{lineHeight: 1.5, display: 'block'}}>
        {title}
      </Typography>
      <Box sx={{mt: 0.5}}>{children}</Box>
    </Box>
  )
}

function SeverityPill({severity, node}: {severity: InsightSeverity; node: SummaryNode}) {
  const meta = node.severityLabels[severity]
  const color = `${meta.color}.main`
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: 0.75,
        border: '1px solid',
        borderColor: color,
      }}>
      <Typography sx={{color, fontSize: 11, fontWeight: 700, fontFamily: 'monospace'}}>
        {severity}
      </Typography>
      <Typography sx={{color: 'text.secondary', fontSize: 11}}>· {meta.label}</Typography>
    </Box>
  )
}

// ---------- Inventario ----------

type InsightInventory = Record<DiagnosisCategoryId, Record<InsightSeverity, number>>

function buildInsightInventory(): InsightInventory {
  const empty = (): Record<InsightSeverity, number> => ({
    critical: 0,
    warning: 0,
    info: 0,
    positive: 0,
  })
  const out = Object.fromEntries(
    CATEGORY_ORDER.map(c => [c, empty()]),
  ) as InsightInventory
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (!q.insights) continue
    for (const ins of q.insights) {
      const sev = ins.severity ?? 'info'
      out[q.category][sev] += 1
    }
  }
  return out
}

function InsightInventoryTable({
  inventory,
  severities,
}: {
  inventory: InsightInventory
  severities: InsightSeverity[]
}) {
  const cols = severities.length + 2
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `1fr repeat(${cols - 1}, auto)`,
        gap: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
      }}>
      <HeadCell>Categoría</HeadCell>
      {severities.map(sev => (
        <HeadCell key={sev} align='right'>
          {sev}
        </HeadCell>
      ))}
      <HeadCell align='right'>total</HeadCell>

      {CATEGORY_ORDER.map(cat => {
        const row = inventory[cat]
        const total = severities.reduce((s, sev) => s + row[sev], 0)
        return (
          <RowCells
            key={cat}
            label={CATEGORIES[cat].shortLabel}
            values={severities.map(sev => row[sev])}
            total={total}
          />
        )
      })}
    </Box>
  )
}

function HeadCell({children, align}: {children: ReactNode; align?: 'right'}) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        textAlign: align ?? 'left',
      }}>
      <Typography
        variant='caption'
        sx={{
          fontWeight: 700,
          fontFamily: 'monospace',
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}>
        {children}
      </Typography>
    </Box>
  )
}

function RowCells({label, values, total}: {label: string; values: number[]; total: number}) {
  return (
    <>
      <Cell>
        <Typography variant='body2' sx={{fontWeight: 600}}>
          {label}
        </Typography>
      </Cell>
      {values.map((v, i) => (
        <Cell key={i} align='right' dim={v === 0}>
          <Mono>{v}</Mono>
        </Cell>
      ))}
      <Cell align='right'>
        <Mono>
          <strong>{total}</strong>
        </Mono>
      </Cell>
    </>
  )
}

function Cell({children, align, dim}: {children: ReactNode; align?: 'right'; dim?: boolean}) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: align ?? 'left',
        opacity: dim ? 0.4 : 1,
      }}>
      {children}
    </Box>
  )
}
