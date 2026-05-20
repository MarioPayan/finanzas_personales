import {z} from 'zod'

export const IncomeBenchmarkSchema = z.object({
  countryCode: z.string(),
  year: z.number(),
  meanAnnualIncome: z.number(),
  meanMonthlyIncome: z.number(),
  currency: z.string(),
  extrapolated: z.boolean(),
})
export type IncomeBenchmark = z.infer<typeof IncomeBenchmarkSchema>

export const IncomeBenchmarksSchema = z.array(IncomeBenchmarkSchema).readonly()
