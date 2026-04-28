/**
 * Glosario de términos del diagnóstico.
 *
 * Cada pregunta lista los `glossaryTerms` que usa, y la UI muestra abajo del
 * árbol de decisiones las definiciones correspondientes. Los ejemplos viven
 * en las preguntas/opciones de `diagnosis.ts`, no aquí.
 */

export type GlossaryEntry = {
  id: string
  term: string
  definition: string
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  smm: {
    id: 'smm',
    term: 'SMM',
    definition: 'Salario Mínimo Mensual: el ingreso mínimo legal en tu país, fijado por el gobierno. Lo usamos como referencia para que las preguntas funcionen sin importar la moneda.',
  },
  ea: {
    id: 'ea',
    term: 'EA',
    definition: 'Tasa Efectiva Anual: cuánto crece una deuda en un año si no pagas nada. Es la forma estándar de comparar tasas entre productos.',
  },
  gastosObligatorios: {
    id: 'gastosObligatorios',
    term: 'Gastos obligatorios',
    definition: 'Lo que no puedes dejar de pagar este mes sin consecuencias serias: vivienda, servicios, transporte, comida básica, salud.',
  },
  fondoEmergencia: {
    id: 'fondoEmergencia',
    term: 'Fondo de emergencia',
    definition: 'Dinero líquido reservado para imprevistos (despido, salud, daño grave). Se mide en meses de tus gastos obligatorios.',
  },
  cdt: {
    id: 'cdt',
    term: 'CDT',
    definition: 'Certificado de Depósito a Término: un producto bancario donde dejas dinero un plazo fijo a cambio de una tasa garantizada.',
  },
  diversificacion: {
    id: 'diversificacion',
    term: 'Diversificación',
    definition: 'Repartir el dinero en distintos vehículos (acciones, fondos, bienes raíces, etc.) para que un mal año en uno no destruya todo.',
  },
  debtKindInvestment: {
    id: 'debtKindInvestment',
    term: 'Deuda de inversión',
    definition: 'Deuda que toma para producir más dinero del que cuesta el interés.',
  },
  debtKindSavings: {
    id: 'debtKindSavings',
    term: 'Deuda de ahorro',
    definition: 'Deuda que reemplaza un gasto recurrente por un activo que conservas.',
  },
  debtKindBad: {
    id: 'debtKindBad',
    term: 'Deuda mala',
    definition: 'Deuda tomada para gastos que no producen ingreso ni evitan otro gasto. Suele ser la más urgente de pagar.',
  },
}

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
