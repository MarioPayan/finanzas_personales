/**
 * Resolución del glosario para un nodo concreto del diagnóstico.
 *
 * El glosario es contextual: cada pregunta declara `glossaryTerms` con
 * términos que considera relevantes, y este módulo filtra para mostrar
 * sólo los que efectivamente aparecen en el texto visible de la
 * pregunta (prompt, hint, tips, opciones). `title` y `description` son
 * metadatos internos y NO entran al haystack.
 *
 * Vive como utilidad porque varios consumidores la necesitan: hoy el
 * cuerpo de la pregunta lo renderiza inline; en el pasado vivía en el
 * sidebar derecho.
 */

import type {DiagnosisQuestion} from '../content/diagnosis'
import {getGlossaryEntries, type GlossaryEntry} from '../content/glossary'

const DIACRITICS_RE = /[\u0300-\u036f]/g

const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '')

const collectChipsText = (
  options: readonly {label: string; sublabel?: string; examples?: readonly string[]}[],
): string[] => {
  const parts: string[] = []
  for (const o of options) {
    parts.push(o.label)
    if (o.sublabel) parts.push(o.sublabel)
    if (o.examples) parts.push(...o.examples)
  }
  return parts
}

const getQuestionText = (q: DiagnosisQuestion): string => {
  const parts: string[] = [q.prompt]
  if (q.hint) parts.push(q.hint)
  if (q.tips) parts.push(...q.tips)
  if (q.type === 'chips' || q.type === 'multiChips') {
    parts.push(...collectChipsText(q.options))
  } else if (q.type === 'toggle') {
    if (q.trueLabel) parts.push(q.trueLabel)
    if (q.falseLabel) parts.push(q.falseLabel)
  } else if (q.type === 'grid' && q.cell.kind === 'chips') {
    parts.push(...collectChipsText(q.cell.options))
  }
  return parts.join(' ')
}

export const getQuestionGlossary = (q: DiagnosisQuestion): GlossaryEntry[] => {
  if (!q.glossaryTerms?.length) return []
  const haystack = normalize(getQuestionText(q))
  return getGlossaryEntries(q.glossaryTerms).filter(e =>
    haystack.includes(normalize(e.term)),
  )
}
