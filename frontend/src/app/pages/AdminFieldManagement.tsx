import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { categoryApi, tagApi } from '../services/api';
import { Category, TagType } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function AdminFieldManagement() {
  // ========== 分类状态 ==========
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);

  // ========== 表单状态 ==========
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [editingItem, setEditingItem] = useState<Category | TagType | null>(null);
  const [deletingItem, setDeletingItem] = useState<Category | TagType | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSort, setFormSort] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ========== 数据加载 ==========
  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('加载分类失败');
    }
  };

  const fetchTags = async () => {
    try {
      const data = await tagApi.getTags();
      setTags(data);
    } catch (error) {
      toast.error('加载标签失败');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // ========== 表单操作 ==========
  const openCreateDialog = () => {
    setEditingItem(null);
    setFormName('');
    setFormDescription('');
    setFormSort(0);
    setDialogOpen(true);
  };

  const openEditDialog = (item: Category | TagType) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setFormSort(item.sort || 0);
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: Category | TagType) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('名称不能为空');
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === 'categories') {
        if (editingItem) {
          await categoryApi.updateCategory(editingItem.id, {
            name: formName.trim(),
            description: formDescription.trim(),
            sort: formSort,
          });
          toast.success('分类已更新');
        } else {
          await categoryApi.createCategory({
            name: formName.trim(),
            description: formDescription.trim(),
            sort: formSort,
          });
          toast.success('分类已创建');
        }
        fetchCategories();
      } else {
        if (editingItem) {
          await tagApi.updateTag(editingItem.id, {
            name: formName.trim(),
            description: formDescription.trim(),
            sort: formSort,
          });
          toast.success('标签已更新');
        } else {
          await tagApi.createTag({
            name: formName.trim(),
            description: formDescription.trim(),
            sort: formSort,
          });
          toast.success('标签已创建');
        }
        fetchTags();
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      if (activeTab === 'categories') {
        await categoryApi.deleteCategory(deletingItem.id);
        toast.success('分类已删除');
        fetchCategories();
      } else {
        await tagApi.deleteTag(deletingItem.id);
        toast.success('标签已删除');
        fetchTags();
      }
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  // ========== 渲染表格 ==========
  const renderTable = (items: (Category | TagType)[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>名称</TableHead>
          <TableHead>描述</TableHead>
          <TableHead className="w-20">排序</TableHead>
          <TableHead className="w-32 text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              暂无数据
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-muted-foreground">{item.id}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.description || '-'}</TableCell>
              <TableCell>{item.sort}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(item)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => openDeleteDialog(item)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">字段管理</h1>
        <p className="text-muted-foreground mt-1">管理博客系统中的分类和标签</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'categories' | 'tags')}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="categories">分类管理 ({categories.length})</TabsTrigger>
            <TabsTrigger value="tags">标签管理 ({tags.length})</TabsTrigger>
          </TabsList>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            新增{activeTab === 'categories' ? '分类' : '标签'}
          </Button>
        </div>

        <TabsContent value="categories" className="mt-4">
          <div className="border rounded-lg bg-white">
            {renderTable(categories)}
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <div className="border rounded-lg bg-white">
            {renderTable(tags)}
          </div>
        </TabsContent>
      </Tabs>

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? '编辑' : '新增'}{activeTab === 'categories' ? '分类' : '标签'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? '修改' : '创建新的'}{activeTab === 'categories' ? '分类' : '标签'}信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="field-name">名称 *</Label>
              <Input
                id="field-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={`请输入${activeTab === 'categories' ? '分类' : '标签'}名称`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-description">描述</Label>
              <Input
                id="field-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="可选描述"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-sort">排序</Label>
              <Input
                id="field-sort"
                type="number"
                value={formSort}
                onChange={(e) => setFormSort(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除{activeTab === 'categories' ? '分类' : '标签'}
              <span className="font-semibold">"{deletingItem?.name}"</span> 吗？
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
