import { createContext, useContext, useEffect, useRef, ReactNode, useCallback } from 'react';
import Lenis from 'lenis';

interface SmoothScrollContextValue {
  scrollTo: (target: number | string, options?: { duration?: number }) => void;
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  scrollTo: () => {},
  lenis: null,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  const scrollTo = useCallback((target: number | string, options?: { duration?: number }) => {
    lenisRef.current?.scrollTo(target, options);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      allowNestedScroll: true,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, lenis: lenisRef.current }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
