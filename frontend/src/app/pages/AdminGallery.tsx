import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { ImageIcon, Folder, FolderOpen, Upload, Trash2, Edit, Move, Search, Plus, ChevronRight, ChevronDown, Grid, List, RefreshCw, Loader2 } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';
import { fileApi } from '../services/api';

interface Folder {
  type: 'folder';
  key: string;
  name: string;
}

interface File {
  type: 'file';
  key: string;
  name: string;
  size: number;
  lastModified: string;
  cosUrl: string;
}

type GalleryItem = Folder | File;

interface FolderTreeItem extends Folder {
  expanded: boolean;
  children: FolderTreeItem[];
}

export const AdminGallery: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folderTree, setFolderTree] = useState<FolderTreeItem[]>([]);
  const [treeLoading, setTreeLoading] = useState<boolean>(true);
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
  const [showRenameDialog, setShowRenameDialog] = useState<boolean>(false);
  const [showMoveDialog, setShowMoveDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState<boolean>(false);
  const [renameKey, setRenameKey] = useState<string>('');
  const [renameName, setRenameName] = useState<string>('');
  const [moveKey, setMoveKey] = useState<string>('');
  const [moveDestination, setMoveDestination] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  // 获取当前路径下的文件和文件夹
  const fetchItems = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const data = await fileApi.getGalleryItems(path);
      setItems(data);
    } catch (error) {
      toast.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 构建文件夹树（使用新的 tree API）
  const buildFolderTree = useCallback(async (): Promise<FolderTreeItem[]> => {
    try {
      const dirs = await fileApi.getGalleryTree();
      const treeItems: FolderTreeItem[] = [];

      for (const dir of dirs) {
        // 只处理顶级目录（parentId 为 null）
        if (dir.parentId === null) {
          const children = dirs.filter(d => d.parentId === dir.id).map(child => ({
            type: 'folder' as const,
            key: child.path,
            name: child.name,
            expanded: false,
            children: [] as FolderTreeItem[]
          }));

          treeItems.push({
            type: 'folder',
            key: dir.path,
            name: dir.name,
            expanded: false,
            children
          });
        }
      }

      return treeItems;
    } catch (error) {
      return [];
    }
  }, []);

  // 初始化文件夹树
  const initFolderTree = useCallback(async () => {
    setTreeLoading(true);
    const tree = await buildFolderTree();
    setFolderTree(tree);
    setTreeLoading(false);
  }, [buildFolderTree]);

  // 切换文件夹展开状态
  const toggleFolder = (key: string) => {
    setFolderTree(prevTree => {
      const toggle = (items: FolderTreeItem[]): FolderTreeItem[] => {
        return items.map(item => {
          if (item.key === key) {
            return { ...item, expanded: !item.expanded };
          }
          return { ...item, children: toggle(item.children) };
        });
      };
      return toggle(prevTree);
    });
  };

  // 导航到文件夹
  const navigateToFolder = (folderKey: string) => {
    setCurrentPath(folderKey);
    setSelectedItems([]);
  };

  // 返回上一级
  const navigateUp = () => {
    if (currentPath) {
      const parentPath = currentPath.split('/').slice(0, -2).join('/') + '/';
      setCurrentPath(parentPath);
      setSelectedItems([]);
    }
  };

  // 选择/取消选择项目
  const toggleSelect = (key: string) => {
    setSelectedItems(prev => {
      if (prev.includes(key)) {
        return prev.filter(item => item !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    const fileKeys = items.filter(item => item.type === 'file').map(item => item.key);
    if (selectedItems.length === fileKeys.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(fileKeys);
    }
  };

  // 上传文件
  const handleUpload = async () => {
    if (!uploadFiles) return;

    try {
      const uploadPromises = Array.from(uploadFiles).map(file => {
        return fileApi.galleryUploadImage(file, currentPath);
      });

      await Promise.all(uploadPromises);
      toast.success('文件上传成功');
      fetchItems(currentPath);
      initFolderTree();
      setShowUploadDialog(false);
      setUploadFiles(null);
    } catch (error) {
      toast.error('文件上传失败');
    }
  };

  // 删除文件
  const handleDelete = async () => {
    try {
      if (selectedItems.length > 1) {
        await fileApi.galleryDeleteImages(selectedItems);
      } else if (selectedItems.length === 1) {
        await fileApi.galleryDeleteImage(selectedItems[0]);
      }
      toast.success('文件删除成功');
      fetchItems(currentPath);
      initFolderTree();
      setSelectedItems([]);
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('文件删除失败');
    }
  };

  // 重命名文件
  const handleRename = async () => {
    if (!renameKey || !renameName) return;

    try {
      const newKey = renameKey.substring(0, renameKey.lastIndexOf('/') + 1) + renameName;
      await fileApi.galleryRenameImage(renameKey, newKey);
      toast.success('文件重命名成功');
      fetchItems(currentPath);
      setShowRenameDialog(false);
      setRenameKey('');
      setRenameName('');
    } catch (error) {
      toast.error('文件重命名失败');
    }
  };

  // 移动文件
  const handleMove = async () => {
    if (!moveKey || !moveDestination) return;

    try {
      const fileName = moveKey.substring(moveKey.lastIndexOf('/') + 1);
      const newKey = moveDestination + fileName;
      await fileApi.galleryMoveImage(moveKey, newKey);
      toast.success('文件移动成功');
      fetchItems(currentPath);
      initFolderTree();
      setShowMoveDialog(false);
      setMoveKey('');
      setMoveDestination('');
    } catch (error) {
      toast.error('文件移动失败');
    }
  };

  // 创建文件夹
  const handleCreateFolder = async () => {
    if (!newFolderName) return;

    try {
      const token = localStorage.getItem('token');
      const folderKey = currentPath + newFolderName + '/';
      await fileApi.galleryCreateFolder(folderKey);
      toast.success('文件夹创建成功');
      fetchItems(currentPath);
      initFolderTree();
      setShowCreateFolderDialog(false);
      setNewFolderName('');
    } catch (error) {
      toast.error('文件夹创建失败');
    }
  };

  // 同步COS图片到数据库
  const handleSyncFromCos = async () => {
    setSyncing(true);
    setSyncProgress('正在同步...');
    try {
      const result = await fileApi.syncFromCos();
      setSyncProgress(result.progress || '同步完成');
      toast.success('同步成功');
      initFolderTree();
    } catch (error) {
      toast.error('同步失败，请稍后重试');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncProgress(''), 3000);
    }
  };

  // 过滤搜索结果
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 渲染文件夹树
  const renderFolderTree = (items: FolderTreeItem[]) => {
    return items.map(item => (
      <div key={item.key} className="mb-1">
        <div 
          className="flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-700/50 transition-colors"
          onClick={() => {
            toggleFolder(item.key);
            navigateToFolder(item.key);
          }}
        >
          {item.expanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
          <Folder className="w-4 h-4 mr-2" />
          <span className="text-sm">{item.name}</span>
        </div>
        {item.expanded && item.children.length > 0 && (
          <div className="ml-6 mt-1">
            {renderFolderTree(item.children)}
          </div>
        )}
      </div>
    ));
  };

  // 渲染图片网格
  const renderImageGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <Card 
            key={item.key}
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${selectedItems.includes(item.key) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="relative">
              {item.type === 'folder' ? (
                <div 
                  className="h-36 bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer"
                  onClick={() => navigateToFolder(item.key)}
                >
                  <FolderOpen className="w-12 h-12 text-gray-400" />
                </div>
              ) : (
                <div className="relative h-36 bg-gray-100">
                  <div className="absolute left-2 top-2 z-10">
                    <Checkbox 
                      id={item.key} 
                      checked={selectedItems.includes(item.key)}
                      onCheckedChange={() => toggleSelect(item.key)}
                      className="bg-white/80 hover:bg-white transition-opacity"
                    />
                  </div>
                  <LazyImage
                    src={(item as File).cosUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    rootMargin="100px"
                  />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox 
                    id={item.key} 
                    checked={selectedItems.includes(item.key)}
                    onCheckedChange={() => toggleSelect(item.key)}
                    className="mr-2"
                  />
                  <Label 
                    htmlFor={item.key} 
                    className="text-sm font-medium truncate"
                  >
                    {item.name}
                  </Label>
                </div>
                {item.type === 'file' && (
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setRenameKey(item.key);
                        setRenameName(item.name);
                        setShowRenameDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setMoveKey(item.key);
                        setShowMoveDialog(true);
                      }}
                    >
                      <Move className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {item.type === 'file' && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div>{formatFileSize((item as File).size)}</div>
                  <div>{formatDate((item as File).lastModified)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // 渲染图片列表
  const renderImageList = () => {
    return (
      <div className="space-y-2">
        {filteredItems.map(item => (
          <Card 
            key={item.key}
            className={`p-4 ${selectedItems.includes(item.key) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center">
              <Checkbox 
                id={item.key} 
                checked={selectedItems.includes(item.key)}
                onCheckedChange={() => toggleSelect(item.key)}
                className="mr-4"
              />
              {item.type === 'folder' ? (
                <div 
                  className="flex items-center flex-1 cursor-pointer"
                  onClick={() => navigateToFolder(item.key)}
                >
                  <Folder className="w-6 h-6 mr-3 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center flex-1">
                  <LazyImage
                    src={(item as File).cosUrl}
                    alt={item.name}
                    className="w-12 h-12 object-cover mr-4 rounded"
                    rootMargin="50px"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize((item as File).size)} • {formatDate((item as File).lastModified)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setRenameKey(item.key);
                        setRenameName(item.name);
                        setShowRenameDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      重命名
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setMoveKey(item.key);
                        setShowMoveDialog(true);
                      }}
                    >
                      <Move className="h-4 w-4 mr-1" />
                      移动
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // 初始化
  useEffect(() => {
    fetchItems(currentPath);
  }, [currentPath, fetchItems]);

  useEffect(() => {
    initFolderTree();
  }, [initFolderTree]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardDescription>管理您的图片资源</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧文件夹树 */}
            <div className="lg:w-64">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">文件夹结构</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {treeLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, index) => (
                          <Skeleton key={index} className="h-8 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div 
                          className="flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-700/50 transition-colors mb-2"
                          onClick={() => navigateToFolder('')}
                        >
                          <FolderOpen className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">根目录</span>
                        </div>
                        {renderFolderTree(folderTree)}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* 右侧内容区 */}
            <div className="flex-1">
              {/* 工具栏 */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {currentPath && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={navigateUp}
                    >
                      返回上一级
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateFolderDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    创建文件夹
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input 
                      type="search" 
                      placeholder="搜索文件..." 
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="视图" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">
                        <Grid className="h-4 w-4 mr-2" />
                        网格
                      </SelectItem>
                      <SelectItem value="list">
                        <List className="h-4 w-4 mr-2" />
                        列表
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        上传文件
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>上传文件</DialogTitle>
                        <DialogDescription>
                          选择要上传的图片文件
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setUploadFiles(e.target.files)}
                          className="w-full"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowUploadDialog(false)}>
                          取消
                        </Button>
                        <Button onClick={handleUpload}>
                          上传
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={handleSyncFromCos}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        同步中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        同步COS
                      </>
                    )}
                  </Button>
                  {syncProgress && (
                    <span className="text-sm text-muted-foreground">{syncProgress}</span>
                  )}
                  {selectedItems.length > 0 && (
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要删除所选的 {selectedItems.length} 个文件吗？此操作不可恢复。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              {/* 选择栏 */}
              {filteredItems.length > 0 && (
                <div className="flex items-center justify-between mb-4 py-2 border-b">
                  <div className="flex items-center">
                    <Checkbox 
                      id="select-all"
                      checked={selectedItems.length > 0 && selectedItems.length === items.filter(item => item.type === 'file').length}
                      onCheckedChange={toggleSelectAll}
                      className="mr-2"
                    />
                    <Label htmlFor="select-all">
                      全选 ({selectedItems.length} / {items.filter(item => item.type === 'file').length})
                    </Label>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    共 {filteredItems.length} 个项目
                  </div>
                </div>
              )}

              {/* 内容区 */}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-48 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {searchQuery ? '没有找到匹配的文件' : '当前文件夹为空'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {searchQuery ? '尝试使用其他搜索词' : '上传文件或创建文件夹'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? renderImageGrid() : renderImageList()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 重命名对话框 */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名文件</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-name">新文件名</Label>
              <Input 
                id="rename-name"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRenameDialog(false)}>
              取消
            </Button>
            <Button onClick={handleRename}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 移动对话框 */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>移动文件</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="move-destination">目标文件夹</Label>
              <Select value={moveDestination} onValueChange={setMoveDestination}>
                <SelectTrigger id="move-destination">
                  <SelectValue placeholder="选择文件夹" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">根目录</SelectItem>
                  {folderTree.map(folder => (
                    <SelectItem key={folder.key} value={folder.key}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowMoveDialog(false)}>
              取消
            </Button>
            <Button onClick={handleMove}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建文件夹对话框 */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建文件夹</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">文件夹名称</Label>
              <Input 
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateFolderDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateFolder}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
