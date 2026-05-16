import {Box, Button, Stack, Typography} from '@mui/material'
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

/**
 * Pantalla intersticial que aparece al terminar una sección. El cálculo
 * (`computeSectionScore`) y los textos visibles (mensaje según rango de
 * puntaje) viven en el `SectionScoreNode` correspondiente — este
 * componente es solo render. Ver `SECTION_SCORE_NODES` en
 * `src/content/diagnosis.ts`.
 */

type SectionScoreProps = {
  category: DiagnosisCategoryId
  answers: Answers
  /** SMM del país detectado, en moneda local. Necesario para resolver el
   * scoring de chips con valor exacto sin `exactScore`. */
  smm: number | null
  /** ISO 3166-1 alpha-2 del país, para insights que comparan contra la
   * media nacional. */
  countryCode: string | null
  isFinal: boolean
  onContinue: () => void
}

const FALLBACK_BAND: ToneBand = {color: 'info', message: ''}

const colorToken = (color: ToneBand['color']): string => `${color}.main`

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
  const node = findSectionScoreNode(category)
  const {score} = computeSectionScore(category, answers, smm)
  const cat = CATEGORIES[category]
  const band = (node && resolveToneBand(node.toneBands, score)) ?? FALLBACK_BAND
  const color = colorToken(band.color)

  const insights = collectInsights(answers, smm, countryCode).filter(
    item => item.category === category,
  )

  return (
    <Stack
      spacing={4}
      sx={{
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 480,
        mx: 'auto',
        width: '100%',
        py: 6,
      }}
    >
      <Typography variant='overline' color='text.secondary'>
        Sección completada
      </Typography>
      <Typography variant='h5' component='h1'>
        {cat.label}
      </Typography>
      <Box
        sx={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '6px solid',
          borderColor: color,
          bgcolor: 'background.paper',
        }}
      >
        <Stack sx={{alignItems: 'center'}}>
          <Typography variant='h2' sx={{fontWeight: 700, color, lineHeight: 1}}>
            {score}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            de 100
          </Typography>
        </Stack>
      </Box>
      <Typography variant='body1' color='text.secondary'>
        {band.message}
      </Typography>

      {insights.length > 0 && (
        <Stack spacing={1.25} sx={{width: '100%', textAlign: 'left'}}>
          {insights.map(item => {
            const sev = item.insight.severity ?? 'info'
            const sevColor = severityColor(sev)
            return (
              <Stack
                key={`${item.nodeKey}:${item.insight.id}`}
                direction='row'
                spacing={1.5}
                sx={{alignItems: 'stretch'}}
              >
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
            )
          })}
        </Stack>
      )}

      <Button variant='contained' size='large' onClick={onContinue}>
        {isFinal ? 'Ver diagnóstico' : 'Continuar'}
      </Button>
    </Stack>
  )
}
