/**
 * Rangos del puntaje crediticio por país (continente americano). Lo
 * consume el widget `creditScoreScale` del sidebar para mostrarle al
 * usuario qué números corresponden a cada banda en su país.
 *
 * Las bandas son las mismas cuatro categorías que usa el nodo
 * `creditScoreBand` en `diagnosis.ts` (`bad` / `regular` / `good` /
 * `excellent`), normalizadas: muchos burós usan 5 bandas (incluyendo
 * "muy bueno"); las colapsamos a 4 sumando el "muy bueno" al "bueno"
 * o "excelente" según el país.
 *
 * `verified: true` indica fuente confirmada (FICO, Datacrédito,
 * Serasa, Equifax/TransUnion oficiales). `verified: false` significa
 * que el rango es una aproximación coherente con la escala genérica
 * del buró del país.
 */

export type CreditScoreBandRange = {min: number; max: number}

export type CreditScoreBands = {
  /** ISO 3166-1 alpha-2. */
  countryCode: string
  /** Nombre del buró o sistema de scoring del país. */
  bureau: string
  scoreMin: number
  scoreMax: number
  ranges: Record<'bad' | 'regular' | 'good' | 'excellent', CreditScoreBandRange>
  verified: boolean
}

export const CREDIT_SCORE_BANDS: readonly CreditScoreBands[] = [
  // Norteamérica
  {
    countryCode: 'US',
    bureau: 'FICO Score',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 579},
      regular: {min: 580, max: 669},
      good: {min: 670, max: 739},
      excellent: {min: 740, max: 850},
    },
    verified: true,
  },
  {
    countryCode: 'CA',
    bureau: 'Equifax / TransUnion',
    scoreMin: 300,
    scoreMax: 900,
    ranges: {
      bad: {min: 300, max: 559},
      regular: {min: 560, max: 659},
      good: {min: 660, max: 759},
      excellent: {min: 760, max: 900},
    },
    verified: true,
  },
  {
    countryCode: 'MX',
    bureau: 'Buró de Crédito (Mi Score)',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 549},
      regular: {min: 550, max: 649},
      good: {min: 650, max: 749},
      excellent: {min: 750, max: 850},
    },
    verified: true,
  },

  // Latinoamérica con datos confirmados
  {
    countryCode: 'CO',
    bureau: 'Datacrédito',
    scoreMin: 150,
    scoreMax: 950,
    ranges: {
      bad: {min: 150, max: 549},
      regular: {min: 550, max: 660},
      good: {min: 661, max: 780},
      excellent: {min: 781, max: 950},
    },
    verified: true,
  },
  {
    countryCode: 'BR',
    bureau: 'Serasa Score',
    scoreMin: 0,
    scoreMax: 1000,
    ranges: {
      bad: {min: 0, max: 300},
      regular: {min: 301, max: 500},
      good: {min: 501, max: 700},
      excellent: {min: 701, max: 1000},
    },
    verified: true,
  },
  {
    countryCode: 'AR',
    bureau: 'Veraz / Equifax',
    scoreMin: 0,
    scoreMax: 999,
    ranges: {
      bad: {min: 0, max: 549},
      regular: {min: 550, max: 699},
      good: {min: 700, max: 849},
      excellent: {min: 850, max: 999},
    },
    verified: true,
  },
  {
    countryCode: 'CL',
    bureau: 'DICOM / Equifax',
    scoreMin: 0,
    scoreMax: 999,
    ranges: {
      bad: {min: 0, max: 549},
      regular: {min: 550, max: 699},
      good: {min: 700, max: 849},
      excellent: {min: 850, max: 999},
    },
    verified: false,
  },
  {
    countryCode: 'PE',
    bureau: 'Sentinel / Equifax',
    scoreMin: 0,
    scoreMax: 999,
    ranges: {
      bad: {min: 0, max: 549},
      regular: {min: 550, max: 699},
      good: {min: 700, max: 849},
      excellent: {min: 850, max: 999},
    },
    verified: false,
  },
  {
    countryCode: 'UY',
    bureau: 'Equifax Uruguay',
    scoreMin: 0,
    scoreMax: 999,
    ranges: {
      bad: {min: 0, max: 549},
      regular: {min: 550, max: 699},
      good: {min: 700, max: 849},
      excellent: {min: 850, max: 999},
    },
    verified: false,
  },

  // Centroamérica y Caribe — escala FICO-like de los burós regionales
  {
    countryCode: 'CR',
    bureau: 'TransUnion / Equifax',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 579},
      regular: {min: 580, max: 669},
      good: {min: 670, max: 739},
      excellent: {min: 740, max: 850},
    },
    verified: false,
  },
  {
    countryCode: 'PA',
    bureau: 'APC / TransUnion',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 579},
      regular: {min: 580, max: 669},
      good: {min: 670, max: 739},
      excellent: {min: 740, max: 850},
    },
    verified: false,
  },
  {
    countryCode: 'DO',
    bureau: 'TransUnion DR',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 579},
      regular: {min: 580, max: 669},
      good: {min: 670, max: 739},
      excellent: {min: 740, max: 850},
    },
    verified: false,
  },
  {
    countryCode: 'EC',
    bureau: 'Equifax Ecuador',
    scoreMin: 300,
    scoreMax: 999,
    ranges: {
      bad: {min: 300, max: 549},
      regular: {min: 550, max: 699},
      good: {min: 700, max: 849},
      excellent: {min: 850, max: 999},
    },
    verified: false,
  },
  {
    countryCode: 'GT',
    bureau: 'TransUnion Guatemala',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 579},
      regular: {min: 580, max: 669},
      good: {min: 670, max: 739},
      excellent: {min: 740, max: 850},
    },
    verified: false,
  },
  {
    countryCode: 'HN',
    bureau: 'Equifax Honduras',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 579},
      regular: {min: 580, max: 669},
      good: {min: 670, max: 739},
      excellent: {min: 740, max: 850},
    },
    verified: false,
  },
  {
    countryCode: 'NI',
    bureau: 'TransUnion Nicaragua',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 579},
      regular: {min: 580, max: 669},
      good: {min: 670, max: 739},
      excellent: {min: 740, max: 850},
    },
    verified: false,
  },
  {
    countryCode: 'SV',
    bureau: 'Equifax El Salvador',
    scoreMin: 300,
    scoreMax: 850,
    ranges: {
      bad: {min: 300, max: 579},
      regular: {min: 580, max: 669},
      good: {min: 670, max: 739},
      excellent: {min: 740, max: 850},
    },
    verified: false,
  },
  {
    countryCode: 'PY',
    bureau: 'Equifax Paraguay (Informconf)',
    scoreMin: 0,
    scoreMax: 999,
    ranges: {
      bad: {min: 0, max: 549},
      regular: {min: 550, max: 699},
      good: {min: 700, max: 849},
      excellent: {min: 850, max: 999},
    },
    verified: false,
  },
  {
    countryCode: 'BO',
    bureau: 'Infocred / Enserbic',
    scoreMin: 0,
    scoreMax: 999,
    ranges: {
      bad: {min: 0, max: 549},
      regular: {min: 550, max: 699},
      good: {min: 700, max: 849},
      excellent: {min: 850, max: 999},
    },
    verified: false,
  },
  {
    countryCode: 'VE',
    bureau: 'Sicri / SUDEBAN',
    scoreMin: 0,
    scoreMax: 999,
    ranges: {
      bad: {min: 0, max: 549},
      regular: {min: 550, max: 699},
      good: {min: 700, max: 849},
      excellent: {min: 850, max: 999},
    },
    verified: false,
  },
  // Cuba: el sistema bancario no tiene buró de crédito al estilo de
  // los demás países; lo omitimos a propósito en lugar de inventar una
  // escala que no aplica.
]

export const findCreditScoreBands = (countryCode: string): CreditScoreBands | undefined =>
  CREDIT_SCORE_BANDS.find(b => b.countryCode === countryCode)
