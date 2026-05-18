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

export type DiagnosisCategoryId = 'base' | 'debt' | 'stability' | 'investment' | 'protection'

export type DiagnosisCategory = {
  id: DiagnosisCategoryId
  label: string
  shortLabel: string
  color: 'primary' | 'warning' | 'info' | 'success' | 'secondary'
}

export const CATEGORIES: Record<DiagnosisCategoryId, DiagnosisCategory> = {
  base: {id: 'base', label: 'Base · Salario y gastos', shortLabel: 'Base', color: 'primary'},
  debt: {id: 'debt', label: 'Deudas', shortLabel: 'Deudas', color: 'warning'},
  stability: {id: 'stability', label: 'Estabilidad', shortLabel: 'Estabilidad', color: 'info'},
  protection: {id: 'protection', label: 'Protección', shortLabel: 'Protección', color: 'secondary'},
  investment: {id: 'investment', label: 'Inversiones', shortLabel: 'Inversiones', color: 'success'},
}

export const CATEGORY_ORDER: DiagnosisCategoryId[] = [
  'base',
  'debt',
  'stability',
  'protection',
  'investment',
]

// ---------- Dependencias ----------

export type DependencyClause = {
  storageKey: string
  equals?: ScalarAnswer
  in?: readonly ScalarAnswer[]
  greaterThan?: number
  nonEmpty?: boolean
  /**
   * Valores que se ignoran al evaluar `nonEmpty` sobre un arreglo
   * (típicamente multiChips). Sirve para opciones tipo "Ninguno" cuyo
   * valor está presente en el array pero semánticamente significa
   * "ninguna opción aplica". Ej: `nonEmpty: true, nonEmptyExcept: ['none']`
   * matchea sólo si hay al menos una opción seleccionada que no sea
   * `'none'`.
   */
  nonEmptyExcept?: readonly ScalarAnswer[]
}

const matchesClause = (clause: DependencyClause, value: AnswerValue | undefined): boolean => {
  if (value === undefined) return false
  if (clause.nonEmpty) {
    if (!Array.isArray(value)) return false
    const ignored = clause.nonEmptyExcept
    return value.some(v => {
      if (v === null || v === undefined) return false
      if (ignored && ignored.includes(v as ScalarAnswer)) return false
      return true
    })
  }
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
  /** Tasa de usura vigente Colombia (28,17% EA mayo 2026) como ancla. */
  | 'usuryRate'
  /** Regla 100/110/120 menos la edad como heurística de % en RV. */
  | 'ageBasedRiskAllocation'
  /** Meta FIRE = gastos × 25 (regla del 4%) renderizada en el Summary. */
  | 'fireGoal'

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
  /**
   * Multiplicadores del SMM que se renderizan como pills clickeables
   * arriba del input. Cada pill setea el valor exacto correspondiente
   * (`multiplicador × SMM`) en moneda local. Sirve para reducir
   * fricción en campos de dinero. No usar para edades, conteos u
   * otros valores no monetarios.
   */
  suggestionsSmm?: readonly number[]
  /**
   * Si `true`, el input se renderiza como currency: muestra el valor
   * con separador de miles y símbolo de la moneda local del país
   * detectado. La currency concreta la resuelve el render contra
   * `minimumWage.currency`. Sólo encender en campos de dinero (montos,
   * ingresos, deudas); no usar para porcentajes, meses, ni tasas.
   */
  isMoney?: boolean
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
  /**
   * Sólo aplica a `multiChips`. Si está marcada, esta opción es mutuamente
   * exclusiva con las demás: al seleccionarla se vacían las otras, y al
   * seleccionar otra opción se quita ésta. Pensada para opciones tipo
   * "Ninguno" / "No aplica" en inventarios opcionales.
   */
  clearOthers?: boolean
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
    hint: 'En múltiplos del salario mínimo de tu país, o ingresa el valor exacto.',
    glossaryTerms: ['smm'],
    sidebarWidgets: ['minimumWage'],
    derivation: {kind: 'multiplyMinimumWage', inputs: []},
    tips: [
      'Un valor exacto te dará un diagnóstico más fino que la banda. La banda sirve si no recuerdas la cifra exacta.',
    ],
    options: [
      {value: 'lt1', label: 'Menos de 1 SMM', bracket: {max: 1}, score: 30},
      {value: '1to2', label: '1 a 2 SMM', bracket: {min: 1, max: 2}, score: 50},
      {value: '2to4', label: '2 a 4 SMM', bracket: {min: 2, max: 4}, score: 70},
      {value: '4to8', label: '4 a 8 SMM', bracket: {min: 4, max: 8}, score: 90},
      {value: 'gt8', label: 'Más de 8 SMM', bracket: {min: 8}, score: 100},
    ],
    exactInput: {min: 0, step: 1000, placeholder: 'Valor exacto', isMoney: true},
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
        tip: 'Tienes margen real para construir fondo de emergencia y destinar a inversión sin recortar calidad de vida.',
      },
      {
        id: 'incomeHigh',
        when: {kind: 'incomeAboveSmmTimes', multiplier: 8},
        severity: 'info',
        diagnostic: 'Tu ingreso está claramente por encima del promedio.',
        tip: 'Asegúrate de que la mayor parte esté trabajando para ti: revisa diversificación y rendimiento de tus inversiones. Un ingreso alto sin inversión es ahorro estancado.',
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
    storageKey: 'hasDependents',
    title: 'Dependientes económicos',
    description:
      'Número de personas que dependen económicamente del usuario (hijos, pareja sin ingreso, padres, hermanos). Es información de contexto: condiciona el tamaño recomendado del fondo de emergencia, la necesidad de seguro de vida, y los gates de la sección Protección.',
    category: 'base',
    type: 'number',
    prompt: '¿Cuántas personas dependen económicamente de ti?',
    hint: 'Cuenta hijos, pareja sin ingresos, padres u otros familiares que cubrís económicamente.',
    min: 0,
    max: 10,
    step: 1,
    defaultValue: 0,
    unit: 'personas',
  },
  {
    storageKey: 'formalEmployment',
    title: 'Tipo de empleo',
    description:
      'Si el usuario es empleado formal, independiente/freelance, mixto, o sin ingresos formales. Es contexto que gatea preguntas posteriores (ARL para independientes, IBC, declaración tributaria) y ajusta recomendaciones de fondo de emergencia (independiente → más meses).',
    category: 'base',
    type: 'chips',
    prompt: '¿Cómo es tu situación laboral actual?',
    hint: 'Tu fuente principal de ingreso — independiente significa que facturás o vendés por tu cuenta.',
    options: [
      {
        value: 'formal',
        label: 'Empleado formal',
        sublabel: 'Contrato laboral, nómina, aportes vía empleador',
        score: 100,
      },
      {
        value: 'mixed',
        label: 'Mixto',
        sublabel: 'Empleo formal + freelance / negocio',
        score: 90,
      },
      {
        value: 'independent',
        label: 'Independiente',
        sublabel: 'Honorarios, freelance, negocio propio',
        score: 80,
      },
      {
        value: 'unemployed',
        label: 'Sin ingreso formal',
        sublabel: 'Estudiante, busca empleo, en transición',
        score: 30,
      },
    ],
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
    hint: 'Solo lo que pagas todos los meses: comida, vivienda, transporte, servicios, salud. Los gastos anuales (impuestos, matrículas, seguros) se preguntan justo después.',
    derivation: {kind: 'shareOfMonthlyIncome', inputs: ['incomeBand']},
    min: 0,
    max: 100,
    step: 1,
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
        tip: 'Probablemente tengas apoyos externos (vivienda familiar, subsidios) o no estés contando todo. Revisa si tu cifra incluye realmente comida, vivienda, transporte y servicios.',
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
        tip: 'Empieza por reducir o renegociar el rubro más grande (vivienda, transporte, servicios) o por aumentar ingresos. Con ese margen tan apretado, cualquier imprevisto se vuelve crisis.',
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
    storageKey: 'obligatoryAnnualItems',
    title: 'Tipos de gastos anuales obligatorios',
    description:
      'Lista de rubros que el usuario tiene como gasto obligatorio anual o esporádico, separados del mes a mes. Cada item seleccionado genera una fila en `obligatoryAnnualAmounts` para capturar el monto. Sirve para que el usuario visualice estos gastos sin necesidad de prorratearlos mentalmente en el slider mensual.',
    category: 'base',
    type: 'multiChips',
    prompt: '¿Qué gastos obligatorios pagas en el año (fuera del mes a mes)?',
    hint: 'Marca los que apliquen. Son los gastos que no llegan todos los meses pero que sí necesitas prever.',
    options: [
      {
        value: 'taxes',
        label: 'Impuestos',
        sublabel: 'Predial, vehicular, renta, IVA anual',
        score: 0,
      },
      {
        value: 'insurance',
        label: 'Seguros',
        sublabel: 'Salud, auto, casa, vida',
        score: 0,
      },
      {
        value: 'tuition',
        label: 'Matrículas',
        sublabel: 'Colegio, universidad, posgrado',
        score: 0,
      },
      {
        value: 'maintenance',
        label: 'Mantenimientos',
        sublabel: 'Auto, casa, electrodomésticos',
        score: 0,
      },
      {
        value: 'other',
        label: 'Otros',
        sublabel: 'Trámites, certificaciones, licencias',
        score: 0,
      },
      {
        value: 'none',
        label: 'Ninguno',
        sublabel: 'No tengo gastos anuales obligatorios',
        score: 0,
        clearOthers: true,
      },
    ],
  },
  {
    storageKey: 'obligatoryAnnualAmounts',
    title: 'Monto anual por rubro obligatorio',
    description:
      'Monto que el usuario paga al año en cada rubro obligatorio anual seleccionado. Es información complementaria al slider de `obligatoryPct` (que mide solo el gasto mensual recurrente). No entra al scoring; sirve para que el usuario tenga visibilidad del total real y para futuras derivaciones de gasto efectivo.',
    category: 'base',
    type: 'grid',
    prompt: '¿Cuánto pagas en el año por cada rubro?',
    hint: 'Una estimación está bien. Si no sabes con exactitud, suma lo que recuerdes de los últimos 12 meses.',
    dependsOn: [
      {storageKey: 'obligatoryAnnualItems', nonEmpty: true, nonEmptyExcept: ['none']},
    ],
    rowSource: {kind: 'multiSelectLabels', storageKey: 'obligatoryAnnualItems'},
    cell: {
      kind: 'number',
      exactInput: {
        min: 0,
        step: 10000,
        placeholder: 'Monto anual',
        suggestionsSmm: [0.5, 1, 2, 5, 10],
        isMoney: true,
      },
    },
  },
  {
    storageKey: 'discretionaryPct',
    title: 'Gastos discrecionales',
    description:
      'Porcentaje del ingreso que se va en gastos no esenciales — salidas, hobbies, ropa, comer fuera, viajes — y gastos anuales prorrateados como vacaciones, regalos y suscripciones. Junto con obligatoryPct define cuánto queda libre para ahorro e inversión.',
    category: 'base',
    type: 'slider',
    prompt: '¿Qué porcentaje de tu ingreso se va en gastos discrecionales?',
    hint: 'Solo lo que pagas todos los meses: salidas, hobbies, ropa, comer fuera, suscripciones mensuales. Los gastos anuales (vacaciones, regalos, viajes) se preguntan justo después.',
    derivation: {kind: 'shareOfMonthlyIncome', inputs: ['incomeBand']},
    min: 0,
    max: 100,
    step: 1,
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
        tip: 'No se trata de cohibirte, sino de saber adónde va. Los "gastos hormiga" se acumulan: en Colombia los top 3 son snacks (~26%), planes de diversión (14%) y cigarrillos (7%) del total discrecional. Anota un mes lo que gastas en lo no esencial; suele sorprender. Ese margen es el que permite invertir o construir fondo de emergencia.',
      },
      {
        id: 'discretionaryHoursOfLife',
        when: {kind: 'numberAbove', key: 'discretionaryPct', threshold: 45},
        severity: 'info',
        diagnostic: 'Prueba medir tus gastos discrecionales en horas de tu vida.',
        tip: 'Divide tu ingreso mensual por tus horas trabajadas: ese es tu ingreso por hora. Cuando dudes con un gasto grande, divídelo por esa cifra — te dice cuántas horas de tu vida cuesta. Es un filtro más honesto que pensar en dinero.',
      },
      {
        id: 'lifestyleInflation',
        when: {
          kind: 'all',
          of: [
            {kind: 'incomeAboveSmmTimes', multiplier: 2},
            {kind: 'numberAbove', key: 'discretionaryPct', threshold: 35},
          ],
        },
        severity: 'info',
        diagnostic: 'Tu ingreso está por encima del piso pero tu margen es chico.',
        tip: 'Es el patrón clásico de lifestyle inflation: cada subida de ingreso se traduce en subida proporcional de gasto, no de ahorro. Tu situación se va a sentir igual con $5M o con $10M si no fijas un porcentaje de ahorro automático que crezca contigo. Una regla simple: cuando sube el ingreso, ahorra al menos el 50% del aumento antes de incorporarlo al gasto.',
      },
    ],
  },
  {
    storageKey: 'discretionaryAnnualItems',
    title: 'Tipos de gastos anuales discrecionales',
    description:
      'Lista de rubros no esenciales que el usuario gasta de forma anual o esporádica grande, separados del mes a mes. Cada item seleccionado genera una fila en `discretionaryAnnualAmounts`. Captura el gasto discrecional que pasa fuera del slider mensual (vacaciones, regalos, viajes).',
    category: 'base',
    type: 'multiChips',
    prompt: '¿Qué gastos discrecionales pagas en el año (fuera del mes a mes)?',
    hint: 'Marca los que apliquen. Pagos no esenciales que se concentran en momentos específicos del año.',
    options: [
      {
        value: 'vacation',
        label: 'Vacaciones',
        sublabel: 'Hoteles, vuelos, paseos cortos',
        score: 0,
      },
      {
        value: 'gifts',
        label: 'Regalos',
        sublabel: 'Cumpleaños, navidad, ocasiones especiales',
        score: 0,
      },
      {
        value: 'subscriptions',
        label: 'Suscripciones anuales',
        sublabel: 'Streaming, gimnasio, software, revistas',
        score: 0,
      },
      {
        value: 'bigTrips',
        label: 'Viajes grandes',
        sublabel: 'Viaje internacional, luna de miel, retiros',
        score: 0,
      },
      {
        value: 'events',
        label: 'Eventos',
        sublabel: 'Bodas, conciertos, fiestas, retiros',
        score: 0,
      },
      {
        value: 'other',
        label: 'Otros',
        sublabel: 'Compras grandes esporádicas',
        score: 0,
      },
      {
        value: 'none',
        label: 'Ninguno',
        sublabel: 'No tengo gastos anuales discrecionales',
        score: 0,
        clearOthers: true,
      },
    ],
  },
  {
    storageKey: 'discretionaryAnnualAmounts',
    title: 'Monto anual por rubro discrecional',
    description:
      'Monto que el usuario gasta al año en cada rubro discrecional anual seleccionado. Complementa al slider de `discretionaryPct` (que mide solo el gasto mensual recurrente). No entra al scoring; sirve para que el usuario tenga visibilidad del total real y para futuras derivaciones de gasto efectivo.',
    category: 'base',
    type: 'grid',
    prompt: '¿Cuánto gastas en el año por cada rubro?',
    hint: 'Una estimación está bien. Si no sabes con exactitud, suma lo que recuerdes de los últimos 12 meses.',
    dependsOn: [
      {storageKey: 'discretionaryAnnualItems', nonEmpty: true, nonEmptyExcept: ['none']},
    ],
    rowSource: {kind: 'multiSelectLabels', storageKey: 'discretionaryAnnualItems'},
    cell: {
      kind: 'number',
      exactInput: {
        min: 0,
        step: 10000,
        placeholder: 'Monto anual',
        suggestionsSmm: [0.5, 1, 2, 5, 10],
        isMoney: true,
      },
    },
  },
  {
    storageKey: 'hasBudgetSystem',
    title: 'Sistema de cubetas',
    description:
      'Cómo el usuario distribuye su ingreso entrante: en cabeza, en cuentas separadas, o automatizado por el banco. El "sistema de cubetas" predice mejor el cumplimiento del ahorro que el monto ahorrado.',
    category: 'base',
    type: 'chips',
    prompt: '¿Tienes un sistema para repartir tu ingreso cuando entra?',
    hint: 'Hablamos de cómo decides cuánto va a obligatorios, ahorro, inversión y gusto — no del monto, sino del método.',
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
        diagnostic: 'No tienes un sistema para repartir tu ingreso.',
        tip: 'En Colombia, 55% de quienes tienen productos financieros no presupuestan; el resultado: lo que sobra al final del mes nunca alcanza. Regla más simple: cuando entra el ingreso, mueve primero un porcentaje fijo a ahorro/inversión, y vive con lo que queda. Mental, en cuentas separadas o automatizado — cualquier sistema le gana a no tener.',
      },
      {
        id: 'automatedBudget',
        when: {kind: 'equals', key: 'hasBudgetSystem', value: 'automated'},
        severity: 'positive',
        diagnostic: 'Tu reparto está automatizado.',
        tip: 'Es la versión más sólida del sistema: el ahorro no depende de tu disciplina mensual. Verifica una vez al año que los porcentajes sigan haciendo sentido para tu ingreso y tus metas.',
      },
    ],
  },
  {
    storageKey: 'usesAutomation',
    title: 'Automatización del ahorro',
    description:
      'Si el ahorro o la inversión del usuario corre por débito automático o transferencia programada. La automatización es el hábito más correlacionado con la construcción de patrimonio porque saca a la fuerza de voluntad de la ecuación: lo que se debita antes de gastar, se ahorra; lo que se ahorra "al final del mes", rara vez sobra.',
    category: 'base',
    type: 'toggle',
    prompt: '¿Tu ahorro o inversión sale por débito automático?',
    hint: 'Por ejemplo: una transferencia programada el día de tu pago, o un débito recurrente que mueve plata a tu cuenta de ahorro o fondo cada mes.',
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 40},
    insights: [
      {
        id: 'automationHabit',
        when: {kind: 'equals', key: 'usesAutomation', value: true},
        severity: 'positive',
        diagnostic: 'Tu ahorro está automatizado.',
        tip: 'Es la práctica que más amplifica el resultado a largo plazo. Mientras tus metas mensuales sean realistas, dejar que el sistema corra solo es suficiente — revisa una vez al año los porcentajes.',
      },
      {
        id: 'noAutomation',
        when: {kind: 'equals', key: 'usesAutomation', value: false},
        severity: 'info',
        diagnostic: 'Tu ahorro depende de decisión manual cada mes.',
        tip: 'Automatizar el débito el día que entra tu ingreso es una de las palancas más altas: el ahorro deja de competir con todos los gastos del mes. Empieza con un porcentaje chico que no duela y súbelo cada 3-6 meses.',
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
        tip: 'Revisa tus deudas activas, paga puntual aunque sean montos chicos, y evita pedir múltiples créditos en poco tiempo. Adicional: 10-15% de los reportes a centrales (Datacrédito / TransUnion) tienen errores. La consulta gratuita mensual te deja detectar y disputar bajadas injustas. Subir un score toma meses, no días.',
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
        tip: 'Si tu fondo de emergencia ya cubre 3 meses o más, considera dirigir el excedente del ingreso a inversiones diversificadas en vez de dejarlo quieto.',
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
    hint: 'Suma de todas las cuotas mensuales (tarjetas, créditos, hipoteca, vehículo). Si una deuda es a meses sin intereses, cuenta igual la cuota.',
    dependsOn: [{storageKey: 'hasDebt', equals: true}],
    derivation: {kind: 'shareOfMonthlyIncome', inputs: ['incomeBand']},
    min: 0,
    max: 100,
    step: 1,
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
        id: 'debtPaymentPressureModerate',
        when: {
          kind: 'all',
          of: [
            {kind: 'numberAbove', key: 'debtMonthlyPct', threshold: 30},
            {kind: 'numberAtMost', key: 'debtMonthlyPct', threshold: 40},
          ],
        },
        severity: 'info',
        diagnostic: 'Tu cuota de deuda está en zona alta (30-40% del ingreso).',
        tip: 'Todavía no es zona de peligro pero conviene parar de pedir más. Considera abonar al capital de la deuda de peor tasa cada mes que puedas — bajar este porcentaje libera espacio para fondo de emergencia e inversión.',
      },
      {
        id: 'debtPaymentPressure',
        when: {
          kind: 'all',
          of: [
            {kind: 'numberAbove', key: 'debtMonthlyPct', threshold: 40},
            {kind: 'numberAtMost', key: 'debtMonthlyPct', threshold: 50},
          ],
        },
        severity: 'warning',
        diagnostic: 'Más del 40% de tu ingreso se va en cuotas de deuda — zona peligrosa.',
        tip: 'Bancos consideran zona peligrosa pasado el 40% (Decreto 0583/2025 incluso limita la cuota hipotecaria a ese tope para hogares). Compra de cartera puede bajar la tasa: en Colombia mayo 2026, Banco Agrario ofrece desde 10,30% EA, Serfinanza 12,55%. Renegociar plazos o consolidar son las palancas naturales aquí.',
      },
      {
        id: 'debtPaymentPressureSevere',
        when: {kind: 'numberAbove', key: 'debtMonthlyPct', threshold: 50},
        severity: 'critical',
        diagnostic: 'Más del 50% de tu ingreso va a deuda — sobreendeudamiento.',
        tip: 'A este nivel, cualquier imprevisto desencadena mora. Hablar con los bancos para reestructurar antes de caer en default es lo más urgente — los bancos prefieren reestructurar a perder la cartera. Una asesoría financiera profesional (Asobancaria tiene canales gratuitos) puede armar un plan de salida.',
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
    hint: 'Si tienes muchas deudas similares, puedes agruparlas (p. ej. todas las tarjetas como una sola).',
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
        tip: 'Considera consolidar las más caras en una sola con tasa menor para simplificar pagos y reducir intereses totales. En Colombia, compra de cartera con Banco Agrario arranca en 10,30% EA, muy por debajo de las tasas típicas de tarjetas.',
      },
      {
        id: 'consolidationCandidate',
        when: {
          kind: 'all',
          of: [
            {kind: 'numberAtLeast', key: 'debtCount', threshold: 3},
            {kind: 'gridAnyIn', key: 'debtRates', values: ['high', 'veryHigh']},
          ],
        },
        severity: 'info',
        diagnostic: 'Tienes varias deudas y al menos una con tasa alta — candidato a compra de cartera.',
        tip: 'Cuando hay 3+ deudas activas y alguna pasa el 25% EA, suele convenir una compra de cartera. Cifras Colombia mayo 2026: Banco Agrario 10,30%, Serfinanza 12,55%, Coopcentral 14% EA. Punto crítico: si extiendes el plazo, los intereses totales pueden subir aunque la cuota mensual baje — la jugada solo funciona si en paralelo recortas gasto.',
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
    hint: 'Comparada con el salario mínimo del país, o ingresa el monto exacto.',
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
        {
          value: 'gt200',
          label: 'Más de 200 SMM',
          sublabel: 'Vivienda u otra deuda muy grande',
          bracket: {min: 200},
          score: 5,
        },
      ],
      exactInput: {min: 0, step: 10000, placeholder: 'Monto exacto', isMoney: true},
    },
    insights: [
      {
        id: 'oneVeryLargeDebt',
        when: {kind: 'gridAnyIn', key: 'debtAmounts', values: ['50to200', 'gt200']},
        severity: 'warning',
        diagnostic: 'Tienes al menos una deuda muy grande.',
        tip: 'Si es vivienda u otra deuda buena, el riesgo está acotado a la cuota mensual y la tasa. Si es consumo, el plan tiene que ser bajarla con prioridad — son las deudas que más asfixian.',
      },
      {
        id: 'manyMediumDebts',
        when: {
          kind: 'gridCountInAtLeast',
          key: 'debtAmounts',
          values: ['3to10', '10to50'],
          count: 3,
        },
        severity: 'warning',
        diagnostic: 'Acumulas varias deudas de tamaño medio.',
        tip: 'Aunque cada una sea manejable por separado, el problema suele ser la suma de cuotas. Considera compra de cartera para consolidar y bajar la presión mensual.',
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
    hint: 'Aproximadamente. Si no estás seguro, escoge una banda o ingresa el valor exacto.',
    glossaryTerms: ['ea', 'tasaUsura', 'nmvVsEa'],
    sidebarWidgets: ['usuryRate'],
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
        tip: 'En Colombia mayo 2026 la tasa de usura (tope legal) está en 28,17% EA — cualquier cosa cerca de ese techo conviene refinanciar. Esa es la primera que conviene atacar: cualquier ahorro o inversión que rinda menos que esa tasa, en la práctica, te está restando dinero. Compra de cartera (Banco Agrario desde 10,30% EA) suele rebajar varios puntos.',
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
        tip: 'No es la deuda en sí lo que daña — es la que solo financia consumo. Revisa si las tasas son razonables comparadas con el rendimiento que te dan.',
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
    storageKey: 'creditCardPaymentBehavior',
    title: 'Pago de tarjetas de crédito',
    description:
      'Comportamiento del usuario con la cuota de su tarjeta de crédito. Pagar solo el mínimo destina casi todo a intereses y deja el capital prácticamente intacto: una deuda de $1M COP al 28% EA pagando mínimo tarda 5+ años y termina costando más del doble. Es el predictor más fuerte de la espiral revolvente.',
    category: 'debt',
    type: 'chips',
    prompt: '¿Cómo pagas la cuota de tu tarjeta de crédito?',
    hint: 'Tarjetas de crédito específicamente; si no tienes, elige "No tengo tarjeta".',
    glossaryTerms: ['tasaUsura'],
    dependsOn: [{storageKey: 'hasDebt', equals: true}],
    options: [
      {
        value: 'payInFull',
        label: 'Pago el total',
        sublabel: 'Cancelo el saldo del corte cada mes, no pago intereses',
        score: 100,
      },
      {
        value: 'payAboveMinimum',
        label: 'Más del mínimo',
        sublabel: 'Pago una parte importante pero queda saldo rotando',
        score: 60,
      },
      {
        value: 'payMinimum',
        label: 'Solo el mínimo',
        sublabel: 'Pago la cuota mínima que pide el banco',
        score: 10,
      },
      {
        value: 'pastDue',
        label: 'En mora',
        sublabel: 'No estoy al día con la cuota',
        score: 0,
      },
      {
        value: 'noCard',
        label: 'No tengo tarjeta',
        sublabel: 'No uso tarjeta de crédito',
        score: 90,
      },
    ],
    insights: [
      {
        id: 'minimumPaymentTrap',
        when: {kind: 'equals', key: 'creditCardPaymentBehavior', value: 'payMinimum'},
        severity: 'critical',
        diagnostic: 'Estás pagando solo el mínimo de tu tarjeta.',
        tip: 'Una deuda de $1M al 28% EA pagando mínimo tarda 5+ años y termina costando más del doble. Esa cuota destina casi todo a intereses, casi nada a capital. Sube el pago aunque sea $100K por mes — cada peso que pasa el mínimo va directo al saldo.',
      },
      {
        id: 'creditCardInDefault',
        when: {kind: 'equals', key: 'creditCardPaymentBehavior', value: 'pastDue'},
        severity: 'critical',
        diagnostic: 'Tu tarjeta está en mora.',
        tip: 'Antes de la cobranza dura, hablar con el banco para reestructurar o consolidar. La mora reporta a Datacrédito y arruina el score por años. Si el saldo es alto, considera una compra de cartera (Banco Agrario ofrece desde 10,30% EA en mayo 2026).',
      },
      {
        id: 'creditCardPayInFull',
        when: {kind: 'equals', key: 'creditCardPaymentBehavior', value: 'payInFull'},
        severity: 'positive',
        diagnostic: 'Pagas el total de tu tarjeta cada mes.',
        tip: 'Es la única forma de usar tarjeta sin que te cueste dinero. Mientras mantengas el hábito, la TC es una herramienta neutra que te suma puntos al score, te da beneficios y arma historial.',
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
    hint: 'Aproximadamente, o ingresa la cantidad exacta de meses.',
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
        tip: 'Empieza por una meta chica que sí puedas cumplir: 1 mes de gastos obligatorios en cuenta líquida. Las metas grandes que no se cumplen producen abandono; las chicas que se cumplen producen hábito. Cuando llegues a 1 mes, redefine el siguiente objetivo a 3 meses.',
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
    hint: 'Piénsalo como: si esta noche se me daña el auto y necesito el dinero, ¿cuándo lo tengo en mi mano?',
    dependsOn: [{storageKey: 'emergencyMonths', in: ['1to3', '3to6', '6to12', 'gt12']}],
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
        tip: 'El propósito del fondo es cubrir lo inesperado. Si tarda semanas o meses, la emergencia ya pasó. Una cuenta de ahorros o un fondo a la vista cumplen mejor ese rol; puedes mantener el resto a más plazo.',
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
        diagnostic: 'Tu horizonte laboral es corto y no tienes otra fuente en marcha.',
        tip: 'No es urgente, pero conviene empezar a pensarlo. Una segunda fuente toma años en madurar; si esperas a necesitarla ya es tarde.',
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
    prompt: '¿Con qué frecuencia sientes estrés financiero?',
    hint: 'Ansiedad cuando se acerca fin de mes, evitar abrir cuentas, dormir mal por dinero — esas señales.',
    options: [
      {value: 'none', label: 'Casi nunca', sublabel: 'El dinero no me quita el sueño', score: 100},
      {
        value: 'sometimes',
        label: 'A veces',
        sublabel: 'En meses puntuales o ante imprevistos',
        score: 70,
      },
      {value: 'frequent', label: 'Seguido', sublabel: 'Varias veces al mes', score: 30},
      {value: 'constant', label: 'Constante', sublabel: 'Lo cargo casi todos los días', score: 10},
    ],
    insights: [
      {
        id: 'chronicFinancialStress',
        when: {kind: 'in', key: 'financialStressLevel', values: ['frequent', 'constant']},
        severity: 'critical',
        diagnostic: 'Estás cargando estrés financiero sostenido.',
        tip: 'La presión financiera prolongada sube presión arterial, deteriora el sueño y empeora decisiones — ~45% de adultos pierden sueño por estrés financiero y mal sueño correlaciona con compras compulsivas y decisiones impulsivas (la cadena se retroalimenta). Arreglar el cash-flow no es solo financiero, también es salud — empieza por el rubro más doloroso (deuda cara, gasto fijo grande) y atácalo aunque sea con un primer paso chico.',
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
    prompt: '¿Tienes una pareja con quien compartes decisiones económicas?',
    hint: 'Conviviendo o no, casados o no — lo que importa es si las decisiones económicas grandes las negocias con alguien más. Si no tienes pareja o las decisiones son solo tuyas, responde No.',
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
        sublabel: 'Cada uno con su dinero, sin coordinación',
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
        diagnostic: 'No hay un canal aceitado para hablar de dinero con tu pareja.',
        tip: 'La falta de conversación financiera es el predictor más fuerte de conflicto serio en una pareja, antes que el monto ahorrado. Prueba la conversación más simple: una vez al mes, 20 minutos, repasar lo que entró, lo que salió y un objetivo a 90 días.',
      },
    ],
  },
  {
    storageKey: 'coupleFinancialStructure',
    title: 'Estructura financiera de la pareja',
    description:
      'Cómo se reparten los gastos entre los dos: 50/50, proporcional al ingreso, pool conjunto, o separado. Con ingresos asimétricos, 50/50 suele generar resentimiento; estructuras híbridas (pool para compartidos + individual para autonomía) muestran menor caída de satisfacción en los primeros años (estudio Northwestern 2023).',
    category: 'stability',
    type: 'chips',
    prompt: '¿Cómo dividen los gastos en pareja?',
    dependsOn: [{storageKey: 'inRelationship', equals: true}],
    options: [
      {
        value: 'fifty',
        label: '50/50',
        sublabel: 'Cada uno aporta la mitad sin importar el ingreso',
        score: 50,
      },
      {
        value: 'proportional',
        label: 'Proporcional al ingreso',
        sublabel: 'Cada uno aporta el mismo % de su ingreso al pool',
        score: 90,
      },
      {
        value: 'pool',
        label: 'Pool conjunto',
        sublabel: 'Todo entra a una cuenta común, ambos retiran',
        score: 80,
      },
      {
        value: 'hybrid',
        label: 'Híbrido',
        sublabel: 'Conjunta para compartidos + individuales para autonomía',
        score: 100,
      },
      {
        value: 'separate',
        label: 'Totalmente separado',
        sublabel: 'Cada uno con su plata, sin gastos compartidos formales',
        score: 40,
      },
    ],
    insights: [
      {
        id: 'unequalSplit5050',
        when: {kind: 'equals', key: 'coupleFinancialStructure', value: 'fifty'},
        severity: 'info',
        diagnostic: 'Reparten los gastos 50/50.',
        tip: 'Es la estructura más simple pero la que más conflicto genera con ingresos asimétricos: el de menor ingreso queda con menos margen real. Si los ingresos son distintos, vale considerar pasar a proporcional o híbrida.',
      },
    ],
  },
  {
    storageKey: 'talksAboutMoneyWithPartner',
    title: 'Frecuencia de conversación sobre dinero',
    description:
      'Cuán seguido la pareja conversa sobre dinero. Predictor #1 de conflicto cuando es nulo. Estudios muestran que parejas que pelean por dinero tienen +49% de probabilidad de divorcio; las que conversan periódicamente sin conflicto reportan mayor satisfacción.',
    category: 'stability',
    type: 'chips',
    prompt: '¿Con qué frecuencia hablan de dinero?',
    dependsOn: [{storageKey: 'inRelationship', equals: true}],
    options: [
      {
        value: 'never',
        label: 'Casi nunca',
        sublabel: 'Cada uno con lo suyo; no es un tema',
        score: 20,
      },
      {
        value: 'only-crisis',
        label: 'Solo en crisis',
        sublabel: 'Cuando aparece un problema',
        score: 30,
      },
      {
        value: 'monthly',
        label: 'Cada mes',
        sublabel: 'Conversación rutinaria al cierre del mes',
        score: 90,
      },
      {
        value: 'on-income',
        label: 'Cada vez que entra ingreso',
        sublabel: 'Revisión activa con cada cobro',
        score: 100,
      },
    ],
    insights: [
      {
        id: 'silentMoneyCouple',
        when: {kind: 'in', key: 'talksAboutMoneyWithPartner', values: ['never', 'only-crisis']},
        severity: 'warning',
        diagnostic: 'No hay una conversación recurrente sobre dinero con tu pareja.',
        tip: 'Estudios muestran que las parejas que pelean por dinero tienen casi 50% más probabilidad de divorcio. Una conversación corta una vez al mes — entradas, salidas, una meta — desactiva ese ruido sin hacer del dinero un tema central.',
      },
    ],
  },
  // ---------- Sección: Protección ----------
  {
    storageKey: 'ownsHome',
    title: 'Situación de vivienda',
    description:
      'Cómo el usuario habita su vivienda. Habilita gates para deducciones (hipoteca), seguro de hogar, y ajusta el contexto de fondo de emergencia. Las opciones cubren los casos típicos LatAm: propia con hipoteca activa, propia paga, arrendada, familiar (vivir en casa de padres / sin pagar renta), y otra.',
    category: 'protection',
    type: 'chips',
    prompt: '¿Cómo es tu vivienda actual?',
    options: [
      {
        value: 'mortgaged',
        label: 'Propia con hipoteca',
        sublabel: 'Crédito hipotecario activo',
        score: 80,
      },
      {
        value: 'owned',
        label: 'Propia sin hipoteca',
        sublabel: 'Pagada completamente',
        score: 100,
      },
      {
        value: 'rented',
        label: 'Arrendada',
        sublabel: 'Pago renta mensual',
        score: 60,
      },
      {
        value: 'family',
        label: 'Familiar / sin pagar',
        sublabel: 'Vivo con familia, no pago vivienda',
        score: 50,
      },
      {
        value: 'other',
        label: 'Otra',
        sublabel: 'Arriendo informal, vivienda compartida, etc.',
        score: 40,
      },
    ],
  },
  {
    storageKey: 'hasARL',
    title: 'Cobertura de riesgos laborales (ARL)',
    description:
      'Si el usuario independiente tiene ARL activa. La ARL es seguro de riesgos laborales obligatorio para empleados formales (cubierto por el empleador) e independientes con contrato de prestación de servicios mayor a un mes. Sin ARL, un accidente de trabajo deja al independiente sin red.',
    category: 'protection',
    type: 'toggle',
    prompt: '¿Estás afiliado a una ARL?',
    hint: 'ARL = Administradora de Riesgos Laborales. Si eres empleado formal, generalmente la paga tu empleador. Si eres independiente, la tienes que activar tú.',
    glossaryTerms: ['arl'],
    dependsOn: [{storageKey: 'formalEmployment', in: ['independent', 'mixed']}],
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 20},
    insights: [
      {
        id: 'noARLIndependent',
        when: {
          kind: 'all',
          of: [
            {kind: 'equals', key: 'hasARL', value: false},
            {kind: 'in', key: 'formalEmployment', values: ['independent', 'mixed']},
          ],
        },
        severity: 'critical',
        diagnostic: 'Eres independiente y no estás afiliado a ARL.',
        tip: 'Un accidente de trabajo te deja completamente expuesto — gastos médicos altos sin cobertura, sin indemnización por incapacidad temporal. La tarifa está entre 0,5% y 7% del IBC según clase de riesgo y es deducible. Activarla cuesta poco y tapa un agujero grande.',
      },
    ],
  },
  {
    storageKey: 'hasLifeInsurance',
    title: 'Seguro de vida',
    description:
      'Si el usuario tiene seguro de vida con suma asegurada acorde a su situación. Solo tiene sentido cuando hay dependientes económicos o deudas grandes (hipoteca). Sin dependientes y sin deuda, es generalmente innecesario.',
    category: 'protection',
    type: 'toggle',
    prompt: '¿Tienes seguro de vida?',
    hint: 'No el seguro funerario chico, sino uno que cubra a quien depende económicamente de ti si falleces.',
    dependsOn: [{storageKey: 'hasDependents', greaterThan: 0}],
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 20},
    insights: [
      {
        id: 'noLifeInsuranceWithDependents',
        when: {
          kind: 'all',
          of: [
            {kind: 'equals', key: 'hasLifeInsurance', value: false},
            {kind: 'numberAtLeast', key: 'hasDependents', threshold: 1},
          ],
        },
        severity: 'critical',
        diagnostic: 'Tienes dependientes económicos y no tienes seguro de vida.',
        tip: 'Si faltas, los que dependen de ti quedan sin red. Una suma asegurada de 5 a 10 veces tu ingreso anual cubre el ajuste; pólizas a plazo (no whole-life) son baratas para edades jóvenes. Es de las inversiones de mejor relación costo/protección.',
      },
    ],
  },
  {
    storageKey: 'hasHealthCoverage',
    title: 'Cobertura de salud',
    description:
      'Qué nivel de cobertura de salud tiene el usuario. La EPS (Colombia) o equivalente regional es el piso obligatorio; planes complementarios y medicina prepagada amplían acceso a redes privadas y reducen tiempos. Esta pregunta reemplaza al anterior `hasHealthInsurance` (toggle) con más granularidad.',
    category: 'protection',
    type: 'chips',
    prompt: '¿Qué cobertura de salud tienes?',
    hint: 'En Colombia: EPS es el piso legal; complementario amplía red dentro de tu EPS; prepagada es 100% privada.',
    options: [
      {
        value: 'none',
        label: 'Sin cobertura',
        sublabel: 'No estoy afiliado a ningún sistema',
        score: 0,
      },
      {
        value: 'public',
        label: 'Solo público / EPS',
        sublabel: 'Lo mínimo legal',
        score: 60,
      },
      {
        value: 'complementary',
        label: 'Plan complementario',
        sublabel: 'EPS + amplía red de la misma EPS',
        score: 85,
      },
      {
        value: 'prepaid',
        label: 'Medicina prepagada',
        sublabel: '100% privada, sin pasar por médico general',
        score: 100,
      },
    ],
    insights: [
      {
        id: 'noHealthCoverage',
        when: {kind: 'equals', key: 'hasHealthCoverage', value: 'none'},
        severity: 'critical',
        diagnostic: 'No tienes ninguna cobertura de salud.',
        tip: 'Es lo primero que conviene resolver, antes que cualquier otra movida financiera. Un evento de salud sin cobertura puede arruinar años de progreso. En Colombia la EPS pública o subsidiada cubre el piso legal; en otros países, IMSS / Fonasa / EsSalud equivalentes.',
      },
      {
        id: 'minimumHealthCoverageOlder',
        when: {
          kind: 'all',
          of: [
            {kind: 'equals', key: 'hasHealthCoverage', value: 'public'},
            {kind: 'numberAtLeast', key: 'age', threshold: 40},
          ],
        },
        severity: 'warning',
        diagnostic: 'Solo tienes EPS y ya pasaste los 40.',
        tip: 'La probabilidad de eventos serios sube con la edad. Un plan complementario suma red sin un gasto enorme — buena relación costo/beneficio para esta etapa de vida.',
      },
    ],
  },
  {
    storageKey: 'hasHomeInsurance',
    title: 'Seguro de hogar',
    description:
      'Si el usuario tiene seguro de hogar (incendio, terremoto, contenido, hurto). Es obligatorio si hay hipoteca activa (el banco lo exige). Para propiedad sin hipoteca es voluntario pero altamente recomendado en zonas sísmicas (Colombia: Cafetera, Nariño, Bogotá).',
    category: 'protection',
    type: 'toggle',
    prompt: '¿Tu vivienda tiene seguro?',
    hint: 'Cubre incendio, terremoto, daños por agua, hurto. En Colombia es zona sísmica activa — el seguro tiene mejor relación costo/protección que en otros países.',
    dependsOn: [{storageKey: 'ownsHome', in: ['mortgaged', 'owned']}],
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 30},
    insights: [
      {
        id: 'noHomeInsuranceOwned',
        when: {
          kind: 'all',
          of: [
            {kind: 'equals', key: 'hasHomeInsurance', value: false},
            {kind: 'equals', key: 'ownsHome', value: 'owned'},
          ],
        },
        severity: 'warning',
        diagnostic: 'Tu vivienda es propia y no tiene seguro.',
        tip: 'Un siniestro grave (incendio, terremoto) puede destruir años de patrimonio. Asegurar al 100% del valor de reposición — el infraseguro hace que la indemnización se pague a prorrata. Costo típico anual: 0,2-0,5% del valor del inmueble.',
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
    prompt: '¿Hace cuánto inviertes?',
    hint: 'Desde la primera inversión real que sigue activa o de la que aprendiste algo. Cuentas de ahorro genéricas no cuentan.',
    options: [
      {value: 'never', label: 'Nunca invertí', score: 10},
      {value: 'lt1', label: 'Menos de 1 año', sublabel: 'Estoy arrancando', score: 40},
      {value: '1to3', label: '1 a 3 años', sublabel: 'Empezando a ver resultados', score: 70},
      {
        value: '3to10',
        label: '3 a 10 años',
        sublabel: 'Ya pasé al menos un ciclo de mercado',
        score: 90,
      },
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
        diagnostic: 'Eres joven y todavía no estás capturando interés compuesto.',
        tip: 'Cada año invertido a los 20 vale más que diez años invertidos a los 40, gracias al interés compuesto. Atajo mental: la "regla del 72" — años para duplicar capital = 72 / tasa%. Al 10% se duplica en 7,2 años; empezar a los 25 te da 5+ duplicaciones antes de los 65. No hace falta saber mucho: un fondo indexado básico ya activa el reloj.',
      },
      {
        // Vivía en `invests`; lo movemos acá porque `invests` se omite cuando
        // el usuario ya dijo "Nunca invertí" en `yearsInvesting`, y entonces
        // sus insights nunca se evaluarían. Acá disparamos tanto para
        // `yearsInvesting = never` como para el caso clásico `invests = false`.
        id: 'notInvestingButReady',
        when: {
          kind: 'all',
          of: [
            {
              kind: 'any',
              of: [
                {kind: 'equals', key: 'yearsInvesting', value: 'never'},
                {kind: 'equals', key: 'invests', value: false},
              ],
            },
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
        tip: 'Con un fondo de emergencia razonable y sin deuda grande, tienes margen para empezar con instrumentos seguros (CDT, fondos de inversión) e ir escalando a medida que ganes confianza.',
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
        tip: 'Tu mejor activo eres tú mismo. Cualquier mejora en tu trabajo se compone — sube el ingreso, abre puertas, da margen para todo lo demás. No tiene por qué ser caro: empezar con contenido gratuito ya cuenta.',
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
        tip: 'No es necesario gastar dinero — un par de podcasts o libros gratuitos te dan lo básico. Lo importante es saber qué estás haciendo antes de mover dinero, no aprenderlo cuando ya cometiste el error.',
      },
    ],
  },
  {
    storageKey: 'invests',
    title: 'Hábito de inversión',
    description:
      'Puerta de entrada al bloque de inversiones financieras. Si el usuario no invierte, las preguntas siguientes que dependen de este gate se omiten — pero las de educación (antes de este nodo) ya se preguntaron, porque la inversión en uno mismo aplica con o sin inversión financiera. Se omite si `yearsInvesting = never` (la respuesta "Nunca invertí" ya implica que no invierte).',
    category: 'investment',
    type: 'toggle',
    prompt: '¿Inviertes parte de tu ingreso?',
    // Se omite cuando el usuario ya dijo "Nunca invertí" en yearsInvesting:
    // sería redundante. Las preguntas posteriores siguen gateadas por
    // `invests = true`, y como `invests` queda undefined en ese flujo,
    // todas se saltan correctamente.
    dependsOn: [{storageKey: 'yearsInvesting', in: ['lt1', '1to3', '3to10', 'gt10']}],
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 30},
    insights: [
      {
        id: 'investingBeforeEmergency',
        when: {
          kind: 'all',
          of: [
            {kind: 'equals', key: 'invests', value: true},
            {kind: 'in', key: 'emergencyMonths', values: ['none', 'lt1']},
          ],
        },
        severity: 'warning',
        diagnostic: 'Estás invirtiendo antes de tener fondo de emergencia.',
        tip: 'Si surge un imprevisto, vas a tener que vender la inversión, probablemente en mal momento (cuando todo cae al mismo tiempo). Antes de aumentar exposición de inversión, completa al menos 1-3 meses de gastos en cuenta líquida — ese es el costo de oportunidad real de invertir sin colchón.',
      },
      {
        id: 'investingActively',
        when: {kind: 'equals', key: 'invests', value: true},
        severity: 'positive',
        diagnostic: 'Estás invirtiendo, lo cual indica un hábito financiero saludable.',
        tip: 'Asegúrate de que las tasas de tus deudas no superen el rendimiento de tus inversiones — si lo superan, pagar deuda es matemáticamente la mejor inversión.',
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
    prompt: '¿Con qué frecuencia compras o vendes tus inversiones?',
    hint: 'No cuenta el aporte mensual a un fondo; cuenta cuándo decides entrar o salir de una posición.',
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
        tip: 'La evidencia es consistente y pesada: estudios sobre day traders muestran que >80% pierde dinero en su primer año, y solo ~2% es rentable de forma sostenida. En promedio, quien tradea seguido rinde menos que quien compra y mantiene, después de comisiones e impuestos. Si tu rentabilidad neta no le está ganando a un fondo indexado, conviene reducir la frecuencia y dejar que el tiempo trabaje. (Y si te enteraste de un activo por TikTok, ya es tarde.)',
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
    prompt: '¿Usas fondos indexados o ETFs en tu portafolio?',
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
        tip: 'El estudio SPIVA de S&P para LatAm 2025 mostró que ~75% de fondos activos no superaron su benchmark a 1 año, y 100% perdieron a 10 años en varias categorías. En plazos de 20 años, ~94% de los gestores profesionales globales no le gana a un índice básico tipo S&P 500. Comisión razonable de un ETF indexado: <0,2%; FIC activo típico Colombia: 1-2% — la diferencia compuesta destruye rendimiento a largo plazo. Un indexado básico (VOO, IVV, VWRA) de base es la apuesta con mejor relación esfuerzo/resultado.',
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
    hint: 'Conservador: prefieres rentabilidad baja pero segura. Moderado: balance entre rendimiento y riesgo. Agresivo: aceptas volatilidad y posibles pérdidas a cambio de mayor rentabilidad esperada.',
    sidebarWidgets: ['ageBasedRiskAllocation'],
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
        diagnostic: 'No tienes claro tu perfil de inversionista.',
        tip: 'Definirlo es uno de los pasos más útiles: te dice qué instrumentos tienen sentido para ti y cuáles no, y te evita entrar en una inversión que no puedes sostener cuando empiece a moverse.',
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
    glossaryTerms: ['cdt'],
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
        tip: 'La concentración en un único activo es el error #1 según múltiples fuentes: un evento idiosincrático arruina el portafolio entero. Diversifica entre instrumentos con riesgos distintos (renta fija + renta variable + dólar / ETF global). Un mal año en un único vehículo no debería poder destruir tu plan completo.',
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
    storageKey: 'currencyDiversification',
    title: 'Diversificación por moneda',
    description:
      'Si parte del ahorro o inversión está en USD u otra moneda fuerte. En países con devaluación estructural (Argentina, Venezuela) es crítico; en otros (Colombia, México, Chile) es cobertura cambiaria que complementa el portafolio local. Fintech como Littio, Wise, Global66 lo hicieron accesible sin mínimos.',
    category: 'investment',
    type: 'toggle',
    prompt: '¿Tienes parte de tu ahorro o inversión en USD u otra moneda fuerte?',
    hint: 'Cuentas en dólares (Littio, Wise, Global66), bonos en USD, ETFs internacionales — cualquier cosa que no se mueva al ritmo de tu moneda local.',
    dependsOn: [{storageKey: 'invests', equals: true}],
    trueLabel: 'Sí',
    falseLabel: 'No',
    score: {whenTrue: 100, whenFalse: 50},
    insights: [
      {
        id: 'noCurrencyDiversification',
        when: {kind: 'equals', key: 'currencyDiversification', value: false},
        severity: 'info',
        diagnostic: 'Todo tu ahorro/inversión está en moneda local.',
        tip: 'Si tu moneda local se devalúa, pierdes poder adquisitivo internacional aunque el monto en pesos suba. Mantener 10-30% en USD vía cuentas fintech (Littio, Wise) o ETFs es cobertura sencilla y de bajo costo.',
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
      exactInput: {min: 0, step: 1000, placeholder: 'Monto exacto', isMoney: true},
    },
    insights: [
      {
        id: 'smallPositions',
        when: {kind: 'gridEveryIn', key: 'investmentAmounts', values: ['lt1']},
        severity: 'info',
        diagnostic: 'Tus posiciones individuales son menores a 1 SMM.',
        tip: 'Es razonable empezar pequeño para aprender, pero es el capital significativo el que mueve la aguja en el largo plazo. Apunta a escalar a medida que ganas confianza con cada vehículo.',
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
    hint: 'Si no estás seguro, ingresa tu mejor estimación (en % EA).',
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
        {
          value: '7to15',
          label: '7% a 15%',
          sublabel: 'Renta fija con riesgo, fondos diversificados',
          score: 90,
        },
        {
          value: 'gt15',
          label: 'Más de 15%',
          sublabel: 'Rentabilidad alta — verifica riesgo',
          score: 100,
        },
      ],
      exactInput: {
        min: -100,
        max: 1000,
        step: 0.1,
        unit: '% EA',
        placeholder: 'Rendimiento exacto',
      },
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
        tip: 'Si la inflación local supera ese rendimiento, ese vehículo te está haciendo perder poder adquisitivo. Revisa si conviene rotarlo a algo más productivo.',
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
        diagnostic: 'Tienes al menos un vehículo con rendimientos muy altos.',
        tip: 'Rendimientos consistentemente altos casi siempre esconden riesgo no contabilizado o sesgo de supervivencia (ves al ganador, no a los que perdieron). Antes de duplicar la apuesta, verifica el track record en años malos — si nunca lo viste perder, todavía no lo conoces.',
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
  // Inputs con `defaultValue` arrancan con un valor visible y mostrado
  // al usuario (slider, number): cuentan como respondidos aunque el
  // usuario no haya tocado el control. Las interacciones del usuario
  // setean `value` y caen en las ramas posteriores. `DefaultValuePersist`
  // (DiagnosisQuestionBody) además persiste el `defaultValue` en
  // `answers` al montar el paso para que dependsOn/insights lo vean.
  if (
    (q.type === 'slider' || q.type === 'number') &&
    value === undefined &&
    q.defaultValue !== undefined
  ) {
    return true
  }
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

const sectionScoreStorageKey = (cat: DiagnosisCategoryId): string => `__sectionScore__${cat}`

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

export const findSectionScoreNode = (cat: DiagnosisCategoryId): SectionScoreNode | undefined =>
  SECTION_SCORE_NODES.find(n => n.category === cat)

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
export const findResultNode = (key: string): SectionScoreNode | SummaryNode | undefined => {
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
