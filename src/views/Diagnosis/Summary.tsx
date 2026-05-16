import {useMemo} from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {motion} from 'framer-motion'
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
import {computeSectionScore} from '../../utils/scoring'
import {getOverallProfile, getProfileForSection} from '../../content/profiles'

type SummaryProps = {
  answers: Answers
  smm: number | null
  countryCode: string | null
  onRestart: () => void
}

const colorToken = (sev: InsightSeverity): string =>
  `${SUMMARY_NODE.severityLabels[sev].color}.main`

const labelOf = (sev: InsightSeverity): string => SUMMARY_NODE.severityLabels[sev].label

function InsightRow({item, index, reducedMotion}: {item: CollectedInsight; index: number; reducedMotion: boolean}) {
  const sev = item.insight.severity ?? 'info'
  const color = colorToken(sev)
  const label = labelOf(sev)
  const cat = CATEGORIES[item.category]
  return (
    <motion.div
      initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3, delay: reducedMotion ? 0 : Math.min(index * 0.05, 1)}}>
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
    </motion.div>
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
  const theme = useTheme()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const answered = DIAGNOSIS_QUESTIONS.filter(q => answers[q.storageKey] !== undefined)
  const insights = collectInsights(answers, smm, countryCode)
  const grouped = groupByCategory(insights)

  const sectionScores = useMemo(() => {
    const out: Record<DiagnosisCategoryId, number> = {base: 0, debt: 0, stability: 0, investment: 0}
    for (const cat of CATEGORY_ORDER) {
      out[cat] = computeSectionScore(cat, answers, smm).score
    }
    return out
  }, [answers, smm])

  const overall = useMemo(() => getOverallProfile(sectionScores), [sectionScores])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        py: {xs: 8, md: 5},
        px: {xs: 2, md: 3},
      }}>
      <Stack spacing={{xs: 2.5, md: 4}} sx={{maxWidth: 760, mx: 'auto'}}>
        {/* Hero: perfil global */}
        <motion.div
          initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 16}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.4}}>
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}11, ${theme.palette.secondary.main}11)`,
            }}>
            <CardContent sx={{p: {xs: 2.5, md: 5}, textAlign: 'center'}}>
              <Stack spacing={{xs: 1, md: 1.5}} sx={{alignItems: 'center'}}>
                <Chip
                  size='small'
                  label='Tu diagnóstico'
                  color='primary'
                  variant='outlined'
                  sx={{letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700}}
                />
                <Typography
                  sx={{
                    fontWeight: 800,
                    mt: 1,
                    fontSize: {xs: '1.75rem', sm: '2.25rem', md: '3rem'},
                    lineHeight: 1.15,
                  }}>
                  {overall.profile.label}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    maxWidth: 520,
                    fontSize: {xs: '0.875rem', md: '1rem'},
                    lineHeight: 1.55,
                  }}>
                  {overall.profile.description}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grid de scores por sección — 2x2 en mobile, 1x4 en sm+ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr 1fr', sm: 'repeat(4, 1fr)'},
            gap: {xs: 1.5, sm: 2},
          }}>
          {CATEGORY_ORDER.map((catId, i) => {
            const score = sectionScores[catId]
            const cat = CATEGORIES[catId]
            const profile = getProfileForSection(catId, score)
            const accent = theme.palette[cat.color].main
            return (
              <motion.div
                key={catId}
                initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 8}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3, delay: reducedMotion ? 0 : 0.1 + i * 0.06}}>
                <Card
                  elevation={0}
                  sx={{border: 1, borderColor: 'divider', height: '100%'}}>
                  <CardContent sx={{p: {xs: 2, md: 2.5}}}>
                    <Stack spacing={0.75}>
                      <Chip
                        size='small'
                        label={cat.shortLabel}
                        color={cat.color}
                        variant='outlined'
                        sx={{
                          alignSelf: 'flex-start',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          fontSize: {xs: '0.625rem', md: '0.6875rem'},
                          height: 22,
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: accent,
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: {xs: '1.75rem', md: '2.125rem'},
                          lineHeight: 1.1,
                        }}>
                        {score}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{lineHeight: 1.3}}>
                        {profile?.label ?? '—'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </Box>

        {/* Insights agrupados con stagger */}
        {insights.length > 0 && (
          <Card elevation={0} sx={{border: 1, borderColor: 'divider'}}>
            <CardContent sx={{p: {xs: 2, md: 4}}}>
              <Stack spacing={{xs: 2.5, md: 3.5}}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: {xs: '1.15rem', md: '1.5rem'},
                  }}>
                  Tus puntos de acción
                </Typography>
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
                        {items.map((item, i) => (
                          <InsightRow
                            key={`${item.nodeKey}:${item.insight.id}`}
                            item={item}
                            index={i}
                            reducedMotion={reducedMotion}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Tus respuestas — colapsable visualmente vía detalle más sobrio */}
        <Card elevation={0} sx={{border: 1, borderColor: 'divider'}}>
          <CardContent sx={{p: {xs: 2, md: 4}}}>
            <Stack spacing={2}>
              <Typography variant='subtitle1' sx={{fontWeight: 700}}>
                Tus respuestas
              </Typography>
              <Stack spacing={1.5} divider={<Divider flexItem />}>
                {answered.map(question => (
                  <Box key={question.storageKey}>
                    <Typography variant='caption' color='text.secondary'>
                      {question.title}
                    </Typography>
                    <Typography variant='body2' sx={{fontWeight: 500, mt: 0.25}}>
                      {formatAnswerVerbose(question, answers[question.storageKey]!, answers)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{display: 'flex', justifyContent: 'center', py: 2}}>
          <Button variant='outlined' size='large' onClick={onRestart}>
            ↻ Volver a empezar
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
