import type {ReactNode} from 'react'
import {Box, Card, CardContent, Chip, Divider, Stack, Typography} from '@mui/material'
import {
  type ChipOption,
  type ChipsQuestion,
  type DependencyClause,
  type DiagnosisQuestion,
  type GridQuestion,
  type Insight,
  type InsightCondition,
  type InsightSeverity,
  type MultiChipsQuestion,
  type NumberQuestion,
  type ScalarAnswer,
  type SliderQuestion,
  type ToggleQuestion,
  type ValueScoring,
} from '../../content/diagnosis'
import {extractReferencedKeys} from '../../utils/insights'

/**
 * Contenido del Drawer derecho que se abre al clickear un nodo del grafo
 * en `/debug`. Renderiza la ficha completa del nodo: identidad,
 * aplicabilidad, derivación, glosario, sidebar widgets, tips,
 * configuración (opciones con scores y brackets), scoring e insights con
 * sus condiciones expandidas. Función pura sobre la `DiagnosisQuestion`.
 */
export default function DebugDetail({question}: {question: DiagnosisQuestion}) {
  return (
    <Stack spacing={2}>
      <Stack direction='row' spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap', gap: 0.5}}>
        <Chip
          label={question.storageKey}
          size='small'
          sx={{fontFamily: 'monospace', fontWeight: 600}}
        />
        <Chip label={question.type} size='small' variant='outlined' />
      </Stack>

      <Typography variant='h6' component='h2'>
        {question.title}
      </Typography>

      <Typography variant='body2' color='text.secondary' sx={{fontStyle: 'italic'}}>
        {question.description}
      </Typography>

      <Divider />

      <Section title='Pregunta visible'>
        <Typography variant='body1'>{question.prompt}</Typography>
        {question.hint && (
          <Typography variant='body2' color='text.secondary' sx={{mt: 0.5}}>
            hint: {question.hint}
          </Typography>
        )}
      </Section>

      <Section title='Aplicabilidad'>
        <ApplicabilityView question={question} />
      </Section>

      {question.derivation && (
        <Section title='Derivación'>
          <Stack direction='row' spacing={0.5} sx={{alignItems: 'center', flexWrap: 'wrap'}}>
            <Mono>{question.derivation.kind}</Mono>
            {question.derivation.inputs.length > 0 && (
              <>
                <Mono>← inputs:</Mono>
                {question.derivation.inputs.map(k => (
                  <KeyChip key={k} k={k} />
                ))}
              </>
            )}
          </Stack>
        </Section>
      )}

      {question.glossaryTerms && question.glossaryTerms.length > 0 && (
        <Section title='Glosario'>
          <Stack direction='row' spacing={0.5} sx={{flexWrap: 'wrap', gap: 0.5}}>
            {question.glossaryTerms.map(t => (
              <Chip key={t} size='small' label={t} variant='outlined' />
            ))}
          </Stack>
        </Section>
      )}

      {question.sidebarWidgets && question.sidebarWidgets.length > 0 && (
        <Section title='Sidebar widgets'>
          <Stack direction='row' spacing={0.5} sx={{flexWrap: 'wrap', gap: 0.5}}>
            {question.sidebarWidgets.map(w => (
              <Chip key={w} size='small' label={w} variant='outlined' />
            ))}
          </Stack>
        </Section>
      )}

      {question.tips && question.tips.length > 0 && (
        <Section title='Tips contextuales'>
          <Stack spacing={0.5}>
            {question.tips.map((t, i) => (
              <Typography key={i} variant='body2'>
                · {t}
              </Typography>
            ))}
          </Stack>
        </Section>
      )}

      <Section title='Configuración'>
        <ConfigurationView question={question} />
      </Section>

      <Section title='Scoring'>
        <ScoringView question={question} />
      </Section>

      {question.insights && question.insights.length > 0 && (
        <Section title={`Insights (${question.insights.length})`}>
          <Stack spacing={2}>
            {question.insights.map(ins => (
              <InsightView key={ins.id} insight={ins} />
            ))}
          </Stack>
        </Section>
      )}
    </Stack>
  )
}

const KeyChip = ({k}: {k: string}) => (
  <Chip
    size='small'
    label={k}
    sx={{fontFamily: 'monospace', height: 22, fontSize: 12}}
  />
)

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
        sx={{lineHeight: 1.5, display: 'block'}}
      >
        {title}
      </Typography>
      <Box sx={{mt: 0.5}}>{children}</Box>
    </Box>
  )
}

const formatScalar = (v: ScalarAnswer): string => {
  if (typeof v === 'string') return JSON.stringify(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return String(v)
}

const formatBand = (b: ValueScoring[number]): string => {
  const low = b.min === undefined ? '−∞' : b.min
  const high = b.max === undefined ? '+∞' : b.max
  return `[${low}, ${high}) → ${b.score}`
}

function ApplicabilityView({question}: {question: DiagnosisQuestion}) {
  const lines: ReactNode[] = []
  if (!question.dependsOn || question.dependsOn.length === 0) {
    lines.push(
      <Typography key='always' variant='body2'>
        Siempre aplica.
      </Typography>,
    )
  } else {
    lines.push(
      <Typography key='dep-header' variant='body2' color='text.secondary'>
        dependsOn (AND):
      </Typography>,
    )
    question.dependsOn.forEach((c, i) => lines.push(<DependsOnLine key={`dep-${i}`} clause={c} />))
  }
  if (question.type === 'grid') {
    const rs = question.rowSource
    lines.push(
      <Typography key='rs' variant='body2' sx={{mt: 0.5}}>
        <Mono>rowSource.{rs.kind}</Mono> ← <KeyChip k={rs.storageKey} />
        {rs.kind === 'count' && <Mono> · template: {JSON.stringify(rs.labelTemplate)}</Mono>}
      </Typography>,
    )
  }
  return <Stack spacing={0.5}>{lines}</Stack>
}

function DependsOnLine({clause}: {clause: DependencyClause}) {
  let op: ReactNode = '?'
  if (clause.equals !== undefined) op = <Mono>== {formatScalar(clause.equals)}</Mono>
  else if (clause.in)
    op = <Mono>∈ [{clause.in.map(formatScalar).join(', ')}]</Mono>
  else if (clause.greaterThan !== undefined) op = <Mono>&gt; {clause.greaterThan}</Mono>
  else if (clause.nonEmpty) op = <Mono>is non-empty</Mono>
  return (
    <Stack direction='row' spacing={0.5} sx={{alignItems: 'center'}}>
      <KeyChip k={clause.storageKey} />
      {op}
    </Stack>
  )
}

function ConfigurationView({question}: {question: DiagnosisQuestion}) {
  switch (question.type) {
    case 'chips':
      return <ChipsConfig q={question} />
    case 'multiChips':
      return <MultiChipsConfig q={question} />
    case 'slider':
      return <SliderConfig q={question} />
    case 'toggle':
      return <ToggleConfig q={question} />
    case 'number':
      return <NumberConfig q={question} />
    case 'grid':
      return <GridConfig q={question} />
  }
}

function ChipsConfig({q}: {q: ChipsQuestion}) {
  return (
    <Stack spacing={1}>
      <Typography variant='body2' color='text.secondary'>
        options ({q.options.length}):
      </Typography>
      <Stack spacing={0.5} sx={{ml: 1}}>
        {q.options.map(o => (
          <ChipOptionRow key={o.value} option={o} />
        ))}
      </Stack>
      {q.exactInput && (
        <Typography variant='body2'>
          <Mono>exactInput: {JSON.stringify(q.exactInput)}</Mono>
        </Typography>
      )}
    </Stack>
  )
}

function MultiChipsConfig({q}: {q: MultiChipsQuestion}) {
  return (
    <Stack spacing={1}>
      <Typography variant='body2' color='text.secondary'>
        options ({q.options.length}, multi-select):
      </Typography>
      <Stack spacing={0.5} sx={{ml: 1}}>
        {q.options.map(o => (
          <ChipOptionRow key={o.value} option={o} />
        ))}
      </Stack>
    </Stack>
  )
}

function SliderConfig({q}: {q: SliderQuestion}) {
  return (
    <Stack spacing={0.5}>
      <Typography variant='body2'>
        <Mono>
          min={q.min}, max={q.max}, step={q.step}, default={q.defaultValue}
          {q.unit && `, unit=${JSON.stringify(q.unit)}`}
        </Mono>
      </Typography>
      {q.marks && (
        <Typography variant='body2'>
          <Mono>
            marks: {q.marks.map(m => `${m.value}=${JSON.stringify(m.label)}`).join(', ')}
          </Mono>
        </Typography>
      )}
    </Stack>
  )
}

function ToggleConfig({q}: {q: ToggleQuestion}) {
  return (
    <Typography variant='body2'>
      <Mono>
        true={JSON.stringify(q.trueLabel ?? 'Sí')}, false=
        {JSON.stringify(q.falseLabel ?? 'No')}
      </Mono>
    </Typography>
  )
}

function NumberConfig({q}: {q: NumberQuestion}) {
  return (
    <Typography variant='body2'>
      <Mono>
        min={q.min ?? '−∞'}, max={q.max ?? '+∞'}, step={q.step ?? 1}, default={q.defaultValue ?? '—'}
        {q.unit && `, unit=${JSON.stringify(q.unit)}`}
        {q.placeholder && `, placeholder=${JSON.stringify(q.placeholder)}`}
      </Mono>
    </Typography>
  )
}

function GridConfig({q}: {q: GridQuestion}) {
  return (
    <Stack spacing={1}>
      <Typography variant='body2'>
        <Mono>cell.kind: {q.cell.kind}</Mono>
      </Typography>
      {q.cell.kind === 'chips' ? (
        <>
          <Typography variant='body2' color='text.secondary'>
            cell.options ({q.cell.options.length}):
          </Typography>
          <Stack spacing={0.5} sx={{ml: 1}}>
            {q.cell.options.map(o => (
              <ChipOptionRow key={o.value} option={o} />
            ))}
          </Stack>
          {q.cell.exactInput && (
            <Typography variant='body2'>
              <Mono>cell.exactInput: {JSON.stringify(q.cell.exactInput)}</Mono>
            </Typography>
          )}
        </>
      ) : (
        <Typography variant='body2'>
          <Mono>cell.exactInput: {JSON.stringify(q.cell.exactInput)}</Mono>
        </Typography>
      )}
    </Stack>
  )
}

function ChipOptionRow({option}: {option: ChipOption}) {
  const parts: string[] = [option.value]
  if (option.score !== undefined) parts.push(`score=${option.score}`)
  if (option.bracket)
    parts.push(`bracket=[${option.bracket.min ?? '−∞'}, ${option.bracket.max ?? '+∞'})`)
  return (
    <Box>
      <Typography variant='body2'>
        <Mono>{parts.join(' · ')}</Mono> <strong>{option.label}</strong>
      </Typography>
      {option.sublabel && (
        <Typography variant='caption' color='text.secondary' sx={{ml: 1}}>
          sublabel: {option.sublabel}
        </Typography>
      )}
      {option.examples && option.examples.length > 0 && (
        <Typography variant='caption' color='text.disabled' sx={{display: 'block', ml: 1}}>
          examples: {option.examples.join(' · ')}
        </Typography>
      )}
    </Box>
  )
}

function ScoringView({question}: {question: DiagnosisQuestion}) {
  switch (question.type) {
    case 'chips': {
      const chipMax = Math.max(0, ...question.options.map(o => o.score ?? 0))
      const exactMax = question.exactScore
        ? Math.max(0, ...question.exactScore.map(b => b.score))
        : 0
      const max = Math.max(chipMax, exactMax)
      return (
        <Stack spacing={0.5}>
          <Typography variant='body2'>
            <Mono>max = {max}</Mono>
          </Typography>
          {question.exactScore && (
            <Typography variant='body2'>
              <Mono>exactScore: {question.exactScore.map(formatBand).join('; ')}</Mono>
            </Typography>
          )}
        </Stack>
      )
    }
    case 'multiChips': {
      const max = question.options.reduce((s, o) => s + (o.score ?? 0), 0)
      return (
        <Typography variant='body2'>
          <Mono>max = sum(options) = {max}</Mono>
        </Typography>
      )
    }
    case 'slider':
    case 'number': {
      if (!question.score)
        return (
          <Typography variant='body2' color='text.secondary'>
            (sin scoring — no entra al puntaje)
          </Typography>
        )
      const max = Math.max(...question.score.map(b => b.score))
      return (
        <Stack spacing={0.5}>
          <Typography variant='body2'>
            <Mono>max = {max}</Mono>
          </Typography>
          <Typography variant='body2'>
            <Mono>bands: {question.score.map(formatBand).join('; ')}</Mono>
          </Typography>
        </Stack>
      )
    }
    case 'toggle': {
      if (!question.score)
        return (
          <Typography variant='body2' color='text.secondary'>
            (sin scoring — no entra al puntaje)
          </Typography>
        )
      return (
        <Typography variant='body2'>
          <Mono>
            whenTrue={question.score.whenTrue}, whenFalse={question.score.whenFalse}, max=
            {Math.max(question.score.whenTrue, question.score.whenFalse)}
          </Mono>
        </Typography>
      )
    }
    case 'grid': {
      if (question.cell.kind === 'chips') {
        const chipMax = Math.max(0, ...question.cell.options.map(o => o.score ?? 0))
        const exactMax = question.cell.exactScore
          ? Math.max(0, ...question.cell.exactScore.map(b => b.score))
          : 0
        const perRow = Math.max(chipMax, exactMax)
        return (
          <Stack spacing={0.5}>
            <Typography variant='body2'>
              <Mono>perRowMax = {perRow}, totalMax = perRow × filas</Mono>
            </Typography>
            {question.cell.exactScore && (
              <Typography variant='body2'>
                <Mono>cell.exactScore: {question.cell.exactScore.map(formatBand).join('; ')}</Mono>
              </Typography>
            )}
          </Stack>
        )
      }
      if (!question.cell.score)
        return (
          <Typography variant='body2' color='text.secondary'>
            (sin scoring — no entra al puntaje)
          </Typography>
        )
      const perRow = Math.max(...question.cell.score.map(b => b.score))
      return (
        <Stack spacing={0.5}>
          <Typography variant='body2'>
            <Mono>perRowMax = {perRow}, totalMax = perRow × filas</Mono>
          </Typography>
          <Typography variant='body2'>
            <Mono>cell.score: {question.cell.score.map(formatBand).join('; ')}</Mono>
          </Typography>
        </Stack>
      )
    }
  }
}

const SEVERITY_COLOR: Record<InsightSeverity, string> = {
  critical: 'error.main',
  warning: 'warning.main',
  info: 'info.main',
  positive: 'success.main',
}

function InsightView({insight}: {insight: Insight}) {
  const refs = extractReferencedKeys(insight.when)
  const severity = insight.severity ?? 'info'
  const color = SEVERITY_COLOR[severity]
  return (
    <Card variant='outlined' sx={{borderLeft: '4px solid', borderLeftColor: color}}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction='row' spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap', gap: 0.5}}>
            <Chip label={insight.id} size='small' sx={{fontFamily: 'monospace', fontWeight: 600}} />
            <Chip label={severity} size='small' variant='outlined' sx={{color, borderColor: color}} />
          </Stack>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              diagnóstico
            </Typography>
            <Typography variant='body1'>{insight.diagnostic}</Typography>
          </Box>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              tip
            </Typography>
            <Typography variant='body1'>{insight.tip}</Typography>
          </Box>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              condición (`when`)
            </Typography>
            <Box
              sx={{
                mt: 0.5,
                p: 1.5,
                bgcolor: 'background.default',
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <ConditionView condition={insight.when} />
            </Box>
          </Box>
          {refs.length > 0 && (
            <Box>
              <Typography variant='caption' color='text.secondary'>
                respuestas que alimentan la condición
              </Typography>
              <Stack direction='row' spacing={0.5} sx={{mt: 0.5, flexWrap: 'wrap', gap: 0.5}}>
                {refs.map(k => (
                  <KeyChip key={k} k={k} />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

function ConditionView({condition}: {condition: InsightCondition}) {
  if (condition.kind === 'all' || condition.kind === 'any') {
    return (
      <Box>
        <Typography
          sx={{fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'primary.main'}}
        >
          {condition.kind}
        </Typography>
        <Stack
          spacing={0.5}
          sx={{ml: 2, mt: 0.5, borderLeft: '2px solid', borderColor: 'divider', pl: 2}}
        >
          {condition.of.map((c, i) => (
            <ConditionView key={i} condition={c} />
          ))}
        </Stack>
      </Box>
    )
  }
  if (condition.kind === 'not') {
    return (
      <Box>
        <Typography
          sx={{fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'warning.main'}}
        >
          not
        </Typography>
        <Box sx={{ml: 2, mt: 0.5, borderLeft: '2px solid', borderColor: 'divider', pl: 2}}>
          <ConditionView condition={condition.of} />
        </Box>
      </Box>
    )
  }
  return (
    <Typography sx={{fontFamily: 'monospace', fontSize: 13}}>{renderAtom(condition)}</Typography>
  )
}

function renderAtom(c: InsightCondition): string {
  switch (c.kind) {
    case 'equals':
      return `${c.key} == ${formatScalar(c.value)}`
    case 'in':
      return `${c.key} ∈ [${c.values.map(formatScalar).join(', ')}]`
    case 'numberAbove':
      return `${c.key} > ${c.threshold}`
    case 'numberBelow':
      return `${c.key} < ${c.threshold}`
    case 'numberAtLeast':
      return `${c.key} >= ${c.threshold}`
    case 'numberAtMost':
      return `${c.key} <= ${c.threshold}`
    case 'multiHas':
      return `${c.key} contains ${formatScalar(c.value)}`
    case 'multiCountAtLeast':
      return `count(${c.key}) >= ${c.count}`
    case 'multiCountAtMost':
      return `count(${c.key}) <= ${c.count}`
    case 'gridAnyIn':
      return `any row in ${c.key} ∈ [${c.values.map(formatScalar).join(', ')}]`
    case 'gridEveryIn':
      return `every row in ${c.key} ∈ [${c.values.map(formatScalar).join(', ')}]`
    case 'gridCountInAtLeast':
      return `count of rows in ${c.key} ∈ [${c.values.map(formatScalar).join(', ')}] >= ${c.count}`
    case 'gridAnyNumberAbove':
      return `any row in ${c.key} > ${c.threshold}`
    case 'gridAnyNumberBelow':
      return `any row in ${c.key} < ${c.threshold}`
    case 'gridEveryNumberBelow':
      return `every row in ${c.key} < ${c.threshold}`
    case 'incomeBelowSmmTimes':
      return `monthly income < ${c.multiplier} × SMM (consume incomeBand)`
    case 'incomeAboveSmmTimes':
      return `monthly income > ${c.multiplier} × SMM (consume incomeBand)`
    case 'incomeBelowCountryAverageTimes':
      return `monthly income < ${c.multiplier} × country mean (consume incomeBand + WID)`
    case 'incomeAboveCountryAverageTimes':
      return `monthly income > ${c.multiplier} × country mean (consume incomeBand + WID)`
    case 'obligatoryAbsoluteBelowSmmTimes':
      return `obligatoryAmount < ${c.multiplier} × SMM (consume obligatoryPct + incomeBand)`
    case 'obligatoryAbsoluteAboveSmmTimes':
      return `obligatoryAmount > ${c.multiplier} × SMM (consume obligatoryPct + incomeBand)`
    case 'all':
    case 'any':
    case 'not':
      return c.kind
  }
}
