import { useRef, useEffect, useState, lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";
import { AnimatePresence } from "motion/react";
import { GraphData, GraphNode } from "./graphTypes";
import { GraphTooltip } from "./GraphTooltip";

const ForceGraph2D = lazy(() => import("react-force-graph-2d"));

interface GraphCanvasProps {
  data: GraphData;
  showTags: boolean;
  showCategories: boolean;
  onNodeClick: (node: GraphNode) => void;
  searchTerm: string;
  highlightedNodeIds: Set<string>;
  repulsionStrength: number;
  linkDistance: number;
  theme?: "dark" | "light";
}

interface HoveredLink {
  source: string;
  target: string;
}

class GraphErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Graph error:", error, info); }
  render() {
    if (this.state.hasError) return <div className="flex items-center justify-center h-full text-gray-500"><p>图谱渲染出错</p></div>;
    return this.props.children;
  }
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - size * 1.2);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size * 1.2);
  ctx.lineTo(x - size, y);
  ctx.closePath();
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// --- Edge tooltip positioning algorithm ---

const TOOLTIP_W = 320;
const TOOLTIP_H = 120;
const NODE_GAP = 12;
const VIEWPORT_PAD = 8;

interface TooltipPos {
  x: number;
  y: number;
  anchor: 'left' | 'right';
}

function clampVal(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function boxesOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay - ah / 2 < by + bh / 2 &&
    ay + ah / 2 > by - bh / 2
  );
}

/**
 * Compute viewport-aware tooltip positions for a hovered edge.
 *
 * Strategy: each tooltip sits near its own node, pushed AWAY from the edge.
 *   - src tooltip: offset from src node in direction (src → tgt reversed)
 *   - tgt tooltip: offset from tgt node in direction (tgt → src reversed)
 * This keeps tooltips close to their nodes and never on the edge line.
 */
function computeEdgeTooltipPositions(
  srcScreen: { x: number; y: number },
  tgtScreen: { x: number; y: number },
  srcRadius: number,
  tgtRadius: number,
  viewport: { width: number; height: number },
): { src: TooltipPos; tgt: TooltipPos } {
  const OFFSET = srcRadius + NODE_GAP + 30;

  // Edge direction: src → tgt
  const dx = tgtScreen.x - srcScreen.x;
  const dy = tgtScreen.y - srcScreen.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  // src tooltip: push AWAY from tgt → direction is (-ux, -uy)
  // tgt tooltip: push AWAY from src → direction is (ux, uy)
  // Add a small perpendicular nudge so tooltips don't sit right on the edge line
  const nx = -uy;
  const ny = ux;
  const perpNudge = 20;

  let srcX = srcScreen.x - ux * OFFSET + nx * perpNudge;
  let srcY = srcScreen.y - uy * OFFSET + ny * perpNudge;
  let tgtX = tgtScreen.x + ux * OFFSET + nx * perpNudge;
  let tgtY = tgtScreen.y + uy * OFFSET + ny * perpNudge;

  // Very short edges: stack at midpoint, above/below based on viewport space
  if (len < 60) {
    const midX = (srcScreen.x + tgtScreen.x) / 2;
    const midY = (srcScreen.y + tgtScreen.y) / 2;
    const gap = TOOLTIP_H / 2 + 8;
    const dir = midY > viewport.height / 2 ? -1 : 1;

    srcX = midX;
    srcY = midY + dir * gap;
    tgtX = midX;
    tgtY = midY - dir * gap;
  }

  // Clamp to viewport
  srcX = clampVal(srcX, VIEWPORT_PAD, viewport.width - TOOLTIP_W - VIEWPORT_PAD);
  srcY = clampVal(srcY, VIEWPORT_PAD + TOOLTIP_H / 2, viewport.height - TOOLTIP_H / 2 - VIEWPORT_PAD);
  tgtX = clampVal(tgtX, VIEWPORT_PAD, viewport.width - TOOLTIP_W - VIEWPORT_PAD);
  tgtY = clampVal(tgtY, VIEWPORT_PAD + TOOLTIP_H / 2, viewport.height - TOOLTIP_H / 2 - VIEWPORT_PAD);

  // Prevent overlap: nudge apart along edge direction
  if (boxesOverlap(srcX, srcY, TOOLTIP_W, TOOLTIP_H, tgtX, tgtY, TOOLTIP_W, TOOLTIP_H)) {
    const separation = TOOLTIP_H / 2 + 10;
    srcX -= ux * separation;
    srcY -= uy * separation;
    tgtX += ux * separation;
    tgtY += uy * separation;

    srcX = clampVal(srcX, VIEWPORT_PAD, viewport.width - TOOLTIP_W - VIEWPORT_PAD);
    srcY = clampVal(srcY, VIEWPORT_PAD + TOOLTIP_H / 2, viewport.height - TOOLTIP_H / 2 - VIEWPORT_PAD);
    tgtX = clampVal(tgtX, VIEWPORT_PAD, viewport.width - TOOLTIP_W - VIEWPORT_PAD);
    tgtY = clampVal(tgtY, VIEWPORT_PAD + TOOLTIP_H / 2, viewport.height - TOOLTIP_H / 2 - VIEWPORT_PAD);
  }

  const srcAnchor: 'left' | 'right' = srcX + TOOLTIP_W / 2 < srcScreen.x ? 'right' : 'left';
  const tgtAnchor: 'left' | 'right' = tgtX + TOOLTIP_W / 2 < tgtScreen.x ? 'right' : 'left';

  return {
    src: { x: srcX, y: srcY, anchor: srcAnchor },
    tgt: { x: tgtX, y: tgtY, anchor: tgtAnchor },
  };
}

function GraphInner({
  data, showTags, showCategories, onNodeClick,
  searchTerm, highlightedNodeIds, repulsionStrength, linkDistance, theme = "dark",
}: GraphCanvasProps) {
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<HoveredLink | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Tooltip positions for link endpoints (screen coords near each node)
  const [linkTooltipSrc, setLinkTooltipSrc] = useState<{ x: number; y: number } | null>(null);
  const [linkTooltipTgt, setLinkTooltipTgt] = useState<{ x: number; y: number } | null>(null);
  const [srcAnchor, setSrcAnchor] = useState<'left' | 'right'>('left');
  const [tgtAnchor, setTgtAnchor] = useState<'left' | 'right'>('left');

  const hasHighlight = searchTerm.trim().length > 0 || highlightedNodeIds.size > 0;

  const visibilityRef = useRef({ showTags: true, showCategories: true });
  useEffect(() => {
    visibilityRef.current = { showTags, showCategories };
  }, [showTags, showCategories]);

  const stateRef = useRef({ hoveredNode, hoveredLink, highlightedNodeIds, hasHighlight, dimensions });
  useEffect(() => {
    stateRef.current = { hoveredNode, hoveredLink, highlightedNodeIds, hasHighlight, dimensions };
  });

  const isNodeVisible = (node: GraphNode): boolean => {
    if (node.type === "article") return true;
    if (node.type === "tag") return visibilityRef.current.showTags;
    if (node.type === "category") return visibilityRef.current.showCategories;
    return false;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setDimensions({ width, height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    try {
      fg.d3Force("charge")?.strength(repulsionStrength);
      fg.d3Force("link")?.distance(linkDistance);
      fg.d3ReheatSimulation();
    } catch {}
  }, [repulsionStrength, linkDistance]);

  // Update link tooltip positions using viewport-aware algorithm
  useEffect(() => {
    if (!hoveredLink) {
      setLinkTooltipSrc(null);
      setLinkTooltipTgt(null);
      return;
    }
    const fg = graphRef.current;
    if (!fg) return;

    const srcNode = data.nodes.find(n => n.id === hoveredLink.source);
    const tgtNode = data.nodes.find(n => n.id === hoveredLink.target);
    if (!srcNode || !tgtNode) return;

    const raf = requestAnimationFrame(() => {
      try {
        const srcCoord = fg.graph2ScreenCoords(srcNode.x ?? 0, srcNode.y ?? 0);
        const tgtCoord = fg.graph2ScreenCoords(tgtNode.x ?? 0, tgtNode.y ?? 0);
        const zoom = fg.zoom?.() ?? 1;
        const srcRadius = (srcNode.val ?? 5) * zoom + 6;
        const tgtRadius = (tgtNode.val ?? 5) * zoom + 6;

        const result = computeEdgeTooltipPositions(
          srcCoord, tgtCoord, srcRadius, tgtRadius, dimensions,
        );

        setLinkTooltipSrc({ x: result.src.x, y: result.src.y });
        setLinkTooltipTgt({ x: result.tgt.x, y: result.tgt.y });
        setSrcAnchor(result.src.anchor);
        setTgtAnchor(result.tgt.anchor);
      } catch {
        setLinkTooltipSrc({ x: mousePos.x + 16, y: mousePos.y - 30 });
        setLinkTooltipTgt({ x: mousePos.x + 16, y: mousePos.y + 30 });
        setSrcAnchor('left');
        setTgtAnchor('left');
      }
    });
    return () => cancelAnimationFrame(raf);
  });

  function renderBackground(ctx: CanvasRenderingContext2D) {
    const { width, height } = stateRef.current.dimensions;
    ctx.clearRect(0, 0, width, height);
  }

  function nodeCanvasObject(node: any, ctx: CanvasRenderingContext2D, globalScale: number) {
    const gNode = node as GraphNode;
    const { hoveredNode: hNode, hoveredLink: hLink, highlightedNodeIds: hlIds, hasHighlight: hasHL } = stateRef.current;
    const visible = isNodeVisible(gNode);
    const size = gNode.val;
    const isHovered = hNode?.id === gNode.id;
    const isLinkEndpoint = hLink && (hLink.source === gNode.id || hLink.target === gNode.id);
    const isHighlighted = hlIds.has(gNode.id);
    const isDimmed = hasHL && !isHighlighted;

    ctx.save();

    if (!visible) {
      ctx.restore();
      return;
    }

    if (isDimmed) {
      ctx.globalAlpha = isDark ? 0.12 : 0.08;
      ctx.shadowBlur = 0;
    } else {
      ctx.globalAlpha = 1;
      ctx.shadowColor = gNode.color;
      const glowBase = isDark ? 18 : 8;
      if (isLinkEndpoint) {
        ctx.shadowBlur = glowBase + 20;
      } else {
        ctx.shadowBlur = isHighlighted ? glowBase + 20 : (isHovered ? glowBase + 30 : glowBase);
      }
    }

    const drawSize = isHovered && !isDimmed ? size * 1.3 : size;

    if (gNode.type === "article") {
      if ((isHighlighted || isLinkEndpoint || isHovered) && !isDimmed) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawSize + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = gNode.color;
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.globalAlpha = isHovered ? 0.5 : 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawSize + 10, 0, 2 * Math.PI);
        ctx.strokeStyle = gNode.color;
        ctx.lineWidth = isHovered ? 1.2 : 0.5;
        ctx.globalAlpha = isHovered ? 0.25 : 0.1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, drawSize, 0, 2 * Math.PI);
      ctx.fillStyle = gNode.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(node.x, node.y, drawSize * 0.3, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();
    } else if (gNode.type === "tag") {
      if ((isHighlighted || isLinkEndpoint || isHovered) && !isDimmed) {
        ctx.save();
        ctx.strokeStyle = gNode.color;
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.globalAlpha = isHovered ? 0.5 : 0.3;
        drawDiamond(ctx, node.x, node.y, drawSize + 5);
        ctx.stroke();
        ctx.restore();
      }
      drawDiamond(ctx, node.x, node.y, drawSize);
      ctx.fillStyle = gNode.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      drawDiamond(ctx, node.x, node.y, drawSize * 0.3);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();
    } else if (gNode.type === "category") {
      if ((isHighlighted || isLinkEndpoint || isHovered) && !isDimmed) {
        ctx.save();
        ctx.strokeStyle = gNode.color;
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.globalAlpha = isHovered ? 0.5 : 0.3;
        drawHexagon(ctx, node.x, node.y, drawSize + 5);
        ctx.stroke();
        ctx.restore();
      }
      drawHexagon(ctx, node.x, node.y, drawSize);
      ctx.fillStyle = gNode.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      drawHexagon(ctx, node.x, node.y, drawSize * 0.3);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();
    }

    ctx.restore();
  }

  function nodePointerAreaPaint(node: any, paintColor: string, ctx: CanvasRenderingContext2D) {
    const gNode = node as GraphNode;
    if (!isNodeVisible(gNode)) return;
    ctx.fillStyle = paintColor;
    ctx.beginPath();
    ctx.arc(node.x, node.y, gNode.val + 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  function linkCanvasObject(link: any, ctx: CanvasRenderingContext2D) {
    const srcId = typeof link.source === "object" ? link.source.id : link.source;
    const tgtId = typeof link.target === "object" ? link.target.id : link.target;
    const srcNode = data.nodes.find(n => n.id === srcId);
    const tgtNode = data.nodes.find(n => n.id === tgtId);

    if (!srcNode || !tgtNode || !isNodeVisible(srcNode) || !isNodeVisible(tgtNode)) return;

    const { hoveredNode: hNode, highlightedNodeIds: hlIds, hasHighlight: hasHL } = stateRef.current;
    const isHoverLink = hNode && (srcId === hNode.id || tgtId === hNode.id);
    const isBothHighlighted = hlIds.has(srcId) && hlIds.has(tgtId);
    const isDimmed = hasHL && !isBothHighlighted;

    const sx = typeof link.source === "object" ? link.source.x : 0;
    const sy = typeof link.source === "object" ? link.source.y : 0;
    const tx = typeof link.target === "object" ? link.target.x : 0;
    const ty = typeof link.target === "object" ? link.target.y : 0;

    ctx.save();
    if (isDimmed) {
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = "rgba(80,100,140,0.3)";
      ctx.lineWidth = 0.5;
    } else if (isBothHighlighted) {
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = tgtNode.color || "#888";
      ctx.lineWidth = 2;
      ctx.shadowColor = tgtNode.color || "#888";
      ctx.shadowBlur = 10;
    } else if (isHoverLink) {
      const hoverColor = hNode?.color || (isDark ? "#38bdf8" : "#3b82f6");
      ctx.globalAlpha = isDark ? 0.85 : 0.75;
      ctx.strokeStyle = hoverColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = hoverColor;
      ctx.shadowBlur = 12;
    } else {
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = "rgba(80,100,140,0.5)";
      ctx.lineWidth = 0.8;
    }
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();
  }

  function handleNodeHover(node: any) {
    const gNode = node as GraphNode | null;
    if (gNode && !isNodeVisible(gNode)) { setHoveredNode(null); return; }
    setHoveredNode(gNode);
    if (gNode) setHoveredLink(null);
  }

  function handleLinkHover(link: any) {
    if (!link) {
      setHoveredLink(null);
      return;
    }
    const srcId = typeof link.source === "object" ? link.source.id : link.source;
    const tgtId = typeof link.target === "object" ? link.target.id : link.target;
    setHoveredLink({ source: srcId, target: tgtId });
    setHoveredNode(null);
  }

  function handleNodeClick(node: any) {
    const gNode = node as GraphNode;
    if (!isNodeVisible(gNode)) return;
    onNodeClick(gNode);
  }

  function handleMouseMove(e: React.MouseEvent) {
    setMousePos({ x: e.clientX, y: e.clientY });
  }

  // Store hover state in refs for particle callback
  const hoverRef = useRef({ hoveredNode, hoveredLink });
  useEffect(() => { hoverRef.current = { hoveredNode, hoveredLink }; });

  const connectedCount = hoveredNode
    ? data.links.filter((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        const sNode = data.nodes.find(n => n.id === s);
        const tNode = data.nodes.find(n => n.id === t);
        return (s === hoveredNode.id || t === hoveredNode.id) && sNode && tNode && isNodeVisible(sNode) && isNodeVisible(tNode);
      }).length
    : 0;

  // Resolve link endpoint nodes
  const linkSrcNode = hoveredLink ? data.nodes.find(n => n.id === hoveredLink.source) ?? null : null;
  const linkTgtNode = hoveredLink ? data.nodes.find(n => n.id === hoveredLink.target) ?? null : null;
  const showLinkTooltips = hoveredLink && linkSrcNode && linkTgtNode;

  return (
    <div ref={containerRef} className="graph-canvas w-full h-full relative" onMouseMove={handleMouseMove} data-link-hover={hoveredLink ? "true" : undefined}>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-600 text-sm">加载中...</div>}>
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          linkCanvasObject={linkCanvasObject}
          onRenderFramePre={renderBackground}
          nodeLabel={() => ""}
          onNodeHover={handleNodeHover}
          onLinkHover={handleLinkHover}
          onNodeClick={handleNodeClick}
          linkDirectionalParticles={(link: any) => {
            const { hoveredNode: hNode, hoveredLink: hLink } = hoverRef.current;
            const srcId = typeof link.source === "object" ? link.source.id : link.source;
            const tgtId = typeof link.target === "object" ? link.target.id : link.target;
            // Link hover: only the hovered link gets particles
            if (hLink && hLink.source === srcId && hLink.target === tgtId) return 12;
            // Node hover: all links connected to the hovered node get particles
            if (hNode && (srcId === hNode.id || tgtId === hNode.id)) return 3;
            return 0;
          }}
          linkDirectionalParticleSpeed={(link: any) => {
            const { hoveredLink: hLink } = hoverRef.current;
            const srcId = typeof link.source === "object" ? link.source.id : link.source;
            const tgtId = typeof link.target === "object" ? link.target.id : link.target;
            if (hLink && hLink.source === srcId && hLink.target === tgtId) return 0.008;
            return 0.005;
          }}
          linkDirectionalParticleWidth={(link: any) => {
            const { hoveredNode: hNode, hoveredLink: hLink } = hoverRef.current;
            const srcId = typeof link.source === "object" ? link.source.id : link.source;
            const tgtId = typeof link.target === "object" ? link.target.id : link.target;
            if (hLink && hLink.source === srcId && hLink.target === tgtId) return 4;
            if (hNode && (srcId === hNode.id || tgtId === hNode.id)) return 3;
            return 2;
          }}
          linkDirectionalParticleColor={(link: any) => {
            const { hoveredNode: hNode } = hoverRef.current;
            const srcId = typeof link.source === "object" ? link.source.id : link.source;
            const tgtId = typeof link.target === "object" ? link.target.id : link.target;
            const tgt = typeof link.target === "object" ? link.target : data.nodes.find(n => n.id === link.target);
            if (hNode && (srcId === hNode.id || tgtId === hNode.id)) {
              return hNode.color || (isDark ? "#38bdf8" : "#3b82f6");
            }
            return tgt?.color || "rgba(80,100,140,0.5)";
          }}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={100}
          cooldownTime={5000}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          enablePointerInteraction={true}
        />
      </Suspense>
      {/* Tooltips with smooth enter/exit */}
      <AnimatePresence>
        {hoveredNode && !hoveredLink && (
          <GraphTooltip key="node" node={hoveredNode} x={mousePos.x + 16} y={mousePos.y} connectedCount={connectedCount} />
        )}
        {showLinkTooltips && linkTooltipSrc && linkTooltipTgt && (
          <>
            <GraphTooltip key="link-src" node={linkSrcNode!} x={linkTooltipSrc.x} y={linkTooltipSrc.y} anchor={srcAnchor} />
            <GraphTooltip key="link-tgt" node={linkTgtNode!} x={linkTooltipTgt.x} y={linkTooltipTgt.y} anchor={tgtAnchor} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <GraphErrorBoundary>
      <GraphInner {...props} />
    </GraphErrorBoundary>
  );
}
