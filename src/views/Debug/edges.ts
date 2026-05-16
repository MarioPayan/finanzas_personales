import {
  type DependencyClause,
  type DiagnosisQuestion,
} from '../../content/diagnosis'
import {extractReferencedKeys} from '../../utils/insights'

export type EdgeKind = 'flow' | 'skip' | 'derivation' | 'rowSource' | 'insight'

export type RawEdge = {
  source: string
  target: string
  kind: EdgeKind
  label?: string
}

export const EDGE_LEGEND: Record<EdgeKind, string> = {
  flow: 'Flujo principal (siguiente paso)',
  skip: 'Salto (rama negativa del gate)',
  derivation: 'Derivación (consume valor)',
  rowSource: 'rowSource (genera filas)',
  insight: 'Insight (analiza respuesta)',
}

const formatDependencyLabel = (
  clause: DependencyClause,
  gate: DiagnosisQuestion,
): string => {
  if (clause.equals !== undefined) {
    if (gate.type === 'toggle')
      return clause.equals === true ? (gate.trueLabel ?? 'Sí') : (gate.falseLabel ?? 'No')
    if (gate.type === 'chips')
      return gate.options.find(o => o.value === clause.equals)?.label ?? String(clause.equals)
    return String(clause.equals)
  }
  if (clause.in) {
    if (gate.type === 'chips')
      return clause.in
        .map(v => gate.options.find(o => o.value === v)?.label ?? String(v))
        .join(' / ')
    return `∈ [${clause.in.join(', ')}]`
  }
  if (clause.greaterThan !== undefined) return `> ${clause.greaterThan}`
  if (clause.nonEmpty) return 'no vacío'
  return ''
}

const negationLabel = (
  clause: DependencyClause,
  gate: DiagnosisQuestion,
): string => {
  if (clause.equals !== undefined) {
    if (gate.type === 'toggle')
      return clause.equals === true ? (gate.falseLabel ?? 'No') : (gate.trueLabel ?? 'Sí')
    return 'otro valor'
  }
  if (clause.in) return 'otro valor'
  return 'no se cumple'
}

export const buildEdges = (questions: readonly DiagnosisQuestion[]): RawEdge[] => {
  const result: RawEdge[] = []
  const byKey = new Map(questions.map(q => [q.storageKey, q] as const))
  const idxOf = (k: string) => questions.findIndex(q => q.storageKey === k)

  for (let i = 0; i < questions.length - 1; i++) {
    const curr = questions[i]
    const next = questions[i + 1]
    const directDep = next.dependsOn?.find(c => c.storageKey === curr.storageKey)
    const label = directDep ? formatDependencyLabel(directDep, curr) : undefined
    result.push({source: curr.storageKey, target: next.storageKey, kind: 'flow', label})
  }

  const gates = new Set<string>()
  for (const q of questions) {
    if (q.dependsOn) for (const c of q.dependsOn) gates.add(c.storageKey)
  }
  for (const gateKey of gates) {
    const gate = byKey.get(gateKey)
    if (!gate) continue
    if (gate.type !== 'toggle' && gate.type !== 'chips') continue
    const gateIdx = idxOf(gateKey)
    if (gateIdx < 0) continue
    const firstDependent = questions.find(q =>
      q.dependsOn?.some(c => c.storageKey === gateKey),
    )
    const clauseOnGate = firstDependent?.dependsOn?.find(c => c.storageKey === gateKey)
    if (!clauseOnGate) continue
    let nonDepIdx = -1
    for (let i = gateIdx + 1; i < questions.length; i++) {
      const depsOnGate = questions[i].dependsOn?.some(c => c.storageKey === gateKey) ?? false
      if (!depsOnGate) {
        nonDepIdx = i
        break
      }
    }
    if (nonDepIdx > 0 && nonDepIdx !== gateIdx + 1) {
      result.push({
        source: gateKey,
        target: questions[nonDepIdx].storageKey,
        kind: 'skip',
        label: negationLabel(clauseOnGate, gate),
      })
    }
  }

  for (const q of questions) {
    if (!q.derivation) continue
    for (const k of q.derivation.inputs) {
      result.push({source: k, target: q.storageKey, kind: 'derivation', label: q.derivation.kind})
    }
  }

  for (const q of questions) {
    if (q.type !== 'grid') continue
    result.push({
      source: q.rowSource.storageKey,
      target: q.storageKey,
      kind: 'rowSource',
      label: `filas (${q.rowSource.kind})`,
    })
  }

  for (const q of questions) {
    if (!q.insights) continue
    for (const ins of q.insights) {
      const refs = extractReferencedKeys(ins.when)
      for (const r of refs) {
        if (r === q.storageKey) continue
        result.push({source: q.storageKey, target: r, kind: 'insight', label: ins.id})
      }
    }
  }

  return result
}
