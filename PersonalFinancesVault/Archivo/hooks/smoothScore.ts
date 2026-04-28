import { useEffect } from 'react';

const useSmoothScore = (
  score: number,
  slowScore: number,
  setSlowScore: (score: number) => void
) => {
  useEffect(() => {
    for (let i = 0; i <= 10; i++) {
      const factor = i * i / 100;
      const newScore = Math.round(slowScore + ((score - slowScore) * i / 10));
      setTimeout(() => {
        setSlowScore(newScore);
      }, factor * 750);
    }
  }, [score]);
};

export default useSmoothScore;