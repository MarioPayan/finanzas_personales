#!/usr/bin/env node
/**
 * Descarga datos del WID (World Inequality Database) para los países
 * latinoamericanos soportados por el cuestionario y genera
 * `src/content/incomeBenchmarks.ts` con el ingreso medio anual por adulto
 * (variable `aptinc_p0p100_992_j` — pre-tax national income, average,
 * equal-split adults), en moneda local del año más reciente disponible.
 *
 * Fuente: WID.world. La API HTTP usada acá es la misma que consume el
 * paquete oficial `wid` de R (https://github.com/world-inequality-database/wid-r-tool).
 * El endpoint y la api-key se extrajeron del paquete (sysdata.rda); la
 * key no es secreta — está embebida en un paquete público de CRAN —
 * pero igual no la expongas en el bundle del cliente: la usamos solo
 * acá, en build time / scripts.
 *
 * Ejecutar:
 *   node scripts/fetch-wid-data.mjs
 *
 * El output queda en `src/content/incomeBenchmarks.ts`. Si los datos
 * cambian (WID actualiza una vez al año), volver a correrlo y commitear
 * el resultado.
 */

import {writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, resolve} from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../src/content/incomeBenchmarks.ts')

const API_BASE = 'https://rfap9nitz6.execute-api.eu-west-1.amazonaws.com/prod'
const API_KEY = 'rYFByOB0ioaPATwHtllMI71zLOZSK0Ic5veQonJP'
const VARIABLE = 'aptinc_p0p100_992_j'

// Países soportados por el cuestionario (alineado con MINIMUM_WAGES).
const COUNTRIES = [
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC',
  'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'PY', 'SV', 'UY', 'VE',
]

const fetchWid = async () => {
  const url =
    `${API_BASE}/countries-variables` +
    `?countries=${COUNTRIES.join(',')}` +
    `&variables=${VARIABLE}` +
    `&years=all`
  const res = await fetch(url, {headers: {'x-api-key': API_KEY}})
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const json = await res.json()
  const entries = json[VARIABLE]
  if (!Array.isArray(entries)) throw new Error('Unexpected payload shape')
  return entries
}

/**
 * Toma la entrada de un país y devuelve el último punto disponible,
 * marcando si está extrapolado. Para nuestro caso de uso (benchmark
 * informativo de ingreso) preferimos un valor reciente extrapolado
 * sobre uno real de hace 40 años.
 */
const pickLatestPoint = (countryEntry) => {
  const code = Object.keys(countryEntry)[0]
  const body = countryEntry[code]
  const values = body.values
  const meta = body.meta ?? {}
  const unit = meta.unit ?? null

  let extrapolated = new Set()
  if (typeof meta.extrapolation === 'string' && meta.extrapolation.length > 0) {
    try {
      const ranges = JSON.parse(meta.extrapolation)
      for (const [from, to] of ranges) {
        for (let y = from + 1; y <= to; y++) extrapolated.add(y)
      }
    } catch {
      // Sin extrapolación parseable: asumimos todos los puntos reales.
    }
  }

  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => b.y - a.y)
  const latest = sorted[0]
  return {
    countryCode: code,
    year: latest.y,
    meanAnnualIncome: latest.v,
    currency: unit,
    extrapolated: extrapolated.has(latest.y),
  }
}

const generateOutput = (records) => {
  const sorted = [...records].sort((a, b) => a.countryCode.localeCompare(b.countryCode))
  const lines = sorted.map(r => {
    const monthly = Math.round(r.meanAnnualIncome / 12)
    return (
      `  {countryCode: '${r.countryCode}', year: ${r.year}, ` +
      `meanAnnualIncome: ${Math.round(r.meanAnnualIncome)}, ` +
      `meanMonthlyIncome: ${monthly}, ` +
      `currency: '${r.currency}', ` +
      `extrapolated: ${r.extrapolated}},`
    )
  })

  return `/**
 * Ingreso medio anual y mensual por adulto (pre-tax national income,
 * equal-split) por país, en moneda local. Fuente: WID.world, variable
 * \`aptinc_p0p100_992_j\`. Generado por \`scripts/fetch-wid-data.mjs\` —
 * NO editar a mano.
 *
 * Para cada país tomamos el último año disponible. \`extrapolated\` es
 * \`true\` si WID lo marcó como interpolado/extrapolado y no como
 * observado directamente — para nuestro caso (benchmark informativo)
 * preferimos un valor reciente extrapolado sobre uno real de hace 40
 * años, pero el campo está expuesto para que el render pueda matizar
 * el mensaje.
 *
 * \`meanMonthlyIncome\` = round(\`meanAnnualIncome\` / 12). Es lo que
 * \`insights.ts\` usa para comparar contra el ingreso del usuario.
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
  /** ISO 4217 (\`COP\`, \`USD\`, etc.). */
  currency: string
  /** True si WID marcó el dato como extrapolado / interpolado. */
  extrapolated: boolean
}

export const INCOME_BENCHMARKS: readonly IncomeBenchmark[] = [
${lines.join('\n')}
]

export const findIncomeBenchmark = (
  countryCode: string,
): IncomeBenchmark | undefined =>
  INCOME_BENCHMARKS.find(b => b.countryCode === countryCode)
`
}

const main = async () => {
  console.error(`Fetching WID data for ${COUNTRIES.length} countries…`)
  const entries = await fetchWid()
  const records = entries
    .map(pickLatestPoint)
    .filter((r) => r !== null)

  const missing = COUNTRIES.filter(
    (c) => !records.find((r) => r.countryCode === c),
  )
  if (missing.length > 0) {
    console.error(`Warning: missing benchmarks for ${missing.join(', ')}`)
  }

  for (const r of records) {
    const tag = r.extrapolated ? ' (extrapolated)' : ''
    console.error(
      `  ${r.countryCode} ${r.year}: ${r.meanAnnualIncome.toLocaleString('en')} ${r.currency}/year (${Math.round(r.meanAnnualIncome / 12).toLocaleString('en')}/month)${tag}`,
    )
  }

  const output = generateOutput(records)
  writeFileSync(OUTPUT_PATH, output, 'utf8')
  console.error(`\nWrote ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
