import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { articleApi } from '../services/api';
import { Article } from '../types';
import { BlogHeader } from './components/BlogHeader';
import { BlogList } from './components/BlogList';

export const AdminBlogManager: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const data = await articleApi.getArticlesAll();
      setArticles(data);
    } catch (error) {
      console.error('获取文章列表失败:', error);
      toast.error('获取文章列表失败');
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || article.status === (filterStatus === 'published' ? 1 : 0);
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    // 跳转到新的博客书写页面
    navigate('/admin/blog-writer');
  };

  const handleEdit = (article: Article) => {
    // 跳转到编辑页面，带上文章ID
    navigate(`/admin/blog-writer?id=${article.id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await articleApi.deleteArticle(id);
        toast.success('删除成功');
        await fetchArticles();
      } catch (error) {
        console.error('删除失败:', error);
        toast.error('删除失败，请重试');
      }
    }
  };

  const handleToggleStatus = async (article: Article) => {
    try {
      const updatedArticle: Article = {
        ...article,
        status: article.status === 1 ? 0 : 1,
        updateTime: new Date().toISOString()
      };
      await articleApi.updateArticle(article.id, updatedArticle);
      toast.success(`文章已${article.status === 1 ? '转为草稿' : '发布'}`);
      await fetchArticles();
    } catch (error) {
      console.error('状态更新失败:', error);
      toast.error('状态更新失败，请重试');
    }
  };

  return (
    <div className="space-y-6 w-full h-full flex flex-col">

      <Card className="flex-1 overflow-hidden flex flex-col">
        <BlogHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setFilterStatus={setFilterStatus}
          onCreateNew={handleCreateNew}
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
          <div className="p-6">
            <BlogList
              articles={filteredArticles}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};