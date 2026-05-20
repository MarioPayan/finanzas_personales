import {useEffect, useState} from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {AnimatePresence, motion} from 'framer-motion'
import {
  CATEGORIES,
  SUMMARY_NODE,
  findSectionScoreNode,
  type Answers,
  type DiagnosisCategoryId,
  type InsightSeverity,
  type ToneBand,
} from '../../content/diagnosis'
import {collectInsights} from '../../utils/insights'
import {computeSectionScore, resolveToneBand} from '../../utils/scoring'
import {getProfileForSection} from '../../content/profiles'

/**
 * Pantalla intersticial al terminar una sección.
 *
 * Hero animado: contador 0 → score, círculo grande con borde del color
 * de la banda y fondo teñido, badge del perfil de la sección, y la lista
 * de insights de esa categoría con stagger entrance.
 */

type SectionScoreProps = {
  category: DiagnosisCategoryId
  answers: Answers
  smm: number | null
  countryCode: string | null
  isFinal: boolean
  onContinue: () => void
}

const FALLBACK_BAND: ToneBand = {color: 'info', message: ''}

const severityColor = (sev: InsightSeverity): string =>
  `${SUMMARY_NODE.severityLabels[sev].color}.main`

export default function SectionScore({
  category,
  answers,
  smm,
  countryCode,
  isFinal,
  onContinue,
}: SectionScoreProps) {
  const theme = useTheme()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const cat = CATEGORIES[category]

  if (cat.interstitial === 'narrative') {
    return (
      <NarrativeInterstitial
        category={category}
        answers={answers}
        isFinal={isFinal}
        onContinue={onContinue}
        reducedMotion={reducedMotion}
      />
    )
  }

  const node = findSectionScoreNode(category)
  const {score} = computeSectionScore(category, answers, smm)
  const band = (node && resolveToneBand(node.toneBands, score)) ?? FALLBACK_BAND
  const accent = theme.palette[band.color]?.main ?? theme.palette.info.main
  const profile = getProfileForSection(category, score)

  const insights = collectInsights(answers, smm, countryCode).filter(
    item => item.category === category,
  )

  const displayScore = useCountUp(score, reducedMotion ? 0 : 900)

  return (
    <Stack
      spacing={{xs: 3, md: 5}}
      sx={{
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 560,
        mx: 'auto',
        width: '100%',
        py: {xs: 2, md: 4},
      }}>
      <motion.div
        initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}>
        <Stack spacing={1} sx={{alignItems: 'center'}}>
          <Chip
            size='small'
            label='Sección completada'
            variant='outlined'
            color={cat.color}
            sx={{letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700}}
          />
          <Typography variant='h4' component='h1' sx={{fontWeight: 700}}>
            {cat.label}
          </Typography>
        </Stack>
      </motion.div>

      <motion.div
        initial={reducedMotion ? {opacity: 1, scale: 1} : {opacity: 0, scale: 0.85}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: 0.45, ease: 'easeOut', delay: 0.1}}>
        <Box
          sx={{
            width: {xs: 160, sm: 180, md: 200},
            height: {xs: 160, sm: 180, md: 200},
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: {xs: `6px solid ${accent}`, md: `8px solid ${accent}`},
            bgcolor: `${accent}14`,
            position: 'relative',
          }}>
          <Stack sx={{alignItems: 'center'}}>
            <Typography
              sx={{
                fontWeight: 800,
                color: accent,
                lineHeight: 1,
                fontSize: {xs: '3rem', sm: '3.5rem', md: '4rem'},
                fontVariantNumeric: 'tabular-nums',
              }}>
              {displayScore}
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{mt: 0.5}}>
              de 100
            </Typography>
          </Stack>
        </Box>
      </motion.div>

      {profile && (
        <motion.div
          initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 8}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.35, delay: 0.3}}
          style={{width: '100%'}}>
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}>
            <CardContent sx={{textAlign: 'center', py: 2.5}}>
              <Typography variant='overline' color='text.secondary'>
                Tu perfil en esta área
              </Typography>
              <Typography variant='h5' sx={{fontWeight: 700, mt: 0.5}}>
                {profile.label}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{mt: 1, textAlign: 'left'}}>
                {profile.description}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {band.message && (
        <Typography variant='body1' color='text.secondary'>
          {band.message}
        </Typography>
      )}

      {insights.length > 0 && (
        <Stack spacing={1.25} sx={{width: '100%', textAlign: 'left'}}>
          <AnimatePresence>
            {insights.map((item, i) => {
              const sev = item.insight.severity ?? 'info'
              const sevColor = severityColor(sev)
              return (
                <motion.div
                  key={`${item.nodeKey}:${item.insight.id}`}
                  initial={reducedMotion ? {opacity: 1, x: 0} : {opacity: 0, x: -8}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: 0.3, delay: reducedMotion ? 0 : 0.4 + i * 0.06}}>
                  <Stack direction='row' spacing={1.5} sx={{alignItems: 'stretch'}}>
                    <Box
                      sx={{
                        width: 4,
                        bgcolor: sevColor,
                        borderRadius: 1,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant='body2' sx={{flex: 1, minWidth: 0}}>
                      {item.insight.diagnostic}
                    </Typography>
                  </Stack>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </Stack>
      )}

      <Button
        variant='contained'
        size='large'
        onClick={onContinue}
        sx={{
          minWidth: {xs: '100%', sm: 200},
          minHeight: 48,
          mt: 2,
          fontWeight: 700,
        }}>
        {isFinal ? 'Ver mi diagnóstico →' : 'Continuar →'}
      </Button>
    </Stack>
  )
}

/**
 * Intersticial narrativo — usado por categorías cuyo `interstitial` es
 * 'narrative' (hoy: `profile`). En vez de un score numérico, muestra un
 * texto que enmarca lo que el usuario acaba de responder, generado a
 * partir de las respuestas demográficas. Sirve para mantener el ritmo
 * de cierre de sección sin inventar un puntaje artificial.
 */
function NarrativeInterstitial({
  category,
  answers,
  isFinal,
  onContinue,
  reducedMotion,
}: {
  category: DiagnosisCategoryId
  answers: Answers
  isFinal: boolean
  onContinue: () => void
  reducedMotion: boolean
}) {
  const cat = CATEGORIES[category]
  const lines = buildNarrativeLines(category, answers)
  return (
    <Stack
      spacing={{xs: 3, md: 5}}
      sx={{
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 560,
        mx: 'auto',
        width: '100%',
        py: {xs: 2, md: 4},
      }}>
      <motion.div
        initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}>
        <Stack spacing={1} sx={{alignItems: 'center'}}>
          <Chip
            size='small'
            label='Sección completada'
            variant='outlined'
            color={cat.color}
            sx={{letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700}}
          />
          <Typography variant='h4' component='h1' sx={{fontWeight: 700}}>
            {cat.label}
          </Typography>
        </Stack>
      </motion.div>

      <motion.div
        initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.35, delay: 0.1}}
        style={{width: '100%'}}>
        <Stack spacing={1.25} sx={{alignItems: 'center', textAlign: 'center'}}>
          <Typography variant='h6' sx={{fontWeight: 700}}>
            Empezamos a conocerte
          </Typography>
          {lines.map((line, i) => (
            <Typography
              key={i}
              variant='body1'
              color='text.secondary'
              sx={{lineHeight: 1.55, maxWidth: 480}}>
              {line}
            </Typography>
          ))}
        </Stack>
      </motion.div>

      <Button
        variant='contained'
        size='large'
        onClick={onContinue}
        sx={{
          minWidth: {xs: '100%', sm: 200},
          minHeight: 48,
          mt: 2,
          fontWeight: 700,
        }}>
        {isFinal ? 'Ver mi diagnóstico →' : 'Continuar →'}
      </Button>
    </Stack>
  )
}

const EMPLOYMENT_LABEL: Record<string, string> = {
  formal: 'empleado formal',
  mixed: 'empleo mixto',
  independent: 'independiente',
  unemployed: 'sin ingreso formal por ahora',
}

const buildNarrativeLines = (
  category: DiagnosisCategoryId,
  answers: Answers,
): readonly string[] => {
  if (category !== 'profile') return []
  const age = typeof answers.age === 'number' ? answers.age : null
  const dependents = typeof answers.hasDependents === 'number' ? answers.hasDependents : null
  const employment =
    typeof answers.formalEmployment === 'string'
      ? EMPLOYMENT_LABEL[answers.formalEmployment]
      : null

  const parts: string[] = []
  if (age !== null) parts.push(`${age} años`)
  if (dependents !== null) {
    parts.push(
      dependents === 0
        ? 'sin personas a cargo'
        : `${dependents} persona${dependents === 1 ? '' : 's'} a cargo`,
    )
  }
  if (employment) parts.push(employment)

  if (parts.length === 0) {
    return ['Lo que sigue va a aterrizar tus números: ingresos, gastos y hábitos.']
  }
  return [
    `Tenemos tu foto inicial: ${parts.join(', ')}.`,
    'Lo que sigue va a aterrizar tus números: ingresos, gastos y hábitos.',
  ]
}

/** Hook simple para animar un contador 0 → target en `ms` milliseconds. */
function useCountUp(target: number, ms: number): number {
  const [value, setValue] = useState(ms === 0 ? target : 0)
  useEffect(() => {
    if (ms === 0) {
      setValue(target)
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return value
}
