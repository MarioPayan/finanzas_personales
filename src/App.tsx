import {lazy, Suspense} from 'react'
import {Box, CircularProgress, CssBaseline, ThemeProvider} from '@mui/material'
import Diagnosis from './views/Diagnosis/Diagnosis'
import {theme} from './theme'

const Debug = lazy(() => import('./views/Debug/Debug'))

const isDebugRoute = (path: string): boolean => path === '/debug' || path.startsWith('/debug/')

const Loading = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }}>
    <CircularProgress />
  </Box>
)

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isDebugRoute(path) ? (
        <Suspense fallback={<Loading />}>
          <Debug />
        </Suspense>
      ) : (
        <Diagnosis />
      )}
    </ThemeProvider>
  )
}
