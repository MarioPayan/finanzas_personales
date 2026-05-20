/**
 * Ingreso medio anual y mensual por adulto (pre-tax national income,
 * equal-split) por país, en moneda local. Fuente: WID.world, variable
 * `aptinc_p0p100_992_j`. Generado por `scripts/fetch-wid-data.mjs` —
 * regenerar el JSON con ese script, no editar a mano.
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
 *
 * El contenido vive en `src/content/data/incomeBenchmarks.json`.
 */

import incomeBenchmarksData from './data/incomeBenchmarks.json'
import {parseContent} from './_loader'
import {IncomeBenchmarksSchema} from './schemas/incomeBenchmarks'

export type {IncomeBenchmark} from './schemas/incomeBenchmarks'

import type {IncomeBenchmark} from './schemas/incomeBenchmarks'

export const INCOME_BENCHMARKS: readonly IncomeBenchmark[] = parseContent(
  IncomeBenchmarksSchema,
  incomeBenchmarksData,
)

export const findIncomeBenchmark = (countryCode: string): IncomeBenchmark | undefined =>
  INCOME_BENCHMARKS.find(b => b.countryCode === countryCode)
