/**
 * Salario mínimo mensual por país (Latinoamérica).
 *
 * Cifras aproximadas, revisar contra fuente oficial cada año. Se usa solo como
 * referencia visual en el cuestionario, no para cálculos.
 *
 * El contenido vive en `src/content/data/minimumWages.json`.
 */

import minimumWagesData from './data/minimumWages.json'
import {parseContent} from './_loader'
import {MinimumWagesSchema} from './schemas/minimumWages'

export type {MinimumWageEntry} from './schemas/minimumWages'

import type {MinimumWageEntry} from './schemas/minimumWages'

export const MINIMUM_WAGES: Record<string, MinimumWageEntry> = parseContent(
  MinimumWagesSchema,
  minimumWagesData,
)

export const formatMinimumWage = (entry: MinimumWageEntry): string =>
  new Intl.NumberFormat('es', {
    style: 'currency',
    currency: entry.currency,
    maximumFractionDigits: 0,
  }).format(entry.amount)
