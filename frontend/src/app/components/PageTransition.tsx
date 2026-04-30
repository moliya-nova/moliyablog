import { ReactNode, useEffect, useRef } from "react";
import { useSmoothScroll } from "../providers/SmoothScrollProvider";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const element = ref.current;
    if (element) {
      // 触发动画
      element.style.opacity = '0';
      element.style.transform = 'translateY(10px)';

      // 强制重绘
      element.offsetHeight;

      // 执行动画
      element.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }

    // 页面切换时使用 Lenis 平滑滚动到顶部
    scrollTo(0, { duration: 0.5 });
  }, [scrollTo]);

  return (
    <div
      ref={ref}
      style={{ height: '100%', width: '100%' }}
    >
      {children}
    </div>
  );
}
