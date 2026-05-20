import {useMemo, useState} from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {motion} from 'framer-motion'
import {ArrowsClockwise, ChartLine, Confetti, Lock} from '@phosphor-icons/react'
import {pickDifferentName, pickRandomName} from '../../content/funnyNames'

/**
 * Pantalla de bienvenida que ve el usuario la primera vez que entra
 * (o tras un reset). Presenta brevemente la app y le asigna un alias
 * chistoso que puede aceptar o cambiar. Al confirmar dispara
 * `onStart(userName)` para que el caller persista el nombre y arranque
 * el cuestionario.
 *
 * La intro vive aparte del Stepper porque no es un "paso" del flujo:
 * es una decisión previa (qué nombre llevas) que el caller persiste
 * en `localStorage` como flag implícito de "ya pasé por acá".
 */

type IntroProps = {
  onStart: (userName: string) => void
}

const BULLETS: readonly {icon: typeof ChartLine; text: string}[] = [
  {
    icon: ChartLine,
    text: 'Te preguntamos por ingresos, gastos, deudas, ahorro e inversión — sin pedir cuentas reales.',
  },
  {
    icon: Confetti,
    text: 'Al final te damos un diagnóstico con tu perfil y los próximos pasos concretos.',
  },
  {
    icon: Lock,
    text: 'Todo queda guardado solo en tu navegador. No se sube nada a ningún servidor.',
  },
]

export function Intro({onStart}: IntroProps) {
  const theme = useTheme()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [name, setName] = useState<string>(() => pickRandomName())
  const [rerollCount, setRerollCount] = useState(0)

  const handleReroll = () => {
    setName(prev => pickDifferentName(prev))
    setRerollCount(c => c + 1)
  }

  const heroPad = useMemo(() => ({xs: 3, md: 6}), [])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: {xs: 4, md: 6},
        px: {xs: 2, md: 3},
      }}>
      <Stack spacing={{xs: 3, md: 4}} sx={{maxWidth: 640, width: '100%'}}>
        <motion.div
          initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.4}}>
          <Stack spacing={1.5} sx={{textAlign: {xs: 'left', sm: 'center'}}}>
            <Chip
              label='Diagnóstico financiero personal'
              color='primary'
              variant='outlined'
              size='small'
              sx={{
                alignSelf: {xs: 'flex-start', sm: 'center'},
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            />
            <Typography
              component='h1'
              sx={{
                fontWeight: 800,
                fontSize: {xs: '1.75rem', md: '2.5rem'},
                lineHeight: 1.15,
              }}>
              Tu foto financiera en 10 minutos
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{lineHeight: 1.6, fontSize: {xs: '0.95rem', md: '1rem'}}}>
              Te hacemos preguntas concretas sobre tu vida con la plata, calculamos
              dónde estás parado y te damos un diagnóstico con los próximos pasos.
              Sin tecnicismos, sin venderte nada.
            </Typography>
          </Stack>
        </motion.div>

        <motion.div
          initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.4, delay: reducedMotion ? 0 : 0.1}}>
          <Stack spacing={1.5}>
            {BULLETS.map(({icon: Icon, text}, i) => (
              <Stack key={i} direction='row' spacing={1.5} sx={{alignItems: 'flex-start'}}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'primary.main',
                  }}>
                  <Icon size={18} weight='regular' />
                </Box>
                <Typography variant='body2' sx={{flex: 1, lineHeight: 1.55, pt: 0.5}}>
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </motion.div>

        <motion.div
          initial={reducedMotion ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.4, delay: reducedMotion ? 0 : 0.2}}>
          <Card
            elevation={0}
            sx={{
              border: 2,
              borderColor: 'primary.main',
              bgcolor: 'background.paper',
            }}>
            <CardContent sx={{p: heroPad}}>
              <Stack spacing={2.5} sx={{alignItems: 'center', textAlign: 'center'}}>
                <Typography variant='overline' color='text.secondary'>
                  Por ahora te conocemos como
                </Typography>
                <motion.div
                  key={rerollCount}
                  initial={reducedMotion ? {opacity: 1, scale: 1} : {opacity: 0, scale: 0.95}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{duration: 0.25, ease: 'easeOut'}}>
                  <Typography
                    component='div'
                    sx={{
                      fontWeight: 800,
                      fontSize: {xs: '1.5rem', md: '2rem'},
                      lineHeight: 1.2,
                      color: 'primary.main',
                    }}>
                    {name}
                  </Typography>
                </motion.div>
                <Typography variant='caption' color='text.secondary'>
                  Es solo para hacerlo más amable — no nos cuentes tu nombre real.
                </Typography>
                <Stack
                  direction={{xs: 'column', sm: 'row'}}
                  spacing={1.25}
                  sx={{width: '100%', justifyContent: 'center'}}>
                  <Button
                    variant='outlined'
                    color='primary'
                    onClick={handleReroll}
                    startIcon={<ArrowsClockwise size={18} weight='regular' />}
                    sx={{minHeight: 44, fontWeight: 600}}
                    fullWidth={isMobile}>
                    Otro nombre
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => onStart(name)}
                    sx={{
                      minHeight: 44,
                      minWidth: {sm: 180},
                      fontWeight: 700,
                    }}
                    fullWidth={isMobile}>
                    Empezar
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Stack>
    </Box>
  )
}
