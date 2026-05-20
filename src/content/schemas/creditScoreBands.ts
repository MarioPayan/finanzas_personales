import {z} from 'zod'

export const CreditScoreBandRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
})
export type CreditScoreBandRange = z.infer<typeof CreditScoreBandRangeSchema>

export const CreditScoreBandsSchema = z.object({
  countryCode: z.string(),
  bureau: z.string(),
  scoreMin: z.number(),
  scoreMax: z.number(),
  ranges: z.object({
    bad: CreditScoreBandRangeSchema,
    regular: CreditScoreBandRangeSchema,
    good: CreditScoreBandRangeSchema,
    excellent: CreditScoreBandRangeSchema,
  }),
  verified: z.boolean(),
})
export type CreditScoreBands = z.infer<typeof CreditScoreBandsSchema>

export const CreditScoreBandsListSchema = z.array(CreditScoreBandsSchema).readonly()
