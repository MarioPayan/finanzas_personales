import {Box, Card, CardContent, Chip, Stack, Typography} from '@mui/material'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  formatAnswer,
  type Answers,
  type DiagnosisCategoryId,
  type DiagnosisQuestion,
} from '../../content/diagnosis'

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

const QUESTIONS_BY_CATEGORY = Object.fromEntries(
  CATEGORY_ORDER.map(c => [c, [] as DiagnosisQuestion[]]),
) as Record<DiagnosisCategoryId, DiagnosisQuestion[]>
for (const q of DIAGNOSIS_QUESTIONS) {
  if (!q.dependsOn) QUESTIONS_BY_CATEGORY[q.category].push(q)
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
