import { useEffect, useState } from 'react';

interface AppTitleProps {
  className?: string;
}

// Custom hook to detect mobile screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
};

const AppTitle = ({ className = '' }: AppTitleProps) => {
  const isMobile = useIsMobile();

  return (
    <h1 className={`app-title ${className}`}>
      {isMobile ? "K+N❤️" : "Nicole and Kevin's Notes ❤️"}
    </h1>
  );
};

export default AppTitle; 