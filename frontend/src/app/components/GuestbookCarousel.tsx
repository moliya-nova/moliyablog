import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { guestbookApi } from "../services/api";
import { Guestbook } from "../types";

export function GuestbookCarousel() {
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchGuestbooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await guestbookApi.getGuestbook();
        setGuestbooks(data);
      } catch (err) {
        console.error("获取留言失败:", err);
        setError("加载留言失败");
      } finally {
        setLoading(false);
      }
    };

    fetchGuestbooks();
  }, []);

  const goToNext = useCallback(() => {
    if (isAnimating || guestbooks.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % guestbooks.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, guestbooks.length]);

  const goToPrev = useCallback(() => {
    if (isAnimating || guestbooks.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + guestbooks.length) % guestbooks.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, guestbooks.length]);

  useEffect(() => {
    if (guestbooks.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [guestbooks.length, isPaused, goToNext]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-white/50 text-xs">加载中...</div>
      </div>
    );
  }

  if (error || guestbooks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/50 text-xs flex items-center gap-2">
          <MessageCircle size={14} />
          暂无留言
        </div>
      </div>
    );
  }

  const currentGuestbook = guestbooks[currentIndex];

  return (
    <div
      className="h-full flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <MessageCircle size={14} className="text-[#6a9a90]" />
          <span className="text-white/80 text-sm font-medium tracking-wider font-tangyinghei">留言墙</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrev}
            disabled={guestbooks.length <= 1}
            className="text-white/30 hover:text-[#6a9a90] transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-white/40 text-[10px] tabular-nums font-medium">
            {currentIndex + 1} / {guestbooks.length}
          </span>
          <button
            onClick={goToNext}
            disabled={guestbooks.length <= 1}
            className="text-white/30 hover:text-[#6a9a90] transition-colors disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
            isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
          }`}
        >
          <div className="h-full flex flex-col justify-between">
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2 italic px-1 font-light font-tangyinghei">
              "{currentGuestbook.content}"
            </p>

            <div className="flex items-center gap-3 mt-auto">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6a9a90] to-[#3a5a50] flex items-center justify-center shadow-lg border border-white/10">
                <span className="text-white text-xs font-bold">
                  {(currentGuestbook.authorName || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-medium truncate font-tangyinghei">
                  {currentGuestbook.authorName}
                </p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider truncate">
                  {new Date(currentGuestbook.createTime).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
