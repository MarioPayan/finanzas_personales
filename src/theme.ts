import {createTheme} from '@mui/material/styles'

/**
 * Tema MUI de la aplicación.
 *
 * Por ahora **solo modo claro** — la gamificación visual queda diferida; el
 * foco está en la lógica del cuestionario. La estructura ya soporta agregar
 * un `dark` palette más adelante sin cambios estructurales.
 *
 * Decisiones:
 *   - **Primary verde-azulado** ("teal verdoso") en vez del azul MUI default,
 *     para tener una identidad mínima sin necesidad de logo ni mascota.
 *   - **Tipografía system** — rápida, legible, neutra. No cargamos webfonts
 *     hasta que la identidad visual completa (item C1 del roadmap) lo
 *     justifique.
 *   - **Radios suaves pero no excesivos** (10px chips, 12px cards) — entre
 *     el "serio" del MUI default y el "redondeado infantil" del default
 *     de muchos quiz apps.
 *   - **Tipografía con jerarquía marcada** (h1-h3 grandes, h4-h6 chicos
 *     pero pesados) — el quiz tiene mucho texto secundario, queremos que
 *     los títulos resalten sin gritar.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F766E', // teal-700: serio, verdoso, distinto al azul genérico
      light: '#14B8A6',
      dark: '#115E59',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED', // violeta-600: contrastante, usable en accents
      light: '#A78BFA',
      dark: '#5B21B6',
    },
    warning: {
      main: '#D97706', // amber-600
      light: '#F59E0B',
      dark: '#B45309',
    },
    error: {
      main: '#DC2626', // red-600
      light: '#EF4444',
      dark: '#B91C1C',
    },
    success: {
      main: '#059669', // emerald-600
      light: '#10B981',
      dark: '#047857',
    },
    info: {
      main: '#2563EB', // blue-600
      light: '#3B82F6',
      dark: '#1D4ED8',
    },
    background: {
      default: '#F8FAFC', // slate-50: bg ligeramente más cálido que blanco puro
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // slate-900
      secondary: '#475569', // slate-600
    },
    divider: '#E2E8F0', // slate-200
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {fontWeight: 700, letterSpacing: '-0.02em'},
    h2: {fontWeight: 700, letterSpacing: '-0.02em'},
    h3: {fontWeight: 700, letterSpacing: '-0.01em'},
    h4: {fontWeight: 700, letterSpacing: '-0.01em'},
    h5: {fontWeight: 600},
    h6: {fontWeight: 600},
    button: {
      textTransform: 'none', // sin all-caps en botones — más conversacional
      fontWeight: 600,
    },
    overline: {
      letterSpacing: '0.08em',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {borderRadius: 10, paddingInline: 16},
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {borderRadius: 10, fontWeight: 500},
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {borderRadius: 12},
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {borderRadius: 12},
      },
    },
  },
})
