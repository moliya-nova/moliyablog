import React from 'react';
import { FileText } from 'lucide-react';
import { Article } from '../../types';
import { BlogArticleItem } from './BlogArticleItem';

interface BlogListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onToggleStatus: (article: Article) => void;
  onDelete: (id: number) => void;
}

export const BlogList: React.FC<BlogListProps> = ({
  articles,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">暂无文章</h3>
        <p className="mt-2 text-sm text-gray-500">点击"新建文章"开始撰写博客</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map(article => (
        <BlogArticleItem
          key={article.id}
          article={article}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};