import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  Save, Send, ChevronLeft, Loader2, Image as ImageIcon,
  X, FileText, Tag, FolderOpen, Grid, FileImage
} from 'lucide-react';
import { articleApi, tagApi, categoryApi, fileApi } from '../services/api';
import { CoverImageUploader } from '../components/CoverImageUploader';
import { Article, Tag as TagType, Category } from '../types';
import { LazyImage } from '../components/LazyImage';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const AdminBlogWriter: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;
  const [tags, setTags] = useState<TagType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [selectedTagObjects, setSelectedTagObjects] = useState<TagType[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<number>(1);
  const [newTag, setNewTag] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<TagType[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isInsertImageModalOpen, setIsInsertImageModalOpen] = useState(false);
  const [insertImageFile, setInsertImageFile] = useState<File | null>(null);
  const [insertImageFilePreview, setInsertImageFilePreview] = useState('');
  const [insertImageSource, setInsertImageSource] = useState<'file' | 'gallery'>('gallery');
  const [insertImageUploading, setInsertImageUploading] = useState(false);

  // 插入图片 - 图库相关状态
  const [insertGalleryItems, setInsertGalleryItems] = useState<Array<{
    id: number;
    cosKey: string;
    filename: string;
    cdnUrl: string;
  }>>([]);
  const [insertGalleryLoading, setInsertGalleryLoading] = useState(false);
  const [selectedInsertGalleryKey, setSelectedInsertGalleryKey] = useState<number | null>(null);
  const [insertGalleryPreviewUrl, setInsertGalleryPreviewUrl] = useState<string | null>(null);

  // 预览相关状态
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'live'>('edit');
  const [processedContent, setProcessedContent] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const lastPreviewMode = useRef(previewMode);
  const editorRef = useRef<HTMLDivElement | null>(null);

  // 处理 Markdown 内容中的图片，获取临时签名 URL
  const processMarkdownImages = async (markdown: string): Promise<string> => {
    // 匹配 Markdown 图片: ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const matches: Array<{ fullMatch: string; alt: string; url: string; index: number }> = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      matches.push({
        fullMatch: match[0],
        alt: match[1],
        url: match[2],
        index: match.index,
      });
    }

    if (matches.length === 0) {
      return markdown;
    }

    // 收集所有需要处理的图片 URL
    const urlToSignedUrl = new Map<string, string>();

    for (const m of matches) {
      const url = m.url;
      // 只处理相对路径的图片（需要 COS 签名）
      if (url.startsWith('/article/') || url.startsWith('article/')) {
        const key = url.replace(/^\//, '');
        try {
          const response = await fileApi.getCosReadUrl(key);
          urlToSignedUrl.set(url, response.url);
        } catch (error) {
          console.error(`获取图片签名失败: ${url}`, error);
          // 签名失败时保留原 URL
        }
      }
    }

    // 替换所有图片 URL
    let result = markdown;
    for (const [originalUrl, signedUrl] of urlToSignedUrl) {
      result = result.replace(`](${originalUrl})`, `](${signedUrl})`);
    }

    return result;
  };

  // 监听预览模式变化
  useEffect(() => {
    const handlePreviewModeChange = async () => {
      // 当切换到 preview 或 live 模式时，处理图片
      if (previewMode !== 'edit' && lastPreviewMode.current === 'edit') {
        setIsProcessingImages(true);
        try {
          const processed = await processMarkdownImages(content);
          setProcessedContent(processed);
        } catch (error) {
          console.error('处理图片失败:', error);
          setProcessedContent(content);
        } finally {
          setIsProcessingImages(false);
        }
      }
      lastPreviewMode.current = previewMode;
    };

    handlePreviewModeChange();
  }, [previewMode, content]);

  useEffect(() => {
    fetchTags();
    fetchCategories();
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    if (!articleId) return;
    try {
      const article = await articleApi.getArticleById(articleId);
      setEditingArticle(article);
      setTitle(article.title);
      setSummary(article.excerpt);
      setCategoryId(article.categoryId);
      setSelectedTagObjects(article.tags || []);
      setImageUrl(article.imageUrl || '');
      setStatus(article.status);
      // 重置编辑器状态以加载新内容
      setContent(article.content);
    } catch (error) {
      console.error('获取文章失败:', error);
      toast.error('获取文章失败');
    }
  };

  const fetchTags = async () => {
    try {
      const data = await tagApi.getTags();
      setTags(data);
    } catch (error) {
      console.error('获取标签列表失败:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  };

  const openInsertImageModal = () => {
    setInsertImageSource('gallery');
    setInsertImageFile(null);
    setInsertImageFilePreview('');
    // Reset gallery state
    setInsertGalleryItems([]);
    setSelectedInsertGalleryKey(null);
    setInsertGalleryPreviewUrl(null);
    setIsInsertImageModalOpen(true);
  };

  // 获取插入图片图库列表（查询 article 目录下的图片）
  const fetchInsertGalleryItems = async () => {
    setInsertGalleryLoading(true);
    try {
      // 获取 article 目录的 ID（需要先获取目录列表找到 article）
      const dirs = await fileApi.getRootDirectories();
      const articleDir = dirs.find(d => d.path === 'article/' || d.name === 'article');
      if (articleDir) {
        const result = await fileApi.getDirectoryImages(articleDir.id, 1, 100);
        setInsertGalleryItems(result.images);
      } else {
        setInsertGalleryItems([]);
      }
    } catch (error) {
      console.error('获取图库列表失败:', error);
      toast.error('获取图库列表失败');
    } finally {
      setInsertGalleryLoading(false);
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: '文件大小不能超过 20MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: '只支持 JPG、PNG 和 WebP 格式的图片' };
    }

    return { valid: true };
  };

  const handleInsertImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        setInsertImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setInsertImageFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(validation.error);
        setInsertImageFile(null);
        setInsertImageFilePreview('');
      }
    }
  };

  const handleInsertImage = async () => {
    setInsertImageUploading(true);
    try {
      // 获取光标位置
      const textarea = editorRef.current?.querySelector('textarea');
      const cursorPos = textarea?.selectionStart ?? content.length;

      if (insertImageSource === 'gallery' && selectedInsertGalleryKey) {
        // 图库选择模式：直接使用COS对象的key路径
        const selectedImage = insertGalleryItems.find(img => img.id === selectedInsertGalleryKey);
        if (selectedImage) {
          const relativePath = '/' + selectedImage.cosKey;
          const markdownImage = `![image](${relativePath})`;
          const newContent = content.slice(0, cursorPos) + '\n' + markdownImage + content.slice(cursorPos);
          setContent(newContent);
        }
      } else if (insertImageFile) {
        const result = await fileApi.uploadImage(insertImageFile, 'article');
        const relativePath = '/' + result.key;
        const markdownImage = `![image](${relativePath})`;
        const newContent = content.slice(0, cursorPos) + '\n' + markdownImage + content.slice(cursorPos);
        setContent(newContent);
      }

      setIsInsertImageModalOpen(false);
      toast.success('图片插入成功');
    } catch (error) {
      console.error('图片插入失败:', error);
      toast.error('图片插入失败，请重试');
    } finally {
      setInsertImageUploading(false);
    }
  };

  const addTag = async (tagName: string) => {
    const trimmedName = tagName.trim();
    if (!trimmedName) return;

    if (selectedTagObjects.some(tag => tag?.name === trimmedName)) {
      setNewTag('');
      setTagSuggestions([]);
      setShowTagSuggestions(false);
      return;
    }

    const existingTag = tags.find(tag => tag.name === trimmedName);
    if (existingTag) {
      setSelectedTagObjects([...selectedTagObjects, existingTag]);
    } else {
      let tempId = 0;
      try {
        tempId = Date.now();
        const tempTag: TagType = { id: -tempId, name: trimmedName, description: '', sort: 0, createTime: '', updateTime: '' };
        setSelectedTagObjects([...selectedTagObjects, tempTag]);
        const newTagObj = await tagApi.createTag({ id: 0, name: trimmedName, description: '', sort: 0, createTime: '', updateTime: '' });
        setTags([...tags, newTagObj]);
        setSelectedTagObjects(prev => prev.map(tag => tag.id === -tempId ? newTagObj : tag));
      } catch (error) {
        console.error('创建标签失败:', error);
        toast.error('创建标签失败');
        if (tempId) {
          setSelectedTagObjects(prev => prev.filter(tag => tag.id !== -tempId));
        }
        return;
      }
    }
    setNewTag('');
    setTagSuggestions([]);
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: TagType) => {
    setSelectedTagObjects(selectedTagObjects.filter(tag => tag.id !== tagToRemove.id));
  };

  const handleSaveDraft = async () => {
    console.log('handleSaveDraft 被调用', { title, categoryId, content: content.substring(0, 100) });
    if (!title.trim()) {
      toast.error('请输入文章标题');
      return;
    }

    if (!categoryId || Number(categoryId) === 0) {
      toast.error('请选择文章分类');
      return;
    }

    setLoading(true);
    console.log('handleSaveDraft: 开始构建文章数据');
    try {
      // 确保 imageUrl 格式正确：/images/xxx.png 或 /article/xxx.png
      let correctImageUrl = imageUrl;
      if (correctImageUrl && !correctImageUrl.startsWith('/')) {
        correctImageUrl = '/' + correctImageUrl;
      }

      // 构建创建文章的数据（不包含后端自动生成的字段）
      const createData = {
        title,
        excerpt: summary || content.substring(0, 100),
        content,
        authorId: 1,
        authorName: 'admin',
        categoryId: Number(categoryId),
        categoryName: categories.find(c => c.id === categoryId)?.name || '',
        imageUrl: correctImageUrl,
        readTime: '5 分钟',
        viewCount: 0,
        status: 0,
        tags: selectedTagObjects
      };
      console.log('handleSaveDraft: 文章数据构建完成', createData);

      if (editingArticle?.id) {
        // 更新时包含所有字段
        const articleData: Article = {
          ...createData,
          id: editingArticle.id,
          createTime: editingArticle.createTime,
          updateTime: new Date().toISOString(),
        };
        await articleApi.updateArticle(editingArticle.id, articleData);
        toast.success('草稿保存成功');
      } else {
        await articleApi.createArticle(createData as Article);
        toast.success('草稿创建成功');
      }

      // 保存成功后跳转到博客管理页面
      navigate('/admin/blog');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    console.log('handlePublish 被调用', { title, categoryId, content: content.substring(0, 100) });
    if (!title.trim()) {
      toast.error('请输入文章标题');
      return;
    }

    if (!categoryId || Number(categoryId) === 0) {
      toast.error('请选择文章分类');
      return;
    }

    setLoading(true);
    console.log('handlePublish: 开始构建文章数据');
    try {
      // 确保 imageUrl 格式正确：/images/xxx.png 或 /article/xxx.png
      let correctImageUrl = imageUrl;
      if (correctImageUrl && !correctImageUrl.startsWith('/')) {
        correctImageUrl = '/' + correctImageUrl;
      }
      console.log('handlePublish: 原始 imageUrl:', imageUrl, '修正后:', correctImageUrl);

      // 构建创建文章的数据（不包含后端自动生成的字段）
      const createData = {
        title,
        excerpt: summary || content.substring(0, 100),
        content,
        authorId: 1,
        authorName: 'admin',
        categoryId: Number(categoryId),
        categoryName: categories.find(c => c.id === categoryId)?.name || '',
        imageUrl: correctImageUrl,
        readTime: '5 分钟',
        viewCount: 0,
        status: 1,
        tags: selectedTagObjects
      };
      console.log('handlePublish: 文章数据构建完成', createData);
      console.log('handlePublish: selectedTagObjects:', JSON.stringify(selectedTagObjects));

      if (editingArticle?.id) {
        // 更新时包含所有字段
        const articleData: Article = {
          ...createData,
          id: editingArticle.id,
          createTime: editingArticle.createTime,
          updateTime: new Date().toISOString(),
        };
        await articleApi.updateArticle(editingArticle.id, articleData);
        toast.success('文章发布成功');
      } else {
        await articleApi.createArticle(createData as Article);
        toast.success('文章发布成功');
      }

      // 发布成功后跳转到博客管理页面
      navigate('/admin/blog');
    } catch (error) {
      console.error('发布失败:', error);
      toast.error('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="h-full flex">
        {/* 左侧：MDXEditor 编辑器 */}
        <div className="flex-1 flex flex-col p-4 pl-6">
          {/* 工具栏：返回 + 插入图片 + 保存草稿 + 发布 */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/blog')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              返回列表
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openInsertImageModal}
                className="flex items-center gap-1.5"
              >
                <ImageIcon className="h-4 w-4" />
                插入图片
              </Button>
              <div className="h-4 w-px bg-slate-300 mx-1" />
              <Button
                variant={previewMode === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('edit')}
                className="h-7 px-2 text-xs"
              >
                编辑
              </Button>
              <Button
                variant={previewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('preview')}
                className="h-7 px-2 text-xs"
              >
                预览
              </Button>
              <Button
                variant={previewMode === 'live' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('live')}
                className="h-7 px-2 text-xs"
              >
                双栏
              </Button>
              <div className="h-4 w-px bg-slate-300 mx-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('保存按钮点击, loading=', loading);
                  handleSaveDraft();
                }}
                disabled={loading}
                className="flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                保存草稿
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  console.log('发布按钮点击, loading=', loading);
                  handlePublish();
                }}
                disabled={loading}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                发布文章
              </Button>
            </div>
          </div>

          {/* 编辑器 */}
          <div className="flex-1 overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
            {isProcessingImages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">正在处理图片...</p>
                </div>
              </div>
            ) : previewMode === 'edit' ? (
              <div ref={editorRef} className="h-full">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  placeholder="开始用 Markdown 编写你的博客内容..."
                  preview="edit"
                  height="100%"
                  className="[&_.w-md-editor-toolbar]:!bg-slate-50 [&_.w-md-editor-toolbar]:!border-b [&_.w-md-editor-toolbar]:!border-slate-200 [&_.w-md-editor-toolbar]:!px-3 [&_.w-md-editor-toolbar]:!py-2 [&_.w-md-editor-body]:!bg-white [&_.w-md-editor-content]:!bg-white"
                />
              </div>
            ) : (
              <div className="flex h-full">
                {previewMode === 'live' && (
                  <div ref={editorRef} className="w-1/2 border-r border-slate-200">
                    <MDEditor
                      value={content}
                      onChange={(val) => setContent(val || '')}
                      placeholder="开始用 Markdown 编写你的博客内容..."
                      preview="edit"
                      height="100%"
                      className="[&_.w-md-editor-toolbar]:!bg-slate-50 [&_.w-md-editor-toolbar]:!border-b [&_.w-md-editor-toolbar]:!border-slate-200 [&_.w-md-editor-toolbar]:!px-3 [&_.w-md-editor-toolbar]:!py-2 [&_.w-md-editor-body]:!bg-white [&_.w-md-editor-content]:!bg-white"
                    />
                  </div>
                )}
                <div className={`${previewMode === 'live' ? 'w-1/2' : 'w-full'} overflow-auto bg-white`}>
                  <div className="p-4">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ src, alt, ...imgProps }) => (
                          <LazyImage
                            src={src}
                            alt={alt}
                            className="mb-4 rounded-lg max-w-full h-auto"
                            {...imgProps}
                          />
                        ),
                        p: ({ children }) => (
                          <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-semibold mt-5 mb-2">{children}</h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-gray-700 bg-blue-50">
                            {children}
                          </blockquote>
                        ),
                        code: ({ className, children }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          if (!match) {
                            return (
                              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600">
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className={`${className} block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto`}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="mb-4 bg-gray-900 rounded-lg overflow-x-auto">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {processedContent || content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：基本信息 */}
        <div className="w-80 border-l border-slate-200/60 bg-white/50 overflow-y-auto p-4 space-y-4" style={{ overscrollBehavior: 'contain' }}>
              {/* 基本信息 */}
              <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                <h2 className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-700">
                  <FileText className="w-4 h-4" />
                  基本信息
                </h2>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title" className="text-xs text-slate-500">标题 *</Label>
                    <Input
                      id="title"
                      placeholder="输入博客标题..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-xs text-slate-500">简述 *</Label>
                    <Textarea
                      id="description"
                      placeholder="简要描述..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="mt-1 text-sm resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* 封面图片 */}
              <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                <h2 className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-700">
                  <ImageIcon className="w-4 h-4" />
                  封面图片
                </h2>
                <CoverImageUploader value={imageUrl} onChange={setImageUrl} />
              </div>

              {/* 分类 */}
              <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                <h2 className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-700">
                  <FolderOpen className="w-4 h-4" />
                  分类
                </h2>
                <Select
                  value={categoryId?.toString() || ""}
                  onValueChange={(value) => setCategoryId(value ? Number(value) : '')}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 标签 */}
              <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                <h2 className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-700">
                  <Tag className="w-4 h-4" />
                  标签
                </h2>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTagObjects.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1 text-xs"
                      >
                        {tag.name}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-0.5 hover:bg-slate-300 rounded-full p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
                    {tags
                      .filter((tag) => !selectedTagObjects.some(selectedTag => selectedTag.id === tag.id))
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-slate-100 text-xs"
                          onClick={() => addTag(tag.name)}
                        >
                          + {tag.name}
                        </Badge>
                      ))}
                  </div>
                  <div className="relative flex gap-2">
                    <Input
                      placeholder="新建标签..."
                      value={newTag}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewTag(value);
                        if (value.trim()) {
                          const filtered = tags
                            .filter(tag => !selectedTagObjects.some(selectedTag => selectedTag.id === tag.id))
                            .filter(tag => tag.name.toLowerCase().includes(value.toLowerCase()))
                            .slice(0, 5);
                          setTagSuggestions(filtered);
                          setShowTagSuggestions(filtered.length > 0);
                        } else {
                          setTagSuggestions([]);
                          setShowTagSuggestions(false);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(newTag);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowTagSuggestions(false), 200);
                      }}
                      className="h-8 text-sm flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => addTag(newTag)}
                      variant="outline"
                      className="h-8 px-3"
                    >
                      添加
                    </Button>
                    {showTagSuggestions && tagSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-auto right-0 left-0">
                        {tagSuggestions.map((tag) => (
                          <div
                            key={tag.id}
                            className="px-3 py-2 cursor-pointer hover:bg-slate-100 text-sm"
                            onClick={() => {
                              addTag(tag.name);
                            }}
                          >
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 发布状态 */}
              <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                <h2 className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-700">
                  <FileText className="w-4 h-4" />
                  发布状态
                </h2>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {status === 1 ? '已发布' : '草稿'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus(status === 1 ? 0 : 1)}
                    className={`h-7 text-xs ${status === 1 ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
                  >
                    {status === 1 ? '转为草稿' : '立即发布'}
                  </Button>
                </div>
              </div>

              {/* 文章统计 */}
              <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                <h2 className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-700">
                  <FileText className="w-4 h-4" />
                  文章统计
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">字数</span>
                    <span className="font-medium text-slate-700">{content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">阅读时间</span>
                    <span className="font-medium text-slate-700">{Math.ceil(content.length / 500)} 分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">标签数</span>
                    <span className="font-medium text-slate-700">{selectedTagObjects.length}</span>
                  </div>
                </div>
              </div>
            </div>

        {/* 插入图片对话框 */}
        <Dialog open={isInsertImageModalOpen} onOpenChange={setIsInsertImageModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>插入图片</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant={insertImageSource === 'gallery' ? 'default' : 'outline'}
                  onClick={() => {
                    setInsertImageSource('gallery');
                    fetchInsertGalleryItems();
                  }}
                  className="flex-1 flex items-center gap-2"
                >
                  <Grid className="w-4 h-4" />
                  图库
                </Button>
                <Button
                  variant={insertImageSource === 'file' ? 'default' : 'outline'}
                  onClick={() => setInsertImageSource('file')}
                  className="flex-1 flex items-center gap-2"
                >
                  <FileImage className="w-4 h-4" />
                  本地上传
                </Button>
              </div>

              {insertImageSource === 'gallery' && (
                <div className="space-y-2">
                  <Label>选择图片（/article 目录）</Label>
                  <div className="border rounded-lg p-2 h-64 overflow-y-auto bg-slate-50" style={{ overscrollBehavior: 'contain' }}>
                    {insertGalleryLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      </div>
                    ) : insertGalleryItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <span className="text-sm">暂无图片</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {insertGalleryItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSelectedInsertGalleryKey(item.id);
                              setInsertGalleryPreviewUrl(item.cdnUrl);
                            }}
                            className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedInsertGalleryKey === item.id
                                ? 'border-blue-500'
                                : 'border-transparent hover:border-slate-300'
                            }`}
                          >
                            <LazyImage
                              src={item.cdnUrl}
                              alt={item.filename}
                              className="w-full h-16 object-cover"
                              rootMargin="50px"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {insertGalleryPreviewUrl && (
                    <div className="mt-2">
                      <img
                        src={insertGalleryPreviewUrl}
                        alt="选中预览"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {insertImageSource === 'file' && (
                <div className="space-y-2">
                  <Label htmlFor="insert-image-file">选择图片文件</Label>
                  <Input
                    id="insert-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleInsertImageFileChange}
                  />
                  {insertImageFilePreview && (
                    <div className="mt-2">
                      <img
                        src={insertImageFilePreview}
                        alt="预览"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsInsertImageModalOpen(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={handleInsertImage}
                  disabled={
                    insertImageUploading ||
                    (insertImageSource === 'file' && !insertImageFile) ||
                    (insertImageSource === 'gallery' && !selectedInsertGalleryKey)
                  }
                >
                  {insertImageUploading ? '上传中...' : '插入'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};