import {useEffect, useMemo, useState} from 'react'
import {Stepper, type StepperState} from '../../components/Stepper'
import type {AnswerValue} from '../../content/diagnosis'
import {type MinimumWageEntry} from '../../content/minimumWages'
import {detectCountryCode, detectMinimumWage} from '../../utils/detectCountry'
import Sidebar from './Sidebar'
import {buildDiagnosisSteps} from './buildDiagnosisSteps'
import {useStepperActions} from '../../components/Stepper'

/**
 * Vista raíz del diagnóstico.
 *
 * Detecta país / SMM una vez al montar, construye los pasos con
 * `buildDiagnosisSteps`, y renderiza el `<Stepper>` genérico con un
 * sidebar contextual.
 *
 * "Reiniciar" en el Summary cambia `restartTick`, lo que recompone los
 * steps y fuerza remount del Stepper vía `key` — toda la persistencia
 * en memoria se pierde, que es exactamente lo que queremos.
 */
export default function Diagnosis() {
  const [minimumWage, setMinimumWage] = useState<MinimumWageEntry | null>(null)
  const [countryCode, setCountryCode] = useState<string | null>(null)
  const [restartTick, setRestartTick] = useState(0)

  useEffect(() => {
    setMinimumWage(detectMinimumWage())
    setCountryCode(detectCountryCode())
  }, [])

  const steps = useMemo(
    () =>
      buildDiagnosisSteps({
        minimumWage,
        countryCode,
        onRestart: () => setRestartTick(t => t + 1),
      }),
    [minimumWage, countryCode],
  )

  return (
    <Stepper
      key={restartTick}
      steps={steps}
      renderSidebar={state => (
        <DiagnosisSidebar
          state={state}
          minimumWage={minimumWage}
          countryCode={countryCode}
        />
      )}
    />
  )
}

function DiagnosisSidebar({
  state,
  minimumWage,
  countryCode,
}: {
  state: StepperState<AnswerValue>
  minimumWage: MinimumWageEntry | null
  countryCode: string | null
}) {
  const actions = useStepperActions<AnswerValue>()
  // Solo pasamos como "currentStorageKey" a la pregunta actual cuando es
  // una pregunta normal — para intersticiales y done, el sidebar muestra
  // su estado neutro (sin pregunta activa).
  const currentKey =
    state.currentStep && state.currentStep.kind !== 'interstitial'
      ? state.currentStep.id
      : null
  return (
    <Sidebar
      answers={state.answers}
      currentStorageKey={currentKey}
      minimumWage={minimumWage}
      countryCode={countryCode}
      onAnswer={actions.setAnswer}
    />
  )
}
