import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Upload, Edit3, Trash2, Image, Eye, EyeOff } from 'lucide-react';
import { articleApi, categoryApi, tagApi } from '../services/api';
import { Article, Category, Tag } from '../types';

export const AdminContent: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [markdownFile, setMarkdownFile] = useState<File | null>(null);
  const [status, setStatus] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');

  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  // 获取文章列表
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await articleApi.getArticles();
        setArticles(data);
      } catch (error) {
        console.error('获取文章列表失败:', error);
        toast.error('获取文章列表失败');
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

    const fetchTags = async () => {
      try {
        const data = await tagApi.getTags();
        setTags(data);
      } catch (error) {
        console.error('获取标签列表失败:', error);
      }
    };

    fetchArticles();
    fetchCategories();
    fetchTags();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMarkdownFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!title || !categoryId || !markdownFile) {
      toast.error('请填写标题、选择分类并选择Markdown文件');
      return;
    }

    try {
      // 上传markdown文件
      const fileUrl = await articleApi.uploadMarkdown(markdownFile);
      
      // 创建文章
      const newArticle: Article = {
        id: 0,
        title,
        excerpt,
        content: fileUrl,
        authorId: 1, // 假设当前用户ID为1
        categoryId: Number(categoryId),
        imageUrl: '',
        readTime: '5 分钟', // 默认值
        viewCount: 0,
        status,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        tags: selectedTags
      };

      await articleApi.createArticle(newArticle);
      toast.success('文章上传成功');
      setUploadDialogOpen(false);
      
      // 重置表单
      resetForm();
      
      // 重新获取文章列表
      const data = await articleApi.getArticles();
      setArticles(data);
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传失败，请重试');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await articleApi.deleteArticle(id);
        toast.success('文章删除成功');
        // 重新获取文章列表
        const data = await articleApi.getArticles();
        setArticles(data);
      } catch (error) {
        console.error('删除失败:', error);
        toast.error('删除失败，请重试');
      }
    }
  };

  const handleEdit = (article: Article) => {
    setCurrentArticle(article);
    setTitle(article.title);
    setExcerpt(article.excerpt);
    setCategoryId(article.categoryId);
    setSelectedTags(article.tags || []);
    setStatus(article.status);
    setImageUrl(article.imageUrl || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentArticle || !title || !categoryId) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const updatedArticle: Article = {
        ...currentArticle,
        title,
        excerpt,
        categoryId: Number(categoryId),
        status,
        imageUrl,
        tags: selectedTags,
        updateTime: new Date().toISOString()
      };

      await articleApi.updateArticle(currentArticle.id, updatedArticle);
      toast.success('文章更新成功');
      setEditDialogOpen(false);
      
      // 重新获取文章列表
      const data = await articleApi.getArticles();
      setArticles(data);
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  const handleImageUpdate = async () => {
    if (!currentArticle) return;

    try {
      const updatedArticle: Article = {
        ...currentArticle,
        imageUrl,
        updateTime: new Date().toISOString()
      };

      await articleApi.updateArticle(currentArticle.id, updatedArticle);
      toast.success('图片设置成功');
      setImageDialogOpen(false);
      
      // 重新获取文章列表
      const data = await articleApi.getArticles();
      setArticles(data);
    } catch (error) {
      console.error('设置图片失败:', error);
      toast.error('设置图片失败，请重试');
    }
  };

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setCategoryId('');
    setSelectedTags([]);
    setMarkdownFile(null);
    setStatus(1);
    setImageUrl('');
    setCurrentArticle(null);
  };

  return (
    <div className="space-y-6 w-full">
      
      <Card className="h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">文章列表</h3>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              上传Markdown
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto" style={{ maxHeight: '500px' }}>
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>浏览量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map(article => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-gray-500">{article.excerpt}</p>
                    </div>
                  </TableCell>
                  <TableCell>{categories.find(c => c.id === article.categoryId)?.name || '未知'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.map(tag => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{article.viewCount}</TableCell>
                  <TableCell>
                    <Badge variant={article.status === 1 ? 'default' : 'outline'}>
                      {article.status === 1 ? '发布' : '草稿'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(article)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setCurrentArticle(article);
                        setImageUrl(article.imageUrl || '');
                        setImageDialogOpen(true);
                      }}>
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={async () => {
                          try {
                            const updatedArticle: Article = {
                              ...article,
                              status: article.status === 1 ? 0 : 1,
                              updateTime: new Date().toISOString()
                            };
                            await articleApi.updateArticle(article.id, updatedArticle);
                            toast.success(`文章已${article.status === 1 ? '转为草稿' : '发布'}`);
                            // 重新获取文章列表
                            const data = await articleApi.getArticles();
                            setArticles(data);
                          } catch (error) {
                            console.error('状态更新失败:', error);
                            toast.error('状态更新失败，请重试');
                          }
                        }}
                      >
                        {article.status === 1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* 上传Markdown对话框 */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>上传Markdown文件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="请输入文章标题"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">摘要</Label>
              <Textarea 
                id="excerpt" 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)} 
                placeholder="请输入文章摘要"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Select value={categoryId ? categoryId.toString() : ''} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <Select
                multiple
                value={selectedTags.map(tag => tag.id.toString())}
                onValueChange={(value: string | string[]) => {
                  const values = Array.isArray(value) ? value : value ? [value] : [];
                  const selectedTagObjects = values.map(v => {
                    const tagId = Number(v);
                    return tags.find(t => t.id === tagId) as Tag;
                  });
                  setSelectedTags(selectedTagObjects);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择标签" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map(tag => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select value={status.toString()} onValueChange={(value) => setStatus(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">发布</SelectItem>
                  <SelectItem value="0">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="markdown-file">Markdown文件</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="markdown-file" 
                  type="file" 
                  accept=".md,.markdown" 
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {markdownFile && (
                  <Badge variant="secondary">
                    {markdownFile.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpload}>
              上传
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑文章对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑文章</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">标题</Label>
              <Input 
                id="edit-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="请输入文章标题"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">摘要</Label>
              <Textarea 
                id="edit-excerpt" 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)} 
                placeholder="请输入文章摘要"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">分类</Label>
              <Select value={categoryId ? categoryId.toString() : ''} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">标签</Label>
              <Select
                multiple
                value={selectedTags.map(tag => tag.id.toString())}
                onValueChange={(value: string | string[]) => {
                  const values = Array.isArray(value) ? value : value ? [value] : [];
                  const selectedTagObjects = values.map(v => {
                    const tagId = Number(v);
                    return tags.find(t => t.id === tagId) as Tag;
                  });
                  setSelectedTags(selectedTagObjects);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择标签" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map(tag => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">状态</Label>
              <Select value={status.toString()} onValueChange={(value) => setStatus(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">发布</SelectItem>
                  <SelectItem value="0">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdate}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 图片设置对话框 */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设置文章图片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">图片HTTP链接</Label>
              <Input 
                id="image-url" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="请输入图片的HTTP链接"
              />
            </div>
            {imageUrl && (
              <div className="mt-4">
                <img src={imageUrl} alt="预览" className="w-full h-48 object-cover rounded" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImageDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImageUpdate}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
