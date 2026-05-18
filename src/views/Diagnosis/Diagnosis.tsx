import {useEffect, useMemo, useState, type ReactNode} from 'react'
import {Box, IconButton, Tooltip} from '@mui/material'
import {Question} from '@phosphor-icons/react'
import {Stepper, type StepperState} from '../../components/Stepper'
import {DefaultHeader} from '../../components/Stepper/defaults/DefaultHeader'
import type {AnswerValue} from '../../content/diagnosis'
import {MINIMUM_WAGES, type MinimumWageEntry} from '../../content/minimumWages'
import {detectCountryCode, detectMinimumWage} from '../../utils/detectCountry'
import {buildDiagnosisSteps} from './buildDiagnosisSteps'
import {DiagnosisProgress} from './DiagnosisProgress'
import {DiagnosisToolbar} from './DiagnosisToolbar'
import {DiagnosisHelpPopover, hasHelpContent} from './DiagnosisHelpPopover'

/**
 * Vista raíz del diagnóstico.
 *
 * Detecta país / SMM al montar y construye los pasos con
 * `buildDiagnosisSteps`. El contexto auxiliar se reparte en tres
 * accesos:
 *
 *  - **Engranaje (toolbar top-right)** — `DiagnosisToolbar` →
 *    configuración global: override de país, monto del SMM, reiniciar
 *    diagnóstico.
 *  - **Árbol (toolbar top-right)** — `DiagnosisToolbar` → drawer con
 *    el árbol del cuestionario.
 *  - **"?" inline en el header del paso** — `DiagnosisHelpPopover` →
 *    sugerencias y referencias contextuales (tips, escala del score
 *    crediticio). En desktop usa Popover; en mobile, bottom sheet.
 *    El ícono sólo aparece cuando el paso aporta contenido.
 *
 * "Reiniciar" cambia `restartTick`, lo que recompone los steps y
 * fuerza remount del Stepper vía `key` — las respuestas en memoria se
 * pierden, que es exactamente lo que queremos.
 */
export default function Diagnosis() {
  const [minimumWage, setMinimumWage] = useState<MinimumWageEntry | null>(null)
  const [countryCode, setCountryCode] = useState<string | null>(null)
  const [restartTick, setRestartTick] = useState(0)
  const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMinimumWage(detectMinimumWage())
    setCountryCode(detectCountryCode())
  }, [])

  const handleSetCountry = (code: string) => {
    setCountryCode(code)
    const entry = MINIMUM_WAGES[code]
    if (entry) setMinimumWage(entry)
  }

  const handleSetMinimumWageAmount = (amount: number) => {
    setMinimumWage(prev => (prev ? {...prev, amount} : prev))
  }

  const steps = useMemo(
    () =>
      buildDiagnosisSteps({
        minimumWage,
        countryCode,
        onRestart: () => setRestartTick(t => t + 1),
      }),
    [minimumWage, countryCode],
  )

  const renderHeader = (state: StepperState<AnswerValue>): ReactNode => {
    const step = state.currentStep
    if (!step?.header) return null
    const currentKey = step.kind !== 'interstitial' ? step.id : null
    const showHelp = hasHelpContent(currentKey)
    return (
      <Box sx={{position: 'relative', pr: showHelp ? 5 : 0}}>
        <DefaultHeader state={state as StepperState<unknown>} />
        {showHelp && (
          <Tooltip title='Ver sugerencias' placement='left'>
            <IconButton
              size='small'
              aria-label='Ver sugerencias del paso'
              onClick={e => setHelpAnchor(prev => (prev ? null : e.currentTarget))}
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                color: helpAnchor ? 'primary.main' : 'text.secondary',
              }}>
              <Question size={20} weight='regular' />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    )
  }

  return (
    <>
      <Stepper
        key={restartTick}
        steps={steps}
        renderHeader={renderHeader}
        renderProgress={state => <DiagnosisProgress state={state} />}
        onStepChange={() => setHelpAnchor(null)}
        renderOverlay={state => {
          const currentKey =
            state.currentStep && state.currentStep.kind !== 'interstitial'
              ? state.currentStep.id
              : null
          return (
            <>
              <DiagnosisToolbar
                currentStorageKey={currentKey}
                answers={state.answers}
                minimumWage={minimumWage}
                countryCode={countryCode}
                onSetCountry={handleSetCountry}
                onSetMinimumWageAmount={handleSetMinimumWageAmount}
                onRestart={() => setRestartTick(t => t + 1)}
              />
              <DiagnosisHelpPopover
                open={Boolean(helpAnchor)}
                anchorEl={helpAnchor}
                onClose={() => setHelpAnchor(null)}
                currentStorageKey={currentKey}
                countryCode={countryCode}
              />
            </>
          )
        }}
      />
    </>
  )
}
