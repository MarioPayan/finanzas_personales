import type {ReactNode} from 'react'
import {Box, Card, CardContent, Chip, Divider, Stack, Typography} from '@mui/material'
import {
  CATEGORIES,
  DIAGNOSIS_QUESTIONS,
  type DiagnosisQuestion,
  type SectionScoreNode,
  type ToneBand,
} from '../../content/diagnosis'
import {computeQuestionMax, type QuestionMaxResult} from '../../utils/scoring'

/**
 * Drawer derecho cuando se selecciona un nodo `sectionScore`. Toda la
 * información declarativa (descripción, fórmula, reglas, bandas de
 * tono) viene del propio `SectionScoreNode`. Lo derivable (qué
 * preguntas aportan y cuánto puede aportar cada una) se calcula con
 * helpers de `scoring.ts` aplicados a `DIAGNOSIS_QUESTIONS`. Función
 * pura — no usa `answers`.
 */
export default function DebugDetailSection({node}: {node: SectionScoreNode}) {
  const cat = CATEGORIES[node.category]
  const inCat = DIAGNOSIS_QUESTIONS.filter(q => q.category === node.category)
  const rows = inCat.map(q => ({question: q, max: computeQuestionMax(q)}))
  const totalFixedMax = rows.reduce((s, r) => s + (r.max.kind === 'fixed' ? r.max.max : 0), 0)

  return (
    <Stack spacing={2}>
      <Stack direction='row' spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap', gap: 0.5}}>
        <Chip label={node.kind} size='small' sx={{fontFamily: 'monospace', fontWeight: 600}} />
        <Chip label={node.category} size='small' variant='outlined' />
      </Stack>

      <Typography variant='h6' component='h2'>
        {node.title}
      </Typography>

      <Typography variant='body2' color='text.secondary' sx={{fontStyle: 'italic'}}>
        {node.description}
      </Typography>

      <Divider />

      <Section title='Fórmula'>
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'divider',
          }}>
          <Typography sx={{fontFamily: 'monospace', fontSize: 13}}>{node.formula}</Typography>
        </Box>
      </Section>

      <Section title='Reglas de inclusión'>
        <Stack spacing={0.5}>
          {node.inclusionRules.map((rule, i) => (
            <Typography key={i} variant='body2'>
              · {rule}
            </Typography>
          ))}
        </Stack>
      </Section>

      <Section title={`Preguntas que aportan al puntaje (${rows.length})`}>
        <Stack spacing={1}>
          {rows.map(row => (
            <ScoringRow key={row.question.storageKey} row={row} />
          ))}
        </Stack>
        <Box sx={{mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider'}}>
          <Typography variant='body2'>
            <Mono>
              Σ max teórico (preguntas con max fijo) = {totalFixedMax > 0 ? totalFixedMax : '—'}
            </Mono>
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            El máximo real depende de qué preguntas resulten aplicables y, en grids, de cuántas
            filas genere el usuario.
          </Typography>
        </Box>
      </Section>

      <Section title='Bandas de tono y mensaje'>
        <Typography variant='body2' color='text.secondary' sx={{mb: 1}}>
          Una vez calculado el puntaje, <Mono>SectionScore.tsx</Mono> elige color y mensaje según
          las bandas declaradas en el nodo (categoría <strong>{cat.label}</strong>):
        </Typography>
        <Stack spacing={0.75}>
          {node.toneBands.map((b, i) => (
            <ToneBandRow key={i} band={b} />
          ))}
        </Stack>
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

const formatRange = (b: ToneBand): string => {
  if (b.min !== undefined && b.max !== undefined) return `${b.min} – ${b.max - 1}`
  if (b.min !== undefined) return `≥ ${b.min}`
  if (b.max !== undefined) return `< ${b.max}`
  return 'cualquier valor'
}

function ToneBandRow({band}: {band: ToneBand}) {
  const color = `${band.color}.main`
  return (
    <Stack direction='row' spacing={1} sx={{alignItems: 'flex-start'}}>
      <Box
        sx={{
          width: 4,
          bgcolor: color,
          borderRadius: 1,
          alignSelf: 'stretch',
          flexShrink: 0,
        }}
      />
      <Stack spacing={0.25} sx={{flex: 1, minWidth: 0}}>
        <Typography variant='body2' sx={{fontWeight: 600}}>
          {formatRange(band)}{' '}
          <Typography
            component='span'
            variant='caption'
            sx={{ml: 0.5, color: 'text.secondary', fontFamily: 'monospace'}}>
            color: {band.color}
          </Typography>
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          "{band.message}"
        </Typography>
      </Stack>
    </Stack>
  )
}

function ScoringRow({row}: {row: {question: DiagnosisQuestion; max: QuestionMaxResult}}) {
  const {question, max} = row
  const display =
    max.kind === 'fixed'
      ? `max = ${max.max}`
      : `perRowMax = ${max.perRow}; max = ${max.perRow} × N filas`
  const dim = max.kind === 'fixed' && max.max === 0
  return (
    <Card variant='outlined' sx={{opacity: dim ? 0.65 : 1}}>
      <CardContent sx={{py: 1.25, '&:last-child': {pb: 1.25}}}>
        <Stack spacing={0.5}>
          <Stack direction='row' spacing={0.5} sx={{alignItems: 'center', flexWrap: 'wrap'}}>
            <Chip
              size='small'
              label={question.storageKey}
              sx={{fontFamily: 'monospace', height: 20, fontSize: 11.5}}
            />
            <Chip
              size='small'
              variant='outlined'
              label={question.type}
              sx={{height: 20, fontSize: 11}}
            />
          </Stack>
          <Typography variant='body2'>
            <strong>{question.title}</strong>
          </Typography>
          <Typography variant='body2'>
            <Mono>{display}</Mono>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
