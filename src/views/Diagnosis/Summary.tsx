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
import {
  getFoundationProfile,
  getOverallProfile,
  getProfileForSection,
} from '../../content/profiles'
import {getMonthlyIncome} from '../../utils/calculations'
import {type MinimumWageEntry} from '../../content/minimumWages'

type SummaryProps = {
  answers: Answers
  smm: number | null
  countryCode: string | null
  minimumWage: MinimumWageEntry | null
  onRestart: () => void
}

const formatMoney = (amount: number, currency: string | undefined): string => {
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: currency ?? 'COP',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${Math.round(amount).toLocaleString('es')} ${currency ?? ''}`.trim()
  }
}

function FireGoalCard({
  answers,
  smm,
  minimumWage,
}: {
  answers: Answers
  smm: number | null
  minimumWage: MinimumWageEntry | null
}) {
  const monthlyIncome = getMonthlyIncome(answers, smm)
  const obligatoryPct = typeof answers.obligatoryPct === 'number' ? answers.obligatoryPct : null
  const discretionaryPct =
    typeof answers.discretionaryPct === 'number' ? answers.discretionaryPct : null
  if (monthlyIncome === null || obligatoryPct === null || discretionaryPct === null) return null
  const monthlyExpenses = (monthlyIncome * (obligatoryPct + discretionaryPct)) / 100
  if (monthlyExpenses <= 0) return null
  const annualExpenses = monthlyExpenses * 12
  const classicGoal = annualExpenses * 25
  const latamGoal = annualExpenses * 28.5
  const currency = minimumWage?.currency
  return (
    <Card elevation={0} sx={{border: 1, borderColor: 'divider'}}>
      <CardContent sx={{p: {xs: 2.5, md: 4}}}>
        <Stack spacing={1.5}>
          <Typography variant='overline' color='text.secondary'>
            Tu meta FIRE
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Heurística clásica del 4%: si juntas un capital igual a 25× tus gastos anuales,
            puedes vivir de los rendimientos. En LatAm conviene ajustar a 28,5× por
            impuestos y volatilidad cambiaria.
          </Typography>
          <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
            <Box sx={{flex: 1}}>
              <Typography variant='caption' color='text.secondary'>
                Versión clásica (×25)
              </Typography>
              <Typography variant='h6' sx={{fontWeight: 700, fontFamily: 'monospace'}}>
                {formatMoney(classicGoal, currency)}
              </Typography>
            </Box>
            <Box sx={{flex: 1}}>
              <Typography variant='caption' color='text.secondary'>
                Versión LatAm (×28,5)
              </Typography>
              <Typography variant='h6' sx={{fontWeight: 700, fontFamily: 'monospace'}}>
                {formatMoney(latamGoal, currency)}
              </Typography>
            </Box>
          </Stack>
          <Typography variant='caption' color='text.secondary'>
            Basado en tu ingreso × tu % de gastos (obligatorios {obligatoryPct}% + discrecionales{' '}
            {discretionaryPct}% = {(obligatoryPct + discretionaryPct).toFixed(0)}% mensual). Es
            una guía mental, no un objetivo único — sirve para saber a qué escala juega tu plan.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

const colorToken = (sev: InsightSeverity): string =>
  `${SUMMARY_NODE.severityLabels[sev].color}.main`

const labelOf = (sev: InsightSeverity): string => SUMMARY_NODE.severityLabels[sev].label

function InsightRow({
  item,
  index,
  reducedMotion,
}: {
  item: CollectedInsight
  index: number
  reducedMotion: boolean
}) {
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

const SEVERITY_ORDER: readonly InsightSeverity[] = ['critical', 'warning', 'info', 'positive']

function findNextStep(items: readonly CollectedInsight[]): CollectedInsight | null {
  for (const sev of SEVERITY_ORDER) {
    if (sev === 'positive') return null
    const match = items.find(i => (i.insight.severity ?? 'info') === sev)
    if (match) return match
  }
  return null
}

type ClosingQuote = {text: string; author: string}

const CLOSING_QUOTES: readonly ClosingQuote[] = [
  {text: 'Vivir dentro de nuestras posibilidades.', author: 'Sofía Macías'},
  {
    text: 'No hace falta ser experto para vivir en paz financiera. Los pasitos antes que las maratones.',
    author: 'Andrés Gutiérrez',
  },
  {
    text: 'Cómo te comportas con el dinero importa más que lo que sabes de dinero.',
    author: 'Morgan Housel',
  },
  {
    text: 'Lo medido se gestiona; pero medir todo paraliza. Atiende lo discrecional, deja correr lo fijo.',
    author: 'Hábito',
  },
]

const pickClosingQuote = (categoryHint: DiagnosisCategoryId | null): ClosingQuote => {
  if (!categoryHint) return CLOSING_QUOTES[0]
  switch (categoryHint) {
    case 'profile':
    case 'income':
    case 'expenses':
    case 'habits':
      return CLOSING_QUOTES[0]
    case 'debt':
      return CLOSING_QUOTES[1]
    case 'investment':
      return CLOSING_QUOTES[2]
    default:
      return CLOSING_QUOTES[3]
  }
}

function groupByCategory(
  items: readonly CollectedInsight[],
): Record<DiagnosisCategoryId, CollectedInsight[]> {
  const out = Object.fromEntries(
    CATEGORY_ORDER.map(c => [c, [] as CollectedInsight[]]),
  ) as Record<DiagnosisCategoryId, CollectedInsight[]>
  for (const item of items) out[item.category].push(item)
  return out
}

export default function Summary({
  answers,
  smm,
  countryCode,
  minimumWage,
  onRestart,
}: SummaryProps) {
  const theme = useTheme()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const answered = DIAGNOSIS_QUESTIONS.filter(q => answers[q.storageKey] !== undefined)
  const insights = collectInsights(answers, smm, countryCode)
  const grouped = groupByCategory(insights)

  const sectionScores = useMemo(() => {
    const out = Object.fromEntries(
      CATEGORY_ORDER.map(c => [c, 0]),
    ) as Record<DiagnosisCategoryId, number>
    for (const cat of CATEGORY_ORDER) {
      out[cat] = computeSectionScore(cat, answers, smm).score
    }
    return out
  }, [answers, smm])

  const overall = useMemo(() => getOverallProfile(sectionScores), [sectionScores])
  const foundation = useMemo(() => getFoundationProfile(sectionScores), [sectionScores])
  const scoredCategories = useMemo(
    () => CATEGORY_ORDER.filter(c => CATEGORIES[c].interstitial === 'score'),
    [],
  )
  const nextStep = useMemo(() => findNextStep(insights), [insights])
  const closingQuote = useMemo(() => pickClosingQuote(overall.bottleneck ?? null), [overall])

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

        {/* Tu base — agregado narrativo de profile + income + expenses + habits */}
        {foundation && (
          <motion.div
            initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: reducedMotion ? 0 : 0.1}}>
            <Card elevation={0} sx={{border: 1, borderColor: 'divider'}}>
              <CardContent sx={{p: {xs: 2.5, md: 4}}}>
                <Stack spacing={1.25}>
                  <Stack direction='row' spacing={1} sx={{alignItems: 'center'}}>
                    <Typography variant='overline' color='text.secondary'>
                      Tu base
                    </Typography>
                    <Chip
                      size='small'
                      label={`${foundation.score}/100`}
                      variant='outlined'
                      sx={{fontVariantNumeric: 'tabular-nums', fontWeight: 700}}
                    />
                  </Stack>
                  <Typography variant='h5' sx={{fontWeight: 700}}>
                    {foundation.profile.label}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{lineHeight: 1.55}}>
                    {foundation.profile.description}
                  </Typography>
                  <Typography variant='caption' color='text.disabled'>
                    Combina perfil, ingresos, egresos y hábitos.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Grid de scores por sección con scoring (excluye 'profile' que es narrativo) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(4, 1fr)',
              md: `repeat(${scoredCategories.length}, 1fr)`,
            },
            gap: {xs: 1.5, sm: 2},
          }}>
          {scoredCategories.map((catId, i) => {
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
                <Card elevation={0} sx={{border: 1, borderColor: 'divider', height: '100%'}}>
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
                      <Typography variant='caption' color='text.secondary' sx={{lineHeight: 1.3}}>
                        {profile?.label ?? '—'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </Box>

        {nextStep && (
          <motion.div
            initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: reducedMotion ? 0 : 0.25}}>
            <Card
              elevation={0}
              sx={{
                border: 2,
                borderColor: colorToken(nextStep.insight.severity ?? 'info'),
                bgcolor: 'background.paper',
              }}>
              <CardContent sx={{p: {xs: 2.5, md: 4}}}>
                <Stack spacing={1.5}>
                  <Stack direction='row' spacing={1} sx={{alignItems: 'center'}}>
                    <Chip
                      size='small'
                      label='Tu próximo paso'
                      variant='filled'
                      sx={{
                        bgcolor: colorToken(nextStep.insight.severity ?? 'info'),
                        color: 'common.white',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {CATEGORIES[nextStep.category].label}
                    </Typography>
                  </Stack>
                  <Typography variant='h6' sx={{fontWeight: 700, lineHeight: 1.3}}>
                    {nextStep.insight.diagnostic}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{lineHeight: 1.55}}>
                    {nextStep.insight.tip}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <FireGoalCard answers={answers} smm={smm} minimumWage={minimumWage} />

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

        <Box sx={{textAlign: 'center', py: 2}}>
          <Typography
            variant='body1'
            sx={{fontStyle: 'italic', color: 'text.secondary', maxWidth: 520, mx: 'auto'}}>
            "{closingQuote.text}"
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{display: 'block', mt: 0.5, letterSpacing: '0.04em'}}>
            — {closingQuote.author}
          </Typography>
        </Box>

        <Box sx={{display: 'flex', justifyContent: 'center', py: 2}}>
          <Button variant='outlined' size='large' onClick={onRestart}>
            ↻ Volver a empezar
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
