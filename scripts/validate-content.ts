/**
 * Valida cada JSON en src/content/data/ contra su schema zod.
 *
 * Falla con código ≠0 al primer error, imprimiendo el path del campo
 * inválido y el mensaje de zod. Se ejecuta automáticamente como
 * `prebuild` y `pretest`, o a mano con `pnpm validate:content`.
 */

import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

import type {ZodTypeAny} from 'zod'

import {
  CanonicalProfilesSchema,
  CreditScoreBandsListSchema,
  DiagnosisQuestionsSchema,
  FunnyNamesSchema,
  GlossarySchema,
  IncomeBenchmarksSchema,
  MinimumWagesSchema,
  ProfileBandsSchema,
  SectionProfilesSchema,
  SummaryNodeSchema,
  ToneBandsSchema,
} from '../src/content/schemas'

const DATA_ROOT = resolve(import.meta.dirname, '../src/content/data')

const CATEGORIES = [
  'profile',
  'income',
  'expenses',
  'habits',
  'debt',
  'stability',
  'protection',
  'investment',
] as const

type Check = {label: string; path: string; schema: ZodTypeAny}

const checks: Check[] = [
  ...CATEGORIES.map(cat => ({
    label: `diagnosis/${cat}`,
    path: `diagnosis/${cat}.json`,
    schema: DiagnosisQuestionsSchema as ZodTypeAny,
  })),
  {label: 'toneBands', path: 'toneBands.json', schema: ToneBandsSchema},
  {label: 'summaryNode', path: 'summaryNode.json', schema: SummaryNodeSchema},
  {label: 'foundationProfiles', path: 'foundationProfiles.json', schema: ProfileBandsSchema},
  {label: 'sectionProfiles', path: 'sectionProfiles.json', schema: SectionProfilesSchema},
  {label: 'funnyNames', path: 'funnyNames.json', schema: FunnyNamesSchema},
  {label: 'glossary', path: 'glossary.json', schema: GlossarySchema},
  {label: 'canonicalProfiles', path: 'canonicalProfiles.json', schema: CanonicalProfilesSchema},
  {label: 'creditScoreBands', path: 'creditScoreBands.json', schema: CreditScoreBandsListSchema},
  {label: 'incomeBenchmarks', path: 'incomeBenchmarks.json', schema: IncomeBenchmarksSchema},
  {label: 'minimumWages', path: 'minimumWages.json', schema: MinimumWagesSchema},
]

let failed = 0
for (const check of checks) {
  const full = resolve(DATA_ROOT, check.path)
  const raw = JSON.parse(readFileSync(full, 'utf8'))
  const result = check.schema.safeParse(raw)
  if (result.success) {
    console.log(`✓ ${check.label}`)
  } else {
    failed++
    console.error(`✗ ${check.label}`)
    for (const issue of result.error.issues) {
      const path = issue.path.length ? issue.path.join('.') : '(root)'
      console.error(`    ${path}: ${issue.message}`)
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} archivo${failed === 1 ? '' : 's'} con errores.`)
  process.exit(1)
}
console.log('\nTodo el contenido válido.')
