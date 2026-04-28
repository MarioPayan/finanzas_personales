import {Box, Card, CardContent, Chip, Divider, List, ListItem, Stack, Typography} from '@mui/material'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  type DiagnosisCategoryId,
  type DiagnosisQuestion,
} from '../../content/diagnosis'
import {getGlossaryEntries, type GlossaryEntry} from '../../content/glossary'

type AnswerValue = string | number | boolean

type DecisionTreeProps = {
  answers: Record<string, AnswerValue>
  currentStorageKey: string | null
}

type NodeState = 'answered' | 'current' | 'pending' | 'skipped'

const formatAnswer = (q: DiagnosisQuestion, value: AnswerValue): string => {
  if (q.type === 'chips') {
    return q.options.find(o => o.value === value)?.label ?? String(value)
  }
  if (q.type === 'slider') {
    return `${value}${q.unit ?? ''}`
  }
  if (q.type === 'toggle') {
    if (value === true) return q.trueLabel ?? 'Sí'
    if (value === false) return q.falseLabel ?? 'No'
  }
  return String(value)
}

const COLOR_BY_STATE: Record<NodeState, {marker: string; text: string; muted: boolean}> = {
  answered: {marker: '✓', text: 'success.main', muted: false},
  current: {marker: '►', text: 'primary.main', muted: false},
  pending: {marker: '○', text: 'text.secondary', muted: true},
  skipped: {marker: '–', text: 'text.disabled', muted: true},
}

const buildChildrenIndex = (): Record<string, DiagnosisQuestion[]> => {
  const map: Record<string, DiagnosisQuestion[]> = {}
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (q.dependsOn) {
      ;(map[q.dependsOn.storageKey] ??= []).push(q)
    }
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

const DIACRITICS_RE = /[\u0300-\u036f]/g
const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '')

const getQuestionText = (q: DiagnosisQuestion): string => {
  const parts: string[] = [q.prompt]
  if (q.hint) parts.push(q.hint)
  if (q.examples) parts.push(...q.examples)
  if (q.type === 'chips') {
    for (const o of q.options) {
      parts.push(o.label)
      if (o.sublabel) parts.push(o.sublabel)
      if (o.examples) parts.push(...o.examples)
    }
  } else if (q.type === 'toggle') {
    if (q.trueLabel) parts.push(q.trueLabel)
    if (q.falseLabel) parts.push(q.falseLabel)
  }
  return parts.join(' ')
}

const getActiveGlossary = (
  answers: Record<string, AnswerValue>,
  currentStorageKey: string | null,
): GlossaryEntry[] => {
  const activeQuestions: DiagnosisQuestion[] = []
  const ids: string[] = []
  const seen = new Set<string>()
  for (const q of DIAGNOSIS_QUESTIONS) {
    const isAnswered = answers[q.storageKey] !== undefined
    const isCurrent = q.storageKey === currentStorageKey
    if (!(isAnswered || isCurrent)) continue
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

export default function DecisionTree({answers, currentStorageKey}: DecisionTreeProps) {
  const stateOf = (q: DiagnosisQuestion): NodeState => {
    const isCurrent = currentStorageKey === q.storageKey
    const isAnswered = answers[q.storageKey] !== undefined
    if (isCurrent) return 'current'
    if (isAnswered) return 'answered'
    if (q.dependsOn) {
      const parentValue = answers[q.dependsOn.storageKey]
      if (parentValue !== undefined && parentValue !== q.dependsOn.equals) return 'skipped'
    }
    return 'pending'
  }

  const renderNode = (q: DiagnosisQuestion, depth: number) => {
    const state = stateOf(q)
    const palette = COLOR_BY_STATE[state]
    const value = answers[q.storageKey]
    const children = CHILDREN_INDEX[q.storageKey] ?? []

    return (
      <Box key={q.id}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            pl: depth * 2,
            py: 0.5,
            opacity: palette.muted ? 0.6 : 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              color: palette.text,
              minWidth: 16,
              textAlign: 'center',
              fontWeight: state === 'current' ? 700 : 500,
            }}
          >
            {palette.marker}
          </Typography>
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography
              variant="body2"
              sx={{
                color: palette.text,
                textDecoration: state === 'skipped' ? 'line-through' : 'none',
                fontWeight: state === 'current' ? 600 : 400,
              }}
            >
              {q.prompt}
            </Typography>
            {state === 'answered' && value !== undefined && (
              <Box sx={{mt: 0.5}}>
                <Chip label={formatAnswer(q, value)} size="small" color="success" variant="outlined" />
              </Box>
            )}
          </Box>
        </Box>
        {children.length > 0 && (
          <Stack spacing={0}>{children.map(child => renderNode(child, depth + 1))}</Stack>
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
        }}
      >
        <Chip
          label={meta.shortLabel}
          size="small"
          color={meta.color}
          variant="filled"
          sx={{fontSize: '0.7rem', height: 22}}
        />
        <Typography variant="overline" color="text.secondary" sx={{lineHeight: 1}}>
          {meta.label}
        </Typography>
      </Box>
    )
  }

  const glossary = getActiveGlossary(answers, currentStorageKey)

  return (
    <Stack spacing={2} sx={{position: 'sticky', top: 16}}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              Árbol de decisiones
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Las preguntas están agrupadas por sección.
            </Typography>
            <Stack spacing={0.5}>
              {CATEGORY_ORDER.map(catId => {
                const items = QUESTIONS_BY_CATEGORY[catId]
                if (items.length === 0) return null
                return (
                  <Box key={catId}>
                    {renderCategoryHeader(catId)}
                    <Stack spacing={0}>{items.map(q => renderNode(q, 0))}</Stack>
                  </Box>
                )
              })}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {glossary.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="overline" color="text.secondary">
                Glosario
              </Typography>
              <List disablePadding sx={{'& li + li': {mt: 1.5}}}>
                {glossary.map((entry, idx) => (
                  <Box key={entry.id}>
                    {idx > 0 && <Divider sx={{mb: 1.5}} />}
                    <ListItem disableGutters sx={{display: 'block', p: 0}}>
                      <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                        {entry.term}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.definition}
                      </Typography>
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
