/**
 * Perfiles canónicos del diagnóstico.
 *
 * Set fijo de respuestas pre-cargadas que representan situaciones
 * arquetípicas. Cumplen dos funciones:
 *
 *   1. **Tests de regresión** (`src/utils/scoring.test.ts`): el score y los
 *      insights de cada perfil están congelados en snapshots. Si alguien
 *      cambia un nodo o un peso, el test rompe y deja claro qué perfiles se
 *      afectaron.
 *   2. **Simulador en `/debug`** (eje B2 del roadmap): el picker carga el
 *      perfil para ver respuestas, scoring e insights en vivo.
 *
 * Los perfiles NO pretenden cubrir todo el espacio de respuestas — son
 * ejemplos representativos. Si un nodo nuevo no queda cubierto, sumar un
 * perfil que lo ejercite.
 */

import type {Answers} from './diagnosis'

export type CanonicalProfile = {
  id: string
  label: string
  description: string
  /** Código de país sugerido para esta persona (para el SMM y benchmarks). */
  countryCode: string
  answers: Answers
}

export const CANONICAL_PROFILES: readonly CanonicalProfile[] = [
  {
    id: 'young-argentine-precarious',
    label: 'Joven precarizado argentino',
    description:
      'Argentina, 24 años. Ingreso variable bajo el SMM. Deuda mala cara, sin colchón, estrés constante. Caso "supervivencia / atrapado".',
    countryCode: 'AR',
    answers: {
      incomeBand: 'lt1',
      age: 24,
      incomeStability: 'variable',
      obligatoryPct: 80,
      discretionaryPct: 20,
      hasBudgetSystem: 'no',
      knowsCreditScore: false,
      hasDebt: true,
      debtMonthlyPct: 40,
      debtCount: 2,
      debtAmounts: ['lt1', '1to3'],
      debtRates: ['high', 'high'],
      debtKinds: ['bad', 'bad'],
      emergencyMonths: 'none',
      hasHealthInsurance: false,
      jobHorizon: '0to1',
      secondIncomeStream: 'idea',
      financialStressLevel: 'constant',
      inRelationship: false,
      yearsInvesting: 'never',
      professionalEducationInvestment: 'a-bit',
      financialEducationInvestment: 'no',
      invests: false,
    },
  },
  {
    id: 'mexican-middle-class',
    label: 'Asalariado clase media mexicano',
    description:
      'México, 35 años. Sueldo fijo de ~3 SMM, una hipoteca, buen score crediticio. Invierte en CDT y fondos, no usa indexados. Estable pero conservador.',
    countryCode: 'MX',
    answers: {
      incomeBand: '2to4',
      age: 35,
      incomeStability: 'fixed',
      obligatoryPct: 55,
      discretionaryPct: 25,
      hasBudgetSystem: 'mental',
      knowsCreditScore: true,
      creditScoreBand: 'good',
      hasDebt: true,
      debtMonthlyPct: 20,
      debtCount: 1,
      debtAmounts: ['10to50'],
      debtRates: ['mid'],
      debtKinds: ['savings'],
      emergencyMonths: '1to3',
      emergencyAccessSpeed: 'days',
      hasHealthInsurance: true,
      jobHorizon: '5to10',
      financialStressLevel: 'sometimes',
      inRelationship: true,
      householdFinancialAlignment: 'aligned-no-plan',
      yearsInvesting: '1to3',
      professionalEducationInvestment: 'time',
      financialEducationInvestment: 'a-bit',
      invests: true,
      tradingFrequency: 'few-year',
      usesIndexFunds: false,
      riskProfile: 'moderate',
      investmentVehicles: ['cdt', 'fund'],
      investmentAmounts: ['1to2', '1to2'],
      investmentYields: ['3to7', '3to7'],
    },
  },
  {
    id: 'colombian-freelancer',
    label: 'Freelancer ahorrador colombiano',
    description:
      'Colombia, 30 años. Ingreso variable de 2-4 SMM, sin deudas. Fondo de emergencia grande, invierte en acciones y fondos indexados. Perfil agresivo.',
    countryCode: 'CO',
    answers: {
      incomeBand: '2to4',
      age: 30,
      incomeStability: 'variable',
      obligatoryPct: 40,
      discretionaryPct: 20,
      hasBudgetSystem: 'accounts',
      knowsCreditScore: true,
      creditScoreBand: 'good',
      hasDebt: false,
      emergencyMonths: '6to12',
      emergencyAccessSpeed: 'hours',
      hasHealthInsurance: true,
      jobHorizon: '3to5',
      secondIncomeStream: 'working',
      financialStressLevel: 'sometimes',
      inRelationship: false,
      yearsInvesting: '1to3',
      professionalEducationInvestment: 'time-money',
      financialEducationInvestment: 'time',
      invests: true,
      tradingFrequency: 'monthly',
      usesIndexFunds: true,
      riskProfile: 'aggressive',
      investmentVehicles: ['shares', 'fund'],
      investmentAmounts: ['1to2', '2to4'],
      investmentYields: ['7to15', '7to15'],
    },
  },
  {
    id: 'chilean-rentier',
    label: 'Rentista experimentado chileno',
    description:
      'Chile, 55 años. Ingreso alto (>8 SMM), patrimonio diversificado, fondo amplio. Usa deuda como apalancamiento contra activos. Sin estrés financiero.',
    countryCode: 'CL',
    answers: {
      incomeBand: 'gt8',
      age: 55,
      incomeStability: 'mixed',
      obligatoryPct: 25,
      discretionaryPct: 20,
      hasBudgetSystem: 'automated',
      knowsCreditScore: true,
      creditScoreBand: 'excellent',
      hasDebt: true,
      debtMonthlyPct: 10,
      debtCount: 1,
      debtAmounts: ['gt200'],
      debtRates: ['low'],
      debtKinds: ['investment'],
      emergencyMonths: 'gt12',
      emergencyAccessSpeed: 'minutes',
      hasHealthInsurance: true,
      jobHorizon: 'gt20',
      financialStressLevel: 'none',
      inRelationship: true,
      householdFinancialAlignment: 'aligned-plan',
      yearsInvesting: 'gt10',
      professionalEducationInvestment: 'time-money',
      financialEducationInvestment: 'time-money',
      invests: true,
      tradingFrequency: 'never',
      usesIndexFunds: true,
      riskProfile: 'conservative',
      investmentVehicles: ['fund', 'shares', 'realEstate', 'bonds'],
      investmentAmounts: ['gt4', 'gt4', 'gt4', 'gt4'],
      investmentYields: ['7to15', '7to15', '7to15', '3to7'],
    },
  },
  {
    id: 'student-with-loans',
    label: 'Estudiante con deuda educativa',
    description:
      'Argentina/Uruguay, 22 años. Ingreso bajo de trabajos part-time, préstamo estudiantil grande. Educación como inversión deliberada. Sin colchón.',
    countryCode: 'AR',
    answers: {
      incomeBand: '1to2',
      age: 22,
      incomeStability: 'variable',
      obligatoryPct: 60,
      discretionaryPct: 35,
      hasBudgetSystem: 'mental',
      knowsCreditScore: false,
      hasDebt: true,
      debtMonthlyPct: 15,
      debtCount: 1,
      debtAmounts: ['10to50'],
      debtRates: ['mid'],
      debtKinds: ['investment'],
      emergencyMonths: 'lt1',
      emergencyAccessSpeed: 'hours',
      hasHealthInsurance: true,
      jobHorizon: '1to3',
      secondIncomeStream: 'idea',
      financialStressLevel: 'frequent',
      inRelationship: false,
      yearsInvesting: 'never',
      professionalEducationInvestment: 'time-money',
      financialEducationInvestment: 'a-bit',
      invests: false,
    },
  },
  {
    id: 'working-family',
    label: 'Pareja con hijos clase trabajadora',
    description:
      'Colombia/México, 38 años. Sueldo fijo, hipoteca + 2 deudas de consumo, fondo chico, estrés frecuente. Caso de "casi alineados pero apretados".',
    countryCode: 'CO',
    answers: {
      incomeBand: '2to4',
      age: 38,
      incomeStability: 'fixed',
      obligatoryPct: 75,
      discretionaryPct: 18,
      hasBudgetSystem: 'accounts',
      knowsCreditScore: true,
      creditScoreBand: 'regular',
      hasDebt: true,
      debtMonthlyPct: 25,
      debtCount: 3,
      debtAmounts: ['3to10', '1to3', 'lt1'],
      debtRates: ['mid', 'high', 'high'],
      debtKinds: ['savings', 'bad', 'bad'],
      emergencyMonths: '1to3',
      emergencyAccessSpeed: 'days',
      hasHealthInsurance: true,
      jobHorizon: '5to10',
      financialStressLevel: 'frequent',
      inRelationship: true,
      householdFinancialAlignment: 'aligned-no-plan',
      yearsInvesting: 'never',
      professionalEducationInvestment: 'a-bit',
      financialEducationInvestment: 'no',
      invests: false,
    },
  },
]

export const getCanonicalProfile = (id: string): CanonicalProfile | undefined =>
  CANONICAL_PROFILES.find(p => p.id === id)
