/**
 * Preguntas del diagnóstico inicial.
 *
 * Filosofía de "nodos fuertes": cada pregunta es un objeto autocontenido con
 * todo lo necesario para presentarla y analizarla — `title`, `description`,
 * `prompt`, `options`, `glossaryTerms`, `sidebarWidgets`, `derivation`,
 * `dependsOn`, `tips`. Sin lógica externa hardcodeada.
 *
 * Tipos de pregunta (`type`):
 *   - `chips`        — selección única entre opciones (con o sin valor exacto)
 *   - `slider`       — barra continua con marcas
 *   - `toggle`       — Sí / No
 *   - `number`       — entrada numérica directa
 *   - `multiChips`   — selección múltiple
 *   - `grid`         — repite una celda por fila; las filas vienen de un nodo previo
 */

// ---------- Tipos de respuesta ----------

export type ScalarAnswer = string | number | boolean
export type AnswerValue = ScalarAnswer | readonly (string | number | null)[]
export type Answers = Record<string, AnswerValue>

// ---------- Categorías ----------

export type DiagnosisCategoryId = 'base' | 'debt' | 'stability' | 'investment'

export type DiagnosisCategory = {
  id: DiagnosisCategoryId
  label: string
  shortLabel: string
  color: 'primary' | 'warning' | 'info' | 'success'
}

export const CATEGORIES: Record<DiagnosisCategoryId, DiagnosisCategory> = {
  base: {id: 'base', label: 'Base · Salario y gastos', shortLabel: 'Base', color: 'primary'},
  debt: {id: 'debt', label: 'Deudas', shortLabel: 'Deudas', color: 'warning'},
  stability: {id: 'stability', label: 'Estabilidad', shortLabel: 'Estabilidad', color: 'info'},
  investment: {id: 'investment', label: 'Inversiones', shortLabel: 'Inversiones', color: 'success'},
}

export const CATEGORY_ORDER: DiagnosisCategoryId[] = ['base', 'debt', 'stability', 'investment']

// ---------- Dependencias ----------

export type DependencyClause = {
  storageKey: string
  equals?: ScalarAnswer
  in?: readonly ScalarAnswer[]
  greaterThan?: number
  nonEmpty?: boolean
}

const matchesClause = (clause: DependencyClause, value: AnswerValue | undefined): boolean => {
  if (value === undefined) return false
  if (clause.nonEmpty) return Array.isArray(value) && value.some(v => v !== null && v !== undefined)
  if (clause.greaterThan !== undefined)
    return typeof value === 'number' && value > clause.greaterThan
  if (clause.equals !== undefined) return value === clause.equals
  if (clause.in) return typeof value !== 'object' && clause.in.includes(value as ScalarAnswer)
  return false
}

// ---------- Derivaciones ----------

export type DerivationKind =
  | 'multiplyMinimumWage'
  | 'multiplyMonthlyIncome'
  | 'multiplyMonthlyExpenses'
  | 'shareOfMonthlyIncome'
  /**
   * Lookup por país: cada `option.value` (`bad`/`regular`/`good`/`excellent`)
   * se resuelve al rango absoluto del buró del país detectado, leído de
   * `src/content/creditScoreBands.ts`. No usa `bracket` numérico — el
   * rango ya viene absoluto en la tabla.
   */
  | 'creditScoreBands'

export type Derivation = {
  kind: DerivationKind
  inputs: readonly string[]
}

// ---------- Componentes auxiliares en el panel lateral ----------

export type SidebarWidgetId =
  | 'minimumWage'
  /** Tabla de rangos del score crediticio del país detectado. */
  | 'creditScoreScale'

// ---------- Insights (diagnóstico + tip por nodo) ----------

/**
 * Severidad de un insight. Sirve para colorear y ordenar en la pantalla
 * final del diagnóstico (`critical` arriba, `positive` abajo).
 */
export type InsightSeverity = 'positive' | 'info' | 'warning' | 'critical'

/**
 * Condición declarativa que decide si un insight se muestra. Es un árbol
 * JSON-serializable: átomos que consultan respuestas + combinadores
 * booleanos `all` / `any` / `not`. Al ser declarativo, un sistema externo
 * puede analizar las condiciones sin ejecutar código de la app.
 *
 * Las condiciones referencian respuestas por `storageKey` — pueden mirar
 * cualquier nodo, no solo el propio. Eso habilita insights compuestos
 * tipo "no inviertes, pero tu fondo + deuda lo permitirían".
 *
 * Evaluación en `src/utils/insights.ts`.
 */
export type InsightCondition =
  // Composición booleana
  | {kind: 'all'; of: readonly InsightCondition[]}
  | {kind: 'any'; of: readonly InsightCondition[]}
  | {kind: 'not'; of: InsightCondition}
  // Igualdad sobre respuesta escalar (string/number/boolean)
  | {kind: 'equals'; key: string; value: ScalarAnswer}
  | {kind: 'in'; key: string; values: readonly ScalarAnswer[]}
  // Comparaciones numéricas (slider, number, valor exacto de chips)
  | {kind: 'numberAbove'; key: string; threshold: number}
  | {kind: 'numberBelow'; key: string; threshold: number}
  | {kind: 'numberAtLeast'; key: string; threshold: number}
  | {kind: 'numberAtMost'; key: string; threshold: number}
  // multiChips
  | {kind: 'multiHas'; key: string; value: string}
  | {kind: 'multiCountAtLeast'; key: string; count: number}
  | {kind: 'multiCountAtMost'; key: string; count: number}
  // grid con celdas chip — inspeccionar valores por fila
  | {kind: 'gridAnyIn'; key: string; values: readonly string[]}
  | {kind: 'gridEveryIn'; key: string; values: readonly string[]}
  | {kind: 'gridCountInAtLeast'; key: string; values: readonly string[]; count: number}
  // grid con celdas number — umbral por fila
  | {kind: 'gridAnyNumberAbove'; key: string; threshold: number}
  | {kind: 'gridAnyNumberBelow'; key: string; threshold: number}
  | {kind: 'gridEveryNumberBelow'; key: string; threshold: number}
  // Derivado: ingreso mensual estimado vs SMM (resuelve banda + exacto)
  | {kind: 'incomeBelowSmmTimes'; multiplier: number}
  | {kind: 'incomeAboveSmmTimes'; multiplier: number}
  // Derivado: ingreso mensual estimado vs promedio nacional (WID,
  // mismo currency que el SMM del país; falla si el país no tiene
  // benchmark o si el currency no coincide).
  | {kind: 'incomeBelowCountryAverageTimes'; multiplier: number}
  | {kind: 'incomeAboveCountryAverageTimes'; multiplier: number}
  // Derivado: monto absoluto que el usuario gasta en obligatorios
  // (`obligatoryPct × monthlyIncome / 100`) vs SMM. Se usa para
  // validar que el porcentaje obligatorio no se interprete en abstracto:
  // si el monto absoluto no supera un piso (~0.4 × SMM), el porcentaje
  // probablemente no refleje un gasto de subsistencia real.
  | {kind: 'obligatoryAbsoluteBelowSmmTimes'; multiplier: number}
  | {kind: 'obligatoryAbsoluteAboveSmmTimes'; multiplier: number}

export type Insight = {
  /** Identificador único dentro del nodo. Para keys de React y trazabilidad. */
  id: string
  /** Descripción del estado del usuario en una oración. */
  diagnostic: string
  /** Recomendación accionable, una a dos oraciones. */
  tip: string
  /** Cuándo se muestra. Si la condición no se cumple, el insight no aparece. */
  when: InsightCondition
  /** Severidad. Default 'info'. */
  severity?: InsightSeverity
}

// ---------- Inputs y opciones ----------

/** Configuración para un input numérico exacto, opcional como complemento de chips. */
export type ExactInput = {
  min?: number
  max?: number
  step?: number
  unit?: string
  placeholder?: string
}

export type OptionBracket = {
  min?: number
  max?: number
}

/**
 * Banda de puntaje sobre un valor numérico continuo. Intervalos
 * `[min, max)` (min inclusivo, max exclusivo). Sin `min` significa "hasta
 * `max`"; sin `max` significa "desde `min` en adelante". El primer match
 * gana — el orden importa solo si las bandas se solapan.
 */
export type ScoreBand = {min?: number; max?: number; score: number}
export type ValueScoring = readonly ScoreBand[]

export type ChipOption = {
  value: string
  label: string
  sublabel?: string
  examples?: readonly string[]
  bracket?: OptionBracket
  /**
   * Puntos que aporta esta opción al puntaje de la sección si es la
   * elegida. En `multiChips` se suman todas las opciones seleccionadas;
   * en `chips` y celdas chip de `grid` es la única opción seleccionada.
   * Default 0.
   */
  score?: number
}

// ---------- Filas de un grid ----------

/** De dónde sale el conjunto de filas de un `GridQuestion`. */
export type GridRowSource =
  /** N filas, etiquetadas con un template (p. ej. "Deuda #{n}"). */
  | {kind: 'count'; storageKey: string; labelTemplate: string}
  /** Una fila por opción seleccionada en un nodo `multiChips` previo. */
  | {kind: 'multiSelectLabels'; storageKey: string}

/** Tipo de celda repetida por fila en un grid. */
export type GridCell =
  | {
      kind: 'chips'
      options: readonly ChipOption[]
      exactInput?: ExactInput
      /** Scoring para el valor exacto. Si no se define, se intenta ubicar
       * el valor en el `bracket` de alguna opción (usando la `derivation`
       * del nodo) y se usa el `score` de esa opción. */
      exactScore?: ValueScoring
    }
  | {kind: 'number'; exactInput: ExactInput; score?: ValueScoring}

// ---------- Nodos ----------

type BaseQuestion = {
  storageKey: string
  title: string
  description: string
  prompt: string
  hint?: string
  category: DiagnosisCategoryId
  glossaryTerms?: readonly string[]
  sidebarWidgets?: readonly SidebarWidgetId[]
  dependsOn?: readonly DependencyClause[]
  derivation?: Derivation
  /** Indicaciones contextuales que el sidebar muestra mientras el nodo es actual. */
  tips?: readonly string[]
  /**
   * Diagnósticos y recomendaciones que se muestran en la pantalla final
   * cuando su `when` se cumple. Cada nodo puede declarar varios; cada
   * insight puede mirar respuestas de cualquier nodo, no solo del propio.
   */
  insights?: readonly Insight[]
}

export type ChipsQuestion = BaseQuestion & {
  type: 'chips'
  options: readonly ChipOption[]
  /** Si está presente, el usuario puede ingresar un valor exacto en lugar de un chip. */
  exactInput?: ExactInput
  /** Scoring para el valor exacto. Si no se define, se intenta ubicar el
   * valor en el `bracket` de alguna opción (usando la `derivation` del
   * nodo) y se usa el `score` de esa opción. */
  exactScore?: ValueScoring
}

export type SliderQuestion = BaseQuestion & {
  type: 'slider'
  min: number
  max: number
  step: number
  defaultValue: number
  unit?: string
  marks?: readonly {value: number; label: string}[]
  score?: ValueScoring
}

export type ToggleQuestion = BaseQuestion & {
  type: 'toggle'
  trueLabel?: string
  falseLabel?: string
  score?: {whenTrue: number; whenFalse: number}
}

export type NumberQuestion = BaseQuestion & {
  type: 'number'
  min?: number
  max?: number
  step?: number
  unit?: string
  defaultValue?: number
  placeholder?: string
  score?: ValueScoring
}

export type MultiChipsQuestion = BaseQuestion & {
  type: 'multiChips'
  options: readonly ChipOption[]
}

export type GridQuestion = BaseQuestion & {
  type: 'grid'
  rowSource: GridRowSource
  cell: GridCell
}

export type DiagnosisQuestion =
  | ChipsQuestion
  | SliderQuestion
  | ToggleQuestion
  | NumberQuestion
  | MultiChipsQuestion
  | GridQuestion

// ---------- Datos ----------

export const DIAGNOSIS_QUESTIONS: readonly DiagnosisQuestion[] = [
  {
    storageKey: 'incomeBand',
    title: 'Ingresos mensuales',
    description:
      'Banda aproximada de ingreso del usuario, expresada en múltiplos del salario mínimo de su país. Es el ancla para todas las preguntas que dependen del ingreso.',
    category: 'base',
    type: 'chips',
    prompt: '¿Cuánto ganas al mes, más o menos?',
    hint: 'En múltiplos del salario mínimo de tu país, o ingresá el valor exacto.',
    glossaryTerms: ['smm'],
    sidebarWidgets: ['minimumWage'],
    derivation: {kind: 'multiplyMinimumWage', inputs: []},
    tips: [
      'Un valor exacto te dará un diagnóstico más fino que la banda. La banda sirve si no recordás la cifra exacta.',
    ],
    options: [
      {value: 'lt1', label: 'Menos de 1 SMM', bracket: {max: 1}, score: 30},
      {value: '1to2', label: '1 a 2 SMM', bracket: {min: 1, max: 2}, score: 50},
      {value: '2to4', label: '2 a 4 SMM', bracket: {min: 2, max: 4}, score: 70},
      {value: '4to8', label: '4 a 8 SMM', bracket: {min: 4, max: 8}, score: 90},
      {value: 'gt8', label: 'Más de 8 SMM', bracket: {min: 8}, score: 100},
    ],
    exactInput: {min: 0, step: 1000, placeholder: 'Valor exacto'},
    insights: [
      {
        id: 'incomeBelowMinimum',
        when: {kind: 'incomeBelowSmmTimes', multiplier: 1},
        severity: 'critical',
        diagnostic: 'Tu ingreso está por debajo del salario mínimo de tu país.',
        tip: 'Buscar fuentes complementarias de ingreso, o invertir en formación que abra mejores oportunidades en tu campo, debería ser la prioridad antes que cualquier otra recomendación financiera.',
      },
      {
        id: 'incomeWellBelowAverage',
        when: {
          kind: 'all',
          of: [
            {kind: 'incomeBelowCountryAverageTimes', multiplier: 0.5},
            // Si ya está debajo del SMM, ya hay un crítico — no duplicamos.
            {kind: 'not', of: {kind: 'incomeBelowSmmTimes', multiplier: 1}},
          ],
        },
        severity: 'warning',
        diagnostic: 'Tu salario está muy por debajo de la media nacional.',
        tip: 'Estás más cerca del piso que del centro de la distribución. Si la situación es estable, conviene priorizar formación o cambios laborales que muevan el ingreso antes que optimizar gastos.',
      },
      {
        id: 'incomeBelowAverage',
        when: {
          kind: 'all',
          of: [
            {kind: 'incomeBelowCountryAverageTimes', multiplier: 1},
            {kind: 'not', of: {kind: 'incomeBelowCountryAverageTimes', multiplier: 0.5}},
          ],
        },
        severity: 'info',
        diagnostic: 'Tu salario está por debajo de la media nacional.',
        tip: 'Es la situación de buena parte de la población — no es alarmante por sí mismo, pero tenelo presente al decidir cuánto destinar a ahorro e inversión.',
      },
      {
        id: 'incomeAboveAverage',
        when: {kind: 'incomeAboveCountryAverageTimes', multiplier: 1.5},
        severity: 'positive',
        diagnostic: 'Tu salario está por encima de la media nacional.',
        tip: 'Tenés margen real para construir fondo de emergencia y destinar a inversión sin recortar calidad de vida.',
      },
      {
        id: 'incomeHigh',
        when: {kind: 'incomeAboveSmmTimes', multiplier: 8},
        severity: 'info',
        diagnostic: 'Tu ingreso está claramente por encima del promedio.',
        tip: 'Asegurate de que la mayor parte esté trabajando para vos: revisá diversificación y rendimiento de tus inversiones. Un ingreso alto sin inversión es ahorro estancado.',
      },
    ],
  },
  {
    storageKey: 'age',
    title: 'Edad',
    description:
      'Edad del usuario en años. Es información de perfil que el cuestionario usa para condicionar insights — riesgo de no tener seguro, sugerencia de perfil de inversionista — sin tomar decisiones por el usuario.',
    category: 'base',
    type: 'number',
    prompt: '¿Qué edad tienes?',
    min: 14,
    max: 100,
    step: 1,
    defaultValue: 30,
    unit: 'años',
  },
  {
    storageKey: 'incomeStability',
    title: 'Estabilidad del ingreso',
    description:
      'Naturaleza del ingreso del usuario. Un sueldo fijo y un ingreso variable (freelance, comisiones, ventas) son perfiles muy distintos: el variable necesita un fondo de emergencia más grueso y tolera peor los gastos obligatorios cercanos al 100%.',
    category: 'base',
    type: 'chips',
    prompt: '¿Cómo es tu ingreso mes a mes?',
    options: [
      {
        value: 'fixed',
        label: 'Sueldo fijo',
        sublabel: 'El mismo monto cada mes',
        score: 100,
      },
      {
        value: 'mixed',
        label: 'Mixto',
        sublabel: 'Sueldo + comisiones, freelances ocasionales',
        score: 70,
      },
      {
        value: 'variable',
        label: 'Variable',
        sublabel: 'Freelance, comisiones, ventas, autoempleo',
        score: 40,
      },
    ],
  },
  {
    storageKey: 'obligatoryPct',
    title: 'Gastos obligatorios',
    description:
      'Porcentaje del ingreso que se va en gastos sin los cuales el usuario no puede pasar el mes (vivienda, comida, transporte, servicios, salud). Incluye gastos anuales prorrateados — impuestos, matrículas, seguros — divididos en su equivalente mensual.',
    category: 'base',
    type: 'slider',
    prompt: '¿Qué porcentaje de tu ingreso se va en gastos obligatorios?',
    hint: 'Comida, vivienda, transporte, servicios. Lo que no podrías dejar de pagar este mes. Incluí también los gastos anuales (impuestos, matrículas, seguros) divididos por 12.',
    glossaryTerms: ['gastosObligatorios'],
    derivation: {kind: 'shareOfMonthlyIncome', inputs: ['incomeBand']},
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    unit: '%',
    marks: [
      {value: 0, label: '0%'},
      {value: 50, label: '50%'},
      {value: 100, label: '100%'},
    ],
    score: [
      {min: 0, max: 30, score: 100},
      {min: 30, max: 50, score: 80},
      {min: 50, max: 70, score: 50},
      {min: 70, max: 90, score: 20},
      {min: 90, max: 101, score: 5},
    ],
    insights: [
      {
        // El % obligatorio solo es comparable si el monto absoluto que
        // se está gastando supera un piso de subsistencia: aquí, 0.4 ×
        // SMM. Por debajo, el porcentaje refleja otra cosa (vivienda
        // familiar, subsidios, autoconsumo) y los warnings/positives
        // del % no aplican — los reemplaza este insight informativo.
        id: 'obligatoryBelowSubsistence',
        when: {kind: 'obligatoryAbsoluteBelowSmmTimes', multiplier: 0.4},
        severity: 'info',
        diagnostic: 'Tu gasto absoluto en obligatorios está por debajo del mínimo de subsistencia.',
        tip: 'Probablemente tengas apoyos externos (vivienda familiar, subsidios) o no estés contando todo. Revisá si tu cifra incluye realmente comida, vivienda, transporte y servicios.',
      },
      {
        id: 'highObligatorySpending',
        when: {
          kind: 'all',
          of: [
            {kind: 'numberAbove', key: 'obligatoryPct', threshold: 70},
            // Solo dispara si el monto absoluto supera el piso —
            // si no, el % no es comparable y aplica `obligatoryBelowSubsistence`.
            {kind: 'obligatoryAbsoluteAboveSmmTimes', multiplier: 0.4},
          ],
        },
        severity: 'warning',
        diagnostic: 'Más del 70% de tu ingreso se va en gastos obligatorios.',
        tip: 'Empezá por reducir o renegociar el rubro más grande (vivienda, transporte, servicios) o por aumentar ingresos. Con ese margen tan apretado, cualquier imprevisto se vuelve crisis.',
      },
      {
        id: 'lowObligatorySpending',
        when: {
          kind: 'all',
          of: [
            {kind: 'numberBelow', key: 'obligatoryPct', threshold: 30},
            {kind: 'obligatoryAbsoluteAboveSmmTimes', multiplier: 0.4},
          ],
        },
        severity: 'positive',
        diagnostic: 'Más del 70% de tu ingreso queda libre después de tus obligaciones.',
        tip: 'Buen punto de partida para fortalecer el fondo de emergencia y dirigir el resto a inversiones diversificadas.',
      },
    ],
  },
  {
    storageKey: 'discretionaryPct',
    title: 'Gastos discrecionales',
    description:
      'Porcentaje del ingreso que se va en gastos no esenciales — salidas, hobbies, ropa, comer fuera, viajes — y gastos anuales prorrateados como vacaciones, regalos y suscripciones. Junto con obligatoryPct define cuánto queda libre para ahorro e inversión.',
    category: 'base',
    type: 'slider',
    prompt: '¿Qué porcentaje de tu ingreso se va en gastos discrecionales?',
    hint: 'Salidas, hobbies, ropa, comer fuera, viajes. Incluí también los gastos anuales (vacaciones, regalos, suscripciones) divididos por 12.',
    derivation: {kind: 'shareOfMonthlyIncome', inputs: ['incomeBand']},
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 25,
    unit: '%',
    marks: [
      {value: 0, label: '0%'},
      {value: 50, label: '50%'},
      {value: 100, label: '100%'},
    ],
    score: [
      {min: 0, max: 15, score: 100},
      {min: 15, max: 30, score: 80},
      {min: 30, max: 45, score: 50},
      {min: 45, max: 60, score: 20},
      {min: 60, max: 101, score: 5},
    ],
    insights: [
      {
        id: 'highDiscretionarySpending',
        when: {kind: 'numberAbove', key: 'discretionaryPct', threshold: 45},
        severity: 'warning',
        diagnostic: 'Estás gastando una parte muy alta de tu ingreso en lo discrecional.',
        tip: 'No se trata de cohibirte, sino de saber adónde va. Anotá un mes lo que gastás en lo no esencial; suele sorprender. Ese margen es el que después permite invertir o construir fondo de emergencia.',
      },
      {
        id: 'discretionaryHoursOfLife',
        when: {kind: 'numberAbove', key: 'discretionaryPct', threshold: 45},
        severity: 'info',
        diagnostic: 'Probá medir tus gastos discrecionales en horas de tu vida.',
        tip: 'Dividí tu ingreso mensual por tus horas trabajadas: ese es tu ingreso por hora. Cuando dudes con un gasto grande, dividilo por esa cifra — te dice cuántas horas de tu vida cuesta. Es un filtro más honesto que pensar en dinero.',
      },
    ],
  },
  {
    storageKey: 'hasBudgetSystem',
    title: 'Sistema de cubetas',
    description:
      'Cómo el usuario distribuye su ingreso entrante: en cabeza, en cuentas separadas, o automatizado por el banco. El "sistema de cubetas" predice mejor el cumplimiento del ahorro que el monto ahorrado.',
    category: 'base',
    type: 'chips',
    prompt: '¿Tenés un sistema para repartir tu ingreso cuando entra?',
    hint: 'Hablamos de cómo decidís cuánto va a obligatorios, ahorro, inversión y gusto — no del monto, sino del método.',
    glossaryTerms: ['sistemaCubetas'],
    options: [
      {
        value: 'no',
        label: 'No tengo método',
        sublabel: 'Gasto y veo qué queda al final del mes',
        score: 10,
      },
      {
        value: 'mental',
        label: 'Mental',
        sublabel: 'Tengo una idea de cuánto va a cada cosa, pero todo en una sola cuenta',
        score: 40,
      },
      {
        value: 'accounts',
        label: 'Cuentas separadas',
        sublabel: 'Una cuenta para gastos, otra para ahorro, otra para inversión',
        score: 80,
      },
      {
        value: 'automated',
        label: 'Automatizado',
        sublabel: 'El banco o una app reparte automáticamente cuando llega el ingreso',
        score: 100,
      },
    ],
    insights: [
      {
        id: 'noBudgetSystem',
        when: {kind: 'equals', key: 'hasBudgetSystem', value: 'no'},
        severity: 'warning',
        diagnostic: 'No tenés un sistema para repartir tu ingreso.',
        tip: 'Lo que sobra al final del mes nunca alcanza. Probá la regla más simple: cuando entra el ingreso, mové primero un porcentaje fijo a ahorro/inversión, y vivir con lo que queda. Mental, en cuentas separadas o automatizado — cualquier sistema le gana a no tener.',
      },
      {
        id: 'automatedBudget',
        when: {kind: 'equals', key: 'hasBudgetSystem', value: 'automated'},
        severity: 'positive',
        diagnostic: 'Tu reparto está automatizado.',
        tip: 'Es la versión más sólida del sistema: el ahorro no depende de tu disciplina mensual. Verificá una vez al año que los porcentajes sigan haciendo sentido para tu ingreso y tus metas.',
      },
    ],
  },
  {
    storageKey: 'knowsCreditScore',
    title: 'Conocimiento del score',
    description:
      'Si el usuario conoce su puntaje crediticio (Datacrédito en Colombia, Buró en México, Boa Vista/Serasa en Brasil, Equifax en otros). Conocerlo es indicador básico de educación financiera — saber cómo te ven los bancos. Si no lo conoce, las preguntas siguientes sobre el score se omiten.',
    category: 'base',
    type: 'toggle',
    prompt: '¿Conoces tu puntaje crediticio?',
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 30},
  },
  {
    storageKey: 'creditScoreBand',
    title: 'Banda del score',
    description:
      'Banda aproximada del puntaje crediticio. Las escalas varían por país; cada chip muestra como sublabel el rango numérico del buró del país detectado, resuelto vía la derivación `creditScoreBands`. El widget del sidebar (`creditScoreScale`) repite la tabla completa para referencia.',
    category: 'base',
    type: 'chips',
    prompt: '¿En qué banda dirías que está tu puntaje?',
    hint: 'Como referencia: malo (te niegan crédito), regular (te lo dan con tasas altas), bueno (tasas estándar), excelente (mejores tasas y tarjetas premium).',
    sidebarWidgets: ['creditScoreScale'],
    derivation: {kind: 'creditScoreBands', inputs: []},
    dependsOn: [{storageKey: 'knowsCreditScore', equals: true}],
    options: [
      {value: 'bad', label: 'Malo', score: 20},
      {value: 'regular', label: 'Regular', score: 50},
      {value: 'good', label: 'Bueno', score: 80},
      {value: 'excellent', label: 'Excelente', score: 100},
    ],
    insights: [
      {
        id: 'badCreditScore',
        when: {kind: 'in', key: 'creditScoreBand', values: ['bad', 'regular']},
        severity: 'warning',
        diagnostic: 'Tu puntaje crediticio no está en buen rango.',
        tip: 'Revisá tus deudas activas, paga puntual aunque sean montos chicos, y evitá pedir múltiples créditos en poco tiempo. Subir un score toma meses, no días.',
      },
    ],
  },
  {
    storageKey: 'hasDebt',
    title: 'Existencia de deudas',
    description:
      'Puerta de entrada al bloque de deuda. Si el usuario no tiene deudas activas, las preguntas siguientes de la categoría se omiten.',
    category: 'debt',
    type: 'toggle',
    prompt: '¿Tienes deudas activas?',
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 0, whenFalse: 100},
    insights: [
      {
        id: 'noDebt',
        when: {kind: 'equals', key: 'hasDebt', value: false},
        severity: 'positive',
        diagnostic: 'No tienes deudas activas — buena posición de partida.',
        tip: 'Si tu fondo de emergencia ya cubre 3 meses o más, considerá dirigir el excedente del ingreso a inversiones diversificadas en vez de dejarlo quieto.',
      },
    ],
  },
  {
    storageKey: 'debtMonthlyPct',
    title: 'Cuota mensual de deudas',
    description:
      'Porcentaje del ingreso que se va en cuotas mensuales de las deudas activas. Es el indicador real de presión de cash-flow: un saldo grande con cuota chica duele menos mes a mes que un saldo modesto con cuota grande.',
    category: 'debt',
    type: 'slider',
    prompt: '¿Qué porcentaje de tu ingreso se va en cuotas mensuales de tus deudas?',
    hint: 'Suma de todas las cuotas mensuales (tarjetas, créditos, hipoteca, vehículo). Si una deuda es a meses sin intereses, contá igual la cuota.',
    dependsOn: [{storageKey: 'hasDebt', equals: true}],
    derivation: {kind: 'shareOfMonthlyIncome', inputs: ['incomeBand']},
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 30,
    unit: '%',
    marks: [
      {value: 0, label: '0%'},
      {value: 50, label: '50%'},
      {value: 100, label: '100%'},
    ],
    score: [
      {min: 0, max: 15, score: 100},
      {min: 15, max: 30, score: 70},
      {min: 30, max: 45, score: 40},
      {min: 45, max: 101, score: 10},
    ],
    insights: [
      {
        id: 'debtPaymentPressure',
        when: {kind: 'numberAbove', key: 'debtMonthlyPct', threshold: 30},
        severity: 'warning',
        diagnostic: 'Más del 30% de tu ingreso se va en cuotas de deuda.',
        tip: 'Con esa presión de cash-flow, cualquier imprevisto se vuelve crisis. Considerá compra de cartera con otra entidad para bajar la tasa, abonar al capital de la deuda con peor tasa, o renegociar plazos.',
      },
    ],
  },
  {
    storageKey: 'debtCount',
    title: 'Cantidad de deudas',
    description:
      'Número de deudas activas. Sirve para preguntar luego, una por una, su tasa y naturaleza sin promediar artificialmente.',
    category: 'debt',
    type: 'number',
    prompt: '¿Cuántas deudas tienes activas?',
    hint: 'Si tenés muchas deudas similares, podés agruparlas (p. ej. todas las tarjetas como una sola).',
    dependsOn: [{storageKey: 'hasDebt', equals: true}],
    min: 1,
    max: 20,
    step: 1,
    defaultValue: 1,
    placeholder: 'Cantidad',
    score: [
      {min: 1, max: 2, score: 90},
      {min: 2, max: 3, score: 70},
      {min: 3, max: 4, score: 50},
      {min: 4, max: 7, score: 30},
      {min: 7, score: 10},
    ],
    insights: [
      {
        id: 'tooManyDebts',
        when: {kind: 'numberAbove', key: 'debtCount', threshold: 5},
        severity: 'warning',
        diagnostic: 'Manejas más de 5 deudas activas.',
        tip: 'Considerá consolidar las más caras en una sola con tasa menor para simplificar pagos y reducir intereses totales.',
      },
    ],
  },
  {
    storageKey: 'debtAmounts',
    title: 'Monto de cada deuda',
    description:
      'Tamaño relativo de cada deuda comparado con el salario mínimo del país. Reemplaza la pregunta única "magnitud total" — el saldo agregado oculta deudas individuales muy distintas (una hipoteca grande convive con tarjetas chicas). Las bandas cubren desde compras chicas hasta vivienda (200+ SMM).',
    category: 'debt',
    type: 'grid',
    prompt: '¿De cuánto es cada deuda?',
    hint: 'Comparada con el salario mínimo del país, o ingresá el monto exacto.',
    dependsOn: [
      {storageKey: 'hasDebt', equals: true},
      {storageKey: 'debtCount', greaterThan: 0},
    ],
    derivation: {kind: 'multiplyMinimumWage', inputs: []},
    rowSource: {kind: 'count', storageKey: 'debtCount', labelTemplate: 'Deuda #{n}'},
    cell: {
      kind: 'chips',
      options: [
        {value: 'lt1', label: 'Menos de 1 SMM', bracket: {max: 1}, score: 100},
        {value: '1to3', label: '1 a 3 SMM', bracket: {min: 1, max: 3}, score: 80},
        {value: '3to10', label: '3 a 10 SMM', bracket: {min: 3, max: 10}, score: 60},
        {value: '10to50', label: '10 a 50 SMM', bracket: {min: 10, max: 50}, score: 40},
        {value: '50to200', label: '50 a 200 SMM', bracket: {min: 50, max: 200}, score: 20},
        {value: 'gt200', label: 'Más de 200 SMM', sublabel: 'Vivienda u otra deuda muy grande', bracket: {min: 200}, score: 5},
      ],
      exactInput: {min: 0, step: 10000, placeholder: 'Monto exacto'},
    },
    insights: [
      {
        id: 'oneVeryLargeDebt',
        when: {kind: 'gridAnyIn', key: 'debtAmounts', values: ['50to200', 'gt200']},
        severity: 'warning',
        diagnostic: 'Tenés al menos una deuda muy grande.',
        tip: 'Si es vivienda u otra deuda buena, el riesgo está acotado a la cuota mensual y la tasa. Si es consumo, el plan tiene que ser bajarla con prioridad — son las deudas que más asfixian.',
      },
      {
        id: 'manyMediumDebts',
        when: {kind: 'gridCountInAtLeast', key: 'debtAmounts', values: ['3to10', '10to50'], count: 3},
        severity: 'warning',
        diagnostic: 'Acumulás varias deudas de tamaño medio.',
        tip: 'Aunque cada una sea manejable por separado, el problema suele ser la suma de cuotas. Considerá compra de cartera para consolidar y bajar la presión mensual.',
      },
    ],
  },
  {
    storageKey: 'debtRates',
    title: 'Tasa de cada deuda',
    description:
      'Tasa de interés por deuda. Permite identificar deudas tóxicas individuales y priorizar pagos.',
    category: 'debt',
    type: 'grid',
    prompt: '¿Cuál es la tasa de interés de cada deuda?',
    hint: 'Aproximadamente. Si no estás seguro, escoge una banda o ingresá el valor exacto.',
    glossaryTerms: ['ea'],
    dependsOn: [
      {storageKey: 'hasDebt', equals: true},
      {storageKey: 'debtCount', greaterThan: 0},
    ],
    rowSource: {kind: 'count', storageKey: 'debtCount', labelTemplate: 'Deuda #{n}'},
    cell: {
      kind: 'chips',
      options: [
        {
          value: 'low',
          label: 'Baja',
          sublabel: 'Menos de 10% EA',
          examples: ['Crédito hipotecario subsidiado', 'Algunos créditos de libranza'],
          score: 100,
        },
        {
          value: 'mid',
          label: 'Media',
          sublabel: '10% a 25% EA',
          examples: ['Crédito educativo', 'Crédito de vehículo'],
          score: 70,
        },
        {
          value: 'high',
          label: 'Alta',
          sublabel: '25% a 50% EA',
          examples: ['Tarjeta de crédito', 'Crédito de libre inversión'],
          score: 30,
        },
        {
          value: 'veryHigh',
          label: 'Muy alta',
          sublabel: 'Más de 50% EA',
          examples: ['Avances en efectivo', 'Préstamos rotativos informales'],
          score: 5,
        },
        {value: 'unknown', label: 'No sé', sublabel: 'Asumiremos lo peor', score: 30},
      ],
      exactInput: {min: 0, max: 200, step: 0.5, unit: '% EA', placeholder: 'EA exacta'},
      exactScore: [
        {max: 10, score: 100},
        {min: 10, max: 25, score: 70},
        {min: 25, max: 50, score: 30},
        {min: 50, score: 5},
      ],
    },
    insights: [
      {
        id: 'toxicRates',
        when: {kind: 'gridAnyIn', key: 'debtRates', values: ['high', 'veryHigh']},
        severity: 'critical',
        diagnostic: 'Al menos una de tus deudas tiene tasa alta o muy alta.',
        tip: 'Esa es la primera que conviene atacar. Cualquier ahorro o inversión que rinda menos que esa tasa, en la práctica, te está restando dinero.',
      },
    ],
  },
  {
    storageKey: 'debtKinds',
    title: 'Naturaleza de cada deuda',
    description:
      'Si la deuda produce dinero, reemplaza un gasto recurrente, o solo financió consumo. Define el orden de pago en el plan.',
    category: 'debt',
    type: 'grid',
    prompt: '¿Qué tipo de deuda es cada una?',
    glossaryTerms: ['debtKindInvestment', 'debtKindSavings', 'debtKindBad'],
    dependsOn: [
      {storageKey: 'hasDebt', equals: true},
      {storageKey: 'debtCount', greaterThan: 0},
    ],
    rowSource: {kind: 'count', storageKey: 'debtCount', labelTemplate: 'Deuda #{n}'},
    cell: {
      kind: 'chips',
      options: [
        {value: 'investment', label: 'Una inversión', sublabel: 'p. ej. local, negocio', score: 90},
        {value: 'savings', label: 'Un ahorro', sublabel: 'p. ej. casa, carro', score: 70},
        {value: 'bad', label: 'Una deuda mala', sublabel: 'p. ej. concierto, vacación', score: 10},
      ],
    },
    insights: [
      {
        id: 'allBadDebt',
        when: {kind: 'gridEveryIn', key: 'debtKinds', values: ['bad']},
        severity: 'warning',
        diagnostic: 'Todas tus deudas son de consumo.',
        tip: 'Pagar deuda mala libera ingreso futuro. Antes de invertir, prioriza eliminar este tipo de deuda — los intereses te cuestan más de lo que cualquier inversión segura te puede dar.',
      },
      {
        id: 'hasGoodDebt',
        when: {kind: 'gridAnyIn', key: 'debtKinds', values: ['investment', 'savings']},
        severity: 'positive',
        diagnostic: 'Parte de tu deuda está produciendo o conservando valor.',
        tip: 'No es la deuda en sí lo que daña — es la que solo financia consumo. Revisá si las tasas son razonables comparadas con el rendimiento que te dan.',
      },
      {
        id: 'leverageAgainstAssets',
        when: {kind: 'gridAnyIn', key: 'debtKinds', values: ['investment']},
        severity: 'info',
        diagnostic: 'Tu deuda productiva opera como apalancamiento contra activos.',
        tip: 'Es la misma mecánica que usan los patrimonios grandes: pedir prestado contra activos en vez de venderlos. Conservan el activo, evitan el impuesto a la ganancia, y pagan la tasa. Mientras el activo rinda más que la tasa de la deuda, la estructura suma.',
      },
    ],
  },
  {
    storageKey: 'emergencyMonths',
    title: 'Fondo de emergencia',
    description:
      'Cuántos meses de gastos obligatorios tiene el usuario guardados como colchón ante imprevistos.',
    category: 'stability',
    type: 'chips',
    prompt: '¿Cuántos meses de gastos tienes guardados como fondo de emergencia?',
    hint: 'Aproximadamente, o ingresá la cantidad exacta de meses.',
    glossaryTerms: ['fondoEmergencia'],
    derivation: {kind: 'multiplyMonthlyExpenses', inputs: ['incomeBand', 'obligatoryPct']},
    options: [
      {value: 'none', label: 'Ninguno', score: 0},
      {value: 'lt1', label: 'Menos de 1 mes', bracket: {max: 1}, score: 20},
      {value: '1to3', label: '1 a 3 meses', bracket: {min: 1, max: 3}, score: 50},
      {value: '3to6', label: '3 a 6 meses', bracket: {min: 3, max: 6}, score: 75},
      {value: '6to12', label: '6 a 12 meses', bracket: {min: 6, max: 12}, score: 95},
      {value: 'gt12', label: '12 meses o más', bracket: {min: 12}, score: 100},
    ],
    exactInput: {min: 0, max: 120, step: 0.5, unit: 'meses', placeholder: 'Meses exactos'},
    exactScore: [
      {max: 1, score: 20},
      {min: 1, max: 3, score: 50},
      {min: 3, max: 6, score: 75},
      {min: 6, max: 12, score: 95},
      {min: 12, score: 100},
    ],
    insights: [
      {
        id: 'noEmergencyFund',
        when: {kind: 'in', key: 'emergencyMonths', values: ['none', 'lt1']},
        severity: 'warning',
        diagnostic: 'Tu fondo de emergencia es inexistente o muy chico.',
        tip: 'Empezá por una meta chica que sí puedas cumplir: 1 mes de gastos obligatorios en cuenta líquida. Las metas grandes que no se cumplen producen abandono; las chicas que se cumplen producen hábito. Cuando llegues a 1 mes, redefiní el siguiente objetivo a 3 meses.',
      },
      {
        id: 'strongEmergencyFund',
        when: {kind: 'in', key: 'emergencyMonths', values: ['6to12', 'gt12']},
        severity: 'positive',
        diagnostic: 'Tu fondo de emergencia cubre 6 meses o más.',
        tip: 'Si la cifra es muy superior a 6 meses, parte del excedente puede ir a inversión y rendir más sin perder seguridad.',
      },
    ],
  },
  {
    storageKey: 'emergencyAccessSpeed',
    title: 'Velocidad de acceso al fondo',
    description:
      'Cuán rápido puede el usuario disponer del dinero del fondo si lo necesita. Un fondo grande pero ilíquido (CDT bloqueado, inversión a meses) no es realmente un fondo de emergencia. Esta pregunta separa el fondo "nominal" del fondo "operativo".',
    category: 'stability',
    type: 'chips',
    prompt: '¿Qué tan rápido podrías disponer de tu fondo si lo necesitaras hoy?',
    hint: 'Pensalo como: si esta noche se me daña el auto y necesito el dinero, ¿cuándo lo tengo en mi mano?',
    dependsOn: [
      {storageKey: 'emergencyMonths', in: ['1to3', '3to6', '6to12', 'gt12']},
    ],
    options: [
      {
        value: 'minutes',
        label: 'En minutos',
        sublabel: 'Cuenta de ahorros, billetera digital',
        score: 100,
      },
      {
        value: 'hours',
        label: 'En horas',
        sublabel: 'Transferencia entre bancos',
        score: 90,
      },
      {
        value: 'days',
        label: 'En días',
        sublabel: 'Fondo de inversión a la vista, retiro programado',
        score: 60,
      },
      {
        value: 'weeks',
        label: 'En semanas',
        sublabel: 'CDT, fondo con liquidación lenta',
        score: 25,
      },
      {
        value: 'months',
        label: 'En meses',
        sublabel: 'Inversión bloqueada, propiedad',
        score: 5,
      },
    ],
    insights: [
      {
        id: 'illiquidEmergencyFund',
        when: {kind: 'in', key: 'emergencyAccessSpeed', values: ['weeks', 'months']},
        severity: 'warning',
        diagnostic: 'Tu fondo no es realmente líquido — tarda demasiado en estar disponible.',
        tip: 'El propósito del fondo es cubrir lo inesperado. Si tarda semanas o meses, la emergencia ya pasó. Una cuenta de ahorros o un fondo a la vista cumplen mejor ese rol; podés mantener el resto a más plazo.',
      },
    ],
  },
  {
    storageKey: 'hasHealthInsurance',
    title: 'Seguro de salud',
    description:
      'Si el usuario tiene cobertura de salud (pública, privada, o complementaria). Reduce el peor escenario donde una urgencia médica vacía el fondo de emergencia y empuja a deuda. El riesgo de no tenerlo crece con la edad — los insights se condicionan a `age`.',
    category: 'stability',
    type: 'toggle',
    prompt: '¿Tienes cobertura de salud?',
    hint: 'Cualquiera: pública (EPS, IMSS, SUS, FONASA), privada, o seguro complementario.',
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 30},
    insights: [
      {
        id: 'noInsuranceHighRisk',
        when: {
          kind: 'all',
          of: [
            {kind: 'equals', key: 'hasHealthInsurance', value: false},
            {kind: 'numberAbove', key: 'age', threshold: 40},
          ],
        },
        severity: 'critical',
        diagnostic: 'No tenés seguro de salud y por tu edad el riesgo es alto.',
        tip: 'Una urgencia médica sin cobertura puede vaciar tu fondo de emergencia y endeudarte mucho. Un plan básico — público si está disponible, privado complementario si no — debería ser prioridad.',
      },
      {
        id: 'noInsuranceModerateRisk',
        when: {
          kind: 'all',
          of: [
            {kind: 'equals', key: 'hasHealthInsurance', value: false},
            {kind: 'numberAtMost', key: 'age', threshold: 40},
          ],
        },
        severity: 'warning',
        diagnostic: 'No tenés seguro de salud.',
        tip: 'Aunque tu probabilidad anual de evento médico sea baja, un accidente puede pasarle a cualquiera. Aunque sea un plan público o un seguro de accidentes mínimo cubre lo peor.',
      },
    ],
  },
  {
    storageKey: 'jobHorizon',
    title: 'Horizonte laboral',
    description:
      'Cuánto tiempo se ve el usuario en su trabajo actual. Es proxy de la estabilidad laboral percibida. Si el horizonte es corto (≤5 años), el cuestionario pregunta por planes de segunda fuente de ingreso.',
    category: 'stability',
    type: 'chips',
    prompt: '¿En cuánto tiempo te ves todavía en tu trabajo actual?',
    options: [
      {value: '0to1', label: '0 a 1 año', score: 30},
      {value: '1to3', label: '1 a 3 años', score: 50},
      {value: '3to5', label: '3 a 5 años', score: 70},
      {value: '5to10', label: '5 a 10 años', score: 85},
      {value: '10to20', label: '10 a 20 años', score: 95},
      {value: 'gt20', label: 'Más de 20 años', score: 100},
    ],
  },
  {
    storageKey: 'secondIncomeStream',
    title: 'Segunda fuente de ingreso',
    description:
      'Si el horizonte laboral es corto/medio (≤5 años), preguntamos si el usuario tiene o está construyendo una segunda fuente de ingreso. Captura preparación ante un cambio que el propio usuario ya intuye. La opción "no me interesa" se incluye porque algunos usuarios deliberadamente dependen de su empleo principal — no es lo mismo que "todavía no" pero implica menos preparación.',
    category: 'stability',
    type: 'chips',
    prompt: '¿Tienes una fuente de ingreso secundaria?',
    hint: 'Negocio propio, freelance, ingresos pasivos, monetización de un hobby — cualquier cosa que no sea tu trabajo actual.',
    dependsOn: [{storageKey: 'jobHorizon', in: ['0to1', '1to3', '3to5']}],
    options: [
      {value: 'no', label: 'No, todavía no', score: 10},
      {value: 'no-interest', label: 'No, no me interesa', score: 5},
      {value: 'idea', label: 'Tengo una idea', score: 30},
      {value: 'working', label: 'Estoy trabajando en ello', score: 60},
      {value: 'results', label: 'Estoy viendo resultados', score: 85},
      {value: 'stable', label: 'Sí, ya es ingreso estable', score: 100},
    ],
    insights: [
      {
        id: 'noSecondIncomeShortHorizon',
        when: {kind: 'in', key: 'secondIncomeStream', values: ['no', 'no-interest']},
        severity: 'warning',
        diagnostic: 'Tu horizonte laboral es corto y no tenés otra fuente en marcha.',
        tip: 'No es urgente, pero conviene empezar a pensarlo. Una segunda fuente toma años en madurar; si esperás a necesitarla ya es tarde.',
      },
    ],
  },
  {
    storageKey: 'financialStressLevel',
    title: 'Nivel de estrés financiero',
    description:
      'Cuán seguido el usuario percibe ansiedad o malestar por la situación financiera. Es una variable subjetiva que no aparece en ninguna otra pregunta y que el video de Galloway identifica como factor de daño a la salud. Va al final de Estabilidad porque acumula el efecto de todo lo anterior.',
    category: 'stability',
    type: 'chips',
    prompt: '¿Con qué frecuencia sentís estrés financiero?',
    hint: 'Ansiedad cuando se acerca fin de mes, evitar abrir cuentas, dormir mal por dinero — esas señales.',
    options: [
      {value: 'none', label: 'Casi nunca', sublabel: 'La plata no me quita el sueño', score: 100},
      {value: 'sometimes', label: 'A veces', sublabel: 'En meses puntuales o ante imprevistos', score: 70},
      {value: 'frequent', label: 'Seguido', sublabel: 'Varias veces al mes', score: 30},
      {value: 'constant', label: 'Constante', sublabel: 'Lo cargo casi todos los días', score: 10},
    ],
    insights: [
      {
        id: 'chronicFinancialStress',
        when: {kind: 'in', key: 'financialStressLevel', values: ['frequent', 'constant']},
        severity: 'critical',
        diagnostic: 'Estás cargando estrés financiero sostenido.',
        tip: 'La presión financiera prolongada sube presión arterial, deteriora el sueño y empeora decisiones. Arreglar el cash-flow no es solo financiero, también es salud — empezá por el rubro más doloroso (deuda cara, gasto fijo grande) y atacalo aunque sea con un primer paso chico.',
      },
    ],
  },
  {
    storageKey: 'inRelationship',
    title: 'Convivencia económica',
    description:
      'Si el usuario comparte decisiones económicas con una pareja. Es el gate que decide si se pregunta por la alineación financiera del hogar. No puntúa por sí solo — es informativo.',
    category: 'stability',
    type: 'toggle',
    prompt: '¿Compartís decisiones económicas con una pareja?',
    hint: 'Conviviendo o no, casados o no — lo que importa es si las decisiones de plata grandes las negociás con alguien más.',
    trueLabel: 'Sí',
    falseLabel: 'No',
  },
  {
    storageKey: 'householdFinancialAlignment',
    title: 'Alineación financiera con la pareja',
    description:
      'Si la pareja conversa de dinero y qué tan alineados están en gastos y ahorro. El backlog del video lo cita como predictor #1 de divorcio. Pregunta sensible — el copy es deliberadamente neutro para no juzgar.',
    category: 'stability',
    type: 'chips',
    prompt: '¿Cómo manejan el tema dinero entre los dos?',
    hint: 'Sin juicio: lo importante es identificar si hay un canal de conversación, no si son perfectos.',
    dependsOn: [{storageKey: 'inRelationship', equals: true}],
    options: [
      {
        value: 'never-talk',
        label: 'No hablamos del tema',
        sublabel: 'Cada uno con su plata, sin coordinación',
        score: 10,
      },
      {
        value: 'disagree',
        label: 'Hablamos pero discutimos',
        sublabel: 'No estamos de acuerdo en cómo gastar o ahorrar',
        score: 30,
      },
      {
        value: 'aligned-no-plan',
        label: 'Estamos alineados pero sin plan',
        sublabel: 'En la misma página, sin metas escritas',
        score: 70,
      },
      {
        value: 'aligned-plan',
        label: 'Alineados con plan',
        sublabel: 'Metas concretas, revisión periódica',
        score: 100,
      },
    ],
    insights: [
      {
        id: 'householdFinancialMisalignment',
        when: {kind: 'in', key: 'householdFinancialAlignment', values: ['never-talk', 'disagree']},
        severity: 'warning',
        diagnostic: 'No hay un canal aceitado para hablar de plata con tu pareja.',
        tip: 'La falta de conversación financiera es el predictor más fuerte de conflicto serio en una pareja, antes que el monto ahorrado. Probá la conversación más simple: una vez al mes, 20 minutos, repasar lo que entró, lo que salió y un objetivo a 90 días.',
      },
    ],
  },
  {
    storageKey: 'yearsInvesting',
    title: 'Años invirtiendo',
    description:
      'Cuánto tiempo lleva el usuario invirtiendo, contado desde la primera inversión real. No depende de `invests`: capta el caso "joven que no invierte" para activar el insight de interés compuesto. La opción "Nunca" puntúa bajo aunque el usuario no se considere inversor.',
    category: 'investment',
    type: 'chips',
    prompt: '¿Hace cuánto invertís plata?',
    hint: 'Desde la primera inversión real que sigue activa o de la que aprendiste algo. Cuentas de ahorro genéricas no cuentan.',
    glossaryTerms: ['interesCompuesto'],
    options: [
      {value: 'never', label: 'Nunca invertí', score: 10},
      {value: 'lt1', label: 'Menos de 1 año', sublabel: 'Estoy arrancando', score: 40},
      {value: '1to3', label: '1 a 3 años', sublabel: 'Empezando a ver resultados', score: 70},
      {value: '3to10', label: '3 a 10 años', sublabel: 'Ya pasé al menos un ciclo de mercado', score: 90},
      {value: 'gt10', label: 'Más de 10 años', sublabel: 'Inversor experimentado', score: 100},
    ],
    insights: [
      {
        id: 'compoundTimeWasted',
        when: {
          kind: 'all',
          of: [
            {kind: 'in', key: 'yearsInvesting', values: ['never', 'lt1']},
            {kind: 'numberBelow', key: 'age', threshold: 30},
          ],
        },
        severity: 'warning',
        diagnostic: 'Sos joven y todavía no estás capturando interés compuesto.',
        tip: 'Cada año invertido a los 20 vale más que diez años invertidos a los 40, gracias al interés compuesto. Empezar tarde con más plata pierde contra empezar temprano con poca. No hace falta saber mucho: un fondo indexado básico ya activa el reloj.',
      },
    ],
  },
  {
    storageKey: 'professionalEducationInvestment',
    title: 'Inversión en formación profesional',
    description:
      'Si el usuario invirtió tiempo o dinero en formación de su rubro durante el último año. La inversión que más mueve el ingreso a largo plazo es la que se hace en uno mismo — el readme original abre la sección de inversiones con esto. Vive en la categoría Inversiones pero no depende del gate `invests`: aplica aunque la persona no invierta financieramente.',
    category: 'investment',
    type: 'chips',
    prompt: '¿En el último año invertiste en formarte para tu trabajo o profesión?',
    hint: 'Cursos, certificaciones, lecturas técnicas, mentorías, posgrado.',
    options: [
      {value: 'no', label: 'No', score: 10},
      {
        value: 'a-bit',
        label: 'Algo de lectura informal',
        sublabel: 'Artículos, videos, podcasts del rubro',
        score: 40,
      },
      {
        value: 'time',
        label: 'Sí, dediqué tiempo',
        sublabel: 'Cursos gratuitos, autoestudio constante',
        score: 75,
      },
      {
        value: 'time-money',
        label: 'Sí, tiempo y dinero',
        sublabel: 'Certificación, posgrado, curso pago',
        score: 100,
      },
    ],
    insights: [
      {
        id: 'noProfessionalEducation',
        when: {kind: 'equals', key: 'professionalEducationInvestment', value: 'no'},
        severity: 'info',
        diagnostic: 'No estás invirtiendo en formación de tu rubro.',
        tip: 'Tu mejor activo sos vos mismo. Cualquier mejora en tu trabajo se compone — sube el ingreso, abre puertas, da margen para todo lo demás. No tiene por qué ser caro: empezar con contenido gratuito ya cuenta.',
      },
    ],
  },
  {
    storageKey: 'financialEducationInvestment',
    title: 'Inversión en educación financiera',
    description:
      'Si el usuario invirtió tiempo o dinero en aprender sobre finanzas personales en el último año. Saber antes de invertir reduce el riesgo de tomar decisiones por moda o por miedo. No depende del gate `invests`: tiene sentido preguntar incluso a quien no invierte aún.',
    category: 'investment',
    type: 'chips',
    prompt: '¿En el último año invertiste en educar tus finanzas personales?',
    hint: 'Libros, podcasts, cursos, canales, comunidades. Antes de invertir conviene saber en qué.',
    options: [
      {value: 'no', label: 'No', score: 10},
      {
        value: 'a-bit',
        label: 'Algo de contenido informal',
        sublabel: 'Videos, posts, alguna conversación',
        score: 40,
      },
      {
        value: 'time',
        label: 'Sí, dediqué tiempo',
        sublabel: 'Libros, podcasts, autoestudio',
        score: 75,
      },
      {
        value: 'time-money',
        label: 'Sí, tiempo y dinero',
        sublabel: 'Cursos pagos, asesoría, formación formal',
        score: 100,
      },
    ],
    insights: [
      {
        id: 'noFinancialEducation',
        when: {kind: 'equals', key: 'financialEducationInvestment', value: 'no'},
        severity: 'info',
        diagnostic: 'No estás invirtiendo en tu educación financiera.',
        tip: 'No es necesario gastar dinero — un par de podcasts o libros gratuitos te dan lo básico. Lo importante es saber qué estás haciendo antes de mover plata, no aprenderlo cuando ya cometiste el error.',
      },
    ],
  },
  {
    storageKey: 'invests',
    title: 'Hábito de inversión',
    description:
      'Puerta de entrada al bloque de inversiones financieras. Si el usuario no invierte, las preguntas siguientes que dependen de este gate se omiten — pero las de educación (antes de este nodo) ya se preguntaron, porque la inversión en uno mismo aplica con o sin inversión financiera.',
    category: 'investment',
    type: 'toggle',
    prompt: '¿Inviertes parte de tu ingreso?',
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 30},
    insights: [
      {
        id: 'notInvestingButReady',
        when: {
          kind: 'all',
          of: [
            {kind: 'equals', key: 'invests', value: false},
            {kind: 'in', key: 'emergencyMonths', values: ['1to3', '3to6', '6to12', 'gt12']},
            {
              kind: 'any',
              of: [
                {kind: 'equals', key: 'hasDebt', value: false},
                // No hay deudas grandes (todas en bandas ≤10 SMM): equivalente al
                // antiguo `debtMagnitude ∈ [small, medium]` ahora que el monto se
                // pide por deuda en `debtAmounts`.
                {
                  kind: 'not',
                  of: {
                    kind: 'gridAnyIn',
                    key: 'debtAmounts',
                    values: ['10to50', '50to200', 'gt200'],
                  },
                },
              ],
            },
          ],
        },
        severity: 'info',
        diagnostic: 'No estás invirtiendo, pero tu situación lo permitiría.',
        tip: 'Con un fondo de emergencia razonable y sin deuda grande, tenés margen para empezar con instrumentos seguros (CDT, fondos de inversión) e ir escalando a medida que ganes confianza.',
      },
      {
        id: 'investingActively',
        when: {kind: 'equals', key: 'invests', value: true},
        severity: 'positive',
        diagnostic: 'Estás invirtiendo, lo cual indica un hábito financiero saludable.',
        tip: 'Asegurate de que las tasas de tus deudas no superen el rendimiento de tus inversiones — si lo superan, pagar deuda es matemáticamente la mejor inversión.',
      },
    ],
  },
  {
    storageKey: 'tradingFrequency',
    title: 'Frecuencia de trading',
    description:
      'Cuán seguido el usuario compra o vende sus inversiones. El backlog del video lo identifica como predictor robusto: tradear frecuentemente correlaciona con peor rendimiento que comprar y mantener. Capta day-trading aunque el usuario no lo declare como tal.',
    category: 'investment',
    type: 'chips',
    prompt: '¿Con qué frecuencia comprás o vendés tus inversiones?',
    hint: 'No cuenta el aporte mensual a un fondo; cuenta cuándo decidís entrar o salir de una posición.',
    dependsOn: [{storageKey: 'invests', equals: true}],
    options: [
      {
        value: 'never',
        label: 'Casi nunca',
        sublabel: 'Compré y dejé; ajusto rara vez',
        score: 100,
      },
      {value: 'few-year', label: 'Pocas veces al año', score: 90},
      {value: 'monthly', label: 'Mensual', score: 60},
      {value: 'weekly', label: 'Semanal', score: 25},
      {value: 'daily', label: 'Diario', sublabel: 'Sigo el mercado todos los días', score: 5},
    ],
    insights: [
      {
        id: 'frequentTrading',
        when: {kind: 'in', key: 'tradingFrequency', values: ['weekly', 'daily']},
        severity: 'warning',
        diagnostic: 'Estás tradeando con mucha frecuencia.',
        tip: 'La evidencia es consistente: en promedio, quien tradea seguido rinde menos que quien compra y mantiene, después de comisiones e impuestos. Si tu rentabilidad neta no le está ganando a un fondo indexado, conviene reducir la frecuencia y dejar que el tiempo trabaje.',
      },
    ],
  },
  {
    storageKey: 'usesIndexFunds',
    title: 'Uso de fondos indexados',
    description:
      'Si el usuario usa fondos indexados o ETFs en su portafolio. El backlog del video lo cita como atajo de bajo costo que históricamente le gana a la mayoría de gestores activos en el largo plazo.',
    category: 'investment',
    type: 'toggle',
    prompt: '¿Usás fondos indexados o ETFs en tu portafolio?',
    hint: 'Replican un índice (S&P 500, MSCI World, etc.) a bajo costo, en vez de elegir activos uno por uno.',
    glossaryTerms: ['fondoIndexado'],
    dependsOn: [{storageKey: 'invests', equals: true}],
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 30},
    insights: [
      {
        id: 'noIndexFunds',
        when: {kind: 'equals', key: 'usesIndexFunds', value: false},
        severity: 'info',
        diagnostic: 'Tu portafolio no incluye fondos indexados.',
        tip: 'En plazos de 20 años, alrededor del 94% de los gestores activos profesionales no le gana a un índice básico tipo S&P 500. Para la mayoría de inversores particulares, un fondo indexado de base — y construir alrededor — es la apuesta con mejor relación esfuerzo/resultado.',
      },
    ],
  },
  {
    storageKey: 'riskProfile',
    title: 'Perfil de inversionista',
    description:
      'Autoclasificación del usuario en su perfil de riesgo: conservador (preservar capital, baja rentabilidad), moderado (balance), agresivo (mayor rentabilidad aceptando volatilidad). "No sé" da puntos bajos y desencadena una pregunta de seguimiento que sugiere un perfil basado en la edad.',
    category: 'investment',
    type: 'chips',
    prompt: '¿Cuál es tu perfil de inversionista?',
    hint: 'Conservador: preferís rentabilidad baja pero segura. Moderado: balance entre rendimiento y riesgo. Agresivo: aceptás volatilidad y posibles pérdidas a cambio de mayor rentabilidad esperada.',
    dependsOn: [{storageKey: 'invests', equals: true}],
    options: [
      {value: 'conservative', label: 'Conservador', score: 80},
      {value: 'moderate', label: 'Moderado', score: 90},
      {value: 'aggressive', label: 'Agresivo', score: 80},
      {value: 'unknown', label: 'No sé', score: 20},
    ],
    insights: [
      {
        id: 'riskProfileMatchesAge',
        when: {
          kind: 'any',
          of: [
            {
              kind: 'all',
              of: [
                {kind: 'numberBelow', key: 'age', threshold: 30},
                {kind: 'equals', key: 'riskProfile', value: 'aggressive'},
              ],
            },
            {
              kind: 'all',
              of: [
                {kind: 'numberAtLeast', key: 'age', threshold: 30},
                {kind: 'numberBelow', key: 'age', threshold: 50},
                {kind: 'equals', key: 'riskProfile', value: 'moderate'},
              ],
            },
            {
              kind: 'all',
              of: [
                {kind: 'numberAtLeast', key: 'age', threshold: 50},
                {kind: 'equals', key: 'riskProfile', value: 'conservative'},
              ],
            },
          ],
        },
        severity: 'positive',
        diagnostic: 'Tu perfil de riesgo está alineado con tu etapa de vida.',
        tip: 'Buena foto inicial. Igual conviene revisarlo cada 5-10 años — las prioridades cambian con responsabilidades, dependientes, salud.',
      },
      {
        id: 'riskProfileUnknown',
        when: {kind: 'equals', key: 'riskProfile', value: 'unknown'},
        severity: 'info',
        diagnostic: 'No tenés claro tu perfil de inversionista.',
        tip: 'Definirlo es uno de los pasos más útiles: te dice qué instrumentos tienen sentido para vos y cuáles no, y te evita entrar en una inversión que no podés sostener cuando empiece a moverse.',
      },
    ],
  },
  {
    storageKey: 'riskProfileGuess',
    title: 'Perfil sugerido',
    description:
      'Pregunta de seguimiento si el usuario respondió "No sé" en `riskProfile`. Le pedimos que elija una referencia con una guía rápida basada en edad. La elección coincidente con la sugerencia para su edad da un insight informativo positivo; cualquier otra elección sigue siendo válida pero no recibe el bonus.',
    category: 'investment',
    type: 'chips',
    prompt: 'Sin un perfil claro, ¿cuál escogerías como referencia?',
    hint: 'Como guía: con menos de 30 años (mucho horizonte) suele recomendarse agresivo; entre 30 y 50, moderado; con 50 o más, conservador para preservar capital.',
    dependsOn: [
      {storageKey: 'invests', equals: true},
      {storageKey: 'riskProfile', equals: 'unknown'},
    ],
    options: [
      {value: 'conservative', label: 'Conservador', score: 30},
      {value: 'moderate', label: 'Moderado', score: 30},
      {value: 'aggressive', label: 'Agresivo', score: 30},
    ],
    insights: [
      {
        id: 'guessMatchesAgeRecommendation',
        when: {
          kind: 'any',
          of: [
            {
              kind: 'all',
              of: [
                {kind: 'numberBelow', key: 'age', threshold: 30},
                {kind: 'equals', key: 'riskProfileGuess', value: 'aggressive'},
              ],
            },
            {
              kind: 'all',
              of: [
                {kind: 'numberAtLeast', key: 'age', threshold: 30},
                {kind: 'numberBelow', key: 'age', threshold: 50},
                {kind: 'equals', key: 'riskProfileGuess', value: 'moderate'},
              ],
            },
            {
              kind: 'all',
              of: [
                {kind: 'numberAtLeast', key: 'age', threshold: 50},
                {kind: 'equals', key: 'riskProfileGuess', value: 'conservative'},
              ],
            },
          ],
        },
        severity: 'info',
        diagnostic: 'Tu elección coincide con la recomendación general para tu edad.',
        tip: 'Es una buena referencia para empezar. Cuando tengas más experiencia invirtiendo conocerás mejor tu perfil real, que puede diferir.',
      },
    ],
  },
  {
    storageKey: 'investmentVehicles',
    title: 'Vehículos de inversión',
    description:
      'Mecanismos en los que el usuario tiene inversiones activas. La selección define las filas de las preguntas de monto y rendimiento.',
    category: 'investment',
    type: 'multiChips',
    prompt: '¿En cuáles de estos mecanismos inviertes?',
    hint: 'Selecciona todos los que apliquen.',
    glossaryTerms: ['cdt', 'diversificacion'],
    dependsOn: [{storageKey: 'invests', equals: true}],
    options: [
      {value: 'cdt', label: 'CDT', score: 10},
      {value: 'fund', label: 'Fondo de inversión', score: 15},
      {value: 'shares', label: 'Acciones', score: 15},
      {value: 'realEstate', label: 'Bienes raíces', score: 15},
      {value: 'crypto', label: 'Criptomonedas', score: 5},
      {value: 'bonds', label: 'Bonos', score: 15},
      {value: 'other', label: 'Otro', score: 10},
    ],
    insights: [
      {
        id: 'lowDiversification',
        when: {kind: 'multiCountAtMost', key: 'investmentVehicles', count: 1},
        severity: 'warning',
        diagnostic: 'Estás invirtiendo en un solo vehículo.',
        tip: 'Diversificá entre instrumentos con riesgos distintos. Un mal año en un único vehículo no debería poder destruir tu plan completo.',
      },
      {
        id: 'cryptoOnly',
        when: {
          kind: 'all',
          of: [
            {kind: 'multiHas', key: 'investmentVehicles', value: 'crypto'},
            {kind: 'multiCountAtMost', key: 'investmentVehicles', count: 1},
          ],
        },
        severity: 'critical',
        diagnostic: 'Tu única inversión es cripto.',
        tip: 'Cripto es una clase de activo de alta volatilidad. Conviene combinarla con instrumentos más estables (renta fija, fondos diversificados) para que un crash no se lleve todo.',
      },
    ],
  },
  {
    storageKey: 'investmentAmounts',
    title: 'Monto por vehículo',
    description:
      'Cuánto dinero tiene invertido el usuario en cada vehículo seleccionado. Se contextualiza con el salario mínimo.',
    category: 'investment',
    type: 'grid',
    prompt: '¿Cuánto tienes invertido en cada uno?',
    hint: 'Aproximadamente, en múltiplos del salario mínimo, o el monto exacto.',
    dependsOn: [
      {storageKey: 'invests', equals: true},
      {storageKey: 'investmentVehicles', nonEmpty: true},
    ],
    derivation: {kind: 'multiplyMinimumWage', inputs: ['incomeBand']},
    rowSource: {kind: 'multiSelectLabels', storageKey: 'investmentVehicles'},
    cell: {
      kind: 'chips',
      options: [
        {value: 'lt1', label: 'Menos de 1 SMM', bracket: {max: 1}, score: 30},
        {value: '1to2', label: '1 a 2 SMM', bracket: {min: 1, max: 2}, score: 50},
        {value: '2to4', label: '2 a 4 SMM', bracket: {min: 2, max: 4}, score: 70},
        {value: 'gt4', label: 'Más de 4 SMM', bracket: {min: 4}, score: 100},
      ],
      exactInput: {min: 0, step: 1000, placeholder: 'Monto exacto'},
    },
    insights: [
      {
        id: 'smallPositions',
        when: {kind: 'gridEveryIn', key: 'investmentAmounts', values: ['lt1']},
        severity: 'info',
        diagnostic: 'Tus posiciones individuales son menores a 1 SMM.',
        tip: 'Es razonable empezar pequeño para aprender, pero es el capital significativo el que mueve la aguja en el largo plazo. Apuntá a escalar a medida que ganás confianza con cada vehículo.',
      },
    ],
  },
  {
    storageKey: 'investmentYields',
    title: 'Rendimiento por vehículo',
    description:
      'Rendimiento efectivo anual aproximado por cada vehículo. Permite distinguir inversiones que crecen del dinero estancado.',
    category: 'investment',
    type: 'grid',
    prompt: '¿Cuál es el rendimiento anual de cada uno?',
    hint: 'Si no estás seguro, ingresá tu mejor estimación (en % EA).',
    glossaryTerms: ['ea'],
    dependsOn: [
      {storageKey: 'invests', equals: true},
      {storageKey: 'investmentVehicles', nonEmpty: true},
    ],
    rowSource: {kind: 'multiSelectLabels', storageKey: 'investmentVehicles'},
    cell: {
      kind: 'chips',
      options: [
        {value: 'negative', label: 'Negativo', sublabel: 'Estoy perdiendo', score: 0},
        {value: 'lt3', label: '0% a 3%', sublabel: 'Apenas inflación', score: 25},
        {value: '3to7', label: '3% a 7%', sublabel: 'Cuenta de ahorros, CDT', score: 55},
        {value: '7to15', label: '7% a 15%', sublabel: 'Renta fija con riesgo, fondos diversificados', score: 90},
        {value: 'gt15', label: 'Más de 15%', sublabel: 'Rentabilidad alta — verificá riesgo', score: 100},
      ],
      exactInput: {min: -100, max: 1000, step: 0.1, unit: '% EA', placeholder: 'Rendimiento exacto'},
      exactScore: [
        {max: 0, score: 0},
        {min: 0, max: 3, score: 25},
        {min: 3, max: 7, score: 55},
        {min: 7, max: 15, score: 90},
        {min: 15, score: 100},
      ],
    },
    insights: [
      {
        id: 'belowInflationYield',
        when: {kind: 'gridAnyIn', key: 'investmentYields', values: ['negative', 'lt3']},
        severity: 'warning',
        diagnostic: 'Al menos uno de tus vehículos rinde por debajo de la inflación.',
        tip: 'Si la inflación local supera ese rendimiento, ese vehículo te está haciendo perder poder adquisitivo. Revisá si conviene rotarlo a algo más productivo.',
      },
      {
        id: 'unsustainableHighYield',
        when: {
          kind: 'any',
          of: [
            {kind: 'gridAnyIn', key: 'investmentYields', values: ['gt15']},
            {kind: 'gridAnyNumberAbove', key: 'investmentYields', threshold: 30},
          ],
        },
        severity: 'warning',
        diagnostic: 'Tenés al menos un vehículo con rendimientos muy altos.',
        tip: 'Rendimientos consistentemente altos casi siempre esconden riesgo no contabilizado o sesgo de supervivencia (ves al ganador, no a los que perdieron). Antes de duplicar la apuesta, verificá el track record en años malos — si nunca lo viste perder, todavía no lo conocés.',
      },
    ],
  },
]

// ---------- Helpers de filas de grid ----------

export type GridRow = {label: string}

export const getGridRows = (q: GridQuestion, answers: Answers): readonly GridRow[] => {
  if (q.rowSource.kind === 'count') {
    const count = answers[q.rowSource.storageKey]
    if (typeof count !== 'number' || count <= 0) return []
    return Array.from({length: count}, (_, i) => ({
      label:
        q.rowSource.kind === 'count' ? q.rowSource.labelTemplate.replace('{n}', String(i + 1)) : '',
    }))
  }
  const selected = answers[q.rowSource.storageKey]
  if (!Array.isArray(selected) || selected.length === 0) return []
  const sourceQuestion = DIAGNOSIS_QUESTIONS.find(qq => qq.storageKey === q.rowSource.storageKey)
  if (!sourceQuestion || sourceQuestion.type !== 'multiChips') return []
  return selected.flatMap(value => {
    if (value === null || typeof value === 'boolean') return []
    const opt = sourceQuestion.options.find(o => o.value === value)
    return [{label: opt?.label ?? String(value)}]
  })
}

// ---------- Aplicabilidad / progreso ----------

const isGridEmpty = (q: GridQuestion, answers: Answers): boolean =>
  getGridRows(q, answers).length === 0

export const isQuestionApplicable = (q: DiagnosisQuestion, answers: Answers): boolean => {
  if (q.dependsOn && !q.dependsOn.every(c => matchesClause(c, answers[c.storageKey]))) return false
  if (q.type === 'grid' && isGridEmpty(q, answers)) return false
  return true
}

export const filterApplicableQuestions = (
  questions: readonly DiagnosisQuestion[],
  answers: Answers,
): DiagnosisQuestion[] => questions.filter(q => isQuestionApplicable(q, answers))

/**
 * Una pregunta está "saltada" cuando alguna cláusula padre se respondió con
 * un valor que no la cumple, o cuando un grid se quedó sin filas porque la
 * fuente está vacía. La barra de progreso la cuenta como resuelta.
 */
export const isQuestionSkipped = (q: DiagnosisQuestion, answers: Answers): boolean => {
  if (q.dependsOn) {
    const blocked = q.dependsOn.some(
      c => answers[c.storageKey] !== undefined && !matchesClause(c, answers[c.storageKey]),
    )
    if (blocked) return true
  }
  if (q.type === 'grid') {
    const sourceAnswered = answers[q.rowSource.storageKey] !== undefined
    if (sourceAnswered && isGridEmpty(q, answers)) return true
  }
  return false
}

/** Borra respuestas de preguntas que dejaron de aplicar. */
export const cleanOrphanAnswers = (answers: Answers): Answers => {
  const next: Answers = {...answers}
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (!isQuestionApplicable(q, next) && next[q.storageKey] !== undefined) {
      delete next[q.storageKey]
    }
  }
  return next
}

// ---------- Si la respuesta del nodo está completa ----------

export const isAnswerComplete = (q: DiagnosisQuestion, answers: Answers): boolean => {
  const value = answers[q.storageKey]
  if (value === undefined) return false
  if (q.type === 'multiChips') return Array.isArray(value) && value.length > 0
  if (q.type === 'grid') {
    const rows = getGridRows(q, answers)
    if (rows.length === 0) return false
    if (!Array.isArray(value)) return false
    return rows.every((_, i) => value[i] !== null && value[i] !== undefined)
  }
  return true
}

// ---------- Formato para mostrar respuestas ----------

const formatChipAnswer = (
  options: readonly ChipOption[],
  value: string | number,
  unit?: string,
): string => {
  if (typeof value === 'number') return `${value}${unit ? ` ${unit}` : ''}`
  return options.find(o => o.value === value)?.label ?? String(value)
}

export const formatAnswer = (q: DiagnosisQuestion, value: AnswerValue): string => {
  if (q.type === 'chips') {
    if (typeof value === 'string' || typeof value === 'number') {
      return formatChipAnswer(q.options, value, q.exactInput?.unit)
    }
  }
  if (q.type === 'slider' && typeof value === 'number') return `${value}${q.unit ?? ''}`
  if (q.type === 'toggle') {
    if (value === true) return q.trueLabel ?? 'Sí'
    if (value === false) return q.falseLabel ?? 'No'
  }
  if (q.type === 'number' && typeof value === 'number')
    return `${value}${q.unit ? ` ${q.unit}` : ''}`
  if (q.type === 'multiChips' && Array.isArray(value)) {
    return `${value.length} seleccionado${value.length === 1 ? '' : 's'}`
  }
  if (q.type === 'grid' && Array.isArray(value)) {
    const filled = value.filter(v => v !== null && v !== undefined).length
    return `${filled} respuesta${filled === 1 ? '' : 's'}`
  }
  return String(value)
}

// ---------- Nodos de resultado ----------

/**
 * Banda de tono sobre un puntaje 0–100. El primer band cuyo `[min, max)`
 * incluya el score gana. Sin `min` significa "hasta `max`"; sin `max`
 * significa "desde `min` en adelante" (incluye 100).
 *
 * `color` es un token semántico de MUI (`success` / `warning` / `error` /
 * `info` / `primary`); el render decide cómo mapearlo a CSS.
 */
export type ToneBand = {
  min?: number
  max?: number
  color: 'success' | 'warning' | 'error' | 'info' | 'primary'
  /** Mensaje literal que ve el usuario en la pantalla intersticial. */
  message: string
}

const DEFAULT_TONE_BANDS: readonly ToneBand[] = [
  {min: 80, color: 'success', message: 'Estás en muy buena posición en esta área.'},
  {min: 60, max: 80, color: 'success', message: 'Vas bien; hay espacio para optimizar.'},
  {min: 40, max: 60, color: 'warning', message: 'Hay aspectos importantes para revisar.'},
  {min: 20, max: 40, color: 'warning', message: 'Esta área necesita atención.'},
  {max: 20, color: 'error', message: 'Hay problemas serios que conviene priorizar.'},
]

const sectionScoreStorageKey = (cat: DiagnosisCategoryId): string =>
  `__sectionScore__${cat}`

/**
 * Nodo de "puntaje de sección": pantalla intersticial que ve el usuario
 * al terminar las preguntas aplicables de una categoría. Es un nodo del
 * cuestionario aunque no sea una pregunta — vive en el flujo entre
 * categorías y aporta información autocontenida sobre cómo se calcula
 * y presenta su resultado.
 *
 * No está en `DIAGNOSIS_QUESTIONS` (no es pregunta); vive en
 * `SECTION_SCORE_NODES`. Su `storageKey` sigue el patrón
 * `__sectionScore__{cat}`.
 */
export type SectionScoreNode = {
  storageKey: string
  kind: 'sectionScore'
  /** Categoría que resume. */
  category: DiagnosisCategoryId
  /** Etiqueta corta del paso, para el grafo. */
  title: string
  /** Texto largo: qué muestra, cuándo aparece, qué representa. */
  description: string
  /** Fórmula declarativa, legible. La implementación vive en `computeSectionScore`. */
  formula: string
  /** Reglas de inclusión que decide qué preguntas aportan, en lenguaje natural. */
  inclusionRules: readonly string[]
  /** Bandas que mapean score → color y mensaje. La UI las consume vía `resolveToneBand`. */
  toneBands: readonly ToneBand[]
}

export const SECTION_SCORE_NODES: readonly SectionScoreNode[] = CATEGORY_ORDER.map(cat => ({
  storageKey: sectionScoreStorageKey(cat),
  kind: 'sectionScore' as const,
  category: cat,
  title: `Puntaje · ${CATEGORIES[cat].label}`,
  description:
    `Pantalla intersticial que se muestra al terminar las preguntas aplicables de la categoría "${CATEGORIES[cat].label}". ` +
    'Calcula un puntaje 0–100 a partir de las respuestas y elige un mensaje de feedback según el rango.',
  formula: 'score = round(Σ earned / Σ max × 100)',
  inclusionRules: [
    'Solo entran al cálculo las preguntas aplicables (cuyas dependsOn se cumplen).',
    'Solo entran las preguntas completas (con respuesta).',
    'Las preguntas con max == 0 (sin scoring) no se cuentan — no penalizan el promedio.',
  ],
  toneBands: DEFAULT_TONE_BANDS,
}))

export const findSectionScoreNode = (
  cat: DiagnosisCategoryId,
): SectionScoreNode | undefined => SECTION_SCORE_NODES.find(n => n.category === cat)

/**
 * Pieza visual del Summary final, descrita declarativamente. El render
 * la consume en orden.
 *
 * `title` y `description` son para análisis y debug (qué hace la pieza).
 * `userHeading` es el texto que la UI muestra arriba de la pieza al
 * usuario; si está ausente, la pieza no lleva header propio.
 */
export type SummaryComponent = {
  id: string
  title: string
  description: string
  userHeading?: string
}

/**
 * Etiqueta visible y color para una severidad de insight. Lo consume
 * `Summary.tsx` para renderizar la lista; lo consume el debug para
 * documentar el comportamiento.
 */
export type SeverityLabel = {label: string; color: 'success' | 'warning' | 'error' | 'info'}

/**
 * Nodo de "diagnóstico final": pantalla que cierra el cuestionario.
 * No calcula score global; agrega insights aplicables y lista
 * respuestas. Vive en `SUMMARY_NODE`. Su `storageKey` es
 * `__summary__`.
 */
export type SummaryNode = {
  storageKey: string
  kind: 'summary'
  /** Etiqueta corta del paso, para el grafo y el debug. */
  title: string
  /** Encabezado que ve el usuario en la pantalla final. */
  userHeading: string
  description: string
  /** Piezas que el summary muestra al usuario, en orden. */
  components: readonly SummaryComponent[]
  /** Orden de severidad de los insights en el listado final. */
  severityOrder: readonly InsightSeverity[]
  /** Mapa severidad → etiqueta + color. Lo consumen tanto el render como el debug. */
  severityLabels: Record<InsightSeverity, SeverityLabel>
}

export const SUMMARY_NODE: SummaryNode = {
  storageKey: '__summary__',
  kind: 'summary',
  title: 'Diagnóstico final',
  userHeading: 'Tu lectura financiera',
  description:
    'Pantalla final del cuestionario. NO calcula un puntaje global; presenta dos cosas en orden: ' +
    'insights aplicables (recolectados con collectInsights) agrupados por categoría, y respuestas ' +
    'listadas con formatAnswerVerbose.',
  components: [
    {
      id: 'insights',
      title: 'Insights aplicables',
      description:
        'collectInsights(answers, smm) recorre los nodos aplicables y completos, evalúa el árbol when ' +
        'de cada insight y devuelve los que matched. Los nodos cuya pregunta fue omitida por dependencia ' +
        'o no completada no se evalúan. Las condiciones pueden referenciar cualquier storageKey, no solo ' +
        'el propio.',
    },
    {
      id: 'answers',
      title: 'Respuestas listadas',
      userHeading: 'Esto fue lo que respondiste',
      description:
        'Para cada pregunta con respuesta (answers[storageKey] !== undefined), se muestra title, prompt ' +
        'y la respuesta formateada con formatAnswerVerbose(question, value, answers). Sin score, sin ' +
        'agregados — es el "esto fue lo que respondiste" que cierra la pantalla.',
    },
  ],
  severityOrder: ['critical', 'warning', 'info', 'positive'],
  severityLabels: {
    critical: {label: 'Crítico', color: 'error'},
    warning: {label: 'A revisar', color: 'warning'},
    info: {label: 'Para considerar', color: 'info'},
    positive: {label: 'A favor', color: 'success'},
  },
}

/** Devuelve el nodo de resultado correspondiente a una `storageKey`, si lo hay. */
export const findResultNode = (
  key: string,
): SectionScoreNode | SummaryNode | undefined => {
  if (key === SUMMARY_NODE.storageKey) return SUMMARY_NODE
  return SECTION_SCORE_NODES.find(n => n.storageKey === key)
}

export const formatAnswerVerbose = (
  q: DiagnosisQuestion,
  value: AnswerValue,
  answers: Answers,
): string => {
  if (q.type === 'chips' && (typeof value === 'string' || typeof value === 'number')) {
    if (typeof value === 'number') return formatChipAnswer(q.options, value, q.exactInput?.unit)
    const opt = q.options.find(o => o.value === value)
    if (opt) return opt.sublabel ? `${opt.label} (${opt.sublabel})` : opt.label
  }
  if (q.type === 'multiChips' && Array.isArray(value)) {
    return value.map(v => q.options.find(o => o.value === v)?.label ?? String(v)).join(', ')
  }
  if (q.type === 'grid' && Array.isArray(value)) {
    const rows = getGridRows(q, answers)
    return rows
      .map((row, i) => {
        const cellValue = value[i]
        if (cellValue === null || cellValue === undefined) return `${row.label}: —`
        if (q.cell.kind === 'chips') {
          return `${row.label}: ${formatChipAnswer(q.cell.options, cellValue, q.cell.exactInput?.unit)}`
        }
        return `${row.label}: ${cellValue}${q.cell.exactInput.unit ? ` ${q.cell.exactInput.unit}` : ''}`
      })
      .join(' · ')
  }
  return formatAnswer(q, value)
}
