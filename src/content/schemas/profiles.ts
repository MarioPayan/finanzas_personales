import {z} from 'zod'

import {DiagnosisCategoryIdSchema} from './common'

export const ProfileSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
})
export type Profile = z.infer<typeof ProfileSchema>

export const ProfileBandSchema = z.object({
  min: z.number(),
  max: z.number(),
  profile: ProfileSchema,
})
export type ProfileBand = z.infer<typeof ProfileBandSchema>

export const ProfileBandsSchema = z.array(ProfileBandSchema).readonly()

export const SectionProfilesSchema = z.record(DiagnosisCategoryIdSchema, ProfileBandsSchema)
