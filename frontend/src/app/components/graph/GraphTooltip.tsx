import { motion } from "motion/react";
import { GraphNode } from "./graphTypes";

interface GraphTooltipProps {
  node: GraphNode;
  x: number;
  y: number;
  connectedCount?: number;
  anchor?: 'left' | 'right';
}

const TYPE_LABELS: Record<string, string> = {
  article: "ARTICLE",
  tag: "TAG",
  category: "CATEGORY",
};

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
  article: {
    bg: "rgba(37,99,235,0.08)",
    text: "rgb(37,99,235)",
    border: "rgba(37,99,235,0.15)",
    shadow: "rgba(37,99,235,0.08)",
  },
  tag: {
    bg: "rgba(217,119,6,0.08)",
    text: "rgb(217,119,6)",
    border: "rgba(217,119,6,0.15)",
    shadow: "rgba(217,119,6,0.08)",
  },
  category: {
    bg: "rgba(124,58,237,0.08)",
    text: "rgb(124,58,237)",
    border: "rgba(124,58,237,0.15)",
    shadow: "rgba(124,58,237,0.08)",
  },
};

export function GraphTooltip({ node, x, y, connectedCount, anchor = 'left' }: GraphTooltipProps) {
  const style = TYPE_STYLES[node.type] || TYPE_STYLES.article;
  const anchorClass = anchor === 'right' ? 'origin-right' : 'origin-left';

  return (
    <motion.div
      initial={{ opacity: 0, x: anchor === 'right' ? 8 : -8, scale: 0.92, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: anchor === 'right' ? -6 : 6, scale: 0.95, filter: "blur(3px)" }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-none fixed z-[100] max-w-xs -translate-y-1/2 ${anchorClass}`}
      style={{ left: x, top: y }}
    >
      <div
        className="rounded-xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${style.border}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.08), 0 0 20px ${style.shadow}`,
        }}
      >
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[9px] font-semibold tracking-[0.15em] px-2 py-0.5 rounded-full"
            style={{
              background: style.bg,
              color: style.text,
              border: `1px solid ${style.border}`,
            }}
          >
            {TYPE_LABELS[node.type]}
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${style.border}, transparent)` }} />
        </div>

        {/* Name */}
        <p
          className="text-[13px] font-medium leading-snug line-clamp-2 text-gray-800"
          style={{ fontFamily: "'糖影黑', system-ui, sans-serif" }}
        >
          {node.name}
        </p>

        {/* Meta */}
        {(node.type === "article" && node.viewCount !== undefined) || (connectedCount !== undefined && connectedCount > 0) ? (
          <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            {node.type === "article" && node.viewCount !== undefined && (
              <span className="text-[10px] text-gray-400 tabular-nums">{node.viewCount} 次阅读</span>
            )}
            {connectedCount !== undefined && connectedCount > 0 && (
              <span className="text-[10px] text-gray-400 tabular-nums">{connectedCount} 个关联</span>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
