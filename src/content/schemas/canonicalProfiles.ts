import {z} from 'zod'

import {AnswersSchema} from './common'

export const CanonicalProfileSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  countryCode: z.string(),
  answers: AnswersSchema,
})
export type CanonicalProfile = z.infer<typeof CanonicalProfileSchema>

export const CanonicalProfilesSchema = z.array(CanonicalProfileSchema).readonly()
