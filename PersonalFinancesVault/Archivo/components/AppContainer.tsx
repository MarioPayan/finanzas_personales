import Box from '@mui/material/Box';
import { backgroundColorGradiant } from '../utils/colors';
import useMobile from '../hooks/useMobile';

const AppContainer = ({ children, score }: { score: number, children: JSX.Element[] }): JSX.Element => {
  const isMobile = useMobile();

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      flexDirection={isMobile ? 'column' : 'row'}
      sx={{
        backgroundColor: backgroundColorGradiant(score),
        transition: 'background-color 0.5s',
      }}>
        {children}
    </Box>
  );
}

export default AppContainer;