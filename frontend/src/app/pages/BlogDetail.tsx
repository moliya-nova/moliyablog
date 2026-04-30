import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from "lucide-react";
import { MarkdownContent } from "../components/MarkdownContent";
import { useEffect, useState, useMemo } from "react";
import { articleApi, commentApi, tagApi } from "../services/api";
import { Article, Tag as TagType, Comment } from "../types";
import { LazyImage } from "../components/LazyImage";
import { motion } from "motion/react";
import { extractTocItems } from "../utils/headingId";
import { TableOfContents } from "../components/TableOfContents";

export function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Article | null>(null);
  const [tags, setTags] = useState<TagType[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
        console.error('获取文章详情失败:', err);
        setError('获取文章详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetail();
  }, [id]);

  const toc = useMemo(() => {
    if (!post) return [];
    return extractTocItems(post.content);
  }, [post]);

  if (loading) {
    return (
      <div className="relative z-10 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 mb-8 bg-gray-200 rounded"></div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 lg:mr-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-40 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>

                <div className="aspect-[16/9] bg-gray-200 rounded-lg"></div>

                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                    <div className="h-6 w-28 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-16">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-3">
                        <div className="aspect-video bg-gray-200 rounded-lg"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-64 shrink-0 hidden lg:block">
              <div className="fixed right-80 top-1/2 transform -translate-y-1/2 w-64 h-[600px] bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-md">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">文章未找到</h1>
        <p className="text-gray-600 mb-8">抱歉，您要查找的文章不存在。</p>
        <Link
          to="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回博客列表
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("链接已复制到剪贴板");
    }
  };

  return (
    <div className="relative z-10 py-12">
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full
                     bg-white/80 backdrop-blur-sm border border-gray-200
                     text-gray-700 hover:text-gray-900 hover:bg-white hover:border-gray-300
                     shadow-sm hover:shadow-md transition-all duration-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">返回</span>
        </motion.button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 lg:mr-8 lg:max-w-4xl">
            <article>
              <motion.header
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>{post.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.createTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600">作者: {post.authorName}</p>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>分享</span>
                  </button>
                </div>
              </motion.header>

              <motion.div
                className="mb-8 rounded-lg overflow-hidden aspect-[16/9]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <LazyImage
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  rootMargin="100px"
                />
              </motion.div>

              <motion.div
                className="prose prose-lg max-w-none mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <MarkdownContent content={post.content} />
              </motion.div>

              <motion.div
                className="border-t border-gray-200 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-600">标签:</span>
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {post.categoryName}
                    </span>
                  )}
                </div>
              </motion.div>

              {comments.length > 0 && (
                <motion.section
                  className="mt-16 border-t border-gray-200 pt-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-2xl font-bold mb-8">评论 ({comments.length})</h2>
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 pb-6">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-semibold">{comment.author}</h4>
                          <span className="text-sm text-gray-600">{comment.createTime}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </article>

            {relatedPosts.length > 0 && (
              <motion.section
                className="mt-16 border-t border-gray-200 pt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-2xl font-bold mb-8">相关文章</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.id}`}
                      className="group"
                    >
                      <div className="aspect-video overflow-hidden rounded-lg mb-3">
                        <LazyImage
                          src={relatedPost.imageUrl}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          rootMargin="200px"
                        />
                      </div>
                      <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {relatedPost.readTime}
                      </p>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          <TableOfContents items={toc} />
        </div>
      </motion.div>
    </div>
  );
}