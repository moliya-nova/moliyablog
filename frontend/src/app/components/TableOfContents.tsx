import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { List } from "lucide-react";
import type { TocItem } from "../utils/headingId";

interface TableOfContentsProps {
  items: TocItem[];
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

const INDENT_CLASSES: Record<number, string> = {
  1: "ml-0",
  2: "ml-3",
  3: "ml-6",
};

export function TableOfContents({ items, scrollContainerRef }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      const container = scrollContainerRef?.current;
      if (container) {
        // 在自定义滚动容器中滚动
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = container.scrollTop + elementRect.top - containerRect.top - 20;
        container.scrollTo({ top: scrollTop, behavior: "smooth" });
      } else {
        // 回退到 window 滚动
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [scrollContainerRef],
  );

  useEffect(() => {
    if (items.length === 0) return;

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    const intersectingIds = new Set<string>();
    const container = scrollContainerRef?.current || null;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersectingIds.add(entry.target.id);
          } else {
            intersectingIds.delete(entry.target.id);
          }
        }

        for (const item of items) {
          if (intersectingIds.has(item.id)) {
            setActiveId(item.id);
            return;
          }
        }
      },
      {
        root: container,
        rootMargin: "-20px 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const el of headingElements) {
      observerRef.current.observe(el);
    }

    const detectActive = () => {
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveId(items[i].id);
            return;
          }
        }
      }
      if (items.length > 0) {
        setActiveId(items[0].id);
      }
    };

    requestAnimationFrame(detectActive);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items, scrollContainerRef]);

  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const button = navRef.current.querySelector(`[data-toc-id="${activeId}"]`);
    if (button) {
      button.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeId]);

  if (items.length === 0) return null;

  const tocPanel = (
    <motion.div
      className="fixed right-8 top-24 w-60 max-h-[calc(100vh-8rem)] bg-white/70 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-lg shadow-black/[0.04] p-5 flex flex-col hidden lg:flex"
      style={{ zIndex: 9995 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200/60">
        <List className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 tracking-wide">目录</h3>
      </div>
      <nav
        ref={navRef}
        className="space-y-1 overflow-y-auto pr-1 flex-1 scrollbar-hide"
        style={{ overscrollBehavior: "contain" }}
      >
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              data-toc-id={item.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollToHeading(item.id);
              }}
              className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-all duration-200 text-[13px] ${
                isActive
                  ? "text-blue-600 font-medium bg-blue-50/80"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/80"
              } ${INDENT_CLASSES[item.level] ?? "ml-0"}`}
            >
              <span className="line-clamp-2">{item.text}</span>
            </button>
          );
        })}
      </nav>
    </motion.div>
  );

  return (
    <>
      <div className="lg:w-64 shrink-0 hidden lg:block" aria-hidden="true" />
      {createPortal(tocPanel, document.body)}
    </>
  );
}
