import {Box, Button, Card, CardContent, Divider, Stack, Typography} from '@mui/material'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  SUMMARY_NODE,
  formatAnswerVerbose,
  type Answers,
  type DiagnosisCategoryId,
  type InsightSeverity,
} from '../../content/diagnosis'
import {collectInsights, type CollectedInsight} from '../../utils/insights'

type SummaryProps = {
  answers: Answers
  smm: number | null
  countryCode: string | null
  onRestart: () => void
}

const colorToken = (sev: InsightSeverity): string =>
  `${SUMMARY_NODE.severityLabels[sev].color}.main`

const labelOf = (sev: InsightSeverity): string => SUMMARY_NODE.severityLabels[sev].label

function InsightRow({item}: {item: CollectedInsight}) {
  const sev = item.insight.severity ?? 'info'
  const color = colorToken(sev)
  const label = labelOf(sev)
  const cat = CATEGORIES[item.category]
  return (
    <Stack direction='row' spacing={2} sx={{alignItems: 'stretch'}}>
      <Box sx={{width: 4, bgcolor: color, borderRadius: 1, flexShrink: 0}} />
      <Stack spacing={0.5} sx={{flex: 1, minWidth: 0}}>
        <Stack direction='row' spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap'}}>
          <Typography variant='overline' color='text.secondary' sx={{lineHeight: 1}}>
            {cat.shortLabel}
          </Typography>
          <Typography variant='caption' sx={{color, fontWeight: 600}}>
            · {label}
          </Typography>
        </Stack>
        <Typography variant='body1' sx={{fontWeight: 500}}>
          {item.insight.diagnostic}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {item.insight.tip}
        </Typography>
      </Stack>
    </Stack>
  )
}

function groupByCategory(
  items: readonly CollectedInsight[],
): Record<DiagnosisCategoryId, CollectedInsight[]> {
  const out: Record<DiagnosisCategoryId, CollectedInsight[]> = {
    base: [],
    debt: [],
    stability: [],
    investment: [],
  }
  for (const item of items) out[item.category].push(item)
  return out
}

export default function Summary({answers, smm, countryCode, onRestart}: SummaryProps) {
  const answered = DIAGNOSIS_QUESTIONS.filter(q => answers[q.storageKey] !== undefined)
  const insights = collectInsights(answers, smm, countryCode)
  const grouped = groupByCategory(insights)
  const answersComponent = SUMMARY_NODE.components.find(c => c.id === 'answers')

  return (
    <Box sx={{minHeight: '100vh', width: '100vw', py: 5, px: 3}}>
      <Stack spacing={3} sx={{maxWidth: 720, mx: 'auto'}}>
        <Stack spacing={1}>
          <Typography variant='overline' color='text.secondary'>
            Diagnóstico
          </Typography>
          <Typography variant='h4' component='h1'>
            {SUMMARY_NODE.userHeading}
          </Typography>
        </Stack>

        {insights.length > 0 && (
          <Card variant='outlined'>
            <CardContent>
              <Stack spacing={3}>
                {CATEGORY_ORDER.map(catId => {
                  const items = grouped[catId]
                  if (items.length === 0) return null
                  const cat = CATEGORIES[catId]
                  return (
                    <Stack key={catId} spacing={2}>
                      <Typography variant='subtitle2' sx={{fontWeight: 700}}>
                        {cat.label}
                      </Typography>
                      <Stack spacing={2} divider={<Divider flexItem />}>
                        {items.map(item => (
                          <InsightRow key={`${item.nodeKey}:${item.insight.id}`} item={item} />
                        ))}
                      </Stack>
                    </Stack>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Card variant='outlined'>
          <CardContent>
            <Stack spacing={1} sx={{mb: 2}}>
              <Typography variant='overline' color='text.secondary'>
                Resumen
              </Typography>
              <Typography variant='h6'>
                {answersComponent?.userHeading ?? answersComponent?.title}
              </Typography>
            </Stack>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {answered.map(question => (
                <Box key={question.storageKey}>
                  <Typography variant='overline' color='text.secondary' sx={{lineHeight: 1}}>
                    {question.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {question.prompt}
                  </Typography>
                  <Typography variant='body1' sx={{fontWeight: 500, mt: 0.5}}>
                    {formatAnswerVerbose(question, answers[question.storageKey], answers)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Button variant='outlined' onClick={onRestart}>
            Volver a empezar
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
