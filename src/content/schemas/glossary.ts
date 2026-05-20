import {z} from 'zod'

export const GlossaryEntrySchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
})
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>

export const GlossarySchema = z.record(z.string(), GlossaryEntrySchema)
