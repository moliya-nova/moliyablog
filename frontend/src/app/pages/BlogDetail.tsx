import { useParams, Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Calendar, Clock, Tag, ArrowLeft, Share2, ChevronRight } from "lucide-react";
import { MarkdownContent } from "../components/MarkdownContent";
import { useEffect, useState, useMemo, useRef, Component, type ReactNode } from "react";
import { articleApi, commentApi, tagApi, aboutPageApi } from "../services/api";
import { getImageUrl } from "../utils/imagePath";
import { Article, Tag as TagType, Comment } from "../types";
import { LazyImage } from "../components/LazyImage";
import { motion } from "motion/react";
import { extractTocItems } from "../utils/headingId";
import { TableOfContents } from "../components/TableOfContents";

type Theme = "light" | "dark";

class PageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: "" };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error: error.message }; }
  componentDidCatch(error: Error) { console.error("BlogDetail error:", error); }
  render() {
    if (this.state.hasError) {
      return createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#f4f6fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="flex flex-col items-center gap-6">
            <p className="text-red-400 text-sm">页面渲染出错</p>
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

function BlogDetailInner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Article | null>(null);
  const [tags, setTags] = useState<TagType[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [theme] = useState<Theme>(() => {
    const saved = localStorage.getItem("page-theme");
    return (saved as Theme) || "light";
  });

  const isDark = theme === "dark";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 设置 body 属性以控制侧边栏样式
  useEffect(() => {
    document.body.setAttribute("data-blogdetail-theme", theme);
    return () => { document.body.removeAttribute("data-blogdetail-theme"); };
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 加载头像
  useEffect(() => {
    let cancelled = false;
    aboutPageApi.getAboutPage().then((res) => {
      if (cancelled) return;
      const profile = typeof res?.profile === "string" ? JSON.parse(res.profile) : res?.profile;
      if (profile?.avatar) {
        getImageUrl(profile.avatar).then((url) => {
          if (!cancelled) setAvatarUrl(url);
        });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const articleData = await articleApi.getArticleById(Number(id));
        setPost(articleData);
        if (articleData.id) {
          const tagsData = await tagApi.getTagsByArticleId(articleData.id);
          setTags(tagsData);
          const commentsData = await commentApi.getCommentsByArticleId(articleData.id);
          setComments(commentsData);
          if (articleData.categoryId) {
            const relatedData = await articleApi.getArticlesByCategory(articleData.categoryId);
            setRelatedPosts(relatedData.filter((p: Article) => p.id !== articleData.id).slice(0, 3));
          }
        }
        setError(null);
      } catch (err) {
        console.error("获取文章详情失败:", err);
        setError("获取文章详情失败");
      } finally {
        setLoading(false);
      }
    };
    fetchArticleDetail();
  }, [id]);

  const toc = useMemo(() => {
    if (!post) return [];
    return extractTocItems(post.content).filter((item) => item.level <= 3);
  }, [post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, text: post?.excerpt, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const bg = isDark ? "#020408" : "#f4f6fa";
  const panelBase = isDark
    ? "bg-[#0a0c18]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/60"
    : "bg-white/70 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-lg shadow-black/[0.04]";

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: bg }}>
        <BackgroundLayers isDark={isDark} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-20 h-20">
              <div className={`absolute inset-0 rounded-full border ${isDark ? "border-cyan-500/10" : "border-blue-300/20"} animate-spin`} style={{ animationDuration: "3s" }} />
              <div className={`absolute inset-2 rounded-full border ${isDark ? "border-cyan-500/15" : "border-blue-300/25"} animate-spin`} style={{ animationDuration: "2.5s", animationDirection: "reverse" }} />
              <div className={`absolute inset-4 rounded-full border ${isDark ? "border-cyan-500/20" : "border-blue-300/30"} animate-spin`} style={{ animationDuration: "2s" }} />
              <div className={`absolute inset-6 rounded-full ${isDark ? "bg-cyan-500/10" : "bg-blue-100/50"} animate-pulse`} />
            </div>
            <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-[10px] tracking-[0.4em] uppercase`}>Loading</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: bg }}>
        <BackgroundLayers isDark={isDark} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>文章未找到</h1>
            <p className={`mb-8 ${isDark ? "text-gray-500" : "text-gray-500"}`}>抱歉，您要查找的文章不存在。</p>
            <Link
              to="/home/blog"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${panelBase} transition-all duration-200 hover:scale-105`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回博客列表</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: bg }}>
      <BackgroundLayers isDark={isDark} />

      {/* Content */}
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 lg:pr-72">
          {/* Back button */}
          <motion.button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full ${panelBase} transition-all duration-200 hover:scale-105`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ArrowLeft className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>返回</span>
          </motion.button>

          {/* Article card */}
          <motion.article
            className={`${panelBase} overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {post.imageUrl && (
              <div className="aspect-[21/9] overflow-hidden">
                <LazyImage src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" rootMargin="200px" />
              </div>
            )}

            <div className="px-8 py-10 md:px-12 md:py-12">
              {/* Meta */}
              <motion.div
                className="flex flex-wrap items-center gap-4 text-sm mb-6"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              >
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isDark ? "bg-cyan-500/10 text-cyan-400" : "bg-blue-50 text-blue-600"}`}>
                  <Tag className="h-3.5 w-3.5" />
                  <span>{post.categoryName}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{post.createTime}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{post.readTime}</span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
                style={{ fontFamily: "'Noto Serif SC', 'Source Han Serif SC', Georgia, serif" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              >
                {post.title}
              </motion.h1>

              {/* Author & share */}
              <motion.div
                className={`flex items-center justify-between pb-8 mb-10 border-b ${isDark ? "border-white/[0.06]" : "border-gray-200/60"}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400/30">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="moliya" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">M</div>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-white/90" : "text-gray-800"}`}>moliya</p>
                    <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>作者</p>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${isDark ? "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"}`}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">分享</span>
                </button>
              </motion.div>

              {/* Content */}
              <motion.div
                className="blog-article-content"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                data-theme={theme}
              >
                <MarkdownContent content={post.content} />
              </motion.div>

              {/* Tags */}
              <motion.div
                className={`mt-12 pt-8 border-t ${isDark ? "border-white/[0.06]" : "border-gray-200/60"}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm mr-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>标签:</span>
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <span key={tag.id} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-default ${isDark ? "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]" : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/80"}`}>
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? "bg-white/[0.04] text-gray-400" : "bg-gray-100/80 text-gray-600"}`}>{post.categoryName}</span>
                  )}
                </div>
              </motion.div>

              {/* Comments */}
              {comments.length > 0 && (
                <motion.section
                  className={`mt-12 pt-10 border-t ${isDark ? "border-white/[0.06]" : "border-gray-200/60"}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                >
                  <h2 className={`text-xl font-bold mb-8 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                    <span>评论</span>
                    <span className={`text-sm font-normal ${isDark ? "text-gray-600" : "text-gray-400"}`}>({comments.length})</span>
                  </h2>
                  <div className="space-y-6">
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        className={`p-5 rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-gray-50/80"}`}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + index * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold">
                              {comment.author?.charAt(0) || "U"}
                            </div>
                            <h4 className={`font-medium text-sm ${isDark ? "text-white/90" : "text-gray-800"}`}>{comment.author}</h4>
                          </div>
                          <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>{comment.createTime}</span>
                        </div>
                        <p className={`text-sm leading-relaxed pl-11 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{comment.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>
          </motion.article>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <motion.section
              className="mt-12"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            >
              <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                <span>相关文章</span>
                <ChevronRight className={`h-5 w-5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <Link
                      to={`/home/blog/${relatedPost.id}`}
                      className={`group block ${panelBase} overflow-hidden transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="aspect-video overflow-hidden">
                        <LazyImage src={relatedPost.imageUrl} alt={relatedPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" rootMargin="200px" />
                      </div>
                      <div className="p-4">
                        <h3 className={`font-medium text-sm line-clamp-2 transition-colors ${isDark ? "text-white/90 group-hover:text-cyan-400" : "text-gray-800 group-hover:text-blue-600"}`}>{relatedPost.title}</h3>
                        <p className={`text-xs mt-2 ${isDark ? "text-gray-600" : "text-gray-400"}`}>{relatedPost.readTime}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          <div className="h-16" />
        </div>
      </div>

      <TableOfContents items={toc} scrollContainerRef={scrollContainerRef} />
    </div>
  );
}

// Background layers — 与知识图谱完全一致
function BackgroundLayers({ isDark }: { isDark: boolean }) {
  return (
    <>
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
                <div key={`star-${i}`} className="graph-star" style={{
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
    </>
  );
}

export function BlogDetail() {
  return createPortal(
    <PageErrorBoundary>
      <BlogDetailInner />
    </PageErrorBoundary>,
    document.body
  );
}
