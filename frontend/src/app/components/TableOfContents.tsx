import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import type { TocItem } from "../utils/headingId";

interface TableOfContentsProps {
  items: TocItem[];
  scrollOffset?: number;
}

const INDENT_CLASSES: Record<number, string> = {
  1: "ml-0",
  2: "ml-4",
  3: "ml-8",
  4: "ml-12",
  5: "ml-16",
  6: "ml-20",
};

export function TableOfContents({ items, scrollOffset = 80 }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - scrollOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    },
    [scrollOffset],
  );

  useEffect(() => {
    if (items.length === 0) return;

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    const intersectingIds = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersectingIds.add(entry.target.id);
          } else {
            intersectingIds.delete(entry.target.id);
          }
        }

        // Active heading is the first intersecting one in document order
        for (const item of items) {
          if (intersectingIds.has(item.id)) {
            setActiveId(item.id);
            return;
          }
        }
      },
      {
        rootMargin: `-${scrollOffset}px 0px -60% 0px`,
        threshold: 0,
      },
    );

    for (const el of headingElements) {
      observerRef.current.observe(el);
    }

    // Determine initial active heading
    const detectActive = () => {
      const viewportTop = scrollOffset;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportTop) {
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
  }, [items, scrollOffset]);

  // Auto-scroll active item into view within the TOC panel
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
      className="fixed right-48 top-24 w-64 max-h-[calc(100vh-8rem)] bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-md flex flex-col hidden lg:flex"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-4">目录</h3>
      <nav
        ref={navRef}
        className="space-y-2 overflow-y-auto pr-2 flex-1 scrollbar-hide"
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
              className={`block text-left py-1 px-2 rounded transition-all duration-200 ${
                isActive
                  ? "text-blue-600 font-semibold text-base"
                  : "text-gray-600 hover:text-gray-900"
              } ${INDENT_CLASSES[item.level] ?? "ml-0"}`}
            >
              {item.text}
            </button>
          );
        })}
      </nav>
    </motion.div>
  );

  return (
    <>
      {/* Spacer to reserve layout space so content doesn't shift */}
      <div className="lg:w-64 shrink-0 hidden lg:block" aria-hidden="true" />

      {/* Portal to document.body to escape any ancestor transform (e.g. PageTransition) */}
      {createPortal(tocPanel, document.body)}
    </>
  );
}
