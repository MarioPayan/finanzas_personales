import { useState, useEffect } from 'react';

const DEFAULT_THRESHOLD = 600;

const useMobile = (threshold: number = DEFAULT_THRESHOLD): boolean => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < threshold);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < threshold);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [threshold]);

  return isMobile;
};

export default useMobile;