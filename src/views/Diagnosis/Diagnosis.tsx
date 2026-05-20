import {useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from 'react'
import {Box, IconButton, Tooltip} from '@mui/material'
import {Question} from '@phosphor-icons/react'
import {Stepper, type StepperState} from '../../components/Stepper'
import {DefaultHeader} from '../../components/Stepper/defaults/DefaultHeader'
import type {AnswerValue} from '../../content/diagnosis'
import {MINIMUM_WAGES, type MinimumWageEntry} from '../../content/minimumWages'
import {detectCountryCode, detectMinimumWage} from '../../utils/detectCountry'
import {
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
  type PersistedState,
} from '../../utils/persistence'
import {Intro} from '../Intro/Intro'
import {buildDiagnosisSteps} from './buildDiagnosisSteps'
import {DiagnosisProgress} from './DiagnosisProgress'
import {DiagnosisToolbar} from './DiagnosisToolbar'
import {DiagnosisHelpPopover, hasHelpContent} from './DiagnosisHelpPopover'

/**
 * Vista raíz del diagnóstico.
 *
 * Detecta país / SMM al montar, restaura el estado persistido en
 * `localStorage` (si lo hay) y construye los pasos con
 * `buildDiagnosisSteps`. Si no hay usuario guardado, primero muestra
 * la pantalla de `Intro` para asignarle un alias.
 *
 * Persistencia: tras cada cambio del Stepper (answers / step actual)
 * se persiste el snapshot a `localStorage` con `savePersistedState`.
 * Al recargar la pestaña, el flujo retoma exactamente donde quedó.
 *
 * El contexto auxiliar se reparte en tres accesos:
 *
 *  - **Engranaje (toolbar top-right)** — `DiagnosisToolbar` →
 *    configuración global: override de país, monto del SMM, borrar
 *    todos los datos guardados.
 *  - **Árbol (toolbar top-right)** — `DiagnosisToolbar` → drawer con
 *    el árbol del cuestionario.
 *  - **"?" inline en el header del paso** — `DiagnosisHelpPopover` →
 *    sugerencias y referencias contextuales.
 *
 * "Borrar todos los datos" limpia `localStorage`, resetea `userName`
 * a `null` (vuelve a la Intro) e incrementa `restartTick` para forzar
 * remount del Stepper.
 */
export default function Diagnosis() {
  const [minimumWage, setMinimumWage] = useState<MinimumWageEntry | null>(null)
  const [countryCode, setCountryCode] = useState<string | null>(null)
  const [restartTick, setRestartTick] = useState(0)
  const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null)

  // Snapshot vivo en memoria de lo que persistimos. Se inicializa una
  // sola vez al montar (`hydrated`) leyendo de localStorage, y a
  // partir de ahí los callbacks del Stepper lo mantienen al día.
  const [hydrated, setHydrated] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  // Snapshot inicial pasado al Stepper. Sólo se lee al primer mount
  // del Stepper de cada ciclo (restartTick); los cambios posteriores
  // viven dentro del Stepper.
  const initialSnapshotRef = useRef<PersistedState | null>(null)

  useEffect(() => {
    setMinimumWage(detectMinimumWage())
    setCountryCode(detectCountryCode())
    const persisted = loadPersistedState()
    if (persisted) {
      initialSnapshotRef.current = persisted
      setUserName(persisted.userName)
    }
    setHydrated(true)
  }, [])

  const persist = useCallback(
    (next: Partial<PersistedState>) => {
      if (!userName) return
      const snapshot: PersistedState = {
        schemaVersion: 1,
        userName,
        answers: next.answers ?? initialSnapshotRef.current?.answers ?? {},
        currentStepId:
          next.currentStepId !== undefined
            ? next.currentStepId
            : (initialSnapshotRef.current?.currentStepId ?? null),
      }
      initialSnapshotRef.current = snapshot
      savePersistedState(snapshot)
    },
    [userName],
  )

  const handleStart = useCallback((chosenName: string) => {
    setUserName(chosenName)
    const snapshot: PersistedState = {
      schemaVersion: 1,
      userName: chosenName,
      answers: {},
      currentStepId: null,
    }
    initialSnapshotRef.current = snapshot
    savePersistedState(snapshot)
  }, [])

  const handleFullReset = useCallback(() => {
    clearPersistedState()
    initialSnapshotRef.current = null
    setUserName(null)
    setRestartTick(t => t + 1)
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
        onRestart: handleFullReset,
      }),
    [minimumWage, countryCode, handleFullReset],
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

  // Antes de hidratar, no renderizamos nada: evita flash de Intro
  // cuando el usuario ya tiene state persistido y un mount efímero
  // del Stepper con state vacío.
  if (!hydrated) return null

  if (!userName) {
    return <Intro onStart={handleStart} />
  }

  return (
    <>
      <Stepper
        key={restartTick}
        steps={steps}
        initialAnswers={initialSnapshotRef.current?.answers}
        initialStepId={initialSnapshotRef.current?.currentStepId ?? undefined}
        renderHeader={renderHeader}
        renderProgress={state => <DiagnosisProgress state={state} />}
        onAnswersChange={answers => persist({answers})}
        onStepChange={stepId => {
          setHelpAnchor(null)
          persist({currentStepId: stepId})
        }}
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
                onRestart={handleFullReset}
              />
              <DiagnosisHelpPopover
                open={Boolean(helpAnchor)}
                anchorEl={helpAnchor}
                onClose={() => setHelpAnchor(null)}
                currentStorageKey={currentKey}
                countryCode={countryCode}
                answers={state.answers}
              />
            </>
          )
        }}
      />
    </>
  )
}
