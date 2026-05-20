import {z} from 'zod'

import {ScalarAnswerSchema, type ScalarAnswer} from './common'

export type InsightCondition =
  | {kind: 'all'; of: readonly InsightCondition[]}
  | {kind: 'any'; of: readonly InsightCondition[]}
  | {kind: 'not'; of: InsightCondition}
  | {kind: 'equals'; key: string; value: ScalarAnswer}
  | {kind: 'in'; key: string; values: readonly ScalarAnswer[]}
  | {kind: 'numberAbove'; key: string; threshold: number}
  | {kind: 'numberBelow'; key: string; threshold: number}
  | {kind: 'numberAtLeast'; key: string; threshold: number}
  | {kind: 'numberAtMost'; key: string; threshold: number}
  | {kind: 'multiHas'; key: string; value: string}
  | {kind: 'multiCountAtLeast'; key: string; count: number}
  | {kind: 'multiCountAtMost'; key: string; count: number}
  | {kind: 'gridAnyIn'; key: string; values: readonly string[]}
  | {kind: 'gridEveryIn'; key: string; values: readonly string[]}
  | {kind: 'gridCountInAtLeast'; key: string; values: readonly string[]; count: number}
  | {kind: 'gridAnyNumberAbove'; key: string; threshold: number}
  | {kind: 'gridAnyNumberBelow'; key: string; threshold: number}
  | {kind: 'gridEveryNumberBelow'; key: string; threshold: number}
  | {kind: 'incomeBelowSmmTimes'; multiplier: number}
  | {kind: 'incomeAboveSmmTimes'; multiplier: number}
  | {kind: 'incomeBelowCountryAverageTimes'; multiplier: number}
  | {kind: 'incomeAboveCountryAverageTimes'; multiplier: number}
  | {kind: 'obligatoryAbsoluteBelowSmmTimes'; multiplier: number}
  | {kind: 'obligatoryAbsoluteAboveSmmTimes'; multiplier: number}

export const InsightConditionSchema: z.ZodType<InsightCondition> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({kind: z.literal('all'), of: z.array(InsightConditionSchema).readonly()}),
    z.object({kind: z.literal('any'), of: z.array(InsightConditionSchema).readonly()}),
    z.object({kind: z.literal('not'), of: InsightConditionSchema}),
    z.object({kind: z.literal('equals'), key: z.string(), value: ScalarAnswerSchema}),
    z.object({
      kind: z.literal('in'),
      key: z.string(),
      values: z.array(ScalarAnswerSchema).readonly(),
    }),
    z.object({kind: z.literal('numberAbove'), key: z.string(), threshold: z.number()}),
    z.object({kind: z.literal('numberBelow'), key: z.string(), threshold: z.number()}),
    z.object({kind: z.literal('numberAtLeast'), key: z.string(), threshold: z.number()}),
    z.object({kind: z.literal('numberAtMost'), key: z.string(), threshold: z.number()}),
    z.object({kind: z.literal('multiHas'), key: z.string(), value: z.string()}),
    z.object({kind: z.literal('multiCountAtLeast'), key: z.string(), count: z.number()}),
    z.object({kind: z.literal('multiCountAtMost'), key: z.string(), count: z.number()}),
    z.object({
      kind: z.literal('gridAnyIn'),
      key: z.string(),
      values: z.array(z.string()).readonly(),
    }),
    z.object({
      kind: z.literal('gridEveryIn'),
      key: z.string(),
      values: z.array(z.string()).readonly(),
    }),
    z.object({
      kind: z.literal('gridCountInAtLeast'),
      key: z.string(),
      values: z.array(z.string()).readonly(),
      count: z.number(),
    }),
    z.object({
      kind: z.literal('gridAnyNumberAbove'),
      key: z.string(),
      threshold: z.number(),
    }),
    z.object({
      kind: z.literal('gridAnyNumberBelow'),
      key: z.string(),
      threshold: z.number(),
    }),
    z.object({
      kind: z.literal('gridEveryNumberBelow'),
      key: z.string(),
      threshold: z.number(),
    }),
    z.object({kind: z.literal('incomeBelowSmmTimes'), multiplier: z.number()}),
    z.object({kind: z.literal('incomeAboveSmmTimes'), multiplier: z.number()}),
    z.object({kind: z.literal('incomeBelowCountryAverageTimes'), multiplier: z.number()}),
    z.object({kind: z.literal('incomeAboveCountryAverageTimes'), multiplier: z.number()}),
    z.object({kind: z.literal('obligatoryAbsoluteBelowSmmTimes'), multiplier: z.number()}),
    z.object({kind: z.literal('obligatoryAbsoluteAboveSmmTimes'), multiplier: z.number()}),
  ]),
)
