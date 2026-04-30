import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

interface UseNestedLenisOptions {
  wrapper: React.RefObject<HTMLElement>;
  content?: React.RefObject<HTMLElement>;
  enabled?: boolean;
}

export function useNestedLenis({ wrapper, content, enabled = true }: UseNestedLenisOptions) {
  const lenisRef = useRef<Lenis | null>(null);

  const stopLenis = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.stop();
    }
  }, []);

  const startLenis = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const wrapperEl = wrapper.current;
    const contentEl = content?.current;

    if (!wrapperEl) return;

    // 延迟初始化，确保 DOM 已渲染
    const timeoutId = setTimeout(() => {
      const lenis = new Lenis({
        wrapper: wrapperEl,
        content: contentEl || wrapperEl,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        direction: 'vertical',
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
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [wrapper, content, enabled]);

  return { lenis: lenisRef.current, stopLenis, startLenis };
}