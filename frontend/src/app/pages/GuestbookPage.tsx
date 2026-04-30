import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, User, Mail, ArrowRight } from "lucide-react";
import { guestbookApi } from "../services/api";
import { Guestbook } from "../types";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useNestedLenis } from "../hooks/useNestedLenis";
import { Card } from "../components/ui/card";

interface FloatingMessage {
  id: number;
  content: string;
  authorName: string;
  left: number;
  top: number;
  animationDuration: number;
  delay: number;
}

export function GuestbookPage() {
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([]);
  const [floatingMessages, setFloatingMessages] = useState<FloatingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const guestbookListRef = useRef<HTMLDivElement>(null);

  // 嵌套 Lenis 平滑滚动（内层列表）
  useNestedLenis({
    wrapper: guestbookListRef,
    enabled: true,
  });

  const loadGuestbooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await guestbookApi.getGuestbook();
      setGuestbooks(data);
      initFloatingMessages(data);
    } catch (error) {
      console.error("获取留言失败:", error);
      toast.error("加载留言失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuestbooks();
  }, [loadGuestbooks]);

  const initFloatingMessages = (data: Guestbook[]) => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const colors = ['#7c5cbf', '#5c9fbf', '#bf5c8f', '#5cbf7c', '#bf9f5c', '#5cbfbf'];
    const messages: FloatingMessage[] = shuffled.map((gb, index) => ({
      id: gb.id,
      content: gb.content,
      authorName: gb.authorName,
      left: 100 + index * 30,
      top: Math.random() * 70,
      animationDuration: 12 + Math.random() * 15,
      delay: index * 2,
      color: colors[index % colors.length],
    }));
    setFloatingMessages(messages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) {
      toast.error("请填写昵称和留言内容");
      return;
    }

    try {
      setSubmitting(true);
      await guestbookApi.createGuestbook({
        id: 0,
        content: content.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        authorAvatar: "",
        reply: "",
        replyTime: "",
        status: 1,
        sort: 0,
        createTime: "",
        updateTime: "",
      });
      toast.success("留言成功!");
      setContent("");
      setAuthorEmail("");
      loadGuestbooks();
    } catch (error) {
      console.error("提交留言失败:", error);
      toast.error("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const ownerMessage = "感谢每一位来到这里的访客。愿我的文字能为你带来一丝温暖，一份启发。期待在留言板与你相遇，共同探讨成长的点滴。";

  return (
    <div className="relative z-10">
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 items-stretch">
            <div className="flex-1 flex flex-col gap-4">
              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl shadow-lg h-[280px] bg-white border border-gray-100"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center mb-2 z-10">
                    <MessageCircle className="w-8 h-8 text-[#5c9fbf] mx-auto mb-2" />
                    <h2 className="text-xl font-bold text-gray-800 font-buding">流动留言板</h2>
                    <p className="text-gray-400 text-xs mt-1">每一句话都在时光中飘过</p>
                  </div>
                </div>
                <div className="absolute inset-0 overflow-hidden">
                  {floatingMessages.map((msg) => (
                    <div
                      key={`${msg.id}-${msg.delay}`}
                      className="absolute whitespace-nowrap"
                      style={{
                        left: `${msg.left}%`,
                        top: `${msg.top}%`,
                        animation: `floatLeft ${msg.animationDuration}s linear ${msg.delay}s infinite`,
                      }}
                    >
                      <div
                        className="rounded-lg px-4 py-2 shadow-sm"
                        style={{ backgroundColor: `${msg.color}08`, border: `1px solid ${msg.color}25` }}
                      >
                        <p className="text-gray-700 text-xs italic">"{msg.content.substring(0, 30)}{msg.content.length > 30 ? '...' : ''}"</p>
                        <p className="text-xs mt-1" style={{ color: msg.color }}>— {msg.authorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <style>{`
                  @keyframes floatLeft {
                    0% {
                      transform: translateX(0);
                      opacity: 0;
                    }
                    10% {
                      opacity: 1;
                    }
                    90% {
                      opacity: 1;
                    }
                    100% {
                      transform: translateX(-200vw);
                      opacity: 0;
                    }
                  }
                  @keyframes slideInFromRight {
                    0% {
                      opacity: 0;
                      transform: translateX(80px);
                    }
                    50% {
                      opacity: 1;
                      transform: translateX(-8px);
                    }
                    70% {
                      transform: translateX(4px);
                    }
                    85% {
                      transform: translateX(-2px);
                    }
                    100% {
                      opacity: 1;
                      transform: translateX(0);
                    }
                  }
                `}</style>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center font-buding">博主寄语</h3>
                <div className="text-center">
                  <p className="text-2xl font-serif text-[#00CED1] leading-relaxed italic">
                    "{ownerMessage}"
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 font-buding">
                  <Send size={18} className="text-[#5cbf9f]" />
                  写留言
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="你的昵称"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="pl-9 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="邮箱(选填)"
                          value={authorEmail}
                          onChange={(e) => setAuthorEmail(e.target.value)}
                          className="pl-9 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                  <Textarea
                    placeholder="说点什么吧..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#5cbf9f] hover:bg-[#4a9f7f] text-white"
                    >
                      {submitting ? "提交中..." : "发布留言"}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="hidden md:block w-80 flex-shrink-0">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-lg h-[729px] flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 font-buding">
                  <MessageCircle size={18} className="text-[#5c9fbf]" />
                  留言列表
                  <span className="text-gray-400 text-sm ml-auto">({guestbooks.length})</span>
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide" style={{ overscrollBehavior: 'contain' }} ref={guestbookListRef}>
                  {loading ? (
                    <div className="text-center text-gray-400 text-sm py-8">加载中...</div>
                  ) : guestbooks.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">暂无留言</div>
                  ) : (
                    guestbooks.map((gb, index) => (
                      <div
                        key={gb.id}
                        className="bg-gray-50 border border-gray-100 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                        style={{
                          opacity: 0,
                          animation: `slideInFromRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s forwards`,
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#5cbf9f]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#5c9fbf] text-xs font-medium">
                              {gb.authorName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-800 text-sm font-medium truncate">{gb.authorName}</p>
                              <p className="text-gray-400 text-xs">
                                {new Date(gb.createTime).toLocaleDateString("zh-CN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <p className="text-gray-600 text-xs mt-1 leading-relaxed line-clamp-2">
                              {gb.content}
                            </p>
                            {gb.reply && (
                              <div className="mt-2 pl-2 border-l-2 border-[#7c5cbf]/30">
                                <p className="text-[#5c9fbf] text-xs italic">
                                  <span className="font-medium">博主回复:</span> {gb.reply}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                  {gb.replyTime ? new Date(gb.replyTime).toLocaleDateString("zh-CN", {
                                    month: "short",
                                    day: "numeric",
                                  }) : ""}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}