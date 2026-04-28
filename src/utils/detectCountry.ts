/**
 * Detección de país a partir del navegador.
 *
 * Usamos zona horaria y `navigator.language` como pistas. No pedimos permisos
 * (geolocation) porque es para una caja informativa, no para datos sensibles.
 */

import {MINIMUM_WAGES, type MinimumWageEntry} from '../content/minimumWages'

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Argentina/Cordoba': 'AR',
  'America/Argentina/Mendoza': 'AR',
  'America/Argentina/Salta': 'AR',
  'America/Argentina/Tucuman': 'AR',
  'America/Argentina/Ushuaia': 'AR',
  'America/Argentina/Catamarca': 'AR',
  'America/Argentina/Jujuy': 'AR',
  'America/Argentina/La_Rioja': 'AR',
  'America/Argentina/Rio_Gallegos': 'AR',
  'America/Argentina/San_Juan': 'AR',
  'America/Argentina/San_Luis': 'AR',
  'America/La_Paz': 'BO',
  'America/Sao_Paulo': 'BR',
  'America/Bahia': 'BR',
  'America/Belem': 'BR',
  'America/Fortaleza': 'BR',
  'America/Manaus': 'BR',
  'America/Recife': 'BR',
  'America/Cuiaba': 'BR',
  'America/Maceio': 'BR',
  'America/Noronha': 'BR',
  'America/Porto_Velho': 'BR',
  'America/Boa_Vista': 'BR',
  'America/Rio_Branco': 'BR',
  'America/Eirunepe': 'BR',
  'America/Santiago': 'CL',
  'America/Punta_Arenas': 'CL',
  'Pacific/Easter': 'CL',
  'America/Bogota': 'CO',
  'America/Costa_Rica': 'CR',
  'America/Havana': 'CU',
  'America/Santo_Domingo': 'DO',
  'America/Guayaquil': 'EC',
  'Pacific/Galapagos': 'EC',
  'America/El_Salvador': 'SV',
  'America/Guatemala': 'GT',
  'America/Tegucigalpa': 'HN',
  'America/Mexico_City': 'MX',
  'America/Cancun': 'MX',
  'America/Chihuahua': 'MX',
  'America/Hermosillo': 'MX',
  'America/Mazatlan': 'MX',
  'America/Merida': 'MX',
  'America/Monterrey': 'MX',
  'America/Tijuana': 'MX',
  'America/Matamoros': 'MX',
  'America/Ojinaga': 'MX',
  'America/Bahia_Banderas': 'MX',
  'America/Managua': 'NI',
  'America/Panama': 'PA',
  'America/Asuncion': 'PY',
  'America/Lima': 'PE',
  'America/Montevideo': 'UY',
  'America/Caracas': 'VE',
}

const LOCALE_TO_COUNTRY: Record<string, string> = {
  'es-AR': 'AR',
  'es-BO': 'BO',
  'pt-BR': 'BR',
  'es-CL': 'CL',
  'es-CO': 'CO',
  'es-CR': 'CR',
  'es-CU': 'CU',
  'es-DO': 'DO',
  'es-EC': 'EC',
  'es-SV': 'SV',
  'es-GT': 'GT',
  'es-HN': 'HN',
  'es-MX': 'MX',
  'es-NI': 'NI',
  'es-PA': 'PA',
  'es-PY': 'PY',
  'es-PE': 'PE',
  'es-UY': 'UY',
  'es-VE': 'VE',
}

export const detectCountryCode = (): string | null => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz]
  } catch {
    // ignore
  }

  if (typeof navigator !== 'undefined') {
    const candidates = [navigator.language, ...(navigator.languages ?? [])]
    for (const lang of candidates) {
      if (lang && LOCALE_TO_COUNTRY[lang]) return LOCALE_TO_COUNTRY[lang]
    }
    for (const lang of candidates) {
      const region = lang?.split('-')[1]?.toUpperCase()
      if (region && MINIMUM_WAGES[region]) return region
    }
  }

  return null
}

export const detectMinimumWage = (): MinimumWageEntry | null => {
  const code = detectCountryCode()
  if (!code) return null
  return MINIMUM_WAGES[code] ?? null
}
