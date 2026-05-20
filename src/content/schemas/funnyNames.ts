import {z} from 'zod'

export const FunnyNamesSchema = z.array(z.string()).readonly()
