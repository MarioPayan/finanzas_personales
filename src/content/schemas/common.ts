import {z} from 'zod'

export const ScalarAnswerSchema = z.union([z.string(), z.number(), z.boolean()])
export type ScalarAnswer = z.infer<typeof ScalarAnswerSchema>

export const AnswerValueSchema = z.union([
  ScalarAnswerSchema,
  z.array(z.union([z.string(), z.number(), z.null()])).readonly(),
])
export type AnswerValue = z.infer<typeof AnswerValueSchema>

export const AnswersSchema = z.record(z.string(), AnswerValueSchema)
export type Answers = z.infer<typeof AnswersSchema>

export const DiagnosisCategoryIdSchema = z.enum([
  'profile',
  'income',
  'expenses',
  'habits',
  'debt',
  'stability',
  'protection',
  'investment',
])
export type DiagnosisCategoryId = z.infer<typeof DiagnosisCategoryIdSchema>

export const DerivationKindSchema = z.enum([
  'multiplyMinimumWage',
  'multiplyMonthlyIncome',
  'multiplyMonthlyExpenses',
  'shareOfMonthlyIncome',
  'creditScoreBands',
])
export type DerivationKind = z.infer<typeof DerivationKindSchema>

export const DerivationSchema = z.object({
  kind: DerivationKindSchema,
  inputs: z.array(z.string()).readonly(),
})
export type Derivation = z.infer<typeof DerivationSchema>

export const SidebarWidgetIdSchema = z.enum([
  'minimumWage',
  'creditScoreScale',
  'usuryRate',
  'ageBasedRiskAllocation',
  'fireGoal',
])
export type SidebarWidgetId = z.infer<typeof SidebarWidgetIdSchema>

export const InsightSeveritySchema = z.enum(['positive', 'info', 'warning', 'critical'])
export type InsightSeverity = z.infer<typeof InsightSeveritySchema>

export const DependencyClauseSchema = z.object({
  storageKey: z.string(),
  equals: ScalarAnswerSchema.optional(),
  in: z.array(ScalarAnswerSchema).readonly().optional(),
  greaterThan: z.number().optional(),
  nonEmpty: z.boolean().optional(),
  nonEmptyExcept: z.array(ScalarAnswerSchema).readonly().optional(),
})
export type DependencyClause = z.infer<typeof DependencyClauseSchema>

export const OptionBracketSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
})
export type OptionBracket = z.infer<typeof OptionBracketSchema>

export const ScoreBandSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  score: z.number(),
})
export type ScoreBand = z.infer<typeof ScoreBandSchema>

export const ValueScoringSchema = z.array(ScoreBandSchema).readonly()
export type ValueScoring = z.infer<typeof ValueScoringSchema>

export const ExactInputSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  unit: z.string().optional(),
  placeholder: z.string().optional(),
  suggestionsSmm: z.array(z.number()).readonly().optional(),
  isMoney: z.boolean().optional(),
})
export type ExactInput = z.infer<typeof ExactInputSchema>

export const ChipOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
  examples: z.array(z.string()).readonly().optional(),
  bracket: OptionBracketSchema.optional(),
  score: z.number().optional(),
  clearOthers: z.boolean().optional(),
})
export type ChipOption = z.infer<typeof ChipOptionSchema>

export const GridRowSourceSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('count'),
    storageKey: z.string(),
    labelTemplate: z.string(),
  }),
  z.object({
    kind: z.literal('multiSelectLabels'),
    storageKey: z.string(),
  }),
])
export type GridRowSource = z.infer<typeof GridRowSourceSchema>

export const GridCellSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('chips'),
    options: z.array(ChipOptionSchema).readonly(),
    exactInput: ExactInputSchema.optional(),
    exactScore: ValueScoringSchema.optional(),
  }),
  z.object({
    kind: z.literal('number'),
    exactInput: ExactInputSchema,
    score: ValueScoringSchema.optional(),
  }),
])
export type GridCell = z.infer<typeof GridCellSchema>
