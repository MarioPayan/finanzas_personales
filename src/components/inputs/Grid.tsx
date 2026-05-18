import {Fragment} from 'react'
import {Box, Radio, Stack, Tooltip, Typography, useMediaQuery, useTheme} from '@mui/material'
import type {GridCell, GridQuestion, GridRow} from '../../content/diagnosis'
import type {MinimumWageEntry} from '../../content/minimumWages'
import {formatMoney} from '../../utils/calculations'
import ChipGroup from './ChipGroup'
import NumberInput from './NumberInput'

type GridValue = readonly (string | number | null)[]

type GridProps = {
  question: GridQuestion
  rows: readonly GridRow[]
  value: GridValue
  onChange: (rowIndex: number, cellValue: string | number) => void
  derivedSublabels?: Record<string, string>
  /** Salario mínimo del país detectado. Sólo se usa para resolver
   * `cell.exactInput.suggestionsSmm` en celdas de tipo `number`. */
  minimumWage?: MinimumWageEntry | null
}

/**
 * Render del nodo `grid`.
 *
 * - `cell.kind === 'number'`: filas apiladas (label + input). El layout
 *   tabular no aporta nada cuando hay una sola columna de entrada.
 * - `cell.kind === 'chips'` en desktop: matriz fila × opción con radios. La
 *   etiqueta de la opción vive en el header de columna; los `examples` pasan
 *   a tooltip porque no caben inline. Última columna opcional para el valor
 *   exacto.
 * - `cell.kind === 'chips'` en mobile (< md): apilado clásico (un `ChipGroup`
 *   por fila). El tabular se vuelve estrecho y poco usable en pantallas
 *   chicas.
 */
export default function Grid({
  question,
  rows,
  value,
  onChange,
  derivedSublabels,
  minimumWage,
}: GridProps) {
  const theme = useTheme()
  const tabular = useMediaQuery(theme.breakpoints.up('md'))

  if (question.cell.kind === 'number') {
    return (
      <NumberStacked
        question={question}
        rows={rows}
        value={value}
        onChange={onChange}
        cell={question.cell}
        minimumWage={minimumWage ?? null}
      />
    )
  }

  if (tabular) {
    return (
      <ChipsTabular
        question={question}
        rows={rows}
        value={value}
        onChange={onChange}
        derivedSublabels={derivedSublabels}
        cell={question.cell}
        minimumWage={minimumWage ?? null}
      />
    )
  }

  return (
    <ChipsStacked
      question={question}
      rows={rows}
      value={value}
      onChange={onChange}
      derivedSublabels={derivedSublabels}
      cell={question.cell}
      minimumWage={minimumWage ?? null}
    />
  )
}

type ChipsCell = Extract<GridCell, {kind: 'chips'}>
type NumberCell = Extract<GridCell, {kind: 'number'}>

type ChipsLayoutProps = {
  question: GridQuestion
  rows: readonly GridRow[]
  value: GridValue
  onChange: (rowIndex: number, cellValue: string | number) => void
  derivedSublabels?: Record<string, string>
  cell: ChipsCell
  minimumWage: MinimumWageEntry | null
}

function ChipsTabular({
  question,
  rows,
  value,
  onChange,
  derivedSublabels,
  cell,
  minimumWage,
}: ChipsLayoutProps) {
  const {options, exactInput} = cell
  const gridTemplateColumns = `auto repeat(${options.length}, minmax(72px, 1fr))${
    exactInput ? ' minmax(120px, 140px)' : ''
  }`

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 720,
        display: 'grid',
        gridTemplateColumns,
        columnGap: 1.5,
        rowGap: 1,
        alignItems: 'center',
      }}
      role='grid'
      aria-label={question.prompt}>
      <Box />
      {options.map(option => {
        const sub = derivedSublabels?.[option.value] ?? option.sublabel
        const head = (
          <Box sx={{textAlign: 'center', px: 0.5}}>
            <Typography variant='body2' sx={{fontWeight: 600, lineHeight: 1.2}}>
              {option.label}
            </Typography>
            {sub && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{display: 'block', lineHeight: 1.2}}>
                {sub}
              </Typography>
            )}
            {option.examples && option.examples.length > 0 && (
              <Typography
                variant='caption'
                color='text.disabled'
                sx={{display: 'block', lineHeight: 1.2, mt: 0.25, cursor: 'help'}}>
                ejemplos
              </Typography>
            )}
          </Box>
        )
        return (
          <Box key={option.value} role='columnheader'>
            {option.examples && option.examples.length > 0 ? (
              <Tooltip title={option.examples.join(' · ')} arrow placement='top'>
                {head}
              </Tooltip>
            ) : (
              head
            )}
          </Box>
        )
      })}
      {exactInput && (
        <Box role='columnheader' sx={{textAlign: 'center', px: 0.5}}>
          <Typography variant='body2' sx={{fontWeight: 600, lineHeight: 1.2}}>
            Exacto
          </Typography>
          {exactInput.unit && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{display: 'block', lineHeight: 1.2}}>
              {exactInput.unit}
            </Typography>
          )}
        </Box>
      )}

      {rows.map((row, i) => {
        const cellValue = value[i] ?? null
        const selectedChip = typeof cellValue === 'string' ? cellValue : null
        const exactValue = typeof cellValue === 'number' ? cellValue : null
        return (
          <Fragment key={i}>
            <Typography variant='subtitle2' sx={{fontWeight: 600, pr: 2}} role='rowheader'>
              {row.label}
            </Typography>
            {options.map(option => {
              const sel = selectedChip === option.value
              return (
                <Box
                  key={option.value}
                  sx={{display: 'flex', justifyContent: 'center'}}
                  role='gridcell'>
                  <Radio
                    checked={sel}
                    onChange={() => onChange(i, option.value)}
                    size='small'
                    slotProps={{input: {'aria-label': `${row.label} — ${option.label}`}}}
                  />
                </Box>
              )
            })}
            {exactInput && (
              <Box role='gridcell'>
                <NumberInput
                  value={exactValue}
                  onChange={v => {
                    if (v !== null) onChange(i, v)
                  }}
                  min={exactInput.min}
                  max={exactInput.max}
                  step={exactInput.step}
                  unit={exactInput.unit}
                  placeholder={exactInput.placeholder}
                  ariaLabel={`${row.label} — exacto`}
                  fullWidth
                  currency={exactInput.isMoney ? minimumWage?.currency : undefined}
                />
              </Box>
            )}
          </Fragment>
        )
      })}
    </Box>
  )
}

function ChipsStacked({
  question,
  rows,
  value,
  onChange,
  derivedSublabels,
  cell,
  minimumWage,
}: ChipsLayoutProps) {
  const exactInputCurrency = cell.exactInput?.isMoney ? minimumWage?.currency : undefined
  return (
    <Stack spacing={3} sx={{width: '100%', alignItems: 'stretch'}}>
      {rows.map((row, i) => {
        const cellValue = value[i] ?? null
        return (
          <Box key={i}>
            <Typography variant='subtitle2' sx={{fontWeight: 600, mb: 1, textAlign: 'center'}}>
              {row.label}
            </Typography>
            <ChipGroup
              options={cell.options}
              value={typeof cellValue === 'boolean' ? null : cellValue}
              onChange={v => onChange(i, v)}
              ariaLabel={`${question.prompt} — ${row.label}`}
              derivedSublabels={derivedSublabels}
              exactInput={cell.exactInput}
              exactInputCurrency={exactInputCurrency}
            />
          </Box>
        )
      })}
    </Stack>
  )
}

type NumberLayoutProps = {
  question: GridQuestion
  rows: readonly GridRow[]
  value: GridValue
  onChange: (rowIndex: number, cellValue: string | number) => void
  cell: NumberCell
  minimumWage: MinimumWageEntry | null
}

const resolveSmmSuggestions = (
  multipliers: readonly number[] | undefined,
  minimumWage: MinimumWageEntry | null,
): readonly {value: number; label: string}[] | undefined => {
  if (!multipliers || multipliers.length === 0 || !minimumWage) return undefined
  return multipliers.map(m => ({
    value: Math.round(m * minimumWage.amount),
    label: formatMoney(m * minimumWage.amount, minimumWage.currency),
  }))
}

function NumberStacked({question, rows, value, onChange, cell, minimumWage}: NumberLayoutProps) {
  const suggestions = resolveSmmSuggestions(cell.exactInput.suggestionsSmm, minimumWage)
  const currency = cell.exactInput.isMoney ? minimumWage?.currency : undefined
  return (
    <Stack spacing={2} sx={{width: '100%', alignItems: 'stretch', maxWidth: 480, mx: 'auto'}}>
      {rows.map((row, i) => {
        const cellValue = value[i] ?? null
        return (
          <Stack key={i} spacing={0.75} sx={{alignItems: 'stretch'}}>
            <Typography variant='subtitle2' sx={{fontWeight: 600}}>
              {row.label}
            </Typography>
            <NumberInput
              value={typeof cellValue === 'number' ? cellValue : null}
              onChange={v => {
                if (v !== null) onChange(i, v)
              }}
              min={cell.exactInput.min}
              max={cell.exactInput.max}
              step={cell.exactInput.step}
              unit={cell.exactInput.unit}
              placeholder={cell.exactInput.placeholder}
              ariaLabel={`${question.prompt} — ${row.label}`}
              fullWidth
              suggestions={suggestions}
              currency={currency}
            />
          </Stack>
        )
      })}
    </Stack>
  )
}
