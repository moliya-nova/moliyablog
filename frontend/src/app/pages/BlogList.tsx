import { useState, useEffect, useMemo } from "react";
import { BlogCard } from "../components/BlogCard";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Calendar, Clock, ArrowDownAZ, ArrowUpAZ, FilterX } from "lucide-react";
import { articleApi, categoryApi } from "../services/api";
import { Article, Category } from "../types";
import { motion, AnimatePresence } from "motion/react";

const PAGE_SIZE = 9;

export function BlogList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [sortOrder, setSortOrder] = useState("newest");
  const [dateRange, setDateRange] = useState("all");

  const [posts, setPosts] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('获取分类失败:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await articleApi.getArticlesPage(currentPage, PAGE_SIZE);
        setPosts(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        console.error('获取文章失败:', err);
        setError('获取文章失败');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const categoryOptions = ["全部", ...categories.map(cat => cat.name)];

  const filteredPosts = useMemo(() => {
    let result = posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "全部" || post.categoryName === selectedCategory;

      let matchesDate = true;
      if (dateRange !== "all" && post.createTime) {
        const postDate = new Date(post.createTime);
        const now = new Date();
        if (dateRange === "month") {
          matchesDate = (now.getTime() - postDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        } else if (dateRange === "year") {
          matchesDate = (now.getTime() - postDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
        }
      }

      return matchesSearch && matchesCategory && matchesDate;
    });

    if (sortOrder === "newest") {
      result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
    }

    return result;
  }, [posts, searchQuery, selectedCategory, sortOrder, dateRange]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("全部");
    setSortOrder("newest");
    setDateRange("all");
    setCurrentPage(1);
  };

  const Skeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 pl-2.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm animate-pulse">
          <div className="h-36 sm:h-44 bg-gray-200/60 rounded-lg mb-4"></div>
          <div className="h-5 bg-gray-200/60 rounded-md mb-3 w-3/4"></div>
          <div className="h-3.5 bg-gray-200/60 rounded-md mb-2.5 w-full"></div>
          <div className="h-3.5 bg-gray-200/60 rounded-md mb-4 w-2/3"></div>
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
            <div className="h-3 bg-gray-200/60 rounded-md w-1/4"></div>
            <div className="h-3 bg-gray-200/60 rounded-md w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative z-10 py-13 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 tracking-tight"
          >
            探索<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-buding">博客文章</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-gray-500"
          >
            发现 {totalElements > 0 ? totalElements : '...'} 篇精彩文章
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8 rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
        >
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border-transparent rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 text-sm ${
                showFilters
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent'
              } border`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">筛选</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="col-span-1 md:col-span-3">
                    <h3 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                      <FilterX className="h-3.5 w-3.5 text-blue-500" /> 文章分类
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryOptions.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                            selectedCategory === category
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-purple-500" /> 排序
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSortOrder('newest')}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          sortOrder === 'newest' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                        }`}
                      >
                        <ArrowDownAZ className="h-3.5 w-3.5" /> 最新
                      </button>
                      <button
                        onClick={() => setSortOrder('oldest')}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          sortOrder === 'oldest' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                        }`}
                      >
                        <ArrowUpAZ className="h-3.5 w-3.5" /> 最早
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" /> 时间
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: '全部' },
                        { id: 'month', label: '一月内' },
                        { id: 'year', label: '一年内' }
                      ].map((range) => (
                        <button
                          key={range.id}
                          onClick={() => setDateRange(range.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            dateRange === range.id
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-0 px-1">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {searchQuery || selectedCategory !== "全部" || dateRange !== "all" ? "筛选结果" : "全部文章"}
              </h2>
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                  showOverlay
                    ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.35)]'
                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 shadow-sm'
                }`}
              >
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showOverlay ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span>{showOverlay ? '收起详情' : '展开详情'}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
              <span className="text-blue-600 font-bold">{filteredPosts.length}</span> 篇
            </p>
          </div>
        </motion.div>

        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FilterX className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <p className="text-red-500 font-medium mb-4 sm:mb-5">{error}</p>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 text-sm"
            >
              重新加载
            </button>
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 pl-2.5"
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
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="h-full"
                >
                  <BlogCard post={post} showOverlay={showOverlay} />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 sm:gap-3 mt-4"
              >
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 font-medium shadow-sm text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">上一页</span>
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-50 text-gray-600 font-medium border border-transparent text-sm">
                  <span className="text-gray-900 font-bold">{currentPage}</span> / {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 font-medium shadow-sm text-sm"
                >
                  <span className="hidden sm:inline">下一页</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <Search className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">没有找到匹配的文章</h3>
            <p className="text-gray-500 mb-5 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
              尝试使用不同的关键词搜索，或者清除筛选条件。
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 sm:px-7 sm:py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 text-sm"
            >
              清除筛选条件
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}