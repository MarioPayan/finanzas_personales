import {Box, Card, CardContent, Chip, Stack, Typography} from '@mui/material'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  formatAnswer,
  type Answers,
  type DiagnosisCategoryId,
  type DiagnosisQuestion,
  type SidebarWidgetId,
} from '../../content/diagnosis'
import {findCreditScoreBands} from '../../content/creditScoreBands'
import {formatMinimumWage, type MinimumWageEntry} from '../../content/minimumWages'

type SidebarProps = {
  currentStorageKey: string | null
  minimumWage: MinimumWageEntry | null
  countryCode: string | null
}

// ---------- Índices precomputados ----------

const buildChildrenIndex = (): Record<string, DiagnosisQuestion[]> => {
  const map: Record<string, DiagnosisQuestion[]> = {}
  for (const q of DIAGNOSIS_QUESTIONS) {
    const parent = q.dependsOn?.[0]?.storageKey
    if (parent) (map[parent] ??= []).push(q)
  }
  return map
}

const CHILDREN_INDEX = buildChildrenIndex()

const QUESTIONS_BY_CATEGORY: Record<DiagnosisCategoryId, DiagnosisQuestion[]> = {
  base: [],
  debt: [],
  stability: [],
  investment: [],
}
for (const q of DIAGNOSIS_QUESTIONS) {
  if (!q.dependsOn) QUESTIONS_BY_CATEGORY[q.category].push(q)
}

// ---------- Helpers de "pregunta actual" ----------

/**
 * Glosario y widgets del sidebar solo aplican al nodo actualmente en
 * pantalla. La filosofía es que cada nodo declare en su propia definición
 * (`glossaryTerms`, `sidebarWidgets`) qué información necesita; no se
 * acumulan ayudas de preguntas anteriores.
 */
const getCurrentWidgets = (currentStorageKey: string | null): Set<SidebarWidgetId> => {
  const widgets = new Set<SidebarWidgetId>()
  if (!currentStorageKey) return widgets
  const current = DIAGNOSIS_QUESTIONS.find(q => q.storageKey === currentStorageKey)
  if (!current?.sidebarWidgets) return widgets
  for (const w of current.sidebarWidgets) widgets.add(w)
  return widgets
}

// El glosario contextual ahora vive dentro del cuerpo de la pregunta
// (DiagnosisQuestionBody), no en el sidebar. La logica de matching
// vive en src/utils/glossaryMatching.ts y la reusan los consumidores.

// ---------- Panel: Árbol de decisiones ----------

type NodeState = 'answered' | 'current' | 'pending' | 'skipped'

const COLOR_BY_STATE: Record<NodeState, {marker: string; text: string; muted: boolean}> = {
  answered: {marker: '✓', text: 'success.main', muted: false},
  current: {marker: '►', text: 'primary.main', muted: false},
  pending: {marker: '○', text: 'text.secondary', muted: true},
  skipped: {marker: '–', text: 'text.disabled', muted: true},
}

const stateOf = (
  q: DiagnosisQuestion,
  answers: Answers,
  currentStorageKey: string | null,
): NodeState => {
  if (currentStorageKey === q.storageKey) return 'current'
  if (answers[q.storageKey] !== undefined) return 'answered'
  if (q.dependsOn) {
    const blocked = q.dependsOn.some(c => {
      const parentValue = answers[c.storageKey]
      if (parentValue === undefined) return false
      if (c.equals !== undefined) return parentValue !== c.equals
      if (c.in) return typeof parentValue === 'object' || !c.in.includes(parentValue)
      if (c.greaterThan !== undefined)
        return typeof parentValue !== 'number' || parentValue <= c.greaterThan
      if (c.nonEmpty) return !Array.isArray(parentValue) || parentValue.length === 0
      return false
    })
    if (blocked) return 'skipped'
  }
  return 'pending'
}

const renderTreeNode = (
  q: DiagnosisQuestion,
  depth: number,
  answers: Answers,
  currentStorageKey: string | null,
) => {
  const state = stateOf(q, answers, currentStorageKey)
  const palette = COLOR_BY_STATE[state]
  const value = answers[q.storageKey]
  const children = CHILDREN_INDEX[q.storageKey] ?? []

  return (
    <Box key={q.storageKey}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          pl: depth * 2,
          py: 0.5,
          opacity: palette.muted ? 0.6 : 1,
        }}>
        <Typography
          variant='body2'
          sx={{
            fontFamily: 'monospace',
            color: palette.text,
            minWidth: 16,
            textAlign: 'center',
            fontWeight: state === 'current' ? 700 : 500,
          }}>
          {palette.marker}
        </Typography>
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography
            variant='body2'
            sx={{
              color: palette.text,
              textDecoration: state === 'skipped' ? 'line-through' : 'none',
              fontWeight: state === 'current' ? 600 : 400,
            }}>
            {q.title}
          </Typography>
          {state === 'answered' && value !== undefined && (
            <Box sx={{mt: 0.5}}>
              <Chip
                label={formatAnswer(q, value)}
                size='small'
                color='success'
                variant='outlined'
              />
            </Box>
          )}
        </Box>
      </Box>
      {children.length > 0 && (
        <Stack spacing={0}>
          {children.map(child => renderTreeNode(child, depth + 1, answers, currentStorageKey))}
        </Stack>
      )}
    </Box>
  )
}

const renderCategoryHeader = (id: DiagnosisCategoryId) => {
  const meta = CATEGORIES[id]
  return (
    <Box
      sx={{
        mt: 1.5,
        mb: 0.5,
        pb: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
      <Chip
        label={meta.shortLabel}
        size='small'
        color={meta.color}
        variant='filled'
        sx={{fontSize: '0.7rem', height: 22}}
      />
      <Typography variant='overline' color='text.secondary' sx={{lineHeight: 1}}>
        {meta.label}
      </Typography>
    </Box>
  )
}

export const TreePanel = ({
  answers,
  currentStorageKey,
}: {
  answers: Answers
  currentStorageKey: string | null
}) => (
  <Card variant='outlined'>
    <CardContent>
      <Stack spacing={1}>
        <Typography variant='overline' color='text.secondary'>
          Árbol de decisiones
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Las preguntas están agrupadas por sección.
        </Typography>
        <Stack spacing={0.5}>
          {CATEGORY_ORDER.map(catId => {
            const items = QUESTIONS_BY_CATEGORY[catId]
            if (items.length === 0) return null
            return (
              <Box key={catId}>
                {renderCategoryHeader(catId)}
                <Stack spacing={0}>
                  {items.map(q => renderTreeNode(q, 0, answers, currentStorageKey))}
                </Stack>
              </Box>
            )
          })}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
)

// ---------- Panel: Tips contextuales del nodo actual ----------

const TipsPanel = ({tips}: {tips: readonly string[]}) => (
  <Card variant='outlined'>
    <CardContent>
      <Stack spacing={1.25}>
        <Typography variant='overline' color='text.secondary'>
          Sugerencias
        </Typography>
        <Stack spacing={1}>
          {tips.map((tip, i) => (
            <Stack key={i} direction='row' spacing={1} sx={{alignItems: 'flex-start'}}>
              <Typography
                component='span'
                sx={{color: 'warning.main', flexShrink: 0, mt: 0.25, fontSize: 14}}
                aria-hidden>
                ●
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {tip}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
)

// ---------- Panel: Salario mínimo ----------

const MinimumWagePanel = ({minimumWage}: {minimumWage: MinimumWageEntry}) => (
  <Card variant='outlined'>
    <CardContent>
      <Stack spacing={0.75}>
        <Typography variant='overline' color='text.secondary'>
          Salario mínimo
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {minimumWage.countryName} · {minimumWage.year}
        </Typography>
        <Chip
          label={formatMinimumWage(minimumWage)}
          size='small'
          color='primary'
          variant='outlined'
          sx={{alignSelf: 'flex-start'}}
        />
      </Stack>
    </CardContent>
  </Card>
)

// ---------- Panel: Rangos del score crediticio (por país) ----------

const SCORE_BAND_LABEL: Record<'bad' | 'regular' | 'good' | 'excellent', string> = {
  bad: 'Malo',
  regular: 'Regular',
  good: 'Bueno',
  excellent: 'Excelente',
}

const SCORE_BAND_COLOR: Record<'bad' | 'regular' | 'good' | 'excellent', string> = {
  bad: 'error.main',
  regular: 'warning.main',
  good: 'info.main',
  excellent: 'success.main',
}

const CreditScoreScalePanel = ({countryCode}: {countryCode: string | null}) => {
  const bands = countryCode ? findCreditScoreBands(countryCode) : null
  if (!bands) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Stack spacing={0.75}>
            <Typography variant='overline' color='text.secondary'>
              Rangos del score
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              No hay tabla de referencia para tu país. Las bandas son auto-reportadas (malo /
              regular / bueno / excelente).
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant='overline' color='text.secondary'>
            Rangos del score · {bands.bureau}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Escala {bands.scoreMin}–{bands.scoreMax}
            {bands.verified ? '' : ' (referencia aproximada)'}.
          </Typography>
          <Stack spacing={0.5}>
            {(['bad', 'regular', 'good', 'excellent'] as const).map(band => {
              const r = bands.ranges[band]
              return (
                <Stack key={band} direction='row' spacing={1} sx={{alignItems: 'center'}}>
                  <Box
                    sx={{
                      width: 4,
                      height: 16,
                      bgcolor: SCORE_BAND_COLOR[band],
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant='body2' sx={{flex: 1, minWidth: 0}}>
                    {SCORE_BAND_LABEL[band]}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{fontFamily: 'monospace', color: 'text.secondary'}}>
                    {r.min}–{r.max}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

// ---------- Sidebar ----------

export default function Sidebar({
  currentStorageKey,
  minimumWage,
  countryCode,
}: SidebarProps) {
  const widgets = getCurrentWidgets(currentStorageKey)
  const currentQuestion = currentStorageKey
    ? DIAGNOSIS_QUESTIONS.find(q => q.storageKey === currentStorageKey)
    : null
  const tips = currentQuestion?.tips
  return (
    <Stack spacing={2} sx={{position: 'sticky', top: 16}}>
      {tips && tips.length > 0 && <TipsPanel tips={tips} />}
      {widgets.has('minimumWage') && minimumWage && <MinimumWagePanel minimumWage={minimumWage} />}
      {widgets.has('creditScoreScale') && <CreditScoreScalePanel countryCode={countryCode} />}
    </Stack>
  )
}
