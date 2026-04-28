import {Box, Button, Card, CardContent, Divider, Stack, Typography} from '@mui/material'
import {DIAGNOSIS_QUESTIONS, type DiagnosisQuestion} from '../../content/diagnosis'

type SummaryProps = {
  answers: Record<string, string | number | boolean>
  onRestart: () => void
}

const formatAnswer = (question: DiagnosisQuestion, value: string | number | boolean): string => {
  if (question.type === 'chips') {
    const opt = question.options.find(o => o.value === value)
    if (opt) return opt.sublabel ? `${opt.label} (${opt.sublabel})` : opt.label
    return String(value)
  }
  if (question.type === 'slider') {
    return `${value}${question.unit ?? ''}`
  }
  if (question.type === 'toggle') {
    if (value === true) return question.trueLabel ?? 'Sí'
    if (value === false) return question.falseLabel ?? 'No'
    return String(value)
  }
  return String(value)
}

export default function Summary({answers, onRestart}: SummaryProps) {
  const answered = DIAGNOSIS_QUESTIONS.filter(q => answers[q.storageKey] !== undefined)

  return (
    <Box sx={{minHeight: '100vh', width: '100vw', py: 5, px: 3}}>
      <Stack spacing={3} sx={{maxWidth: 640, mx: 'auto'}}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Resumen
          </Typography>
          <Typography variant="h4" component="h1">
            Esto fue lo que respondiste
          </Typography>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {answered.map(question => (
                <Box key={question.id}>
                  <Typography variant="body2" color="text.secondary">
                    {question.prompt}
                  </Typography>
                  <Typography variant="body1" sx={{fontWeight: 500}}>
                    {formatAnswer(question, answers[question.storageKey])}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Button variant="outlined" onClick={onRestart}>
            Volver a empezar
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
