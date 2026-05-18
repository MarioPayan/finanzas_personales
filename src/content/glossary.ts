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
    definition:
      'Salario Mínimo Mensual: el ingreso mínimo legal en tu país, fijado por el gobierno. Lo usamos como referencia para que las preguntas funcionen sin importar la moneda.',
  },
  ea: {
    id: 'ea',
    term: 'EA',
    definition:
      'Tasa Efectiva Anual: cuánto crece una deuda en un año si no pagas nada. Es la forma estándar de comparar tasas entre productos.',
  },
  fondoEmergencia: {
    id: 'fondoEmergencia',
    term: 'Fondo de emergencia',
    definition:
      'Dinero líquido reservado para imprevistos (despido, salud, daño grave). Se mide en meses de tus gastos obligatorios.',
  },
  cdt: {
    id: 'cdt',
    term: 'CDT',
    definition:
      'Certificado de Depósito a Término: un producto bancario donde dejas dinero un plazo fijo a cambio de una tasa garantizada.',
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
    definition:
      'Deuda tomada para gastos que no producen ingreso ni evitan otro gasto. Suele ser la más urgente de pagar.',
  },
  fondoIndexado: {
    id: 'fondoIndexado',
    term: 'Fondo indexado',
    definition:
      'Vehículo que replica un índice de mercado (S&P 500, MSCI World, etc.) a bajo costo, en vez de elegir activos uno por uno. En plazos largos le gana a la mayoría de fondos gestionados activamente.',
  },
  regla72: {
    id: 'regla72',
    term: 'Regla del 72',
    definition:
      'Atajo mental para saber en cuánto se duplica el dinero: divide 72 entre la tasa anual. Al 6% tarda 12 años; al 10%, 7,2 años. Sirve para comparar vehículos sin calculadora.',
  },
  dca: {
    id: 'dca',
    term: 'DCA (Dollar Cost Averaging)',
    definition:
      'Aportar un monto fijo en intervalos regulares (semanal, quincenal, mensual). Evita tratar de adivinar el mejor momento; promedia el precio en el tiempo. Es la estrategia más efectiva para no-traders.',
  },
  fire: {
    id: 'fire',
    term: 'FIRE / Regla del 4%',
    definition:
      'Financial Independence, Retire Early. Heurística clásica: si juntas un capital igual a 25 veces tus gastos anuales (regla del 4%), puedes vivir de los rendimientos. En Latinoamérica conviene ajustar a 28,5× (3,5%) por impuestos y volatilidad cambiaria.',
  },
  nmvVsEa: {
    id: 'nmvVsEa',
    term: 'EA vs NMV',
    definition:
      'EA = Tasa Efectiva Anual (incluye capitalización). NMV = Tasa Nominal Mensual Vencida (cuota mensual sin componerse). Una tasa "1,5% NMV" suena baja pero equivale a ~19,6% EA. Siempre comparar en EA.',
  },
  tasaUsura: {
    id: 'tasaUsura',
    term: 'Tasa de usura',
    definition:
      'Tope legal de interés en Colombia, fijado por la Superintendencia Financiera. Para consumo en mayo 2026: 28,17% EA. Sirve como benchmark: cualquier tasa cerca de la usura conviene refinanciar.',
  },
  fogafin: {
    id: 'fogafin',
    term: 'Fogafín',
    definition:
      'Fondo de Garantías de Instituciones Financieras de Colombia. Garantiza tus depósitos en bancos y CDTs hasta 50 millones de pesos por entidad. Es lo que hace que el CDT sea de bajo riesgo real.',
  },
  compraDeCartera: {
    id: 'compraDeCartera',
    term: 'Compra de cartera',
    definition:
      'Operación donde un banco "compra" tus deudas con otras entidades y las consolida en un único crédito, generalmente a tasa más baja y plazo más largo. Útil con varias deudas activas y tasas altas; cuidado con extender el plazo sin reducir gasto.',
  },
  arl: {
    id: 'arl',
    term: 'ARL',
    definition:
      'Administradora de Riesgos Laborales. Seguro que cubre accidentes y enfermedades de origen laboral. Obligatoria para empleados formales e independientes con contrato de servicios mayor a un mes en Colombia.',
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
