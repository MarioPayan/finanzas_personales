import {Box, Chip, InputAdornment, Stack, TextField} from '@mui/material'

type SuggestionPill = {
  /** Valor exacto que el chip setea en el input. */
  value: number
  /** Texto que ve el usuario en el chip. */
  label: string
}

type NumberInputProps = {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  placeholder?: string
  ariaLabel?: string
  size?: 'small' | 'medium'
  fullWidth?: boolean
  /**
   * Pills clickeables que aparecen arriba del input para reducir
   * fricción. Cada click setea ese valor exacto.
   */
  suggestions?: readonly SuggestionPill[]
  /**
   * Si se pasa un código de moneda ISO (`COP`, `MXN`…), el input se
   * comporta como currency: muestra el valor formateado con símbolo y
   * separador de miles del locale `es`, y al tipear se descartan los
   * caracteres no numéricos. Útil para campos de dinero; no usar para
   * edad, conteos, porcentajes ni meses.
   */
  currency?: string
}

/** Formato compacto de currency. Sin decimales (dinero "real" en LATAM
 *  típicamente no necesita centavos para diagnósticos). */
const formatCurrency = (n: number, currency: string): string =>
  new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)

export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  placeholder,
  ariaLabel,
  size = 'small',
  fullWidth,
  suggestions,
  currency,
}: NumberInputProps) {
  const isCurrency = !!currency

  const displayValue = isCurrency
    ? value === null || value === undefined
      ? ''
      : formatCurrency(value, currency!)
    : (value ?? '')

  const handleChange = (raw: string) => {
    if (isCurrency) {
      // Descartar todo lo que no sea dígito (símbolo de moneda, puntos,
      // espacios, etc.). Bordes negativos no tienen sentido en montos.
      const digits = raw.replace(/[^\d]/g, '')
      if (digits === '') {
        onChange(null)
        return
      }
      const parsed = Number(digits)
      if (Number.isFinite(parsed)) onChange(parsed)
      return
    }
    if (raw === '') {
      onChange(null)
      return
    }
    const parsed = Number(raw)
    if (Number.isFinite(parsed)) onChange(parsed)
  }

  const field = (
    <TextField
      type={isCurrency ? 'text' : 'number'}
      value={displayValue}
      placeholder={placeholder}
      size={size}
      fullWidth={fullWidth}
      onChange={e => handleChange(e.target.value)}
      slotProps={{
        htmlInput: isCurrency
          ? {inputMode: 'numeric', 'aria-label': ariaLabel}
          : {min, max, step, 'aria-label': ariaLabel},
        input:
          !isCurrency && unit
            ? {endAdornment: <InputAdornment position='end'>{unit}</InputAdornment>}
            : undefined,
      }}
    />
  )

  if (!suggestions || suggestions.length === 0) return field

  return (
    <Stack spacing={0.75} sx={{width: fullWidth ? '100%' : undefined}}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          rowGap: 0.5,
        }}>
        {suggestions.map(s => (
          <Chip
            key={`${s.label}-${s.value}`}
            label={s.label}
            size='small'
            clickable
            color={value === s.value ? 'primary' : 'default'}
            variant={value === s.value ? 'filled' : 'outlined'}
            onClick={() => onChange(s.value)}
            sx={{fontSize: 11, height: 22}}
          />
        ))}
      </Box>
      {field}
    </Stack>
  )
}
