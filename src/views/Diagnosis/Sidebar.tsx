import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  formatAnswer,
  type AnswerValue,
  type Answers,
  type DiagnosisCategoryId,
  type DiagnosisQuestion,
  type SidebarWidgetId,
} from '../../content/diagnosis'
import {findCreditScoreBands} from '../../content/creditScoreBands'
import {getGlossaryEntries, type GlossaryEntry} from '../../content/glossary'
import {formatMinimumWage, type MinimumWageEntry} from '../../content/minimumWages'

type SidebarProps = {
  answers: Answers
  currentStorageKey: string | null
  minimumWage: MinimumWageEntry | null
  countryCode: string | null
  /** Setea una respuesta sin avanzar al siguiente paso. Lo usa el editor
   * global del salario que vive en este sidebar. */
  onAnswer: (storageKey: string, value: AnswerValue) => void
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

// ---------- Helpers de "preguntas activas" ----------

const isActive = (q: DiagnosisQuestion, answers: Answers, currentStorageKey: string | null) =>
  answers[q.storageKey] !== undefined || q.storageKey === currentStorageKey

const getActiveWidgets = (
  answers: Answers,
  currentStorageKey: string | null,
): Set<SidebarWidgetId> => {
  const widgets = new Set<SidebarWidgetId>()
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (!isActive(q, answers, currentStorageKey) || !q.sidebarWidgets) continue
    for (const w of q.sidebarWidgets) widgets.add(w)
  }
  return widgets
}

// ---------- Glosario: filtro por aparición literal ----------

const DIACRITICS_RE = /[\u0300-\u036f]/g
const normalize = (s: string): string => s.toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '')

const collectChipsText = (
  options: readonly {label: string; sublabel?: string; examples?: readonly string[]}[],
): string[] => {
  const parts: string[] = []
  for (const o of options) {
    parts.push(o.label)
    if (o.sublabel) parts.push(o.sublabel)
    if (o.examples) parts.push(...o.examples)
  }
  return parts
}

const getQuestionText = (q: DiagnosisQuestion): string => {
  const parts: string[] = [q.prompt, q.title, q.description]
  if (q.hint) parts.push(q.hint)
  if (q.tips) parts.push(...q.tips)
  if (q.type === 'chips' || q.type === 'multiChips') {
    parts.push(...collectChipsText(q.options))
  } else if (q.type === 'toggle') {
    if (q.trueLabel) parts.push(q.trueLabel)
    if (q.falseLabel) parts.push(q.falseLabel)
  } else if (q.type === 'grid' && q.cell.kind === 'chips') {
    parts.push(...collectChipsText(q.cell.options))
  }
  return parts.join(' ')
}

const getActiveGlossary = (answers: Answers, currentStorageKey: string | null): GlossaryEntry[] => {
  const activeQuestions: DiagnosisQuestion[] = []
  const ids: string[] = []
  const seen = new Set<string>()
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (!isActive(q, answers, currentStorageKey)) continue
    activeQuestions.push(q)
    if (!q.glossaryTerms) continue
    for (const id of q.glossaryTerms) {
      if (seen.has(id)) continue
      seen.add(id)
      ids.push(id)
    }
  }
  const haystack = normalize(activeQuestions.map(getQuestionText).join(' '))
  return getGlossaryEntries(ids).filter(e => haystack.includes(normalize(e.term)))
}

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

const TreePanel = ({answers, currentStorageKey}: {answers: Answers; currentStorageKey: string | null}) => (
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

// ---------- Panel: Glosario ----------

const GlossaryPanel = ({answers, currentStorageKey}: {answers: Answers; currentStorageKey: string | null}) => {
  const glossary = getActiveGlossary(answers, currentStorageKey)
  if (glossary.length === 0) return null
  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant='overline' color='text.secondary'>
            Glosario
          </Typography>
          <List disablePadding sx={{'& li + li': {mt: 1.5}}}>
            {glossary.map((entry, idx) => (
              <Box key={entry.id}>
                {idx > 0 && <Divider sx={{mb: 1.5}} />}
                <ListItem disableGutters sx={{display: 'block', p: 0}}>
                  <Typography variant='subtitle2' sx={{fontWeight: 700}}>
                    {entry.term}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {entry.definition}
                  </Typography>
                </ListItem>
              </Box>
            ))}
          </List>
        </Stack>
      </CardContent>
    </Card>
  )
}

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
        <Typography variant='caption' color='text.disabled'>
          Referencia para tus cálculos.
        </Typography>
      </Stack>
    </CardContent>
  </Card>
)

// ---------- Panel: Editor del salario (siempre visible si está respondido) ----------

const INCOME_BAND_NODE = DIAGNOSIS_QUESTIONS.find(q => q.storageKey === 'incomeBand')

const IncomeEditorPanel = ({
  answers,
  minimumWage,
  onAnswer,
}: {
  answers: Answers
  minimumWage: MinimumWageEntry | null
  onAnswer: (storageKey: string, value: AnswerValue) => void
}) => {
  if (!INCOME_BAND_NODE || INCOME_BAND_NODE.type !== 'chips') return null
  const value = answers['incomeBand']
  const exactValue = typeof value === 'number' ? value : null

  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={1.25}>
          <Typography variant='overline' color='text.secondary'>
            Salario · editar
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Podés modificarlo en cualquier paso del cuestionario; las
            preguntas siguientes se recalculan.
          </Typography>
          <Stack direction='row' spacing={0.5} sx={{flexWrap: 'wrap', gap: 0.5}}>
            {INCOME_BAND_NODE.options.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                size='small'
                clickable
                color={value === opt.value ? 'primary' : 'default'}
                variant={value === opt.value ? 'filled' : 'outlined'}
                onClick={() => onAnswer('incomeBand', opt.value)}
                sx={{fontSize: 11, height: 24}}
              />
            ))}
          </Stack>
          {INCOME_BAND_NODE.exactInput && (
            <TextField
              size='small'
              type='number'
              placeholder={
                minimumWage
                  ? `Valor exacto en ${minimumWage.currency}`
                  : 'Valor exacto'
              }
              value={exactValue ?? ''}
              onChange={e => {
                const raw = e.target.value
                if (raw === '') return
                const n = Number(raw)
                if (!Number.isNaN(n)) onAnswer('incomeBand', n)
              }}
              slotProps={{
                htmlInput: {
                  min: INCOME_BAND_NODE.exactInput.min,
                  max: INCOME_BAND_NODE.exactInput.max,
                  step: INCOME_BAND_NODE.exactInput.step,
                  inputMode: 'numeric',
                },
              }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

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
              No hay tabla de referencia para tu país. Las bandas son
              auto-reportadas (malo / regular / bueno / excelente).
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
                <Stack
                  key={band}
                  direction='row'
                  spacing={1}
                  sx={{alignItems: 'center'}}
                >
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
                    sx={{fontFamily: 'monospace', color: 'text.secondary'}}
                  >
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
  answers,
  currentStorageKey,
  minimumWage,
  countryCode,
  onAnswer,
}: SidebarProps) {
  const widgets = getActiveWidgets(answers, currentStorageKey)
  const currentQuestion = currentStorageKey
    ? DIAGNOSIS_QUESTIONS.find(q => q.storageKey === currentStorageKey)
    : null
  const tips = currentQuestion?.tips
  const incomeAnswered = answers['incomeBand'] !== undefined
  return (
    <Stack spacing={2} sx={{position: 'sticky', top: 16}}>
      <TreePanel answers={answers} currentStorageKey={currentStorageKey} />
      {incomeAnswered && (
        <IncomeEditorPanel
          answers={answers}
          minimumWage={minimumWage}
          onAnswer={onAnswer}
        />
      )}
      <GlossaryPanel answers={answers} currentStorageKey={currentStorageKey} />
      {tips && tips.length > 0 && <TipsPanel tips={tips} />}
      {widgets.has('minimumWage') && minimumWage && <MinimumWagePanel minimumWage={minimumWage} />}
      {widgets.has('creditScoreScale') && (
        <CreditScoreScalePanel countryCode={countryCode} />
      )}
    </Stack>
  )
}
