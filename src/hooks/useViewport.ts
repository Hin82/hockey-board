import { useState, useEffect } from 'react';

const TOOLBAR_HEIGHT = 140;

export function useViewport() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });

    // Also handle visual viewport resize (for mobile keyboards, etc.)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return {
    width: size.width,
    height: size.height - TOOLBAR_HEIGHT,
    toolbarHeight: TOOLBAR_HEIGHT,
  };
}
