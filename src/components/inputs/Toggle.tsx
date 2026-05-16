import {Stack, ToggleButton, ToggleButtonGroup} from '@mui/material'

type ToggleProps = {
  value: boolean | null
  onChange: (value: boolean, opts?: {commit?: boolean}) => void
  trueLabel?: string
  falseLabel?: string
  ariaLabel?: string
}

export default function Toggle({
  value,
  onChange,
  trueLabel = 'Sí',
  falseLabel = 'No',
  ariaLabel,
}: ToggleProps) {
  return (
    <Stack direction='row' sx={{justifyContent: 'center'}}>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, next) => {
          if (typeof next === 'boolean') onChange(next, {commit: true})
        }}
        aria-label={ariaLabel}
        color='primary'
        size='large'>
        <ToggleButton value={true} sx={{px: 5, py: 1.5}}>
          {trueLabel}
        </ToggleButton>
        <ToggleButton value={false} sx={{px: 5, py: 1.5}}>
          {falseLabel}
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}
