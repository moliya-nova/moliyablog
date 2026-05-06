import { useState, useRef, useCallback, createContext, useContext, useEffect } from "react";
import { ChatPanel } from "./ChatPanel";

interface ChatFloatContextType {
  isOpen: boolean;
  toggle: () => void;
}

const ChatFloatContext = createContext<ChatFloatContextType>({
  isOpen: false,
  toggle: () => {},
});

export function useChatFloat() {
  return useContext(ChatFloatContext);
}

export function ChatFloatProvider({ children }: { children: React.ReactNode }) {
  // 计算初始位置（右侧居中）
  const getInitialPosition = useCallback(() => ({
    x: window.innerWidth - 440 - 24,
    y: (window.innerHeight - Math.min(window.innerHeight * 0.8, 680)) / 2,
  }), []);

  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef(getInitialPosition());
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev === "open") return "closing";
      if (prev === "closed") {
        positionRef.current = getInitialPosition();
        return "open";
      }
      return prev;
    });
  }, [getInitialPosition]);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    setState((prev) => {
      if (prev === "closing") return "closed";
      return prev;
    });
  }, []);

  // 拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: positionRef.current.x,
      startPosY: positionRef.current.y,
    };
  }, []);

  // 拖拽中 - 使用 transform 和 requestAnimationFrame 优化性能
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 取消上一帧的更新
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // 使用 requestAnimationFrame 节流
      rafRef.current = requestAnimationFrame(() => {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        // 限制在窗口范围内
        const panelWidth = 440;
        const panelHeight = Math.min(window.innerHeight * 0.8, 680);
        const newX = Math.max(0, Math.min(window.innerWidth - panelWidth, dragRef.current.startPosX + dx));
        const newY = Math.max(0, Math.min(window.innerHeight - panelHeight, dragRef.current.startPosY + dy));

        positionRef.current = { x: newX, y: newY };

        // 直接操作 DOM，使用 CSS 变量避免覆盖动画的 transform
        if (panelRef.current) {
          panelRef.current.style.setProperty('--chat-translate', `translate(${newX}px, ${newY}px)`);
        }

        rafRef.current = null;
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging]);

  return (
    <ChatFloatContext.Provider value={{ isOpen: state === "open", toggle }}>
      {children}

      {/* Chat panel */}
      {state !== "closed" && (
        <div
          ref={panelRef}
          onAnimationEnd={handleAnimationEnd}
          className={`fixed z-[55] w-[440px] h-[min(80vh,680px)] select-none will-change-transform ${
            state === "open" ? "chat-float-enter" : "chat-float-exit"
          } ${isDragging ? "cursor-grabbing" : ""}`}
          style={{
            left: 0,
            top: 0,
            '--chat-translate': `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
          } as React.CSSProperties}
        >
          <ChatPanel className="w-full h-full" onDragStart={handleMouseDown} onClose={toggle} />
        </div>
      )}
    </ChatFloatContext.Provider>
  );
}
