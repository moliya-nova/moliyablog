import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Link2, Plus, Edit, Trash2, Eye, EyeOff, RefreshCw, Check, X, ExternalLink, Loader2 } from 'lucide-react';
import { friendLinkApi } from '../services/api';
import { FriendLink, FriendLinkApply } from '../types';

export const AdminFriendLinks: React.FC = () => {
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
  const [applies, setApplies] = useState<FriendLinkApply[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // 友链表单状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<FriendLink | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    avatar: '',
    description: '',
    category: '默认',
    sort: 0,
    status: 1,
    cardStyle: 'default',
  });

  // 申请审核状态
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [currentApply, setCurrentApply] = useState<FriendLinkApply | null>(null);
  const [applyAction, setApplyAction] = useState<'approve' | 'reject'>('approve');
  const [applyReply, setApplyReply] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [linksData, appliesData] = await Promise.all([
        friendLinkApi.getFriendLinksAll(),
        friendLinkApi.getApplies(),
      ]);
      setFriendLinks(linksData);
      setApplies(appliesData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 友链管理
  const handleAdd = () => {
    setCurrentLink(null);
    setFormData({
      name: '',
      url: '',
      avatar: '',
      description: '',
      category: '默认',
      sort: 0,
      status: 1,
      cardStyle: 'default',
    });
    setDialogOpen(true);
  };

  const handleEdit = (link: FriendLink) => {
    setCurrentLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      avatar: link.avatar || '',
      description: link.description || '',
      category: link.category || '默认',
      sort: link.sort || 0,
      status: link.status,
      cardStyle: link.cardStyle || 'default',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      toast.error('请填写网站名称和链接');
      return;
    }

    try {
      const linkData = {
        ...formData,
        id: currentLink?.id || 0,
        isAlive: currentLink?.isAlive || 1,
        lastCheckTime: currentLink?.lastCheckTime || '',
        createTime: currentLink?.createTime || '',
        updateTime: currentLink?.updateTime || '',
      };

      if (currentLink) {
        await friendLinkApi.updateFriendLink(currentLink.id, linkData);
        toast.success('更新成功');
      } else {
        await friendLinkApi.createFriendLink(linkData);
        toast.success('添加成功');
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    }
  };

  const handleDelete = (link: FriendLink) => {
    setCurrentLink(link);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentLink) return;

    try {
      await friendLinkApi.deleteFriendLink(currentLink.id);
      toast.success('删除成功');
      setDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  const handleToggleStatus = async (link: FriendLink) => {
    try {
      await friendLinkApi.updateFriendLink(link.id, {
        ...link,
        status: link.status === 1 ? 0 : 1,
      });
      toast.success(link.status === 1 ? '已隐藏' : '已显示');
      loadData();
    } catch (error) {
      console.error('状态更新失败:', error);
      toast.error('状态更新失败');
    }
  };

  const handleCheckAll = async () => {
    try {
      setChecking(true);
      await friendLinkApi.checkAllFriendLinks();
      toast.success('检测完成');
      loadData();
    } catch (error) {
      console.error('检测失败:', error);
      toast.error('检测失败');
    } finally {
      setChecking(false);
    }
  };

  // 申请管理
  const handleApplyAction = (apply: FriendLinkApply, action: 'approve' | 'reject') => {
    setCurrentApply(apply);
    setApplyAction(action);
    setApplyReply('');
    setApplyDialogOpen(true);
  };

  const handleSubmitApplyAction = async () => {
    if (!currentApply) return;

    try {
      if (applyAction === 'approve') {
        await friendLinkApi.approveApply(currentApply.id, applyReply);
        toast.success('已通过');
      } else {
        await friendLinkApi.rejectApply(currentApply.id, applyReply);
        toast.success('已拒绝');
      }
      setApplyDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('操作失败');
    }
  };

  const handleDeleteApply = async (id: number) => {
    try {
      await friendLinkApi.deleteApply(id);
      toast.success('删除成功');
      loadData();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline">待审核</Badge>;
      case 1:
        return <Badge variant="default">已通过</Badge>;
      case 2:
        return <Badge variant="destructive">已拒绝</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="links" className="w-full">
        <TabsList>
          <TabsTrigger value="links">友链管理</TabsTrigger>
          <TabsTrigger value="applies">
            申请管理
            {applies.filter(a => a.status === 0).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {applies.filter(a => a.status === 0).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="links">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  友链列表
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckAll}
                    disabled={checking}
                  >
                    {checking ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    检测状态
                  </Button>
                  <Button size="sm" onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加友链
                  </Button>
                </div>
              </div>

              <div className="overflow-auto" style={{ maxHeight: '500px' }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>链接</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>站点</TableHead>
                      <TableHead>排序</TableHead>
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
                    ) : friendLinks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          暂无友链
                        </TableCell>
                      </TableRow>
                    ) : (
                      friendLinks.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {link.avatar ? (
                                <img
                                  src={link.avatar}
                                  alt={link.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Link2 className="h-4 w-4 text-gray-500" />
                                </div>
                              )}
                              <span className="font-medium">{link.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline flex items-center gap-1"
                            >
                              {link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{link.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={link.status === 1 ? 'default' : 'outline'}>
                              {link.status === 1 ? '显示' : '隐藏'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  link.isAlive === 1 ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              />
                              <span className="text-sm text-gray-500">
                                {link.isAlive === 1 ? '正常' : '不可达'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{link.sort}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(link)}
                                title="编辑"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(link)}
                                title={link.status === 1 ? '隐藏' : '显示'}
                              >
                                {link.status === 1 ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDelete(link)}
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
        </TabsContent>

        <TabsContent value="applies">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">友链申请</h3>
                <Badge variant="outline">
                  {applies.length} 条申请
                </Badge>
              </div>

              <div className="overflow-auto" style={{ maxHeight: '500px' }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>网站名称</TableHead>
                      <TableHead>链接</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>申请理由</TableHead>
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
                    ) : applies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          暂无申请
                        </TableCell>
                      </TableRow>
                    ) : (
                      applies.map((apply) => (
                        <TableRow key={apply.id}>
                          <TableCell className="font-medium">{apply.name}</TableCell>
                          <TableCell>
                            <a
                              href={apply.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline flex items-center gap-1"
                            >
                              {apply.url.length > 30 ? apply.url.substring(0, 30) + '...' : apply.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {apply.email || '-'}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate text-sm" title={apply.reason}>
                              {apply.reason || '-'}
                            </p>
                          </TableCell>
                          <TableCell>{getStatusBadge(apply.status)}</TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {new Date(apply.createTime).toLocaleDateString('zh-CN')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {apply.status === 0 && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-500"
                                    onClick={() => handleApplyAction(apply, 'approve')}
                                    title="通过"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() => handleApplyAction(apply, 'reject')}
                                    title="拒绝"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDeleteApply(apply.id)}
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
        </TabsContent>
      </Tabs>

      {/* 友链编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentLink ? '编辑友链' : '添加友链'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">网站名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入网站名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">网站链接 *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">头像/Logo链接</Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://example.com/avatar.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">网站简介</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简单介绍一下网站"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="默认"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort">排序</Label>
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort}
                  onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">显示</SelectItem>
                    <SelectItem value="0">隐藏</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardStyle">卡片样式</Label>
                <Select
                  value={formData.cardStyle}
                  onValueChange={(value) => setFormData({ ...formData, cardStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">默认</SelectItem>
                    <SelectItem value="gradient">渐变</SelectItem>
                    <SelectItem value="minimal">简约</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {currentLink ? '更新' : '添加'}
            </Button>
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
              确定要删除这个友链吗？此操作不可撤销。
            </p>
            {currentLink && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">名称：</span>
                  {currentLink.name}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">链接：</span>
                  {currentLink.url}
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

      {/* 申请审核对话框 */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {applyAction === 'approve' ? '通过申请' : '拒绝申请'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentApply && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">网站：</span>
                  {currentApply.name}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">链接：</span>
                  {currentApply.url}
                </p>
                {currentApply.reason && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">理由：</span>
                    {currentApply.reason}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reply">回复（可选）</Label>
              <Textarea
                id="reply"
                value={applyReply}
                onChange={(e) => setApplyReply(e.target.value)}
                placeholder={applyAction === 'approve' ? '感谢申请，已通过审核' : '抱歉，暂不接受该申请'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApplyDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant={applyAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitApplyAction}
            >
              {applyAction === 'approve' ? '通过' : '拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
