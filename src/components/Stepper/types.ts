/**
 * Contratos del Stepper genérico.
 *
 * El Stepper no conoce nada del dominio (finanzas, quiz, lo que sea):
 * recibe pasos que cumplen este contrato y los orquesta. Quien provee
 * los pasos es responsable de saber qué hay dentro de cada uno; el
 * Stepper solo decide qué paso mostrar, cuándo avanzar, y emite eventos.
 *
 * Ver `PersonalFinancesVault/Plan - Stepper generico.md` para la
 * arquitectura completa.
 */

import type {ReactNode} from 'react'

/**
 * Mapa de respuestas indexado por `Step.id`. El Stepper guarda el
 * estado completo y lo expone al render de cada paso (un paso puede
 * mirar respuestas de pasos anteriores, ej. para condicionales).
 */
export type AnswersMap<TAnswer> = Readonly<Record<string, TAnswer>>

export type StepRenderCtx<TAnswer> = {
  /** Respuesta actual del paso (puede ser undefined si no se respondió). */
  answer: TAnswer | undefined
  /** Snapshot completo del state. */
  answers: AnswersMap<TAnswer>
  /** Setea la respuesta del paso actual. No avanza por sí solo. */
  setAnswer: (value: TAnswer) => void
  /**
   * Setea y pide avance automático tras `autoAdvanceMs`. Pensado para
   * inputs cuya interacción tiene un "fin claro" (chip click, toggle).
   * Si el paso no se completa con `value`, el avance no ocurre.
   */
  commit: (value?: TAnswer) => void
}

/**
 * Un paso del flujo. Autocontenido: sabe cuándo aplica, cuándo está
 * completo, y cómo se renderiza.
 */
export type Step<TAnswer = unknown> = {
  /** Identificador único y estable. Sirve como key de React y clave de answers. */
  id: string

  /** Título corto para tooltips, debug o barra de progreso segmentada. */
  title?: string

  /**
   * Header opcional. Si está, el Stepper lo renderiza por encima del
   * body — prompt grande y hint chico en gris. Si el paso quiere control
   * total del layout (ej. intersticiales con su propia hero section),
   * deja el header undefined.
   */
  header?: {prompt: string; hint?: string}

  /**
   * Si devuelve false, el paso se omite del flujo (cuenta como
   * "resuelto" para el progreso pero no se renderiza). Se evalúa contra
   * el state vigente — si una respuesta posterior lo vuelve aplicable
   * de nuevo, reaparece.
   */
  isApplicable: (answers: AnswersMap<TAnswer>) => boolean

  /**
   * Si devuelve true, el botón Siguiente se habilita y se permite
   * auto-advance. Para pasos intersticiales (sin pregunta), devolver
   * `true` siempre.
   */
  isComplete: (answers: AnswersMap<TAnswer>) => boolean

  /**
   * Renderiza el cuerpo del paso. El Stepper se encarga del marco
   * (header, navegación, transiciones). Si el paso necesita reemplazar
   * el marco, usar `kind: 'interstitial'` y un render que ocupe todo el
   * canvas.
   */
  render: (ctx: StepRenderCtx<TAnswer>) => ReactNode

  /**
   * - `'question'` (default): el Stepper renderiza header + body + footer
   *   estándar.
   * - `'interstitial'`: pantalla informativa sin respuesta esperada. El
   *   Stepper omite el footer de navegación normal — el render del paso
   *   debe incluir su propio CTA que llame a `ctx.commit()`.
   */
  kind?: 'question' | 'interstitial'

  /** Bandera para clasificar visualmente (categoría, color, etc.). */
  tag?: string

  /** Color (token del theme) para el chip de categoría. Opcional. */
  tagColor?:
    | 'primary'
    | 'secondary'
    | 'warning'
    | 'info'
    | 'success'
    | 'error'
    | 'default'
}

export type StepperState<TAnswer = unknown> = {
  /** Todos los pasos pasados al Stepper (incluyendo los no aplicables). */
  allSteps: readonly Step<TAnswer>[]
  /** Pasos aplicables al state actual. Es el "flujo visible". */
  visibleSteps: readonly Step<TAnswer>[]
  /** Índice del paso activo dentro de `visibleSteps`. -1 si done. */
  currentIndex: number
  /** Paso activo. null si done o si no hay aplicables. */
  currentStep: Step<TAnswer> | null
  /** Snapshot de respuestas. */
  answers: AnswersMap<TAnswer>
  /** Total de pasos originales no marcados como saltados-permanentes. */
  totalCount: number
  /** Cuántos pasos están completos o saltados (no aplicables). */
  resolvedCount: number
  /** Progreso 0..100, derivado de `resolvedCount / totalCount`. */
  progress: number
  isFirst: boolean
  isLast: boolean
  /** Solo true cuando el flujo terminó (se intentó avanzar más allá del último). */
  done: boolean
}

export type StepperActions<TAnswer = unknown> = {
  setAnswer: (id: string, value: TAnswer) => void
  goNext: () => void
  goBack: () => void
  goTo: (id: string) => void
  reset: () => void
  /** Setea respuesta del paso actual + pide auto-advance (debounce). */
  commit: (value?: TAnswer) => void
}

export type StepperProps<TAnswer = unknown> = {
  steps: readonly Step<TAnswer>[]
  initialAnswers?: AnswersMap<TAnswer>
  initialStepId?: string

  onAnswersChange?: (answers: AnswersMap<TAnswer>) => void
  onStepChange?: (stepId: string | null) => void
  onComplete?: (answers: AnswersMap<TAnswer>) => void

  /** ms para auto-advance tras `commit()`. Default 250. */
  autoAdvanceMs?: number

  /**
   * Override del header (prompt + hint). Si no se provee, se usa el
   * default (h4 + caption). Recibe el paso actual.
   */
  renderHeader?: (state: StepperState<TAnswer>) => ReactNode

  /** Override del progreso. Default: barra MUI lineal con porcentaje. */
  renderProgress?: (state: StepperState<TAnswer>) => ReactNode

  /** Override de la navegación. Default: botones Atrás / Siguiente. */
  renderNavigation?: (
    state: StepperState<TAnswer>,
    actions: StepperActions<TAnswer>,
  ) => ReactNode

  /** Sidebar opcional. Recibe el state vigente. */
  renderSidebar?: (state: StepperState<TAnswer>) => ReactNode

  /** Override de la pantalla "done". Default: mensaje minimalista. */
  renderDone?: (state: StepperState<TAnswer>, actions: StepperActions<TAnswer>) => ReactNode
}
