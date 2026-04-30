import { useState, useRef, useCallback, createContext, useContext } from "react";
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
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const panelRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev === "open") return "closing";
      if (prev === "closed") return "open";
      return prev;
    });
  }, []);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    setState((prev) => {
      if (prev === "closing") return "closed";
      return prev;
    });
  }, []);

  return (
    <ChatFloatContext.Provider value={{ isOpen: state === "open", toggle }}>
      {children}

      {/* Chat panel */}
      {state !== "closed" && (
        <div
          ref={panelRef}
          onAnimationEnd={handleAnimationEnd}
          className={`fixed z-[55] left-[4.5rem] top-1/2 -translate-y-1/2 w-[440px] h-[min(80vh,680px)] ${
            state === "open" ? "chat-float-enter" : "chat-float-exit"
          }`}
        >
          <ChatPanel className="w-full h-full" />
        </div>
      )}
    </ChatFloatContext.Provider>
  );
}
