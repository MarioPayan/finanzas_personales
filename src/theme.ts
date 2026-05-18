import {createTheme} from '@mui/material/styles'

/**
 * Tema MUI de la aplicación.
 *
 * Modo claro únicamente por ahora — la gamificación del dark queda
 * diferida. La paleta busca identidad propia (no MUI default) y refleja
 * la asignación de colores por categoría del diagnóstico:
 *
 *   - **primary** (teal): Base · salario y gastos
 *   - **warning** (amber): Deudas
 *   - **info** (blue): Estabilidad
 *   - **success** (emerald): Inversiones
 *   - **secondary** (violet): accents narrativos (perfiles, badges)
 *
 * Tipografía system con jerarquía marcada y `letter-spacing` negativo en
 * h-grandes para sensación editorial.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F766E', // teal-700
      light: '#14B8A6',
      dark: '#115E59',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED', // violet-600
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
      default: '#F8FAFC', // slate-50: bg cálido
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // slate-900
      secondary: '#475569', // slate-600
    },
    divider: '#E2E8F0', // slate-200
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {fontWeight: 800, letterSpacing: '-0.03em'},
    h2: {fontWeight: 800, letterSpacing: '-0.025em'},
    h3: {fontWeight: 700, letterSpacing: '-0.02em'},
    h4: {fontWeight: 700, letterSpacing: '-0.015em'},
    h5: {fontWeight: 700, letterSpacing: '-0.01em'},
    h6: {fontWeight: 600},
    body1: {lineHeight: 1.6},
    body2: {lineHeight: 1.6},
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    overline: {
      letterSpacing: '0.08em',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
          paddingBlock: 10,
        },
        sizeLarge: {
          paddingBlock: 12,
          fontSize: '1rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {borderRadius: 8, fontWeight: 500},
        outlined: {
          borderWidth: 1.5,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {borderRadius: 16},
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 6px 24px rgba(15, 23, 42, 0.04)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: '#E2E8F0',
        },
        bar: {
          borderRadius: 999,
        },
      },
    },
  },
})
