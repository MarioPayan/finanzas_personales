import {Fragment} from 'react'
import {Box, Radio, Stack, Tooltip, Typography, useMediaQuery, useTheme} from '@mui/material'
import type {GridCell, GridQuestion, GridRow} from '../../content/diagnosis'
import ChipGroup from './ChipGroup'
import NumberInput from './NumberInput'

type GridValue = readonly (string | number | null)[]

type GridProps = {
  question: GridQuestion
  rows: readonly GridRow[]
  value: GridValue
  onChange: (rowIndex: number, cellValue: string | number) => void
  derivedSublabels?: Record<string, string>
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
export default function Grid({question, rows, value, onChange, derivedSublabels}: GridProps) {
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
}

function ChipsTabular({question, rows, value, onChange, derivedSublabels, cell}: ChipsLayoutProps) {
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
                />
              </Box>
            )}
          </Fragment>
        )
      })}
    </Box>
  )
}

function ChipsStacked({question, rows, value, onChange, derivedSublabels, cell}: ChipsLayoutProps) {
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
}

function NumberStacked({question, rows, value, onChange, cell}: NumberLayoutProps) {
  return (
    <Stack spacing={2} sx={{width: '100%', alignItems: 'stretch', maxWidth: 480, mx: 'auto'}}>
      {rows.map((row, i) => {
        const cellValue = value[i] ?? null
        return (
          <Stack key={i} direction='row' spacing={2} sx={{alignItems: 'center'}}>
            <Typography variant='subtitle2' sx={{fontWeight: 600, minWidth: 120}}>
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
            />
          </Stack>
        )
      })}
    </Stack>
  )
}
