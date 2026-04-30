import { ChatPanel } from "../components/ChatPanel";

export function ChatPage() {
  return (
    <div className="relative z-10 h-[calc(100vh-6rem)] flex items-center justify-center px-4 pt-12 pb-2">
      <ChatPanel className="w-full max-w-4xl h-[calc(100%-2rem)]" />
    </div>
  );
}
