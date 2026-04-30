import React from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Plus } from 'lucide-react';

interface BlogHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  onCreateNew: () => void;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  setFilterStatus,
  onCreateNew
}) => {
  return (
    <div className="p-6 space-y-4 border-b">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索文章标题或摘要..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            新建文章
          </Button>
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => setFilterStatus('all')}
          >
            全部
          </Button>
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => setFilterStatus('published')}
          >
            已发布
          </Button>
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => setFilterStatus('draft')}
          >
            草稿
          </Button>
        </div>
      </div>
    </div>
  );
};