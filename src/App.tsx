import {lazy, Suspense} from 'react'
import {Box, CircularProgress} from '@mui/material'
import Diagnosis from './views/Diagnosis/Diagnosis'

const Debug = lazy(() => import('./views/Debug/Debug'))

const isDebugRoute = (path: string): boolean =>
  path === '/debug' || path.startsWith('/debug/')

const Loading = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
)

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  if (isDebugRoute(path)) {
    return (
      <Suspense fallback={<Loading />}>
        <Debug />
      </Suspense>
    )
  }
  return <Diagnosis />
}
