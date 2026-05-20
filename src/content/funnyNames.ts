/**
 * Lista de nombres ligeros con sabor LatAm que la app usa como alias
 * provisional del usuario en la pantalla de intro. Combinan un animal
 * (la mayoría latinoamericanos) con un adjetivo de tono financiero o
 * de personalidad — la idea es que el usuario se ría, no que tome la
 * etiqueta en serio.
 *
 * El contenido vive en `src/content/data/funnyNames.json` para que
 * editores no-devs puedan agregar entradas sin tocar TS.
 */

import funnyNamesData from './data/funnyNames.json'
import {parseContent} from './_loader'
import {FunnyNamesSchema} from './schemas/funnyNames'

export const FUNNY_NAMES: readonly string[] = parseContent(FunnyNamesSchema, funnyNamesData)

const pickIndex = (max: number): number => Math.floor(Math.random() * max)

/** Devuelve un nombre al azar de la lista. Pure-ish: depende de Math.random. */
export const pickRandomName = (): string => FUNNY_NAMES[pickIndex(FUNNY_NAMES.length)]

/**
 * Devuelve un nombre distinto al actual. Sirve para el botón "Cambiar"
 * de la pantalla de intro: garantiza que algo cambia en el rerender.
 * Si la lista tiene un único elemento, devuelve ese mismo.
 */
export const pickDifferentName = (current: string): string => {
  if (FUNNY_NAMES.length <= 1) return FUNNY_NAMES[0] ?? current
  let next = current
  // En la práctica converge en 1-2 intentos; pongo un techo defensivo.
  for (let i = 0; i < 8 && next === current; i++) {
    next = pickRandomName()
  }
  return next
}
