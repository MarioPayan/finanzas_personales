/**
 * Persistencia local del diagnóstico.
 *
 * Guarda y restaura el estado del usuario en `localStorage` para que al
 * recargar la pestaña el flujo retome exactamente donde quedó. Persiste
 * todo lo que no se puede recomputar:
 *
 *   - `userName`: el alias chistoso que el usuario aceptó o cambió en
 *     la pantalla de intro. Sirve también como flag implícito de "ya
 *     vio la intro" — si está, asumimos que sí.
 *   - `answers`: el `Record<storageKey, AnswerValue>` que alimenta al
 *     Stepper como `initialAnswers`.
 *   - `currentStepId`: la storageKey del paso activo (incluye los
 *     intersticiales `__sectionScore__<cat>` y `__summary__`).
 *
 * El estado lleva un `schemaVersion` para hacer migraciones futuras.
 * Si el schema guardado no matchea, se descarta (el costo de pedir
 * volver a empezar es menor que arrastrar inconsistencias).
 *
 * No depende de React — es un módulo plano que se puede testear como
 * función pura sobre `localStorage`.
 */

import type {AnswerValue} from '../content/diagnosis'

const STORAGE_KEY = 'finanzas_personales:v1'
const SCHEMA_VERSION = 1

export type PersistedState = {
  schemaVersion: typeof SCHEMA_VERSION
  userName: string
  answers: Record<string, AnswerValue>
  currentStepId: string | null
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Valida que un valor parseado de JSON sea un `PersistedState` válido.
 * Defensivo: si algo no cuadra (versión vieja, shape corrompido) se
 * devuelve `null` y el caller arranca de cero.
 */
const validate = (raw: unknown): PersistedState | null => {
  if (!isPlainObject(raw)) return null
  if (raw.schemaVersion !== SCHEMA_VERSION) return null
  if (typeof raw.userName !== 'string') return null
  if (!isPlainObject(raw.answers)) return null
  const stepId = raw.currentStepId
  if (stepId !== null && typeof stepId !== 'string') return null
  return {
    schemaVersion: SCHEMA_VERSION,
    userName: raw.userName,
    answers: raw.answers as Record<string, AnswerValue>,
    currentStepId: stepId,
  }
}

const safeStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const loadPersistedState = (): PersistedState | null => {
  const storage = safeStorage()
  if (!storage) return null
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return validate(JSON.parse(raw))
  } catch {
    return null
  }
}

export const savePersistedState = (state: PersistedState): void => {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota llena, modo privado: ignoramos silenciosamente. El estado
    // sigue vivo en memoria; la próxima recarga arrancará de cero.
  }
}

export const clearPersistedState = (): void => {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // Idem savePersistedState.
  }
}
