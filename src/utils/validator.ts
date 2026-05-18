/**
 * Validador declarativo del cuestionario.
 *
 * Lee `DIAGNOSIS_QUESTIONS`, `GLOSSARY`, los nodos de resultado, y reporta
 * inconsistencias estructurales sin ejecutar la app:
 *
 *   - referencias rotas (insight condition / dependsOn / derivation /
 *     rowSource / glossaryTerms apuntando a algo inexistente),
 *   - orden inválido (dependsOn apuntando a un nodo posterior en el flujo),
 *   - scoring faltante (opciones sin score, sliders sin score, etc.),
 *   - nodos con `max > 0` sin insights (sospecha de "ruta muda"),
 *   - severities fuera del set válido (defensa contra cambios futuros).
 *
 * Es una herramienta interna — no se ejecuta en producción. Vive en
 * `/debug` como pestaña "Validador".
 */

import {
  DIAGNOSIS_QUESTIONS,
  SECTION_SCORE_NODES,
  SUMMARY_NODE,
  type ChipsQuestion,
  type DiagnosisQuestion,
  type GridQuestion,
  type Insight,
  type InsightCondition,
  type InsightSeverity,
  type MultiChipsQuestion,
} from '../content/diagnosis'
import {GLOSSARY} from '../content/glossary'

export type IssueSeverity = 'error' | 'warning' | 'info'

export type IssueCategory =
  | 'reference' // apunta a algo inexistente
  | 'flow' // orden / gates
  | 'scoring' // brechas de puntaje
  | 'insights' // problemas con insights
  | 'glossary' // problemas con glosario

export type ValidationIssue = {
  severity: IssueSeverity
  category: IssueCategory
  message: string
  /** storageKey del nodo donde se detectó el problema, si aplica. */
  nodeKey?: string
  /** id del insight donde se detectó, si aplica. */
  insightId?: string
}

export type ValidationReport = {
  issues: readonly ValidationIssue[]
  totals: {
    nodes: number
    insights: number
    errors: number
    warnings: number
    infos: number
  }
}

const VALID_SEVERITIES: ReadonlySet<InsightSeverity> = new Set<InsightSeverity>([
  'positive',
  'info',
  'warning',
  'critical',
])

const NODE_INDEX = new Map<string, {index: number; q: DiagnosisQuestion}>()
DIAGNOSIS_QUESTIONS.forEach((q, index) => NODE_INDEX.set(q.storageKey, {index, q}))

const RESULT_KEYS = new Set<string>([
  SUMMARY_NODE.storageKey,
  ...SECTION_SCORE_NODES.map(n => n.storageKey),
])

const isKnownStorageKey = (key: string) => NODE_INDEX.has(key) || RESULT_KEYS.has(key)

/** Recorre una condición y devuelve todos los `key`s atómicos que toca. */
const collectInsightConditionKeys = (cond: InsightCondition): string[] => {
  switch (cond.kind) {
    case 'all':
    case 'any':
      return cond.of.flatMap(collectInsightConditionKeys)
    case 'not':
      return collectInsightConditionKeys(cond.of)
    case 'equals':
    case 'in':
    case 'numberAbove':
    case 'numberBelow':
    case 'numberAtLeast':
    case 'numberAtMost':
    case 'multiHas':
    case 'multiCountAtLeast':
    case 'multiCountAtMost':
    case 'gridAnyIn':
    case 'gridEveryIn':
    case 'gridCountInAtLeast':
    case 'gridAnyNumberAbove':
    case 'gridAnyNumberBelow':
    case 'gridEveryNumberBelow':
      return [cond.key]
    // Derivados (ingreso vs SMM / media nacional / monto obligatorio) — no
    // referencian un `key` directamente, sino que computan sobre `incomeBand`
    // o `obligatoryPct`. Esos están asumidos como nodos siempre presentes.
    case 'incomeBelowSmmTimes':
    case 'incomeAboveSmmTimes':
    case 'incomeBelowCountryAverageTimes':
    case 'incomeAboveCountryAverageTimes':
    case 'obligatoryAbsoluteBelowSmmTimes':
    case 'obligatoryAbsoluteAboveSmmTimes':
      return []
  }
}

const checkInsight = (ownerKey: string, ins: Insight, issues: ValidationIssue[]) => {
  if (!VALID_SEVERITIES.has(ins.severity ?? 'info')) {
    issues.push({
      severity: 'error',
      category: 'insights',
      message: `Severidad "${ins.severity}" fuera del set válido.`,
      nodeKey: ownerKey,
      insightId: ins.id,
    })
  }
  for (const key of collectInsightConditionKeys(ins.when)) {
    if (!isKnownStorageKey(key)) {
      issues.push({
        severity: 'error',
        category: 'reference',
        message: `Condición referencia "${key}" pero no existe ningún nodo con ese storageKey.`,
        nodeKey: ownerKey,
        insightId: ins.id,
      })
    }
  }
  if (!ins.diagnostic.trim()) {
    issues.push({
      severity: 'warning',
      category: 'insights',
      message: `Insight "${ins.id}" no tiene diagnostic.`,
      nodeKey: ownerKey,
      insightId: ins.id,
    })
  }
  if (!ins.tip.trim()) {
    issues.push({
      severity: 'warning',
      category: 'insights',
      message: `Insight "${ins.id}" no tiene tip.`,
      nodeKey: ownerKey,
      insightId: ins.id,
    })
  }
}

const checkDependsOn = (q: DiagnosisQuestion, issues: ValidationIssue[]) => {
  if (!q.dependsOn) return
  const ownIndex = NODE_INDEX.get(q.storageKey)?.index ?? -1
  for (const clause of q.dependsOn) {
    const target = NODE_INDEX.get(clause.storageKey)
    if (!target) {
      issues.push({
        severity: 'error',
        category: 'reference',
        message: `dependsOn referencia "${clause.storageKey}" pero no existe ningún nodo con ese storageKey.`,
        nodeKey: q.storageKey,
      })
      continue
    }
    if (target.index >= ownIndex) {
      issues.push({
        severity: 'error',
        category: 'flow',
        message: `dependsOn referencia "${clause.storageKey}" que aparece después en el flujo (posición ${target.index + 1} ≥ ${ownIndex + 1}).`,
        nodeKey: q.storageKey,
      })
    }
  }
}

const checkDerivation = (q: DiagnosisQuestion, issues: ValidationIssue[]) => {
  if (!q.derivation) return
  for (const key of q.derivation.inputs) {
    if (!isKnownStorageKey(key)) {
      issues.push({
        severity: 'error',
        category: 'reference',
        message: `derivation.inputs incluye "${key}" pero no existe ningún nodo con ese storageKey.`,
        nodeKey: q.storageKey,
      })
    }
  }
}

const checkRowSource = (q: DiagnosisQuestion, issues: ValidationIssue[]) => {
  if (q.type !== 'grid') return
  const target = NODE_INDEX.get(q.rowSource.storageKey)
  if (!target) {
    issues.push({
      severity: 'error',
      category: 'reference',
      message: `rowSource.storageKey "${q.rowSource.storageKey}" no existe.`,
      nodeKey: q.storageKey,
    })
    return
  }
  const ownIndex = NODE_INDEX.get(q.storageKey)?.index ?? -1
  if (target.index >= ownIndex) {
    issues.push({
      severity: 'error',
      category: 'flow',
      message: `rowSource depende de "${q.rowSource.storageKey}" que aparece después en el flujo.`,
      nodeKey: q.storageKey,
    })
  }
}

const checkGlossary = (q: DiagnosisQuestion, issues: ValidationIssue[]) => {
  if (!q.glossaryTerms) return
  for (const term of q.glossaryTerms) {
    if (!GLOSSARY[term]) {
      issues.push({
        severity: 'error',
        category: 'glossary',
        message: `glossaryTerms incluye "${term}" pero no está definido en GLOSSARY.`,
        nodeKey: q.storageKey,
      })
    }
  }
}

const checkChipsScoring = (q: ChipsQuestion, issues: ValidationIssue[]) => {
  const optionsWithoutScore = q.options.filter(
    o => o.score === undefined || o.score === null,
  ).length
  if (optionsWithoutScore === q.options.length && !q.exactScore) {
    issues.push({
      severity: 'info',
      category: 'scoring',
      message: 'Todas las opciones tienen score undefined — el nodo no aporta puntaje.',
      nodeKey: q.storageKey,
    })
  }
}

const checkMultiChipsScoring = (q: MultiChipsQuestion, issues: ValidationIssue[]) => {
  const optionsWithoutScore = q.options.filter(
    o => o.score === undefined || o.score === null,
  ).length
  if (optionsWithoutScore === q.options.length) {
    issues.push({
      severity: 'info',
      category: 'scoring',
      message: 'Todas las opciones tienen score undefined — el nodo no aporta puntaje.',
      nodeKey: q.storageKey,
    })
  }
}

const checkGridScoring = (q: GridQuestion, issues: ValidationIssue[]) => {
  if (q.cell.kind === 'chips') {
    const optionsWithoutScore = q.cell.options.filter(
      o => o.score === undefined || o.score === null,
    ).length
    if (optionsWithoutScore === q.cell.options.length && !q.cell.exactScore) {
      issues.push({
        severity: 'info',
        category: 'scoring',
        message: 'Todas las celdas chips tienen score undefined — el grid no aporta puntaje.',
        nodeKey: q.storageKey,
      })
    }
  }
}

const checkInsightCoverage = (q: DiagnosisQuestion, issues: ValidationIssue[]) => {
  // Si el nodo está marcado como informativo (sin scoring de ningún tipo), no
  // es preocupante que no tenga insights. Si tiene scoring, "ningún insight"
  // es señal de que la sección final puede silenciar info útil.
  const hasInsights = (q.insights?.length ?? 0) > 0
  if (hasInsights) return
  // Determinar si el nodo aporta puntaje
  const aportaPuntaje =
    (q.type === 'chips' && q.options.some(o => (o.score ?? 0) > 0)) ||
    (q.type === 'multiChips' && q.options.some(o => (o.score ?? 0) > 0)) ||
    (q.type === 'slider' && !!q.score) ||
    (q.type === 'toggle' && !!q.score) ||
    (q.type === 'number' && !!q.score) ||
    (q.type === 'grid' && q.cell.kind === 'chips' && q.cell.options.some(o => (o.score ?? 0) > 0))
  if (aportaPuntaje) {
    issues.push({
      severity: 'info',
      category: 'insights',
      message:
        'Nodo con scoring pero sin insights declarados — el usuario recibe puntos pero no ve un diagnóstico textual.',
      nodeKey: q.storageKey,
    })
  }
}

export const validateDiagnosis = (): ValidationReport => {
  const issues: ValidationIssue[] = []
  let insightCount = 0

  for (const q of DIAGNOSIS_QUESTIONS) {
    checkDependsOn(q, issues)
    checkDerivation(q, issues)
    checkRowSource(q, issues)
    checkGlossary(q, issues)
    checkInsightCoverage(q, issues)
    if (q.type === 'chips') checkChipsScoring(q, issues)
    if (q.type === 'multiChips') checkMultiChipsScoring(q, issues)
    if (q.type === 'grid') checkGridScoring(q, issues)
    if (q.insights) {
      insightCount += q.insights.length
      const seenIds = new Set<string>()
      for (const ins of q.insights) {
        if (seenIds.has(ins.id)) {
          issues.push({
            severity: 'error',
            category: 'insights',
            message: `Id de insight duplicado dentro del nodo: "${ins.id}".`,
            nodeKey: q.storageKey,
            insightId: ins.id,
          })
        }
        seenIds.add(ins.id)
        checkInsight(q.storageKey, ins, issues)
      }
    }
  }

  // Storage keys duplicadas entre nodos
  const seenKeys = new Set<string>()
  for (const q of DIAGNOSIS_QUESTIONS) {
    if (seenKeys.has(q.storageKey)) {
      issues.push({
        severity: 'error',
        category: 'reference',
        message: `storageKey duplicado: "${q.storageKey}".`,
        nodeKey: q.storageKey,
      })
    }
    seenKeys.add(q.storageKey)
  }

  const totals = {
    nodes: DIAGNOSIS_QUESTIONS.length,
    insights: insightCount,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    infos: issues.filter(i => i.severity === 'info').length,
  }

  return {issues, totals}
}
