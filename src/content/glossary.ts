/**
 * Glosario de términos del diagnóstico.
 *
 * Cada pregunta lista los `glossaryTerms` que usa, y la UI muestra abajo del
 * árbol de decisiones las definiciones correspondientes. Los ejemplos viven
 * en las preguntas/opciones de `diagnosis.ts`, no aquí.
 *
 * El contenido vive en `src/content/data/glossary.json`.
 */

import glossaryData from './data/glossary.json'
import {parseContent} from './_loader'
import {GlossarySchema} from './schemas/glossary'

export type {GlossaryEntry} from './schemas/glossary'

import type {GlossaryEntry} from './schemas/glossary'

export const GLOSSARY: Record<string, GlossaryEntry> = parseContent(GlossarySchema, glossaryData)

export const getGlossaryEntries = (ids: readonly string[]): GlossaryEntry[] => {
  const seen = new Set<string>()
  const result: GlossaryEntry[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    const entry = GLOSSARY[id]
    if (entry) {
      result.push(entry)
      seen.add(id)
    }
  }
  return result
}
