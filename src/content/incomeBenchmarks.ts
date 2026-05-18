/**
 * Ingreso medio anual y mensual por adulto (pre-tax national income,
 * equal-split) por país, en moneda local. Fuente: WID.world, variable
 * `aptinc_p0p100_992_j`. Generado por `scripts/fetch-wid-data.mjs` —
 * NO editar a mano.
 *
 * Para cada país tomamos el último año disponible. `extrapolated` es
 * `true` si WID lo marcó como interpolado/extrapolado y no como
 * observado directamente — para nuestro caso (benchmark informativo)
 * preferimos un valor reciente extrapolado sobre uno real de hace 40
 * años, pero el campo está expuesto para que el render pueda matizar
 * el mensaje.
 *
 * `meanMonthlyIncome` = round(`meanAnnualIncome` / 12). Es lo que
 * `insights.ts` usa para comparar contra el ingreso del usuario.
 */

export type IncomeBenchmark = {
  /** ISO 3166-1 alpha-2. */
  countryCode: string
  /** Último año disponible. */
  year: number
  /** Ingreso anual promedio por adulto, en moneda local. */
  meanAnnualIncome: number
  /** Mensual = round(annual / 12). */
  meanMonthlyIncome: number
  /** ISO 4217 (`COP`, `USD`, etc.). */
  currency: string
  /** True si WID marcó el dato como extrapolado / interpolado. */
  extrapolated: boolean
}

export const INCOME_BENCHMARKS: readonly IncomeBenchmark[] = [
  {
    countryCode: 'AR',
    year: 2024,
    meanAnnualIncome: 16443139,
    meanMonthlyIncome: 1370262,
    currency: 'ARS',
    extrapolated: true,
  },
  {
    countryCode: 'BO',
    year: 2024,
    meanAnnualIncome: 38982,
    meanMonthlyIncome: 3248,
    currency: 'BOB',
    extrapolated: true,
  },
  {
    countryCode: 'BR',
    year: 2024,
    meanAnnualIncome: 62286,
    meanMonthlyIncome: 5190,
    currency: 'BRL',
    extrapolated: true,
  },
  {
    countryCode: 'CL',
    year: 2024,
    meanAnnualIncome: 16259512,
    meanMonthlyIncome: 1354959,
    currency: 'CLP',
    extrapolated: true,
  },
  {
    countryCode: 'CO',
    year: 2024,
    meanAnnualIncome: 37635140,
    meanMonthlyIncome: 3136262,
    currency: 'COP',
    extrapolated: true,
  },
  {
    countryCode: 'CR',
    year: 2024,
    meanAnnualIncome: 11126278,
    meanMonthlyIncome: 927190,
    currency: 'CRC',
    extrapolated: true,
  },
  {
    countryCode: 'CU',
    year: 2024,
    meanAnnualIncome: 26905,
    meanMonthlyIncome: 2242,
    currency: 'CUP',
    extrapolated: true,
  },
  {
    countryCode: 'DO',
    year: 2024,
    meanAnnualIncome: 893822,
    meanMonthlyIncome: 74485,
    currency: 'DOP',
    extrapolated: true,
  },
  {
    countryCode: 'EC',
    year: 2024,
    meanAnnualIncome: 8268,
    meanMonthlyIncome: 689,
    currency: 'USD',
    extrapolated: true,
  },
  {
    countryCode: 'GT',
    year: 2024,
    meanAnnualIncome: 71637,
    meanMonthlyIncome: 5970,
    currency: 'GTQ',
    extrapolated: true,
  },
  {
    countryCode: 'HN',
    year: 2024,
    meanAnnualIncome: 124649,
    meanMonthlyIncome: 10387,
    currency: 'HNL',
    extrapolated: true,
  },
  {
    countryCode: 'MX',
    year: 2024,
    meanAnnualIncome: 306548,
    meanMonthlyIncome: 25546,
    currency: 'MXN',
    extrapolated: true,
  },
  {
    countryCode: 'NI',
    year: 2024,
    meanAnnualIncome: 151846,
    meanMonthlyIncome: 12654,
    currency: 'NIO',
    extrapolated: true,
  },
  {
    countryCode: 'PA',
    year: 2024,
    meanAnnualIncome: 25412,
    meanMonthlyIncome: 2118,
    currency: 'PAB',
    extrapolated: true,
  },
  {
    countryCode: 'PE',
    year: 2024,
    meanAnnualIncome: 40592,
    meanMonthlyIncome: 3383,
    currency: 'PEN',
    extrapolated: true,
  },
  {
    countryCode: 'PY',
    year: 2024,
    meanAnnualIncome: 66636988,
    meanMonthlyIncome: 5553082,
    currency: 'PYG',
    extrapolated: true,
  },
  {
    countryCode: 'SV',
    year: 2024,
    meanAnnualIncome: 7390,
    meanMonthlyIncome: 616,
    currency: 'USD',
    extrapolated: true,
  },
  {
    countryCode: 'UY',
    year: 2024,
    meanAnnualIncome: 1133782,
    meanMonthlyIncome: 94482,
    currency: 'UYU',
    extrapolated: true,
  },
  {
    countryCode: 'VE',
    year: 2024,
    meanAnnualIncome: 91722,
    meanMonthlyIncome: 7643,
    currency: 'VEF',
    extrapolated: true,
  },
]

export const findIncomeBenchmark = (countryCode: string): IncomeBenchmark | undefined =>
  INCOME_BENCHMARKS.find(b => b.countryCode === countryCode)
