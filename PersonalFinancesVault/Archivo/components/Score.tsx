import { useState } from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import useSmoothScore from '../hooks/smoothScore';

type ScoreProps = {
  score: number,
}

export const getScoreWithLimits = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
}

const Score = ({ score }: ScoreProps) => {
  const [slowScore, setSlowScore] = useState<number>(0);
  useSmoothScore(score, slowScore, setSlowScore);

  return (
    <Box
      display="flex"
      position="absolute"
      top={0}
      right={0}
      padding={2}
    >
      <Typography variant="h5">
        {slowScore}
      </Typography>
    </Box>
  );
}

export default Score;