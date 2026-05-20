import type {z, ZodTypeAny} from 'zod'

/**
 * En dev parsea con zod para feedback inmediato; en prod hace cast directo
 * (zero-cost). El comando `pnpm validate:content` y los hooks `prebuild`/
 * `pretest` garantizan que el JSON siempre matchea el schema antes del
 * build, así que el cast en prod es seguro.
 */
export const parseContent = <S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> =>
  import.meta.env.DEV ? schema.parse(data) : (data as z.infer<S>)
