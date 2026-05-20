import {z} from 'zod'

import {
  ChipOptionSchema,
  DependencyClauseSchema,
  DerivationSchema,
  DiagnosisCategoryIdSchema,
  ExactInputSchema,
  GridCellSchema,
  GridRowSourceSchema,
  InsightSeveritySchema,
  ScoreBandSchema,
  SidebarWidgetIdSchema,
  ValueScoringSchema,
} from './common'
import {InsightConditionSchema} from './insightConditions'

export const InsightSchema = z.object({
  id: z.string(),
  diagnostic: z.string(),
  tip: z.string(),
  when: InsightConditionSchema,
  severity: InsightSeveritySchema.optional(),
})
export type Insight = z.infer<typeof InsightSchema>

const baseQuestionFields = {
  storageKey: z.string(),
  title: z.string(),
  description: z.string(),
  prompt: z.string(),
  hint: z.string().optional(),
  category: DiagnosisCategoryIdSchema,
  glossaryTerms: z.array(z.string()).readonly().optional(),
  sidebarWidgets: z.array(SidebarWidgetIdSchema).readonly().optional(),
  dependsOn: z.array(DependencyClauseSchema).readonly().optional(),
  derivation: DerivationSchema.optional(),
  tips: z.array(z.string()).readonly().optional(),
  insights: z.array(InsightSchema).readonly().optional(),
}

export const ChipsQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('chips'),
  options: z.array(ChipOptionSchema).readonly(),
  exactInput: ExactInputSchema.optional(),
  exactScore: ValueScoringSchema.optional(),
})
export type ChipsQuestion = z.infer<typeof ChipsQuestionSchema>

export const SliderQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('slider'),
  min: z.number(),
  max: z.number(),
  step: z.number(),
  defaultValue: z.number(),
  unit: z.string().optional(),
  marks: z
    .array(z.object({value: z.number(), label: z.string()}))
    .readonly()
    .optional(),
  score: ValueScoringSchema.optional(),
})
export type SliderQuestion = z.infer<typeof SliderQuestionSchema>

export const ToggleQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('toggle'),
  trueLabel: z.string().optional(),
  falseLabel: z.string().optional(),
  score: z.object({whenTrue: z.number(), whenFalse: z.number()}).optional(),
})
export type ToggleQuestion = z.infer<typeof ToggleQuestionSchema>

export const NumberQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  unit: z.string().optional(),
  defaultValue: z.number().optional(),
  placeholder: z.string().optional(),
  score: ValueScoringSchema.optional(),
})
export type NumberQuestion = z.infer<typeof NumberQuestionSchema>

export const MultiChipsQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('multiChips'),
  options: z.array(ChipOptionSchema).readonly(),
})
export type MultiChipsQuestion = z.infer<typeof MultiChipsQuestionSchema>

export const GridQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('grid'),
  rowSource: GridRowSourceSchema,
  cell: GridCellSchema,
})
export type GridQuestion = z.infer<typeof GridQuestionSchema>

export const DiagnosisQuestionSchema = z.discriminatedUnion('type', [
  ChipsQuestionSchema,
  SliderQuestionSchema,
  ToggleQuestionSchema,
  NumberQuestionSchema,
  MultiChipsQuestionSchema,
  GridQuestionSchema,
])
export type DiagnosisQuestion = z.infer<typeof DiagnosisQuestionSchema>

export const DiagnosisQuestionsSchema = z.array(DiagnosisQuestionSchema).readonly()

export const ToneBandSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  color: z.enum(['success', 'warning', 'error', 'info', 'primary']),
  message: z.string(),
})
export type ToneBand = z.infer<typeof ToneBandSchema>

export const ToneBandsSchema = z.array(ToneBandSchema).readonly()

export const SummaryComponentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  userHeading: z.string().optional(),
})
export type SummaryComponent = z.infer<typeof SummaryComponentSchema>

export const SeverityLabelSchema = z.object({
  label: z.string(),
  color: z.enum(['success', 'warning', 'error', 'info']),
})
export type SeverityLabel = z.infer<typeof SeverityLabelSchema>

export const SummaryNodeSchema = z.object({
  storageKey: z.string(),
  kind: z.literal('summary'),
  title: z.string(),
  userHeading: z.string(),
  description: z.string(),
  components: z.array(SummaryComponentSchema).readonly(),
  severityOrder: z.array(InsightSeveritySchema).readonly(),
  severityLabels: z.object({
    positive: SeverityLabelSchema,
    info: SeverityLabelSchema,
    warning: SeverityLabelSchema,
    critical: SeverityLabelSchema,
  }),
})
export type SummaryNode = z.infer<typeof SummaryNodeSchema>

export const ScoreBandsSchema = z.array(ScoreBandSchema).readonly()
