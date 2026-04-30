import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Copy, Check, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { chatApi } from "../services/api";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
};

const WELCOME_CHIPS = [
  "你好，介绍一下自己",
  "推荐一篇博客文章",
  "聊聊技术趋势",
];

interface ChatSession {
  threadId: string;
  messages: ChatMessage[];
}

const SESSION_KEY = "chat_session";

function loadSession(): ChatSession {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as ChatSession;
      if (session.threadId && Array.isArray(session.messages)) {
        return session;
      }
    }
  } catch {
    // JSON 解析失败，走新建逻辑
  }
  const newSession: ChatSession = {
    threadId: crypto.randomUUID(),
    messages: [],
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  return newSession;
}

function saveSession(session: ChatSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function ChatPanel({ className }: { className?: string }) {
  const [session, setSession] = useState<ChatSession>(loadSession);
  const messages = session.messages;
  const threadId = session.threadId;

  const setMessages = useCallback((updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setSession((prev) => {
      const newMessages = typeof updater === "function" ? updater(prev.messages) : updater;
      const newSession = { ...prev, messages: newMessages };
      saveSession(newSession);
      return newSession;
    });
  }, []);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Typewriter buffer ---
  const bufferRef = useRef("");
  const assistantIdRef = useRef("");
  const streamDoneRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTypewriter = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (!bufferRef.current) {
        if (streamDoneRef.current) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setLoading(false);
        }
        return;
      }
      const next = bufferRef.current.slice(0, 2);
      bufferRef.current = bufferRef.current.slice(2);
      const id = assistantIdRef.current;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === id);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], content: updated[idx].content + next };
        return updated;
      });
    }, 18);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    assistantIdRef.current = assistantId;
    bufferRef.current = "";
    streamDoneRef.current = false;
    let assistantCreated = false;

    try {
      await chatApi.streamMessage(content, (data) => {
        if (data.code === 200 && data.data) {
          if (!assistantCreated) {
            assistantCreated = true;
            setMessages((prev) => [
              ...prev,
              { id: assistantId, role: "assistant", content: "" },
            ]);
            startTypewriter();
          }
          bufferRef.current += data.data;
        } else if (data.code !== 200) {
          toast.error(data.msg || "AI 服务异常");
        }
      }, threadId);
    } catch {
      toast.error("AI 服务异常，请稍后重试");
    } finally {
      streamDoneRef.current = true;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    if (loading) return;
    chatApi.deleteMemory(threadId);
    const newSession: ChatSession = {
      threadId: crypto.randomUUID(),
      messages: [],
    };
    saveSession(newSession);
    setSession(newSession);
  };

  const isTyping = loading;

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5c9fbf] to-[#5cbf9f] flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-800 leading-tight">超级马小凯</h2>
          <p className="text-xs text-gray-400">AI 助手 · 在线</p>
        </div>
        <button
          onClick={handleNewChat}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-[#5cbf9f] hover:bg-[#5cbf9f]/5 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="新对话"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>新对话</span>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scrollbar min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5c9fbf] to-[#5cbf9f] flex items-center justify-center mb-4 shadow-lg shadow-[#5cbf9f]/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">你好，我是马小凯</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              有什么想聊的？可以试试下面的问题
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {WELCOME_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="chat-chip px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-enter flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5c9fbf] to-[#5cbf9f] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                {msg.role === "user" ? (
                  <div className="max-w-[75%] bg-[#5cbf9f] text-white rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[80%] group">
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                      {isTyping && msg.id === assistantIdRef.current && (
                        <span className="typing-cursor" />
                      )}
                    </div>
                    {msg.content && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        title="复制"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#5cbf9f]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-[#5cbf9f]" />
                  </div>
                )}
              </div>
            ))}

            {loading && (messages.length === 0 || messages[messages.length - 1]?.role === "user") && (
              <div className="flex gap-3 chat-message-enter">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5c9fbf] to-[#5cbf9f] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-5 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Shift+Enter 换行)"
            rows={1}
            disabled={loading}
            className="chat-textarea flex-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-2xl px-4 py-3 outline-none shadow-sm hover:border-gray-400 focus:border-[#5cbf9f] focus:ring-2 focus:ring-[#5cbf9f]/30 focus:shadow-md transition-all placeholder:text-gray-400 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              loading
                ? "bg-gray-200 text-gray-400 chat-sending-btn"
                : input.trim()
                  ? "bg-[#5cbf9f] hover:bg-[#4a9f7f] text-white shadow-md shadow-[#5cbf9f]/25"
                  : "bg-gray-200 text-gray-400"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
