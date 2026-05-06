import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Network, Search, X, SlidersHorizontal, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useGraphData } from "../components/graph/useGraphData";
import { GraphCanvas } from "../components/graph/GraphCanvas";
import { GraphNode } from "../components/graph/graphTypes";
import { useCallback, useState, useMemo, useEffect, Component, type ReactNode } from "react";

type Theme = "light" | "dark";

class PageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: "" };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error: error.message }; }
  componentDidCatch(error: Error) { console.error("KnowledgeGraph error:", error); }
  render() {
    if (this.state.hasError) {
      return createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#f8f9fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="flex flex-col items-center gap-6">
            <p className="text-red-400 text-sm">图谱渲染出错</p>
            <p className="text-gray-400 text-xs max-w-xs text-center">{this.state.error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 border border-gray-200 rounded-full text-gray-500 text-xs">刷新页面</button>
          </div>
        </div>,
        document.body
      );
    }
    return this.props.children;
  }
}

function GraphPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useGraphData();
  const [theme, setTheme] = useState<Theme>(() => {
    // 从 localStorage 读取主题，与热力图页面同步
    const savedTheme = localStorage.getItem('page-theme');
    return (savedTheme as Theme) || "light";
  });
  const [showTags, setShowTags] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clickedHubNode, setClickedHubNode] = useState<string | null>(null);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [repulsionStrength, setRepulsionStrength] = useState(-120);
  const [linkDistance, setLinkDistance] = useState(80);

  const isDark = theme === "dark";

  // Sync theme to body and localStorage
  useEffect(() => {
    document.body.setAttribute("data-graph-theme", theme);
    localStorage.setItem('page-theme', theme);
    return () => { document.body.removeAttribute("data-graph-theme"); };
  }, [theme]);

  const highlightedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      for (const node of data.nodes) {
        if (node.type === "article" && node.name.toLowerCase().includes(term)) ids.add(node.id);
      }
    }
    if (clickedHubNode) {
      ids.add(clickedHubNode);
      for (const link of data.links) {
        if (link.source === clickedHubNode) ids.add(link.target);
        if (link.target === clickedHubNode) ids.add(link.source);
      }
    }
    return ids;
  }, [data, searchTerm, clickedHubNode]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (node.type === "article" && node.articleId) navigate(`/home/blog/${node.articleId}`);
    else if (node.type === "tag" || node.type === "category") setClickedHubNode((prev) => (prev === node.id ? null : node.id));
  }, [navigate]);

  const clearHighlights = useCallback(() => { setSearchTerm(""); setClickedHubNode(null); }, []);
  const hasHighlight = searchTerm.trim().length > 0 || clickedHubNode !== null;

  const bg = isDark ? "#020408" : "#f4f6fa";
  const panelBase = isDark
    ? "bg-[#0a0c18]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/60"
    : "bg-white/70 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-lg shadow-black/[0.04]";

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: bg }} className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-20 h-20">
            <div className={`absolute inset-0 rounded-full border ${isDark ? "border-cyan-500/10" : "border-blue-300/20"} animate-spin`} style={{ animationDuration: "3s" }} />
            <div className={`absolute inset-2 rounded-full border ${isDark ? "border-cyan-500/15" : "border-blue-300/25"} animate-spin`} style={{ animationDuration: "2.5s", animationDirection: "reverse" }} />
            <div className={`absolute inset-4 rounded-full border ${isDark ? "border-cyan-500/20" : "border-blue-300/30"} animate-spin`} style={{ animationDuration: "2s" }} />
            <div className={`absolute inset-6 rounded-full ${isDark ? "bg-cyan-500/10" : "bg-blue-100/50"} animate-pulse`} />
          </div>
          <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-[10px] tracking-[0.4em] uppercase`}>Initializing</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: bg }} className="flex items-center justify-center">
        <p className="text-red-400/60 text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: bg }}>
      {/* Background layers */}
      {isDark ? (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 60% 80%, rgba(59,130,246,0.06) 0%, transparent 40%)
            `,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "32px 32px", backgroundPosition: "16px 16px",
          }} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { x: 15, y: 25, w: 50, h: 40, color: "6,182,212", opacity: 0.07, dur: 25 },
              { x: 70, y: 10, w: 40, h: 35, color: "99,102,241", opacity: 0.06, dur: 30 },
              { x: 45, y: 60, w: 55, h: 45, color: "59,130,246", opacity: 0.065, dur: 28 },
              { x: 80, y: 70, w: 35, h: 30, color: "139,92,246", opacity: 0.05, dur: 32 },
              { x: 25, y: 75, w: 45, h: 35, color: "34,211,238", opacity: 0.055, dur: 27 },
            ].map((n, i) => (
              <div key={`nebula-${i}`} className="absolute rounded-full" style={{
                left: `${n.x}%`, top: `${n.y}%`, width: `${n.w}%`, height: `${n.h}%`,
                background: `radial-gradient(ellipse, rgba(${n.color},${n.opacity}) 0%, transparent 70%)`,
                filter: "blur(40px)", animation: `graphNebula ${n.dur}s ease-in-out ${i * 3}s infinite`,
              }} />
            ))}
          </div>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 120 }, (_, i) => {
              const x = (((i * 13 + 7) * 43) % 103) / 103 * 100;
              const y = (((i * 17 + 11) * 53) % 107) / 107 * 100;
              const size = 0.8 + (((i * 3 + 1) * 19) % 17) / 17 * 1.5;
              const dur = 8 + (((i * 7 + 3) * 23) % 31) / 31 * 15;
              const delay = (((i * 5 + 1) * 29) % 41) / 41 * dur;
              const drift = -20 + (((i * 11 + 5) * 37) % 43) / 43 * 40;
              const bright = 0.15 + (((i * 2 + 1) * 41) % 23) / 23 * 0.4;
              return (
                <div key={`dust-${i}`} className="absolute rounded-full" style={{
                  left: `${x}%`, top: `${y}%`, width: size, height: size,
                  background: `rgba(200,220,255,${bright})`,
                  boxShadow: `0 0 ${size * 2}px rgba(180,210,255,${bright * 0.5})`,
                  animation: `graphDust ${dur}s ease-in-out ${delay}s infinite`,
                  "--dust-drift": `${drift}px`,
                } as React.CSSProperties} />
              );
            })}
          </div>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }, (_, i) => {
              const x = (((i * 7 + 13) * 31) % 97) / 97 * 100;
              const y = (((i * 11 + 7) * 41) % 101) / 101 * 100;
              const size = 6 + (((i * 3 + 1) * 17) % 23) / 23 * 14;
              const dur = 3 + (((i * 5 + 3) * 19) % 29) / 29 * 5;
              const delay = (((i * 2 + 1) * 23) % 37) / 37 * dur;
              const rot = (((i * 13 + 5) * 37) % 89) / 89 * 45;
              return (
                <div key={i} className="graph-star" style={{
                  left: `${x}%`, top: `${y}%`, width: size, height: size,
                  transform: `rotate(${rot}deg)`,
                  animation: `graphStar ${dur}s ease-in-out ${delay}s infinite`,
                }} />
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.06) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 60% 80%, rgba(34,211,238,0.03) 0%, transparent 40%),
              linear-gradient(135deg, #f0f2f8 0%, #e8ecf4 50%, #f4f6fa 100%)
            `,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px", backgroundPosition: "16px 16px",
          }} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { x: 15, y: 25, w: 50, h: 40, color: "59,130,246", opacity: 0.04, dur: 25 },
              { x: 70, y: 10, w: 40, h: 35, color: "139,92,246", opacity: 0.03, dur: 30 },
              { x: 45, y: 60, w: 55, h: 45, color: "34,211,238", opacity: 0.035, dur: 28 },
            ].map((n, i) => (
              <div key={`orb-${i}`} className="absolute rounded-full" style={{
                left: `${n.x}%`, top: `${n.y}%`, width: `${n.w}%`, height: `${n.h}%`,
                background: `radial-gradient(ellipse, rgba(${n.color},${n.opacity}) 0%, transparent 70%)`,
                filter: "blur(60px)", animation: `graphNebula ${n.dur}s ease-in-out ${i * 3}s infinite`,
              }} />
            ))}
          </div>
        </>
      )}

      {/* Graph */}
      <div className="absolute inset-0">
        <GraphCanvas
          data={data}
          showTags={showTags}
          showCategories={showCategories}
          onNodeClick={handleNodeClick}
          searchTerm={searchTerm}
          highlightedNodeIds={highlightedNodeIds}
          repulsionStrength={repulsionStrength}
          linkDistance={linkDistance}
          theme={theme}
        />
      </div>

      {/* === Top-left control panel === */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-5 left-16 flex flex-col gap-2.5 max-w-[340px]"
        style={{ zIndex: 9995 }}
      >
        {/* Title bar */}
        <div className={panelBase} style={{ padding: "10px 14px" }}>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-7 h-7">
              <Network className={isDark ? "text-cyan-400" : "text-blue-500"} size={16} />
              <div className={`absolute inset-0 rounded-full ${isDark ? "bg-cyan-500/10" : "bg-blue-500/10"} animate-ping`} style={{ animationDuration: "3s" }} />
            </div>
            <div className="flex flex-col">
              <h1
                className={`text-sm tracking-[0.15em] ${isDark ? "text-white/90" : "text-gray-800"}`}
                style={{ fontFamily: "'糖影黑', system-ui, sans-serif" }}
              >
                知识图谱
              </h1>
              <span className={`text-[9px] tracking-[0.2em] uppercase ${isDark ? "text-gray-600" : "text-gray-400"}`}>Knowledge Graph</span>
            </div>
            <div className="flex-1" />
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${isDark ? "bg-white/[0.03] border border-white/[0.04]" : "bg-gray-100/80 border border-gray-200/60"}`}>
              <div className={`w-1 h-1 rounded-full animate-pulse ${isDark ? "bg-cyan-400/60" : "bg-blue-400"}`} />
              <span className="text-[9px] text-gray-500 tabular-nums tracking-wider">{data.nodes.length}</span>
            </div>
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
              className={`graph-icon-btn ${isDark ? "" : "graph-icon-btn--active"}`}
              title={isDark ? "切换亮色" : "切换暗色"}
            >
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>

        {/* Search + toggles */}
        <div className={panelBase} style={{ padding: "8px 12px" }}>
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-600" : "text-gray-300"}`} size={12} />
              <input
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索节点..."
                className={`graph-search w-full pl-8 pr-7 py-2 text-[11px] rounded-xl focus:outline-none transition-all ${isDark ? "text-white/90 placeholder-gray-700" : "text-gray-700 placeholder-gray-300"}`}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className={`absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-600 hover:text-white" : "text-gray-300 hover:text-gray-600"}`}>
                  <X size={12} />
                </button>
              )}
            </div>
            <div className={`w-px h-6 ${isDark ? "bg-white/[0.05]" : "bg-gray-200/60"}`} />
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowCategories(!showCategories)} className={`graph-toggle ${showCategories ? "graph-toggle--active-violet" : ""}`} data-theme={theme}>
                {showCategories ? <Eye size={11} /> : <EyeOff size={11} />}
                <span>分类</span>
              </button>
              <button onClick={() => setShowTags(!showTags)} className={`graph-toggle ${showTags ? "graph-toggle--active-amber" : ""}`} data-theme={theme}>
                {showTags ? <Eye size={11} /> : <EyeOff size={11} />}
                <span>标签</span>
              </button>
            </div>
            <div className={`w-px h-6 ${isDark ? "bg-white/[0.05]" : "bg-gray-200/60"}`} />
            <button onClick={() => setShowLayoutPanel(!showLayoutPanel)} className={`graph-icon-btn ${showLayoutPanel ? "graph-icon-btn--active" : ""}`} title="布局参数">
              <SlidersHorizontal size={13} />
            </button>
          </div>
        </div>

        {/* Layout sliders */}
        <AnimatePresence>
          {showLayoutPanel && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={panelBase}
              style={{ padding: "14px 16px" }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <label className={`text-[10px] w-12 shrink-0 tracking-wider uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>斥力</label>
                  <input type="range" min={-300} max={-20} step={10} value={repulsionStrength} onChange={(e) => setRepulsionStrength(Number(e.target.value))} className="graph-range flex-1" />
                  <span className={`text-[10px] w-8 text-right tabular-nums ${isDark ? "text-gray-600" : "text-gray-400"}`}>{repulsionStrength}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className={`text-[10px] w-12 shrink-0 tracking-wider uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>距离</label>
                  <input type="range" min={20} max={200} step={10} value={linkDistance} onChange={(e) => setLinkDistance(Number(e.target.value))} className="graph-range flex-1" />
                  <span className={`text-[10px] w-8 text-right tabular-nums ${isDark ? "text-gray-600" : "text-gray-400"}`}>{linkDistance}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear highlight */}
        <AnimatePresence>
          {hasHighlight && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              onClick={clearHighlights}
              className="self-start graph-clear-btn"
              data-theme={theme}
            >
              <X size={11} />
              <span>清除高亮</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* === Bottom-right legend === */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-5 right-5"
        style={{ zIndex: 9995 }}
      >
        <div className={panelBase} style={{ padding: "10px 16px" }}>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-5 text-[11px]">
              <span className="flex items-center gap-2 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="tracking-wider">文章</span>
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <span className="w-2 h-2 bg-amber-500" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
                <span className="tracking-wider">标签</span>
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <span className="w-2 h-2 bg-violet-500" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
                <span className="tracking-wider">分类</span>
              </span>
            </div>
            <div className={`w-px h-4 ${isDark ? "bg-white/[0.06]" : "bg-gray-200/60"}`} />
            <div className={`flex items-center gap-3 text-[10px] tracking-wider ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              <span>滚轮缩放</span>
              <span className={isDark ? "text-gray-700" : "text-gray-300"}>·</span>
              <span>拖拽平移</span>
              <span className={isDark ? "text-gray-700" : "text-gray-300"}>·</span>
              <span>点击高亮</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function KnowledgeGraph() {
  return createPortal(
    <PageErrorBoundary>
      <GraphPage />
    </PageErrorBoundary>,
    document.body
  );
}
