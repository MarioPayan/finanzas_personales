/**
 * Preguntas del diagnóstico inicial.
 *
 * Filosofía: chips/sliders/toggles antes que tipear cifras (§4.2).
 * El recorrido se poda dinámicamente con `dependsOn`.
 */

export type ChipOption = {
  value: string
  label: string
  sublabel?: string
  examples?: string[]
}

export type DiagnosisCategoryId = 'base' | 'debt' | 'stability' | 'investment'

export type DiagnosisCategory = {
  id: DiagnosisCategoryId
  label: string
  shortLabel: string
  color: 'primary' | 'warning' | 'info' | 'success'
}

export const CATEGORIES: Record<DiagnosisCategoryId, DiagnosisCategory> = {
  base: {
    id: 'base',
    label: 'Base · Salario y gastos',
    shortLabel: 'Base',
    color: 'primary',
  },
  debt: {
    id: 'debt',
    label: 'Deudas',
    shortLabel: 'Deudas',
    color: 'warning',
  },
  stability: {
    id: 'stability',
    label: 'Estabilidad',
    shortLabel: 'Estabilidad',
    color: 'info',
  },
  investment: {
    id: 'investment',
    label: 'Inversiones',
    shortLabel: 'Inversiones',
    color: 'success',
  },
}

export const CATEGORY_ORDER: DiagnosisCategoryId[] = ['base', 'debt', 'stability', 'investment']

type BaseQuestion = {
  id: string
  storageKey: string
  prompt: string
  hint?: string
  category: DiagnosisCategoryId
  examples?: string[]
  glossaryTerms?: string[]
  dependsOn?: {
    storageKey: string
    equals: string | number | boolean
  }
}

export type ChipsQuestion = BaseQuestion & {
  type: 'chips'
  options: ChipOption[]
}

export type SliderQuestion = BaseQuestion & {
  type: 'slider'
  min: number
  max: number
  step: number
  defaultValue: number
  unit?: string
  marks?: {value: number; label: string}[]
}

export type ToggleQuestion = BaseQuestion & {
  type: 'toggle'
  trueLabel?: string
  falseLabel?: string
}

export type DiagnosisQuestion = ChipsQuestion | SliderQuestion | ToggleQuestion

// ---------- Claves de respuestas (storageKeys) ----------

export const KEYS = {
  incomeBand: 'incomeBand',
  obligatoryPct: 'obligatoryPct',
  hasDebt: 'hasDebt',
  debtMagnitude: 'debtMagnitude',
  debtRate: 'debtRate',
  debtKind: 'debtKind',
  emergencyMonths: 'emergencyMonths',
  invests: 'invests',
  investmentBreadth: 'investmentBreadth',
} as const

// ---------- Valores válidos (uniones de literales) ----------

export const INCOME_BANDS = ['lt1', '1to2', '2to4', '4to8', 'gt8'] as const
export type IncomeBand = (typeof INCOME_BANDS)[number]

export const DEBT_MAGNITUDES = ['small', 'medium', 'large'] as const
export type DebtMagnitude = (typeof DEBT_MAGNITUDES)[number]

export const DEBT_RATES = ['low', 'mid', 'high', 'veryHigh', 'unknown'] as const
export type DebtRate = (typeof DEBT_RATES)[number]

export const DEBT_KINDS = ['investment', 'savings', 'bad'] as const
export type DebtKind = (typeof DEBT_KINDS)[number]

export const EMERGENCY_MONTHS = ['none', 'lt1', '1to3', '3to6', 'gt6'] as const
export type EmergencyMonths = (typeof EMERGENCY_MONTHS)[number]

export const INVESTMENT_BREADTHS = ['one', 'two', 'threePlus', 'unsure'] as const
export type InvestmentBreadth = (typeof INVESTMENT_BREADTHS)[number]

// ---------- Las preguntas ----------

export const DIAGNOSIS_QUESTIONS: readonly DiagnosisQuestion[] = [
  {
    id: 'q_income',
    storageKey: KEYS.incomeBand,
    category: 'base',
    type: 'chips',
    prompt: '¿Cuánto ganas al mes, más o menos?',
    hint: 'En múltiplos del salario mínimo de tu país.',
    glossaryTerms: ['smm'],
    options: [
      {value: 'lt1', label: 'Menos de 1 SMM'},
      {value: '1to2', label: '1 a 2 SMM'},
      {value: '2to4', label: '2 a 4 SMM'},
      {value: '4to8', label: '4 a 8 SMM'},
      {value: 'gt8', label: 'Más de 8 SMM'},
    ],
  },
  {
    id: 'q_obligatory',
    storageKey: KEYS.obligatoryPct,
    category: 'base',
    type: 'slider',
    prompt: '¿Qué porcentaje de tu ingreso se va en gastos obligatorios?',
    hint: 'Comida, vivienda, transporte, servicios. Lo que no podrías dejar de pagar este mes.',
    glossaryTerms: ['gastosObligatorios'],
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
  },
  {
    id: 'q_has_debt',
    storageKey: KEYS.hasDebt,
    category: 'debt',
    type: 'toggle',
    prompt: '¿Tienes deudas activas?',
    trueLabel: 'Sí',
    falseLabel: 'No',
  },
  {
    id: 'q_debt_magnitude',
    storageKey: KEYS.debtMagnitude,
    category: 'debt',
    type: 'chips',
    prompt: '¿Qué tan grande es tu deuda total?',
    hint: 'Comparada con tu ingreso mensual.',
    dependsOn: {storageKey: KEYS.hasDebt, equals: true},
    options: [
      {value: 'small', label: 'Pequeña', sublabel: 'Menos que un mes de ingreso'},
      {value: 'medium', label: 'Mediana', sublabel: '1 a 6 meses de ingreso'},
      {value: 'large', label: 'Grande', sublabel: 'Más de 6 meses de ingreso'},
    ],
  },
  {
    id: 'q_debt_rate',
    storageKey: KEYS.debtRate,
    category: 'debt',
    type: 'chips',
    prompt: '¿Cuál es la tasa de interés promedio de tus deudas?',
    hint: 'Aproximadamente. Si no estás seguro, escoge una banda o marca "no sé".',
    glossaryTerms: ['ea'],
    dependsOn: {storageKey: KEYS.hasDebt, equals: true},
    options: [
      {value: 'low', label: 'Baja', sublabel: 'Menos de 10% EA'},
      {value: 'mid', label: 'Media', sublabel: '10% a 25% EA'},
      {value: 'high', label: 'Alta', sublabel: '25% a 50% EA'},
      {value: 'veryHigh', label: 'Muy alta', sublabel: 'Más de 50% EA'},
      {value: 'unknown', label: 'No sé', sublabel: 'Asumiremos lo peor'},
    ],
  },
  {
    id: 'q_debt_kind',
    storageKey: KEYS.debtKind,
    category: 'debt',
    type: 'chips',
    prompt: '¿Qué tipo de deuda es?',
    hint: 'Mira los ejemplos del glosario si dudas.',
    glossaryTerms: ['debtKindInvestment', 'debtKindSavings', 'debtKindBad'],
    dependsOn: {storageKey: KEYS.hasDebt, equals: true},
    options: [
      {
        value: 'investment',
        label: 'Una inversión',
        sublabel: 'p. ej. local, negocio',
        examples: [
          'Crédito para abrir un local que genera renta',
          'Préstamo para comprar herramienta de trabajo',
          'Crédito para un negocio con flujo proyectado',
        ],
      },
      {
        value: 'savings',
        label: 'Un ahorro',
        sublabel: 'p. ej. casa, carro',
        examples: [
          'Crédito hipotecario en lugar de pagar arriendo',
          'Crédito de carro si lo necesitas para trabajar',
          'Préstamo para electrodomésticos que evitan otros gastos',
        ],
      },
      {
        value: 'bad',
        label: 'Una deuda mala',
        sublabel: 'p. ej. concierto, vacación',
        examples: [
          'Tarjeta de crédito por conciertos o vacaciones',
          'Crédito de consumo para ropa o lujos',
          'Préstamos rotativos para cubrir gastos del día a día',
        ],
      },
    ],
  },
  {
    id: 'q_emergency_months',
    storageKey: KEYS.emergencyMonths,
    category: 'stability',
    type: 'chips',
    prompt: '¿Cuántos meses de gastos tienes guardados como fondo de emergencia?',
    glossaryTerms: ['fondoEmergencia'],
    options: [
      {value: 'none', label: 'Ninguno'},
      {value: 'lt1', label: 'Menos de 1 mes'},
      {value: '1to3', label: '1 a 3 meses'},
      {value: '3to6', label: '3 a 6 meses'},
      {value: 'gt6', label: 'Más de 6 meses'},
    ],
  },
  {
    id: 'q_invests',
    storageKey: KEYS.invests,
    category: 'investment',
    type: 'toggle',
    prompt: '¿Inviertes parte de tu ingreso?',
    trueLabel: 'Sí',
    falseLabel: 'No',
  },
  {
    id: 'q_investment_breadth',
    storageKey: KEYS.investmentBreadth,
    category: 'investment',
    type: 'chips',
    prompt: '¿En cuántos mecanismos distintos inviertes?',
    hint: 'Por ejemplo: CDT, fondo, acciones, bienes raíces, criptomonedas.',
    glossaryTerms: ['cdt', 'diversificacion'],
    dependsOn: {storageKey: KEYS.invests, equals: true},
    options: [
      {value: 'one', label: 'Solo uno'},
      {value: 'two', label: 'Dos'},
      {value: 'threePlus', label: 'Tres o más'},
      {value: 'unsure', label: 'No estoy seguro'},
    ],
  },
]

// ---------- Helpers ----------

export const isQuestionApplicable = (
  question: DiagnosisQuestion,
  answers: Record<string, unknown>,
): boolean => {
  if (!question.dependsOn) return true
  return answers[question.dependsOn.storageKey] === question.dependsOn.equals
}

export const filterApplicableQuestions = (
  questions: readonly DiagnosisQuestion[],
  answers: Record<string, unknown>,
): DiagnosisQuestion[] => questions.filter(q => isQuestionApplicable(q, answers))

/**
 * Una pregunta se considera "saltada" cuando su padre ya respondió y la
 * dependencia no se cumple. Sirve para que la barra de progreso global no se
 * estanque cuando el usuario poda una rama entera del cuestionario.
 */
export const isQuestionSkipped = (
  question: DiagnosisQuestion,
  answers: Record<string, unknown>,
): boolean => {
  if (!question.dependsOn) return false
  const parent = answers[question.dependsOn.storageKey]
  return parent !== undefined && parent !== question.dependsOn.equals
}
