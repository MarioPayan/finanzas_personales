/**
 * Salario mínimo mensual por país (Latinoamérica).
 *
 * Las cifras son aproximadas y deben revisarse contra fuente oficial cada año
 * (el cuestionario sólo las usa como referencia visual, no para cálculos).
 */

export type MinimumWageEntry = {
  countryCode: string
  countryName: string
  amount: number
  currency: string
  currencySymbol: string
  year: number
  source: string
}

export const MINIMUM_WAGES: Record<string, MinimumWageEntry> = {
  AR: {
    countryCode: 'AR',
    countryName: 'Argentina',
    amount: 322200,
    currency: 'ARS',
    currencySymbol: '$',
    year: 2025,
    source: 'Resolución CNEPySMVyM',
  },
  BO: {
    countryCode: 'BO',
    countryName: 'Bolivia',
    amount: 2750,
    currency: 'BOB',
    currencySymbol: 'Bs',
    year: 2025,
    source: 'Decreto Supremo',
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brasil',
    amount: 1518,
    currency: 'BRL',
    currencySymbol: 'R$',
    year: 2025,
    source: 'Decreto Federal',
  },
  CL: {
    countryCode: 'CL',
    countryName: 'Chile',
    amount: 510636,
    currency: 'CLP',
    currencySymbol: '$',
    year: 2025,
    source: 'Ley de Salario Mínimo',
  },
  CO: {
    countryCode: 'CO',
    countryName: 'Colombia',
    amount: 1423500,
    currency: 'COP',
    currencySymbol: '$',
    year: 2025,
    source: 'Decreto Mintrabajo',
  },
  CR: {
    countryCode: 'CR',
    countryName: 'Costa Rica',
    amount: 358609,
    currency: 'CRC',
    currencySymbol: '₡',
    year: 2025,
    source: 'Consejo Nacional de Salarios',
  },
  CU: {
    countryCode: 'CU',
    countryName: 'Cuba',
    amount: 2100,
    currency: 'CUP',
    currencySymbol: '$',
    year: 2025,
    source: 'Resolución Min. de Trabajo',
  },
  DO: {
    countryCode: 'DO',
    countryName: 'República Dominicana',
    amount: 21000,
    currency: 'DOP',
    currencySymbol: 'RD$',
    year: 2025,
    source: 'Comité Nacional de Salarios',
  },
  EC: {
    countryCode: 'EC',
    countryName: 'Ecuador',
    amount: 470,
    currency: 'USD',
    currencySymbol: '$',
    year: 2025,
    source: 'Acuerdo Ministerial',
  },
  GT: {
    countryCode: 'GT',
    countryName: 'Guatemala',
    amount: 3500,
    currency: 'GTQ',
    currencySymbol: 'Q',
    year: 2025,
    source: 'Acuerdo Gubernativo',
  },
  HN: {
    countryCode: 'HN',
    countryName: 'Honduras',
    amount: 13500,
    currency: 'HNL',
    currencySymbol: 'L',
    year: 2025,
    source: 'Comisión Nacional de Salario Mínimo',
  },
  MX: {
    countryCode: 'MX',
    countryName: 'México',
    amount: 8480,
    currency: 'MXN',
    currencySymbol: '$',
    year: 2025,
    source: 'CONASAMI',
  },
  NI: {
    countryCode: 'NI',
    countryName: 'Nicaragua',
    amount: 7600,
    currency: 'NIO',
    currencySymbol: 'C$',
    year: 2025,
    source: 'Comisión Nacional de Salario Mínimo',
  },
  PA: {
    countryCode: 'PA',
    countryName: 'Panamá',
    amount: 745,
    currency: 'USD',
    currencySymbol: '$',
    year: 2025,
    source: 'Decreto Ejecutivo',
  },
  PE: {
    countryCode: 'PE',
    countryName: 'Perú',
    amount: 1130,
    currency: 'PEN',
    currencySymbol: 'S/',
    year: 2025,
    source: 'Decreto Supremo',
  },
  PY: {
    countryCode: 'PY',
    countryName: 'Paraguay',
    amount: 2798309,
    currency: 'PYG',
    currencySymbol: '₲',
    year: 2025,
    source: 'Decreto del Poder Ejecutivo',
  },
  SV: {
    countryCode: 'SV',
    countryName: 'El Salvador',
    amount: 365,
    currency: 'USD',
    currencySymbol: '$',
    year: 2025,
    source: 'Decreto Ejecutivo',
  },
  UY: {
    countryCode: 'UY',
    countryName: 'Uruguay',
    amount: 22268,
    currency: 'UYU',
    currencySymbol: '$',
    year: 2025,
    source: 'Consejo de Salarios',
  },
  VE: {
    countryCode: 'VE',
    countryName: 'Venezuela',
    amount: 130,
    currency: 'VES',
    currencySymbol: 'Bs',
    year: 2025,
    source: 'Gaceta Oficial',
  },
}

export const formatMinimumWage = (entry: MinimumWageEntry): string => {
  const formatter = new Intl.NumberFormat('es', {maximumFractionDigits: 0})
  return `${entry.currencySymbol} ${formatter.format(entry.amount)} ${entry.currency}`
}
