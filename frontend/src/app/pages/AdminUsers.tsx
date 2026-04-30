import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { userApi } from '../services/api';
import { useAvatarUrl } from '../hooks/useImageUrl';

function UserAvatar({ src, alt }: { src?: string | null; alt?: string }) {
  const { url } = useAvatarUrl(src);
  if (!url) {
    return <span>{alt?.charAt(0)?.toUpperCase()}</span>;
  }
  return <img src={url} alt={alt} />;
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  status: number;
  emailVerified: boolean;
  admin: boolean;
  lastLoginTime: string | null;
  createTime: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<number>(1);
  const [admin, setAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 获取用户列表
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 调用API获取用户列表
        const response = await userApi.getUsers();
        setUsers(response);
      } catch (error) {
        toast.error('获取用户列表失败');
      }
    };

    fetchUsers();
  }, []);

  // 处理搜索和分页
  useEffect(() => {
    // 过滤用户
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    
    // 计算总页数
    const total = Math.ceil(filtered.length / pageSize);
    setTotalPages(total);
    
    // 确保当前页码不超过总页数
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
    
    // 分页
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredUsers(filtered.slice(startIndex, endIndex));
  }, [users, searchQuery, currentPage, pageSize]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setPassword('');
    setStatus(user.status);
    setAdmin(user.admin);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    // 前端验证
    if (!username) {
      toast.error('请输入用户名');
      return;
    }
    
    if (!email) {
      toast.error('请输入邮箱');
      return;
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }
    
    // 密码强度验证（如果填写了密码）
    if (password && password.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    try {
      // 准备更新数据
      const updateData: any = {
        ...selectedUser,
        username,
        email,
        status,
        admin
      };
      
      // 只有当密码不为空时才更新密码
      if (password) {
        updateData.password = password;
      }
      
      // 调用API更新用户信息
      await userApi.updateUser(selectedUser.id, updateData);
      
      // 更新本地状态
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, username, email, status, admin } 
          : user
      ));
      
      setEditDialogOpen(false);
      toast.success('用户信息更新成功');
    } catch (error) {
      toast.error('更新用户信息失败');
    }
  };

  const handleToggleAdmin = async (userId: number, currentAdmin: boolean) => {
    try {
      // 找到对应的用户
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      // 调用API更新用户权限
      await userApi.updateUser(userId, {
        ...user,
        admin: !currentAdmin
      });
      // 更新本地状态
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, admin: !currentAdmin } 
          : user
      ));
      toast.success('权限更新成功');
    } catch (error) {
      toast.error('更新权限失败');
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userApi.deleteUser(userToDelete.id);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success('用户删除成功');
    } catch (error) {
      toast.error('删除用户失败');
    }
  };

  const handleAddUser = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setAdmin(false);
    setAddDialogOpen(true);
  };

  const handleSaveNewUser = async () => {
    try {
      // 验证表单
      if (!username) {
        toast.error('请输入用户名');
        return;
      }
      
      if (!email) {
        toast.error('请输入邮箱');
        return;
      }
      
      if (!password) {
        toast.error('请输入密码');
        return;
      }
      
      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('请输入有效的邮箱地址');
        return;
      }
      
      // 密码强度验证
      if (password.length < 6) {
        toast.error('密码长度至少为6位');
        return;
      }

      // 调用API创建新用户
      await userApi.createUser({
        username,
        email,
        password,
        admin,
        status: 1 // 默认为活跃状态
      });

      // 重新获取用户列表
      const response = await userApi.getUsers();
      setUsers(response);
      setAddDialogOpen(false);
      toast.success('用户添加成功');
    } catch (error) {
      toast.error('添加用户失败');
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      <Card className="h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">用户列表</h3>
            <Button onClick={handleAddUser}>添加用户</Button>
          </div>
          
          {/* 搜索栏 */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input 
                placeholder="搜索用户名或邮箱" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="每页条数" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto" style={{ maxHeight: '500px' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>管理员</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {user.avatar ? (
                            <UserAvatar src={user.avatar} alt={user.username} />
                          ) : (
                            <span>{user.username.charAt(0).toUpperCase()}</span>
                          )}
                        </Avatar>
                        <span>{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 1 ? 'default' : 'outline'}>
                        {user.status === 1 ? '活跃' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={user.admin} 
                          onCheckedChange={() => handleToggleAdmin(user.id, user.admin)}
                        />
                        <span>{user.admin ? '是' : '否'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.lastLoginTime || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        编辑
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(user)}>
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      没有找到符合条件的用户
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </PaginationLink>
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        className={currentPage === page ? 'bg-primary text-primary-foreground' : ''}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </Card>

      {/* 添加用户对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-username">用户名</Label>
              <Input id="add-username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">邮箱</Label>
              <Input id="add-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">密码</Label>
              <Input id="add-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-admin">管理员权限</Label>
              <div className="flex items-center gap-2">
                <Switch 
                  id="add-admin" 
                  checked={admin} 
                  onCheckedChange={setAdmin}
                />
                <span>{admin ? '是' : '否'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveNewUser}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码（留空表示不修改）</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">用户状态</Label>
              <Select value={status.toString()} onValueChange={(value) => setStatus(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">活跃</SelectItem>
                  <SelectItem value="0">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin">管理员权限</Label>
              <div className="flex items-center gap-2">
                <Switch 
                  id="admin" 
                  checked={admin} 
                  onCheckedChange={setAdmin}
                />
                <span>{admin ? '是' : '否'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveUser}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除用户确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>确定要删除用户 <span className="font-semibold">{userToDelete?.username}</span> 吗？</p>
            <p className="text-sm text-gray-500 mt-2">此操作不可恢复。</p>
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
