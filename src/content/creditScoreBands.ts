/**
 * Rangos del puntaje crediticio por país (continente americano). Lo
 * consume el widget `creditScoreScale` del sidebar para mostrarle al
 * usuario qué números corresponden a cada banda en su país.
 *
 * Las bandas son las mismas cuatro categorías que usa el nodo
 * `creditScoreBand` en `diagnosis.ts` (`bad` / `regular` / `good` /
 * `excellent`), normalizadas: muchos burós usan 5 bandas (incluyendo
 * "muy bueno"); las colapsamos a 4 sumando el "muy bueno" al "bueno"
 * o "excelente" según el país.
 *
 * `verified: true` indica fuente confirmada (FICO, Datacrédito,
 * Serasa, Equifax/TransUnion oficiales). `verified: false` significa
 * que el rango es una aproximación coherente con la escala genérica
 * del buró del país.
 *
 * El contenido vive en `src/content/data/creditScoreBands.json`.
 */

import creditScoreBandsData from './data/creditScoreBands.json'
import {parseContent} from './_loader'
import {CreditScoreBandsListSchema} from './schemas/creditScoreBands'

export type {CreditScoreBandRange, CreditScoreBands} from './schemas/creditScoreBands'

import type {CreditScoreBands} from './schemas/creditScoreBands'

export const CREDIT_SCORE_BANDS: readonly CreditScoreBands[] = parseContent(
  CreditScoreBandsListSchema,
  creditScoreBandsData,
)

export const findCreditScoreBands = (countryCode: string): CreditScoreBands | undefined =>
  CREDIT_SCORE_BANDS.find(b => b.countryCode === countryCode)
