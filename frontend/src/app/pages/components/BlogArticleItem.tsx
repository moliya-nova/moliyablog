import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Edit3, Eye, EyeOff, Trash2, Calendar, User, Tag, FileText } from 'lucide-react';
import { Article } from '../../types';
import { getImageUrl } from '../../utils/imagePath';

interface BlogArticleItemProps {
  article: Article;
  onEdit: (article: Article) => void;
  onToggleStatus: (article: Article) => void;
  onDelete: (id: number) => void;
}

export const BlogArticleItem: React.FC<BlogArticleItemProps> = ({
  article,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  const [coverUrl, setCoverUrl] = useState<string>('');

  useEffect(() => {
    getImageUrl(article.imageUrl).then(url => setCoverUrl(url));
  }, [article.imageUrl]);

  return (
    <div
      className="group p-4 rounded-lg border bg-white hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={article.title}
            className="w-48 h-28 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {article.title}
            </h3>
            <Badge 
              variant={article.status === 1 ? 'default' : 'outline'}
              className={article.status === 1 ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {article.status === 1 ? '已发布' : '草稿'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {article.excerpt || '无摘要'}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(article.createTime).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {article.tags?.length || 0} 个标签
            </span>
            {article.categoryName && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {article.categoryName}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(article)}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onToggleStatus(article)}
            className="h-8 w-8 p-0"
          >
            {article.status === 1 ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-green-500" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(article.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};