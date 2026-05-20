import {z} from 'zod'

export const MinimumWageEntrySchema = z.object({
  countryName: z.string(),
  amount: z.number(),
  currency: z.string(),
  year: z.number(),
})
export type MinimumWageEntry = z.infer<typeof MinimumWageEntrySchema>

export const MinimumWagesSchema = z.record(z.string(), MinimumWageEntrySchema)
