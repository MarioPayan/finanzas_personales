import {useMemo, useState} from 'react'
import {
  Box,
  Chip,
  Divider,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import {CANONICAL_PROFILES} from '../../content/canonicalProfiles'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIAGNOSIS_QUESTIONS,
  formatAnswerVerbose,
  type DiagnosisCategoryId,
} from '../../content/diagnosis'
import {MINIMUM_WAGES} from '../../content/minimumWages'
import {getOverallProfile, getProfileForSection} from '../../content/profiles'
import {computeSectionScore} from '../../utils/scoring'
import {collectInsights} from '../../utils/insights'

/**
 * Simulador de perfiles canónicos en `/debug`. Picker para cargar uno de los
 * perfiles definidos en `canonicalProfiles.ts` y ver, en vivo, el resultado
 * completo del cuestionario: scores por sección, perfiles textuales,
 * insights disparados, y la lista de respuestas que produjo todo eso.
 *
 * No edita respuestas (todavía) — la duplicación-y-edición es ítem futuro.
 * Para el caso de uso actual (ver impacto de cambios al cuestionario sobre
 * perfiles representativos), ya alcanza con cargar y leer.
 */

const SEVERITY_COLOR: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
  positive: 'success',
}

export default function DebugSimulator() {
  const [profileId, setProfileId] = useState<string>(CANONICAL_PROFILES[0]?.id ?? '')

  const profile = useMemo(
    () => CANONICAL_PROFILES.find(p => p.id === profileId),
    [profileId],
  )

  const smm = useMemo(
    () => (profile ? (MINIMUM_WAGES[profile.countryCode]?.amount ?? null) : null),
    [profile],
  )

  const sectionResults = useMemo(() => {
    if (!profile) return null
    return CATEGORY_ORDER.map(cat => {
      const result = computeSectionScore(cat, profile.answers, smm)
      const sectionProfile = getProfileForSection(cat, result.score)
      return {category: cat, ...result, profile: sectionProfile}
    })
  }, [profile, smm])

  const overall = useMemo(() => {
    if (!sectionResults) return null
    const scoresByCategory = Object.fromEntries(
      sectionResults.map(r => [r.category, r.score]),
    ) as Record<DiagnosisCategoryId, number>
    return getOverallProfile(scoresByCategory)
  }, [sectionResults])

  const insights = useMemo(() => {
    if (!profile) return []
    return collectInsights(profile.answers, smm)
  }, [profile, smm])

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant='overline' color='text.secondary'>
          Simulador de perfiles canónicos
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Cargá un perfil canónico (los mismos definidos en{' '}
          <code>src/content/canonicalProfiles.ts</code> que se usan para
          los tests de regresión) y veé el quiz resuelto de punta a punta.
        </Typography>
      </Stack>

      <Box>
        <Select
          value={profileId}
          onChange={e => setProfileId(e.target.value)}
          size='small'
          fullWidth
          sx={{maxWidth: 480}}
        >
          {CANONICAL_PROFILES.map(p => (
            <MenuItem key={p.id} value={p.id}>
              {p.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {profile && (
        <>
          <Typography variant='body2' color='text.secondary' sx={{maxWidth: 760}}>
            {profile.description} · País: <code>{profile.countryCode}</code> · SMM
            referencia: {smm ? smm.toLocaleString() : '—'}{' '}
            {profile.countryCode && MINIMUM_WAGES[profile.countryCode]?.currency}
          </Typography>

          {overall && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant='overline' color='text.secondary'>
                Perfil global
              </Typography>
              <Typography variant='h6'>{overall.profile.label}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {overall.profile.description}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{display: 'block', mt: 1}}
              >
                Razón: <strong>{overall.reason}</strong>
                {overall.bottleneck ? ` · cuello de botella: ${overall.bottleneck}` : ''}
              </Typography>
            </Box>
          )}

          <Stack spacing={1}>
            <Typography variant='subtitle1'>Scores por sección</Typography>
            {sectionResults?.map(r => (
              <Box
                key={r.category}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Chip
                  size='small'
                  label={CATEGORIES[r.category].shortLabel}
                  color={CATEGORIES[r.category].color}
                />
                <Box sx={{minWidth: 60}}>
                  <Typography variant='h6' sx={{lineHeight: 1}}>
                    {r.score}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {r.earned} / {r.max}
                  </Typography>
                </Box>
                <Stack spacing={0} sx={{flex: 1, minWidth: 0}}>
                  <Typography variant='body2' noWrap>
                    {r.profile?.label ?? '—'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {r.countedQuestions.length} pregunta(s) contadas
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>

          <Stack spacing={1}>
            <Typography variant='subtitle1'>
              Insights disparados ({insights.length})
            </Typography>
            {insights.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                Sin insights — el perfil pasa el quiz sin ninguna condición de
                diagnóstico activa.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {insights.map(ci => (
                  <Box
                    key={`${ci.nodeKey}-${ci.insight.id}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction='row'
                      spacing={1}
                      sx={{alignItems: 'center', flexWrap: 'wrap', mb: 0.5}}
                    >
                      <Chip
                        size='small'
                        label={ci.insight.severity ?? 'info'}
                        color={SEVERITY_COLOR[ci.insight.severity ?? 'info']}
                      />
                      <Typography
                        variant='caption'
                        sx={{fontFamily: 'monospace', color: 'text.secondary'}}
                      >
                        {ci.nodeKey} · {ci.insight.id}
                      </Typography>
                    </Stack>
                    <Typography variant='body2' sx={{fontWeight: 600}}>
                      {ci.insight.diagnostic}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {ci.insight.tip}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant='subtitle1'>Respuestas del perfil</Typography>
            <Stack spacing={0.5}>
              {DIAGNOSIS_QUESTIONS.filter(q => profile.answers[q.storageKey] !== undefined).map(
                q => (
                  <Box
                    key={q.storageKey}
                    sx={{display: 'flex', gap: 2, py: 0.5, alignItems: 'baseline'}}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        fontFamily: 'monospace',
                        color: 'text.secondary',
                        minWidth: 220,
                      }}
                    >
                      {q.storageKey}
                    </Typography>
                    <Typography variant='body2'>
                      {formatAnswerVerbose(q, profile.answers[q.storageKey]!, profile.answers)}
                    </Typography>
                  </Box>
                ),
              )}
            </Stack>
          </Stack>
        </>
      )}
    </Stack>
  )
}
