import { Link } from "react-router-dom";
import { BlogCard } from "../components/BlogCard";
import { motion } from "motion/react";

import { GuestbookCarousel } from "../components/GuestbookCarousel";
import { articleApi, carouselApi, aboutPageApi, siteSettingsApi, siteStatsApi } from "../services/api";
import { Article } from "../types";
import { useState, useEffect, useRef } from "react";
import { AboutPageData } from "../types";
import { LazyImage } from "../components/LazyImage";
import { getImageUrl } from "../utils/imagePath";
import { useMusicPlayer } from "../components/MusicPlayer";


function AsyncCarouselImage({ src, alt, className, preloaded, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { preloaded?: boolean }) {
  return <LazyImage src={src} alt={alt} className={className} rootMargin="300px" preloaded={preloaded} {...props} />;
}

function AsyncAvatarImage({ src, alt, className, ...props }: { src?: string | null; alt?: string; className?: string }) {
  return <LazyImage src={src} alt={alt} className={className} {...props} />;
}

// 音乐播放器控制组件
function MusicPlayerControls() {
  const { currentTrack, isPlaying, progress, duration, togglePlay, next, previous } = useMusicPlayer();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-b from-[#2a3030] to-[#1a1c1c] backdrop-blur-md rounded-xl p-6 border border-white/10 flex flex-col items-center text-center shadow-2xl">
      <div className="w-full flex justify-between items-center mb-8">
        <span className="text-white/40 text-[10px] tracking-[0.2em] font-bold">NOW PLAYING</span>
        <svg className="w-4 h-4 text-[#6a9a90]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      </div>

      <div className={`relative w-40 h-40 rounded-full border border-white/5 bg-black/80 shadow-2xl overflow-hidden flex items-center justify-center ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
        <div className="absolute inset-0 border-[10px] border-[#111] rounded-full"></div>
        <div className="absolute inset-0 border-[16px] border-[#1a1a1a] rounded-full opacity-60"></div>
        <div className="absolute inset-0 border-[24px] border-[#111] rounded-full opacity-40"></div>
        <div className="absolute inset-0 border-[32px] border-[#181818] rounded-full opacity-30"></div>
        <div className="w-12 h-12 bg-[#6a9a90] rounded-full flex items-center justify-center z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
          <div className="w-3 h-3 bg-[#e0e0e0] rounded-full shadow-sm"></div>
        </div>
      </div>

      <h4 className="text-white font-bold text-lg truncate w-full mb-1 mt-8">{currentTrack.name}</h4>
      <p className="text-[#6a9a90] text-xs mb-6 font-medium">{currentTrack.artist}</p>

      <div className="w-full mb-6">
        <div className="w-full h-1 bg-white/10 rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#6a9a90] rounded-full shadow-[0_0_8px_#6a9a90] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-white/40 text-[10px] tabular-nums">{formatTime(progress)}</span>
          <span className="text-white/40 text-[10px] tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 w-full mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); previous(); }}
          className="text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="w-12 h-12 bg-[#6a9a90] rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(106,154,144,0.4)] hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 18V6l8.5 6zm7-12v12h2V6z"/></svg>
        </button>
      </div>
    </div>
  );
}

export function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<Article[]>([]);
  const [blogPosts, setBlogPosts] = useState<Article[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [profileData, setProfileData] = useState<AboutPageData | null>(null);
  const [showTitles, setShowTitles] = useState(false);
  const [showBlogCards, setShowBlogCards] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(true); // 初始显示背面（音乐页面）
  const [visibilityKey, setVisibilityKey] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Record<string, boolean>>({});
  const [cardAnimation, setCardAnimation] = useState(false);
  const [cardFlipAnimation, setCardFlipAnimation] = useState(false);
  const [siteStats, setSiteStats] = useState<{
    articleCount: number;
    categoryCount: number;
    tagCount: number;
    totalViewCount: number;
    commentCount: number;
    guestbookCount: number;
  } | null>(null);

  // 预加载下一张轮播图图片
  useEffect(() => {
    if (featuredPosts.length === 0) return;

    const nextIndex = (currentSlide % featuredPosts.length + 1) % featuredPosts.length;
    const nextPost = featuredPosts[nextIndex];
    if (!nextPost?.imageUrl) return;

    const img = new Image();
    img.onload = () => {
      setPreloadedImages(prev => ({ ...prev, [nextPost.imageUrl]: true }));
    };
    img.onerror = () => {
      // 预加载失败不影响主流程
    };
    getImageUrl(nextPost.imageUrl).then(url => {
      img.src = url;
    });
  }, [currentSlide, featuredPosts]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await aboutPageApi.getAboutPage();
        if (response && response.profile) {
          setProfileData({
            profile: typeof response.profile === 'string' ? JSON.parse(response.profile) : response.profile,
            stats: typeof response.stats === 'string' ? JSON.parse(response.stats) : response.stats,
            skills: typeof response.skills === 'string' ? JSON.parse(response.skills) : response.skills,
            contact: typeof response.contact === 'string' ? JSON.parse(response.contact) : response.contact,
            experience: typeof response.experience === 'string' ? JSON.parse(response.experience) : response.experience
          });
        }
      } catch (e) {
        console.error('Failed to load profile data:', e);
      }
    };

    loadProfileData();

    const handleProfileUpdate = () => {
      loadProfileData();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  // 加载网站统计数据
  useEffect(() => {
    const loadSiteStats = async () => {
      try {
        const stats = await siteStatsApi.getSiteStats();
        setSiteStats(stats);
      } catch (e) {
        console.error('Failed to load site stats:', e);
      }
    };

    loadSiteStats();
  }, []);

  useEffect(() => {
    const loadCarouselSettings = async () => {
      try {
        const slides = await carouselApi.getCarouselSlides();
        if (Array.isArray(slides) && slides.length > 0) {
          // 使用轮播图设置的图片和文本
          setFeaturedPosts(slides.map((slide: any, index: number) => ({
            id: index + 1,
            title: slide.title || `轮播图 ${index + 1}`,
            excerpt: '',
            content: '',
            imageUrl: slide.imageUrl,
            categoryId: 1,
            categoryName: slide.category || '轮播图',
            authorId: 1,
            authorName: '管理员',
            readTime: '1 分钟',
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            status: 1
          })));
          // 尝试从siteSettings获取showTitles设置
          try {
            const showTitlesSetting = await siteSettingsApi.getSiteSettings('showTitles');
            if (showTitlesSetting !== undefined && showTitlesSetting !== null) {
              setShowTitles(JSON.parse(showTitlesSetting));
            }
          } catch (e) {
            console.error('Failed to load site settings:', e);
          }
          return;
        }
      } catch (e) {
        console.error('Failed to load carousel settings:', e);
      }

      // 如果没有轮播图设置，使用默认的文章
      const fetchFeaturedPosts = async () => {
        try {
          const data = await articleApi.getArticles();
          setFeaturedPosts(data.slice(0, 4));
        } catch (err) {
          console.error('获取文章失败:', err);
          setFeaturedPosts([]);
        }
      };

      fetchFeaturedPosts();
    };

    loadCarouselSettings();

    // 监听轮播图设置更新
    window.addEventListener('carousel-updated', loadCarouselSettings);
    return () => window.removeEventListener('carousel-updated', loadCarouselSettings);
  }, []);

  // 加载博客文章
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const data = await articleApi.getArticles();
        setBlogPosts(data);
      } catch (err) {
        console.error('获取文章失败:', err);
        setBlogPosts([]);
      }
    };

    fetchBlogPosts();
  }, []);

  const totalRealSlides = featuredPosts.length;
  const isTransitioning = useRef(false);

  const handleTransitionEnd = () => {
    if (currentSlide >= totalRealSlides && !disableTransition) {
      setDisableTransition(true);
      setCurrentSlide(currentSlide % totalRealSlides);
      setTimeout(() => {
        setDisableTransition(false);
      }, 50);
    }
  };

  useEffect(() => {
    if (featuredPosts.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredPosts.length, isPaused, totalRealSlides]);

  // 监听页面可见性，当页面隐藏时暂停轮播
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(true);
        setVisibilityKey((prev) => prev + 1);
        setTimeout(() => setIsPaused(false), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isTransitioning.current || disableTransition) return;
      if (e.deltaY > 0) {
        setCurrentSlide((prev) => prev + 1);
      } else if (e.deltaY < 0) {
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalRealSlides - 1));
      }
    };

    carousel.addEventListener('wheel', handleWheel, { passive: false });
    return () => carousel.removeEventListener('wheel', handleWheel);
  }, [totalRealSlides]);

  // 卡片动画效果 - 页面加载时先显示背面，然后自动翻转并惯性晃动
  useEffect(() => {
    const timer = setTimeout(() => {
      // 第一步：触发翻转动画（从背面翻到正面）
      setCardFlipAnimation(true);
      setIsCardFlipped(false);
      
      // 第二步：翻转完成后触发惯性晃动效果
      setTimeout(() => {
        setCardAnimation(true);
        
        // 惯性晃动结束后重置状态
        setTimeout(() => {
          setCardAnimation(false);
          setCardFlipAnimation(false);
        }, 3000);
      }, 700); // 翻转动画完成后开始惯性晃动
      
    }, 200); // 页面加载后20毫秒开始动画序列（几乎立即开始）
    
    return () => clearTimeout(timer);
  }, []);

  const profile = profileData?.profile || {
    name: '张三',
    title: '全栈开发工程师',
    description: '热爱技术的开发者，专注于Web开发和用户体验设计。',
    avatar: '/images/image_1775552235687.png',
    socialLinks: {
      github: '#',
      linkedin: '#',
      twitter: '#'
    }
  };

  const stats = profileData?.stats || {
    experience: '5+',
    projects: '50+',
    contributions: '12'
  };

  return (
    <div className="relative z-10">
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 items-stretch">

            <div className="flex-1 flex flex-col gap-4">
              {/* 轮播图容器 - 移动端缩小 */}
              <div
                ref={carouselRef}
                className="relative overflow-hidden rounded-xl shadow-lg h-[180px] md:h-[320px] transition-none"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div
                  className={`flex h-full transition-transform duration-500 ease-in-out ${disableTransition ? 'transition-none' : ''}`}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  onTransitionEnd={handleTransitionEnd}
                >
                  {featuredPosts.length > 0 ? (
                    <>
                      {[...featuredPosts, ...featuredPosts].map((post, index) => (
                        <div
                          key={`${post.id}-${index}`}
                          className="min-w-full relative h-full flex-shrink-0"
                          onMouseEnter={() => setCurrentSlide(index)}
                        >
                          <AsyncCarouselImage
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover object-center"
                            loading="eager"
                            preloaded={preloadedImages[post.imageUrl]}
                          />
                          <div className="absolute inset-0 flex flex-col justify-end p-8">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            
                            <div className="relative z-10 flex flex-col items-center justify-center h-full pt-12">
                               {showTitles && <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white text-center drop-shadow-md italic tracking-wider font-tangyinghei">{post.title}</h2>}
                            </div>

                            <div className="absolute top-6 right-6 z-10">
                              <div className="relative">
                                <div className="absolute top-1.5 left-1.5 w-full h-full bg-[#3a4a5a]/60 rounded-sm"></div>
                                <div className="relative bg-white/95 text-[#4a5a6a] px-4 py-1.5 rounded-sm text-sm font-bold tracking-widest border border-white/20 font-tangyinghei">
                                  {post.categoryName || '一人有限集团'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="min-w-full relative h-full bg-gray-900"></div>
                  )}
                </div>

                {/* 轮播下标 */}
                {featuredPosts.length > 0 && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2.5 items-center z-20">
                    {featuredPosts.map((_, index) => {
                      const isActive = currentSlide % featuredPosts.length === index;
                      return (
                        <div
                          key={`indicator-${index}-${currentSlide}-${visibilityKey}`}
                          className={`relative rounded-[2px] bg-white/30 cursor-pointer overflow-hidden ${
                            isActive ? 'w-9 h-2 opacity-100' : 'w-2 h-2 opacity-60 hover:opacity-80'
                          }`}
                          onClick={() => {
                            if (!disableTransition) {
                               setCurrentSlide(index);
                            }
                          }}
                        >
                          <div
                            className={`absolute top-0 left-0 h-full w-full bg-white will-change-transform ${
                              isActive ? 'animate-surmon-progress' : 'w-0'
                            } ${isPaused ? 'animation-pause' : ''}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 留言板容器 - 固定高度 */}
              <div className="bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/10 h-[160px]">
                <GuestbookCarousel />
              </div>
            </div>

            {/* 个人资料卡片 - 3D 反转 */}
            <div 
              className={`hidden md:block w-72 h-[496px] flex-shrink-0 [perspective:1000px] cursor-pointer group ${cardAnimation ? 'animate-[cardSwing_3s_ease-in-out]' : ''}`}
              onClick={() => setIsCardFlipped(!isCardFlipped)}
            >
              <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isCardFlipped ? '[transform:rotateY(180deg)]' : ''} ${cardFlipAnimation ? 'animate-[cardFlip_0.7s_ease-out]' : ''}`}>
                
                {/* 正面：个人信息 */}
                <div className="absolute inset-0 [backface-visibility:hidden] bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 flex flex-col">
                  <div className="text-center flex-1">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#6a9a90] animate-[spin_10s_linear_infinite]">
                      <AsyncAvatarImage src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1 font-tangyinghei">{profile.name}</h3>
                    <p className="text-[#6a9a90] text-sm mb-4">{profile.title}</p>
                    <p className="text-white/60 text-xs mb-6 leading-relaxed">
                      {profile.description}
                    </p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">文章</span>
                      <span className="text-white font-medium">{siteStats?.articleCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">浏览</span>
                      <span className="text-white font-medium">{siteStats?.totalViewCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">留言</span>
                      <span className="text-white font-medium">{siteStats?.guestbookCount ?? 0}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 mt-auto">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowBlogCards(!showBlogCards); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          showBlogCards
                            ? 'bg-[#6a9a90] text-white shadow-[0_0_12px_rgba(106,154,144,0.4)]'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <svg className={`w-4 h-4 transition-transform duration-300 ${showBlogCards ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{showBlogCards ? '收起详情' : '展开详情'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 背面：音乐播放器 */}
                <MusicPlayerControls />

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            key={blogPosts.length > 0 ? 'loaded' : 'loading'}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 pl-2.5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 }
              }
            }}
          >
            {blogPosts.length > 0 ? (
              blogPosts.slice(0, 6).map((post) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="h-full"
                >
                  <BlogCard post={post} showOverlay={showBlogCards} />
                </motion.div>
              ))
            ) : (
              // 加载占位符
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="h-full"
                >
                  <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 aspect-[4/3]">
                    <div className="w-full h-40 bg-gray-800 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          <div className="mt-12 text-center">
            <Link
              to="/home/blog"
              className="inline-flex items-center justify-center px-10 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Load More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}