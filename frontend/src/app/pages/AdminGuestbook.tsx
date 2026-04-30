import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Reply, Trash2, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { guestbookApi } from '../services/api';
import { Guestbook } from '../types';

export const AdminGuestbook: React.FC = () => {
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentGuestbook, setCurrentGuestbook] = useState<Guestbook | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    loadGuestbooks();
  }, []);

  const loadGuestbooks = async () => {
    try {
      setLoading(true);
      const data = await guestbookApi.getGuestbookAll();
      setGuestbooks(data);
    } catch (error) {
      console.error('获取留言失败:', error);
      toast.error('获取留言失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (guestbook: Guestbook) => {
    setCurrentGuestbook(guestbook);
    setReplyContent(guestbook.reply || '');
    setReplyDialogOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!currentGuestbook) return;

    try {
      await guestbookApi.replyGuestbook(currentGuestbook.id, replyContent);
      toast.success('回复成功');
      setReplyDialogOpen(false);
      loadGuestbooks();
    } catch (error) {
      console.error('回复失败:', error);
      toast.error('回复失败，请重试');
    }
  };

  const handleDelete = (guestbook: Guestbook) => {
    setCurrentGuestbook(guestbook);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentGuestbook) return;

    try {
      await guestbookApi.deleteGuestbook(currentGuestbook.id);
      toast.success('删除成功');
      setDeleteDialogOpen(false);
      loadGuestbooks();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  const handleToggleStatus = async (guestbook: Guestbook) => {
    try {
      const updatedGuestbook = {
        ...guestbook,
        status: guestbook.status === 1 ? 0 : 1,
      };
      await guestbookApi.updateGuestbook(guestbook.id, updatedGuestbook);
      toast.success(guestbook.status === 1 ? '已隐藏' : '已显示');
      loadGuestbooks();
    } catch (error) {
      console.error('状态更新失败:', error);
      toast.error('状态更新失败，请重试');
    }
  };

  return (
    <div className="space-y-6 w-full">

      <Card className="h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">留言列表</h3>
            <Badge variant="outline">
              <MessageCircle className="mr-1 h-4 w-4" />
              {guestbooks.length} 条留言
            </Badge>
          </div>

          <div className="flex-1 overflow-auto" style={{ maxHeight: '500px' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>昵称</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>留言内容</TableHead>
                  <TableHead>回复内容</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : guestbooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      暂无留言
                    </TableCell>
                  </TableRow>
                ) : (
                  guestbooks.map((guestbook) => (
                    <TableRow key={guestbook.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#6a9a90]/20 flex items-center justify-center">
                            <span className="text-[#6a9a90] text-xs font-medium">
                              {guestbook.authorName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{guestbook.authorName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {guestbook.authorEmail || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm" title={guestbook.content}>
                          {guestbook.content}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {guestbook.reply ? (
                          <p className="truncate text-sm text-[#6a9a90]" title={guestbook.reply}>
                            {guestbook.reply}
                          </p>
                        ) : (
                          <span className="text-gray-400 text-sm italic">待回复</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={guestbook.status === 1 ? 'default' : 'outline'}>
                          {guestbook.status === 1 ? '显示' : '隐藏'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {new Date(guestbook.createTime).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(guestbook)}
                            title="回复"
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(guestbook)}
                            title={guestbook.status === 1 ? '隐藏' : '显示'}
                          >
                            {guestbook.status === 1 ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDelete(guestbook)}
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* 回复对话框 */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>回复留言</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>留言者</Label>
              <Input
                value={currentGuestbook?.authorName || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label>留言内容</Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {currentGuestbook?.content}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">回复内容</Label>
              <Textarea
                id="reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="请输入回复内容..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitReply}>提交回复</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              确定要删除这条留言吗？此操作不可撤销。
            </p>
            {currentGuestbook && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">留言者：</span>
                  {currentGuestbook.authorName}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">内容：</span>
                  {currentGuestbook.content.substring(0, 50)}
                  {currentGuestbook.content.length > 50 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};